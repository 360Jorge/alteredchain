---
title: "Teaching a Simple Group-Theory Theorem to Lean (with a Little AI Help)"
description: "Using Lean to formalize the fact that the kernel of a group homomorphism is normal, starting from a proof I already understand."
pubDate: "2026-01-01"
---

## The theorem

Let $$\varphi : G \to H$$ be a group homomorphism between groups.  
The **kernel** of $$\varphi$$ is

$$
\ker \varphi = \{ g \in G : \varphi(g) = e_H \}.
$$

I’ve known this theorem for a while; it’s one of those facts that becomes “obvious” after a first group theory course.  
This time, I wanted to see what it takes to teach it to a proof assistant — Lean 4 — and how AI can help along the way.

---

## Human proof (the way I understand it)

**Theorem.**  
Let $$\varphi : G \to H$$ be a group homomorphism. Then $$\ker \varphi$$ is a normal subgroup of $$G$$.

**Proof.**

1. **Subgroup.**
   - Identity: $$\varphi(e_G) = e_H \Rightarrow e_G \in \ker\varphi$$.
   - Closed under products:
     $$
     \varphi(a)=e_H,\ \varphi(b)=e_H
     \quad\Rightarrow\quad
     \varphi(ab) = \varphi(a)\varphi(b) = e_H e_H = e_H.
     $$
   - Closed under inverses:
     $$
     \varphi(a)=e_H
     \quad\Rightarrow\quad
     \varphi(a^{-1}) = \varphi(a)^{-1} = e_H^{-1}=e_H.
     $$

2. **Normality.**
   Take $$g\in G$$ and $$k\in\ker\varphi$$. Then

   $$
   \varphi(gkg^{-1})
   = \varphi(g)\varphi(k)\varphi(g^{-1})
   = \varphi(g)e_H\varphi(g)^{-1}
   = \varphi(g)\varphi(g)^{-1}
   = e_H.
   $$

   So $$gkg^{-1}\in\ker\varphi$$, and thus $$\ker\varphi$$ is normal.  
   $$\square$$

This is the mental model I want Lean to understand.

---

## Setting it up in Lean

First, I told Lean what context we are in:

```lean
import Mathlib/Algebra/Group/Hom
import Mathlib/GroupTheory/Subgroup/Basic

variable {G H : Type*} [Group G] [Group H]

variable (φ : G →* H)
