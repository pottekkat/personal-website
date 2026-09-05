// Lighthouse runs against the local production-like server.
// Usage: node lighthouse.mjs <label> [pageId ...]
// Writes test/perf/results/lh-<label>.json and prints a table.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { PAGES } from './pages.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RESULTS = path.join(HERE, 'results');
const ORIGIN = process.env.ORIGIN || 'http://127.0.0.1:8099';
const RUNS = Number(process.env.RUNS || 3);

const label = process.argv[2];
if (!label) {
  console.error('usage: node lighthouse.mjs <label> [pageId ...]');
  process.exit(1);
}
const only = process.argv.slice(3);
const pages = only.length ? PAGES.filter((p) => only.includes(p.id)) : PAGES;

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};

const chrome = await chromeLauncher.launch({
  chromeFlags: ['--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage'],
});

const out = { label, origin: ORIGIN, runs: RUNS, pages: {} };
try {
  for (const page of pages) {
    const samples = [];
    for (let i = 0; i < RUNS; i++) {
      const res = await lighthouse(
        ORIGIN + page.url,
        { port: chrome.port, output: 'json', logLevel: 'error' },
        {
          extends: 'lighthouse:default',
          settings: { formFactor: 'mobile', onlyCategories: ['performance'] },
        },
      );
      const a = res.lhr.audits;
      samples.push({
        perf: Math.round(res.lhr.categories.performance.score * 100),
        fcp: a['first-contentful-paint'].numericValue,
        lcp: a['largest-contentful-paint'].numericValue,
        tbt: a['total-blocking-time'].numericValue,
        cls: a['cumulative-layout-shift'].numericValue,
        si: a['speed-index'].numericValue,
        bytes: a['total-byte-weight'].numericValue,
        requests: a['network-requests'].details.items.length,
      });
    }
    const keys = Object.keys(samples[0]);
    const agg = {};
    for (const k of keys) agg[k] = median(samples.map((s) => s[k]));
    out.pages[page.id] = { url: page.url, ...agg };
    console.log(
      `${page.id.padEnd(14)} perf=${String(agg.perf).padStart(3)} ` +
        `FCP=${Math.round(agg.fcp)}ms LCP=${Math.round(agg.lcp)}ms ` +
        `TBT=${Math.round(agg.tbt)}ms CLS=${agg.cls.toFixed(3)} ` +
        `SI=${Math.round(agg.si)}ms bytes=${Math.round(agg.bytes / 1024)}KiB req=${agg.requests}`,
    );
  }
} finally {
  await chrome.kill();
}

fs.mkdirSync(RESULTS, { recursive: true });
fs.writeFileSync(path.join(RESULTS, `lh-${label}.json`), JSON.stringify(out, null, 2));
const ids = Object.keys(out.pages);
const avg = (k) => ids.reduce((s, id) => s + out.pages[id][k], 0) / ids.length;
console.log(
  `\nMEAN over ${ids.length} pages: perf=${avg('perf').toFixed(1)} ` +
    `FCP=${Math.round(avg('fcp'))}ms LCP=${Math.round(avg('lcp'))}ms ` +
    `TBT=${Math.round(avg('tbt'))}ms CLS=${avg('cls').toFixed(4)} SI=${Math.round(avg('si'))}ms`,
);
console.log(`wrote results/lh-${label}.json`);
