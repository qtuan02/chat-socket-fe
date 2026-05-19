# Service Rules

Rules for `src/services`.

This folder owns REST service functions and socket service helpers.

## REST Service Boundaries

- Services must not import React.
- Services must not call React hooks.
- Services must not show toasts.
- Services should use the configured Axios client from `src/libs/axios.ts`.
- Services must return typed data, not raw Axios responses, unless there is a documented reason.
- REST endpoints should come from route/config constants.
- Keep request/response mapping close to the service boundary.

## Socket Service Boundaries

- Socket helpers should expose subscribe/send helpers and cleanup behavior.
- Subscription helpers must return unsubscribe functions.
- Use the `StompSubscription` returned by `client.subscribe()` and clean it up with `subscription.unsubscribe()`.
- Socket helpers may parse payloads and ignore malformed events.
- Socket helpers should not mutate UI state directly.
- Feature providers/hooks coordinate cache updates and UI state.
- Do not create STOMP clients in services unless the architecture is intentionally changed.
- Do not bypass STOMP APIs by writing directly to the underlying WebSocket.

## API Typing Rules

- API response types must come from `src/types`.
- Add or update shared types when backend contracts change.
- Do not invent backend fields.
- Keep DTO/backend shape separate from UI/domain shape when mapping is needed.
- Avoid `any`.
- Prefer narrow parsing for unknown socket payloads.

## Axios Rules

- Do not add ad hoc Axios clients.
- Preserve the existing refresh/interceptor flow.
- Preserve `withCredentials` behavior unless explicitly approved.
- Do not attach auth headers manually in individual services unless the shared client cannot support the requirement.
- Do not change retry/refresh limits without approval.

## Env Rules

- Env values should come from `src/config/env.ts`.
- Do not read `import.meta.env` directly in services.
- Do not hardcode API or socket URLs in services.

## Error Normalization Rules

- Let the shared Axios client normalize common HTTP errors.
- Throw errors that UI can display safely.
- Do not expose raw backend payloads if they may contain sensitive details.
- Do not swallow errors unless the caller has a documented fallback.

## Backend Contract Safety

- Do not change backend contracts without approval.
- Treat response wrapper shape as a contract.
- Keep pagination fields consistent with existing types.
- Keep auth endpoint behavior compatible with the refresh flow.
- Mark uncertain backend behavior as an assumption in final responses.

## Security And Logging Rules

- Do not log tokens, auth headers, cookies, private messages, socket payloads, or full sensitive responses.
- Do not put tokens in URLs.
- Do not persist sensitive data from services.
- Sanitize or ignore malformed socket events without dumping raw payloads.
- Do not enable verbose STOMP debug or raw communication logging in app code.

## Forbidden Service Patterns

- Importing React.
- Calling React hooks.
- Showing toasts.
- Returning untyped data.
- Creating duplicate Axios clients.
- Hardcoding endpoint strings outside config when config exists.
- Reading env ad hoc.
- Logging sensitive data.
- Changing backend contracts casually.
- Mutating Zustand/query cache directly from services.

## Service Verification Checklist

- Follow the root verification matrix first.
- Verify service returns typed data.
- Verify endpoint comes from config.
- Verify no React/hook/UI imports.
- Verify no sensitive logging.
- For socket helpers, verify cleanup return path.
- For contract changes, verify all affected types and hooks.
