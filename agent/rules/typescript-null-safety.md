---
title: Strict Null & Undefined Handling
impact: CRITICAL
impactDescription: Prevents `Cannot read properties of null` runtime crashes.
tags: typescript, null, undefined, strict, optional-chaining
---

## Strict Null & Undefined Handling

**Impact: CRITICAL (Every nullable value must be narrowed before use; `!` is banned)**

Under `"strict": true`, a value typed `T | null | undefined` is not the same as `T`. The compiler will block direct access, and the only sanctioned ways to unwrap are: (1) an explicit `if`/early-return guard, (2) optional chaining `?.`, (3) nullish coalescing `??` with a meaningful fallback, or (4) a true type-guard function. The non-null assertion operator (`!`) is banned in application code — it lies to the type system and crashes at runtime.

**Incorrect:**

```typescript
function getExampleName(): string {
  const example = useExampleStore.getState().currentExample!;
  return example.name!;
}

const token = useExampleStore((state) => state.token);
return <Header label={token.split(".")[0]} />;

const draft = drafts[exampleId] || "(empty)";

const exampleId = match?.params.exampleId as string;

if (example) {
  doStuff(example);
  doMoreStuff(example!.id);
}
```

**Correct:**

```typescript
function getExampleName(): string {
  const example = useExampleStore.getState().currentExample;
  if (!example) return "";
  return example.name ?? "";
}

const token = useExampleStore((state) => state.token);
const label = token?.split(".")[0];
return <Header label={label ?? "Guest"} />;

const draft = drafts[exampleId] ?? "";

const exampleId = match?.params.exampleId ?? "";

if (!example) return null;
doStuff(example);
doMoreStuff(example.id);
```

**Conventions:**
- Use `??` (nullish coalescing) when the fallback is for `null`/`undefined` only. `||` swallows valid `""`, `0`, and `false`.
- Optional-chain everywhere a getter returns `T | undefined`: `array?.[0]`, `map?.get(key)`, `obj?.method()`.
- Narrow with an early return (`if (!value) return …`) before the happy path — keeps the rest of the function unindented.
- Forbidden: `value!`, `value as NonNullable<T>` purely to silence the compiler. The only acceptable cast is *into* a wider type (e.g., `as unknown`), not *out of* nullability.
- React refs: treat `ref.current` as `T | null` — always guard before `.focus()`, `.scrollTo()`, etc.
- Default function parameters use `=` defaults (`limit = 30`) rather than `limit?: number` + `?? 30` inside the body.

Reference: [TypeScript — `strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks)
