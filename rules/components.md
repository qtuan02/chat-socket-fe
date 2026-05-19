# Component Rules

These rules apply to `src/components` and reusable UI decisions.

## Component Groups

```text
src/components/ui/          # raw shadcn/ui primitives
src/components/shared/      # app-custom reusable UI
```

## General Rules

- Components should be focused, prop-driven, and accessible.
- Prefer composition over large prop APIs.
- Use existing `ui` primitives and `shared` components first.
- Keep low-level business logic, API calls, and socket subscriptions out of presentational components.
- Use Tailwind utilities and `cn` from `@/utils/cn`.
- Use lucide-react icons in buttons/actions when an icon exists.
- Visible UI copy can be Vietnamese or English depending on product direction, but keep it consistent within a screen.

## `components/ui`

- Raw shadcn/Radix primitives.
- Generic, app-agnostic, and reusable by any feature.
- Do not add feature-specific props or logic.
- Do not import from `features`, `pages`, `services`, or `stores`.
- Keep close to upstream unless a local import, token, or accessibility fix is required.

## `components/shared`

Put a component here when it is reused across the app or is clearly an app-level pattern.

Good shared candidates:

- app shell and navigation pieces
- avatar display
- loading, error, and empty states
- reusable form field wrappers
- confirm dialogs
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
- Disable submit actions while submitting when duplicate submissions would be harmful.
- Show validation errors close to the field they explain.

## Accessibility

- Use semantic buttons, links, labels, inputs, lists, and headings.
- Ensure keyboard access for menus, dialogs, forms, and message composer actions.
- Preserve focus-visible styles.
- Do not rely on hover-only controls for important actions.
- Use ARIA only when native semantics are not enough.
- Dialogs/sheets must have accessible names and predictable focus behavior.
- Icon-only controls need accessible labels or tooltips where appropriate.

## UI States

- User-facing components should handle loading, empty, error, disabled, and success states when those states are possible.
- Use skeletons for known layout placeholders and concise empty/error states for decision points.
- Do not block the whole app for a small area failure unless the product flow requires it.
- Toasts should confirm completed actions or explain failed actions; avoid noisy success toasts for passive realtime updates.

## Styling

- Prefer semantic Tailwind tokens and CSS variables.
- Avoid hardcoded colors unless adding/editing global design tokens.
- Avoid inline styles except for truly dynamic values.
- Keep spacing, radius, borders, and shadows consistent with existing components.
- Ensure text fits on mobile and desktop; do not allow buttons/cards to rely on accidental overflow.
- Avoid nested card-in-card layouts unless the nested card represents a real repeated item.

## Avoid

- Do not duplicate shadcn primitives under another name.
- Do not create a new modal/dropdown/select/toast pattern when existing primitives can be composed.
- Do not pass huge untyped objects through props.
- Do not hide data fetching or socket listeners inside shared UI components.
