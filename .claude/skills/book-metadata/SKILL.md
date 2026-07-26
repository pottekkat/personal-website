---
name: book-metadata
description: Research bibliographic metadata for a book and download a high-resolution cover from LibraryThing, returning front matter for content/books/. Use when adding a book to The Bookshelf, filling in an empty book review stub, or when asked for book metadata for this site.
---

# Book metadata for The Bookshelf

Research one book and return its bibliographic front matter as JSON, and download its
cover image into `static/images/books/covers/`.

## Scope — read this first

**Research and the cover download only.** Do not write the `.md` file and do not write
the review body. The caller applies the metadata:

- Invoked from the Front Matter CMS button (`scripts/frontmatter/book-metadata.js`), the
  JSON is fed to `ContentScript.updateFrontMatter()` and Front Matter writes the front
  matter itself. A second writer would conflict.
- Invoked interactively, hand the JSON back and let the user apply it.

Never set `status`, `rating`, `draft`, `date`, or `title` — those are the user's, not
the catalogue's. Never invent the body text.

## Output contract

Final output must be exactly this object (no prose around it):

```json
{
  "summary": "Review of \"The Lost Continent: Travels in Small-Town America\" by Bill Bryson.",
  "bookMeta": {
    "author": "Bill Bryson",
    "published": 1989,
    "isbn": "9780552998086",
    "publisher": "Black Swan",
    "pageCount": 379,
    "genre": ["Humor", "Memoir", "Non-Fiction", "Travel", "American"],
    "coverImage": "/images/books/covers/the-lost-continent.jpg"
  },
  "notes": "Anything uncertain, plus the LibraryThing work id used."
}
```

`goodreadsUrl` goes inside `bookMeta` too — it is omitted above only for brevity.
When the caller supplies a JSON schema, match it exactly.

Every key is always present. A field you could not verify is `""` (or `0`, or `[]`) —
never a guess. The caller drops empty values rather than writing them, so a blank is
safe and a wrong value is not.

`notes` is for the human, not the file. Put every uncertainty there. Note that the Front
Matter button discards `notes` — say anything critical by leaving the field blank so the
gap is visible in the file itself.

## Step 1 — identify the book

Two REST APIs, no auth, no scraping:

```bash
curl -s "https://www.googleapis.com/books/v1/volumes?q=intitle:<title>+inauthor:<author>"
curl -s "https://openlibrary.org/search.json?q=<title>+<author>&fields=title,author_name,first_publish_year,isbn,publisher,number_of_pages_median,subject&limit=5"
```

Cross-check at least two independent sources for the ISBN and page count. If they
disagree, prefer the one matching the edition you picked in step 2 and record the
conflict in `notes`.

## Step 2 — pick the edition

Look at how the neighbours in `content/books/` are filled before deciding:

| Field | Rule |
|---|---|
| `published` | Year the **work** was first published, not the reprint. Kundera's *Unbearable Lightness* is `1984` even though the ISBN is a 2000 Faber printing. |
| `isbn` | The **specific edition** — quoted string, 13 digits, no hyphens. Prefer a widely-held paperback the user plausibly owns. |
| `publisher` | Publisher of that edition (`Black Swan`, `Faber & Faber`), not the original house. |
| `pageCount` | That edition. |

## Step 3 — Goodreads URL

Canonical `https://www.goodreads.com/book/show/<id>.<Slug>` or `<id>-<slug>` form.
Verify the id resolves to the right book — Goodreads has many editions and the wrong
id silently points at a different translation. If you cannot verify it, omit the field
and say so in `notes`. A missing link is better than a wrong one.

## Step 4 — genre

Genres are a closed taxonomy. Read the allowed values before choosing:

```
frontmatter.json → frontMatter.taxonomy.customTaxonomy → the entry with "id": "genre"
```

Pick 3–5. Order them **alphabetically, with any nationality or language genre last** —
that is the existing convention:

- `Humor, Memoir, Non-Fiction, Travel, American`
- `Classics, Fiction, Philosophy, Czech`
- `Contemporary, Fiction, Scandinavian`

If nothing in the list fits, propose a new genre in `notes`. Do not silently invent one:
an unlisted value shows up as an unknown taxonomy entry in the CMS.

## Step 5 — cover image

**Aim for ≥1000px wide.** `layouts/partials/book_cover.html` builds a srcset out to
720w, and Hugo upscales rather than refusing, so a 600px source silently produces a
soft 720w variant — that is what makes a cover look blurry on a retina screen. Existing
covers run 800–1730px wide; the few 400–600px ones are the bad outliers, not the target.

Do not judge quality by file size — flat cover art compresses to very few bytes while
staying crisp (`the-art-of-doing-science-and-engineering.jpg` is 1730×2560 in 76K). But
do not trust pixel dimensions either; substep 5 below has the test that actually works.

LibraryThing sits behind a Cloudflare challenge, so plain `curl` on the site returns
403 — use the browser tools for the lookup, then `curl` the CDN URL you find (the CDN
itself is open).

1. Navigate to `https://www.librarything.com/isbn/<isbn>`. It redirects to
   `https://www.librarything.com/work/<workid>`. Cloudflare shows "Just a moment…"
   first — wait for that text to disappear (up to ~15s) before reading the page.
2. Navigate to `https://www.librarything.com/work/<workid>/covers/`.
3. Each cover is a `div.cover_box` holding a thumbnail, a dimensions label
   (`div.cover_size` → e.g. `1272 × 1897`), and an anchor whose `onclick` carries the
   cover id: `lt.newwork.cover_info_popup(event, 'yourcustom', 'custom:4906380', ...)`.
   Enumerate them and pick the best cover — highest listed resolution, correct edition
   art, front cover only, no obvious scan artefacts. Prefer boxes marked `high_quality`.
4. Click that anchor to get the full URL. Two kinds come back:

   - A member upload on LibraryThing's own CDN, capped at whatever the popup emits:

     ```
     https://pics.cdn.librarything.com/picsizes/49/06/4906380-c-h1200-w600-pv25_<hash>_v5.jpg
     ```

     The size directive and the hash are cryptographically bound, so you **cannot**
     hand-edit `-w600-` to force a bigger image — a wrong hash returns the same stored
     rendition or a 307. This is usually the *low*-resolution option.

   - An Amazon-sourced cover (LibraryThing labels these `Higher` instead of giving
     dimensions), which is where the resolution actually is. Take the ISBN-10 out of the
     URL and ask Amazon for the native maximum:

     ```bash
     curl -sL -A "Mozilla/5.0" -o cover.jpg \
       "https://m.media-amazon.com/images/P/<isbn10>.01._SX1500_SY2400_SCRM_.jpg"
     ```

     Amazon downscales to its stored maximum and ignores anything larger, so this
     returns the biggest it has — request `_SX1500_` and accept the 1000px you get.
     Do **not** use `_SX600_`, `_SCLZZZZZZZ_`, or `.LZZZZZZZ.`: the first hard-compresses
     and the other two cap around 330px.

5. **Pixel dimensions lie. Measure real detail, and look at the image.** Several sources
   happily return a big upscale of a small master, and one returns a placeholder.

   Download every candidate, then rank them by edge energy at a *common* width so the
   comparison is fair:

   ```bash
   magick <file> -resize 1000x -colorspace Gray \
     -define convolve:scale='!' -morphology Convolve Laplacian:0 \
     -format "%[fx:standard_deviation]\n" info:
   ```

   Higher is sharper. On *Why Men Rebel* the 1000px print-ISBN image scored `0.0181`
   while a 3330×5000 Kindle-ASIN image scored `0.0112` — the "bigger" file had 1.7×
   *less* real detail. Pick the winner of this test, not the largest file.

   Then confirm by eye at 1:1, which is the only thing that reliably catches mush:

   ```bash
   magick <file> -crop 500x260+<x>+<y> +repage /tmp/crop.png   # over some large type
   ```

   Read that crop. Crisp letter edges = real resolution. Soft, smeared edges = an
   upscale, no matter what the dimensions say. Also confirm it is the right edition's
   art and not a placeholder. If the file is HTML or a 1x1 the download failed; do not
   leave a broken file behind.

   Target ≥1000px of *real* detail, never below 720px.

   Dead ends already measured, so do not spend turns on them:

   | source | result |
   |---|---|
   | Amazon `_SX<big>_` on a Kindle **ASIN** | upscales on demand to any size — soft, ignore the dimensions |
   | `books.google.com/…&fife=w1600` | can return a grey **"no cover" placeholder** at 1734×2500 — always look at it |
   | Google Books **API** | environment-wide 429, `quota_limit_value 0` — assume unavailable |
   | `images.tandf.co.uk` / `images.routledge.com` `/common/jackets/*` | 350px max, even on the publisher's own product page |
   | Open Library `-L` | ~350px |
   | Waterstones, Blackwell's, Wordery, Bokus, Booktopia, IndieBound, B&N | ≤300px or 403 |

   Amazon's **print-ISBN** path (`_SX1500_`) is the one that refuses to upscale past its
   master, which is what makes it trustworthy.

6. **Sharpening is allowed when the softness is a resampling artifact.** Cover art that
   is flat type on a flat background — no photographic texture — recovers real crispness
   from a mild unsharp mask. Do not use this to prop up a genuine upscale.

   ```bash
   magick <file> -unsharp 0x1.2+1.4+0.01 -quality 92 <out>.jpg
   ```

   Then check a 1:1 crop of the *thinnest* details (hairlines, publisher logo, small
   caption type) for bright or dark halo ringing. Back the amount off until the halos
   are gone. On *Why Men Rebel* this took edge energy from `0.0181` to `0.0373` with no
   visible halo.

**Filename**: the page slug, shortened if the slug is long — `stubborn-attachments.jpg`
for `stubborn-attachments-a-vision-for-a-society-of-...`, `the-lost-continent.jpg` for
`the-lost-continent-travels-in-small-town-america`. Keep the `.jpg` extension (Hugo's
image pipeline in `layouts/partials/book_cover.html` handles jpg/png/webp, but jpg is
the norm). `coverImage` is the site-absolute path: `/images/books/covers/<file>`.

**Fallback** if LibraryThing has no usable cover or the browser tools are unavailable.
Try Amazon first, since it needs no browser and no Cloudflare dance — convert the
edition's ISBN-13 to its ISBN-10 and use the `_SX1500_` form from step 4. Only if that
404s fall back to Open Library:

```bash
curl -sL -o cover.jpg "https://covers.openlibrary.org/b/isbn/<isbn>-L.jpg"
```

Open Library's `-L` is only ~350px and sometimes a placeholder, which is below what the
image pipeline needs. Take it only as a last resort, and say so in `notes` so the user
knows to replace it by hand.

## Step 6 — summary

Exactly this shape, matching every other book on the site:

```
Review of "<Title>" by <Author>.
```

That is the whole summary. It is a card subtitle, not a blurb — do not describe or
review the book.

## Accuracy

A wrong ISBN or a cover from the wrong edition is worse than a blank field, because it
looks correct and never gets checked. Leave a field out and explain in `notes` rather
than guessing.
