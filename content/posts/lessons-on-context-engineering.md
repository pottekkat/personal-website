---
title: Lessons on Context Engineering
slug: lessons-context-engineering
date: 2025-08-09T19:20:28+05:30
draft: false
toc:
  show: false
ShowRelatedContent: false
description: 'Notes from "Context Engineering for AI Agents: Lessons from Building Manus."'
summary: Practical guidelines on context engineering, like having an append-only context, using response prefill to remove/force tools, setting up restorable compression strategies, and more.
tags:
  - ai
  - notes
  - tips
categories:
  - AI
series: []
aliases: []
cover:
  image: /images/lessons-on-context-engineering/jenga-banner.jpg
  alt: Jenga blocks crashed.
  caption: '"Make your context append-only."'
  relative: false
fmContentType: Post (default)
---

These are my notes from "[Context Engineering for AI Agents: Lessons from Building Manus](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)."

> If I had to choose just one metric, I'd argue that the KV-cache hit rate is the single most important metric for a production-stage AI agent. It directly affects both latency and cost.

The article mentions a few techniques to make this happen:

1. **Keep the prompt prefix stable** by not adding things that are dynamic, like timestamps. Even a single token difference would invalidate the cache.
2. **Make your context append-only** by not modifying previous actions or observations. An important note is that JSON serialization in most programming languages is not deterministic, as the key ordering might change. This can break the cache.
3. **Don't change the tool list dynamically** because they most likely live at the start of the context. Any changes to the tool list will invalidate the cache. Instead, use response prefilling, like `<|im_start|>assistant<tool_call>{"name": “browser_`, to explicitly add/remove/force tools.

> Our compression strategies are always designed to be restorable. For instance, the content of a web page can be dropped from the context as long as the URL is preserved, and a document's contents can be omitted if its path remains available in the sandbox. This allows Manus to shrink context length without permanently losing information.

Observations are huge when interacting with unstructured data, like websites and PDFs, which increases the context length, hurting model performance and making model calls expensive, even with caching.

The Manus team uses "restorable compression strategies," which, for example, **drops the content of a web page from the context while preserving the URL**. Now the context remains small, and the information can always be retrieved if needed without wasting context.

> A typical task in Manus requires around 50 tool calls on average. That's a long loop—and since Manus relies on LLMs for decision-making, it's vulnerable to drifting off-topic or forgetting earlier goals, especially in long contexts or complicated tasks.
>
> By constantly rewriting the todo list, Manus is reciting its objectives into the end of the context. This pushes the global plan into the model's recent attention span, avoiding "lost-in-the-middle" issues and reducing goal misalignment. In effect, it's using natural language to bias its own focus toward the task objective—without needing special architectural changes.

This is something every agent is doing. I have been doing it since the early days of AI-assisted programming, where I create a `TODO.md` file with a checklist that I instruct the model to use after every step. This remains a reliable way to keep the model aligned with the goals.

> In our experience, one of the most effective ways to improve agent behavior is deceptively simple: leave the wrong turns in the context. When the model sees a failed action—and the resulting observation or stack trace—it implicitly updates its internal beliefs. This shifts its prior away from similar actions, reducing the chance of repeating the same mistake.

**Errors are normal. Using them as a feedback mechanism instead of discarding them is a great way** to correct the model's behavior. This is intuitive for programmers, who often view errors as guides on how to modify the code. All coding agents seem to implement this approach by running automated tests and checking for errors.

> ... when using Manus to help review a batch of 20 resumes, the agent often falls into a rhythm—repeating similar actions simply because that's what it sees in the context. This leads to drift, overgeneralization, or sometimes hallucination.

Few-shot prompting is a technique where we provide some examples in the prompt to steer the model to imitate the pattern. But if this is reinforced in the context, the model can continue to follow the pattern even when this is not optimal.

Manus works around this through "controlled randomness," where they **introduce small variations in actions and observations**, like different serialization templates, alternate phrasing, added noise in order and formatting, etc.

Keep these lessons in mind while building agents. In my experience, context engineering is heavily problem-specific. Start here and tailor them to fit your experience and expectations.
