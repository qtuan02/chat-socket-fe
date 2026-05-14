# Page Rules

These rules apply to `src/pages`.

## Purpose

`src/pages` contains route-level page files. Treat pages like framework route files: small, predictable, and mostly composition.

## Rules

- A page should usually import and render one template from `src/features/<feature>/templates`.
- Keep route wiring, route params, and layout-level composition here.
- Do not put API calls, socket subscriptions, complex forms, or large UI sections in pages.
- Do not create reusable UI inside pages.
- Do not import one page from another page unless defining route composition explicitly.

## Example

```tsx
import { SignInTemplate } from "@/features/auth/templates/sign-in-template";

export function SignInPage() {
  return <SignInTemplate />;
}
```

## Naming

- File: `<screen>-page.tsx`.
- Export: `<Screen>Page`.
- Do not name page files with PascalCase, even when the exported component is PascalCase.
- Use `auth` instead of `authen`.

Examples:

- `sign-in-page.tsx` exports `SignInPage`.
- `chat-page.tsx` exports `ChatPage`.
- `settings-page.tsx` exports `SettingsPage`.

Bad:

- `SignInPage.tsx`
- `ChatPage.tsx`

## Avoid

- Do not place templates in `src/pages`.
- Do not place feature-only UI in `src/pages`.
- Do not hardcode route strings when `src/config/routes.ts` exists.
