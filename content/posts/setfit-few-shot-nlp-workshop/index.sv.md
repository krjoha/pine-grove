---
title_seo: "SetFit Few-Shot Learning Tutorial: Avancerad NLP med Minimal Data | Tech Borås AI Lab"
title: "Kraftfull NLP med SetFit och Few-Shot Learning"
date: 2025-11-03T15:00:00+01:00
lastmod: 2025-11-03T15:00:00+01:00
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

Den 28 oktober genomförde jag den andra workshopen i AI Lab-serien på Tech Borås / Högskolan i Borås. Vi tacklade ett vanligt affärsproblem: hur man bygger noggranna textklassificeringsmodeller när man har begränsad märkt data. <!--more-->

Om du missade den, täcker detta inlägg hur moderna NLP-verktyg som SetFit gör few-shot learning praktiskt, och inkluderar fungerande kod du kan köra idag.

## Utmaningen: Begränsad Träningsdata

Textklassificering löser verkliga affärsproblem. Sortera supportärenden efter prioritet. Upptäck skräppost. Dirigera kundförfrågningar till rätt avdelning. Analysera sentiment i produktrecensioner.

Det traditionella tillvägagångssättet kräver tusentals märkta exempel. Du behöver någon som manuellt märker "skräppost" eller "inte skräppost" för 5 000+ e-postmeddelanden innan träningen börjar. Det är dyrt och tidskrävande.

Kärnproblemet: **du behöver enorma mängder märkt data**, men märkning är manuellt, tråkigt arbete. De flesta organisationer har inte tusentals förmärkta exempel liggande.

## Hur Transformers Förändrade NLP

Transformer-modeller som BERT revolutionerade naturlig språkbehandling genom att förstå ordkontext. Till skillnad från äldre metoder som behandlar ord som isolerade tokens, fångar BERT betydelse baserat på omgivande ord.

Betrakta dessa meningar:
- "Han cyklade till jobbet."
- "Han körde sin bil till jobbet."
- "Peter bestämde sig för att ta cykeln till stranden."

BERT förstår att "cyklade" och "cykeln" relaterar till samma koncept, medan "körde sin bil" representerar ett annat transportsätt. Denna kontextuella förståelse är vad som gör modern NLP kraftfull.

### Problemet med Likhet

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

SetFit kombinerar förtränade Transformer-modeller med effektiv finjustering. Genombrottet: du kan uppnå hög noggrannhet med endast 8-16 märkta exempel per klass.

SetFit fungerar i två steg:

1. **Kontrastiv inlärning**: Träna på meningspar för att lära sig vilka exempel som är lika och vilka som är olika
2. **Klassificeringshuvud**: Träna en enkel klassificerare ovanpå de inlärda inbäddningarna

Detta tillvägagångssätt utnyttjar kunskapen som redan finns inbakad i förtränade modeller. Du lär inte modellen språk från grunden. Du lär den din specifika klassificeringsuppgift med hjälp av den språkförståelse den redan har.

Resultatet: produktionsklara textklassificerare tränade på en bråkdel av den data traditionella metoder kräver.

## Kodexempel: Träna en SetFit-klassificerare

Detta exempel är baserat på workshop-repositoriet: [github.com/krjoha/ai-lab-setfit](https://github.com/krjoha/ai-lab-setfit)

Den fullständiga notebook:en demonstrerar det kompletta arbetsflödet. Här är kärnimplementationen:

### Installation

```bash
pip install setfit datasets
```

### Komplett Träningspipeline

```python
from datasets import Dataset
from setfit import SetFitModel, SetFitTrainer

# Skapa en liten träningsdataset
# I produktion skulle detta vara dina märkta exempel
train_data = {
    "text": [
        "Denna produkt är fantastisk!",
        "Fruktansvärd kvalitet, gick sönder efter en dag",
        "Älskar den, exakt vad jag behövde",
        "Slöseri med pengar, mycket besviken",
        "Utmärkt köp, rekommenderar starkt",
        "Dålig design, fungerar inte som utlovat",
        "Bästa köpet jag gjort i år",
        "Billiga material, föll isär snabbt",
        "Fantastisk kvalitet och snabb leverans",
        "Ångrar att jag köpte detta, totalt misslyckande",
        "Överträffade mina förväntningar",
        "Inte värt priset alls",
        "Bra valuta för pengarna",
        "Defekt produkt, begär återbetalning",
        "Fungerar perfekt, mycket nöjd",
        "Komplett skräp, undvik denna produkt"
    ],
    "label": [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]  # 1 = positivt, 0 = negativt
}

train_dataset = Dataset.from_dict(train_data)

# Initiera modellen
# Använder en flerspråkig modell som fungerar för både engelska och svenska
model = SetFitModel.from_pretrained(
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)

# Initiera träningsverktyget
trainer = SetFitTrainer(
    model=model,
    train_dataset=train_dataset,
    num_iterations=20,  # Antal textpar att generera
    num_epochs=1
)

# Träna modellen
trainer.train()

# Gör förutsägelser på ny text
predictions = model.predict([
    "Detta är det bästa någonsin!",
    "Absolut hemsk upplevelse",
    "Ganska bra, skulle köpa igen"
])

print(predictions)
# Output: array([1, 0, 1])  # positivt, negativt, positivt
```

### Vad Denna Kod Gör

1. **Dataset-skapande**: Vi skapar en enkel dataset med 16 märkta exempel (8 positiva, 8 negativa)
2. **Modellinitiering**: Ladda en förtränad flerspråkig Transformer-modell
3. **Tränings-setup**: Konfigurera SetFit-tränaren med vår lilla dataset
4. **Träning**: Tränaren genererar meningspar och finjusterar modellen
5. **Förutsägelse**: Klassificera ny, osedd text

Med endast 16 exempel totalt kan denna modell noggrant klassificera sentiment. Traditionella tillvägagångssätt skulle behöva tusentals exempel för att uppnå liknande noggrannhet.

## Viktiga Insikter

### Från Big Data till Few-Shot Learning

Paradigmet har skiftat. Förtränade Transformer-modeller innehåller språkförståelse inlärd från miljarder ord. SetFit låter dig utnyttja denna kunskap och anpassa den till din specifika uppgift med minimal märkt data.

Du behöver inte massiva dataset längre. Du behöver rätt tillvägagångssätt.

### GPU-acceleration är Nödvändig

Träning av Transformer-modeller kräver GPU-acceleration. Även med SetFits effektivitet är CPU-träning opraktisk. Workshopen använde online notebook-miljöer med GPU-åtkomst (Google Colab, Kaggle) för att göra träningen genomförbar.

Moderna molnplattformar tillhandahåller GPU-åtkomst till rimlig kostnad. Detta gör avancerad NLP tillgänglig för mindre team och projekt.

### Modernt Utvecklingsarbetsflöde

Workshopen betonade praktiska verktyg:
- **Online notebooks** (Colab, Kaggle) för GPU-accelererad experimentering
- **Hugging Face-ekosystem** för förtränade modeller och dataset
- **Moderna IDE:er** (VS Code med AI-assistenter) för produktionskod

Dessa verktyg sänker inträdesbarriären. Du kan gå från idé till fungerande klassificerare på minuter, inte månader.

## Slutsats

Modern NLP med Transformer-modeller är kraftfull. Verktyg som SetFit gör det praktiskt för verkliga problem där märkt data är begränsad.

Kärninsikten: förtränade modeller förstår redan språk. Du lär dem din specifika uppgift, inte språket i sig. Detta kräver betydligt mindre data än att träna från grunden.

Vill du prova själv? Klona workshop-repositoriet och träna din första few-shot klassificerare:

**Repository**: [github.com/krjoha/ai-lab-setfit](https://github.com/krjoha/ai-lab-setfit)

Du kan ha en fungerande textklassificerare igång på under 10 minuter.

## NLP-konsulting i Borås

Denna workshop var en del av AI Lab-serien på Högskolan i Borås, fokuserad på praktisk AI och NLP för utvecklare. Jag tillhandahåller AI- och datateknikkonsulting för företag i Borås och i hela Sverige. Om du behöver hjälp med att implementera NLP-lösningar eller vill utforska few-shot learning för ditt användningsfall, hör av dig.
