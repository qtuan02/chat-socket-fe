# Source Rules

These rules apply to all files under `src/`.

## Architecture

Use the project structure from `rules/PROJECT_RULES.md`.

- Route files belong in `src/pages`.
- Page-level feature views belong in `src/features/<feature>/templates`.
- Feature-only UI belongs in `src/features/<feature>/components`.
- Raw shadcn primitives belong in `src/components/ui`.
- App-custom reusable UI belongs in `src/components/shared`.
- HTTP and socket functions belong in `src/services`.
- Library clients and adapters belong in `src/libs`.
- Global stores belong in `src/stores`.
- App-wide types belong in `src/types`.
- Pure reusable utilities belong in `src/utils`.

## Imports

- Use `@/` for imports from `src`.
- Prefer named exports.
- Prefer type-only imports for types.
- Do not import from `pages` into other folders.
- Do not import feature-private internals across features.
- Avoid circular imports. If one appears, extract a shared type/helper to the correct top-level folder.

Recommended import order:

1. Node built-ins.
2. External packages.
3. Internal `@/` imports.
4. Relative imports.
5. Type-only imports where Biome keeps them.

## React Rules

- Keep render logic pure.
- Use `useEffect` only for synchronization with external systems such as sockets, browser APIs, timers, subscriptions, or third-party imperative APIs.
- Do not use `useEffect` just to derive data from props/state.
- Do not mirror server data into `useState` unless there is an editable draft or local workflow.
- Use `useMemo` and `useCallback` only when there is a clear stability or performance reason.

## Styling

- Use Tailwind utilities.
- Use semantic tokens from `src/globals.css` once design tokens are added.
- Use `cn` from `@/utils/cn` for conditional classes.
- Keep custom CSS in `globals.css` only for Tailwind imports, design tokens, base styles, and truly global concerns.

## Verification

After changing source files, run:

```bash
bun.cmd run check
bun.cmd run typecheck
```
