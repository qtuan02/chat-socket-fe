---
title: Tailwind v4 — Use Design Tokens, Not Arbitrary Values
impact: HIGH
impactDescription: Themeability via CSS variables; dark mode "just works"; no one-off pixel values bleeding through the design.
tags: tailwind, tailwind-v4, design-tokens, theming, css-variables
---

## Tailwind v4 — Use Design Tokens, Not Arbitrary Values

**Impact: HIGH (Tailwind v4 is CSS-first; arbitrary values bypass the theme and break dark mode)**

Tailwind v4 is configured **CSS-first** through `src/globals.css` using `@theme inline { … }`. All colors, radii, and other design primitives are exposed as CSS variables (`--color-background`, `--color-primary`, `--color-muted-foreground`, `--radius-lg`, etc.) which map to the named utilities (`bg-background`, `text-muted-foreground`, `rounded-lg`). Hard-coded color hexes, RGBA strings, and arbitrary pixel values bypass the theme — they will not respond to dark mode, will not match the design-system primitives, and will not be themable in the future.

There is **no `tailwind.config.js`** in v4 — never re-introduce one to "register" a custom color. Add the variable in `globals.css` and use it.

**Incorrect (arbitrary values + raw hex colors):**

```tsx
<div className="bg-[#0f172a] text-[#e2e8f0]">
  <p className="text-[14px] leading-[1.45]">…</p>
  <span style={{ color: "rgb(99, 102, 241)" }}>brand</span>
</div>

<div className="rounded-[8px] p-[13px]">…</div>

<button className="bg-blue-500 hover:bg-blue-600">Save</button>

<form className="bg-white dark:bg-slate-900">
  <input className="border-gray-300 dark:border-gray-700" />
</form>
```

**Correct (token utilities + theme variables):**

```tsx
<div className="bg-background text-foreground">
  <p className="text-sm leading-snug">…</p>
  <span className="text-primary">brand</span>
</div>

<div className="rounded-lg p-3">…</div>

<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Save
</button>

<form className="bg-card text-card-foreground">
  <input className="border-border" />
</form>

/* src/globals.css */
@theme inline {
  --color-sidebar-accent: var(--sidebar-accent);
}
```

**Conventions:**
- The canonical color palette is exposed as semantic tokens: `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, plus any feature-scoped variants. Use these for product UI — never raw Tailwind hue scales (`slate-500`, `blue-600`).
- Each color has a `*-foreground` companion (`bg-primary` ↔ `text-primary-foreground`). Always pair them.
- Opacity uses the slash modifier (`bg-primary/90`, `text-foreground/60`) — not arbitrary `rgba()` strings.
- Radii come from the `--radius-*` scale: `rounded-sm`, `rounded`, `rounded-md`, `rounded-lg`, `rounded-xl`. The base `--radius` lives in `:root` so a single edit re-themes the whole app.
- Spacing/typography: prefer the default scale (`p-1` … `p-12`, `text-xs` … `text-3xl`). Arbitrary values (`p-[13px]`, `text-[15px]`) are only allowed for genuinely one-off, design-specified pixels with a code comment explaining why.
- Dark mode is wired via `@custom-variant dark (&:is(.dark *))` in `globals.css`. Adding `.dark` to `<html>` (or a parent) is the only switch — components must not hardcode `dark:bg-…` to specific palette colors. The token utilities already handle it.
- **No `tailwind.config.js`**. Adding a new token = one new line in `@theme inline { }` plus the `:root { --foo: … }` value. Never reach for a JS config in v4.

Reference: [Tailwind v4 — Theme Variables](https://tailwindcss.com/docs/theme), [Tailwind v4 — Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
