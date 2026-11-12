#!/usr/bin/env node
// Draws the map that sits at the top of a place page, from OpenStreetMap
// data, into map.svg next to the page, plus cover.jpg for link previews:
//
//   node scripts/places/city-map.mjs content/places/vienna
//   node scripts/places/city-map.mjs content/places/austria --near "Vienna" --km 4
//   node scripts/places/city-map.mjs content/places/austria --city "Vienna"
//   node scripts/places/city-map.mjs --all     (redraws the maps that exist)
//   node scripts/places/city-map.mjs content/places/vienna --fetch
//
// The first time, the map is centred on the page's title as Nominatim finds
// it, or on --near, and is --km wide (3.2 if unset). The centre and width are
// saved on map.svg's <svg> as data-lat, data-lon and data-km, and later runs
// reuse them, so the page's front matter needs nothing but `map: "map.svg"`.
// Pass --near or --km again to move or resize a map.
//
// The city the map shows is saved the same way, as data-city, and the place
// page puts it in the caption under the map. It is the city Nominatim gives
// for the centre, or --city to name it by hand.
//
// Each layer is painted with a CSS variable (--map-water, --map-park, …) that
// assets/css/extended/places.css sets for light and dark mode. Custom
// properties inherit into <use> copies, which plain CSS selectors do not
// reach, so the list page's covers follow the theme too. The fallbacks are the
// light colours, for the file opened on its own.
// OSM data is cached in ~/.cache/navendu-places/. Map data © OpenStreetMap
// contributors, ODbL; the page credits it under the map.

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { homedir, tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CACHE = join(homedir(), ".cache", "navendu-places");
const UA = { "User-Agent": "navendu.me places map build" };
const OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];

const W = 640; // viewBox; the same 1280×650 shape as the cover images on posts
const H = 325;
const TOL = 0.35; // Douglas–Peucker tolerance, viewBox units
const MIN_AREA = 6; // smallest pond or park drawn, square units

const MIN_BUILDING = 1.5; // smallest building drawn, square units

// Fills and strokes, as var(--map-…) with the light colour as fallback.
const C = {
  land: "#f3efe8", urban: "#ebe6dd", park: "#d6e3c6", water: "#b9d1df", building: "#ddd6ca",
  casing: "#d2cabd", road: "#fffdf9", major: "#f6dfa6", rail: "#a39a8c",
};
const paint = (k) => `var(--map-${k},${C[k]})`;

// Road widths, bottom to top, in viewBox units.
const ROADS = { minor: 0.9, road: 1.5, major: 2.6 };
const log = (...a) => console.error(...a);
// For text going into map.svg's markup.
const escape = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

// ---------------------------------------------------------------- front matter

function frontMatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) throw new Error("no YAML front matter");
  const get = (k) => {
    const r = m[1].match(new RegExp(`^${k}:[ \\t]*(.*)$`, "m"));
    return r ? r[1].trim().replace(/^["']|["']$/g, "") : undefined;
  };
  return { title: get("title") };
}

async function geocode(q) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&accept-language=en&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(30000) });
  const [hit] = await res.json();
  if (!hit) throw new Error(`Nominatim found nothing for "${q}"`);
  log(`geocoded "${q}" to ${hit.display_name}`);
  const a = hit.address || {};
  return {
    lat: Number(Number(hit.lat).toFixed(4)), lon: Number(Number(hit.lon).toFixed(4)),
    city: a.city || a.town || a.village || a.municipality,
  };
}

// ---------------------------------------------------------------- data

async function overpass(bb, file, refetch) {
  if (!refetch && existsSync(file)) return JSON.parse(await readFile(file, "utf8"));
  const box = `(${bb.s},${bb.w},${bb.n},${bb.e})`;
  const notTunnel = `[tunnel!~"^(yes|building_passage|culvert)$"]`;
  const q = `[out:json][timeout:180];(
    way[highway~"^((motorway|trunk|primary|secondary|tertiary)(_link)?|unclassified|residential|living_street|pedestrian|raceway)$"][area!=yes]${notTunnel}${box};
    way[railway~"^(rail|light_rail|monorail|narrow_gauge)$"]${notTunnel}${box};
    way[waterway~"^(river|canal)$"]${notTunnel}${box};
    way[natural=water]${box};way[waterway=riverbank]${box};
    relation[natural=water]${box};relation[waterway=riverbank]${box};
    way[natural=coastline]${box};
    way[leisure~"^(park|garden)$"]${box};relation[leisure=park]${box};
    way[landuse~"^(forest|grass|meadow|village_green|recreation_ground|cemetery)$"]${box};way[natural=wood]${box};
    way[leisure~"^(pitch|playground|golf_course|nature_reserve)$"]${box};
    way[landuse~"^(residential|commercial|retail|industrial|railway|construction)$"]${box};
    way[building]${box};relation[building]${box};
  );out geom;`;
  for (let attempt = 0; attempt < 6; attempt++) {
    const url = OVERPASS[attempt % OVERPASS.length];
    try {
      // The query's own timeout is 180 s; a server that holds the line longer is stuck.
      const res = await fetch(url, {
        method: "POST", headers: UA, body: new URLSearchParams({ data: q }), signal: AbortSignal.timeout(200000),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, JSON.stringify(json));
      return json;
    } catch (e) {
      log(`overpass ${url}: ${e.message}, retrying`);
      await new Promise((r) => setTimeout(r, 10000));
    }
  }
  throw new Error("Overpass did not answer; try again later");
}

// ---------------------------------------------------------------- geometry

function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = pts[a], [bx, by] = pts[b];
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy);
    let max = -1, at = -1;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = pts[i];
      const d = len === 0 ? Math.hypot(px - ax, py - ay) : Math.abs((px - ax) * dy - (py - ay) * dx) / len;
      if (d > max) { max = d; at = i; }
    }
    if (max > tol) { keep[at] = 1; stack.push([a, at], [at, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}

// A closed ring is simplified in two halves so its start point is not
// mistaken for a corner that must stay.
const simplifyRing = (r, tol) => {
  if (r.length < 8) return r;
  const h = r.length >> 1;
  return [...simplify(r.slice(0, h + 1), tol).slice(0, -1), ...simplify([...r.slice(h), r[0]], tol).slice(0, -1)];
};

const signed = (r) => {
  let s = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) s += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]);
  return s / 2;
};
const area = (r) => Math.abs(signed(r));
// Outer rings one way round, holes the other, so a nonzero fill cuts the
// holes and overlapping shapes still fill once.
const orient = (r, outer) => ((signed(r) > 0) === outer ? r : [...r].reverse());

// Lines clipped to the box (plus a margin), as the runs that stay inside.
function clipLine(pts, m) {
  const [x0, y0, x1, y1] = [-m, -m, W + m, H + m];
  const out = [];
  let cur = null;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
    let t0 = 0, t1 = 1;
    const dx = bx - ax, dy = by - ay;
    let ok = true;
    for (const [p, q] of [[-dx, ax - x0], [dx, x1 - ax], [-dy, ay - y0], [dy, y1 - ay]]) {
      if (p === 0) { if (q < 0) { ok = false; break; } continue; }
      const r = q / p;
      if (p < 0) { if (r > t1) { ok = false; break; } if (r > t0) t0 = r; }
      else { if (r < t0) { ok = false; break; } if (r < t1) t1 = r; }
    }
    if (!ok) { if (cur) { out.push(cur); cur = null; } continue; }
    const a = [ax + t0 * dx, ay + t0 * dy], b = [ax + t1 * dx, ay + t1 * dy];
    if (!cur || t0 > 0) { if (cur) out.push(cur); cur = [a]; }
    cur.push(b);
    if (t1 < 1) { out.push(cur); cur = null; }
  }
  if (cur) out.push(cur);
  return out.filter((r) => r.length > 1);
}

// Sutherland–Hodgman: a polygon cut to the box (plus a margin).
function clipPolygon(ring, m) {
  const edges = [
    (p) => p[0] >= -m, (p) => p[0] <= W + m, (p) => p[1] >= -m, (p) => p[1] <= H + m,
  ];
  const cut = [
    (a, b) => { const t = (-m - a[0]) / (b[0] - a[0]); return [-m, a[1] + t * (b[1] - a[1])]; },
    (a, b) => { const t = (W + m - a[0]) / (b[0] - a[0]); return [W + m, a[1] + t * (b[1] - a[1])]; },
    (a, b) => { const t = (-m - a[1]) / (b[1] - a[1]); return [a[0] + t * (b[0] - a[0]), -m]; },
    (a, b) => { const t = (H + m - a[1]) / (b[1] - a[1]); return [a[0] + t * (b[0] - a[0]), H + m]; },
  ];
  let out = ring;
  for (let e = 0; e < 4 && out.length; e++) {
    const input = out;
    out = [];
    for (let i = 0; i < input.length; i++) {
      const p = input[i], q = input[(i + 1) % input.length];
      const pin = edges[e](p), qin = edges[e](q);
      if (pin) out.push(p);
      if (pin !== qin) out.push(cut[e](p, q));
    }
  }
  return out;
}

// Ways into rings: join open member ways end to end.
const same = (a, b) => Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6;
function rings(lines) {
  const open = lines.map((l) => [...l]);
  const done = [];
  while (open.length) {
    let cur = open.pop();
    let grew = true;
    while (!same(cur[0], cur[cur.length - 1]) && grew) {
      grew = false;
      for (let i = 0; i < open.length; i++) {
        const l = open[i];
        if (same(l[0], cur[cur.length - 1])) cur = cur.concat(l.slice(1));
        else if (same(l[l.length - 1], cur[cur.length - 1])) cur = cur.concat([...l].reverse().slice(1));
        else if (same(l[l.length - 1], cur[0])) cur = l.concat(cur.slice(1));
        else if (same(l[0], cur[0])) cur = [...l].reverse().concat(cur.slice(1));
        else continue;
        open.splice(i, 1);
        grew = true;
        break;
      }
    }
    done.push({ pts: cur, closed: same(cur[0], cur[cur.length - 1]) });
  }
  return done;
}

// The sea, from coastline ways (land on their left). Each run of coast that
// crosses the box is followed in, then the box edge is walked clockwise to
// the next run, until the polygon closes. Islands inside become holes.
function sea(coast) {
  const m = 1;
  const [x0, y0, x1, y1] = [-m, -m, W + m, H + m];
  const per = ([x, y]) => {
    // Distance along the box edge, clockwise from the top-left corner.
    const e = 1e-6;
    if (Math.abs(y - y0) < e) return x - x0;
    if (Math.abs(x - x1) < e) return x1 - x0 + (y - y0);
    if (Math.abs(y - y1) < e) return 2 * (x1 - x0) + (y1 - y0) - (x - x0);
    return 2 * (x1 - x0) + 2 * (y1 - y0) - (y - y0);
  };
  const L = 2 * (x1 - x0) + 2 * (y1 - y0);
  const corners = [[x1, y0], [x1, y1], [x0, y1], [x0, y0]].map((c) => ({ c, t: per(c) % L }));
  corners[3].t = 0;

  const pieces = [];
  const islands = [];
  for (const r of rings(coast)) {
    const inside = r.pts.every(([x, y]) => x > x0 && x < x1 && y > y0 && y < y1);
    if (r.closed && inside) { islands.push(r.pts.slice(0, -1)); continue; }
    // An island that runs off the box: start it at a point outside, or
    // clipping splits it at its start into two runs that end mid-box.
    let pts = r.pts;
    if (r.closed) {
      const i = pts.findIndex(([x, y]) => x < x0 || x > x1 || y < y0 || y > y1);
      if (i > 0) pts = [...pts.slice(i, -1), ...pts.slice(0, i), pts[i]];
    }
    for (const run of clipLine(pts, m)) {
      const a = run[0], b = run[run.length - 1];
      const onEdge = (p) => p[0] <= x0 + 1e-6 || p[0] >= x1 - 1e-6 || p[1] <= y0 + 1e-6 || p[1] >= y1 - 1e-6;
      if (onEdge(a) && onEdge(b)) pieces.push({ pts: run, tin: per(a), tout: per(b) });
    }
  }
  const polys = [];
  if (!pieces.length) {
    if (islands.length) polys.push([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
  } else {
    const left = new Set(pieces);
    while (left.size) {
      const start = left.values().next().value;
      left.delete(start);
      const poly = [...start.pts];
      let cur = start;
      for (let guard = 0; guard < 1000; guard++) {
        // Nearest entry clockwise from where this run leaves the box.
        let best = null, bestD = Infinity;
        for (const p of [start, ...left]) {
          let d = (p.tin - cur.tout + L) % L;
          if (d < 1e-9 && p !== start) d = 0;
          if (d < bestD) { bestD = d; best = p; }
        }
        const cs = corners
          .map((c) => ({ ...c, d: (c.t - cur.tout + L) % L }))
          .filter((c) => c.d > 1e-9 && c.d < bestD)
          .sort((a, b) => a.d - b.d);
        for (const c of cs) poly.push(c.c);
        if (best === start) break;
        left.delete(best);
        poly.push(...best.pts);
        cur = best;
      }
      polys.push(poly);
    }
  }
  return [...polys, ...islands];
}

// ---------------------------------------------------------------- output

const fmt = (v) => {
  let s = (Math.round(v * 10) / 10).toString();
  if (s === "-0") s = "0";
  if (s.startsWith("0.")) s = s.slice(1);
  else if (s.startsWith("-0.")) s = "-" + s.slice(2);
  return s;
};
function nums(list) {
  let out = "";
  for (const p of list) {
    if (!out || p[0] === "-" || (p[0] === "." && /\.\d*$/.test(out) && !/[a-z]$/i.test(out))) out += p;
    else out += " " + p;
  }
  return out;
}
function path(lines, closed) {
  let d = "";
  for (const l of lines) {
    // Work in tenths so the relative steps add up exactly.
    const q = [];
    for (const [x, y] of l) {
      const t = [Math.round(x * 10), Math.round(y * 10)];
      const prev = q[q.length - 1];
      if (!prev || prev[0] !== t[0] || prev[1] !== t[1]) q.push(t);
    }
    if (closed && q.length > 1 && q[0][0] === q[q.length - 1][0] && q[0][1] === q[q.length - 1][1]) q.pop();
    if (q.length < (closed ? 3 : 2)) continue;
    const steps = [];
    for (let i = 1; i < q.length; i++) steps.push(fmt((q[i][0] - q[i - 1][0]) / 10), fmt((q[i][1] - q[i - 1][1]) / 10));
    d += "M" + nums([fmt(q[0][0] / 10), fmt(q[0][1] / 10)]) + "l" + nums(steps) + (closed ? "z" : "");
  }
  return d;
}

async function draw(dir, refetch) {
  const index = join(dir, "_index.md");
  const fm = frontMatter(await readFile(index, "utf8"));
  // The centre and width the map was last drawn with, from map.svg itself.
  const old = existsSync(join(dir, "map.svg")) ? await readFile(join(dir, "map.svg"), "utf8") : "";
  const attr = (k) => { const m = old.match(new RegExp(`data-${k}="([-0-9.]+)"`)); return m ? Number(m[1]) : undefined; };
  let lat = attr("lat"), lon = attr("lon");
  let city = old.match(/data-city="([^"]*)"/)?.[1];
  if (opt.near || lat === undefined || lon === undefined) {
    let found;
    ({ lat, lon, city: found } = await geocode(opt.near || fm.title));
    city = found && escape(found);
  }
  if (opt.city) city = escape(opt.city);
  if (!city) log(`no city for ${basename(dir)}: pass --city to name it`);
  const km = opt.km || attr("km") || 3.2;

  // Local equirectangular projection: at this scale the earth is flat.
  const kx = Math.cos((lat * Math.PI) / 180);
  const perKm = W / km;
  const project = ({ lat: la, lon: lo }) => [
    W / 2 + (lo - lon) * 111.32 * kx * perKm,
    H / 2 - (la - lat) * 110.57 * perKm,
  ];
  const halfH = (km * H) / W / 2, halfW = km / 2, pad = 0.15;
  const bb = {
    s: lat - (halfH + pad) / 110.57, n: lat + (halfH + pad) / 110.57,
    w: lon - (halfW + pad) / (111.32 * kx), e: lon + (halfW + pad) / (111.32 * kx),
  };
  for (const k in bb) bb[k] = Number(bb[k].toFixed(5));
  const file = join(CACHE, `osm2-${basename(dir)}-${lat}-${lon}-${km}.json`);
  const osm = (await overpass(bb, file, refetch)).elements;

  const layer = { coast: [], water: [], river: [], urban: [], park: [], building: [], minor: [], road: [], major: [], rail: [] };
  const polys = (e) => {
    if (e.type === "way") return e.geometry ? [orient(e.geometry.map(project), true)] : [];
    const members = (role) => (e.members || [])
      .filter((m) => m.type === "way" && m.geometry && (m.role === "inner") === (role === "inner"))
      .map((m) => m.geometry.map(project));
    return ["outer", "inner"].flatMap((role) =>
      rings(members(role)).filter((r) => r.closed).map((r) => orient(r.pts, role === "outer")));
  };
  for (const e of osm) {
    const t = e.tags || {};
    if (t.natural === "coastline") { if (e.geometry) layer.coast.push(e.geometry.map(project)); continue; }
    if (t.natural === "water" || t.waterway === "riverbank") { layer.water.push(...polys(e)); continue; }
    if (t.building) { layer.building.push(...polys(e)); continue; }
    if (/^(residential|commercial|retail|industrial|railway|construction)$/.test(t.landuse)) {
      layer.urban.push(...polys(e)); continue;
    }
    if (t.leisure || t.landuse || t.natural === "wood") { layer.park.push(...polys(e)); continue; }
    if (!e.geometry) continue;
    const pts = e.geometry.map(project);
    const hw = (t.highway || "").replace(/_link$/, "");
    const k = t.waterway ? "river" : t.railway ? "rail"
      : ["motorway", "trunk", "primary", "secondary", "raceway"].includes(hw) ? "major"
      : ["tertiary", "unclassified"].includes(hw) ? "road" : "minor";
    layer[k].push(pts);
  }

  const areas = (list, min = MIN_AREA) => list
    .map((r) => clipPolygon(simplifyRing(r, TOL), 1))
    .filter((r) => r.length > 2 && area(r) >= min);
  const lines = (list) => list.flatMap((l) => clipLine(l, 4)).map((l) => simplify(l, TOL));

  const seaD = path(sea(layer.coast).map((r) => simplifyRing(r, TOL)), true);
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" data-lat="${lat}" data-lon="${lon}" data-km="${km}"${city ? ` data-city="${city}"` : ""}>`,
    `<title>Map of ${city || escape(fm.title)}</title>`,
    // The list page draws this file with <use href="map.svg#map">, which needs
    // an id to point at.
    `<g id="map" fill="none" stroke-linecap="round" stroke-linejoin="round">`,
  ];
  const fill = (k, d, extra = "") => d && svg.push(`<path style="fill:${paint(k)}"${extra} d="${d}"/>`);
  const stroke = (k, w, d) => d && svg.push(`<path style="stroke:${paint(k)}" stroke-width="${w}" d="${d}"/>`);
  fill("urban", path(areas(layer.urban), true));
  fill("park", path(areas(layer.park), true));
  // The sea's islands are holes in it (evenodd); lakes and river areas carry
  // their own holes by winding (nonzero).
  fill("water", seaD, ` fill-rule="evenodd"`);
  fill("water", path(areas(layer.water), true));
  stroke("water", 2.5, path(lines(layer.river), false));
  fill("building", path(areas(layer.building, MIN_BUILDING), true));
  // Each road is drawn twice, a darker edge under a lighter middle, the way a
  // printed street map draws them, so white roads still show on pale land.
  const roads = Object.fromEntries(Object.keys(ROADS).map((k) => [k, path(lines(layer[k]), false)]));
  for (const k in ROADS) stroke("casing", ROADS[k] + 0.7, roads[k]);
  for (const k in ROADS) stroke(k === "major" ? "major" : "road", ROADS[k], roads[k]);
  const rail = path(lines(layer.rail), false);
  if (rail) {
    svg.push(`<g style="stroke:${paint("rail")}" stroke-linecap="butt"><path stroke-width=".8" d="${rail}"/>` +
      `<path stroke-width="3" stroke-dasharray=".8 4" d="${rail}"/></g>`);
  }
  svg.push("</g>", "</svg>");
  const out = svg.join("\n") + "\n";
  await writeFile(join(dir, "map.svg"), out);
  shareImage(out, join(dir, "cover.jpg"));
  log(`${join(dir, "map.svg").replace(ROOT + "/", "")}: ${(out.length / 1024).toFixed(1)} KB` +
    ` (${osm.length} OSM objects, ${km} km wide)`);
  return { map: "map.svg" };
}

// Link previews (Open Graph, Twitter cards) take no SVG, so each map is also
// saved as cover.jpg at the 1280×650 cover size, in the light colours. The
// share meta tags in layouts/partials/templates/ pick up a bundle file named
// *cover*. Needs rsvg-convert and ImageMagick (brew install librsvg imagemagick).
function shareImage(svg, file) {
  const flat = svg
    .replace(/var\(--map-[a-z]+,(#[0-9a-f]+)\)/g, "$1")
    .replace(/(<g id="map"[^>]*>)/, `$1<rect x="-10" y="-10" width="${W + 20}" height="${H + 20}" fill="${C.land}"/>`);
  try {
    // Through a file: ImageMagick waits forever on a PNG piped to its stdin.
    const png = join(tmpdir(), `city-map-${process.pid}.png`);
    execFileSync("rsvg-convert", ["-w", String(W * 2), "-h", String(H * 2), "-o", png], { input: flat });
    execFileSync("magick", [png, "-strip", "-quality", "82", file]);
    rmSync(png);
  } catch (e) {
    log(`${file.replace(ROOT + "/", "")}: not written (${e.message.split("\n")[0]})`);
  }
}

const args = process.argv.slice(2);
const refetch = args.includes("--fetch");
const flag = (k) => { const i = args.indexOf(`--${k}`); return i < 0 ? undefined : args.splice(i, 2)[1]; };
const opt = { near: flag("near"), km: Number(flag("km")) || undefined, city: flag("city") };
const targets = args.includes("--all")
  ? (await readdir(join(ROOT, "content", "places"), { withFileTypes: true }))
      .filter((d) => d.isDirectory()).map((d) => join(ROOT, "content", "places", d.name))
      // Only redraw: a page gets its first map when the script is run on it.
      .filter((d) => existsSync(join(d, "map.svg")))
  : args.filter((a) => !a.startsWith("--")).map((a) => resolve(a));
if (!targets.length) {
  log("usage: city-map.mjs <content/places/slug> [--near place] [--km width] [--city name] [--fetch] | --all");
  process.exit(1);
}
let last, failed = 0;
for (const dir of targets) {
  try {
    last = await draw(dir, refetch);
  } catch (e) {
    // One city failing (usually Overpass being busy) should not stop the rest.
    if (targets.length === 1) throw e;
    log(`${dir.replace(ROOT + "/", "")}: ${e.message}`);
    failed++;
    continue;
  }
  if (last && targets.length > 1) await new Promise((r) => setTimeout(r, 2000)); // be kind to Overpass
}
if (failed) {
  log(`${failed} map(s) not drawn; run again later, finished ones are cached`);
  process.exitCode = 1;
}
if (targets.length === 1) {
  if (!last) process.exit(1);
  console.log(JSON.stringify(last));
}
