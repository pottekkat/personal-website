---
title: Creating a "Today I Learned (TIL)" Section for My Hugo Website
slug: til-section-hugo
date: 2024-11-18T09:36:00+05:30
draft: true
toc:
  show: true
  open: true
ShowRelatedContent: false
description: Notes on adding a TIL section to share small learnings easily.
summary: Notes on how I added a TIL section to my Hugo-based static website.
tags:
  - blogs
  - setup
categories:
  - Writing/Blogging
series: []
aliases: []
cover:
  image: /images/creating-today-learned-til-section-hugo-website/classroom-banner.jpg
  alt: Children sitting in a classroom.
  caption: Photo by [Kunal Lakhotia](https://www.pexels.com/photo/smiling-girl-and-boys-sitting-under-walls-with-letters-at-school-20556421/)
  relative: "true"
fmContentType: Post (default)
---

I recently added a "Today I Learned (TIL)" section ([/tils/](/tils/)) to this Hugo-powered website.

My goal was simple: create a space where I can quickly capture and share small, daily learnings that don't necessarily warrant full-blown, dedicated blog posts.

It's like a middle ground between my [regular posts](/) and the [occasional daily logs](/dailies/), where I have a lower barrier for what's considered "worthy" for publishing. So, instead of these little revelations being lost to my future self and others, they will be documented in my personal archive.

This section was most recently inspired by [Julia Evans](https://jvns.ca/til/), who [created a similar section](https://jvns.ca/blog/2024/11/09/new-microblog/) inspired by [Simon Willison](https://til.simonwillison.net/). If you are inspired by me, follow along and add yourself to this chain of inspiration.

## Creating a New Content Folder

First, I needed a new content folder to house all TIL pages. So I created `/contents/tils/` and added an `_index.md` file:

```markdown {title="/content/tils/_index.md"}
---
title: Today I Learned
url: /tils/
description: Small things I learn every day.
summary: A list of small things I learn every day, documented chiefly for myself.
---

A list of small things I learn every day, documented chiefly for myself.
```

Hugo will create a new section for me at `/tils/`.

Nice, _step 1 done_. But the section looked empty, so before proceeding further, I added a TIL page by creating a new Markdown file:

````markdown {title="/content/tils/24-8-24-prevent-go-programs-from-exiting.md"}
---
title: Prevent Go Programs from Exiting
date: 2024-08-24T10:13:00+05:30
description: Useful trick using channels to prevent Go programs from exiting.
---

You can use channels to prevent Go programs from exiting.

I have found this to be useful when running Go + Wasm on the browser where I run into errors like:

```text
wasm_exec.js:378 Uncaught Error: bad callback: Go program has already exited
```

This can be prevented by wrapping your code with a channel:

```go
c := make(chan bool) // creates a new channel
// your code goes here
<-c // perpetually waits for the channel to receive data
```
````

I wanted to keep the TIL pages plain and simple. The only front matter they have are a title, description, and date. With a TIL page added, I saw how the section looks on the website.

And it needed a better layout and some style changes.

## Adding a TIL "list" and "single" Layout

I had to change how the TILs were listed in the section. Like [Julia\'s TIL](https://jvns.ca/til/) and unlike my [other sections](/posts/), I wanted each TIL in the list to include the complete content of the page.

This required a custom layout:

```html {title="layouts/tils/list.html", hl_lines=["59-65"]}
{{- define "main" }}

<header class="page-header">
  <h1>
    {{ .Title }}
    <a href="index.xml" title="RSS" aria-label="RSS">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        height="23"
      >
        <path d="M4 11a9 9 0 0 1 9 9" />
        <path d="M4 4a16 16 0 0 1 16 16" />
        <circle cx="5" cy="19" r="1" />
      </svg>
    </a>
  </h1>
</header>

{{- if .Content }}
<div class="post-content">
  {{- if not (.Param "disableAnchoredHeadings") }}
    {{- partial "anchored_headings.html" .Content -}}
  {{- else }}
    {{ .Content }}
  {{ end }}
</div>
{{- end }}

<div id="searchbox">
  <input
    id="searchInput"
    placeholder="{{ .Params.placeholder | default (printf"Search") }}"
    aria-label="search"
    type="search"
    autocomplete="off"
    data-show-only="tils">
  <ul id="searchResults" aria-label="search results"></ul>
</div>

{{- $pages := union .RegularPages .Sections }}
{{- range $index, $page := $pages }}

<article class="til-post-entry">
  <header class="til-entry-header">
    <a
      aria-label="post link to {{ .Title | plainify }}"
      href="{{ .Permalink }}"
    >
      <h2>{{- .Title }}</h2>
    </a>
  </header>
  <div class="til-entry-footer">{{- partial "post_meta.html" . -}}</div>
  <div class="post-content">
    {{- if not (.Param "disableAnchoredHeadings") }}
      {{- partial "anchored_headings.html" .Content -}}
    {{- else }}
      {{ .Content }}
    {{ end }}
  </div>
</article>
{{- end }}
{{- end }}{{- /* end main */ -}}
```

The highlight shows how I added the content to the list itself. Because TILs are short, having the content on the list looks great. And if I want to share a TIL, I use the individual TIL page linked in the TIL title.

Each TIL page follows a simple layout:

```html {title="/layouts/tils/single.html"}
{{- define "main" }}
<article class="post-single">
  <header class="post-header">
    {{ partial "breadcrumbs.html" . }}
    <h1 class="post-title">{{ .Title }}</h1>
    {{- if not (.Param "hideMeta") }}
    <div class="post-meta">
      {{- partial "post_meta.html" . -}}
      {{- partial "translation_list.html" . -}}
      {{- partial "post_canonical.html" . -}}
    </div>
    {{- end }}
  </header>
  <div class="post-content">
    {{- if not (.Param "disableAnchoredHeadings") }}
      {{- partial "anchored_headings.html" .Content -}}
    {{- else }}
      {{ .Content }}
    {{ end }}
  </div>
</article>
{{- end }}{{/* end main */}}
```

With some CSS sprinkled on top, the TIL section started to look neat.

## Defining a Front Matter CMS Content Type/Hugo Archetype

A TIL section is only useful if I can quickly create and post content. Thankfully, I [started using Front Matter CMS](/posts/cms-ide/) recently, which allows me to write faster.

I first registered the `/content/tils` folder to be read by Front Matter:

```json {title="frontmatter.json", linenos="inline", linenostart="257"}
{
  "frontMatter.content.pageFolders": [
    {
      "title": "TILs",
      "path": "[[workspace]]/content/tils",
      "previewPath": "tils",
      "contentTypes": ["TILs"],
      "excludePaths": [
        "_*.*" // Exclude all files starting with an underscore
      ]
    }
  ]
}
```

Then, I defined the structure of each TIL page to avoid writing boilerplates every time:

```json {title="frontmatter.json", linenos="inline", linenostart="23"}
{
  "frontMatter.taxonomy.contentTypes": [
    {
      "name": "TILs",
      "pageBundle": false,
      "filePrefix": "{{date|d-M-yy}}",
      "fields": [
        {
          "title": "Title",
          "name": "title",
          "type": "string",
          "single": true
        },
        {
          "title": "Publishing date",
          "name": "date",
          "type": "datetime",
          "dateFormat": "yyyy-MM-dd'T'HH:mm:ssXXX",
          "default": "{{now}}",
          "isPublishDate": true
        },
        {
          "title": "Description",
          "name": "description",
          "type": "string"
        }
      ]
    }
  ]
}
```

If you aren't using Front Matter, you can instead define a new [archetype](https://gohugo.io/content-management/archetypes/) to create TILs quickly using the Hugo CLI:

```markdown {title="/archetypes/tils.md"}
---
title: {{ .Name | title }}
date: {{ .Date }}
description: ""
---
```

That's it! Now, I can quickly share small learnings, and from using it for the past few days, it works as intended. I have to continue using it for a while and see how valuable it will be.

You can see the [complete pull request](https://github.com/pottekkat/personal-website/pull/155) that added this feature on GitHub.
