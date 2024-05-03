---
title: "F5 Nginx to Apache APISIX"
date: 2024-05-01T17:51:45+05:30
draft: true
ShowToc: true
TocOpen: true
ShowRelatedContent: false
summary: "An interactive guide to migrate from Nginx to Apache APISIX."
EnableCodapi: true
CodapiURL: codapi.navendu.me/v1
ShowCodeCopyButtons: false
tags: ["apache apisix", "nginx", "interactive", "api gateway"]
categories: ["API Gateway"]
cover:
    image: "/images/nginx-to-apisix/migrating-birds-banner.jpg"
    alt: "Migrating birds."
    caption: "Apache APISIX can be a better alternative to Nginx for most users."
    relative: false
---

For most of us, Nginx is just an abstraction of the underlying network.

While it was enough for the past two decades, the proliferation of APIs as the standard building blocks for applications, now calls for better, API-first abstractions.

API gateways fit neatly in this increasingly API-first world allowing developers to focus on building applications to handle business problems while leaving the network configurations to the API gateway.

APISIX is an API gateway built on top of Nginx (OpenResty) maintained by the Apache Software Foundation. An API gateway is a proxy with a lot of features, like fine-grained traffic control, authentication, observability, and more.

## Proxy Requests

```nginx {title="nginx.conf", id="proxy-requests-nginx.conf"}
http {
    server {
        listen 80;
        location /anything/ {
            proxy_pass http://httpbin.org:80;
        }
    }
}
```

{{< codapi sandbox="nginx" editor="off" hidden=true >}}

```shell {id="proxy-requests-main.sh"}
curl "http://127.0.0.1:80/anything/example"
```

{{< codapi sandbox="nginx" editor="off" hidden=true >}}

{{< codapi sandbox="nginx" editor="off" files="#proxy-requests-main.sh:main.sh" template="conf/template.conf" selector="#proxy-requests-nginx\.conf > pre > code" >}}

```yaml {title="apisix.yaml"}
routes:
  - id: proxy-requests
    uri: /anything/*
    upstream:
      nodes:
        httpbin.org:80: 1
      type: roundrobin
#END
```

```shell
curl "http://127.0.0.1:9080/anything/example"
```

{{< codapi sandbox="apisix" editor="off" files="./config/proxy-requests.yaml:apisix.yaml" >}}

## Balance Load

```nginx {title="nginx.conf"}
http {
    upstream backend {
        server httpbin.org:443;
        server nghttp2.org:443;
        server 192.0.0.1:443 backup;
    }

    server {
        listen 80;
        location /headers {
            proxy_pass https://backend;
        }
    }
}
```

```yaml {title="apisix.yaml"}
routes:
  - id: playground-headers
    uri: /headers
    upstream:
      nodes:
        httpbin.org:443: 1
        mock.api7.ai:443: 1
      type: roundrobin
      pass_host: node
      scheme: https
#END
```

```shell
curl "http://127.0.0.1:9080/headers"
```

{{< codapi sandbox="apisix" editor="off" files="./config/balance-load.yaml:apisix.yaml" >}}

## Serve Static Files

```nginx {title="nginx.conf"}
http {
    proxy_cache_path /data/nginx/cache keys_zone=mycache:10m;
    server {
        listen 80;
        proxy_cache mycache;
        location ~* ^/whatwg/(.+\.(jpeg|html))$ {
            proxy_pass https://raw.githubusercontent.com;
        }
    }
}
```

```yaml {title="apisix.yaml"}
routes:
  - id: apisix-whatwg
    uri: "/whatwg/*"
    vars:
      - - uri
        - "~~"
        - "(.jpeg|.html)$"
    plugins:
      proxy-cache: {}
    upstream:
      type: roundrobin
      scheme: https
      pass_host: node
      nodes:
        raw.githubusercontent.com: 1
#END
```

```shell
curl "http://127.0.0.1:9080/whatwg/html/main/404.html"
```

{{< codapi sandbox="apisix" editor="off" files="./config/static-files.yaml:apisix.yaml" >}}

## Terminate SSL

```nginx {title="nginx.conf"}
http {
    server {
        listen 443 ssl;
        server_name apisix.navendu.me;
        ssl_certificate /etc/nginx/ssl/navendu.me/certificate.crt;
        ssl_certificate_key /etc/nginx/ssl/navendu.me/private.key;
        location /ip {
            proxy_pass http://httpbin.org:80;
        }
    }
}
```

```yaml {title="apisix.yaml"}
ssls:
  - id: terminate-ssl
    sni: apisix.navendu.me
    cert: ${{SERVER_CERT}}
    key: ${{SERVER_KEY}}
routes:
  - id: terminate-ssl
    uri: /ip
    upstream:
      nodes:
        httpbin.org:80: 1
      type: roundrobin
#END
```

## Control Access

```nginx {title="nginx.conf"}
http {
    server {
        listen 80;
        location /anything/ {
            allow 192.168.1.0/24;
            deny all;
            proxy_pass http://httpbin.org:80;
        }
    }
}
```

```yaml {title="apisix.yaml"}
routes: 
  - id: control-access
    uri: /anything/*
    plugins: 
      ip-restriction: 
        whitelist: 
        - 192.168.1.0/24
    upstream: 
      type: roundrobin
      nodes: 
        httpbin.org:80: 1
#END
```

```shell
curl "http://127.0.0.1:9080/anything/example"
```

{{< codapi sandbox="apisix" editor="off" files="./config/control-access.yaml:apisix.yaml" >}}

## Custom Configuration
