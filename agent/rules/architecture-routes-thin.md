---
title: Thin Routes, Thick Templates
impact: HIGH
impactDescription: Routes stay one-liners; features stay independently mountable and testable.
tags: architecture, pages, templates, routing
---

## Thin Routes, Thick Templates

**Impact: HIGH (Decouples routing from feature internals; keeps features storybook-able and route-agnostic)**

Files in `src/pages/*` exist for one reason only: to bind a route to a feature template, optionally with route-guard providers. They must contain no business logic, no state, no data fetching, no JSX layout beyond the template invocation. The actual feature lives inside `src/features/<feature>/templates/<feature>-template.tsx`, which is the composition root that wires the feature's components, hooks, and stores together.

This separation lets the same template be reused under multiple routes, mounted under different layouts, or rendered standalone in tests and Storybook.

**Incorrect (logic and data fetching in the page):**

```tsx
export function ExamplePage() {
  const { data: items, isLoading } = useExamplesQuery({ userId });
  const [selectedId, setSelectedId] = React.useState<string>();
  const token = useExampleStore((s) => s.token);

  React.useEffect(() => {
    if (!token) navigate(EXAMPLE_ROUTES.signIn);
  }, [token]);

  return (
    <div className="grid h-screen grid-cols-[320px_1fr]">
      <aside>
        <ExampleList items={items} onSelect={setSelectedId} />
      </aside>
      <main>
        <ExampleDetail itemId={selectedId} />
      </main>
    </div>
  );
}
```

**Correct (page = guard + template; template = composition):**

```tsx
import { ExampleTemplate } from "@/features/example/templates/example-template";

export function ExamplePage() {
  return <ExampleTemplate />;
}
```

```tsx
export function ExampleTemplate() {
  const { items, isLoading } = useExampleSection();
  const [selectedId, setSelectedId] = React.useState<string>();

  return (
    <div className="grid h-screen grid-cols-[320px_1fr]">
      <ExampleSidebar items={items} isLoading={isLoading} onSelect={setSelectedId} />
      <ExampleDetail itemId={selectedId} />
    </div>
  );
}
```

```tsx
<Routes>
  <Route element={<ProtectedRoute />}>
    <Route path={EXAMPLE_ROUTES.example} element={<ExamplePage />} />
    <Route path={EXAMPLE_ROUTES.exampleById} element={<ExamplePage />} />
  </Route>
</Routes>;
```

**Conventions:**
- A `Page` component body is at most ~10 lines and contains: an optional layout shell that is route-shared, and one template call.
- Templates orchestrate, components render. A template may use hooks (`use…`), store selectors, and data hooks; components ideally receive props.
- Templates are named `<feature>-template.tsx` (e.g., `example-template.tsx`, `sign-in-template.tsx`) and live under `src/features/<feature>/templates/`.
- Route guards (`<ProtectedRoute />`, `<GuestRoute />`) and providers are wired at the route tree, **not** inside individual pages.
- The same page file may render different templates based on `useLocation()` — that is allowed and is the route's job, not the template's.
- If a page grows past a one-liner, the new logic almost always belongs in a feature template or a feature hook.

Reference: [React Router — Routing](https://reactrouter.com/start/declarative/routing)
