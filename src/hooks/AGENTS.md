# Hook Rules

Rules for `src/hooks`.

This folder owns reusable hooks. API/server-state hooks belong in `src/hooks/api`; feature-only hooks belong in the feature folder.

## Scope

- Put reusable non-API hooks directly under `src/hooks` only when they are used across features.
- Put reusable TanStack Query hooks in `src/hooks/api`.
- Put feature-only orchestration hooks in `src/features/<feature>/hooks`.

## Hook Reuse And Source Rules

- Before creating a reusable hook, search `src/hooks`, `src/hooks/api`, and relevant feature hooks for an existing implementation or naming pattern.
- Use React docs as the source of truth for custom hook structure, effect semantics, and dependency behavior.
- Custom hooks should describe concrete use cases or external systems, such as `useMediaQuery`, `useSocket`, or `useIntersectionObserver`, not lifecycle wrappers.
- Do not create generic lifecycle-wrapper hooks such as `useMount`, `useEffectOnce`, or `useUpdateEffect`.
- For common browser hooks such as media query, debounce, event listener, click outside, local/session storage, interval, timeout, resize observer, or intersection observer, check usehooks-ts or another primary source before writing a custom version.
- Prefer adapting a small, license-compatible hook into project-owned code when the dependency is unjustified. Do not paste external hooks without checking typings, cleanup, SSR/browser assumptions, stable callbacks, and project security rules.
- Add a hook dependency only after following the root dependency rules and confirming the bundle/API tradeoff is worth it.

## Allowed Patterns

- Hooks may compose React hooks, stores, query hooks, and utilities according to their layer.
- Generic non-API hooks may call services only when they own reusable imperative orchestration that is not server-state fetching or mutation behavior. Put reusable server-state hooks in `src/hooks/api`; put feature-only service orchestration in `src/features/<feature>/hooks`.
- Hooks may hide repeated orchestration when that improves call sites.
- Hooks must expose stable, typed return values.
- Hooks that subscribe to external systems must clean up.

## React Rules

- Follow the Rules of Hooks.
- Do not call hooks conditionally.
- Keep dependency arrays correct.
- `useExhaustiveDependencies` is disabled in Biome config, so manually review effect dependencies instead of relying on lint.
- Use effects for external synchronization, not for simple derived values.
- Keep effects repeat-safe under React StrictMode.
- Prefer event handlers or derived values over effects when no external system is being synchronized.

## Forbidden Patterns

- Do not put API hooks outside `src/hooks/api`.
- Do not create socket subscriptions without cleanup.
- Do not hide UI toasts in generic hooks unless that is the established contract.
- Do not mirror server data into local state without a specific draft/editing reason.
- Do not return unstable objects/functions from hot hooks without considering re-render impact.

## Verification Checklist

- Follow the root verification matrix first.
- Verify hook dependencies and cleanup.
- Verify optional ids/auth state are guarded.
- Verify hook ownership: generic, API, or feature-local.
