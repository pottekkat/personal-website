---
title: "Apache APISIX Playground"
description: "Getting up and running with Apache APISIX."
summary: "A playground for Apache APISIX."
date: 2024-04-26T17:22:00+05:30
experimental: true
EnableCodapi: true
CodapiURL: codapi.navendu.me/v1
ShowCodeCopyButtons: false
tags: ["playground", "apisix", "codapi"]
categories: ["Playground"]
cover:
  image: "/images/pl-apisix/apisix-logo-banner.jpg"
  alt: "Apache APISIX logo."
  relative: false
  hidden: true
---

[Apache APISIX](https://apisix.apache.org/) is a high-performance cloud native API gateway.

An API gateway typically sits between your client applications and your APIs, acting as a proxy while adding authentication, traffic control, monitoring, and other capabilities.

This interactive playground walks you through [configuring Apache APISIX](/tags/apache-apisix), directly in your browser.

> **Note**: This playground uses a lightweight APISIX sandbox, and its performance might be (it is) sub-par compared to typical production setups. Please refer to the [APISIX in Production](https://docs.api7.ai/apisix/production/deployment-modes) guides to learn more about practical APISIX deployments.

## Install APISIX

The easiest way to get up and running with Apache APISIX is [through Docker](https://docs.api7.ai/apisix/install/docker/). APISIX provides [official Docker images](https://hub.docker.com/r/apache/apisix) which are easy to configure and run.

For this walkthrough, we have deployed APISIX in [standalone mode](https://docs.api7.ai/apisix/production/deployment-modes#standalone-mode) and will configure it through a YAML file. Unlike a [traditional](https://docs.api7.ai/apisix/production/deployment-modes#traditional-mode) or a [decoupled](https://docs.api7.ai/apisix/production/deployment-modes#decoupled-mode) deployment, the standalone mode does not require managing external dependencies like etcd for configuration.

Let's check if everything is installed correctly by running:

```shell
curl -sI "http://127.0.0.1:9080" | grep Server
```

{{< codapi sandbox="apisix" editor="off" files="./config/init-apisix.yaml:apisix.yaml" >}}

The `Server` header should have the value `APISIX`.

## Create Routes

Routes are the fundamental building blocks of APISIX. A route matches client requests by conditions and forwards them to the appropriate upstream service.

Let's create a simple route that matches requests based on the path and forwards them to a [public HTTP API](https://httpbin.org), `httpbin.org`:

```yaml {title="apisix.yaml", hl_lines=[3, 6]}
routes:
  - id: playground-ip
    uri: /ip
    upstream:
      nodes:
        httpbin.org:80: 1
      type: roundrobin
#END
```

This configuration is pretty straightforward: if a request path matches `/ip`, proxy the request to the `httpbin.org` upstream.

To test our configuration, we can send a request to the `/ip` path as shown below:

```shell
curl "http://127.0.0.1:9080/ip"
```

{{< codapi sandbox="apisix" editor="off" files="./config/playground-ip.yaml:apisix.yaml" >}}

You will see your IP address in the response.

If you try to access an invalid route, you will receive a `404 Not Found` error:

```shell
curl "http://127.0.0.1:9080/anything"
```

{{< codapi sandbox="apisix" editor="off" files="./config/playground-ip.yaml:apisix.yaml" >}}

## Configure Load Balancing

We can't let a single upstream handle all the load, can we? Well, we shouldn't.

Let's add another upstream node, `mock.api7.ai`, and use APISIX's load balancing capabilities to distribute requests among them:

```yaml {title="apisix.yaml", hl_lines=["7-10"]}
routes:
  - id: playground-headers
    uri: /headers
    upstream:
      nodes:
        httpbin.org:443: 1
        mock.api7.ai:443: 1
      type: roundrobin
      pass_host: node
      scheme: https
#END
```

We also configure APISIX to use the [round-robin algorithm](https://docs.api7.ai/apisix/key-concepts/upstreams#load-balancing) for load balancing and set up HTTPS between APISIX and the upstream.

Now try sending requests to the created route by running the command below multiple times. You will see that the requests are load balanced between the two upstreams:

```shell
curl "http://127.0.0.1:9080/headers"
```

{{< codapi sandbox="apisix" editor="off" files="./config/playground-headers.yaml:apisix.yaml" >}}

Did you notice how we passed the `Host` header to the upstream?

## Add Authentication

Until now, all of our requests were unauthenticated, which is rare in almost all practical scenarios. So, let's fix that.

APISIX uses [plugins](https://docs.api7.ai/apisix/key-concepts/plugins) to extend its capabilities and add features. It comes with many [authentication plugins](https://docs.api7.ai/hub) out of the box.

We will add the simple but widely used [key-auth](https://docs.api7.ai/hub/key-auth) plugin to our setup. This basically forces your API consumers to authenticate their requests with a predetermined key.

Let's start by defining a [consumer](https://docs.api7.ai/apisix/key-concepts/consumers) who would consume our API:

```yaml {title="apisix.yaml", linenos="inline" hl_lines=[5]}
consumers:
  - username: Nicolas
    plugins:
      key-auth:
        key: sUpEr-seCRet-keY
```

The consumer has a key that he can use to send requests.

Let's update our route to look for this key before accepting a request:

```yaml {title="apisix.yaml", linenos="inline", linenostart=6, hl_lines=[9]}
routes:
  - id: playground-ip
    uri: /ip
    upstream:
      nodes:
        httpbin.org:80: 1
      type: roundrobin
    plugins:
      key-auth: {}
#END
```

We just have to enable the plugin on a route for it to take effect.

Now, a user will only be able to make a successful request if he has the key:

```shell
curl "http://127.0.0.1:9080/ip" -H 'apikey: sUpEr-seCRet-keY'
```

{{< codapi sandbox="apisix" editor="basic" files="./config/auth-playground-ip.yaml:apisix.yaml" >}}

Try removing the key or changing it to an invalid value before sending a request. Did it work as you expected?

## Set Up Rate Limits

Finally, you must ensure that your consumers don't take advantage of your generosity by recklessly consuming your APIs. How do you do this?

You can always talk to your consumers, but a better way is to configure APISIX to set these limits.

APISIX comes with three plugins for configuring rate limits: [limit-req](https://docs.api7.ai/hub/limit-req), [limit-conn](https://apisix.apache.org/docs/apisix/plugins/limit-conn/), and [limit-count](https://docs.api7.ai/hub/limit-count). We will use the limit-count plugin to limit the number of requests a consumer can make in 10 seconds (very arbitrary):

```yaml {title="apisix.yaml", hl_lines=["9-12"]}
routes:
  - id: playground-ip
    uri: /ip
    upstream:
      nodes:
        httpbin.org:80: 1
      type: roundrobin
    plugins:
      limit-count:
        count: 2
        time_window: 10
        rejected_code: 429
#END
```

APISIX will block subsequent requests from consumers if they exceed the limit (2) in the given time window (10s) with a `429 Too Many Requests` status code.

But this is better if we try it. Let's send four requests instead of the limit of two:

```shell
curl "http://127.0.0.1:9080/ip"
curl "http://127.0.0.1:9080/ip"
curl "http://127.0.0.1:9080/ip"
curl "http://127.0.0.1:9080/ip"
```

{{< codapi sandbox="apisix" editor="off" files="./config/limit-playground-ip.yaml:apisix.yaml" >}}

What happens when we reach the limit?

## Have Fun!

That's it for the walkthrough! For more complex configurations and practical scenarios, check out [other tutorials](https://docs.api7.ai/apisix/how-to-guide/traffic-management/health-check).

Meanwhile, here's a blank canvas to play around with the concepts you learned from this walkthrough:

```yaml {id="play-anything.yaml"}
routes:
  - id: playground-anything
    uri: /anything/*
    upstream:
      nodes:
        httpbin.org:80: 1
      type: roundrobin
#END
```

{{< codapi sandbox="apisix" editor="basic" hidden=true >}}

```shell
curl "http://127.0.0.1:9080/anything/fun"
```

{{< codapi sandbox="apisix" editor="basic" files="#play-anything.yaml:apisix.yaml" >}}

This playground is powered by [Codapi](https://github.com/nalgeon/codapi/). A huge thank you to its creator, [Anton Zhiyanov](https://github.com/nalgeon).
