/**
 * Source of truth for the design system docs navigation.
 * Drives the sidebar, the route table, and the prev/next pager.
 */

export type DesignNavItem = {
  /** URL slug, joined to /design-system/. Empty string = index/overview. */
  slug: string
  title: string
  /** Short page description, shown under the title and in the sidebar tooltip. */
  description: string
  /** Eyebrow group label, derived from the parent group. */
  group?: string
}

export type DesignNavGroup = {
  label: string
  items: DesignNavItem[]
}

export const NAV_GROUPS: DesignNavGroup[] = [
  {
    label: "Get started",
    items: [
      {
        slug: "",
        title: "Overview",
        description: "How the system is organised and the one principle behind every decision.",
      },
    ],
  },
  {
    label: "Foundations",
    items: [
      {
        slug: "colors",
        title: "Colors",
        description: "Brand, semantic, surface, and chart tokens — every CSS variable that drives the palette.",
      },
      {
        slug: "tones",
        title: "Tone palette",
        description: "The five semantic tones that drive every coloured signal in the app.",
      },
      {
        slug: "typography",
        title: "Typography",
        description: "Type scale, weight, mono usage, and the section-label rule.",
      },
      {
        slug: "spacing",
        title: "Spacing & radii",
        description: "Gap rhythm, card padding, and corner-radius scale.",
      },
      {
        slug: "icons",
        title: "Iconography",
        description: "Lucide vocabulary, the size ladder, and the icon-in-tone-box rule.",
      },
    ],
  },
  {
    label: "Components",
    items: [
      { slug: "components",                title: "Overview",          description: "All primitives in one place." },
      { slug: "components/button",         title: "Button",            description: "Variants, sizes, with icons, icon-only, states." },
      { slug: "components/badge",          title: "Badge",             description: "Variants and the SIRP tone chip pattern." },
      { slug: "components/card",           title: "Card",              description: "The Card + CardContent rhythm and hero variant." },
      { slug: "components/avatar",         title: "Avatar",            description: "Photo, gradient fallback, anonymous fallback." },
      { slug: "components/input",          title: "Input",             description: "Text input, search input." },
      { slug: "components/checkbox",       title: "Checkbox",          description: "States: unchecked, checked, indeterminate." },
      { slug: "components/switch",         title: "Switch",            description: "Toggle for on/off preferences." },
      { slug: "components/tabs",           title: "Tabs",              description: "Default and underline tab strips." },
      { slug: "components/tooltip",        title: "Tooltip",           description: "Short labels on hover." },
      { slug: "components/popover",        title: "Popover",           description: "Stage popover, filter popover, info popover." },
      { slug: "components/dropdown-menu",  title: "Dropdown menu",     description: "Action menus on icon buttons + triggers with chevron." },
      { slug: "components/skeleton",       title: "Skeleton",          description: "Loading placeholder bars." },
    ],
  },
  {
    label: "Brand",
    items: [
      {
        slug: "brand",
        title: "Brand surfaces",
        description: "SourceIcon for every vendor, at every size used in-app.",
      },
    ],
  },
  {
    label: "Patterns",
    items: [
      {
        slug: "patterns",
        title: "Composed patterns",
        description: "Domain-specific recipes that combine primitives + tokens.",
      },
      {
        slug: "layouts",
        title: "Layout shells",
        description: "Page-level chrome — detail-page shell, master/detail, card grid.",
      },
    ],
  },
  {
    label: "Rules",
    items: [
      {
        slug: "rules",
        title: "Do & Don't",
        description: "Pre-decided choices the team agreed on so we don't relitigate them.",
      },
    ],
  },
]

/** Flat list — used by prev/next pager and "find current item" lookups. */
export const FLAT_NAV: DesignNavItem[] = NAV_GROUPS.flatMap((g) =>
  g.items.map((item) => ({ ...item, group: g.label }))
)

export function findNavItem(slug: string): { item: DesignNavItem; index: number } | null {
  const index = FLAT_NAV.findIndex((i) => i.slug === slug)
  if (index === -1) return null
  return { item: FLAT_NAV[index]!, index }
}
