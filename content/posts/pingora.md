---
title: "Pingora is Not an Nginx Replacement"
date: 2024-03-31T22:19:09+05:30
draft: false
ShowToc: false
ShowRelatedContent: false
summary: "But here's another viable Nginx replacement."
tags: ["pingora", "nginx", "software engineering"]
categories: ["API Gateway"]
cover:
    image: "/images/pingora/pingora-banner.jpg"
    alt: "Pingora or a rocky inaccessible peak."
    caption: "To be fair, nobody said it was an Nginx replacement, but they technically replaced Nginx with Pingora."
    relative: false
---

No, that wasn't bait. [Pingora](https://github.com/cloudflare/pingora) is not an Nginx replacement. But it [isn\'t meant to be one](https://blog.cloudflare.com/pingora-open-source) either, even though [Cloudflare built it](https://blog.cloudflare.com/how-we-built-pingora-the-proxy-that-connects-cloudflare-to-the-internet) to replace Nginx.

Pingora is a library and a Rust framework for building network services like [River](https://github.com/memorysafety/river), a reverse proxy that can actually replace Nginx. River is being built using Pingora by the [Internet Security Research Group (ISRG)](https://www.memorysafety.org/blog/introducing-river/) in collaboration with Cloudflare, Shopify, and Chainguard.

Think of Pingora as an engine that can power a car while you have to build the car yourself. Nginx is a complete car you can drive. River is a faster, safer, and an easily customizable car.

Last year, I wrote about how [Nginx was still a fine choice](/posts/nginx-is-fine/) as a capable reverse proxy for most users when Cloudflare announced Pingora.

Where do things stand now that Pingora is open source?

But first, why did Cloudflare replace Nginx?

## Falling Short

Cloudflare suggests that you should consider Pingora if:

1. Security is your top priority.
2. Your services are performance-sensitive.
3. You require extensive customization.

While these suggestions are [nuanced](/posts/nginx-is-fine/#probably-fine), Cloudflare details how Nginx falls short and how Pingora is built to handle these priorities.

### Threads and Processes

Nginx follows a multi-process architecture where each worker is pinned to a particular CPU core. A consequence of having workers run as separate processes is the inability to reuse connection pools across workers.

Pingora avoids this by favoring a multi-thread architecture where each worker runs as a separate thread. Sharing connection pools across threads is easier, resulting in better connection reuse.

{{< figure src="/images/pingora/connection-pools.png#center" title="Shared connection pools in Nginx and Pingora" caption="Benchmarks by Cloudflare reveal the number of connections opened reduced to a third." link="/images/pingora/connection-pools.png" target="_blank" class="align-center" >}}

Threads can also be switched faster than processes.

### Skewed Load Sharing

Worker processes in Nginx listen to a single listen socket. When a request arrives, an available worker processes it.

This disproportionately burdens the most busy worker.

This is because Linux uses a [last-in-first-out load balancing algorithm](https://man7.org/linux/man-pages/man7/epoll.7.html), where the worker that just completed processing a request is put back on top of the list and assigned the next request even though it just finished processing a request.

Nginx partially solves these issues through socket sharding, where each worker is assigned a separate listen socket. However, if requests require complex processing that blocks a worker, other requests in its queue are also blocked.

Pingora avoids this entirely by using a [work-stealing scheduling mechanism](https://tokio.rs/blog/2019-10-scheduler). When a worker runs out of work, it looks at the queues of the other workers and "steals" their tasks. This distributes work more effectively across idle workers, preventing blocking.

{{< figure src="/images/pingora/work-stealing.png#center" title="Work-stealing in Pingora" caption="Under load, each worker operates independently. When the load is not evenly distributed, the scheduler redistributes through work-stealing." link="/images/pingora/work-stealing.png" target="_blank" class="align-center" >}}

### Configuration and Customization

While Nginx exposes its functionality through configuration options, Cloudflare had use cases where this level of abstraction wasn't enough. They were left with few options other than to customize Nginx.

Nginx is [written in C](https://github.com/nginx/nginx), which isn't inherently memory-safe. Even though memory safety issues might not be prominent in Nginx, modifying its codebase for custom features became error-prone for Cloudflare.

Pingora instead offers filters and callbacks as extension points for users who want more customization. Since it is written in Rust, users of Pingora are less susceptible to memory-safety issues.

Pingora is a Swiss Army Knife for users who want to customize their network services but lack the resources to build their own solutions from scratch. Such users can now build solutions on top of Pingora.

## River is an Nginx Replacement

Pingora is many things, but it isn't a replacement for Nginx. River is intended to be a binary distribution of Nginx with reasonable defaults—a replacement for Nginx.

Pingora was intended to be eventually open source from when it was first announced to encourage others to build memory-safe network services. River catalyzes Pingora's adoption with drop-in-friendly packaging suitable for most users.

River is still under active development, but there appears to be a [clear path forward](https://github.com/memorysafety/river/blob/main/docs/what-is-it.md). It will be configurable through YAML/TOML files, with options for configuring routes, filters, and modifications of proxied requests.

The project maintainers also have WebAssembly (Wasm) support in their roadmap. This will enable users to write custom extensions in any language that can be compiled into Wasm. I expect this support to adhere to the [Proxy-Wasm specification](/posts/apisix-wasm-support/#proxy-wasm-specification).

## The Apache Way

Security, performance, and customizability are also measured on a subjective scale. You can make the case that Nginx is secure solely based on its level of adoption and longevity. In fact, an Nginx maintainer [recently left the project](/posts/freenginx/) because they published too many CVEs (because they care about security?).

Still, if a migration is inevitable, Pingora might not be the only solution. Alternatives like [Apache APISIX](/tags/apache-apisix/) work very well for most users.

Pingora is the engine that can power a car. Nginx is the car itself. Apache APISIX is seven-time World Champion Lewis Hamilton [driving the Nginx car](/posts/apisix-go-brr/).

APISIX is an API gateway built on top of Nginx that provides straightforward [Lua extension points](/posts/data-mask-plugin/) for adding custom capabilities. APISIX also supports [WebAssembly plugins](/posts/apisix-wasm-support/) enabling users to extend its capabilities through a language of their choice.

Will the [real Nginx](https://landscape.cncf.io/guide#orchestration-management--service-proxy) [replacement](https://landscape.cncf.io/guide#orchestration-management--api-gateway) please stand up?

## The White House Likes Rust

Pingora has served more than a quadrillion (one and fifteen zeroes) requests since its inception.

Cloudflare reports an impressive 80 ms reduction in the time to first byte, 70% lesser CPU use, and 67% less memory usage since they made the switch to Pingora.

I found an [open issue in the Pingora repo](https://github.com/cloudflare/pingora/issues/94) to switch to a better runtime that can further improve its performance.

Other optimizations, like using [count-min sketch](https://en.wikipedia.org/wiki/Count%E2%80%93min_sketch) instead of regular hash tables, have made counting operations five times faster. This proves useful in common scenarios like rate limiting.

Cloudflare operates at a scale that caters to very different use cases than most Nginx users. The current landscape does not force you to pick the Nginx or the Pingora side but also provides reasonable middle grounds like APISIX.

The bottom line is that the [White House likes Rust](https://www.whitehouse.gov/oncd/briefing-room/2024/02/26/press-release-technical-report/).
