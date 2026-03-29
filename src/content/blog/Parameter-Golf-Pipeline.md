---
title: "Understanding train_gpt.py: A Complete Mental Model of the Parameter Golf Pipeline"
description: "A deep breakdown of the full training, evaluation, and compression pipeline — and where the real optimization levers are."
pubDate: 2026-03-29
---

> *This post is not about training a model. It's about understanding a system under constraints.*

I've been working on OpenAI's **Parameter Golf Challenge**, and at some point I realized something important:

I didn't actually understand the script I was running.

So instead of tweaking hyperparameters blindly, I sat down and broke down the entire pipeline — from data loading to compression — until every piece made sense.

This post is that breakdown of the **original baseline script**, plus the deeper mechanics that actually matter for competitive optimization.

---

# The Big Picture

At first glance, `train_gpt.py` looks like a standard training script.

It's not.

It is a **full pipeline**:

```text
train → evaluate → compress → reload → evaluate again → score
```

And the most important part?

> The final score is computed **after compression**, not before.

---

# The Real Objective

You are not optimizing loss directly.

You are optimizing:

$$
\text{bits per byte (bpb)}
$$

under two constraints:

* artifact size ≤ **16MB**
* training time ≤ **~10 minutes**

So every decision in the script is balancing:

* model quality
* compression efficiency
* training speed

---

# Data Pipeline: Everything Starts as Tokens

The model never sees raw text.

It sees **tokens**, which are integers from a SentencePiece vocabulary:

```text
[73, 418, 12, 999, ...]
```

## Training Data

* streamed sequentially from shards
* not randomly sampled
* split across GPUs into disjoint chunks

Think of it as a **long tape of tokens**.

## Sequence Construction

From a chunk of tokens:

```text
[10, 11, 12, 13, 14]
```

we build:

```text
x = [10, 11, 12, 13]
y = [11, 12, 13, 14]
```

So the model learns:

> given previous tokens, predict the next one

Then we reshape into fixed-length sequences.

---

# The Model: A Compressed Transformer

The architecture is a **decoder-only transformer**, with several efficiency-oriented choices:

* grouped-query attention (GQA)
* RoPE positional encoding
* ReLU² MLP
* RMSNorm
* learned skip connections across layers

The forward pass returns:

```text
mean cross-entropy over all tokens
```

Mathematically:

$$
\frac{1}{N} \sum_t -\log p(y_t \mid x_{\le t})
$$

This is measured in **nats**.

But the architecture has several non-obvious components that are worth understanding deeply.

---

## The U-Net Skip Structure

The skip connections here are load-bearing for the whole design, not decorative.

`GPT.forward()` does this:

```python
for i in range(self.num_encoder_layers):
    x = self.blocks[i](x, x0)
    skips.append(x)
for i in range(self.num_decoder_layers):
    if skips:
        x = x + self.skip_weights[i] * skips.pop()  # reverse order
    x = self.blocks[self.num_encoder_layers + i](x, x0)
```

This is a **U-Net in depth** — the encoder half stores activations, the decoder half fuses them in *reverse order*. It's not a vanilla residual network. It has two superimposed residual streams, both learnable.

Additionally, every block receives `x0` — the **original embedding from layer zero** — as a second input. The `resid_mix` parameter in each block controls how much to blend the current residual stream `x` against this original embedding:

```python
mix = self.resid_mix.to(dtype=x.dtype)
x = mix[0][None, None, :] * x + mix[1][None, None, :] * x0
```

`resid_mix` is initialized as `[1, 0]` — pure residual, ignore `x0` — but it can learn to blend in the original token representation at any layer.

**Why this matters for optimization:** `num_layers` is not just a depth knob. With 9 layers, encoder gets 4 and decoder gets 5, meaning `num_skip_weights = 4`. Changing depth changes the U-Net topology. The skip weights are also `num_skip_weights × model_dim` additional parameters that get quantized. Different depth splits express different inductive biases, and symmetric splits (e.g. 8 layers → 4/4) have different behavior than asymmetric ones.

---

## The Block's Internal Control Surfaces

Each `Block` has three learnable parameters beyond the attention and MLP weights:

```python
self.attn_scale = nn.Parameter(torch.ones(dim))   # scales attention output
self.mlp_scale  = nn.Parameter(torch.ones(dim))   # scales MLP output
self.resid_mix  = nn.Parameter(...)                # blends x vs x0
```

`attn_scale` and `mlp_scale` start at 1.0 — full contribution — but the model can learn to zero them out per-dimension, effectively doing learned gating of sublayers. This is a fine-grained residual branch controller, not just a scalar gain.

These are all listed in `CONTROL_TENSOR_NAME_PATTERNS`, which has two consequences:

1. They stay in **fp32** throughout training, even when the rest of the model runs in bf16
2. They are **not quantized to int8** during compression — they pass through at fp16 precision

This is deliberate. These scalars have outsized influence on model behavior, so quantization error in them would be destructive to the final score. The script protects them explicitly.

---

## The Q-Gain Mechanism

```python
self.q_gain = nn.Parameter(torch.full((num_heads,), qk_gain_init))  # default 1.5
# ...
q = F.rms_norm(q, (q.size(-1),))
k = F.rms_norm(k, (k.size(-1),))
# ...
q = q * self.q_gain[None, :, None, None]
```

Q and K are both RMSNorm'd to unit norm *before* RoPE is applied. Then Q is re-scaled by a learnable per-head scalar `q_gain`, initialized at 1.5. This is essentially learning a **per-head attention temperature**. Higher gain → sharper attention distributions. Initializing above 1.0 means attention starts slightly sharper than neutral.

This is different from standard `1/sqrt(d_k)` scaling, which is a fixed constant. Here it's a trained parameter, so each head can independently learn how concentrated its attention should be.

---

# The Muon Optimizer: Why It's the Core of This Script

Muon is used for all 2D matrix parameters in the transformer blocks. Understanding what it actually does matters if you're tuning anything.

Muon applies **Newton-Schulz orthogonalization** to the gradient before the update:

```python
g = zeropower_via_newtonschulz5(g, steps=backend_steps)
g *= max(1, g.size(0) / g.size(1)) ** 0.5
p.add_(g, alpha=-lr)
```

The Newton-Schulz iteration projects the gradient onto (approximately) the Stiefel manifold — it normalizes 2D update matrices to be near-orthogonal. The practical effect: **all matrix updates get roughly equal Frobenius norm**, regardless of raw gradient scale. It's scale-invariant by construction.

Embeddings, scalar parameters, and the LM head use Adam with separate learning rates. The optimizer split is:

* `embed_lr = 0.6` — token embeddings (Adam)
* `tied_embed_lr = 0.05` — when embeddings are tied (Adam, much lower)
* `matrix_lr = 0.04` — transformer block matrices (Muon)
* `scalar_lr = 0.04` — vectors and scalars (Adam)
* `head_lr = 0.008` — untied LM head if used (Adam)

These are **not interchangeable with standard Adam learning rates**. Muon's orthogonalized updates behave very differently from Adam's adaptive ones. If you change architecture and re-tune, these need to be reconsidered together.

## Muon Momentum Warmup

There's also a momentum warmup specific to Muon:

```python
muon_momentum = (1 - frac) * 0.85 + frac * 0.95
```

This ramps momentum from 0.85 to 0.95 over `muon_momentum_warmup_steps` (default 500). Early steps use lower momentum to prevent instability from the orthogonalized gradient updates before the model has settled into a useful region.

`muon_backend_steps=5` controls how many Newton-Schulz iterations run per optimizer step. More steps = more accurate orthogonalization = more compute per step. This is a speed/quality tradeoff within the optimizer itself.

---

# Training Loop: Simulating Larger Batches

The script uses **gradient accumulation**:

```text
microbatch → backward → accumulate → update
```

`grad_accum_steps = 8 // world_size`. On a single GPU, that's 8 microsteps per optimizer update. The effective batch is always `train_batch_tokens = 524288` tokens. Each microstep processes `524288 / 8 = 65536` tokens. Changing `train_seq_len` changes how many sequences are in each microstep, but not the total token count.

## Time-Based Stopping

Training does not run for a fixed number of steps. It stops when:

```text
wallclock time > MAX_WALLCLOCK_SECONDS
```

This is subtle and important. The LR warmdown is also time-based, not step-based:

```python
remaining_ms = max(max_wallclock_ms - elapsed_ms, 0.0)
return remaining_ms / max(warmdown_ms, 1e-9) if remaining_ms <= warmdown_ms else 1.0
```

This means: if your model is slower to train (e.g., you increased `model_dim`), the warmdown starts proportionally earlier in training. Making your model faster doesn't just give you more steps — it also buys a longer high-LR training phase before warmdown kicks in.

---

# Evaluation: Sliding Windows Without Overlap

The validation set is treated as one long sequence of tokens, evaluated in **fixed-length, non-overlapping windows**.

## Window Construction

Each window has length `TRAIN_SEQ_LEN` and produces:

```text
x = tokens[start : start + seq_len]
y = tokens[start + 1 : start + seq_len + 1]
```

With stride equal to `seq_len`, windows don't overlap:

```text
tokens: t0 t1 t2 t3 t4 t5 t6 t7 t8 t9 ...

Window 1: x = t0..t7  →  y = t1..t8
Window 2: x = t8..t15 →  y = t9..t16
```

Each token is evaluated exactly once. Leftover tokens that don't fill a full sequence are dropped.

## A Subtle Limitation

Even though evaluation uses full-length windows, the model has no access to context *across* window boundaries. Each window is independent. So the evaluation measures:

> how well the model predicts tokens given a fixed-length local context

Longer `TRAIN_SEQ_LEN` gives the model more context per prediction — but also means fewer total predictions from the same validation set, and each microstep covers fewer sequences.

## From Loss to Bits Per Byte

For each prediction:

$$
-\log p(\text{token})
$$

These are summed and averaged to produce `val_loss` in nats. Then:

$$
\text{bits/token} = \frac{\text{val\_loss}}{\ln 2}
$$

$$
\text{bpb} = \text{bits/token} \times \frac{\text{tokens}}{\text{bytes}}
$$

The `tokens_per_byte` ratio is tokenizer-dependent. This is why the script uses BPB instead of raw loss: it normalizes for tokenization efficiency, making results comparable across different vocabularies.

---

# Compression: The Hidden Objective

After training, the model is quantized to int8 and compressed with zlib. This is not a post-hoc detail — it shapes what you should be optimizing for throughout training.

## How the Quantization Works

For 2D weight matrices, quantization is **per-row**:

```python
clip_abs = torch.quantile(t32.abs(), 0.9999984, dim=1)
scale = (clip_abs / 127.0).clamp_min(1.0 / 127.0)
q = clamp(round(t / scale), -127, 127).to(torch.int8)
```

Each row of a weight matrix gets its own scale factor, stored as fp16 alongside the int8 values. The 99.99984th percentile clip means extreme outliers get clipped to prevent scale inflation.

For vectors and scalars (1D tensors), quantization is per-tensor with a single scale.

**What this means for training:** Rows with large magnitude variance quantize poorly — a single high-activation row forces the scale up, making everything else coarser. Rows with uniform magnitude quantize cleanly. All else equal, prefer training dynamics that produce weight matrices with consistent row norms.

## What Gets Stored

The submission artifact contains:

* int8 matrices with per-row fp16 scales
* int8 vectors with per-tensor scales
* control tensors (`attn_scale`, `mlp_scale`, `resid_mix`, `q_gain`, `skip_weights`) passed through at fp16 — never quantized
* small tensors (≤65536 elements) stored as fp16

The zlib step then re-encodes the int8 values. Values that cluster (lots of near-zero entries, low-rank structure) compress much better than uniformly distributed ones. So weight matrices that are sparse or approximately low-rank in their int8 representation get a free compression bonus.

## The Roundtrip Is the Real Score

The script always does this at the end:

```python
base_model.load_state_dict(dequantize_state_dict_int8(quant_state), strict=True)
q_val_loss, q_val_bpb = eval_val(...)
log0(f"final_int8_zlib_roundtrip val_loss:{q_val_loss:.4f} val_bpb:{q_val_bpb:.4f}")
```

It reloads the compressed model and evaluates it again. That number is your actual score. The gap between pre-compression and post-compression bpb is a direct measure of how much the quantization hurt your model. Some configurations degrade gracefully; others collapse.

**The single most informative experiment you can run:** measure the compression roundtrip gap across different configurations. Some model shapes compress much more gracefully than others.

---

# The Tied Embedding Asymmetry

When `tie_embeddings=True` (the default), `tok_emb.weight` serves double duty: it's both the input embedding matrix and the lm_head projection.

This has several cascading effects:

* Initialized with `std=0.005` — much smaller than typical embedding init
* Uses `tied_embed_lr=0.05`, far lower than `embed_lr=0.6` for untied embeddings
* Receives gradient from both the embedding lookup and the output projection simultaneously

The lower LR and smaller init exist because tied embeddings are pulled in two directions at once (input representation vs. output discrimination) and can destabilize training if the scale gets too large. The `logit_softcap=30.0` further constrains the output: logits are passed through `30 * tanh(logit / 30)`, which bounds them to `(-30, 30)` regardless of embedding magnitude.

**Vocab size interacts with this directly.** With tied embeddings, `vocab_size × model_dim` is a large fraction of total parameters. At the baseline of 1024 vocab × 512 dim, that's ~500K parameters just in the embedding table. Larger vocab improves tokenization efficiency (better `tokens_per_byte` in the bpb denominator), but consumes more of the size budget. This is a real tradeoff that changes the competitive calculus.

---

# Where the Real Optimization Levers Are

With the full mechanics in hand, here's where to actually look for gains:

**Model capacity vs. compression tradeoff.** The baseline is 512-dim, 9 layers, vocab 1024. Increasing `model_dim` helps quality but increases byte count roughly linearly (int8 quantization means bytes ≈ parameters). The quality gain is sublinear in parameters. The sweet spot for the 16MB budget is almost certainly not the baseline config.

**U-Net topology.** Changing `num_layers` changes the encoder/decoder split. 8 layers gives a symmetric 4/4 split; 9 gives 4/5. Different splits have different representational capacity and different numbers of skip weights. This is not just a FLOP knob.

**Vocab size vs. tokenization efficiency.** 1024 tokens means very short pieces, many tokens per byte, which inflates the bpb numerator. Larger vocab = more compression efficiency = lower `bits/token × tokens/byte` — but also more parameters in the embedding table. The break-even depends on model size.

**Warmdown and wall-clock budget.** Since warmdown is time-based, faster training directly extends the high-LR phase. Anything that speeds up the inner loop — sequence length, batch shape, architectural simplification — buys more effective training, not just more steps.

**Compression-aware weight structure.** Because zlib compresses structured data well, training regularizers that push toward low-rank or sparse weight matrices could improve the compression ratio beyond what quantization alone achieves. This is speculative but grounded in how zlib works.

---

# The Real Insight

At some point, it clicked:

> This is not just training a model.

It is:

> **designing a system that balances learning, measurement, and compression under constraints**

The target is not `val_loss` of the bf16 model. It's `val_bpb` of the *dequantized* model, under a size budget, within a time budget.

There are three places to improve:

1. **Evaluation** → how performance is measured (tokenizer, vocab, bpb denominator)
2. **Training** → what the model learns (architecture, optimizer, schedule)
3. **Compression** → what survives (quantization behavior, zlib structure)

Every hyperparameter in this script touches at least two of those three. Understanding which one it primarily affects is what separates systematic optimization from blind tuning.
