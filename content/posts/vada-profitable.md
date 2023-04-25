---
title: "Vada (Fritters) Profitable"
date: 2023-04-07T09:59:04+05:30
draft: false
ShowToc: true
TocOpen: true
summary: "This article is about a project I built and open sourced three years ago and our journey to make it uzhunnu vada (UV) profitable™."
tags: ["open-source", "nsfw filter", "finance"]
categories: ["Open Source"]
cover:
    image: "/images/vada-profitable/vada-banner.png"
    alt: "Uzhunnu vada being fried."
    caption: "You are missing out on life if you haven't had uzhunnu vadas."
    relative: false
---

_Uzhunnu vada/ഉഴുന്ന് വട_ is a popular South Indian snack (like fritters) made from black gram ([Vigna mungo](https://en.wikipedia.org/wiki/Vigna_mungo)).

An uzhunnu vada (UV) profitable™ business makes just enough money for the founder to pay for an evening tea and vada. It is technically profitable but unsustainable.

This article is about a project I built and open sourced three years ago called [NSFW Filter](https://github.com/nsfw-filter/nsfw-filter) and our journey to make it UV profitable.

## What's NSFW Filter?

Before examining UV profitability, let me give you some context on how I built NSFW Filter.

I was in-between jobs and had a lot of free time to hack things together back in 2020.

NSFW Filter was a weekend project I built during this time to learn how [TensorFlow.js](https://www.tensorflow.org/js) worked.

It was a simple browser extension that used a deep learning model to filter out NSFW images from web pages.

{{< figure src="/images/vada-profitable/nsfw-filter-demo.gif#center" title="NSFW Filter in action" caption="From [github.com/nsfw-filter/nsfw-filter](https://github.com/nsfw-filter/nsfw-filter)" link="/images/vada-profitable/nsfw-filter-demo.gif" target="_blank" class="align-center" >}}

The first release was hacky and had a lot of performance issues, but I published it to Chrome and Firefox extension stores. And surprisingly, people started using it.

Having people use something you built is always fun. I spent more effort improving and promoting the project, gaining a lot more users.

But more users meant more demand for new features and improvements to existing ones.

I also had a [contributor](https://github.com/nsfw-filter/nsfw-filter/graphs/contributors) join in to help with the project. He is a maintainer of the project now.

## Making Money

Soon, I was spending all my time working on the project, and it was starting to become unsustainable as I did not have a job or the time to look for a job.

I initially had the drive to work on the project, but it did not last, which meant creating a business (paid version with a better model and more features?) around the project was a bad idea.

The project being moderately successful ([front page of Hacker News](https://news.ycombinator.com/item?id=24251131) successful), also attracted a lot of offers to buy the project.

Being an open source absolutist, I rejected all these offers and set up sponsorships to cover the running costs ($5 for registration and $15/year for the domain) and for users to show interest in the project.

Even after almost three years and little development, two people still [sponsor the project](https://www.patreon.com/nsfwfilter) monthly on Patreon. And the project is UV profitable.

## Reaching UV Profitability

Over the past three years, 12 people have pledged to sponsor NSFW Filter. Six of them have actually done it.

{{< figure src="/images/vada-profitable/lifetime-amounts.png#center" title="Six people has sponsored $269.87 in total" caption="Data from [Patreon](https://www.patreon.com/nsfwfilter)" link="/images/vada-profitable/lifetime-amounts.png" target="_blank" class="align-center" >}}

Some patrons pledge a small sum monthly, while others make a substantial one-time pledge.

{{< figure src="/images/vada-profitable/monthly-share.png#center" title="Monthly earnings since October 2020 after platform fees" caption="Data from [Patreon](https://www.patreon.com/nsfwfilter)" link="/images/vada-profitable/monthly-share.png" target="_blank" class="align-center" >}}

The project has earned $269.87 to date after platform fees. It continues to earn $8.30 on average per month.

A better way to visualize this is in terms of uzhunnu vadas.

Assuming an uzhunnu vada costs ₹10 ($0.12), $269 could get you 2241 and a half uzhunnu vadas—or one uzhunnu vada per six users.

{{< figure src="/images/vada-profitable/vada-total.png#center" title="2250 uzhunnu vadas" caption="Made with NumPy and OpenCV" link="/images/vada-profitable/vada-total.png" target="_blank" class="align-center" >}}

At $7 ($8.30 - $1.30 for running costs) a month, I can get 58 uzhunnu vadas or 14 and a half uzhunnu vadas per week (one uzhunnu vada per 157 weekly users).

{{< figure src="/images/vada-profitable/vada-per-week.png#center" title="14 and a half uzhunnu vadas" caption="Made with NumPy and OpenCV" link="/images/vada-profitable/vada-per-week.png" target="_blank" class="align-center" >}}

If I start drinking tea again, it would cost me ₹20 ($0.24) for a vada and tea. So $7 monthly could get me at least seven vada + tea sets sorting me out all week.

{{< figure src="/images/vada-profitable/vada-and-chaya-month.png#center" title="Seven vada + tea sets for each day of the week" caption="Made with NumPy and OpenCV" link="/images/vada-profitable/vada-and-chaya-month.png" target="_blank" class="align-center" >}}

i.e., We have achieved UV profitability.

## What Does This Mean?

This doesn't mean anything. I was bored on the weekend and saw a pull request to the NSFW Filter repo that made me think of the project and write about it in the silliest way possible.

This also means something.

Thousands of open source projects with small user bases like NSFW Filter might never become a profitable business or have enough sponsorship for the maintainers to work on it full-time.

I'm fortunate to have a full-time job where I get paid to work on open source projects. I can live sustainably and don't have to rely on sponsorships for my personal open source projects.

But most open source maintainers don't make any money at all from their open source work.

This is where you and I can come in to [support open source projects and maintainers](https://github.com/sponsors/explore) as users of open source software.

Even if you can't support them financially, you can still make a difference by contributing to the project through code, docs, tests, feedback, bug reports, or countless other ways.

![Me eating a vada](/images/vada-profitable/vada-eating-tile.png)

My co-maintainer and I currently fund NSFW Filter. We haven't taken any money out of our Patreon account, and we plan to utilize this money to support open source projects/maintainers.

I also want to clarify that I'm not the man from a hypothetical South Indian-specific mathematics textbook who goes around buying all the uzhunnu vadas money can buy.
