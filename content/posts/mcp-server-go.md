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

I used this SDK today to make a real-world MCP for a real project, and it has been pretty neat so far. This article is a quick walkthrough of how [I set up an MCP server](https://github.com/pottekkat/dicedb-mcp) using the MCP Go SDK for [DiceDB](https://dicedb.io/), an in-memory key-value store like Redis.

## Install the mcp-go Module

To use the `mcp-go` module, run:

```shell
go get github.com/mark3labs/mcp-go
```

We'll also use the `dicedb-go` module to talk to the database:

```shell
go get github.com/dicedb/dicedb-go
```

## Create a New MCP Server

The entire server fits into a single `main.go` file, thanks to the abstractions provided by the SDK. Let's break down the important bits, starting with setting up the server:

```go {title="main.go" linenos="inline" lineNoStart=1 anchorLineNos=true lineAnchors="new-mcp-server"}
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
```

Here's what's happening here:

- [4](#new-mcp-server-4)-[15](#new-mcp-server-15): We import the MCP and DiceDB modules and some helpers.
- [19](#new-mcp-server-19)-[27](#new-mcp-server-27): We create a new MCP server instance:
  - [19](#new-mcp-server-19): `"DiceDB MCP"` is just a human-readable name.
  - [20](#new-mcp-server-20): `"0.1.0"` is the version.
  - [26](#new-mcp-server-26): `server.WithToolCapabilities(false)` indicates that the server won't notify clients when the list of available tools changes, which is the case for our simple server.

## Define a New Tool

Now, let's add a tool. This one just pings the DiceDB server to check if it's reachable:

```go {title="main.go" linenos="inline" lineNoStart=29 anchorLineNos=true lineAnchors="new-tool"}
    pingTool := mcp.NewTool("ping", // Tool name
        // Short description of what the tool does
        mcp.WithDescription("Ping the DiceDB server to check connectivity"),
        // Add a string property to the tool schema
        // to accept the URL of the DiceDB server
        mcp.WithString("url",
            // Description of the property
            mcp.Description("The URL of the DiceDB server in format 'host:port'"),
            // Default value that compliant clients
            // can use if the value isn't explicitly set
            mcp.DefaultString("localhost:7379"),
        ),
    )
```

Under the hood, these definitions get translated to a JSON schema following the [JSON-RPC 2.0 specification](https://www.jsonrpc.org/specification). MCP clients use this schema to discover and call the tool.

The `"ping"` tool has the following properties:

- [29](#new-tool-29): `mcp.NewTool("ping", ...` defines a tool named `"ping"` that can be invoked by MCP clients.
- [31](#new-tool-31): `mcp.WithDescription` adds a description property to the tool schema that helps both humans and AI (MCP host/client) decide which tool to use.
- [34](#new-tool-34): `mcp.WithString` adds a string property to the tool schema to obtain the URL of the DiceDB server (from the MCP host/client).
- [39](#new-tool-35): `mcp.DefaultString` isn't defined in the MCP specification, but compliant clients can use this to set a default value if none is provided.

Next, we wire in the actual logic.

## Create a Handler Function

Now that we've defined the tool let's add what happens when it's invoked. In our case, we want to ping the DiceDB server to check if it's reachable:

```go {title="main.go" linenos="inline" lineNoStart=43 anchorLineNos=true lineAnchors="handler-function"}
    s.AddTool(pingTool, func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
        // Extract the URL argument from the client request
        url := request.Params.Arguments["url"].(string)

        // Parse host and port from URL
        parts := strings.Split(url, ":")
        host := parts[0]
        port := 7379 // Default to 7379 if no port is provided

        if len(parts) > 1 {
          if p, err := strconv.Atoi(parts[1]); err == nil {
            port = p
          }
        }

        // Create a new DiceDB client
        client, err := dicedb.NewClient(host, port)
        if err != nil {
            return mcp.NewToolResultText(fmt.Sprintf("Error connecting to DiceDB: %v", err)), nil
        }

        // Send the PING command to DiceDB
        resp := client.Fire(&wire.Command{Cmd: "PING"})

        // Return the result to the MCP client
        return mcp.NewToolResultText(fmt.Sprintf("Response from DiceDB: %v", resp)), nil
    })
```

Here, we define a handler function that runs when the MCP client calls the tool. This is what it does:

- [45](#handler-function-45): Extracts the URL from the client request.
- [48](#handler-function-48)-[56](#handler-function-56): Splits the string to separate host and port. If a port isn't specified, we fall back to DiceDB's default (`7379`).
- [59](#handler-function-59)-[62](#handler-function-62): Initializes a new DiceDB client using the `dicedb-go` SDK.
- [65](#handler-function-65): Sends a `PING` command to DiceDB.
- [68](#handler-function-68): Returns the formatted response back to the MCP client.

See how the SDK provides neat wrappers like `NewToolResultText` to structure responses as required by the MCP specification.

## Start the Server

All that's left is to start the server:

```go {title="main.go" linenos="inline" lineNoStart=71 anchorLineNos=true lineAnchors="start-server"}
    if err := server.ServeStdio(s); err != nil {
        fmt.Printf("Error starting server: %v\n", err)
    }
}
```

This uses the [stdio transport](https://modelcontextprotocol.io/docs/concepts/transports#standard-input%2Foutput-stdio), meaning our MCP server communicates using standard input and output streams. This is the simplest way to run an MCP server locally.

The MCP specification also allows SSE or [Server-Sent Events transport](https://modelcontextprotocol.io/docs/concepts/transports#server-sent-events-sse), which enables server-to-client streaming and uses HTTP POST for client-to-server messages. You can also create [custom transports](https://modelcontextprotocol.io/docs/concepts/transports#custom-transports) for specific needs.

## Build/Install the Server

Before using the server, build the binary:

```shell
go build -o ./dist/dicedb-mcp
```

Or install it globally (adds it to `$GOBIN`):

```shell
go install
```

This gives you either a local or a global runnable binary that can be executed by MCP clients and hosts.

## Use with MCP Hosts/Clients

To use this MCP server with host applications like Claude Desktop or Cursor, add it to their configuration file (`claude_desktop_config.json` or `mcp.json`):

```json {title="mcp.json"}
{
    "mcpServers": {
        "dicedb-mcp": {
            "command": "path/to/dicedb-mcp"
        }
    }
}
```

Now you can prompt the LLM like:

> Can you check if DiceDB is running at localhost:7379?

The LLM will detect the `ping` tool we registered, ask to run it, and show the result returned by the MCP server.

> **Note**: Make sure you have DiceDB running. You can also apply this pattern to wrap other tools into MCP servers instead of DiceDB, as used in this example.

## Learn More

We've built a minimal example to demonstrate how the MCP Go SDK works. It is functional but intentionally simple.

You can check out a more [robust DiceDB MCP implementation](https://github.com/pottekkat/dicedb-mcp) (with additional tools and features) on GitHub.

To go further, I recommend these resources:

- [Model Context Protocol](https://modelcontextprotocol.io/introduction)
- [Core Archetecture](https://modelcontextprotocol.io/docs/concepts/architecture)
- [MCP Go SDK Examples](https://github.com/mark3labs/mcp-go/tree/main/examples)
