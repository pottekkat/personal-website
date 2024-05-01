---
title: "Nginx Playground"
layout: "playground-theme"
description: "An interactive playground for Nginx, the world's most popular web server."
summary: "A playground for Nginx."
date: 2024-04-28T17:22:00+05:30
lastmod: 2024-05-01T10:21:22+05:30
experimental: true
EnableCodapi: true
CodapiURL: codapi.navendu.me/v1
ShowCodeCopyButtons: false
tags: ["playground", "nginx", "codapi"]
categories: ["Playground"]
cover:
    image: "/images/pl-nginx/nginx-logo-banner.jpg"
    alt: "Nginx logo."
    relative: false
    hidden: true
---

I originally intended this playground to be a walkthrough of Nginx's primary and most often used capabilities (like the [Apache APISIX playground](/playground/apisix/)). But that has to wait.

So here's a sandboxed instance of Nginx that you can play with. I tried using it as a proxy, as shown in the example, and it works.

Edit your Nginx configration file:

```nginx {id="nginx.conf"}
worker_processes 1;

events {
    worker_connections 32;
}

http {
    server {
        listen 80;

        location /ip {
            proxy_pass http://httpbin.org:80;
        }
    }
}
```

{{< codapi sandbox="nginx" editor="basic" hidden=true >}}

Use curl to test your configuration:

```shell
curl "http://127.0.0.1:80/ip"
```

{{< codapi sandbox="nginx" editor="basic" files="#nginx.conf:nginx.conf" >}}

This playground is powered by [Codapi](https://github.com/nalgeon/codapi/). A huge thank you to its creator, [Anton Zhiyanov](https://github.com/nalgeon).
