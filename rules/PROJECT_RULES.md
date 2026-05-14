# Project Rules

These rules are the source of truth for this frontend project.

## Purpose

This repository is the frontend for a chat application that will use realtime socket communication. Optimize code structure for chat flows such as authentication, conversation lists, direct/group rooms, message rendering, message composer, typing presence, online status, notifications, and user profile/settings.

## Current Stack

- React 19 with TypeScript.
- Rsbuild for dev/build.
- React Router for SPA routing.
- Tailwind CSS v4.
- shadcn/ui-style primitives in `src/components/ui`.
- React Hook Form and Zod for forms and validation.
- Axios for HTTP services.
- Zustand for small global client stores.
- Sonner for toasts.
- lucide-react for icons.
- Biome for linting and formatting.
- Bun for scripts and dependency management.

TanStack Query is the preferred server-state layer for API hooks. If it is not installed yet when API hooks are needed, add it intentionally with Bun and update the lockfile.

## Commands

Use the scripts in `package.json`.

```bash
bun run dev
bun run build
bun run preview
bun run check
bun run check:fix
bun run lint
bun run lint:fix
bun run format
bun run format:fix
bun run typecheck
```

On Windows PowerShell, use `bun.cmd` if the `bun` PowerShell shim is blocked.

Before finishing meaningful code changes, run:

```bash
bun.cmd run check
bun.cmd run typecheck
```

Use `:fix` scripts only when you intentionally want the command to write changes:

```bash
bun.cmd run check:fix
bun.cmd run format:fix
bun.cmd run lint:fix
```

For UI or build-related changes, also run:

```bash
bun.cmd run build
```

## Source Structure

All app code belongs under `src`.

```text
src/
  app.tsx
  index.tsx
  globals.css

  components/
    ui/                  # raw shadcn/ui primitives
    shared/              # app-custom reusable UI

  config/                # env, constants, route paths, storage keys
  pages/                 # thin route page files
  features/              # business/page features
  hooks/
    api/                 # reusable TanStack Query API hooks
  libs/                  # configured clients and library integrations
  services/              # HTTP and socket service functions
  stores/                # global Zustand stores
  types/                 # app-wide shared types
  utils/                 # reusable utilities, including cn
```

## Layer Responsibilities

### `src/components/ui`

- Raw shadcn/ui primitives only.
- Keep generic and app-agnostic.
- Do not put feature logic, API calls, socket logic, stores, or page layout here.
- Keep close to upstream shadcn unless a local import, token, or accessibility fix is required.

### `src/components/shared`

- App-custom reusable UI composed from `components/ui`.
- Use for shared chat/app patterns such as app shell, avatar display, empty state, loading state, message bubble, user menu, form field wrappers, and reusable dialogs.
- Must not import feature-private modules.

### `src/config`

- App configuration such as env parsing, constants, route paths/builders, storage keys, app metadata, and feature flags.
- No React components, hooks, service calls, or stores.

### `src/pages`

- Route-level files only.
- Keep thin: import and render a template from `src/features/<feature>/templates`.
- Do not put socket lifecycle, API calls, large forms, or business logic in pages.

### `src/features`

- Feature modules such as `auth`, `chat`, `profile`, `settings`, or `notifications`.
- A feature should start with `templates` and `components`.
- Add `hooks`, `providers`, `stores`, `types`, `constants`, or `utils` only when feature-only code genuinely needs them.

### `src/hooks`

- Reusable hooks across the app.
- Research hooks-ts before writing generic browser/state hooks.
- API hooks that call services through TanStack Query belong in `src/hooks/api`.
- Feature-only hooks belong in `src/features/<feature>/hooks`.

### `src/services`

- HTTP and socket communication functions.
- Services may import from `libs`, `types`, `utils`, and `config`.
- No React components or hooks.

### `src/libs`

- Third-party client setup: Axios instance, QueryClient, socket client factory, analytics, or similar integrations.
- Do not put business logic here.

### `src/stores`

- Global Zustand stores only.
- Good fit: auth session snapshot, UI preferences, selected conversation id, connection status.
- Do not duplicate server data that belongs in TanStack Query.

### `src/types`

- App-wide shared TypeScript contracts.
- Chat examples: `User`, `Conversation`, `Message`, `Attachment`, `PresenceStatus`, `ApiError`.
- Feature-private types stay inside the feature.

### `src/utils`

- Small reusable helpers and formatting utilities.
- `cn` lives in `src/utils/cn.ts`.
- No React components, hooks, network calls, or feature-private imports.

## Chat And Socket Rules

- Keep low-level socket setup in `src/libs/socket-client.ts` when introduced.
- Keep socket service functions and event subscriptions in `src/services`.
- Keep UI orchestration in feature hooks or providers, not in pages or raw components.
- Always clean up socket listeners when a component/provider unmounts or dependencies change.
- Avoid duplicate event subscriptions after reconnects or route changes.
- Model message identity carefully: use stable ids, temporary client ids for optimistic messages, and server ids after acknowledgement.
- Handle ordering, duplicate messages, pending/sent/failed states, and reconnect behavior explicitly when implementing chat flows.
- Do not log auth tokens, private messages, or raw socket payloads that may contain sensitive data.

## shadcn/ui Rules

- Check `src/components/ui` before adding a primitive.
- Research official shadcn docs or registry before adding a new primitive.
- `components.json` is configured for this project. Do not run `shadcn init` unless the user explicitly asks.
- Preferred command:

```bash
bunx shadcn@latest add <component> --cwd .
```

- Do not pass `--overwrite` unless the user explicitly asks.
- Generated primitives should import `cn` from `@/utils/cn`.
- Product-specific UI customizations belong in `src/components/shared` or the relevant feature, not in raw primitives.

## Import Boundaries

- `pages` may import from `features`, app providers, `config`, and shared components.
- `features` may import from `components/ui`, `components/shared`, `hooks`, `services`, `stores`, `types`, `utils`, `config`, and `libs`.
- `components/shared` may import from `components/ui`, `hooks`, `types`, `utils`, and `config`.
- `components/ui` should import only low-level utilities and required UI dependencies.
- `hooks/api` may import from `services`, `types`, `utils`, and `config`.
- `services` may import from `libs`, `types`, `utils`, and `config`.
- Avoid imports from `pages` anywhere else.
- Avoid cross-feature imports. Promote shared code to a top-level folder instead.

## TypeScript Rules

- Keep strict TypeScript settings.
- Prefer named exports for app code.
- Prefer type-only imports for types.
- Avoid `any`. If unavoidable, keep it local and do not expose it in public APIs.
- Do not loosen `tsconfig.json` to make errors disappear.

## Dependency Rules

- Use installed packages before adding new ones.
- If adding a dependency is necessary, use `bun add` or `bun add -d` so `bun.lock` stays correct.
- Do not add another library for a capability already covered by the stack.
- Use lucide-react icons for actions.
- Use `clsx`, `tailwind-merge`, and `cn` for conditional class names.

## Before Finishing

1. Confirm code is in the right layer.
2. Check existing `ui`, `shared`, `hooks`, `services`, `types`, `utils`, and `libs` before adding duplicates.
3. Check for unnecessary `useEffect`, `useState`, `useMemo`, and `useCallback`.
4. Check socket listeners and cleanup when touching realtime code.
5. Run verification commands or explain why a command was not run.
