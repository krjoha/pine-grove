# Testa Gemma 4 som lokal kodassistent på ett RTX 5090


Jag har en server på kontoret med ett RTX 5090 och jag ville ta reda på om Gemma 4 kunde bli min nya dagliga arbetshäst. Därför spenderade jag en dag med att testa modeller, felsöka tool calling och finjustera llama.cpp-konfigurationer. Efter lite initial krångel blev det dock Gemma 4 26B-A4B som kröntes!<!--more-->

{{< image src="hero-server.webp" caption="Servern med ett vattenkylt RTX 5090. 32GB VRAM räcker långt!" >}}

## Hårdvara

| Komponent | Spec |
|---|---|
| CPU | AMD Threadripper 9960X |
| RAM | 192 GB DDR5 |
| GPU | NVIDIA RTX 5090 32GB VRAM |
| Driver | 580.105.08, CUDA 13.0 |
| Host | Proxmox |
| Inferens | llama.cpp med CUDA i en Debian 13 LXC-container |

Jag använder Claude Code dagligen och tycker det är riktigt bra. Men jag vill bli mindre beroende av molntjänster och dessutom se vad som fungerar på min hårdvara. Syftet med det är att värna om min integritet och att kunna köra utan rate limits eller throttling. Det är ganska ofta nu för tiden som Claude ställer mig i kö! Jag förväntar mig inte att dessa mindre modeller ska matcha frontier-API:er, men de kan fortfarande vara användbara. Med 32GB VRAM tillgängligt blir det de kvantiserade 30B+-modellerna som är aktuella.

## OpenCode

[OpenCode](https://github.com/anomalyco/opencode) är en open-source kodassistent. Funktionsmässigt ligger den nära Claude Code. Att den är open source innebär också att utvecklingstakten bestäms av communityn. Med 138k stjärnor på github och 850 commiters får den ändå anses ha ett starkt sådant! En ska jag verkligen gillar med OpenCode är anpassningsbarheten. Du kan ha egna providers, skills, behörigheter, MCP-servrar förstås. Men man kan också tweaka TUI:t mer än med andra verktyg. Den är OpenAI API kompatibel vilket gör att du kan peka OpenCode mot typ vilken backend som helst. Till exempel en llama.cpp-server. Eller mot valfri molnleverantör (jag har testat [Berget AI](https://berget.ai/), en svensk leverantör, mer om det i en framtida post).

{{< figure src="opencode.gif" caption="OpenCode's text UI. Källa: [OpenCode.ai](https://opencode.ai/)" >}}

## Utvärdering av Gemma 4

Gemma 4 kom i många varianter, jag har testat två av dessa som båda ryms på ett RTX 5090: en dense 31B-modell och en Mixture-of-Experts (MoE) 26B-modell. Båda stödjer multimodal inmatning och thinking mode. Jag utvärderade båda som kodassistenter via OpenCode på ett litet Python-sidoprojekt. Så att skriva kod, redigera filer och anropa diverse verktyg.

### Gemma 4 31B (Dense)

På pappret är den här modellen riktigt stark för sin storlek. Google positionerar den som "optimized for consumer GPUs", vilket är precis vad jag behöver. Modellen stödjer 140 språk, har inbyggt stöd för function calling och benchmarks ser väldigt lovande ut. Mycket god prestanda till lågt pris!

{{< image src="benchmark.webp" caption="Pareto-front för open source-LLM:er. Gemma 4-varianter ligger nära toppen. Källa: [LM Arena](https://arena.ai/leaderboard/text). Se även [Gemma 4 model card](https://deepmind.google/models/gemma/gemma-4/)." >}}

Generella benchmarks berättar dock bara en del av historien. Man behöver testa och utvärdera på sitt eget specifika användningsfall för att se vad som funkar. I mina tester var kodkvaliteten från 31B varianten genomgående bäst av de tre modellerna jag utvärderade. Men med endast 64 tokens per sekund och ett kontext på max 88K tokens tycker jag att den blev för långsam för interaktiv kodning. Men med mer GPU-kraft hade den här modellen varit ett klockrent val.

### Gemma 4 26B-A4B (MoE)

MoE-varianten offrar lite av kvaliteten i utbyte mot hastighet. Det är de 4B (fyra miljarder) aktiva parametrarna per token som leder till höga 186 tokens per sekund och att jag fick plats med hela 256K kontextet och ändå hade 7GB VRAM till godo. Galet! Kodkvaliteten är ändå ganska snarlik så det känns inte som ett nedbyte.

Initialt hade jag problem med tool calling i OpenCode. Modellen genererade text **om** att anropa verktyg istället för att skicka de strukturerade JSON-anropen. Det visade sig att jag körde en äldre llama.cpp-build som saknade en [speciell Gemma 4-parser](https://github.com/ggml-org/llama.cpp/pull/21418). Efter uppdatering fungerade tool calling korrekt med komplexa systemprompts i OpenCode. Så om du vill köra Gemma 4, se till att du har en nyare version av llama.cpp som inkluderar denna fix.

## Benchmark

Alla modeller använder [Unsloth](https://unsloth.ai/) Q4_K_XL-kvantiseringar. Unsloths dynamiska kvantisering är nyckeln till att köra dessa modeller på VRAM-begränsade system. Nedan är siffror från min hårdvara med mina arbetslaster. Om du testar så kommer ditt resultat att skilja sig beroende på din kontextstorlek och din hårdvara.

| Modell | Typ | Aktiva parametrar | Gen tok/s | Max kontext | VRAM | Tool Calling | KV q4_1 hastighet |
|---|---|---|---|---|---|---|---|
| Gemma 4 31B | Dense | 31B | 64 | 88K | 30.9 GB | Fungerar | -16% |
| **Gemma 4 26B-A4B** | **MoE** | **4B** | **186** | **256K** | **25.1 GB** | **Fungerar** | **-19%** |
| Qwen 3.5 35B-A3B | MoE | 3B | 188 | 128K | 29.4 GB | Fungerar | 0% |

{{< admonition type="tip" title="KV cache-kvantisering" open=true >}}
KV cache-kvantisering (`q4_1`) komprimerar key-value-cachen som växer med kontextlängden. Det gör att mer kontext ryms i VRAM.

Gemma 4-varianter tappar dock 16-19% generationshastighet med det aktiverat till skillnad från Qwen 3.5 35B-A3B som **inte** visar någon försämring. Värt att testa på din modell eftersom effekten tycks variera.
{{< /admonition >}}

## Vinnare: Gemma 4 26B-A4B

Gemma 4 26B-A4B är riktigt snabb att köra på RTX 5090. Med runt 186 tok/s och 0 ping är det en fröjd att prompta! Och med 256K kontext på 25 GB VRAM finns det gott om marginal på kortet för andra saker, som att köra [Infinity](https://github.com/michaelfeil/infinity) med encoder-modeller. Qwen 3.5 35B-A3B, som jag kört tidigare, är en stark tvåa med liknande hastighet. Men Gemmas starka stöd för flera språk och faktumet att Gemma helt enkelt ger bättre svar gör att detta blir min nya arbetshäst!

## llama.cpp-server

Jag kör modellerna via llama.cpp i en Debian 13 LXC-container med GPU-passthrough. Så krångligt måste man inte göra det för sig. [Unsloths guide](https://unsloth.ai/docs/models/gemma-4#llama.cpp-guide) är en bra startpunkt om du vill sätta upp llama.cpp själv.

**Gemma 4 26B-A4B (thinking mode):**

```bash
llama-server \
  --model gemma-4-26B-A4B-it-UD-Q4_K_XL.gguf \
  --ctx-size 262144 \
  --temp 1.0 \
  --top-p 0.95 \
  --top-k 64 \
  --chat-template-kwargs '{"enable_thinking":true}' \
  --host 0.0.0.0 \
  --port 8001 \
  -ngl 999
```

**Qwen 3.5 35B-A3B (som jämförelse):**

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
  --port 8002 \
  -ngl 999
```

{{< admonition type="info" title="Viktiga flaggor" open=true >}}
- `--chat-template-kwargs '{"enable_thinking":true}'`: Aktiverar chain-of-thought-reasoning.
- `--cache-type-k q4_1`: Kvantiserar KV cache-nycklar. Ökar kontextkapaciteten. Gratis för Qwen, kostsamt för Gemma (se benchmark-tabellen).
- `--min-p 0.00`: Stänger av min-p sampling. Rekommenderat för Qwen 3.5.
- `-ngl 999`: Laddar alla lager till GPU:n. Om du har mindre VRAM kan du avlasta några lager till CPU.
{{< /admonition >}}

## OpenCode-konfiguration

Lägg till eller skapa en OpenCode config fil `~/.config/opencode/opencode.json` med detta:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "gemma": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Gemma 4 26B A4B",
      "options": {
        "baseURL": "http://<din-server-ip>:8001/v1",
        "apiKey": "EMPTY"
      },
      "models": {
        "unsloth/gemma-4-26B-A4B-it": {
          "name": "Gemma 4 26B A4B",
          "limit": {
            "context": 262144,
            "output": 8192
          }
        }
      }
    }
  },
  "model": "gemma/unsloth/gemma-4-26B-A4B-it"
}
```

`baseURL` pekar mot llama.cpp-servern. Matcha `context`-gränsen med serverns `--ctx-size`.

## Lärdomar från MCP och AGENTS.md

Jag experimenterade också med MCP-servrar och custom skills i OpenCode. En MCP-server som jag testade levererades tillsammans med en `AGENTS.md` som beskrev verktyg som inte fanns. Modellen hade så klart inget sätt att veta detta. Stackarn. Det märktes på att svaren tog orimligt lång tid och när jag använde `/export` för att dumpa konversationen syntes det tydligt att Gemma var förvirrad. Så här såg 31 sekunders bortkastat tänkande ut:

```txt
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

Modellen gick i cirklar och letade efter verktyg som inte fanns. Efter att ha lagat AGENTS.md med det faktiska verktygsutbudet löste Gemma samma prompt på 5 sekunder med ett snyggt resonemang. På 31B-varianten betydde det att svarstiderna gick från 1,5 minuter ner till runt 45 sekunder.

{{< admonition type="note" title="OpenCodes /export-kommando" open=true >}}
Så om något känns fel, använd `/export` för att dumpa hela konversationen till en markdown-fil. Du kan se exakt vad modellen resonerar om. Nonsens eller loopar pekar vanligtvis på att något är tokigt.
{{< /admonition >}}

## Avslutning

Den största överraskningen med exprimentet var hur mycket varje liten detalj kunde betyda: till en början fungerade Gemma 4 tool calling inte alls eftersom jag hade en gammal version av llama.cpp. En KV cache-flagga som fungerade utmärkt på en arkitektur försämrade prestandan med 19% på en annan. Och en dålig AGENTS.md-fil slösade bort hälften av thinking-token budgeten.

Lokala modeller lär inte helt ersätta frontier-API:er inom kort, men att en enda konsument-GPU nu kan köra en riktigt användbar kodassistent är rätt grymt. Det var verkligen inte fallet för ett år sedan.
