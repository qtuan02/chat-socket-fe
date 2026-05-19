# Store Rules

Rules for `src/stores`.

This folder owns small global Zustand client state.

## Scope

- `useAuthStore.ts` holds in-memory auth token state.
- `useSocketStore.ts` holds the STOMP client, connection status, and lightweight online-user ids.
- Server data belongs in TanStack Query, not Zustand.

## Store Ownership

- Zustand is for small client state only.
- Store actions must be predictable and typed.
- Keep stores focused.
- Avoid one large global app store.
- Components should select only the state/actions they need.
- Do not duplicate query cache data in stores.

## Auth Store Rules

- Auth store may hold access token/session flags as currently implemented.
- Do not persist tokens without explicit approval.
- Do not store refresh tokens in Zustand.
- Clear auth state on logout/session reset.
- Do not log token values.
- Keep auth state changes explicit.

## Socket Store Rules

- Socket store may hold the STOMP client and lightweight connection/presence state.
- Do not store full user records for presence.
- Do not store conversations or messages in socket store.
- Clean up socket state on logout/session reset.
- Avoid creating multiple active STOMP clients.
- Connection actions must handle repeated calls safely.
- `disconnect` should deactivate the STOMP client and reset store state; callers must not assume `deactivate()` is synchronous.
- Store-owned subscriptions, such as lightweight presence subscriptions, must be created only after `onConnect` and cleaned up by client deactivation or explicit unsubscribe.
- Do not log raw socket payloads.

## Client State Rules

- Good store state: access token, socket client, connection status, lightweight presence ids, small UI state shared across routes.
- Bad store state: full conversations, messages, friend lists, search results, paginated server data.
- Feature-private UI state should usually stay in the feature.
- Draft/editing state should usually stay local unless explicitly cross-route.

## Forbidden Store Patterns

- Storing server entities in Zustand.
- Duplicating TanStack Query data.
- Persisting access tokens without approval.
- Mutating complex state in place.
- Importing React components.
- Showing toasts from stores.
- Owning feature-specific workflows in global stores.
- Creating unbounded stores for private message content.

## Store Verification Checklist

- Follow the root verification matrix first.
- Verify no server data was moved into Zustand.
- Verify logout/session reset clears auth/socket state.
- Verify socket connect/disconnect actions are repeat-safe.
- Verify no sensitive values are logged or persisted.
- Verify components use narrow selectors where practical.
