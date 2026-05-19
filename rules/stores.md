# Store Rules

These rules apply to `src/stores`.

## Purpose

`src/stores` contains global Zustand stores. Use global stores only for small client state shared across multiple features or route boundaries.

Good examples:

- auth session snapshot
- UI preferences
- socket connection status
- selected conversation id if shared across layouts
- lightweight presence ids

## Rules

- Keep stores focused and typed.
- Prefer small stores over one large app store.
- Select only the state/actions needed by a component.
- Do not store server cache data that belongs in TanStack Query.
- Do not store feature-private state globally.
- Do not persist sensitive tokens unless the project has an explicit secure storage strategy.
- Keep async/protocol-heavy logic in services/libs when it grows beyond simple client coordination.
- Avoid store-to-store dependencies unless the dependency is small and documented.

## Naming

- New store modules should prefer `<domain>-store.ts`.
- Existing legacy modules such as `useAuthStore.ts` may remain until a scoped naming refactor is requested.
- Store hook exports use `useXxxStore`.

## Chat Guidance

Good global store candidates:

- access token/session snapshot when the app intentionally keeps it in memory
- connection status
- selected conversation id if shared across layouts
- online user ids
- global unread counters if multiple features need them

Poor global store candidates:

- full paginated message history from the server
- full conversation lists from the server
- temporary form input for one composer
- one screen's filter state
- data already managed by TanStack Query
