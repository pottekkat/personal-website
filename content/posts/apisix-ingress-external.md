---
title: "Accessing External Services through APISIX Ingress"
date: 2023-10-27T09:14:16+05:30
draft: false
ShowToc: false
ShowRelatedContent: false
summary: "A short guide on why and how you might use APISIX to access external services in Kubernetes."
tags: ["ingress", "kubernetes", "apache apisix", "cloud-native"]
categories: ["API Gateway"]
series: ["Hands-On With Apache APISIX Ingress"]
cover:
  image: "/images/apisix-ingress-external/barbed-wire-banner.jpg"
  alt: "A person trying to climb over a barbed wire fence."
  caption: "There could be a lot of reasons why you might want to access services outside your Kubernetes cluster using an Ingress."
  relative: false
---

I recently came across an APISIX user trying to access a service outside the Kubernetes cluster through their Ingress. There could be multiple scenarios where someone might want to do that:

1. **Hybrid environments**: You can have a part of your application running inside a Kubernetes cluster and another outside it or even on a different cloud environment. In scenarios where such setup is inevitable, routing traffic from the cluster to these external services might be needed.
2. **Legacy systems**: While migrating to Kubernetes from a legacy system, you might still have some services on the latter to avoid downtime. An Ingress can route traffic to these legacy systems until they are fully migrated to Kubernetes.
3. **Third-party services**: Your application might need to access third-party services outside the cluster. Using your Ingress to route traffic to and between your cluster and such externally hosted service could be helpful in such scenarios.

{{< figure src="/images/apisix-ingress-external/accessing-external-services.png#center" title="Accessing External Services through APISIX Ingress" caption="The external service could be legacy systems, applications in hybrid environments, or third-party services." link="/images/apisix-ingress-external/accessing-external-services.png" target="_blank" class="align-center" >}}

There could be even more use cases where this might be helpful. In this short article, I will explain how you can configure this in APISIX Ingress.

Before you move on, ensure you have [deployed APISIX and APISIX Ingress controller](/posts/hands-on-set-up-ingress-on-kubernetes-with-apache-apisix-ingress-controller/) in your Kubernetes cluster.

## Example Setup

We will deploy APISIX Ingress in Kubernetes and configure it to route to an externally deployed instance of [HTTPBin](https://httpbin.org/).

{{< figure src="/images/apisix-ingress-external/httpbin-setup.png#center" title="Example setup" caption="A simple setup to demonstrate how to configure accessing external services in APISIX Ingress." link="/images/apisix-ingress-external/httpbin-setup.png" target="_blank" class="align-center" >}}

## Configuring the External Service

Once you have APISIX and the APISIX Ingress controller running in your cluster, you can use the custom CRDs ([why?](/posts/gateway-vs-ingress-api/#is-this-the-end-of-ingress-api)) provided by APISIX for configuration.

First, we configure an upstream resource that contains the details of the external service we are accessing. To do this, we can create an [ApisixUpstream](https://apisix.apache.org/docs/ingress-controller/concepts/apisix_upstream/) resource as shown below:

```yaml {title="httpbin-upstream.yaml"}
apiVersion: apisix.apache.org/v2
kind: ApisixUpstream
metadata:
  name: httpbin-upstream
spec:
  externalNodes:
    - type: Domain
      name: httpbin.org
```

This will configure `httpbin.org` as the upstream. The type `Domain` indicates that this is a third-party service.

## Routing to the External Service

Once you have configured the upstream to point to the external service, we can create a route to use this upstream. This can be configured through the [ApisixRoute](https://apisix.apache.org/docs/ingress-controller/concepts/apisix_route/) CRD:

```yaml {title="httpbin-route.yaml"}
apiVersion: apisix.apache.org/v2
kind: ApisixRoute
metadata:
  name: httpbin-route
spec:
  http:
    - name: httpbin-route
      match:
        hosts:
          - test.navendu.me
        paths:
          - /*
      upstreams:
        - name: httpbin-upstream
```

This will create a route that matches all requests with the header `test.navendu.me` and forwards it to `httpbin-upstream`, the externally deployed HTTPBin.

Now, if we send a request to APISIX, it will be routed to the external HTTPBin service:

```shell
curl http://127.0.0.1:50311/anything -H 'host:test.navendu.me'
```

```json {title="output"}
{
  "args": {},
  "data": "",
  "files": {},
  "form": {},
  "headers": {
    "Accept": "*/*",
    "Host": "test.navendu.me",
    "User-Agent": "curl/8.1.2",
    "X-Amzn-Trace-Id": "Root=1-65326ab6-6187e69f6e6afjd59e34e601",
    "X-Forwarded-Host": "test.navendu.me"
  },
  "json": null,
  "method": "GET",
  "origin": "14.223.0.1, 59.39.192.167",
  "url": "http://test.navendu.me/anything"
}
```

## What's Next?

You can also learn more about using APISIX in Kubernetes from the [official documentation](https://apisix.apache.org/docs/ingress-controller/getting-started/). If you want to see more articles on specific topics, please reach out to me at [navendu@apache.org](mailto:navendu@apache.org)

_See the complete list of articles in the series "[Hands-On With Apache APISIX Ingress](/series/hands-on-with-apache-apisix-ingress/)"._
