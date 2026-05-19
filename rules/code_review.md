# Code Review Checklist

Use this checklist when reviewing generated or modified code.

## Correctness

- Does the change satisfy the requested behavior?
- Are loading, error, empty, success, and disabled states handled?
- Are route params validated or safely handled?
- Are forms validated before submit?
- Are duplicate submissions prevented when harmful?
- Are message ordering, duplicate events, pending sends, and failed sends handled when relevant?
- Are socket listeners cleaned up?
- Are reconnects and repeated mounts safe from duplicate subscriptions?

## Architecture

- Is code placed in the correct layer?
- Are pages thin and rendering feature templates?
- Are feature templates/components/hooks separated clearly?
- Are API and socket functions in `src/services`?
- Are third-party clients in `src/libs` or the established global socket store?
- Are shared components actually reusable and feature-agnostic?
- Are cross-feature imports limited to route-shell composition or promoted shared code?

## Data Fetching

- Are query keys stable, serializable, and complete?
- Do mutations intentionally invalidate or update affected cache?
- Are optimistic updates reversible and reconciled with server responses?
- Is server data kept out of Zustand?
- Are infinite-query cache updates preserving page shape?

## Realtime

- Are STOMP/WebSocket subscriptions idempotent?
- Is malformed socket data ignored safely?
- Are event names/destinations centralized or clearly owned?
- Does logout/session reset disconnect and clear realtime state?
- Are presence and typing states treated as ephemeral?

## React Quality

- Is `useEffect` only used for real external synchronization?
- Is derived state calculated instead of mirrored into state?
- Are `useMemo` and `useCallback` justified?
- Is render logic pure?
- Are dependency arrays correct?

## UI And Accessibility

- Does UI use existing `components/ui` and `components/shared` first?
- Are Tailwind classes and semantic tokens used consistently?
- Are forms labeled and validation errors visible?
- Are important actions keyboard-accessible and not hover-only?
- Are icon-only actions labeled?
- Does text fit across mobile and desktop?

## Naming

- Folders and files follow `rules/naming.md`, with existing legacy files allowed until scoped refactor.
- Components use `PascalCase`.
- Templates end with `Template`; pages end with `Page`.
- Hooks start with `use`.
- API query hooks end with `Query`; mutations end with `Mutation`.
- Variables/functions use `camelCase`.
- Booleans start with `is`, `has`, `can`, `should`, `did`, or `will` unless a library prop dictates otherwise.
- Event props use `on...`; local handlers use `handle...`.
- No vague exported names or files such as `helpers.ts`, `utils.ts`, `common.ts`, or `temp.ts`.

## TypeScript And Dependencies

- Does TypeScript pass?
- Are shared types reused where appropriate?
- Are `any` and unsafe casts avoided?
- Were new dependencies avoided unless truly needed?
- If a dependency was added, was `bun.lock` updated with Bun?
- Were generated files reviewed before keeping them?

## Security And Privacy

- No secrets or tokens are exposed.
- No private message payloads, auth tokens, auth headers, or sensitive user data are logged.
- Env usage respects frontend exposure rules.
- Auth/session behavior is not weakened.
- User-generated content is safely rendered.

## Verification

Required before final response when source code changed:

```bash
bun.cmd run check
bun.cmd run typecheck
```

For build/config/UI changes, also run:

```bash
bun.cmd run build
```

Run relevant test scripts when they exist. If any command was not run, state why.
