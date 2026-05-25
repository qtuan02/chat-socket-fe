---
title: Default to Local State — Lift Only When Required
impact: HIGH
impactDescription: Keeps the global surface small; most state is read by exactly one component.
tags: state, local, global, useState, store
---

## Default to Local State — Lift Only When Required

**Impact: HIGH (Premature globalization is the single biggest cause of unintended re-renders and impossible-to-test components)**

Start every piece of state with `useState` in the component that owns it. Only lift it when you have proof of a need: another component needs to read or write it. Lifting goes in stages, and each stage has its own justification:

```
useState (component)
   │  another component in the same subtree needs to read it
   ▼
lift to nearest common parent → pass as props
   │  prop-drilling exceeds 2–3 levels, or many cousins read it
   ▼
React Context (provider near the boundary)   ← preferred for tree-scoped data
   │  the state is genuinely app-wide and read across unrelated trees
   ▼
Client store (Zustand)
```

Skipping straight to a global store for state that one component owns turns trivial bugs into cross-cutting debug sessions.

**Incorrect (everything in a global store):**

```typescript
interface UiStore {
  isProfileDialogOpen: boolean;
  setProfileDialogOpen: (v: boolean) => void;
  editorDraft: string;
  setEditorDraft: (v: string) => void;
  hoveredItemId: string | null;
  setHoveredItemId: (id: string | null) => void;
  isMenuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
}
```

```typescript
const isOpen = useUiStore((s) => s.isProfileDialogOpen);
const setIsOpen = useUiStore((s) => s.setProfileDialogOpen);
return <ExampleProfileDialog open={isOpen} onOpenChange={setIsOpen} />;
```

**Correct (right-sized scope per concern):**

```tsx
function ExampleProfileTrigger() {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Profile</Button>
      <ExampleProfileDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

function ExampleEditor() {
  const { value, handleValueChange } = useExampleEditorValue();
}

const token = useExampleAuthStore((s) => s.token);
```

**Conventions:**
- The first instinct for any new piece of state is `useState`. Resist anything else until two consumers exist.
- Lift state up **once** — to the nearest common parent — before considering context or a store.
- Context is the right answer when the state has a **tree-scoped lifetime** (current-route entity, current theme inside a section, current form state). Context is not a global store; it follows React's tree.
- A client store is reserved for app-wide, client-only, non-URL-derivable state. Almost nothing qualifies — keep this list short.
- URL-derivable state lives in the router. `useParams`, `useSearchParams`, and `useLocation` are state. Do not mirror them.
- "I might need this elsewhere later" is not a justification for premature globalization. Promote later if and when the second consumer actually appears.
- If you find yourself adding a store to make a component reset its child via state, the right fix is almost always a React `key` prop on the child (`<Child key={resetCounter} />`), not a store.

Reference: [React docs — Sharing State Between Components](https://react.dev/learn/sharing-state-between-components)
