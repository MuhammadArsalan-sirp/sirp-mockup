# SIRP OmniSense — Design System Builder (Figma plugin)

A one-shot Figma plugin that builds the entire SIRP OmniSense design system
into a blank Figma file: color variables (light + dark modes), text styles,
effect styles, primitive components with variants, domain patterns, and a
sample screen mock.

Mirrors the canonical tokens defined in `src/lib/tone.ts` and `src/index.css`.

## What the plugin produces

When run on an empty Figma file, the plugin creates **six pages**:

| Page | Contents |
|---|---|
| 🎨 **Cover** | Title, three pillars, list of pages, link to the live `/design-system` site |
| 🪨 **Foundations** | Brand / semantic / surface / chart colour swatches, typography specimens, radius scale |
| 🌈 **Tone palette** | The five-tone system (alert · warn · ok · info · muted) shown with iconBox / chip / text / bar / tinted-bg per tone, plus the decision tree |
| 🧩 **Components** | Component sets with variants: Button (30 variants), Badge (4), ToneChip (5), IconInToneBox (15), Card (2), Avatar (15), Input (3), Checkbox (4), Switch (3), Tabs (1), Tooltip (1), Popover (1), Skeleton (2) |
| 🧱 **Patterns** | VerdictCallout (5 tones), StatTile, HeaderPillCluster, ActivityEvent, CommentRow (system / analyst), EmptyState |
| 🖼️ **Sample screen** | Incident detail · Overview tab — composed from the primitives + patterns above |

It also creates:

- **`SIRP/Colors`** variable collection with **Light** and **Dark** modes wired
  to every CSS variable in `src/index.css` (background, card, primary,
  destructive, chart-1..5, sidebar, etc.) plus tone variables
- **`SIRP/Numbers`** variable collection with the Tailwind spacing scale and
  radius scale
- **Text styles** — Page title, Card title, Body, Body small, KPI value,
  Section label, Micro label, Mono ID, Mono numeric
- **Effect styles** — `SIRP / Shadow / sm`, `md`, `lg`

## How to install and run

1. Open Figma (desktop or web — both work)
2. Create an **empty new Figma file** (the plugin needs a blank canvas)
3. In the menu bar: `Plugins → Development → Import plugin from manifest…`
4. Browse to `tools/figma-plugin/` in this repo and pick `manifest.json`
5. Now from the same `Plugins → Development` menu, click
   **SIRP OmniSense — Design System Builder** to run
6. Wait ~10-30 seconds. When you see the toast
   *"Design system built!"* — you're done

The plugin closes automatically. Open the pages on the left to browse what
was created.

## Switching themes

The Figma file's variables drive light/dark mode:

1. Click the empty canvas (no selection)
2. In the right sidebar, expand the **"Local variables"** section, or open
   `Variables → SIRP/Colors`
3. Switch the active **mode** between **Light** and **Dark** — every
   variable resolves to a different colour automatically, and any node
   bound to a variable updates instantly

Note: in the v1 plugin, components are styled with **direct colours**
(not variable bindings) so dark mode requires re-binding nodes manually,
or running an updated plugin that binds variables. The variables exist
and work for new nodes designers create themselves.

## Re-running on the same file

The plugin is **not yet idempotent** — running it twice will create
duplicate pages. If you want to refresh, delete the existing pages first,
then re-run.

If you need a truly idempotent re-run experience, ping the engineering
team to add update-by-name logic to the plugin (~1 hour of work).

## What's not in v1

These will be added when designers report what they need most:

- **7 theme presets** (lavender, plum, slate, stone, mocha, dusk, carbon)
  — currently only Light + Dark
- **Variable bindings on components** — components use direct hex colours
  so dark mode requires manual rebinding
- **More screen mocks** — currently only Incident Overview; can add
  OmniSense tab, Artifacts master/detail, etc. on request
- **Auto-layout polish on Stat tile rows** — minor visual quirks; designers
  can fix in a minute

## Editing the plugin

The plugin is a single file: `code.js`. To change what gets built:

1. Edit `code.js`
2. Re-run the plugin in Figma (Figma re-reads the file each run; no
   build/compile step needed)

If you want TypeScript support and `@figma/plugin-typings` autocompletion,
add a `tsconfig.json` and a build script — but the shipped plugin runs as
plain JS so designers don't need any build tooling.

## File structure

```
tools/figma-plugin/
  manifest.json     # Figma plugin manifest (entry point declaration)
  code.js           # The entire plugin (~1500 lines)
  README.md         # This file
```

That's all. No dependencies, no build step, no npm install required.

## Reference

- Live spec → http://localhost:5173/design-system (run `npm run dev`)
- Tone module → `src/lib/tone.ts`
- CSS variables → `src/index.css`
- Figma Plugin API docs → https://www.figma.com/plugin-docs/api/api-reference/
