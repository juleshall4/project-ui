# Project UI

Project UI is a personal UI kit built on [Coss UI](https://coss.com/ui). It includes all 54 Coss components, a custom colour theme in light and dark mode, Google Fonts, and extra button styles. The showcase site displays every Coss example (508 particles) and lets you try theme changes live.

## Run the showcase

```sh
bun install
bun run dev
```

Open the local URL that Vite prints. The top bar has the following controls:

- **Theme:** Choose a complete look. The presets are Project (the default), Paper, Midnight, Forest, Mono, and Candy. Your saved themes appear under **Saved**.
- **Customise:** Opens a panel on the right with every setting. On wide screens it docks beside the page, so you can see changes as you make them; on small screens it slides over the page. The panel is a Coss Sidebar with `side="right"`.
  - **Brand colour:** Cobalt, Violet, Emerald, Ember, Rose, Graphite, or Custom. Custom shows a colour picker and a hex field, such as `#ff5a1f`.
  - **Tone of the greys:** Neutral, Cool, Warm, or Brand, which tints surfaces with the brand colour.
  - **Dark mode:** Dim (charcoal), Deep (near-black), or Black (true black).
  - **Contrast:** Soft or Crisp. Crisp makes text, borders, and secondary text stronger.
  - **Corners:** None, Small, Medium, Large, or Round.
  - **Type:** The body font and the heading font.
  - **Motion:** Off, Snappy, Smooth, or Springy.
- **Mode:** Light, system, or dark. This setting only changes your view; every theme includes both light and dark colours.
- **Saved themes** (bookmark icon): Save the current settings under a name, or delete the saved theme you're using. Saved themes stay in this browser.
- **Copy theme:** Copies the full CSS for the current theme and a short prompt to apply it, including component borders, focus rings, and button styles.

The Customise panel shows whether all text is readable. The **Readability** section on the Foundations page lists each text and background pair with its contrast ratio in light and dark mode. Normal text needs at least 4.5:1 to pass WCAG AA.

The font choices are TikTok Sans, Inter, Geist, DM Sans, Plus Jakarta Sans, Manrope, Figtree, Onest, Space Grotesk, and Bricolage Grotesque. All are Google Fonts, loaded through [Fontsource](https://fontsource.org) so they work offline.

## Use Project UI in a project

Your project needs React, Tailwind CSS 4, and an `@/*` import alias. Project UI works with Vite and Next.js.

### Start a new project

Run the following command in the project folder:

```sh
npx shadcn@latest init ~/Developer/project-ui/public/r/project-ui.json
```

This command installs all Coss components, the Project UI theme, the TikTok Sans and Geist Mono fonts, and the Project UI button.

### Add Project UI to a project that already uses Coss

Run the following commands:

```sh
npx shadcn@latest add ~/Developer/project-ui/public/r/theme.json
npx shadcn@latest add ~/Developer/project-ui/public/r/button.json --overwrite
```

### Add a single component or example

Coss components and examples install from the Coss registry, and they use the Project UI theme automatically:

```sh
npx shadcn@latest add @coss/dialog
npx shadcn@latest add @coss/p-dialog-1
```

To copy an example's code, select the code button on its card in the showcase.

### Apply copied theme settings

Give the contents of **Copy theme** to your coding assistant to apply the theme and component styles. The short prompt is a CSS comment, so you can also paste the contents into your project's main CSS file. Put the `@import` lines with the other imports at the top, and the `:root` block at the end. If the CSS imports a font, install its package first. When applying the CSS manually, follow the comment's instructions to update the component styles too.

For example, the following CSS changes the kit to violet with rounder corners and Manrope text:

```sh
npm install @fontsource-variable/manrope
```

```css
@import "@fontsource-variable/manrope";

:root {
  --brand-h: 292.5;
  --brand-c: 0.2378;
  --radius: 0.875rem;
  --font-body: 'Manrope Variable', ui-sans-serif, system-ui, sans-serif;
}
```

## Motion

All motion lives in `src/motion.css`. It targets the `data-slot` attributes on Coss components, so the component files stay unchanged and Coss updates don't remove it. The values follow Emil Kowalski's animation guidance in `.agents/skills/`.

| Preset | Feel |
| --- | --- |
| Off | No movement. Loading spinners keep turning. |
| Snappy | The default. Fast, with a strong ease-out curve: popups take 200ms, and dialogs 250ms. |
| Smooth | Slightly longer and softer, with the iOS drawer curve. |
| Springy | A small spring bounce on popups, dialogs, switches, and tabs. Checkbox ticks pop in. |

To choose a preset, set `data-motion` on the `<html>` element. Leave it out for Snappy.

```html
<html data-motion="springy">
```

The following rules apply in every preset:

- Menus, selects, popovers, and tooltips grow from the button that opened them. Dialogs stay centred.
- The command palette, comboboxes, and autocompletes never animate, because they open from the keyboard or while typing.
- With the system's Reduce motion setting on, components fade instead of moving or scaling.

To tune motion, change the tokens at the top of `src/motion.css`, such as `--duration-popup`, `--ease-out`, or `--scale-popup`. To rebuild the Springy curve, run `bun scripts/spring-easing.ts <duration> <bounce>`.

## Colours

`src/palette.ts` generates every colour from four inputs: the brand colour, the tone, the dark mode style, and the contrast level. It produces matching light and dark values, and adjusts derived text colours, such as soft badge text, until they pass WCAG AA. Every preset combination passes AA.

The default palette is written into `src/index.css` by `scripts/sync-theme.ts`, which `bun run registry` runs automatically. To change the default colours, edit `src/palette.ts`, not `src/index.css`.

## What Project UI adds to Coss

| Addition | Details |
| --- | --- |
| Colours | Slate text, soft surfaces, light borders, and a matching dark palette. The primary colour is the brand colour. |
| Brand tokens | `brand`, `brand-soft`, `magic`, `pro`, and `highlight`, available as Tailwind colours such as `bg-brand`. |
| Recolouring | `--brand-l` (lightness), `--brand-h` (hue), and `--brand-c` (chroma) set every brand colour in both modes. |
| Themes | Six theme presets, a palette generator for tone, dark mode style, and contrast, and contrast checks. |
| Button variants | `raised` (a gradient surface button), `soft`, and `magic`. |
| Button feel | Buttons scale down slightly when pressed, unless reduced motion is on. |
| Fonts | TikTok Sans for text and Geist Mono for code. Set `--font-body` for text and `--font-display` for headings. |
| Motion | Four motion presets with shared timing tokens and reduced-motion support. |

## Change the kit

1. Edit the theme in `src/index.css`, motion in `src/motion.css`, or the button in `src/components/ui/button.tsx`.
2. Check the result in the showcase.
3. Rebuild the registry:

   ```sh
   bun run registry
   ```

4. In each project that uses the kit, run the install command again with `--overwrite`.

`scripts/build-registry.ts` reads the theme from `src/index.css`, so the showcase and the registry always match.

## Update Coss

Run the following command, then review the changes and rebuild the registry:

```sh
bunx shadcn@latest add @coss/ui --overwrite
```

This command replaces `src/components/ui/button.tsx`. Use `git diff` to restore the `raised`, `soft`, and `magic` variants. Motion is unaffected, because it lives in `src/motion.css`.

## Project layout

| Path | Contents |
| --- | --- |
| `src/components/ui/` | The 55 Coss component files. |
| `src/components/p-*.tsx` | The 508 Coss examples that the showcase displays. |
| `src/showcase/` | The showcase site: top bar, theme settings, and example cards. |
| `src/palette.ts` | The palette generator. This file is the source of truth for colours. |
| `src/index.css` | The theme: fonts, Tailwind tokens, and the generated default palette. |
| `src/motion.css` | Motion tokens, presets, and component animations. |
| `public/r/` | The built registry files that other projects install from. |
| `.agents/skills/` | Coss guides for coding agents. |
# project-ui
