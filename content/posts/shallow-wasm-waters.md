---
title: "Shallow WebAssembly Waters"
date: 2023-10-01T10:12:13+05:30
draft: false
ShowToc: false
ShowRelatedContent: false
summary: "Notes as I learn about WebAssembly by building an open source project."
tags: ["wasm", "notes", "soek"]
categories: ["WebAssembly"]
cover:
  image: "/images/shallow-wasm-waters/birds-on-shallow-water-banner.jpg"
  alt: "Two birds standing in shallow water."
  caption: "Learning how to work with WebAssembly by building a project."
  relative: false
---

I have been ankle-deep in WebAssembly (Wasm) for a while. With APISIX [going all-in](https://api7.ai/blog/how-apisix-supports-wasm) on its support for [running Wasm plugins](/posts/tiny-apisix-plugin/), I decided to spend more time figuring out the space by building a side project using TinyGo and Wasm.

Deciding what to build was easy since I had a huge "list of side projects to build" sitting on my notes. Information retrieval or "search" has always been something that interested me. So, I built a pure client-side search library using Wasm!

Choosing TinyGo was also trivial since I have been programming primarily in Go for four years. TinyGo can also be used to build plugins for APISIX using the proxy-wasm specification.

In the interest of building in public, I will share the process of building [soek](https://github.com/pottekkat/soek), a pure client-side search library for static websites using TinyGo compiled to Wasm.

I have no idea what I'm doing, and that's the point. This series of articles is about documenting everything from the get-go, where I explore, make mistakes, and learn.

## Initial Setup

First, I initialized a Go project that basically has a main.go function that exposes functions from internal Go packages to JavaScript.

Then I wrote a simple and naive search function that reads a key to search for and a JSON string that contains the search index:

```go
// Search looks for the given key in the index and returns a list of matched titles
func Search(key string, indexJSONString string) []map[string]interface{} {
	err := json.Unmarshal([]byte(indexJSONString), &index)
	if err != nil {
		println("could not unmarshal JSON: %s\n", err)
		return nil
	}

	for _, i := range index {
		for k, v := range i {
			if str, ok := v.(string); ok {
				str = strings.ToLower(str)
				if strings.Contains(str, key) {
					matches = append(matches, i)
					break
				}
			} else if list, ok := v.([]interface{}); ok {
				listContainsKey := false
				for _, j := range list {
					if li, ok := j.(string); ok {
						li = strings.ToLower(li)
						if strings.Contains(li, key) {
							listContainsKey = true
							break
						}
					}
				}
				if listContainsKey {
					matches = append(matches, i)
					break
				}
			} else {
				println("unsupported key type found in index: ", k)
			}

		}
	}
	return matches
}
```

The idea of writing a naive function was to get everything working and then dive into the intricacies of search algorithms. If a key is found in an entry in the index, they are added to a list and returned to the caller.

## Talking to JavaScript

With this function in place, I can add the glue code in Go to talk to JavaScript. I first wrote a wrapper for the `Search` function to export it to JavaScript. I can then call this function from JavaScript.

To achieve this in Go, I can use the `syscall/js` package, which gives access to the Wasm host environment, which is the browser. So the `main.go` looks like this:

```go
package main

import (
	"syscall/js"

	"github.com/pottekkat/soek/pkg/soek"
)

func main() {
	// Reference: https://www.aaron-powell.com/posts/2019-02-06-golang-wasm-3-interacting-with-js-from-go/
	// Also see: https://dev.to/x1unix/go-webassembly-internals-part-1-14aj
	w := make(chan bool)
	js.Global().Set("callSearch", js.FuncOf(callSearch))
	<-w
}

// callSearch exposes the functionality of soek.Search to JavaScript
func callSearch(this js.Value, args []js.Value) interface{} {
	matches := soek.Search(args[0].String(), args[1].String())
	jsArray := js.Global().Get("Array").New(len(matches))
	for i, val := range matches {
		jsArray.SetIndex(i, js.ValueOf(val))
	}
	return jsArray
}
```

The `main` function declares the exported Go function `callSearch` to be used by JavaScript. `callSearch` wraps around `soek.Search` and converts the data to the format used by the function.

Another way to communicate between JavaScript and Wasm is by using Wasm's linear memory.

{{< blockquote author="Wasm By Example" link="https://wasmbyexample.dev/examples/webassembly-linear-memory/webassembly-linear-memory.go.en-us.html" title="WebAssembly Linear Memory" >}}
Wasm memory is an expandable array of bytes that Javascript and Wasm can synchronously read and modify. Linear memory can be used for many things, one of them being passing values back and forth between Wasm and Javascript.
{{< /blockquote >}}

But using it felt cumbersome instead of just using the `syscall/js` package. I am unsure how importing this package affects the size of the final Wasm binary, but I will keep this as it is now and leave the optimization to future Navendu.

## A Less Naive Search?

The way the search works now is too naive to be of any practical use. The development style I have followed for most of my professional career is to build an MVP that works end to end and then slowly iterate on new features and improvements. This means I have a working app from the start to play with and can continuously improve it instead of building parts without anything concrete that works.

With this in mind, I built a sample website that uses soek to search through all posts from this blog. Next, I plan to learn more about search algorithms that can improve how I search through an already-generated index. I also looked into bloom filters, but you must build the Wasm binary during build time.

With this approach of searching through an already generated index, soek can easily work with existing static site generators, which can generate the index file through templates.

The project is not open source (yet), so some links might not work. But I plan to open source it as soon as I improve the search algorithm to something better. Stay tuned!
