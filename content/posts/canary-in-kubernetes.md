---
title: "Canary Release in Kubernetes With Apache APISIX Ingress"
date: 2022-10-21T08:41:04+05:30
draft: false
ShowToc: false
summary: "A hands-on, from-scratch tutorial on setting up canary releases in Kubernetes with Apache APISIX Ingress."
tags: ["ingress", "kubernetes", "apache apisix", "cloud-native"]
categories: ["API Gateway"]
series: ["Hands-On With Apache APISIX Ingress"]
cover:
    image: "/images/canary-in-kubernetes/roads-banner.jpeg"
    alt: "Aerial photo of city street and buildings in Kuala Lumpur."
    caption: "Photo by [Deva Darshan](https://www.pexels.com/photo/aerial-photo-of-city-street-and-buildings-1044329/)"
    relative: false
---

A canary release is a process of rolling out a new version of software to a small subset of users before making it generally available. Canary releases can help in testing and controlling new releases and rolling back if there are any issues.

A simple canary release looks like this:

{{< figure src="/images/canary-in-kubernetes/canary-1.png#center" title="1. Route all traffic to existing version of the application" link="/images/canary-in-kubernetes/canary-1.png" target="_blank" class="align-center" >}}

{{< figure src="/images/canary-in-kubernetes/canary-2.png#center" title="2. Route some traffic to the new version and test for bugs/issues" link="/images/canary-in-kubernetes/canary-2.png" target="_blank" class="align-center" >}}

{{< figure src="/images/canary-in-kubernetes/canary-3.png#center" title="3. If everything is okay, route all traffic to the new version and keep the old version on standby" link="/images/canary-in-kubernetes/canary-3.png" target="_blank" class="align-center" >}}

In this hands-on tutorial, we will set up a canary release in Kubernetes using [Apache APISIX Ingress](https://apisix.apache.org/docs/ingress-controller/next/getting-started/).

Before you move on, make sure you:

1. Go through the [previous tutorial](/posts/hands-on-set-up-ingress-on-kubernetes-with-apache-apisix-ingress-controller/) for an introduction to Apache APISIX Ingress.
2. Have access to a Kubernetes cluster. This tutorial uses [minikube](https://minikube.sigs.k8s.io/) for creating a cluster.
3. Install and configure `kubectl` to communicate with your cluster.
4. [Install Helm](https://helm.sh/docs/intro/install/) to deploy the APISIX Ingress controller.

## Deploying a Sample Application

As in the [previous tutorial](/posts/hands-on-set-up-ingress-on-kubernetes-with-apache-apisix-ingress-controller/#deploying-a-sample-application), we will use our sample HTTP server application, the [bare-minimum-api](https://github.com/navendu-pottekkat/bare-minimum-api). This will act as our versioned service:

{{< figure src="/images/canary-in-kubernetes/bare-minimum-api.png#center" title="bare-minimum-api" link="/images/canary-in-kubernetes/bare-minimum-api.png" target="_blank" class="align-center" >}}

To deploy the two "versions" of the application, you can run:

```shell
kubectl run bare-minimum-api-v1 --image navendup/bare-minimum-api --port 8080 -- 8080 v1.0
kubectl expose pod bare-minimum-api-v1 --port 8080
kubectl run bare-minimum-api-v2 --image navendup/bare-minimum-api --port 8080 -- 8080 v2.0
kubectl expose pod bare-minimum-api-v2 --port 8080
```

We will now deploy APISIX Ingress and set up a canary release.

## Deploying APISIX Ingress

You can install APISIX and APISIX Ingress controller using Helm:

```shell
helm repo add apisix https://charts.apiseven.com
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
kubectl create ns ingress-apisix
helm install apisix apisix/apisix \
  --set gateway.type=NodePort \
  --set ingress-controller.enabled=true \
  --namespace ingress-apisix \
  --set ingress-controller.config.apisix.serviceNamespace=ingress-apisix
kubectl get pods --namespace ingress-apisix
```

Once all the pods and services are running, you can test APISIX by accessing the Admin API:

```shell
kubectl exec -n ingress-apisix deploy/apisix -- curl -s http://127.0.0.1:9180/apisix/admin/routes -H 'X-API-Key: edd1c9f034335f136f87ad84b625c8f1'
```

If you get a response similar to the one shown below, APISIX is up and running:

```json {title="output"}
{
  "action": "get",
  "node": {
    "key": "/apisix/routes",
    "dir": true,
    "nodes": []
  },
  "count": 0
}
```

To access the Ingress, you can run:

```shell
minikube service apisix-gateway --url -n ingress-apisix
```

You need to keep it running depending on your operating system. Regardless, you will see the IP address of APISIX Ingress. You can then send requests to this address.

```shell
http://127.0.0.1:56194
❗  Because you are using a Docker driver on darwin, the terminal needs to be open to run it.
```

> **Note**: See the [previous tutorial](/posts/hands-on-set-up-ingress-on-kubernetes-with-apache-apisix-ingress-controller/#deploying-apisix-ingress) to learn more.

## Configuring Canary Release

After verifying that APISIX Ingress is running, you can configure a canary release with [APISIX\'s CRDs](https://apisix.apache.org/docs/ingress-controller/references/apisix_route_v2/).

We will set weights for each service to route traffic proportionately.

Initially, we want to route all requests to the old version of the service:

{{< figure src="/images/canary-in-kubernetes/canary-routing-to-v1.png#center" title="Route all requests to bare-minimum-api-v1" link="/images/canary-in-kubernetes/canary-routing-to-v1.png" target="_blank" class="align-center" >}}

To configure this, we can set the weight to `100` and `0` for the `bare-minimum-api-v1` and `bare-minimum-api-v2` services, respectively:

```yaml {title="canary-release.yaml"}
apiVersion: apisix.apache.org/v2
kind: ApisixRoute
metadata:
  name: canary-release
spec:
  http:
    - name: route-v1
      match:
        paths:
          - /*
      backends:
        - serviceName: bare-minimum-api-v1
          servicePort: 8080
          weight: 100
        - serviceName: bare-minimum-api-v2
          servicePort: 8080
          weight: 0
```

You can apply it to your cluster by running:

```shell
kubectl apply -f canary-release.yaml
```

This will route all traffic to the `bare-minimum-api-v1` service. You can test it out by sending a request:

```shell
curl http://127.0.0.1:56194/
```

> **Note**: This address is the address of your APISIX Ingress obtained by running `minikube service apisix-gateway --url -n ingress-apisix` on the [installation step](#deploying-apisix-ingress).

If you keep sending multiple requests, you will see that the response is only from `bare-minimum-api-v1`:

```shell
➜ curl http://127.0.0.1:56194/
Hello from API v1.0!
➜ curl http://127.0.0.1:56194/
Hello from API v1.0!
➜ curl http://127.0.0.1:56194/
Hello from API v1.0!
➜ curl http://127.0.0.1:56194/
Hello from API v1.0!
➜ curl http://127.0.0.1:56194/
Hello from API v1.0!
```

Now, you can change the configuration to route some traffic, say 5%, to the new version, `bare-minimum-api-v2`:

{{< figure src="/images/canary-in-kubernetes/canary-routing-to-both.png#center" title="Split requests (95:5) between bare-minimum-api-v1 and bare-minimum-api-v2" link="/images/canary-in-kubernetes/canary-routing-to-both.png" target="_blank" class="align-center" >}}

You can configure this by editing your manifest file and applying it to your cluster:

```yaml {title="canary-release.yaml"}
apiVersion: apisix.apache.org/v2
kind: ApisixRoute
metadata:
  name: canary-release
spec:
  http:
    - name: route-v1
      match:
        paths:
          - /*
      backends:
        - serviceName: bare-minimum-api-v1
          servicePort: 8080
          weight: 95
        - serviceName: bare-minimum-api-v2
          servicePort: 8080
          weight: 5
```

APISIX will hot-reload the new configuration without needing to be restarted.

Now, if you send requests to the Ingress controller, you will see that some of the requests (5%) are routed to the `bare-minimum-api-v2` service:

{{< highlight shell "hl_lines=11-12" >}}
➜ curl http://127.0.0.1:56194/
Hello from API v1.0!
➜ curl http://127.0.0.1:56194/
Hello from API v1.0!
➜ curl http://127.0.0.1:56194/
Hello from API v1.0!
➜ curl http://127.0.0.1:56194/
Hello from API v1.0!
➜ curl http://127.0.0.1:56194/
Hello from API v1.0!
➜ curl http://127.0.0.1:56194/
Hello from API v2.0!
➜ curl http://127.0.0.1:56194/
Hello from API v1.0!
➜ curl http://127.0.0.1:56194/
Hello from API v1.0!
{{< /highlight >}}

Finally, you can route all traffic to the new version of the service.

{{< figure src="/images/canary-in-kubernetes/canary-routing-to-v2.png#center" title="Route all requests to bare-minimum-api-v2" link="/images/canary-in-kubernetes/canary-routing-to-v2.png" target="_blank" class="align-center" >}}

To configure this, you can set the weight to `0` for the `bare-minimum-api-v1` service and `100` for the `bare-minimum-api-v2` service:

```yaml {title="canary-release.yaml"}
apiVersion: apisix.apache.org/v2
kind: ApisixRoute
metadata:
  name: canary-release
spec:
  http:
    - name: route-v1
      match:
        paths:
          - /*
      backends:
        - serviceName: bare-minimum-api-v1
          servicePort: 8080
          weight: 0
        - serviceName: bare-minimum-api-v2
          servicePort: 8080
          weight: 100
```

Now, if you send requests, you will see that all requests are routed to `bare-minimum-api-v2`:

```shell
➜ curl http://127.0.0.1:56194/
Hello from API v2.0!
➜ curl http://127.0.0.1:56194/
Hello from API v2.0!
➜ curl http://127.0.0.1:56194/
Hello from API v2.0!
➜ curl http://127.0.0.1:56194/
Hello from API v2.0!
➜ curl http://127.0.0.1:56194/
Hello from API v2.0!
➜ curl http://127.0.0.1:56194/
Hello from API v2.0!
```

You successfully migrated your users from the old version of your service to your new version without any downtime!

In real-world scenarios, you can keep the older version of the service on standby to roll back if there are any issues.

## What's Next?

This tutorial taught you how to configure APISIX Ingress for simple canary releases. We tested it out with our sample application.

You can also configure complex release strategies with APISIX and its [Plugins](https://apisix.apache.org/docs/apisix/plugins/traffic-split/#custom-release). I will try to cover these in the following articles. To learn more about APISIX, visit [apisix.apache.org](https://apisix.apache.org).

_See the complete list of articles in the series "[Hands-On With Apache APISIX Ingress](/series/hands-on-with-apache-apisix-ingress/)"._
