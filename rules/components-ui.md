# shadcn UI Primitive Rules

These rules apply to `src/components/ui`.

## Purpose

`src/components/ui` contains raw shadcn/ui primitives that app and feature components compose.

## Before Adding Or Editing

- Check whether the primitive already exists.
- Check whether the requirement belongs in `components/shared` or a feature component instead.
- Research the official shadcn docs or registry before adding a missing primitive.
- Do not run `shadcn init`; `components.json` is already configured.

## Adding Primitives

Preferred command:

```bash
bunx shadcn@latest add <component> --cwd .
```

Rules:

- Add only the needed primitive.
- Do not pass `--overwrite` unless the user explicitly asks.
- Review generated files after adding.
- Verify generated imports use `@/components/ui` and `@/utils/cn`.
- Keep generated code close to upstream unless local aliases, tokens, or accessibility fixes are required.

## Styling

- Keep CSS variable and semantic-token based styling.
- Do not replace token styling with hardcoded colors.
- Preserve dark-mode compatibility when tokens exist.
- Preserve focus-visible, disabled, ARIA, and keyboard states.

## API

- Keep primitive exports stable.
- Do not add product-specific props to base primitives.
- If a feature needs product-specific behavior, wrap the primitive in `src/components/shared` or `src/features/<feature>/components`.

## Avoid

- Do not overwrite existing primitives blindly.
- Do not import feature code from `components/ui`.
- Do not add API calls, socket listeners, stores, routing, or business rules here.
- Do not remove accessibility attributes from Radix/shadcn components.
