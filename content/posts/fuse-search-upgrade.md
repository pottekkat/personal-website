---
title: "Upgrading the Fuse.js Search Feature"
date: 2023-09-02T07:48:36+05:30
draft: false
ShowToc: false
ShowRelatedContent: true
summary: "Modifying some JavaScript code to add a search feature for the daily logs page."
tags: ["blogs", "setup"]
categories: ["Blogging"]
cover:
  image: "/images/fuse-search-upgrade/search-banner.jpg"
  alt: "A child looking though a pair of binoculars."
  caption: "Having a personal site to which you can keep adding niche features is quite fun."
  relative: false
---

I have wanted to add a search feature for my [daily logs feed](/dailies/) for some time. Recently, while working on something unrelated, I got bored, started working on my site, and picked up this feature.

Let me back up a little. So I [already had a search functionality implemented](/archives/) using [Fuse.js](https://www.fusejs.io/), but configured it so that it only searches through my regular posts, i.e., all posts that aren't daily logs.

When I first decided to add a search for the daily logs, I assumed I would create a separate search index just for the daily logs, and depending on where you are on the site or which search bar you are using, you would be able to search through either my regular posts or daily logs.

But creating this wasn't trivial in my Hugo site. You had to [configure a new output format](https://xdeb.org/post/2017/make-hugo-generate-a-json-search-index-and-json-feed/) other than the default JSON format which creates the `index.json` file, which wasn't ideal.

Another solution I thought of was using another open source, server-side search tool that took care of the specifics of the implementation. But the whole site was static, and I did not want to make server calls just for the search.

Armed with my little knowledge of JavaScript, I set out to find a more elegant solution. And the easiest way I could do this was to:

1. Create a search index with all my posts.
2. If on the daily logs page, keep only the daily logs posts in the search index.
3. If on the archives page, omit the daily logs posts from the search index.

## Indexing All Posts

To index all posts, I just had to remove the part where I did not index the daily logs. So the template for my `index.json` file looked like this:

```json {title="index.json"}
{{- $.Scratch.Add "index" slice -}}
{{- range .Site.RegularPages -}}
    {{- if and (not .Params.searchHidden) (ne .Layout `archives`) (ne .Layout `dailies`) (ne .Layout `stats`) (ne .Layout `about`) (ne .Layout `search`) (ne .Layout `subscribe`) }}
    {{- $.Scratch.Add "index" (dict "title" .Title "content" .Plain "permalink" .Permalink "summary" .Summary "categories" .Params.categories) -}}
    {{- end }}
{{- end -}}
{{- $.Scratch.Get "index" | jsonify -}}
```

I also added the category of the posts to the index. I will later use this to filter daily logs because all daily logs have the category "Daily Dose of Pottekkat" (I know, I'm so full of myself!).

## Filtering by Category

So I have two pages with search boxes: The [archives](/archives/) page, which should omit the daily logs posts, and the [daily logs](/dailies/) page, which should only show daily logs posts.

I used the HTML data attribute to associate which search box should do what. The data-omit attribute mentions which category to omit, and the data-show-only attribute conveys the only category to show.

So, the search box in the archives page looked like this:

```html {title="archives.html"}
<div id="searchbox">
  <input id="searchInput" autofocus placeholder="{{ .Params.placeholder |
  default (printf "%s ↵" .Title) }}" aria-label="search" type="search"
  autocomplete="off" data-omit="Daily Dose of Pottekkat">
  <ul id="searchResults" aria-label="search results"></ul>
</div>
```

And the one on the daily logs page looked like this:

```html {title="dailies.html"}
<div id="searchbox">
  <input id="searchInput" autofocus placeholder="{{ .Params.placeholder |
  default (printf "Search ↵") }}" aria-label="search" type="search"
  autocomplete="off" data-show-only="Daily Dose of Pottekkat">
  <ul id="searchResults" aria-label="search results"></ul>
</div>
```

## Wiring Up with JavaScript

The JavaScript part was relatively straightforward, even if I don't often work with it. If either data attribute is set, filter the index based on that data:

```js
let data = JSON.parse(xhr.responseText);
let searchBox = document.querySelector("#searchInput");
let showOnly = searchBox.dataset.showOnly;
let omit = searchBox.dataset.omit;

// Filter data based on "showOnly" and "omit"
if (showOnly) {
  data = data.filter(function (item) {
    return item.categories.indexOf(showOnly) !== -1;
  });
} else if (omit) {
  data = data.filter(function (item) {
    return item.categories.indexOf(omit) === -1;
  });
}
```

I added a bit more things to tidy everything up. The complete set of upgrades can be found in [this pull request](https://github.com/pottekkat/personal-website/pull/96).

I will keep updating this site as I come across more features I want to add. But for now, I am pretty happy with the search functionality. I can finally search for long-lost posts. But that also means others can search my daily logs! What did I do?!
