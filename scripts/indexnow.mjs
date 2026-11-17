#!/usr/bin/env node
// Tells IndexNow (Bing, Yandex, Naver, Seznam, Yep and others) which pages
// changed in this deploy. Runs in .github/workflows/deploy-to-netlify.yml
// after `netlify deploy --prod`.
//
// It compares the new sitemap with the last one IndexNow accepted and sends
// the pages that are new, whose <lastmod> changed, or that were removed.
// lastmod comes from git (enableGitInfo), so template-only changes and the
// daily data refresh send nothing.
//
//   node scripts/indexnow.mjs --previous <sitemap.xml> --current public/sitemap.xml
//
// Options:
//   --dry-run   print what would be sent; send nothing, fetch nothing
//   --all       send every URL in the current sitemap (also what happens
//               when --previous is missing or unreadable)
//
// Environment: INDEXNOW_KEY (required), SITE_URL (default https://navendu.me/).
// The key is public by design: search engines fetch <site>/<key>.txt to check
// that the site owns it. public/<key>.txt must hold the key.
//
// With no usable --previous sitemap it sends every URL.
//
// Exit code 0 means there was nothing to send or IndexNow accepted it (the
// workflow then records the current sitemap as the new baseline). Exit code 1
// means it failed, so the old baseline stays and the next deploy retries.

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

const ENDPOINT = "https://api.indexnow.org/indexnow";
const BATCH = 10000; // the protocol's limit per request
const ATTEMPTS = 3;

const { values: opts } = parseArgs({
  options: {
    previous: { type: "string" },
    current: { type: "string", default: "public/sitemap.xml" },
    "dry-run": { type: "boolean", default: false },
    all: { type: "boolean", default: false },
  },
});
const dryRun = opts["dry-run"];
const key = process.env.INDEXNOW_KEY ?? "";
const site = new URL(process.env.SITE_URL || "https://navendu.me/");

const log = (msg) => console.log(`indexnow: ${msg}`);
const fail = (msg) => {
  // A GitHub Actions warning annotation; the deploy itself has already succeeded.
  console.log(`::warning title=IndexNow::${msg}`);
  process.exit(1);
};

// Key rules from indexnow.org: 8 to 128 characters of a-z, A-Z, 0-9 and "-".
if (!/^[a-zA-Z0-9-]{8,128}$/.test(key)) fail("INDEXNOW_KEY is missing or malformed");

// Reads a sitemap into a Map of URL -> lastmod ("" when absent). Returns null
// when the file is missing or isn't a <urlset>.
function readSitemap(file) {
  if (!file || !existsSync(file)) return null;
  const xml = readFileSync(file, "utf8");
  if (!xml.includes("<urlset")) return null;
  const unescape = (s) =>
    s.trim()
      .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
      .replace(/&amp;/g, "&");
  const urls = new Map();
  for (const [, block] of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = block.match(/<loc>([\s\S]*?)<\/loc>/);
    if (!loc) continue;
    const lastmod = block.match(/<lastmod>([\s\S]*?)<\/lastmod>/);
    urls.set(unescape(loc[1]), lastmod ? lastmod[1].trim() : "");
  }
  return urls;
}

const current = readSitemap(opts.current);
if (!current || current.size === 0) fail(`no URLs in ${opts.current}`);

const keyFile = join(opts.current, "..", `${key}.txt`);
if (!existsSync(keyFile) || readFileSync(keyFile, "utf8").trim() !== key) {
  fail(`${keyFile} is missing or does not contain the key`);
}

let urls;
const previous = opts.all ? null : readSitemap(opts.previous);
if (!previous) {
  // With nothing to compare, send everything: recording this sitemap as the
  // baseline without sending it would lose this deploy's changes for good.
  urls = [...current.keys()];
  log(`${opts.all ? "--all" : "no usable previous sitemap"}: sending all ${urls.length} URLs`);
} else {
  const added = [], changed = [], removed = [];
  for (const [url, lastmod] of current) {
    if (!previous.has(url)) added.push(url);
    else if (previous.get(url) !== lastmod) changed.push(url);
  }
  for (const url of previous.keys()) if (!current.has(url)) removed.push(url);
  log(`${added.length} added, ${changed.length} changed, ${removed.length} removed`);
  urls = [...added, ...changed, ...removed];
}

// Only this site's own URLs; IndexNow rejects the whole request (422) otherwise.
urls = [...new Set(urls)].filter((u) => {
  try {
    const p = new URL(u);
    return p.protocol === site.protocol && p.host === site.host;
  } catch {
    return false;
  }
});
if (urls.length === 0) {
  log("nothing to send");
  process.exit(0);
}
for (const u of urls) log(`  ${u}`);

const keyLocation = new URL(`${key}.txt`, site).href;
if (dryRun) {
  const batches = Math.ceil(urls.length / BATCH);
  log(`dry run: would POST ${urls.length} URLs in ${batches} request(s) to ${ENDPOINT}`);
  log(`dry run: keyLocation ${keyLocation}`);
  process.exit(0);
}

// The engines fetch the key file to verify the key. Check that the deploy
// actually published it, so a bad deploy doesn't burn the request.
try {
  const res = await fetch(keyLocation, { signal: AbortSignal.timeout(15000) });
  const body = (await res.text()).trim();
  if (!res.ok || body !== key) fail(`${keyLocation} returned ${res.status}, not the key`);
} catch (err) {
  fail(`could not fetch ${keyLocation}: ${err.message}`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MAX_WAIT = 60000;

// Retry-After is either seconds or an HTTP date (RFC 9110, section 10.2.3).
function retryAfterMs(header) {
  if (!header) return null;
  if (/^\d+$/.test(header.trim())) return Number(header) * 1000;
  const date = Date.parse(header);
  return Number.isNaN(date) ? null : Math.max(0, date - Date.now());
}

// 200: accepted. 202: accepted, key check still pending. 400 bad request,
// 403 key not valid, 422 URLs or key don't match the host: retrying won't help.
// 429 and 5xx are retried.
async function submit(batch) {
  const body = JSON.stringify({ host: site.host, key, keyLocation, urlList: batch });
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    let status, detail = "";
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body,
        signal: AbortSignal.timeout(30000),
      });
      status = res.status;
      detail = (await res.text()).slice(0, 300);
      if (status === 200 || status === 202) {
        log(`HTTP ${status}: accepted ${batch.length} URLs`);
        return true;
      }
      if (status !== 429 && status < 500) {
        log(`HTTP ${status}: ${detail}`);
        return false;
      }
      if (attempt < ATTEMPTS) {
        const wait = retryAfterMs(res.headers.get("retry-after")) ?? 5000 * attempt;
        if (wait > MAX_WAIT) {
          // Don't retry before the server allows it; the next deploy will.
          log(`HTTP ${status}; server asks to wait ${Math.ceil(wait / 1000)}s, more than this run waits`);
          return false;
        }
        log(`HTTP ${status}; retrying in ${Math.ceil(wait / 1000)}s`);
        await sleep(wait);
      }
    } catch (err) {
      detail = err.message;
      if (attempt < ATTEMPTS) {
        log(`${err.message}; retrying in ${5 * attempt}s`);
        await sleep(5000 * attempt);
      }
    }
    if (attempt === ATTEMPTS) log(`giving up: ${status ?? "no response"} ${detail}`);
  }
  return false;
}

for (let i = 0; i < urls.length; i += BATCH) {
  if (!(await submit(urls.slice(i, i + BATCH)))) {
    fail(`IndexNow did not accept the URLs; the next deploy will send them again`);
  }
}
