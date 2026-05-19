# Security And Privacy Rules

These rules apply to env handling, auth, tokens, logging, browser storage, user data, private messages, and dependency changes.

## Environment Variables

- Frontend code may read only frontend-safe public env variables.
- This project uses `PUBLIC_*` client env names. Do not introduce secret-like client env names.
- Validate and normalize env values in `src/config/env.ts`.
- Do not read `import.meta.env` throughout the app when `env` already exists.
- Do not put API secrets, service keys, private tokens, or signing secrets in frontend code or `.env.template`.

## Auth And Tokens

- Do not log access tokens, refresh results, auth headers, cookies, or raw auth errors that include credentials.
- Do not put tokens in URLs or route params.
- Do not persist access tokens in localStorage/sessionStorage unless the project explicitly adopts a storage strategy and documents the tradeoff.
- On refresh failure, clear auth state, clear server cache, and disconnect realtime clients through the established flow.
- Keep refresh request de-duplication centralized.

## Sensitive Data

- Treat private messages, user profiles, friend requests, presence, and attachment URLs as sensitive.
- Avoid logging raw HTTP responses, socket payloads, or form values.
- Sanitize console errors so they are useful without exposing payload contents.
- Do not add analytics for message content or private identifiers unless the user explicitly asks and the data contract is documented.

## Browser Storage

- Prefix storage keys with a project/domain namespace.
- Store only client preferences, non-sensitive drafts, or UI state unless a security decision says otherwise.
- Provide a cleanup path for auth-related or user-scoped storage on logout.

## Dependencies

- Add dependencies only from maintained, reputable packages with a clear need.
- Prefer official packages and already-installed stack capabilities.
- Review generated code from shadcn/ui, registries, or CLIs before keeping it.
- Do not add packages that execute remote code at runtime for normal app behavior.

## User Input And Output

- Validate form inputs with Zod when constraints matter.
- Escape or safely render user-generated content. Do not use `dangerouslySetInnerHTML` for messages unless sanitized and documented.
- Validate file/attachment metadata before rendering or uploading when attachments are introduced.
