---
title: "Putnam, Proof Assistants, and the Moving Boundary of Intelligence"
description: "What PUTNAMBENCH tells us about AI, formal mathematics, and why intelligence keeps shifting as tools improve."
pubDate: 2026-02-04
---

Our idea of *intelligence* has never been static.

There was a time when being able to compute large numbers quickly was considered a sign of exceptional intelligence. Then calculators — and later computers — made that skill trivial. Chess was once held up as a pinnacle of human strategic thinking, until machines surpassed world champions. Go followed. More recently, [AI systems have achieved gold-medal–level performance on International Mathematical Olympiad problems](https://deepmind.google/blog/advanced-version-of-gemini-with-deep-think-officially-achieves-gold-medal-standard-at-the-international-mathematical-olympiad/?utm_source=chatgpt.com), [particularly in geometry](https://deepmind.google/blog/alphageometry-an-olympiad-level-ai-system-for-geometry/?utm_source=chatgpt.com).

Each time, the story is the same: we declare a task as a marker of intelligence, automate it, and then quietly move the goalposts.

Seen in this light, the question is not *whether* AI will eventually solve Putnam problems, but *what solving them will actually mean*.

This is why a recent paper introducing **PUTNAMBENCH** caught my attention:

https://arxiv.org/abs/2407.11214

---

## What is PUTNAMBENCH?

PUTNAMBENCH is a benchmark built from **640 problems from the William Lowell Putnam Mathematical Competition**, formally stated in proof assistants. In total, it contains **1,692 hand-written formalizations** across **Lean 4, Isabelle, and Coq**.

You can explore the dataset directly here:  
https://github.com/trishullab/PutnamBench

That detail matters.

Unlike informal math benchmarks where a model only needs to output a correct final answer, PUTNAMBENCH requires **fully formal, machine-verifiable proofs**. Every step must type-check. Every inference must be explicit. There is no room for hand-waving or “this is obvious.”

The benchmark is also carefully designed to avoid data leakage: these formal proofs did not exist before, and none of the solutions are included. Models must genuinely *construct* proofs, not recall them.

In short, PUTNAMBENCH is not testing whether AI can *recognize* mathematical patterns — it is testing whether AI can **reason formally about undergraduate-level mathematics**.

---

## The Results: A Reality Check

The authors evaluate a range of state-of-the-art systems, including large language models, neural-symbolic provers, and powerful symbolic automation tools.

The outcome is stark.

| System / Method | Proof Assistant | Problems Solved |
|-----------------|----------------|-----------------|
| GPT-4 | Lean 4 | **1 / 640** |
| COPRA | Lean 4 | **1 / 640** |
| ReProver (with or without retrieval) | Lean 4 | **0 / 640** |
| Draft-Sketch-Prove | Isabelle | **4 / 640** |
| Sledgehammer | Isabelle | **3 / 640** |
| GPT-4 | Coq | **1 / 412** |
| COPRA | Coq | **1 / 412** |
| CoqHammer / Tactician | Coq | **0 / 412** |

Across **all languages and all methods combined**, only **six problems** in PUTNAMBENCH are solved — well under **1% success**.

Even more telling: the problems that *are* solved are among the **easiest ever asked on the Putnam exam**, often admitting very short natural-language proofs. Harder problems, involving deeper constructions or multi-step insight, remain completely out of reach.

This is not a failure of arithmetic, algebraic manipulation, or syntax.  
It is a failure of **strategy, insight, and lemma discovery**.

---

## Why Putnam Problems Are Different

Putnam problems are not long or computationally heavy. Their difficulty usually comes from one or two key ideas:

- choosing the *right* construction,
- introducing the *right* auxiliary object,
- spotting a hidden symmetry,
- or knowing *which* lemma needs to exist before you can prove anything at all.

The paper identifies two core weaknesses in current systems:

1. Failure to synthesize new lemmas  
2. Failure to orchestrate long-horizon proof strategies using existing libraries  

Formal systems are incredible amplifiers once the structure is in place — but deciding *what structure to build* remains hard.

---

## Will AI Eventually Solve Putnam Problems?

Almost certainly — yes.

Nothing in PUTNAMBENCH suggests a fundamental barrier. These failures are not impossibility results; they are engineering limitations:
- search efficiency,
- representation,
- lemma discovery,
- and better integration with mathematical libraries.

History strongly suggests that these obstacles will be overcome.

But that is not the most interesting takeaway.

---

## Intelligence as a Moving Interface

PUTNAMBENCH does not define intelligence.  
It marks a **current boundary** between what humans do internally and what we have managed to externalize into tools.

When AI clears this benchmark — and it likely will — Putnam problems will not stop mattering. They will become:
- training data,
- scaffolding,
- infrastructure,
- and a shared substrate for human–AI collaboration.

This is exactly what happened in chess. Computers did not kill the game; they transformed it. Human players became stronger, theory deepened, and the nature of expertise changed.

The same will happen in mathematics.

---

## AI as Amplifier, Not Driver

Even when AI can produce Putnam-level proofs, it will not:
- decide which problems are worth studying,
- invent new mathematical frameworks,
- choose research directions,
- or care about elegance, meaning, or explanation.

Those choices remain human.

AI is an amplifier — a force multiplier — not a driver.

PUTNAMBENCH matters because it shows us **where we are right now**, not because it draws a permanent line.

---

### *Aside: Why Isabelle Does Slightly Better Here*

Isabelle’s marginally better performance in PUTNAMBENCH is not due to deeper mathematical reasoning, but to its design philosophy. Isabelle emphasizes **declarative proofs and strong symbolic automation**, most notably through **Sledgehammer**, which can call external automated theorem provers to discharge certain goals. In PUTNAMBENCH, this advantage appears only in a narrow class of problems — typically short algebraic statements about sets with binary operations.

The authors stress that this advantage does **not scale**: even with Sledgehammer, overall success rates remain below 1%, and the vast majority of problems remain unsolved across all systems.
