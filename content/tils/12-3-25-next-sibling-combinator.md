---
title: "`:has()` and Next-Sibling `+` Combinator"
date: 2025-03-12T18:25:32+05:30
description: "The `:has()` pseudo-class and the next-sibling `+` combinator are really useful for some complex CSS."
fmContentType: TILs
cover:
    relative: false
---

The relatively new `:has()` [pseudo-class](https://developer.mozilla.org/en-US/docs/Web/CSS/:has) can be combined with the [next-sibling](https://developer.mozilla.org/en-US/docs/Web/CSS/Next-sibling_combinator) `+` combinator for some nifty CSS selections. I used this selection today:

```css
.post-content blockquote p:last-of-type:not(:has(+ footer)) {
    margin-bottom: 0;
}
```

Which can be read as, "select the last `paragraph` element within `blockquote` elements within elements with class `post-content` which are **not followed by a** `footer` **element**."
