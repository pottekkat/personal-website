---
title: "End to End, Iterate"
date: 2023-10-20T09:55:34+05:30
draft: false
ShowToc: true
TocOpen: true
ShowRelatedContent: false
summary: "An amateur engineer's philosophy on building software."
tags: ["software engineering", "framework"]
categories: ["Software Engineering"]
cover:
    image: "/images/e2e-iterate/frame-banner.jpg"
    alt: "A man building a steel frame for a building."
    caption: "An amateur engineer's philosophy on building software."
    relative: false
---

Even though I don't have much experience designing and building software, one philosophy that has always worked for me was "end-to-end, iterate."

The idea is to build an entire end-to-end framework for the software project and then add the features that make the project in subsequent iterations. This should happen before you make an MVP and is not a replacement for traditional iterative development models but something that complements it during the initial phases.

Let me explain.

Recently, I started working on a pure client-side search library called [soek](https://github.com/pottekkat/soek) using TinyGo and WebAssembly. The goal of building this was to 1. learn how to work with WebAssembly and 2. because I use a client-side search library in my blog website.

Having little to no prior experience in WebAssembly, I had no clue where to start. Still, having written Go code primarily in the last four years, I decided to pick Go and use the TinyGo compiler to optimize the size of the Wasm binaries. Going through some documentation and tutorials, I set up a basic web app using a Go/Wasm binary and some JavaScript glue code.

With this, I can proceed to build my project, but now I can choose how to proceed. I could either:

1. Learn about search algorithms, figure out what algorithm I should use, implement it, and then package it into a client-side search library. 
2. Or I could build a library with a naive search, build an example site that uses this library so that it is easy to iterate, open source the repo and write a readme, and then learn about search algorithms and gradually improve the library.

I chose the latter.

The first step was to write the Go code for the search. The goal was to not write a robust, efficient, and effective search algorithm (that comes later) but to write a very naive algorithm that can perform a search.

My naive algorithm just takes an index and a search term and checks if that term is present and, if so, at which element of the index. All it does is string comparison; the result is a list of documents containing the string in no particular order—very naive, very ineffective.

But it serves the purpose!

Next, I wrote the JavaScript glue code that wraps around the Go/Wasm code that end users can use. This code exports functions that users can use to add search to their websites.

Now, how do I test it? Of course, I could test the Go code independently, as it is the brains of the project, but that would be incomplete. So, following my philosophy, I built an example website that uses this library.

{{< figure src="/images/e2e-iterate/soek.png#center" title="Neat?!" caption="Initial iteration of using soek. See: [github.com/pottekkat/soek/example](https://github.com/pottekkat/soek/tree/master/example)" link="/images/e2e-iterate/soek.png" target="_blank" class="align-center" >}}

It uses the exact search index from my personal blog and has a UI that shows the search results. I think it is pretty neat.

To make things easier, I created a Makefile (now scripts in `package.json`) with steps to compile and compress the Wasm binary and generated Go code. Now, all I have to do is test the example site, and I can see how the library would work for an end user at the first step!

I had always planned to open source the project. So, even with this sucky project, I decided to [open source it on GitHub](https://github.com/pottekkat/soek). I went the whole nine yards by writing a readme and choosing a license.

I have a project that works end-to-end, even though it sucks. The next step is to iterate on the project and make it into something usable.

I'm learning about search algorithms, which is interesting. To test it, I can just switch my naive search with these actual algorithms and directly see how it would work end-to-end because of the complete framework I have set up.

What I mentioned here is also nuanced. This is a relatively small personal project and I have no clear plans on how to proceed with the project. Applying this philosophy might feel good in such scenarios but might be wildly unpopular when you tell it to your manager during your next sprint.

However, using it across side projects and while working on smaller projects at work has proven to be quite effective in getting things out there, however imperfect they may be, and iterating on them to make them better. And as you know, it is better to do something imperfectly than to do nothing flawlessly.
