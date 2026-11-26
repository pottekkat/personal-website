# Third-party licenses

The site's own code is under the MIT License in [`../LICENSE`](../LICENSE). The files below came from other projects and keep their original licenses.

| Source | Version | License | Files in this repo |
|---|---|---|---|
| [Hugo PaperMod](https://github.com/adityatelange/hugo-PaperMod) | commit `031e2ba5` | MIT, [`PaperMod-LICENSE`](PaperMod-LICENSE) | The layouts, partials, shortcodes, `assets/css/` and `i18n/` files that came from the theme, including the ones changed for this site |
| [MiniSearch](https://github.com/lucaong/minisearch) | v7.1.1 | MIT, [`MiniSearch-LICENSE`](MiniSearch-LICENSE) | `assets/js/minisearch.min.js` |
| [highlight.js](https://github.com/highlightjs/highlight.js) | 10.2.1 | BSD-3-Clause, [`highlight.js-LICENSE`](highlight.js-LICENSE) | `assets/js/highlight.min.js`, `assets/css/hljs/an-old-hope.min.css` |

PaperMod used to be pulled in as a git submodule theme and was copied into the repo in November 2026 so the site no longer depends on it. The plausible-hugo theme was removed at the same time; Plausible is now loaded by `layouts/partials/analytics.html`, written for this site.
