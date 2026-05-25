---
title: Discriminated Unions Over Boolean Flags
impact: HIGH
impactDescription: Turns runtime "impossible state" bugs into compile-time guarantees.
tags: typescript, discriminated-union, state, modeling
---

## Discriminated Unions Over Boolean Flags

**Impact: HIGH (Eliminates "isLoading && data" inconsistency bugs at the type level)**

When a value has multiple mutually exclusive shapes (loading vs. error vs. success; variant A vs. variant B; pending vs. accepted), model it as a discriminated union with a literal `kind`/`status`/`type` tag — never as a record of optional fields and orthogonal booleans. Multiple booleans (`isLoading`, `isError`, `isSuccess`) allow the compiler to accept impossible combinations (`isLoading: true, data: …`) and force callers to write defensive `if`s everywhere.

**Incorrect (boolean soup; every consumer must guess the legal combinations):**

```typescript
type ExampleState = {
  isLoading: boolean;
  isError: boolean;
  error?: string;
  data?: Example;
};

function render(state: ExampleState) {
  if (state.isLoading) return <Spinner />;
  if (state.isError) return <ErrorPanel message={state.error} />;
  return <View data={state.data!} />;
}

type ExampleItem = {
  isPrimary: boolean;
  isSecondary: boolean;
  primaryValue?: string;
  secondaryValue?: number;
};
```

**Correct (one tag, exhaustive `switch`, compiler enforces every branch):**

```typescript
type ExampleState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: Example };

function render(state: ExampleState) {
  switch (state.status) {
    case "loading":
      return <Spinner />;
    case "error":
      return <ErrorPanel message={state.message} />;
    case "success":
      return <View data={state.data} />;
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

type ExampleItem =
  | { kind: "primary"; primaryValue: string }
  | { kind: "secondary"; secondaryValue: number };

function isPrimary(item: ExampleItem): item is Extract<ExampleItem, { kind: "primary" }> {
  return item.kind === "primary";
}
```

**Conventions:**
- The discriminant key is a string literal — `"primary" | "secondary"`, never `0 | 1` or `true | false`.
- Standard discriminant names: `type` for domain entities, `status` for async machines, `kind` for variant components.
- Always add an exhaustive `default` branch with `const _exhaustive: never = value;` — TypeScript will flag missing cases when a new variant is added.
- Type guards (`function isX(v: T): v is Extract<T, …>`) live in the same file as the union — keep them near the source of truth.
- Server payloads that come back as discriminated unions get a schema-library discriminated union (`z.discriminatedUnion("type", […])`) at the boundary; do not eyeball the shape with `in` checks scattered across components.

Reference: [TypeScript — Discriminated Unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)
