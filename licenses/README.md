# Third-party licenses

The site's own code is under the MIT License in [`../LICENSE`](../LICENSE). The files below came from other projects and keep their original licenses.

| Source | Version | License | Files in this repo |
|---|---|---|---|
| [Hugo PaperMod](https://github.com/adityatelange/hugo-PaperMod) | commit `031e2ba5` | MIT, [`PaperMod-LICENSE`](PaperMod-LICENSE) | The layouts, partials, shortcodes, `assets/css/` and `i18n/` files that came from the theme, including the ones changed for this site |
| [plausible-hugo](https://github.com/divinerites/plausible-hugo) | v1.22.0 | GPLv3, [`plausible-hugo-LICENSE`](plausible-hugo-LICENSE) | `layouts/partials/plausible_*.html` (`plausible_head.html` is modified) and the `plausible_*` keys in `i18n/` |
| [Fuse.js](https://github.com/krisk/Fuse) | v6.6.2 | Apache-2.0, [`Fuse.js-LICENSE`](Fuse.js-LICENSE) | `assets/js/fuse.basic.min.js` |
| [highlight.js](https://github.com/highlightjs/highlight.js) | 10.2.1 | BSD-3-Clause, [`highlight.js-LICENSE`](highlight.js-LICENSE) | `assets/js/highlight.min.js`, `assets/css/hljs/an-old-hope.min.css` |

These used to be pulled in as the `PaperMod` and `plausible-hugo` git submodule themes. They were copied into the repo in November 2026 so the site no longer depends on them.
