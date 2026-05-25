---
title: Never Define Components Inside Other Components
impact: CRITICAL
impactDescription: Inline component declarations remount on every parent render — state is lost, refs flap, effects refire.
tags: react, components, render, performance, lifecycle
---

## Never Define Components Inside Other Components

**Impact: CRITICAL (Inline component definitions break component identity; every render mounts a fresh tree)**

A component declared inside the render body of another component is a new function reference every render. React identifies components by reference; a new reference means React tears down the entire subtree (unmount → mount), throwing away local state, refs, effects, and animations. This is one of the most expensive and most invisible bugs in React — it does not error, it just makes everything subtly broken.

Lift the inner component to module scope. If it truly needs values from the parent, take them as **props**. If it needs to share state, lift the state up or use context.

**Incorrect (every render of `ExampleTemplate` remounts `Header` and `EmptyState`):**

```tsx
export function ExampleTemplate() {
  const current = useExampleCurrent();
  const [search, setSearch] = React.useState("");

  function Header() {
    return (
      <header>
        <h1>{current?.title}</h1>
        <input value={search} onChange={(e) => setSearch(e.target.value)} />
      </header>
    );
  }

  const EmptyState = () => <p className="text-muted-foreground">No items yet</p>;

  return (
    <div>
      <Header />
      {current ? <ExampleDetail /> : <EmptyState />}
    </div>
  );
}
```

**Correct (components at module scope; parent state passed in as props):**

```tsx
type HeaderProps = {
  title: string | undefined;
  search: string;
  onSearchChange: (next: string) => void;
};

function Header({ title, search, onSearchChange }: HeaderProps) {
  return (
    <header>
      <h1>{title}</h1>
      <input value={search} onChange={(e) => onSearchChange(e.target.value)} />
    </header>
  );
}

function EmptyState() {
  return <p className="text-muted-foreground">No items yet</p>;
}

export function ExampleTemplate() {
  const current = useExampleCurrent();
  const [search, setSearch] = React.useState("");

  return (
    <div>
      <Header title={current?.title} search={search} onSearchChange={setSearch} />
      {current ? <ExampleDetail /> : <EmptyState />}
    </div>
  );
}
```

**Conventions:**
- A component is anything that returns JSX and starts with a capital letter. Every such function must be declared at module scope — never inside another component, hook, callback, conditional, or `.map()`.
- Render helpers that return JSX **and are only called in one place** are acceptable as plain inline JSX assigned to a variable:
  ```tsx
  const headerNode = current ? <h1>{current.title}</h1> : null;
  ```
  That is JSX, not a component, and is fine.
- If a helper takes props and is reused, promote it to a real component at module scope.
- If a helper needs `useState`/`useEffect`, it is a component, not a helper — promote it.
- Components inside `.map()` are called via JSX (`<Row item={item} />`), not by invoking the function (`Row({ item })`). Invoking it as a function bypasses React's reconciliation and creates the same identity bug.
- For tightly-coupled subcomponents used only by one parent, colocate them in the same file, just above or below the parent — still at module scope.

Reference: [React docs — Defining a component](https://react.dev/learn/your-first-component#nesting-and-organizing-components)
