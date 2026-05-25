---
title: Absolute Ban on `any`
impact: CRITICAL
impactDescription: Eliminates a whole class of runtime bugs; restores type-system value end-to-end.
tags: typescript, any, unknown, type-safety
---

## Absolute Ban on `any`

**Impact: CRITICAL (`any` silently disables the type system everywhere it propagates)**

Application code must never introduce `any` — neither explicit (`: any`) nor implicit (untyped function parameters, untyped catch, untyped destructuring of `unknown`). Use `unknown` at trust boundaries (network, `JSON.parse`, third-party events, `localStorage`), then narrow with a type guard, Zod schema, or explicit check before use. `any` defeats refactoring, hides nullability, and turns every downstream usage into a runtime gamble.

**Incorrect (`any` leaks the unsafe value into every downstream call):**

```typescript
function handleExampleEvent(event: any) {
  const payload: any = JSON.parse(event.body);
  exampleHandler(payload.user.id);
}

try {
  await exampleApi.update(values);
} catch (error: any) {
  console.log(error.response.data.message);
}

const data = useExampleQuery<any>({ key: ["example"] });

const value = result as any as Example;
```

**Correct (`unknown` + narrowing; generics for typed payloads):**

```typescript
function handleExampleEvent(event: { body: string }): void {
  const payload: unknown = JSON.parse(event.body);
  if (!isExamplePayload(payload)) return;
  exampleHandler(payload.userId);
}

try {
  await exampleApi.update(values);
} catch (error) {
  notify(getErrorMessage(error, "Update failed."));
}

const data = useExampleQuery<Example>({ key: ["example"] });

function isExamplePayload(value: unknown): value is ExamplePayload {
  return typeof value === "object" && value !== null && "userId" in value;
}
```

**Conventions:**
- Trust boundaries (`JSON.parse`, network responses, WebSocket frames, `localStorage`, anything `unknown`-shaped from a library) are typed as `unknown` and immediately narrowed by a schema or type guard.
- `catch (error)` is implicitly `unknown` under strict mode — keep it that way; read it via a `getErrorMessage(error, fallback)` helper.
- Never write `as any`, `as unknown as Foo`, or `// @ts-ignore` to silence an error. If a third-party type is genuinely broken, isolate the cast in a single `*.d.ts` file with a comment explaining the upstream bug.
- For generic helpers, prefer `<T>` constraints (`<T extends object>`) — not `any`.

Reference: [TypeScript — `unknown` vs `any`](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#unknown)
