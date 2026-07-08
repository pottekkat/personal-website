---
title: Building Durable Agents
slug: durable-agents
date: 2026-07-08T05:26:48Z
draft: false
toc:
  show: false
ShowRelatedContent: false
description: A practical guide to prevent transient model provider errors, tool call failures, or good old network hiccups from breaking your agents.
summary: A guide to using Temporal, the open source durable workflow execution platform, to build better, more reliable, and observable LLM agents.
tags:
  - ai
  - software engineering
  - tutorials
categories:
  - Tutorials
series: []
aliases: []
mermaid: true
cover:
  image: /images/building-durable-agents/watchmaker-banner.jpg
  alt: An old watchmaker busy at his workbench.
  caption: I know you are going to point Claude Code to this with "make my agents durable, make no mistakes."
  relative: false
fmContentType: Post (default)
---

An "agent" is just a loop. It does three things:

1. Take a prompt, pass it on to the LLM, and get the response.
2. If the response contains tool calls, execute the tools and return the results to the LLM.
3. Break out of the loop if there are no more tool calls in the response, and return the response.

{{< mermaid >}}
flowchart TB
    p([User prompt]) --> llm[Call the LLM]
    llm --> d{Tool calls?}
    d -->|Yes| t[Execute tool calls]
    t --> llm
    d -->|No| r([Return final response])
{{< /mermaid >}}

For example, consider this otherwise useless agent that suggests what to pack for your upcoming flight.

{{< tabs >}}
{{% tab "Flowchart" %}}
{{< mermaid >}}
flowchart TB
    u([What should I pack<br/>for my flight QF1?]) --> llm
    subgraph agentloop [The agent loop]
      direction TB
      llm{{LLM}} -->|"1 · get_flight_status('QF1')"| f["Flight API → London"]
      f --> llm
      llm -->|"2 · get_weather('London')"| w["Weather API → 6°C, clear"]
      w --> llm
    end
    llm -->|no tool calls| out([Pack a warm coat,<br/>a scarf, and gloves.])
{{< /mermaid >}}
{{% /tab %}}
{{% tab "Pseudocode" %}}
```python
def get_flight_status(flight):
    return ... # QF1 → London

def get_weather(city):
    return ... # London → 6°C, clear

tools = {"get_flight_status": get_flight_status, "get_weather": get_weather}

messages = [{"role": "user", "content": "What should I pack for my flight QF1?"}]

while True:
    response = llm(messages, tools)
    messages.append(response)

    if not response.tool_calls:
        break

    for call in response.tool_calls:
        result = tools[call.name](**call.args)
        messages.append({"role": "tool", "content": result})

print(response.text) # Pack a warm coat, a scarf, and gloves.
```
{{% /tab %}}
{{< /tabs >}}

1. Based on the prompt, the LLM decided to call `get_flight_status("QF1")` to retrieve the destination.
2. The loop continues, and the tool result is returned to the LLM, after which it decides to call `get_weather("London")`.
3. The loop continues again, and the weather in London is returned to the LLM.
4. The LLM now has all the data to decide on the appropriate apparel and produce the response without any tool calls.
5. The loop breaks. The user sees the final response.

`while` the loop is simple, a lot can go wrong and make it unreliable:

1. The APIs might have a transient issue (rate limits or `5xx` errors) that could bring down the entire loop. If it fails during the Nth turn, all the N LLM calls are wasted.
2. The upstream model provider can have an outage. You know the kind when Claude's status page goes Christmas red in the middle of June.
3. The process itself can die in long-running loops (which are fairly common now; my Claude Code sessions regularly run for more than 30 minutes) when the machine restarts (during a new deploy, due to an issue, etc.), and there'll be no way to recover from the middle of the agent loop.

A better solution is to use a durable execution platform like [Temporal](https://temporal.io), which handles all of these for you. When a tool call fails, it is retried. If your machine restarts, it resumes from the exact iteration without having to spend all that money again on the same tokens.

I've been using Temporal for the past year to build all my agents. While Temporal has been around for a while as a building block for durable systems (e.g., payment flows), it naturally fits the kinds of problems we face when building agents. Temporal is also [free and open source](https://github.com/temporalio), and it has [SDKs](https://docs.temporal.io/develop) in all major programming languages.

My goal is to share how I've been using it to make my agent loops durable and, as a bonus, observable, using the example apparel-suggestion agent from before. I would suggest everyone first go through the [quickstart guide](https://docs.temporal.io/quickstarts) of the programming language of their choice before proceeding, as I don't want to parrot the docs here.

## Starting the Temporal Development Server

I have the Temporal CLI installed on my local machine, which helps me spin up a local Temporal server for development. It also helps me connect to and monitor my production Temporal instances. To install the CLI:

{{< tabs >}}
{{% tab "macOS" %}}
```bash
brew install temporal
```
{{% /tab %}}
{{% tab "Windows" %}}
Download the Temporal CLI archive for your architecture:

- [Windows amd64](https://temporal.download/cli/archive/latest?platform=windows&arch=amd64)
- [Windows arm64](https://temporal.download/cli/archive/latest?platform=windows&arch=arm64)

Extract it and add `temporal.exe` to your `PATH`.
{{% /tab %}}
{{% tab "Linux" %}}
Download the Temporal CLI for your architecture:

- [Linux amd64](https://temporal.download/cli/archive/latest?platform=linux&arch=amd64)
- [Linux arm64](https://temporal.download/cli/archive/latest?platform=linux&arch=arm64)

Extract the archive and move the `temporal` binary into your `PATH`, for example:

```bash
sudo mv temporal /usr/local/bin
```
{{% /tab %}}
{{< /tabs >}}

Then start the dev server:

```bash
temporal server start-dev
```

The Temporal server runs on port `7233`, and a web UI will be available at [http://localhost:8233](http://localhost:8233).

> [!TIP]
> You can also run [Temporal inside Docker](https://hub.docker.com/r/temporalio/server) if you don't want to install the CLI.

## Unreliable Agent

Let's start with the unreliable agent from our previous example. I will use OpenAI's model and SDK, but you could just as well use any other platform.

> [!IMPORTANT]
> Set the `OPENAI_API_KEY` environment variable before running the script.

{{< tabs >}}
{{% tab "Python" %}}
```python
import json

from openai import OpenAI

client = OpenAI()  # reads OPENAI_API_KEY from the environment
MODEL = "gpt-5.4-nano-2026-03-17"

def get_flight_status(flight):
    return json.dumps({"flight": flight, "destination": "London (LHR)", "status": "on time"})

def get_weather(city):
    return json.dumps({"city": city, "temperature_c": 6, "conditions": "clear"})

TOOL_IMPLS = {"get_flight_status": get_flight_status, "get_weather": get_weather}

SYSTEM_PROMPT = (
    "You are a travel assistant. Given a flight number, use get_flight_status to find "
    "the destination, then get_weather for that city, then tell the user what to pack "
    "in one short sentence."
)

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_flight_status",
            "description": "Look up the destination city and status of a flight by its number.",
            "parameters": {
                "type": "object",
                "properties": {"flight": {"type": "string", "description": "Flight number, e.g. QF1"}},
                "required": ["flight"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather for a city.",
            "parameters": {
                "type": "object",
                "properties": {"city": {"type": "string", "description": "City name, e.g. London"}},
                "required": ["city"],
            },
        },
    },
]

def call_llm(messages):
    completion = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        tools=TOOLS,
        parallel_tool_calls=False,
    )
    return completion.choices[0].message

def run_tool(tool_call):
    name = tool_call.function.name
    args = json.loads(tool_call.function.arguments)
    return TOOL_IMPLS[name](**args)

def run_agent(goal):
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": goal},
    ]
    while True:
        message = call_llm(messages)
        messages.append(message)

        if not message.tool_calls:
            return message.content

        result = run_tool(message.tool_calls[0])
        messages.append(
            {"role": "tool", "tool_call_id": message.tool_calls[0].id, "content": result}
        )


if __name__ == "__main__":
    print(run_agent("What should I pack for my flight QF1?"))
```
{{% /tab %}}
{{% tab "Go" %}}
```go
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/shared"
)

const model = "gpt-5.4-nano-2026-03-17"

const systemPrompt = "You are a travel assistant. Given a flight number, use get_flight_status to find " +
	"the destination, then get_weather for that city, then tell the user what to pack in one short sentence."

func getFlightStatus(flight string) string {
	b, _ := json.Marshal(map[string]any{"flight": flight, "destination": "London (LHR)", "status": "on time"})
	return string(b)
}

func getWeather(city string) string {
	b, _ := json.Marshal(map[string]any{"city": city, "temperature_c": 6, "conditions": "clear"})
	return string(b)
}

var tools = []openai.ChatCompletionToolUnionParam{
	openai.ChatCompletionFunctionTool(shared.FunctionDefinitionParam{
		Name:        "get_flight_status",
		Description: openai.String("Look up the destination city and status of a flight by its number."),
		Parameters: shared.FunctionParameters{
			"type": "object",
			"properties": map[string]any{
				"flight": map[string]any{"type": "string", "description": "Flight number, e.g. QF1"},
			},
			"required": []string{"flight"},
		},
	}),
	openai.ChatCompletionFunctionTool(shared.FunctionDefinitionParam{
		Name:        "get_weather",
		Description: openai.String("Get the current weather for a city."),
		Parameters: shared.FunctionParameters{
			"type": "object",
			"properties": map[string]any{
				"city": map[string]any{"type": "string", "description": "City name, e.g. London"},
			},
			"required": []string{"city"},
		},
	}),
}

func runTool(name, arguments string) string {
	switch name {
	case "get_flight_status":
		var args struct {
			Flight string `json:"flight"`
		}
		json.Unmarshal([]byte(arguments), &args)
		return getFlightStatus(args.Flight)
	case "get_weather":
		var args struct {
			City string `json:"city"`
		}
		json.Unmarshal([]byte(arguments), &args)
		return getWeather(args.City)
	default:
		return fmt.Sprintf("unknown tool: %s", name)
	}
}

func runAgent(ctx context.Context, client openai.Client, goal string) (string, error) {
	messages := []openai.ChatCompletionMessageParamUnion{
		openai.SystemMessage(systemPrompt),
		openai.UserMessage(goal),
	}
	for {
		completion, err := client.Chat.Completions.New(ctx, openai.ChatCompletionNewParams{
			Model:             model,
			Messages:          messages,
			Tools:             tools,
			ParallelToolCalls: openai.Bool(false),
		})
		if err != nil {
			return "", err
		}

		message := completion.Choices[0].Message
		messages = append(messages, message.ToParam())

		if len(message.ToolCalls) == 0 {
			return message.Content, nil
		}

		call := message.ToolCalls[0]
		result := runTool(call.Function.Name, call.Function.Arguments)
		messages = append(messages, openai.ToolMessage(result, call.ID))
	}
}

func main() {
	client := openai.NewClient() // reads OPENAI_API_KEY from the environment
	answer, err := runAgent(context.Background(), client, "What should I pack for my flight QF1?")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(answer)
}
```
{{% /tab %}}
{{< /tabs >}}

Try running this, and you'll see the final response. Now let's see how Temporal makes it durable.

## Durability with Temporal

The agent loop maps to a [_workflow_](https://docs.temporal.io/workflows) in Temporal. It orchestrates a sequence of steps deterministically. The actual executions—the LLM call and the tool calls—happen inside a Temporal [_activity_](https://docs.temporal.io/activities).

Let's start by moving the LLM and tool call functions into activities.

{{< tabs >}}
{{% tab "Python" %}}
```python {title="activities.py" linenos="inline" lineNoStart=1 anchorLineNos=true lineAnchors="agent-activities" hl_lines=["5", "51-56", "58", "67-73", "75"]}
import json
from dataclasses import dataclass

from openai import OpenAI
from temporalio import activity

client = OpenAI()  # reads OPENAI_API_KEY from the environment
MODEL = "gpt-5.4-nano-2026-03-17"

def get_flight_status(flight):
    return json.dumps({"flight": flight, "destination": "London (LHR)", "status": "on time"})

def get_weather(city):
    return json.dumps({"city": city, "temperature_c": 6, "conditions": "clear"})

TOOL_IMPLS = {"get_flight_status": get_flight_status, "get_weather": get_weather}

SYSTEM_PROMPT = (
    "You are a travel assistant. Given a flight number, use get_flight_status to find "
    "the destination, then get_weather for that city, then tell the user what to pack "
    "in one short sentence."
)

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_flight_status",
            "description": "Look up the destination city and status of a flight by its number.",
            "parameters": {
                "type": "object",
                "properties": {"flight": {"type": "string", "description": "Flight number, e.g. QF1"}},
                "required": ["flight"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather for a city.",
            "parameters": {
                "type": "object",
                "properties": {"city": {"type": "string", "description": "City name, e.g. London"}},
                "required": ["city"],
            },
        },
    },
]

@dataclass
class LLMResponse:
    content: str | None
    message: dict
    tool_calls: list[dict]
    tool_call: dict | None

@activity.defn
def call_llm(messages: list[dict]) -> LLMResponse:
    completion = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        tools=TOOLS,
        parallel_tool_calls=False,
    )
    message = completion.choices[0].message
    tool_calls = [call.model_dump() for call in message.tool_calls or []]
    return LLMResponse(
        content=message.content,
        message=message.model_dump(exclude_none=True),
        tool_calls=tool_calls,
        tool_call=tool_calls[0] if tool_calls else None,
    )

@activity.defn
def run_tool(tool_call: dict) -> str:
    name = tool_call["function"]["name"]
    args = json.loads(tool_call["function"]["arguments"])
    return TOOL_IMPLS[name](**args)
```

Here's what we changed:

- [5](#agent-activities-5): Import Temporal's `activity` decorator.
- [51](#agent-activities-51)-[56](#agent-activities-56): `LLMResponse` is a dataclass to serialize whatever an activity returns to be stored in Temporal (and used in replays).
- [58](#agent-activities-58) and [75](#agent-activities-75): The `@activity.defn` decorator makes Temporal treat them as activities and remember their return values.
- [67](#agent-activities-67)-[73](#agent-activities-73): `call_llm` makes the same API call as before but hands back the dataclass, and `model_dump()` flattens the SDK object into plain dicts.
{{% /tab %}}
{{% tab "Go" %}}
```go {title="activities.go" linenos="inline" lineNoStart=1 anchorLineNos=true lineAnchors="agent-activities-go" hl_lines=["12-30", "74-104"]}
package agent

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/shared"
)

type Message struct {
	Role       string     `json:"role"`
	Content    string     `json:"content,omitempty"`
	ToolCalls  []ToolCall `json:"tool_calls,omitempty"`
	ToolCallID string     `json:"tool_call_id,omitempty"`
}

type ToolCall struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Arguments string `json:"arguments"`
}

type LLMResponse struct {
	Content   string     `json:"content"`
	Message   Message    `json:"message"`
	ToolCalls []ToolCall `json:"tool_calls"`
	ToolCall  ToolCall   `json:"tool_call"`
}

const model = "gpt-5.4-nano-2026-03-17"

const systemPrompt = "You are a travel assistant. Given a flight number, use get_flight_status to find " +
	"the destination, then get_weather for that city, then tell the user what to pack in one short sentence."

var client = openai.NewClient() // reads OPENAI_API_KEY from the environment

func getFlightStatus(flight string) string {
	b, _ := json.Marshal(map[string]any{"flight": flight, "destination": "London (LHR)", "status": "on time"})
	return string(b)
}

func getWeather(city string) string {
	b, _ := json.Marshal(map[string]any{"city": city, "temperature_c": 6, "conditions": "clear"})
	return string(b)
}

var tools = []openai.ChatCompletionToolUnionParam{
	openai.ChatCompletionFunctionTool(shared.FunctionDefinitionParam{
		Name:        "get_flight_status",
		Description: openai.String("Look up the destination city and status of a flight by its number."),
		Parameters: shared.FunctionParameters{
			"type": "object",
			"properties": map[string]any{
				"flight": map[string]any{"type": "string", "description": "Flight number, e.g. QF1"},
			},
			"required": []string{"flight"},
		},
	}),
	openai.ChatCompletionFunctionTool(shared.FunctionDefinitionParam{
		Name:        "get_weather",
		Description: openai.String("Get the current weather for a city."),
		Parameters: shared.FunctionParameters{
			"type": "object",
			"properties": map[string]any{
				"city": map[string]any{"type": "string", "description": "City name, e.g. London"},
			},
			"required": []string{"city"},
		},
	}),
}

func toParams(messages []Message) []openai.ChatCompletionMessageParamUnion {
	var params []openai.ChatCompletionMessageParamUnion
	for _, m := range messages {
		switch m.Role {
		case "system":
			params = append(params, openai.SystemMessage(m.Content))
		case "user":
			params = append(params, openai.UserMessage(m.Content))
		case "tool":
			params = append(params, openai.ToolMessage(m.Content, m.ToolCallID))
		case "assistant":
			assistant := openai.ChatCompletionAssistantMessageParam{}
			if m.Content != "" {
				assistant.Content.OfString = openai.String(m.Content)
			}
			for _, call := range m.ToolCalls {
				assistant.ToolCalls = append(assistant.ToolCalls, openai.ChatCompletionMessageToolCallUnionParam{
					OfFunction: &openai.ChatCompletionMessageFunctionToolCallParam{
						ID: call.ID,
						Function: openai.ChatCompletionMessageFunctionToolCallFunctionParam{
							Name:      call.Name,
							Arguments: call.Arguments,
						},
					},
				})
			}
			params = append(params, openai.ChatCompletionMessageParamUnion{OfAssistant: &assistant})
		}
	}
	return params
}

func CallLLM(ctx context.Context, messages []Message) (LLMResponse, error) {
	completion, err := client.Chat.Completions.New(ctx, openai.ChatCompletionNewParams{
		Model:             model,
		Messages:          toParams(messages),
		Tools:             tools,
		ParallelToolCalls: openai.Bool(false),
	})
	if err != nil {
		return LLMResponse{}, err
	}

	message := completion.Choices[0].Message
	var toolCalls []ToolCall
	for _, call := range message.ToolCalls {
		toolCalls = append(toolCalls, ToolCall{
			ID:        call.ID,
			Name:      call.Function.Name,
			Arguments: call.Function.Arguments,
		})
	}

	response := LLMResponse{
		Content:   message.Content,
		Message:   Message{Role: "assistant", Content: message.Content, ToolCalls: toolCalls},
		ToolCalls: toolCalls,
	}
	if len(toolCalls) > 0 {
		response.ToolCall = toolCalls[0]
	}
	return response, nil
}

func RunTool(ctx context.Context, call ToolCall) (string, error) {
	switch call.Name {
	case "get_flight_status":
		var args struct {
			Flight string `json:"flight"`
		}
		json.Unmarshal([]byte(call.Arguments), &args)
		return getFlightStatus(args.Flight), nil
	case "get_weather":
		var args struct {
			City string `json:"city"`
		}
		json.Unmarshal([]byte(call.Arguments), &args)
		return getWeather(args.City), nil
	default:
		return "", fmt.Errorf("unknown tool: %s", call.Name)
	}
}
```

Here's what we changed:

- [12](#agent-activities-go-12)-[30](#agent-activities-go-30): `Message`, `ToolCall`, and `LLMResponse` are structs to serialize responses for Temporal.
- [74](#agent-activities-go-74)-[104](#agent-activities-go-104): `toParams` rebuilds the SDK's message params from these structs inside the activity.
- [106](#agent-activities-go-106)-[136](#agent-activities-go-136): `CallLLM` makes the same API call as before but returns a plain `LLMResponse`.
{{% /tab %}}
{{< /tabs >}}

Now we can orchestrate these activities through a workflow. i.e., instead of calling the LLM and tool functions directly, we run them as Temporal activities. Temporal stores each activity result in the workflow's [_event history_](https://docs.temporal.io/workflow-execution/event), and if the process dies mid-run, these results are used instead of rerunning.

{{< tabs >}}
{{% tab "Python" %}}
```python {title="workflow.py" linenos="inline" lineNoStart=1 anchorLineNos=true lineAnchors="agent-workflow" hl_lines=["18-23", "29-33"]}
from datetime import timedelta

from temporalio import workflow
from temporalio.common import RetryPolicy

with workflow.unsafe.imports_passed_through():
    from activities import call_llm, run_tool, SYSTEM_PROMPT

@workflow.defn
class AgentWorkflow:
    @workflow.run
    async def run(self, goal: str) -> str:
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": goal},
        ]
        while True:
            response = await workflow.execute_activity(
                call_llm,
                args=[messages],
                start_to_close_timeout=timedelta(seconds=60),
                retry_policy=RetryPolicy(maximum_attempts=5),
            )
            messages.append(response.message)

            if not response.tool_calls:
                return response.content

            result = await workflow.execute_activity(
                run_tool,
                args=[response.tool_call],
                start_to_close_timeout=timedelta(minutes=5),
            )
            messages.append(
                {"role": "tool", "tool_call_id": response.tool_call["id"], "content": result}
            )
```

The only real change is that we now wrap the loop in a workflow, and the function calls become activity executions:

- [18](#agent-workflow-18)-[23](#agent-workflow-23): The model call runs as an activity with a 60-second timeout and a retry policy that runs the activity up to five times with exponential backoff. Temporal lets you set up better retry policies for retryable and [non-retryable errors](https://docs.temporal.io/references/failures#non-retryable), which I also use frequently in my workflows.
- [29](#agent-workflow-29)-[33](#agent-workflow-33): Similarly, tools are executed in their own activity with a longer five-minute timeout (and default policies). The result of the tool run is in the event history, which can be replayed instead of running it again, which is quite useful for non-idempotent operations.
{{% /tab %}}
{{% tab "Go" %}}
```go {title="workflow.go" linenos="inline" lineNoStart=1 anchorLineNos=true lineAnchors="agent-workflow-go" hl_lines=["11-16", "25", "35-39"]}
package agent

import (
	"time"

	"go.temporal.io/sdk/temporal"
	"go.temporal.io/sdk/workflow"
)

func AgentWorkflow(ctx workflow.Context, goal string) (string, error) {
	ctx = workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
		StartToCloseTimeout: 60 * time.Second,
		RetryPolicy: &temporal.RetryPolicy{
			MaximumAttempts: 5,
		},
	})

	messages := []Message{
		{Role: "system", Content: systemPrompt},
		{Role: "user", Content: goal},
	}

	for {
		var response LLMResponse
		err := workflow.ExecuteActivity(ctx, CallLLM, messages).Get(ctx, &response)
		if err != nil {
			return "", err
		}
		messages = append(messages, response.Message)

		if len(response.ToolCalls) == 0 {
			return response.Content, nil
		}

		toolCtx := workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
			StartToCloseTimeout: 5 * time.Minute,
		})
		var result string
		err = workflow.ExecuteActivity(toolCtx, RunTool, response.ToolCall).Get(ctx, &result)
		if err != nil {
			return "", err
		}
		messages = append(messages, Message{
			Role:       "tool",
			ToolCallID: response.ToolCall.ID,
			Content:    result,
		})
	}
}
```

The only real change is that we now wrap the loop in a workflow, and the function calls become activity executions:

- [11](#agent-workflow-go-11)-[16](#agent-workflow-go-16): A 60-second timeout and a retry policy that runs an activity up to five times with exponential backoff. Temporal lets you set up better retry policies for retryable and [non-retryable errors](https://docs.temporal.io/references/failures#non-retryable), which I also use frequently in my workflows.
- [25](#agent-workflow-go-25): The model call runs as an activity under these options. On a transient failure, Temporal reruns it without the loop having to catch anything.
- [35](#agent-workflow-go-35)-[39](#agent-workflow-go-39): The tool runs in its own activity with a longer five-minute timeout (and the default retry policy). The result of the tool run is in the event history, which can be replayed instead of running it again, which is quite useful for non-idempotent operations.
{{% /tab %}}
{{< /tabs >}}

With these slight modifications leveraging Temporal, you get retries with backoff and recovery out of the box, without having to reinvent a worse wheel yourself.

## Server, Workers, and Client

Temporal has three components:

1. **Server**: The dev server we started at the beginning. It stores the event history and distributes work to workers via a task queue.
2. **Workers**: This is what runs your code. A [_worker_](https://docs.temporal.io/workers) picks up work from the server, executes the workflow and its activities, and reports the results. Workers are stateless, so you can spin up multiple workers to scale horizontally.
3. **Client**: This starts a workflow. It just tells the server to start one and does not execute any of your code.

The client hands a workflow to the server, and any worker polling the same task queue (`agent`, in the example below) picks it up. For example, the client might sit inside your backend and start a workflow on a REST call, while one or more workers poll the server and execute the agent loop.

{{< mermaid >}}
flowchart TB
    req([REST API call]) --> client

    subgraph backend [Your backend]
      client[Temporal client]
    end

    server[Temporal server]
    queue[["agent task queue"]]
    history[(Event history)]
    server -.- queue
    server -.- history

    subgraph worker [Worker process]
      loop["Agent loop:<br/>LLM + tool activities"]
    end

    client -->|"1 · start workflow"| server
    loop -->|"2 · poll task queue"| server
    server -->|"3 · deliver task"| loop
    loop -->|"4 · report result"| server
    server -.->|"5 · final result"| client
{{< /mermaid >}}

The dev server is already running. Let's create the worker, which will register the workflow and activities, and then the client, which starts the workflow.

{{< tabs >}}
{{% tab "Python" %}}
```python {title="worker.py"}
import asyncio
from concurrent.futures import ThreadPoolExecutor

from temporalio.client import Client
from temporalio.worker import Worker

from activities import call_llm, run_tool
from workflow import AgentWorkflow

async def main():
    client = await Client.connect("localhost:7233")
    worker = Worker(
        client,
        task_queue="agent",
        workflows=[AgentWorkflow],
        activities=[call_llm, run_tool],
        activity_executor=ThreadPoolExecutor(max_workers=10),
    )
    await worker.run()

if __name__ == "__main__":
    asyncio.run(main())
```
{{% /tab %}}
{{% tab "Go" %}}
```go {title="worker/main.go"}
package main

import (
	"log"

	"agent"
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
)

func main() {
	c, err := client.Dial(client.Options{})
	if err != nil {
		log.Fatalln("unable to create Temporal client:", err)
	}
	defer c.Close()

	w := worker.New(c, "agent", worker.Options{})
	w.RegisterWorkflow(agent.AgentWorkflow)
	w.RegisterActivity(agent.CallLLM)
	w.RegisterActivity(agent.RunTool)

	if err := w.Run(worker.InterruptCh()); err != nil {
		log.Fatalln("unable to start worker:", err)
	}
}
```
{{% /tab %}}
{{< /tabs >}}

Then start a run from a client:

{{< tabs >}}
{{% tab "Python" %}}
```python {title="starter.py"}
import asyncio

from temporalio.client import Client

from workflow import AgentWorkflow

async def main():
    client = await Client.connect("localhost:7233")
    result = await client.execute_workflow(
        AgentWorkflow.run,
        "What should I pack for my flight QF1?",
        id="pack-for-qf1",
        task_queue="agent",
    )
    print(result)

if __name__ == "__main__":
    asyncio.run(main())
```
{{% /tab %}}
{{% tab "Go" %}}
```go {title="starter/main.go"}
package main

import (
	"context"
	"fmt"
	"log"

	"agent"
	"go.temporal.io/sdk/client"
)

func main() {
	c, err := client.Dial(client.Options{})
	if err != nil {
		log.Fatalln("unable to create Temporal client:", err)
	}
	defer c.Close()

	run, err := c.ExecuteWorkflow(
		context.Background(),
		client.StartWorkflowOptions{ID: "pack-for-qf1", TaskQueue: "agent"},
		agent.AgentWorkflow,
		"What should I pack for my flight QF1?",
	)
	if err != nil {
		log.Fatalln("unable to start workflow:", err)
	}

	var result string
	if err := run.Get(context.Background(), &result); err != nil {
		log.Fatalln("unable to get workflow result:", err)
	}
	fmt.Println(result)
}
```
{{% /tab %}}
{{< /tabs >}}

With the dev server still running, start the worker and kick off a run:

{{< tabs >}}
{{% tab "Python" %}}
```bash
python worker.py
```

```bash
python starter.py
```
{{% /tab %}}
{{% tab "Go" %}}
```bash
go run ./worker
```

```bash
go run ./starter
```
{{% /tab %}}
{{< /tabs >}}

You will see a similar answer from the agent as before. You can open the Temporal web UI at [http://localhost:8233](http://localhost:8233), and you will find this workflow run. Each LLM call and tool call shows up in the event history, and you will be able to click through to see exactly what happened in each step. This inherent observability is quite useful when debugging long-running agent workflows.

{{< figure src="/images/building-durable-agents/temporal-ui-history.png#center" title="The agent loop in the Temporal Web UI" caption="Each `call_llm` and `run_tool` is its own activity in the event history." link="/images/building-durable-agents/temporal-ui-history.png" target="_blank" class="align-center" >}}

You can try building more complex, multi-step agents with more tools that could have ephemeral issues to see how Temporal helps with durability.

> [!HIRING]
> I'm hiring software engineers and researchers to join our team at [Eternis](https://www.eternis.ai). [Get in touch](mailto:navendu@eternis.ai) if you'd like to work with us.

For my team and me, all of our agent loops are, by default, in Temporal. We self-host the open source version of Temporal, and it seems to meet all our needs.

Temporal also translates well to multi-agent architectures. For example, Temporal has the concept of [_child workflows_](https://docs.temporal.io/child-workflows), which can correspond to child agents spawned by a main agent. Once you get used to Temporal, you will start to think about your agent architecture in terms of these familiar building blocks.
