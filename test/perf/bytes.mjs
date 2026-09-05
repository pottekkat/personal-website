// Fast per-page payload audit: what each page actually downloads, by type,
// with encoded (over-the-wire) sizes. Much quicker than Lighthouse, so this is
// the loop used while iterating.
// Usage: node bytes.mjs <label>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { PAGES } from './pages.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RESULTS = path.join(HERE, 'results');
const ORIGIN = process.env.ORIGIN || 'http://127.0.0.1:8099';
const label = process.argv[2] || 'adhoc';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const out = { label, pages: {} };

for (const p of PAGES) {
  const ctx = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  const reqs = [];
  const pending = [];
  page.on('response', (res) => {
    pending.push((async () => {
    try {
      const sizes = await res.request().sizes();
      reqs.push({
        url: res.url().replace(ORIGIN, ''),
        status: res.status(),
        type: res.request().resourceType(),
        bytes: sizes.responseBodySize + sizes.responseHeadersSize,
      });
    } catch {}
    })());
  });
  await page.goto(ORIGIN + p.url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(1200); // let lazy/idle work settle
  await Promise.all(pending); // sizes() is async; totals are wrong without this

  const byType = {};
  let total = 0;
  for (const r of reqs) {
    byType[r.type] = (byType[r.type] || 0) + r.bytes;
    total += r.bytes;
  }
  out.pages[p.id] = {
    url: p.url,
    total,
    requests: reqs.length,
    byType,
    resources: reqs.sort((a, b) => b.bytes - a.bytes).slice(0, 15),
  };
  console.log(
    `${p.id.padEnd(14)} ${String(Math.round(total / 1024)).padStart(5)} KiB  ` +
      `${String(reqs.length).padStart(3)} req  ` +
      Object.entries(byType)
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `${k}:${Math.round(v / 1024)}K`)
        .join(' '),
  );
  await ctx.close();
}
await browser.close();

fs.mkdirSync(RESULTS, { recursive: true });
fs.writeFileSync(path.join(RESULTS, `bytes-${label}.json`), JSON.stringify(out, null, 2));
const ids = Object.keys(out.pages);
const sum = ids.reduce((s, id) => s + out.pages[id].total, 0);
console.log(`\nTOTAL across ${ids.length} pages: ${Math.round(sum / 1024)} KiB`);
console.log(`wrote results/bytes-${label}.json`);
