---
title: TanStack Query v5 useMutation Object Arguments & Type-Safe Options
impact: HIGH
impactDescription: Prevents runtime crashes, type errors, and accidental override of mutationFn.
tags: tanstack-query, react, mutation
---

## TanStack Query v5 useMutation Object Arguments & Type-Safe Options

**Impact: HIGH (Prevents runtime errors and silent option overrides)**

In TanStack Query v5, `useMutation` requires a single object argument. The `mutationFn` must always be a function reference or an arrow function — never an immediately-invoked call. Always use `UseMutationOptionsWrapper` to type the `options` parameter (it omits `mutationFn` and `mutationKey` so callers cannot accidentally override them). Spread `...options` after `mutationFn` so that caller options cannot replace it.

**Incorrect:**

```typescript
// ❌ v4 style: separate positional arguments — causes runtime error in v5
useMutation(mutationFn, {
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["example"] }),
});

// ❌ mutationFn called immediately — returns a Promise value, not a function
useMutation({
  mutationFn: exampleService.createExample(payload),
  ...options,
});

// ❌ ...options spread before mutationFn — caller options can silently override mutationFn
useMutation({
  ...options,
  mutationFn: exampleService.createExample,
});

// ❌ Raw UseMutationOptions exposes mutationFn — callers can override it
export function useCreateExampleMutation(
  options?: UseMutationOptions<Example, Error, CreateExamplePayload>,
) {
  return useMutation({
    mutationFn: exampleService.createExample,
    ...options,
  });
}

// ❌ Inline async call instead of mutation hook — no loading/error state, no cache integration
const handleSubmit = async () => {
  await exampleService.createExample(payload);
  queryClient.invalidateQueries({ queryKey: ["example"] });
};
```

**Correct:**

```typescript
// Wrap UseMutationOptionsWrapper to omit mutationFn/mutationKey — callers cannot override them
export function useCreateExampleMutation(
  options?: UseMutationOptionsWrapper<CreateExamplePayload, Example, Error>,
) {
  return useMutation({
    mutationFn: exampleService.createExample,
    ...options,
  });
}

// With explicit generic types and lifecycle hooks for optimistic updates
export function useUpdateExampleMutation(
  options?: UseMutationOptionsWrapper<
    { id: string; payload: UpdateExamplePayload },
    Example,
    Error,
    ExampleMutationContext
  >,
) {
  return useMutation<
    Example,
    Error,
    { id: string; payload: UpdateExamplePayload },
    ExampleMutationContext
  >({
    mutationFn: ({ id, payload }) =>
      exampleService.updateExample(id, payload),
    ...options,
  });
}
```

Reference: [TanStack Query v5 useMutation](https://tanstack.com/query/latest/docs/framework/react/reference/useMutation)
