---
title: TanStack Query v5 useInfiniteQuery Required Fields & Page Flattening
impact: HIGH
impactDescription: Prevents runtime crashes from missing initialPageParam and stale/broken pagination.
tags: tanstack-query, react, infinite-query, pagination
---

## TanStack Query v5 useInfiniteQuery Required Fields & Page Flattening

**Impact: HIGH (Prevents runtime errors and broken pagination)**

In TanStack Query v5, `useInfiniteQuery` requires two fields that were optional in v4: `initialPageParam` and `getNextPageParam`. The `queryFn` receives a `{ pageParam }` context argument — always destructure and pass it to the service call. Provide explicit generic type parameters so TypeScript can infer `InfiniteData` correctly. Use the `select` option to flatten `data.pages` — this is handled internally by TanStack Query and avoids manual `useMemo` boilerplate. Always accept an `options` parameter typed with `UseInfiniteQueryOptionsWrapper` so callers can customise `enabled`, `staleTime`, etc.

**Incorrect:**

```typescript
// ❌ Missing initialPageParam — required in v5, causes runtime error
useInfiniteQuery({
  queryKey: exampleQueryKeys.listInfinite(userId),
  queryFn: ({ pageParam }) => exampleService.getExamples({ cursor: pageParam }),
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
});

// ❌ queryFn ignores pageParam — always fetches first page, pagination is broken
useInfiniteQuery({
  queryKey: exampleQueryKeys.listInfinite(userId),
  queryFn: () => exampleService.getExamples({}),
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  initialPageParam: undefined,
});

// ❌ getNextPageParam missing — fetchNextPage will never advance
useInfiniteQuery({
  queryKey: exampleQueryKeys.listInfinite(userId),
  queryFn: ({ pageParam }) => exampleService.getExamples({ cursor: pageParam }),
  initialPageParam: undefined,
});

// ❌ Flattening pages inline in JSX — recomputes on every render
function ExampleList() {
  const { data } = useExampleInfiniteQuery();
  return (
    <ul>
      {data?.pages.flatMap((page) => page.items).map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}

// ❌ Manual useMemo to flatten pages — unnecessary boilerplate, use select instead
export function useExampleInfiniteQuery(params = {}) {
  const query = useInfiniteQuery({
    queryKey: exampleQueryKeys.listInfinite(params),
    queryFn: ({ pageParam }) => exampleService.getExamples({ ...params, cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
  });

  const examples = React.useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data?.pages],
  );

  return { ...query, examples };
}

// ❌ No options parameter — hook cannot be customised by callers (e.g. enabled, staleTime)
export function useExampleInfiniteQuery(params = {}) {
  return useInfiniteQuery({
    queryKey: exampleQueryKeys.listInfinite(params),
    queryFn: ({ pageParam }) => exampleService.getExamples({ ...params, cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
  });
}
```

**Correct:**

```typescript
const exampleQueryKeyFactory = queryKeysFactory<"example">("example");

export const exampleQueryKeys = {
  ...exampleQueryKeyFactory,
  listInfinite: (userId: string, params: ExampleListParams = {}) =>
    exampleQueryKeyFactory.list({ userId, ...params }),
};

// Explicit generic types: <TData, TError, TSelect, TQueryKey, TPageParam>
export function useExampleInfiniteQuery(
  params: Omit<ExampleListParams, "cursor"> = {},
  options?: UseInfiniteQueryOptionsWrapper<ExamplePage, Error, Example[]>,
) {
  const { data: currentUser } = useCurrentUserQuery();

  return useInfiniteQuery<
    ExamplePage,
    Error,
    Example[],
    ReturnType<typeof exampleQueryKeys.listInfinite>,
    string | undefined
  >({
    queryKey: exampleQueryKeys.listInfinite(currentUser?.id ?? "", params),
    queryFn: ({ pageParam }) =>
      exampleService.getExamples({
        ...params,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.nextCursor ?? undefined,
    initialPageParam: 10,
    enabled: !!currentUser?.id && (options?.enabled ?? true),
    select: (data) =>
      data.pages.flatMap((page) => page.items),
    ...options,
  });
}
```

Reference: [TanStack Query v5 Infinite Queries](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries)
