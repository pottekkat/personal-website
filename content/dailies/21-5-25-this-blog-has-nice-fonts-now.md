---
title: "#311 This Blog has Nice Fonts Now"
date: 2025-05-21T20:39:50+05:30
draft: false
summary: I have added opinionated fonts for this website.
fmContentType: Daily
---

In all the years this blog has been alive, I have **only** used system fonts. The `font-family` property in my reset stylesheet looked like this:

```css
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    /* more stuff */
}
```

My justification for using system fonts was threefold:

1. Don't need to load fonts on each page at the cost of performance.
2. Default system fonts are already good and are very good for reading.
3. Readers have more control over the font (through custom system fonts).

However, I had to pay the price of inconsistent looks across operating systems and devices, and more importantly, the cost of personality.

Frontend hasn't been my strong suit, so I didn't really know how to properly use custom fonts without compromising performance or readability. I also couldn't figure out which fonts to use. For the longest time, I've had a list of websites with fonts I like waiting to be used someday.

And I finally did.

How does it look? It's opinionated, but I've ensured the readability is still top-notch. I particularly like how the headings and the body text have different fonts, bringing some variety to an otherwise monotonous page. The code blocks use the JetBrains Mono font, which I also use in my code editors.

To learn more about the fonts I've used and the rest of the setup, see the new [Colophon section](http://localhost:1313/about/#colophon) in the About page.
