# API Hook Rules

Rules for `src/hooks/api`.

This folder owns reusable TanStack Query hooks and query key definitions.

## Ownership

- Hooks may import services and query utilities.
- Hooks may import shared types, config, stores, and small utilities when needed.
- Hooks must not import JSX UI components.
- Hooks must not show UI directly.
- Feature-only orchestration belongs in `src/features/<feature>/hooks`.
- Services own HTTP/socket protocol details.

## TanStack Query Source Rules

- Use TanStack Query docs as the source of truth for query key semantics, invalidation, optimistic updates, infinite queries, and mutation behavior.
- Query keys are cache dependencies. If a query function reads a variable, the query key must include that variable unless it is a stable global dependency already represented elsewhere.
- Prefer documented QueryClient APIs over custom cache registries or ad hoc cache bookkeeping.
- Review TanStack behavior before changing stale time, enabled guards, retry behavior, invalidation filters, or infinite-query page params.

## Query Key Rules

- Query keys must be arrays.
- Use existing query key factories/helpers.
- Query keys must include all parameters used by the query function.
- Prefer one canonical key factory path for each resource; add to `src/libs/query-key-factory.ts` instead of inventing local key shapes.
- Do not duplicate raw query key arrays.
- Do not scatter raw string keys in features.
- Keep key parts serializable.
- Do not put functions, class instances, STOMP clients, AbortControllers, or non-JSON values in keys.

## Query Function Rules

- Query functions should call service functions.
- Do not call Axios directly here when a service boundary exists.
- Use `enabled` for auth-dependent or id-dependent queries.
- Do not call query functions with empty ids.
- Prefer service mapping or `select` for repeated data shaping.
- Return domain-friendly hook results when useful, but keep the original query state accessible when needed.

## Mutation Rules

- Mutations must intentionally update or invalidate affected queries.
- Do not invalidate every query by default.
- Use query-key factories and targeted filters for invalidation.
- User feedback belongs in feature orchestration or hook options when that is the existing pattern.
- Services must not show toasts.
- Preserve mutation variables and context types.
- Return or await invalidation promises when UI should wait for cache consistency.

## Cache Patch Rules

- Patch only small deterministic updates.
- Patch realtime appends, seen/read receipt changes, and local unread-count updates when safe.
- Never mutate cached data in place.
- Always return new arrays/objects for changed cache.
- Return the previous cache object unchanged when the event produces no actual update.
- Dedupe cached messages by stable id.
- Preserve unrelated cached state.

## Invalidation Rules

- Invalidate when broad consistency is uncertain.
- Invalidate when group membership, friend lists, or missing conversations may affect multiple lists.
- Invalidate after mutations that change list membership unless cache patching covers every affected list.
- Avoid invalidation loops.

## Infinite Query Rules

- Preserve infinite query shape: `{ pages, pageParams }`.
- Preserve each page shape used by the service.
- Do not reverse or sort cached pages in place.
- Do not drop `pageParams`.
- `getNextPageParam` must match the backend pagination contract.
- Keep cursor and offset pagination distinct.

## Optimistic Update Rules

- Use optimistic updates only when rollback and reconciliation are designed.
- Cancel affected queries before writing optimistic cache when an in-flight refetch can overwrite the optimistic state.
- Capture previous cache data before optimistic writes.
- Roll back on error.
- Reconcile optimistic records with server response by stable id or `clientMessageId`.
- Represent failure state explicitly when user retry is possible.

## Error Handling Rules

- Services should throw normalized errors.
- Hooks should not hide errors without UI handling.
- Expose error state so UI can show inline Retry or toast.
- Do not swallow async errors.
- Do not log raw server responses.

## Forbidden Query Patterns

- Moving server data to Zustand.
- Mutating query cache in place.
- Duplicating raw query key arrays.
- Omitting variables from query keys.
- Calling Axios directly when service exists.
- Hiding errors with empty catches.
- Invalidating all queries after every mutation.
- Breaking infinite query page shape.

## Query Verification Checklist

- Follow the root verification matrix first.
- Verify query keys include every query variable.
- Verify enabled guards for optional ids/auth.
- Verify mutations patch or invalidate the right keys.
- Verify infinite query `{ pages, pageParams }` is preserved.
- Verify rollback behavior for optimistic updates.
- Verify UI has a path to display errors.
