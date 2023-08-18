---
title: "List Articles from a Series in Hugo"
date: 2023-08-18T17:59:56+05:30
draft: false
ShowToc: false
ShowRelatedContent: true
summary: "How I added a list of articles in the same series at the beginning of each post."
tags: ["blogs", "setup"]
categories: ["Blogging"]
cover:
    image: "/images/list-series-hugo/dominoes-banner.jpg"
    alt: "Domino tiles arranged in order."
    caption: "Maybe a very trivial setup, but I'm not a Hugo expert."
    relative: false
---

At least some of my readers know [this site is built using Hugo](/posts/my-blog-setup-and-writing-process/). One of the ways I procrastinate from doing actual work is by making tiny improvements to the site. And in a recent round of improvements, I added a template to list other articles in the same series in order in a blog post. It looks like [this](/posts/canary-in-kubernetes/):

{{< figure src="/images/list-series-hugo/series.gif#center" title="Listing posts in a series" caption="See it in action [here](/posts/canary-in-kubernetes/)" link="/images/list-series-hugo/series.gif" target="_blank" class="align-center" >}}

The idea is to give the readers more context and make it easy to find other related articles. Most of the time, each new piece in a series builds on the previous ones. So it is essential that a reader needs to understand and access that easily.

I'm not a Hugo expert. I find solutions when and where I need them. This site is built on top of the work of others. I make it feel more personal to my tastes. So implementing this was not really that trivial. In this article, I will walk through how I added this feature, and it might be of use to you if you also have Hugo sites.

## The Setup

[My blog setup](/posts/my-blog-setup-and-writing-process/) is relatively straightforward. The entire code is open source if you want to dig more into the site. But the key aspect here is that I use a "series" taxonomy to group content:

```yaml {title="config.yaml"}
taxonomies:
  category: categories
  series: series
  tag: tags
```

[Taxonomies](https://gohugo.io/content-management/taxonomies/) in Hugo let users define custom groupings of content. Each of the posts in the same series will have the same series name in the [front matter](https://gohugo.io/content-management/front-matter/) as shown:

```yaml {title="canary-in-kubernetes.md", hl_lines=[8]}
title: "Canary Release in Kubernetes With Apache APISIX Ingress"
date: 2022-10-21T08:41:04+05:30
draft: false
ShowToc: false
summary: "A hands-on, from-scratch tutorial on setting up canary releases in Kubernetes with Apache APISIX Ingress."
tags: ["ingress", "kubernetes", "apache apisix", "cloud-native"]
categories: ["API Gateway"]
series: ["Hands-On With Apache APISIX Ingress"]
cover:
    image: "/images/canary-in-kubernetes/roads-banner.jpeg"
    alt: "Aerial photo of city street and buildings in Kuala Lumpur."
    caption: "Photo by [Deva Darshan](https://www.pexels.com/photo/aerial-photo-of-city-street-and-buildings-1044329/)"
    relative: false
```

With this configuration and proper templates, Hugo will automatically generate a [page listing all series](/series/) and [individual pages](/series/hands-on-with-apache-apisix-ingress/) to list posts in each series.

## Updating the Template

Our goal is to mention the series the post is a part of and list other posts in the same series in order. To do this, we have to update the [single page template](https://gohugo.io/templates/single-page-templates/). Mine is at [layouts/\_default/single.html](https://github.com/navendu-pottekkat/navendu-pottekkat.github.io/blob/hugo/layouts/_default/single.html).

The logic for doing this is trivial:

1. Check if the post's front matter has a series listed.
2. Get the name of the series and link to the page that lists all articles in the series.
3. Add a line that says, "This article is a part of the series," and the series name.
4. Get the list of other posts in the series and create a sorted list with the title and URL of the posts.
5. If the post in the list is the current post, instead of linking it, highlight it so that a reader knows where they are.

We can add it to the single page template as shown:

```html {title="single.html"}
{{ if .Param "series" }}
 {{ $currentPage := .Page.Permalink }}
 {{ $name := index .Params.series 0 }}
 <p><i>This article is a part of the series "<a href='/series/{{$name | urlize }}'>{{$name}}</a>."</i></p>
 <p>Other articles in the series:</p>
 {{ $name := $name | urlize }}
   {{ $series := index .Site.Taxonomies.series $name }}
   <ul class="series">
   {{ range sort $series.Pages "Date" }}
     <li>
       {{ if ne $currentPage .Permalink }}
       <a href="{{.Permalink}}">{{.LinkTitle}}</a>
       {{ else }}<b>{{.LinkTitle}}</b>{{ end }}
     </li>
   {{end}}
   </ul>
{{end}}
```

You can find the entire template on [GitHub](https://github.com/navendu-pottekkat/navendu-pottekkat.github.io/blob/f5ff0d20c17616a8fe882effa8bf6138b591a26d/layouts/_default/single.html#L37).

## Improvements

The posts in the series are sorted by date in the list. This might not be ideal in cases where the posts in a series were not published in chronological order.

If you are implementing this feature, let me know how you have improved it, and I will try to improve my implementation as well. I will try to share more about how I am customizing and adding features to my Hugo site if you find these posts helpful.
