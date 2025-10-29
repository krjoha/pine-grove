---
title_seo: "Intro to Machine Learning: Key Takeaways from Tech Borås Developer Workshop"
title: "Getting Started with Machine Learning: Tech Borås Workshop Summary"
date: 2025-10-29T15:00:00+01:00
lastmod: 2025-10-29T15:00:00+01:00
draft: false
author: "Kristoffer Johansson"
authorLink: "https://www.linkedin.com/in/kristoffer-johansson/"
description: "Learn machine learning fundamentals from our Tech Borås workshop. Get started with Kaggle's intro course, understand pattern recognition, and discover why data is your most valuable asset."
summary: "A practical guide to getting started with machine learning, based on our successful workshop at Tech Borås for developers."
images: []

lightgallery: false
toc:
    enable: true
---

Machine learning doesn't have to be intimidating. At our recent "Intro to Machine Learning" workshop at Tech Borås, we showed developers the simplest path to get started and the fundamental concepts that matter most. <!--more-->

This post shares that path and those key concepts, so you can begin your ML journey today.

## Your First Steps with Kaggle

The workshop recommended Kaggle as the best place to start learning machine learning. Kaggle provides interactive courses where you code directly in your browser. No setup required.

Follow these steps:

1. Register for a free account at [kaggle.com](https://www.kaggle.com)
2. Navigate to the "Learn" section
3. Select the **"Intro to Machine Learning"** course
4. Start coding directly in the browser

Direct link: [https://www.kaggle.com/learn/intro-to-machine-learning](https://www.kaggle.com/learn/intro-to-machine-learning)

The course uses Python and walks you through building your first predictive model. You'll learn by doing, which is the fastest way to understand ML concepts.

## Code Example: Your First Model

Here's what you'll build in the first lessons. This example loads housing data and creates a decision tree model to predict home prices:

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

This code demonstrates the core ML workflow: load data, select features, train a model, make predictions. The Kaggle course explains each step in detail.

## Key Concepts from the Workshop

These are the fundamental insights every developer needs to understand about machine learning.

### Machine Learning is Pattern Recognition

At its core, ML uses algorithms to find patterns in historical data. You feed the algorithm examples, and it learns to recognize patterns that can be applied to new, unseen data.

This is different from traditional programming, where you explicitly write the rules. In ML, the algorithm discovers the rules from data.

### The Core Assumption: History Applies to the Future

ML models operate on a critical assumption: **the patterns in your historical data will apply to future data**.

If the underlying patterns change, your model will fail. This is why ML works well for stable domains (predicting house prices, detecting spam) but struggles in rapidly changing environments.

Understanding this assumption helps you identify where ML will work and where it won't.

### Evaluation is Everything

You must **always evaluate your model on unseen data**. This is non-negotiable.

If you train a model on data and test it on the same data, you're measuring how well the model memorized, not how well it predicts. Use a validation or test set to measure real performance.

A model that performs well on training data but poorly on new data is useless.

## Hype vs. Reality: AI, ML, and Data

The workshop addressed the gap between the current AI hype and practical reality.

### Artificial Intelligence is Often Hype

AI is a powerful field, but the current buzz is high. For most businesses, practical supervised machine learning is more relevant than chasing the latest AI trends.

The reality: AI is often **unprofitable for most companies** and is currently heavily subsidized by venture capital. Focus on solving real problems with proven techniques before chasing hype.

### Data is Still Gold

The real value and the hardest part of machine learning is acquiring and cleaning good data.

A unique, high-quality dataset is what **builds a competitive moat**, not just the model itself. Anyone can train a model. Few have unique, valuable data.

Invest in your data infrastructure and data quality. That's where sustainable competitive advantage lives.

## Start Your Journey

Machine learning is accessible. Start with the [Kaggle Intro to Machine Learning course](https://www.kaggle.com/learn/intro-to-machine-learning), understand that ML is pattern recognition, and remember that your data is your most valuable asset.

The workshop showed that you don't need a PhD to start using ML. You need curiosity, a willingness to learn by doing, and an understanding of the fundamentals.

Get started today.
