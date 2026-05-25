---
name: refactoring
description: Safe, structured refactoring for this React 19 / TypeScript / Zustand v5 / TanStack Query codebase. Use when asked to "refactor", "clean up", "extract logic", "split a file", or "improve this component". Also triggers on measurable code smells: file >200 lines, prop drilling >3 levels, duplicate hook logic, or business logic inside JSX.
---

# Refactoring — Clean Code, Safe Execution

Refactoring changes **structure** without changing **behaviour**. Every step below is a hard gate. Do not skip or collapse steps.

---

## Phase 0 — Hard Pre-Flight (MANDATORY before any edit)

### 0.1 · Impact Analysis
Run GitNexus on every symbol you plan to move or rename:

```
gitnexus_impact({ target: "symbolName", direction: "upstream" })
```

> ⚠️ **STOP and notify the user** if risk is HIGH or CRITICAL. Do not proceed without explicit approval.

### 0.2 · Behaviour Contract — read before touching

Before changing a single line, explicitly document:

| Contract point | Where it lives | Notes |
|----------------|---------------|-------|
| External API shape (request/response types) | `src/types/` | MUST NOT change |
| Query key factory entries | `src/hooks/api/*.ts` | MUST NOT change key strings |
| Store slice interface | `src/stores/useXxxStore.ts` | MUST NOT remove/rename public fields |
| Socket event names | STOMP subscription strings | MUST NOT change |
| Public component props | `Props` type in the file | Additive only — never remove |

If you cannot identify any of the above, **read the file first** before proceeding.

### 0.3 · Commit Safety Net

**The working code must be committed BEFORE refactoring starts.** If there are uncommitted changes, prompt the user to commit them first.

```
git add -A && git commit -m "chore: checkpoint before refactoring <target>"
```

---

## Phase 1 — Smell Detection (measurable triggers only)

Refactoring is warranted when at least one of these signals is present:

| Signal | Threshold | Refactoring action |
|--------|-----------|-------------------|
| File length | > 200 lines | Extract logic into hook(s) and/or split components |
| Component function body | > 60 lines | Extract feature hook (`use-<name>.ts`) |
| Prop drilling depth | > 3 levels | Introduce context or move logic to store/hook |
| Duplicated logic | Same pattern in ≥ 2 places | Extract shared hook in `src/hooks/` |
| Property access depth | > 3 chained accesses (`a.b.c.d`) | Derive a local variable or selector |
| Magic literals | Naked string/number with business meaning | Extract constant |
| Inline component definition | Any component defined inside another | Lift to module scope |
| Business logic in JSX | Conditions/transformations directly in `return` | Extract to hook or derived variable |
| Direct service import in component | `import { xService }` in a `.tsx` file | Enforce data flow: Service → Hook → Component |

**Do NOT refactor when none of these signals exist.** Clean code is not a refactoring target.

---

## Phase 2 — Separation of Concerns (SoC) Protocol

This project enforces a strict data-flow direction:

```
Config/Types → Service → API Hook → Feature Hook → Component/Template
```

### 2.1 · Extract UI logic into a feature hook

When a component mixes logic with layout, move **all non-JSX behaviour** into a feature hook:

- All `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback` calls
- All mutation invocations (`useMutation`, `useXxxMutation`)
- All derived values (computed from state or query data)
- All event handlers (`handleSubmit`, `handleChange`, …)

**Rule**: The component file's return statement must contain **only** JSX. If you can't read the JSX tree without tracing through conditionals and transformations, extract them.

```tsx
// ❌ Business logic in JSX
export function MessageList({ roomId }: Props) {
  const { data } = useMessagesQuery(roomId);
  const sorted = [...(data ?? [])].sort((a, b) => b.createdAt - a.createdAt);
  return (
    <ul>
      {sorted.filter(m => !m.deleted).map(m => (
        <li key={m.id}>{m.content}</li>
      ))}
    </ul>
  );
}

// ✅ Logic in hook, component is a thin view
export function MessageList({ roomId }: Props) {
  const { messages } = useMessageList(roomId);        // hook owns sorting/filtering
  return (
    <ul>
      {messages.map(m => <li key={m.id}>{m.content}</li>)}
    </ul>
  );
}
```

### 2.2 · Never move the service layer up

Components and feature hooks must NOT import from `src/services/` directly. If you encounter this pattern during refactoring, fix it:

```
❌ component → service
✅ component → feature hook → api hook → service
```

---

## Phase 3 — Performance Refactoring (React 19)

Apply these only when the smell is **verified** (profiler evidence or clear structural issue), not speculatively.

| Pattern | Correct approach |
|---------|-----------------|
| Inline object/array as prop | Stabilise with `useMemo` or hoist to module scope |
| Callback created in render | `useCallback` only when passed to a memoized child |
| Unstable `key` prop | Use entity `id` — never array index |
| Inline component in render body | Lift to module scope (see `react-no-inline-components` rule) |
| Unbounded list render | Wrap with `React Virtuoso` |
| Derived state in `useEffect` | Remove the effect — compute inline or with `useMemo` |
| Re-render caused by whole-store subscription | Add a selector: `useXxxStore(s => s.field)` |
| `useEffect` with empty deps that runs once | Replace with React 19 `use` or move to a service initialiser |

**React 19 specifics**: Avoid manual `forwardRef` wrapping — React 19 passes `ref` as a plain prop. Prefer `useActionState` over manual `isPending` state for async form actions.

---

## Phase 4 — Execution Rules

1. **One concern per commit.** Never mix a refactor with a feature or bug fix.
2. **One file at a time.** Complete, verify (lint + types), then move to the next file.
3. **No new public APIs.** Refactoring is additive-to-internals, subtractive-to-complexity. Never add a new exported function "just in case".
4. **Preserve error paths.** Every `try/catch`, guard clause, and early return that existed before must exist after.
5. **Preserve all external contracts** listed in Phase 0.2.
6. **No speculative code.** Do not add logic that is not demanded by the existing behaviour.

---

## Phase 5 — Refactoring Checklist (verify before committing)

- [ ] All types compile: `npx tsc --noEmit` — zero errors
- [ ] Zero lint errors: `npx biome check src/` — clean on modified files
- [ ] External API contracts unchanged (types, query keys, store fields, socket topics)
- [ ] All error paths (`catch`, guard clauses) are intact and unchanged
- [ ] No inline component definitions remain in refactored files
- [ ] No direct service imports in components or feature hooks
- [ ] No new `any` introduced (use `unknown` + type guard if shape is uncertain)
- [ ] `key` props use stable entity `id`, not array index
- [ ] No speculative code added (no "just in case" logic)
- [ ] Component render body is pure JSX — no business logic inline
- [ ] Committed separately from feature or bug-fix work

---

## Phase 6 — Post-Refactor Verification

```
gitnexus_detect_changes()
```

Confirm the affected symbols match exactly the scope agreed in Phase 0. If unexpected symbols changed, investigate before committing.

---

## Commit Message Format

```
refactor: extract <what> from <where>
refactor: split <component> into hook + view
refactor: eliminate prop drilling in <feature>
refactor: stabilise <callback/memo> in <component>
```

Format: `refactor: <verb> <what>`

**Never mix** `refactor:` with `feat:` or `fix:` in the same commit.
