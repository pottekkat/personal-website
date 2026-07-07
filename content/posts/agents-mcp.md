---
title: Provide Tools to Your LLM Agents with Model Context Protocol
slug: agents-mcp
date: 2025-04-14T08:10:00+05:30
draft: false
toc:
  show: true
  open: true
ShowRelatedContent: false
description: A short note on using the OpenAI Agents SDK's new MCP support to integrate tools into your LLM workflows.
summary: Notes on using OpenAI Agents SDK's MCP support to integrate DiceDB MCP.
tags:
  - ai
  - mcp
  - standards
  - tutorials
categories:
  - Tutorials
series: []
aliases: []
cover:
  image: /images/agents-mcp/welding-banner.jpg
  alt: A person welding with sparks flying.
  caption: MCP is the standard way to expose tools to LLMs.
  relative: false
fmContentType: Post (default)
---

Last week, I wrote about [building an MCP server for DiceDB](/posts/mcp-server-go/). In this article, I will show how to integrate that MCP server, or _any_ MCP server, inside your LLM workflows, using the [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/).

The Agents SDK recently [added support for MCP](https://openai.github.io/openai-agents-python/mcp/), strengthening its place as the default standard for LLM-application communication. This allows developers to leverage the existing features of the SDK to build more robust workflows with a growing list of MCP servers.

I found it incredibly easy to use, especially to augment my existing LLM workflows (that already use the Agents SDK) with external tools. Complementary features like [handoffs](https://openai.github.io/openai-agents-python/handoffs/) and [guardrails](https://openai.github.io/openai-agents-python/guardrails/) can make MCP-enabled workflows even more useful.

## Install Required Libraries

Install the Agents SDK:

```shell
uv pip install openai-agents
```

To set your OpenAI API key and the DiceDB server URL via a `.env` file, also install:

```shell
uv pip install openai python-dotenv
```

## Import the Libraries

We'll start by importing the libraries:

```python {title="main.py" linenos="inline" lineNoStart=1 anchorLineNos=true lineAnchors="main-py"}
from agents import Agent, Runner, trace
from agents.mcp import MCPServer, MCPServerStdio
from dotenv import load_dotenv
import os
import openai
import asyncio

load_dotenv()
```

Make sure your `.env` files contain:

```env {title=".env", linenos="inline" lineNoStart=1}
OPENAI_API_KEY=your-api-key-here
DICEDB_SERVER_URL=localhost:7379
```

## Create an Agent

Let's write a function that defines our "DiceDB MCP" agent. The agent takes a prompt, the DiceDB server URL, and an MCP server as input and prints the response after running:

```python {title="main.py" linenos="inline" lineNoStart=10 anchorLineNos=true lineAnchors="main-py"}
# run function runs the DiceDB MCP agent
async def run(mcp_server: MCPServer, prompt: str, server_url: str):
    agent = Agent(name="DiceDB MCP", # Name of the agent
                  # Make sure the LLM passes the server_url to the MCP server
                  instructions=f"""You can interact with a DiceDB
                                database running at {server_url},
                                USE THIS FOR URL.""",
                  mcp_servers=[mcp_server], # Use the MCP server with this agent
                  handoffs=[], # You can add handoffs
                  input_guardrails=[], # and guardrails like for other agents
                  )
    # Run the agent with the prompt
    result = await Runner.run(starting_agent=agent, input=prompt)
    # Print the final output after running the tool from the MCP server
    print("Final response:\n", result.final_output)
```

Here's what the code does:

- [11](#main-py-11): Create a `run` function that creates and runs an agent.
- [12](#main-py-12)-[20](#main-py-20): Define the `"DiceDB MCP"` agent, which uses the `mcp_server` passed in the calling function and instructs the LLM to pass the `server_url` to the MCP tool.
- [22](#main-py-22)-[24](#main-py-24): Run the agent with the provided `prompt` and print the `result`.

As shown, you can also integrate other features provided by the SDK, such as handoffs and guardrails. However, we will focus on integrating the MCP server to keep this example simple.

## Run the Agent

Now let's run the agent. For this example, we have hard-coded the prompt, but you can follow the same logic as your existing agentic workflows and get a prompt from a real user:

```python {title="main.py" linenos="inline" lineNoStart=26 anchorLineNos=true lineAnchors="main-py"}
async def main():
    openai.api_key = os.getenv("OPENAI_API_KEY")
    if not openai.api_key:
        raise RuntimeError("OPENAI_API_KEY not set in environment variables.")

    server_url = os.getenv("DICEDB_SERVER_URL")
    if not server_url:
        raise RuntimeError(
            "DICEDB_SERVER_URL not set in environment variables.")
    # Hardcoded prompt, and it has been 20 years since Friends
    prompt = """Can you update the 'name' key
                with the value 'Rachel Green'?
                If it's already 'Rachel Green',
                change it to 'Chandler Bing'."""

    try:
        # The MCP server is running locally
        # and uses stdio transport
        async with MCPServerStdio(
            # Cache the list of available tools from the
            # MCP server, as the tools list won't change
            cache_tools_list=True,
            # Run the MCP server binary at provided path
            params={"command": "/Users/pottekkat/go/bin/dicedb-mcp",
                    "args": [""]},
        ) as server:
            print("Running the DiceDB agent...")
            # Automatically trace the MCP operations
            with trace(workflow_name="DiceDB MCP"):
                await run(server, prompt, server_url)

    except Exception as e:
        print("Failed to run the DiceDB agent:", e)


if __name__ == "__main__":
    asyncio.run(main())
```

This is what's happening here:

- [44](#main-py-44): The MCP server runs locally and uses stdio transport. So, the agent will use it to communicate with the server.
- [47](#main-py-47): The MCP server does not dynamically change the list of available tools. So, it's ok to cache the list of available tools.
- [49](#main-py-49): The MCP server we made last week is just a binary in `/Users/pottekkat/go/bin/dicedb-mcp`. You can replace it with the command to run your server.
- [54](#main-py-54): Use the built-in tracing functionality provided by the SDK.
- [55](#main-py-55): Call the `run` function we defined before with the MCP server we initialized along with the prompt and the DiceDB server URL.

## Actually Run the Agent

Let's _actually_ try running this script:

```shell
uv run main.py
```

You will get a response like:

```text
The 'name' key was updated to 'Chandler Bing'.
```

You'll also be able to see the trace for this call on the OpenAI Platform Dashboard. It should look something like this:

{{< figure src="/images/agents-mcp/openai-platform-dashboard.png#center" title="Trace shown in OpenAI Platform Dashboard" caption="This is automatically generated. You can also [customize the trace](https://openai.github.io/openai-agents-python/ref/tracing/)." link="/images/agents-mcp/openai-platform-dashboard.png" target="_blank" class="align-center" >}}

The introduction of MCP has improved the usefulness of an already popular SDK, and I have little doubt about the ubiquity of the MCP standard in the foreseeable future.

However, the Agents SDK is only available in Python now, while there are MCP SDKs available in a variety of programming languages. But I guess this is temporary, and new SDKs for languages like JS and Go will soon be released.