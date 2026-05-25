---
title: TanStack Query v5 Object Arguments & Explicit Query Keys
impact: HIGH
impactDescription: Prevents runtime crashes and ensures predictable caching behavior in React 19.
tags: tanstack-query, react, fetch
---

## TanStack Query v5 Object Arguments & Explicit Query Keys

**Impact: HIGH (Prevents syntax errors and caching bugs)**

Starting from TanStack Query v5, all `useQuery` calls strictly require a single object argument. Passing separate arguments (the v4 syntax) will cause runtime errors. Furthermore, the `queryKey` must always be an array to ensure the caching engine accurately tracks dependencies.

**Incorrect (Using legacy v4 syntax or manual useEffect fetching):**

```typescript
// ❌ v4 style: separate positional arguments — causes runtime error in v5
useQuery(queryKeys.list(queries), () => exampleService.getAllExample(queries), {
  staleTime: 1000,
});

// ❌ queryKey is a string, not an array — breaks cache invalidation
useQuery({
  queryKey: "example",
  queryFn: () => exampleService.getAllExample(queries),
});

// ❌ queryFn invoked immediately instead of passed as a function reference
// exampleService.getAllExample(queries) executes now and returns a Promise,
// not a () => Promise. TanStack Query will not be able to re-invoke it.
useQuery({
  queryKey: exampleQueryKeys.list(queries),
  queryFn: exampleService.getAllExample(queries),
  ...options,
});

// ❌ ...options spread before queryKey/queryFn — options can silently override them
useQuery({
  ...options,
  queryKey: exampleQueryKeys.list(queries),
  queryFn: () => exampleService.getAllExample(queries),
});

// ❌ Manual fetch with useEffect — no caching, deduplication, or stale handling
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
useEffect(() => {
  setLoading(true);
  exampleService.getAllExample(queries).then((res) => {
    setData(res);
    setLoading(false);
  });
}, [queries]);
```

**Correct (v5 object syntax, array queryKey, function reference for queryFn):**

```typescript
const exampleQueryKeyFactory = queryKeysFactory<"example">("example");

export const exampleQueryKeys = {
  ...exampleQueryKeyFactory,
  list: (queries: PaginationRequest) =>
    exampleQueryKeyFactory.list({ name: "example", query: queries }),
};

export function useExampleQuery(
  queries: PaginationRequest,
  options?: UseQueryOptionsWrapper<BaseResponse<Example>>,
) {
  return useQuery({
    queryKey: exampleQueryKeys.list(queries),
    queryFn: () => exampleService.getAllExample(queries),
    ...options,
  });
}
```

Reference: [TanStack Query v5 Migrating to Object Arguments](https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5)
