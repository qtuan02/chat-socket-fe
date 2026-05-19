# Auth Feature Rules

Rules for `src/features/auth`.

This folder owns sign-in and sign-up UI, auth form schemas, and auth feature templates.

## Scope

- Auth templates live in `templates/`.
- Auth forms live in `components/`.
- Auth form schemas/types live in `types/`.
- Auth service calls live in `src/services/auth-service.ts`.
- Reusable auth mutations live in `src/hooks/api/auth.ts`.
- Session checks and route guards live outside this feature in `src/hooks` and `src/providers`.

## Auth Flow Ownership

- Use existing auth services and auth API hooks.
- Use `useAuthStore` only for the in-memory access token behavior already implemented.
- Do not call Axios directly from auth forms.
- Do not duplicate sign-in/sign-up request logic inside components.
- Keep navigation after auth success explicit and easy to follow.
- Clear query cache when a session boundary changes, matching existing sign-in/sign-out behavior.
- Keep refresh behavior centralized in `src/libs/axios.ts`; auth UI should not trigger ad hoc refresh calls.

## Form Validation Rules

- Use React Hook Form + Zod for non-trivial auth forms.
- Keep auth schemas close to auth form types.
- Show field validation inline.
- Use `noValidate` so the app controls validation display.
- Disable submit while pending.
- Prevent double submit through mutation pending state.
- Preserve user input after failed submit unless the user intentionally resets the form.

## Token/Session Rules

- Access token is held in memory through Zustand unless explicitly approved otherwise.
- Do not store access tokens in localStorage/sessionStorage.
- Do not put tokens in URLs.
- Do not log credentials, tokens, cookies, or auth headers.
- Do not change refresh-token assumptions without reviewing `src/libs/axios.ts` and the backend contract.
- Do not change auth persistence without explicit approval.

## Redirect And Route Guard Rules

- Do not bypass `ProtectedRoute` or `GuestRoute`.
- Do not hardcode route strings when `APP_ROUTES` exists.
- Preserve guest-to-chat and protected-to-sign-in redirect behavior unless the task explicitly changes it.
- When changing auth routes, review `src/app.tsx`, `src/providers/protected-route.tsx`, and `src/providers/guest-route.tsx`.

## Error Handling Rules

- Normalize and display auth errors safely.
- Use inline submit errors for form-level failures.
- Use Sonner toasts for mutation-level success/failure where consistent with existing behavior.
- Do not expose raw backend payloads.
- Do not swallow auth errors silently.

## Forbidden Auth Patterns

- Storing access tokens in browser storage without approval.
- Logging credentials or tokens.
- Calling Axios directly from auth components.
- Duplicating refresh logic in the auth feature.
- Bypassing route guards.
- Hardcoding auth API paths in UI.
- Weakening validation to make a flow pass.

## Auth Verification Checklist

- Follow the root verification matrix first.
- Verify sign in when touching sign-in behavior.
- Verify sign up when touching sign-up behavior.
- Verify refresh/session check when touching token/session behavior.
- Verify logout/session reset when touching auth state clearing.
- Verify protected and guest redirects when touching route guard behavior.
- Verify no credentials/tokens are logged.
