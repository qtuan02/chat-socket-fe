---
title: Server State vs Client State Ownership
impact: CRITICAL
impactDescription: Eliminates duplicate caches, stale lists, and "the dialog opens but the data is wrong" bugs.
tags: state, server-state, client-state, data-cache
---

## Server State vs Client State Ownership

**Impact: CRITICAL (Mirroring server data into a client store is the single biggest state-management anti-pattern)**

Every piece of state has exactly **one owner**:

- **Server state** (data that lives on the backend — entities, lists, profiles) lives only in the **data-cache library** (TanStack Query / SWR / RTK Query / Apollo). Read it with the library's hooks. Update it with mutations + `setQueryData` / `invalidateQueries`. Never copy server data into a client store, `useState`, or `useRef` "just for convenience".

- **Client state** (UI-only, not derivable from the server — auth token, socket client instance, theme, draft text, selected tab) lives in a **client store** under `src/stores/`. It is never persisted via the data-cache.

- **Local state** (one-component-only — input value before submit, "is this menu open?", "did the user hover this row?") lives in `useState` inside the component. It is never lifted to a store.

**Incorrect (duplicating server data into a client store):**

```typescript
interface ExampleStore {
  items: Example[];
  setItems: (list: Example[]) => void;
  selectedId: string | null;
  setSelectedId: (id: string) => void;
}

function ExampleList() {
  const { items, setItems } = useExampleStore();
  const { data } = useExamplesQuery({ ownerId });

  React.useEffect(() => {
    if (data) setItems(data.items);
  }, [data, setItems]);

  return items.map((item) => <ExampleRow key={item.id} item={item} />);
}

const { isMenuOpen, setMenuOpen } = useGlobalUiStore();
```

**Correct (each owner handles its kind):**

```typescript
function ExampleList() {
  const { data: items = [] } = useExamplesQuery({ ownerId });
  return items.map((item) => <ExampleRow key={item.id} item={item} />);
}

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

function ExampleActionsMenu() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  return …;
}
```

**Conventions:**
- The decision tree for new state:
  1. Does the backend own the source of truth? → **Data-cache library** (`src/hooks/api/<entity>.ts`).
  2. Is it client-only **and** read by more than one component tree? → **Client store** (`src/stores/use<Entity>Store.ts`).
  3. Is it used by exactly one component or its direct children? → **`useState` / `useReducer`**.
  4. Is it URL-derivable (current route ID, active tab)? → **Router** (`useParams`, `useSearchParams`) — never store it twice.
- Acceptable client stores: a small, justified set (auth, socket connection, theme, locale, command-palette state). Adding a new store requires the justification: "this is genuinely client-only, shared, and not URL-derivable."
- WebSocket payloads that update server data go through `setQueryData` (not a client store). Only client-only side-effects of socket frames (connection status, online-users derived UI list) live in client stores.
- Optimistic UI happens in the mutation's `onMutate` via `setQueryData` — not by adding a parallel "optimistic" slice to the client store.
- "I need to read this in an `onSubmit` handler" is not a reason to lift to a client store. Read the latest cache value with `queryClient.getQueryData(key)`.

Reference: [TkDodo — Practical React Query](https://tkdodo.eu/blog/practical-react-query)
