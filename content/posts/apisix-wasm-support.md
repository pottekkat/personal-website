---
title: "How Does Apache APISIX Support WebAssembly?"
date: 2023-11-17T09:46:06+05:30
draft: false
ShowToc: false
ShowRelatedContent: false
summary: "A look under the hood to see how Apache APISIX supports WebAssembly plugins."
tags: ["apache apisix", "api gateway", "wasm"]
categories: ["API Gateway"]
cover:
  image: "/images/apisix-wasm-support/binary-banner.jpeg"
  alt: "Zeroes and ones."
  caption: "It's all zeroes and ones if you look deep enough."
  relative: false
---

[WebAssembly (Wasm)](https://webassembly.org/) has found its way outside the browser and has been widely adopted on the server side as in browsers with the development of [WebAssembly System Interface (WASI)](https://github.com/WebAssembly/WASI).

In previous articles, we looked at how you can [build plugins for Apache APISIX in languages like Go using Wasm](/posts/tiny-apisix-plugin/) and how you can [optimize its performance](/posts/tinier-apisix-plugin/). We made it pretty clear that Wasm is here to stay in APISIX.

But how does APISIX support these Wasm plugins? Do they have limitations? What will they look like in the future? In this "under the hood of APISIX" article, we will attempt to answer these questions and more.

## Proxy Wasm Specification

APISIX is built on top of [OpenResty](https://apisix.apache.org/blog/2021/08/25/why-apache-apisix-chose-nginx-and-lua/), which extends Nginx through Lua code. i.e., APISIX talks to its underlying proxy, Nginx, in Lua. Because of this, APISIX needs to expose its features as an API to the Wasm binary.

While creating a new API has benefits, it adds a lot of complexity in maintaining the API and comes at the cost of a possible vendor lock-in. Instead, APISIX uses the [Proxy Wasm specification](https://github.com/proxy-wasm/spec/tree/master#host-environments) to implement this API.

Proxy Wasm is a standard API for writing Wasm plugins. It was initially developed for the Envoy proxy for writing Wasm filters but was made open source. Over the years, Proxy Wasm grew to become the standard API for adding Wasm functionality to proxies.

Proxy Wasm is implemented in two parts:

1. An SDK to write the plugin code. Currently, SDKs are available for [C++](https://github.com/proxy-wasm/proxy-wasm-cpp-sdk), [Rust](https://github.com/proxy-wasm/proxy-wasm-rust-sdk), [Go](https://github.com/tetratelabs/proxy-wasm-go-sdk), and [AssemblyScript](https://github.com/solo-io/proxy-runtime).
2. A host application binary interface (ABI) that exposes the functionality of the host proxy to the plugin. This is implemented by some Envoy and Nginx-based projects like Apache APISIX.

{{< figure src="/images/apisix-wasm-support/proxy-wasm-api.png#center" title="SDK and host ABI with Proxy Wasm" caption="This is explained more in the below sections." link="/images/apisix-wasm-support/proxy-wasm-api.png" target="_blank" class="align-center" >}}

> **Note**: APISIX's support for the Proxy Wasm API is still evolving. See [this issue](https://github.com/api7/wasm-nginx-module/issues/25) for the current progress.

As a plugin developer, you can write Wasm plugins for APISIX using any available SDKs and compile it to a Wasm binary. APISIX will execute this Wasm binary and interact with it through its ABI implementation.

How does APISIX handle these interactions?

## Programming Model

APISIX uses the following programming model to work with Wasm plugins. All of these interfaces are implemented by the programmer while writing custom plugins, as we did in the [previous article](/posts/tiny-apisix-plugin/):

{{< figure src="/images/apisix-wasm-support/programming-model.png#center" title="Interfaces for Wasm plugins" caption="See [the documentation](https://apisix.apache.org/docs/apisix/wasm/) for more." link="/images/apisix-wasm-support/programming-model.png" target="_blank" class="align-center" >}}

Each plugin has its own `VMContext`, which can create multiple `PluginContext` for each route. i.e., each `PluginContext` corresponds to an instance of a plugin, so if a service is configured with a Wasm plugin and two routes inherit from the service, each route will have its own `PluginContext`.

Similarly, a `PluginContext` is the parent of multiple `HTTPContext`. Each HTTP request will have its own `HTTPContext`.

Now, let's look at how APISIX implements the Proxy Wasm ABI.

## Wasm Module for Nginx

The [wasm-nginx-module](https://github.com/api7/wasm-nginx-module) is primarily the implementation of the Proxy Wasm specification in APISIX. It is a Nginx module that exposes APISIX's functionality to the Wasm plugin through the Proxy Wasm API.

This module has three main functions:

1. Allow the Wasm plugin to carry out operations on APISIX, like making network requests and logging.
2. Implement a virtual machine for running the Wasm plugin.
3. Allow APISIX to pass data and call the Wasm plugin during runtime.

This is better understood with an example.

In the [previous article](/posts/tiny-apisix-plugin/), we wrote a Wasm plugin in Go to modify the response headers. We implemented the `OnHttpResponseHeaders` function from the Proxy Wasm Go SDK and changed the header as shown below:

```go
func (ctx *httpContext) OnHttpResponseHeaders(numHeaders int, endOfStream bool) types.Action {
	plugin := ctx.parent
	for _, hdr := range plugin.Headers {
		proxywasm.ReplaceHttpResponseHeader(hdr.Name, hdr.Value)
	}

	return types.ActionContinue
}
```

The [SDK exports this function](https://github.com/tetratelabs/proxy-wasm-go-sdk/blob/1b9daaf70730bd6197ca8a34b2a8af713bbce7ad/proxywasm/internal/abi_callback_l7.go#L63) as `proxy_on_response_header` and can now be called from a host environment that implements the Proxy Wasm specification, i.e., Apache APISIX.

When APISIX receives a request and enters the `header_filter` [phase](https://apisix.apache.org/docs/apisix/terminology/plugin/#plugins-execution-lifecycle), it [calls](https://github.com/apache/apisix/blob/1eaad271ecc78ae2001e9da79b347406bd9aa6be/apisix/wasm.lua#L119) the `on_http_response_header` Lua function from the wasm-nginx-module. This function, in turn, [sets the callback function name](https://github.com/api7/wasm-nginx-module/blob/ccc83f7397c711b5f99a55682134a0972a5a6040/src/http/ngx_http_wasm_module.c#L702), `cb_name`, based on the stage of the request lifecycle.

Since the stage is `HTTP_RESPONSE_HEADERS`, the `cb_name` is set to `proxy_on_response_headers`:

```c
if (type == HTTP_RESPONSE_HEADERS) {
	cb_name = &proxy_on_response_headers;
}
```

As you might have guessed, the `cb_name` corresponds to the function to be called in the Wasm plugin. So the wasm-nginx-module [calls](https://github.com/api7/wasm-nginx-module/blob/ccc83f7397c711b5f99a55682134a0972a5a6040/src/http/ngx_http_wasm_module.c#L710) the `proxy_on_response_headers` function, i.e., the `OnHttpResponseHeaders` function we wrote in Go, through the Wasm VM:

```c
if (type == HTTP_REQUEST_HEADERS || type == HTTP_RESPONSE_HEADERS) {
    if (hwp_ctx -> hw_plugin -> abi_version == PROXY_WASM_ABI_VER_010) {
        rc = ngx_wasm_vm -> call(hwp_ctx -> hw_plugin -> plugin,
            cb_name,
            true, NGX_WASM_PARAM_I32_I32, http_ctx -> id, 0);
    } else {
        rc = ngx_wasm_vm -> call(hwp_ctx -> hw_plugin -> plugin,
            cb_name,
            true, NGX_WASM_PARAM_I32_I32_I32, http_ctx -> id, 0, 1);
      }
}
```

What's a Wasm VM though?

## Wasm Virtual Machines

Wasm binaries are executed in Wasm virtual machines (VMs). They implement the WASI standard, allowing Wasm binaries to be run outside the browser.

The wasm-nginx-module implements two Wasm VMs, [Wasmtime](https://wasmtime.dev/) and [WasmEdge](https://wasmedge.org/), and uses the former as default.

Running Wasm plugins inside a VM comes with beneficial side effects. It offers security and isolation from APISIX, ensuring that any issues with the plugin are self-contained.

The wasm-nginx-module first [loads](https://github.com/api7/wasm-nginx-module/blob/ccc83f7397c711b5f99a55682134a0972a5a6040/lib/resty/proxy-wasm.lua#L81) the `.wasm` binary to the VM and then uses the `call` method, as we saw above. All Wasm plugins are run inside the same Wasm VM.

## Room to Improve

Although Wasm plugins enable a lot for developers, the [problems we mentioned](/posts/tiny-apisix-plugin/#wasm-for-the-win) in the previous article, like limited language support and lack of concurrency, still exist.

However, the way the current ecosystem is set up with the Proxy Wasm standard encourages multiple proxy projects to come together to find solutions. As this happens, the specification is bound to evolve to support more common use cases, creating new SDKs and host implementations.

Apache APISIX maintainers are bullish on Wasm and are actively improving its support by working with other projects in the ecosystem. With others doing the same, it is only a matter of time before most of these problems are solved, and Wasm plugins become ubiquitous.
