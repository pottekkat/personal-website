---
title: Notes on Recursive Language Models
slug: recursive-language-models
date: 2025-11-23T18:27:40+05:30
draft: false
toc:
  show: false
ShowRelatedContent: false
description: My takeaways from the Recursive Language Models (RLMs) paper/blog post by Alex Zhang and Omar Khattab.
summary: RLMs are a novel way to keep the context of the main agent loop small, eliminating context rot for long-context tasks while reducing costs.
tags:
  - ai
  - notes
  - research
categories:
  - AI
series: []
aliases: []
cover:
  image: /images/notes-on-recursive-language-models/resursive-banner.jpg
  alt: Visualization of a Mandelbrot set.
  caption: The idea of a REPL environment for the LLM to interact with is pretty neat, even though it isn't the paper's central premise.
  relative: false
fmContentType: Post (default)
---

Context engineering feels trivial most of the time, but can quickly become the bottleneck when building multi-step agentic workflows.

The premise is simple: you only have a finite number of tokens that fit an LLM's context window. For multi-step workflows, you have to decide which tokens get to live there at each step.

The naive approach is to shove everything into context and hope the LLM figures it out. But you hit the token ceiling quite quickly, and it becomes expensive, since most LLM pricing scales with input/output tokens (_Hey Navendu, why did we spend $500 in three hours yesterday on OpenRouter?_).

There's also "context rot," the idea that LLMs start to perform worse as their context grows. Anyone who has had a long chat with ChatGPT or a long coding session with Claude Code would know this from experience.

{{< blockquote author="Anthropic" link="https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents" title="Effective context engineering for AI agents" >}}
As the number of tokens in the context window increases, the model's ability to accurately recall information from that context decreases.
{{< /blockquote >}}

[Recursive Language Models (RLMs)](https://alexzhang13.github.io/blog/2025/rlm/) offer a way around this. At a high level, RLMs break the problem into subproblems, call itself on each subproblem with only the relevant subset of available information, and then composes the answer back together. Every recursive call gets its own clean, minimal context. The root agent context remains minimal, with only the responsibility of orchestration.

In practice, using a REPL environment, this lets the model programmatically navigate the larger context rather than swallowing it whole.

I've been exploring similar ideas (primarily to reduce costs) in which the root agent can only spawn subagents through a tool call. The subagents do all the actual work and provide a summary to the root agent, which is what gets added to the context rather than the complete analysis. These experiments produced excellent results in both quality and cost.

The REPL pattern is useful in places where you would otherwise construct the context/prompt programmatically from structured data. For example, instead of looping through records in a table to convert them into Markdown-formatted text, the LLM can directly write the Python code to inspect exactly what it wants without the intermediate step of adding all records into context.

While the paper makes it clear that REPL is just their environment of choice, it is indeed a good choice. Being able to programmatically interact with the context can be a natural solution for common agentic problems.
