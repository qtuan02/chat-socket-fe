# Conversation Feature Rules

Rules for `src/features/conversation`.

This feature owns conversation list/detail UI and conversation-specific view orchestration.

## Scope

- Keep conversation-only UI in `components/`.
- Keep conversation-only hooks in `hooks/`.
- Use query hooks from `src/hooks/api/conversation.ts`.
- Use REST calls through `src/services/conversation-service.ts`.
- Coordinate with chat feature rules when a conversation view affects the active chat workspace.

## Data Rules

- Conversation records are server state and belong in TanStack Query.
- Preserve cursor/infinite query shape for conversation lists.
- Keep query keys parameterized by every list/search/filter value.
- Patch cache only for deterministic conversation updates.
- Preserve draft conversation handling through existing draft-id helpers.
- Invalidate when group membership, unread counts, or active list membership is uncertain.

## Realtime Rules

- Conversation update socket events can duplicate mutation/refetch data.
- Handlers must be idempotent and dedupe by conversation id.
- Do not subscribe from list item renderers.
- Do not log raw conversation socket payloads.

## UI Rules

- Keep conversation lists virtualized when they can grow.
- Use stable conversation ids for keys.
- Preserve unread count, last message, seen status, and active selection behavior.
- Keep active selection derived from route or feature state instead of duplicating it in server cache.
- Verify desktop sidebar and mobile conversation selection after UI changes.

## Forbidden Patterns

- Do not store conversations in Zustand.
- Do not mutate infinite query pages in place.
- Do not use array index keys.
- Do not hardcode draft conversation ids outside existing draft-id helpers.
- Do not change read/seen semantics without reviewing chat and socket flows.

## Verification Checklist

- Follow the root verification matrix first.
- Verify query key parameters and infinite query shape.
- Verify active conversation selection still works.
- Verify realtime update dedupe and unread/seen updates.
