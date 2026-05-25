---
title: Naming Conventions (Files & Symbols)
impact: MEDIUM
impactDescription: One canonical place to look for any symbol; predictable imports.
tags: naming, convention, style, files
---

## Naming Conventions (Files & Symbols)

**Impact: MEDIUM (One canonical place to look for any symbol)**

Every file, component, hook, store, service, type, and constant follows a single fixed pattern. File names are kebab-case. The exported symbol inside follows its role: components and types are `PascalCase`, hooks and functions are `camelCase` starting with `use…` / a verb, constants are `UPPER_SNAKE_CASE` for primitives or `camelCase` for object literals. Store hooks are the documented exception — they use `useXxxStore` and their file mirrors the hook identifier.

**Incorrect:**

```text
src/features/example/components/ExampleItem.tsx
src/features/example/components/exampleItem.tsx
src/features/example/hooks/useExampleAction.ts
src/features/example/types/Example.ts
src/stores/example-store.ts
src/utils/Error.ts
```

```typescript
export function exampleItem() { … }
export function UseExampleAction() { … }
export const Apiroutes = { home: "/" };

const ExampleForm = (props: exampleFormProps) => …;
```

**Correct:**

```text
src/features/example/components/example-item.tsx        → exports ExampleItem
src/features/example/hooks/use-example-action.ts        → exports useExampleAction
src/features/example/types/example-form.ts              → exports exampleFormSchema, ExampleFormValues
src/stores/useExampleStore.ts                           → exports default useExampleStore
src/utils/error.ts                                      → exports getErrorMessage
src/config/routes.ts                                    → exports EXAMPLE_ROUTES, EXAMPLE_API
```

```typescript
export function ExampleItem(props: ExampleItemProps) { … }
export function useExampleAction() { … }
export const EXAMPLE_ROUTES = { … } as const;
export const exampleQueryKeys = { … };

type ExampleFormProps = { className?: string };
export function ExampleForm({ className }: ExampleFormProps) { … }
```

**Conventions:**

| Artifact            | File name                       | Symbol name                            |
| ------------------- | ------------------------------- | -------------------------------------- |
| React component     | `kebab-case.tsx`                | `PascalCase`                           |
| Custom hook         | `use-kebab-case.ts`             | `useCamelCase`                         |
| Service             | `entity-service.ts`             | `entityService` (object literal)       |
| Store               | `useEntityStore.ts`             | `useEntityStore` (default export)      |
| Type / Interface    | `entity.ts` under `src/types/`  | `PascalCase`                           |
| Schema              | `<form>-form.ts`                | `xxxFormSchema`, `XxxFormValues`       |
| Cache-key factory   | colocated in hook file          | `xxxQueryKeys` / `xxxCacheKeys`        |
| Constant primitive  | n/a                             | `UPPER_SNAKE_CASE`                     |
| Constant object     | n/a                             | `camelCase` or `UPPER_SNAKE_CASE`      |
| Props type          | inside component file           | `XxxProps`                             |
| Event handler prop  | n/a                             | `onXxx` (caller), `handleXxx` (callee) |

- One default export per file only for store hooks. Everything else uses named exports.
- A file's main export must match the file name (`example-item.tsx` exports `ExampleItem`, not `Item`).
- Boolean variables and props read as questions: `isOpen`, `hasUnread`, `canEdit`, `shouldClosePicker`. Never `open`, `unread`, `edit`.
- Acronyms in PascalCase are written like words (`Api`, `Url`, `Http`, `Id`), not `API`, `URL`, `HTTP`, `ID`.

Reference: [Google TypeScript Style Guide — Naming](https://google.github.io/styleguide/tsguide.html#identifiers)
