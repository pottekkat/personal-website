---
title: Free Your Agents
slug: free-your-agents
date: 2026-11-23T07:56:01Z
draft: false
toc:
  show: false
ShowRelatedContent: false
description: If you like your agents, set them free.
summary: Agents are good at coordinating now and will only get better. It is time to stop wiring them into rigid workflows.
tags:
  - ai
  - software engineering
categories:
  - AI
series: []
places: []
aliases: []
cover:
  image: /images/free-your-agents/murmuration-banner.jpeg
  alt: A large murmuration of starlings over a field at dusk.
  caption: Photo by [James Wainscoat](https://unsplash.com/@tumbao1949) on [Unsplash](https://unsplash.com/photos/b7MZ6iGIoSI).
  relative: false
fmContentType: Post (default)
---

We are having a moment. A year ago, the models and agents started getting better, and most of us met our first AI software engineer. What followed was the year of agents, where these models and harnesses got progressively and at times surprisingly better. We have now clearly reached the next big inflection point for agents: self-direction and coordination.

Even a couple of months ago, some of what’s mentioned here would be labeled AI psychosis, even by AI-pilled people like myself. While I wasn't writing code myself and relied heavily on agents, I still spent a lot of time directing the AI and saw these “look no hands!” people as conveniently deluding themselves. The labs, of course, were high on their own supply.

While it should have been obvious that the junkies were prophesying what’s to come, it is clear now that this would be the paradigm for the immediate future. The models are ridiculously good, and harnesses like Claude Code are getting better at harnessing their intelligence with every release. I have sessions that have been running for months where I dump all my ideas and have an army of agents working to bring them to fruition. In light of all this, how do we build better agentic systems?

Agentic workflows became reliable at the start of the year. But for the most part, we were building strict, tightly coupled workflows reminiscent of non-AI software workflows—loop for N turns, use these well-defined tool interfaces, outputs in this structure. As things got better, such systems pose some key disadvantages:

1. Models are much better at creative problem-solving and can use obscure APIs and chain them together instead of relying on watered-down tools. So using skills and writing custom code would result in a much better agentic system than being overly constrained.
2. Models have overtaken us at engineering and can optimize agentic systems themselves better than any software engineer or group of engineers. Having multiple levers to adjust, instead of just prompts and tool descriptions, improves the system to a higher degree autonomously and iteratively.

There are caveats where a rigid system might exactly be what you want. But for most tasks where we want to replace a human, we want the kind of flexibility a human would have. In practice, this means increasing the surface area of what your agents can do. For example, tool calls can be replaced by skills that call APIs through scripts, and instead of one agent, you can have an army of specialized subagents with one coordinator agent. Then, instead of you manually parsing through what your agents are doing, you set up telemetry and feed it back to Claude Code to improve the system autonomously.

I’m taking these ideas to the extreme and have started to build what I call “loose agents.” The high-level idea is to create a self-evolving system of agents that coordinate to achieve high-level goals I give them. I’m betting models and agent harnesses will get better over the next year, but such a system might be very niche, and not everyone would want one.

This is also how I think about superintelligence, that it is not a monolithic system owned and operated by one group of people to follow that group’s ideals. Instead, superintelligence would be all of our agents, representing our individual ideals and knowledge to form a faster, more efficient collective brain. This goes back to central planning vs. free markets, and we have, throughout modern history, shown that individual liberty and coordination are much better for humanity than a “benevolent” AI god.

We need to watch for avant-garde ways of using models and agents, and expect them to become the norm in the coming months. On a higher, moral level, we need to be skeptical of Anthropic and other self-proclaimed guardians of superintelligence and treat them no less than dictators.
