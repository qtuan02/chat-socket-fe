---
title: Shared vs Feature — The Rule of Two
impact: HIGH
impactDescription: Stops premature abstraction; prevents `src/utils` from becoming a junk drawer.
tags: architecture, shared, feature, abstraction, refactoring
---

## Shared vs Feature — The Rule of Two

**Impact: HIGH (Wrong-bucket placement is the #1 driver of "I can't find anything in this codebase")**

A piece of code lives in a shared folder (`src/components/`, `src/hooks/`, `src/utils/`, `src/types/`, `src/libs/`) only when it meets all three of:

1. **No feature knowledge** — it references no product noun in its name, parameters, or types.
2. **Two real consumers** — at least two unrelated features already need it, or it is a true framework utility (`cn`, `useDebounce`, `useThrottle`).
3. **Stable shape** — its API has stopped changing within a feature.

Anything else stays inside `src/features/<feature>/` until the second consumer appears. Premature promotion is worse than duplication: it freezes an immature API and forces every future change to touch every consumer.

**Incorrect (premature shared placement):**

```text
src/hooks/use-example-section.ts            ← only one feature uses it
src/components/example-item.tsx             ← only one feature uses it
src/utils/example.ts                        ← bleeds feature semantics into shared
src/types/example-state.ts                  ← feature internals masquerading as shared
```

```typescript
export function useExampleSection() { … }

export function ExampleItemWithSidebar() { … }

export function getExampleTitleForDashboard(item: Example) { … }
```

**Correct (feature-local until proven shared; framework-shaped only in shared):**

```text
src/features/example/hooks/use-example-section.ts
src/features/example/components/example-item.tsx
src/features/example/utils/example-title.ts

src/utils/cn.ts                             ← framework-shaped: className merger
src/utils/error.ts                          ← framework-shaped: getErrorMessage
src/utils/string.ts                         ← framework-shaped: parseToJson
src/hooks/use-debounce.ts                   ← framework-shaped: <T>(value, delay) => T
src/hooks/api/example.ts                    ← entity-shaped, multi-feature consumer
src/types/example.ts                        ← cross-feature domain type
```

```typescript
export function cn(...inputs: ClassValue[]): string { … }

export function useDebounce<T>(value: T, delay: number): T { … }

export function useExamplesQuery(params: GetExamplesParams) { … }
```

**Conventions:**
- **Promotion checklist** before moving any file from a feature to a shared folder:
  - [ ] Two or more features currently import it.
  - [ ] Its types are generic or entity-shaped, not feature-shaped.
  - [ ] Its API hasn't changed in the last week of development.
  - [ ] Removing all feature-specific names from its public surface leaves a sensible utility.
- Demotion is also fine: if a shared helper is only used by one feature, move it back inside the feature.
- `src/hooks/api/*` is special: it is entity-shaped (one file per backend resource) and is shared by definition. Add a new file here whenever a new service is created — even if only one feature consumes it.
- `src/types/*` holds server-contract types and shared client types. Form-value types stay in the feature.
- Resist creating `src/utils/<feature>.ts` files. If a util mentions a product noun, ask whether it belongs in `src/features/<feature>/utils/` instead.
- When in doubt: start inside the feature. Promotion is cheap; demotion after spread is expensive.

Reference: [Sandi Metz — The Wrong Abstraction](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction)
