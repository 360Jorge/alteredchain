---
title: "Astro Crash Course: Build Lightning-Fast Sites With Ease"
description: "A quick guide for learning Astro the practical way, perfect for small business sites, blogs, and component-driven projects."
pubDate: 2025-06-15
tags: ["astro", "web development", "crash course", "beginner"]
---


If you're just getting started with Astro — or stumbled into layout issues while building your first site like I did — this quick crash course will help you get on track.

Whether you're creating a personal blog or a full website for a small business, Astro makes it simple, clean, and blazing fast.

---

## 🔥 What is Astro?

**Astro** is a modern web framework that:
- Uses components (like React, Vue, etc.)
- Ships **zero JavaScript by default** ⚡
- Optimizes for speed and content-heavy sites
- Supports `.astro`, `.jsx`, `.mdx`, `.ts`, and more

It's perfect for sites that are mostly content but might need sprinkles of interactivity.

---

## 📁 Project Structure Overview

| Folder/File         | Purpose                                                  |
|---------------------|-----------------------------------------------------------|
| `src/pages/`        | Each `.astro` file becomes a page. `index.astro` = homepage |
| `src/layouts/`      | Layout templates (like headers, footers, wrappers)       |
| `src/components/`   | Reusable building blocks (`Hero.astro`, etc.)            |
| `public/`           | Static assets (images, fonts, etc.)                      |
| `astro.config.mjs`  | Main config file                                         |
| `package.json`      | npm dependencies and scripts                             |

---

## 🧠 Anatomy of an `.astro` File

```astro
---
const { title } = Astro.props;
import MyComponent from '../components/MyComponent.astro';
---

<h1>{title}</h1>
<MyComponent />

```

This is a blend of JavaScript and HTML — with component logic in the top block.

## 📦 Layouts: Wrapping Your Pages

A **layout** is like a page shell. It wraps pages with a consistent structure.

#### Layout.astro

```astro
---
const { title = "My Site" } = Astro.props;
---
<html>
  <head><title>{title}</title></head>
  <body>
    <slot /> <!-- Page content goes here -->
  </body>
</html>

```

#### Page using a layout:

```
---
layout: ../layouts/Layout.astro
title: "Homepage"
---
<h1>Welcome to my site!</h1>

```

✅ Tip: Don't put full page content inside your layout. Use it only as a wrapper.

## 🧩 Components

Create reusable building blocks:

#### Hero.astro

```
<section class="bg-yellow-100 p-6">
  <h1>¡Hola desde el Hero!</h1>
</section>
```

Then import and use it:

```
---
import Hero from '../components/Hero.astro';
---
<Hero />
```

You can also use React or Vue components with directives like `client:load`.

## 🛠 Dev Workflow

```
npm install      # install dependencies
npm run dev      # start local dev server
```

Then visit: http://localhost:4321

## 🚀 Deployment

- Astro works great on Vercel and Netlify
- Connect your GitHub repo → auto builds + previews

## 💡 Common Mistake: Layout Confusion

It’s easy to accidentally paste your homepage content into the layout file. But remember:

- `Layout.astro` is just a wrapper — use `<slot />` to include child content
- Your real content goes in `pages/index.astro`
- Use `layout: ../layouts/Layout.astro` at the top of your page

Once you internalize that, Astro becomes really fun to use 🚀

## 📚 Want to Learn More?

[Official Astro Docs](https://docs.astro.build/en/getting-started/)

[Component Islands Architecture](https://docs.astro.build/en/concepts/islands/)

[Astro + Tailwind Guide](https://docs.astro.build/en/guides/styling/#tailwind)

## 🎉 Keep Learning by Doing

I personally learn best by building, breaking, and fixing — so if you're doing the same, you're on the right path.