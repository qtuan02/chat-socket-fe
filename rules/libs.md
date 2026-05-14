# Library Integration Rules

These rules apply to `src/libs`.

## Purpose

`src/libs` contains setup and integration code for third-party libraries.

Good examples:

- `http-client.ts` for configured Axios.
- `query-client.ts` for TanStack Query client setup.
- `socket-client.ts` for socket instance/factory setup.
- `analytics-client.ts` if analytics is introduced.

## Rules

- Keep integrations centralized.
- Do not put feature business logic here.
- Do not import React components or feature-private modules.
- Read env/config values from `src/config`.
- Keep client setup typed and predictable.
- Do not log sensitive data in interceptors or socket middleware.

## HTTP Client

- Use one configured HTTP client unless there is a real API boundary.
- Normalize base URL and headers here.
- Keep response mapping in services when it is domain-specific.

## Query Client

- Keep global QueryClient defaults in one place when TanStack Query is added.
- Override query behavior locally only when there is a clear product reason.

## Socket Client

- Keep low-level socket creation and connection options here.
- Do not bind feature-specific event handlers in `libs`.
- Event-specific helpers belong in `src/services`.
- Feature orchestration belongs in feature hooks/providers.

## `cn`

`cn` is not a library integration in this project. It lives in `src/utils/cn.ts`.
