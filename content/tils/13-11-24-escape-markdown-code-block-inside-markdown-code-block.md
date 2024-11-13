---
title: Escape Markdown Code Block Inside Markdown Code Block
date: 2024-11-13T22:09:39+05:30
description: "How do you document Markdown syntax in Markdown?"
fmContentType: TILs
---

You can escape Markdown code blocks by using four backticks ({{< rawhtml >}}<code>````</code>{{< /rawhtml >}}) instead of three.

````markdown
> Prevent Go Programs from Exiting

This _can be prevented_ by wrapping your code with a **channel**:

```go
c := make(chan bool) // creates a new channel
// your code goes here
<-c // perpetually waits for the channel to receive data
```
````

The above code block documents a Markdown code block. _Very meta_. It is created use four backticks:

```text
````markdown
```
