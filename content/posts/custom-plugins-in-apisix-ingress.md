---
title: "Custom Plugins in APISIX Ingress"
date: 2023-03-24T09:22:09+05:30
draft: false
ShowToc: false
summary: "A hands-on tutorial on using custom APISIX Plugins in Kubernetes environments with APISIX Ingress."
tags: ["ingress", "kubernetes", "apache apisix", "cloud-native"]
categories: ["API Gateway"]
series: ["Hands-On With Apache APISIX Ingress"]
cover:
    image: "/images/custom-plugins-in-apisix-ingress/jigsaw-banner.jpeg"
    alt: "A jigsaw puzzle with a piece missing."
    caption: "Photo by [Pixabay](https://www.pexels.com/photo/white-jigsaw-puzzle-illustration-262488/)"
    relative: false
---

In a [previous article](/posts/extending-apisix-ingress/), I explained how to extend APISIX Ingress with Plugins.

APISIX comes with [80+ Plugins](https://apisix.apache.org/plugins/) out of the box. Still, there may come a time when your use case does not fit any Plugins.

In such scenarios, APISIX lets you write custom Plugins in Lua.

In this article, we will create and use a small custom Plugin with APISIX deployed in Kubernetes.

To learn how to write custom Plugins for APISIX, refer to the [documentation](https://apisix.apache.org/docs/apisix/plugin-develop/). APISIX also supports [external Plugins](https://apisix.apache.org/docs/apisix/external-plugin/) written in languages like Java, Go, and Python. These are out of the scope of this article.

Before you move on, make sure you:

1. Have access to a Kubernetes cluster. This tutorial uses [minikube](https://minikube.sigs.k8s.io/) for creating a cluster.
2. Install and configure `kubectl` to communicate with your cluster.
3. [Install Helm](https://helm.sh/docs/intro/install/) to deploy the APISIX Ingress controller.

The complete code used in this article is available [here](https://github.com/navendu-pottekkat/apisix-in-kubernetes/tree/master/custom-plugin).

## Deploying a Sample Application

We will deploy the [bare-minimum-api](/posts/hands-on-set-up-ingress-on-kubernetes-with-apache-apisix-ingress-controller/#deploying-a-sample-application) as our sample application:

```shell
kubectl run bare-minimum-api --image navendup/bare-minimum-api --port 8080 -- 8080 v1.0
kubectl expose pod bare-minimum-api --port 8080
```

## Writing a Custom Plugin

For this example, we will create a [sample Plugin](https://raw.githubusercontent.com/navendu-pottekkat/apisix-in-kubernetes/master/custom-plugin/plugins/custom-response.lua) that rewrites the response body from the Upstream with a custom value:

```lua {title="custom-response.lua"}
-- some required functionalities are provided by apisix.core
local core = require("apisix.core")

-- define the schema for the Plugin
local schema = {
    type = "object",
    properties = {
        body = {
            description = "custom response to replace the Upstream response with.",
            type = "string"
        },
    },
    required = {"body"},
}

local plugin_name = "custom-response"

-- custom Plugins usually have priority between 1 and 99
-- higher number = higher priority
local _M = {
    version = 0.1,
    priority = 23,
    name = plugin_name,
    schema = schema,
}

-- verify the specification
function _M.check_schema(conf)
    return core.schema.check(schema, conf)
end

-- run the Plugin in the access phase of the OpenResty lifecycle
function _M.access(conf, ctx)
    return 200, conf.body
end

return _M
```

> **Tip**: A complete guide on writing custom Plugins is available on the [APISIX documentation](https://apisix.apache.org/docs/apisix/plugin-develop/).

We can now configure APISIX to use this Plugin and create Routes with this Plugin enabled.

One way to do this is to create a custom build of APISIX with this code included. But that is not straightforward.

Instead, we can create a [ConfigMap](https://kubernetes.io/docs/concepts/configuration/configmap/) from the Lua code and mount it to the APISIX instance in Kubernetes.

You can create the ConfigMap by running:

```shell
kubectl create ns ingress-apisix
kubectl create configmap custom-response-config --from-file=./apisix/plugins/custom-response.lua -n ingress-apisix
```

Now we can deploy APISIX and mount this ConfigMap.

## Deploying APISIX

We will deploy APISIX via Helm as we did in the [previous tutorials](/series/hands-on-with-apache-apisix-ingress/).

But we will make some changes to the default `values.yaml` file to mount the custom Plugin we created.

You can configure the Plugin under `customPlugins` as shown below:

```yaml {title="values.yaml"}
customPlugins:
  enabled: true
  plugins:
    - name: "custom-response"
      attrs: {}
      configMap:
        name: "custom-response-config"
        mounts:
          - key: "custom-response.lua"
            path: "/usr/local/apisix/apisix/plugins/custom-response.lua"
```

You should also enable the Plugin by adding it to the `plugins` list:

```yaml {title="values.yaml"}
plugins:
  - api-breaker
  - authz-keycloak
  - basic-auth
  - batch-requests
  - consumer-restriction
  - cors
  ...
  ...
  - custom-response
```

Finally you can enable the Ingress controller and configure the gateway to be exposed to external traffic. For this, set `gateway.type=NodePort`, `ingress-controller.enabled=true`, and `ingress-controller.config.apisix.serviceNamespace=ingress-apisix` in your `values.yaml` file.

Now we can run `helm install` with this [updated values.yaml](https://raw.githubusercontent.com/navendu-pottekkat/apisix-in-kubernetes/master/custom-plugin/values.yaml) file:

```shell
helm install apisix apisix/apisix -n ingress-apisix --values ./apisix/values.yaml
```

APISIX and APISIX Ingress controller should be ready in some time with the custom Plugin mounted successfully.

## Testing without Enabling the Plugin

First, let's create a Route without our custom Plugin enabled.

We will create a Route using the [ApisixRoute](https://apisix.apache.org/docs/ingress-controller/concepts/apisix_route/) CRD like in the previous articles:

```yaml {title="route.yaml"}
apiVersion: apisix.apache.org/v2
kind: ApisixRoute
metadata:
  name: api-route
spec:
  http:
    - name: route
      match:
        hosts:
          - local.navendu.me
        paths:
          - /api
      backends:
        - serviceName: bare-minimum-api
          servicePort: 8080
```

We can now test the created Route:

```shell
curl http://127.0.0.1:52876/api -H 'host:local.navendu.me'
```

This will give back the response from our Upstream service as expected:

```shell
Hello from API v1.0!
```

## Testing the Custom Plugin

Now let's update the Route and enable our custom Plugin on the Route:

```yaml {title="route.yaml"}
apiVersion: apisix.apache.org/v2
kind: ApisixRoute
metadata:
  name: api-route
spec:
  http:
    - name: route
      match:
        hosts:
          - local.navendu.me
        paths:
          - /api
      backends:
        - serviceName: bare-minimum-api
          servicePort: 8080
      plugins:
        - name: custom-response
          enable: true
          config:
            body: "Hello from your custom Plugin!"
```

Now, our custom Plugin should rewrite the Upstream response with "Hello from your custom Plugin!"

Let's apply this CRD and test the Route and see what happens:

```shell
curl http://127.0.0.1:52876/api -H 'host:local.navendu.me'
```

And as expected, we get the rewritten response from our custom Plugin:

```text {title="output"}
Hello from your custom Plugin!
```

## What's Next?

In this tutorial, you learned how to configure custom Plugins written in Lua to work with APISIX Ingress.

See the resources below to learn more about writing custom Plugins:

- [Writing custom Plugins](https://apisix.apache.org/docs/apisix/plugin-develop/)
- [External Plugins](https://apisix.apache.org/docs/apisix/external-plugin/)

_See the complete list of articles in the series "[Hands-On With Apache APISIX Ingress](/series/hands-on-with-apache-apisix-ingress/)"._
