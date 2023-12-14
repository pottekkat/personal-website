---
title: "Nginx is Probably Fine"
date: 2023-12-10T08:03:56+05:30
draft: false
ShowToc: false
ShowRelatedContent: false
summary: "Should you build your own reverse proxy to replace Nginx?"
tags: ["api gateway", "software engineering", "performance"]
categories: ["API Gateway"]
cover:
    image: "/images/nginx-is-fine/engine-banner.jpg"
    alt: "A photo of a crankshaft of an engine."
    caption: "Emphasis on \"probably.\""
    relative: false
---

I recently found articles from the past few years about companies migrating away from [Nginx](https://nginx.org/en/). Some of these migrations are to [other reverse proxies like Envoy](https://dropbox.tech/infrastructure/how-we-migrated-dropbox-from-nginx-to-envoy), while others choose to build their [own in-house solutions](https://blog.cloudflare.com/how-we-built-pingora-the-proxy-that-connects-cloudflare-to-the-internet/).

Although these migrations seem reasonable, it does not necessarily mean the grass will always be greener. There is a lot of nuance in the reasons behind such migrations, and it might not translate well across the board.

It also does not mean Nginx has no shortcomings. It definitely does. But despite this, Nginx does many things very well and is probably a fine choice as a capable web server, reverse proxy, load balancer, and more.

## Worker Process Model

A key enabling factor of Nginx is its worker process model. By [default](https://nginx.org/en/docs/ngx_core_module.html#worker_processes), Nginx spins up one worker process per CPU core.

Connections to Nginx are load-balanced across these workers. And each of these workers can serve thousands of connections. The worker process never leaves the CPU as it needs to continuously parse the data stream in the listening port.

These worker processes are created by a master process, which also does privileged operations like reading the configuration and binding to listening ports. The process model can be summarized as below:

1. Nginx starts a **master process** to perform privileged operations. The master process is also responsible for creating child processes.
2. The **cache loader** process runs at the start to load the disk-based cache into memory and then exits.
3. The **cache manager** process clears entries from the disk caches to keep them within the set limits.
4. **Worker processes** then handle the network connections, from clients to Nginx and from Nginx to the upstream services, while reading and writing content to the disk.

{{< figure src="/images/nginx-is-fine/process-model.png#center" title="Nginx Process Model" caption="If the CPU has four cores, Nginx creates four worker processes by default." link="/images/nginx-is-fine/process-model.png" target="_blank" class="align-center" >}}

Nginx follows an event-driven model where the worker processes wait for events on the listening ports. A new incoming connection initiates an event.

When the worker is done with a request, it does not wait for a response from the client and moves on to the subsequent request in the queue.

## Non-blocking at Scale

When Nginx was first released, most other web servers did not follow a similar model and spun up a new process/thread per request, restricting each worker to process only one connection at a time. While this was convenient, it was ineffective in utilizing resources.

On the other hand, the event-driven model allows Nginx to be non-blocking while handling thousands of simultaneous connections.

The worker creates a new connection socket on events on the listen socket. The worker then responds promptly to events on the connection socket.

{{< figure src="/images/nginx-is-fine/event-loop.png#center" title="A simple representation of how Nginx workers are event driven" caption="The workers do all the processing over a simple loop. Sourced from [Thread Pools in NGINX Boost Performance 9x!](https://www.nginx.com/blog/thread-pools-boost-performance-9x/)" link="/images/nginx-is-fine/event-loop.png" target="_blank" class="align-center" >}}

Nginx's ability to scale is also evident in other areas. For example, when updating Nginx's configuration, existing worker processes exit gracefully after serving existing requests while the master process starts new workers with the new configuration.

This is essential in systems that serve significant traffic to avoid downtime. The cost of doing this is also slim and results only in a tiny spike in CPU usage during the configuration change.

Although Nginx is designed to be non-blocking, it won't hold true in scenarios where processing a request takes a lot of time, like reading data from a disk.

In such scenarios, even though other requests in the queue might not require blocking processes, they are forced to wait.

## Marginal Overheads

There is very little overhead in adding a new connection in Nginx. Each new connection just creates a new file descriptor and consumes only a tiny amount of additional memory.

And since each worker is pinned to a CPU, there is also less [context switching](https://en.wikipedia.org/wiki/Context_switch) necessary as the same worker can handle multiple requests. i.e., there is no need to load processes on and off between the CPU and memory frequently.

In a multiprocess model, context switching will be frequent and limit scalability.

{{< figure src="/images/nginx-is-fine/multiprocess-vs-nginx.png#center" title="Multiprocess vs Nginx worker model" caption="In a multiprocess model each of the process is frequently loaded on and off between the CPU and memory." link="/images/nginx-is-fine/multiprocess-vs-nginx.png" target="_blank" class="align-center" >}}

## Redundant Connections

You can [configure Nginx to hold open the connections](https://nginx.org/en/docs/http/ngx_http_upstream_module.html#keepalive) to the upstream even after completing a request. If another request needs to be made to the same upstream, Nginx can reuse this connection instead of establishing a new connection.

But, a significant drawback of Nginx is that even though we can set up connections to be reused, different workers will still end up establishing their own connections to the same upstream. This is difficult to solve because sharing the connection pool across multiple processes is difficult.

So, a request being processed by a worker must pick from existing connections established in the same worker process or create a new one even though they might already exist in other processes.

{{< figure src="/images/nginx-is-fine/connection-pool.png#center" title="Connection Pools in Nginx" caption="Each worker has its own connection pool which cannot be shared easily with the other workers." link="/images/nginx-is-fine/connection-pool.png" target="_blank" class="align-center" >}}

## Multiprocessing vs Multithreading

This redundancy tilts the scales in favor of a multithreading architecture over the worker process model used in Nginx.

Multithreading allows each thread to share the same connection pool since they share a common memory address space. This eliminates the need to spin up and maintain new connections for each worker.

{{< figure src="/images/nginx-is-fine/single-connection-pool.png#center" title="Shared Connection Pool" caption="Connections are shared across workers by using a multithreaded architecture." link="/images/nginx-is-fine/single-connection-pool.png" target="_blank" class="align-center" >}}
But multithreading is hard to get right in practice. At least, it was when Nginx was first released. It had a lot of potential to open up problems like race conditions, which could be troublesome if handled incorrectly.

A multiprocess model is immune to such a problem because each process runs in its isolated space. Still, multithreading is more easy to achieve right now with programming languages like Rust.

## Load Heavy Workers

The multiple worker processes in Nginx listen to just a single listen socket. When a request arrives, an available worker picks it up and processes it.

Although this seems like an acceptable way to handle things, it disproportionately burdens the most busy worker because of [how this works](https://man7.org/linux/man-pages/man7/epoll.7.html) in Linux.

Linux load balances in a last-in-first-out way where the worker that just completed processing a request is put back on top of the list. Then, the subsequent request is assigned to this worker even though it has just finished working.

{{< figure src="/images/nginx-is-fine/single-accept.png#center" title="Multiple Workers, Single Socket" caption="In the [epoll method](https://nginx.org/en/docs/events.html) for processing connections, the worker added last to the queue will get the new connection." link="/images/nginx-is-fine/single-accept.png" target="_blank" class="align-center" >}}

## ~~Im~~perfect Solutions

A different approach for processing connections can offload these heavy workers.

Nginx allows socket sharding where each worker can have a separate listen socket. In this model, the incoming connections are split into the different accept queues of each worker.

{{< figure src="/images/nginx-is-fine/multiple-accept.png#center" title="Accept Queue per Worker" caption="Better load distribution can be achieved by using multiple accept queues." link="/images/nginx-is-fine/multiple-accept.png" target="_blank" class="align-center" >}}

This can be enabled by [configuring](http://nginx.org/en/docs/http/ngx_http_core_module.html#lingering_timeout) the `SO_REUSEPORT` socket option.

Since the accept queues are not shared, Linux distributes the incoming connections more evenly across the workers, and no single worker is disproportionately loaded.

However, this solution brings another problem. If a worker process is blocked, all connections in its accept queue will be blocked, even if they are light and non-blocking. This will increase the overall latency of the entire system.

{{< figure src="/images/nginx-is-fine/blocked-multiple-accept.png#center" title="Blocked worker" caption="One blocked process blocks the entire connections in the accept queue of the worker process. But the network continues to add more connections to the queue." link="/images/nginx-is-fine/blocked-multiple-accept.png" target="_blank" class="align-center" >}}

Other solutions that emerged over time, like [using thread pools to perform blocking operations](http://nginx.org/en/docs/ngx_core_module.html#thread_pool) without affecting other requests in the queue, are good. Nginx can offload long operations (all `read()`, `sendfile()`, and `aio_write` operations) to a thread pool queue, and any free thread can take it for processing.

But in most scenarios, you will be fine without thread pools if your machines have reasonable memory and don't have to load large data sets from disk into memory. You can extract good performance with Nginx's default optimizations and the operating system's features like caching.

## Abstracting Network Connections

There is a small subset of use cases where every ounce of performance improvements might be necessary. For the rest of us, Nginx is an abstraction of the underlying network.

We care more about building applications that are functional and performant without having to spend resources building custom solutions when Nginx would work out of the box.

Even abstractions on top of Nginx make it much easier for most developers to build and configure reverse proxies and load balancers. For example, [Apache APISIX](https://apisix.apache.org/) is built on top of [OpenResty](https://api7.ai/learning-center/openresty/openresty-vs-nginx), a modified Nginx build.

{{< figure src="/images/nginx-is-fine/apisix-canary.png#center" title="Canary Deployments in Apache APISIX" caption="You can easily [configure Apache APISIX to set up canary deployments](/posts/canary-in-kubernetes/) while deploying new versions of your applications." link="/images/nginx-is-fine/apisix-canary.png" target="_blank" class="align-center" >}}

You can use tools like Apache APISIX to route traffic, configure authentication, [set up monitoring](/posts/introduction-to-monitoring-microservices/), and more without worrying about the details underneath.

## Probably Fine

While there are situations where it might be reasonable to move away from Nginx and use something better tailored to your specific need, it might not be something that everybody should be doing.

Nginx, its vast ecosystem, large community, and battle-tested stability can easily be your drop-in solution.

In other words, Nginx is probably fine.

_See the discussion on [Reddit](https://www.reddit.com/r/programming/comments/18f6su8/nginx_is_probably_fine/)._
