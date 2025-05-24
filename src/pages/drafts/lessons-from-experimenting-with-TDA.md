---
title: "Lessons from Experimenting with TDA: Datasets, Diagrams, and Dead Ends"
pubDate: "2025-05-20"
description: "From Iris to Swiss Rolls, this post documents the process of building a topological data analysis pipeline—complete with setbacks, insights, and learnings."
heroImage: "/blog-placeholder-5.jpg"
---

## Why I Explored Topological Data Analysis

This summer, I set out to learn topological data analysis (TDA) as a way to extract structure from data using tools from algebraic topology. My long-term goal is to study pure mathematics and its connection to data and physics, but I wanted to build practical intuition. What started as a research project on the Iris dataset quickly expanded into a larger investigation: what kinds of data actually yield meaningful topological features? What preparation steps matter most? And how do you get from persistent diagrams to machine learning?

## Datasets I Tried (and Why)

### 1. Iris Dataset

A classic low-dimensional dataset with 4 features. I tried both:

- **PCA-reduced point clouds**
- **Full 4D distance matrices**

It helped me understand how dimensionality reduction can affect topology.

```python
from sklearn.decomposition import PCA
from ripser import ripser

# PCA approach
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X)
diagrams_pca = ripser(X_pca)['dgms']

# Distance matrix approach
from scipy.spatial.distance import pdist, squareform
X_dist = squareform(pdist(X))
diagrams_dist = ripser(X_dist, distance_matrix=True)['dgms']
```

### 2. Noisy Circle

I used `make_circles` to generate synthetic data with a clear loop ($H_1$ feature). This dataset acted as a sanity check: could persistent homology detect a simple loop? Yes—and beautifully. 

```python
from sklearn.datasets import make_circles
X, _ = make_circles(n_samples=300, factor=0.5, noise=0.05)
from ripser import ripser
diagrams = ripser(X)['dgms']
```

![Persistence diagram visualization with growing balls](/images/noisy-circle-data.png)

*Figure: A clean H₁ loop emerges clearly in the persistence diagram from noisy circular data. with a clear loop (H₁ feature). This dataset acted as a sanity check: could persistent homology detect a simple loop? Yes—and beautifully.*