# Från Jupyter Notebooks till Produktion: MLOps Workshop på Tech Borås


Den 23 september genomförde jag den tredje och avslutande workshopen i AI Lab-serien på Högskolan i Borås. Den här gången tacklade vi gapet mellan experimentering och produktion. Problemet med att "kasta det över staketet" som dödar många ML-projekt. <!--more-->

{{< image src="tech-boras-workshop-3.webp" caption="MLOps workshop på Högskolan i Borås, 23 september" >}}

## Problemet med utvecklingsmiljön

De flesta ML-projekt börjar i Jupyter notebooks. Du laddar in data, utforskar den, tränar en modell, validerar den och kallar det klart. Det fungerar för experiment, men skapar ett problem: hela arbetsflödet lever på din laptop i en linjär, manuell process.

### Det typiska data science arbetsflödet

1. **Dataanalys** - Utforska och förstå ditt dataset
2. **Förbehandling** - Rensa och transformera data
3. **Modellträning** - Anpassa din modell till datan
4. **Modellvalidering** - Kontrollera om den faktiskt fungerar
5. **Modellöverlämning** - Hoppas att någon kan distribuera den

Varje steg körs manuellt. Ingen automation. Ingen versionering. Inget sätt att reproducera resultat tillförlitligt. När din modell presterar bra i validering så står du inför en fråga: hur får du in detta i produktion?

{{< admonition type="info" title="Överlämningsproblemet skalas olika, men finns överallt" open=true >}}
På ett **litet företag** hanterar en person allt från dataanalys till distribution. Överlämningen sker mellan olika roller som samma person har.

På **mellan- och stora företag** bygger data scientists modeller men har svårt att lämna över dem till ingenjörsteam. Modellen som fungerade perfekt i en notebook misslyckas i produktion, eller ännu värre, blir oanvända eftersom det är för svårt med deployment.
{{< /admonition >}}

**MLOps-metoder byggda på CI/CD-principer** löser detta genom att eliminera överlämningen helt och hållet. Istället för att skicka artefakter mellan team eller roller bygger du automatiserade pipelines som flyttar kod från experiment till produktion. Samma pipeline som tränar din modell distribuerar den också.

## "Kasta över staketet" anti-mönstret

När organisationer försöker skala sitt ML-arbete stöter de på en vägg. Bokstavligt talat.

{{< image src="throw-over-fence-diagram.webp" caption="Arbetsflödet 'kasta det över staketet': data scientists och ingenjörer arbetar isolerat. Bildkälla [swirlai.com](https://www.newsletter.swirlai.com/p/evolving-maturity-of-mlops-stack)" >}}

Titta på diagrammet ovan. Till vänster arbetar data scientist i Jupyter, kopplad till datalagret. De analyserar data, förbehandlar den, tränar en modell, validerar den. I slutet av denna pipeline sitter **Modellöverlämning** (steg 1).

Sen kommer väggen. Tegelväggen i mitten representerar organisatorisk separation. Modellartefakten dumpas i en bucket (steg 2) och skickas över till andra sidan. Ingen träningskontext. Ingen förbehandlingskod. Inga valideringsmått. Bara en picklad modellfil och en massa hopp.

På andra sidan tar mjukvaruingenjören emot denna artefakt (steg 3). De försöker distribuera (steg 4), packar in den i en container och exponerar den till produktapplikationer (steg 5). Sen slår verkligheten till.

{{< admonition type="warning" title="Varför detta mönster misslyckas" open=true >}}
Modellen som uppnådde 95% noggrannhet i notebooken får 60% i produktion. Varför?

- **Olika datafördelningar**: Träning använde förra månadens data, produktion ser dagens data
- **Saknad förbehandling**: Notebooken hade 10 celler med datarensning som aldrig dokumenterades
- **Beroende-missmatchningar**: Modellen tränad med scikit-learn 1.4, produktion kör 1.0
- **Ingen övervakning**: När noggrannheten sjunker märker ingen det på flera veckor eller månader
{{< /admonition >}}

Det här arbetsflödet går sönder eftersom det behandlar modellutveckling och distribution som separata problem. Data scientist optimerar för noggrannhet i experiment. Ingenjören optimerar för tillförlitlighet i produktion. Dessa mål konfliktar när det finns en vägg mellan dem.

Dokumentation fixar inte detta. READMEs blir föråldrade. Kommentarer ignoreras. Vad du behöver är delad infrastruktur som båda rollerna interagerar med under sitt arbete.

## MLOps-lösningen: produktionsarkitektur

Lösningen bryggar över väggen med hjälp av delad infrastruktur. Istället för två isolerade miljöer bygger du automatiserade pipelines som kopplar samman data, träning och distribution.

{{< image src="production-mlops-architecture.webp" caption="Produktions-MLOps-arkitektur med automatiserade pipelines och centraliserad metadataspårning. Bildkälla [swirlai.com](https://www.newsletter.swirlai.com/p/evolving-maturity-of-mlops-stack)" >}}

Diagrammet visar en produktions-ML-miljö. Tre automatiserade pipelines ersätter manuella överlämningar: **Data Engineering** (lager till kurerad data), **ML Training** (förbehandling genom validering) och **Deployment** (register till produktion).

I centrum sitter en metadata-hubb med tre komponenter:
- **Experiment Tracker**: Loggar mätvärden och parametrar från varje träningskörning
- **ML Metadata Store**: Spårar dataursprung och artefaktrelationer
- **Model Registry**: Lagrar versionshanterade modeller redo för distribution

En orkestrator som Airflow kör dessa pipelines enligt scheman eller triggers och skapar en **Continuous Training**-loop där modeller omtränas automatiskt när data förändras.

Väggen är delvis besegrad. Både data scientists och utvecklare nyttjar samma modellregister och metadata store. Modellen som distribueras är exakt den modell som validerades, med full versionering.

## Bygga pipelinen: MLflow + Airflow

Workshopen på Tech Borås omsatte denna teori till praktik. Deltagarna fick testa på att bygga en komplett MLOps-pipeline med MLflow för spårning och Airflow för orkestrering, allt körande lokalt på sina laptops.

{{< image src="airflow-dag-diagram.webp" caption="Workshop-DAG:en: automatiserad datagenerering, prediktion, övervakning och städning" >}}

### Tech-stacken
- **MLflow**: Experimentspårning, metadata store och modellregister
- **Airflow**: Pipeline-orkestrering med en Directed Acyclic Graph (DAG)
- **uv**: Snabb Python-pakethanterare för beroendehantering

### DAG-strukturen

Diagrammet visar fem uppgifter som körs i sekvens och parallellt:

1. **generate_data** (PythonOperator): Simulerar ny data från ett lager
2. **batch_predict** (PythonOperator): Laddar den registrerade modellen och gör prediktioner
3. **monitor_model** (PythonOperator): Kontrollerar prediktionskvalitet och loggar mätvärden till MLflow
4. Efter övervakning körs två uppgifter parallellt:
   - **cleanup_old_artifacts** (BashOperator): Tar bort gamla filer
   - **generate_summary** (PythonOperator): Skapar prestandarapporter

DAG:en interagerar med MLflows modellregister för att hämta den senaste produktionsmodellen och loggar mätartal med hjälp av experimentspåraren.

### Installation och uppsättning

Hela exempel koden finns tillgänglig på [github.com/krjoha/ai-lab-mlops](https://github.com/krjoha/ai-lab-mlops). Till workshopen använde vi `uv`, en snabb Python-pakethanterare skriven i Rust som hanterar beroendeupplösning och virtuella miljöer. Den är betydligt snabbare än pip och skapar reproducerbara miljöer. Både MLflow och Airflow körs som lokala tjänster:
- MLflow tillhandahåller webbgränssnittet för experimentspårning och modellregister på `http://localhost:5000`
- Medan Airflow kör schemaläggaren och webbgränssnittet för DAG-hantering på `http://localhost:8080`.

```bash
# Klona repositoriet
git clone https://github.com/krjoha/ai-lab-mlops
cd ai-lab-mlops

# Installera beroenden
uv sync
source .venv/bin/activate

# Starta MLflow-server (i separat terminal)
bash start_mlflow.sh

# Starta Airflow-server (i en annan terminal)
bash start_airflow.sh
```

Efter att ha startat Airflow, hitta användarnamn och lösenord i terminalutskriften eller i `airflow/simple_auth_manager_passwords.json.generated`.

### Träning och registrering av en modell

Kör träningsskriptet för att skapa en initial modellen:

```bash
python tasks/train_model.py
```

Du kan se den lagrade och versionshanterade modellen i MLflow-gränssnittet på `http://localhost:5000/#/experiments`. Efter att ha skapat en modell och lagrat den i MLflow-registret kan du gå till Airflow-gränssnittet på `http://localhost:8080` och köra prediktions-DAG/pipelinen därifrån.

Här bygger vi en sentimentklassificeringsmodell med scikit-learns `Pipeline` för att kedja ihop en TF-IDF-vektoriserare med logistisk regression. Kärnlogiken för träning finns att beskåda på [`tasks/train_model.py`](https://github.com/krjoha/ai-lab-mlops/blob/main/tasks/train_model.py), här följer ett urklipp av koden:

```python
# Skapa pipeline
pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(max_features=1500, ngram_range=(1, 2))),
    ('classifier', LogisticRegression(random_state=42, max_iter=1000))
])

# Träna och logga med MLflow
with mlflow.start_run(experiment_id=experiment_id) as run:
    # Logga parametrar och träna
    mlflow.log_param("vectorizer_max_features", 1500)
    pipeline.fit(df['text'], df['sentiment'])

    # Logga mätvärden
    cv_scores = cross_val_score(pipeline, df['text'], df['sentiment'], cv=3)
    mlflow.log_metric("cv_mean_accuracy", cv_scores.mean())

    # Registrera modell i MLflow-register
    model_info = mlflow.sklearn.log_model(sk_model=pipeline, artifact_path="model")
    mlflow.register_model(model_uri=model_info.model_uri, name="sentiment_classifier")
```

Det som är viktigt: `mlflow.register_model()` placerar den tränade modellen i ett centralt register som steg nedströms i vår pipeline kan ladda in via dess namn, inte via någon filsökväg till nåt picklat object. Denna separation mellan träning och distribution betyder att data scientists kan registrera flera modellversioner, och utvecklare kan alltid ladda den senaste versionen utan att behöva röra träningskoden.

### Modellövervakning

Vårt övervakningssteg analyserar prediktionstrender över tid genom att nyttja MLflows experimentspårning. Istället för att kontrollera ett enda mätartal tittar den på mönster över flera DAG-körningar för att upptäcka försämring och förändringar tidigt (se [`tasks/monitor_model.py`](https://github.com/krjoha/ai-lab-mlops/blob/main/tasks/monitor_model.py) för fullständig implementation):

```python
def monitor_model():
    # Hämta senaste körningar från MLflow (senaste 30 dagarna)
    runs = mlflow.search_runs(
        experiment_ids=[experiment.experiment_id],
        order_by=["start_time DESC"],
        max_results=50
    )

    # Analysera trender
    avg_confidences = runs['metrics.average_confidence'].dropna()
    low_confidence_rates = runs['metrics.low_confidence_percentage'].dropna()

    # Generera varningar
    alerts = []
    if avg_confidences.iloc[0] < avg_confidences.iloc[1]:
        alerts.append("Model confidence is declining")
    if low_confidence_rates.mean() > 25:
        alerts.append(f"High low-confidence rate: {low_confidence_rates.mean():.1f}%")

    # Logga övervakningsresultat tillbaka till MLflow
    with mlflow.start_run(experiment_id=experiment.experiment_id):
        mlflow.log_metric("overall_avg_confidence", avg_confidences.mean())
        mlflow.log_metric("alert_count", len(alerts))
```

Detta skapar en återkopplingsloop: prediktioner genererar mätvärden, övervakningssteget analyserar dessa mätvärden över tid, och varningar triggas när mönster indikerar problem. Allt spåras i MLflow.

Workshopen omsatte **MLOps-teori till praktik.** Deltagarna byggde kompletta pipelines med MLflow-spårning, Airflow-orkestrering och automatiserad övervakning körande på sina egna laptops. Samma arkitektur som hanterade sentimentklassificering i workshopen skalar till bedrägeridetektering, rekommendationssystem eller efterfrågeprognoser i produktion.

Det som får detta tillvägagångssätt att fungera är att eliminera överlämningen. När data scientists och ingenjörer båda interagerar med ett delat modellregister försvinner problemet med att "kasta det över staketet". Automatiserade pipelines **fångar problem under utveckling, inte i produktion.** Övervakningsteg spårar trender över körningarna istället för att vänta på att användare (kanske) rapporterar ett problem.

## MLOps & AI-konsult i Borås

Detta var den tredje workshopen i AI Lab-serien på Högskolan i Borås, fokuserad på praktisk MLOps för utvecklare och ingenjörer. Jag tillhandahåller AI- och data engineering konsulting för företag i Borås och i hela Sverige. Om du behöver hjälp med att implementera MLOps-infrastruktur, bygga ML-pipelines eller flytta modeller från experiment till produktion, hör av dig.

