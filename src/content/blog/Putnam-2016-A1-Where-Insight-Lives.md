---
title: "Putnam 2016 A1: Where Insight Lives (and Why Formal Proofs Expose It)"
description: "A mathematical look at Putnam 2016 A1, focusing on where the real difficulty lies—and what formalization makes explicit."
pubDate: 2026-02-05
---

Some math problems are long.  
Some are technical.  
And some are short, clean, and deceptive.

**Putnam 2016 A1** belongs squarely in the third category.

The problem asks:

> Find the smallest positive integer $j$ such that for every polynomial $p(x)$ with integer coefficients and for every integer $k$,  
> $$
> p^{(j)}(k) = \left.\frac{d^j}{dx^j}p(x)\right|_{x=k}
> $$
> is divisible by $2016$.
>
> (That is, the $j$-th derivative of $p(x)$ at $k$ is always a multiple of $2016$.)

The answer is surprisingly small: **\( j = 8 \)**.

But when you try to solve this problem, you know that **nothing** about that number is obvious at first glance.



---

## Why This Is Not a Computational Problem

The hardest part isn't proving that $j=8$ works.

The hardest part is **figuring out that $8$ is even worth trying.**

When you first approach this problem, you might try small values. Maybe $j=3$? No divisibility guarantee. What about $j=5$? Still nothing obvious.

At some point you stop guessing and ask a different question:

> What structure determines when divisibility becomes inevitable?

That's when the problem unlocks. ([I walked through this discovery process in detail here.](https://www.alteredchain.com/visual-problems/putnam-a1-2016/))

The key realization is that:

- The j-th derivative of $x^n$ produces a factor of $\frac{n!}{(n-j)!}$

- This means $j!$ divides the derivative of *any* monomial (when $n \geq j$)

- Since $2016 = 2^5 \cdot 3^2 \cdot 7$, we need $j!$ to contain at least these prime factors

- And $8! = 40320 = 2^7 \cdot 3^2 \cdot 5 \cdot 7$ is the first factorial that works


Once you see this, the problem collapses. But before you see it, the problem feels like groping in the dark.

That moment—when arithmetic structure suddenly becomes visible—is what Putnam problems are designed to test.

---

## Where the Key Insight Comes From

The decisive insight is not “take more derivatives.”

It is something closer to:

> *Repeated differentiation forces factorial growth, and factorials eventually dominate prime power divisibility.*

Once you see this, the structure of the proof becomes clear:
- monomials differentiate into factorial-weighted terms,
- valuations accumulate,
- and after enough derivatives, divisibility by each prime power is guaranteed.

But here is the subtle point:

> **The proof becomes easy only after you already know what to aim for.**

The hardest step is not showing that $j = 8$ works.  
The hardest step is realizing that **8 is even in the right ballpark**.

That leap is not deductive.  
It is heuristic.

---

## Why This Matters Mathematically

Putnam problems often work this way.

They are not designed to test technique.  
They are designed to test **recognition of structure**.

In this problem, the structure lives at the intersection of:
- polynomial algebra,
- differentiation,
- and prime factorization.

You don’t “derive” the right idea.  
You *notice* it.

That noticing is the mathematical core of the problem.

---

## What Changes When You Formalize the Problem

Now consider what happens when you try to formalize Putnam 2016 A1 in a proof assistant like Lean.

The formal statement (simplified) looks roughly like:

```lean
IsLeast {j : ℕ | 0 < j ∧ ∀ P : ℤ[X], ∀ k : ℤ,
  2016 ∣ (derivative^[j] P).eval k} j
```

Lean has no difficulty checking this statement.

But Lean does not know:

- why factorials should appear,

- why prime powers matter,

- or why 8 is special.

Every piece of insight must be turned into an explicit lemma:

- how derivatives act on monomials,

- how valuations grow,

- how divisibility behaves under sums.

Formalization does not make the problem harder —
it makes the location of difficulty visible.

---

## Insight vs Verification

This is what Putnam 2016 A1 makes painfully clear:

- Verification is easy once insight is present.

- Insight is where the real work happens.

Proof assistants are exceptional at the first task.
They are deliberately silent about the second.

And that is not a flaw — it is a feature.

Formalization forces us to confront an uncomfortable truth:

> Most of what we call “mathematical difficulty” lives before formal reasoning begins.

---

## An Ongoing Experiment: What Current AI Can (and Can’t) Do

I tested a math-focused AI system (Aristotle AI) on **Putnam 2016 A1.**

The system produced a sound informal solution. It correctly identified the role of repeated differentiation, factorial growth, and prime power divisibility. The mathematical language was right.

But the solution begins after the key insight.

It explains **why** $j = 8$ works. It does not explain **how** one would arrive at $j=8$ in the first place. The hardest part of the problem—recognizing that factorial divisibility is the relevant structure—is simply assumed as a starting point.

This is not surprising. It's revealing.

Current AI tools are effective at **articulating and checking mathematical reasoning once the structure is known.** They do not yet reliably **discover the structure itself.**

That gap—between explanation and insight—is exactly what problems like Putnam 2016 A1 expose.

The formalization below makes this even more explicit. Every piece of insight must be turned into a lemma: how derivatives act on monomials, how valuations grow, how divisibility behaves under sums. Aristotle produced correct Lean code, but the conceptual architecture—which lemmas to prove, in what order, and why—reflects mathematical understanding that was already present in the problem statement and solution strategy.

<details>
<summary>Lean formalization: insight decomposed into 200 explicit steps (click to expand)</summary>

```lean
/-
This file was generated by Aristotle.

Lean version: leanprover/lean4:v4.24.0
Mathlib version: f897ebcf72cd16f89ab4577d0c826cd14afaafc7
This project request had uuid: 4d05754b-7cb8-41ca-a6e5-6851c4f5fff3

To cite Aristotle, tag @Aristotle-Harmonic on GitHub PRs/issues, and add as co-author to commits:
Co-authored-by: Aristotle (Harmonic) <aristotle-harmonic@harmonic.fun>
-/

/-
Restatement of Putnam 2016 A1:
Find the smallest positive integer j such that for any polynomial p(x) with integer coefficients, and any integer k, the j-th derivative of p(x) evaluated at k is divisible by 2016.

1. Given Assumptions:
   - p(x) is a polynomial with integer coefficients (p ∈ ℤ[X]).
   - k is an integer (k ∈ ℤ).
   - j is a positive integer (j ∈ ℤ, j > 0).
   - The divisibility condition (2016 ∣ (derivative^[j] p).eval k) must hold for ALL p and ALL k.

2. To be proven:
   - The set of such integers j is non-empty.
   - The smallest element of this set is 8.

3. Classification:
   - Algebraic: The problem involves polynomials, derivatives, integer divisibility, and factorials.
   - Combinatorial: The proof involves properties of factorials and binomial coefficients (which appear in the derivatives of polynomials).
   - Geometric: There are no geometric components to this problem.

The formalization defines the property `Putnam2016A1_property` and proves `Putnam2016A1_solution`, which states that 8 is the least positive integer satisfying the property.
-/

import Mathlib

set_option linter.mathlibStandardSet false

open scoped BigOperators
open scoped Real
open scoped Nat
open scoped Classical
open scoped Pointwise

set_option maxHeartbeats 0
set_option maxRecDepth 4000
set_option synthInstance.maxHeartbeats 20000
set_option synthInstance.maxSize 128

set_option relaxedAutoImplicit false
set_option autoImplicit false

noncomputable section

/-
The property that the j-th derivative of any integer polynomial evaluated at any integer is divisible by 2016.
-/
open Polynomial

def Putnam2016A1_property (j : ℕ) : Prop :=
  ∀ (p : ℤ[X]) (k : ℤ), 2016 ∣ (derivative^[j] p).eval k

/-
Checking if Putnam2016A1_property can be used.
-/
open Polynomial

#check Putnam2016A1_property 8

/-
If the Putnam 2016 A1 property holds for j, then 2016 divides j!.
-/
open Polynomial

lemma Putnam2016A1_necessary (j : ℕ) : Putnam2016A1_property j → 2016 ∣ Nat.factorial j := by
  intro h;
  -- By definition of Putnam2016A1_property, we know that $2016 \mid (derivative^[j] p).eval k$ for any polynomial $p$ and any integer $k$.
  specialize h (Polynomial.X ^ j) 0;
  simp_all +decide [ Polynomial.eval, Polynomial.coeff_iterate_derivative ];
  simp_all +decide [ Nat.descFactorial_self ];
  exact_mod_cast h

/-
If 2016 divides j!, then j must be at least 8.
-/
lemma factorial_divisible_2016_implies_ge_8 (j : ℕ) : 2016 ∣ j.factorial → j ≥ 8 := by
  exact fun h => le_of_not_gt fun h' => by interval_cases j <;> trivial;

/-
The j-th derivative of any integer polynomial evaluated at any integer is divisible by j!.
-/
open Polynomial

lemma divisible_by_factorial_derivative (j : ℕ) (p : ℤ[X]) (k : ℤ) : (j.factorial : ℤ) ∣ (derivative^[j] p).eval k := by
  -- By definition of polynomial derivative, we know that the j-th derivative of a polynomial is a linear combination of terms of the form (j! / i!) x^(n-j).
  have h_deriv_term : ∀ (n : ℕ) (p : Polynomial ℤ), (∀ i ≤ n, (Nat.factorial j : ℤ) ∣ Polynomial.coeff (Polynomial.derivative^[j] p) i) := by
    norm_num [ Polynomial.coeff_iterate_derivative ];
    exact fun n p i hi => dvd_mul_of_dvd_left ( mod_cast Nat.factorial_dvd_descFactorial _ _ ) _;
  rw [ Polynomial.eval_eq_sum_range ];
  exact Finset.dvd_sum fun i hi => dvd_mul_of_dvd_left ( h_deriv_term _ _ _ ( Finset.mem_range_succ_iff.mp hi ) ) _

/-
Checking if IsLeast is available in the global namespace.
-/
#check IsLeast

/-
If 2016 divides j!, then the Putnam 2016 A1 property holds for j.
-/
open Polynomial

lemma Putnam2016A1_sufficient (j : ℕ) : 2016 ∣ j.factorial → Putnam2016A1_property j := by
  exact fun h => fun p k => dvd_trans ( mod_cast h ) ( divisible_by_factorial_derivative j p k )

/-
2016 divides 8!.
-/
lemma fact_8_div_2016 : 2016 ∣ Nat.factorial 8 := by
  decide +kernel

/-
8 is positive and satisfies the Putnam 2016 A1 property.
-/
open Polynomial

lemma Putnam2016A1_solution_mem : 8 > 0 ∧ Putnam2016A1_property 8 := by
  exact ⟨ by decide, Putnam2016A1_sufficient _ fact_8_div_2016 ⟩

/-
The smallest positive integer j such that the j-th derivative of any integer polynomial evaluated at any integer is divisible by 2016 is 8.
-/
open Polynomial

theorem Putnam2016A1_solution : IsLeast {j | j > 0 ∧ Putnam2016A1_property j} 8 := by
  -- To prove that 8 is the least, we need to show that for any $j$ in the set, $j \geq 8$.
  have h_least : ∀ j, j > 0 ∧ Putnam2016A1_property j → 8 ≤ j := by
    exact fun j hj => factorial_divisible_2016_implies_ge_8 j ( Putnam2016A1_necessary j hj.2 );
  exact ⟨ ⟨ by decide, Putnam2016A1_solution_mem.2 ⟩, h_least ⟩
```

</details>

---

## Where Difficulty Actually Lives

When I first worked through this problem, the algebra was not what slowed me down.

What slowed me down was:

- deciding what kind of argument was needed,
- realizing that differentiation was only a means, not the point,
- and recognizing that arithmetic structure was the real driver.

That moment of recognition—not the calculation that follows—is what makes this problem difficult.

And that's exactly why Putnam problems remain compelling, and why formalizing them is so revealing.

They force us to confront an uncomfortable truth:

> Most of what we call "mathematical difficulty" lives before formal reasoning begins.

Proof assistants are exceptional at verification. They are deliberately silent about insight.

And that is not a flaw—it is a feature.

Formalization doesn't make problems harder. It makes the **location of difficulty** visible.

---

[In a related post](https://www.alteredchain.com/blog/putnam-and-proof-assistants/), I explore how problems like this appear in formal benchmarks such as PUTNAMBENCH, and what they reveal about the current limits of AI and proof automation.



