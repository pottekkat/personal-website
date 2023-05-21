---
title: "AI and APIs"
date: 2023-05-21T11:40:35+05:30
draft: false
ShowToc: false
ShowRelatedContent: true
summary: "What do the recent advancements in generative AI mean for APIs?"
tags: ["ai", "api", "prediction"]
categories: ["AI"]
cover:
    image: "/images/ai-and-apis/beach-banner.jpeg"
    alt: "Aerial photo of a beach and sea."
    caption: "Photo by [Damon Hall](https://www.pexels.com/photo/aerial-photo-of-seashore-1319110/)"
    relative: false
---

AI has gone from a niche technology interest to a [mainstream tool](https://www.insidr.ai/ai-tools/) used by all sorts of people in the past few months.

Generative AI models like [GPT](https://en.wikipedia.org/wiki/Generative_pre-trained_transformer) for text and [Midjourney](https://en.wikipedia.org/wiki/Midjourney) and [Stable Diffusion](https://en.wikipedia.org/wiki/Stable_Diffusion) for images have generated hype, interest, and [significant venture capital investment](https://techcrunch.com/2023/03/28/generative-ai-venture-capital/) allowing the technology to advance even further.

These rapid advancements do not appear to slow down even after tech industry leaders like Elon Musk and Steve Wozniak [called for a pause on giant AI experiments](https://futureoflife.org/open-letter/pause-giant-ai-experiments/) and top companies around the world continue to compete for a slice of the [100 billion dollar industry](https://www.nextmsc.com/report/artificial-intelligence-market) (expected to reach two trillion dollars by 2030).

During these rapid advancements, tools like [ChatGPT](https://chat.openai.com/) have disrupted or displaced many businesses. Chegg, the online education company, had its [share price drop 40%](https://www.cnbc.com/2023/05/02/chegg-drops-more-than-40percent-after-saying-chatgpt-is-killing-its-business.html) after the CEO reported reduced users after ChatGPT's launch. Stack Overflow had a [14% traffic drop in March](https://www.similarweb.com/blog/insights/ai-news/stack-overflow-chatgpt/), while traffic to ChatGPT has grown steadily.

On the other hand, Khan Academy, the non-profit education organization, [launched Khanmigo](https://openai.com/customer-stories/khan-academy), an AI assistant powered by GPT-4 that works as a virtual tutor for students and a classroom assistant for teachers.

Khan Academy and [other companies](https://www.forbes.com/sites/anthonytellez/2023/03/03/these-major-companies-from-snap-to-instacart--are-all-using-chatgpt/?sh=1e4cb9994132) use APIs provided by ChatGPT to leverage its powerful AI model to build tailored applications. So instead of spending money and effort to develop an in-house AI, companies can use state-of-the-art AI in their own applications through simple HTTP requests.

These "APIs to multimillion-dollar AIs" have created a [new market for companies building AI-powered products and services](https://mattturck.com/landscape/mad2023.pdf) in a wide range of industries. In the future, more AI companies will offer their APIs, and more businesses will leverage these APIs to build new products.

This newly emerging "AI-API economy" is not unidirectional.

AI models, while used extensively, are limited. By design, [large language models (LLMs)](https://en.wikipedia.org/wiki/Large_language_model) can only learn from their training data and output text. This output does not translate into actions in the real world. To solve this, AI tools use "traditional" APIs to carry out these actions and provide a better user experience.

ChatGPT [released plugins](https://openai.com/blog/chatgpt-plugins) to do precisely this by leveraging third-party services through APIs. For example, the [OpenTable plugin](https://www.opentable.com/blog/chatgpt/) lets you use ChatGPT to get restaurant recommendations and book a table.

Under the hood, OpenTable exposes an API to ChatGPT through an [OpenAPI specification](https://swagger.io/specification/) and a [manifest file](https://platform.openai.com/docs/plugins/getting-started/plugin-manifest) containing the plugin metadata.

The OpenAPI spec is a standard way of defining HTTP APIs. In this context, the spec is a wrapper around the third-party API, which tells ChatGPT how to use the API.

API developers can choose what endpoints to expose to ChatGPT through this specification. For example, in the OpenTable plugin, you might want to avoid giving ChatGPT complete control to make table reservations for you. Instead, you can only let ChatGPT make GET requests, and you can manually book a table.

There are already [70 plugins available](https://in.mashable.com/tech/52685/openai-rolling-out-chatgpt-plugins-to-plus-users) through ChatGPT, and it is bound to increase progressively.

Like ChatGPT plugins, Google recently announced adding "tools" to its LLM, Bard.

APIs are no longer just for human users but also AI models. As a result, more API developers will adopt standards like the OpenAPI spec to make their APIs discoverable by these AI models.

API developers will also have to design APIs specifically for AIs or improve their existing ones to ensure that AIs can use them as intended.

The AI-API economy will also force companies that don't have APIs to think about exposing their offerings through APIs in addition to current ways or risk falling behind to some competitor who does.

There will be a significant rise in the APIs available. Companies building AI models and tools will focus on delivering the core user experiences and delegate everything else to these APIs.

More tools supporting the [API lifecycle](https://api7.ai/blog/api7-devportal) will emerge to cater to this newfound interest, and existing tools will improve their support for standards and enhance the developer experience for building AI-first APIs.

Both AI and APIs have been around for a long time. Both of these technologies have gone through a massive overhaul recently, and their combination has created an AI-API economy, producing novel solutions to existing problems and trailblazing new frontiers.

It has been increasingly hard to predict the future of technology, but it is a safe bet to assume it will be AI/API-first.
