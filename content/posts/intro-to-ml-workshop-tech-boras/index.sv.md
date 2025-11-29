---
title_seo: "Maskininlärning Workshop Borås: Praktisk AI-guide för utvecklare"
title: "Maskininlärningsworkshop i Borås"
date: 2025-08-29T15:00:00+01:00
lastmod: 2025-08-29T15:00:00+01:00
draft: false
author: "Kristoffer Johansson"
authorLink: "https://www.linkedin.com/in/kristoffer-johansson/"
description: "Praktiska insikter om maskininlärning från vår utvecklarworkshop på Högskolan i Borås. Lär dig ML-grunderna, förstå AI-hype vs verklighet, och kom igång med Python. Expert ML-konsultation i Borås."
summary: "Viktiga insikter från vår praktiska maskininlärning workshop på Högskolan i Borås. Kom förbi AI-hypen och lär dig praktiska ML-tekniker för utvecklare."
images: []

lightgallery: false
toc:
    enable: true
---

Den 26 augusti genomförde jag den första av tre workshops på Högskolan i Borås. Målet var att introducera 25 utvecklare till maskininlärning och låta dem bygga ett gäng modeller samtidigt som vi undvek vanliga fallgropar. <!--more-->

{{< image src="tech-boras-workshop-1.webp" caption="Maskininlärning workshop på Högskolan i Borås, 26 augusti" >}}

Om du missade workshopen täcker det här inlägget det material vi använde, en rekommenderad kurs och några ord om den pågående AI-hype-bubblan.

## Kom igång med maskininlärning på Kaggle

För att komma igång i en online Python-miljö utan lokal installation är Kaggle ett stabilt val. Kaggle erbjuder interaktiva kurser där du skriver kod direkt i webbläsaren. Ingen installation, ingen konfiguration.

Så här börjar du:

1. Skapa ett gratis konto på [kaggle.com](https://www.kaggle.com)
2. Gå till "Learn"-sektionen
3. Starta kursen **"Intro to Machine Learning"**
4. Skriv kod, kör, se resultat

Direktlänk: [https://www.kaggle.com/learn/intro-to-machine-learning](https://www.kaggle.com/learn/intro-to-machine-learning)

Kursen använder Python och scikit-learn för att bygga prediktiva modeller. Du lär dig genom att koda, vilket enligt mig slår att enbart läsa teori.

## Kodexempel: En första maskininlärningsmodell

Kaggle-kursen går igenom hur man bygger en enkel prediktiv modell. Här är ett exempel från kursmaterialet: ladda husprisdata och träna ett beslutsträd för att förutspå huspriser.

```python
import pandas as pd
from sklearn.tree import DecisionTreeRegressor

# Path of the file to read
iowa_file_path = '../input/home-data-for-ml-course/train.csv'

home_data = pd.read_csv(iowa_file_path)
y = home_data.SalePrice
feature_names = ['LotArea', 'YearBuilt', '1stFlrSF', '2ndFlrSF', 'FullBath', 'BedroomAbvGr', 'TotRmsAbvGrd']
X = home_data[feature_names]

# Define model
iowa_model = DecisionTreeRegressor(random_state=1)

# Fit model
iowa_model.fit(X, y)

print("Making predictions for the following 5 houses:")
print(X.head())
print("The predictions are")
print(iowa_model.predict(X.head()))
```

Detta demonstrerar det grundläggande ML-arbetsflödet: ladda data, välj features, träna en modell, gör prediktioner. Kaggle-kursen bryter ner varje steg på ett väldigt pedagogiskt sätt.

## Viktiga koncept från workshopen

Här kommer några av de grundläggande insikter som vi diskuterade under workshopen. Om du förstår och är medveten om dessa ligger du före de flesta som enbart "pratar om AI".

### Maskininlärning är mönsterigenkänning

ML-algoritmer hittar mönster i historisk data. Du matar algoritmen med exempel och den lär sig att känna igen mönster som gäller för ny, osedd data. Det skiljer sig från traditionell programmering där du istället skriver explicita regler. I ML upptäcker algoritmen reglerna från data.

### Historien upprepar sig

ML-modeller bygger på ett viktigt antagande:

{{< admonition tip "Antagande" >}}
Mönstren i din historiska data kommer att gälla även för framtida data.
{{< /admonition >}}

När de underliggande mönstren förändras fungerar int din modell. ML fungerar bra för stabila domäner som att förutsäga huspriser eller upptäcka spam. Det fungerar sämre i snabbt föränderliga miljöer. Maskininlärning är inte magi.

{{< admonition warning "Kritisk regel" >}}
Utvärdera alltid din modell på osedd data. Inga undantag.
{{< /admonition >}}

Tränar du på data och sedan testar på samma data? Då mäter du memorering, inte prediktion. Använd ett testdataset för att mäta verklig prestanda. En modell som presterar bra på träningsdata men misslyckas på ny data är inte särskilt användbar.

### AI är överskattat

AI är kraftfullt, men den pågående hypen blåser upp orimliga förväntningar. För de flesta företag löser enkel maskininlärning många fler problem än att jaga de senaste AI-trenderna.

{{< admonition note "Hype-bubblan" >}}
AI är **olönsamt för de flesta företag** och kraftigt subventionerat av riskkapital. Fokusera på att lösa riktiga problem med beprövade tekniker först.
{{< /admonition >}}

### Data är din vallgrav

Det verkliga värdet i maskininlärning är data. Att skaffa och strukturera bra data är den svåraste delen.

{{< admonition success "Konkurrensfördel" >}}
Ett unikt, högkvalitativt dataset **bygger konkurrensfördelar**. Vem som helst kan träna en modell. Få företag har unik, värdefull data.
{{< /admonition >}}

Investera i datainfrastruktur och datakvalitet. Det är där hållbara konkurrensfördelar finns.

{{< image src="participants.webp" caption="Deltagare arbetar med praktiska ML-övningar" >}}

## Maskininlärning konsultation i Borås

Denna workshop var den första i en serie på Högskolan i Borås med fokus på praktisk AI och maskininlärning för utvecklare. Jag erbjuder AI- och data engineering tjänster för företag i Borås och i hela Sverige. Om du behöver hjälp med att implementera maskininlärning och data pipelines eller vill komma förbi AI-hypen och hitta något som faktiskt fungerar för ditt företag, hör av dig!
