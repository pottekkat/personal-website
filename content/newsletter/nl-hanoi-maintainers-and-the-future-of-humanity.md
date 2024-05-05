---
title: "Hanoi, Maintainers, and the Future of Humanity"
layout: "newsletter-theme"
date: 2024-04-08T17:43:07+07:00
draft: false
ShowToc: true
TocOpen: true
summary: "Greetings from Hanoi!"
tags: ["newsletter"]
categories: ["Newsletter"]
---

Hello from Hanoi!

I'm here this week for the [FOSSASIA Summit 2024](https://eventyay.com/e/55d2a466/session/8878). It is one of my favorite conferences of the year, and I have a lot of fun. Over the weekend, I caught up with my friends over some small sightseeing and big bowls of pho.

Coincidentally, I learned the other day that Vietnam and other Southeast and East Asian countries have a very non-confrontational work culture and, to compensate, have a very vibrant after-work drinking culture. I guess the alcohol makes it easy to have those tough conversations!

Anyway, the conference is hosting a hangout at a local watering hole, and you know I'm all about embracing different cultures!

## What's Happening?

Last time, we discussed Redis switching its license and [anticipated](https://lwn.net/SubscriberLink/966631/6bf2063136effa1e/) a new fork.

Well, _the_ [fork](https://www.linuxfoundation.org/press/linux-foundation-launches-open-source-valkey-community) is here and backed by the Linux Foundation. I had the opportunity to briefly talk to someone involved in the fork from AWS, but I have to talk more to understand its cause and implications.

But the most important news in open source is the social engineering attack on XZ Utils which was quickly exposed by a Microsoft engineer.

The gist of it is that the sole maintainer of [XZ Utils](https://en.wikipedia.org/wiki/XZ_Utils), a widely used compression tool, was guilted into handing over the project's maintenance to someone who turned out to have malicious intent, resulting in the latter attempting to introduce a backdoor into the project.

There are [other articles](https://robmensching.com/blog/posts/2024/03/30/a-microcosm-of-the-interactions-in-open-source-projects/) that dive more into the technical specifics of the attack, but primarily, it was a social engineering attack that went back [more than three years](https://twitter.com/fr0gger_/status/1774342248437813525).

This isn't a one-off incident. It was just an incident that was uncovered and hints at a wider problem of open source sustainability.

Funding open source maintainers and projects is the solution. There shouldn't be any question about it. However, looking at the discourse on Twitter following the incident, we have reasons to believe that this might not be so obvious to everyone.

## Curated Links

I might have missed a few links this week with all the travels but I assure what I have for you is top notch:

- **[Thoughts on the Future of Software Development](https://www.sheshbabu.com/posts/thoughts-on-the-future-of-software-development/)**: This is probably the best take on AI replacing jobs. Instead of relying on intuition, establishing and using proper frameworks to analyze the impact of AI would be more beneficial.
- **[Why is this number everywhere?](https://www.youtube.com/watch?v=d6iQrh2TK98)**: I'm not going to spoil which number but you will probably be correct if you choose a random number between 10 and 100.
- **[GenZ Software Engineers, according to older colleagues](https://newsletter.pragmaticengineer.com/p/genz)**: Data from a survey on GenZ software engineers from the eyes of our Millenial and GenX colleagues. Most of it is positive. That's wack!
- **[Delivering on the promise of autonomous logistics](https://www.pipedreamlabs.co/)**: Pipedream is doing some sci-fi-level stuff with what most would think is a pipe dream.
- **[The Future of Humanity\'s Energy No One Knows About](https://www.youtube.com/watch?v=NngCHTImH1g)**: There are a lot of novel ways to reduce our reliance on fossil fuels in ways that are more sustainable and better for the planet. This could very well be our future.
- **[Why do programmers need private offices with doors?](https://www.blobstreaming.org/why-do-programmers-need-private-offices-with-doors/)**: Closed doors and personal space are better for programming or other knowledge work. This is perhaps why I'm unlikely to go back to an office again.
- **[Lessons from Jeff Bezos](https://twitter.com/thegarrettscott/status/1771645169151901952/)**: You should probably find something valuable by listening to Jeff Bezos. Always add some salt to whatever advice you take.
- **[101 things I would tell my self from 10 years ago](https://www.approachwithalacrity.com/101-things-for-my-past-self/)**: Useful random advice.

## Hot off the Press

I wrote two new articles this week.

The first is about Pingora, a Rust library for building network interfaces. Cloudflare originally built it to replace Nginx, but there are other Nginx alternatives that might be better suited for many, if not most, users.

**Read here**: "[Pingora is not an Nginx Replacement](https://navendu.me/posts/pingora/)"

I also wrote a mini essay on AI regulation, focusing on the upcoming elections worldwide and the unquestioned impact AI will have on them. Also, mini essays are a thing now.

**Read here**: "[An Even Playing Field](https://navendu.me/posts/even-playing-field/)"
