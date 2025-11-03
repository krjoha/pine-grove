---
title_seo: "Träna Textklassificerare med 8 Exempel: SetFit Few-Shot Learning Tutorial"
title: "Kraftfull NLP med SetFit och Few-Shot Learning"
date: 2025-09-10T15:00:00+01:00
lastmod: 2025-09-10T15:00:00+01:00
draft: false
author: "Kristoffer Johansson"
authorLink: "https://www.linkedin.com/in/kristoffer-johansson/"
description: "Lär dig bygga noggranna textklassificerare med endast ett fåtal träningsexempel genom SetFit och Transformer-modeller. Praktisk handledning från Tech Borås AI Lab Workshop 2."
summary: "Workshop 2 från Tech Borås AI Lab: Bygg kraftfulla textklassificeringsmodeller med SetFit med endast 8-16 exempel per klass. Lös riktiga NLP-problem utan massiva dataset."
images: []

lightgallery: false
toc:
    enable: true
---

Den 9 september genomförde jag den andra workshopen i AI Lab-serien på Högskolan i Borås. Den här gången tacklade vi ett vanligt affärsproblem du stöter på hela tiden när du startar ett AI-projekt: Du har data, men den är omärkt. Detta inlägg visar hur man hanterar den utmaningen med few-shot learning. <!--more-->

Moderna NLP-verktyg som SetFit gör few-shot learning praktiskt med fungerande kod du kan köra lokalt på din egen hårdvara. Små språkmodeller som BERT-varianter är lätta nog att köra på konsument-GPU:er, vilket gör avancerad NLP tillgänglig utan molnberoende eller återkommande kostnader.

## Utmaningen: Begränsad Träningsdata

Textklassificering löser verkliga affärsproblem. Sortera supportärenden efter prioritet. Upptäck skräppost. Dirigera kundförfrågningar till rätt avdelning. Analysera sentiment i produktrecensioner.

Ett traditionellt ML-tillvägagångssätt kräver tusentals märkta exempel. Så du behöver någon som manuellt märker "skräppost" eller "inte skräppost" för 5 000+ e-postmeddelanden innan träningen börjar. Det kan vara dyrt och långsamt, vilket betyder att de flesta organisationer inte har tusentals förmärkta exempel liggande.

Det är här SetFit kommer in: den använder kraftfulla förtränade transformer-modeller som vi finjusterar på så få som 2 exempel per klass.

## Hur Transformers Förändrade NLP

Transformer-modeller som BERT revolutionerade naturlig språkbehandling genom att förstå ordkontext. Till skillnad från äldre metoder som behandlar ord som isolerade tokens, fångar BERT betydelse baserat på omgivande ord.

Betrakta dessa meningar:
- "Han cyklade till jobbet."
- "Han körde sin bil till jobbet."
- "Peter bestämde sig för att ta cykeln till stranden."

BERT förstår att "cyklade" och "cykeln" relaterar till samma koncept, medan "körde sin bil" representerar ett annat transportsätt. Denna kontextuella förståelse är vad som gör modern NLP kraftfull. Och HuggingFace är fyllt med dessa små, förtränade BERT-modeller som redan kan mycket om vår värld. Vi behöver bara tillhandahålla några exempel på vår uppgift för att få utmärkt prestanda!

## Förstå Semantisk Likhet i Text

Kontext spelar roll för likhet. Huruvida två meningar är "lika" beror på vad du mäter:

**Negativt par** (olika transport):
- "Han cyklade till jobbet."
- "Han körde sin bil till jobbet."

**Positivt par** (samma transport):
- "Han cyklade till jobbet."
- "Peter bestämde sig för att ta cykeln till stranden."

**Negativt par** (olika transport):
- "Peter bestämde sig för att ta cykeln till stranden."
- "Han körde sin bil till jobbet."

Transformers lär sig dessa kontextuella relationer från massiva textkorpusar under förträning. Det är här SetFit blir praktiskt.

## SetFit: Few-Shot Learning för Textklassificering

SetFit kombinerar förtränade Transformer-modeller med effektiv finjustering. Du kan uppnå hög noggrannhet med endast 2-16 märkta exempel per klass.

SetFit fungerar i två steg:

1. **Kontrastiv inlärning**: Träna på meningspar för att lära sig vilka exempel som är lika och vilka som är olika
2. **Klassificeringshuvud**: Träna en enkel klassificerare ovanpå de inlärda inbäddningarna

Detta tillvägagångssätt utnyttjar kunskapen som redan finns inbakad i förtränade modeller. Du lär inte modellen språk från grunden. Du lär den din specifika klassificeringsuppgift med hjälp av den språkförståelse den redan har.

Detta ger oss snabba, lätta, produktionsklara textklassificerare tränade på en bråkdel av den data traditionella metoder kräver.

## Bygga en Textklassificerare med SetFit

Detta exempel är baserat på workshop-repositoriet: [github.com/krjoha/ai-lab-setfit](https://github.com/krjoha/ai-lab-setfit)

Den fullständiga notebook:en demonstrerar det kompletta arbetsflödet. Här är kärnimplementationen:

### Installation

Använd `uv` för att skapa en virtuell python-miljö.

```bash
# Skapa en virtuell miljö i en .venv-mapp och installera alla projektberoenden
uv sync
```

### Komplett Träningspipeline

```python
from datasets import load_dataset
from setfit import SetFitModel, Trainer, TrainingArguments, sample_dataset

# Ladda Amazon Massive Intent-datasetet (svenska)
train_dataset = load_dataset("SetFit/amazon_massive_intent_sv-SE", split="train")
test_dataset = load_dataset("SetFit/amazon_massive_intent_sv-SE", split="test")

# Sampla bara 1 exempel per klass (60 exempel från 60 intent-klasser)
train_sample = sample_dataset(
    train_dataset,
    label_column="label",
    num_samples=1
)

# Ladda en förtränad inbäddningsmodell
model = SetFitModel.from_pretrained("nomic-ai/modernbert-embed-base")

# Konfigurera träning
args = TrainingArguments(
    batch_size=32,
    num_epochs=1,
)

# Initiera tränare
trainer = Trainer(
    model=model,
    args=args,
    train_dataset=train_sample,
    eval_dataset=test_dataset,
    metric='accuracy',
)

# Träna modellen
trainer.train()

# Utvärdera på testuppsättning
results = trainer.evaluate(test_dataset)
print(f"Noggrannhet: {results['accuracy']:.2%}")

# Gör förutsägelser på ny svensk text
predictions = model.predict([
    "Släck lampan",           # Släck lampan
    "spela vikingarna",       # Spela Vikingarna (musik)
    "starta dammsugaren",     # Starta dammsugaren
])
print(predictions)
```

### Vad Denna Kod Gör

1. **Dataset-laddning**: Ladda Amazon Massive Intent-datasetet med 60 olika intent-klasser på svenska
2. **Few-shot sampling**: Sampla bara 1 exempel per klass (60 totalt exempel från 11 514 tillgängliga)
3. **Modellinitiering**: Ladda en förtränad flerspråkig inbäddningsmodell
4. **Träning**: Tränaren genererar meningspar och finjusterar modellen
5. **Utvärdering**: Testa noggrannhet på 2 974 osedda exempel
6. **Förutsägelse**: Klassificera nya svenska röstassistent-kommandon

Med bara 60 exempel totalt (1 per klass) uppnår denna modell meningsfull noggrannhet på intent-klassificering. Traditionella tillvägagångssätt skulle behöva tusentals exempel per klass för att uppnå liknande resultat.

## Varför Few-Shot Learning Spelar Roll

Paradigmet har skiftat. Förtränade Transformer-modeller innehåller språkförståelse inlärd från miljarder ord. SetFit låter dig utnyttja denna kunskap och anpassa den till din specifika uppgift med minimal märkt data.

Du behöver inte massiva dataset längre. Du behöver rätt tillvägagångssätt.

## Köra Lokalt med GPU

Små språkmodeller som BERT är lätta nog att köra på konsument-GPU:er. Till skillnad från massiva språkmodeller kräver modeller som `modernbert-embed-base` endast några få gigabyte GPU-minne.

Träning av Transformer-modeller behöver GPU-acceleration. Även med SetFits effektivitet är CPU-träning långsam och opraktisk. Men små modeller körs bra på de flesta moderna GPU:er.

Kontrollera din GPU-tillgänglighet:

```bash
# Verifiera att NVIDIA GPU upptäcks
nvidia-smi

# För Macbook med Apple Silicon (M1/M2/M3/M4/M5)
# PyTorch kommer automatiskt upptäcka och använda MPS (Metal Performance Shaders)
```

Om du har en NVIDIA GPU med CUDA-stöd eller en Macbook med Apple Silicon kommer PyTorch att använda hårdvaruacceleration automatiskt. Träning på 60 exempel tar sekunder till minuter istället för timmar på CPU.

### Lokal vs Molnutveckling

Att köra lokalt ger dig kontroll. Inga sessions-timeouts. Inga slumpmässiga frånkopplingar. Arbeta direkt med lokala dataset. Din miljö består mellan sessioner.

Om du inte har lokal GPU-åtkomst tillhandahåller Kaggle gratis GPU-notebooks som ett alternativ.

### Alternativ: Kaggle Notebooks

Kaggle erbjuder gratis GPU-åtkomst genom sin notebook-miljö. Detta kräver telefonverifiering för att förhindra missbruk, men ger dig en T4 GPU för träning.

**Telefonverifiering:**
1. Logga in på ditt konto på [kaggle.com/settings](https://www.kaggle.com/settings)
2. Följ instruktionerna för att lägga till ditt telefonnummer
3. Efter verifiering får dina notebooks internetåtkomst och GPU-stöd

**Aktivera GPU:**
1. Öppna Kaggle Notebook
2. Klicka **Settings** → **Accelerator** → **GPU T4 x2** (undvik P100, den är äldre)
3. Din session har nu GPU-acceleration

**Installera SetFit:**
1. Kör första cellen för att starta din session
2. Klicka **Add-ons** → **Install Dependencies**
3. Klistra in: `pip install setfit`
4. Klicka **Run**, sedan **Save**

Workshop-notebook:en är tillgänglig på Kaggle med dessa beroenden förkonfigurerade.

## Kom Igång med Few-Shot NLP

Modern NLP med Transformer-modeller är kraftfull. Verktyg som SetFit gör det praktiskt för verkliga problem där märkt data är begränsad.

Förtränade modeller förstår redan språk. Du lär dem din specifika uppgift, inte språket i sig. Detta kräver betydligt mindre data än att träna från grunden.

Vill du prova själv? Klona workshop-repositoriet och träna din första few-shot klassificerare:

**Repository**: [github.com/krjoha/ai-lab-setfit](https://github.com/krjoha/ai-lab-setfit)

Du kan ha en fungerande textklassificerare igång på under 10 minuter.

## NLP-konsulting i Borås

Denna workshop var en del av AI Lab-serien på Högskolan i Borås, fokuserad på praktisk AI och NLP för utvecklare. Jag tillhandahåller AI- och datateknikkonsulting för företag i Borås och i hela Sverige. Om du behöver hjälp med att implementera NLP-lösningar eller vill utforska few-shot learning för ditt användningsfall, hör av dig.
