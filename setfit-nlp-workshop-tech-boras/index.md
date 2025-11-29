# Powerful NLP with SetFit and Few-Shot Learning


On September 9, I ran the second workshop in the AI Lab series at University of Borås. This time we tackled a common business problem that you run into all the time when starting an AI project: You have the data, but it is unlabeled. This post shows how to handle that challenge with few-shot learning. <!--more-->

{{< image src="tech-boras-workshop-2.webp" caption="Workshop om Transformers och SetFit på Högskolan i Borås, 9 september" >}}

Modern NLP (Natural Language Processing) tools like SetFit make few-shot learning practical with code you can run locally on your own hardware. Small language models like BERT variants are lightweight enough to run on consumer GPUs, making advanced NLP accessible without cloud infrastructure dependency or recurring costs. This is an excellent first AI/ML project for companies wanting to get started with data-driven work!

## The challenge of limited training data

Text classification solves real business problems. To mention a few, you can: sort support tickets by priority, filter out spam, route customer inquiries to the right department, analyze sentiment (what people think) in product reviews.

A traditional machine learning approach requires thousands of labeled examples in a so-called dataset. That means you need someone to manually label 5,000+ emails as "spam" or "not spam" before training a model can begin. That can be expensive and slow (and boring), which means most organizations don't have thousands of pre-labeled examples sitting around.

This is where the SetFit method comes in: it uses powerful pre-trained transformer models that we fine-tune on as few as two examples per class. Much easier to manage than 5,000 examples!

## How Transformers changed NLP

Transformer models like BERT revolutionized natural language processing by understanding word context. Unlike older methods that treat words as isolated tokens, BERT captures meaning based on surrounding words.

Consider these sentences:
- "He biked to work."
- "He drove his car to work."
- "Peter decided to take his bike to the beach."

BERT understands that "biked" and "bike" relate to the same concept, while "drove his car" represents a different mode of transport. This contextual understanding is what makes modern NLP powerful. And what's extra good is that there are open-source platforms like [HuggingFace](https://huggingface.co/) filled with these small, pre-trained BERT models that already know a lot about our world. We just need to provide a few examples of our task to retrain the models to become good at what we want.

## Understanding semantic similarity in text

The context in which you read a text matters for the concept of "similarity". Whether two sentences are "similar" depends entirely on what you're measuring. If we look from the perspective of public transportation, we might be interested in knowing which mode of transport is mentioned in the text. Then we can imagine that examples might be paired like this:

**Negative pair** (different modes of transport):
- "He biked to work."
- "He drove his car to work."

**Positive pair** (same mode of transport):
- "He biked to work."
- "Peter decided to take his bike to the beach."

**Negative pair** (different modes of transport):
- "Peter decided to take his bike to the beach."
- "He drove his car to work."

But if we're interested in knowing where someone is going, we would need to pair the examples in a completely different way. This is important because transformer models learn these contextual relationships from massive datasets when they were initially trained. That means the models have seen data that might not match exactly what you want to measure! And this is where SetFit comes in.

## SetFit: Few-Shot Learning for Text Classification

SetFit combines pre-trained Transformer models with efficient fine-tuning on your problem from the perspective you want to adopt. That is, is it interesting to know the mode of transport or the destination? And thanks to SetFit, we can achieve very high accuracy with just 2-16 labeled examples.

SetFit works in two stages:

1. **Contrastive learning**: Train on sentence pairs to learn which examples are similar and which are different
2. **Classification head**: Train a simple classifier on top of the learned embeddings

Doing it this way leverages the vast knowledge already baked into transformer models. You're not teaching the model language and concepts from scratch. Instead, you're teaching it your specific classification task using the language understanding the model already has.

This gives us fast, lightweight, production-ready text classifiers trained on a fraction of the data that traditional methods require.

## Building a text classifier with SetFit

This example is based on the workshop repository: [github.com/krjoha/ai-lab-setfit](https://github.com/krjoha/ai-lab-setfit)

If you want to see the full example, you can look at one of the notebooks in the repository. Here's a code example from there:

### Installation

Use `uv` to create a virtual python environment.

```bash
# Create a virtual environment in a .venv folder and install all project dependencies
uv sync
```

### Complete Training Pipeline

```python
from datasets import load_dataset
from setfit import SetFitModel, Trainer, TrainingArguments, sample_dataset

# Load the Amazon Massive Intent dataset (Swedish)
train_dataset = load_dataset("SetFit/amazon_massive_intent_sv-SE", split="train")
test_dataset = load_dataset("SetFit/amazon_massive_intent_sv-SE", split="test")

# Sample just 1 example per class (60 examples from 60 intent classes)
train_sample = sample_dataset(
    train_dataset,
    label_column="label",
    num_samples=1
)

# Load a pre-trained embedding model
model = SetFitModel.from_pretrained("nomic-ai/modernbert-embed-base")

# Configure training
args = TrainingArguments(
    batch_size=32,
    num_epochs=1,
)

# Initialize trainer
trainer = Trainer(
    model=model,
    args=args,
    train_dataset=train_sample,
    eval_dataset=test_dataset,
    metric='accuracy',
)

# Train the model
trainer.train()

# Evaluate on test set
results = trainer.evaluate(test_dataset)
print(f"Accuracy: {results['accuracy']:.2%}")

# Make predictions on new Swedish text
predictions = model.predict([
    "Släck lampan",           # Turn off the light
    "spela vikingarna",       # Play Vikingarna (music)
    "starta dammsugaren",     # Start the vacuum cleaner
])
print(predictions)
```

### What this code does

1. **Dataset loading**: Load Amazon Massive Intent dataset with 60 different intent classes in Swedish
2. **Few-shot sampling**: Sample just 1 example per class (60 total examples from 11,514 available)
3. **Model initialization**: Load a pre-trained multilingual embedding model
4. **Training**: The trainer generates sentence pairs and fine-tunes the model
5. **Evaluation**: Test accuracy on 2,974 unseen examples
6. **Prediction**: Classify new Swedish voice assistant commands

With just 60 examples total (1 per class), this model achieves sufficiently high accuracy to become useful for so-called "intent classification". As mentioned, traditional approaches would need thousands of examples per class to achieve similar results.

## Running locally with GPU

Small language models like BERT are lightweight enough to run on consumer GPUs. Unlike large language models, models like `modernbert-embed-base` require only a few gigabytes of GPU memory.

Training Transformer models needs GPU acceleration. Even with SetFit's efficiency, CPU training can sometimes be slow and impractical. So it's good to use your computer's GPU if there is one. You can check that by running:

```bash
# Verify NVIDIA GPU is detected
nvidia-smi

# For Macbook with Apple Silicon (M1/M2/M3/M4/M5)
# PyTorch will automatically detect and use MPS (Metal Performance Shaders)
```

If you have an NVIDIA GPU with CUDA support or a Macbook with Apple Silicon, PyTorch will use hardware acceleration automatically. The training code above with 60 examples takes a few seconds instead of several hours with only CPU.

### Local vs Cloud Development

Running locally gives you control. No session timeouts. No random disconnects. Work directly with local datasets. Your environment persists between sessions.

But if you don't have local GPU access, Kaggle provides free GPU notebooks.

### Alternative: Kaggle Notebooks

Kaggle offers free GPU in their notebook environment. But it requires a registered account + phone verification to prevent abuse. In exchange, you get access to an Nvidia T4 GPU.

**Phone verification:**
1. Log into your account at [kaggle.com/settings](https://www.kaggle.com/settings)
2. Follow the instructions to add your phone number
3. After verification, your notebooks get internet access and GPU support

**Enable GPU:**
1. Open the Kaggle Notebook
2. Click **Settings** → **Accelerator** → **GPU T4 x2** (avoid P100, it's older)
3. Your session now has GPU acceleration

**Install SetFit:**
1. Run the first cell to start your session
2. Click **Add-ons** → **Install Dependencies**
3. Paste: `pip install setfit`
4. Click **Run**, then **Save**

There's a version of the workshop notebook on Kaggle with these packages pre-configured.

## Get started with few-shot NLP

SetFit makes it possible to solve real business problems with NLP without needing thousands of labeled examples. Because pre-trained transformer models already understand language, you just need to teach them your specific task. This requires far less data than training from scratch. An excellent first project!

Want to try it yourself? Clone the workshop repository and train your first few-shot classifier:

**Repository**: [github.com/krjoha/ai-lab-setfit](https://github.com/krjoha/ai-lab-setfit)

You can have a working text classifier running in under 10 minutes. And it's free to run locally if you have a GPU in your computer!

{{< image src="ceo.webp" caption="Kristoffer Johansson, lecturer and create of the AI Lab concept at Tech Borås" >}}

## NLP & AI Consulting in Borås

This workshop was part of the AI Lab series at University of Borås, focused on practical AI and NLP for developers. I provide AI and data engineering consulting for businesses in Borås and throughout Sweden. If you need help implementing NLP solutions or want to explore few-shot learning for your use case, reach out.

