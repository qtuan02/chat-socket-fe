# AGENTS.md

Strict instructions for AI coding agents (Claude Code, Cursor, Copilot) working in this repo.
This file is a **router**, not a manual. It tells you **which rule to read** before you touch code.

> Mirror copies: `CLAUDE.md`, `.cursorrules`. Keep all three in sync.

---

## 1. Project Snapshot

- **Stack:** React 19 · TypeScript · Tailwind v4 · Zustand v5 · React Router v7 · TanStack Query · STOMP (WebSocket) · Rsbuild · Biome.
- **Architecture:** Feature-based. Source in `src/`:
  - `features/{auth,chat,conversation,current-user,friends,group}` — vertical slices (components, hooks, services, stores, types).
  - `components/{ui,shared}` — `ui/` = shadcn primitives, `shared/` = cross-feature components.
  - `hooks/`, `libs/`, `providers/`, `services/`, `stores/`, `config/`, `pages/`, `types/`, `utils/`.

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
- **Tailwind via design tokens** from `globals.css`. No magic colors / px values.
- **Biome** is the source of truth for format + lint. Run before finishing.
- **Named exports only**, absolute imports via the configured alias.

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

- [ ] Plan file exists in `agent/plans/` (if required by §2.1).
- [ ] All relevant rules from §3 were loaded and followed.
- [ ] `gitnexus_impact` run on every edited symbol; `gitnexus_detect_changes` run before commit.
- [ ] Biome passes (format + lint).
- [ ] No `any`, no `forwardRef`, no cross-feature imports, no inline components.
- [ ] Server state via TanStack Query, client state via Zustand — no duplication.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **chat-socket-fe** (1783 symbols, 3463 relationships, 122 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/chat-socket-fe/context` | Codebase overview, check index freshness |
| `gitnexus://repo/chat-socket-fe/clusters` | All functional areas |
| `gitnexus://repo/chat-socket-fe/processes` | All execution flows |
| `gitnexus://repo/chat-socket-fe/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
