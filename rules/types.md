# Type Rules

These rules apply to `src/types`.

## Purpose

`src/types` contains app-wide shared TypeScript contracts.

Good examples:

- `api.ts`
- `auth.ts`
- `chat.ts`
- `user.ts`
- `common.ts` only when the types are genuinely cross-domain

## Rules

- Put shared entities here when multiple features use them.
- Keep feature-private types inside `src/features/<feature>/types`.
- Prefer precise names over generic names.
- Prefer type-only imports when consuming types.
- Avoid `any`.
- Keep DTO/API contract types separate from app/domain types when mapping is needed.

## Chat Types

Common shared chat types may include:

- `User`
- `Conversation`
- `ConversationType`
- `Participant`
- `Message`
- `MessageStatus`
- `Attachment`
- `PresenceStatus`
- `TypingState`
- `ApiError`
- `PaginatedResponse<T>`

## Avoid

- Do not dump every type into one file.
- Do not move a type here only because it might be reused later.
- Do not expose unclear backend field names to the whole app if they can be mapped in a service.
