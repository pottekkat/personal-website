---
title: "On Open Source Communities"
date: 2022-12-30T06:40:54+05:30
draft: false
weight: 7
ShowToc: false
summary: "A note on the role of communities in open source."
tags: ["open-source", "community", "notes"]
categories: ["Open Source"]
cover:
    image: "/images/open-source-communities/protest-banner.jpeg"
    alt: "A photo of a crowd protesting."
    caption: "Photo by [Amine M'siouri](https://www.pexels.com/photo/crowd-of-people-black-and-white-photo-2246258/)"
    relative: false
---

> I don't know if I would classify this as an article. This is a note an open source maintainer made about open source communities. In the future, I might turn this into a complete article.

The pandemic brought a cultural shift in our work environments, making it similar to the distributed collaboration practices in open source.

Open source software has a history of becoming self-governing, forming communities of passionate developers who manage to build and sustain the project effectively.

However, as open source becomes a popular way to build software, we realize that these communities don't form themselves.

Gorilla Web Toolkit, a popular Go-based library for building HTTP web applications, went into [archive mode three weeks ago](https://github.com/gorilla).

The project checked all the boxes that made an open source project successful. It had a large user base[^1] (two of their most popular projects, mux and websocket, has 18,000 stars each on GitHub), stood the test of time, and had 100+ contributors.

I'm pretty sure that top tech companies are using the Gorilla libraries. But even after four years of [announcing that he was stepping down from the maintainer](https://github.com/gorilla/websocket/issues/370#issue-310347198), Gary Burd couldn't find someone else to hand over the keys. No corporate companies using Gorilla stepped up to take over the project.

This is a story as old as open source itself. Big corporations reap the rewards of free and open source software and give back nothing in return.

But was this inevitable? No. Does this mean that open source projects aren't sustainable no matter how successful they are? Certainly not[^2].

Articles like "[Open Source is Broken](https://xeiaso.net/blog/open-source-broken-2021-12-11)" talk about the importance of supporting open source maintainers financially to help sustain projects. But today, I want to talk about this from the perspective of an open source project/maintainer. Specifically, I want to talk about open source communities that revolve around open source projects.

Open source projects are a by-product of its community. And as I mentioned, these communities don't form themselves as soon as you open source your project.

Project maintainers need to take the initiatives to build a community. At first, the community will likely be a handful of people and would take a lot of effort to run. But as time passes and the community gets bigger, it becomes self-sustainable.

A big, thriving community can mean a lot more users, contributors, and ideas for the project. More users mean more people to support the project financially, more contributors mean faster bug fixing and feature updates, and more ideas mean a better overall project.

A community can also ensure balance in an open source project. If a project has a large user base but only has a single maintainer, it is wildly unsustainable[^3]. In such scenarios, building a community can ensure that more people are working on the project to meet the enormous demand.

Building communities can start with something simple, like creating a platform for the community members to interact. Instead of the maintainers communicating one way with code, a common platform for the community to interact can make a significant impact.

Depending on what happens after that, project maintainers can choose to grease the wheels of the community, encouraging more people to participate actively than "lurking."

When it comes to sustenance, open source projects and maintainers have to take measures to build their community and not depend entirely on the goodwill of their users to support the project on their own. A community lacking participation, goals, or consensus can bring down an open source project more quickly than no community.

More and more projects and companies are realizing the benefits of communities[^4]. Many more open source projects are actively funded today while being entirely community-driven.

Encouraging open source projects to focus on the community can help avoid open source abandonware in the future. Open source foundations and maintainers should advocate fellow maintainers to follow suit and support their projects to grow sustainably.

[^1]: GitHub shows [94,629 repositories and 31,501 packages](https://github.com/gorilla/mux/network/dependents) that depend on gorilla/mux.

[^2]: There might be a lot of factors that led to the Gorilla project going into archive mode, and I mentioned it to give an example of the problem at hand. I'm sure that the project maintainers had to archive the project. I also have a project in archive mode because I can no longer spend time actively maintaining it, and nobody stepped up to take the project from my co-maintainer and me.

[^3]: The xkcd comic, [Dependency](https://xkcd.com/2347/), sums this up pretty well. 

[^4]: [This article](https://orbit.love/blog/software-is-no-longer-sold-its-adopted) by Orbit CEO Patrick Woods explains this changing trend clearly and why it is the future.
