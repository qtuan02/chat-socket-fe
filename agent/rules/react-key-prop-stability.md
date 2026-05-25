---
title: Stable `key` Props in Lists
impact: HIGH
impactDescription: Wrong keys cause flickering inputs, lost focus, broken animations, and re-mounted children.
tags: react, key, lists, reconciliation, performance
---

## Stable `key` Props in Lists

**Impact: HIGH (Bad keys are silent — UI works, but mounting/state behaves erratically)**

`key` tells React which element in a list corresponds to which element across renders. It must be a **stable, unique-within-the-list, primitive value derived from the data itself**. Array index keys are forbidden whenever the list can be reordered, filtered, prepended, deleted, or paginated — they cause React to associate the wrong DOM node with the wrong data, scrambling input state, scroll position, and animations.

The only acceptable index keys are for lists that are truly static for the component's lifetime (e.g., rendering a fixed number of skeleton stripes).

**Incorrect:**

```tsx
{examples.map((example, index) => (
  <ExampleItem key={index} example={example} />
))}

{rows.map((row) => (
  <ExampleRow key={Math.random()} row={row} />
))}

{items.map((item, index) => (
  <ExampleItem key={`item-${index}`} item={item} />
))}

{rows.map((row) => (
  <ExampleRow
    key={`${row.ownerId}-${row.value}`}
    row={row}
  />
))}
```

**Correct:**

```tsx
{examples.map((example) => (
  <ExampleItem key={example.id} example={example} />
))}

{rows.map((row) => (
  <ExampleRow key={row.id} row={row} />
))}

{requests.map((request) => (
  <RequestRow key={request.id} request={request} />
))}

{Array.from({ length: 5 }).map((_, index) => (
  <Skeleton key={index} className="h-12 w-full" />
))}
```

**Conventions:**
- Every list rendered with `.map(...)` must have a `key` prop on the top-level returned element. Forgetting it is a React warning; ignoring the warning is a code-review block.
- Prefer the entity's server-assigned ID (`example.id`, `row.id`, `request.id`). All domain types should carry stable `id` fields.
- For **draft** entities that don't yet have a server ID, generate a stable client-side ID once (`crypto.randomUUID()`) and store it on the entity — never re-roll on every render.
- For composite uniqueness, concatenate IDs, not content: `${parentId}:${childId}` is fine; `${user.name}-${row.text}` is not (changes when content changes).
- Index keys are only acceptable when **all** of:
  - The list is rendered once and never reordered.
  - Items never carry per-item state (inputs, focus, animations).
  - Items are interchangeable shells (skeletons, dot indicators).
- Never use `Math.random()`, `Date.now()`, or any per-render value as a key. The list will fully re-mount every render and you will lose all child state.

Reference: [React docs — Rendering Lists & Keys](https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key)
