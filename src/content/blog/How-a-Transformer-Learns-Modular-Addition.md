---
title: "Grokking the Algorithm: How a Transformer Implements Modular Addition"
description: "Breaking down the geometric algorithm a transformer discovers when learning modular arithmetic — the first stop on a deeper dive into mechanistic interpretability."
pubDate: 2026-04-26
---

The part that really confused me was this expression:

$$
\cos(\omega(a+b-c))
$$

Why are we comparing against *all possible values of* $c$? And where do trigonometric identities even come into play?

Let me walk through how I finally understood it.

---

## The Setup

We're working modulo some number $P$. So the task is:

$$
a + b \mod P
$$

For example, if $P = 7$, then all values live in:

$$
\{0,1,2,3,4,5,6\}.
$$

At first, I thought maybe $a$ and $b$ could be arbitrary numbers like 24 or 67—but in the model, they're actually elements of this finite set.

---

## Step 1 — Numbers Become Angles

The model doesn't treat numbers as integers. Instead, it maps them to the unit circle:

$$
a \mapsto (\cos(\omega a), \sin(\omega a))
$$

where:

$$
\omega = \frac{2\pi}{P}.
$$

So each number corresponds to a point on a circle. This already hints at modular behavior, since angles naturally wrap around.

---

## Where I Got Stuck

I saw this part:

> "compare each candidate $c$ using $\cos(\omega(a+b-c))$"

And I thought:

- Why are we looping over all $c$?
- Where did this cosine come from?
- Is the model somehow testing every possible answer?

The answer is: **yes—it is.**

But that's not inefficient—it's exactly how transformers work.

---

## Step 2 — The Model Doesn't Output a Number

This was the key realization.

The model does **not** directly compute:

$$
c = a + b \mod P.
$$

Instead, it produces a **score for every possible output**:

$$
(\text{Logit}(0), \text{Logit}(1), \dots, \text{Logit}(P-1)).
$$

Then it picks the largest one.

So naturally, it must compare against every candidate $c$.

---

## Step 3 — Where Trigonometric Identities Show Up

This was the second big confusion.

We start with:

$$
(\cos(\omega a), \sin(\omega a)), \quad (\cos(\omega b), \sin(\omega b)).
$$

Now the model needs to combine them into something representing $a+b$.

But it doesn't know $a+b$ explicitly.

So how does it do it?

This is where the identities come in:

$$
\cos(x+y) = \cos x \cos y - \sin x \sin y
$$

$$
\sin(x+y) = \sin x \cos y + \cos x \sin y
$$

Using these, the model can construct a representation of $a+b$ in angle space:

$$
(\cos(\omega(a+b)), \sin(\omega(a+b))).
$$

This isn't the model adding numbers — it's constructing a new point on the circle that encodes their sum. The MLP weights effectively learn to implement these identities: given the embeddings of $a$ and $b$ separately, the nonlinear layers compute the products and linear combinations that produce this joint representation.

---

## Step 4 — Comparing Against Each Candidate

Now suppose the model has computed a vector representing $a+b$:

$$
v_{ab} = (\cos(\omega(a+b)), \sin(\omega(a+b))).
$$

Each candidate $c$ also has a representation. These come from the unembedding matrix — the same weight matrix used to project the residual stream back into vocabulary space provides a geometric vector for each possible output $c$:

$$
v_c = (\cos(\omega c), \sin(\omega c)).
$$

The model compares them using a dot product:

$$
v_{ab} \cdot v_c
$$

Expanding this:

$$
\cos(\omega(a+b))\cos(\omega c) + \sin(\omega(a+b))\sin(\omega c)
$$

Using another identity:

$$
\cos(x - y) = \cos x \cos y + \sin x \sin y
$$

this becomes:

$$
\cos(\omega(a+b-c)).
$$

So that's where the cosine comes from.

---

## Step 5 — Why This Picks the Correct Answer

Cosine is maximized when its argument is zero (mod $2\pi$):

$$
\cos(\theta) = 1 \quad \text{when } \theta \in 2\pi \mathbb{Z}.
$$

So:

$$
\cos(\omega(a+b-c))
$$

is maximized when:

$$
\omega(a+b-c) \in 2\pi \mathbb{Z}.
$$

Since:

$$
\omega = \frac{2\pi}{P},
$$

this becomes:

$$
a+b-c \in P\mathbb{Z},
$$

which means:

$$
a+b \equiv c \pmod P.
$$

So the correct $c$ gets the highest score.

---

## A Concrete Example

Let's take:

$$
P = 7, \quad a = 2, \quad b = 4.
$$

Then:

$$
a + b = 6 \mod 7.
$$

The model computes scores:

- $c = 6$: $\cos(0) = 1$ ← maximum  
- $c = 5$: $\cos(\omega)$ ≈ 0.62  
- $c = 4$: $\cos(2\omega)$ ≈ negative  

So it picks $c = 6$.

---

## The Final Picture

What's actually happening is:

$$
\text{numbers} \rightarrow \text{angles} \rightarrow \text{angle-space representation of sum} \rightarrow \text{comparison}
$$

The model:

1. maps numbers to points on a circle via the embedding matrix
2. uses the MLP to compute a representation of $a+b$ in that same space
3. compares the result against all possible outputs via the unembedding matrix
4. picks the closest match

---

## Why This Is So Interesting

The model didn't memorize addition.

It discovered a representation where:

- modular arithmetic becomes geometry  
- addition becomes rotation  
- equality becomes alignment  

In other words, it learned structure—not just answers.

This post covers the algorithm itself. The deeper question — *why* the model discovers this structure through training, and what the grokking phase transition has to do with it — is where things get even more interesting. That's coming next.

---

## The Moment It Clicked

The key realization for me was:

> The model isn't solving for $c$.  
> It's asking: *which $c$ looks most like my computed result?*

Once I saw that, everything else fell into place.
