# Rules README

This folder contains detailed coding rules for the chat frontend.

`AGENTS.md` is the root entrypoint. It tells Codex which rule files to read before editing a layer.

## Files

- `PROJECT_RULES.md` - project-wide stack, architecture, shadcn, socket, dependency, and verification rules.
- `naming.md` - naming rules for folders, files, exports, variables, hooks, types, constants, and chat fields.
- `src.md` - rules for all code under `src/`.
- `pages.md` - thin route page rules.
- `features.md` - feature module structure and ownership rules.
- `components.md` - shared component and accessibility rules.
- `components-ui.md` - raw shadcn/ui primitive rules.
- `hooks.md` - reusable hook and API hook rules.
- `services.md` - HTTP and socket service rules.
- `config.md` - env, constants, routes, and app config rules.
- `stores.md` - global Zustand store rules.
- `types.md` - shared type rules.
- `utils.md` - reusable utility rules.
- `libs.md` - third-party client and integration rules.
- `code_review.md` - review checklist before final response.
- `prompts/feature-development.prompt.md` - reusable prompt template for future feature work.

## Maintenance

- Keep these rules aligned with the real project structure and `package.json`.
- Do not mention tools that are not installed unless the rule explicitly says to install them when needed.
- Update this folder when architecture conventions change.
