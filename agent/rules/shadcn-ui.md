---
title: shadcn/ui Component Usage
impact: HIGH
impactDescription: Ensures consistent UI patterns and prevents duplicate/broken component installs.
tags: shadcn, ui, components, tailwind, react
---

## shadcn/ui Component Usage

**Impact: HIGH (Consistent UI and correct import paths)**

This project uses [shadcn/ui](https://ui.shadcn.com) with the **new-york** style, **neutral** base color, Tailwind CSS v4, and `lucide-react` as the icon library. Components live in `src/components/ui/` and are imported via the `@/components/ui` alias. The `cn` utility is at `@/utils/cn`.

**Incorrect (wrong import path or installing via npm):**

```tsx
// ❌ Installing as an npm package — shadcn/ui is copy-paste, not a package
import { Button } from "shadcn-ui"
import { Button } from "@shadcn/ui"

// ❌ Wrong alias path
import { Button } from "../../components/ui/button"
import { Button } from "@/ui/button"

// ❌ Using cn from the wrong location
import { cn } from "@/libs/utils"
import { cn } from "@/lib/utils"
```

**Correct (alias imports, cn from project location):**

```tsx
// ✅ Import from the correct alias
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// ✅ cn utility lives at @/utils/cn (mapped as "utils" in components.json)
import { cn } from "@/utils/cn"

// ✅ Use lucide-react for icons
import { Search, X, ChevronDown } from "lucide-react"
```

### Currently Installed Components

| Component | Import path |
|-----------|-------------|
| Avatar | `@/components/ui/avatar` |
| Button | `@/components/ui/button` |
| Card | `@/components/ui/card` |
| Dialog | `@/components/ui/dialog` |
| Dropdown Menu | `@/components/ui/dropdown-menu` |
| Field | `@/components/ui/field` |
| Input | `@/components/ui/input` |
| Label | `@/components/ui/label` |
| Separator | `@/components/ui/separator` |
| Sheet | `@/components/ui/sheet` |
| Skeleton | `@/components/ui/skeleton` |
| Textarea | `@/components/ui/textarea` |

> **Toast/notifications:** use `sonner` (`import { toast } from "sonner"`), not shadcn's built-in toast.

### Installing a New Component

Always use the CLI — never copy-paste manually or install via npm:

```bash
npx shadcn@latest add <component-name>
```

Examples:

```bash
npx shadcn@latest add select
npx shadcn@latest add scroll-area
npx shadcn@latest add tooltip
```

The CLI respects `components.json` and places files in the correct paths automatically. After adding, verify the file appeared in `src/components/ui/`.

Reference: [shadcn/ui components](https://ui.shadcn.com/docs/components)
