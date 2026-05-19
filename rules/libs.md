# Library Integration Rules

These rules apply to `src/libs`.

## Purpose

`src/libs` contains setup and integration code for third-party libraries.

Good examples:

- Axios client setup.
- TanStack Query client setup.
- STOMP/WebSocket client factory when extracted from stores.
- Analytics client setup if analytics is introduced.

## Rules

- Keep integrations centralized.
- Do not put feature business logic here.
- Do not import React components or feature-private modules.
- Read env/config values from `src/config`.
- Keep client setup typed and predictable.
- Do not log sensitive data in interceptors or socket middleware.

## HTTP Client

- Use one configured HTTP client unless there is a real API boundary.
- Normalize base URL, credentials, auth headers, and refresh behavior here.
- Keep response mapping in services when it is domain-specific.
- Keep auth retry limits explicit.

## Query Client

- Keep global QueryClient defaults in one place.
- Override query behavior locally only when there is a clear product reason.
- Do not hide global refetch/retry changes in feature code.

## Socket Client

- Keep low-level socket creation and connection options centralized.
- Do not bind feature-specific event handlers in `libs`.
- Event-specific helpers belong in `src/services`.
- Feature orchestration belongs in feature hooks/providers.

## `cn`

`cn` is not a library integration in this project. It lives in `src/utils/cn.ts`.
