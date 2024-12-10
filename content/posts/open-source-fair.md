---
title: Will Open Source Be Fair?
slug: open-source-fair
date: 2024-12-10T12:07:05+05:30
draft: false
toc:
  show: false
ShowRelatedContent: false
summary: Exploring new open source licenses that attempt to balance benefits and make open source sustainable.
tags:
  - open source
  - community
categories:
  - Open Source
cover:
  image: /images/open-source-fair/scale-banner.jpg
  alt: A scale with a black and a white chess piece.
  caption: As most things, it isn't black and white.
  relative: true
fmContentType: Post (default)
---

Just as we cemented open source as the default way to build software, companies seem to be frantically rug-pulling back to the comforts of their closed source ways.

We witnessed popular projects like Redis [abandoning](https://redis.io/blog/redis-adopts-dual-source-available-licensing/) their traditional open source licenses in favor of restrictive ones, leaving entire communities of users high, dry, and understandably frustrated.

Productive discussions to address such issues around open source governance and sustainability were hijacked by the likes of Matt Mullenweg, who [threw temper tantrums](https://openpath.quest/2024/a-tale-of-two-leaders/) when his competitors leveraged (rightfully) the benefits of an open source WordPress.

But despite the challenges, [more companies are choosing open source licenses](https://www.openlogic.com/resources/state-of-open-source-report) for their projects, building thriving businesses, and fostering engaged communities.

_What’s going on?!_

## 1

The ubiquitousness of open source presents a rather novel situation where different people/companies expect different outcomes from open source.

When I started pursuing programming as a career, I published all my "learning projects" to [GitHub](https://github.com/pottekkat), hoping to add them to my resume to flaunt my skills to recruiters (I blame ex-FAANG YouTube gurus). I had zero expectations from open-sourcing these projects apart from being public repositories to showcase my work (to be fair, most projects did not have any utility beyond).

In time, I became a better programmer who built better projects. These projects were, again, open source for similar personal reasons. [One of these projects](https://github.com/nsfw-filter/nsfw-filter) became moderately popular, with 1700 stars on GitHub, a top spot on the trending page, the [front page of Hacker News](https://news.ycombinator.com/item?id=24251131), a [feature on Product Hunt](https://www.producthunt.com/posts/nsfw-filter), and 40,000 users. It became popular because it was free for users (as in "free beer" this time) and open source for [skilled contributors](https://github.com/nsfw-filter/nsfw-filter#contribute) to make it better.

Again, I had no non-personal expectations. The "Personal Projects" section in my resume got a lot better and landed me a sweet job. _Nice_. My users also had fewer expectations—being a free and open source project—and some even turned into contributors, fixing their own problems at first, which then benefitted others. _Nice_.

DHH calls this the "[open source gift exchange](https://world.hey.com/dhh/the-open-source-gift-exchange-2171e0f0)," where you give out your project as a gift to your users, whose only real choice is to accept or reject your gift.

{{< blockquote author="David Heinemeier Hansson" link="https://world.hey.com/dhh/the-open-source-gift-exchange-2171e0f0" title="The open source gift exchange" >}}
That's why the gift metaphor is so helpful to settle expectations on both ends on the exchange. If you're a recipient of a gift, one offered with no strings attached, you're not entitled to much beyond the freedom of choice of whether to accept it or not. And if you're the giver of a gift, you'd be foolish to expect specific reciprocity in return.
{{< /blockquote >}}

_Clear expectations_, more importantly, _balanced_ expectations.

The benefits of open source—better adoption, stronger community, superior product—aren't lost on businesses. This has, _counterintuitively_, encouraged many companies to invest time, effort, and money in open source projects that benefit not only them but their competition.

[Kubernetes](https://kubernetes.io/) and, by extension, the [Cloud Native Computing Foundation (CNCF)](https://www.cncf.io/) is an excellent example of this in practice. Everyone benefits from Kubernetes being open source. Large companies like Google, Microsoft, and Amazon, which pour money, derive benefits from products and services built on top of Kubernetes. They get customers as Kubernetes is widely adopted.

Everyone benefits; more importantly, everyone is _incentivized_ to make the open source project better.

In my previous job at [API7.ai](https://api7.ai), we sold enterprise offerings on top of [Apache APISIX](https://apisix.apache.org). APISIX is open source under the [Apache Software Foundation (ASF)](https://apache.org). People can freely use/modify APISIX; many do in production, and API7.ai only aims to capture a small subset of users who want enterprise features and support.

It's a win-win-win for APISIX's open source users, API7.ai's commercial users, and API7.ai, the creators and maintainers of APISIX. Open source users freely use, modify, and contribute to/advocate for APISIX, commercial users get the added features and support, and maintainers can sustain the open source project and get paid thanks to the company's commercial ventures. _Win-win-win_.

All these examples follow the "happy path," where your expectations are clear and meet the reality of the situation. Problems arise when you have _unclear_ expectations—the ones that don't meet reality.

The most apparent case of this "unhappy path," one of unclear, unmet expectations, is when the big tech cloud providers leverage their monopoly to commercialize an open source project, leaving the original creators in the dust, unable to reap the rewards of their open source ways.

Such actions provoked Redis' infamous "bait-and-switch," which the community, unsurprisingly, received poorly. Big tech emerged as the good guys and announced an open source fork, which is going on all cylinders with support from the Linux Foundation.

_Look how the turntables_.

License changes are only a symptom of a bigger problem rooted in open source sustainability. Dries Buytaert, the creator of Drupal, sums it up really well:

{{< blockquote author="Dries Buytaert" link="https://dri.es/balancing-makers-and-takers-to-scale-and-sustain-open-source" title="Balancing Makers and Takers to scale and sustain Open Source" >}}
Takers [likes of Google and Amazon] harm Open Source projects. An aggressive Taker can induce Makers [like Redis Labs] to behave in a more selfish manner and reduce or stop their contributions to Open Source altogether. Takers can turn Makers into Takers.
{{< /blockquote >}}

Unmet expectations result from _imbalances_; takers take more, makers make less. Elastic was on the same boat as Redis and ended up on the same shore. Amazon's fork didn't really help them either.

This goes to show that the "bait and switch" model, even with the best intentions, doesn't help the maker when they are up against the resources of big tech and open source foundations. However, these seemingly _unfair_ actions are within the permissions of the open source licenses. So why would any company choose an open source license in the first place?

_Because they have unclear and unbalanced expectations_. They expect to reap the benefits of open source without the inherent risk of competition. They expect to gain adoption, community, and contribution and eat their cake too.

_Also unfair_.

## 2

The problems around sustainability aren't exclusive to open source but are fundamental to how we treat similar common goods: we do what we are incentivized to do.

This simple idea explains why companies _exploit_ open source. They are incentivized by their shareholders to derive as much value from "free as in free beer" open source. In addition, they aren't incentivized to give back to the open source project or the community.

Because these problems also exist outside open source, we can look at known solutions and apply them to open source. One of the most impactful works around managing common goods is by [Elinor Ostrom](https://en.wikipedia.org/wiki/Elinor_Ostrom). Ostorm's idea, which translates well into open source governance, is that the incentive to cooperate can be created through privatization, centralization, or self-governance.

We see attempts at privatization already in license changes, where companies try to reward themselves, the makers of the open source project, with exclusive benefits. Open source foundations like the Apache Software Foundation and the Linux Foundation are good examples of centralization, similar to how governments usually manage common goods.

A [recent survey](https://opensource.org/delayed-open-source-publication) from the Open Source Initiative (OSI) shows that business source licenses, like the one adopted and pioneered by [MariaDB](https://mariadb.org), are fast growing. Recently, a consortium of companies that are using and advocating for similar licenses was formed called [Fair Source](https://fair.io). The key ideas behind [these licenses](https://fair.io/licenses/) are non-compete terms of usage and delayed publication.

Such a model is better than closed source for consumers, where they are often left in the dry when [companies kill software](https://killedbygoogle.com) they have invested a lot in, and better than open source for companies who would otherwise have to compete with the monopolistic power of the big tech, ready to capitalize on their open source innovations.

_Vendor lock-in can happen in open source projects as well. I have worked on at least three projects that tried to prevent this. Think XKCD's famous standards comic. We will sweep this under the rug for now._

With Fair Source/similar non-compete licenses, companies can clarify their intentions and expectations upfront. This benefits them through exclusive permissions to monetize their projects through complementary paid tools, services, cloud hosting, or other products/services.

Users are free to use the open source code, provided they don't compete with the maker's commercial offerings. It's a win-win as the company can exclusively make money from its commercial customers, which funds the development of the open source project. Non-commercial users can use the open source version with every benefit that comes from open source.

This model is also called the [single-vendor commercial open source business model](https://dirkriehle.com/publications/2009-selected/the-commercial-open-source-business-model/).

Still, the fact remains that with open source, or open-source-adjacent fair source, there will be free riders. There will be people and companies who just take without giving. The difference with Fair Source is that they won't affect the sustainability of the project.

While in the above paragraphs, I have certainly been supportive of trading off certain freedoms in favor of sustainability, my initial impressions of such licenses were different. I had thought that the benefits offered by these licenses were unidirectional, favoring only the makers as they reap the rewards of open source adoption and community while the community receives disproportionately fewer benefits.

But as I read more about the "why" behind such licenses, I realized that they add balance to the benefits. The bottom line is that while open source may not be fair, open source-ish alternatives like fair source might indeed be fair. We must adopt what works and prioritize sustainability over open source absolutism.

## 3

Like all economics or policy problems, it serves us better to think at the margin than in absolutes. I haven't lost the irony of writing this on a blog named "The Open Source Aboslutist," but there must be sacrifices. And often, absolute solutions like open source or nothing can leave us worse off, as seen with the bait-and-switch shenanigans.

Fair Source is a marginally better solution. It sets clear expectations that it is meant to replace closed source, not open source. It is to give certain exclusive freedoms to the makers of open source to ensure sustainability, drawing parallels from what we know about managing the commons.

Complaining about marginally better solutions not being open source doesn't help anyone when the alternative is underpaid maintainers and unsustainable projects. For a sustainable open source future, companies should come clean and be transparent about why their project is open source, and open source communities should keep an open mind and accommodate such companies trying to build sustainable open-source projects.

Finally, I believe it is okay for the code to be closed source. All code need not be open source. Absolutists have bigger fish to fry, such as [ending software patents](https://endsoftwarepatents.in). For projects like Kubernetes, open source is the only way to do it; for operating systems, we have seen both open and closed source projects succeed in their own right. It is better to be clear about your use of open source and what you expect from it.

We are still very early in figuring out what works and what doesn't for open source. The important thing is to keep experimenting with marginally better solutions to our current and future problems.

Open source is critical. It is the way forward for better, accessible, and inclusive technology. Setting up the space for success and sustenance is essential and should be stewarded by the open source community.
