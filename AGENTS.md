### Project UI

This repository is a personal UI kit built on Coss UI. It serves two purposes: a showcase site and a shadcn registry that other projects install from. See `README.md`.

### Design

Read `.agents/skills/coss/SKILL.md` and `.agents/skills/coss-particles/SKILL.md` before UI work. Use Coss components from `src/components/ui/`; do not invent APIs.

### Theme

`src/index.css` is the source of truth for the theme, and `src/motion.css` for motion. After changing either, or `src/components/ui/button.tsx`, run `bun run registry` and commit `registry.json` and `public/r/`.

Do not edit Coss particle files (`src/components/p-*.tsx`). Shim framework-specific imports in `vite.config.ts` instead.

### Motion

Read `.agents/skills/animate/SKILL.md` before changing motion. Put all component motion in `src/motion.css`, targeting `data-slot` attributes; do not add transition classes to Coss component files. Use the existing tokens, keep UI animations under 300ms, and never animate the command palette or comboboxes.
