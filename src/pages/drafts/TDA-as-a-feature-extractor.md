---
title: "TDA as a Feature Extractor"
pubDate: 2026-01-22
description: "For the third time in human history, astronomers have spotted an object that doesn’t belong to our Solar System. Meet 3I/ATLAS — an icy traveler from beyond the stars."
tags: [astronomy, physics, math, interstellar, science]
heroImage: '/blog-placeholder-5.jpg'
---

```mermaid
flowchart LR
  A[MNIST Image 28x28] --> B[Flatten Pixels (784 features)]
  B --> C[ML Model<br/>LogReg / SVM / Random Forest]
  C --> D[Predicted Digit]
```

```mermaid
flowchart LR
  A[MNIST Image 28x28] --> P[Preprocessing<br/>Normalize + Binarize (0.40)]
  P --> F[Filtrations<br/>Grayscale / Height / Radial / Density / ...]
  F --> PD[Persistence Diagrams<br/>H0 and H1]
  PD --> V[Vectorization<br/>Persistent Entropy + Amplitudes]
  V --> X[Topological Feature Vector<br/>(e.g. 728 features)]
  X --> S[Feature Selection<br/>Decorrelate + Rank]
  S --> C[ML Model<br/>Random Forest / LogReg]
  C --> D[Predicted Digit]
```

```mermaid
flowchart TB
  subgraph Standard ML
    A1[Image] --> B1[Pixels] --> C1[Classifier] --> D1[Digit]
  end

  subgraph TDA Pipeline (Paper)
    A2[Image] --> B2[Filtrations] --> C2[Persistence Diagrams] --> D2[TDA Features] --> E2[Classifier] --> F2[Digit]
  end
```