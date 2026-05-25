---
title: `useEffect` Is Only For Syncing To External Systems
impact: CRITICAL
impactDescription: Misused effects are the leading cause of infinite loops, stale UI, and double-renders.
tags: react, useEffect, side-effects, derived-state
---

## `useEffect` Is Only For Syncing To External Systems

**Impact: CRITICAL (Most `useEffect`s shouldn't exist; the ones that should are easy to spot)**

`useEffect` exists to synchronize React state with an **external system**: the DOM, the network (via a non-cached path), a WebSocket, a timer, `localStorage`, `window` event listeners, the document title, an analytics SDK. It is not for:

- Computing a value from props/state (use a normal variable or `useMemo`).
- Fetching data (use a data-cache library like TanStack Query / SWR).
- Resetting state when a prop changes (use a `key` prop or compute during render).
- Notifying a parent about a state change (use the event handler that *caused* the state change).
- Chaining state updates (combine the updates or use a reducer).

If your effect's body could be replaced by a function called from an event handler, it should not be an effect.

**Incorrect (effects doing the work the render phase already does):**

```tsx
function ExampleProfile({ example }: { example: Example }) {
  const [fullName, setFullName] = React.useState("");
  React.useEffect(() => {
    setFullName(`${example.firstName} ${example.lastName}`);
  }, [example]);

  const [items, setItems] = React.useState<Example[]>([]);
  React.useEffect(() => {
    exampleService.list().then(setItems);
  }, []);

  React.useEffect(() => {
    setSelectedId(null);
  }, [props.exampleId]);

  React.useEffect(() => {
    if (selectedId) props.onSelect?.(selectedId);
  }, [selectedId]);
}
```

**Correct (compute during render; data via the cache library; notify in the handler):**

```tsx
function ExampleProfile({ example, exampleId, onSelect }: Props) {
  const fullName = `${example.firstName} ${example.lastName}`;

  const { data: items = [] } = useExamplesQuery({ ownerId: example.id });

  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const handleSelect = React.useCallback(
    (next: string) => {
      setSelectedId(next);
      onSelect?.(next);
    },
    [onSelect],
  );

  return <ExampleListContainer key={exampleId} onSelect={handleSelect} />;
}

function ExampleSocketBoundary({ token }: { token: string | null }) {
  const { connect, disconnect } = useExampleSocketStore();
  React.useEffect(() => {
    if (token) connect();
    return () => disconnect();
  }, [token, connect, disconnect]);
  return null;
}
```

**Conventions:**
- Acceptable effects:
  - Connecting/disconnecting a WebSocket, EventSource, or other long-lived connection.
  - Auto-scrolling a virtualized list when items arrive.
  - Focusing an input after a navigation or submit.
  - Setting `document.title` per route.
  - Attaching/cleaning up `window` event listeners (resize, online/offline, keydown).
  - Subscribing to a store imperatively from outside React (rare; selectors usually suffice).
- Banned effect patterns:
  - `useEffect(() => setX(deriveFromProps(props)), [props])` — compute during render.
  - `useEffect(() => { fetch(…); }, [])` — use a data-cache library.
  - `useEffect(() => { if (cond) onChange(value) }, [value])` — call `onChange` in the event that produced `value`.
  - `useEffect(() => setState(initial), [])` — use a lazy initializer: `useState(() => initial)`.
- Every effect must have an explicit dependency array. Treat the exhaustive-deps lint rule as a tool, not a goal: review every dep manually.
- An effect that owns a subscription/listener must return a cleanup. No exceptions.
- Effects must never declare async functions directly (`useEffect(async () => …)` returns a Promise, not a cleanup). Use an inner `async` function: `useEffect(() => { void (async () => { … })(); }, [])`.

Reference: [React docs — You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
