# `agent/` — AI resources for chat-socket-fe

This folder holds **coding rules**, **skill packs**, **plan templates**, and **MCP reference config** for Cursor / Claude Code on the **chat-socket-fe** repo. It does not affect production builds — it guides AI agents (and developers) to generate code that matches project architecture.

> **AI agent:** read [`AGENTS.md`](AGENTS.md) first — project structure, data flow, "where do I put X?" lookup, and map of every rule / plan / skill.  
> **GitNexus (impact / query / detect changes):** read root [`../AGENTS.md`](../AGENTS.md) or [`../CLAUDE.md`](../CLAUDE.md).

---

## Table of contents

- [Role of each file](#role-of-each-file)
- [Folder structure](#folder-structure)
- [Symlink setup (Cursor / Claude Code)](#symlink-setup-cursor--claude-code)
- [Tech stack the rules enforce](#tech-stack-the-rules-enforce)
- [GitNexus setup](#gitnexus-setup)
- [Day-to-day usage](#day-to-day-usage)
- [Rules — by cluster](#rules--by-cluster)
- [Skills — when to use](#skills--when-to-use)
- [Plans — large features](#plans--large-features)
- [Suggested workflow](#suggested-workflow)
- [Adding / editing docs](#adding--editing-docs)
- [FAQ](#faq)

---

## Role of each file

| File | Audience | Contents |
|------|----------|----------|
| **`agent/AGENTS.md`** | AI agent | **chat-socket-fe Agent Guide:** source tree, data flow, "Where do I put X?", task → rule/skill map |
| **`agent/README.md`** | Developer (you) | Setup, workflow, rules/skills catalog |
| **Root `AGENTS.md` / `CLAUDE.md`** | AI agent | **GitNexus only** — impact analysis, graph query, `detect_changes`, CLI skills. One-line pointer → `agent/AGENTS.md` |
| **`agent/rules/*.md`** | AI + dev | One convention per file (front-matter `impact: CRITICAL \| HIGH \| MEDIUM`) |
| **`agent/plans/_plan_template.md`** | AI + dev | Checklist before multi-file features |
| **`agent/skills/*/SKILL.md`** | AI | Deep playbooks (refactor, perf, debug, …) |
| **`agent/mcp.json`** | Reference | Sample MCP config — live editor config comes from `npx gitnexus setup` |

**No duplication:** project structure and file placement live only in `agent/AGENTS.md` (+ lookup in `rules/architecture-feature-based-structure.md`). Root `AGENTS.md` must **not** repeat that — GitNexus may rewrite the `gitnexus:start/end` block without losing the guide.

---

## Folder structure

```text
chat-socket-fe/                 ← this repo (single Rsbuild app)
├── agent/                      ← single source of truth — edit here
│   ├── AGENTS.md
│   ├── README.md
│   ├── rules/
│   ├── plans/
│   ├── skills/
│   └── mcp.json
├── .cursor -> agent/           ← symlink (gitignored) — Cursor reads rules/skills
├── .claude -> agent/           ← symlink (gitignored) — Claude Code reads rules/skills
├── .cursorrules                ← short pointer → AGENTS.md + agent/AGENTS.md
├── AGENTS.md                   ← GitNexus (root)
├── CLAUDE.md                   ← GitNexus (root)
└── src/                        ← application source
```

Inside `agent/`:

```text
agent/
├── AGENTS.md               ← Project guide for AI (read first)
├── README.md               ← Developer guide (this file)
├── mcp.json                ← GitNexus MCP reference
├── plans/
│   └── _plan_template.md   ← Plan template before coding a feature
├── rules/                  ← ~43 rules, grouped by filename prefix
│   ├── architecture-*.md
│   ├── tanstack-*.md
│   ├── state-*.md
│   ├── react-*.md
│   ├── routing-*.md
│   ├── styling-*.md
│   ├── forms-*.md
│   ├── typescript-*.md
│   ├── data-*.md
│   ├── service-layer.md
│   ├── query-key-factory.md
│   ├── shadcn-ui.md
│   ├── usehooks-ts.md
│   └── error-handling.md
└── skills/
    ├── gitnexus/           ← explore, impact, debug, refactor, CLI
    ├── refactoring/
    ├── vercel-react-best-practices/
    ├── vercel-composition-patterns/
    └── web-design-guidelines/
```

> **How symlinks work:** `.cursor` and `.claude` are not copies — they point at `agent/`. Edit `agent/rules/` or `agent/skills/` once; both editors see the change immediately.

---

## Symlink setup (Cursor / Claude Code)

Create symlinks **once** after cloning. They are gitignored; each developer creates them locally.

### Windows (cmd / PowerShell — Administrator or Developer Mode)

```cmd
cd E:\Personal\chat\chat-socket-fe

:: Remove existing .cursor / .claude if they are real folders (not symlinks)
:: rmdir /S /Q .cursor
:: rmdir /S /Q .claude

cmd /c mklink /D .cursor agent
cmd /c mklink /D .claude agent
```

> **Windows note:** `mklink` needs an **Administrator** terminal, or **Developer Mode** enabled (Settings → System → For developers).

### macOS / Linux

```bash
cd /path/to/chat-socket-fe

# rm -rf .cursor .claude   # if old real folders exist

ln -s agent .cursor
ln -s agent .claude
```

### Verify

```powershell
# Windows
(Get-Item .cursor).Target
(Get-Item .claude).Target
```

Both should resolve to `agent`.

### Conflict with `gitnexus setup`

`npx gitnexus setup` may create `.claude/skills/gitnexus/` as a real folder. This repo already ships those skills under `agent/skills/gitnexus/`. After symlinking `.claude -> agent`, Claude Code reads from `agent/skills/` directly.

If `.claude` already exists as a folder:

1. Remove or back up `.claude` (GitNexus skills are in `agent/skills/gitnexus/`).
2. Recreate the symlink as above.

### Cursor: `.cursorrules`

Root [`.cursorrules`](../.cursorrules) points agents at `AGENTS.md` + `agent/AGENTS.md`. Use it **together with** the symlink, not instead of it.

---

## Tech stack the rules enforce

| Layer | Technology |
|-------|------------|
| App | Single Rsbuild SPA — not a monorepo |
| UI | React 19, shadcn/ui in `src/components/ui/`, Tailwind v4, lucide-react |
| Language | TypeScript strict, Biome |
| Routing | React Router v7 (`react-router`) |
| Server state | TanStack Query v5 |
| Client state | Zustand v5 (`useAuthStore`, `useSocketStore`) |
| HTTP | Axios via `src/libs/axios.ts` → plain-object services in `src/services/` |
| Real-time | STOMP (`@stomp/stompjs`) — `socket-service.ts` + `useSocketStore` |
| Forms | Zod + react-hook-form (`forms-schema-driven.md`) |
| Lists | React Virtuoso for long message/conversation lists |
| Build | Rsbuild |
| Package manager | Bun (`bun install`, `bun run dev`) |

### Data flow (summary)

```text
config → libs/axios → services/* → hooks/api/* → features/*/hooks → features/*/templates → pages/*
                              ↘
                    stores/useSocketStore → services/socket-service → features/chat/hooks/use-chat-socket-sync
```

Detail + "where do I put X?": [`AGENTS.md`](AGENTS.md) §1 and [`rules/architecture-data-flow.md`](rules/architecture-data-flow.md).

### Import alias

| Alias | Maps to |
|-------|---------|
| `@/*` | `./src/*` |

Use `@/` for all cross-folder imports. Relative imports are allowed only between siblings inside the same feature folder.

---

## GitNexus setup

Run from the **repo root** (not inside `agent/`).

### 1. MCP config (once per machine)

```bash
npx gitnexus setup
```

Restart Cursor to load the MCP server.

### 2. Index the codebase

```bash
npx gitnexus analyze
```

Updates `.gitnexus/` and the GitNexus block in root `AGENTS.md` / `CLAUDE.md`.

```bash
npx gitnexus status          # check index freshness
npx gitnexus analyze --force # full re-index after large changes
```

### When to use GitNexus

| Situation | Action |
|-----------|--------|
| New feature touching many layers | `gitnexus_query` + `gitnexus_impact` before coding |
| Refactor / rename / split file | Impact analysis required |
| Hard-to-trace bug | `gitnexus-debugging` skill |
| Before commit | `gitnexus_detect_changes()` |

---

## Day-to-day usage

### With Cursor Agent

1. Agent reads root `AGENTS.md` (GitNexus) + follows pointer to `agent/AGENTS.md`.
2. Rules apply via workspace config and `@agent/rules/...` references in prompts.
3. Example prompts:
   - *"Implement feature X using the plan template — read agent/AGENTS.md first."*
   - *"Add a new conversation API — follow service-layer + tanstack rules."*
   - *"Refactor use-chat-socket-sync — run impact analysis first."*

### Large features (≥ 3 files)

1. Copy `plans/_plan_template.md` → `plans/2026-MM-DD-<feature>.md`
2. Complete §1–§3 (pre-flight, design, file manifest) **before coding**
3. Prompt: *"Implement per `agent/plans/2026-MM-DD-<feature>.md`"*

The template enforces: GitNexus scan → layers in order (config → service → hooks/api → feature → page) → architecture violation checklist.

### Prompt examples

| Goal | Suggested prompt |
|------|------------------|
| New feature | *"Add `<feature>` — copy plan template, follow architecture + service-layer rules."* |
| New API | *"Add endpoint for `<path>` — service in `src/services/`, TanStack hook in `hooks/api/`, no HTTP in components."* |
| Refactor | *"Refactor `<file>` — refactoring skill + gitnexus impact first."* |
| Debug | *"Trace `<error>` — gitnexus debugging skill."* |
| Performance | *"Review `<component>` with vercel-react-best-practices."* |
| UI / a11y | *"Audit `<screen>` with web-design-guidelines."* |

---

## Rules — by cluster

Each rule has front-matter `impact: CRITICAL | HIGH | MEDIUM` and ❌/✅ examples. AI must follow **CRITICAL** and **HIGH** on new code.

### `architecture-*` (CRITICAL)

| File | Focus |
|------|-------|
| `architecture-feature-based-structure.md` | Feature folders + "Where do I put X?" |
| `architecture-data-flow.md` | Config → service → hook → component (one direction) |
| `architecture-cross-feature-isolation.md` | No sibling feature imports |
| `architecture-shared-vs-feature.md` | Shared vs feature vs `components/ui` |
| `architecture-routes-thin.md` | Pages mount templates only |

### Data layer

| File | Focus |
|------|-------|
| `service-layer.md` | Plain-object services, `axiosClient`, `APP_API` |
| `data-service-layer.md` | Hook ↔ service boundary |
| `query-key-factory.md` | `queryKeysFactory` — no inline key arrays |
| `data-cache-key-factory.md` | Cache key conventions |
| `tanstack-use-query.md` | `useQuery` pattern |
| `tanstack-use-mutation.md` | Mutations + invalidation |
| `tanstack-use-infinite.md` | Infinite query (conversation/message lists) |
| `data-error-handling.md` | Query/mutation error handling |
| `error-handling.md` | `getErrorMessage` + Sonner — single toast site |

### `state-*`

| File | Focus |
|------|-------|
| `state-server-vs-client.md` | Server → Query; UI → Zustand/`useState` |
| `state-store-pattern.md` | Zustand v5 canonical shape |
| `state-store-slicing.md` | Split stores by domain |
| `state-store-selectors.md` | Selector pattern |
| `state-store-no-derived.md` | No derived state in store |
| `state-global-vs-local.md` | Global vs local |

### `react-*`

| File | Focus |
|------|-------|
| `react-functional-only.md` | Functional components only |
| `react-no-forwardref.md` | React 19 — `ref` as prop |
| `react-no-inline-components.md` | No nested component definitions |
| `react-effects-sync-only.md` | Effects for external sync only |
| `react-derived-state.md` | Derive during render, not in effects |
| `react-custom-hook-extraction.md` | Extract logic into hooks |
| `react-key-prop-stability.md` | Stable list keys |

### `typescript-*`

| File | Focus |
|------|-------|
| `typescript-ban-any.md` | No `any` |
| `typescript-null-safety.md` | Null safety |
| `typescript-named-exports.md` | Named exports (default: pages/templates only) |
| `typescript-type-only-imports.md` | `import type` |
| `typescript-absolute-imports.md` | `@/` alias |
| `typescript-discriminated-unions.md` | Discriminated unions |
| `typescript-as-const-immutable.md` | `as const` |
| `typescript-naming-conventions.md` | Naming conventions |

### UI, routing, forms, styling

| File | Focus |
|------|-------|
| `forms-schema-driven.md` | Zod + `z.infer` |
| `routing-constants.md` | `APP_ROUTES` in `src/config/routes.ts` |
| `routing-route-guards.md` | `ProtectedRoute`, `GuestRoute` |
| `styling-design-tokens.md` | Tailwind v4 design tokens in `globals.css` |
| `styling-conditional-classes.md` | `cn()` from `@/utils/cn` |
| `shadcn-ui.md` | `@/components/ui/*`, Sonner for toasts |
| `usehooks-ts.md` | Generic hooks pattern (prefer existing `src/hooks/` first) |

Task → rule map: [`AGENTS.md`](AGENTS.md) §3.

---

## Skills — when to use

| Skill | Use when |
|-------|----------|
| `gitnexus/gitnexus-exploring` | Understand flows, find callers |
| `gitnexus/gitnexus-impact-analysis` | Before any significant edit |
| `gitnexus/gitnexus-debugging` | Trace bugs |
| `gitnexus/gitnexus-refactoring` | Safe rename/extract via call graph |
| `gitnexus/gitnexus-guide` | MCP tool reference |
| `gitnexus/gitnexus-cli` | `analyze`, `status`, clean, wiki |
| `refactoring` | Long files, prop drilling, JSX logic |
| `vercel-react-best-practices` | Re-renders, bundle, async |
| `vercel-composition-patterns` | Component API design |
| `web-design-guidelines` | Accessibility, UX audit |

---

## Plans — large features

[`plans/_plan_template.md`](plans/_plan_template.md) has 7 sections:

| Section | Purpose |
|---------|---------|
| §1 Pre-flight | GitNexus query/impact, file scan, applicable rules |
| §2 Design | Layer-by-layer + server vs client state |
| §3 File manifest | Every CREATE/MODIFY path |
| §4 Execution | One step = one file, dependency order |
| §5 Edge cases | Loading, errors, STOMP, perf, types |
| §6 Violations | Auto-fail checklist |
| §7 Verification | `gitnexus_detect_changes`, `bun run check`, `bun run typecheck` |

Do **not** edit `_plan_template.md` per feature — copy to `plans/YYYY-MM-DD-<feature>.md`.

---

## Suggested workflow

```text
0. Symlink .cursor / .claude -> agent     ← Once after clone
1. npx gitnexus setup                     ← MCP (once per machine)
2. npx gitnexus analyze                   ← Index repo
3. Read agent/AGENTS.md §1                ← Structure + file placement
4. Copy plan template (large feature)     ← Fill §1–§3
5. gitnexus_impact / query                ← Blast radius
6. Implement by layer                     ← config → service → hooks/api → feature → page
7. gitnexus_detect_changes                ← Before commit
8. bun run check && bun run typecheck
```

### Pre-merge checklist

- [ ] Data flows one way — no HTTP / `@/services/*` in components or feature hooks
- [ ] Feature code under `src/features/<feat>/`, not leaked into shared folders
- [ ] Query keys via `queryKeysFactory` in `src/libs/query-key-factory.ts`
- [ ] Routes from `APP_ROUTES` — no hardcoded paths
- [ ] Forms: Zod + `z.infer`
- [ ] UI primitives from `@/components/ui/` — added via shadcn CLI
- [ ] Errors: `getErrorMessage` + `toast.error` — no axios re-parsing in UI
- [ ] STOMP: subscribe/parse in `socket-service`, cache sync in feature hooks
- [ ] GitNexus impact run for touched symbols

---

## Adding / editing docs

### New rule

1. Copy [`rules/_template.md`](rules/_template.md)
2. Name with cluster prefix (`architecture-`, `tanstack-`, `react-`, …)
3. Set `impact` + ❌/✅ examples

### New skill

1. Create `skills/<name>/SKILL.md` (see [`skills/refactoring/SKILL.md`](skills/refactoring/SKILL.md))

### Feature plan

Copy `_plan_template.md` → `plans/YYYY-MM-DD-<feature>.md`.

### Cross-cutting update (new layer, new convention)

Sync these locations:

1. [`AGENTS.md`](AGENTS.md) — §1 structure, §1.3 lookup, §3 router
2. [`rules/architecture-feature-based-structure.md`](rules/architecture-feature-based-structure.md) — lookup table
3. [`plans/_plan_template.md`](plans/_plan_template.md) — §2.2 + §3
4. Root [`README.md`](../README.md) — if dev onboarding changes
5. New focused rule file if needed

Root `AGENTS.md` / `CLAUDE.md`: edit only the pointer line **outside** `gitnexus:start/end`.

---

## FAQ

**How is `agent/AGENTS.md` different from root `AGENTS.md`?**  
`agent/AGENTS.md` = project guide (structure, data flow, rules map). Root `AGENTS.md` = GitNexus contract. AI reads both.

**Why symlink `.cursor` / `.claude`?**  
Editors expect rules/skills under those paths. Symlinks keep **one source** in `agent/`.

**Windows symlink fails?**  
Use Administrator terminal or enable Developer Mode, then `cmd /c mklink /D .cursor agent`.

**Can I edit root `AGENTS.md` manually?**  
Only the pointer line outside `<!-- gitnexus:start/end -->`. GitNexus manages the rest via `npx gitnexus analyze`.

**Do rules auto-load in Cursor?**  
Partially via workspace rules. Reference `@agent/rules/...` in prompts for explicit scope.

**Stale GitNexus index?**  
Run `npx gitnexus status` → `npx gitnexus analyze`.

**How do I run the app?**  
See root [`README.md`](../README.md): `bun install`, `bun run dev` → http://localhost:3000.

---

## References

- [Agent guide (AI)](AGENTS.md)
- [Plan template](plans/_plan_template.md)
- [Architecture — feature structure](rules/architecture-feature-based-structure.md)
- [Architecture — data flow](rules/architecture-data-flow.md)
- [HTTP layer — service-layer](rules/service-layer.md)
- [Root README](../README.md)
- [GitNexus CLI skill](skills/gitnexus/gitnexus-cli/SKILL.md)
