---
title: "FirstProof — The First Real Research Math Test for AI"
description: "A new experiment testing whether AI can autonomously solve real research mathematics — and what it reveals about the future of reasoning."
pubDate: 2026-02-17
---

*A new experiment testing whether AI can autonomously solve real research mathematics — and what it reveals about the future of reasoning.*

---

In February 2026, a group of mathematicians quietly released something unusual:

Not a contest. Not a leaderboard. Not a trick benchmark.

But a slice of real mathematical research.

They called it **FirstProof**.

The name is a baking metaphor. In bread-making, the first proof is bulk fermentation — letting the whole batch of dough rest before shaping it into anything. This experiment was the same: a rough first attempt, meant to ferment in the community before anything more structured could take shape.

And its central question was simple but radical:

> Can AI autonomously solve mathematics that actually occurs in research?

Not olympiad problems. Not textbook exercises. Not questions scraped from the internet.

Real lemmas that appeared while mathematicians were doing real work.

---

## Why This Matters

Most math benchmarks measure pattern recognition disguised as reasoning.

Contest problems are short, heavily optimized for human cleverness, and tend to resemble training data. They reward tricks and heuristics. Research mathematics is different.

You don't just solve a problem — you first understand what the problem even *means*.

The FirstProof authors explicitly targeted the final stage of research: well-formed, precise statements that still require genuine insight. The goal was not creativity or theory invention. Just this:

> Given a new research lemma — can an AI produce a correct proof?

---

## The Design

The rules were intentionally strict:

- Questions had never appeared online
- Answers were encrypted before release
- Problems came from multiple areas of mathematics
- Each solvable in roughly five pages or fewer

The authors — eleven researchers from Stanford, Columbia, EPFL, Harvard, Yale, Berkeley, and elsewhere — drew questions from their own active work. Fields included stochastic PDE and quantum field theory, representation theory, combinatorics, topology, symplectic geometry, spectral graph theory, numerical linear algebra, and tensor analysis.

Not toy math. Actual working math.

The authors also noted clearly: **this is not yet a formal benchmark.** The questions aren't numerous enough, there's no automated grading scheme, and correct answers aren't always unique — there may be multiple valid proofs, or multiple valid counterexamples. Human expert assessment is still required.

---

## What The Problems Look Like

Here's the key: they were not puzzles.

They were lemmas.

For example, Question 1 (from Martin Hairer at EPFL) asked whether the Φ⁴₃ quantum field measure on a three-dimensional torus remains equivalent to its shifted version under a smooth perturbation. That's not something you solve with a clever trick — it requires deep structural understanding of how these singular measures behave. The answer, as it turns out, is no: the measures are mutually singular.

This is the kind of question that looks deceptively clean on the page but conceals enormous technical depth beneath it.

---

## The Models Tested

Before releasing answers, the authors tested **Gemini 3.0 Deep Think** and **ChatGPT 5.2 Pro**, using two prompts: one allowing internet search and one explicitly discouraging it. This produced 39 response files across the ten problems.

The results were not "AI fails" or "AI solves math." Something far more interesting emerged.

---

## What Happened When AI Tried

### 1) Correct reasoning from wrong assumptions

On Question 1, one model assumed a false theorem — that the Φ⁴₃ measure is equivalent to the free field measure — and then derived a logically valid conclusion from it. The chain of reasoning worked. The mathematical grounding didn't.

This is one of the subtler failure modes: the model didn't make an obvious error. It just started from a premise that wasn't true, and everything downstream was built on sand.

### 2) Solving the wrong problem

On Question 2 (from Paul Nelson), the task required finding a *single* Whittaker function W that works simultaneously for all representations of the smaller group with a given conductor. Some models instead constructed W depending on the particular representation in question — which makes the problem far easier and has a well-known solution. In some cases, the models noted they had solved a weaker problem. In others, they didn't.

### 3) Solving the trivially excluded case

Question 3 (from Lauren Williams) explicitly prohibited solutions whose transition probabilities were described using the relevant interpolation polynomials. The best LLM response used the Metropolis-Hastings algorithm, which is a method that can be used to construct a Markov chain with *any* desired stationary distribution — by directly using that distribution to define its transition rates. It's exactly the kind of trivial solution the problem had been designed to exclude. One model even gave a slight variant using an equivalent formula for the polynomials, which doesn't help.

### 4) Producing fake literature

On Question 5 (algebraic topology), some outputs cited lemmas that didn't exist from real papers, and in one case confabulated an entire paper and attributed a result to it. The model understood what a proof *should look like* — complete with references — but not what mathematical truth actually depends on.

### 5) Occasionally… it actually worked

On Question 9 (tensors and algebraic geometry), the best LLM answer was described by the question's author, Joe Kileel, as "essentially correct." The model constructed the same algebraic relations as the human solution and gave a valid proof, though by a different route.

But the most striking result was Question 10 (numerical linear algebra), where the LLM solution was **better than the human answer**. It found an insight — a way to lower the computational complexity — that the problem's author, Tamara Kolda, had not yet seen. She noted the idea exists in existing literature on subsampled Kronecker product matrix-vector products, and that she plans to borrow aspects of the LLM solution. The LLM didn't cite its sources properly, but the mathematics was sound.

---

## The Key Takeaway

This experiment revealed something deeper than performance:

> AI can imitate proof structure before it understands mathematical objects.

The models can reason locally, manipulate symbols, and plan argument shapes. But they struggle with global definitions, hidden assumptions, and what we might call mathematical *ontology* — knowing what the objects in a proof actually are, and what must genuinely be established versus what can be assumed.

They operate in the *syntax of proof* before the *semantics of mathematics*.

But this picture is complicated by Question 10. When a problem is sufficiently close to techniques that exist in the literature — even obscure literature — AI can not only match but exceed human performance. The failure is uneven, and the successes are real.

---

## Why This Benchmark Is Different

Previous math benchmarks ask: *can AI produce answers?*

FirstProof asks: *can AI participate in the research workflow?*

That includes understanding definitions, respecting scope, avoiding implicit assumptions, and knowing what must be proved versus what can be taken for granted. It also means the answers have to be graded by human experts — there's no automatic scoring.

This is much closer to real mathematics.

---

## What Comes Next

The project plans a second phase with stricter methodology:

- Autonomous verification requirements
- A formal grading scheme modeled on journal peer review
- Advance internal testing on systems with zero data retention policies

In other words, they are turning math research into a measurable scientific experiment.

---

## Where We Are Heading

This experiment suggests a progression:

**Stage 1 — Computation**: AI does calculations faster than humans.

**Stage 2 — Formal proof assistance**: AI fills in steps and checks logic.

**Stage 3 — Research collaboration**: AI proposes arguments that mathematicians validate.

**Stage 4 — Independent research**: Not there yet.

FirstProof suggests we are somewhere between stage 2 and stage 3 — but the placement is uneven across mathematical fields, and closer to stage 3 than many expected in some areas.

---

## The Real Meaning

This was never about beating mathematicians.

It was about locating the boundary of reasoning.

The result is more interesting than a clean verdict. AI doesn't uniformly fail at research math. It fails in specific, structurally revealing ways — starting from false premises, solving easier nearby problems, producing plausible-looking fiction. And then, occasionally, it finds something real that a human missed.

> AI doesn't fail at math because math is hard.  
> It fails because meaning is hard.

And research mathematics is mostly meaning. But meaning, it turns out, is not entirely out of reach.

---

**Read the original papers**

- [FirstProof: The Questions](https://arxiv.org/abs/2602.05192) — the original problem set released February 5, 2026
- [FirstProof: Solutions and Commentary](https://codeberg.org/tgkolda/1stproof/src/branch/main/2026-02-batch) — the human solutions and AI commentary released February 14, 2026