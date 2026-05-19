# AGENTS.md

AI coding rules for `chat-socket-fe`.

This file is the source of truth for Codex and other AI coding agents working in this repository.

## 0. Instruction Scope And Precedence

- Follow this root file for repository-wide defaults.
- Also read the nearest scoped `AGENTS.md` for every file you touch.
- When a task touches multiple folders, read each relevant scoped file before editing.
- More specific scoped files override root guidance for that folder.
- User instructions for the current task override these files, unless they ask for unsafe or impossible behavior.
- Keep future rule updates concise and operational. Prefer scoped rules over growing this root file when the rule only applies to one layer.
- Treat existing code that violates a rule as legacy context, not permission to add more violations.

## 0.1 Sources Of Truth

- Use `package.json` for dependency versions and scripts.
- Use current source code for architecture facts and ownership boundaries.
- Use official documentation or primary sources for version-specific behavior when uncertain.
- For library and framework behavior, use Context7 when available; otherwise browse official docs or primary repositories.
- If external research affects an implementation decision, cite the source in the final response.
- Do not infer backend contracts from UI expectations. Use existing `src/types`, services, and observed contracts unless the user provides backend changes.
- Do not install or copy external agent/rule/skill packs wholesale. Extract only repo-fit, actionable rules with a clear failure mode.

## 0.2 Research And Context Management

- Start broad, then narrow: inspect manifests, entry points, configs, scoped `AGENTS.md`, and relevant `rg` results before opening many files.
- Prefer high-signal reads over reading entire directories. Ignore `node_modules`, `dist`, generated files, and unrelated feature areas.
- When context is ambiguous, do one refinement loop: search for project terminology, read the strongest matches, then decide.
- Promote a new rule only when it is actionable, applies to this repo, and prevents a concrete failure. Otherwise keep it as task-specific guidance.
- Keep project instructions lean. If a rule applies only to one folder, put it in that folder's scoped `AGENTS.md`.
- For unfamiliar or cross-cutting changes, summarize assumptions before editing and report any unknown backend or runtime behavior.

## 1. Project Overview

`chat-socket-fe` is a responsive realtime chat web app for authenticated users.

Core flows include auth/session refresh, protected routes, conversation and message views, direct/group chat, read receipts, friends/friend requests, group member management, and current-user profile.

Production status is not documented in source. Treat production assumptions as unknown unless the user provides them.

## 2. Repository Structure

Frontend source is at the repository root.

```text
src/
  app.tsx
  index.tsx
  globals.css
  components/
    ui/
    shared/
  config/
  features/
  hooks/
    api/
  libs/
  pages/
  providers/
  services/
  stores/
  types/
  utils/
```

Generated or external directories:

- `node_modules/`
- `dist/`

Do not edit generated output or installed dependencies.

Scoped `AGENTS.md` files exist under main source folders. The root file sets repository-wide defaults; scoped files add stricter local rules for the layer or feature being touched.

Scoped rule discovery:

- Before editing, discover rule files with `rg --files -g AGENTS.md`.
- For every file you touch, read this root file and the nearest scoped `AGENTS.md`.
- When a change crosses nested ownership boundaries, read each relevant scoped file from broadest to nearest.
- Do not maintain a static list of scoped rule files in this root file; feature folders can be added, renamed, or removed over time.
- Do not create one `AGENTS.md` per folder by default. Prefer parent scoped rules unless a child folder has distinct invariants.
- Add a feature-level `AGENTS.md` only when the feature has non-obvious invariants, backend contracts, cache behavior, realtime behavior, auth/session behavior, complex forms, or cross-feature ownership rules.
- For simple CRUD or display-only features, rely on `src/features/AGENTS.md` until feature-specific rules are truly needed.

## 3. Tech Stack

Use `package.json` as source of truth.

Primary stack: React 19, TypeScript, React Router 7, Rsbuild/Rspack, Bun, Tailwind CSS 4, shadcn/Radix-style primitives, TanStack Query 5, Zustand, Axios, STOMP via `@stomp/stompjs`, React Hook Form, Zod, Biome, Sonner, Lucide React, and React Virtuoso.

Do not replace the framework, build tool, router, state libraries, or UI stack as part of a normal task.

## 4. Development Commands

Use exact scripts from `package.json`.

Common commands: `bun install`, `bun run dev`, `bun run build`, `bun run preview`, `bun run check`, `bun run typecheck`, `bun run lint`, `bun run format`, plus matching `*:fix` scripts.

Unit tests are not currently configured.
E2E tests are not currently configured.

On Windows PowerShell, use `bun.cmd` if the Bun shim is blocked.

## 5. Architecture Rules

- Keep frontend source under `src/`.
- Keep route pages thin.
- Put screen orchestration in feature templates and feature hooks.
- Use `@/` imports for source modules.
- The app currently uses React Router declarative routing with `BrowserRouter`; do not introduce Data/Framework mode APIs, loaders, actions, or router-mode rewrites unless the task explicitly asks for that migration.
- Use services for REST and socket calls.
- Use `src/hooks/api` for reusable TanStack Query hooks.
- Keep server state in TanStack Query.
- Use Zustand only for auth, socket, and small cross-route client UI state.
- Reuse existing UI primitives and shared components before creating new ones.
- Preserve Axios refresh behavior.
- Preserve route guards.
- Preserve STOMP lifecycle cleanup.
- Use env values only through `src/config/env.ts`.

## 6. File And Folder Ownership

- `src/pages`: route page components only. No API calls, socket subscriptions, or large business logic.
- `src/features`: bounded product feature modules and screen orchestration.
- `src/features/<feature>/templates`: page-level feature views imported by route pages.
- `src/features/<feature>/components`: feature-only UI.
- `src/features/<feature>/hooks`: feature-only orchestration.
- `src/components/ui`: generic low-level UI primitives.
- `src/components/shared`: reusable app-specific UI.
- `src/hooks/api`: reusable TanStack Query hooks.
- `src/services`: REST and socket service functions.
- `src/libs`: configured clients and third-party integrations.
- `src/stores`: small global Zustand stores.
- `src/types`: shared API/domain contracts.
- `src/config`: env, routes, constants.
- `src/utils`: shared pure helpers.

Do not move architecture boundaries unless explicitly requested.

## 6.1 Source Editing Rules

- Before changing an exported component, hook, service, type, or query key, search all call sites.
- Keep new code in the narrowest owner that can use it: feature-local first, shared only after reuse is real.
- Keep data transformation near the boundary that needs it: services for transport mapping, query hooks for server-state shaping, feature hooks for view orchestration, components for display-only formatting.
- Prefer deleting duplicated state over syncing it. Derived values should be computed from props, state, query data, or store selectors unless the user is editing a draft.
- Keep side effects visible at layer boundaries. Utilities should be pure by default; hooks/components own browser, timer, subscription, and UI effects.
- Avoid boolean-flag APIs for exported helpers/components when the states can be named as a union or options object.
- Do not change public component props, hook return shapes, service signatures, query keys, route paths, or shared types without checking downstream consumers.

## 7. Coding Style

- Use TypeScript for source code.
- Use Biome formatting and linting.
- Prefer double quotes to match current formatting.
- Prefer named exports for app code unless preserving an existing default export.
- Use lowercase kebab-case file names for new source files.
- Use PascalCase for React components.
- Use `useXxx` for hooks.
- Use `camelCase` for variables and functions.
- Use `UPPER_CASE` only for true constants.
- Do not create vague files such as `helpers.ts`, `common.ts`, `misc.ts`, or `temp.ts`.
- Do not add barrel exports casually.
- Keep solutions simple. Avoid speculative abstractions, premature optimization, and clever code when a direct local pattern exists.
- Extract duplication only after the repeated shape is real and stable.

## 7.1 Clean Code And Reuse Rules

- Before writing common UI, hooks, utilities, form behavior, cache helpers, or interaction logic from scratch, search the repo for an existing pattern.
- For behavior covered by the current stack, read the relevant official docs or primary source before implementing: shadcn/Radix for primitives and blocks, React docs for hook/effect semantics, TanStack Query docs for cache behavior, and vetted hook libraries such as usehooks-ts for common browser hooks.
- Prefer adapting a small, well-understood pattern into project-owned code over adding a dependency for simple behavior.
- Do not copy external code blindly. Check license compatibility, remove incompatible assumptions, preserve TypeScript strictness, and mention the source in the final response when the adaptation is non-trivial.
- Keep modules purpose-driven. A component, hook, or utility should have one clear reason to change.
- Do not split code into tiny files only to look organized. Extract when it improves reuse, testability, or local readability.
- Delete dead branches, unused imports, stale props, and duplicated state while touching nearby code, but avoid broad cleanup churn unrelated to the task.
- Prefer clear control flow: guard clauses for invalid input/auth/loading/error states, named intermediate values for non-trivial conditions, and no nested ternaries for business logic.
- Comments should explain why a non-obvious decision exists. Do not comment what the code already says.

## 8. TypeScript Rules

- Avoid new `any`; Biome permits explicit `any`, but project policy is stricter than the linter.
- Do not loosen TypeScript config.
- API responses must be typed, shared types must track backend contracts, and UI must not invent backend fields.
- Use `unknown` plus narrowing for untrusted external values when a precise type is not available.
- Prefer guards over non-null assertions; keep unavoidable casts local and explain why the runtime shape is safe.
- Prefer discriminated unions for mutually exclusive states such as loading/success/error, socket status, modal modes, and mutation flows.
- Use exhaustive checks for discriminated unions when a missed case would be user-visible or affect data correctness.
- Avoid broad truthiness checks when `0`, `""`, `false`, or empty arrays are valid values.
- Keep type-only imports compatible with `verbatimModuleSyntax`.
- Use `interface` for object contracts when useful; use `type` for unions, utility types, and derived form values.

## 9. React Rules

- Keep render paths pure.
- Treat props, state, context, and query data as immutable.
- Do not call `setState` during render.
- If something can be calculated during render, do not mirror it into state with an effect.
- Put user-triggered side effects in event handlers instead of effects.
- Use `useEffect` for external synchronization such as sockets, timers, browser APIs, and subscriptions.
- Extract hooks for complex orchestration and components for large JSX sections.
- Do not define unstable components inside render.
- Avoid expensive list mapping in hot render paths.
- Use stable keys, never array index for chat messages.
- Keep virtualized rows lightweight.
- Do not mirror query data into local state unless editing or draft behavior requires it.

## 10. UI/UX Rules

- Use existing Tailwind classes and CSS variable tokens.
- Tailwind v4 theme tokens live in `src/globals.css` through `@theme`; prefer those tokens over ad hoc colors or new CSS config files.
- Use existing shadcn/Radix primitives.
- Loading states should use `Skeleton` or `Loader2`; empty states should use muted copy; query errors should be inline with Retry where relevant.
- Use Sonner for mutation success/failure toasts.
- Preserve responsive desktop/mobile chat layouts and verify mobile width for chat UI changes.
- Interactive controls need accessible labels/focus behavior; dialogs must use accessible primitives, not custom overlays.
- Keep chat workspace dense and functional. Do not turn app screens into marketing-style layouts.

## 11. Auth/Session Rules

- Keep the current in-memory access-token model and centralized Axios refresh flow.
- Do not store tokens in browser storage, URLs, logs, or feature state without explicit approval.
- Refresh failure must clear auth/query state and return the user to sign in.
- Preserve `ProtectedRoute` and `GuestRoute` behavior unless the task explicitly changes routing/auth.
- See `src/features/auth/AGENTS.md`, `src/libs/AGENTS.md`, `src/providers/AGENTS.md`, and `src/stores/AGENTS.md` for scoped auth rules.

## 12. Realtime/Socket Rules

- STOMP client ownership stays in the socket store.
- Socket subscriptions belong in providers, hooks, or services; never in route pages or render paths.
- Subscription helpers must return cleanup functions, and effects must clean up correctly.
- Handlers must be idempotent and dedupe messages/read receipts by stable ids.
- Do not log raw socket payloads or manually reconnect from UI components.
- Do not add optimistic message sending unless client id, rollback, dedupe, failure state, and server reconciliation are designed.

See `src/features/chat/AGENTS.md` and `src/services/AGENTS.md` for stricter scoped rules.

## 13. TanStack Query/Cache Rules

- Query keys must be arrays.
- Use query key factories/helpers; keys must include all query parameters and avoid raw scattered keys.
- Server data belongs in TanStack Query.
- Patch cache only for deterministic small updates; invalidate when broad consistency is uncertain.
- Preserve infinite query shape `{ pages, pageParams }` and never mutate cached arrays or objects directly.
- Dedupe cached messages by stable id.
- Do not move server data to Zustand.

See `src/hooks/api/AGENTS.md` for scoped query rules.

## 14. Form Rules

- Use React Hook Form + Zod for non-trivial validated forms.
- Show field validation inline.
- Use toasts for mutation-level success/failure.
- Disable submit while pending and prevent double submit.
- Reset dialog forms on close.
- Preserve user input after failed submit when retry is expected.
- Trim text payloads before submit when backend expects normalized strings.

## 15. Error Handling Rules

- Use normalized error messages.
- Use `getErrorMessage` or existing helpers when present.
- Show query errors inline with Retry; use toasts for mutation errors.
- Do not expose raw backend payloads.
- Do not swallow async errors silently or add noisy console logging.
- Keep services free of UI feedback. Services should throw typed/normalized errors; features decide display.

## 16. Security Rules

- Do not render raw HTML from messages or users.
- Do not use `dangerouslySetInnerHTML` for chat content unless sanitized and explicitly approved.
- Do not commit `.env`; client env vars must use the public-safe naming already used by the repo.
- Do not log tokens, cookies, auth headers, private messages, socket payloads, or full sensitive responses.
- Do not hardcode API secrets.
- Attachment upload, if added later, must validate size, MIME type, extension, preview URL lifecycle, and server contract.

## 17. Performance Rules

- Keep message and conversation lists virtualized.
- Use memoization only when it protects hot paths or expensive derived data.
- Avoid mirroring query data into local state.
- Avoid creating new arrays/objects/functions in virtualized hot paths when passed as props.
- Keep socket event handlers small and lazy-load heavy UI only when useful.
- Do not add heavy dependencies for simple utilities.

## 18. Dependency Rules

- Prefer the existing stack first.
- Do not add overlapping UI libraries.
- Do not add another state manager.
- Do not add heavy date libraries unless justified.
- Before adding a dependency:
  - Search existing code.
  - Check if native/project utility is enough.
  - Check maintenance.
  - Check bundle impact.
  - Check license risk when practical.
  - Explain why it is needed.
- Use Bun dependency commands.
- Do not hand-edit `bun.lock`.

## 19. Git/PR Expectations

No official workflow is documented in source. Use these defaults unless the user says otherwise.

- Branch prefixes: `feature/`, `fix/`, `hotfix/`, `refactor/`, `chore/`, or `codex/` for Codex-created branches.
- Commits: prefer Conventional Commits such as `feat:`, `fix:`, `refactor:`, `perf:`, `docs:`, `test:`, `style:`, `chore:`.
- PRs should include summary, changed areas, verification, assumptions, and screenshots for visible UI changes.
- Changelog is required only when the user asks or when release workflow requires it.
- Do not refactor unrelated files.

## 20. Forbidden Patterns

- Do not bypass layer ownership: no Axios in UI, no server entities in Zustand, no feature behavior in UI primitives, no socket subscriptions during render.
- Do not mutate query cache, infinite pages, props, state, or query data in place.
- Do not scatter raw query keys, env reads, API URLs, route strings, or backend-field assumptions.
- Do not swallow async errors, add sensitive logging, weaken tooling, edit generated output, or refactor unrelated files.
- Do not add dependencies, replace stack pieces, or change auth/socket/backend contracts without approval and verification.

## 21. Change-Risk Classification

- Low: copy, small local styling, loading/empty copy, local component cleanup.
- Medium: form validation, query invalidation, Zustand client state, route guard UI, shared components.
- High: socket subscriptions, query cache patching, infinite scroll, auth/session refresh, message ordering/read receipts, API response typing.
- Critical: Axios refresh flow, token persistence, STOMP lifecycle, backend contracts, query ownership, framework/build/state/UI stack replacement.
- For high or critical risk changes, explain the risk and run targeted verification.

## 22. AI Decision Tree Before Coding

1. Read the task, relevant source, and nearest scoped `AGENTS.md`.
2. Search for existing patterns and all affected call sites.
3. Identify ownership plus auth, socket, query/cache, and responsive UI implications.
4. Make the smallest safe change.
5. Review the diff, run required verification, and report changed files plus verification results.

Ask before changing API contracts, adding dependencies, changing auth/session flow, changing socket lifecycle, moving feature boundaries, weakening tooling, or broad refactoring.

## 22.1 Code Review Checklist

- Review the final diff before responding.
- Check that every changed file belongs to the correct layer and nearest scoped `AGENTS.md`.
- Check changed exports against all call sites.
- Check TypeScript strictness: no new `any`, unsafe cast, non-null assertion, or invented backend field without a boundary reason.
- Check React correctness: pure render, no derived-state effects, stable keys, cleanup for subscriptions/timers/browser listeners.
- Check data correctness: query keys include variables, cache patches preserve shape, invalidation is targeted, and server data stays out of Zustand.
- Check user states: loading, empty, error, disabled, pending, and retry paths where the flow can enter them.
- Check security/privacy: no raw tokens, cookies, private messages, auth headers, socket payloads, or sensitive responses are logged.
- For high-risk changes, state the risk and verification performed. If verification cannot run, report the exact blocker.

## 23. Verification Matrix

This matrix is the canonical verification source. Scoped `AGENTS.md` files should only add layer-specific checks such as socket cleanup, mobile layout review, route guard review, or cache-shape review. If root and scoped guidance differ, run the stricter verification.

| Change type | Required verification |
|---|---|
| Docs only | No build required unless examples/config changed |
| Type or utility change | `bun run check`, `bun run typecheck` |
| UI component change | `bun run check`, `bun run typecheck`, responsive review at mobile and desktop widths |
| Route/config/build change | `bun run check`, `bun run typecheck`, `bun run build` |
| Query/cache change | check/typecheck plus cache shape review |
| Socket change | check/typecheck plus subscription cleanup review |
| Auth/session change | check/typecheck/build plus login/refresh/logout review |
| Dependency change | install with Bun, check/typecheck/build |

For visible UI changes, use browser QA when feasible: run the app, check the changed flow at narrow mobile and desktop widths, verify no critical console/runtime errors, and capture screenshots when layout risk is meaningful.

## 24. Definition Of Done

A task is done when the requested behavior is implemented in the right layer, relevant UI/query/socket/auth states are handled, no sensitive logging or unjustified type loosening was added, required verification passes or a concrete blocker is reported, and the final response lists changed files plus commands run.
