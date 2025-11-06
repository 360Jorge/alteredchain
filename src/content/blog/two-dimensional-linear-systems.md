---
title: "From Lines to Planes: Understanding Two-Dimensional Linear Systems"
description: "A geometric journey through two-dimensional linear systems — centers, spirals, saddles, and the beauty of phase portraits."
pubDate: 2025-11-04
tags: ["dynamical systems", "linear algebra", "phase portraits", "stability"]
heroImage: '/linear-systems.png'
---

## Breaking Free from the Line

After spending chapters confined to one-dimensional flows, stepping into two dimensions feels like breaking free from a cage.  
On a line, trajectories move monotonically or stay put — they have nowhere else to go.  
But on a plane, trajectories can swirl, spiral, and orbit, revealing rich behaviors impossible in one dimension.

## What Are Linear Systems?

A two-dimensional linear system has the form:

$$
\dot{x} = ax + by
$$

$$
\dot{y} = cx + dy
$$

In matrix form:

$$
\dot{\mathbf{x}} = A\mathbf{x}, \quad A =
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}, \quad \mathbf{x} = (x, y).
$$

Because linear systems satisfy superposition, if $\mathbf{x}_1$ and $\mathbf{x}_2$ are solutions, so is $c_1\mathbf{x}_1 + c_2\mathbf{x}_2$.  
The origin $\mathbf{x} = 0$ is always a fixed point — the question is what kind?

## The Phase Plane

Solutions now evolve on the $(x, y)$ plane.  
Each point $(x, y)$ has a velocity vector $(\dot{x}, \dot{y})$ defining a **vector field**.  
The path traced by a solution is called a **trajectory**, and the full collection is the **phase portrait**.

## The Simple Harmonic Oscillator

For a mass–spring system:

$$
m\ddot{x} + kx = 0
$$

Define $v = \dot{x}$:

$$
\dot{x} = v, \quad \dot{v} = -\omega^2 x, \quad \omega^2 = \frac{k}{m}.
$$

### Vector Field Intuition

- On $x$-axis ($v=0$): vectors point vertically — down for $x>0$, up for $x<0$.  
- On $v$-axis ($x=0$): vectors point horizontally — right for $v>0$, left for $v<0$.  
- At the origin: zero vector → fixed point.

### Closed Orbits = Oscillations

Trajectories form **closed ellipses**.  
Physically:

- The mass oscillates periodically.  
- Energy is conserved: $\frac{1}{2}\omega^2x^2 + \frac{1}{2}v^2 = \text{constant}$.  
- The origin is a **center** — neutrally stable.

## Reading the Oscillation from the Orbit

1. Maximum compression: $x$ most negative, $v = 0$  
2. Moving right: $x$ increasing, $v > 0$  
3. Passing equilibrium: $x=0$, $v$ max  
4. Maximum extension: $x$ most positive, $v = 0$  
5. Moving left: $x$ decreasing, $v < 0$  
6. Back to start → repeats

Phase portraits **turn dynamics into geometry**.

## Eigenvalues and Eigenvectors

We seek exponential solutions:

$$
\mathbf{x}(t) = e^{\lambda t}\mathbf{v}
$$

Substitute into $\dot{\mathbf{x}} = A\mathbf{x}$:

$$
A\mathbf{v} = \lambda \mathbf{v}
$$

Thus $\lambda$ and $\mathbf{v}$ are **eigenvalues** and **eigenvectors**.

### General Solution

If $A$ has distinct eigenvalues $\lambda_1, \lambda_2$ with eigenvectors $\mathbf{v}_1, \mathbf{v}_2$:

$$
\mathbf{x}(t) = c_1 e^{\lambda_1 t}\mathbf{v}_1 + c_2 e^{\lambda_2 t}\mathbf{v}_2
$$

---

## The Six Basic Fixed-Point Types

### 1. Saddle Point ($\lambda_1 > 0$, $\lambda_2 < 0$)

- One stable, one unstable direction  
- **Stable manifold** → eigenvector for $\lambda_2 < 0$  
- **Unstable manifold** → eigenvector for $\lambda_1 > 0$  
- Hyperbolic trajectories avoiding the origin  
- Physically: balancing a pencil on its tip — **unstable**

### 2. Stable Node ($\lambda_2 < \lambda_1 < 0$)

- Both eigenvalues negative → all trajectories approach the origin  
- Tangent to the slow eigendirection  
- **Asymptotically stable**

Special case: $\lambda_1 = \lambda_2$ gives a **star node** if two eigenvectors exist.

### 3. Unstable Node ($0 < \lambda_1 < \lambda_2$)

Same geometry but reversed arrows — all trajectories **diverge**.

### 4. Stable Spiral ($\lambda = \alpha \pm i\beta$, $\alpha < 0$)

- Spiral inward  
- Decaying oscillations: $e^{\alpha t}(\cos \beta t, \sin \beta t)$  
- Period $T = 2\pi / \beta$  
- **Asymptotically stable**

### 5. Unstable Spiral ($\alpha > 0$)

Spirals outward — oscillations grow with time.

### 6. Center ($\lambda = \pm i\beta$)

- Purely imaginary eigenvalues  
- Closed orbits  
- Neutrally stable (Liapunov stable but not attracting)

---

## The Classification Diagram

Let:

$$
\tau = \text{trace}(A) = a + d, \quad
\Delta = \det(A) = ad - bc
$$

Eigenvalues:

$$
\lambda = \frac{\tau \pm \sqrt{\tau^2 - 4\Delta}}{2}
$$

Interpretation:

- $\Delta < 0$: saddle  
- $\Delta > 0$, $\tau^2 - 4\Delta > 0$: node  
- $\Delta > 0$, $\tau^2 - 4\Delta < 0$: spiral/center  
- $\tau < 0$: stable  
- $\tau > 0$: unstable  
- $\tau = 0$: center  

---

## Stability Concepts

- **Attracting:** trajectories approach fixed point.  
- **Liapunov stable:** trajectories stay close forever.  
- **Asymptotically stable:** both attracting and Liapunov stable.

| Type | Stability |
|------|------------|
| Nodes, spirals with $\tau < 0$ | Asymptotically stable |
| Centers | Neutrally stable |
| Saddles, spirals with $\tau > 0$ | Unstable |

---

## A Delightful Application: Love Affairs 

Let $R(t)$ = Romeo’s love, $J(t)$ = Juliet’s love.

$$
\dot{R} = aR + bJ \\
\dot{J} = cR + dJ
$$

### Personality Types

| Parameters | Type |
|-------------|------|
| $a>0, b>0$ | Eager beaver |
| $a<0, b>0$ | Cautious lover |
| $a>0, b<0$ | Narcissistic nerd |
| $a<0, b<0$ | Hermit |

**Romeo echoes Juliet** ($\dot{R} = aJ$) and **Juliet is contrary** ($\dot{J} = -bR$):

$$
\tau = 0, \quad \Delta = ab > 0
$$

→ **Center**: endless cycles of love and hate!

**Two cautious lovers:**

$$
\dot{R} = -aR + bJ \\
\dot{J} = bR - aJ
$$

with $a>0, b>0$.

- If $a^2 > b^2$: stable node → apathy  
- If $a^2 < b^2$: saddle → explosive passion  

*Moral: too much caution kills romance.*

---

## Quick Classification Steps

1. Compute $\tau$, $\Delta$  
2. If $\Delta < 0$: saddle  
3. If $\Delta = 0$: non-isolated fixed points  
4. Else check $\tau^2 - 4\Delta$:  
   - $>0$: node  
   - $=0$: star/degenerate  
   - $<0$: spiral or center  
5. Determine stability via $\tau$

---

## Why Linear Systems Matter

1. **Local Linearization:** Near any fixed point of a nonlinear system, linearization via the Jacobian reveals local behavior.  
2. **Pedagogical Value:** Builds geometric intuition about phase space.  
3. **Real-World Relevance:** Many models (circuits, oscillators, epidemiology) are linear or locally linear.

---

## Key Insights

1. Geometry reveals dynamics.  
2. Eigenvalues and eigenvectors are geometric.  
3. Two numbers $(\tau, \Delta)$ classify everything.  
4. Stability has layers: attracting vs Liapunov.  
5. Imaginary parts → rotation, real parts → decay/growth.  
6. Moving from 1D to 2D adds fundamentally new behavior.

---

## Looking Ahead

- Nonlinear systems introduce **limit cycles** and **chaos**.  
- Linearization remains the first step to understanding local behavior.  
- The geometric mindset — thinking in terms of flows — is the essence of dynamical systems.

---

Mathematics isn’t just abstract — it can even explain why Romeo and Juliet’s love oscillated endlessly.  
Their fate was sealed not only by family feuds, but by the **eigenvalues** of their emotional dynamics.

---

**Reference**  
This post is based on material from *Nonlinear Dynamics and Chaos* by Steven H. Strogatz (1994).
