# Store Rules

These rules apply to `src/stores`.

## Purpose

`src/stores` contains global Zustand stores.

Use global stores only for small client state shared across multiple features or route boundaries.

Good examples:

- `auth-store.ts`
- `ui-store.ts`
- `socket-store.ts`
- `chat-store.ts` when state is truly global

## Rules

- Keep stores focused and typed.
- Prefer small stores over one large app store.
- Select only the state/actions needed by a component.
- Do not store server cache data that belongs in TanStack Query.
- Do not store feature-private state globally.
- Do not persist sensitive tokens unless the project has an explicit secure storage strategy.

## Chat Guidance

Good global store candidates:

- current authenticated user snapshot
- connection status
- selected conversation id if shared across layouts
- global unread counters if multiple features need them

Poor global store candidates:

- full paginated message history from the server
- temporary form input for one composer
- one screen's filter state
- data already managed by TanStack Query
