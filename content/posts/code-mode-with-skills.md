---
title: Code Mode with Skills
slug: code-mode
date: 2026-02-24T23:15:05+05:30
draft: false
toc:
  show: false
ShowRelatedContent: false
description: Code Mode without MCP servers.
summary: An alternate proposal for Code Mode that replaces MCP servers and hosted execution with SKILL.md files and OpenAPI specifications.
tags:
  - ai
  - api
  - software engineering
  - standards
categories:
  - AI
series: []
aliases: []
cover:
  image: /images/code-mode-with-skills/punch-card-banner.jpg
  alt: Punch card for the system A100.
  caption: Code > Tools, Skills > MCP.
  relative: false
fmContentType: Post (default)
---

A few days ago, [Cloudflare released a new MCP server](https://blog.cloudflare.com/code-mode-mcp/) that uses _Code Mode_.

Instead of asking LLMs to call predefined tools, Code Mode allows LLMs to write and execute code that interacts directly with APIs. This rests on the (correct) observation that [LLMs are inherently better at writing code](https://blog.cloudflare.com/code-mode/#whats-wrong-with-this) than making tool calls.

Typical tool call setups also [come with problems](https://www.anthropic.com/engineering/code-execution-with-mcp):

1. Tool definitions need to be added to the LLM’s context window before the actual task begins, even though only a subset of tools might be required.
2. When chaining multiple tool calls, intermediate results need to be added to the context and passed along.
3. Context bloat from unnecessary definitions and intermediate results increases latency and can cause LLMs to make mistakes when copying data between tool calls.
4. LLMs struggle to make complex tool calls, which encourages MCP server authors to wrap rich APIs into simplified tools.

With Code Mode, the LLM writes code to directly interact with APIs instead of calling tools. Instead of chaining together multiple tool calls and passing data between them through the context, the LLM writes complex code that calls multiple APIs, stores intermediate state in variables, and only returns the final results.

I first saw this idea presented in Alex Zhang and Omar Khattab's paper, [_Recursive Language Models (RLMs)_](https://alexzhang13.github.io/blog/2025/rlm/), where the model interacts with a Python REPL environment to programmatically query parts of the context. Armin Ronacher, the creator of Flask, had even [floated a similar idea](https://lucumr.pocoo.org/2025/8/18/code-mcps/) back in August 2025!

Cloudflare takes this idea a step further in their new MCP server. Instead of exposing hundreds of individual tools, the server exposes only two: `search` and `execute`.

The `search` tool lets the LLM programmatically explore an [OpenAPI specification](https://swagger.io/docs/specification/v3_0/about/) (`$refs` pre-resolved). LLMs can write JavaScript to explore/query the API spec and use the `execute` tool to run custom JavaScript against an authenticated API client (`cloudflare.request()`) inside a sandboxed environment (Cloudflare Workers).

This design keeps the full API specification and intermediate execution outside the LLM’s context, while only a subset of the API and the results of the executed code enter the context window.

However, [discussions](https://x.com/Cloudflare/status/2024847784914882945) [on](https://x.com/dillon_mulroy/status/2024851567334011110) [Twitter](https://x.com/thdxr/status/2025655097833779210) about Code Mode incorrectly frame it as an MCP vs. skills debate. To be fair, the [responses from Cloudflare engineers](https://x.com/dillon_mulroy/status/2024851567334011110) don’t really help.

These arguments are irrational and completely miss the point of Code Mode. Most people arguing would agree that LLMs write good code. Code Mode itself isn’t tied to the Model Context Protocol. The idea works with any agent harness that supports code execution.

Cloudflare’s use of MCP here primarily solves the discovery and distribution problem, and it solves it well. Their [Agent Skills Discovery RFC](https://github.com/cloudflare/agent-skills-discovery-rfc) (v0.1, 2026-01-17) solves a similar problem for skills, which is at least an underappreciated initiative.

It is also tempting to dismiss the entire discourse by saying “just build CLIs.” LLMs are indeed good at using familiar CLIs. But expecting them to reliably compose chained CLI calls without extensive documentation (and paying the token cost) is unrealistic.

I have been a strong proponent of MCP. I helped maintain the [unofficial MCP Go SDK](https://github.com/mark3labs/mcp-go) until Google released the official one. But I have found more recently that skills work much better. I’m not alone in that conclusion. Armin Ronacher has [expressed similar concerns](https://x.com/mitsuhiko/status/2025843509652009186) about MCP’s current architecture and has called for an overhaul of the specification. There are indeed [notable exceptions](https://cra.mr/context-management-and-mcp), but I think their arguments are weak.

An alternate version of Code Mode that works well is with skills. Now I don’t think this idea is novel, but I haven’t seen it presented anywhere. This is the flow:

1. The OpenAPI specification and a SKILL.md file are hosted using the `.well-known` URL path prefix following [Cloudflare’s RFC](https://github.com/cloudflare/agent-skills-discovery-rfc#uri-structure). It does not really matter where you host it, though, but I think this proposal is neat:
  
   ```text
   https://example.com/.well-known/skills/index.json
   https://example.com/.well-known/skills/example-api/SKILL.md
   https://example.com/api/openapi.json
   ```

   The skill will be simple, with minimal instructions on downloading the OpenAPI spec, searching it, and making API calls:

   ````markdown{title="SKILL.md"}
   ---
   name: example-api
   description: >
     Interact with the Example API. Use when the user wants to
     search, create, or manage resources on example.com.
   ---

   Load the spec, search for endpoints, and call them:

   ```python
   import requests

   spec = requests.get("https://example.com/api/openapi.json").json()
   base = spec["servers"][0]["url"]

   # Search endpoints by keyword
   for path, methods in spec["paths"].items():
       for method, op in methods.items():
           if method in ("parameters", "servers"):
               continue
           text = f"{path} {op.get('summary', '')} {op.get('description', '')}".lower()
           if "keyword" in text:
               print(f"{method.upper()} {base}{path} — {op.get('summary', '')}")

   # Call an endpoint
   resp = requests.get(f"{base}/endpoint").json()
   print(resp)
   ```
   ````

2. Agents are given access to this skill, and they execute code to load and search the spec and then make API calls. Agents today, like Claude Code and Codex, have their own filesystem and network-isolated sandboxed execution environments.

3. Agents optionally help themselves by documenting common flows in new skills without ever having read the whole specification.

[Anthropic](https://www.anthropic.com/engineering/code-execution-with-mcp) has good examples of how an LLM would write code in this setup.

The token reduction is comparable to [Cloudflare’s results](https://blog.cloudflare.com/code-mode-mcp/). The token cost of documenting two MCP tools is comparable to the token cost of a focused skill file.

A benefit of using Code Mode with skills is that you don’t have to manage an MCP server or a hosted execution environment, which works for most use cases. The distribution problem is solved by making it easy to fetch the skill and the OpenAPI spec. At the very least, the existence of a `SKILL.md` file can be documented similarly to how an MCP server URL might be documented.

My experience building agents has taught me to lean into the nature of LLMs. They are very good at writing code. So let them write code.
