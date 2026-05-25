---
title: Type-Only Imports (`verbatimModuleSyntax`)
impact: HIGH
impactDescription: Smaller bundles; zero runtime side effects from pure-type files; required by the compiler under `verbatimModuleSyntax`.
tags: typescript, imports, verbatim-module-syntax, tree-shaking
---

## Type-Only Imports (`verbatimModuleSyntax`)

**Impact: HIGH (Mandatory under `verbatimModuleSyntax: true`; prevents runtime imports of type-only modules)**

`tsconfig.json` should enable `verbatimModuleSyntax`, which means TypeScript emits imports *exactly* as written. Symbols used only in type positions must be imported with `import type` (or marked with an inline `type` keyword in a named import); otherwise the bundler will pull in the source module at runtime even though no value is consumed, and the compiler will error. Mixing values and types in one statement is fine — use the inline `type` modifier per binding.

**Incorrect:**

```typescript
import { Example, GetExampleParams } from "@/types/example";
import { exampleService } from "@/services/example-service";

export function useExample(params: GetExampleParams) {
  return useExampleQuery<Example[]>({ queryFn: () => exampleService.list(params) });
}

import { ExampleFormValues, exampleFormSchema } from "./types/example-form";
const form = useForm<ExampleFormValues>({ resolver: zodResolver(exampleFormSchema) });

import { FC, ReactNode } from "react";
export const Layout: FC<{ children: ReactNode }> = ({ children }) => <div>{children}</div>;
```

**Correct:**

```typescript
import type { Example, GetExampleParams } from "@/types/example";
import { exampleService } from "@/services/example-service";

export function useExample(params: GetExampleParams) {
  return useExampleQuery<Example[]>({ queryFn: () => exampleService.list(params) });
}

import { exampleFormSchema, type ExampleFormValues } from "./types/example-form";
const form = useForm<ExampleFormValues>({ resolver: zodResolver(exampleFormSchema) });

import * as React from "react";
export function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
```

**Conventions:**
- **Pure type module** (only types, no values): `import type { … } from "…"`.
- **Mixed module** (some values, some types): one statement, use inline `type` modifier on the type bindings: `import { foo, type Foo } from "…"`.
- React: prefer `import * as React from "react"` and reference `React.ReactNode`, `React.RefObject<T>`, `React.FormEvent<T>` — avoids per-type imports and clearly marks them as type-only.
- Never write `import type` for a value you also call at runtime — the bundler will tree-shake it away and you'll get `undefined is not a function`.
- The linter/formatter (`organizeImports`) sorts but does not insert the `type` keyword — write it correctly the first time.

Reference: [TypeScript — `verbatimModuleSyntax`](https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax)
