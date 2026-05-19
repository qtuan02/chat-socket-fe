# Component Rules

Rules for `src/components`.

This folder owns reusable UI outside feature modules.

## Folder Boundaries

- `src/components/ui`: generic low-level shadcn/Radix-style primitives.
- `src/components/shared`: app-specific reusable components composed from primitives.
- Shared components may know app domain concepts only when reused across multiple features.
- Feature-only UI stays under `src/features/<feature>/components`.

## Component Discovery Rules

- Before adding a reusable component, check `src/components/ui`, `src/components/shared`, and nearby feature components for an existing pattern.
- When the need matches an existing shadcn component or block, read the official docs/source shape first and compose from local primitives instead of inventing a parallel API.
- Use shadcn blocks as reference patterns, not as app architecture. Adapt them into this repo's route, feature, and shared-component boundaries.

## Allowed Patterns

- Reuse primitives before adding app-specific shared components.
- Keep components typed and accessible.
- Use `cn` for class merging.
- Use Tailwind tokens and CSS variables from the app theme.
- Keep components presentational unless they are intentionally shared interaction components.
- Keep reusable component APIs stable; check all consumers before changing required props or visual defaults.
- Prefer explicit typed props and narrow callbacks over importing feature-specific behavior into shared components.
- Shared components should not own route navigation unless navigation is part of the component contract.

## Forbidden Patterns

- Do not call APIs or services from reusable components.
- Do not import feature modules into reusable components.
- Do not call TanStack Query hooks or mutations from shared components by default.
- Do not add business-specific variants to `src/components/ui`.
- Do not add chat-only UI to shared/global components unless it is genuinely reusable.
- Do not hide socket, auth, or query side effects inside reusable components.
- Do not hardcode feature-specific copy that only applies to one screen.

## Verification Checklist

- Follow the root verification matrix first.
- For visible changes, review light/dark token compatibility and mobile layout; use browser QA when the component affects a real flow.
- Verify keyboard, focus, disabled, and invalid states for interactive components.
- Verify no service/store/query imports were added unless explicitly intended for a shared interaction component.
