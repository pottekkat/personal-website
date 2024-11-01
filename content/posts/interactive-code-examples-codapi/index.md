---
title: Making Code Examples Interactive with Codapi
slug: adding-interactive-code-examples-codapi
date: 2024-11-04T10:21:22+05:30
draft: true
toc:
  show: true
  open: true
ShowRelatedContent: false
EnableCodapi: true
CodapiURL: codapi.navendu.me/v1
ShowCodeCopyButtons: false
summary: A guide to using Codapi, an open source, lightweight solution to add interactivity to your technical writing.
tags:
  - framework
  - interactive
  - tutorials
categories:
  - Tutorials
series: []
aliases: []
cover:
  image: /images/interactive-code-examples-codapi/arcade-banner.jpg
  alt: Children playing arcade games.
  caption: Interaction improves adoption.
  relative: "true"
fmContentType: Post (default)
keywords:
  - Codapi
  - interactive examples
---

I write a lot [about Apache APISIX](/tags/apache-apisix/) in this blog. While I try to write most of these tutorials with beginners (people new to APISIX) in mind, trying to provide enough information to get started, they still require running an APISIX instance locally to follow along.

So you need to navigate the APISIX docs, read the getting started guide, spin up your own APISIX Docker container, and return to the blog to try the tutorials.

Unsurprisingly, this is too cumbersome and time-consuming for most readers, especially those who just want to learn about a new tool and its capabilities.

While readers can skim through the static code/configuration snippets, they would benefit if these examples were interactive. This means that instead of just reading the code, they could _run it_ directly in their browser without spending time trying to get a local instance running. No installation. No Docker. Just instant, hands-on learning.

During my search for a solution that could help me build this interactivity, I found [Codapi](https://codapi.org/), an open source tool built specifically for the purpose. It was easy to use and had everything I needed to make an [interactive APISIX blog post](/posts/nginx-to-apisix/) (and a [couple of playgrounds](/playgrounds/)).

In this tutorial, I will show you how to use Codapi to write similar interactive, engaging, and fun technical content for your libraries, programming languages, and tools.

## What is Codapi?

[Codapi](https://github.com/nalgeon/codapi/) is a wrapper around Docker that lets you set up isolated sandboxes—essentially Docker containers that can execute code/configuration through an API.

For instance, while building the APISIX playground, I created an APISIX sandbox with a custom APISIX Docker image and configured Codapi to execute configurations and commands in this sandbox.

Codapi also has an optional [JavaScript widget](https://github.com/nalgeon/codapi-js/) to make the integration easy. This widget lets you quickly turn static code snippets into editable and executable playgrounds like the shell playground shown below:

```shell
echo "Welcome to the Codapi tutorial!"
```

{{< codapi sandbox="sh" editor="basic" >}}

Try changing the message and running it again.

Now, let's look into how this is done.

## Your First Codapi Sandbox

You can run Codapi on your local machine while creating and testing a sandbox (if you have Go installed). But make sure to use a separate machine when exposing your Copdapi instance to external traffic (like from your public blog posts) for security reasons.

Even though Codapi runs code in isolated Docker containers, staying safe is better than being sorry. The [installation guide](https://github.com/nalgeon/codapi/blob/main/docs/install.md) offers some tips on running Codapi in production.

The next steps will use a local Codapi instance to create and debug sandboxes. You can easily copy these configurations to your production instances without much change.

First, clone the [Codapi repository](https://github.com/nalgeon/codapi) to your local machine:

```shell
git clone https://github.com/nalgeon/codapi.git
cd codapi
```

The repository is structured like this (almost):

```text {hl_lines=["10-14", "19-21"]}
.
├── codapi.service
├── LICENSE
├── Makefile
├── README.md
├── build
│   └──
├── cmd
│   └──
├── configs
│   ├── boxes.json
│   ├── commands
│   │   └── sh.json
│   └── config.json
├── docs
│   └──
├── go.mod
├── go.sum
├── images
│   ├── alpine
│   │   └── Dockerfile
└── internal
    └──
```

You only need to care about the `images` and `configs` folders, as we will primarily be working with them.

The `images` folder contains the Dockerfiles for Codapi to create sandboxes. By default, the folder contains the Dockerfile for an `alpine` image.

The `configs` folder contains the Codapi configurations, which include the default configuration for sandboxes and commands (`config.json`), the specific configuration of each sandbox (`boxes.json`), and the commands to run in these sandboxes (`/commands/`). By default, you will find the `sh` sandbox configuration that uses the `alpine` box (`/configs/commands/sh.json`).

### Creating the Docker Image

First, let's look at how the default `alpine` Docker image is created:

```Dockerfile {title="/images/alpine/Dockerfile"}
FROM alpine:3.18

RUN adduser --home /sandbox --disabled-password sandbox

USER sandbox
WORKDIR /sandbox
```

The Dockerfile seems quite simple:

1. First, it specifies the lightweight Alpine Linux (`alpine:3.18`) image as the base image.
2. Then, it creates a new user called `sandbox` (without a password) and sets its home directory to `/sandbox`.
3. The last two lines set the default user to the newly created `sandbox` and the working directory to `/sandbox`. This ensures that commands are run as the isolated `sandbox` user rather than as root.

Now, using this Dockerfile, you can create a minimal environment, i.e., the `alpine` box.

### Configuring the Sandbox

The default configuration file (`/configs/config.json`) sets up some reasonable default configuration options inherited by the boxes and the commands. These options can be overrideen by specific box/command configurations.

In the `boxes.json` file, you will find the configuration of the `alpine` box. This box will use the `alpine` Docker image we defined in the Dockerfile:

```json {title="/configs/boxes.json"}
{
  "alpine": {
    "image": "codapi/alpine"
  }
}
```

The commands folder contains the actual configuration of the sandboxes. By default, you will find the `sh` sandbox/command configuration (`sh.json`). The `sh` sandbox will use the `alpine` box and defines a `run` command:

```json {title="/configs/commands/sh.json"}
{
  "run": {
    "engine": "docker",
    "entry": "main.sh",
    "steps": [
      {
        "box": "alpine",
        "command": ["sh", "main.sh"]
      }
    ]
  }
}
```

The `run` command is straightforward:

1. `entry` defines the file to which the data from the API request should be stored. This file (`main.sh` here) can be used in steps.
2. `steps` are series of commands executed sequentially. Here we only have a single step, which runs the command `sh main.sh` in the `alpine` box. This will effectively execute the shell command passed through the API inside the sandbox.

This will be clearer when you run Codapi. Let's not wait anymore.

### Running the Codapi Server

Make sure you have Docker installed and running on your machine.

Before starting Codapi, you must build the `alpine` Docker image. The project comes with a handly `Makefile` that has an `images` target, which runs the build and tags the images:

```makefile {title="Makefile", linenos="inline", linenostart=33}
images:
  docker build --file images/alpine/Dockerfile --tag codapi/alpine:latest images/alpine/
```

You can build and tag the image by running:

```shell
make images
```

Once the images are build, you can start Codapi:

```shell
make setup
make build
make run
```

You will see similar logs indicating that Codapi is running:

```text
2024/10/26 09:48:27 codapi main, commit fb53c17, built at 2024-05-01T11:56:00
2024/10/26 09:48:27 listening on port 1313...
2024/10/26 09:48:27 workers: 8
2024/10/26 09:48:27 boxes: [alpine]
2024/10/26 09:48:27 commands: [sh]
```

### Testing the Sandbox

With Codapi running, you are ready to test your sandbox. You can use an API client like `curl` to send a request to the Codapi server:

```shell
curl http://localhost:1313/v1/exec -H "content-type: application/json" -d '
{
  "sandbox": "sh",
  "command": "run",
  "files": { "": "echo hello" }
}'
```

The request body specifies the command (`run`), the sandbox to run the command (`sh`), and the actual script to run in the sandbox (`echo hello`).

If your configurations are correct, you should get back a similar response:

```json
{
  "id": "sh_run_bddc2c24",
  "ok": true,
  "duration": 469,
  "stdout": "hello",
  "stderr": ""
}
```

The response body includes the output of the command (`hello`) from the standard output stream (`stdout`). Notice that the response will also include the output from the standard error stream (`stderr`).

Now how do we go from this JSON response to _this_?

```shell
echo "We are getting better at this!"
```

{{< codapi sandbox="sh" editor="basic" >}}

## The Codapi JS Widget

While you can parse the response and create your own interactive snippets, using the [Codapi JS widget](https://github.com/nalgeon/codapi-js/) might be easier. The widget parses the JSON and formats the output, enabling you to attach interactivity to your existing code snippets.

For example, if you have a snippet on your page:

```html {title="interactive-blog-post.html"}
<pre><code>
echo "Look ma, I'm interactive!"
</code></pre>
```

You can make it interactive using the widget by adding the `codapi-snippet` element right below:

```html {title="interactive-blog-post.html"}
<pre><code>
echo "Look ma, I'm interactive!"
</code></pre>
<codapi-snippet sandbox="sh" editor="basic"></codapi-snippet>
```

The `sandbox` property sets the sandbox inside which the snippet should be run. The editor property enables editing the snippet. You can set `editot="off"` to disable editing.

With the `codapi-snippet` element in place, all you have to do is add the JavaScript files to the bottom of your page:

```html {title="interactive-blog-post.html"}
<script src="https://unpkg.com/@antonz/codapi@0.19.7/dist/snippet.js"></script>
<script src="https://unpkg.com/@antonz/codapi@0.19.7/dist/settings.js"></script>
```

The widget can also be [installed using npm](https://www.npmjs.com/package/@antonz/codapi). Optionally, you can include the default styles to make the interactive snippets less boring:

```html {title="interactive-blog-post.html"}
<link
  rel="stylesheet"
  href="https://unpkg.com/@antonz/codapi@0.19.7/dist/snippet.css"
/>
```

I added my own CSS instead to fit the theme of this blog:

```css
codapi-snippet {
  display: block;
  margin-bottom: var(--content-gap);
}

codapi-snippet codapi-toolbar {
  font-family: monospace;
  font-size: 0.78em;
}

codapi-snippet codapi-toolbar button {
  padding-inline-start: 14px;
  padding-inline-end: 14px;
  background: var(--primary);
  color: var(--code-bg);
  border: none;
}

codapi-snippet codapi-toolbar button:hover {
  background: var(--code-bg);
  color: var(--primary);
}

codapi-snippet codapi-toolbar button:after {
  content: " ▶";
}
```

The widget works out of the box for most needs. But it offers many more customizations and features like [attaching to specific code blocks](#attach-to-a-specific-code-snippet), [using templates](#wrap-snippets-in-templates), [passing additional files](#pass-additional-files-with-snippets), and more.

### Customizing the Widget

While setting up Codapi on this blog, I used some of these advanced customization options and features to make using the interactive snippets a bit easier. Here, I only look at the features that I found most useful. You can check the [documentation](https://github.com/nalgeon/codapi-js/tree/main/docs) to go further.

#### Bringing Your Own Codapi Server

By default, the Codapi JS widget sends requests to the cloud-hosted Codapi server (`api.codapi.org/v1`). To use the Codapi server you created in the above sections, you must update the settings to point the widget to your local API endpoint.

To do this, use the `codapi-settings` element:

```html
<codapi-settings url="http://localhost:1313/v1"></codapi-settings>
```

> **Tip**: When migrating to production, change this URL to that of your production Codapi server. `/v1` is the path used by the Codapi server to serve API requests.

With your local Codapi server running and the widget configured, you can try running a snippet and see it show up on the server logs:

```text
2024/10/30 21:07:58 [run --rm --name sh_run_024dd746 --runtime runc --cpus 1 --memory 64m --network bridge --pids-limit 64 --user sandbox --read-only --volume /var/folders/_l/qylg3zld3f371dwzfgljl40h0000gn/T/4143622737:/sandbox:ro --cap-drop all --ulimit nofile=96 codapi/alpine sh main.sh]
2024/10/30 21:07:58 ✓ sh_run_024dd746: took 438 ms
```

#### Attaching to a Specific Code Snippet

The `codapi-snippet` element naturally attaches itself to the preceding element. As in our previous examples, this also works well for most users, who can add the element right after their code snippets. But sometimes, it can be a bit limiting.

So, instead of having to always place the element right after the code, you can specify a CSS selector in the `selector` property to override this default behaviour:

```html {title="interactive-blog-post.html" hl_lines=[2, 10]}
<pre>
  <code id="code-example-1">
    echo "Look ma, I'm interactive!"
  </code>
</pre>

<!-- other HTML -->

<codapi-snippet
  sandbox="sh"
  editor="basic"
  selector="#code-example-1"
></codapi-snippet>
```

Here, the element attaches to the code snippet with the id `code-example-1` instead of the preceding element.

#### Reducing Boilerplates with Templates

Sometimes, when you write technical content, you want to focus your reader's attention on specific parts of the code. For example, if you are documenting available functions in your library, it would be better for each interactive snippet to focus on a single function rather than the import statements and other boilerplates.

i.e., this:

> The example below shows how the `mean` function works:
>
> ```python
> m = np.mean(data)
> ```
>
> {{< codapi sandbox="python" editor="off" template="./codapi/template.py" >}}
>
> The example below shows how the `median` function works:
>
> ```python
> m = np.median(data)
> ```
>
> {{< codapi sandbox="python" editor="off" template="./codapi/template.py" >}}

is much better than this:

> The example below shows how the `mean` function works:
>
> ```python
> import numpy as np
>
> data = np.array([12, 23, 38, 42, 59])
> m = np.mean(data)
> print(m)
> ```
>
> {{< codapi sandbox="python" editor="off" >}}
>
> The example below shows how the `median` function works:
>
> ```python
> import numpy as np
>
> data = np.array([12, 23, 38, 42, 59])
> m = np.median(data)
> print(m)
> ```
>
> {{< codapi sandbox="python" editor="off" >}}

But these code snippets are incomplete on their own and require additional code to properly run. _So, how do the above snippets work?_

_Templates_.

Templates let you set up placeholders for your snippets. For example, you can create a Python template like this:

```python {title="template.py" hl_lines=[4]}
import numpy as np

data = np.array([12, 23, 38, 42, 59])
##CODE##
print(m)
```

and use it in all your snippets to add the boilerplate code:

```html {title="numpy-tutorial.html"}
<pre>
  <code>
    m = np.median(data)
  </code>
</pre>

<codapi-snippet
  sandbox="python"
  editor="off"
  template="./template.py"
></codapi-snippet>
```

The snippets will replace the placeholder (`##CODE##`) in the template before they are executed.

> **Tip**: Skip to the [building a custom Python sandbox](#building-a-custom-python-sandbox) section to learn how this sandbox is built.

#### Passing Additional Files

There could also be scenarios where you might need to pass in whole additional files rather than just templates. Each example in the Apache APISIX sandbox requires a YAML configuration file and a `curl` command, which go hand in hand.

> Let’s create a simple route that matches requests based on the path and forwards them to a public HTTP API, `httpbin.org`:
>
> ```yaml
> routes:
>   - id: playground-ip
>     uri: /ip
>     upstream:
>       nodes:
>         httpbin.org:80: 1
>       type: roundrobin
> #END
> ```
>
> To test our configuration, we can send a request to the `/ip` path as shown below:
>
> ```shell
> curl "http://127.0.0.1:9080/ip"
> ```
>
> {{< codapi sandbox="apisix" editor="off" files="./codapi/apisix.yaml:apisix.yaml" >}}
>
> _From [Apache APISIX Playground](/playgrounds/apisix)._

Inside the sandbox, APISIX is first configured with the YAML configuration, and then the `curl` command is used to send a request to the configured APISIX instance.

> **Tip**: Skip to the [creating complex sandboxes](#creating-complex-sandboxes) section to learn how this sandbox is built.

In similar situations, Codapi can be configured to pass additional files with the snippet, which is quite useful. The APISIX snippet looks like this:

```html {title="apisix-playground.html"}
<pre>
  <code>
    curl "http://127.0.0.1:9080/ip"
  </code>
</pre>

<codapi-snippet
  sandbox="apisix"
  editor="off"
  files="./apisix.yaml"
></codapi-snippet>
```

Now, when you run a snippet like the one above, it will also include the corresponding APISIX configuration file.

### Making Life Easy with a Hugo Shortcode

I write posts mostly in Markdown and use Hugo to generate a static website. Managing all these settings can be difficult, and I don't want to separate my code snippets from the actual content.

To solve this, I created a Codapi [Hugo shortcode](https://gohugo.io/templates/shortcode/), a template that lets me easily add Codapi snippets to my posts. The shortcode is minimal, but it allows me to create and modify these snippets in my Markdown files. Right now, it only exposes the features I mainly use:

```html {title="codapi.html"}
{{ if .Page.Params.EnableCodapi }}
  <codapi-snippet
    {{ with .Get "sandbox" }}sandbox="{{ . }}"{{ end }}
    {{ with .Get "editor" }}editor="{{ . }}"{{ end }}
    {{ with .Get "selector" }}selector="{{ . }}"{{ end }}
    {{ with .Get "template" }}template="{{ . }}"{{ end }}
    {{ with .Get "files" }}files="{{ . }}"{{ end }}
    {{ with .Get "id" }}id="{{ . }}"{{ end }}
    {{ with .Get "hidden" }}style="display: none;"{{ end }}
  >
  </codapi-snippet>
{{ end }}
```

You can easily adapt this to fit your static site generator.

## Building a Custom Python Sandbox

With Codapi, your only limitation while building sandboxes is Docker. Most of the time, creating a sandbox just involves building good Docker images.

For example, to create a custom Python sandbox with selected packages, you start by creating a Dockerfile like this:

```Dockerfile {title="/images/python/Dockerfile", linenos="inline", hl_lines=[1, 6, "11-12"]}
FROM python:3.11-alpine

RUN adduser --home /sandbox --disabled-password sandbox

COPY requirements.txt /tmp
RUN pip install --no-cache-dir -r /tmp/requirements.txt && rm -f /tmp/requirements.txt

USER sandbox
WORKDIR /sandbox

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
```

```text {title="/images/python/requirements.txt"}
numpy==1.26.2
pandas==2.1.3
```

This Dockerfile is written to build a lightweight Docker image and run efficient Docker containers:

`1`: Minimal `alpine` Docker image to reduce the memory footprint.

`6`: `--no-cache-dir` [prevents pip](https://pip.pypa.io/en/stable/topics/caching/#disabling-caching) from caching files, and the `rm -f` command removes the `requirements.txt` file after installing the packages, keeping the image size small.

`11` and `12`: `ENV PYTHONDONTWRITEBYTECODE=1` [prevents Python](https://docs.python.org/3/using/cmdline.html#envvar-PYTHONDONTWRITEBYTECODE) from creating unnecessary `.pyc` cache files, and `ENV PYTHONUNBUFFERED=1` ensures that the [output is sent directly](https://docs.python.org/3/using/cmdline.html#envvar-PYTHONUNBUFFERED) without being buffered first, which improves interactivity.

You can add a new `docker build` command to the `Makefile` and build the image:

```makefile {title="Makefile", linenos="inline", linenostart=33, hl_lines=[3]}
images:
  docker build --file images/alpine/Dockerfile --tag codapi/alpine:latest images/alpine/
  docker build --file images/python/Dockerfile --tag codapi/python:latest images/python/
```

Now, in your Codapi configuration, you can add a new `python` box:

```json {title="/configs/boxes.json", hl_lines=["5-7"]}
{
  "alpine": {
    "image": "codapi/alpine"
  },
  "python": {
    "image": "codapi/python"
  }
}
```

The `run` command changes here. Instead of the entry being `main.sh` as in our previous sandbox, it becomes `main.py`, a Python file, and the `python` sandbox will run `python main.py` instead of `sh main.sh`:

```json {title="/configs/commands/python.json", hl_lines=[4, "7-8"]}
{
  "run": {
    "engine": "docker",
    "entry": "main.py",
    "steps": [
      {
        "box": "python",
        "command": ["python", "main.py"]
      }
    ]
  }
}
```

## Creating Complex Sandboxes

Sandboxes can be simple, like an Alpine Linux container that runs shell commands, or complex, like an Apache APISIX sandbox that runs with a specific container configuration, takes in multiple files, and connects to the Internet.

As mentioned at the start, Codapi is a wrapper around Docker. Creating complex sandboxes is essentially creating and running complex Docker containers.

The Dockerfile used for creating the APISIX sandbox looks like this:

```Dockerfile {title="/images/apisix/Dockerfile", linenos="inline", hl_lines=[1, 8, 9, 14]}
FROM apache/apisix:3.9.0-debian

USER root

RUN adduser --home /sandbox --disabled-password --gecos '' sandbox \
    && chown -R sandbox:sandbox /usr/local/apisix/ \
    && apt-get update -y \
    && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*

USER sandbox
WORKDIR /sandbox

COPY apisix.yaml /usr/local/apisix/conf/apisix.yaml
COPY config.yaml /usr/local/apisix/conf/config.yaml
```

`8`: On top of the APISIX base image, it also installs `curl` to run requests against APISIX.

`9`: The `rm -rf /var/lib/apt/lists/*` command removes the cached package data to keep the image size small.

`14`: Copies an initial configuration file (`apisix.yaml`) to the container. This configuration file will be replaced with the one provided in the request.

It also uses a custom sandbox configuration to increase the cap of file descriptors and processes to ensure APISIX can handle multiple requests if needed. These numbers are overkill, but I haven't had a need to optimize them yet:

```json {title="/configs/boxes.json" hl_lines=[7, 8]}
{
  "apisix": {
    "image": "codapi/apisix",
    "memory": 256,
    "writable": true,
    "volume": "%s:/sandbox:rw",
    "ulimit": ["nofile=256"],
    "nproc": 128
  }
}
```

The `run` command is also configured a bit differently:

```json {title="/configs/commands/apisix.json", linenos="inline", hl_lines=["5-11", "13-18", "22-27", 40, "45-49"]}
{
  "run": {
    "engine": "docker",
    "entry": "main.sh",
    "before": {
      "box": "apisix",
      "action": "run",
      "detach": true,
      "command": ["docker-start"],
      "timeout": 20
    },
    "steps": [
      {
        "box": ":name",
        "action": "exec",
        "command": ["sleep", ".5"],
        "timeout": 20
      },
      {
        "box": ":name",
        "action": "exec",
        "command": [
          "mv",
          "-f",
          "apisix.yaml",
          "/usr/local/apisix/conf/apisix.yaml"
        ],
        "noutput": 8192,
        "timeout": 20
      },
      {
        "box": ":name",
        "action": "exec",
        "command": ["sleep", ".5"],
        "timeout": 20
      },
      {
        "box": ":name",
        "action": "exec",
        "command": ["sh", "main.sh"],
        "noutput": 8192,
        "timeout": 20
      }
    ],
    "after": {
      "box": ":name",
      "action": "stop",
      "timeout": 20
    }
  }
}
```

`5` and `45`: `start` and `stop` action `before` and `after` the `steps`. The `command` configured in the `before` section starts the APISIX sandbox, and the `stop` action stops the sandbox after the steps are completed.

`13` to `18`: First step pauses execution to allow APISIX to start and be ready. This step is repeated after every command to ensure the configuration is applied, and APISIX is ready.

`22` to `27`: Next step moves the configuration provided by the request (`apisix.yaml`) to the APISIX configuration directory (`/usr/local/apisix/conf/`), overwriting the default configuration file.

`40`: Then, the `main.sh` script, which contains the `curl` command from the request, is executed.

### Troubleshooting

I did not write all these in one go and make it work on my first try. It took a lot of trial and error to create the perfect Docker image, configure the sandbox, and tune the `run` command to get to this setup.

Codapi has a very simple feature that makes all this a bit easier. _Logs_. When you send a request to your Codapi server, you will be able to find logs that show exactly what `docker` commands are being run.

For example, all of the configurations made in the APISIX sandbox show up in the `docker run` command executed by Codapi and can be seen in the logs:

```text
2024/11/01 10:32:00 [run --rm --name apisix_run_3ce93d7a --runtime runc --cpus 1 --memory 256m --network bridge --pids-limit 128 --user sandbox --detach --volume /var/folders/_l/qylg3zld3f371dwzfgljl40h0000gn/T/3993507765:/sandbox:rw --cap-drop all --ulimit nofile=256 codapi/apisix docker-start]
2024/11/01 10:32:00 [exec --interactive --user sandbox apisix_run_3ce93d7a sleep .5]
2024/11/01 10:32:00 [exec --interactive --user sandbox apisix_run_3ce93d7a mv -f apisix.yaml /usr/local/apisix/conf/apisix.yaml]
2024/11/01 10:32:01 [exec --interactive --user sandbox apisix_run_3ce93d7a sleep .5]
2024/11/01 10:32:02 [exec --interactive --user sandbox apisix_run_3ce93d7a sh main.sh]
2024/11/01 10:32:03 [stop apisix_run_3ce93d7a]
2024/11/01 10:32:04 ✓ apisix_run_3ce93d7a: took 4190 ms
```

This translates to the following Docker commands:

```shell
docker run --rm --name apisix_run_3ce93d7a --runtime runc --cpus 1 --memory 256m --network bridge --pids-limit 128 --user sandbox --detach --volume /var/folders/_l/qylg3zld3f371dwzfgljl40h0000gn/T/3993507765:/sandbox:rw --cap-drop all --ulimit nofile=256 codapi/apisix docker-start
docker exec --interactive --user sandbox apisix_run_3ce93d7a sleep .5
docker exec --interactive --user sandbox apisix_run_3ce93d7a mv -f apisix.yaml /usr/local/apisix/conf/apisix.yaml
docker exec --interactive --user sandbox apisix_run_3ce93d7a sleep .5
docker exec --interactive --user sandbox apisix_run_3ce93d7a sh main.sh
docker stop apisix_run_3ce93d7a
```

If you are facing issues or trying to debug your sandbox, try running these Docker commands without Codapi. Once it works without Codapi, you can migrate them to Codapi configurations.

That's all for this rather lengthy but comprehensive tutorial on making your code examples interactive. You can use Codapi on your blogs and documentation or even create playgrounds for your tools and libraries.

To go even further, check out [codapi.org](https://codapi.org).
