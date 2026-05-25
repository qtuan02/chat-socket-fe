---
title: Zustand v5 — Canonical Store Pattern
impact: HIGH
impactDescription: Consistent store shape; predictable subscriptions; no stale closures.
tags: zustand, state, store, react
---

## Zustand v5 — Canonical Store Pattern

**Impact: HIGH (Consistent state management and predictable subscriptions)**

Every Zustand v5 store follows the same shape: a typed interface declared separately, a default export named `useXxxStore`, actions colocated with state, and `get()` used to read state inside actions. External (non-React) callers must read with `useXxxStore.getState()` — never call the hook outside a component.

**Incorrect:**

```typescript
const useExampleStore = create((set) => ({
  token: null,
  setToken: (token) => set({ token }),
}));

function refreshExample() {
  const { token } = useExampleStore();
  return fetch("/api", { headers: { Authorization: `Bearer ${token}` } });
}

disconnect: () => {
  set((state) => {
    state.client?.deactivate();
    return { client: null, isConnected: false };
  });
}

const exampleStore = create(...);
const useExample = create(...);

interface BadStore {
  isConnected: boolean;
  items: string[];
  setIsConnected: (v: boolean) => void;
  setItems: (v: string[]) => void;
}
```

**Correct:**

```typescript
interface ExampleStore {
  token: string | null;
  setToken: (token: string) => void;
  clearState: () => void;
}

const useExampleStore = create<ExampleStore>((set) => ({
  token: null,
  setToken: (token) => {
    set({ token });
  },
  clearState: () => {
    set({ token: null });
  },
}));

export default useExampleStore;

async function refreshExample() {
  const { token } = useExampleStore.getState();
  useExampleStore.getState().setToken(newToken);
}

export const useExampleConnectionStore = create<ExampleConnectionStore>((set, get) => ({
  client: null,
  isConnected: false,
  disconnect: () => {
    const client = get().client;
    if (client) {
      void client.deactivate();
      set({ client: null, isConnected: false });
    }
  },
}));

const token = useExampleStore((state) => state.token);
const connect = useExampleConnectionStore((state) => state.connect);
```

**Conventions:**
- File location: `src/stores/useXxxStore.ts` (one store per file).
- Naming: hook is `useXxxStore`, interface is `XxxStore`.
- Default export the hook. Named-export it only when multiple stores live in the same file (avoid this).
- Group related actions into a single `clearState` / `reset` action instead of resetting field-by-field.
- For equality-aware updates (e.g., comparing arrays before set), do the comparison inside the action and return the same state object to skip the update.
- Use `get()` inside actions to read current state without subscribing; never re-hook the same store inside its own action.

Reference: [Zustand v5 — Getting Started](https://zustand.docs.pmnd.rs/getting-started/introduction)
