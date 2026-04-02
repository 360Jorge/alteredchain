---
title: "GRE Group Theory Problem"
pubDate: "2025-05-28"
description: "Step-by-step solution and visual explanation of a basic GRE series problem"
tags: ["GRE", "Series", "Visualization"]
---

## Problem

> Let $\mathbb{Z}_{30}$ be the ring of integers modulo $30$, and let $U_{30}$ be the group of all invertible elements in $\mathbb{Z}_{30}$ under multiplication. Let $\phi: U_{30} \to U_{30}$ be a group homomorphism with kernel $\ker(\phi) = \{1, 11\}.$ If $\phi(7) = 7$, which of the following elements is **also** mapped to 7 under $\phi$? (A) 11 (B) 13 (C) 17 (D) 19 (E) 29

---

<details>
<summary>Hint (click to expand)</summary>

Use the fact that for a group homomorphism $\phi: G \to H$, the preimage of $\phi(g)$ is the coset $ g \cdot \ker(\phi) $.

</details>

---

<details>
<summary>Solution Strategy</summary>

We use the **coset property of kernels** for group homomorphisms:

For any group homomorphism $\phi: G \to H$, the full preimage (or *fiber*) of an element $h = \phi(g)$ is the **left coset**:
$
 \phi^{-1}(h) = g \cdot \ker(\phi)
$

So here, since $\phi(7) = 7$, the set of all elements in $U_{30}$ that map to 7 is:

$
7 \cdot \ker(\phi) = \{7 \cdot 1, 7 \cdot 11\} \mod 30 = \{7, 77\}
$

Now compute:
$
77 \mod 30 = 17
$

So $ \phi(17) = 7 $ as well.

</details>

---

### Final Answer:

$$
\boxed{17} \quad \text{(Option C)}
$$

---

### Group Theory Takeaway

If you know:
- the image of an element $g$,
- and the kernel of a homomorphism $\phi$,

then you can **immediately determine all other preimages** of $\phi(g)$ using cosets of the kernel.




