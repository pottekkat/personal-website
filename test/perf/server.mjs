// Static server for test/perf that mimics the production (Netlify) edge:
// brotli/gzip content negotiation and the Cache-Control headers from netlify.toml.
// Measuring against `hugo server` would understate the wins, because the dev
// server does not compress and does not set long-lived cache headers.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

// SITE_DIR lets the harness serve a build that is not ./public. The repo has a
// long-running `hugo server` that owns ./public and rewrites it with dev URLs
// and a livereload shim, which would silently poison every measurement.
const ROOT = path.resolve(
  process.env.SITE_DIR || fileURLToPath(new URL('../../public', import.meta.url)),
);
const PORT = Number(process.env.PORT || 8099);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
  '.webmanifest': 'application/manifest+json',
};

// Netlify compresses text; it does not re-compress already-compressed binaries.
const COMPRESSIBLE = /^(text\/|application\/(json|xml|javascript|manifest))|image\/svg/;

function cacheControl(urlPath) {
  if (/^\/(assets|fonts|images|js|css)\//.test(urlPath)) {
    return 'public, max-age=31536000, immutable';
  }
  return 'public, max-age=60';
}

const cache = new Map();
function compressed(buf, enc) {
  const key = enc + ':' + buf.length + ':' + buf.subarray(0, 32).toString('hex');
  if (cache.has(key)) return cache.get(key);
  const out = enc === 'br'
    ? zlib.brotliCompressSync(buf, {
        params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 },
      })
    : zlib.gzipSync(buf, { level: 9 });
  cache.set(key, out);
  return out;
}

function resolveFile(urlPath) {
  let p = decodeURIComponent(urlPath.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const abs = path.join(ROOT, p);
  if (!abs.startsWith(ROOT)) return null;
  if (fs.existsSync(abs) && fs.statSync(abs).isFile()) return abs;
  const asDir = path.join(abs, 'index.html');
  if (fs.existsSync(asDir)) return asDir;
  return null;
}

http
  .createServer((req, res) => {
    const urlPath = req.url.split('?')[0];
    const file = resolveFile(urlPath);
    if (!file) {
      const notFound = path.join(ROOT, '404.html');
      const body = fs.existsSync(notFound) ? fs.readFileSync(notFound) : Buffer.from('Not found');
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(body);
    }
    const ext = path.extname(file).toLowerCase();
    const type = TYPES[ext] || 'application/octet-stream';
    let body = fs.readFileSync(file);
    const headers = {
      'Content-Type': type,
      'Cache-Control': cacheControl(urlPath),
      'X-Content-Type-Options': 'nosniff',
    };
    const accept = String(req.headers['accept-encoding'] || '');
    if (COMPRESSIBLE.test(type) && body.length > 512) {
      if (/\bbr\b/.test(accept)) {
        body = compressed(body, 'br');
        headers['Content-Encoding'] = 'br';
      } else if (/\bgzip\b/.test(accept)) {
        body = compressed(body, 'gzip');
        headers['Content-Encoding'] = 'gzip';
      }
      headers['Vary'] = 'Accept-Encoding';
    }
    headers['Content-Length'] = body.length;
    if (req.method === 'HEAD') {
      res.writeHead(200, headers);
      return res.end();
    }
    res.writeHead(200, headers);
    res.end(body);
  })
  .listen(PORT, '127.0.0.1', () => {
    console.log(`perf server: http://127.0.0.1:${PORT}  (root: ${ROOT})`);
  });
