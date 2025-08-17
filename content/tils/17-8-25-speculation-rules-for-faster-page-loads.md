---
title: Speculation Rules for Faster Page Loads
date: 2025-08-17T18:24:51+05:30
description: "Prefetch and prerender web pages proactively, speculatively."
fmContentType: TILs
---

The [Speculation Rules API](https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API) allows you to improve page navigation on your websites by prefetching and prerendering web pages proactively with just a few lines of code.

In practice, this means that when a user hovers over a link (to click it), the next web page is already loaded and rendered, providing a faster, SPA-like loading experience.

I added it to my website today. You can see it in action by opening the network tab and [hovering over a link](/posts/pi-hole/) in this website without clicking it.

This website uses Hugo, so I added it to my `head.html` partial template:

```html {title="layout/partials/head.html"}
<!-- Speculation Rules for instant navigation -->
{{- /* Only enable this in production */}}
{{- if hugo.IsProduction | or (eq site.Params.env "production") }}
<script type="speculationrules">
  {
    // Prefetch and prerender all internal pages but wait 200ms (moderate eagerness) after hover
    "prerender": [{ "where": { "href_matches": "/*" }, "eagerness": "moderate" }],
    "prefetch": [{ "where": { "href_matches": "/*" }, "eagerness": "moderate" }]
  }
</script>
<script>
  // Fallback for browsers that don't support the Speculation Rules API
  if (!HTMLScriptElement.supports || !HTMLScriptElement.supports('speculationrules')) {
    // Track preloaded URLs to avoid duplicate requests
    const preloadedUrls = {};

    function pointerenterHandler() {
      if (!this.href) return; // Skip if no href
      if (!this.href.startsWith(location.origin)) return; // Skip external links
      if (preloadedUrls[this.href]) return; // Skip duplicates
      preloadedUrls[this.href] = true; // Mark as preloaded

      const prefetcher = document.createElement('link');
      const supportsPrefetch = prefetcher.relList && prefetcher.relList.supports && prefetcher.relList.supports('prefetch'); // Check if browser supports prefetch
      prefetcher.as = supportsPrefetch ? 'document' : 'fetch'; // Set as document or fetch (older browsers)
      prefetcher.rel = supportsPrefetch ? 'prefetch' : 'preload'; // Set as prefetch or preload (older browsers)
      prefetcher.href = this.href;
      document.head.appendChild(prefetcher); // Add to head
    }

    document.addEventListener('DOMContentLoaded', function () {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const saveData = conn && conn.saveData;
      const isVerySlow = conn && /(^|-)2g($|-)/.test(String(conn.effectiveType || ''));
      if (saveData || isVerySlow) return; // Skip for data saver and slow connections
      document.querySelectorAll('a[href^="/"]').forEach(function (item) {
        item.addEventListener('pointerenter', pointerenterHandler, { passive: true }); // Add event listener when pointer enters link area
      });
    });
  }
</script>
{{- end }}
```

DocuSeal has an [excellent blog post](https://www.docuseal.com/blog/make-any-website-load-faster-with-6-lines-html) that covers this API. The code I shared above just tweaks it a little bit.
