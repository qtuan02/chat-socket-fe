# Utility Rules

These rules apply to `src/utils`.

## Purpose

`src/utils` contains small reusable helper functions.

Good examples:

- `cn.ts`
- `date.ts`
- `error.ts`
- `display.ts`
- `conversation.ts`
- `string.ts`

## Rules

- Keep utilities pure whenever possible.
- No React components.
- No React hooks.
- No JSX.
- No API calls.
- No socket subscriptions.
- No feature-private imports.
- Prefer explicit input and output types.
- Keep functions small and easy to test.
- Handle invalid input predictably.
- Avoid mutating arguments.
- Add unit tests for utilities with branching, parsing, date math, cache identity, or error normalization when test infrastructure exists.

## Placement

- Use `src/utils` for app-wide helpers.
- Use `src/features/<feature>/utils` for feature-only helpers.
- Use `src/libs` for third-party client setup.
- Use `src/services` for HTTP or socket communication.

## `cn`

- Use `cn` from `@/utils/cn` for conditional Tailwind classes.
- Do not create another class-name helper.

## Avoid

- Do not create vague files like `helpers.ts`, `misc.ts`, or `common.ts`.
- Do not add hidden global state.
- Do not add dependencies for simple formatting/parsing helpers unless the benefit is clear.
