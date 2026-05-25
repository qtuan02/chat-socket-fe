---
title: Prefer Named Exports
impact: MEDIUM
impactDescription: Refactoring tools follow renames; no import-site drift.
tags: exports, named, default, imports
---

## Prefer Named Exports

**Impact: MEDIUM (One canonical import name; refactoring tools follow the rename)**

Every module exports its public surface as named exports. Default exports are silently renameable at the import site, which fragments grep results and breaks IDE rename-symbol across the project. The single documented exception is the store hook (`src/stores/useXxxStore.ts`) — that pattern exists, is enforced, and must not spread to anything else (components, hooks, services, utilities, types, constants).

**Incorrect:**

```typescript
export default function ExampleForm() { … }

export default { signIn, signUp, signOut };

import LoginForm from "@/features/example/components/example-form";
import AuthSvc from "@/services/auth-service";

const EXAMPLE_ROUTES = { home: "/" } as const;
export default EXAMPLE_ROUTES;
```

**Correct:**

```typescript
export function ExampleForm() { … }

export const exampleService = {
  list,
  get,
  create,
  update,
  remove,
};

import { ExampleForm } from "@/features/example/components/example-form";
import { exampleService } from "@/services/example-service";

export const EXAMPLE_ROUTES = { … } as const;

import useExampleStore from "@/stores/useExampleStore";
```

**Conventions:**
- React components: `export function ComponentName(props: ComponentNameProps) { … }`.
- Hooks: `export function useXxx(…) { … }`.
- Services: `export const xxxService = { … }` (object literal).
- Types: `export type Xxx = …` / `export interface Xxx { … }`.
- Constants: `export const XXX = … as const`.
- Default exports allowed only for store hooks — `export default useXxxStore;`. The default-export form is part of the established store convention; named-export stores break consumers that expect the default form.
- `React.lazy` requires a default export at the dynamic import target — wrap the named export inline: `React.lazy(async () => { const m = await import("…"); return { default: m.NamedExport }; });`.
- Do not create barrel files (`index.ts` that re-exports everything in a folder). Barrels break tree-shaking and create import-order ambiguities — see `architecture-data-flow.md`.

Reference: [Basarat — Avoid default exports](https://basarat.gitbook.io/typescript/main-1/defaultisbad)
