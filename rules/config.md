# Config Rules

These rules apply to `src/config`.

## Purpose

`src/config` contains deterministic app configuration.

Good examples:

- `env.ts`
- `constant.ts` or `constants.ts`
- `routes.ts`
- `storage-keys.ts`
- `socket-events.ts`
- `feature-flags.ts`
- `app.ts`

## Rules

- Keep config deterministic and side-effect-light.
- Validate and normalize environment variables in one place.
- Keep route paths and route builders centralized when routing grows.
- Keep app-wide constants here when they are not domain types.
- Keep socket event names here or in a dedicated service module if that is clearer.
- Do not put React components, hooks, API calls, or Zustand stores here.

## Env

- Follow `rules/security.md`.
- Do not expose secrets in frontend code.
- Only frontend-safe public env variables should be read by the client.
- Read `import.meta.env` only in `env.ts`; other modules should consume normalized `env`.
- Keep `.env.template` limited to safe public values and local examples.

## Routes

- Prefer centralized route constants/builders in `routes.ts`.
- Avoid hardcoded route strings across components and features once a route config exists.
- Validate route params before using them in API calls or subscriptions.

## Socket Events

- Prefer typed builder functions for destinations with ids.
- Do not concatenate topic strings throughout components.
- Keep backend event names consistent with service parsing and feature cache updates.
