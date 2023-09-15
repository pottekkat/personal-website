---
title: "API Deployment Strategies"
date: 2023-09-15T19:55:51+05:30
draft: false
ShowToc: true
TocOpen: true
ShowRelatedContent: true
summary: "Applying best practices to make new API deployments using the API gateway of choice, Apache APISIX."
tags: ["apache apisix", "api gateway", "cloud-native"]
categories: ["API Gateway"]
cover:
  image: "/images/api-deployment-strategies/shadow-banner.jpeg"
  alt: "Shadow in a parking lot."
  caption: "Deploying changes without affecting users is key to a good deployment strategy."
  relative: false
---

Deploying changes to your APIs without impacting clients is vital in most modern software products. In this article, I will focus on some best practices and strategies you can adopt to streamline the deployment of your APIs using API gateways.

Throughout this tutorial, we will use our API gateway of choice, [Apache APISIX](https://apisix.apache.org/), but you can translate these strategies to any other [API gateway](/posts/gateway-and-mesh/) or reverse proxy.

## API Versions

Yes, even that minor change can potentially break your client applications.

API versioning is the most straightforward strategy to make changes to your APIs without disrupting your clients. By versioning, you can let your clients decide whether to upgrade to the new API version. They can also update their applications to the new API at their own pace.

API gateways like APISIX can handle typical scenarios where your clients specify which version of the API to use in their requests. The version is typically specified in one of three ways:

1. In URI path (`/v1/products` and `/v2/products`)
2. In query parameters (`/products?version=v1` and `/products?version=v2`)
3. In custom request headers (`/products version: v1` and `/products version: v2`) or the `Accept` header (`/products Accept: application/vnd.shoppingapp.product.v1+json`)

APISIX can then be configured to route these requests to the appropriate API version.

### In URI Path

The example below shows how you can route traffic to different versions based on the path specified in the URI:

```shell
curl http://127.0.0.1:9180/apisix/admin/routes/1 -X PUT -d '
{
  "uri": "/v1/products",
  "upstream": {
    "type": "roundrobin",
    "nodes": {
      "api-v1:80": 1
    }
  },
  "plugins": {
    "proxy-rewrite": {
      "uri": "/products"
    }
  }
}'
```

```shell
curl http://127.0.0.1:9180/apisix/admin/routes/2 -X PUT -d '
{
  "uri": "/v2/products",
  "upstream": {
    "type": "roundrobin",
    "nodes": {
      "api-v2:80": 1
    }
  },
  "plugins": {
    "proxy-rewrite": {
      "uri": "/products"
    }
  }
}'
```

This configuration will route requests to path `/v1/products` to the `v1` service and the requests to the `v2/products` path to the `v2` service.

To forward requests to all paths to specific API versions, you can use regular expressions in your configuration:

```shell
curl http://127.0.0.1:9180/apisix/admin/routes/1 -X PUT -d '
{
  "uri": "/v1/*",
  "plugins": {
    "proxy-rewrite": {
      "regex_uri": ["/v1/(.*)", "/$1"]
    }
  },
  "upstream": {
    "type": "roundrobin",
    "nodes": {
      "api-v1:80": 1
    }
  }
}'
```

### In Query Parameters

Here, APISIX is configured to route traffic based on the version specified in the query parameter `version`. If the parameter has a value `v1`, the request is routed to the `v1` service, and if it has the value `v2`, the request is routed to the `v2` service:

```shell
curl http://127.0.0.1:9180/apisix/admin/routes/1 -X PUT -d '
{
  "uri": "/products",
  "vars": [["arg_version", "==", "v1"]],
  "upstream": {
    "type": "roundrobin",
    "nodes": {
      "api-v1:80": 1
    }
  }
}'
```

```shell
curl http://127.0.0.1:9180/apisix/admin/routes/2 -X PUT -d '
{
  "uri": "/products",
  "vars": [["arg_version", "==", "v2"]],
  "upstream": {
    "type": "roundrobin",
    "nodes": {
      "api-v2:80": 1
    }
  }
}'
```

### In Request Headers

Similar to routing based on query parameters, the below configuration routes requests based on headers. While `arg_<argument>` checks for `<argument>` in the query parameters, `http_<header>` checks for the `<header>` in the request headers:

```shell
curl http://127.0.0.1:9180/apisix/admin/routes/1 -X PUT -d '
{
  "uri": "/products",
  "vars": [["http_version", "==", "v1"]],
  "upstream": {
    "type": "roundrobin",
    "nodes": {
      "api-v1:80": 1
    }
  }
}'
```

```shell
curl http://127.0.0.1:9180/apisix/admin/routes/2 -X PUT -d '
{
  "uri": "/products",
  "vars": [["http_version", "==", "v2"]],
  "upstream": {
    "type": "roundrobin",
    "nodes": {
      "api-v2:80": 1
    }
  }
}'
```

If you are using the `Accept` header, you can use the configuration below:

```shell
curl http://127.0.0.1:9180/apisix/admin/routes/1 -X PUT -d '
{
  "uri": "/products",
  "vars": [["http_accept", "==", "application/vnd.shoppingapp.product.v1+json"]],
  "upstream": {
    "type": "roundrobin",
    "nodes": {
      "api-v1:80": 1
    }
  }
}'
```

## Backwards Compatible APIs

Multiple API versions cannot always get you far and sometimes, change is inevitable. A strategy to make changes to your API without breaking your client applications is to ensure backwards compatibility. i.e., the interface between your clients and the API remains the same while your API changes.

For example, if you change your API endpoint (from `/old/api` to `/new/api`), an API gateway can redirect client requests to the new API endpoint without changes to the client applications.

APISIX implements this through the [redirect](https://apisix.apache.org/docs/apisix/plugins/redirect/) and the [proxy-rewrite](https://apisix.apache.org/docs/apisix/plugins/proxy-rewrite/) plugins. The example below shows how you can configure redirects:

```shell
curl http://127.0.0.1:9180/apisix/admin/routes/1 -X PUT -d '
{
  "uri": "/old/api/products",
  "plugins": {
    "redirect": {
      "uri": "/new/api/products",
      "ret_code": 301
    }
  }
}'
```

> **Note**: Client applications need to be configured to follow redirects for this configuration to work.

There could be more complex scenarios where the client-API interface changes. For instance, if the new API expects the key `fullName` instead of `firstName` and `lastName`, clients sending requests in the old API format would break. APISIX can handle such scenarios through the [body-transformer](https://apisix.apache.org/docs/apisix/plugins/body-transformer/) plugin.

The example below shows how APISIX can transform the request body to make your APIs backwards compatible:

```shell
curl http://127.0.0.1:9180/apisix/admin/routes/1 -X PUT -d '
{
  "uri": "/login",
  "plugins": {
    "body-transformer": {
      "request": {
        "template": "{ \"fullName\": \"{{ firstName }} {{ lastName }}\" }"
      }
    }
  },
  "upstream": {
    "type": "roundrobin",
    "nodes": {
      "v2:80": 1
    }
  }
}'
```

Now a request body like,

```json
{
  "firstName": "Navendu",
  "lastName": "Pottekkat"
}
```

will be transformed to:

```json
{
  "fullName": "Navendu Pottekkat"
}
```

Similar transformations at the API gateway level should only be a temporary measure to ensure backwards compatibility as it could add costs in terms of latency or resource use.

## Shadow Deployments

Shadow deployment is a strategy to test new APIs with production traffic. This idea stems from the fact that handwritten test cases might not always simulate every complex real-world scenario.

Typically, a shadow deployment is carried out by mirroring (sending a copy) production traffic to the new API and ignoring its responses. This lets you test application errors and performance by examining logs and metrics with production traffic without really deploying your new API to production.

APISIX has a [proxy-mirror](https://apisix.apache.org/docs/apisix/plugins/proxy-mirror/) plugin that mirrors traffic to another service. The example below shows how you can configure the plugin on a specific route:

```shell
curl http://127.0.0.1:9180/apisix/admin/routes/1 -X PUT -d '
{
  "uri": "/products",
  "plugins": {
    "proxy-mirror": {
      "host": "http://v2:80"
    }
  },
  "upstream": {
    "nodes": {
      "v1:80": 1
    },
    "type": "roundrobin"
  }
}'
```

Once the plugin is configured, you can examine the logs and metrics from the gateway and your APIs using observability tools like [Prometheus](/posts/introduction-to-monitoring-microservices/) or [Elasticsearch](/posts/apisix-logs-elk/).

A key advantage of shadow deployments is the zero production impact. You can test your APIs with production traffic in a sandboxed test environment. However, you should ensure the test environment is sandboxed and does not send duplicate requests to other production services. This is usually achieved by using mock services.

## Canary Deployments

A [canary deployment strategy](/posts/canary-in-kubernetes/) can be quite helpful when you want to decouple the release of a new API from its deployment.

In a canary deployment, initially, a small percentage of traffic (say 10%) is routed to the new API version, while the rest remains to be routed to the existing API version. This allows you to test the new API in production for bugs without impacting a lot of your clients. Once the new API is deemed ready, traffic routed to it is gradually increased to 100%.

APISIX can achieve this routing through the [traffic-split](https://apisix.apache.org/docs/apisix/plugins/traffic-split/) plugin. The example below shows how you can configure this plugin on a specific route:

```shell
curl http://127.0.0.1:9180/apisix/admin/routes/1 -X PUT -d '
{
  "uri": "/products",
  "plugins": {
    "traffic-split": {
      "rules": [
        {
          "weighted_upstreams": [
            {
              "upstream": {
                "name": "v1",
                "type": "roundrobin",
                "nodes": {
                  "v1:80": 1
                }
              },
              "weight": 90
            },
            {
              "weight": 10
            }
          ]
        }
      ]
    }
  },
  "upstream": {
    "type": "roundrobin",
    "nodes": {
      "v2:80": 1
    }
  }
}'
```

There are similar strategies like blue-green deployments where half of the traffic is routed to one API version, and the other half is routed to the new API version. This can be configured by setting 50-50 weights in the `traffic-split` plugin:

```shell {hl_lines=["17", "20"]}
curl http://127.0.0.1:9180/apisix/admin/routes/1 -X PUT -d '
{
  "uri": "/products",
  "plugins": {
    "traffic-split": {
      "rules": [
        {
          "weighted_upstreams": [
            {
              "upstream": {
                "name": "v1",
                "type": "roundrobin",
                "nodes": {
                  "v1:80": 1
                }
              },
              "weight": 50
            },
            {
              "weight": 50
            }
          ]
        }
      ]
    }
  },
  "upstream": {
    "type": "roundrobin",
    "nodes": {
      "v2:80": 1
    }
  }
}'
```

You can also set up A/B testing, a blue-green deployment with more emphasis on testing and experimentation than deploying new API versions. Bobur discusses some of these strategies in detail in [this article](https://api7.ai/blog/api-release-strategies-with-api-gateway).


## Feature Flags

Sometimes, you want to test new features that do not involve changes to the client-API interface. In such scenarios, running a new API version with this additional feature might require more resources than necessary.

A simple strategy is configuring feature flags that are dynamic on/off switches in your APIs. An API gateway can act as the feature flag service that all your APIs can listen to decide whether to enable or disable a feature. This works well because the API gateway is already central to your APIs, and there is no need to set up an additional service just to manage the feature flags.

APISIX can add feature-specific headers to requests from specific client groups, like beta testers using the `proxy-rewrite` plugin. Your API can then check if this header exists and allow access to new features to these clients without exposing it generally.

The example below adds a `Beta` header to clients in the `beta_testers` consumer group:

```shell
curl http://127.0.0.1:9180/apisix/admin/consumer_groups/beta_testers -X PUT -d '
{
  "plugins": {
    "proxy-rewrite": {
      "headers": {
        "set": {
          "Beta": "true"
        }
      }
    }
  }
}'
```

## Communication

Communicating with your clients is the most crucial strategy to complement all these strategies. Regardless of which other strategy you pick, communicating it with your clients beforehand can ensure that they are not caught off-guard and have sufficient time to adapt.

Companies like Google, Facebook, and Twitter, which have a large number of clients using their APIs, have frequently introduced breaking changes to their APIs. However, these companies have ensured that they communicate these changes, provide assistance and documentation to migrate to new API versions, and offer long deprecation periods to ensure clients can transition smoothly.

The best strategies are often simple.

To learn more about Apache APISIX, visit [apisix.apache.org](https://apisix.apache.org).
