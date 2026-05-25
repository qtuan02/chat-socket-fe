---
title: Feature-Based Folder Structure
impact: CRITICAL
impactDescription: Code that changes together lives together; new engineers find features in one place.
tags: architecture, structure, features, folder
---

## Feature-Based Folder Structure

**Impact: CRITICAL (Determines where every new file goes; sets the dependency direction of the app)**

The project is split into two top-level realms: **technical** folders (`components/ui`, `hooks`, `libs`, `services`, `stores`, `types`, `utils`, `config`, `providers`) that contain reusable, framework-shaped code, and the **feature** realm (`src/features/<feature>`) that contains everything specific to a product capability. A feature is self-contained: its components, hooks, types, and templates live next to each other under one folder. Pages (`src/pages`) are thin wrappers that mount a single feature template behind a route.

**Incorrect (feature-specific code dumped into shared folders):**

```text
src/
  components/
    example-form.tsx              ← feature-specific component in shared folder
    example-item.tsx
    example-list.tsx
  hooks/
    use-example-section.ts        ← feature hook in shared folder
    use-example-actions.ts
  types/
    example-form.ts               ← feature schema in shared types
  pages/
    example-page.tsx              ← page contains 400 lines of feature composition
```

```typescript
import { ExampleItem } from "@/components/example-item";
import { useExampleSection } from "@/hooks/use-example-section";
```

**Correct (feature folder is self-contained; shared folders are framework-shaped):**

```text
src/
  components/
    ui/                            ← design-system primitives only (Button, Dialog, …)
  hooks/
    api/                           ← entity-shaped data hooks (per backend resource)
    use-debounce.ts                ← framework-shaped, truly generic
    use-throttle.ts
  features/
    example/
      components/                  ← <ExampleForm />, <ExampleItem />, <ExampleList />
      hooks/                       ← useExampleSection, useExampleActions, …
      templates/                   ← <ExampleTemplate />
      types/                       ← exampleFormSchema + ExampleFormValues
      utils/                       ← feature-local helpers (rare)
  pages/
    example-page.tsx               ← <ProtectedRoute /> + <ExampleTemplate />
    sign-in-page.tsx               ← <SignInTemplate />
```

```typescript
import { ExampleTemplate } from "@/features/example/templates/example-template";

export function ExamplePage() {
  return <ExampleTemplate />;
}
```

**Conventions:**
- A feature folder always has at minimum `components/` and `templates/`. Add `hooks/`, `types/`, `utils/` only when at least one file needs to live there.
- The "feature" boundary follows the product noun, not the technical concept. `example`, `auth`, `billing`, `dashboard` are features. `forms`, `lists`, `modals` are component categories — **not** features.
- `components/<sub-area>/` is allowed inside a large feature. Keep it one level deep.
- Anything under `src/{components,hooks,libs,services,stores,types,utils,config,providers}` must be feature-agnostic. If it imports from `@/features/*`, it is in the wrong place.
- Pages are always thin: `<Guard><FeatureTemplate /></Guard>`. No business logic, no state, no data fetching in `src/pages/*`.
- New feature checklist: create the folder, add the template, add the page wrapper, add the route to `EXAMPLE_ROUTES`, wire it in the route tree.

Reference: [Bulletproof React — Project Structure](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)
