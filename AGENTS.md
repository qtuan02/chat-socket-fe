# AGENTS.md

You are an expert in TypeScript, React, Rsbuild, Tailwind CSS, shadcn/ui, TanStack Query, Zustand, STOMP/WebSocket chat flows, and maintainable frontend architecture.

This project is a realtime chat frontend. Before editing, read the rule files that match the layer you will touch.

## Required Reading

- Always read `rules/PROJECT_RULES.md`.
- Read `rules/naming.md` before creating, renaming, or exporting files/folders/symbols.
- Read `rules/code_review.md` before finalizing a non-trivial change.
- For source edits, read `rules/src.md`.
- For route pages, read `rules/pages.md`.
- For feature modules, read `rules/features.md`.
- For UI work, read `rules/components.md`, and also `rules/components-ui.md` when touching raw shadcn/ui primitives.
- For reusable hooks or API hooks, read `rules/hooks.md` and `rules/data-fetching.md`.
- For services, sockets, HTTP clients, or STOMP/WebSocket behavior, read `rules/services.md`, `rules/libs.md`, and `rules/realtime.md`.
- For env, constants, routes, storage keys, or feature flags, read `rules/config.md` and `rules/security.md`.
- For Zustand stores, read `rules/stores.md` and `rules/data-fetching.md`.
- For shared contracts, read `rules/types.md`.
- For helpers/integrations, read `rules/utils.md` or `rules/libs.md`.
- For tests or verification changes, read `rules/testing.md`.

## Commands

- `bun run dev` - Start the Rsbuild dev server.
- `bun run build` - Build the app for production.
- `bun run preview` - Preview the production build locally.
- `bun run check` - Run Biome checks without writing fixes.
- `bun run check:fix` - Run Biome checks and apply safe fixes.
- `bun run lint` - Run Biome lint checks.
- `bun run lint:fix` - Run Biome lint and apply safe fixes.
- `bun run format` - Check formatting with Biome.
- `bun run format:fix` - Format files with Biome.
- `bun run typecheck` - Run TypeScript without emitting files.

On Windows PowerShell, use `bun.cmd` if the `bun` PowerShell shim is blocked, for example `bun.cmd run check`.

## Non-Negotiables

- Route pages stay thin and import feature templates.
- Raw shadcn/ui primitives live in `src/components/ui`.
- App-custom reusable UI lives in `src/components/shared`.
- Feature-only UI and orchestration stay in `src/features/<feature>`.
- HTTP and socket service functions live in `src/services`.
- Low-level third-party client setup lives in `src/libs`.
- Reusable TanStack Query hooks live in `src/hooks/api`.
- Global client state uses `src/stores`; server data must stay in TanStack Query.
- Use `@/` imports for code under `src`.
- Do not log tokens, private messages, or raw sensitive payloads.
