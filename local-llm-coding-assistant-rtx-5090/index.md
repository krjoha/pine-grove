# Building a Local LLM Coding Assistant on an RTX 5090


I run a Proxmox server in my office with an RTX 5090 and wanted to find out if Gemma 4 could be my daily driver for local code assistance. I spent a day testing models, breaking tool calling, and tuning llama.cpp configs. Gemma 4 did not make the cut, at least not yet. Qwen 3.5 35B-A3B did. Here is what happened. <!--more-->

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

The goal was to see what works on consumer hardware. I already use Claude Code daily and it is excellent, but I wanted to explore what is possible when you run everything on your own hardware and not only be reliant on cloud providers. Privacy is a nice bonus, and so is never hitting a rate limit. With 32GB of VRAM available it's the quantized 30B+ models that currently hit the sweet spot, so follow along to see where I ended up!

## OpenCode: The Client

[OpenCode](https://github.com/anomalyco/opencode) is an open-source terminal coding assistant. Feature-wise it is close to Claude Code, and being open source means the pace of development is decided by the community. It's quite popular at around 138k stars at the time of writing this. Where OpenCode really shines is customization. Custom providers, skills, permissions, MCP servers are all configurable. It speaks the OpenAI-compatible API, which is what makes this whole setup work. You can point OpenCode at a llama.cpp server and it treats it like any other backend.

{{< image src="opencode-screenshot.webp" caption="OpenCode running in the terminal with a local Qwen 3.5 backend." >}}

## Evaluating Gemma 4

Gemma 4 landed with two variants that fit on the RTX 5090 at Q4 quantization: a dense 31B model and a Mixture-of-Experts (MoE) 26B model. Both support multimodal input and thinking mode. I tested both as coding assistants on a small Python side project: writing code, editing files, calling tools.

### Gemma 4 31B (Dense)

On paper, this model is hard to beat at its size. Google positions it as "optimized for consumer GPUs", which is exactly what I was looking for. It supports 140 languages and has native function calling. The benchmarks look promising: LiveCodeBench v6 at 80.0% and tau2-bench (agentic tool use) at 86.4%.

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

{{< admonition type="tip" title="KV cache quantization" open=true >}}
KV cache quantization (`q4_1`) compresses the key-value cache that grows with context length. It lets you fit more context into VRAM.

Gemma 4 variants lose 16-19% generation speed with it enabled. Qwen 3.5 35B-A3B shows **zero penalty**. That means you can push context higher without sacrificing speed.
{{< /admonition >}}

## The Winner: Qwen 3.5 35B-A3B

Qwen 3.5 35B-A3B is a 35B parameter MoE model with 3B active parameters per token. It matches the Gemma MoE on speed (188 tok/s) and handles tool calling correctly. The key differentiator is the zero speed penalty from KV cache quantization and handling complex tool calling which the Gemma 4 MoE currently fails at. I run it at 131K context which uses 29.4 GB of VRAM and leaves some headroom on the card (like running [Infinity](https://github.com/michaelfeil/infinity) with some fun encoder models!)

## llama.cpp Server

llama.cpp runs in the Debian 13 LXC container with GPU passthrough and serves models via an OpenAI-compatible API. Each model gets its own port. If you are new to llama.cpp, [Unsloth's llama.cpp guide](https://unsloth.ai/docs/models/gemma-4#llama.cpp-guide) is a good starting point.

**Qwen 3.5 35B-A3B (thinking mode):**

```bash
llama-server \
  --model Qwen3.5-35B-A3B-UD-Q4_K_XL.gguf \
  --ctx-size 131072 \
  --cache-type-k q4_1 \
  --temp 0.6 \
  --top-p 0.95 \
  --top-k 20 \
  --min-p 0.00 \
  --presence-penalty 0.0 \
  --repeat-penalty 1.0 \
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
  --chat-template-kwargs '{"enable_thinking":true}' \
  --host 0.0.0.0 \
  --port 8002 \
  -ngl 999
```

Gemma 4 required some extra work in llama.cpp to get tool calling right. The model's format is different enough that a [specialized parser](https://github.com/ggml-org/llama.cpp/pull/21418) was added to handle it. If you are running Gemma 4, make sure you are on a recent build.

{{< admonition type="info" title="Key flags explained" open=true >}}
- `--chat-template-kwargs '{"enable_thinking":true}'`: Activates chain-of-thought reasoning. The model shows its work before answering. Jinja2 chat templates are enabled by default in recent llama.cpp builds, which is required for this to work.
- `--cache-type-k q4_1`: Quantizes KV cache keys. Dramatically increases context capacity. Free on Qwen, costly on Gemma.
- `--min-p 0.00`: Disables min-p sampling. Qwen 3.5 recommendation.
- `-ngl 999`: Offload all layers to GPU. The Q4 quantized model fits comfortably in 32GB.
{{< /admonition >}}

## OpenCode Configuration

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

I also experimented with MCP servers and custom skills in OpenCode. I installed an MCP server where I was on the standalone subscription, not the full suite. The server shipped with an `AGENTS.md` describing all tools in the full product, including dozens my subscription did not have.

The thinking tokens were streaming very slowly. When I actually read them, the model was spending its entire budget searching for tools that were never loaded. I used OpenCode's `/export` command to dump the trace, confirmed the mismatch, and replaced the AGENTS.md with one matching my actual tool set. Reasoning got roughly 50% faster. On the Gemma 4 31B that took responses from 1.5 minutes down to around 45 seconds.

{{< admonition type="note" title="Read what your agent is thinking" open=true >}}
With local models you can see thinking tokens stream in real time. If the output feels slow, read what the model is reasoning about. Nonsense or loops usually mean a mismatch in the system prompt or tool definitions. Use `/export` to dump the full trace and clean up the noise.
{{< /admonition >}}

## Wrapping Up

The biggest surprise was how much the details matter: a KV cache flag that is free on one architecture costs 19% on another, and a mismatched AGENTS.md file can waste half your thinking budget.

Gemma 4 is a strong model family and I expect the MoE variant to improve on tool calling. When it does, I will revisit it. For now, Qwen 3.5 35B-A3B earns the daily driver spot.

