# Realtime Rules

These rules apply to STOMP/WebSocket clients, socket services, socket providers, realtime cache updates, presence, typing state, and reconnect behavior.

## Ownership

- Low-level STOMP client creation and protocol configuration belong in `src/libs` or a focused global socket store when that is the established local pattern.
- Socket event names, destinations, and topic builders belong in `src/config/socket-events.ts` or a dedicated socket service module.
- Socket services may publish messages, subscribe to topics, parse event payloads, and return cleanup functions.
- Feature hooks/providers orchestrate subscriptions and write to TanStack Query cache.
- Components render state and call callbacks; they should not own raw socket lifecycle.

## Connection Lifecycle

- Connect only when the user has a valid authenticated session.
- Disconnect and clear connection state on logout, refresh-token failure, or session reset.
- Avoid creating a second active client when one already exists.
- Account for React Strict Mode double setup/cleanup in development.
- Keep reconnect delay, heartbeat, and subscription restore behavior explicit.
- After reconnect, resubscribe only once per active topic and reconcile missed data with query invalidation/refetch when needed.

## Subscriptions

- Every subscription must have a cleanup path.
- Subscription handlers must be idempotent because reconnects, server replay, mutation responses, and refetches can duplicate events.
- Use stable ids for subscription destinations. Do not subscribe to empty or unvalidated conversation ids.
- Prefer returning `unsubscribe` functions from service helpers.
- Keep handler bodies small; delegate cache updates or state transitions to named helpers.

## Event Payloads

- Parse and validate payload shape before mutating state.
- Ignore unknown or malformed events safely.
- Never log raw payloads that may include tokens, private messages, or personal data.
- Keep DTO-to-app-type mapping near the service boundary.
- Version or centralize event names when backend contracts grow.

## Messages

- Use `clientMessageId` for optimistic sends and server acknowledgement reconciliation.
- Track pending, sent, failed, delivered, and read states intentionally.
- Deduplicate by server id and `clientMessageId`.
- Preserve ordering by server timestamp/sequence when available. Use client time only as a fallback for pending messages.
- On send failure, keep retry UX possible instead of silently dropping the message.

## Presence And Typing

- Presence and typing are ephemeral client state unless the API exposes them as durable server data.
- Throttle/debounce typing publishes.
- Expire typing indicators locally to avoid stale UI.
- Keep online user state small; do not store full user records in the socket store.

## Security

- Send auth credentials only through the approved STOMP connection headers or backend-approved mechanism.
- Do not put access tokens in URLs.
- Clear socket state when auth state is cleared.
- Do not persist private message payloads outside the intended cache/storage strategy.
