# Type Rules

These rules apply to `src/types`.

## Purpose

`src/types` contains app-wide shared TypeScript contracts.

Good examples:

- `base.ts`
- `auth.ts`
- `user.ts`
- `conversation.ts`
- `message.ts`
- `friend.ts`

## Rules

- Put shared entities here when multiple features use them.
- Keep feature-private types inside `src/features/<feature>/types`.
- Prefer precise names over generic names.
- Prefer type-only imports when consuming types.
- Avoid `any`.
- Keep DTO/API contract types separate from app/domain types when mapping is needed.
- Model nullable and optional fields intentionally; do not use optional fields to avoid handling missing backend data.
- Use discriminated unions for variant-heavy chat states when they improve correctness.

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
- Do not use `I` prefixes for interfaces.
