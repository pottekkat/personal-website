---
title: "F5 Nginx to Apache APISIX"
date: 2024-05-04T09:50:45+05:30
draft: false
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

That's the primary reason why we still use Nginx and think it's a fine choice as a capable web server, reverse proxy, load balancer, and more. Even when I wrote about Cloudflare's migration to Pingora in an article titled "[Nginx is Probably Fine](/posts/nginx-is-fine/)," most, if not all, comments were, "Who said otherwise?"

While Nginx has _served_ us well for the past two decades (pun intended), the proliferation of APIs as the standard building blocks for modern applications demands better, API-first abstractions. _Well, hello, Apache APISIX!_

[Apache APISIX](https://apisix.apache.org) is a high-performance API gateway built on top of Nginx (OpenResty). As the name suggests, APISIX is maintained by the Apache Software Foundation.

An [API gateway](/categories/api-gateway/) can be seen as a reverse proxy with capabilities like fine-grained traffic control, authentication, and observability. To put it simply, Apache APISIX can do what Nginx does _and more._

People move from Nginx to APISIX precisely because of this reason.

This interactive article attempts to ease this migration by taking Nginx users through their typical use cases with APISIX without compromising familiarity.

## Proxy Requests

Forwarding client requests to an upstream and returning the responses is a primary requirement for any Nginx replacement.

In Nginx, you proxy requests using the `proxy_pass` directive:

```nginx {title="nginx.conf"}
http {
    server {
        listen 80;
        location /anything/ {
            proxy_pass http://httpbin.org:80;
        }
    }
}
```

You can configure APISIX similarly through _routes_.

At its minimum, a route defines how a request is matched and where it is routed to. The example below shows how APISIX can be configured to route to `httpbin.org:80` as in the Nginx configuration above:

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

Try testing if this configuration works:

```shell
curl "http://127.0.0.1:9080/anything/example"
```

{{< codapi sandbox="apisix" editor="off" files="./config/proxy-requests.yaml:apisix.yaml" >}}

Typically, you will have multiple routes to match different conditions before proxying requests to upstreams. These routes then have _plugins_ for features like caching and authentication. _We will see plugins in action in later examples._

## Balance Load

Nginx is widely used as a load balancer to distribute client requests between multiple upstreams.

You typically configure these upstreams in an `upstream` block and reference it in the `proxy_pass` directive:

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

APISIX follows a similar configuration where you can define multiple upstream _nodes_. The configuration below mimics the load balancer configuration of Nginx:

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

If you try sending multiple requests using the below command, you will see that the requests are load balanced between the two upstreams:

```shell
curl "http://127.0.0.1:9080/headers"
```

{{< codapi sandbox="apisix" editor="off" files="./config/balance-load.yaml:apisix.yaml" >}}

Load balancing between multiple upstream instances is useful for building reliable applications. APISIX also supports other load balancing algorithms like consistent hashing (`chash`), which is useful for [setting up session persistence](https://blog.frankel.ch/sticky-sessions-apache-apisix/).

## Serve Static Files

The last two examples involved proxying to an application server upstream. But Nginx is also used for serving static files as it is. In fact, most production Nginx instances will just be serving static files.

You typically configure Nginx to cache these files as well. The configuration below uses regular expressions in the location block for matching files based on their extensions:

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

APISIX supports complex route matching through variables. A combination of these variable matches can most often help achieve desired results.

To cache the responses, you can enable the `proxy-cache` plugin on the route:

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

APISIX comes with around 90 plugins, including the `proxy-cache` plugin, out of the box, and you can configure these plugins on your routes to achieve additional functionalities.

If these plugins don't satisfy your needs, you can even write your own custom plugins.

## Terminate SSL

Nginx is often configured to terminate SSL traffic to relieve upstreams of this additional burden.

This is done by providing Nginx with the certificate and the private key, which it can use for decrypting HTTPS traffic before proxying upstream:

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

APISIX has an almost identical configuration:

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

Instead of passing the certificate and the key directly, we use environment variables, which will automatically be resolved by APISIX.

## Control Access

In Nginx, you use the `allow` and `deny` directives to control which IP addresses can access your services. This setup is often used as a basic firewall:

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

APISIX can be configured similarly with the `whitelist` and `blacklist` attributes in the `ip-restriction` plugin:

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

APISIX also has other security plugins to extend access control like `ua-restriction` and `referer-restriction`, and integrates with external WAF solutions.

## Custom Configuration

APISIX also provides extension points to modify its internal Nginx configuration.

For example, you can configure Nginx to run in the background by adding this snippet to your APISIX configuration file:

```yaml {title="conf/config.yaml"}
nginx_config:
  main_configuration_snippet: |
    daemon on;
```

This will add the `daemon on;` directive to the Nginx configuration file used by APISIX.

Similar extension points also allow you to add directives to the `http` and `server` blocks.

---

This article is not meant to be an exhaustive list of APISIX's or Nginx's capabilities. It also doesn't mean I'm advocating for everyone to ditch Nginx and move to APISIX.

My goal for this article was to highlight the similarities in capabilities between Nginx and APISIX and offer an alternative to Nginx users who want more. Still, for many users, Nginx is probably fine.

If you are migrating to APISIX, the best place to start is the [APISIX documentation](https://apisix.apache.org/). Or, if you are in the mood to play, you can try this experimental [APISIX playground](/playgrounds/apisix/).
