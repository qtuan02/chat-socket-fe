---
title: `as const` & Readonly Immutability
impact: MEDIUM
impactDescription: Narrows literal types; catches in-place mutation at compile time.
tags: typescript, readonly, as-const, immutability
---

## `as const` & Readonly Immutability

**Impact: MEDIUM (Catches mutation bugs at compile time and unlocks literal-narrowed types)**

Configuration tables, route maps, enum-like object literals, and any constant collection must be declared with `as const` so TypeScript narrows them to literal types instead of widening to `string` / `number`. Inside hooks, reducers, and store actions, never mutate arrays/objects in place (`push`, `splice`, `sort`, `obj.field = …`) — return a new value with spread, `toSorted`, `toReversed`, `Object.assign({}, …)`, or `with()`.

**Incorrect:**

```typescript
export const EXAMPLE_ROUTES = {
  home: "/",
  signIn: "/sign-in",
};

navigate(EXAMPLE_ROUTES.home);
const path: string = EXAMPLE_ROUTES.home;

const next = state.items;
next.push(newItem);
set({ items: next });

const sortedItems = items.sort((a, b) => a.name.localeCompare(b.name));

function updateExample(example: Example, patch: Partial<Example>) {
  Object.assign(example, patch);
  return example;
}
```

**Correct:**

```typescript
export const EXAMPLE_ROUTES = {
  home: "/",
  signIn: "/sign-in",
} as const;

const sortedItems = items.toSorted((a, b) => a.name.localeCompare(b.name));

set((state) => ({ items: [...state.items, newItem] }));

function updateExample(example: Example, patch: Partial<Example>): Example {
  return { ...example, ...patch };
}

type Props = { readonly items: readonly Example[] };
export function ExampleList({ items }: Props) {
  return items.map((example) => <ExampleRow key={example.id} example={example} />);
}
```

**Conventions:**
- Top-level constant objects/arrays in `src/config/*` and any local lookup tables end with `as const`.
- Prefer `readonly Foo[]` / `ReadonlyArray<Foo>` on input props and function parameters that should not mutate the source — keeps callers honest.
- Mutation-free array operations: `toSorted`, `toReversed`, `toSpliced`, `with`, `concat`, spread. Forbidden in app code: `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill`, `copyWithin`.
- For store actions (Zustand, Redux, Immer-less reducers), always return a new object/array from `set`. The store reference is owned by the library; treat it like React state.
- `as const` is not the same as `readonly`. Use both: `as const` to narrow the literal type, `readonly` to forbid downstream mutation.

Reference: [TypeScript — `const` Assertions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions)
