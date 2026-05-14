# Config Rules

These rules apply to `src/config`.

## Purpose

`src/config` contains important app configuration.

Good examples:

- `env.ts`
- `constants.ts`
- `routes.ts`
- `storage-keys.ts`
- `socket-events.ts`
- `app.ts`

## Rules

- Keep config deterministic and side-effect-light.
- Validate and normalize environment variables in one place.
- Keep route paths and route builders centralized when routing grows.
- Keep app-wide constants here when they are not domain types.
- Keep socket event names here or in a dedicated service module if that is clearer.
- Do not put React components, hooks, API calls, or Zustand stores here.

## Env

- Do not expose secrets in frontend code.
- Only frontend-safe public env variables should be read by the client.
- Normalize env values before other modules consume them.

## Routes

- When adding routes, prefer a centralized `routes.ts` with path constants/builders.
- Avoid hardcoded route strings across components and features once a route config exists.
