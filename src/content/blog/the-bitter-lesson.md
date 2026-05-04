---
title: "The Bitter Lesson, Explained"
description: "Rich Sutton wrote a 1000-word essay in 2019 that described the last 70 years of AI research. It gets more relevant every year. Here's what it actually says."
pubDate: 2026-05-04
tags: ["ai", "machine-learning", "explainer"]
---

*Rich Sutton wrote a 1000-word essay in 2019 that described the last 70 years of AI research. It gets more relevant every year. Here's what it actually says.*

---

## The Pattern

In 1997, Deep Blue defeated Garry Kasparov at chess. It was treated as a triumph of AI. What people glossed over was *how* it won.

Deep Blue didn't win because its designers encoded grandmaster knowledge — positional principles, opening theory, endgame technique. Earlier chess programs had tried that. They worked reasonably well, but they plateaued. Deep Blue won because it used a relatively simple search algorithm and threw enormous amounts of specialized hardware at it. More compute, deeper search, better play. No chess wisdom required.

The same story played out in speech recognition. Researchers spent years building systems that encoded phonological structure — the rules governing how sounds combine in human language. Linguistically principled, carefully designed. Then systems using large neural networks trained on raw audio data overtook them. The neural networks weren't told anything about phonology. They just had more compute and more data.

And again in computer vision. Hand-crafted feature detectors like SIFT and HOG, built on careful human understanding of how images work, gave way to convolutional networks that learned their own features from scratch.

Richard Sutton looked at this pattern across 70 years of AI research and named it: **the bitter lesson**.

---

## What the Lesson Actually Says

The lesson is this: general methods that scale with computation consistently outperform methods that encode human domain knowledge. Not sometimes. Not in narrow cases. Consistently, and by a large margin.

The word "general" is doing a lot of work here. A general method is one that makes almost no assumptions about the problem domain. It doesn't know it's playing chess, or recognizing speech, or parsing images. It's a mechanism that, given data and compute, finds whatever structure actually exists in the problem — including structure the designers never thought to look for.

Sutton identifies two such methods: **search** and **learning**.

Search means exploring a space of possibilities without being told what good looks like in domain-specific terms. Alpha-beta search in chess doesn't know what a strong position looks like the way a grandmaster does. It just looks further ahead than any human can, evaluates leaf nodes, and propagates values back up the tree. The domain knowledge is minimal. The compute does the work.

Learning — gradient descent on a flexible model — means finding regularities in data without being told what regularities to expect. You give the model inputs and correct outputs. It adjusts its internal parameters to reduce the gap between its predictions and the truth. Repeat millions of times. What emerges is a system that has found structure in the data that nobody specified in advance.

---

## The Computation Asymmetry

Here's why this matters beyond just an observation about research taste.

Computation has been falling in cost exponentially for decades — Moore's Law and its successors. A method that genuinely gets better with more compute receives a free performance improvement every few years just from hardware progress. A method that doesn't leverage compute gets nothing from that trend. Its ceiling is set at design time, by whoever built it.

This asymmetry is what made the bitter lesson so decisive over 70 years. Researchers who invested in hand-crafted domain knowledge were building on a fixed budget. Researchers who built general scalable methods were building on an exponentially growing one.

In the short run, the hand-crafted system often wins. It has a head start — the designer's expertise is immediately useful. But over time, the scalable method catches up, overtakes it, and keeps going while the hand-crafted system stalls.

The lesson is *bitter* precisely because the researchers encoding domain knowledge weren't being careless. They were being thoughtful and rigorous. Their careful work kept losing to the dumber, more scalable approach. That's the sting.

---

## What "Leveraging Computation" Actually Produces

When a general method like gradient descent runs long enough on enough data, what does it produce?

It produces **representations** — internal encodings of the input that the network found useful for solving the task. Nobody designed these. The optimizer stumbled into them because they were the most efficient way to minimize the loss.

The classic example: word embedding models trained on raw text learn that the vector arithmetic *king − man + woman ≈ queen* holds in their internal geometry. No one told the model about gender as a semantic dimension. Gradient descent found it because that structure was useful for predicting text.

This is the deeper point in Sutton's essay. The actual contents of minds — the concepts, relationships, and structures that constitute knowledge — are far more complex than anything we could design by hand. The right move isn't to encode our understanding of that complexity. It's to build methods general enough to discover the complexity on their own.

We want systems that can *discover* like we can, not systems that *contain* what we've already discovered.

---

## Where We Are Now

This is exactly what's happening with large language models.

Scaling laws — formalized by Kaplan et al. in 2020 — showed that model performance improves as a smooth power law with compute, parameters, and data. There's no cliff where the approach breaks down. Give the optimizer more room and it finds richer representations. The curve keeps going.

Some capabilities don't scale smoothly — they appear suddenly at certain compute thresholds. Arithmetic, chain-of-thought reasoning, in-context learning. The model seems to lack a capability, crosses some threshold, and then has it. These *emergent capabilities* weren't designed in. They crystallized out of the learned representations once those representations became rich enough.

Nobody hand-crafted these. Gradient descent found them.

---

## The Open Question

This leaves a natural question. If general methods keep finding structure that humans wouldn't have designed — what exactly did they find?

The representations inside large neural networks are not transparent. The network can't tell you what it learned or why. The structure is real — you can see it in the behavior — but it's encoded in billions of floating point numbers arranged in ways we don't yet understand.

This is, at the smallest possible scale, what the grokking phenomenon illustrates. Train a small network on modular arithmetic — a simple mathematical task. Initially it memorizes: it gets the training examples right but fails on anything new. Then, after much longer training, something shifts. A phase transition. The network suddenly generalizes perfectly.

Post-transition, the network has discovered Fourier features — periodic structure arranged geometrically, encoding the modular arithmetic in a compressed and generalizable form. The optimizer found this. Nobody put it there.

The Bitter Lesson at macro scale. Grokking at micro scale. The same story: general methods, given enough compute, find structure humans wouldn't have designed.

The question now is what exactly that structure is. Reading it back out — reverse-engineering what gradient descent found — is the central problem in mechanistic interpretability research. And it's arguably the most important open question in understanding what these systems actually are.

---

*Further reading: Sutton's original essay is at [incompleteideas.net](http://incompleteideas.net/IncIdeas/BitterLesson.html). The grokking paper is Nanda et al., "Progress and Generalization in Grokking" (2023). Kaplan et al., "Scaling Laws for Neural Language Models" (2020).*
