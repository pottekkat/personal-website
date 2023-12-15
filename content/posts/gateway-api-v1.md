---
title: "Kubernetes Gateway API v1.0: Should You Switch?"
date: 2023-12-15T09:26:28+05:30
draft: false
ShowToc: true
TocOpen: true
canonicalURL: "https://api7.ai/blog/gateway-api-v1"
ShowCanonicalLink: true
ShowRelatedContent: false
summary: "The Kubernetes API was recently made generally available. Does that mean you should switch away from the Ingress API?"
tags: ["kubernetes", "ingress", "api gateway"]
categories: ["Kubernetes"]
cover:
  image: "/images/gateway-api-v1/ship-wheel-banner.jpg"
  alt: "A wheel of a ship."
  caption: "The Gateway API probably has the best logo of any Kubernetes project."
  relative: false
---

It has been over a month since the [Kubernetes Gateway API made its v1.0 release](https://kubernetes.io/blog/2023/10/31/gateway-api-ga/), signifying graduation to the generally available status for some of its key APIs.

I [wrote about the Gateway API](/posts/gateway-vs-ingress-api/) when it graduated to beta last year, but a year later, the question still remains. Should you switch to the Gateway API from the Ingress API?

[My answer from last year](/posts/gateway-vs-ingress-api/#is-this-the-end-of-ingress-api) was you shouldn't. And I had _strong_ reasons.

The Gateway API and its implementations were still in their infancy. The Ingress API, on the other hand, was stable and covered some primary use cases that might work for most users.

For users requiring more capabilities, I suggested using the [custom resources](/posts/extending-apisix-ingress/#custom-crds) provided by the Ingress controllers by trading off portability (switching between different Ingress implementations).

With the v1.0 release, this might change. The Gateway API is much more capable now, and its [20+ implementations](https://gateway-api.sigs.k8s.io/implementations/) are catching up quickly.

So, if you are starting anew and choosing between the Ingress and the Gateway API, I suggest you pick the Gateway API if the API and the [implementation you choose](https://apisix.apache.org/docs/ingress-controller/tutorials/configure-ingress-with-gateway-api/) support all the features you want.

## What's Wrong with the Ingress API?

The [Ingress API](https://kubernetes.io/docs/concepts/services-networking/ingress/) works very well, but only for a small subset of common use cases. To extend its capabilities, Ingress implementations started using custom annotations.

For example, if you chose Nginx Ingress, you will use some of its [dozens of annotations](https://github.com/kubernetes/ingress-nginx/blob/main/docs/user-guide/nginx-configuration/annotations.md) that are not portable if you decide to switch to another Ingress implementation like [Apache APISIX](https://apisix.apache.org/docs/ingress-controller/concepts/annotations/).

These implementation-specific annotations are also cumbersome to manage and defeat the purpose of managing Ingress in a Kubernetes-native way.

Eventually, Ingress controller implementations started developing their own CRDs to expose more features to Kubernetes users. These CRDs are specific to the Ingress controller. But if you can sacrifice portability and stick to one Ingress controller, the CRDs are easier to work with and offer more features.

The Gateway API aims to solve this problem once and for all by providing the vendor agnosticism of the Ingress API and the flexibility of the CRDs. It is positioned very well to achieve this goal.

In the long term, the Ingress API is not expected to receive any new features, and all efforts will be made to converge with the Gateway API. So, adopting the Ingress API can cause issues when you inadvertently hit limits with its capabilities.

## Obvious Benefits

Expressive, extensible, and role-oriented are the key ideas that shaped the development of the Gateway API.

Unlike the Ingress API, the Gateway API is a collection of multiple APIs (HTTPRoute, Gateway, GatewayClass, etc.), each catering to different organizational roles.

For example, the application developers need to only care about the HTTPRoute resource, where they can define rules to route traffic. They can delegate the cluster-level details to an operator who manages the cluster and ensures that it meets the developers' needs using the Gateway resource.

{{< figure src="/images/gateway-api-v1/gateway-api.png#center" title="The Gateway API" caption="Adapted from [gateway-api.sigs.k8s.io](https://gateway-api.sigs.k8s.io/)" link="/images/gateway-api-v1/gateway-api.png" target="_blank" class="align-center" >}}

This [role-oriented design](https://gateway-api.sigs.k8s.io/#why-does-a-role-oriented-api-matter) of the API allows different people to use the cluster while maintaining control.

The Gateway API is also much more capable than the Ingress API. Features that require annotations in the Ingress API are supported out-of-the-box in the Gateway API.

## An Official Extension

Although the Gateway API is an official Kubernetes API, it is implemented as a set of CRDs.

This is no different from using default Kubernetes resources. But you just have to [install these CRDs](https://gateway-api.sigs.k8s.io/guides/#installing-gateway-api) like an official extension.

{{< figure src="/images/gateway-api-v1/apisix-ingress-controller.png#center" title="APISIX's Gateway API Support" caption="The Ingress controller translates the Kubernetes resources to APISIX configuration implemented by API gateway." link="/images/gateway-api-v1/apisix-ingress-controller.png" target="_blank" class="align-center" >}}

This allows for fast iteration compared to Kubernetes, which is slowly moving toward long-term stability.

## Will It Proliferate?

As [this famous XKCD comic](https://xkcd.com/927/) reminds us frequently, standards tend to proliferate.

A version of this was seen in the Ingress and Gateway APIs. It usually goes like this:

1. A standard emerges to unify different projects/their standards (Kubernetes Ingress API).
2. The unified standard has limitations the implementors want to overcome (Ingress API was limited).
3. Implementations diverge from the standard because of these limitations (Custom CRDs, annotations).
4. Each implementation now has its own standard (non-portable CRDs, annotations).
5. A new standard emerges to unify these different standards (Kubernetes Gateway API).

It is reasonable to think that the Gateway API might not be the end game here. But I believe it has every chance of being the standard for routing in Kubernetes.

Again, I have my _strong_ reasons.

Broad adoption is critical to prevent standard proliferation as there are fewer incentives for the implementations to work on a different standard. The Gateway API already has more than 25 implementations.

An implementation can conform to the Gateway API on different levels:

1. **Core**: All implementations are expected to conform to these.
2. **Extended**: These might only be available in some implementations but are standard APIs.
3. **Implementation-specific**: Specific to implementations but added through standard extension points.

A niche feature can move from implementation-specific to extended to core as more implementations support these features. i.e., the API allows room for custom extensions while ensuring it follows the standard.

The [Service Mesh Interface (SMI)](https://smi-spec.io/) project was a similar attempt to standardize configuring service meshes in Kubernetes. However, the project received little traction after the initial involvement of the service mesh projects and slowly died out.

SMI did not support many common denominator features that users expected in a service mesh. It also did not move fast enough to support these features. Eventually, service mesh implementations fell behind in conforming to SMI (I used to work closely with SMI under the [CNCF TAG Network](https://github.com/cncf/tag-network) on a project that reported SMI conformance).

These are universal reasons, but the project is now being resurrected through the Gateway API. The [Gateway API for Mesh Management and Administration (GAMMA) initiative](https://gateway-api.sigs.k8s.io/#gateway-api-for-service-mesh-the-gamma-initiative) aims to extend the Gateway API to work with service meshes.

The SMI project [recently merged with the GAMMA initiative](https://smi-spec.io/blog/announcing-smi-gateway-api-gamma/), which is excellent for the Gateway API. Istio, undoubtedly the most popular service mesh, also [announced](https://istio.io/latest/blog/2022/gateway-api-beta/) that the Gateway API will be the default API to manage Istio in the future. Such adoptions prevent proliferation.

## Migration Guide

The [Gateway API documentation](https://gateway-api.sigs.k8s.io/guides/migrating-from-ingress/) has a comprehensive guide on migrating your Ingress resources to Gateway resources. Instead of restating it, let's try using the [ingress2gateway](https://github.com/kubernetes-sigs/ingress2gateway) tool to convert our Ingress resources to corresponding Gateway API resources.

You can download and install the binary for your operating system directly from the [releases page](https://github.com/kubernetes-sigs/ingress2gateway/releases/tag/v0.1.0).

Let's take a simple Ingress resource:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: httpbin-route
spec:
  ingressClassName: apisix
  rules:
    - host: local.httpbin.org
      http:
        paths:
          - backend:
              service:
                name: httpbin
                port:
                  number: 80
            path: /
            pathType: Prefix
```

This will route all traffic with the provided host address to the `httpbin` service.

To convert it to the Gateway API resource, we can run:

```shell
ingress2gateway print --input_file=ingress.yaml
```

This Gateway API resource will be as shown below:

```yaml
apiVersion: gateway.networking.k8s.io/v1alpha2
kind: HTTPRoute
metadata:
  name: httpbin-route
spec:
  hostnames:
  - local.httpbin.org
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /
    backendRefs:
    - name: httpbin
      port: 80
```

## Viable Alternatives

There are other viable alternatives for configuring gateways in Kubernetes.

In Apache APISIX, you can deploy it in [standalone mode](https://apisix.apache.org/docs/apisix/next/deployment-modes/#standalone) and define route configurations in a yaml file. You can update this yaml file through traditional workflows, and it can be pretty helpful in scenarios where managing the gateway configuration via the Kubernetes API is not required.

[Implementation-specific custom CRDs](https://apisix.apache.org/docs/ingress-controller/tutorials/proxy-the-httpbin-service/) are also viable alternatives if you don't plan to switch to a different solution or if your configuration is small enough to migrate easily.

In any case, the Gateway API is here to stay.
