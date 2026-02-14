---
title: "Why a Basis Needs Both Spanning and Independence"
description: "Coordinates must exist and must be unique. That’s why bases require spanning and linear independence."
pubDate: 2026-02-09
---

In the last post, we saw the core idea:

> A basis is a coordinate system — a measuring grid for vectors.

But that raises an obvious question.

If a basis is “just a set of vectors,” why do we need that *specific* definition?
Why insist on **spanning** and **linear independence**?

Because coordinates are only useful if they satisfy two requirements:

1. **Existence:** every vector you care about must be describable using the grid  
2. **Uniqueness:** every vector must have exactly one description  

Spanning gives you existence.  
Independence gives you uniqueness.

And if you drop either one, coordinates stop behaving like coordinates.

---

## Failure mode 1: no spanning → some vectors have no coordinates

Suppose you try to build a coordinate system in $\mathbb{R}^2$ using only one vector, say $b_1$.

Then the only vectors you can describe are multiples of $b_1$.

That set is the span:

$$
\text{Span}\{b_1\} = \{\alpha b_1 : \alpha \in \mathbb{R}\}.
$$

Geometrically, this is just a line through the origin.

So if $x$ is not on that line, there is no scalar $\alpha$ such that $x = \alpha b_1$.
In that case, $x$ has **no coordinates** in your “system.”

This is why spanning matters:

> If your set doesn’t span the space, your “grid” doesn’t cover the space.

Coordinates can’t exist for all vectors.

---

## Failure mode 2: no independence → some vectors have multiple coordinates

Now suppose you try to build a coordinate system in $\mathbb{R}^2$ using *three* vectors:

$$
b_1 = \begin{bmatrix}3\\1\end{bmatrix}, \quad
b_2 = \begin{bmatrix}1\\2\end{bmatrix}, \quad
b_3 = \begin{bmatrix}2\\0\end{bmatrix}.
$$

Here is the problem: these vectors are not linearly independent.
And the consequence is immediate:

A vector can have **more than one coordinate description**.

In fact, the notes give an explicit example for

$$
x = \begin{bmatrix}7\\4\end{bmatrix}
$$

where $x$ can be written in two different ways:

$$
x = -2b_1 + 3b_2 + 5b_3
\quad\text{and}\quad
x = 6b_1 - b_2 + 5b_3.
$$

So what are the coordinates of $x$?

Should they be

$$
\begin{bmatrix}-2\\3\\5\end{bmatrix}
\quad\text{or}\quad
\begin{bmatrix}6\\-1\\5\end{bmatrix} \, ?
$$

There is no correct answer — because “coordinates” are no longer well-defined.

This is why independence matters:

> If your set is dependent, your grid assigns **multiple addresses** to the same point.

Coordinates lose uniqueness.

---

## The definition of basis is forced

The two failures above explain why a basis must satisfy exactly two conditions.

Let $S$ be a subspace of $\mathbb{R}^n$. A set $\{b_1,\dots,b_s\}$ is a basis for $S$ if:

1. $$\text{Span}\{b_1,\dots,b_s\} = S$$
2. $$b_1,\dots,b_s \text{ are linearly independent}$$

Spanning ensures every vector in $S$ has coordinates.  
Independence ensures those coordinates are unique.

So the definition isn’t a random textbook ritual.

It’s the minimal structure needed for “coordinate system” to mean anything.

---

## A one-sentence takeaway

A basis is the kind of spanning set that makes coordinates **exist** and **mean something**.

- No spanning → you can’t reach everything  
- No independence → you can’t label anything uniquely  

---

### What’s next

Now that coordinates exist and are unique, we can talk about the object that packages them:

**the coordinate vector** $[x]_B$.

That’s where “change of basis” becomes something you can compute.
