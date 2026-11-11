#!/usr/bin/env node
// Builds assets/places/world.json, the outline data behind the world map on
// /places/. Run it again only to change the map's detail or projection:
//
//   node scripts/places/world-map.mjs
//
// Source: Natural Earth 1:10m admin-0 countries, India point of view, pinned
// to one commit so the output never changes under us. Natural Earth is public
// domain. The download is cached in ~/.cache/navendu-places/.
//
// Output: {w, h, countries: [{c, d, x?, y?, tiny?}]}. `c` is the ISO 3166-1
// alpha-2 code (the same `code` a place page carries), `d` is an SVG path in
// a w×h viewBox. Countries too small to see at this size get `tiny` and a
// label point, so the template can draw a dot for them once visited.
//
// Borders are simplified once per shared edge, not once per country, so two
// neighbours always agree on the line between them and no slivers open up.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/" +
  "9380cca83db5f9aef52d5e762765100745f84b27/geojson/ne_10m_admin_0_countries_ind.geojson";
const CACHE = join(homedir(), ".cache", "navendu-places", "ne_10m_admin_0_countries_ind.geojson");
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "assets", "places", "world.json");

const W = 1000; // viewBox width
const TOLERANCE = 0.6; // Douglas–Peucker tolerance, in viewBox units
const MIN_RING = 2; // drop islands smaller than this many square units
const TINY = 12; // countries smaller than this get a dot instead
const PAD = 2;

// Patterson cylindrical (Patterson, Šavrič, Jenny 2015): a compromise
// projection with straight sides, so the land fills the frame edge to edge
// instead of leaving the empty corners an oval world map has.
const C1 = 1.0148, C2 = 0.23185, C3 = -0.14499, C4 = 0.02406;
function project([lon, lat]) {
  const p = (lat * Math.PI) / 180, p4 = p ** 4;
  return [(lon * Math.PI) / 180, -p * (C1 + p4 * (C2 + p * p * (C3 + C4 * p * p)))];
}

async function source() {
  if (!existsSync(CACHE)) {
    console.error(`downloading ${SOURCE}`);
    const res = await fetch(SOURCE);
    if (!res.ok) throw new Error(`download failed: ${res.status}`);
    await mkdir(dirname(CACHE), { recursive: true });
    await writeFile(CACHE, Buffer.from(await res.arrayBuffer()));
  }
  return JSON.parse(await readFile(CACHE, "utf8"));
}

// Douglas–Peucker, iterative so long coastlines cannot blow the stack.
function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  const t2 = tol * tol;
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = pts[a], [bx, by] = pts[b];
    const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy;
    let max = -1, at = -1;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = pts[i];
      let d2;
      if (len2 === 0) d2 = (px - ax) ** 2 + (py - ay) ** 2;
      else {
        const cross = (px - ax) * dy - (py - ay) * dx;
        d2 = (cross * cross) / len2;
      }
      if (d2 > max) { max = d2; at = i; }
    }
    if (max > t2) {
      keep[at] = 1;
      stack.push([a, at], [at, b]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

const area = (r) => {
  let s = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) s += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]);
  return s / 2;
};

const geo = await source();
const features = geo.features.filter((f) => f.properties.ISO_A2_EH !== "AQ");

// 1. Rings as lists of source coordinates, closing point dropped. A vertex is
//    keyed by its exact source text, which neighbours share along a border.
const rings = []; // {code, keys: [], pts: Map}
const coord = new Map(); // key -> projected point
for (const f of features) {
  const code = f.properties.ISO_A2_EH === "-99" ? "" : f.properties.ISO_A2_EH;
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const poly of polys) {
    for (const ring of poly) {
      const keys = [];
      for (let i = 0; i < ring.length - 1; i++) {
        const k = ring[i][0] + "," + ring[i][1];
        if (keys[keys.length - 1] === k) continue;
        if (!coord.has(k)) coord.set(k, project(ring[i]));
        keys.push(k);
      }
      if (keys.length >= 3) rings.push({ code, keys });
    }
  }
}

// Fit the land into a W-wide viewBox, so every tolerance below is in
// viewBox units.
let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
for (const [x, y] of coord.values()) {
  if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
}
const k = (W - 2 * PAD) / (x1 - x0);
const H = Math.ceil((y1 - y0) * k + 2 * PAD);
const fit = ([x, y]) => [(x - x0) * k + PAD, (y - y0) * k + PAD];
for (const [key, p] of coord) coord.set(key, fit(p));

// 2. Junctions: a vertex whose neighbours differ between visits is where one
//    shared edge ends and another begins.
const seen = new Map();
const junction = new Set();
for (const { keys } of rings) {
  const n = keys.length;
  for (let i = 0; i < n; i++) {
    const k = keys[i], p = keys[(i - 1 + n) % n], q = keys[(i + 1) % n];
    const s = seen.get(k);
    if (!s) seen.set(k, [p, q]);
    else if (!((s[0] === p && s[1] === q) || (s[0] === q && s[1] === p))) junction.add(k);
  }
}

// 3. Cut rings into arcs at junctions and simplify each distinct arc once.
const arcs = new Map(); // canonical key list joined -> simplified points
function arc(keys) {
  let fwd = keys;
  const first = keys[0], last = keys[keys.length - 1];
  const reverse = first > last || (first === last && keys[1] > keys[keys.length - 2]);
  if (reverse) fwd = [...keys].reverse();
  const id = fwd.join(";");
  let out = arcs.get(id);
  if (!out) {
    out = simplify(fwd.map((k) => coord.get(k)), TOLERANCE);
    arcs.set(id, out);
  }
  return reverse ? [...out].reverse() : out;
}

function ringPoints(keys) {
  const n = keys.length;
  let start = keys.findIndex((k) => junction.has(k));
  const pieces = [];
  if (start < 0) {
    // A ring that touches nothing (an island, or a country wholly inside
    // another): start at its smallest key and walk in a fixed direction so
    // both copies of a shared ring come out identical, then split in half.
    start = keys.indexOf(keys.reduce((a, b) => (b < a ? b : a)));
    const next = keys[(start + 1) % n], prev = keys[(start - 1 + n) % n];
    let walk = Array.from({ length: n + 1 }, (_, i) => keys[(start + i) % n]);
    const flipped = prev < next;
    if (flipped) walk = walk.reverse();
    const mid = Math.floor(n / 2);
    let pts = [...arc(walk.slice(0, mid + 1)), ...arc(walk.slice(mid)).slice(1)];
    if (flipped) pts = pts.reverse();
    return pts;
  }
  let cur = [keys[start]];
  for (let i = 1; i <= n; i++) {
    const k = keys[(start + i) % n];
    cur.push(k);
    if (junction.has(k)) {
      pieces.push(cur);
      cur = [k];
    }
  }
  const pts = [];
  for (const piece of pieces) {
    const a = arc(piece);
    pts.push(...(pts.length ? a.slice(1) : a));
  }
  return pts;
}

// 4. Assemble each country, dropping specks.
const countries = new Map(); // code -> {rings: [], area, label}
for (const f of features) {
  const code = f.properties.ISO_A2_EH === "-99" ? "" : f.properties.ISO_A2_EH;
  if (!countries.has(code)) {
    countries.set(code, { rings: [], area: 0, label: [f.properties.LABEL_X, f.properties.LABEL_Y] });
  }
}
for (const r of rings) {
  let pts = ringPoints(r.keys);
  if (pts.length && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) pts = pts.slice(0, -1);
  const c = countries.get(r.code);
  const a = Math.abs(area(pts));
  c.area += a;
  r.pts = pts;
  r.a = a;
}

const tenth = ([x, y]) => [Math.round(x * 10), Math.round(y * 10)];

// Numbers are written in tenths; trim "0." and skip separators SVG does not need.
const num = (t) => {
  let s = (t / 10).toString();
  if (s.startsWith("0.")) s = s.slice(1);
  else if (s.startsWith("-0.")) s = "-" + s.slice(2);
  return s;
};
function join2(parts) {
  let out = "";
  for (const p of parts) {
    if (!out) out = p;
    else if (p[0] === "-" || (p[0] === "." && /\.\d*$/.test(out) && !/[a-z]$/i.test(out))) out += p;
    else out += " " + p;
  }
  return out;
}

function path(ptsList) {
  let d = "";
  for (const pts of ptsList) {
    const q = [];
    for (const p of pts) {
      const t = tenth(p);
      const prev = q[q.length - 1];
      if (!prev || prev[0] !== t[0] || prev[1] !== t[1]) q.push(t);
    }
    if (q.length > 1 && q[0][0] === q[q.length - 1][0] && q[0][1] === q[q.length - 1][1]) q.pop();
    if (q.length < 3) continue;
    const parts = [num(q[0][0]), num(q[0][1])];
    for (let i = 1; i < q.length; i++) parts.push(num(q[i][0] - q[i - 1][0]), num(q[i][1] - q[i - 1][1]));
    d += "M" + join2(parts.slice(0, 2)) + "l" + join2(parts.slice(2)) + "z";
  }
  return d;
}

const out = [];
for (const [code, c] of [...countries].sort(([a], [b]) => a.localeCompare(b))) {
  const mine = rings.filter((r) => r.code === code);
  const big = mine.filter((r) => r.a >= MIN_RING).map((r) => r.pts);
  const entry = { c: code, d: path(big) };
  if (c.area < TINY) {
    const [x, y] = tenth(fit(project(c.label)));
    Object.assign(entry, { x: x / 10, y: y / 10, tiny: true });
  }
  if (entry.d || entry.tiny) out.push(entry);
}

await mkdir(dirname(OUT), { recursive: true });
const json = JSON.stringify({ w: W, h: H, countries: out });
await writeFile(OUT, json + "\n");
console.error(`${out.length} countries, ${W}×${H}, ${arcs.size} arcs, ${(json.length / 1024).toFixed(1)} KB -> ${OUT}`);
