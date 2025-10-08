---
title: "How I Learned to Break Down Proofs (and Think Like a Mathematician)"
description: "Dr. Harmon’s advice helped me move beyond memorization and learn how to understand the structure of mathematical proofs."
pubDate: 2025-06-19
tags: [topology, proof-strategy, math-learning, compactness, real-analysis]
heroImage: '/blog-placeholder-3.jpg'
---

When I was studying for my topology exam, I got an email from Dr. Harmon that completely changed the way I approach mathematical proofs. I used to think that memorizing steps was the key, but his advice showed me how to *study the structure* of a proof.

That insight didn’t just help me on the exam — it helped me begin to think more like a mathematician.

---

## Dr. Harmon's Strategy for Studying Proofs

Here’s the advice he gave me, using the classic proof that the interval $[0,1]$ is compact as an example.

> **Overall strategy**: Proof by contradiction  
> • Form set of all numbers in $[0,1]$ that can be covered by finite subcover; note it's nonempty  
> • Nonempty subset of reals has supremum  
> • All reals up to supremum have finite subcover  
> • One more open set covers supremum  
> • If $\sup < 1$, this shows reals in $[0,1]$ greater than $\sup$ have finite subcover $\rightarrow$ contradiction  
> • Conclude $\sup = 1$ and interval is compact

This outline doesn’t just summarize the proof — it reveals its **plan**.

Once you see the structure, you're left with smaller subtasks: understand each bullet point and how they logically build on one another. Then, stitch them together — and you’ve reconstructed the proof.

---

## The Full Proof (Step-by-Step)

Let’s walk through the actual proof as written in the textbook, but guided by the outline Dr. Harmon provided:

1. **Start with an open cover**:  
   Let $\mathcal{A} = \{A_\alpha \mid \alpha \in \Lambda\}$ be an open cover of $[0,1]$.

2. **Define the set**  
   $$\Psi = \{x \in [0,1] : [0,x] \subseteq \bigcup_{i=1}^n A_{\alpha_i} \text{ for some finite subcollection}\}.$$  
   This is the set of all numbers in $[0,1]$ for which the interval $[0,x]$ can be covered by finitely many open sets from the cover.

3. **Show that $\Psi$ is nonempty**:  
   Since $0 \in [0,1]$, and some $A_\beta$ contains $0$, there’s a small interval around $0$ that can be covered.

4. **Let $t = \sup \Psi$**:  
   By completeness of $\mathbb{R}$, the supremum exists because $\Psi$ is bounded above.

5. **Reach toward a contradiction**:  
   Suppose $t < 1$. Since $A_\beta$ is open and contains $t$, there is some $\varepsilon > 0$ so that  
   $$(t - \varepsilon, t + \varepsilon) \subseteq A_\beta.$$

6. **Use this to expand the cover past $t$**:  
   Because of the openness and how $\Psi$ is defined, you can show that there’s an $x > t$ that also belongs to $\Psi$, contradicting the definition of $t$ as the least upper bound.

7. **Conclude**:  
   The only possibility is $t = 1$. So $[0,1]$ has a finite subcover — that means it is compact.

---

## Why This Changed My Approach to Math

Instead of treating proofs like a script to memorize, I now try to find their **architecture** — the core idea, the key turning point, and how each step fits into the whole.

This is especially powerful in topology, where intuition isn't always geometric, and where compactness often requires an abstract argument.

---

## Final Thoughts

If you're a student learning how to read and write proofs, start outlining like this. It’ll make the logic transparent and train your brain to focus on structure over syntax.

It’s one of the most valuable lessons I’ve learned in math so far — and I owe it to one helpful email from my professor.
