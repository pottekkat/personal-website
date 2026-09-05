// Visual + functional parity guard.
//
//   node parity.mjs capture <label>     -> snapshots/<label>/
//   node parity.mjs diff <base> <cand>  -> pixel + DOM diff report
//
// Captures, per page, per viewport, per theme:
//   - a full-page PNG
//   - a DOM fingerprint (visible text, link targets, headings, img srcs,
//     element counts) so a purely structural regression is caught even when
//     the pixels happen to match
//   - console errors and failed requests
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { PAGES } from './pages.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SNAPS = path.join(HERE, 'snapshots');
const ORIGIN = process.env.ORIGIN || 'http://127.0.0.1:8099';

const VIEWPORTS = [
  { id: 'mobile', width: 412, height: 915, isMobile: true, deviceScaleFactor: 1 },
  { id: 'desktop', width: 1440, height: 900, isMobile: false, deviceScaleFactor: 1 },
];
const THEMES = ['dark', 'light'];

// Kill anything time- or animation-dependent so repeat runs are byte-identical.
const FREEZE_CSS = `
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    caret-color: transparent !important;
  }
  html { scroll-behavior: auto !important; }
`;

async function capture(label) {
  const dir = path.join(SNAPS, label);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const report = { label, pages: {} };

  for (const p of PAGES) {
    for (const vp of VIEWPORTS) {
      for (const theme of THEMES) {
        const key = `${p.id}--${vp.id}--${theme}`;
        const ctx = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          deviceScaleFactor: vp.deviceScaleFactor,
          isMobile: vp.isMobile,
          hasTouch: vp.isMobile,
          colorScheme: theme,
          reducedMotion: 'reduce',
        });
        await ctx.addInitScript((t) => {
          try { localStorage.setItem('pref-theme', t); } catch (e) {}
        }, theme);
        const page = await ctx.newPage();
        const consoleErrors = [];
        const failed = [];
        page.on('console', (m) => {
          if (m.type() === 'error') consoleErrors.push(m.text());
        });
        page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));
        page.on('response', (r) => {
          if (r.status() >= 400) failed.push(`${r.status()} ${r.url().replace(ORIGIN, '')}`);
        });

        await page.goto(ORIGIN + p.url, { waitUntil: 'load', timeout: 60000 });
        // The theme class is applied by an inline script; force it deterministically
        // so the screenshot matches the theme we asked for.
        await page.evaluate((t) => {
          document.body.classList.toggle('dark', t === 'dark');
        }, theme);
        await page.addStyleTag({ content: FREEZE_CSS });
        // Scroll the whole page so lazy images resolve, then return to the top.
        await page.evaluate(async () => {
          const step = window.innerHeight;
          for (let y = 0; y < document.body.scrollHeight; y += step) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 30));
          }
          window.scrollTo(0, 0);
        });
        await page.evaluate(() => document.fonts && document.fonts.ready);
        await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
        await page.waitForTimeout(300);

        const dom = await page.evaluate(() => {
          const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
          return {
            title: document.title,
            text: norm(document.body.innerText),
            links: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')),
            headings: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(
              (h) => h.tagName + ':' + norm(h.textContent),
            ),
            images: [...document.querySelectorAll('img')].map((i) => ({
              src: i.getAttribute('src'),
              srcset: i.getAttribute('srcset') || null,
              w: i.naturalWidth,
              h: i.naturalHeight,
              rendered: [Math.round(i.getBoundingClientRect().width), Math.round(i.getBoundingClientRect().height)],
            })),
            counts: {
              nodes: document.querySelectorAll('*').length,
              scripts: document.querySelectorAll('script').length,
              styles: document.querySelectorAll('link[rel~="stylesheet"],style').length,
            },
            scrollHeight: document.documentElement.scrollHeight,
          };
        });

        const png = await page.screenshot({ fullPage: true, animations: 'disabled' });
        fs.writeFileSync(path.join(dir, key + '.png'), png);
        report.pages[key] = { url: p.url, dom, consoleErrors, failed };
        await ctx.close();
      }
    }
    console.log(`captured ${p.id}`);
  }
  await browser.close();
  fs.writeFileSync(path.join(dir, 'dom.json'), JSON.stringify(report, null, 2));
  console.log(`\nsnapshots/${label} written (${Object.keys(report.pages).length} shots)`);
}

function diff(a, b) {
  const dirA = path.join(SNAPS, a);
  const dirB = path.join(SNAPS, b);
  const outDir = path.join(SNAPS, `diff-${a}-vs-${b}`);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const repA = JSON.parse(fs.readFileSync(path.join(dirA, 'dom.json'), 'utf8'));
  const repB = JSON.parse(fs.readFileSync(path.join(dirB, 'dom.json'), 'utf8'));
  const keys = [...new Set([...Object.keys(repA.pages), ...Object.keys(repB.pages)])].sort();

  // Pages whose content is randomised at build time: their prose, layout height
  // and pixels differ between two builds of identical source, so only their
  // structure is comparable.
  const VOLATILE = new Set(PAGES.filter((p) => p.volatile).map((p) => p.id));
  const isVolatile = (key) => VOLATILE.has(key.split('--')[0]);

  let problems = 0;
  for (const key of keys) {
    const pa = repA.pages[key];
    const pb = repB.pages[key];
    const issues = [];
    if (!pa || !pb) {
      console.log(`MISSING ${key}`);
      problems++;
      continue;
    }
    const volatilePage = isVolatile(key);

    // --- DOM parity: these must be identical ---
    for (const field of volatilePage ? ['title'] : ['title', 'text']) {
      if (pa.dom[field] !== pb.dom[field]) issues.push(`dom.${field} differs`);
    }
    const j = (x) => JSON.stringify(x);
    // A randomised page also links somewhere different each build, so its link
    // list carries no signal either.
    if (!volatilePage && j(pa.dom.links) !== j(pb.dom.links)) issues.push('links differ');
    if (!volatilePage && j(pa.dom.headings) !== j(pb.dom.headings))
      issues.push('headings differ');
    if (pa.dom.images.length !== pb.dom.images.length) issues.push('image count differs');
    else {
      pb.dom.images.forEach((img, i) => {
        const o = pa.dom.images[i];
        if (img.w === 0 && o.w !== 0) issues.push(`image ${i} failed to load (${img.src})`);
        const dw = Math.abs(img.rendered[0] - o.rendered[0]);
        const dh = Math.abs(img.rendered[1] - o.rendered[1]);
        if (dw > 1 || dh > 1) issues.push(`image ${i} rendered size ${o.rendered} -> ${img.rendered}`);
      });
    }
    if (pb.consoleErrors.length > pa.consoleErrors.length) {
      issues.push('new console errors: ' + pb.consoleErrors.slice(pa.consoleErrors.length).join(' | '));
    }
    const newFailed = pb.failed.filter((f) => !pa.failed.includes(f));
    if (newFailed.length) issues.push('new failed requests: ' + newFailed.join(' | '));

    // --- Pixel parity ---
    const fa = path.join(dirA, key + '.png');
    const fb = path.join(dirB, key + '.png');
    if (!volatilePage && fs.existsSync(fa) && fs.existsSync(fb)) {
      const ia = PNG.sync.read(fs.readFileSync(fa));
      const ib = PNG.sync.read(fs.readFileSync(fb));
      if (ia.width !== ib.width || ia.height !== ib.height) {
        issues.push(`size ${ia.width}x${ia.height} -> ${ib.width}x${ib.height}`);
      } else {
        const out = new PNG({ width: ia.width, height: ia.height });
        const n = pixelmatch(ia.data, ib.data, out.data, ia.width, ia.height, { threshold: 0.1 });
        const pct = (n / (ia.width * ia.height)) * 100;
        if (pct > 0.05) {
          issues.push(`${n} px differ (${pct.toFixed(3)}%)`);
          fs.writeFileSync(path.join(outDir, key + '.png'), PNG.sync.write(out));
        }
      }
    }

    if (issues.length) {
      problems++;
      console.log(`\nDIFF ${key}`);
      issues.forEach((i) => console.log('   - ' + i));
    }
  }
  console.log(
    problems ? `\n${problems}/${keys.length} snapshots differ (see ${outDir})` : `\nPARITY OK — ${keys.length} snapshots identical`,
  );
  process.exit(problems ? 1 : 0);
}

const [cmd, x, y] = process.argv.slice(2);
if (cmd === 'capture' && x) await capture(x);
else if (cmd === 'diff' && x && y) diff(x, y);
else {
  console.error('usage: node parity.mjs capture <label> | diff <base> <cand>');
  process.exit(1);
}
