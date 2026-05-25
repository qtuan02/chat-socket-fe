---
title: Always Subscribe Stores Via Selectors
impact: HIGH
impactDescription: Selector-less subscriptions are the #1 cause of unrelated components re-rendering.
tags: zustand, selectors, performance, re-render
---

## Always Subscribe Stores Via Selectors

**Impact: HIGH (Calling a store hook without a selector subscribes to the entire store and re-renders on every change)**

Calling a Zustand store hook with no argument subscribes the component to the entire store object, which means any change to any slice triggers a re-render. Always pass a **selector function** that returns the minimum slice the component actually needs. Selectors are compared by `Object.is`; return the same primitive or object reference whenever values haven't changed, or use `useShallow` for multi-field selections.

**Incorrect (subscribing to the whole store):**

```tsx
const { token } = useExampleStore();
const example = useExampleStore();
return <Header token={example.token} />;

const { connect, disconnect } = useExampleConnectionStore();
React.useEffect(() => {
  connect();
  return disconnect;
}, []);

const state = useExampleConnectionStore((state) => ({
  isConnected: state.isConnected,
  items: state.items,
}));
```

**Correct (atomic selectors; `useShallow` for multi-field picks):**

```tsx
import { useShallow } from "zustand/react/shallow";

const token = useExampleStore((state) => state.token);

const connect = useExampleConnectionStore((state) => state.connect);
const disconnect = useExampleConnectionStore((state) => state.disconnect);
React.useEffect(() => {
  connect();
  return disconnect;
}, [connect, disconnect]);

const { isConnected, items } = useExampleConnectionStore(
  useShallow((state) => ({
    isConnected: state.isConnected,
    items: state.items,
  })),
);

const isItemActive = useExampleConnectionStore((state) =>
  state.items.includes(itemId),
);
```

**Conventions:**
- **Default**: one selector call per atomic value. Read each value with its own `useStore(selector)` line. Boilerplate is fine — it produces minimum re-renders.
- **Multiple values from the same store in the same render**: wrap the selector with `useShallow`. This compares each field with `Object.is`, so the component re-renders only when one of the selected fields actually changed.
- **Derived values** (e.g., `state.items.includes(id)`): compute them inside the selector. The selector returns the boolean directly; the component never has to walk the array.
- **Actions** (`connect`, `disconnect`, `setToken`) are stable references in Zustand v5 — selecting them is free, and they belong as deps in effects/callbacks.
- Never destructure the full store: `const { x, y, z } = useStore()`. That subscribes to everything and shallow-compares the returned object on every action — `useShallow` is the fix.
- Equality-function alternatives (custom `equalityFn` second arg) were removed in v5 — use `useShallow` or `useStoreWithEqualityFn` from `zustand/traditional` if a custom comparator is truly needed (rare).

Reference: [Zustand — `useShallow`](https://zustand.docs.pmnd.rs/guides/prevent-rerenders-with-use-shallow)
