# Testing And Verification Rules

These rules apply when adding tests, changing test setup, or verifying behavior before final response.

## Baseline Verification

Run these after meaningful source changes:

```bash
bun.cmd run check
bun.cmd run typecheck
```

Run this for UI, config, route, dependency, or build-related changes:

```bash
bun.cmd run build
```

If test scripts exist, run the relevant test script for the touched behavior. If a required command cannot run, state the reason and the residual risk.

## When To Add Tests

Add or update tests when the change touches:

- API response mapping, pagination, or query cache helpers.
- Message ordering, deduplication, optimistic sends, retry, or read receipts.
- Socket subscription lifecycle, reconnect behavior, or payload parsing.
- Auth refresh, route guards, logout/session reset, or token handling.
- Shared utilities with non-trivial edge cases.
- Forms with validation or disabled/submitting behavior.
- Reusable hooks that coordinate browser APIs, timers, storage, or subscriptions.

## Test Scope

- Unit tests are preferred for pure utilities, mappers, reducers, and query-cache helpers.
- Hook/component tests are preferred for reusable hooks and form behavior.
- Integration tests are preferred for API hook + service behavior when mocking HTTP/socket boundaries.
- E2E tests are preferred for critical auth and chat workflows when an E2E setup exists.
- Do not add a heavy test framework casually for a tiny change; document the missing coverage if no test infrastructure exists.

## Test Placement

- Keep tests close to the behavior they cover when practical.
- Use clear names such as `message-cache.test.ts` or `sign-in-form.test.tsx`.
- Test app behavior and contracts, not implementation details such as private variable names.
- Mock network and realtime boundaries. Do not rely on a live backend for deterministic tests.

## Manual UI Verification

For visible UI changes:

- Check desktop and mobile widths.
- Check loading, empty, error, disabled, and success states.
- Check keyboard access for dialogs, menus, forms, and message composer controls.
- Check that text does not overflow or overlap at common viewport sizes.
- Check dark mode if the touched component uses color tokens and dark mode exists.

## Avoid

- Do not snapshot large unstable DOM trees by default.
- Do not test generated shadcn/ui primitive internals.
- Do not write tests that depend on real time without fake timers or deterministic waits.
- Do not leave skipped tests without a tracked reason.
