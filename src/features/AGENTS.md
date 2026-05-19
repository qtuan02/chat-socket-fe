# Feature Rules

Rules for `src/features`.

Features own product workflows, screen templates, feature-only components, and feature-only orchestration.

## Folder Convention

- `templates/`: page-level feature views imported by route pages.
- `components/`: feature-only UI.
- `hooks/`: feature-only orchestration hooks.
- `types/`: feature-local form/schema/view types when not shared.

## Allowed Patterns

- Compose shared UI primitives and app-specific shared components.
- Call reusable API hooks from `src/hooks/api`.
- Components and templates should not call services directly.
- Feature hooks may call services directly only for narrow imperative orchestration that is not reusable server state, such as a socket send helper or one-off lifecycle workflow. Keep that exception in the hook, document the reason when it is not obvious, and do not duplicate reusable API-hook behavior.
- Keep feature-only form schemas near the form.
- Use Sonner for mutation-level success/failure when consistent with existing feature code.
- Keep route params and search params normalized at the feature hook/template boundary.

## Boundaries

- Shared reusable UI belongs in `src/components/shared`.
- Raw generic primitives belong in `src/components/ui`.
- Reusable TanStack Query hooks belong in `src/hooks/api`.
- REST and socket protocol details belong in `src/services`.
- Global client state belongs in `src/stores` only when it is truly cross-route client state.
- Feature templates may compose other features only when they own the screen layout, such as the chat shell.
- Cross-feature composition must not move another feature's API calls, cache ownership, form state, or mutation logic into the composing feature.

## Data, Forms, And Actions

- Feature data from the backend is server state and belongs in TanStack Query.
- Do not store current-user profiles, friends, groups, conversations, search results, or paginated lists in Zustand.
- Mutations must intentionally patch or invalidate affected query keys, especially when friend, group, member, unread, or conversation membership data can change multiple views.
- User, friend, group member, and conversation actions must use stable ids, not display names or usernames.
- Non-trivial forms should use React Hook Form + Zod; dialog forms must reset on close.
- Disable action buttons and submit controls while mutations are pending.
- Preserve retryable user input after failed submits unless the user intentionally cancels or resets.
- Keep debounced search behavior when search is already debounced in the feature.

## UI And Display

- Reuse `src/components/shared` user-item/detail/display patterns before creating feature-specific list rows.
- Use display helpers from `src/utils/display.ts` for user and conversation labels when applicable.
- Keep mobile feature views scrollable and make action controls reachable.
- Show loading, empty, error, disabled, and success states where the flow can enter those states.

## Feature Lifecycle

- New feature folders should start with only the subfolders they actually need: `templates/`, `components/`, `hooks/`, and `types/`.
- Add a feature-level `AGENTS.md` only when the feature has rules that are stricter or more specific than this file.
- When renaming or deleting a feature, update routes, imports, services, query hooks, query keys, shared types, and stale scoped rule files in the same change.
- Avoid copying another feature's `AGENTS.md` as a template unless every rule is still feature-specific and accurate.

## Forbidden Patterns

- Do not make route pages heavy.
- Do not move server data into Zustand.
- Do not duplicate service calls in components.
- Do not scatter raw query keys.
- Do not create socket subscriptions without cleanup.
- Do not add feature-specific behavior to `src/components/ui`.
- Do not refactor across features unless the task requires it.

## Verification Checklist

- Follow the root verification matrix first.
- For visible UI changes, review desktop and mobile layouts; use browser QA for changed flows when the app can run locally.
- For feature flows, verify loading, empty, error, disabled, and success states.
- For query/socket changes, verify cache ownership and cleanup.
