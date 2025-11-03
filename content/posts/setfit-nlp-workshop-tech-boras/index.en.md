---
title_seo: "Train Text Classifiers with 8 Examples: SetFit Few-Shot Learning Tutorial"
title: "Powerful NLP with SetFit and Few-Shot Learning"
date: 2025-09-10T15:00:00+01:00
lastmod: 2025-09-10T15:00:00+01:00
draft: false
author: "Kristoffer Johansson"
authorLink: "https://www.linkedin.com/in/kristoffer-johansson/"
description: "Learn how to build accurate text classifiers with just a handful of training examples using SetFit and Transformer models. Practical tutorial from Tech Borås AI Lab Workshop 2."
summary: "Workshop 2 from Tech Borås AI Lab: Build powerful text classification models with SetFit using only 8-16 examples per class. Solve real NLP problems without massive datasets."
images: []

lightgallery: false
toc:
    enable: true
---

On September 9, I ran the second workshop in the AI Lab series at University of Borås. This time we tackled a common business problem that you run into all the time when starting an AI project: You have the data, but it is unlabeled. This post shows how to handle that with few-shot learning. <!--more-->

Modern NLP tools like SetFit make few-shot learning practical with working code you can run locally on your own hardware. Small language models like BERT variants are lightweight enough to run on consumer GPUs, making advanced NLP accessible without cloud dependency or recurring costs.

## The Challenge: Limited Training Data

Text classification solves real business problems. Sort support tickets by priority. Detect spam. Route customer inquiries to the right department. Analyze sentiment in product reviews.

A traditional ML approach requires thousands of labeled examples. So you need someone to manually tag "spam" or "not spam" for 5,000+ emails before training begins. That can be expensive and slow, which means most organizations don't have thousands of pre-labeled examples sitting around.

This is where SetFit comes in: it utilizes powerful pre-trained transformer models that we fine-tune on as few as 2 examples per class.

## How Transformers Changed NLP

Transformer models like BERT revolutionized natural language processing by understanding word context. Unlike older methods that treat words as isolated tokens, BERT captures meaning based on surrounding words.

Consider these sentences:
- "He biked to work."
- "He drove his car to work."
- "Peter decided to take his bike to the beach."

BERT understands that "biked" and "bike" relate to the same concept, while "drove his car" represents a different mode of transport. This contextual understanding is what makes modern NLP powerful. And HuggingFace is filled with these small, pre-trained BERT models that already knows a lot about our world. We just need to provide a few examples of our task to get excellent performance!

## Understanding Semantic Similarity in Text

Context matters for similarity. Whether two sentences are "similar" depends on what you're measuring:

**Negative pair** (different transport):
- "He biked to work."
- "He drove his car to work."

**Positive pair** (same transport):
- "He biked to work."
- "Peter decided to take his bike to the beach."

**Negative pair** (different transport):
- "Peter decided to take his bike to the beach."
- "He drove his car to work."

Transformers learn these contextual relationships from massive text corpora during pre-training. This is where SetFit becomes practical.

## SetFit: Few-Shot Learning for Text Classification

SetFit combines pre-trained Transformer models with efficient fine-tuning. You can achieve high accuracy with just 2-16 labeled examples per class.

SetFit works in two stages:

1. **Contrastive learning**: Train on sentence pairs to learn which examples are similar and which are different
2. **Classification head**: Train a simple classifier on top of the learned embeddings

This approach leverages the knowledge already baked into pre-trained models. You're not teaching the model language from scratch. You're teaching it your specific classification task using the language understanding it already has.

This gives us fast, lightweight, production-ready text classifiers trained on a fraction of the data traditional methods require.

## Building a Text Classifier with SetFit

This example is based on the workshop repository: [github.com/krjoha/ai-lab-setfit](https://github.com/krjoha/ai-lab-setfit)

The full notebook demonstrates the complete workflow. Here's the core implementation:

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

### What This Code Does

1. **Dataset loading**: Load Amazon Massive Intent dataset with 60 different intent classes in Swedish
2. **Few-shot sampling**: Sample just 1 example per class (60 total examples from 11,514 available)
3. **Model initialization**: Load a pre-trained multilingual embedding model
4. **Training**: The trainer generates sentence pairs and fine-tunes the model
5. **Evaluation**: Test accuracy on 2,974 unseen examples
6. **Prediction**: Classify new Swedish voice assistant commands

With just 60 examples total (1 per class), this model achieves meaningful accuracy on intent classification. Traditional approaches would need thousands of examples per class to achieve similar results.

## Why Few-Shot Learning Matters

Pre-trained Transformer models contain language understanding learned from billions of words. SetFit lets you leverage this knowledge and adapt it to your specific task with minimal labeled data.

You don't need massive datasets anymore. You need the right approach.

## Running Locally with GPU

Small language models like BERT are lightweight enough to run on consumer GPUs. Unlike massive language models, models like `modernbert-embed-base` require only a few gigabytes of GPU memory.

Training Transformer models needs GPU acceleration. Even with SetFit's efficiency, CPU training is slow and impractical. But small models run well on most modern GPUs.

Check your GPU availability:

```bash
# Verify NVIDIA GPU is detected
nvidia-smi

# For Macbook with Apple Silicon (M1/M2/M3/M4/M5)
# PyTorch will automatically detect and use MPS (Metal Performance Shaders)
```

If you have an NVIDIA GPU with CUDA support or a Macbook with Apple Silicon, PyTorch will use hardware acceleration automatically. Training on 60 examples takes seconds to minutes instead of hours on CPU.

### Local vs Cloud Development

Running locally gives you control. No session timeouts. No random disconnects. Work directly with local datasets. Your environment persists between sessions.

If you don't have local GPU access, Kaggle provides free GPU notebooks as an alternative.

### Alternative: Kaggle Notebooks

Kaggle offers free GPU access through their notebook environment. This requires phone verification to prevent abuse, but gives you a T4 GPU for training.

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

The workshop notebook is available on Kaggle with these dependencies pre-configured.

## Get Started with Few-Shot NLP

Tools like SetFit make it practical for real-world problems where labeled data is scarce.

Pre-trained models already understand language. You're teaching them your specific task, not language itself. This requires far less data than training from scratch.

Want to try it yourself? Clone the workshop repository and train your first few-shot classifier:

**Repository**: [github.com/krjoha/ai-lab-setfit](https://github.com/krjoha/ai-lab-setfit)

You can have a working text classifier running in under 10 minutes.

## NLP Consulting in Borås

This workshop was part of the AI Lab series at University of Borås, focused on practical AI and NLP for developers. I provide AI and data engineering consulting for businesses in Borås and throughout Sweden. If you need help implementing NLP solutions or want to explore few-shot learning for your use case, reach out.
