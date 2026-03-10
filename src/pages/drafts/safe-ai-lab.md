---
title: "Building a Safe AI Lab: Ubuntu VM + Firewall + Base Hardening (for OpenClaw experiments)"
description: ""
pubDate: 2026-02-20
---

When you run autonomous agents — especially ones capable of executing tools, writing files, or interacting with the network — your biggest mistake is not technical.

It's architectural.

Most people install an agent on their main machine, run it once, feel brave, and accidentally grant it access to their browser cookies, SSH keys, or home directory.

So before touching OpenClaw, I wanted something else:

> A disposable machine where mistakes are expected.

This post documents the creation of that environment — a minimal, isolated Ubuntu lab where an agent can run, break things, and be reset instantly.

---

## Why a Virtual Machine?

Agents are fundamentally different from normal programs.

They don't just execute instructions — they *decide what to execute next*.
That means you are not only debugging code. You are debugging behavior.

A VM gives three essential guarantees:

1. **Containment** — the agent cannot touch the host OS
2. **Observability** — you can inspect every action
3. **Reversibility** — snapshots undo everything

Think of it less like software installation and more like constructing a wind tunnel for intelligence.

---

## Step 1 — Install Ubuntu (LTS)

I installed **Ubuntu 24.04 LTS** inside VirtualBox.

Key choice:

> Always use an LTS release for agent experimentation.

Rolling releases change system behavior under you.
Agents depend heavily on stable assumptions: filesystem layout, package versions, networking behavior.

During installation I chose:

* Erase disk (inside VM)
* Normal installation
* No proprietary extras

This keeps the system deterministic and minimal.

---

## Step 2 — First Boot: Do Nothing Yet

Before installing *any* tools:

Create a snapshot.

Call it:

```
fresh-install
```

This is your "time machine anchor".

If your lab ever becomes cursed (and it will), you return here instead of reinstalling the OS.

---

## Step 3 — Add a Default-Deny Firewall

An agent should not automatically have internet freedom.

We enable UFW and immediately block private network ranges:

```bash
sudo apt install ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

Now block local network lateral movement:

```bash
sudo ufw deny out to 10.0.0.0/8
sudo ufw deny out to 172.16.0.0/12
sudo ufw deny out to 192.168.0.0/16
sudo ufw deny out to 169.254.0.0/16
```

Check:

```bash
sudo ufw status
```

Why this matters:

> If an agent escapes its task, the first thing it will discover is your LAN.

Printers, NAS drives, routers — those are extremely predictable targets for exploratory software. We remove that possibility entirely.

**A note on outgoing internet access:** You'll notice we're only blocking private network ranges, not the public internet. This is an intentional tradeoff for a development environment — OpenClaw needs to reach APIs, download packages, and do real work. If you're running a more sensitive experiment and want full isolation, add `sudo ufw default deny outgoing` and whitelist only the specific domains you need. For most OpenClaw work, the LAN block is enough.

---

## Step 4 — Fix DNS Explicitly

Inside virtual environments, DNS resolution often fails silently, and silent failures are the worst kind — they produce confusing errors far away from the actual cause.

We define resolvers explicitly:

Edit:

```
/etc/netplan/01-network-manager-all.yaml
```

Add:

```yaml
nameservers:
  addresses: [8.8.8.8, 1.1.1.1]
```

Apply:

```bash
sudo netplan apply
```

Test:

```bash
ping google.com
```

This eliminates a huge class of phantom bugs later. If your agent can't reach a URL, you want that to be a deliberate firewall decision — not a silent DNS misconfiguration.

---

## Step 5 — Install Sandboxing Tools

Before installing OpenClaw, install runtime containment:

```bash
sudo apt install firejail
```

**Honest caveat:** I haven't gotten Firejail fully working alongside OpenClaw yet. The two don't integrate cleanly out of the box, and I'm still working through it. I'm installing it now so it's available when I figure that out — and because the habit of having a sandbox tool present matters, even if you're not using it on every run.

When it does work, the pattern looks like this:

```bash
# Run a tool with no network access and a temporary home directory
firejail --net=none --private tool-name

# Run with network but restricted filesystem
firejail --private --read-only=/etc tool-name
```

The idea is that even within the VM, individual tools can be further constrained. If you get this working before I do, I'd genuinely like to hear how.

---

## Step 6 — Take a Clean Lab Snapshot

Now create a second snapshot:

```
base-lab-ready
```

At this point the machine has:

* stable OS
* working network
* controlled network scope
* sandbox capability (in progress)

This is the real starting point — not the OS install.

---

## The Mental Model

This environment is not your development machine.

It is:

> A behavioral test chamber for autonomous software.

You should feel comfortable letting an agent:

* write files
* execute commands
* crash repeatedly
* misconfigure itself

Because the correct workflow is not:

> fix everything

It is:

> observe → snapshot → rollback → iterate

---

## Next Step

Only now should you install Node, pnpm, and OpenClaw.

Because from this point on, the question changes from:

> "Will this break my computer?"

to

> "What interesting failure mode will I learn today?"

And that is the moment experimentation becomes productive instead of stressful.
