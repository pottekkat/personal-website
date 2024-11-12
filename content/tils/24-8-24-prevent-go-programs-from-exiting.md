---
title: Prevent Go Programs from Exiting
date: 2024-08-24T10:13:00+05:30
description: Useful trick using channels to prevent Go programs from exiting.
fmContentType: TILs
---

You can use channels to prevent Go programs from exiting.

I have found this to be useful when running Go + Wasm on the browser where I run into errors like:

```text
wasm_exec.js:378 Uncaught Error: bad callback: Go program has already exited
```

This can be prevented by wrapping your code with a channel:

```go
c := make(chan bool) // creates a new channel
// your code goes here
<-c // perpetually waits for the channel to receive data
```
