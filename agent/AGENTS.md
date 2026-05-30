# AGENTS.md

Strict instructions for AI coding agents (Claude Code, Cursor, Copilot) working in this repo.
This file is a **router**, not a manual. It tells you **which rule to read** before you touch code.

> Root pointers: `AGENTS.md`, `CLAUDE.md` (GitNexus + one-line pointer here), `.cursorrules` (read order). Keep pointer lines in sync.

---

## 1. Project Snapshot

- **App:** `chat-socket-fe` — real-time chat client (direct messages, groups, friends, auth).
- **Stack:** React 19 · TypeScript · Tailwind v4 · Zustand v5 · React Router v7 · TanStack Query · STOMP (WebSocket) · Rsbuild · Biome · Bun.
- **Package manager:** `bun` (`bun install`, `bun run dev`, `bun run check`).
- **Import alias:** `@/*` → `./src/*` (see `tsconfig.json`).

### 1.1 Architecture

Feature-based layout. Source in `src/`:

| Path | Purpose |
|------|---------|
| `features/{auth,chat,conversation,current-user,friends,group}` | Vertical slices — components, hooks, templates, types, utils |
| `components/ui/` | shadcn/ui primitives only |
| `components/shared/` | Cross-feature presentational components (avatars, etc.) |
| `hooks/api/` | TanStack Query hooks — one file per backend entity |
| `hooks/` | Generic reusable hooks (`use-debounce`, `use-session-check`, …) |
| `services/` | HTTP + STOMP service objects (plain objects, no React) |
| `stores/` | Zustand client state (`useAuthStore`, `useSocketStore`) |
| `libs/` | `axios`, `query-client`, `query-key-factory` |
| `config/` | `env.ts`, `routes.ts` (`APP_ROUTES`, `APP_API`), `constant.ts` |
| `providers/` | Route guards, `ChatSocketProvider` |
| `pages/` | Thin route wrappers — mount a feature template only |
| `types/` | Shared DTOs / API shapes |
| `utils/` | Pure helpers (`cn`, `error`, `date`, …) |

### 1.2 Data Flow

One direction only — never reverse it:

```text
src/config/*               (APP_API, APP_ROUTES, env, SOCKET_EVENT)
        │
        ▼
src/libs/axios.ts          (HTTP transport + interceptors)
        │
        ▼
src/services/*-service.ts  (HTTP: unwrapped .data.data)
        │
        ▼
src/hooks/api/<entity>.ts  (TanStack Query — queryKeysFactory)
        │
        ▼
src/features/*/hooks/*     (orchestration: queries + mutations + UI state)
        │
        ▼
src/features/*/components, templates
        │
        ▼
src/pages/*-page.tsx       (route → template)
```

**Real-time (STOMP) side path:**

```text
src/stores/useSocketStore.ts     (connect / disconnect STOMP client)
        │
        ▼
src/services/socket-service.ts   (subscribe / parse / type-guard events)
        │
        ▼
src/features/chat/hooks/use-chat-socket-sync.ts   (invalidate / patch Query cache)
        │
        ▼
src/providers/chat-socket-provider.tsx          (mount sync hook per active conversation)
```

Socket logic never lives in components. HTTP never lives in components or feature hooks.

### 1.3 Where Do I Put X?

| I need to add… | Put it here |
|----------------|-------------|
| New REST endpoint constant | `src/config/routes.ts` → `APP_API.v1.<group>.<endpoint>` |
| New route path | `src/config/routes.ts` → `APP_ROUTES.<name>` + entry in `src/app.tsx` |
| Shared request/response type | `src/types/<entity>.ts` |
| HTTP call | `src/services/<entity>-service.ts` (plain object + `axiosClient`) |
| TanStack `useQuery` / `useMutation` | `src/hooks/api/<entity>.ts` + key in `src/libs/query-key-factory.ts` |
| Client-only UI state (auth, socket) | `src/stores/useXxxStore.ts` |
| Feature-specific component | `src/features/<feat>/components/` |
| Feature orchestration hook | `src/features/<feat>/hooks/` |
| Feature entry layout | `src/features/<feat>/templates/<feat>-template.tsx` |
| Zod form schema | `src/features/<feat>/types/<form>-form.ts` |
| Feature-local mapper / helper | `src/features/<feat>/utils/` |
| New page / screen | `src/pages/<feat>-page.tsx` — body is `<Guard><FeatTemplate /></Guard>` only |
| shadcn primitive | `src/components/ui/` via `npx shadcn@latest add <name>` |
| Used by 2+ features, no business logic | `src/components/shared/` or `src/hooks/` |
| STOMP subscribe / parse | `src/services/socket-service.ts` |
| Socket → cache sync | `src/features/chat/hooks/use-chat-socket-sync.ts` (or feature hook that composes it) |
| Route guard | `src/providers/protected-route.tsx` or `guest-route.tsx` |

Full detail: `agent/rules/architecture-feature-based-structure.md`, `agent/rules/architecture-data-flow.md`.

---

## 2. Workflow — NON-NEGOTIABLE

For **every** task, follow this order. Do not skip steps.

### Step 1 — Plan (for any new feature, refactor, or multi-file change)

1. Read `agent/plans/_plan_template.md`.
2. Create `agent/plans/{YYYY-MM-DD}-{kebab-feature-name}.md` from that template.
3. Wait for user confirmation before executing.

> Skip the plan only for: typo fixes, single-line bug fixes, doc edits.

### Step 2 — Load Rules (always, before writing code)

Read the **micro-rules** in `agent/rules/` that match the task. Use the router table in §3.
**Read only what is relevant.** Do not load all rules.

### Step 3 — Load Skills (when triggered)

Read the matching `agent/skills/{name}/SKILL.md` only when its trigger fits the task.

### Step 4 — Implement, then self-check against the rules you loaded.

---

## 3. Rule Router — `agent/rules/`

| If the task involves…                          | MUST read                                                                                                                          |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **TypeScript** (any `.ts`/`.tsx`)              | `typescript-ban-any.md`, `typescript-naming-conventions.md`, `typescript-named-exports.md`, `typescript-type-only-imports.md`, `typescript-absolute-imports.md`, `typescript-null-safety.md`, `typescript-as-const-immutable.md`, `typescript-discriminated-unions.md` |
| **React components**                           | `react-functional-only.md`, `react-no-forwardref.md`, `react-no-inline-components.md`, `react-key-prop-stability.md`, `react-derived-state.md`, `react-effects-sync-only.md`, `react-custom-hook-extraction.md` |
| **New file / folder placement**                | `architecture-feature-based-structure.md`, `architecture-shared-vs-feature.md`, `architecture-cross-feature-isolation.md`, `architecture-data-flow.md` |
| **Routing / pages / guards**                   | `architecture-routes-thin.md`, `routing-constants.md`, `routing-route-guards.md`                                                   |
| **Zustand store**                              | `state-store-pattern.md`, `state-store-slicing.md`, `state-store-selectors.md`, `state-store-no-derived.md`, `state-global-vs-local.md`, `state-server-vs-client.md` |
| **Server data (TanStack Query / mutations)**   | `tanstack-use-query.md`, `tanstack-use-mutation.md`, `tanstack-use-infinite.md`, `query-key-factory.md`, `data-cache-key-factory.md`, `data-service-layer.md`, `data-error-handling.md` |
| **API / service layer / STOMP**                | `service-layer.md`, `data-service-layer.md`, `error-handling.md`                                                                   |
| **Forms**                                      | `forms-schema-driven.md`                                                                                                           |
| **Tailwind / styling**                         | `styling-design-tokens.md`, `styling-conditional-classes.md`                                                                       |
| **shadcn/ui primitives**                       | `shadcn-ui.md`                                                                                                                     |
| **Reusable React hooks**                       | `usehooks-ts.md`, `react-custom-hook-extraction.md`                                                                                |
| **Error handling (any layer)**                 | `error-handling.md`, `data-error-handling.md`                                                                                      |

> If unsure which rule applies, list candidates back to the user before coding.

---

## 4. Skill Router — `agent/skills/`

Load the **full** `SKILL.md` only when triggered.

| Trigger                                                          | Skill                                  |
| ---------------------------------------------------------------- | -------------------------------------- |
| Rename / extract / split / move code                             | `refactoring/SKILL.md`                 |
| Designing component APIs, compound components, prop refactors    | `vercel-composition-patterns/SKILL.md` |
| Performance, re-renders, bundle, hydration, async                | `vercel-react-best-practices/SKILL.md` |
| Visual / UX polish, layout, design decisions                     | `web-design-guidelines/SKILL.md`       |
| Understand code / impact / debug / refactor via the graph        | `gitnexus/*` (see §6)                  |

---

## 5. Hard Constraints

- **No `any`.** See `typescript-ban-any.md`.
- **No `forwardRef`** (React 19). See `react-no-forwardref.md`.
- **No inline component definitions.** See `react-no-inline-components.md`.
- **No cross-feature imports** between `features/*` siblings. Promote to `components/shared` or `hooks/` instead.
- **Routes stay thin** — logic lives in features, not in `pages/`.
- **Zustand stores hold state only.** Derive in selectors, not in the store.
- **Server state belongs to TanStack Query**, client state to Zustand. Never duplicate.
- **HTTP in services only** — components and feature hooks call `hooks/api/*`, never `axiosClient` or `@/services/*` directly.
- **STOMP in `socket-service`** — parse with type guards; sync cache in feature hooks, not JSX.
- **Tailwind via design tokens** from `globals.css`. No magic colors / px values.
- **Biome** is the source of truth for format + lint. Run `bun run check` before finishing.
- **Named exports only**, absolute imports via `@/`.

---

## 6. GitNexus — Code Intelligence (MUST)

This project is indexed by GitNexus as **chat-socket-fe**.

- **Before editing any function/class/method:** run `gitnexus_impact({target, direction: "upstream"})`. Report blast radius. Stop on HIGH/CRITICAL and warn the user.
- **Before committing:** run `gitnexus_detect_changes()` to confirm scope.
- **Exploring:** prefer `gitnexus_query({query})` over grep. For a single symbol use `gitnexus_context({name})`.
- **Renames:** use `gitnexus_rename`, never find-and-replace.
- If a tool warns the index is stale: `npx gitnexus analyze`.

| Task                                  | Skill                                                |
| ------------------------------------- | ---------------------------------------------------- |
| How does X work? / architecture       | `agent/skills/gitnexus/gitnexus-exploring/SKILL.md`  |
| What breaks if I change X?            | `agent/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Why is X failing?                     | `agent/skills/gitnexus/gitnexus-debugging/SKILL.md`  |
| Rename / extract / move               | `agent/skills/gitnexus/gitnexus-refactoring/SKILL.md`|
| Tool & schema reference               | `agent/skills/gitnexus/gitnexus-guide/SKILL.md`      |
| CLI (index, status, wiki)             | `agent/skills/gitnexus/gitnexus-cli/SKILL.md`        |

---

## 7. Documentation Lookups

Use **Context7 MCP** for any library/API/CLI documentation (React, React Router, Zustand, TanStack Query, Tailwind, Rsbuild, STOMP, Biome, etc.) — even if you think you know the answer. Do not invent APIs.

---

## 8. Definition of Done

- [ ] Plan file exists in `agent/plans/` (if required by §2 Step 1).
- [ ] All relevant rules from §3 were loaded and followed.
- [ ] `gitnexus_impact` run on every edited symbol; `gitnexus_detect_changes` run before commit.
- [ ] `bun run check` and `bun run typecheck` pass.
- [ ] No `any`, no `forwardRef`, no cross-feature imports, no inline components.
- [ ] Server state via TanStack Query, client state via Zustand — no duplication.
- [ ] No HTTP or STOMP calls outside the service layer.
