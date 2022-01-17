---
title: "#4 My Blog Setup and Writing Process - Monday, 3rd January 2022"
layout: "daily-theme"
date: 2022-01-03T16:02:01+05:30
draft: false
summary: "I recently started writing on my own website. Here's a look into my setup and the process I follow to write posts."
tags: ["daily log"]
categories: ["Daily Dose of Pottekkat"]
ShowToc: true
TocOpen: true
---

Working on my blog (this website) has been one of the most _relaxing_ activities I have indulged in the past couple of months.

Every time I feel I need a change of pace, every time I'm bored or every time I want to take a break and I am sitting in front of my computer, I work on my blog.

I decided to write this post in such an occasion today. I was adding some new features (was working on showing "_Updated On_" in the post header) and I thought "_you know what would be good to document? My blog setup!_".

But before that,

## Why do I Write on My Own Website?

It is my website. It is my space on the internet. I control every aspect of how it should look, where it is hosted, who can read posts and I don't have to restrict myself to guidelines presented by publications.

I enjoy spending time customizing the look and feel of the website. _Give it another year and it will mirror my personality!_

Also I don't have to limit my website to just blog posts. You don't see people publishing their daily journals on Medium or DEV Community, do you?

## Go Hugo!

I use [Hugo](https://gohugo.io/) to build my static website.

I was exploring [Jekyll](https://jekyllrb.com/) (which I was already very familiar with from work), [Gatsby](https://www.gatsbyjs.com/) (great reviews, really customizable) and Hugo (simple and fast) and eventually decided to try out Hugo.

I really liked the [minimal themes](https://themes.gohugo.io/tags/minimal/) Hugo had and I wanted my blog to feel minimal as well (it has a lot of [useful features](https://github.com/navendu-pottekkat/navendu-pottekkat.github.io#new-features) under the hood).

I was pleasantly surprised by the build times, website performance and the features Hugo sets up out of the box.

I have since been recommending Hugo to people looking to build static sites.

## Powered by GitHub

The website is hosted completely on [GitHub Pages](https://pages.github.com/).

And yes, the site is [fully open source](https://github.com/navendu-pottekkat/navendu-pottekkat.github.io).

The write-build-publish process is pretty straightforward since everything is done on GitHub.

I write posts on my computer, commit and push to GitHub which triggers a [workflow](https://github.com/navendu-pottekkat/navendu-pottekkat.github.io/blob/hugo/.github/workflows/gh-pages.yml) that builds and publishes the site on GitHub pages.

I think I will continue hosting on GitHub as it is free and I'm only running a simple static site. I haven't had any issues till now and until something presents itself, it is GitHub all the way!

## Markdown on VSCode

I write in Visual Studio Code IDE using Markdown.

I also use [Hugo Shortcodes](https://gohugo.io/content-management/shortcodes/) to use complex HTML as templates. This is pretty neat and I frequently explore more shortcodes to fit my niche use cases.

The [Markdown All in One](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one) extension I use on VS Code is pretty neat and has more functions than I can remember to use.

I switch between a locally running, live build of the site and the IDE to see/read what I write.

This setup is pretty comfortable for me but may be difficult for a non-tech blogger.

## Site Setup

The site itself is organized in a straightforward way.

The [Homepage](/) starts with a short bio, links to socials, a subscription form and posts (all posts, no pagination) in a custom order I decided (best to least best, new posts go to the top).

Each post belong to one category and one category only (except the "Featured" category).

Posts can then be filtered by [Categories](/categories) and [Tags](/tags).

Each of the posts are searchable (by title, tags and content) and are shown chronologically in the [Archives](/archives) page.

Finally, there is an [About](/about) page with too much information and a [Subscribe](/subscribe) page.

I previously had a comments section below each post powered by [Utterances](https://utteranc.es/) which use GitHub issues.

I removed it because there wasn't really any conversation on the blog and the conversations it had were not constructive and it was just an eyesore.

I have found this to be the better path forward as people generally use Reddit, Twitter or platforms like Hacker News to provide feedback on blog posts.

The actual code of the site is [MIT licensed](https://github.com/navendu-pottekkat/navendu-pottekkat.github.io/blob/hugo/LICENSE) and all content on the site is licensed under [Creative Commons Attribution-ShareAlike license](https://creativecommons.org/licenses/by-sa/4.0/).

## Monthly Digest and Newsletter

When you [subscribe](/subscribe) to my blog, you will be part of a mailing list where I will try to share monthly digests, updates on new posts and newsletters on my learnings.

This is something I setup very recently and I haven't had the time to figure out what this will be or develop a routine to publish something to the mailing list.

I use [Mailchimp](https://mailchimp.com/) to manage my subscribers and to send out emails. It is pretty cheap and does the job for me.

## Analytics

I use [Google Analytics](https://marketingplatform.google.com/about/analytics/) to see how my posts are performing and where the traffic comes from.

Nothing fancy here. This is just for me.

## Being Creative On My Site

I get a lot of ideas on things I can add on my site. And I write it down as soon as I can.

I use Notion to track implementing these features I think would be cool. It is basically a page with checklists representing features.

If it works, it works.

{{< figure src="/images/3-1-22-my-blog-setup-and-writing-process/Screenshot from Notion.png#center" title="It is just a check list?" caption="It always was" link="/images/3-1-22-my-blog-setup-and-writing-process/Screenshot from Notion.png" target="_blank" class="align-center" >}}

The site will always remain a work in progress. It will change as times change, as I change.

## What to Write?

I try to write about things I have experienced or things I have learned from my experiences.

I write mostly about working in open source. Specifically how people can contribute to open source.

This brings in a niche but big audience to my blog. Most of my subscribers are here because of these content.

As soon as I get an idea (which strikes at very random times), I write it down in Notion. I try to include every thought I had on that topic in the page to review and work on later.

## The Process

At any point in time, I will have a backlog of ideas to write about.

You never know when inspiration strikes and I'm always ready with a topic to write when it hits.

I use Notion to draft the post. I write in markdown so that I can easily copy paste to VS Code.

I stray away from this process sometimes. Like now.

I am writing this straight on the VS Code editor. The people around me think I'm pumping out code.

## Publish and Then What?

I do quick reviews and edits and publish (commit to the website). I quickly go through the updated site to see if everything is as expected and then jump to social media to talk about it.

I primarily use Twitter and Reddit to share the link to my posts.

Both these platforms generate good audiences. I hang out in the comments for a while before I shutdown for the day.

I also try to cross post on [DEV.to](https://dev.to/) to reach more people.

I always provide a [canonical URL](https://developers.google.com/search/docs/advanced/crawling/consolidate-duplicate-urls#:~:text=Canonical%20URL%3A%20A%20canonical%20URL,Google%20chooses%20one%20as%20canonical.) back to my blog so that the SEO isn't affected.

I am trying to make my posts evergreen by constantly coming back to them to update. _Not sure how this would scale as the blog gets bigger though_.

_I will publish a new post walking through updates to my setup if there are any in the future._
