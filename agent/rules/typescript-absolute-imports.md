---
title: Absolute Imports via `@/` Alias
impact: MEDIUM
impactDescription: Stable imports across moves; no `../../../..` traversal.
tags: imports, alias, path, refactoring
---

## Absolute Imports via `@/` Alias

**Impact: MEDIUM (Cuts refactor noise; makes imports grep-able)**

`tsconfig.json` maps `@/*` to `./src/*`. Every cross-folder import must use that alias — never a parent-relative path (`../../foo`). The only place relative imports are allowed is inside the same feature, between sibling files (`./types/example-form`, `./components/example-form`). This makes file moves cheap (only the moved file's imports change) and lets reviewers identify cross-cutting reach at a glance.

**Incorrect:**

```typescript
import { Button } from "../../../components/ui/button";
import { useExampleStore } from "../../stores/useExampleStore";
import { EXAMPLE_API } from "../../../../config/routes";

import { Button } from "/src/components/ui/button";
import { Button } from "src/components/ui/button";

import { Example } from "../../../../../example/types/example";
```

**Correct:**

```typescript
import { Button } from "@/components/ui/button";
import useExampleStore from "@/stores/useExampleStore";
import { EXAMPLE_API } from "@/config/routes";

import { exampleFormSchema, type ExampleFormValues } from "./types/example-form";
import { ExampleForm } from "./components/example-form";

import type { Example } from "@/types/example";
import { useExampleSection } from "@/features/example/hooks/use-example-section";
```

**Conventions:**
- **Cross-folder** (going up at least one directory): always `@/…`.
- **Same-folder sibling** or **direct child folder**: relative `./foo`, `./components/foo`.
- Never reach into a feature from outside that feature except through its public surface (`templates/`, top-level component, public hook). See `architecture-cross-feature-isolation.md`.
- Never import from `node_modules` subpaths directly (`react/cjs/…`) — use the package root.
- Imports are sorted into three groups by the formatter: third-party first, then `@/…`, then relative. Do not fight the auto-sort manually.
- When moving a file, run `format:fix` to re-sort; verify with `tsc --noEmit` that no relative path silently broke.

Reference: [TypeScript — Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)
