# Building a Local LLM Coding Assistant on an RTX 5090


I run a Proxmox server in my office with an RTX 5090 and wanted to find out if Gemma 4 could be my daily driver for local code assistance. I spent Easter Saturday testing models, breaking tool calling, and tuning llama.cpp configs. Gemma 4 did not make the cut, at least not yet. Qwen 3.5 35B-A3B did. Here is what happened. <!--more-->

{{< image src="hero-server.webp" caption="The Proxmox server with a watercooled RTX 5090. 32GB VRAM for local inference." >}}

## The Hardware

| Component | Spec |
|---|---|
| CPU | AMD Threadripper 9960X |
| RAM | 192 GB DDR5 |
| GPU | NVIDIA RTX 5090 32GB VRAM |
| Driver | 580.105.08, CUDA 13.0 |
| Host | Proxmox |
| Inference | llama.cpp with CUDA in a Debian 13 LXC container |

The goal was to see what works on consumer hardware. I already use Claude Code daily and it is excellent, but I wanted to explore what is possible when you run everything on your own hardware. Privacy is a nice bonus, and so is never hitting a rate limit. 32GB of VRAM fits quantized 30B+ models entirely on the card. Enough for single-user inference at full speed.

## OpenCode: The Client

[OpenCode](https://github.com/opencode-ai/opencode) is an open-source terminal coding assistant. Feature-wise it is close to Claude Code, and being open source means the pace of development is impressive. Where it really shines is customization: custom providers, skills, permissions, and MCP servers are all configurable. It speaks the OpenAI-compatible API, which is what makes this whole setup work. You point OpenCode at a llama.cpp server and it treats it like any other backend.

{{< image src="opencode-screenshot.webp" caption="OpenCode running in the terminal with a local Qwen 3.5 backend." >}}

## Evaluating Gemma 4

Gemma 4 landed with two variants that fit on the RTX 5090 at Q4 quantization: a dense 31B model and a Mixture-of-Experts (MoE) 26B model. Both support multimodal input and thinking mode. I tested both as coding assistants on a small Python side project, doing code development, editing, and tool calling.

### Gemma 4 31B (Dense)

On paper, this model is hard to beat at its size. Google positions it as "optimized for consumer GPUs", which is exactly what I was looking for. It supports 140 languages, has native function calling, and the benchmarks look promising: LiveCodeBench v6 at 80.0% and tau2-bench (agentic tool use) at 86.4%.

{{< image src="gemma4-benchmarks.webp" caption="Gemma 4 benchmark comparison. Source: [Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)" >}}

Benchmarks only tell part of the story though. You need to test on your own use case. In my testing, code quality was consistently the best of the three models I evaluated. But at 64 tokens per second and a max context of 90K tokens on 32GB VRAM, it is too slow for interactive coding on a single RTX 5090. With more GPU power it would be a strong pick.

### Gemma 4 26B-A4B (MoE)

The MoE variant trades some of that quality for speed. Only 4B active parameters per token means 186 tokens per second, and it fits the full 256K context with 7GB of VRAM to spare. Code quality stays close to the dense model.

Then I tried tool calling with OpenCode.

{{< admonition type="warning" title="Tool calling failure" open=true >}}
With complex system prompts (tool definitions, file context, agent instructions), the model generates text *about* calling tools instead of emitting the structured JSON. Simple prompts work. Real-world agent prompts do not. The 4B active parameters are likely not enough to handle both structured output and task reasoning.
{{< /admonition >}}

{{< image src="gemma4-tool-calling-fail.webp" caption="Gemma 4 26B-A4B describing a tool call instead of executing it." >}}

This is not a llama.cpp bug. Raw `curl` requests return correct `tool_calls` JSON. The dense 31B and Qwen 3.5 both handle the same prompts correctly. If the MoE variant improves on this front, it could absolutely become the better choice.

## How They Compare

All models use [Unsloth](https://unsloth.ai/) Q4_K_XL quantizations. Unsloth's dynamic quantization is key to running these models on VRAM-constrained setups while preserving quality. Without it, fitting 30B+ models on a single consumer GPU at usable quality would not be as practical.

These are numbers from my hardware, with my workloads. Your results will differ depending on context size and GPU.

| Model | Type | Active Params | Gen (tok/s) | Max Context | VRAM Used | Tool Calling | KV q4_1 Penalty |
|---|---|---|---|---|---|---|---|
| Gemma 4 31B | Dense | 31B | 64 | 90K | 30.9 GB | Works | -16% |
| Gemma 4 26B-A4B | MoE | 4B | 186 | 256K | 25.1 GB | Broken | -19% |
| **Qwen 3.5 35B-A3B** | **MoE** | **3B** | **188** | **131K** | **29.4 GB** | **Works** | **0%** |

{{< admonition type="tip" title="KV cache quantization matters more than you think" open=true >}}
KV cache quantization (`q4_1`) compresses the key-value cache that grows with context length. It lets you fit more context into VRAM.

Gemma 4 variants lose 16-19% generation speed with it enabled. Qwen 3.5 35B-A3B shows **zero penalty**. That means you can push context as high as VRAM allows without sacrificing speed. Always benchmark KV cache quantization on your specific model.
{{< /admonition >}}

## The Winner: Qwen 3.5 35B-A3B

Qwen 3.5 35B-A3B is a 35B parameter MoE model with 3B active parameters per token. It matches the Gemma MoE on speed (188 tok/s) and handles tool calling correctly. The key differentiator is the zero speed penalty from KV cache quantization. I run it at 131K context which uses 29.4 GB of VRAM and leaves some headroom on the card.

Thinking mode is supported via Jinja templates. I keep it enabled for coding tasks where step-by-step reasoning helps, and disable it when I want faster responses for simpler tasks.

## The Setup

### llama.cpp Server

llama.cpp runs in the Debian 13 LXC container with GPU passthrough and serves models via an OpenAI-compatible API. Each model gets its own port.

**Qwen 3.5 35B-A3B (thinking mode):**

```bash
llama-server \
  --model Qwen3.5-35B-A3B-UD-Q4_K_XL.gguf \
  --ctx-size 131072 \
  --cache-type-k q4_1 \
  --temp 0.6 \
  --top-k 20 \
  --min-p 0.00 \
  --jinja \
  --chat-template-kwargs '{"enable_thinking":true}' \
  --host 0.0.0.0 \
  --port 8001 \
  -ngl 999
```

**Gemma 4 31B (for comparison):**

```bash
llama-server \
  --model gemma-4-31B-it-UD-Q4_K_XL.gguf \
  --ctx-size 90112 \
  --top-k 64 \
  --jinja \
  --chat-template-kwargs '{"enable_thinking":true}' \
  --host 0.0.0.0 \
  --port 8002 \
  -ngl 999
```

{{< admonition type="info" title="Key flags explained" open=true >}}
- `--jinja`: Enables Jinja2 chat templates. Required for tool calling support.
- `--chat-template-kwargs '{"enable_thinking":true}'`: Activates chain-of-thought reasoning. The model shows its work before answering.
- `--cache-type-k q4_1`: Quantizes KV cache keys. Dramatically increases context capacity. Free on Qwen, costly on Gemma.
- `--min-p 0.00`: Disables min-p sampling. Qwen 3.5 recommendation.
- `-ngl 999`: Offload all layers to GPU. The Q4 quantized model fits comfortably in 32GB.
{{< /admonition >}}

### OpenCode Configuration

Save this to `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "qwen": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Qwen 3.5 35B A3B",
      "options": {
        "baseURL": "http://<your-server-ip>:8001/v1",
        "apiKey": "EMPTY"
      },
      "models": {
        "unsloth/Qwen3.5-35B-A3B": {
          "name": "Qwen3.5 35B A3B",
          "limit": {
            "context": 131072,
            "output": 8192
          }
        }
      }
    }
  },
  "model": "qwen/unsloth/Qwen3.5-35B-A3B"
}
```

The `baseURL` points to the llama.cpp server. `apiKey` is `"EMPTY"` since the local server has no auth. Match the `context` limit to the server's `--ctx-size`.

## Lessons from MCP and AGENTS.md

I also experimented with MCP servers and custom skills in OpenCode.

I installed an MCP server from a provider where I was on their standalone subscription, not the full suite. The server came with an `AGENTS.md` file that described all the tools available in the full product, including dozens of tools my subscription did not include. The model had no idea about this mismatch.

I noticed something was off because the thinking tokens were streaming very slowly. When I actually read what the model was thinking about, it was nonsense. It was spending its entire thinking budget searching for tools that were never loaded, reasoning about how to call them, and getting confused when they did not exist.

I used OpenCode's `/export` command to dump the full conversation trace and confirmed the mismatch. The fix was straightforward: replace the AGENTS.md with one that only describes the tools actually available. The result was roughly 50% faster reasoning. On the Gemma 4 31B that meant going from 1.5 minute responses down to around 45 seconds, which made a real difference in usability.

{{< admonition type="note" title="Read what your agent is thinking" open=true >}}
With local models you can see the thinking tokens stream in real time. If the output feels slow, read what the model is actually reasoning about. If it is nonsense or going in circles, there is likely a mismatch in the system prompt or tool definitions. OpenCode's `/export` command dumps the full trace so you can pinpoint exactly where things go wrong. Less noise in the prompt means fewer wasted tokens.
{{< /admonition >}}

## Wrapping Up

The biggest surprise was how much the details matter: a KV cache flag that is free on one architecture costs 19% on another, and a mismatched AGENTS.md file can waste half your thinking budget.

Gemma 4 is a strong model family and I expect the MoE variant to improve on tool calling. When it does, I will revisit it. For now, Qwen 3.5 35B-A3B earns the daily driver spot.

