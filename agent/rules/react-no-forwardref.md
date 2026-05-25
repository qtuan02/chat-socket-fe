---
title: React 19 — `ref` is a Prop, Drop `forwardRef`
impact: HIGH
impactDescription: Smaller components; no compatibility wrapper; future-proof against React 19+.
tags: react, react-19, ref, forwardref, props
---

## React 19 — `ref` is a Prop, Drop `forwardRef`

**Impact: HIGH (`forwardRef` is deprecated in React 19; new code must use ref-as-prop)**

In React 19, `ref` is a regular prop on function components — `React.forwardRef` is no longer needed and is on the deprecation path. Any component that needs to forward a ref declares it directly in its props type. Do not add `forwardRef` to new code, and remove it from existing code when you touch a component.

**Incorrect (legacy `forwardRef` wrapper):**

```tsx
import { forwardRef } from "react";

type ExampleButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const ExampleButton = forwardRef<HTMLButtonElement, ExampleButtonProps>(
  function ExampleButton({ className, ...props }, ref) {
    return <button ref={ref} className={cn("…", className)} {...props} />;
  },
);

const ExampleInput = forwardRef<HTMLInputElement, ExampleInputProps>((props, ref) => (
  <input ref={ref} {...props} />
));
```

**Correct (React 19 — ref as a regular prop):**

```tsx
type ExampleButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  ref?: React.Ref<HTMLButtonElement>;
};

export function ExampleButton({ className, ref, ...props }: ExampleButtonProps) {
  return (
    <button
      ref={ref}
      className={cn("…", className)}
      {...props}
    />
  );
}

type ExampleInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  ref?: React.Ref<HTMLInputElement>;
};

export function ExampleInput({ ref, ...props }: ExampleInputProps) {
  return <input ref={ref} {...props} />;
}
```

**Conventions:**
- Type the ref with `React.Ref<TElement>` on the props type — never destructure `ref` out manually and reassign it.
- `ref` is optional — callers may omit it. The component renders identically with or without.
- If the consumer needs to read the underlying DOM node, they pass either:
  - `React.useRef<HTMLButtonElement>(null)`, or
  - a callback ref: `<ExampleButton ref={(node) => { … }} />`.
- For internal refs that are not forwarded, keep using `React.useRef<T>(null)` and `React.RefObject<T | null>` as the type — that is unchanged in React 19.
- `useImperativeHandle` still exists but is rarely needed; expose imperative behaviour via plain functions or hooks instead.
- When using a vendored design system, re-generate or audit primitives after every upgrade to ensure they emit ref-as-prop form, not `forwardRef`.

Reference: [React 19 — `ref` as a Prop](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop)
