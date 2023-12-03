---
title: "Batching Requests in APISIX Ingress"
date: 2023-12-01T17:50:43+05:30
draft: false
ShowToc: true
TocOpen: true
ShowRelatedContent: false
summary: "A tutorial on using APISIX's request batching capability in Kubernetes Ingress."
tags: ["ingress", "kubernetes", "apache apisix", "cloud-native"]
categories: ["API Gateway"]
series: ["Hands-On With Apache APISIX Ingress"]
cover:
  image: "/images/batching-requests/candy-banner.jpg"
  alt: "Photo of candy grouped by colors."
  caption: "Batching requests can reduce the number of client-server request/response cycles."
  relative: false
---

With APISIX's request batching capability, you can group multiple independent API requests from the client into a single request. APISIX then turns this request into separate requests to your upstream services, aggregates the response, and sends it back to the client as a single response.

Batching can be useful in many practical scenarios where multiple independent requests are needed to fulfill a task. For example, the [Conference API](https://conferenceapi.azurewebsites.net/) exposes two different endpoints, `/speaker/{speakerId}/sessions` and `/speaker/{speakerId}/topics`, for listing the sessions and topics belonging to a speaker, respectively. You can make two API calls to show both in a front-end application.

{{< figure src="/images/batching-requests/without-apisix.png#center" title="Making two requests" caption="Sometimes this might not be ideal." link="/images/batching-requests/without-apisix.png" target="_blank" class="align-center" >}}

This might not always be ideal. Instead, you can use APISIX's request batching capability to group these requests into one, reducing the number of client-server calls.

{{< figure src="/images/batching-requests/with-apisix.png#center" title="Batching requests" caption="Batching requests reduces the number of client-server calls." link="/images/batching-requests/with-apisix.png" target="_blank" class="align-center" >}}

In this article, we will look at configuring this through APISIX Ingress in Kubernetes. If you are using the Admin API instead, you can check [this article](https://api7.ai/blog/batch-request-processing-with-api-gateway).

## Set Up the Example

First, let's set up the Conference API as our upstream. Like we did in the [previous article](/posts/apisix-ingress-external/), we will configure this external service in our upstream ([ApisixUpstream](https://apisix.apache.org/docs/ingress-controller/concepts/apisix_upstream/)) as shown below:

```yaml {title="conference-api-upstream.yaml"}
apiVersion: apisix.apache.org/v2
kind: ApisixUpstream
metadata:
  name: conference-api-upstream
spec:
  externalNodes:
    - type: Domain
      name: conferenceapi.azurewebsites.net
```

## Enable Batching

Request batching in APISIX is achieved through the [batch-requests](https://apisix.apache.org/docs/apisix/plugins/batch-requests/) plugin. You can enable the plugin by adding it to your Helm values file, as shown below:

```yaml {title="values.yaml"}
plugins:
  - batch-requests
  - public-api
```

You can also enable the [public-api](https://apisix.apache.org/docs/apisix/plugins/public-api/) plugin to expose the route to external requests.

> **Note**: You should add all plugins being used to this list, as it will replace the plugins enabled by default.

## Configure Routes

We will create a route with the path `/speaker` that returns both the sessions and topics of a particular speaker using the `public-api` plugin. You can do this using the [ApisixRoute](https://apisix.apache.org/docs/ingress-controller/concepts/apisix_route/) CRD:

```yaml {title="speaker-route.yaml"}
apiVersion: apisix.apache.org/v2
kind: ApisixRoute
metadata:
  name: speaker-route
spec:
  http:
    - name: speaker
      match:
        paths:
          - /speaker
      plugins:
        - name: public-api
          enable: true
          config:
            uri: /apisix/batch-requests
      backends:
        - serviceName: apisix-admin
          servicePort: 9180
```

> **Note**: The ApisixRoute CRD always requires you to configure an upstream to a route. To work around this, you can use the Admin API as the upstream, as shown above, in scenarios where you don't have/need an upstream.

The above route extracts the individual requests needed to be made by APISIX. To fulfill these requests using the upstream, we have to create another two routes:

```yaml {title="speaker-topics-sessions-route.yaml"}
apiVersion: apisix.apache.org/v2
kind: ApisixRoute
metadata:
  name: speaker-topics-route
spec:
  http:
    - name: speaker-topics
      match:
        hosts:
          - conferenceapi.azurewebsites.net
        paths:
          - /*
        exprs:
          - subject:
              scope: Path
              name: topics
            op: RegexMatch
            value: "^/speaker/[^/]*/topics$"
        methods:
          - "GET"
      upstreams:
        - name: conference-api-upstream

---

apiVersion: apisix.apache.org/v2
kind: ApisixRoute
metadata:
  name: speaker-sessions-route
spec:
  http:
    - name: speaker-sessions
      match:
        hosts:
          - conferenceapi.azurewebsites.net
        paths:
          - /*
        exprs:
          - subject:
              scope: Path
              name: sessions
            op: RegexMatch
            value: "^/speaker/[^/]*/sessions$"
        methods:
          - "GET"
      upstreams:
        - name: conference-api-upstream
```

This may seem complicated, so here is the explanation. We are matching requests using a regular expression in the path. So regardless of the value of `{speakerId}` in `/speaker/{speakerId}/sessions` and `/speaker/{speakerId}/topics`, we will match the request and forward it to the upstream.

> **Note**: If you are configuring APISIX through the Admin API, this is much simpler and reduces to `"uris": ["/speaker/*/topics","/speaker/*/sessions"]`. However, we must use regular expressions since the ApisixRoute CRD does not support [URI patterns](https://github.com/apache/apisix-ingress-controller/blob/c111c12272f58189de785feac256e6ce1193c172/samples/deploy/crd/v1/ApisixRoute.yaml#L107C35-L107C35) with `*` in the middle.

## Test the Routes

To test the route, we can send a request to the exposed `/speaker` endpoint:

```shell
curl -i http://127.0.0.1:50404/speaker -X POST -d \
'{
  "pipeline": [
    {
      "method": "GET",
      "path": "/speaker/1/topics"
    },
    {
      "method": "GET",
      "path": "/speaker/1/sessions"
    }
  ]
}'
```

APISIX will parse this request body and make separate requests to each endpoint. This saves a lot of network traffic as APISIX is closer to the upstream than the client having to make these calls itself.

The aggregated response from APISIX will be as shown below:

```json {title="output"}
[
  {
    "body": "{\r\n  \"collection\": {\r\n    \"version\": \"1.0\",\r\n    \"links\": [],\r\n    \"items\": [\r\n      {\r\n        \"href\": \"https://conferenceapi.azurewebsites.net/topic/8\",\r\n        \"data\": [\r\n          {\r\n            \"name\": \"Title\",\r\n            \"value\": \"Microsoft\"\r\n          }\r\n        ],\r\n        \"links\": [\r\n          {\r\n            \"rel\": \"http://tavis.net/rels/sessions\",\r\n            \"href\": \"https://conferenceapi.azurewebsites.net/topic/8/sessions\"\r\n          }\r\n        ]\r\n      },\r\n      {\r\n        \"href\": \"https://conferenceapi.azurewebsites.net/topic/10\",\r\n        \"data\": [\r\n          {\r\n            \"name\": \"Title\",\r\n            \"value\": \"Mobile\"\r\n          }\r\n        ],\r\n        \"links\": [\r\n          {\r\n            \"rel\": \"http://tavis.net/rels/sessions\",\r\n            \"href\": \"https://conferenceapi.azurewebsites.net/topic/10/sessions\"\r\n          }\r\n        ]\r\n      }\r\n    ],\r\n    \"queries\": [],\r\n    \"template\": {\r\n      \"data\": []\r\n    }\r\n  }\r\n}",
    "status": 200,
    "headers": {
      "Expires": "-1",
      "Connection": "keep-alive",
      "Pragma": "no-cache",
      "Content-Length": "953",
      "Server": "APISIX/3.2.0",
      "Content-Type": "application/vnd.collection+json",
      "X-AspNet-Version": "4.0.30319",
      "Cache-Control": "no-cache",
      "X-Powered-By": "ASP.NET"
    },
    "reason": "OK"
  },
  {
    "body": "{\r\n  \"collection\": {\r\n    \"version\": \"1.0\",\r\n    \"links\": [],\r\n    \"items\": [\r\n      {\r\n        \"href\": \"https://conferenceapi.azurewebsites.net/session/206\",\r\n        \"data\": [\r\n          {\r\n            \"name\": \"Title\",\r\n            \"value\": \"\\r\\n\\t\\t\\tjQuery Mobile and ASP.NET MVC\\r\\n\\t\\t\"\r\n          },\r\n          {\r\n            \"name\": \"Timeslot\",\r\n            \"value\": \"05 December 2013 09:00 - 10:00\"\r\n          },\r\n          {\r\n            \"name\": \"Speaker\",\r\n            \"value\": \"Scott Allen\"\r\n          }\r\n        ],\r\n        \"links\": [\r\n          {\r\n            \"rel\": \"http://tavis.net/rels/speaker\",\r\n            \"href\": \"https://conferenceapi.azurewebsites.net/speaker/16\"\r\n          },\r\n          {\r\n            \"rel\": \"http://tavis.net/rels/topics\",\r\n            \"href\": \"https://conferenceapi.azurewebsites.net/session/206/topics\"\r\n          }\r\n        ]\r\n      }\r\n    ],\r\n    \"queries\": [],\r\n    \"template\": {\r\n      \"data\": []\r\n    }\r\n  }\r\n}",
    "status": 200,
    "headers": {
      "Expires": "-1",
      "Connection": "keep-alive",
      "Pragma": "no-cache",
      "Content-Length": "961",
      "Server": "APISIX/3.2.0",
      "Content-Type": "application/vnd.collection+json",
      "X-AspNet-Version": "4.0.30319",
      "Cache-Control": "no-cache",
      "X-Powered-By": "ASP.NET"
    },
    "reason": "OK"
  }
]
```

## What's Next?

You can learn more about [using plugins](/posts/extending-apisix-ingress/) or [creating custom ones](/posts/custom-plugins-in-apisix-ingress/) and configuring them through APISIX from other articles in this series.

This article was written after a question by an APISIX Slack user. If you want to see articles on specific topics, you can reach out to me at [navendu@apache.org](mailto:navendu@apache.org)

_See the complete list of articles in the series "[Hands-On With Apache APISIX Ingress](/series/hands-on-with-apache-apisix-ingress/)"._
