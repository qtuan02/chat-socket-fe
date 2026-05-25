# Config Rules

Rules for `src/config`.

This folder owns environment parsing, app routes, constants, and other configuration boundaries.

## Scope

- `env.ts`: public client env access and validation.
- `routes.ts`: app route constants.
- Future constants/config files must be explicit and typed.

## Env Rules

- Read env values through `src/config/env.ts`.
- Do not read `import.meta.env` ad hoc outside config.
- Public client env vars must use the existing public-safe naming convention.
- Current public env keys are `PUBLIC_API_BASE_URL` and `PUBLIC_SOCKET_URL`.
- Do not expose secrets to client bundles.
- Do not commit `.env` files.
- Keep `.env.template` updated when adding required public env vars.
- Validate env values through `envSchema.parse(...)`.
- Provide safe local-development defaults only when the app can run meaningfully without production config, and keep those defaults aligned with `.env.template`.

## Route Rules

- Use `APP_ROUTES` instead of hardcoded route strings.
- Update route guards and navigation call sites when route constants change.
- Keep auth routes and protected routes aligned with `src/app.tsx`.

## Constant Rules

- Constants should be named explicitly.
- Do not create vague config files such as `constants.ts` unless values are cohesive and documented.
- Keep backend endpoint constants aligned with service ownership.
- Keep REST paths under `APP_API` and app navigation paths under `APP_ROUTES`.
- Avoid feature-specific constants here unless reused across features.

## Forbidden Patterns

- Hardcoding API or socket URLs outside config.
- Reading private env vars in client source.
- Adding secrets to `.env.template`.
- Changing public env names without updating docs and call sites.
- Duplicating route strings in features/components.

## Verification Checklist

- Follow the root verification matrix first; config changes require `bun run check`, `bun run typecheck`, and `bun run build`.
- Verify env template and runtime fallback behavior.
- Verify protected and guest navigation when route constants change.
