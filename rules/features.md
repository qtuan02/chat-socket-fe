# Feature Rules

These rules apply to `src/features/**`.

## Purpose

Feature folders contain product behavior for a bounded part of the app, such as `auth`, `chat`, `profile`, `settings`, or `notifications`.

## Standard Structure

Create only the folders a feature actually needs.

```text
src/features/<feature>/
  templates/     # page-level feature views imported by src/pages
  components/    # feature-only UI
  hooks/         # feature-only orchestration hooks
  providers/     # feature-only React providers
  stores/        # feature-only Zustand stores
  types/         # feature-only types
  constants/     # feature-only constants
  utils/         # feature-only pure helpers
```

Most features should start with only:

```text
templates/
components/
```

## `templates`

- Contains page-level feature views.
- A template is what a thin route page imports and renders.
- Template files must use kebab-case, for example `sign-in-template.tsx`, not `SignInTemplate.tsx`.
- Templates may compose feature components, shared components, feature hooks, and providers.
- Keep templates readable. Move repeated sections into feature components.

Example:

```tsx
import { SignInForm } from "../components/sign-in-form";

export function SignInTemplate() {
  return <SignInForm />;
}
```

## `components`

- Contains UI used only inside the feature.
- Component files must use kebab-case, for example `sign-in-form.tsx`, not `SignInForm.tsx`.
- Components should receive data and actions through props when possible.
- Do not call API services directly from presentational components.
- Use `src/components/ui` and `src/components/shared` before creating new UI.

## Feature Hooks

- Use `features/<feature>/hooks` for feature-only orchestration.
- Good fit: composing API hooks, socket event handlers, form state, optimistic message workflow, route navigation actions, local filters, and selected item behavior.
- If a hook becomes reusable across features, move it to `src/hooks`.

## Feature Providers

- Use `providers` only when a feature needs contextual state or subscriptions across a subtree.
- For chat sockets, a feature provider may coordinate listeners, but low-level socket creation should stay in `src/libs` and event functions in `src/services`.

## Feature Stores

- Use feature stores only for feature-local client state that does not need to be global.
- If other features need the state, move it to `src/stores`.
- Do not store TanStack Query server data in Zustand.

## Feature Types And Constants

- Keep feature-only types in `features/<feature>/types`.
- Move shared entities such as `User`, `Conversation`, and `Message` to `src/types`.
- Keep feature-only constants in `features/<feature>/constants`.
- Move global constants to `src/config`.

## Chat Feature Guidance

A chat feature may look like this:

```text
src/features/chat/
  templates/
    chat-template.tsx
  components/
    conversation-list.tsx
    message-list.tsx
    message-bubble.tsx
    message-composer.tsx
    typing-indicator.tsx
  hooks/
    use-chat-room.ts
    use-message-composer.ts
```

Keep these concerns separate:

- Message API calls: `src/services/chat-service.ts`.
- Socket event helpers: `src/services/socket-service.ts` or `src/services/chat-socket-service.ts`.
- Socket client setup: `src/libs/socket-client.ts`.
- Shared message type: `src/types/chat.ts`.
- Global connection state: `src/stores/socket-store.ts`.
- Feature rendering and orchestration: `src/features/chat`.

## Avoid

- Do not put route page files inside features.
- Do not import another feature's private components/hooks/types directly.
- Do not create `domain`, `data`, `models`, `containers`, or `views` folders unless the project rules are intentionally updated.
- Do not move code to a top-level shared folder before reuse is real.
