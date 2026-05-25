---
title: One Store Per Concern
impact: HIGH
impactDescription: Smaller subscription surface; fewer cross-feature re-renders; clearer ownership.
tags: zustand, store, slicing, architecture
---

## One Store Per Concern

**Impact: HIGH (A single global store subscribes everyone to everything)**

Stores are cheap. Make one per **concern** — not one giant `useAppStore` that mixes auth, sockets, UI flags, and feature settings. Each store has a narrow, named purpose, lives in its own file under `src/stores/use<Concern>Store.ts`, and exports a single hook. Cross-store reads happen inside actions via `useOtherStore.getState()` — never by hooking another store from inside an action.

**Incorrect (mega-store):**

```typescript
interface AppStore {
  token: string | null;
  setToken: (token: string) => void;

  client: Client | null;
  isConnected: boolean;
  items: string[];
  connect: () => void;
  disconnect: () => void;

  drafts: Record<string, string>;
  setDraft: (id: string, text: string) => void;

  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppStore>(…);

function Sidebar() {
  const isSidebarOpen = useAppStore((s) => s.isSidebarOpen);
}

connect: () => {
  const token = useAppStore((s) => s.token);
};
```

**Correct (one store per concern; cross-store via `getState`):**

```typescript
interface ExampleAuthStore {
  token: string | null;
  setToken: (token: string) => void;
  clearState: () => void;
}

interface ExampleConnectionStore {
  client: Client | null;
  isConnected: boolean;
  items: string[];
  connect: () => void;
  disconnect: () => void;
}

interface ExampleDraftStore {
  drafts: Record<string, string>;
  setDraft: (id: string, text: string) => void;
  clearDraft: (id: string) => void;
}

connect: () => {
  const token = useExampleAuthStore.getState().token;
  if (!token) return;
};
```

**Conventions:**
- File-per-store: `src/stores/use<Concern>Store.ts`. One default export — the store hook.
- Slice the model the same way a backend service is sliced: by **bounded context**, not by data type. "User" is not a concern; "Auth" (token, sign-out) and "Profile" (currentUser, settings) are.
- A store should expose **state + actions only**. Selectors (derived values) live at the call site or inside `useShallow` projections — not as fields of the store.
- Cross-store reads inside actions use `useOtherStore.getState()`. Cross-store writes use `useOtherStore.getState().action(…)`. Hooking another store inside an action is impossible and would also break the Rules of Hooks.
- Resist merging stores "for atomicity". If two pieces of state must always update together, that is a sign they belong in the same **action** (which can call multiple `setState`s) or, occasionally, in the same store. Most of the time they are independent — accept eventual consistency.
- Middlewares (`persist`, `devtools`, `immer`) are applied per store, only when needed. Do not blanket-wrap every store.

Reference: [Zustand — Slice Pattern](https://zustand.docs.pmnd.rs/guides/slices-pattern)
