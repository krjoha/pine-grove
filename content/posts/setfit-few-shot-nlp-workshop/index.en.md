---
title_seo: "SetFit Few-Shot Learning Tutorial: Advanced NLP with Minimal Data | Tech Borås AI Lab"
title: "Powerful NLP with SetFit and Few-Shot Learning"
date: 2025-11-03T15:00:00+01:00
lastmod: 2025-11-03T15:00:00+01:00
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

On October 28, I ran the second workshop in the AI Lab series at Tech Borås / University of Borås. We tackled a common business problem: how to build accurate text classification models when you have limited labeled data. <!--more-->

If you missed it, this post covers how modern NLP tools like SetFit make few-shot learning practical, and includes working code you can run today.

## The Challenge: Limited Training Data

Text classification solves real business problems. Sort support tickets by priority. Detect spam. Route customer inquiries to the right department. Analyze sentiment in product reviews.

The traditional approach requires thousands of labeled examples. You need someone to manually tag "spam" or "not spam" for 5,000+ emails before training begins. This is expensive and slow.

The core problem: **you need massive amounts of labeled data**, but labeling is manual, tedious work. Most organizations don't have thousands of pre-labeled examples sitting around.

## How Transformers Changed NLP

Transformer models like BERT revolutionized natural language processing by understanding word context. Unlike older methods that treat words as isolated tokens, BERT captures meaning based on surrounding words.

Consider these sentences:
- "He biked to work."
- "He drove his car to work."
- "Peter decided to take his bike to the beach."

BERT understands that "biked" and "bike" relate to the same concept, while "drove his car" represents a different mode of transport. This contextual understanding is what makes modern NLP powerful.

### The Problem with Similarity

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

SetFit combines pre-trained Transformer models with efficient fine-tuning. The breakthrough: you can achieve high accuracy with just 8-16 labeled examples per class.

SetFit works in two stages:

1. **Contrastive learning**: Train on sentence pairs to learn which examples are similar and which are different
2. **Classification head**: Train a simple classifier on top of the learned embeddings

This approach leverages the knowledge already baked into pre-trained models. You're not teaching the model language from scratch. You're teaching it your specific classification task using the language understanding it already has.

The result: production-ready text classifiers trained on a fraction of the data traditional methods require.

## Code Example: Training a SetFit Classifier

This example is based on the workshop repository: [github.com/krjoha/ai-lab-setfit](https://github.com/krjoha/ai-lab-setfit)

The full notebook demonstrates the complete workflow. Here's the core implementation:

### Installation

```bash
pip install setfit datasets
```

### Complete Training Pipeline

```python
from datasets import Dataset
from setfit import SetFitModel, SetFitTrainer

# Create a small training dataset
# In production, this would be your labeled examples
train_data = {
    "text": [
        "This product is amazing!",
        "Terrible quality, broke after one day",
        "Love it, exactly what I needed",
        "Waste of money, very disappointed",
        "Excellent purchase, highly recommend",
        "Poor design, doesn't work as advertised",
        "Best purchase I've made this year",
        "Cheap materials, fell apart quickly",
        "Fantastic quality and fast shipping",
        "Regret buying this, total letdown",
        "Exceeded my expectations",
        "Not worth the price at all",
        "Great value for money",
        "Defective product, requesting refund",
        "Works perfectly, very satisfied",
        "Complete garbage, avoid this product"
    ],
    "label": [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]  # 1 = positive, 0 = negative
}

train_dataset = Dataset.from_dict(train_data)

# Initialize the model
# Using a multilingual model that works for both English and Swedish
model = SetFitModel.from_pretrained(
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)

# Initialize the trainer
trainer = SetFitTrainer(
    model=model,
    train_dataset=train_dataset,
    num_iterations=20,  # Number of text pairs to generate
    num_epochs=1
)

# Train the model
trainer.train()

# Make predictions on new text
predictions = model.predict([
    "This is the best thing ever!",
    "Absolutely horrible experience",
    "Pretty good, would buy again"
])

print(predictions)
# Output: array([1, 0, 1])  # positive, negative, positive
```

### What This Code Does

1. **Dataset creation**: We create a simple dataset with 16 labeled examples (8 positive, 8 negative)
2. **Model initialization**: Load a pre-trained multilingual Transformer model
3. **Trainer setup**: Configure the SetFit trainer with our small dataset
4. **Training**: The trainer generates sentence pairs and fine-tunes the model
5. **Prediction**: Classify new, unseen text

With just 16 examples total, this model can accurately classify sentiment. Traditional approaches would need thousands of examples to achieve similar accuracy.

## Key Takeaways

### From Big Data to Few-Shot Learning

The paradigm has shifted. Pre-trained Transformer models contain language understanding learned from billions of words. SetFit lets you leverage this knowledge and adapt it to your specific task with minimal labeled data.

You don't need massive datasets anymore. You need the right approach.

### GPU Acceleration is Essential

Training Transformer models requires GPU acceleration. Even with SetFit's efficiency, CPU training is impractical. The workshop used online notebook environments with GPU access (Google Colab, Kaggle) to make training feasible.

Modern cloud platforms provide GPU access at reasonable cost. This makes advanced NLP accessible to smaller teams and projects.

### Modern Development Workflow

The workshop emphasized practical tools:
- **Online notebooks** (Colab, Kaggle) for GPU-accelerated experimentation
- **Hugging Face ecosystem** for pre-trained models and datasets
- **Modern IDEs** (VS Code with AI assistants) for production code

These tools lower the barrier to entry. You can go from idea to working classifier in minutes, not months.

## Conclusion

Modern NLP with Transformer models is powerful. Tools like SetFit make it practical for real-world problems where labeled data is scarce.

The core insight: pre-trained models already understand language. You're teaching them your specific task, not language itself. This requires far less data than training from scratch.

Want to try it yourself? Clone the workshop repository and train your first few-shot classifier:

**Repository**: [github.com/krjoha/ai-lab-setfit](https://github.com/krjoha/ai-lab-setfit)

You can have a working text classifier running in under 10 minutes.

## NLP Consulting in Borås

This workshop was part of the AI Lab series at University of Borås, focused on practical AI and NLP for developers. I provide AI and data engineering consulting for businesses in Borås and throughout Sweden. If you need help implementing NLP solutions or want to explore few-shot learning for your use case, reach out.
