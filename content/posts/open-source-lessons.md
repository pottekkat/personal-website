---
title: "Lessons Learned From Three Years of Open Source Contributions"
date: 2022-10-07T09:28:21+05:30
draft: false
weight: 12
ShowToc: false
summary: "Insights from my three year journey as an open source contributor."
tags: ["open-source"]
categories: ["Open Source"]
cover:
    image: "/images/open-source-lessons/banner-book-of-kells.jpeg"
    alt: "A photo of the Book of Kells library from Trinity College Dublin."
    caption: "Photo by [Andrea Barsali](https://www.pexels.com/photo/wooden-book-shelves-inside-library-of-trinity-college-in-dublin-12030035/)"
    relative: false
---

I have been contributing to open source projects for the past three years. During this time, I have built, scaled, and maintained my own projects and projects in foundations, including CNCF and the ASF. This is my story and the lessons I learned along the way.

## First Contributions

My first open source contributions were along the lines of "push everything you build to GitHub". I was naive and thought pushing the toy projects I built to learn could help me build my resume.

These did help my resume at the time, but they were far from valuable open source contributions.

After some time, I was a good enough developer to bring my ideas to fruition. I built a browser extension called [NSFW Filter](https://github.com/nsfw-filter/nsfw-filter), which used deep learning to filter out NSFW content from the web.

It was a simple idea, but there wasn't anything similar in the market. The project became popular and featured on [Product Hunt](https://www.producthunt.com/products/nsfw-filter) and [Hacker News](https://news.ycombinator.com/item?id=24251131), bringing in many users and contributors to the project.

{{< figure src="/images/open-source-lessons/product-hunt.png#center" title="Featured on Product Hunt" caption="I literally googled \"how to market open source project\" and found these platforms" link="/images/open-source-lessons/product-hunt.png" target="_blank" class="align-center" >}}

{{< figure src="/images/open-source-lessons/hacker-news.png#center" title="Front page of Hacker News" caption="Back then I did not know how cool it was to be on the front page of HN" link="/images/open-source-lessons/hacker-news.png" target="_blank" class="align-center" >}}

### Solve Your Problems, Delegate

Solve the problem you are facing and make it open source. Chances are more people face your exact problem and will be your users.

Even if your project is entirely free and open source, you need to market it to get users. You don't need a marketing team or money to find channels and promote your project. And if your project is valuable, it will market itself after some time.

Once your project is big, it might put a toll on you to maintain it yourself. This is when you have to start delegating and get more people to help you.

It might be weird at first to give someone else push access to your project, but it is the only way to scale the project and contributions to the project.

{{< figure src="/images/open-source-lessons/contributors.png#center" title="Contributors to NSFW Filter" caption="These people are the best" link="/images/open-source-lessons/contributors.png" target="_blank" class="align-center" >}}

## Mentoring

Unlike many other things, being an open source contributor did not seem to have any roadmaps. So, when it came to contributing to other open source projects, I was confused. Which project do I contribute to? Where do I start? What if I'm not skilled enough?

As I sat there puzzled by these questions, I stumbled across the [Linux Foundation Mentorship Program](https://lfx.linuxfoundation.org/tools/mentorship/).

The LFX Mentorship Program provides opportunities for mentees to work on open source projects. Experienced project contributors and maintainers will be the program's mentors. Mentees will also receive a stipend during their term in the program.

{{< figure src="/images/open-source-lessons/lfx-homepage.png#center" title="LFX Mentorship Program homepage" caption="Finding about this program was life changing" link="/images/open-source-lessons/lfx-homepage.png" target="_blank" class="align-center" >}}

I found a lot of open source projects that wanted contributors. It showed the skills they were looking for and what kind of project it will be. The program gave me insight into open source projects and communities. I applied to the program, and after a couple of months of contributing to a project, I was selected as a mentee.

I can [speak a lot about how LFX helped me](/posts/how-the-lfx-mentorship-program-helped-me-level-up-my-career/), but to sum it up, the program set me on the path to working in open source.

{{< figure src="/images/open-source-lessons/mentee-profile.png#center" title="My LFX mentee profile" caption="I applied to three projects but did not try to work on the other two. Here’s my [profile](https://mentorship.lfx.linuxfoundation.org/mentee/bc364b11-a4ab-4b18-b81e-e071bbcfb40c)" link="/images/open-source-lessons/mentee-profile.png" target="_blank" class="align-center" >}}

### Start Small, Find Mentors

You can always prepare before you start contributing to open source (or doing anything in general). You can skill up, read all the right books, and watch all the right tutorials.

But the only way to progress is to start.

You can start small, but you have to start somewhere. In open source contributions, you can start by being a project user and raising issues as you find them. You can hang out in community meetings and provide feedback to the project contributors. You can sign up for alpha or beta programs and help remove bugs. All of these are low-hanging fruits ready to be plucked.

It can also be daunting to publish your code for the whole world to see. And yes, you will write a lot of bad code when you start. But contributing to open source ensures that your code is reviewed and improved each time.

To help navigate the open source waters, you can find mentors. Open source mentorship programs like LFX are a great way to find mentors if you are a student or a new developer.

From my experience as a maintainer and a mentor, newcomers often find bugs that seasoned contributors often miss. Sometimes we are too close to the project to see the mistakes. So, new contributors are always welcome!

## Maintainer! Maintainer! Maintainer!

At one point, I spent all my time on open source projects. I contributed code, helped design new features, and managed contributors. It did not take long for my fellow maintainers to nominate me formally to their team.

{{< figure src="/images/open-source-lessons/contributing-graph.png#center" title="Open source contributions" caption="I don't see a clear distinction of the time when I switched to writing less code and being more of a maintainer though" link="/images/open-source-lessons/contributing-graph.png" target="_blank" class="align-center" >}}

As a maintainer, I spent less time writing code and more time in system design, making decisions, and managing contributors. I still looked at code, but it was mostly during reviews.

### Contributions Don't Have to be Code

A lot of open source does not involve code. These [non-code contributions](/posts/non-code-contributions-to-open-source/) can involve writing documentation, creating tutorials, giving talks about the project at conferences, designing content, organizing events and meetings, managing the community, and more. The list is endless.

Open source is the default way to build software now. And non-code contributions help create, manage, and sustain these projects.

### Being a Maintainer is Hard

Being an open source maintainer is a job that never ends. It isn't easy to separate from your work when it is public and a part of you.

I spent a lot of time working insane hours because the work wouldn't stop. This took a toll on my health and personal life, and I made an effort to set boundaries.

It is okay to take breaks, and it is important to take breaks.

### Community Over Code

Open source projects are a byproduct of its community.

Building and sustaining communities are essential as they lead to better projects.

So, welcome new community members, and lower the barrier to entry. Take active measures to build and maintain the community.

## Full-time Open Source

Today I work in open source full-time. I contribute to Apache APISIX and lead initiatives to grow the project and community. If I had a dream job, this would be it. I know because I used to do this job for free before someone decided to pay me for it.

People helped me when I wrote bad code, when I asked stupid questions, and when I was a beginner. Today, I pay it forward by being a mentor in open source mentorship programs.

{{< figure src="/images/open-source-lessons/mentor-profile.png#center" title="My LFX mentor profile" caption="You can see the transition on [my profile](https://mentorship.lfx.linuxfoundation.org/mentor/bc364b11-a4ab-4b18-b81e-e071bbcfb40c)" link="/images/open-source-lessons/mentor-profile.png" target="_blank" class="align-center" >}}

### Contributing is Rewarding

It is rewarding, and it's more than the money.

Being an open source contributor makes you part of something bigger than yourself or your company. And your contributions can have a significant impact on the world around you.

{{< figure src="/images/open-source-lessons/speaking-at-oss-dublin.jpeg#center" title="Speaking at Open Source Summit Europe" caption="Talking about how open source has helped me in my career" link="/images/open-source-lessons/speaking-at-oss-dublin.jpeg" target="_blank" class="align-center" >}}

So if you are thinking of contributing to open source, do it. If you know an underfunded open source project that you rely on, sponsor it. If you see an open source alternative, promote it.
