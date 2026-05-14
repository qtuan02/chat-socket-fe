# Code Review Checklist

Use this checklist when reviewing generated or modified code.

## Correctness

- Does the change satisfy the requested behavior?
- Are loading, error, empty, success, and disabled states handled?
- Are route params validated or safely handled?
- Are forms validated before submit?
- Are message ordering, duplicate events, pending sends, and failed sends handled when relevant?
- Are socket listeners cleaned up?
- Are reconnects and repeated mounts safe from duplicate subscriptions?

## Architecture

- Is code placed in the correct layer?
- Are pages thin and rendering feature templates?
- Are feature templates/components/hooks separated clearly?
- Are API and socket functions in `src/services`?
- Are third-party clients in `src/libs`?
- Are shared components actually reusable and feature-agnostic?
- Is cross-feature importing avoided?

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
- Are icons from lucide-react when available?

## Naming

- Folders and files use lowercase `kebab-case`.
- Components use `PascalCase`.
- Templates end with `Template`; pages end with `Page`.
- Hooks start with `use`.
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

## Security And Privacy

- No secrets or tokens are exposed.
- No private message payloads, auth tokens, or sensitive user data are logged.
- Env usage respects frontend exposure rules.
- Auth/session behavior is not weakened.

## Verification

Required before final response when code changed:

```bash
bun.cmd run check
bun.cmd run typecheck
```

For build/config/UI changes, also run:

```bash
bun.cmd run build
```

If any command was not run, state why.
