# UI Primitive Rules

Rules for `src/components/ui`.

This folder owns generic UI primitives, mostly shadcn/Radix-style building blocks.

## UI Primitive Ownership

- UI primitives must be generic.
- UI primitives must not know chat, auth, friends, group, or business domain concepts.
- UI primitives must not call APIs.
- UI primitives must not import services, stores, query hooks, or feature code.
- Shared app-specific UI belongs in `src/components/shared`, not here.
- Feature-specific UI belongs in `src/features/<feature>/components`.

## shadcn/Radix Source Rules

- Before adding, replacing, or heavily rewriting a primitive, check the current local primitive plus the relevant shadcn docs, registry item, or Radix primitive docs.
- shadcn/ui adds source code directly into the project. Treat local primitives as owned code, but use upstream docs/source shape as the starting point for new primitives.
- Prefer documented shadcn/Radix composition for complex accessibility behavior such as dialogs, menus, popovers, sheets, tooltips, selects, tabs, accordions, and command palettes.
- When bringing in an upstream primitive, diff against existing local customizations before overwriting. Preserve repo-specific imports, tokens, variants, and `cn` usage.
- Do not hand-roll an accessible primitive when shadcn/Radix already provides the behavior unless the task has a clear reason and the accessibility behavior is verified.
- Do not add a second UI primitive library to solve a component that shadcn/Radix already covers.

## Accessibility Rules

- Preserve Radix/shadcn accessibility behavior.
- Preserve keyboard navigation and focus-visible styles.
- Dialogs, menus, and sheets must use accessible primitives.
- Interactive controls must expose labels through visible text, `aria-label`, or screen-reader-only text.
- Do not remove ARIA attributes from primitives unless replacing them with better semantics.
- Disabled states must remain keyboard/mouse safe.

## Styling Rules

- Prefer CSS variables and Tailwind utilities already used by the app.
- Treat `src/globals.css` as the source of UI theme tokens.
- Use Tailwind v4 `@theme` tokens for reusable design values; use `:root` variables only for runtime CSS variables that should not create utilities.
- Preserve token-based color usage such as `background`, `foreground`, `border`, `muted`, `primary`, `destructive`, and `ring`.
- Preserve dark-mode compatibility when tokens exist.
- Do not hardcode product-specific colors.
- Avoid arbitrary color values in primitives unless there is no existing semantic token.
- Keep primitive class APIs composable through `className`.
- Use the existing `cn` utility for conditional classes.

## Variant Rules

- Variants must be generic and reusable.
- Avoid adding business-specific variants.
- Do not add `chat`, `message`, `friend`, `auth`, or similar domain variants here.
- If a feature needs a product-specific variant, wrap the primitive in `src/components/shared` or feature UI.

## Composition Rules

- Preserve shadcn/Radix composition style.
- Keep primitive props close to underlying element/Radix APIs.
- Do not hide business behavior inside primitives.
- Do not add network, routing, cache, or store side effects.
- Keep primitives small and predictable.

## Forbidden UI Primitive Patterns

- Importing from `src/features`.
- Importing from `src/services`.
- Importing from `src/stores`.
- Importing from `src/hooks/api`.
- Calling APIs or mutations.
- Showing feature-specific toasts.
- Adding product-specific props.
- Replacing accessible Radix behavior with custom inaccessible overlays.
- Hardcoding chat-specific styling or copy.

## UI Primitive Verification Checklist

- Follow the root verification matrix first.
- For visible primitive changes, run `bun run build`.
- Verify keyboard and focus behavior.
- Verify disabled and invalid states.
- Verify dark-token compatibility.
- Verify no feature/service/store/query imports.
- Verify existing component API remains compatible.
