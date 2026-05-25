---
title: Route Guards Live At The Route Tree
impact: HIGH
impactDescription: Auth checks are centralized; pages stay unaware of authentication; no duplicate redirects.
tags: routing, auth, guards, protected-route, navigation
---

## Route Guards Live At The Route Tree

**Impact: HIGH (Auth-in-page logic gets duplicated across every page and is impossible to keep consistent)**

Authentication and authorization decisions belong in **wrapper routes** — `<ProtectedRoute />` (requires a session) and `<GuestRoute />` (requires *no* session) — declared once at the route tree level. Pages never call `useNavigate` to redirect on auth, never check `token` in a `useEffect`, and never render a login redirect themselves. They render their feature template and trust the route hierarchy.

The same pattern extends to **feature-scoped providers** that must wrap a subset of routes (e.g., a `<ExampleSocketRouteBoundary />` mounts a WebSocket only for example routes). Use `<Outlet />`-based wrapper routes for that, not in-page logic.

**Incorrect (every page reinvents the guard):**

```tsx
export function ExamplePage() {
  const navigate = useNavigate();
  const token = useExampleAuthStore((s) => s.token);

  React.useEffect(() => {
    if (!token) navigate(EXAMPLE_ROUTES.signIn, { replace: true });
  }, [token, navigate]);

  if (!token) return null;

  return <ExampleTemplate />;
}

export function SignInPage() {
  const navigate = useNavigate();
  const token = useExampleAuthStore((s) => s.token);

  if (token) {
    navigate(EXAMPLE_ROUTES.home, { replace: true });
    return null;
  }

  return <SignInTemplate />;
}
```

**Correct (guard at the route; page is one line):**

```tsx
export function ProtectedRoute() {
  const { token, isCheckingSession } = useSessionCheck();

  if (isCheckingSession) return <RouteGuardLoading />;
  if (!token) return <Navigate to={EXAMPLE_ROUTES.signIn} replace />;
  return <Outlet />;
}

export function GuestRoute() {
  const token = useExampleAuthStore((s) => s.token);
  if (token) return <Navigate to={EXAMPLE_ROUTES.home} replace />;
  return <Outlet />;
}

<Routes>
  <Route element={<GuestRoute />}>
    <Route path={EXAMPLE_ROUTES.signIn} element={<SignInPage />} />
    <Route path={EXAMPLE_ROUTES.signUp} element={<SignUpPage />} />
  </Route>

  <Route element={<ProtectedRoute />}>
    <Route element={<ExampleRouteBoundary />}>
      <Route path={EXAMPLE_ROUTES.home} element={<ExamplePage />} />
      <Route path={EXAMPLE_ROUTES.exampleById} element={<ExamplePage />} />
    </Route>
  </Route>
</Routes>;

export function ExamplePage() {
  return <ExampleTemplate />;
}
```

**Conventions:**
- The only auth-related code in a page is **none**. Guards run before the page mounts.
- Guards render either `<Outlet />` (allow), `<Navigate to={…} replace />` (block + redirect), or a loading shell (`<RouteGuardLoading />` while the session check is in flight). They never render the feature.
- `replace` is mandatory on auth redirects — the user must not be able to "Back" their way into a route they were just kicked out of.
- Feature-scoped providers (sockets, feature flags, presence) follow the **same** pattern: a wrapper component that renders `<Outlet />` under a context provider, declared in the route tree.
- For role-based gating (admin-only routes, etc.), add a second wrapper (`<AdminRoute />`) — never inline `if (user.role !== "admin") return null` inside a page.
- A guard that needs to read URL params uses `useParams()` / `useLocation()`. Use `matchPath` to conditionally activate providers based on the matched path.

Reference: [React Router v7 — Nested Routes](https://reactrouter.com/start/declarative/routing#nested-routes)
