---
title: "Continuous API Delivery Pipelines"
date: 2024-03-01T11:06:35+05:30
draft: false
ShowToc: false
ShowRelatedContent: false
summary: "An exploration of continuous delivery workflows for building and managing APIs at scale."
tags: ["api gateway", "automation", "apache apisix"]
categories: ["API Gateway"]
cover:
  image: "/images/api-delivery/pipes-banner.jpg"
  alt: "Photo of pipes."
  caption: "Or if you prefer the fancy term, APIOps."
  relative: false
---

Going from defining your APIs to publishing them to your clients is a significant development effort.

Streamlining this process is as much a cultural shift as a process shift. A good middle ground between both is to apply DevOps practices to this API lifecycle (APIOps).

These practices can ensure consistency in your APIs while making it efficient for your entire team to manage this consistency. You can also easily track, manage, and verify changes to your APIs and detect potential issues.

This new API delivery pipeline can work with your existing CI/CD pipelines. Such a pipeline can consist of:

1. **Definitions**: To define APIs in a standard way.
2. **Validations**: For validating the API definitions against set specifications.
3. **Checks**: To show the potential changes to the already deployed API.
4. **Deployments**: To sync these changes to the deployed API on approval.
5. **Tests**: For testing the deployed changes.

In this article, you will learn how to implement a similar pipeline using GitHub Actions. The complete workflow file for the pipeline can be [found below](#testing-apis).

## Defining APIs

API definitions are the blueprints used for provisioning APIs. Usually, these definitions are standards-based, and over the past few years, OpenAPI has emerged as the de facto standard for APIs.

Defining your APIs with OpenAPI can simplify provisioning, managing, and documenting them without additional overhead to the developers.

Let's look at an example using the [HTTPBin](https://httpbin.org/) application. The OpenAPI definition of its `/ip` API endpoint would look like this:

```yaml
openapi: 3.0.0
info:
  title: "HTTPBin API"
  description: "Sample API that returns different responses."
  version: "1.0.0"
servers:
  - url: "http://httpbin.org"
paths:
  /ip:
    get:
      summary: "Get IP"
      description: "Get IP address."
      responses:
        "200":
          description: "Success"
          content:
            application/json:
              schema:
                type: "object"
                properties:
                  origin:
                    type: "string"
                    example: "189.223.34.12"
```

Tools like [Postman](https://www.postman.com/) and [Hoppscotch](https://hoppscotch.io/) make working with these OpenAPI definitions easy and can help throughout the API lifecycle, as you will see in the [later parts](#testing-apis) of this article.

{{< figure src="/images/api-delivery/vscode-openapi.png#center" title="OpenAPI Tools" caption="IDEs like Visual Studio Code also has [tooling](https://marketplace.visualstudio.com/items?itemName=42Crunch.vscode-openapi) for working with OpenAPI." link="/images/api-delivery/vscode-openapi.png" target="_blank" class="align-center" >}}

## Validating Definitions

After making changes to their API definition, developers can open pull requests as they would when making changes to the code.

The changes to the API definition in these pull requests will represent actual changes to the API. So, testing these changes is essential.

An initial check can be done to ensure these definitions are valid. This will be the first step in our pipeline:

```yaml
- name: Validate OpenAPI definition
  uses: char0n/swagger-editor-validate@v1
  with:
    definition-file: config/OpenAPI.yaml
- name: Convert OpenAPI definition
  run: adc openapi2apisix -f config/openAPI.yaml -o config/apisix.yaml
```

The above example configures a simple validation using the [Swagger Editor](https://editor.swagger.io). You can also use tools like [Stoplight](https://github.com/stoplightio/spectral) to define custom rulesets and API style guides as your APIs scale and the number of developers working on them increases.

## Checking for Changes

Typically, APIs sit behind an API gateway. For our example, we will use Apache APISIX.

APISIX provides routing capabilities with added features like authentication, observability, and fine-grained traffic control. It will be responsible for routing requests from the clients to the APIs.

The next step in our pipeline should be to convert the OpenAPI definitions to APISIX configuration. Thankfully, APISIX comes with a command line interface, [ADC](https://github.com/api7/adc), that can do just this:

```yaml
- name: Convert OpenAPI to APISIX
  run: adc openapi2apisix -f config/OpenAPI.yaml -o config/apisix.yaml
```

ADC can also run a check against the connected APISIX instance to see the difference in configuration with the proposed changes. The steps shown below runs this check and comments the result on the pull request:

```yaml
- name: Check config changes
  if: github.event_name == 'pull_request'
  run: adc diff -f "${APISIX_CONFIG}" | tee diff-output.txt
- name: Comment config changes
  if: github.event_name == 'pull_request'
  uses: actions/github-script@v7
  with:
    script: |
      const fs = require('fs');
      const output = fs.readFileSync('diff-output.txt', 'utf8');
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: '### Configuration changes\nThe following changes will be made to the connected instance of APISIX once you merge this pull request:\n```\n' + output + '```'
      });
```

For example, making a small change to our HTTPBin API definition file will show these configuration changes in APISIX:

```diff
+++ route: "httpbin-ip"
update service: "httpbin"
--- remote
+++ local
@@ -2,7 +2,7 @@
 	"id": "httpbin",
 	"name": "httpbin",
 	"hosts": [
-		"apisix.apache.org"
+		"api7.ai"
 	],
 	"upstream": {
 		"id": "httpbin",

--- route: "httpbin-anything"
Summary: create 1, update 1, delete 1
```

## Deploying Changes

With the above pipeline, you will be able to validate and review the changes to the API.

A developer can follow a review process similar to code review before merging this pull request. When the pull request is merged, the changes should be deployed to the production API.

Since we use APISIX as our API gateway, we can sync these changes to the running APISIX instance with ADC. Combined with the previous step, ADC will convert the OpenAPI definitions to APISIX configuration and push this configuration to the running APISIX instance:

```yaml
- name: Sync config changes
  if: github.event_name == 'push'
  run: adc sync -f "${APISIX_CONFIG}"
```

> **Tip**: Directly deploying these changes to production before testing them end-to-end is not a good idea. A better way is deploying these changes to a test/staging instance and running comprehensive tests, as discussed in the [next section](#testing-apis). You can check my article on [API deployment strategies](/posts/api-deployment-strategies/) for a more thorough guide.

## Testing APIs

So far, our pipeline has only run static tests on the API definitions. You cannot solely rely on human reviewers before merging and pushing the changes to production.

Instead, to test the actual changes in the API, you need to use a test framework.

"Luckily" (by design), the tools we started with, Postman and Hoppscotch can export all your APIs into a [Collection](https://docs.hoppscotch.io/documentation/features/collections) and test them in the CI using their CLIs. For example, the exported Collection from Hoppscotch for our API looks something like this:

```json {hl_lines=["19"]}
[
  {
    "v": 2,
    "name": "HTTPBin API",
    "folders": [],
    "requests": [
      {
        "v": "1.0.0",
        "endpoint": "http://127.0.0.1:9080/ip",
        "name": "IP",
        "params": [],
        "headers": [],
        "method": "GET",
        "auth": {
          "authType": "none",
          "authActive": true
        },
        "preRequestScript": "",
        "testScript": "pw.test(\"Response is ok\", () => {\n  pw.expect(pw.response.status).toBe(200);\n});",
        "body": {
          "contentType": null,
          "body": null
        }
      }
    ],
    "auth": {
      "authType": "inherit",
      "authActive": false
    },
    "headers": []
  }
]
```

The highlighted line shows a test case to validate if the API is working correctly. You can run these tests in the CI using `hopp`, the CLI for Hoppscotch:

```yaml
- name: Test created routes
  if: github.event_name == 'push'
  run: hopp test config/Collections.json
```

You can write more robust tests or use specific frameworks like Karate to run complete tests on the newly created APIs.

We can put all of this together in a GitHub Action workflow file:

```yaml
name: Continuous API delivery

on:
  # Run checks on pull requests to master and run sync on pushes to master
  pull_request:
    branches:
      - master
    paths:
      - "config/**"
  push:
    branches:
      - master
    paths:
      - "config/**"

permissions:
  contents: read
  pull-requests: write

jobs:
  validate-and-publish:
    name: Validate and publish APIs
    runs-on: ubuntu-latest
    env:
      APISIX_ADDRESS: ${{ secrets.APISIX_ADDRESS }} # address of the running APISIX instance
      APISIX_CONFIG: ${{ secrets.APISIX_CONFIG }} # path to the APISIX configuration file
      ADC_VERSION: ${{ secrets.ADC_VERSION }} # version of ADC to use
      ADC_TOKEN: ${{ secrets.ADC_TOKEN }} # APISIX token for ADC
    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      # Install required tools
      - name: Install ADC
        run: |
          wget https://github.com/api7/adc/releases/download/v${ADC_VERSION}/adc_${ADC_VERSION}_linux_amd64.tar.gz
          tar -zxvf adc_${ADC_VERSION}_linux_amd64.tar.gz
          sudo mv adc /usr/local/bin/adc
          adc version
      - name: Install Hoppscotch CLI
        run: npm i -g @hoppscotch/cli

      # Initialize ADC with the running APISIX instance
      - name: Configure ADC
        run: adc configure -t "${ADC_TOKEN}" -a "${APISIX_ADDRESS}"

      # Run a basic validation and convert to APISIX configuration
      - name: Validate OpenAPI definition
        uses: char0n/swagger-editor-validate@v1
        with:
          definition-file: config/OpenAPI.yaml
      - name: Convert OpenAPI definition
        run: adc openapi2apisix -f config/OpenAPI.yaml -o config/apisix.yaml

      # Check for differences with the running APISIX instance
      - name: Check config changes
        if: github.event_name == 'pull_request'
        run: adc diff -f "${APISIX_CONFIG}" | tee diff-output.txt
      - name: Comment config changes
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const output = fs.readFileSync('diff-output.txt', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '### Configuration changes\nThe following changes will be made to the connected instance of APISIX once you merge this pull request:\n```\n' + output + '```'
            });

      # When the pull request is merged, sync the changes to the running APISIX instance
      - name: Sync config changes
        if: github.event_name == 'push'
        run: adc sync -f "${APISIX_CONFIG}"

      # Run tests on the newly created/modified APIs
      - name: Test created routes
        if: github.event_name == 'push'
        run: hopp test config/Collections.json
```

The backbone of this pipeline is in using OpenAPI, which allows almost any tool used by API developers to fit the pipeline. You can easily swap most tools mentioned in this article with their counterparts.

You can use this pipeline as a starting point for your own API delivery pipelines.
