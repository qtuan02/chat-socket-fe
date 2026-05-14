# Hook Rules

These rules apply to `src/hooks` and `src/hooks/api`.

## `src/hooks`

Use this folder only for hooks that are reusable across features.

Before writing a common browser/state hook, research https://hooks-ts.com/. If a suitable hook exists, copy the manual implementation into this project and adapt it to local naming, imports, SSR guards, and TypeScript style.

Good global hook concerns:

- debounce/throttle
- local storage/session storage
- media query or viewport state
- keyboard shortcuts
- disclosure/dialog state
- clipboard
- event listener wrappers

Bad global hook concerns:

- chat-room-specific socket orchestration
- auth-screen-specific form behavior
- message composer behavior used by only one feature
- feature-specific routing workflows

## `src/hooks/api`

Use this folder for reusable API hooks built on TanStack Query.

Rules:

- API hooks call service functions from `src/services`.
- Query keys should be stable and predictable.
- Mutations should invalidate or update query cache intentionally.
- Do not call Axios directly from API hooks if a service function should own that request.
- Do not put feature-only hooks here. Keep them in `src/features/<feature>/hooks`.

Examples:

- `src/hooks/api/use-current-user-query.ts`
- `src/hooks/api/use-conversations-query.ts`
- `src/hooks/api/use-send-message-mutation.ts`

## Socket Hooks

- Generic socket hooks may live in `src/hooks` only if reused by multiple features.
- Chat-specific socket orchestration should stay in `src/features/chat/hooks` or a chat provider.
- Always clean up listeners.
- Avoid duplicate subscriptions when dependencies change.

## React Quality

- Avoid unnecessary `useEffect`.
- Avoid mirroring query data into state.
- Use `useMemo` and `useCallback` only when reference stability matters.
- Return a small, clear API from hooks.
