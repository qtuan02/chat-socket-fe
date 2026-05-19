# Source Rules

These rules apply to all files under `src/`.

## Architecture

Use the structure and import boundaries from `rules/PROJECT_RULES.md`.

- Route files belong in `src/pages`.
- Page-level feature views belong in `src/features/<feature>/templates`.
- Feature-only UI and orchestration belong in `src/features/<feature>`.
- Raw shadcn/ui primitives belong in `src/components/ui`.
- App-custom reusable UI belongs in `src/components/shared`.
- Reusable API hooks belong in `src/hooks/api`.
- HTTP and socket functions belong in `src/services`.
- Third-party client setup belongs in `src/libs`.
- Global client state belongs in `src/stores`.
- App-wide shared contracts belong in `src/types`.
- Pure reusable utilities belong in `src/utils`.

## Imports

- Use `@/` for imports from `src`.
- Prefer named exports for app code. Existing default exports may remain until a scoped refactor touches them.
- Prefer type-only imports and exports for types.
- Do not import from `pages` into other folders.
- Do not import feature-private internals across features except for route-shell composition explicitly allowed in `rules/features.md`.
- Avoid circular imports. Extract shared types/helpers to the correct top-level folder when a cycle appears.

Recommended import order:

1. Node built-ins.
2. External packages.
3. Internal `@/` imports.
4. Relative imports.
5. Type-only imports where Biome keeps them.

## React Rules

- Keep render logic pure.
- Use `useEffect` only for synchronization with external systems such as sockets, browser APIs, timers, subscriptions, or third-party imperative APIs.
- Do not use `useEffect` to derive data from props/state.
- Do not mirror server data into `useState` unless there is an editable draft or local workflow.
- Use `useMemo` and `useCallback` only when reference stability or measurable performance needs justify them.
- Keep event handlers focused; extract workflows that combine API calls, navigation, toasts, or cache changes.

## Styling

- Use Tailwind utilities and project tokens.
- Use `cn` from `@/utils/cn` for conditional classes.
- Prefer semantic tokens from `src/globals.css`.
- Keep custom CSS in `globals.css` only for Tailwind imports, design tokens, base styles, and truly global concerns.
- Avoid inline styles except for dynamic values that cannot be represented as classes.

## Verification

After changing source files, run:

```bash
bun.cmd run check
bun.cmd run typecheck
```

Also run `bun.cmd run build` for UI, config, route, dependency, or build-related changes.
