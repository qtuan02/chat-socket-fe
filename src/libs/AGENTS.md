# Library Integration Rules

Rules for `src/libs`.

This folder owns configured third-party clients and low-level integration setup.

## Scope

- `axios.ts`: configured HTTP client and refresh interceptors.
- `query-client.ts`: TanStack Query client defaults.
- `query-key-factory.ts`: query key helper.
- Future low-level client setup belongs here when shared across the app.

## Axios Rules

- Preserve the shared Axios instance.
- Preserve `withCredentials`.
- Preserve bearer-token attachment for private requests.
- Preserve one-time refresh behavior on 401/403 unless explicitly changing auth.
- Do not create duplicate HTTP clients.
- Do not log tokens, headers, cookies, or raw sensitive responses.

## Query Client Rules

- Keep default query/mutation behavior intentional.
- Do not change retry, staleTime, gcTime, or focus refetch defaults casually.
- Current defaults include one-minute query freshness, five-minute GC, `keepPreviousData`, one query retry, no mutation retries, and no focus refetch.
- If changing defaults, document affected UX and risk.
- Keep server data in TanStack Query, not Zustand.

## Query Key Rules

- Query key helpers must return arrays.
- Keys must be serializable.
- Include all query variables in keys.
- Do not introduce non-JSON key parts.

## Env/Build Rules

- Use `src/config/env.ts` for client env values.
- Do not read `import.meta.env` ad hoc from unrelated integration files.
- Do not expose private env vars to client code.

## Forbidden Patterns

- Weakening auth refresh to hide errors.
- Retrying refresh in loops.
- Clearing all query data without a session-boundary reason such as refresh failure or logout.
- Adding global side effects at module load unless necessary and documented.
- Adding heavy integration dependencies without approval.

## Verification Checklist

- Follow the root verification matrix first; integration changes require `bun run check`, `bun run typecheck`, and `bun run build`.
- Verify login, refresh/session check, and logout when touching Axios/auth.
- Verify query cache defaults when touching QueryClient.
- Verify no sensitive logging was added.
