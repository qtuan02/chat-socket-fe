# Component Rules

These rules apply to `src/components`.

## Component Groups

```text
src/components/ui/          # raw shadcn/ui primitives
src/components/shared/      # app-custom reusable UI
```

## General Rules

- Components should be focused, prop-driven, and accessible.
- Prefer composition over large prop APIs.
- Use existing `ui` primitives and `shared` components first.
- Keep business logic, API calls, and socket subscriptions out of presentational components.
- Use Tailwind utilities and `cn` from `@/utils/cn`.
- Use lucide-react icons in buttons/actions when an icon exists.
- Visible UI copy can be Vietnamese or English depending on product direction, but keep it consistent within a screen.

## `components/ui`

- Raw shadcn/Radix primitives.
- Generic, app-agnostic, and reusable by any feature.
- Do not add feature-specific props or logic.
- Do not import from `features`, `pages`, `services`, or `stores`.

## `components/shared`

Put a component here when it is reused across the app or is clearly an app-level pattern.

Good shared candidates:

- app shell and navigation pieces
- avatar display
- loading, error, and empty states
- reusable form field wrappers
- confirm dialogs
- message bubble variants used in multiple places
- reusable panel/header/list layouts
- user menu and account controls

Bad shared candidates:

- one-off UI for a single feature
- UI that imports feature-private types or hooks
- UI with hidden API/socket behavior
- vague components with unclear reuse

## Forms

- Use React Hook Form for non-trivial forms.
- Use Zod for validation when rules matter.
- Use shadcn form primitives when they exist.
- Keep submit orchestration in a feature hook or template-level handler.
- Components should receive form state, options, loading flags, and callbacks through props.

## Accessibility

- Use semantic buttons, links, labels, inputs, lists, and headings.
- Ensure keyboard access for menus, dialogs, forms, and message composer actions.
- Preserve focus-visible styles.
- Do not rely on hover-only controls for important actions.
- Use ARIA only when native semantics are not enough.

## Styling

- Prefer semantic Tailwind tokens when available.
- Avoid hardcoded colors unless adding/editing global design tokens.
- Avoid inline styles except for truly dynamic values.
- Keep spacing, radius, borders, and shadows consistent with existing components.

## Avoid

- Do not duplicate shadcn primitives under another name.
- Do not create a new modal/dropdown/select/toast pattern when existing primitives can be composed.
- Do not pass huge untyped objects through props.
- Do not hide data fetching or socket listeners inside shared UI components.
