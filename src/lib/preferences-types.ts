/**
 * Type & default definitions for user preferences.
 * Single source of truth — both the store and the popover read from here.
 */

export type ThemeMode = "light" | "dark" | "system"

/**
 * Theme presets — full surface-palette swaps.
 *
 * The brand primary (SIRPurple `#8E2DFF`) and chart gradient stay constant
 * across every preset; only the *chrome* changes (background, card,
 * popover, sidebar, secondary, muted, accent, border, input). Each preset
 * is a different "skin" of the same brand.
 */
export type ThemePreset =
  | "default" // pure neutral greys (current baseline)
  | "lavender" // light purple wash
  | "plum" // deeper violet surfaces
  | "slate" // cool blue-grey
  | "stone" // warm beige / sand
  | "mocha" // warm chocolate
  | "dusk" // twilight blue
  | "carbon" // high-contrast black & white

export type FontFamily =
  | "dm-sans"
  | "inter"
  | "geist"
  | "manrope"
  | "figtree"
  | "plus-jakarta"
  | "space-grotesk"
  | "outfit"
  | "ibm-plex"
  | "jetbrains-mono"
  | "system"

export type SidebarVariant = "inset" | "sidebar" | "floating"
export type SidebarCollapsible = "icon" | "offcanvas"
export type SidebarDensity = "compact" | "default" | "spacious"
export type PageLayout = "centered" | "full-width"
export type NavbarBehavior = "sticky" | "scroll"

export type Preferences = {
  themeMode: ThemeMode
  themePreset: ThemePreset
  fontFamily: FontFamily
  sidebarVariant: SidebarVariant
  sidebarCollapsible: SidebarCollapsible
  sidebarDensity: SidebarDensity
  pageLayout: PageLayout
  navbarBehavior: NavbarBehavior
}

export const DEFAULT_PREFERENCES: Preferences = {
  themeMode: "dark",
  themePreset: "carbon",
  fontFamily: "dm-sans",
  sidebarVariant: "inset",
  sidebarCollapsible: "icon",
  sidebarDensity: "default",
  pageLayout: "full-width",
  navbarBehavior: "sticky",
}

export const FONT_OPTIONS: {
  value: FontFamily
  label: string
  hint?: string
  stack: string
}[] = [
  {
    value: "dm-sans",
    label: "DM Sans",
    hint: "Default · brand standard",
    stack: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
  },
  {
    value: "inter",
    label: "Inter",
    hint: "Workhorse UI sans",
    stack: '"Inter", ui-sans-serif, system-ui, sans-serif',
  },
  {
    value: "geist",
    label: "Geist Sans",
    hint: "Modern, neutral",
    stack: '"Geist", ui-sans-serif, system-ui, sans-serif',
  },
  {
    value: "manrope",
    label: "Manrope",
    hint: "Geometric, friendly",
    stack: '"Manrope", ui-sans-serif, system-ui, sans-serif',
  },
  {
    value: "figtree",
    label: "Figtree",
    hint: "Soft humanist",
    stack: '"Figtree Variable", ui-sans-serif, system-ui, sans-serif',
  },
  {
    value: "plus-jakarta",
    label: "Plus Jakarta Sans",
    hint: "Crisp display sans",
    stack: '"Plus Jakarta Sans Variable", ui-sans-serif, system-ui, sans-serif',
  },
  {
    value: "space-grotesk",
    label: "Space Grotesk",
    hint: "Tight, technical",
    stack: '"Space Grotesk Variable", ui-sans-serif, system-ui, sans-serif',
  },
  {
    value: "outfit",
    label: "Outfit",
    hint: "Geometric display",
    stack: '"Outfit Variable", ui-sans-serif, system-ui, sans-serif',
  },
  {
    value: "ibm-plex",
    label: "IBM Plex Sans",
    hint: "Engineering vibe",
    stack: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif',
  },
  {
    value: "jetbrains-mono",
    label: "JetBrains Mono",
    hint: "Mono-everywhere",
    stack: '"JetBrains Mono Variable", ui-monospace, monospace',
  },
  {
    value: "system",
    label: "System UI",
    hint: "Native OS font",
    stack:
      "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  },
]

/**
 * Preset metadata — labels + per-mode swatch tones drive the picker UI.
 * `light` and `dark` describe the three most visible surfaces (background,
 * card, accent) so the picker can render a faithful mini preview that
 * matches the active theme mode.
 */
type PresetSurfaceSet = {
  bg: string
  card: string
  accent: string
}
export type ThemePresetOption = {
  value: ThemePreset
  label: string
  description: string
  light: PresetSurfaceSet
  dark: PresetSurfaceSet
}

export const THEME_PRESET_OPTIONS: ThemePresetOption[] = [
  {
    value: "default",
    label: "Default",
    description: "Neutral greys",
    light: { bg: "#ffffff", card: "#ffffff", accent: "#f0f0f0" },
    dark: { bg: "#0a0a0a", card: "#1c1c1c", accent: "#2a2a2a" },
  },
  {
    value: "lavender",
    label: "Lavender",
    description: "Brand-forward purple wash",
    light: { bg: "#faf7ff", card: "#ffffff", accent: "#e8def8" },
    dark: { bg: "#0e0a18", card: "#1a1228", accent: "#2b1f3e" },
  },
  {
    value: "plum",
    label: "Plum",
    description: "Saturated violet",
    light: { bg: "#f3ecff", card: "#fefbff", accent: "#d6c2f0" },
    dark: { bg: "#160c24", card: "#221638", accent: "#3a2553" },
  },
  {
    value: "slate",
    label: "Slate",
    description: "Cool blue-grey",
    light: { bg: "#f8fafc", card: "#ffffff", accent: "#e2e8f0" },
    dark: { bg: "#0f172a", card: "#1e293b", accent: "#334155" },
  },
  {
    value: "stone",
    label: "Stone",
    description: "Warm sand",
    light: { bg: "#fafaf9", card: "#ffffff", accent: "#e7e5e4" },
    dark: { bg: "#1c1917", card: "#292524", accent: "#44403c" },
  },
  {
    value: "mocha",
    label: "Mocha",
    description: "Warm chocolate",
    light: { bg: "#faf6f2", card: "#ffffff", accent: "#e3d4bf" },
    dark: { bg: "#1e1812", card: "#2a201a", accent: "#3a2c24" },
  },
  {
    value: "dusk",
    label: "Dusk",
    description: "Twilight blue",
    light: { bg: "#f3f4ff", card: "#ffffff", accent: "#d1d6ff" },
    dark: { bg: "#0a0d1f", card: "#161a2e", accent: "#252b50" },
  },
  {
    value: "carbon",
    label: "Carbon",
    description: "Pure high contrast",
    light: { bg: "#ffffff", card: "#ffffff", accent: "#e4e4e7" },
    dark: { bg: "#000000", card: "#0a0a0a", accent: "#1f1f1f" },
  },
]
