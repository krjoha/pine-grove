---
title_seo: "Machine Learning Workshop Borås: Practical AI Guide for Developers"
title: "Machine Learning Workshop in Borås"
date: 2025-08-29T15:00:00+01:00
lastmod: 2025-08-29T15:00:00+01:00
draft: false
author: "Kristoffer Johansson"
authorLink: "https://www.linkedin.com/in/kristoffer-johansson/"
description: "Practical machine learning insights from our developer workshop at University of Borås. Learn ML fundamentals, understand AI hype vs. reality, and start building with Python. Expert ML consulting in Borås."
summary: "Key takeaways from our hands-on machine learning workshop at University of Borås. Cut through the AI hype and learn practical ML techniques for developers."
images: []

lightgallery: false
toc:
    enable: true
---

On August 26, I ran the first of three workshops at the University of Borås. The objective was to introduce 25 developers to machine learning and have them build a bunch of models while avoiding common pitfalls. <!--more-->

{{< image src="tech-boras-workshop-1.webp" caption="Machine learning workshop at University of Borås, August 26" >}}

If you missed it, this post covers the material used, a recommended learning path, and some words about the current AI hype bubble.

## Getting Started with Machine Learning using Kaggle

To get started in an online Python environment without local setup, Kaggle is a solid choice. It provides interactive courses where you write code directly in the browser. No installation, no configuration.

Here's how to begin:

1. Create a free account at [kaggle.com](https://www.kaggle.com)
2. Go to the "Learn" section
3. Start the **"Intro to Machine Learning"** course
4. Write code, run it, see results

Direct link: [https://www.kaggle.com/learn/intro-to-machine-learning](https://www.kaggle.com/learn/intro-to-machine-learning)

The course uses Python and scikit-learn to build predictive models. You learn by doing, which beats reading theory.

## Code Example: Your First Machine Learning Model

The Kaggle course walks through building a simple predictive model. Here's one example: loading housing data and training a decision tree to predict home prices.

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

This demonstrates the basic ML workflow: load data, select features, train a model, make predictions. The Kaggle course breaks down each step.

## Key Concepts from the Workshop

These are the fundamental insights that we disussed during the workshop. If you understand these, you're ahead of most people talking about AI.

### Machine Learning is Pattern Recognition

ML algorithms find patterns in historical data. You feed them examples, and they learn to recognize patterns that apply to new, unseen data. This differs from traditional programming, where you write explicit rules. In ML, the algorithm discovers the rules from data.

### History Repeats itself

ML models rely on one important assumption: 

{{< admonition tip "Assumption" >}}
The patterns in your historical data will apply to future data.
{{< /admonition >}}

When the underlying patterns change, your model fails. ML works well for stable domains like predicting house prices or detecting spam. It struggles in rapidly changing environments. It is not magic.

{{< admonition warning "Critical Rule" >}}
Always evaluate your model on unseen data. No exceptions.

{{< /admonition >}}

Train on data and test on the same data? You're measuring memorization, not prediction. Use a test set to measure real performance. A model that performs well on training data but fails on new data is worthless.

### AI is Overrated

AI is powerful, but the current buzz outpaces reality. For most businesses, practical supervised machine learning solves more problems than chasing the latest AI trends.

{{< admonition note "The hype bubble" >}}
AI is **unprofitable for most companies** and heavily subsidized by venture capital. Focus on solving real problems with proven techniques first.
{{< /admonition >}}

### Data is Your Moat

The real value in machine learning is data. Acquiring and cleaning good data is the hardest part.

{{< admonition success "Competitive Advantage" >}}
A unique, high-quality dataset **builds a competitive moat**. Anyone can train a model. Few companies have unique, valuable data.
{{< /admonition >}}

Invest in data infrastructure and data quality. That's where sustainable competitive advantage lives.

{{< image src="participants.webp" caption="Participants working through hands-on ML exercises" >}}

## Machine Learning Consulting in Borås

This workshop was the first in a series at University of Borås focused on practical AI and machine learning for developers. I provide AI and data engineering consulting for businesses in Borås and throughout Sweden. If you need help implementing machine learning solutions or want to cut through the AI hype to find what actually works for your business, reach out.
