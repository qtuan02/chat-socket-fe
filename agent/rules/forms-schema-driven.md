---
title: Schema-Driven Forms (Zod + React Hook Form)
impact: HIGH
impactDescription: Single source of truth for validation, types, and runtime parsing.
tags: zod, react-hook-form, validation, forms, types
---

## Schema-Driven Forms (Zod + React Hook Form)

**Impact: HIGH (One schema drives validation, TypeScript types, and runtime checks)**

Every form must define its Zod schema in `src/features/<feature>/types/<form-name>-form.ts`, infer the TypeScript type with `z.infer`, and feed both into `react-hook-form` via `@hookform/resolvers/zod`. Schemas must trim string input *before* length checks so whitespace-only values fail validation. Never redeclare the form-value type with a hand-written interface — it will drift from the schema.

**Incorrect:**

```typescript
export const exampleFormSchema = z.object({
  name: z.string().min(1),
  password: z.string().min(6),
});

export interface ExampleFormValues {
  name: string;
  password: string;
}

name: z.string().min(1, { message: "Name is required." });

function ExampleForm() {
  const form = useForm({
    resolver: zodResolver(z.object({ name: z.string() })),
  });
}

const handleSubmit = (values: unknown) => {
  if (typeof values !== "object" || !values || !("name" in values)) return;
};

z.string().trim().min(1);
```

**Correct:**

```typescript
import { z } from "zod";

export const exampleFormSchema = z.object({
  name: z
    .string({ message: "Name is required." })
    .trim()
    .min(1, { message: "Name is required." }),
  password: z.string({ message: "Password is required." }).min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export type ExampleFormValues = z.infer<typeof exampleFormSchema>;
```

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  type ExampleFormValues,
  exampleFormSchema,
} from "@/features/example/types/example-form";

export function ExampleForm() {
  const form = useForm<ExampleFormValues>({
    resolver: zodResolver(exampleFormSchema),
    defaultValues: { name: "", password: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    updateExampleMutation.mutate(values);
  });

  return <form onSubmit={onSubmit}>{/* ... */}</form>;
}
```

**Conventions:**
- File location: `src/features/<feature>/types/<form-name>-form.ts`.
- Naming: schema is `<xxx>FormSchema`, inferred type is `<Xxx>FormValues`.
- Always pass `{ message: "..." }` to every validator and to the constructor for required errors — keep messages user-facing.
- String fields that must not be empty: `.string({ message }).trim().min(1, { message })` — the order matters; `.trim()` runs before length checks.
- Email: `.string({ message }).trim().email({ message })`.
- Password: `.string({ message }).min(6, { message })` — do not trim passwords.
- For cross-field rules (confirm password, etc.) use `.refine()` on the object — keep the rule in the schema file, not in the component.
- Always provide `defaultValues` to `useForm` (use empty strings, never `undefined`) — prevents uncontrolled-to-controlled warnings.

Reference: [Zod docs](https://zod.dev/), [React Hook Form + Zod](https://react-hook-form.com/get-started#SchemaValidation)
