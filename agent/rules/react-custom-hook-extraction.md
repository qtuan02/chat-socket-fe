---
title: Custom Hook Extraction — Logic Out, JSX In
impact: HIGH
impactDescription: Separates testable behaviour from layout; templates stay readable; logic stays reusable.
tags: react, custom-hooks, separation-of-concerns, architecture
---

## Custom Hook Extraction — Logic Out, JSX In

**Impact: HIGH (Hook extraction is the primary way to enforce logic/UI separation)**

When a component's render body starts mixing **logic** (state, effects, refs, mutations, derived values, event handlers) with **layout** (JSX), pull the logic into a custom hook. The component then becomes a near-pure mapping from a hook's return value to JSX. Each hook is a single-responsibility behaviour the component consumes.

A custom hook is the right abstraction when:

1. The logic spans 3+ refs/states/effects, or
2. The same logic appears in two components, or
3. The logic represents a named, reusable concept (`useDebounce`, `useSessionCheck`, `useExampleAutoSync`), or
4. The component file grows past ~150 lines.

**Incorrect (logic and JSX mixed in one giant body):**

```tsx
export function ExampleEditor({ example, onSaved }: Props) {
  const [value, setValue] = React.useState("");
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const saveMutation = useUpdateExampleMutation();

  const trimmed = value.trim();
  const isSaveBlocked = !trimmed || saveMutation.isPending;
  const actionLabel = saveMutation.isPending ? "Saving…" : "Save";

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) { … }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async () => {
    if (isSaveBlocked) return;
    setValue("");
    try { await saveMutation.mutateAsync({ example, value: trimmed }); }
    catch (err) { setValue(trimmed); notify(getErrorMessage(err, "Save failed.")); }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }}>
      <textarea ref={inputRef} value={value} onChange={(e) => setValue(e.target.value)} />
      <button ref={triggerRef} onClick={() => setIsMenuOpen((v) => !v)}>⋯</button>
      {isMenuOpen && <Menu ref={menuRef} … />}
      <button type="submit" disabled={isSaveBlocked}>{actionLabel}</button>
    </form>
  );
}
```

**Correct (one composing hook; component is a thin view):**

```tsx
export function ExampleEditor({ example, onSaved }: Props) {
  const {
    value,
    isMenuOpen,
    isSaveBlocked,
    inputRef,
    menuRef,
    triggerRef,
    actionLabel,
    handleValueChange,
    handleMenuToggle,
    handleMenuSelect,
    handleFormSubmit,
    handleKeyDown,
  } = useExampleEditor({ example, onSaved });

  return (
    <form onSubmit={handleFormSubmit}>
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => handleValueChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button ref={triggerRef} onClick={handleMenuToggle}>⋯</button>
      {isMenuOpen && <Menu ref={menuRef} onSelect={handleMenuSelect} />}
      <button type="submit" disabled={isSaveBlocked}>{actionLabel}</button>
    </form>
  );
}
```

**Conventions:**
- File location: `src/features/<feature>/hooks/use-<kebab-name>.ts`. Generic, framework-shaped hooks go in `src/hooks/`.
- Naming: starts with `use`, returns either a single value (small hooks) or a typed object literal (composing hooks). Document the return shape with a local `type` if it has 4+ fields (e.g., `EditorState & EditorActions`).
- A hook never returns JSX. If you need to share JSX, share a component.
- Decompose big hooks into smaller hooks the same way components are decomposed: a composing hook (`useExampleEditor`) is itself made of focused sub-hooks (`useExampleEditorValue`, `useExampleMenu`, `useExampleSave`, `useExampleKeyboard`). That nesting is the goal, not a smell.
- Hooks must be callable in any order at the top of a component (Rules of Hooks). Never call them in loops, conditions, or after early returns.
- Hooks that take callbacks (`onSaved`, `onClear`) must wrap them in stable references (`useCallback` from the caller) if used inside the hook's own effect deps — otherwise effects re-run every parent render.

Reference: [React docs — Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
