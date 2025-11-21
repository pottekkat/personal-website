---
title: Migrating from Hugo v0.118.2 to v0.152.2
slug: migrating-hugo
date: 2025-11-12T15:01:20+05:30
draft: false
toc:
  show: false
ShowRelatedContent: false
description: Field notes from the trenches as an ADHD-driven weekend hack turns into a fortnight of productive procrastination.
summary: How did I migrate from Hugo v0.118.2 to v0.152.2? More importantly, why would I even attempt such an endeavor?
tags:
  - blogs
  - hugo
  - notes
categories:
  - Writing/Blogging
series: []
aliases: []
cover:
  image: /images/migrating-from-hugo-118-to-152/migration-banner.jpg
  alt: Cranes migrating.
  caption: Hugo makes migration very easy actually, with a few, easily fixable breaking changes.
  relative: false
fmContentType: Post (default)
---

I've been content with this digital duct tape of a blog, built with Hugo v0.118.2 from over two years ago. By "content", I mean I once tried to bump the version to support custom render hooks and immediately gave up after a mild panic when things started breaking.

To be fair, this was [1386 commits](https://github.com/gohugoio/hugo/compare/v0.118.2...v0.152.2) before on the Hugo repo. Things have changed. Hugo has a lot more features, and I have FOMO.

What I really wanted was custom admonitions.

> [!NOTE]
> These neat little things.

While I could still be on v0.118.2 and write a custom shortcode for this, I preferred the much more elegant render hook support that later versions of Hugo added. The best part is that I could then use plain old Markdown to create these lovely little boxes.

The latest Hugo version also had cool features for building image processing pipelines and generating QR codes, which felt like a nice addition to the site and an excellent way to trick myself into thinking that this was a productive use of my time.

I've been using Hugo Version Manager (hvm) for a while now to pin the Hugo version used by this site (and my other Hugo websites). So it was only a matter of bumping the version in my `.hvm` file:

```diff {title=".hvm"}
- v0.118.2
+ v0.152.2
```

I wouldn't be writing this post if that were the end of it.

## Where Did All the Whitespaces Come From?

For a moment, it looked like the `1px` margin decided to rebrand itself as `1.5px`. But it turns out there were a lot of whitespaces in my template files. Previously, it was being trimmed out; now, because of some changes to how Hugo generates pages, it isn't.

This bug messed with my head for a bit because it looked like some CSS issue. I eventually figured it out and fixed everything.

BTW, the source code of this repo is public. You can see my masterful procrastination in all its glory in [PR #186](https://github.com/pottekkat/personal-website/pull/186/).

## Some Breaking Configuration Changes

There were some broken fields in the configuration, like `params.Author`, which was changed to `params.Author.Name`.

The "series" taxonomy had also broken, and I had to make [this fix](https://github.com/pottekkat/personal-website/pull/186/commits/2fbf9483a014bbc369e102f012d53bb30f37628b):

```diff {title="layouts/_default/single.html"}
-    {{ $name := index .Params.series 0 }}
-    <p><i>This article is a part of the series "<a href='/series/{{$name | urlize }}'>{{$name}}</a>."</i></p>
-    <p>Other articles in the series:</p>
-    {{ $name := $name | urlize }}
-      {{ $series := index .Site.Taxonomies.series $name }}
-      <ul class="series">
-      {{ range sort $series.Pages "Date" }}
-
-        <li>
-          {{ if ne $currentPage .Permalink }}
-          <a href="{{.Permalink}}">{{.LinkTitle}}</a>
-          {{ else }}<b>{{.LinkTitle}}</b>{{ end }}
-        </li>
-      {{end}}
-      </ul>
+    {{ $seriesTerms := .GetTerms "series" }}
+    {{ if $seriesTerms }}
+      {{ range $seriesTerms }}
+        <p><i>This article is a part of the series "<a href='{{ .Permalink }}'>{{ .LinkTitle }}</a>."</i></p>
+        <p>Other articles in the series:</p>
+        <ul class="series">
+        {{ range sort .Pages "Date" }}
+          <li>
+            {{ if ne $currentPage .Permalink }}
+            <a href="{{.Permalink}}">{{.LinkTitle}}</a>
+            {{ else }}<b>{{.LinkTitle}}</b>{{ end }}
+          </li>
+        {{end}}
+        </ul>
+      {{ end }}
+    {{ end }}
```

## I Should Add Some Admonitions

> [!WARNING]
> Admonitions are really cool. Just look at this.

I've always wanted to add admonitions, but I did not want to use a shortcode that adds an extra layer of friction, even with [my Front Matter CMS setup](/posts/cms-ide/). With custom render hooks, I can just write Markdown and it will be rendered nicely!

````markdown
> [!WARNING]
> Admonitions are really cool. Just look at this.
````

You can check out [this commit](https://github.com/pottekkat/personal-website/pull/186/commits/4dc06a3ef20bd24087c92dcd884da5c64cd67a47#diff-6661c0710eb6de8cfaa86c794c6f503f196746104be7550cf82b8c599906bfb3) and [Hugo docs](https://gohugo.io/render-hooks/blockquotes/) to learn more.

## Scan Away!

QR codes are ubiquitous. There's a [neat feature in Netlify deploy previews](https://github.com/pottekkat/personal-website/pull/186#issuecomment-3486772147) that generates a QR code for the preview, which you can use to test the changes on mobile without manually typing or copying the link. I wanted something like that for my site, too (see the Show QR Code button at the top).

I've always wanted to do something cool with Hugo's image functions, and [QR codes](https://gohugo.io/functions/images/qr/) were a good starting point. It is [easy to add](https://github.com/pottekkat/personal-website/pull/186/commits/0e97e6abec90d73b126d9d3727156c751aa57ea6) as well.

{{< qr text="https://youtu.be/dQw4w9WgXcQ?si=wdzLPVjRqTg0SoD1" title="Unsuspecting QR code" alt="An unsuspecting QR code lived here." />}}

## I Was Always a Straight-A Student

I wasn't, though, but that's not going to stop me from getting a perfect 100 Lighthouse performance score.

A relatively low-hanging fix was to use the WebP format instead of bulky JPEGs and load appropriately sized images for the screen size. Hugo offers many built-in functions that can help build [image processing pipelines](https://github.com/pottekkat/personal-website/pull/186/commits/2e8a849aa7153f57bcce19a378acc802b039cb79) that solve this for me at build time.

## Would I Ever Do This Again?

Bumping the version (even a two-year bump) was a lot easier than I expected. With the help of some coding agents, it is pretty easy to find and fix any issues.

This exercise has also encouraged me to keep my Hugo version up to date going forward and try to "RICE" my website with all the latest features it provides. I should also contribute back code, now that I can actually use new features.

But that's for another fortnight of productive procrastination.
