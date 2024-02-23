---
title: "Restricting Resource Consumption"
date: 2024-02-23T09:22:25+05:30
draft: false
ShowToc: false
ShowRelatedContent: false
summary: "A better way to think about limits to prevent security issues from resource starvation."
tags: ["api gateway", "security", "apache apisix"]
categories: ["API Gateway"]
cover:
  image: "/images/resource-consumption/height-limit-banner.jpg"
  alt: "A road with a height limit of 2.2 meters."
  caption: "A better way to think about limits."
  relative: false
---

Setting up rate limits is a low-hanging fruit when it comes to improving the reliability and security of your APIs. API gateways, like [Apache APISIX](https://apisix.apache.org/), provide [solutions to configure this](https://apisix.apache.org/docs/apisix/plugins/limit-req/) out of the box.

Rate limits are also helpful in handling business-specific scenarios where you want to limit the API usage of different clients based on a pricing model or something similar.

But thinking and designing just in terms of rate limits often overlooks other limits and restrictions that are key in building robust and secure APIs.

The [OWASP API Security Top 10](https://owasp.org/API-Security/editions/2023/en/0x00-header/) lists "unrestricted resource consumption" as a widespread and technically severe vulnerability. Successful exploitation of this vulnerability can lead to [denial of service (DoS) attacks](https://en.wikipedia.org/wiki/Denial-of-service_attack) or increase operational costs.

Tackling this requires us to rethink what we mean by limits and go beyond just rate limits to curb the consumption of resources like network bandwidth, CPU, memory, and storage.

And like rate limits, you can easily delegate a lot of these responsibilities to an API gateway. Given below are a few strategies you can consider.

## Restricting Request Body

Request payloads are a point of vulnerability if left unchecked. Even with limits on the number of API calls a user can make, unrestricted payload size in a single request can lead to considerable CPU and memory overhead.

Take an example of an API to upload images. If the request body size is not limited, a malicious user can upload arbitrarily large images, consuming a lot of resources.

Fortunately, mitigating this is relatively easy with an API gateway. In Apache APISIX, you can configure the [client-control](https://apisix.apache.org/docs/apisix/plugins/client-control/) plugin and set a maximum request body size:

```shell
curl -i http://127.0.0.1:9180/apisix/admin/routes/1 -X PUT -d '
{
  "uri": "/upload",
  "plugins": {
    "client-control": {
      "max_body_size": 10000
    }
  },
  "upstream": {
    "type": "roundrobin",
    "nodes": {
      "127.0.0.1:1980": 1
    }
  }
}'
```

Requests exceeding this threshold are automatically rejected at the API gateway itself:

```shell
HTTP/1.1 413 Request Entity Too Large
...
<html>
<head><title>413 Request Entity Too Large</title></head>
<body>
<center><h1>413 Request Entity Too Large</h1></center>
<hr><center>openresty</center>
</body>
</html>
```

## Validating Request Parameters

Server-side validation is essential for many reasons. For this discussion, validating query and body parameters that control the number of records to be returned in the response is most important.

Consider an API that returns a list of products. A request body parameter `records` controls the number of products this API returns. If this parameter is not validated, a user can request many records, resulting in a considerable unintended overhead.

While validating these requests on your services might make more sense for some of you, others might benefit from delegating this responsibility to an API gateway. APISIX supports using a JSON schema to write validation logic through the [request-validation](https://apisix.apache.org/docs/apisix/plugins/request-validation/) plugin and reject invalid requests:

```shell
curl http://127.0.0.1:9180/apisix/admin/routes/1 -X PUT -d '
{
  "uri": "/products",
  "plugins": {
    "request-validation": {
      "body_schema": {
        "type": "object",
        "required": ["record"],
        "properties": {
          "type": { "type": "string" },
          "record": { "type": "integer", "minimum": 1, "maximum": 20 }
        }
      }
    }
  },
  "upstream": {
    "type": "roundrobin",
    "nodes": {
      "127.0.0.1:1980": 1
    }
  }
}'
```

I have written more about request validation specifically in [another post](/posts/request-validation/), so I will refrain from redoing that here.

## Limiting Number of Operations

Operations that utilize more resources are very vulnerable.

For example, consider an API that sends recovery codes for a password reset operation. If left unchecked, a malicious user can make this API call multiple times to rack up your bills.

Setting up limits like a single reset request every hour or similar can prevent such issues to a large extent. In Apache APISIX, you can configure this quite easily with the [limit-count](https://apisix.apache.org/docs/apisix/plugins/limit-count/) plugin:

```shell
curl -i http://127.0.0.1:9180/apisix/admin/routes/1 -X PUT -d '
{
  "uri": "/forgot-password",
  "plugins": {
    "limit-count": {
      "count": 1,
      "time_window": 3600,
      "rejected_code": 503,
      "key_type": "var",
      "key": "remote_addr"
    }
  },
  "upstream": {
    "type": "roundrobin",
    "nodes": {
      "127.0.0.1:1980": 1
    }
  }
}'
```

## Restricting Bots

Blocking bots, scripts, and other user agents that can act maliciously can also be a solid barrier in preventing excessive resource utilization. Even if these agents don't have malicious intent, unrestricted access can cause issues.

Apache APISIX comes with a [ua-restriction](https://apisix.apache.org/docs/apisix/plugins/ua-restriction/) plugin that can be used to configure a list of allowed/denied user agents based on the `User-Agent` header:

```shell
curl http://127.0.0.1:9180/apisix/admin/routes/1 -X PUT -d '
{
  "uri": "/api",
  "plugins": {
    "ua-restriction": {
      "bypass_missing": true,
      "denylist": ["my-bot-2", "(Twitterspider)/(\\d+)\\.(\\d+)"]
    }
  },
  "upstream": {
    "type": "roundrobin",
    "nodes": {
      "127.0.0.1:1980": 1
    }
  }
}'
```

## Thresholds in Services

In addition to these limits, configuring limits in each of your services can be a robust prevention measure. If you are using solutions like Docker containers to run your services, you can [easily set thresholds](https://docs.docker.com/config/containers/resource_constraints/) to limit CPU, memory, number of restarts, etc.

For example, you can [set hard and soft limits](https://docs.docker.com/config/containers/resource_constraints/#limit-a-containers-access-to-memory) to the memory available for each container. This prevents "out of memory" errors in host systems, which can bring down critical services.

This is because when the system runs out of memory, it starts killing processes, including your important applications, to free up memory. Setting up thresholds in containers can prevent this from happening.

## Limiting Third-Party API Calls

Most applications rely on third-party API calls to perform actions. For example, a login service might use an external SMS API to send an OTP to a user.

If a malicious user exploits this API call to send a large number of SMSs, it could result in enormous costs. This can be prevented by setting usage limits on these third-party service providers.

You can also set up billing alerts where you get notified if your consumption exceeds your budget.

## Monitoring and Alerts

The final key to being robust and secure is observability. A good monitoring and alerting system can help identify issues before they cascade and help nip them in the bud.

Such a system typically comprises tools for logging, metrics, and tracing with alerts set up for automatic notifications.

Apache APISIX integrates with tools like [Prometheus](/posts/introduction-to-monitoring-microservices/) and [Elasticsearch](/posts/apisix-logs-elk/), which are widely adopted observability platforms.

You can learn more about [API gateways](/categories/api-gateway/) and [Apache APISIX](/tags/apache-apisix/) from other articles in this blog.
