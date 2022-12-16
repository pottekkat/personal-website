---
title: "Hands-On: Extending Apache APISIX Ingress with Annotations, CRDs, and Plugins"
date: 2022-12-16T10:04:02+05:30
draft: false
weight: 7
ShowToc: false
summary: "A hands-on tutorial on leveraging the full features provided by APISIX in Kubernetes Ingress."
tags: ["ingress", "kubernetes", "apache apisix", "cloud-native"]
categories: ["API Gateway"]
series: ["Hands-On With Apache APISIX Ingress"]
cover:
    image: "/images/extending-apisix-ingress/docks-banner.jpeg"
    alt: "A photo of a dock that is almost empty."
    caption: "Photo by [Pixabay](https://www.pexels.com/photo/sea-sunset-ocean-relaxing-55839/)"
    relative: false
---

_This article is a part of the series "[Hands-On With Apache APISIX Ingress](/series/hands-on-with-apache-apisix-ingress/)"._

The [default Kubernetes Ingress resource](https://kubernetes.io/docs/concepts/services-networking/ingress/#the-ingress-resource) exposes many standard features provided by Ingress controller implementations. However, if you use Ingress controllers like [Apache APISIX](https://apisix.apache.org/docs/ingress-controller/next/getting-started/), the default Ingress resource will limit its full capabilities.

This tutorial will look at how you can use [annotations](#annotations), [custom resource definitions (CRDs)](#custom-crds), and [Plugins](#plugins) to extend Kubernetes Ingress to include the full capabilities of APISIX.

Before you move on, make sure you:

1. Have access to a Kubernetes cluster. This tutorial uses [minikube](https://minikube.sigs.k8s.io/) for creating a cluster.
2. Install the [sample application](/posts/hands-on-set-up-ingress-on-kubernetes-with-apache-apisix-ingress-controller/#deploying-a-sample-application) and [APISIX](/posts/hands-on-set-up-ingress-on-kubernetes-with-apache-apisix-ingress-controller/#deploying-apisix-ingress) in your Kubernetes cluster.

## Annotations

Ingress controller implementations use annotations for configuring additional parameters. Each of the implementations has different annotations that are unique to it.

APISIX supports [14 annotations](https://apisix.apache.org/docs/ingress-controller/next/concepts/annotations/) which you can use to enable and configure features not exposed by the default Ingress resource.

In our example, we will configure APISIX to only allow traffic from a single IP address. This can be configured by using the annotation `k8s.apisix.apache.org/allowlist-source-range` as shown below:

```yaml {title="ip-filter.yaml"}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-routes
  annotations:
    k8s.apisix.apache.org/allowlist-source-range: "172.17.0.1"
spec:
  ingressClassName: apisix
  rules:
    - host: local.navendu.me
      http:
        paths:
          - backend:
              service:
                name: bare-minimum-api-v1
                port:
                  number: 8080
            path: /v1
            pathType: Exact
          - backend:
              service:
                name: bare-minimum-api-v2
                port:
                  number: 8081
            path: /v2
            pathType: Exact
```

Now, if we make requests from a different IP address, we will get the response:

```json {title="output"}
{"message":"Your IP address is not allowed"}
```

But the problem with annotations is that they can get messy. Nginx Ingress has more than [100+ annotations](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/), and using them takes work.

## Custom CRDs

Instead of restricting your additional configurations to annotations, you can use APISIX's [custom CRDs](https://apisix.apache.org/docs/ingress-controller/next/references/apisix_route_v2/).

These are custom Kubernetes resources tailored for configuring APISIX. The configuration is similar if you are already familiar with APISIX, making it much easier to leverage the complete feature set of APISIX.

The example below shows how you can split traffic between two services using the [ApisixRoute](https://apisix.apache.org/docs/ingress-controller/next/references/apisix_route_v2/) CRD:

```yaml {title="traffic-split.yaml"}
apiVersion: apisix.apache.org/v2
kind: ApisixRoute
metadata:
  name: method-route
spec:
  http:
    - name: method
      match:
        hosts:
          - local.navendu.me
        paths:
          - /api
      backends:
      - serviceName: bare-minimum-api-v1
        servicePort: 8080
        weight: 70
      - serviceName: bare-minimum-api-v2
        servicePort: 8081
        weight: 30
```

Now, when you send requests, APISIX will split the traffic 70:30 between the two services:

```shell
for i in {1..20}
do
    curl http://127.0.0.1:57761/api -H 'host:local.navendu.me'
done
```

```shell {title="output"}
Hello from API v1.0!
Hello from API v1.0!
Hello from API v1.0!
Hello from API v1.0!
Hello from API v2.0!
Hello from API v1.0!
Hello from API v1.0!
Hello from API v1.0!
Hello from API v1.0!
Hello from API v1.0!
Hello from API v1.0!
Hello from API v1.0!
Hello from API v1.0!
Hello from API v1.0!
Hello from API v1.0!
Hello from API v1.0!
Hello from API v2.0!
Hello from API v1.0!
Hello from API v2.0!
Hello from API v2.0!
```

## Plugins

APISIX comes with [80+ Plugins](https://apisix.apache.org/plugins/) out of the box. You can also [create your own Plugins](https://apisix.apache.org/docs/apisix/plugin-develop/) for tailored use cases. These Plugins allow you to extend APISIX's capabilities to include features like authentication, security, traffic control, and observability.

For our example, we will use the [limit-count](https://apisix.apache.org/docs/apisix/plugins/limit-count/) Plugin to limit the number of requests a client can send in a given time. We can create a Route and configure the Plugin with the ApisixRoute resource:

```yaml {title="limit-count.yaml"}
apiVersion: apisix.apache.org/v2
kind: ApisixRoute
metadata:
  name: method-route
spec:
  http:
    - name: method
      match:
        hosts:
          - local.navendu.me
        paths:
          - /api
      backends:
      - serviceName: bare-minimum-api-v1
        servicePort: 8080
        weight: 50
      - serviceName: bare-minimum-api-v2
        servicePort: 8081
        weight: 50
      plugins:
        - name: limit-count
          enable: true
          config:
            count: 10
            time_window: 10
```

Now, APISIX will only allow ten requests every ten seconds for one client:

```text {title="output"}
Hello from API v1.0!
Hello from API v1.0!
Hello from API v2.0!
Hello from API v1.0!
Hello from API v2.0!
Hello from API v1.0!
Hello from API v2.0!
Hello from API v2.0!
Hello from API v2.0!
Hello from API v1.0!
<html>
<head><title>503 Service Temporarily Unavailable</title></head>
<body>
<center><h1>503 Service Temporarily Unavailable</h1></center>
<hr><center>openresty</center>
<p><em>Powered by <a href="https://apisix.apache.org/">APISIX</a>.</em></p></body>
</html>
<html>
<head><title>503 Service Temporarily Unavailable</title></head>
<body>
<center><h1>503 Service Temporarily Unavailable</h1></center>
<hr><center>openresty</center>
<p><em>Powered by <a href="https://apisix.apache.org/">APISIX</a>.</em></p></body>
</html>
```

## What's Next?

This tutorial gave you an introduction to how you can extend APISIX Ingress. See the resources below to learn more about annotations, CRDs, and Plugins:

-   [List of available annotations](https://apisix.apache.org/docs/ingress-controller/next/concepts/annotations/)
-   [APISIX CRDs documentation](https://apisix.apache.org/docs/ingress-controller/next/concepts/apisix_route/)
-   [APISIX CRDs reference](https://apisix.apache.org/docs/ingress-controller/next/references/apisix_route_v2/)
-   [APISIX Plugin documentation](https://apisix.apache.org/docs/apisix/plugins/batch-requests/)

_See the complete list of articles in the series "[Hands-On With Apache APISIX Ingress](/series/hands-on-with-apache-apisix-ingress/)"._
