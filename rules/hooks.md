# Hook Rules

These rules apply to `src/hooks`, `src/hooks/api`, and reusable hook patterns.

## `src/hooks`

Use this folder only for hooks that are reusable across features.

Before writing a common browser/state hook, check existing local hooks and https://hooks-ts.com/. Reuse or adapt a proven pattern when it fits, but do not add a dependency or copy external code without a clear reason.

Good global hook concerns:

- debounce/throttle
- local storage/session storage with SSR guards
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

Use this folder for reusable API hooks built on TanStack Query. Also read `rules/data-fetching.md`.

Rules:

- API hooks call service functions from `src/services`.
- Query keys should be stable, serializable, and predictable.
- Mutations should invalidate or update query cache intentionally.
- Do not call Axios directly from API hooks when a service function should own that request.
- Do not put feature-only orchestration here. Keep it in `src/features/<feature>/hooks`.
- Domain modules such as `user.ts`, `conversation.ts`, or `message.ts` are allowed when they group closely related query keys and hooks.

Examples:

- `src/hooks/api/user.ts` exports `useCurrentUserQuery`.
- `src/hooks/api/conversation.ts` exports conversation queries and mutations.
- `src/hooks/api/message.ts` exports message queries and send/read mutations.

## Socket Hooks

- Generic socket hooks may live in `src/hooks` only if reused by multiple features.
- Chat-specific socket orchestration should stay in `src/features/chat/hooks` or a chat provider.
- Always clean up listeners.
- Avoid duplicate subscriptions when dependencies change.
- Keep subscription effects resilient to React Strict Mode double setup/cleanup.

## React Quality

- Avoid unnecessary `useEffect`.
- Avoid mirroring query data into state.
- Use `useMemo` and `useCallback` only when reference stability matters.
- Return a small, clear API from hooks.
- Keep hook options and result types explicit when the hook is reused.
