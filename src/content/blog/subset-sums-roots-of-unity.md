---
title: "Subset sums, generating functions, and roots of unity"
description: "From a small example to a slick root-of-unity trick."
pubDate: 2025-11-21
tags: ["combinatorics", "number theory", "generating functions"]
---

The problem:

> **Find the number of subsets of $\{1,2,\dots,2000\}$ whose sum of elements is divisible by $5$.**

On the surface it looks innocent: “just subsets and sums.” But if you try to attack it directly, you quickly drown in cases.

The way out is to package everything into a polynomial and then use roots of unity to “filter” the coefficients we care about.

This post is basically my handwritten solution cleaned up, with ideas inspired by Dr. Pragel and a [3Blue1Brown video](https://www.youtube.com/watch?v=bOXCLR3Wric&t=1816s).

 
---

## 1. A tiny example: subsets of $\{1,2,3,4,5\}$

Let’s warm up with the set
$$
\{1,2,3,4,5\}.
$$

We can list all subsets, compute their sums, and look at those that are multiples of 5:

- $\varnothing \to 0$
- $\{5\} \to 5$
- $\{1,4\}, \{2,3\} \to 5$
- $\{1,4,5\}, \{2,3,5\} \to 10$
- $\{1,2,3,4,5\} \to 15$
- and so on…

You can literally draw boxes grouping subsets with the same sum. The sums that are multiples of 5 are easy to spot for this tiny example.

But for $\{1,2,\dots,2000\}$ this approach is hopeless. We need a way to encode **all subsets at once**.

---

## 2. The “magical step”: a generating function

Consider the polynomial
$$
f(x) = (1 + x)(1 + x^2)(1 + x^3)(1 + x^4)(1 + x^5).
$$

Why this particular product?

- In the factor $(1 + x^k)$, the term $1$ corresponds to “don’t include $k$”,  
- and the term $x^k$ corresponds to “include $k$”. 

When we expand the product, every subset $A \subseteq \{1,2,3,4,5\}$ appears exactly once as a monomial
$$
x^{\sum_{a \in A} a}.
$$

So if
$$
f(x) = \sum_{n \ge 0} C_n x^n,
$$
then $C_n$ is exactly the number of subsets whose elements sum to $n$.

In the small case you can expand by hand and see terms like
$$
x^0,\ x^1,\ x^2,\ x^3,\ x^4,\ 2x^5,\ \dots,\ x^{15},
$$
and you can circle the coefficients of $x^0, x^5, x^{10}, x^{15},\dots$ as the subsets whose sum is a multiple of 5.

For the original problem we do the same thing conceptually:
$$
f(x) = \prod_{k=1}^{2000} (1 + x^k).
$$

If we could expand this monstrosity, we’d get
$$
f(x) = \sum_{n \ge 0} C_n x^n,
$$
where $C_n$ counts subsets of $\{1,\dots,2000\}$ with sum $n$.

What we *want* is the sum
$$
C_0 + C_5 + C_{10} + \dots
$$
(the coefficients of $x^n$ where $n$ is a multiple of 5).

Actually expanding $f(x)$ is impossible. So we do something sneakier: we evaluate $f$ at clever values of $x$.

---

## 3. Warmup: using $f(1)$ and $f(-1)$ (mod 2)

Before we jump to 5th roots of unity, here’s a simpler version of the same idea with modulus $2$.

Let
$$
f(x) = \sum_{n=0}^{N} C_n x^n
$$
be any polynomial where $C_n$ counts subsets with sum $n$ (for any finite set).

Then:
$$
f(1) = C_0 + C_1 + C_2 + \dots + C_N
$$
is just the total number of subsets (every subset contributes $1$).

In our big problem,
$$
f(1) = \prod_{k=1}^{2000} (1 + 1) = 2^{2000}.
$$

Now evaluate at $x = -1$.

In factored form:
$$
f(-1) = \prod_{k=1}^{2000} (1 + (-1)^k).
$$

- If $k$ is odd, $(1 + (-1)^k) = 0$.
- There are odd numbers between 1 and 2000, so at least one factor is 0.

So:
$$
f(-1) = 0.
$$

In expanded form:
$$
f(-1) = C_0 - C_1 + C_2 - C_3 + C_4 - C_5 + \dots + (-1)^N C_N.
$$

So we have
$$
\begin{aligned}
f(1) &= C_0 + C_1 + C_2 + C_3 + C_4 + C_5 + \dots, \\
f(-1) &= C_0 - C_1 + C_2 - C_3 + C_4 - C_5 + \dots
\end{aligned}
$$

Add them:
$$
f(1) + f(-1) = 2(C_0 + C_2 + C_4 + \dots).
$$

Divide by 2:
$$
\frac{f(1) + f(-1)}{2} = C_0 + C_2 + C_4 + \dots
$$
which is **exactly** the number of subsets whose sum is even.

In our case,
$$
\frac{f(1) + f(-1)}{2} = \frac{2^{2000} + 0}{2} = 2^{1999}.
$$

This is the mod-2 version of the trick: evaluating at $1$ and $-1$ lets us isolate even exponents.

We’d like something similar for mod 5: a way to extract coefficients where the exponent is $0 \bmod 5$.

That’s where roots of unity show up.

---

## 4. Enter 5th roots of unity

Let $\zeta$ be a primitive 5th root of unity, so
$$
\zeta^5 = 1,\quad \zeta \neq 1.
$$

The five 5th roots of unity are
$$
1,\ \zeta,\ \zeta^2,\ \zeta^3,\ \zeta^4.
$$

Again write
$$
f(x) = \sum_{n=0}^{N} C_n x^n.
$$

Look at the values:
$$
\begin{aligned}
f(1) &= C_0 + C_1 + C_2 + C_3 + C_4 + C_5 + C_6 + \dots,\\
f(\zeta) &= C_0 + C_1 \zeta + C_2 \zeta^2 + C_3 \zeta^3 + C_4 \zeta^4 + C_5 \zeta^5 + C_6 \zeta^6 + \dots,\\
f(\zeta^2) &= C_0 + C_1 \zeta^2 + C_2 \zeta^4 + C_3 \zeta^6 + C_4 \zeta^8 + C_5 \zeta^{10} + \dots,\\
f(\zeta^3) &= \dots,\\
f(\zeta^4) &= \dots.
\end{aligned}
$$

Now **add** these five values:
$$
f(1) + f(\zeta) + f(\zeta^2) + f(\zeta^3) + f(\zeta^4).
$$

Collect coefficients of each $C_n$. The coefficient in front of $C_n$ is:
$$
1 + \zeta^n + \zeta^{2n} + \zeta^{3n} + \zeta^{4n}.
$$

Call this sum
$$
S_n = 1 + \zeta^n + \zeta^{2n} + \zeta^{3n} + \zeta^{4n}.
$$

We can understand $S_n$ using basic facts about roots of unity:

- If $5 \mid n$, then $\zeta^n = 1$, so
  $$
  S_n = 1 + 1 + 1 + 1 + 1 = 5.
  $$
- If $5 \nmid n$, then the powers $\zeta^n, \zeta^{2n}, \dots, \zeta^{4n}$ are just a permutation of
  $$
  \zeta, \zeta^2, \zeta^3, \zeta^4,
  $$
  and we know
  $$
  1 + \zeta + \zeta^2 + \zeta^3 + \zeta^4 = 0.
  $$
  So
  $$
  S_n = 0.
  $$

So the big sum collapses to
$$
f(1) + f(\zeta) + f(\zeta^2) + f(\zeta^3) + f(\zeta^4)
= 5(C_0 + C_5 + C_{10} + \dots).
$$

Therefore,
$$
C_0 + C_5 + C_{10} + \dots
= \frac{1}{5}\sum_{k=0}^{4} f(\zeta^k).
$$

This is the **root-of-unity filter** for multiples of 5.

So our answer is
$$
\frac{1}{5}\big( f(1) + f(\zeta) + f(\zeta^2) + f(\zeta^3) + f(\zeta^4) \big),
$$
where
$$
f(x) = \prod_{k=1}^{2000} (1 + x^k).
$$

We already know $f(1) = 2^{2000}$. What’s left is to compute $f(\zeta)$, $f(\zeta^2)$, $f(\zeta^3)$, $f(\zeta^4)$.

---

## 5. Evaluating $f(\zeta)$ in factored form

Recall
$$
f(x) = \prod_{k=1}^{2000} (1 + x^k), \qquad f(\zeta) = \prod_{k=1}^{2000} (1 + \zeta^k).
$$

Now note that $2000 = 5 \cdot 400$. Among the integers $1,2,\dots,2000$ each residue modulo 5 appears exactly 400 times.

So we can group the product by residue class:

- numbers $\equiv 0 \pmod 5$,
- numbers $\equiv 1 \pmod 5$,
- numbers $\equiv 2 \pmod 5$,
- numbers $\equiv 3 \pmod 5$,
- numbers $\equiv 4 \pmod 5$.

If $k \equiv r \pmod 5$, write $k = 5q + r$. Then
$$
\zeta^k = \zeta^{5q + r} = (\zeta^5)^q \zeta^r = \zeta^r.
$$

So each residue class contributes the same factor repeated 400 times. We get
$$
f(\zeta) = \bigl((1+\zeta^0)(1+\zeta^1)(1+\zeta^2)(1+\zeta^3)(1+\zeta^4)\bigr)^{400}.
$$

Let
$$
A = \prod_{r=0}^{4} (1 + \zeta^r).
$$

Then
$$
f(\zeta) = A^{400}.
$$

Now we compute $A$ using the polynomial $z^5 - 1$.

The 5th roots of unity are the roots of $z^5 - 1 = 0$. The four nontrivial ones $\zeta,\zeta^2,\zeta^3,\zeta^4$ are roots of
$$
g(z) = z^4 + z^3 + z^2 + z + 1.
$$

Then
$$
g(-z) = z^4 - z^3 + z^2 - z + 1 = (z + \zeta)(z + \zeta^2)(z + \zeta^3)(z + \zeta^4).
$$

Evaluate at $z = 1$:
$$
g(-1) = 1 - 1 + 1 - 1 + 1 = 1
= (1 + \zeta)(1 + \zeta^2)(1 + \zeta^3)(1 + \zeta^4).
$$

Now multiply by $(1+1)$ to include the $r=0$ factor:
$$
A = (1+1)(1 + \zeta)(1 + \zeta^2)(1 + \zeta^3)(1 + \zeta^4)
= 2 \cdot g(-1) = 2.
$$

So:
$$
f(\zeta) = A^{400} = 2^{400}.
$$

The same argument works for $\zeta^2, \zeta^3, \zeta^4$ because multiplying exponents by $2,3,4$ just permutes the residues $0,1,2,3,4$.

Thus:
$$
f(\zeta) = f(\zeta^2) = f(\zeta^3) = f(\zeta^4) = 2^{400}.
$$

---

## 6. Putting it all together

From before:
- $f(1) = 2^{2000}$,
- $f(\zeta) = f(\zeta^2) = f(\zeta^3) = f(\zeta^4) = 2^{400}$.

So the number of subsets of $\{1,2,\dots,2000\}$ whose sum is divisible by 5 is
$$
\begin{aligned}
C_0 + C_5 + C_{10} + \dots
&= \frac{1}{5}\big(f(1) + f(\zeta) + f(\zeta^2) + f(\zeta^3) + f(\zeta^4)\big) \\
&= \frac{1}{5}\big(2^{2000} + 4\cdot 2^{400}\big).
\end{aligned}
$$

So the final answer is
$$
\boxed{\displaystyle \frac{2^{2000} + 4\cdot 2^{400}}{5}}.
$$

Behind the scenes, we:

1. Encoded all subsets in a polynomial,
2. Used evaluation at special points ($1$, $-1$, roots of unity) to **filter** the exponents we care about,
3. And exploited symmetry when the size of the set is a multiple of the modulus.

This is exactly the kind of trick that shows up all over combinatorics, number theory, and eventually in representation theory of cyclic groups.
