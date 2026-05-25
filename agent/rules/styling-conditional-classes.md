---
title: Conditional Classes Through `cn`
impact: MEDIUM
impactDescription: No string-concatenation bugs; conflicting utilities resolve deterministically.
tags: tailwind, cn, clsx, tailwind-merge, conditional-classes
---

## Conditional Classes Through `cn`

**Impact: MEDIUM (Template-literal class concatenation drops space separation and breaks Tailwind class precedence)**

Conditional or composed class strings always go through the `cn` helper at `@/utils/cn`. `cn` wraps `clsx` + `tailwind-merge` — it accepts strings, booleans, objects, and arrays, and resolves conflicting Tailwind utilities (`p-2` vs. `p-4`) deterministically so the *last one wins*. Template-literal concatenation, `String#concat`, and naïve `&&` joins routinely produce broken strings like `"p-2  px-4   undefined"` and let earlier utilities silently override later ones.

**Incorrect:**

```tsx
import { clsx } from "clsx";

<div
  className={`flex flex-col gap-4 p-6 ${className}`}
/>

<button
  className={
    "rounded-lg px-3 py-2" + (isActive ? " bg-primary text-primary-foreground" : "")
  }
/>

<input className={clsx("border", { "border-destructive": hasError })} />

<button className="p-2 px-4">…</button>

<aside
  className={
    [
      "h-screen",
      isCollapsed && "w-16",
      !isCollapsed && "w-64",
    ]
      .filter(Boolean)
      .join(" ")
  }
/>
```

**Correct:**

```tsx
import { cn } from "@/utils/cn";

<div className={cn("flex flex-col gap-4 p-6 md:p-8", className)} />

<button
  className={cn(
    "rounded-lg px-3 py-2",
    isActive && "bg-primary text-primary-foreground",
    isDisabled && "opacity-50 pointer-events-none",
  )}
/>

<input
  className={cn(
    "border border-input",
    hasError && "border-destructive ring-1 ring-destructive",
  )}
/>

<aside
  className={cn("h-screen transition-[width]", isCollapsed ? "w-16" : "w-64")}
/>

const exampleButtonClasses = cn(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  variant === "primary" && "bg-primary text-primary-foreground",
  variant === "ghost" && "hover:bg-accent",
  size === "sm" && "h-8 px-3",
  size === "lg" && "h-10 px-6",
  className,
);
```

**Conventions:**
- Import: `import { cn } from "@/utils/cn"`. The path is fixed by the design-system config — never `@/lib/utils` or `@/libs/utils`.
- The component's external `className` prop is **always** the last argument to `cn`. This guarantees consumer overrides win against the component's defaults, thanks to `tailwind-merge` conflict resolution.
- Use object/boolean forms for clarity:
  - `&&` for "include when truthy" (`isActive && "bg-primary"`).
  - Ternary for binary either/or (`isOpen ? "rotate-180" : "rotate-0"`).
  - Plain string for always-on classes (`"flex items-center gap-2"`).
- Long class lists: format one logical chunk per line; let the formatter handle wrapping. Don't pre-optimize length at the cost of readability.
- Never call `cn` on a value that is already a `cn` result — pass the inputs directly. Nesting is unnecessary and slightly slower.
- For complex variant grids (sizes × variants × states), reach for `class-variance-authority` (CVA). `cn` is for per-element composition; CVA is for per-component variant tables.

Reference: [tailwind-merge](https://github.com/dcastil/tailwind-merge), [clsx](https://github.com/lukeed/clsx)
