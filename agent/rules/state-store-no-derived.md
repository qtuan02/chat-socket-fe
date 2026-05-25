---
title: No Derived State In Stores
impact: HIGH
impactDescription: Prevents duplicated facts that drift; keeps stores as source of truth only.
tags: zustand, derived-state, store, selectors
---

## No Derived State In Stores

**Impact: HIGH (Derived values inside a store are the store-equivalent of mirroring state into `useState`)**

A store holds **source-of-truth state and actions** — not values that can be computed from that state. `unreadCount`, `isItemActive`, `isAuthenticated`, `itemSet`, sorted lists, filtered lists — all of these are derivations. They belong in the **selector** that the component runs, in a `useShallow` projection, or in a feature-level custom hook. Putting them in the store creates a second source that must be hand-maintained on every action and will eventually drift.

The shape rule is simple: if a field can be computed by reading the store once, it doesn't go in the store.

**Incorrect (derived fields hand-maintained inside the store):**

```typescript
interface ExampleAuthStore {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  clearState: () => void;
}

const useExampleAuthStore = create<ExampleAuthStore>((set) => ({
  token: null,
  isAuthenticated: false,
  setToken: (token) => set({ token, isAuthenticated: true }),
  clearState: () => set({ token: null, isAuthenticated: false }),
}));

interface ExampleConnectionStore {
  items: string[];
  itemSet: Set<string>;
  itemCount: number;
}
```

**Correct (state only; derive in the selector):**

```typescript
interface ExampleAuthStore {
  token: string | null;
  setToken: (token: string) => void;
  clearState: () => void;
}

const isAuthenticated = useExampleAuthStore((state) => state.token !== null);

interface ExampleConnectionStore {
  items: string[];
  connect: () => void;
  disconnect: () => void;
}

const isItemActive = useExampleConnectionStore((state) =>
  state.items.includes(itemId),
);

const itemCount = useExampleConnectionStore((state) => state.items.length);
```

**Conventions:**
- A store field must be one of:
  1. A **raw** server- or library-owned reference (`token`, `client`, `items`, `currentRouteParam`).
  2. A user-driven preference that has no external source (`theme`, `language`, `drafts[]`).
  3. A pure UI flag that genuinely lives outside any one component (`isCommandPaletteOpen`).
- Computations on store state happen in selectors. Selectors are pure functions of `(state) → value`; they re-run on every state change and re-render only when the returned value changes (by `Object.is`).
- If two selectors need the same expensive derivation, hoist it into a feature hook:
  ```typescript
  export function useActiveExampleItems(): readonly string[] {
    const allItems = useExamplesQuery().data ?? [];
    const activeIds = useExampleConnectionStore((s) => s.items);
    return allItems.filter((item) => activeIds.includes(item.id)).map((item) => item.id);
  }
  ```
- A selector that returns a derived primitive (`state.items.includes(id)`) is cheap. A selector that returns a new array every render (`state.items.filter(…)`) is not — wrap such selectors with `useShallow` or restructure to return primitives.
- Inside actions, you may temporarily compute a derivation to decide whether to update (short-circuit if the new value equals the old). That is **action-local** logic — it never persists into the store shape.

Reference: [Zustand — Practice with no store actions](https://zustand.docs.pmnd.rs/guides/practice-with-no-store-actions)
