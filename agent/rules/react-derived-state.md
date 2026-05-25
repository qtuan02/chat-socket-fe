---
title: Compute Derived State In Render
impact: HIGH
impactDescription: Eliminates "two renders to update" bugs and removes redundant state.
tags: react, derived-state, useMemo, render
---

## Compute Derived State In Render

**Impact: HIGH (Storing derived values in state creates two sources of truth that drift)**

If a value can be computed from existing props, state, or hook results, do not store it in `useState`. Compute it inline during render. Use `useMemo` only when the computation is verifiably expensive (large list filtering, sorting many items, parsing dates in a loop) — never as a "just in case" wrapper. The React Compiler that ships with React 19 will auto-memoize stable expressions; manual `useMemo` is for the cases it cannot prove safe.

**Incorrect (mirrored state):**

```tsx
function ExampleList({ items }: { items: Example[] }) {
  const [sortedItems, setSortedItems] = React.useState<Example[]>([]);
  const [hasUnread, setHasUnread] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    setSortedItems([...items].sort((a, b) => a.createdAt - b.createdAt));
  }, [items]);

  React.useEffect(() => {
    const unread = items.filter((item) => !item.seenAt);
    setUnreadCount(unread.length);
    setHasUnread(unread.length > 0);
  }, [items]);

  return <List items={sortedItems} />;
}
```

**Correct (compute inline; memo only when measurably necessary):**

```tsx
function ExampleList({ items }: { items: readonly Example[] }) {
  const sortedItems = items.toSorted((a, b) => a.createdAt - b.createdAt);
  const unreadCount = items.filter((item) => !item.seenAt).length;
  const hasUnread = unreadCount > 0;

  return <List items={sortedItems} />;
}

function HeavyExampleList({ items, query }: Props) {
  const filtered = React.useMemo(
    () => items.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())),
    [items, query],
  );
  return <List items={filtered} />;
}
```

**Conventions:**
- The default for derived values is a plain `const` inside the render body:
  ```typescript
  const isSubmitDisabled = !trimmedValue || isPending;
  const actionLabel = isPending ? "Saving…" : "Save";
  ```
- Reach for `useMemo` only when you can answer **all** of:
  1. The computation walks a meaningfully-sized array/object (> ~100 items, or non-trivial work per item).
  2. The component renders frequently (per keystroke, scroll, drag).
  3. You have measured the difference (React Profiler / dev tools).
- Never `useMemo` for primitives, small object literals, or `String.format`-style work.
- If a parent computes the same derivation that several children use, lift the computation up to the parent — once, into a plain const — and pass it down as a prop. Do not give each child its own `useMemo`.
- Server-state derivations belong in the **`select`** option of the data-cache hook (cache libraries memoize by selector reference), not in component state.

Reference: [React docs — Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure#avoid-redundant-state)
