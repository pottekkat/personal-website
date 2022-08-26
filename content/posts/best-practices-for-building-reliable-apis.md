---
title: "Best Practices for Building Reliable APIs"
date: 2022-08-19T17:12:35+05:30
draft: false
weight: 15
mermaid: true
ShowToc: true
TocOpen: true
canonicalURL: "https://api7.ai/blog/best-practices-for-building-reliable-apis-with-api-gateways/"
ShowCanonicalLink: true
summary: "As the size of your APIs increase, the need for making them reliable and robust also increases. This article discusses the best practices for designing reliable APIs by introducing you to a special kind of reverse proxies called API gateways."
tags: ["api gateway", "apache apisix", "cloud-native"]
categories: ["Featured", "API Gateway"]
cover:
    image: "/images/best-practices-for-building-reliable-apis/banner-construction.jpeg"
    alt: "Photo of construction workers on a site."
    caption: "Photo by [Pixabay](https://www.pexels.com/photo/man-in-yellow-safety-vest-climbing-on-ladder-159358/)"
    relative: false
---

As your APIs scale, the need for making them reliable and robust increases.

This article discusses the best practices for building reliable APIs by introducing a special kind of reverse proxies called API gateways.

We will look into:

1. Problems with traditional API designs
2. What API gateways are
3. How API gateways improve APIs and
4. Patterns and examples using API gateways

But first, what are "reliable" APIs?

## What Makes an API Reliable?

As a service provider, you might have service-level agreements (SLAs) with your customers, usually quoted in uptime—the amount of time the service is guaranteed to be online and operational.

Uptime is a myopic view of reliability. To understand what it means to be reliable, you have to look at the factors that affect uptime. Once you understand these factors, you will be in a better position to build reliable services.

Let's look at these factors and the questions they pose:

1. **Latency**: How fast does your API respond to requests?
2. **Security**: Who can access your API? Is it secure?
3. **Downtime Frequency**: How frequently is your API down?
4. **Consistency**: Are your API endpoints constant? Do consumers need to change their code often?
5. **Monitoring and Reporting**: Can you observe issues and failures in your API? Are you reporting them to your consumers?

{{< mermaid >}}
flowchart LR
    c1(Web App) --> |Consistency| m1(Service 1)
    c1 --> m2(Service 2)
    c2(iOS App) --> |Latency| m1
    c2 --> |Downtime| m3(Service 3)
    c2 --> m4(Service 4)
    c3(Android App) --> |Security| m2
    c3 --> |Monitoring| m4
    subgraph Clients
        c1
        c2
        c3
    end
    subgraph API
        m1
        m2
        m3
        m4
    end
{{< /mermaid >}}

As organizations move to cloud native architectures, it becomes difficult for the development teams to account for these factors on each of their services. And as these systems scale, it would be much easier to delegate these responsibilities to a single, separate system. _Say hello to API gateways!_

## API Gateway, the Unified Entrypoint

An API gateway acts as a middleman between your clients and your APIs. It will accept all traffic (API calls) like reverse proxies, forwards the request to the required services in your backend, and returns the needed results.

{{< mermaid >}}
flowchart LR
    c1(Web App) ---> ag(API Gateway)
    c2(iOS App) ---> ag
    c3(Android App) ---> ag
    ag ---> m1(Service 1)
    ag ---> m2(Service 2)
    ag ---> m3(Service 3)
    ag ---> m4(Service 4)
    style ag stroke: #e62129
    subgraph Clients
        c1
        c2
        c3
    end
    subgraph API
        m1
        m2
        m3
        m4
    end
{{< /mermaid >}}

An API gateway can be the central point that handles all the authentication, security, traffic control, and monitoring concerns, leaving the API developers to focus on business needs and making it easier to improve reliability.

{{< mermaid >}}
flowchart LR
    subgraph ag[API Gateway]
    f1(Authentication, Security, Monitoring, Traffic Control)
    end
    c(Client) --> f1 --> a(API/Upstream)
{{< /mermaid >}}

There are a lot of [open source and managed API gateway offerings](https://geekflare.com/api-gateway/) available. In this article, I will be using [Apache APISIX](https://apisix.apache.org/).

The following section will describe some of the best practices to make your APIs reliable using API gateways.

## Reliability Best Practices with API Gateways

We will focus more on the pattern underneath than the actual implementation, as it can vary based on your API gateway choice.

I will divide these patterns into three categories:

1. Authentication and security
2. Monitoring and observability
3. Version control and zero downtime

We will look into each category in detail below.

### Authentication and Security

#### User Authentication

Authenticated requests with API gateways secure client-API interactions. After a client authenticates, your API gateway can use the obtained client details for fine-grained control.

{{< mermaid >}}
flowchart LR
    u("👤 User") --> ag(API Gateway) --> |User Info| s1(Service 1) & s2(Service 2) & s3(Service 3)
    style ag stroke: #e62129
{{< /mermaid >}}

APISIX handles authentication directly through plugins like [key-auth](https://apisix.apache.org/docs/apisix/plugins/key-auth/) and [jwt-auth](https://apisix.apache.org/docs/apisix/plugins/jwt-auth/). APISIX also supports OAuth authentication and role-based access control systems like wolf through plugins like [openid-connect](https://apisix.apache.org/docs/apisix/plugins/openid-connect/) and [wolf-rbac](https://apisix.apache.org/docs/apisix/plugins/wolf-rbac/), respectively.

#### Rate Limiting

Intentional (DoS attacks) and unintentional (clients making too many requests) traffic spikes to your APIs can bring them down like a house of cards. Setting up rate limiting will improve the reliability of your systems in handling such scenarios.

You can set up rate limiting on your API gateway, and if the number of requests increases above a threshold, the API gateway could either delay or reject the exceeding requests.

{{< mermaid >}}
flowchart LR
    START1[ ] --> rd{ > Threshold ? } --> r(Router) --> u(Upstream/API)
    START2[ ] --> rd --> r
    START3[ ] --> rd ---x |Reject/Delay| r
    START4[ ] --> rd ---x |Reject/Delay| r
    style START1 height:0px
    style START2 height:0px
    style START3 height:0px
    style START4 height:0px
    linkStyle 1 stroke:green
    linkStyle 4 stroke:green
    linkStyle 6 stroke:red
    linkStyle 8 stroke:red
    subgraph ag[ API Gateway]
    r
    rd
    end
{{< /mermaid >}}

With APISIX, you can use any of the three plugins to configure rate limits based on number of requests, number of concurrent requests per client, and count ([limit-req](https://apisix.apache.org/docs/apisix/next/plugins/limit-req/), [limit-conn](https://apisix.apache.org/docs/apisix/next/plugins/limit-conn/), [limit-count](https://apisix.apache.org/docs/apisix/next/plugins/limit-count/)).

### Monitoring and Observability

Your API's reliability and your monitoring setup go hand in hand. You can monitor your reliability metrics by setting up monitoring on your API gateway.

{{< mermaid >}}
flowchart LR
    c(Clients) --> ag --> u(Upstream/API)
    subgraph ag[API Gateway]
    mo("🔍 Tracers, 📃 Loggers, and 📈 Metrics")
    end
{{< /mermaid >}}

API logs and traces provide detailed information about an API call. This information will help you know when your API has failed or has an error as soon as possible. Silent fails lead to unfixed errors which can cause problems in the future.

With some configuration, you will also be able to predict and anticipate traffic for the future, helping you scale reliably.

APISIX has plugins that integrate with logging ([Apache SkyWalking](https://apisix.apache.org/docs/apisix/next/plugins/skywalking-logger/), [RocketMQ](https://apisix.apache.org/docs/apisix/next/plugins/rocketmq-logger/)), metrics ([Prometheus](https://apisix.apache.org/docs/apisix/next/plugins/prometheus/), [Datadog](https://apisix.apache.org/docs/apisix/next/plugins/datadog/)), and tracing ([OpenTelemetry](https://apisix.apache.org/docs/apisix/next/plugins/opentelemetry/), [Zipkin](https://apisix.apache.org/docs/apisix/next/plugins/zipkin/)) platforms/specifications. You can read more on [API Observability with APISIX Plugins](https://apisix.apache.org/blog/2022/04/17/api-observability/).

### Version Control and Zero Downtime

#### Canary Release

When switching to new versions of your APIs, you must ensure that you don't drop your traffic. Clients should still be able to make requests to your API and get back the correct response.

With an API gateway, you can setup canary releases. This will ensure that your API remains functional during the transition, and you can also roll back to the older version if there are any issues.

Initially, the API gateway will route all traffic to your API's old version.

{{< mermaid >}}
flowchart LR
    c(Clients) --> ag(API Gateway) --> |All Traffic| u1(Upstream v1.0)
    ag x-.-x |No Traffic| u2(Upstream v2.0)
    style ag stroke: #e62129
    linkStyle 1 stroke: green
    subgraph u[Upstream/API]
    u1
    u2
    end
{{< /mermaid >}}

When you have a new version, you can configure the API gateway to route some of your traffic to this new version. You can keep increasing the percentage of traffic to your new service and check if everything is working as expected.

{{< mermaid >}}
flowchart LR
    c(Clients) --> ag(API Gateway) --> |Most Traffic 95%| u1(Upstream v1.0)
    ag --> |Some Traffic 5%| u2(Upstream v2.0)
    style ag stroke: #e62129
    linkStyle 1 stroke: green
    linkStyle 2 stroke: green
    subgraph u[Upstream/API]
    u1
    u2
    end
{{< /mermaid >}}

Finally, you can route all traffic to your new API.

{{< mermaid >}}
flowchart LR
    c(Clients) --> ag(API Gateway) x-.-x |No Traffic| u1(Upstream v1.0)
    ag --> |All Traffic| u2(Upstream v2.0)
    style ag stroke: #e62129
    linkStyle 2 stroke: green
    subgraph u[Upstream/API]
    u1
    u2
    end
{{< /mermaid >}}

APISIX uses the [traffic-split](https://apisix.apache.org/docs/apisix/next/plugins/traffic-split/) plugin that lets you control the traffic to your services. You can use it to set up canary releases or your custom release configuration. 

#### Circuit Breaking

When one of your upstream services is unavailable or is experiencing high latency, it needs to be cut off from your system. Otherwise, the client will keep retrying the request, leading to resource exhaustion. This failure can creep into other services in your system and bring them down.

Like how electrical circuit breakers isolate faulty components from a circuit, API gateways have a circuit breaker feature that disconnects faulty services, keeping the system healthy. Traffic to these services are rerouted or delayed until the service becomes healthy.

{{< mermaid >}}
flowchart LR
    c(Clients) --> ag(API Gateway) x-.-x |"⚡ Break"| u1(Upstream A 1)
    ag --> u2(Upstream A 2)
    ag --> u3(Upstream A 3)
    style ag stroke: #e62129
    style u1 stroke: red
    linkStyle 1 stroke: red
    subgraph u[Upstream/API]
    u1
    u2
    u3
    end
{{< /mermaid >}}

APISIX comes with an [api-breaker](https://apisix.apache.org/docs/apisix/next/plugins/api-breaker/) plugin that implements this pattern.

#### Redirects

As you update your APIs, their endpoints might undergo some change. Traditionally, this would mean that the client application should send requests to the `/new-api-endpoint` instead of the `/old-api-endpoint`, meaning your consumers must manually change each call to this API endpoint.

If unanticipated, this can break client applications.

With an API gateway, you can provide an abstraction layer and redirect requests to the `/new-api-endpoint` without having the clients change their requests. With proper redirect status codes and messages, you can gradually depreciate the `/old-api-endpoint` without your consumers experiencing any downtime.

{{< mermaid >}}
flowchart LR
    c(Clients) --> |/old-api-endpoint| ag(API Gateway)
    ag --> |"3xx: 'Depreciation notice'"| c
    ag x-.-x u1(/old-api-endpoint)
    ag ---> |Redirect| u2(/new-api-endpoint)
    style ag stroke: #e62129
    linkStyle 2 stroke: grey
    subgraph u[Upstream/API]
    u1
    u2
    end
{{< /mermaid >}}

With APISIX, you can use the [redirect](https://apisix.apache.org/docs/apisix/next/plugins/redirect/) plugin to configure redirects.

## Conclusion

When reliability becomes a primary concern, it is evident that API gateways are necessary as more organizations split their monoliths into microservices and move to cloud native architectures.

However, this does not mean API gateways are for everyone. Depending on your API's size and usage, an API gateway might be overkill, and you can get away with using a reverse proxy with basic routing and load balancing capabilities.

The use cases mentioned here only scratch the surface of an API gateway's capabilities. You can learn more about API gateways and Apache APISIX at [apisix.apache.org](https://apisix.apache.org/).
