---
title: "Lessons Learned: Making Animated Math Work in Astro + React + MDX"
description: "A behind-the-scenes look at how I combined Framer Motion animations, MathJax rendering, and Astro content to create smooth visual math walkthroughs."
pubDate: "2025-05-26"
tags: ["astro", "react", "mdx", "mathjax", "framer-motion", "lessons learned"]
heroImage: '/animation_960x480.png'
---

## The Journey

Today, I tackled a surprisingly tricky challenge: combining **Astro**, **React**, **MDX**, **Framer Motion animations**, and **MathJax** to create animated math walkthroughs on my blog.

What I thought would be a quick integration turned into a deep dive into how these technologies interact — and thanks to debugging and persistence, I finally made it work! Here are the key lessons I learned, which might help you avoid the same pitfalls.

## Integration Isn’t Always Plug-and-Play

Astro is a static-site builder that renders most content at build time. But React components run on the client side — meaning you need to tell Astro when to hydrate them using directives like `client:load` or `client:visible`.

**Lesson:** Without these hydration directives, the animations or math re-rendering won't work because Astro leaves the React components inert.

## MDX Needs Careful Syntax

When combining React components and Markdown inside `.mdx` files, even a small syntax issue can cause blank pages or break the build.

**Lesson:** Double-check every prop, closing tag, and embedded JSX block. MDX requires very precise, valid syntax.

## MathJax Needs to Re-run After Hydration

React updates the DOM, but MathJax only typesets math expressions when you call it. Without a refresh, your LaTeX won't render properly.

**Lesson:** Use a React `useEffect` hook inside your animated components to call `window.MathJax.typesetPromise()` or similar after the component mounts.

## Keep Layers Separated

I initially mixed Astro layouts and React hydration too tightly, which caused hydration errors and white screens.

**Lesson:** Keep `.astro` files responsible for layout and server-rendered parts, and delegate all dynamic or animated behavior to `.tsx` React components with clear data passing.

## What I Unlocked

- Integrated React into an Astro + MDX project.
- Hooked up Framer Motion animations inside React components.
- Managed MathJax refresh inside React hydration.
- Debugged complex integration errors.

## Where I'm Going Next

This project revealed gaps in my React knowledge that I'm excited to close! Here are the resources I'm planning to study next:

[React Docs: Thinking in React](https://react.dev/learn/thinking-in-react)

[Framer Motion Docs](https://motion.dev/)

[Astro + React Integration Guide](https://docs.astro.build/en/guides/integrations-guide/react/)

If you're curious about the final working pattern or want to implement animated math walkthroughs on your own site, feel free to reach out or follow along on my blog!

**This was a challenging but rewarding step forward in building richer, more interactive math content.** On to the next adventure!

Big thanks to ChatGPT for walking me through this and helping me debug.