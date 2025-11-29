# Kraftfull NLP med SetFit och Few-Shot Learning


Den 9 september genomförde jag den andra workshopen i AI Lab-serien på Högskolan i Borås. Den här gången tacklade vi ett vanligt affärsproblem som du stöter på hela tiden när du startar ett AI-projekt: Du har data, men den är omärkt. Detta inlägg visar hur man kan hantera denna utmaning med hjälp av few-shot learning. <!--more-->

{{< image src="tech-boras-workshop-2.webp" caption="Workshop om Transformers och SetFit på Högskolan i Borås, 9 september" >}}

Moderna NLP-verktyg (Natural Language Processing) som SetFit gör att few-shot learning är praktiskt ganska enkelt med kod som du kan köra lokalt på din egen hårdvara. Små språkmodeller som BERT-varianter är lätta nog att köra på konsument-GPU:er, vilket gör avancerad NLP tillgänglig för dig utan beroende på molninfrastruktur eller återkommande kostnader. Det här är ett utmärkt första AI/ML projekt för företag som vill komma igång med ett datadrivet arbetssätt!

## Utmaningen med begränsad mängd träningsdata

Textklassificering löser verkliga affärsproblem. För att nämna några, du kan: sortera supportärenden efter prioritet, filtrera bort skräppost, dirigera kundförfrågningar till rätt avdelning, analysera sentiment (vad folk tycker) i produktrecensioner

Ett traditionellt tillvägagångssätt för maskininlärning kräver tusentals märkta exempel i ett så kallat dataset. Det betyder att du behöver någon som manuellt märker upp 5 000+ e-postmeddelanden som "skräppost" eller "inte skräppost" innan träningen av en modell kan börjar. Det kan vara dyrt och långsamt (och tråkigt) vilket betyder att de flesta organisationer inte har tusentals förmärkta exempel liggandes.

Det är här SetFit-metoden kommer in: den använder kraftfulla förtränade transformer-modeller som vi finjusterar på så lite som två exempel per klass. Mycket lättare att fixa än 5000 exempel!

## Hur Transformers förändrade NLP

Transformer-modeller som BERT revolutionerade naturlig språkbehandling genom att förstå ordkontext. Till skillnad från äldre metoder som behandlar ord som isolerade tokens, fångar BERT betydelse baserat på omgivande ord.

Ta en titt på dessa meningar:
- "Han cyklade till jobbet."
- "Han körde sin bil till jobbet."
- "Peter bestämde sig för att ta cykeln till stranden."

BERT förstår att "cyklade" och "cykeln" relaterar till samma koncept, medan "körde sin bil" representerar ett annat transportsätt. Denna kontextuella förståelse är vad som gör modern NLP kraftfull. Och det som är extra bra är att det finns open-source plattformar som [HuggingFace](https://huggingface.co/) som är fyllt med dessa små, förtränade BERT-modeller som redan kan mycket om vår värld. Vi behöver bara tillhandahålla några exempel på vår uppgift för att träna om modellerna till att bli bra på det vi vill.

## Förstå semantisk likhet i text

I vilken kontext du läser en text spelar roll för konceptet "likhet". Huruvida två meningar är "lika" beror helt och hållet på vad det är du mäter. Om vi till exempel tittar från perspektivet kollektivtrafik så kanske vi är intresserade av att veta vilket transportmedel det är som nämnts i texten. Då kan vi föresetälla oss att exempel kan paras ihop på det här sättet:  

**Negativt par** (olika transportmedel):
- "Han cyklade till jobbet."
- "Han körde sin bil till jobbet."

**Positivt par** (samma transportmedel):
- "Han cyklade till jobbet."
- "Peter bestämde sig för att ta cykeln till stranden."

**Negativt par** (olika transportmedel):
- "Peter bestämde sig för att ta cykeln till stranden."
- "Han körde sin bil till jobbet."

Men om vi istället är intresserade av att veta vart någon är på väg, då skulle vi behöva para ihop exemplen på ett helt annat sätt. Det här är viktigt eftersom att transformer-modeller lär sig dessa kontextuella relationer från massiva dataset när de tränades för första gången. Det betyder att modellerna har sett data som kanske inte överensstämmer exakt med vad det är du vill mäta! Och det är här som SetFit kommer in i bilden.

## SetFit: Few-Shot Learning för Textklassificering

SetFit kombinerar förtränade Transformer-modeller tillsammans med en effektiv finjustering på ditt problem utifrån det perspektiv du vill anama. Det vill säga är det intressant att veta transportmedel eller destination? Och tack vare SetFit kan vi uppnå väldigt hög noggrannhet med endast 2-16 märkta exempel.

SetFit fungerar i två steg:

1. **Kontrastiv inlärning**: Träna på meningspar för att lära sig vilka exempel som är lika och vilka som är olika
2. **Klassificeringshuvud**: Träna en enkel klassificerare ovanpå de inlärda inbäddningarna

Att göra det på detta sättet utnyttjar den stora kunskapen som redan finns inbakad i transformers-modeller. Du lär inte modellen språk och koncept från grunden. Istället så lär du den din specifika klassificeringsuppgift med hjälp av språkförståelsen som modellen redan har.

Det ger oss snabba, lätta, produktionsklara textklassificerare som är tränade på en bråkdel av den data som traditionella metoder kräver.

## Bygga en textklassificerare med SetFit

Detta exempel är baserat på workshop-repositoriet: [github.com/krjoha/ai-lab-setfit](https://github.com/krjoha/ai-lab-setfit)

Om du vill se hela exemplet kan du titta i en av de notebooks i repositoriet. Här är ett kodexempel därifrån:

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

### Vad denna kod gör

1. **Dataset-inläsning**: Ladda Amazon Massive Intent-datasetet med 60 olika intent-klasser på svenska
2. **Few-shot sampling**: Sampla bara 1 exempel per klass (60 totalt exempel från 11 514 tillgängliga)
3. **Modellinitiering**: Ladda en förtränad flerspråkig inbäddningsmodell
4. **Träning**: Tränaren genererar meningspar och finjusterar modellen
5. **Utvärdering**: Testa noggrannhet på 2 974 osedda exempel
6. **Prediktion**: Klassificera nya svenska röstassistent-kommandon

Med endast 60 exempel totalt (1 per klass) så når denna modell en tillräckligt hög noggrannhet för att bli användbar på så kallad "avsiktsklassificering". Traditionella tillvägagångssätt skulle som sagt behöva tusentals exempel per klass för att uppnå liknande resultat.

## Köra lokalt med GPU

Små språkmodeller som BERT är lätta nog att köra på konsument-GPU:er. Till skillnad från stora språkmodeller kräver små modeller som `modernbert-embed-base` endast några få gigabyte GPU-minne.

Träning av Transformer-modeller behöver GPU-acceleration. Även med SetFits effektivitet är CPU-träning ibland långsam och opraktisk. Därför är det bra att nyttja din datorns GPU, om det finns en sådan. Det kan du kontrollera genom att köra:

```bash
# Verifiera att NVIDIA GPU upptäcks
nvidia-smi

# För Macbook med Apple Silicon (M1/M2/M3/M4/M5)
# PyTorch kommer automatiskt upptäcka och använda MPS (Metal Performance Shaders)
```

Om du har en NVIDIA GPU med CUDA-stöd eller en Macbook med Apple Silicon kommer PyTorch att använda hårdvaruacceleration automatiskt. Träningskoden här ovanför med 60 exempel tar ett par sekunder istället för flera timmar med endast CPU.

### Lokal vs Molnutveckling

Att köra lokalt ger dig kontroll. Inga sessions-timeouts. Inga slumpmässiga frånkopplingar. Arbeta direkt med lokala dataset. Din miljö består mellan sessioner.

Men om du inte har lokal GPU-åtkomst så tillhandahåller Kaggle gratis GPU-notebooks.

### Alternativ: Kaggle Notebooks

Kaggle erbjuder gratis GPU i deras notebook-miljö. Men det kräver ett registrerat konto + telefonverifiering för att förhindra missbruk. I utbyte får du tillgång till en Nvidia T4 GPU. 

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

Det finns en version av workshop-notebook:en på Kaggle med dessa paket förkonfigurerade.

## Kom igång med few-shot NLP

SetFit gör det möjligt att lösa riktiga affärsproblem med NLP utan att behöva tusentals märkta exempel. Eftersom förtränade transformer-modeller redan förstår språk så behöver du bara lära dem din specifika uppgift. Det kräver betydligt mindre data än att träna från grunden. Ett utmärk första projekt!

Vill du testa själv? Klona workshop-repositoriet och träna din första few-shot klassificerare:

**Repository**: [github.com/krjoha/ai-lab-setfit](https://github.com/krjoha/ai-lab-setfit)

Du kan ha en fungerande textklassificerare igång på under 10 minuter. Och det är gratis att köra lokalt om du har en GPU i din dator!

{{< image src="ceo.webp" caption="Kristoffer Johansson, föreläsare och skapare av AI Lab konceptet på Tech Borås" >}}

## NLP & AI-konsult i Borås

Denna workshop var en del av AI Lab-serien på Högskolan i Borås, fokuserad på praktisk AI och NLP för utvecklare. Jag tillhandahåller AI- och data engineer konsulting för företag i Borås och i hela Sverige. Om du behöver hjälp med att implementera NLP-lösningar eller vill utforska few-shot learning för ditt användningsfall, hör av dig.

