---
title: Function Components Only
impact: HIGH
impactDescription: Single component model; hooks compose; class-lifecycle bugs are impossible.
tags: react, components, classes, function-components
---

## Function Components Only

**Impact: HIGH (Class components are incompatible with hooks, Suspense data, and the React 19 compiler)**

Every component in this codebase is a function component. Class components, `React.PureComponent`, `React.Component`, and any lifecycle methods (`componentDidMount`, `shouldComponentUpdate`, etc.) are banned. The only sanctioned legacy primitive is a third-party error boundary if one is ever needed (e.g., `react-error-boundary`), and even that is wrapped behind a tiny function component.

Function components compose via hooks. Class components cannot consume hooks, do not work with the React Compiler's memoization, and split logic across lifecycle methods instead of co-locating it.

**Incorrect:**

```tsx
import React from "react";

export class ExampleList extends React.Component<Props, State> {
  state = { selectedId: null as string | null };

  componentDidMount() {
    this.props.onMount?.();
  }

  shouldComponentUpdate(nextProps: Props) {
    return nextProps.items !== this.props.items;
  }

  render() {
    return this.props.items.map((item) => …);
  }
}

class ExampleButton extends React.PureComponent<ExampleButtonProps> { … }
```

**Correct:**

```tsx
import * as React from "react";

type Props = {
  items: readonly Example[];
  onMount?: () => void;
};

export function ExampleList({ items, onMount }: Props) {
  React.useEffect(() => {
    onMount?.();
  }, [onMount]);

  return (
    <ul>
      {items.map((item) => (
        <ExampleItem key={item.id} item={item} />
      ))}
    </ul>
  );
}

import { ErrorBoundary } from "react-error-boundary";

export function ExampleErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary fallback={<ExampleErrorFallback />}>{children}</ErrorBoundary>;
}
```

**Conventions:**
- Components are declared with the `function` keyword (`export function Foo() { … }`), not arrow assignment. Function declarations hoist, have stable `name`, and read better in stack traces.
- No `React.FC` / `React.FunctionComponent` types — type props explicitly and let the return type be inferred.
- Lifecycle equivalents:
  - `componentDidMount` → `useEffect(fn, [])`.
  - `componentDidUpdate` → `useEffect(fn, [deps])`.
  - `componentWillUnmount` → return a cleanup function from `useEffect`.
  - `shouldComponentUpdate` → let the React Compiler handle memo; if explicit, use `React.memo` only with measured evidence.
- Error boundaries: use the `react-error-boundary` package wrapped in a thin function component. Do not write a class boundary by hand.
- Refs: use `React.useRef<T>(null)` — never `React.createRef` outside of class components (and we don't write those).

Reference: [React docs — Function Components](https://react.dev/reference/react/Component#alternatives)
