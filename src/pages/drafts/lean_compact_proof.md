---
title: "Formalizing Compactness in Lean: From Paper to Proof Assistant"
description: "Translating the continuous image of compact sets theorem into Lean 4"
pubDate: 2026-01-20
tags: ["topology", "mathematics", "lean", "formal-verification", "compactness"]
---

In my [previous post](/blog/compact-image-theorem), we explored the beautiful theorem that continuous functions preserve compactness. We worked through the proof on paper, understanding how covers in the codomain pull back to covers in the domain. Now, let's see what happens when we formalize this mathematics in Lean 4, a proof assistant that verifies our reasoning is completely rigorous.

## Why Formalize Mathematics?

Before we dive in, you might wonder: why bother translating a perfectly good paper proof into code? Here are a few reasons:

- **Absolute certainty**: Lean checks every single step. No gaps, no "clearly we can see", no hidden assumptions.
- **Learning through precision**: Formalizing forces you to understand every detail of a proof.
- **Building on solid foundations**: Once formalized, theorems become building blocks for more complex results, with machine-verified correctness.
- **It's actually fun**: There's something deeply satisfying about getting Lean to accept your proof.

## The Lean Landscape: What's Already There?

One of the beautiful things about Lean is its extensive mathematics library, Mathlib. Let's see what's already formalized that we can use:

```lean
import Mathlib.Topology.Basic
import Mathlib.Topology.Compactness.Compact

-- Topological spaces are already defined
#check TopologicalSpace

-- Continuity is defined
#check Continuous

-- Compactness is defined
#check IsCompact

-- Key lemmas we'll need
#check IsCompact.image  -- This is actually our theorem!
```

Wait—our theorem is already in Mathlib! It's called `IsCompact.image`. But that's perfect for our purposes: we can see how the experts did it, and we can write our own version to understand the process.

## Setting Up Our Proof

Let's start by stating the theorem in Lean. We'll write our own version alongside the library version:

```lean
import Mathlib.Topology.Basic
import Mathlib.Topology.Compactness.Compact

-- Our theorem statement
theorem continuous_image_of_compact
  {X Y : Type*} [TopologicalSpace X] [TopologicalSpace Y]
  (f : X → Y) (hf : Continuous f)
  (K : Set X) (hK : IsCompact K) :
  IsCompact (f '' K) := by
  sorry
```

Let's break down this statement:

- `{X Y : Type*}`: We have two types $X$ and $Y$ (our underlying sets)
- `[TopologicalSpace X] [TopologicalSpace Y]`: Both are equipped with topological structures (these are *instances* in Lean)
- `f : X → Y`: A function from $X$ to $Y$
- `hf : Continuous f`: A proof (hypothesis) that $f$ is continuous
- `K : Set X`: A subset $K$ of $X$
- `hK : IsCompact K`: A proof that $K$ is compact
- `IsCompact (f '' K)`: The conclusion that the image $f(K)$ is compact

The `f '' K` notation means the image of $K$ under $f$, which is Lean's way of writing $f(K)$.

## Understanding Compactness in Lean

In Mathlib, `IsCompact` is defined in terms of filters, which is more general than the open cover definition. But there's an equivalent characterization using open covers:

```lean
-- The open cover characterization
theorem isCompact_iff_finite_subcover {X : Type*} [TopologicalSpace X] (K : Set X) :
  IsCompact K ↔ 
  ∀ {ι : Type*} (U : ι → Set X), 
    (∀ i, IsOpen (U i)) → 
    (K ⊆ ⋃ i, U i) → 
    ∃ (t : Finset ι), K ⊆ ⋃ i ∈ t, U i
```

This says: $K$ is compact if and only if every open cover has a finite subcover. The `ι` is our indexing set, `U : ι → Set X` is our family of open sets, and `Finset ι` is a finite subset of the indices.

## Building the Proof: The Strategy

Our paper proof had these key steps:

1. Start with an open cover of $f(K)$
2. Pull it back via $f^{-1}$ to get an open cover of $K$
3. Use compactness of $K$ to get a finite subcover
4. Push forward via $f$ to get a finite subcover of $f(K)$

Let's translate this into Lean tactics:

```lean
theorem continuous_image_of_compact
  {X Y : Type*} [TopologicalSpace X] [TopologicalSpace Y]
  (f : X → Y) (hf : Continuous f)
  (K : Set X) (hK : IsCompact K) :
  IsCompact (f '' K) := by
  -- We'll use the compact_of_finite_subcover lemma
  rw [isCompact_iff_finite_subcover]
  -- Let U be an open cover of f(K)
  intro ι U hU_open hU_cover
  -- Pull back to get an open cover of K
  have preimage_cover : K ⊆ ⋃ i, f ⁻¹' (U i) := by
    intro x hx
    -- x ∈ K, so f(x) ∈ f(K)
    have : f x ∈ f '' K := ⟨x, hx, rfl⟩
    -- f(x) is in some U i by hU_cover
    obtain ⟨i, hi⟩ := hU_cover this
    -- So x is in f⁻¹(U i)
    exact ⟨i, hi⟩
  -- Each preimage is open by continuity
  have preimage_open : ∀ i, IsOpen (f ⁻¹' (U i)) := by
    intro i
    exact hf (hU_open i)
  -- Use compactness of K
  rw [isCompact_iff_finite_subcover] at hK
  obtain ⟨t, ht⟩ := hK (f ⁻¹' ∘ U) preimage_open preimage_cover
  -- t is our finite subcover
  use t
  -- Now show f(K) ⊆ ⋃ i ∈ t, U i
  intro y hy
  -- y ∈ f(K), so y = f(x) for some x ∈ K
  obtain ⟨x, hx, rfl⟩ := hy
  -- x is in some f⁻¹(U i) for i ∈ t
  obtain ⟨i, hi_mem, hi⟩ := ht hx
  -- So f(x) ∈ U i
  exact ⟨i, hi_mem, hi⟩
```

## A Cleaner Approach: Using Mathlib Lemmas

The proof above works, but Lean's Mathlib has many useful lemmas that make proofs shorter and more readable. Here's a more idiomatic version:

```lean
theorem continuous_image_of_compact'
  {X Y : Type*} [TopologicalSpace X] [TopologicalSpace Y]
  (f : X → Y) (hf : Continuous f)
  (K : Set X) (hK : IsCompact K) :
  IsCompact (f '' K) := by
  -- Use the image_subset_iff lemma and properties of compact sets
  rw [isCompact_iff_finite_subcover]
  intro ι U hU_open hU_cover
  -- The preimages form an open cover of K
  have : K ⊆ ⋃ i, f ⁻¹' (U i) := by
    simpa [image_subset_iff] using hU_cover
  -- Get finite subcover using compactness
  obtain ⟨t, ht⟩ := hK.elim_finite_subcover (f ⁻¹' ∘ U) 
    (fun i => hf (hU_open i)) this
  use t
  -- The images of the finite subcover still cover f(K)
  calc f '' K ⊆ f '' (⋃ i ∈ t, f ⁻¹' (U i)) := image_subset f ht
    _ ⊆ ⋃ i ∈ t, f '' (f ⁻¹' (U i)) := image_iUnion.le
    _ ⊆ ⋃ i ∈ t, U i := by
        apply iUnion₂_mono
        intro i _
        apply image_preimage_subset
```

## The One-Liner (Because Lean is Magic)

And here's the truth: in Mathlib, the proof is incredibly short because we have the right abstractions:

```lean
theorem continuous_image_of_compact''
  {X Y : Type*} [TopologicalSpace X] [TopologicalSpace Y]
  (f : X → Y) (hf : Continuous f)
  (K : Set X) (hK : IsCompact K) :
  IsCompact (f '' K) :=
  hK.image hf
```

That's it. The `.image` method on compact sets takes a continuous function and produces the compactness of the image. All the work we did above is packaged into this one lemma.

## What We Learn from Formalization

Formalizing this theorem taught me several things:

1. **Precision matters**: In the paper proof, we wrote "$K \subseteq f^{-1}(f(K))$" casually. In Lean, we need to think carefully about images and preimages and their properties.

2. **Abstraction is powerful**: The filter-based definition of compactness in Mathlib is more abstract than open covers, but it enables shorter proofs and greater generality.

3. **Libraries are essential**: Writing proofs from absolute scratch is possible but tedious. Mathlib's thousands of lemmas about sets, functions, and topology make formalization practical.

4. **Different levels of detail**: You can write explicit, step-by-step proofs (our first version), or leverage automation and high-level lemmas (the one-liner). Both have value.

## Try It Yourself!

If you want to experiment with this proof, you can:

1. Install Lean 4 and set up a project with Mathlib
2. Try proving related theorems, like: a closed subset of a compact set is compact
3. Explore Mathlib's topology files to see what else has been formalized

The journey from understanding a theorem on paper to formalizing it in Lean deepens your mathematical understanding in unexpected ways. Every step you take explicitly builds intuition about why the proof works.

## Next Steps

This theorem is just the beginning. Mathlib contains formalized versions of:
- The Heine-Borel theorem
- Tychonoff's theorem
- The extreme value theorem
- And thousands more results in topology, analysis, algebra, and beyond

The beauty of formalization is that once something is proven in Lean, it becomes a building block for everything that comes after—verified, reliable, and ready to use.

---

*Thanks to the Lean community and Mathlib contributors for building such an incredible resource. If you're interested in learning more about Lean, check out [the Lean 4 documentation](https://lean-lang.org/) and [Mathematics in Lean](https://leanprover-community.github.io/mathematics_in_lean/).*