---
title: "Putnam 2017 A1"
pubDate: 2025-11-11
tags: ["Putnam", "Number Theory", "Logic", "Math Blog"]
description: "Our exploration of the 2017 Putnam A1 problem with Dr. Pragel — and how a simple modular idea connects everything beautifully."
---

This week I worked with **Dr. Pragel** on the 2017 **Putnam A1** problem, and we spent a good amount of time testing values, following patterns, and discussing what happens under squaring and shifting by 5.  
It turned into a beautiful example of how a small modular observation unlocks the entire problem.

---

## The Problem

> Let $S$ be the smallest set of positive integers such that
>
> 1. $2 \in S$  
> 2. if $n^2 \in S$ then $n \in S$  
> 3. if $n \in S$ then $(n+5)^2 \in S$
>
> Which positive integers are **not** in $S$?

---

## 1. A quick observation

From (2) and (3) we can chain the rules:

If $n \in S$, then $(n+5)^2 \in S$, and by (2) this gives $n+5 \in S$.

Hence

$$
n \in S \Rightarrow n+5 \in S,
$$

so every number in $S$ brings along all larger numbers with the same remainder mod 5.

---

## 2. Building the first chain

Starting with $2 \in S$:

$$
2 \in S \Rightarrow 7^2 = 49 \in S.
$$

Then again:

$$
49 \in S \Rightarrow (49 + 5)^2 = 54^2 \in S.
$$

Since $54 \equiv 4 \pmod{5}$, we get $54^2 \equiv 1 \pmod{5}$.

That means we already have **a number congruent to 1 mod 5** in $S$.  
Because $n \in S \Rightarrow n + 5 \in S$, all large numbers $\equiv 1 \pmod{5}$ are also in $S$.

---

## 3. Mathematical Insight — why any non-multiple of 5 enters $S$

Take any integer $a > 1$ with $5 \nmid a$ and look at the chain

$$
a,\; a^2,\; a^{4},\; a^{8},\; a^{16},\; \dots
$$

Each term is the square of the previous one (exactly the pattern allowed by rule (2)).

Modulo 5, there are only four non-zero residues, so these powers eventually repeat.  
By **Fermat’s Little Theorem**, $a^4 \equiv 1 \pmod{5}$, which means for some $k$ we get

$$
a^{2^k} \equiv 1 \pmod{5}.
$$

Since these powers grow without bound, choose $k$ large enough that $a^{2^k} \ge 54^2$.  
All sufficiently large integers $\equiv 1 \pmod{5}$ are already in $S$, so $a^{2^k} \in S$.

Now repeatedly apply rule (2) backwards:

$$
a^{2^k} \in S \Rightarrow a^{2^{k-1}} \in S \Rightarrow \dots \Rightarrow a^2 \in S \Rightarrow a \in S.
$$

Hence every integer $a>1$ not divisible by 5 must lie in $S$.

That’s the formal version of what Dr. Pragel and I explored by testing examples like  
$2 \to 49 \to 54^2 \to 59^2 \dots$ — we were empirically tracing the same idea.

---

## 4. Describing $S$

Let

$$
T = \{\, n \in \mathbb{Z}^+ : n > 1 \text{ and } 5 \nmid n \,\}.
$$

We can verify $T$ satisfies (1)–(3):

- $2 \in T$  
- if $n^2 \in T$, then $n > 1$ and $5 \nmid n$  
- if $n \in T$, then $n+5 > 1$ and $5 \nmid (n+5)$, so $(n+5)^2 \in T$

Thus $S = T$.

---

## Final Answer

The positive integers **not** in $S$ are

$$
1,\; 5,\; 10,\; 15,\; 20,\; \dots
$$

That is, **1 and all multiples of 5.**

---

*Written after a fun and insightful whiteboard session with Dr. Pragel — we started by chasing patterns and ended up with a clean modular-theoretic proof.*
