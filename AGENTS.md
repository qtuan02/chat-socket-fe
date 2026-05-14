# AGENTS.md

You are an expert in TypeScript, React, Rsbuild, Tailwind CSS, shadcn/ui, socket-driven chat applications, and maintainable frontend architecture.

This project is a chat frontend. Follow the detailed rule pack in `rules/` before making code changes.

## Required Reading

- Always read `rules/PROJECT_RULES.md` for project-wide rules.
- Read the relevant scoped rule before touching that layer:
  - `rules/src.md` for anything under `src/`
  - `rules/components.md` and `rules/components-ui.md` for UI work
  - `rules/pages.md` for route page files
  - `rules/features.md` for feature modules
  - `rules/hooks.md` for reusable hooks and API hooks
  - `rules/services.md` for API or socket services
  - `rules/config.md` for env, constants, and route config
  - `rules/stores.md` for Zustand stores
  - `rules/types.md` for shared types
  - `rules/utils.md` and `rules/libs.md` for helpers and integrations
  - `rules/naming.md` before creating or renaming files, folders, or exports

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

On Windows PowerShell, if `bun` is blocked by script execution policy, use `bun.cmd`, for example `bun.cmd run check`.

## External Docs

- Rsbuild: https://rsbuild.rs/llms.txt
- Rspack: https://rspack.rs/llms.txt
- shadcn/ui: research official docs or registry before adding primitives.
- hooks-ts: research https://hooks-ts.com/ before writing reusable common hooks.

## Non-Negotiables

- Route pages stay thin and import feature templates.
- Raw shadcn primitives go in `src/components/ui`.
- App-custom reusable UI goes in `src/components/shared`.
- Feature-only UI and logic stay in `src/features/<feature>`.
- API and socket service functions live in `src/services`.
- Reusable TanStack Query hooks live in `src/hooks/api`.
- Global client state uses `src/stores`; server state should not be duplicated into Zustand.
- Use `@/` imports for code under `src`.
