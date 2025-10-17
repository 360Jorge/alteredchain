---
title: "Verifying the GVZ Property in GAP: A Computational Approach"
description: "We explore how to check whether a finite group is a GVZ-group using GAP, character theory, and code. Includes visual flow and example analysis."
pubDate: 2025-07-09
tags: ["representation theory", "GVZ groups", "GAP", "character theory", "computational algebra"]
heroImage: '/blog-placeholder-4.jpg'
---

<section class="prose mx-auto px-4 py-8">

As part of our research with Dr. Harmon, we aim to verify whether certain finite groups satisfy the **GVZ property**, meaning that for every nonlinear irreducible character $\chi$, the subgroups defined by the values of $\chi$ coincide:
$$
V(\chi) = Z(\chi)
$$

We implemented this test in [GAP](https://www.gap-system.org), a system for computational discrete algebra with powerful character theory tools.

---

## Full Flowchart of the Algorithm

```gap
START
  │
  ▼
Get character table of G:
  tbl := CharacterTable(G)
  │
  ▼
Get all irreducible characters:
  chars := Irr(tbl)
  │
  ▼
For each χ ∈ chars:
  ├─► Is χ nonlinear? (χ(1) > 1)
  │     ├─► No → skip this χ
  │     └─► Yes
  │           │
  │           ▼
  │     Initialize empty sets:
  │       V_elements := []
  │       Z_elements := []
  │           │
  │           ▼
  │     For each conjugacy class c_i:
  │       For each g ∈ c_i:
  │         ├─► If χ(c_i) ≠ 0 → add g to V_elements
  │         └─► If |χ(c_i)| = χ(1) → add g to Z_elements
  │           │
  │           ▼
  │     Form subgroups:
  │       V(χ) := Subgroup(G, V_elements)
  │       Z(χ) := Subgroup(G, Z_elements)
  │           │
  │           ▼
  │     Compare:
  │       Is V(χ) = Z(χ)?
  │         ├─► No → print failure info
  │         └─► Yes → continue
  │
  ▼
If all χ passed, return TRUE (G is GVZ)
Else, return FALSE
```

## Working GAP Code

```gap
IsGVZGroup := function(G)
  local tbl, chars, chi, vchi, zchi, isGVZ, g, v_elements, z_elements, i, ccl, class_pos;

  tbl := CharacterTable(G);
  chars := Irr(tbl);
  ccl := ConjugacyClasses(tbl);
  isGVZ := true;

  for i in [1..Length(chars)] do
    chi := chars[i];
    if chi[1] > 1 then
      v_elements := [];
      z_elements := [];

      for class_pos in [1..Length(ccl)] do
        for g in Elements(ccl[class_pos]) do
          if chi[class_pos] <> 0 then
            Add(v_elements, g);
          fi;
          if AbsoluteValue(chi[class_pos]) = chi[1] then
            Add(z_elements, g);
          fi;
        od;
      od;

      vchi := Length(v_elements) > 0 
              and Subgroup(G, v_elements) or TrivialSubgroup(G);
      zchi := Length(z_elements) > 0 
              and Subgroup(G, z_elements) or TrivialSubgroup(G);

      if vchi <> zchi then
        Print("Character ", i, " fails GVZ condition.\n");
        Print("Character degree: ", chi[1], "\n");
        Print("V(chi) size: ", Size(vchi), "\n");
        Print("Z(chi) size: ", Size(zchi), "\n");
        isGVZ := false;
      fi;
    fi;
  od;

  return isGVZ;
end;

```

## What the Code Does

We’re checking the **GVZ condition**:

For each **nonlinear irreducible character** $\chi$, define:

- $V(\chi) = \langle g \in G \mid \chi(g) \ne 0 \rangle$
- $Z(\chi) = \langle g \in G \mid |\chi(g)| = \chi(1) \rangle$

Then:

> **GVZ condition**:  
> $V(\chi) = Z(\chi)$ for all nonlinear $\chi$

If this holds for all nonlinear irreducible characters, then $G$ is a **GVZ-group**.

---

## What We Learned So Far

- We **only need to test nonlinear irreducible characters** because for linear ones (i.e., $\chi(1) = 1$), the GVZ condition is **vacuously true**:
  $$
  V(\chi) = Z(\chi) = G
  $$

- `CharacterTable(G)` pulls **precomputed symbolic data**, which is much faster and avoids looping over elements of $G$.

- `Irr(tbl)` gives us a list of **irreducible characters** as arrays of values over **conjugacy classes**, not group elements.

- `ConjugacyClasses(tbl)` returns symbolic class identifiers (not concrete sets), which is ideal for **character-theoretic computation**.

---

## Next Steps

We’ll begin running this script across batches of known **o-basis groups** to test our conjecture empirically.

We'll log each result in a `.csv` file including:

- Group ID (e.g. `SmallGroup(32,27)`)
- Character degrees
- Whether the GVZ condition holds
- Number of characters that fail the condition (if any)

Once we gather enough data, we’ll explore:

- **Machine learning** tools to detect deeper structural traits
- **Visualizations** comparing GVZ vs. o-basis patterns
- Discovering counterexamples or formulating improved conjectures