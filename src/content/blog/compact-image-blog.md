---
title: "The Image of Compact Sets: A Love Letter to Continuity"
description: "Exploring how continuous functions preserve compactness in topological spaces"
pubDate: 2026-01-19
tags: ["topology", "mathematics", "compactness", "continuity", "lean-series"]
series: "Learning Lean"
heroImage: '/image-compact-set.png'
seriesOrder: 3
---

When I [first discovered Lean](/blog/discovering-lean), I was captivated by the idea of machine-verified mathematics. In my [journey into Lean](/blog/a-mathematicians-journey-into-lean), I learned the basics of tactics and simple proofs. Now, I want to tackle something with real mathematical depth—a theorem from my point-set topology class that I took a year and a half ago.

We used an inquiry-based learning approach in that class, which I loved. We built mathematics together, one definition and proof at a time, eventually assembling our collective work into a short book. One theorem that's stayed with me is this beautiful result about how continuous functions preserve compactness. Let me share it with you, and in the next post, I'll show you how to formalize it in Lean.

## Setting the Stage: What is Compactness?

Before we dive into the main theorem, we need to understand what compactness means. The definition might seem technical at first, but it captures a surprisingly intuitive geometric idea.

**Cover and Subcover**: An indexing set $\Lambda$ gives us a way to label collections. A collection $\Phi = \{A_\alpha \mid \alpha \in \Lambda\}$ of sets is a *cover* of a set $Y$ if $Y \subseteq \bigcup_{\alpha\in\Lambda} A_\alpha$. In other words, if you throw all the sets in $\Phi$ together, they completely contain $Y$. Any subcollection that still manages to cover $Y$ is called a *subcover*.

**Open Cover**: In a topological space $(X,\mathcal{T})$, an open cover of $Y \subseteq X$ is simply a cover where every set $A_\alpha$ is an open set in $X$.

**Compactness**: Here's the key definition. A subset $K \subseteq X$ is *compact* if every open cover of $K$ has a finite subcover. 

Think about what this means: no matter how you try to cover $K$ with open sets—even if you use infinitely many of them—you can always find a finite subcollection that still does the job. This is a kind of "finiteness" property that generalizes our intuition about closed and bounded sets in Euclidean space.

## A Warmup: Closed Subsets of Compact Sets

Before tackling our main theorem, let's prove something useful: if $K$ is compact and $Y$ is a closed subset of $K$, then $Y$ is compact too.

**The Proof Idea**: We start with an arbitrary open cover $\Phi = \{A_\alpha \mid \alpha \in \Lambda\}$ of $Y$. Our goal is to show it has a finite subcover. Here's the trick: since $Y$ is closed, its complement $A = X \setminus Y$ is open. Notice that $A$ contains everything in $K$ that's not in $Y$, so we can write:

$$K \subseteq A \cup \left(\bigcup_{\alpha\in\Lambda} A_\alpha\right)$$

This means $\{A\} \cup \Phi$ is an open cover of $K$. Since $K$ is compact, this cover has a finite subcover, say $\{A, A_{\alpha_1}, \ldots, A_{\alpha_n}\}$. (Note: $A$ might not even be needed if the indexed sets already cover $K$.)

Now comes the punchline: $A$ doesn't intersect $Y$ at all (since $A$ is the complement of $Y$), so when we restrict back to $Y$, we get:

$$Y \subseteq \bigcup_{i=1}^n A_{\alpha_i}$$

Therefore $\{A_{\alpha_1}, \ldots, A_{\alpha_n}\}$ is a finite subcover of our original cover $\Phi$, proving $Y$ is compact.

## The Main Event: Continuous Functions Preserve Compactness

Now we're ready for the theorem that motivated this post:

**Theorem**: Let $(X,\mathcal{T})$ and $(Y,\mathcal{S})$ be topological spaces. If $f: X \to Y$ is continuous and $K \subseteq X$ is compact, then $f(K)$ is compact.

This is remarkable! Continuity is a local property—it's about what happens in neighborhoods around points. Compactness is a global property—it's about covers of entire sets. Yet continuous functions bridge these worlds: they take compact sets to compact sets.

**The Proof Strategy**: We need to show $f(K)$ is compact, which means starting with an arbitrary open cover of $f(K)$ and finding a finite subcover. Let $\Phi = \{A_\alpha \mid \alpha \in \Lambda\}$ be an open cover of $f(K)$. By definition:

$$f(K) \subseteq \bigcup_{\alpha\in\Lambda} A_\alpha$$

Taking preimages (and using the fact that $K \subseteq f^{-1}(f(K))$):

$$K \subseteq f^{-1}(f(K)) \subseteq f^{-1}\left(\bigcup_{\alpha\in\Lambda} A_\alpha\right) = \bigcup_{\alpha\in\Lambda} f^{-1}(A_\alpha)$$

Here's where continuity enters! Since $f$ is continuous, each $f^{-1}(A_\alpha)$ is open in $X$. This means $\{f^{-1}(A_\alpha) \mid \alpha \in \Lambda\}$ is an open cover of $K$.

By compactness of $K$, there exists a finite subcover $\{f^{-1}(A_{\alpha_1}), \ldots, f^{-1}(A_{\alpha_n})\}$ with:

$$K \subseteq \bigcup_{i=1}^n f^{-1}(A_{\alpha_i})$$

Applying $f$ to both sides and using the fact that $f(f^{-1}(A_{\alpha_i})) \subseteq A_{\alpha_i}$:

$$f(K) \subseteq f\left(\bigcup_{i=1}^n f^{-1}(A_{\alpha_i})\right) = \bigcup_{i=1}^n f(f^{-1}(A_{\alpha_i})) \subseteq \bigcup_{i=1}^n A_{\alpha_i}$$

Therefore $\{A_{\alpha_1}, \ldots, A_{\alpha_n}\}$ is a finite subcover of $\Phi$, proving $f(K)$ is compact!

## Why This Matters

This theorem is more than just a technical result. It tells us that compactness is a *topological invariant* under continuous maps. If you have a compact space and you continuously deform it, the image remains compact. This is why we can prove things like: the continuous image of $[0,1]$ is always compact, or the extreme value theorem (a continuous real-valued function on a compact set attains its maximum and minimum).

The proof itself is a beautiful dance between covers in the codomain and preimages in the domain, orchestrated by the continuity of $f$.

## Coming Up Next

In my [next post](/blog/lean-compact-proof), I'll show you how to formalize this exact proof in Lean. We'll see how the mathematical ideas we've explored translate into precise, machine-verified code. It's a natural next step in my Lean journey—moving from basic proofs to formalizing real mathematics from my coursework.

---

*This theorem appears in [the topology book my class wrote together](https://drive.google.com/file/d/143B-grbArIpM0bwPo2LmJJnCrVdFWXiG/view?usp=sharing). Special thanks to my professor and classmates for that collaborative mathematical journey.*

*This post is part of my series on learning Lean. Previous posts: [Discovering Lean](/blog/discovering-lean) | [A Mathematician's Journey into Lean](/blog/a-mathematicians-journey-into-lean)*