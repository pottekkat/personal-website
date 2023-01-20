---
title: "Hands-On: Kubernetes Gateway API With APISIX Ingress"
date: 2023-01-20T09:45:26+05:30
draft: false
weight: 4
ShowToc: false
summary: "A hands-on tutorial on using the new Kubernetes Gateway with Apache APISIX Ingress."
tags: ["ingress", "kubernetes", "apache apisix", "cloud-native"]
categories: ["API Gateway"]
series: ["Hands-On With Apache APISIX Ingress"]
cover:
    image: "/images/kubernetes-gateway-with-apisix/gateway-banner.jpeg"
    alt: "A photo of Bali Handara Gate."
    caption: "Photo by [Max Ravier](https://www.pexels.com/photo/person-walking-on-pathway-3348363/)"
    relative: false
---

_This article is a part of the series "[Hands-On With Apache APISIX Ingress](/series/hands-on-with-apache-apisix-ingress/)"._

Previously, I wrote an article [comparing the Kubernetes Gateway API and the Ingress API](/posts/gateway-vs-ingress-api/).

The Gateway API was designed to overcome the limitations of the Ingress API (like proprietary annotations and custom CRDs), thus providing a unified way to expose services outside the cluster.

You can [read more about the Gateway API](https://gateway-api.sigs.k8s.io/), but we will keep the focus of this tutorial on using the Gateway API in practice with Apache APISIX Ingress.

Before you move on, make sure you:

1. Go through the [previous tutorial](/posts/canary-in-kubernetes/) to learn about canary releases.
2. Have access to a Kubernetes cluster. This tutorial uses [minikube](https://minikube.sigs.k8s.io/) for creating a cluster.
3. Install and configure `kubectl` to communicate with your cluster.
4. [Install Helm](https://helm.sh/docs/intro/install/) to deploy the APISIX Ingress controller.

## Installing the Gateway API CRDs

Kubernetes does not support the Gateway API out of the box. So, you can manually install the CRDs by running:

```shell
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v0.5.0/standard-install.yaml
```

## Deploying APISIX Ingress and the Sample Application

You can install APISIX and APISIX Ingress controller with Helm. To enable APISIX Ingress controller to work with the Gateway API, you can set the flag `--set ingress-controller.config.kubernetes.enableGatewayAPI=true` as shown below:

{{< highlight shell "hl_lines=9" >}}
helm repo add apisix https://charts.apiseven.com
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
kubectl create ns ingress-apisix
helm install apisix apisix/apisix --namespace ingress-apisix \
--set gateway.type=NodePort \
--set ingress-controller.enabled=true \
--set ingress-controller.config.apisix.serviceNamespace=ingress-apisix \
--set ingress-controller.config.kubernetes.enableGatewayAPI=true
{{< / highlight >}}

As in our [previous tutorials](/posts/canary-in-kubernetes/#deploying-a-sample-application), we will deploy bare-minimum-api as our sample application:

```shell
kubectl run bare-minimum-api-v1 --image navendup/bare-minimum-api --port 8080 -- 8080 v1.0
kubectl expose pod bare-minimum-api-v1 --port 8080
kubectl run bare-minimum-api-v2 --image navendup/bare-minimum-api --port 8080 -- 8080 v2.0
kubectl expose pod bare-minimum-api-v2 --port 8080
```

## Configuring Canary Release With the Gateway API

A canary release allows you to rollout new changes in your application gradually. You can configure this in APISIX through the Kubernetes Gateway API as shown below:

```yaml title="kubernetes-gateway-canary.yaml"
apiVersion: gateway.networking.k8s.io/v1alpha2
kind: HTTPRoute
metadata:
  name: canary-release
spec:
  hostnames:
  - local.navendu.me
  rules:
  - backendRefs:
    - name: bare-minimum-api-v1
      port: 8080
      weight: 50
    - name: bare-minimum-api-v2
      port: 8080
      weight: 50
```

We use the [HTTPRoute](https://gateway-api.sigs.k8s.io/api-types/httproute) API to configure our Route in APISIX. The APISIX Ingress controller will convert the HTTPRoute resource to APISIX configuration.

As in the [previous tutorial](/posts/canary-in-kubernetes), you can adjust the weights of the traffic split to configure a canary release. With the configuration shown above, traffic will be split equally between the two versions of the bare-minimum-api:

```shell title="output"
➜ curl http://127.0.0.1:56194/
Hello from API v1.0!
➜ curl http://127.0.0.1:56194/
Hello from API v2.0!
➜ curl http://127.0.0.1:56194/
Hello from API v1.0!
➜ curl http://127.0.0.1:56194/
Hello from API v2.0!
➜ curl http://127.0.0.1:56194/
Hello from API v1.0!
➜ curl http://127.0.0.1:56194/
Hello from API v2.0!
➜ curl http://127.0.0.1:56194/
Hello from API v1.0!
➜ curl http://127.0.0.1:56194/
Hello from API v2.0!
```

## What's Next?

This tutorial gave you a quick walkthrough on how you can use the Kubernetes Gateway API with Apache APISIX.

You can learn more about using APISIX as your Kubernetes Ingress/Gateway from [apisix.apache.org](https://apisix.apache.org/docs/ingress-controller/getting-started/).

_See the complete list of articles in the series "[Hands-On With Apache APISIX Ingress](/series/hands-on-with-apache-apisix-ingress/)"._
