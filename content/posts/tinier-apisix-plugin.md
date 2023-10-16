---
title: 'A "Tinier" APISIX Plugin'
date: 2023-10-16T09:45:50+05:30
draft: false
ShowToc: true
TocOpen: true
ShowRelatedContent: false
summary: 'Converting the "tiny" APISIX plugin to a "tinier" APISIX plugin.'
tags: ["apache apisix", "api gateway", "wasm", "tutorials"]
categories: ["API Gateway"]
cover:
  image: "/images/tinier-apisix-plugin/tiny-gopher-banner.jpg"
  alt: "A tiny gopher."
  caption: "Using some magic to reduce the size of the Wasm binary."
  relative: false
---

In a previous blog post titled "[A \'Tiny\' APISIX Plugin](/posts/tiny-apisix-plugin/)," I explored how to write custom Apache APISIX plugins in WebAssembly. I used TinyGo and the [Proxy-Wasm specification](https://github.com/proxy-wasm/spec) to write a plugin and compile it into a wasm binary to be run in APISIX.

How big is this Wasm binary? Well, let's check:

```shell
ls -lah *.wasm
```

```shell {title="output"}
-rwxr-xr-x@ 1 navendu  staff   555K Oct  7 17:42 custom_response_header.go.wasm
```

It is not too bad, but reducing the size further would mean faster startup times, reduced memory and storage use, and reduced network latency, which could ultimately reduce costs (financial and otherwise) in constrained environments.

In this article, I will explore how we can optimize the size of Wasm binaries and how it corresponds to tradeoffs in performance.

## Optimizing Code

A straightforward way to optimize the binary size is by not using external packages. Our plugin [uses](/posts/tiny-apisix-plugin/#a-tiny-go-plugin) the [fastjson](https://github.com/valyala/fastjson) package to parse the data in the request.

To reduce the size, we could not use this package and write our own code to parse and work with the data. But this could come with a massive functionality, readability, and maintainability tradeoff.

So, although we could cut down the size by removing such external dependencies, the costs of doing so far outweigh the benefits.

Other than not importing unnecessary packages, you could also reduce the size by using smaller data types, efficient algorithms, and other optimizations in code. This article is less geared towards such optimizations as it could vary across plugins.

## Inherent Optimization with TinyGo

When the [Proxy-Wasm Go SDK](https://github.com/tetratelabs/proxy-wasm-go-sdk) was first introduced, the official Go compiler did not support targeting Wasi. This means you can only build Go-Wasm binaries that can run in the browser.

But the TinyGo compiler supported Wasi targets. So, it was a [natural choice](https://github.com/tetratelabs/proxy-wasm-go-sdk/blob/main/doc/OVERVIEW.md#tinygo-vs-the-official-go-compiler) for the SDK to rely on it instead of the official compiler.

But recently, the official compiler started supporting Wasi, and you can use it with the SDK to write plugins. Let's rebuild the binary with the Go compiler now and check its size:

```shell
go build -o custom_response_header.go.wasm -target=wasi ./main.go
ls -lah *.wasm
```

```shell {title="output"}
-rwxr-xr-x@ 1 navendu  staff   1.5M Oct 12 17:44 custom_response_header.go.wasm
```

That's almost thrice the size than when using the TinyGo compiler!

So, by using the TinyGo compiler, our binaries get optimized by default. This is expected because TinyGo was explicitly made to run Go programs on constrained environments like microcontrollers and other edge devices.

## Stripping Debug Symbols

A significant chunk of the binary size can be reduced by using certain build flags. One such flag is the `-no-debug` flag that strips debugging information from the binary.

If we add this flag to our build command, it becomes:

```shell
tinygo build -o custom_response_header.go.wasm -no-debug -target=wasi ./main.go
```

Let's now check the size of the binary and see if it helped:

```shell
ls -lah *.wasm
```

```shell {title="output"}
-rwxr-xr-x@ 1 navendu  staff   191K Oct 12 17:45 custom_response_header.go.wasm
```

That's a considerable change! The size of the binary went from 555 kB to 191 kB with just this flag.

For most production environments, the cost of being unable to work with a debugger is insignificant. So, this flag can significantly reduce the binary size without much tradeoffs.

## Not Printing Panic Messages

Similar to the `-no-debug` flag, using the `-panic=trap` flag cuts down the binary size but makes debugging harder. Using this flag will result in panic messages not being printed, which could be an okay tradeoff in production environments.

We can add this flag to our build command:

```shell
tinygo build -o custom_response_header.go.wasm -no-debug -panic=trap -target=wasi ./main.go
```

The binary should now be smaller:

```shell
ls -lah *.wasm
```

```shell {title="output"}
-rwxr-xr-x@ 1 navendu  staff   177K Oct 12 17:48 custom_response_header.go.wasm
```

And it is smaller, although not by that much.

## Using a Leaky Garbage Collector

A garbage collector is responsible for freeing up memory that is no longer in use. With the `-gc=leaking` flag, we can override the default garbage collector used in TinyGo with a leaky garbage collector that—if it is not yet evident—leaks memory.

Although memory leaks can be problematic in many scenarios, they might help improve the performance of the Wasm plugins in APISIX.

For each request, APISIX creates a new instance of the Wasm plugin, running it in a separate context. So unless your plugin allocates a large amount of memory for each request or handles a large volume of concurrent requests, you won't run into any noticeable memory issues. The allocated memory would be freed as the context associated with the request is destroyed.

Adding this flag, our build command becomes:

```shell
tinygo build -o custom_response_header.go.wasm -no-debug -panic=trap -gc=leaking -target=wasi ./main.go
```

Does this reduce the size of the Wasm binary? Let's find out:

```shell
ls -lah *.wasm
```

```shell {title="output"}
-rwxr-xr-x@ 1 navendu  staff   143K Oct 12 17:51 custom_response_header.go.wasm
```

The change in size is small. However, using a leaky garbage collector can significantly improve the plugin's performance, which is good.

> **Note**: If you are unsure if using a leaky garbage collector is okay, run a significant number of tests before using it in production. Or, just use the default garbage collector if the costs of running into potential memory issues don't tip the scales for the potential benefits.

## Disabling Goroutines

Disabling goroutines can also reduce the size of the final binary. Since our plugin does not leverage Go's concurrency features, we can set the `-scheduler=none` flag to disable it.

The build command is getting pretty long now:

```shell
tinygo build -o custom_response_header.go.wasm -no-debug -panic=trap -gc=leaking -scheduler=none -target=wasi ./main.go
```

This won't optimize it further than 168 kB now, right? Let's build the binary and check its size:

```shell
ls -lah *.wasm
```

```shell {title="output"}
-rwxr-xr-x@ 1 navendu  staff    89K Oct 12 17:54 custom_response_header.go.wasm
```

The size is reduced by around 40%! But could it _be_ any smaller? 

## Trading Speed for Size

The final build flag I wanted to explore was the `-opt` flag that controls the level of optimization applied by the compiler.

By default, TinyGo uses `-opt=z`, which optimizes for size. However, there are other options available to change this optimization level. The [TinyGo documentation](https://tinygo.org/docs/reference/usage/important-options/) suggests using `-opt=2` for performance if you are not trying to limit the size and using `-opt=s` for a more balanced approach between speed and size. 

Since we are optimizing for size, we will keep it as it is.

## Using Binaryen Toolkit

`wasm-opt` is a tool part of the Binaryen toolkit, a compiler infrastructure library for Wasm. It takes a Wasm binary and applies a series of optimizations (dead code elimination, precomputing expressions, etc.) to improve its performance and/or reduce its size.

As we saw above, using build flags significantly reduced the size of Wasm binaries produced. Using `wasm-opt` on these binaries would reduce their sizes even more. Running `wasm-opt` with the `-O` flag applies the default optimizations to the binary:

```shell
wasm-opt -O custom_response_header.go.wasm -o custom_response_header.go.wasm
```

Now let's check how effective the default optimizations are:

```shell
ls -lah *.wasm
```

```shell {title="output"}
-rwxr-xr-x@ 1 navendu  staff    84K Oct 12 17:58 custom_response_header.go.wasm
```

It's not much, but we can change this default behavior and trade size for speed, as we saw with the build flags. This is done through the `-O1` to `-04` flags, which execute one to four optimization passes, and the `-Os` flag, a less aggressive version of `-Oz`.

There is no one-size-fits-all configuration, and most documentation I've looked through suggests a trial-and-error method to see what works best for you. `wasm-opt` has even more configuration options, which you can fine-tune, but it can also be overwhelming (try `wasm-opt --help`) depending on your goal. I will leave it at the default optimizations for now.

## Balancing Tradeoffs

We started off with a 555 kB binary and ended up with an 84 kB one. That's a decrease in size by 84%! If you count the 1.5 MB binary built using the official Go compiler, this becomes closer to 95%.

As impressive as this is, it is also important to note the tradeoffs we made along the way. The right way to make decisions here is in terms of costs and benefits rather than an absolute optimal solution.

Other tools like `wasm-objdump` from the [WebAssembly Binary Toolkit](https://github.com/WebAssembly/wabt) and [Twiggy](https://github.com/rustwasm/twiggy) can analyze the size of Wasm binaries to make better decisions. During my tests, Twiggy did not work with Wasm binaries compiled using TinyGo, although it is the better tool. I understand this because Twiggy works by parsing the Wasm binary, and the parser does not support the binaries generated by TinyGo.

APISIX plans to strengthen [its support for Wasm plugins](https://api7.ai/blog/how-apisix-supports-wasm) in the future. With a more or less [on-par performance](/posts/tiny-apisix-plugin/#wasm-for-the-win) to native Lua plugins, improving this support would make it easy for development teams to adopt APISIX.
