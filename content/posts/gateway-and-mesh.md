---
title: "A Comprehensive Guide to API Gateways, Kubernetes Gateways, and Service Meshes"
date: 2023-05-05T09:15:19+05:30
draft: false
ShowToc: false
ShowRelatedContent: true
summary: "A comprehensive comparison of API gateways, Kubernetes gateways, and service meshes with actionable insights."
tags: ["api gateway", "service mesh", "kubernetes"]
categories: ["API Gateway"]
cover:
    image: "/images/gateway-and-mesh/mesh-banner.jpeg"
    alt: "A photo of a mesh that is likely the weaving in a wooden chair."
    caption: "Photo by [Anna Tarazevich](https://www.pexels.com/photo/close-up-photo-of-natural-rattan-hexagonal-woven-material-6594391/)"
    relative: false
---

**Translations**: [Simplified Chinese | 简体中文](https://lib.jimmysong.io/blog/gateway-and-mesh/).

There is still a lot of confusion about API gateways, Kubernetes gateways, and service meshes. A lot of this is because:

1. People often mention these technologies with the same keywords, like canary deployments, rate limiting, and service discovery.
2. All these technologies use reverse proxies.
3. Some API gateways have their own Kubernetes gateways and service meshes and vice versa.
4. There are a lot of articles/videos that compare the three technologies and conclude why one is better than the other.

In this article, I will try to explain these technologies and share how they fundamentally differ and cater to different use cases.

## API Gateways

An API gateway sits between your client applications and your APIs. It accepts all client requests, forwards them to the required APIs, and returns the response to clients in a combined package.

It is basically a reverse proxy with a lot of capabilities.

{{< figure src="/images/gateway-and-mesh/api-gateway.png#center" title="API gateway" link="/images/gateway-and-mesh/api-gateway.png" target="_blank" class="align-center" >}}

On top of this, an API gateway can also have features like authentication, security, fine-grained traffic control, and monitoring, leaving the API developers to focus only on business needs.

There are [many API gateway solutions available](https://landscape.cncf.io/card-mode?category=api-gateway&grouping=category). Some of the popular free and open source solutions are:

- **[Apache APISIX](https://github.com/apache/apisix)**: A high-performance, extensible, cloud native API gateway built on top of Nginx.
- **[Gloo Edge](https://github.com/solo-io/gloo)**: An API gateway built on top of Envoy proxy.
- **[Kong](https://github.com/kong/kong)**: A pluggable API gateway also built on Nginx.
- **[Tyk](https://github.com/TykTechnologies/tyk)**: An API gateway written in Go supporting REST, GraphQL, TCP, and gRPC protocols.

Cloud platforms like [GCP](https://cloud.google.com/api-gateway), [AWS](https://aws.amazon.com/api-gateway/), and [Azure](https://learn.microsoft.com/en-us/azure/api-management/) also have their own proprietary API gateways.

API gateways, Kubernetes gateways, and service meshes support canary deployments—gradually rolling out a new software version to a small subset of users before making it generally available.

The example below shows how to configure a canary deployment in Apache APISIX.

{{< figure src="/images/gateway-and-mesh/canary-api-gateway.png#center" title="Canary deployments with an API gateway" link="/images/gateway-and-mesh/canary-api-gateway.png" target="_blank" class="align-center" >}}

You can send a request to the [APISIX Admin API](https://apisix.apache.org/docs/apisix/admin-api/) with the following configuration:

```shell
curl http://127.0.0.1:9180/apisix/admin/routes/1 \
-H 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1' -X PUT -d '
{
  "uri":"/*",
  "plugins":{
    "traffic-split":{
      "rules":[
        {
          "weighted_upstreams":[
            {
              "upstream":{
                "name":"api-v1",
                "type":"roundrobin",
                "nodes":{
                  "api-v1:8080":1
                }
              },
              "weight":95
            },
            {
              "weight":5
            }
          ]
        }
      ]
    }
  },
  "upstream":{
    "type":"roundrobin",
    "nodes":{
      "api-v2:8080":1
    }
  }
}'
```

APISIX will now route 95% of the traffic to the api-v1 service and 5% to the api-v2 service.

## Kubernetes Gateways

Kubernetes gateways are just Kubernetes-native API gateways. i.e., you can manage these API gateways with the Kubernetes API, similar to a Kubernetes pod, service, or deployment.

In Kubernetes, your APIs are pods and services deployed in a cluster. You then use a Kubernetes gateway to direct external traffic to your cluster.

Kubernetes provides two APIs to achieve this, the [Ingress API](https://kubernetes.io/docs/concepts/services-networking/ingress/) and the [Gateway API](https://gateway-api.sigs.k8s.io/).

{{< figure src="/images/gateway-and-mesh/kubernetes-gateway.png#center" title="Kubernetes gateway" link="/images/gateway-and-mesh/kubernetes-gateway.png" target="_blank" class="align-center" >}}

### Kubernetes Ingress API

The Ingress API was created to overcome the limitations of the default service types, [NodePort](https://kubernetes.io/docs/concepts/services-networking/service/#type-nodeport) and [LoadBalancer](https://kubernetes.io/docs/concepts/services-networking/service/#loadbalancer), by introducing features like routing and SSL termination. It also standardized how you expose Kubernetes services to external traffic.

It has two components, the [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/#the-ingress-resource) and the [Ingress controller](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/).

The Ingress Kubernetes native object defines a set of rules on how external traffic can access your services.

This example configuration shows routing traffic based on URI path with the Kubernetes Ingress object:

```yaml {title="route-traffic.yaml"}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-routes
spec:
  ingressClassName: apisix
  rules:
    - http:
        paths:
          - backend:
              service:
                name: api-v1
                port:
                  number: 8080
            path: /v1
            pathType: Exact
          - backend:
              service:
                name: api-v2
                port:
                  number: 8080
            path: /v2
            pathType: Exact
```

An Ingress controller implements these rules and routes traffic to your cluster using a reverse proxy.

There are over [20 Ingress controller implementations](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/#additional-controllers). APISIX has an [Ingress controller](https://apisix.apache.org/docs/ingress-controller/next/getting-started/) that wraps around APISIX API gateway to work as Kubernetes Ingress.

{{< figure src="/images/gateway-and-mesh/apisix-ingress.png#center" title="APISIX Ingress" link="/images/gateway-and-mesh/apisix-ingress.png" target="_blank" class="align-center" >}}

The APISIX Ingress controller converts the Kubernetes Ingress object to APISIX configuration.

{{< figure src="/images/gateway-and-mesh/translate.png#center" title="APISIX Ingress controller translates configuration" link="/images/gateway-and-mesh/translate.png" target="_blank" class="align-center" >}}

APISIX then implements this configuration.

{{< figure src="/images/gateway-and-mesh/route-ingress.png#center" title="Canary deployments with Kubernetes Ingress API" link="/images/gateway-and-mesh/route-ingress.png" target="_blank" class="align-center" >}}

You can swap APISIX with any other Ingress controller, as the Ingress API is not tied to any specific implementation.

This vendor neutrality works well for simple configurations. But if you want to do complex routing like a canary deployment, you must rely on vendor-specific annotations.

The example below shows how to configure a canary deployment using [Nginx Ingress](https://docs.nginx.com/nginx-ingress-controller/). The [custom annotations](https://github.com/kubernetes/ingress-nginx/blob/main/docs/user-guide/nginx-configuration/annotations.md#canary) used here are specific to Nginx:

```yaml {title="canary-ingress.yaml"}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "5"
  name: api-canary
spec:
  rules:
  - http:
      paths:
      - backend:
          serviceName: api-v2
          servicePort: 8080
        path: /
```

The above configuration will route 5% of the traffic to the api-v2 service.

In addition to annotations, Ingress controllers like APISIX have custom Kubernetes CRDs to overcome the limitations of the Ingress API.

The example below uses the APISIX CRD, [ApisixRoute](https://apisix.apache.org/docs/ingress-controller/concepts/apisix_route/) to configure a canary deployment:

```yaml {title="canary-crds.yaml"}
apiVersion: apisix.apache.org/v2
kind: ApisixRoute
metadata:
  name: api-canary
spec:
  http:
    - name: route
      match:
        paths:
          - /*
      backends:
        - serviceName: api-v1
          servicePort: 8080
          weight: 95
        - serviceName: api-v2
          servicePort: 8080
          weight: 5
```

These custom CRDs made it much easier to configure Ingress and leverage the full capabilities of the API gateway underneath but at the expense of portability.

### Kubernetes Gateway API

The Gateway API is a new Kubernetes object that aims to "fix" the Ingress API.

It takes inspiration from the custom CRDs developed by Ingress controllers to add HTTP header-based matching, weighted traffic splitting, and [other features](https://gateway-api.sigs.k8s.io/#gateway-api-concepts) that require custom proprietary annotations with the Ingress API.

The example below shows configuring a canary deployment with the Kubernetes Gateway API:

```yaml {title="canary-gateway.yaml"}
apiVersion: gateway.networking.k8s.io/v1alpha2
kind: HTTPRoute
metadata:
  name: api-canary
spec:
  rules:
  - backendRefs:
    - name: api-v1
      port: 8080
      weight: 95
    - name: api-v2
      port: 8080
      weight: 5
```

Any Ingress controller (that implements the Gateway API) can now implement this configuration.

The Gateway API also makes [many improvements](/posts/gateway-vs-ingress-api/) over the Ingress API, but it is still in alpha, and the Gateway API implementations are constantly breaking.

## Service Meshes

API gateways and Kubernetes gateways work across application boundaries solving edge problems while abstracting your APIs.

Service Meshes solve a different challenge.

A service mesh is more concerned about inter-service communication (east-west traffic) than service-client communication (north-south traffic).

Typically, this is achieved by deploying sidecar proxies with APIs/services.

{{< figure src="/images/gateway-and-mesh/service-mesh.png#center" title="Service mesh" link="/images/gateway-and-mesh/service-mesh.png" target="_blank" class="align-center" >}}

Here, the sidecar proxies handle the service-to-service communication instead of the developer having to code the networking logic to the services.

There are a lot of service meshes available. Some of the popular ones are:

- **[Istio](https://istio.io/)**: By far the most popular service mesh. It is built on top of [Envoy proxy](https://www.envoyproxy.io/), which many service meshes use.
- **[Linkerd](https://linkerd.io/)**: A lightweight service mesh that uses linkerd2-proxy, written in Rust specifically for Linkerd.
- **[Consul Connect](https://developer.hashicorp.com/consul/docs/connect)**: A service mesh emphasizing security and observability. It can work with either a built-in proxy or Envoy.

New service mesh offerings like [Cilium](https://isovalent.com/blog/post/introducing-cilium-mesh/) offer alternatives to sidecar-based service meshes by using networking capabilities directly from the kernel through [eBPF](https://ebpf.io/).

{{< figure src="/images/gateway-and-mesh/cilium-mesh.png#center" title="Sidecar-less service mesh" caption="A typical service mesh requires 8 proxies for 8 services whereas eBPF-based service meshes like Cilium don't. Adapted from [Cilium Service Mesh – Everything You Need to Know](https://isovalent.com/blog/post/cilium-service-)" link="/images/gateway-and-mesh/cilium-mesh.png" target="_blank" class="align-center" >}}

Service meshes also have basic ingress/egress gateways to handle north-south traffic to and from the services. Ingress gateways are the entry points of external traffic to a service mesh, and egress gateways allow services inside a mesh to access external services.

{{< figure src="/images/gateway-and-mesh/ingress-egress-mesh.png#center" title="Ingress and egress gateways with a service mesh" link="/images/gateway-and-mesh/ingress-egress-mesh.png" target="_blank" class="align-center" >}}

Apache APISIX also has a service mesh implementation called [Amesh](https://github.com/api7/Amesh). It works with Istio's control plane using the xDS protocol replacing the default Envoy proxy in the sidecar.

A service mesh lets you configure canary deployments. For example, you can split the requests from one service between two versions of another service.

{{< figure src="/images/gateway-and-mesh/canary-mesh.png#center" title="Canary deployments with a service mesh" link="/images/gateway-and-mesh/canary-mesh.png" target="_blank" class="align-center" >}}

The example below shows configuring a [canary deployment with Istio service mesh](https://istio.io/latest/docs/concepts/traffic-management/):

```yaml {title="canary-mesh-vs.yaml"}
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: api-virtual-service
spec:
  hosts:
    - api
  http:
    - route:
        - destination:
            host: api
            subset: v1
          weight: 80
        - destination:
            host: api
            subset: v2
          weight: 20
```

```yaml {title="canary-mesh-dr.yaml"}
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: api-destination-rule
spec:
  host: api
  subsets:
    - name: v1
      labels:
        version: "1.0"
    - name: v2
      labels:
        version: "2.0"
```

These configurations are specific to Istio. To switch to a different service mesh, you must create a different but similarly vendor-dependant configuration.

The [Service Mesh Interface](https://smi-spec.io/) (SMI) specification was created to solve this portability issue.

The SMI [spec](https://github.com/servicemeshinterface/smi-spec) is a set of Kubernetes CRDs that a service mesh user can use to define applications without binding to service mesh implementations.

A standardization attempt will only work if all the projects are on board. But this did not happen with the SMI spec, and [only a few projects participated actively](https://layer5.io/service-mesh-landscape#smi).

More recently, the [Kubernetes SIG Network](https://github.com/kubernetes/community/tree/master/sig-network) has been evolving the Gateway API to support service meshes.

The [GAMMA (Gateway API for Mesh Management and Administration) initiative](https://gateway-api.sigs.k8s.io/contributing/gamma/) is a dedicated group with the Gateway API project with goals to "investigate, design, and track Gateway API resources, semantics, and other artifacts related to service mesh technology and use-cases."

Gateway API is a natural next step to the Ingress API, but we must wait to see how it will work for service meshes. Istio [has announced](https://istio.io/latest/blog/2022/gateway-api-beta/) its intention to use the Gateway API as its default API for all traffic management and continues to drive the project forward.

The example below shows [configuring a canary deployment in Istio with the Gateway API](https://istio.io/latest/docs/tasks/traffic-management/traffic-shifting/). The underlying idea is using [parentRefs](https://gateway-api.sigs.k8s.io/v1alpha2/references/spec/#gateway.networking.k8s.io%2fv1beta1.ParentReference) to attach to other services instead of the gateway:

```yaml {title="canary-gateway-mesh.yaml"}
apiVersion: gateway.networking.k8s.io/v1beta1
kind: HTTPRoute
metadata:
  name: api-canary
spec:
  parentRefs:
  - kind: Service
    name: api-a
    port: 8080
  rules:
  - backendRefs:
    - name: api-b-v1
      port: 8080
      weight: 95
    - name: api-b-v2
      port: 8080
      weight: 5
```

There are [some concerns](https://thenewstack.io/the-gateway-api-is-in-the-firing-line-of-the-service-mesh-wars/) that the GAMMA project might become skewed to serve the needs of one particular project than the larger community, which will eventually lead to other projects using their own APIs, similar to the [custom CRD scenario](/posts/gateway-vs-ingress-api/#custom-crds--ingress-api) after the Kubernetes Ingress API.

But the Gateway API project has been the best attempt at standardizing traffic management in service meshes. The [SMI project also joined the GAMMA initiative](https://smi-spec.io/blog/announcing-smi-gateway-api-gamma/) with a shared vision and will help advocate for consistent implementations of the Gateway API by service mesh projects.

Other projects like [Flagger](https://docs.flagger.app/tutorials/gatewayapi-progressive-delivery) and [Argo Rollouts](https://github.com/argoproj-labs/rollouts-plugin-trafficrouter-gatewayapi) have also integrated with the Gateway API.

## What Should You Use?

There is only one correct answer to this question; "it depends."

If you are developing APIs and need authentication, security, routing, or metrics, you are better off using an API gateway than building this on your own in your APIs.

If you want to do something similar in a Kubernetes environment, you should use a Kubernetes gateway instead of trying to wrangle your API gateway to work on Kubernetes. Thankfully, a lot of API gateways also work with Kubernetes-native configurations.

But sometimes, the features offered by an API gateway + Ingress controller might be an overkill for a Kubernetes environment, and you might want to switch back to simple traffic management.

Service meshes, on the other hand, solve an entirely different set of problems. They also bring their own gateways to handle north-south traffic (usually enough) but also let you use your own gateways with more features.

The convergence of the API gateway and the service mesh through the Kubernetes Gateway API should make it easier for the application developer to focus on solving problems than worry about the underlying implementation.

Projects like Apache APISIX use the same technology to build the API gateway and service mesh offerings and integrate well with these specifications, incentivizing vendor-neutral choices.

It is also likely that you will not need any of these. You may [not even need microservices](https://blog.frankel.ch/chopping-monolith/) or a distributed architecture, but when you need them, gateways and meshes can make your lives a lot easier.
