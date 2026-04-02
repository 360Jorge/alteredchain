---
title: "Putnam 2016 A1"
description: "My handwritten exploration, Dr. Pragel’s explanation, and the reasoning behind why the smallest integer j is 8."
pubDate: 2025-11-05
tags: ["Putnam", "Number Theory", "Polynomials", "Divisibility"]
---
  
> Find the smallest positive integer $j$ such that for every polynomial $p(x)$ with integer coefficients and for every integer $k$,  
> $$
> p^{(j)}(k) = \left.\frac{d^j}{dx^j}p(x)\right|_{x=k}
> $$
> is divisible by $2016$.
>
> (That is, the $j$-th derivative of $p(x)$ at $k$ is always a multiple of $2016$.)


---

## My first thoughts

I started by writing a general polynomial:
$$
p(x) = a_nx^n + a_{n-1}x^{n-1} + \dots + a_0.
$$

Then,
$$
p'(x) = n a_n x^{n-1} + (n-1)a_{n-1}x^{n-2} + \dots + a_1.
$$

At first, I thought about taking something extreme like $p(x) = x^{2016}$, but the question asks for the **smallest** $j$.  
So I tried a simpler test case: let $p(x) = x^j$.

Then the $j$-th derivative is
$$
p^{(j)}(x) = j!.
$$

Since the problem says $p^{(j)}(k)$ must be divisible by $2016$ for *every* integer polynomial and *every* integer $k$, it must also hold for this one.  
That means
$$
2016 \mid j!.
$$

---

## Checking when $j!$ becomes divisible by 2016

We can factor $2016$ as:
$$
2016 = 2^5 \times 3^2 \times 7.
$$

Now, count how many times each prime appears in $1 \times 2 \times 3 \times \dots \times j$.

| Prime | How to count | Needed power | Smallest $j$ that works |
|:------|:--------------|:--------------|:------------------------|
| 2 | appears in 2, 4, 6, 8, ... | $2^5$ | $j=8$ |
| 3 | appears in 3, 6 | $3^2$ | $j=8$ |
| 7 | appears in 7 | $7^1$ | $j=7$ |

At $j = 8$,
$$
8! = 40320 = 2^7 \times 3^2 \times 5 \times 7,
$$
which contains all the required factors.  
So $j \ge 8$.

---

## Dr. Pragel’s whiteboard explanation

Dr. Pragel showed a cleaner way to express everything.

He reminded us that
$$
n(n-1)\dots(n-k+1) = k! \binom{n}{k}.
$$

That means for any $n \ge k$,
$$
\frac{d^k}{dx^k}x^n = n(n-1)\dots(n-k+1)x^{n-k} = k!\binom{n}{k}x^{n-k}.
$$

Now, for a general polynomial
$$
p(x) = \sum_{m=0}^{n} a_m x^m,
$$
its 8th derivative is
$$
p^{(8)}(x) = \sum_{m=8}^{n} a_m\,m(m-1)\cdots(m-7)\,x^{m-8}.
$$

We can rewrite that as
$$
p^{(8)}(x) = 8! \sum_{m=8}^{n} a_m \binom{m}{8}x^{m-8}.
$$

Then for any integer $k$:
$$
p^{(8)}(k) = 8! \sum_{m=8}^{n} a_m \binom{m}{8}k^{m-8}.
$$

Here:
- $a_m$ are integers (since $p(x)$ has integer coefficients),
- $\binom{m}{8}$ is an integer,
- $k^{m-8}$ is an integer.

So the entire sum is an integer multiple of $8!$.  
And because
$$
8! = 40320 = 20 \times 2016,
$$
it follows that $2016 \mid p^{(8)}(k)$ for every integer polynomial $p$ and every integer $k$.

---

## Putting it all together

We’ve shown two parts:

1. **Necessity:**  
   If $j < 8$, then $j!$ is not divisible by $2016$.  
   So smaller $j$ fail.

2. **Sufficiency:**  
   If $j = 8$, then $p^{(8)}(k)$ is always divisible by $2016$.

Therefore, the smallest integer that works is:
$$
\boxed{j = 8.}
$$

---

## My reflection

I really liked this problem because it mixes combinatorics, number theory, and calculus.  
At first, it looks like it’s all about derivatives, but the heart of it is really in the **divisibility of factorials** and the **structure of integer polynomials**.

**Final Answer:**  
$$
j = 8.
$$


### Additional Note

After solving it this way, I checked the official solution from the [Putnam Archive](https://kskedlaya.org/putnam-archive/), which confirmed that $j = 8$ is correct.  
The archive’s proof uses the same key insight that Dr. Pragel pointed out — connecting $n(n-1)\dots(n-k+1)$ to $k!\binom{n}{k}$ to formalize why $8!$ (and therefore $2016$) divides $p^{(8)}(k)$ for all integer polynomials.