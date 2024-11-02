---
title: "Nginx Playground"
description: "An interactive playground for Nginx, the world's most popular web server."
summary: "A playground for Nginx."
date: 2024-04-28T17:22:00+05:30
experimental: true
EnableCodapi: true
CodapiURL: codapi.navendu.me/v1
ShowCodeCopyButtons: false
cover:
  image: "/images/pl-nginx/nginx-logo-banner.jpg"
  alt: "Nginx logo."
  relative: false
  hidden: true
---

I originally intended this playground to be a walkthrough of Nginx's primary and most often used capabilities (like the [Apache APISIX playground](/playgrounds/apisix/)). But that has to wait.

So here's a sandboxed instance of Nginx that you can play with. I tried using it as a proxy, as shown in the example, and it works.

Edit your Nginx configration file:

```nginx {id="nginx.conf"}
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

```shell {id="main.sh"}
curl "http://127.0.0.1:80/ip"
```

{{< codapi sandbox="nginx" editor="basic" hidden=true >}}

{{< codapi sandbox="nginx" editor="basic" files="#main.sh:main.sh" template="conf/template.conf" selector="#nginx\.conf > pre > code" >}}

This playground is powered by [Codapi](https://github.com/nalgeon/codapi/). A huge thank you to its creator, [Anton Zhiyanov](https://github.com/nalgeon).
