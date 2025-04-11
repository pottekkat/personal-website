---
title: Building a Model Context Protocol (MCP) Server in Go
slug: mcp-server-go
date: 2025-04-09T12:04:10+05:30
draft: true
toc:
  show: true
  open: true
ShowRelatedContent: false
description: A practical quickstart guide for building MCP servers in Go with MCP Go SDK.
summary: My experience in building an MCP server for DiceDB using the MCP Go SDK.
tags:
  - ai
  - mcp
  - tutorials
  - standards
categories:
  - Tutorials
series: []
aliases: []
cover:
  image: /images/mcp-server-go/dice-banner.jpg
  alt: Photo of two dice.
  caption: DiceDB is a new, open source, drop-in replacement for Redis.
  relative: false
fmContentType: Post (default)
---

[Model Context Protocol (MCP)](https://modelcontextprotocol.io) [servers](https://modelcontextprotocol.io/quickstart/server) allow LLMs (MCP hosts/clients) to access prompts, resources, and tools in a standard way, allowing you to build agents and complex workflows on top of LLMs.

[SDKs](https://github.com/modelcontextprotocol/python-sdk) make building and integrating MCP clients and servers easy. While there isn't an official SDK for Go _yet_, the community-built [mark3labs/mcp-go](https://github.com/mark3labs/mcp-go) has been gaining a lot of popularity among Go developers—including myself.

I used this SDK today to make a real-world MCP for a real project, and it has been pretty neat so far. This article is a quick walkthrough of how [I set up an MCP server](https://github.com/pottekkat/dicedb-mcp) using the MCP Go SDK for DiceDB, an in-memory key-value store like Redis.

## Install the mcp-go Module

The `mcp-go` module can be installed by running:

```shell
go get github.com/mark3labs/mcp-go
```

For the MCP server to communicate with DiceDB, we will use the DiceDB Go SDK. The `dicedb-go` module can also be installed similarly:

```shell
go get github.com/dicedb/dicedb-go
```

## Create a New MCP Server

The entire MCP server is just a couple of lines of code in a single `main.go` file. We will split it up and look into the important parts. Let's start by creating a new MCP server:

```go {title="main.go" linenos="inline" lineNoStart=1 anchorLineNos=true}
package main

// Import ALL required modules
import (
    "context"
    "fmt"
    "net"
    "strconv"
    "strings"

    "github.com/dicedb/dicedb-go"
    "github.com/dicedb/dicedb-go/wire"
    "github.com/mark3labs/mcp-go/mcp"
    "github.com/mark3labs/mcp-go/server"
)

func main() {
    // Create a new MCP server
    s := server.NewMCPServer(
        "DiceDB MCP", // Name of the server
        "0.1.0", // Version
        // Set listChanged to false as this example
        // server does not emit notifications
        // when the list of available tool changes
        // https://modelcontextprotocol.io/specification/2024-11-05/server/tools#capabilities
        server.WithToolCapabilities(false),
    )
}
```

## Define a New Tool

Now, let's add a new tool:

```go {title="main.go"}

```

## Create a Handler for the Tool

Now that we have defined the tool, let's add what happens when the tool is called. For us we want to ping the DiceDB server to ensure connectivity.

