# Plan: [Feature Name]

> **AI Execution Contract**
> You MUST complete every `[ ]` item in **§1–§3** before writing a single line of code.
> Treat each checkbox as a hard gate. Do not skip, assume, or collapse steps.

---

## §1 · Pre-Flight: Context Verification

*Purpose: eliminate hallucination. Verify what exists before designing anything.*

- [ ] **1.1 · GitNexus Query** — Run `gitnexus_query({ query: "<feature keyword>" })` to discover related execution flows.
  > Paste the top-3 relevant results here:
  ```
  [paste output]
  ```

- [ ] **1.2 · Impact Scan** — For every symbol you plan to modify, run `gitnexus_impact({ target: "symbolName", direction: "upstream" })`.
  > List each symbol and its blast radius (direct callers, risk level):
  | Symbol | Direct Callers | Risk |
  |--------|---------------|------|
  | `…`    | `…`           | LOW / MED / HIGH / CRITICAL |

  > ⚠️ **STOP and notify the user before proceeding if any symbol is HIGH or CRITICAL.**

- [ ] **1.3 · Existing File Scan** — Locate every file that will be touched. Confirm exact paths exist.
  > Run a Glob/Grep — do not assume file locations. List results:
  ```
  [paste file paths]
  ```

- [ ] **1.4 · Rule Compliance Check** — Confirm which project rules are in scope. Check the relevant `agent/rules/*.md` files.
  > Rules that apply to this feature (tick all that apply):
  - [ ] `architecture-data-flow.md` (CRITICAL — data must flow Config → Service → Hook → Component)
  - [ ] `architecture-feature-based-structure.md` (CRITICAL — new files go in `src/features/<feature>/`)
  - [ ] `service-layer.md` (HIGH — plain-object service, axiosClient, APP_API constants)
  - [ ] `query-key-factory.md` (HIGH — never inline query-key arrays)
  - [ ] `state-store-pattern.md` (HIGH — Zustand v5 canonical shape)
  - [ ] `error-handling.md` (HIGH — single toast site, `getErrorMessage`, no axios re-parsing)
  - [ ] `shadcn-ui.md` (HIGH — `@/components/ui/*`, `cn` from `@/utils/cn`, Sonner not shadcn toast)
  - [ ] `forms-schema-driven.md` (HIGH — Zod schema in `types/`, `z.infer`, never hand-write interfaces)
  - [ ] `react-no-inline-components.md`
  - [ ] `typescript-ban-any.md`
  - [ ] Other: `___`

---

## §2 · Objective & Technical Design

### 2.1 · Goal
> One sentence: What does this feature do, and why does it exist?

**User Story:** As a [role], I want to [action] so that [benefit].

### 2.2 · Layer-by-Layer Design
*Fill every row. Write "N/A" only after confirming it is genuinely not needed.*

| Layer | File(s) | Change Description |
|-------|---------|-------------------|
| **Config** (`src/config/routes.ts`) | `APP_API.v1.<group>.<endpoint>` | New URL constant(s) needed: `…` |
| **Types** (`src/types/`) | `…-types.ts` | New request/response/DTO shapes: `…` |
| **Service** (`src/services/`) | `…-service.ts` | New methods: `…` |
| **API Hook** (`src/hooks/api/`) | `…-hook.ts` | `useXxxQuery` / `useXxxMutation` / `useXxxInfiniteQuery` |
| **Store** (`src/stores/`) | `useXxxStore.ts` | New/modified Zustand slices: `…` |
| **Feature Hook** (`src/features/<feat>/hooks/`) | `use-xxx.ts` | Orchestration logic: `…` |
| **Components** (`src/features/<feat>/components/`) | `xxx.tsx` | New or modified visual components: `…` |
| **Template** (`src/features/<feat>/templates/`) | `xxx-template.tsx` | Entry-point template: `…` |
| **Page** (`src/pages/`) | `xxx-page.tsx` | Thin route wrapper (only if new route): `…` |
| **Route** (`src/config/routes.ts` or router file) | — | New route constant + tree entry: `…` |
| **Socket** (STOMP) | — | New subscription topics / publish events: `…` |

### 2.3 · State Ownership Decision
- [ ] Is this data **server state**? → TanStack Query owns it. No Zustand slice needed.
- [ ] Is this data **client-only UI state** (open/closed, selected tab, draft text)? → Zustand or `useState` — choose one and justify:
  > Decision: `___`
- [ ] Are you mixing server and client state? → Separate them cleanly; never put API response data into Zustand.

---

## §3 · File Manifest

*List every file that will be **created** or **modified**. No surprises during execution.*

> AI instruction: complete this table before writing any code. If a file is not listed here, do not create it.

| # | Action | File Path | Purpose |
|---|--------|-----------|---------|
| 1 | CREATE / MODIFY | `src/config/routes.ts` | Add `APP_API.v1.…` constant |
| 2 | CREATE / MODIFY | `src/types/….ts` | `…Response`, `…Payload` types |
| 3 | CREATE / MODIFY | `src/services/…-service.ts` | `…service.methodName()` |
| 4 | CREATE / MODIFY | `src/hooks/api/….ts` | Query key factory + `useXxxQuery` |
| 5 | CREATE / MODIFY | `src/stores/useXxxStore.ts` | Zustand slice (if client state needed) |
| 6 | CREATE / MODIFY | `src/features/<feat>/types/….ts` | Zod schema (if form) |
| 7 | CREATE / MODIFY | `src/features/<feat>/hooks/use-xxx.ts` | Feature-level orchestration hook |
| 8 | CREATE / MODIFY | `src/features/<feat>/components/xxx.tsx` | Visual component |
| 9 | CREATE / MODIFY | `src/features/<feat>/templates/xxx-template.tsx` | Feature entry-point |
| 10 | CREATE / MODIFY | `src/pages/xxx-page.tsx` | Route wrapper (thin) |

---

## §4 · Execution Steps

> **AI Execution Rules:**
> - Complete **one step at a time**. Each step = one file.
> - Mark `[x]` only after the file is written and linted.
> - After every 3 steps, pause and confirm correctness before continuing.
> - Never merge two steps into one. If a step feels too small, that is correct.

### Layer 0 — Config & Types (foundation; everything else depends on this)
- [ ] **Step 0.1** · Add new URL constant(s) to `src/config/routes.ts`
  - Verify: constant is under `APP_API.v1.<group>` — not a hardcoded string.
- [ ] **Step 0.2** · Add request/response types to `src/types/<entity>-types.ts`
  - Verify: `XxxResponse = BaseResponse<XxxData>`, no `any`, no hand-written duplicates.

### Layer 1 — Service
- [ ] **Step 1.1** · Implement `src/services/<entity>-service.ts`
  - Methods are `async` arrow functions on a plain object literal.
  - Uses `axiosClient` + `APP_API` constants. Returns unwrapped `.data.data`.
  - No React imports, no JSX, no hooks.

### Layer 2 — API Hooks
- [ ] **Step 2.1** · Implement query key factory + hooks in `src/hooks/api/<entity>.ts`
  - Uses `queryKeysFactory` — never inline arrays.
  - `useXxxQuery` / `useXxxMutation` / `useXxxInfiniteQuery` as needed.
  - Mutation `onError` uses `toast.error(error?.message || "<fallback>")`.
  - Cache invalidation in `onSuccess` uses `xxxQueryKeys.*` — never inline strings.

### Layer 3 — Store (skip entirely if all state is server state)
- [ ] **Step 3.1** · Implement or update `src/stores/useXxxStore.ts`
  - Typed interface declared above `create<XxxStore>(...)`.
  - Default export `useXxxStore`. Uses `get()` inside actions, not `getState()` inside `create`.
  - No derived state in the store; derive in selectors or component.

### Layer 4 — Feature Types (forms only)
- [ ] **Step 4.1** · Create Zod schema at `src/features/<feat>/types/<form-name>-form.ts`
  - Schema name: `<xxx>FormSchema`. Type name: `type <Xxx>FormValues = z.infer<typeof ...>`.
  - String fields: `.string({ message }).trim().min(1, { message })`.
  - No hand-written `interface` that mirrors the schema.

### Layer 5 — Feature Hooks
- [ ] **Step 5.1** · Implement `src/features/<feat>/hooks/use-<feature-action>.ts`
  - Composes `hooks/api/*` + store + local state. Does not import from `@/services/*` directly.
  - Returns only what the component needs — keep the surface minimal.

### Layer 6 — UI Components
- [ ] **Step 6.1** · Implement `src/features/<feat>/components/<component-name>.tsx`
  - Accepts props only; no direct store reads unless unavoidable.
  - Uses `@/components/ui/*` for primitives. Icons from `lucide-react`.
  - `cn` imported from `@/utils/cn`.
  - No inline component definitions inside this file.
- [ ] **Step 6.2** · *(repeat for each additional component)*

### Layer 7 — Template
- [ ] **Step 7.1** · Implement `src/features/<feat>/templates/<feat>-template.tsx`
  - Composes feature hooks + components. This is the topmost feature-scoped file.
  - Renders loading skeleton, error state, and success state explicitly.

### Layer 8 — Page & Route (new route only)
- [ ] **Step 8.1** · Create `src/pages/<feat>-page.tsx`
  - Body: `<ProtectedRoute><FeatTemplate /></ProtectedRoute>` — nothing else.
- [ ] **Step 8.2** · Add route constant to `src/config/routes.ts` (`FEAT_ROUTES.xxx = "..."`)
- [ ] **Step 8.3** · Wire route into the router tree.

---

## §5 · Edge Cases & Safety Checklist

*Confirm every row before considering the feature done.*

### 5.1 · Loading & Empty States
- [ ] Skeleton or spinner shown while query `isPending`.
- [ ] Empty-state message shown when data is an empty array/null.
- [ ] Infinite query "load more" button disabled while `isFetchingNextPage`.

### 5.2 · Error States
- [ ] Query error: error boundary or inline `isError` UI — user is never stuck on a spinner.
- [ ] Mutation error: exactly **one** `toast.error()` per flow (not both `onError` and `try/catch`).
- [ ] Error message extracted with `getErrorMessage(error, "<meaningful fallback>")`.
- [ ] No raw axios error re-parsing (`axios.isAxiosError`) in components or hooks.

### 5.3 · Network & Socket (STOMP)
- [ ] STOMP disconnect: UI degrades gracefully (reconnect banner or disabled input).
- [ ] Optimistic update: `onMutate` stores previous data; `onError` rolls it back via `queryClient.setQueryData`.
- [ ] Socket parse failure: fails silently — no user toast for events they did not trigger.

### 5.4 · Performance
- [ ] Long lists use `React Virtuoso` — never `.map()` over unbounded arrays directly in JSX.
- [ ] Stable `key` props: use entity `id`, never array index.
- [ ] No derived state recalculated on every render — use `useMemo` / selector if expensive.

### 5.5 · Type Safety
- [ ] Zero `any` — use `unknown` + type guard or a Zod parse if the shape is uncertain.
- [ ] Socket messages validated with a type guard (`isXxxEvent`) before use.
- [ ] All imports use `import type { … }` for type-only imports.

---

## §6 · Architecture Constraint Violations (auto-fail if any box is checked)

> AI: review the final diff and tick the box only if the violation is **absent** (i.e., you are certifying it does NOT exist).

- [ ] No HTTP call (`axiosClient`, `fetch`) inside a component or feature hook.
- [ ] No service imported directly into a component (`import { xService } from "@/services/…"`).
- [ ] No `useXxxStore()` call inside a service file.
- [ ] No inline query-key array (`["entity", "list"]`) anywhere outside the factory file.
- [ ] No hand-written type that duplicates a Zod `z.infer<…>` output.
- [ ] No new feature file placed in `src/components/`, `src/hooks/`, or `src/types/` (shared folders are feature-agnostic).
- [ ] No business logic inside `src/pages/<xxx>-page.tsx`.
- [ ] No `console.error` / `console.log` left in production paths.
- [ ] `shadcn` components added via CLI (`npx shadcn@latest add <name>`), not copy-pasted.

---

## §7 · Post-Execution Verification

- [ ] **7.1** Run `gitnexus_detect_changes()` — confirm the affected symbols match §2's design and nothing unexpected changed.
  > Paste summary:
  ```
  [paste output]
  ```
- [ ] **7.2** Run `npx biome check src/` — zero lint errors on modified files.
- [ ] **7.3** Run `npx tsc --noEmit` — zero type errors.
- [ ] **7.4** Manually verify the feature in the browser: happy path, error path, empty state, and (if applicable) STOMP reconnect.
