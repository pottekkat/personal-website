---
title: "Exporting APISIX Metrics to SigNoz"
date: 2023-11-24T10:23:52+05:30
draft: false
ShowToc: true
TocOpen: true
ShowRelatedContent: false
summary: "A guide for using SigNoz to collect and observe metrics from Apache APISIX."
tags: ["monitoring", "signoz", "tutorial"]
categories: ["API Gateway"]
cover:
    image: "/images/apisix-metrics-signoz/eye-banner.jpg"
    alt: "A photo of an eye of a person in the shadows."
    caption: "SigNoz is a relatively new \"Swiss Army Knife\" for observability."
    relative: false
---

[SigNoz](https://signoz.io/) is a popular open source observability platform. It provides tooling to observe traces, logs, and metrics with the ability to set up alerts and create dashboards.

Using SigNoz with Apache APISIX is less trivial than using, say, [Prometheus](/posts/introduction-to-monitoring-microservices/), which is supported through the out-of-the-box [prometheus](https://apisix.apache.org/docs/apisix/plugins/prometheus/) plugin. So, in this article, I will explain how to use SigNoz with APISIX for metrics.

## SigNoz and OpenTelemetry

A key feature of SigNoz is that it is built on top of the [OpenTelemetry](https://opentelemetry.io/) standard. This means that tools and data formats using this standard can effectively work with SigNoz.

If APISIX supports exporting metrics in the OpenTelemetry standard format ([OTLP](https://opentelemetry.io/docs/specs/otel/protocol/)), we can use it in SigNoz. But it doesn't.

However, APISIX supports [exporting metrics to Prometheus](/posts/introduction-to-monitoring-microservices/#exporting-metrics-from-apisix) in the Prometheus format, which is meant to be scraped by Prometheus but could also be scraped by a [Prometheus receiver](https://signoz.io/docs/userguide/send-metrics/#enable-a-prometheus-receiver) in the [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) used by SigNoz.

{{< figure src="/images/apisix-metrics-signoz/apisix-otel-signoz.png#center" title="APISIX + SigNoz" caption="The OTEL Collector can be seen as a lightweight Prometheus here." link="/images/apisix-metrics-signoz/apisix-otel-signoz.png" target="_blank" class="align-center" >}}

You can also use Prometheus instead of just the receiver for [additional capabilities](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/prometheusreceiver#unsupported-features). But in this example, we are just interested in using SigNoz.

{{< figure src="/images/apisix-metrics-signoz/apisix-prometheus-otel-signoz.png#center" title="APISIX + Prometheus + SigNoz" caption="You can also [use a full Prometheus instance](/posts/introduction-to-monitoring-microservices) to leverage its full capabilities." link="/images/apisix-metrics-signoz/apisix-prometheus-otel-signoz.png" target="_blank" class="align-center" >}}

## Configuring APISIX

First, we have to configure APISIX to export metrics in Prometheus format:

```yaml {title="config.yaml"}
plugins:
  - prometheus
  - public-api

plugin_attr:
  prometheus:
    export_uri: /metrics
    enable_export_server: false
```

This enables the `prometheus` and [public-api](https://apisix.apache.org/docs/apisix/plugins/public-api/) plugins and exports the metrics to the `/metrics` path in the data plane port.

> **Note**: SigNoz's OpenTelemetry Collector always scrapes the `/metrics` endpoint, which cannot be overridden.

You can also export the metrics to a separate server, as the [documentation](https://apisix.apache.org/docs/apisix/plugins/prometheus/#api) describes.

Next, you can enable the Prometheus plugin. I usually enable the plugin on all routes using a [global rule](https://apisix.apache.org/docs/apisix/terminology/global-rule/):

```yaml {title="apisix.yaml"}
global_rules:
  - id: 1
    plugins:
      prometheus:
        prefer_name: true
```

Finally, we must expose the `/metrics` path using the `public-api` plugin. You can enable this in a route as shown below:

```yaml {title="apisix.yaml"}
routes:
  # export Prometheus metrics to the specified URI
  - uri: /metrics
    plugins:
      public-api:
```

## Configuring SigNoz

You can instruct SigNoz (the OpenTelemetry Collector used by SigNoz) to scrape the endpoint exposed by APISIX for Prometheus metrics. To do this, you can modify the [default Collector configuration file](https://github.com/SigNoz/signoz/blob/develop/deploy/docker/clickhouse-setup/otel-collector-metrics-config.yaml) and add a new job to the `receivers.prometheus.config.scrape_configs` section:

```yaml {title="otel-collector-metrics-config.yaml"}
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: 'apisix'
          scrape_interval: 10s
          static_configs:
            - targets: ['apisix:9080']
              labels:
                instance: 'apisix'
```

You can then restart SigNoz, and the configuration will be in effect.

## Viewing the Metrics

To see if everything works, open up the SigNoz web UI and create a new dashboard. In the metrics name dropdown, you will be able to search for and find metrics exported by APISIX:

{{< figure src="/images/apisix-metrics-signoz/apisix-metrics-signoz.png#center" title="APISIX metrics in SigNoz" caption="See the [documentation](https://apisix.apache.org/docs/apisix/plugins/prometheus/#specifying-metrics) for specifying custom metrics." link="/images/apisix-metrics-signoz/apisix-metrics-signoz.png" target="_blank" class="align-center" >}}

You should also be able to import the [APISIX Grafana dashboard](https://grafana.com/grafana/dashboards/11719-apache-apisix/) to SigNoz, but there are [issues with importing Grafana dashboards](https://knowledgebase.signoz.io/t/enabling-import-grafana-json-in-signoz/2K5717) in SigNoz now.

## Traces and Logs

A robust observability system is incomplete without traces and logs. You can also export these from APISIX to SigNoz through existing plugins.

To send logs, you can use the [http-logger](https://apisix.apache.org/docs/apisix/plugins/http-logger/) or the [tcp-logger](https://apisix.apache.org/docs/apisix/plugins/tcp-logger/) plugin to send the logs to the OpenTelemetry Collector used by SigNoz. For traces, APISIX comes with an [opentelemetry](https://apisix.apache.org/docs/apisix/plugins/opentelemetry/) plugin, which can export trace data to SigNoz.

You can also learn more about setting up an end-to-end monitoring system from [this article](/posts/introduction-to-monitoring-microservices/) and use a similar setup in SigNoz.
