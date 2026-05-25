---
title: usehooks-ts Hook Usage
impact: HIGH
impactDescription: Prevents duplicate hook implementations and ensures consistent, tested hook patterns across the codebase.
tags: hooks, usehooks-ts, react, typescript, custom-hooks
---

## usehooks-ts Hook Usage

**Impact: HIGH (Avoid reinventing hooks that already exist in a well-tested library)**

This project uses [usehooks-ts](https://usehooks-ts.com) as the canonical source for common React hooks. It is fully tree-shakable, written in TypeScript, and covers the vast majority of utility hook use cases. Always check this library before writing a manual hook.

**Incorrect (reinventing hooks that usehooks-ts already provides):**

```tsx
// ❌ Hand-rolling a debounce hook when useDebounceValue / useDebounceCallback exist
function useDebounce<T>(value: T, delay: number) { ... }

// ❌ Hand-rolling a local-storage hook
function useLocalStorage<T>(key: string, initial: T) { ... }

// ❌ Hand-rolling a media query hook
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => { ... }, [])
  return isMobile
}

// ❌ Hand-rolling a click-outside hook
function useClickOutside(ref, handler) { ... }
```

**Correct (import from usehooks-ts, write manual hooks only when necessary):**

```tsx
// ✅ Use library hooks for covered use cases
import { useDebounceValue } from "usehooks-ts"
import { useDebounceCallback } from "usehooks-ts"
import { useLocalStorage } from "usehooks-ts"
import { useMediaQuery } from "usehooks-ts"
import { useOnClickOutside } from "usehooks-ts"
import { useToggle } from "usehooks-ts"
import { useBoolean } from "usehooks-ts"
import { useCounter } from "usehooks-ts"
import { useWindowSize } from "usehooks-ts"
import { useEventListener } from "usehooks-ts"
import { useIsClient } from "usehooks-ts"
import { useIsMounted } from "usehooks-ts"
import { useInterval } from "usehooks-ts"
import { useTimeout } from "usehooks-ts"
import { useCopyToClipboard } from "usehooks-ts"
import { useScrollLock } from "usehooks-ts"
import { useIntersectionObserver } from "usehooks-ts"
import { useResizeObserver } from "usehooks-ts"
import { useDocumentTitle } from "usehooks-ts"
import { useSessionStorage } from "usehooks-ts"
import { useReadLocalStorage } from "usehooks-ts"
```

### When to Write a Manual Hook

Write a hook in `src/hooks/` only when **all** of these are true:

1. No equivalent exists in usehooks-ts ([check the full list](https://usehooks-ts.com/introduction))
2. The logic is **domain-specific** to this app (e.g. socket event subscriptions, auth session checks, API query wrappers)
3. The hook would be reused across **2+ components**

| Scenario | Action |
|----------|--------|
| Generic browser/DOM utility | Use `usehooks-ts` |
| Generic state utility (toggle, counter, boolean) | Use `usehooks-ts` |
| App-specific API query | Write in `src/hooks/api/` |
| App-specific socket/session logic | Write in `src/hooks/` |
| Wraps a usehooks-ts hook with app defaults | Write in `src/hooks/` and compose internally |

### Currently Used Custom Hooks

| Hook | Location | Purpose |
|------|----------|---------|
| `useDebounce` | `src/hooks/use-debounce.ts` | Debounce a value (consider migrating to `useDebounceValue`) |
| `useThrottle` | `src/hooks/use-throttle.ts` | Throttle a value (no equivalent in usehooks-ts) |
| `useSessionCheck` | `src/hooks/use-session-check.ts` | App-specific auth session validation |

### Manual Hook File Conventions

```
src/hooks/
  use-{name}.ts          # Generic hooks
  api/
    {domain}.ts          # TanStack Query wrappers (auth, user, message, etc.)
```

- File name: `use-kebab-case.ts`
- Export name: `useKebabCase` (named export, no default)
- Place API/query hooks under `src/hooks/api/`
- Keep each file focused on a single concern

### Installing usehooks-ts

```bash
npm install usehooks-ts
```

Reference: [usehooks-ts documentation](https://usehooks-ts.com/introduction)
