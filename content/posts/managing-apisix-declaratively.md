---
title: "Managing APISIX Declaratively with ADC"
date: 2023-09-22T10:37:34+05:30
draft: false
ShowToc: true
TocOpen: true
ShowRelatedContent: true
canonicalURL: "https://api7.ai/blog/managing-apisix-declaratively/"
ShowCanonicalLink: true
summary: "A guide on using the new APISIX Declarative CLI to manage APISIX with declarative configuration files."
tags: ["apache apisix", "api gateway", "tutorials"]
categories: ["API Gateway"]
cover:
    image: "/images/managing-apisix-declaratively/dna-banner.jpg"
    alt: "An image of a DNA strand."
    caption: "A guide on using the new APISIX Declarative CLI to manage APISIX with declarative configuration files."
    relative: false
---

[APISIX](https://docs.api7.ai/apisix/documentation) users primarily use the Admin API to configure APISIX. But as your configurations increase in complexity, managing these only through the Admin API becomes more challenging.

To make things easier, we developed [APISIX Declarative CLI (ADC)](https://github.com/api7/adc), a tool that lets you define APISIX configurations declaratively.

In this article, we will look at how you can manage your APISIX configurations with ADC.

## Deploying APISIX

Before we get started, we should first run an APISIX instance to interact with and configure. We can spin up APISIX in Docker by running:

```shell
curl -sL https://run.api7.ai/apisix/quickstart | sh
```

See the [APISIX documentation](https://docs.api7.ai/apisix/getting-started) to learn more about using APISIX.

## Installing ADC

You can install ADC with the `go install` command:

```shell
go install github.com/api7/adc@latest
```

This will install the `adc` binary to your `$GOPATH/bin` directory.

> **Note**: Make sure you add this to your `$PATH` environment variable:
> 
> ```shell
> export PATH=$PATH:$GOPATH/bin
> ```

If you don't have Go installed, you can also download the latest `adc` binary for your operating system and add it to your `/bin` folder as shown below:

```shell
wget https://github.com/api7/adc/releases/download/v0.2.0/adc_0.2.0_linux_amd64.tar.gz
tar -zxvf adc_0.2.0_linux_amd64.tar.gz
mv adc /usr/local/bin/adc
```

You can find binaries for other operating systems on the [releases page](https://github.com/api7/adc/releases/tag/v0.2.0). In the future, these binaries will be published on package managers like Homebrew.

To check if `adc` is installed, run:

```shell
adc --help
```

If everything is okay, you will see a list of available subcommands and how to use them.

## Configuring ADC with Your APISIX Instance

To configure ADC to work with your deployed APISIX instance, you can run:

```shell
adc configure
```

This will prompt you to pass in the APISIX server address ('http://127.0.0.1:9180' if you followed along) and token.

If everything is correct, you should see a message as shown below:

```shell
ADC configured successfully!
Connected to APISIX successfully!
```

> **Tip**: You can use the `ping` subcommand to check the connectivity with APISIX anytime:
> 
> ```shell
> adc ping
> ```

## Validating APISIX Configuration Files

Let's create a basic APISIX configuration with a route that forwards traffic to an upstream:

```yaml {title="config.yaml"}
name: "Basic configuration"
version: "1.0.0"
services:
  - name: httpbin-service
    hosts:
      - api7.ai
    upstream:
      name: httpbin
      nodes:
        - host: httpbin.org
          port: 80
          weight: 1
routes:
  - name: httpbin-route
    service_id: httpbin-service
    uri: "/anything"
    methods:
      - GET
```

Once ADC is connected to the running APISIX instance, we can use it to validate this configuration before we apply it by running:

```shell
adc validate -f config.yaml
```

If the configuration is valid, you should receive a similar response:

```shell
Read configuration file successfully: config name: Basic configuration, version: 1.0.0, routes: 1, services: 1.
Successfully validated configuration file!
```

## Syncing Configuration to APISIX Instance

You can now use ADC to sync your valid configuration with the connected APISIX instance. To do this, run:

```shell
adc sync -f config.yaml
```

This will create a route and a service as we declared in our configuration file:

```shell
creating service: "httpbin-service"
creating route: "httpbin-route"
Summary: created 2, updated 0, deleted 0
```

To verify if the routes were created properly, let's try sending a request:

```shell
curl localhost:9080/anything -H "host:api7.ai"
```

If everything is correct, you will receive a response back from [httpbin.org](https://httpbin.org).

## Comparing Local and Running Configuration

Now let's update our local configuration in `config.yaml` file by adding another route:

```yaml {title="config.yaml" hl_lines="20-24"}
name: "Basic configuration"
version: "1.0.0"
services:
  - name: httpbin-service
    hosts:
      - api7.ai
    upstream:
      name: httpbin
      nodes:
        - host: httpbin.org
          port: 80
          weight: 1
routes:
  - name: httpbin-route-anything
    service_id: httpbin-service
    uri: "/anything"
    methods:
      - GET
  - name: httpbin-route-ip
    service_id: httpbin-service
    uri: "/ip"
    methods:
      - GET
```

Before syncing this configuration with APISIX, ADC lets you check the differences between it and the existing APISIX configuration. You can do this by running:

```shell
adc diff -f config.yaml
```

You will be able to see the additions and deletions in the configuration and understand what changed before applying it.

## Converting OpenAPI Definitions to APISIX Configuration

ADC also has basic support for working with OpenAPI definitions. ADC lets you convert definitions in [OpenAPI format](https://spec.openapis.org/oas/v3.0.0) to APISIX configuration.

For example, if you have documented your API in OpenAPI format as shown below:

```yaml {title="openAPI.yaml"}
openapi: 3.0.0
info:
  title: httpbin API
  description: Routes for httpbin API
  version: 1.0.0
servers:
  - url: http://httpbin.org
paths:
  /anything:
    get:
      tags:
        - default
      summary: Returns anything that is passed in the request data
      operationId: getAnything
      parameters:
        - name: host
          in: header
          schema:
            type: string
          example: "{{host}}"
      responses:
        "200":
          description: Successfully return anything
          content:
            application/json: {}
  /ip:
    get:
      tags:
        - default
      summary: Returns the IP address of the requester
      operationId: getIP
      responses:
        "200":
          description: Successfully return IP
          content:
            application/json: {}
```

You can use the subcommand `openapi2apisix` to convert this to APISIX configuration as shown below:

```shell
adc openapi2apisix -o config.yaml -f openAPI.yaml
```

This will create a configuration file like this:

```yaml {title="config.yaml"}
name: ""
routes:
- desc: Returns anything that is passed in the request data
  id: ""
  methods:
  - GET
  name: getAnything
  uris:
  - /anything
- desc: Returns the IP address of the requester
  id: ""
  methods:
  - GET
  name: getIP
  uris:
  - /ip
services:
- desc: Routes for httpbin API
  id: ""
  name: httpbin API
  upstream:
    id: ""
    name: ""
    nodes: null
version: ""
```

As you can see, the configuration is incomplete, and you would still need to add a lot of configurations manually. We are improving ADC to bridge this gap between OpenAPI definitions and what can be directly mapped to APISIX configuration.

## Tip: Use Autocomplete

You can do a lot with ADC, and the list of features is bound to increase. To learn how to use any subcommand, you can use the `--help` or the `-h` flag, which will show the documentation for the subcommand.

To make things even easier, you can generate an autocompletion script for your shell environment using the `completion` subcommand. For example, if you are using a zsh shell, you can run:

```shell
adc completion zsh
```

You can then copy-paste the output to your `.zshrc` file, and it will start showing hints when you use `adc`.

ADC is still in its infancy and is being continuously improved. To learn more about the project, report bugs, or suggest features, visit [github.com/api7/adc](https://github.com/api7/adc).
