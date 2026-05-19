# Data Fetching Rules

These rules apply to TanStack Query hooks, query keys, cache updates, API mutations, and any code that coordinates server state.

## Ownership

- HTTP request details belong in `src/services`.
- Query and mutation hooks belong in `src/hooks/api` when reusable across features.
- Feature-only orchestration around API hooks belongs in `src/features/<feature>/hooks`.
- Components may call API hooks, but repeated mutation/toast/navigation workflows should be extracted to a feature hook.
- Server data must not be copied into Zustand. Store only client decisions such as selected ids, drafts, dialog state, filters, or connection status.

## Query Keys

- Query keys must be arrays and must uniquely describe the fetched data.
- Include every variable used by the query function in the query key.
- Keep key factories stable and centralized per domain. Use existing helpers before adding another pattern.
- Avoid raw string keys scattered through features.
- Use serializable key parts only. Do not put functions, class instances, STOMP clients, AbortControllers, or non-JSON values in keys.

## Query Hooks

- Return a small, domain-friendly API from hooks. It is acceptable to expose original query flags when they are useful.
- Use `enabled` for queries that depend on auth, route params, or required ids.
- Validate route params before using them in query functions.
- Prefer `select` or service mapping for shaping data instead of transforming it repeatedly in components.
- Keep stale time, retry, and refetch behavior intentional. Global defaults live in `src/libs/query-client.ts`; local overrides need a product reason.
- Avoid disabling refetch-on-reconnect for chat data unless realtime events fully cover the consistency requirement.

## Mutations

- Mutations must intentionally update or invalidate affected queries.
- Prefer invalidation for broad list/detail consistency.
- Prefer `setQueryData` for realtime updates, optimistic chat sends, read receipts, and small local cache patches where refetching would degrade UX.
- Optimistic updates must include rollback behavior, failure state, and reconciliation with the server response.
- Return invalidation promises from mutation callbacks when pending UI should wait for cache sync.
- Do not show toasts in services. User feedback belongs in feature orchestration or UI handlers.

## Chat Cache Rules

- Messages need stable server ids and temporary `clientMessageId` values for optimistic sends.
- Reconcile optimistic messages by `clientMessageId` first, then server id.
- Deduplicate message events. Socket echo, mutation response, and refetch can all deliver the same message.
- Preserve message ordering explicitly. Do not rely on array append if older pages, retries, or reconnect replay can arrive out of order.
- Represent pending, sent, delivered, read, and failed states explicitly when the API supports them.
- Infinite-query cache updates must preserve the original page shape and pagination metadata.

## Error Handling

- Services should return typed data or throw normalized errors.
- Use shared error utilities before parsing error shapes in components.
- Avoid exposing backend-specific field names across the app when a service can map them to app types.
- Treat auth refresh failures as a session boundary: clear query cache and auth state through the established app flow.

## Avoid

- Do not call Axios directly from API hooks when a service function should own the request.
- Do not store raw Axios responses in query cache unless there is a clear reason.
- Do not mutate cached objects in place.
- Do not invalidate every query after every mutation by default.
- Do not hide server writes inside presentational components.
