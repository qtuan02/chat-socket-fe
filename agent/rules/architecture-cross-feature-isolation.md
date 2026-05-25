---
title: Cross-Feature Isolation
impact: HIGH
impactDescription: Features stay deletable, shippable independently, and free of hidden coupling.
tags: architecture, features, isolation, boundaries, modularity
---

## Cross-Feature Isolation

**Impact: HIGH (Hidden cross-feature coupling is the leading cause of "I touched X and Y broke")**

Features under `src/features/<feature>` must not reach into each other's internals. If feature `alpha` needs something from feature `beta`, it imports the **public surface** only: a top-level template, a top-level exported hook, or a shared type from `src/types/*`. Importing `@/features/beta/components/beta-internal-row` from inside `alpha/` is a violation — it creates an implicit "if you change this file you might break that feature" link that no tool can detect.

When two features genuinely need the same component or hook, **promote** it to the appropriate shared technical folder (`src/components/`, `src/hooks/`, `src/utils/`, `src/types/`) — not into an arbitrary "other" feature.

**Incorrect (alpha reaching into beta's internals):**

```typescript
import { BetaInternalRow } from "@/features/beta/components/beta-internal-row";
import { useBetaInternalActions } from "@/features/beta/hooks/use-beta-internal-actions";

import { useAlphaTemplate } from "@/features/alpha/templates/alpha-template";

import { GammaInternalSection } from "@/features/gamma/components/gamma-internal-section";
import { useAlphaCurrentItem } from "@/features/alpha/hooks/use-alpha-current-item";
```

**Correct (shared types/hooks, or compose at the page/template level):**

```typescript
import type { Example, ExampleTypeEnum } from "@/types/example";
import { useExamplesQuery } from "@/hooks/api/example";
import { Button } from "@/components/ui/button";

import { AlphaTemplate } from "@/features/alpha/templates/alpha-template";

import { BetaTemplate } from "@/features/beta/templates/beta-template";
import { AlphaTemplate } from "@/features/alpha/templates/alpha-template";

export function ExamplePage() {
  const location = useLocation();
  return location.pathname === EXAMPLE_ROUTES.beta
    ? <BetaTemplate />
    : <AlphaTemplate />;
}
```

**Conventions:**
- A feature's public surface is everything directly under `templates/` plus any explicitly-promoted exports listed in that feature's README. Treat everything else as private.
- If you want to import a deeply-nested feature file from another feature, that is a signal to promote the file:
  - Component used by two features → move to `src/components/` (if generic) or refactor both features.
  - Hook used by two features → move to `src/hooks/` (if generic) or `src/hooks/api/` (if entity-shaped).
  - Type used by two features → move to `src/types/`.
  - Util used by two features → move to `src/utils/`.
- Page composition is the right place to mix features (`src/pages/*` can render `AlphaTemplate`, `BetaTemplate`, etc., depending on the route).
- Cross-feature communication at runtime goes through:
  - **Server state**: the data-cache library (TanStack Query / SWR / RTK Query) + cache-key invalidation.
  - **Client state**: stores in `src/stores/*`.
  - **Routing state**: route constants and `useNavigate` / `useParams`.
  - Never via direct component-to-component prop drilling across features.
- A single PR that creates `@/features/alpha/utils/foo.ts` and imports it from `@/features/beta/…` must be rejected — promote it first.

Reference: [Feature-Sliced Design — Layers](https://feature-sliced.design/docs/get-started/overview#layers)
