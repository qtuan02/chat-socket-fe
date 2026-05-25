---
title: Centralized Route Constants
impact: HIGH
impactDescription: Single source of truth for paths; renaming a route is a one-file edit.
tags: routing, routes, constants, navigation, react-router
---

## Centralized Route Constants

**Impact: HIGH (Inline string paths drift; one canonical table prevents broken links forever)**

Every route path — both as a **route definition** in `<Route path={…}>` and as a **navigation target** in `<Link to={…}>`, `useNavigate()`, or `<Navigate to={…} />` — must come from a single constant table in `src/config/routes.ts` (e.g., `EXAMPLE_ROUTES`). For dynamic segments, the table exposes builder functions. String literals for routes are banned in any file outside `src/config/routes.ts`.

This rule applies to any router that takes string paths (React Router v7, TanStack Router, Wouter, etc.). The package in this stack is `react-router` (v7) — not `react-router-dom`.

**Incorrect (hard-coded paths everywhere):**

```tsx
import { Link, useNavigate } from "react-router";

<Route path="/sign-in" element={<SignInPage />} />
<Route path="/example/:exampleId" element={<ExamplePage />} />

<Link to="/sign-up">Sign up</Link>
<Link to={`/example/${example.id}`}>Open</Link>

const navigate = useNavigate();
navigate("/");
navigate(`/example/${id}`, { replace: true });

window.location.href = "/sign-in";
window.location.pathname = "/profile";
```

**Correct (paths flow from `EXAMPLE_ROUTES`):**

```tsx
import { Link, Navigate, useNavigate } from "react-router";
import { EXAMPLE_ROUTES } from "@/config/routes";

<Route path={EXAMPLE_ROUTES.signIn} element={<SignInPage />} />
<Route path={EXAMPLE_ROUTES.exampleById} element={<ExamplePage />} />

<Link to={EXAMPLE_ROUTES.signUp}>Sign up</Link>
<Link to={EXAMPLE_ROUTES.exampleByIdPath(example.id)}>Open</Link>

const navigate = useNavigate();
navigate(EXAMPLE_ROUTES.home);
navigate(EXAMPLE_ROUTES.exampleByIdPath(id), { replace: true });

<Navigate to={EXAMPLE_ROUTES.signIn} replace />;
```

**Conventions:**
- Route keys are **camelCase** semantic names (`home`, `signIn`, `signUp`, `example`, `exampleById`), not paths.
- Static paths are string values; dynamic paths come as **functions** (`exampleByIdPath(id)`) so the template `/example/:exampleId` is the **one** place that ever sees the segment placeholder.
- For `<Route path>` definitions, use the template form (`EXAMPLE_ROUTES.exampleById` = `"/example/:exampleId"`). For `<Link>` / `navigate` calls, use the builder (`EXAMPLE_ROUTES.exampleByIdPath(id)`).
- In React Router v7, import from `"react-router"` — not `"react-router-dom"`. The `dom` subpackage was removed.
- Never call `window.location.assign`, `window.location.href = …`, or read `window.location.pathname` for routing decisions. Use `useNavigate`, `useLocation`, `useParams`, `matchPath`.
- When adding a new route:
  1. Add the entry to `EXAMPLE_ROUTES` (static path or builder, or both).
  2. Add the `<Route>` element under the correct guard wrapper.
  3. Use the constant from every link and navigation that targets it.
- For query strings, use `useSearchParams()` — never hand-concatenate `"?foo=bar"`.

Reference: [React Router v7 — Routing](https://reactrouter.com/start/declarative/routing)
