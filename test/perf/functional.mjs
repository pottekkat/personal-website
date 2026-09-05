// Behavioural checks for the parts of the site that a payload optimisation can
// silently break: search (index now fetched on demand), mermaid (script now
// fetched when a diagram nears the viewport), ECharts (script now deferred) and
// the theme toggle that re-renders diagrams.
//
//   node functional.mjs
//
// Exits non-zero on the first failure, after printing every result.
import { chromium } from 'playwright-core';

const ORIGIN = process.env.ORIGIN || 'http://127.0.0.1:8099';

const results = [];
function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

// Plausible is proxied by a Netlify redirect that the local static server does
// not implement, so this one 404 is an artefact of the harness, not the site.
const EXPECTED_MISSING = '/misc/js/script.js';

async function open(url) {
  const page = await ctx.newPage();
  const errors = [];
  const missing = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('response', (r) => {
    if (r.status() >= 400 && !r.url().endsWith(EXPECTED_MISSING)) missing.push(r.status() + ' ' + r.url());
  });
  await page.goto(ORIGIN + url, { waitUntil: 'load' });
  // Drop the console noise the expected 404 itself produces.
  const realErrors = () => errors.filter((e) => !/Failed to load resource/.test(e)).concat(missing);
  return { page, errors: realErrors };
}

// Counting resource timings is more reliable than listening for request events,
// which can be attached after the fetch has already started.
const fetchedIndex = (page) =>
  page.evaluate(() =>
    performance.getEntriesByType('resource').filter((e) => e.name.includes('/index.json')).length,
  );

// --- Search: the index must not be fetched up front, but must arrive and
//     produce results once someone actually uses the box. ---
{
  const { page, errors } = await open('/archives/');
  await page.waitForTimeout(1500);
  const before = await fetchedIndex(page);
  record('search index is not fetched before interaction', before === 0, `${before} requests`);

  await page.click('#searchInput');
  await page.type('#searchInput', 'hugo');
  await page.waitForFunction(
    () => document.querySelectorAll('#searchResults li').length > 0,
    null,
    { timeout: 15000 },
  ).catch(() => {});
  const hits = await page.$$eval('#searchResults li', (n) => n.length);
  record('search returns results after typing', hits > 0, `${hits} results`);
  const after = await fetchedIndex(page);
  record('search index was fetched on demand', after > 0, `${after} requests`);
  record('search page has no JS errors', errors().length === 0, errors().join(' | '));
  await page.close();
}

// --- Mermaid: diagrams must render, and must survive a theme toggle. ---
{
  const { page, errors } = await open('/posts/adding-diagrams-to-your-hugo-blog-with-mermaid/');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page
    .waitForFunction(() => document.querySelector('.mermaid svg') !== null, null, { timeout: 30000 })
    .catch(() => {});
  const svgs = await page.$$eval('.mermaid svg', (n) => n.length);
  record('mermaid diagrams render', svgs > 0, `${svgs} svg`);

  await page.evaluate(() => document.getElementById('theme-toggle').click());
  await page.waitForTimeout(3000);
  const after = await page.$$eval('.mermaid svg', (n) => n.length);
  record('mermaid survives a theme toggle', after === svgs, `${after} svg`);
  record('mermaid page has no JS errors', errors().length === 0, errors().join(' | '));
  await page.close();
}

// --- ECharts: the head scripts are deferred, so every chart must still be
//     initialised by the time the page has loaded. ---
{
  const { page, errors } = await open('/about/');
  await page
    .waitForFunction(() => document.querySelectorAll('#canvas-wrapper svg, #perf-gauge svg').length > 0, null, {
      timeout: 15000,
    })
    .catch(() => {});
  const charts = await page.$$eval('#perf-gauge svg, #a11y-gauge svg, #main svg', (n) => n.length);
  record('echarts charts render', charts >= 3, `${charts} chart svg`);
  record('about page has no JS errors', errors().length === 0, errors().join(' | '));
  await page.close();
}

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
