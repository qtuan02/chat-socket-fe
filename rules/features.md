# Feature Rules

These rules apply to `src/features/**`.

## Purpose

Feature folders contain product behavior for a bounded part of the app, such as `auth`, `chat`, `conversation`, `friends`, `group`, `profile`, `settings`, or `notifications`.

## Standard Structure

Create only the folders a feature actually needs.

```text
src/features/<feature>/
  templates/     # page-level feature views imported by src/pages
  components/    # feature-only UI
  hooks/         # feature-only orchestration hooks
  providers/     # feature-only React providers
  stores/        # feature-only client stores
  types/         # feature-only types
  constants/     # feature-only constants
  utils/         # feature-only pure helpers
```

Most features should start with only:

```text
templates/
components/
```

## Templates

- Templates are page-level feature views.
- A thin route page imports and renders a template.
- Template files use kebab-case, for example `sign-in-template.tsx`.
- Templates may compose feature components, shared components, feature hooks, and providers.
- Keep templates readable. Extract repeated sections into feature components.
- Templates may coordinate route params, layout state, and feature hooks when that state belongs to the screen.

## Components

- Components contain UI used only inside the feature.
- Component files use kebab-case.
- Components should receive data and actions through props when practical.
- Do not call low-level services directly from presentational components.
- Use `src/components/ui` and `src/components/shared` before creating new UI.
- Move repeated API/toast/navigation workflows to a feature hook.

## Feature Hooks

- Use `features/<feature>/hooks` for feature-only orchestration.
- Good fit: composing API hooks, socket event handlers, form workflows, optimistic message sends, navigation actions, filters, selected item behavior, and cache updates that are specific to one feature.
- If a hook becomes reusable across features, move it to `src/hooks`.

## Feature Providers

- Use providers only when a feature needs contextual state or subscriptions across a subtree.
- For chat sockets, a feature provider may coordinate listeners, but protocol setup stays in `src/libs`/global socket store and event helpers stay in `src/services`.

## Feature Stores

- Use feature stores only for feature-local client state that does not need to be global.
- If other features need the state, move it to `src/stores`.
- Do not store TanStack Query server data in Zustand.

## Cross-Feature Composition

- Cross-feature imports are normally avoided.
- A route-shell feature may compose sibling feature templates/components when it owns a larger screen layout. Example: a `chat` shell may render `friends`, `conversation`, `group`, or `current-user` UI in the chat workspace.
- If non-shell features need each other repeatedly, promote the shared contract or UI to `types`, `components/shared`, `hooks`, `utils`, or `services`.
- Do not create hidden dependency chains where two features import each other.

## Chat Feature Guidance

Keep these concerns separate:

- Message API calls: `src/services/message-service.ts`.
- Conversation API calls: `src/services/conversation-service.ts`.
- Socket event helpers: `src/services/socket-service.ts` or `src/services/<domain>-socket-service.ts`.
- Socket client setup: `src/libs` or the established global socket store.
- Shared message/conversation types: `src/types`.
- Global connection state: `src/stores`.
- Feature rendering and orchestration: `src/features/chat`.

## Avoid

- Do not put route page files inside features.
- Do not create `domain`, `data`, `models`, `containers`, `views`, `logic`, or `helpers` folders unless project rules are intentionally updated.
- Do not move code to a top-level shared folder before reuse is real.
