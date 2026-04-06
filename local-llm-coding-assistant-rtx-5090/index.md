# Building a Local LLM Coding Assistant on an RTX 5090


I run a server in my office with an RTX 5090 and I wanted to find out if Gemma 4 could be my new daily driver for local code assistance. I spent a day testing models, breaking tool calling and tuning llama.cpp configs. Gemma 4 did not make the cut, at least not yet. But Qwen 3.5 35B-A3B did.<!--more-->

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

My goal was to see what works on consumer hardware. I already use Claude Code daily and it is excellent, but I want to be less dependant on cloud providers and see what works on my own hardware. Privacy is a nice bonus, and it's very nice to not hit a rate limit or being throttled. With 32GB of VRAM available it's the quantized 30B+ models that currently hit the sweet spot.

## OpenCode

[OpenCode](https://github.com/anomalyco/opencode) is an open-source terminal coding assistant. Feature-wise it is close to Claude Code, and being open source means the pace of development is decided by the community. OpenCode is quite popular with around 138k stars at the time of writing this. What I really like with OpenCode is in its customizations. Custom providers, skills, permissions, MCP servers are all there of course. But you can also tweak the TUI a bit more than with other tools. It speaks the OpenAI-compatible API, which means you can point OpenCode at a llama.cpp server and it treats it like any other backend. Or to any provider of your choice.

> I have also been trying out [Berget AI](https://berget.ai/), a Swedish provider. More on that in a future post.

{{< image src="opencode-screenshot.webp" caption="OpenCode running in the terminal with a local Qwen 3.5 backend." >}}

## Evaluating Gemma 4

Gemma 4 landed with two variants that fit on the RTX 5090 at Q4 quantization: a dense 31B model and a Mixture-of-Experts (MoE) 26B model. Both support multimodal input and thinking mode. I tested both as coding assistants on a small Python side project: writing code, editing files, calling tools.

### Gemma 4 31B (Dense)

On paper this model is hard to beat at its size. Google positions it as "optimized for consumer GPUs", which is exactly what I was looking for. It supports 140 languages and has native function calling. The benchmarks look promising: LiveCodeBench v6 at 80.0% and tau2-bench (agentic tool use) at 86.4%.

{{< image src="gemma4-benchmarks.webp" caption="Gemma 4 benchmark comparison. Source: [Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)" >}}

Benchmarks only tell part of the story though. You need to test on your own use case. In my testing, code quality was consistently the best of the three models I evaluated. But at 64 tokens per second and a max context of 90K tokens on 32GB VRAM, it is too slow for interactive coding on a single RTX 5090. It's a shame since I think this model is really good! With more GPU power it would be a strong pick.

### Gemma 4 26B-A4B (MoE)

The MoE variant trades some of that quality for speed. Only 4B active parameters per token means 186 tokens per second, and it fits the full 256K context with 7GB of VRAM to spare. Code quality stays close to the dense model.

Then I tried tool calling with OpenCode.

{{< admonition type="warning" title="Tool calling failure" open=true >}}
With complex system prompts (tool definitions, file context, agent instructions), the model generates text *about* calling tools instead of emitting the structured JSON. Simple prompts work. Real-world agent prompts did not in my tests. The 4B active parameters are likely not enough to handle both structured output and task reasoning.
{{< /admonition >}}

{{< image src="gemma4-tool-calling-fail.webp" caption="Gemma 4 26B-A4B describing a tool call instead of executing it." >}}

It does not seem like a bug. Raw `curl` requests return correct `tool_calls` JSON. The dense 31B and Qwen 3.5 both handle the same prompts correctly. If/when this MoE variant improves on this front it would absolutely be the better choice.

## Benchmark

All models use [Unsloth](https://unsloth.ai/) Q4_K_XL quantizations. Unsloth gives us dynamic quantization which is key to running these models on VRAM-constrained setups. Without it, fitting 30B+ models on consumer GPU's at usable quality would be more of a hassle. These are numbers from my hardware, with my workloads. Your results will differ depending on context size and GPU.

| Model | Type | Active Params | Gen (tok/s) | Max Context | VRAM Used | Tool Calling | KV q4_1 Penalty |
|---|---|---|---|---|---|---|---|
| Gemma 4 31B | Dense | 31B | 64 | 90K | 30.9 GB | Works | -16% |
| Gemma 4 26B-A4B | MoE | 4B | 186 | 256K | 25.1 GB | Broken | -19% |
| **Qwen 3.5 35B-A3B** | **MoE** | **3B** | **188** | **131K** | **29.4 GB** | **Works** | **0%** |

{{< admonition type="tip" title="KV cache quantization" open=true >}}
KV cache quantization (`q4_1`) compresses the key-value cache that grows with context length. It lets you fit more context into VRAM.

But Gemma 4 variants seem to lose 16-19% generation speed with it enabled. A bit of a big deal with the 31B variant since I could only reash 90k tokens. Then Qwen 3.5 35B-A3B showed **zero penalty** though.
{{< /admonition >}}

## Winner: Qwen 3.5 35B-A3B

Qwen 3.5 35B-A3B is a 35B parameter MoE model with 3B active parameters per token. It matches the Gemma MoE on speed (188 tok/s) and handles tool calling correctly. The key differentiator for my use case was handling complex tool calling, which the Gemma 4 MoE currently fails at. I run the Qwen 3.5 at 131K context which uses 29.4 GB of VRAM and leaves some headroom on the card for other things, like [Infinity](https://github.com/michaelfeil/infinity) serving encoder models alongside it.

## llama.cpp Server

llama.cpp runs in a Debian 13 LXC container with GPU passthrough. If you are new to llama.cpp, [Unsloth's llama.cpp guide](https://unsloth.ai/docs/models/gemma-4#llama.cpp-guide) is a good starting point.

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

Gemma 4 required some extra work in llama.cpp to get tool calling right. The model's format is different enough that a [specialized parser](https://github.com/ggml-org/llama.cpp/pull/21418) was added to handle it. If you are running Gemma 4, make sure you are on a recent build that includes this fix.

{{< admonition type="info" title="Key flags explained" open=true >}}
- `--chat-template-kwargs '{"enable_thinking":true}'`: Activates chain-of-thought reasoning. The model 'writes out' its work before answering.
- `--cache-type-k q4_1`: Quantizes KV cache keys. Increases context capacity. Free on Qwen, costly on Gemma.
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

I also experimented with MCP servers and custom skills in OpenCode. One MCP server I tried out shipped with an `AGENTS.md` that described tools the server did not actually expose. The model had no way of knowing this. I noticed the responses were taking unusually long, so I used `/export` to dump the trace. Here is what 31 seconds of wasted thinking looked like:

```
The user wants to know which files to improve.
Based on the AGENTS.md I should use list_technical_debt_hotspots
or list_technical_debt_goals. However, those tools are not listed
in the tool declarations. Wait, let me re-read the AGENTS.md...

But looking at my available tool declarations, I don't see
list_technical_debt_hotspots or list_technical_debt_goals.

Wait, the AGENTS.md might be referring to tools that are part of
the CodeScene MCP, but maybe they aren't all exposed or I misread.
Let me check the available tool names again.
Actually, I don't see any "list" tools.
```

The model was going in circles looking for tools that did not exist in my subscription. After replacing the AGENTS.md with one matching my actual tool set, the same prompt resolved in 5 seconds with clean reasoning. On the Gemma 4 31B this kind of improvement took responses from 1.5 minutes down to around 45 seconds.

{{< admonition type="note" title="OpenCode's /export command" open=true >}}
If something feels off, use `/export` to dump the full conversation trace including thinking tokens. You can see exactly what the model is reasoning about. Nonsense or loops usually point to a mismatch in the system prompt or tool definitions.
{{< /admonition >}}

## Wrapping Up

My biggest surprise was how much the details matter: at first Gemma 4 tool calling did not work at all, because i had an old version of llama.cpp. KV cache flag that was working great on one architecture ended up costing 19% on another. And the mismatched AGENTS.md file can waste half your thinking budget.

Gemma 4 is a strong model family and I expect the MoE variant to improve on tool calling. When it does, I will revisit it. For now, Qwen 3.5 35B-A3B earns the daily driver spot.
