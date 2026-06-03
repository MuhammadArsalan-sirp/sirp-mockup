/* eslint-disable */
// =============================================================================
// SIRP OmniSense — Design System Builder
// One-shot Figma plugin that creates the entire SIRP design system in a
// blank Figma file: variables (with light + dark modes), text styles,
// effect styles, primitive components with variants, domain patterns,
// and a sample screen mock.
//
// Mirrors the canonical tokens defined in src/lib/tone.ts and src/index.css.
// =============================================================================

// ────────────────────────────────────────────────────────────────────────────
// 1. TOKENS — exact values mirrored from src/index.css + src/lib/tone.ts
// ────────────────────────────────────────────────────────────────────────────

const COLORS_LIGHT = {
  background:               "#ffffff",
  foreground:               "#121218",
  card:                     "#ffffff",
  "card-foreground":        "#121218",
  popover:                  "#ffffff",
  "popover-foreground":     "#121218",
  primary:                  "#8e2dff",
  "primary-foreground":     "#ffffff",
  secondary:                "#f5f5f5",
  "secondary-foreground":   "#121218",
  muted:                    "#f5f5f5",
  "muted-foreground":       "#5a5a69",
  accent:                   "#f0f0f0",
  "accent-foreground":      "#121218",
  destructive:              "#f87171",
  "destructive-foreground": "#ffffff",
  border:                   "#e5e5e5",
  input:                    "#e5e5e5",
  ring:                     "#8e2dff",
  "chart-1":                "#8e2dff",
  "chart-2":                "#7224cc",
  "chart-3":                "#5604b6",
  "chart-4":                "#a457ff",
  "chart-5":                "#bb81ff",
  success:                  "#34d399",
  warning:                  "#fbbf24",
  attention:                "#fb923c",
  info:                     "#60a5fa",
  sidebar:                  "#fafafa",
  "sidebar-foreground":     "#121218",
  "sidebar-primary":        "#8e2dff",
  "sidebar-accent":         "#f5f5f5",
  "sidebar-border":         "#e5e5e5",
}

const COLORS_DARK = {
  background:               "#252525",     // oklch(0.145 0 0)
  foreground:               "#fafafa",     // oklch(0.985 0 0)
  card:                     "#363636",     // oklch(0.205 0 0)
  "card-foreground":        "#fafafa",
  popover:                  "#363636",
  "popover-foreground":     "#fafafa",
  primary:                  "#8e2dff",
  "primary-foreground":     "#ffffff",
  secondary:                "#454545",     // oklch(0.269 0 0)
  "secondary-foreground":   "#fafafa",
  muted:                    "#454545",
  "muted-foreground":       "#a8a8a8",     // oklch(0.708 0 0)
  accent:                   "#454545",
  "accent-foreground":      "#fafafa",
  destructive:              "#f87171",
  "destructive-foreground": "#ffffff",
  border:                   "rgba(255,255,255,0.10)",
  input:                    "rgba(255,255,255,0.15)",
  ring:                     "#8e2dff",
  "chart-1":                "#d2abff",
  "chart-2":                "#b98aff",
  "chart-3":                "#a457ff",
  "chart-4":                "#8e2dff",
  "chart-5":                "#7224cc",
  success:                  "#34d399",
  warning:                  "#fbbf24",
  attention:                "#fb923c",
  info:                     "#60a5fa",
  sidebar:                  "#363636",
  "sidebar-foreground":     "#fafafa",
  "sidebar-primary":        "#8e2dff",
  "sidebar-accent":         "#454545",
  "sidebar-border":         "rgba(255,255,255,0.10)",
}

// Five-tone palette — extracted from src/lib/tone.ts.
// Each tone has separate variables for the components that need them.
const TONES = ["alert", "warn", "ok", "info", "muted"]

// Source colors per tone. The plugin generates variables with alpha variants
// (e.g. tone-alert-bg-10 = destructive at 10% alpha).
const TONE_HEX = {
  alert: { light: "#dc2626", dark: "#f87171" },   // destructive
  warn:  { light: "#f59e0b", dark: "#fbbf24" },   // amber-500
  ok:    { light: "#10b981", dark: "#34d399" },   // emerald-500
  info:  { light: "#8e2dff", dark: "#a457ff" },   // primary
  muted: { light: "#5a5a69", dark: "#a8a8a8" },   // muted-foreground
}

// Tailwind-aligned spacing scale used in the mockup
const SPACING = {
  "0.5": 2, "1": 4, "1.5": 6, "2": 8, "2.5": 10,
  "3": 12, "3.5": 14, "4": 16, "5": 20, "6": 24,
  "7": 28, "8": 32, "10": 40, "12": 48,
}

const RADIUS = { sm: 6, md: 8, lg: 10, xl: 14, "2xl": 18 }

// Typography styles — matches the chemistry rules in CLAUDE.md.
const TEXT_STYLES = [
  { name: "Page title",      family: "Inter", style: "Semi Bold", size: 24, lineHeight: 32, letterSpacing: -0.4 },
  { name: "Card title",      family: "Inter", style: "Semi Bold", size: 16, lineHeight: 22, letterSpacing: -0.2 },
  { name: "Body",            family: "Inter", style: "Regular",   size: 14, lineHeight: 22 },
  { name: "Body small",      family: "Inter", style: "Regular",   size: 12, lineHeight: 18 },
  { name: "KPI value",       family: "Inter", style: "Medium",    size: 24, lineHeight: 24, letterSpacing: -0.4 },
  { name: "Section label",   family: "Inter", style: "Medium",    size: 11, lineHeight: 14, letterSpacing: 0.55, textCase: "UPPER" },
  { name: "Micro label",     family: "Inter", style: "Semi Bold", size: 10, lineHeight: 12, letterSpacing: 0.5,  textCase: "UPPER" },
  { name: "Mono ID",         family: "JetBrains Mono", style: "Regular", size: 12, lineHeight: 16 },
  { name: "Mono numeric",    family: "JetBrains Mono", style: "Bold",    size: 12, lineHeight: 16 },
]

// ────────────────────────────────────────────────────────────────────────────
// 2. HELPERS
// ────────────────────────────────────────────────────────────────────────────

function parseHex(input) {
  // Returns { r, g, b, a } in 0..1 range. Accepts #RGB / #RRGGBB / rgba(...) / "transparent".
  if (typeof input !== "string") throw new Error("parseHex: not a string: " + input)
  if (input === "transparent") return { r: 0, g: 0, b: 0, a: 0 }
  if (input.startsWith("rgba")) {
    const m = input.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/)
    if (!m) throw new Error("parseHex: bad rgba: " + input)
    return { r: +m[1] / 255, g: +m[2] / 255, b: +m[3] / 255, a: m[4] ? +m[4] : 1 }
  }
  let hex = input.replace("#", "")
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("")
  if (hex.length !== 6) throw new Error("parseHex: bad hex: " + input)
  return {
    r: parseInt(hex.substr(0, 2), 16) / 255,
    g: parseInt(hex.substr(2, 2), 16) / 255,
    b: parseInt(hex.substr(4, 2), 16) / 255,
    a: 1,
  }
}

function solidPaint(hex, alpha) {
  const c = parseHex(hex)
  const a = alpha !== undefined ? alpha * c.a : c.a
  return { type: "SOLID", color: { r: c.r, g: c.g, b: c.b }, opacity: a }
}

async function loadAllFonts() {
  const fontPairs = []
  for (const t of TEXT_STYLES) {
    fontPairs.push({ family: t.family, style: t.style })
  }
  // Also ensure base Inter weights are loaded for ad-hoc text in our compositions.
  fontPairs.push({ family: "Inter", style: "Regular" })
  fontPairs.push({ family: "Inter", style: "Medium" })
  fontPairs.push({ family: "Inter", style: "Semi Bold" })
  fontPairs.push({ family: "Inter", style: "Bold" })
  fontPairs.push({ family: "JetBrains Mono", style: "Regular" })
  fontPairs.push({ family: "JetBrains Mono", style: "Medium" })
  fontPairs.push({ family: "JetBrains Mono", style: "Bold" })
  const unique = []
  const seen = new Set()
  for (const f of fontPairs) {
    const key = f.family + "/" + f.style
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(f)
  }
  for (const font of unique) {
    try { await figma.loadFontAsync(font) } catch (e) { console.warn("Font missing:", font, e) }
  }
}

// ─── Frame helpers ──────────────────────────────────────────────────────────

function af(opts) {
  // Auto-layout frame helper. opts: { name, dir, padding, gap, fill, stroke, radius, w, h, primary, counter, align }
  const f = figma.createFrame()
  if (opts.name) f.name = opts.name
  f.layoutMode = opts.dir || "HORIZONTAL"
  f.itemSpacing = opts.gap !== undefined ? opts.gap : 8
  if (Array.isArray(opts.padding)) {
    f.paddingTop = opts.padding[0]
    f.paddingRight = opts.padding[1]
    f.paddingBottom = opts.padding[2]
    f.paddingLeft = opts.padding[3]
  } else if (typeof opts.padding === "number") {
    f.paddingTop = f.paddingRight = f.paddingBottom = f.paddingLeft = opts.padding
  } else {
    f.paddingTop = f.paddingRight = f.paddingBottom = f.paddingLeft = 0
  }
  f.primaryAxisSizingMode = opts.primary || "AUTO"
  f.counterAxisSizingMode = opts.counter || "AUTO"
  f.primaryAxisAlignItems = opts.align || "MIN"
  f.counterAxisAlignItems = opts.cross || "CENTER"
  if (opts.fill) f.fills = Array.isArray(opts.fill) ? opts.fill : [opts.fill]
  else f.fills = []
  if (opts.stroke) {
    f.strokes = Array.isArray(opts.stroke) ? opts.stroke : [opts.stroke]
    f.strokeWeight = opts.strokeWeight !== undefined ? opts.strokeWeight : 1
    f.strokeAlign = opts.strokeAlign || "INSIDE"
  }
  if (opts.radius !== undefined) f.cornerRadius = opts.radius
  if (opts.w !== undefined) { f.resize(opts.w, f.height); f.primaryAxisSizingMode = opts.dir === "VERTICAL" ? f.primaryAxisSizingMode : "FIXED"; f.counterAxisSizingMode = opts.dir === "VERTICAL" ? "FIXED" : f.counterAxisSizingMode }
  if (opts.h !== undefined) { f.resize(f.width, opts.h) }
  if (opts.clip) f.clipsContent = true
  return f
}

function txt(text, opts) {
  // opts: { style, family, weight, size, color, opacity, lineHeight, letterSpacing, textCase, alignHorizontal, width }
  const t = figma.createText()
  const family = opts.family || "Inter"
  const style = opts.weight || (opts.style || "Regular")
  t.fontName = { family, style }
  t.characters = text
  if (opts.size) t.fontSize = opts.size
  if (opts.lineHeight !== undefined) t.lineHeight = { value: opts.lineHeight, unit: "PIXELS" }
  if (opts.letterSpacing !== undefined) t.letterSpacing = { value: opts.letterSpacing, unit: "PIXELS" }
  if (opts.textCase) t.textCase = opts.textCase
  if (opts.alignHorizontal) t.textAlignHorizontal = opts.alignHorizontal
  if (opts.width) {
    t.textAutoResize = "HEIGHT"
    t.resize(opts.width, t.height)
  } else {
    t.textAutoResize = "WIDTH_AND_HEIGHT"
  }
  if (opts.color) {
    t.fills = [solidPaint(opts.color, opts.opacity)]
  } else {
    t.fills = [solidPaint("#121218", opts.opacity)]
  }
  return t
}

function dot(size, color) {
  const e = figma.createEllipse()
  e.name = "dot"
  e.resize(size, size)
  e.fills = [solidPaint(color)]
  return e
}

function spacer(width, height) {
  const r = figma.createRectangle()
  r.name = "spacer"
  r.resize(width || 0, height || 0)
  r.fills = []
  return r
}

// ────────────────────────────────────────────────────────────────────────────
// 3. VARIABLE COLLECTIONS
// ────────────────────────────────────────────────────────────────────────────

async function createColorVariables() {
  const collection = figma.variables.createVariableCollection("SIRP/Colors")
  // Rename the default mode to Light, then add Dark.
  collection.renameMode(collection.modes[0].modeId, "Light")
  const darkModeId = collection.addMode("Dark")
  const lightModeId = collection.modes[0].modeId

  const created = {}
  const allNames = Object.keys(COLORS_LIGHT)
  for (const name of allNames) {
    const v = figma.variables.createVariable(name, collection, "COLOR")
    v.setValueForMode(lightModeId, parseHex(COLORS_LIGHT[name]))
    if (COLORS_DARK[name]) {
      v.setValueForMode(darkModeId, parseHex(COLORS_DARK[name]))
    }
    created[name] = v
  }

  // Tone-aware variables (e.g. tone-alert-300, tone-alert-bg-10) — kept simple:
  // one "solid" color per tone for both modes.
  for (const tone of TONES) {
    const v = figma.variables.createVariable(`tone-${tone}`, collection, "COLOR")
    v.setValueForMode(lightModeId, parseHex(TONE_HEX[tone].light))
    v.setValueForMode(darkModeId, parseHex(TONE_HEX[tone].dark))
    created[`tone-${tone}`] = v
  }

  return { collection, lightModeId, darkModeId, vars: created }
}

async function createNumberVariables() {
  const collection = figma.variables.createVariableCollection("SIRP/Numbers")
  collection.renameMode(collection.modes[0].modeId, "Default")
  const modeId = collection.modes[0].modeId

  const vars = {}
  for (const [name, val] of Object.entries(SPACING)) {
    const v = figma.variables.createVariable(`spacing-${name.replace(".", "_")}`, collection, "FLOAT")
    v.setValueForMode(modeId, val)
    vars[`spacing-${name}`] = v
  }
  for (const [name, val] of Object.entries(RADIUS)) {
    const v = figma.variables.createVariable(`radius-${name}`, collection, "FLOAT")
    v.setValueForMode(modeId, val)
    vars[`radius-${name}`] = v
  }
  return { collection, vars }
}

// ────────────────────────────────────────────────────────────────────────────
// 4. TEXT + EFFECT STYLES
// ────────────────────────────────────────────────────────────────────────────

async function createTextStyles() {
  const styles = {}
  for (const t of TEXT_STYLES) {
    const s = figma.createTextStyle()
    s.name = "SIRP / " + t.name
    s.fontName = { family: t.family, style: t.style }
    s.fontSize = t.size
    if (t.lineHeight) s.lineHeight = { value: t.lineHeight, unit: "PIXELS" }
    if (t.letterSpacing) s.letterSpacing = { value: t.letterSpacing, unit: "PIXELS" }
    if (t.textCase) s.textCase = t.textCase
    styles[t.name] = s
  }
  return styles
}

function createEffectStyles() {
  const sm = figma.createEffectStyle()
  sm.name = "SIRP / Shadow / sm"
  sm.effects = [{ type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.05 }, offset: { x: 0, y: 1 }, radius: 2, spread: 0, visible: true, blendMode: "NORMAL" }]

  const md = figma.createEffectStyle()
  md.name = "SIRP / Shadow / md"
  md.effects = [
    { type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.08 }, offset: { x: 0, y: 4 }, radius: 8, spread: 0, visible: true, blendMode: "NORMAL" },
    { type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.04 }, offset: { x: 0, y: 2 }, radius: 4, spread: 0, visible: true, blendMode: "NORMAL" },
  ]

  const lg = figma.createEffectStyle()
  lg.name = "SIRP / Shadow / lg"
  lg.effects = [
    { type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.1 },  offset: { x: 0, y: 12 }, radius: 24, spread: -4, visible: true, blendMode: "NORMAL" },
    { type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.05 }, offset: { x: 0, y: 4 },  radius: 8,  spread: 0,  visible: true, blendMode: "NORMAL" },
  ]
  return { sm, md, lg }
}

// ────────────────────────────────────────────────────────────────────────────
// 5. FOUNDATIONS PAGE
// ────────────────────────────────────────────────────────────────────────────

function colorSwatch(name, hex, cssName) {
  const card = af({ name, dir: "VERTICAL", gap: 6, w: 144, padding: 0 })
  const chip = af({ name: "chip", dir: "HORIZONTAL", gap: 0, w: 144, h: 56, padding: 0, fill: solidPaint(hex), stroke: solidPaint("#e5e5e5"), strokeWeight: 1, radius: 10 })
  card.appendChild(chip)
  const meta = af({ name: "meta", dir: "VERTICAL", gap: 2, w: 144, padding: 0 })
  meta.appendChild(txt(name, { size: 12, weight: "Medium", color: "#121218" }))
  meta.appendChild(txt(cssName || "", { size: 10, weight: "Regular", family: "JetBrains Mono", color: "#5a5a69" }))
  card.appendChild(meta)
  return card
}

function buildFoundations(page, textStyles) {
  const root = af({ name: "Foundations", dir: "VERTICAL", padding: [48, 64, 48, 64], gap: 48, fill: solidPaint("#ffffff") })
  page.appendChild(root)

  // Title block
  const titleBlock = af({ name: "title", dir: "VERTICAL", gap: 8, padding: 0 })
  titleBlock.appendChild(txt("FOUNDATIONS", { size: 10, weight: "Semi Bold", color: "#8e2dff", letterSpacing: 1, textCase: "UPPER" }))
  titleBlock.appendChild(txt("Colors, typography, spacing, radii", { size: 32, weight: "Semi Bold", color: "#121218", letterSpacing: -0.5 }))
  titleBlock.appendChild(txt("Every CSS variable here is wired into Tailwind classes via the @theme inline block in index.css. Imported into Figma as variables in the SIRP/Colors collection with Light and Dark modes.", { size: 14, weight: "Regular", color: "#5a5a69", width: 720 }))
  root.appendChild(titleBlock)

  // Section helper
  const section = (name) => {
    const s = af({ name, dir: "VERTICAL", gap: 16, padding: 0 })
    const lbl = txt(name.toUpperCase(), { size: 11, weight: "Medium", color: "#5a5a69", letterSpacing: 0.5, textCase: "UPPER" })
    s.appendChild(lbl)
    return s
  }
  const grid = (cols) => af({ name: "grid", dir: "HORIZONTAL", gap: 16, padding: 0 })

  // Brand
  const brand = section("Brand")
  const brandRow = grid()
  brandRow.appendChild(colorSwatch("Primary",            "#8e2dff", "--primary"))
  brandRow.appendChild(colorSwatch("Primary FG",         "#ffffff", "--primary-foreground"))
  brandRow.appendChild(colorSwatch("Ring",               "#8e2dff", "--ring"))
  brandRow.appendChild(colorSwatch("Chart 4",            "#a457ff", "--chart-4"))
  brand.appendChild(brandRow)
  root.appendChild(brand)

  // Semantic
  const sem = section("Semantic")
  const semRow = grid()
  semRow.appendChild(colorSwatch("Destructive", "#f87171", "--destructive · alert"))
  semRow.appendChild(colorSwatch("Attention",   "#fb923c", "--attention"))
  semRow.appendChild(colorSwatch("Warning",     "#fbbf24", "--warning · warn"))
  semRow.appendChild(colorSwatch("Success",     "#34d399", "--success · ok"))
  semRow.appendChild(colorSwatch("Info",        "#60a5fa", "--info"))
  sem.appendChild(semRow)
  root.appendChild(sem)

  // Surfaces
  const surf = section("Surfaces")
  const surfRow = grid()
  surfRow.appendChild(colorSwatch("Background",  "#ffffff", "--background"))
  surfRow.appendChild(colorSwatch("Card",        "#ffffff", "--card"))
  surfRow.appendChild(colorSwatch("Muted",       "#f5f5f5", "--muted"))
  surfRow.appendChild(colorSwatch("Border",      "#e5e5e5", "--border"))
  surfRow.appendChild(colorSwatch("Sidebar",     "#fafafa", "--sidebar"))
  surf.appendChild(surfRow)
  root.appendChild(surf)

  // Charts
  const ch = section("Charts")
  const chRow = grid()
  for (let i = 1; i <= 5; i++) {
    chRow.appendChild(colorSwatch("Chart " + i, [, "#8e2dff", "#7224cc", "#5604b6", "#a457ff", "#bb81ff"][i], `--chart-${i}`))
  }
  ch.appendChild(chRow)
  root.appendChild(ch)

  // Typography
  const ty = section("Typography")
  const tyRows = af({ name: "type", dir: "VERTICAL", gap: 16, padding: 0 })
  for (const t of TEXT_STYLES) {
    const row = af({ name: t.name, dir: "HORIZONTAL", gap: 24, padding: [12, 16, 12, 16], stroke: solidPaint("#e5e5e5"), strokeWeight: 1, radius: 8 })
    row.counterAxisAlignItems = "CENTER"
    row.appendChild(txt(t.name, { size: 11, weight: "Semi Bold", color: "#5a5a69", letterSpacing: 0.5, textCase: "UPPER", width: 120 }))
    row.appendChild(txt(`${t.family} · ${t.style} · ${t.size}px`, { size: 11, weight: "Regular", family: "JetBrains Mono", color: "#5a5a69", width: 200 }))
    // Render sample using the actual style
    const sample = txt(
      t.name.includes("Mono") ? "INC-1247" :
      t.name === "Page title" ? "OmniSense — Investigation room" :
      t.name === "Card title" ? "Lateral movement on DC-PROD-01" :
      t.name === "Body" ? "Strong indicators suggest active threat." :
      t.name === "KPI value" ? "92" :
      t.name === "Section label" ? "RECENT ACTIVITY" :
      t.name === "Micro label" ? "MITRE ATT&CK" :
      "Sample",
      { size: t.size, family: t.family, weight: t.style, color: "#121218", letterSpacing: t.letterSpacing, textCase: t.textCase, lineHeight: t.lineHeight }
    )
    row.appendChild(sample)
    tyRows.appendChild(row)
  }
  ty.appendChild(tyRows)
  root.appendChild(ty)

  // Radius
  const ra = section("Radii")
  const raRow = af({ name: "radii", dir: "HORIZONTAL", gap: 24, padding: 0 })
  for (const [name, val] of Object.entries(RADIUS)) {
    const cell = af({ name, dir: "VERTICAL", gap: 8, padding: 0 })
    const square = figma.createRectangle()
    square.resize(64, 64)
    square.cornerRadius = val
    square.fills = [solidPaint("#8e2dff", 0.1)]
    square.strokes = [solidPaint("#8e2dff", 0.25)]
    square.strokeWeight = 1
    cell.appendChild(square)
    cell.appendChild(txt(name, { size: 11, weight: "Semi Bold", family: "JetBrains Mono", color: "#5a5a69", alignHorizontal: "CENTER", width: 64 }))
    cell.appendChild(txt(val + "px", { size: 10, weight: "Regular", family: "JetBrains Mono", color: "#5a5a69", alignHorizontal: "CENTER", width: 64 }))
    raRow.appendChild(cell)
  }
  ra.appendChild(raRow)
  root.appendChild(ra)
}

// ────────────────────────────────────────────────────────────────────────────
// 6. TONE PALETTE PAGE
// ────────────────────────────────────────────────────────────────────────────

const TONE_TOKENS = {
  alert: {
    iconBoxBorder: "#dc2626", iconBoxBorderAlpha: 0.3,
    iconBoxBg:     "#dc2626", iconBoxBgAlpha:     0.1,
    iconBoxText:   "#dc2626",
    chipBorder:    "#dc2626", chipBorderAlpha:    0.25,
    chipBg:        "#dc2626", chipBgAlpha:        0.1,
    chipText:      "#dc2626",
    bgTint:        "#dc2626", bgTintAlpha:        0.05,
    dot:           "#dc2626",
    bar:           "#dc2626",
    label: "Alert",
    desc:  "Critical signals — confirmed threats, malicious enrichment, breached SLA, destructive actions.",
  },
  warn: {
    iconBoxBorder: "#f59e0b", iconBoxBorderAlpha: 0.3,
    iconBoxBg:     "#f59e0b", iconBoxBgAlpha:     0.1,
    iconBoxText:   "#f59e0b",
    chipBorder:    "#f59e0b", chipBorderAlpha:    0.25,
    chipBg:        "#f59e0b", chipBgAlpha:        0.1,
    chipText:      "#d97706",
    bgTint:        "#f59e0b", bgTintAlpha:        0.05,
    dot:           "#f59e0b",
    bar:           "#f59e0b",
    label: "Warn",
    desc:  "Caution signals — suspicious enrichment, warning SLA, attention-needed states.",
  },
  ok: {
    iconBoxBorder: "#10b981", iconBoxBorderAlpha: 0.3,
    iconBoxBg:     "#10b981", iconBoxBgAlpha:     0.1,
    iconBoxText:   "#10b981",
    chipBorder:    "#10b981", chipBorderAlpha:    0.25,
    chipBg:        "#10b981", chipBgAlpha:        0.1,
    chipText:      "#059669",
    bgTint:        "#10b981", bgTintAlpha:        0.05,
    dot:           "#10b981",
    bar:           "#10b981",
    label: "OK",
    desc:  "Positive signals — clean verdicts, healthy SLA, completed states.",
  },
  info: {
    iconBoxBorder: "#8e2dff", iconBoxBorderAlpha: 0.3,
    iconBoxBg:     "#8e2dff", iconBoxBgAlpha:     0.1,
    iconBoxText:   "#8e2dff",
    chipBorder:    "#8e2dff", chipBorderAlpha:    0.25,
    chipBg:        "#8e2dff", chipBgAlpha:        0.1,
    chipText:      "#8e2dff",
    bgTint:        "#8e2dff", bgTintAlpha:        0.05,
    dot:           "#8e2dff",
    bar:           "#8e2dff",
    label: "Info",
    desc:  "Primary signals — done agents, primary CTAs, current stage, brand affordances.",
  },
  muted: {
    iconBoxBorder: "#e5e5e5", iconBoxBorderAlpha: 1,
    iconBoxBg:     "#f5f5f5", iconBoxBgAlpha:     1,
    iconBoxText:   "#5a5a69",
    chipBorder:    "#e5e5e5", chipBorderAlpha:    1,
    chipBg:        "#f5f5f5", chipBgAlpha:        1,
    chipText:      "#5a5a69",
    bgTint:        "#f5f5f5", bgTintAlpha:        0.4,
    dot:           "#5a5a69", // will be made dot/50
    bar:           "#5a5a69",
    label: "Muted",
    desc:  "Default. Everywhere a tone isn't a signal. Status hints, secondary text, neutral chrome.",
  },
}

function toneIconBox(tone, size) {
  const t = TONE_TOKENS[tone]
  const s = size || 36
  const box = af({ name: "icon-box", dir: "HORIZONTAL", w: s, h: s, padding: 0, fill: solidPaint(t.iconBoxBg, t.iconBoxBgAlpha), stroke: solidPaint(t.iconBoxBorder, t.iconBoxBorderAlpha), strokeWeight: 1, radius: 8, primary: "FIXED", counter: "FIXED" })
  box.counterAxisAlignItems = "CENTER"
  box.primaryAxisAlignItems = "CENTER"
  // Inner "icon" as a small filled square — placeholder for any Lucide icon.
  const inner = figma.createRectangle()
  inner.resize(Math.round(s * 0.5), Math.round(s * 0.5))
  inner.cornerRadius = 2
  inner.fills = [solidPaint(t.iconBoxText)]
  inner.opacity = 0.9
  box.appendChild(inner)
  return box
}

function toneChip(tone) {
  const t = TONE_TOKENS[tone]
  const chip = af({ name: tone + "-chip", dir: "HORIZONTAL", gap: 4, padding: [3, 8, 3, 8], fill: solidPaint(t.chipBg, t.chipBgAlpha), stroke: solidPaint(t.chipBorder, t.chipBorderAlpha), strokeWeight: 1, radius: 999 })
  chip.counterAxisAlignItems = "CENTER"
  chip.appendChild(dot(6, t.dot))
  chip.appendChild(txt(t.label.toUpperCase(), { size: 10, weight: "Semi Bold", color: t.chipText, letterSpacing: 0.5, textCase: "UPPER" }))
  return chip
}

function toneBar(tone, widthPct) {
  const t = TONE_TOKENS[tone]
  const track = af({ name: "bar-track", dir: "HORIZONTAL", w: 120, h: 6, padding: 0, fill: solidPaint("#f5f5f5"), radius: 999 })
  track.primaryAxisSizingMode = "FIXED"
  track.counterAxisSizingMode = "FIXED"
  const fill = figma.createRectangle()
  fill.resize(120 * (widthPct || 0.66), 6)
  fill.cornerRadius = 999
  fill.fills = [solidPaint(t.bar)]
  track.appendChild(fill)
  return track
}

function buildTonePage(page) {
  const root = af({ name: "Tone palette", dir: "VERTICAL", padding: [48, 64, 48, 64], gap: 32, fill: solidPaint("#ffffff") })
  page.appendChild(root)

  const titleBlock = af({ name: "title", dir: "VERTICAL", gap: 8, padding: 0 })
  titleBlock.appendChild(txt("FOUNDATIONS", { size: 10, weight: "Semi Bold", color: "#8e2dff", letterSpacing: 1, textCase: "UPPER" }))
  titleBlock.appendChild(txt("Tone palette", { size: 32, weight: "Semi Bold", color: "#121218", letterSpacing: -0.5 }))
  titleBlock.appendChild(txt("The five semantic tones that drive every coloured signal in the app. Muted is default; the other four are signals.", { size: 14, color: "#5a5a69", width: 720 }))
  root.appendChild(titleBlock)

  // Tone grid — each tone shows iconBox, chip, text, bar, tinted bg
  const grid = af({ name: "tone-grid", dir: "HORIZONTAL", gap: 16, padding: 0 })
  for (const tone of TONES) {
    const t = TONE_TOKENS[tone]
    const cell = af({ name: t.label, dir: "VERTICAL", gap: 12, padding: [16, 16, 16, 16], stroke: solidPaint("#e5e5e5"), strokeWeight: 1, radius: 12, w: 168 })
    cell.appendChild(txt(t.label.toUpperCase(), { size: 10, weight: "Semi Bold", color: "#5a5a69", letterSpacing: 0.5, textCase: "UPPER" }))
    cell.appendChild(toneIconBox(tone, 36))
    cell.appendChild(toneChip(tone))
    cell.appendChild(txt("Tone text", { size: 12, weight: "Semi Bold", color: t.chipText, letterSpacing: 0.5, textCase: "UPPER" }))
    cell.appendChild(toneBar(tone, 0.66))
    const tintRow = af({ name: "tint", dir: "HORIZONTAL", padding: [8, 12, 8, 12], fill: solidPaint(t.bgTint, t.bgTintAlpha), radius: 6, stroke: solidPaint(t.iconBoxBorder, 0.15) })
    tintRow.appendChild(txt("Tinted bg", { size: 10, color: t.chipText }))
    cell.appendChild(tintRow)
    grid.appendChild(cell)
  }
  root.appendChild(grid)

  // Decision tree — usage
  const usage = af({ name: "usage", dir: "VERTICAL", gap: 8, padding: 0 })
  usage.appendChild(txt("WHEN TO USE WHICH", { size: 11, weight: "Medium", color: "#5a5a69", letterSpacing: 0.5, textCase: "UPPER" }))
  for (const tone of TONES) {
    const t = TONE_TOKENS[tone]
    const row = af({ name: t.label, dir: "HORIZONTAL", gap: 12, padding: [12, 16, 12, 16], stroke: solidPaint("#e5e5e5"), strokeWeight: 1, radius: 10 })
    row.counterAxisAlignItems = "CENTER"
    row.appendChild(toneIconBox(tone, 32))
    const txtCol = af({ name: "text", dir: "VERTICAL", gap: 2, padding: 0 })
    txtCol.appendChild(txt(t.label, { size: 14, weight: "Semi Bold", color: t.chipText }))
    txtCol.appendChild(txt(t.desc, { size: 12, color: "#5a5a69", width: 640 }))
    row.appendChild(txtCol)
    usage.appendChild(row)
  }
  root.appendChild(usage)
}

// ────────────────────────────────────────────────────────────────────────────
// 7. PRIMITIVES — Component sets with variants
// ────────────────────────────────────────────────────────────────────────────

// Helper: turn a frame into a Component, optionally with variant properties.
// The node must be in the document before createComponentFromNode is called,
// otherwise Figma throws. Appending to the current page first handles this.
function makeComponent(frame, name) {
  if (!frame.parent) figma.currentPage.appendChild(frame)
  const c = figma.createComponentFromNode(frame)
  c.name = name
  return c
}

// ─── Button ────────────────────────────────────────────────────────────────

const BTN_VARIANTS = {
  primary:     { bg: "#8e2dff", fg: "#ffffff", border: null },
  outline:     { bg: "#ffffff", fg: "#121218", border: "#e5e5e5" },
  secondary:   { bg: "#f5f5f5", fg: "#121218", border: null },
  ghost:       { bg: "transparent", fg: "#121218", border: null },
  destructive: { bg: "#f87171", fg: "#ffffff", border: null },
}

function buildButtonInstance(variant, size, hasIcon) {
  const v = BTN_VARIANTS[variant]
  const h = size === "compact" ? 28 : size === "default" ? 36 : 32
  const px = size === "compact" ? 10 : size === "default" ? 16 : 12
  const fontSize = size === "compact" ? 11 : 12

  const btn = af({
    name: `Button=${variant}, Size=${size}, Icon=${hasIcon ? "yes" : "no"}`,
    dir: "HORIZONTAL",
    gap: 6,
    padding: [0, px, 0, px],
    h,
    fill: v.bg !== "transparent" ? solidPaint(v.bg) : null,
    stroke: v.border ? solidPaint(v.border) : null,
    strokeWeight: 1,
    radius: 8,
  })
  btn.primaryAxisAlignItems = "CENTER"
  btn.counterAxisAlignItems = "CENTER"
  btn.counterAxisSizingMode = "FIXED"
  btn.resize(btn.width, h)

  if (hasIcon) {
    const ic = figma.createRectangle()
    ic.resize(14, 14)
    ic.cornerRadius = 2
    ic.fills = [solidPaint(v.fg)]
    ic.name = "icon"
    btn.appendChild(ic)
  }
  btn.appendChild(txt("Action", { size: fontSize, weight: "Medium", color: v.fg }))
  return btn
}

function buildButtonComponentSet() {
  const components = []
  for (const variant of ["primary", "outline", "secondary", "ghost", "destructive"]) {
    for (const size of ["compact", "small", "default"]) {
      for (const hasIcon of [false, true]) {
        const frame = buildButtonInstance(variant, size, hasIcon)
        const c = makeComponent(frame, `Variant=${variant}, Size=${size}, Icon=${hasIcon ? "yes" : "no"}`)
        components.push(c)
      }
    }
  }
  const set = figma.combineAsVariants(components, figma.currentPage)
  set.name = "Button"
  set.layoutMode = "VERTICAL"
  set.itemSpacing = 16
  set.paddingTop = set.paddingRight = set.paddingBottom = set.paddingLeft = 24
  set.primaryAxisSizingMode = set.counterAxisSizingMode = "AUTO"
  set.fills = [solidPaint("#ffffff")]
  set.strokes = [solidPaint("#e5e5e5", 0.5)]
  set.strokeWeight = 1
  set.strokeAlign = "INSIDE"
  set.cornerRadius = 8
  return set
}

// ─── Badge ──────────────────────────────────────────────────────────────────

function buildBadgeInstance(variant) {
  const styles = {
    default:     { bg: "#8e2dff", fg: "#ffffff", border: null },
    secondary:   { bg: "#f5f5f5", fg: "#121218", border: null },
    outline:     { bg: "#ffffff", fg: "#121218", border: "#e5e5e5" },
    destructive: { bg: "#f87171", fg: "#ffffff", border: null },
  }
  const v = styles[variant]
  const b = af({
    name: `Variant=${variant}`,
    dir: "HORIZONTAL",
    gap: 4,
    padding: [2, 8, 2, 8],
    fill: v.bg ? solidPaint(v.bg) : null,
    stroke: v.border ? solidPaint(v.border) : null,
    strokeWeight: 1,
    radius: 999,
  })
  b.counterAxisAlignItems = "CENTER"
  b.appendChild(txt(variant === "default" ? "New" : variant.charAt(0).toUpperCase() + variant.slice(1), { size: 11, weight: "Medium", color: v.fg }))
  return b
}

function buildBadgeComponentSet() {
  const components = []
  for (const variant of ["default", "secondary", "outline", "destructive"]) {
    const frame = buildBadgeInstance(variant)
    components.push(makeComponent(frame, `Variant=${variant}`))
  }
  const set = figma.combineAsVariants(components, figma.currentPage)
  set.name = "Badge"
  set.layoutMode = "VERTICAL"
  set.itemSpacing = 12
  set.paddingTop = set.paddingRight = set.paddingBottom = set.paddingLeft = 24
  set.fills = [solidPaint("#ffffff")]
  set.strokes = [solidPaint("#e5e5e5", 0.5)]
  set.strokeWeight = 1
  set.cornerRadius = 8
  return set
}

// ─── Tone chip (composed) ──────────────────────────────────────────────────

function buildToneChipComponentSet() {
  const components = []
  for (const tone of TONES) {
    const frame = toneChip(tone)
    frame.name = `Tone=${tone}`
    components.push(makeComponent(frame, `Tone=${tone}`))
  }
  const set = figma.combineAsVariants(components, figma.currentPage)
  set.name = "ToneChip"
  set.layoutMode = "VERTICAL"
  set.itemSpacing = 12
  set.paddingTop = set.paddingRight = set.paddingBottom = set.paddingLeft = 24
  set.fills = [solidPaint("#ffffff")]
  set.strokes = [solidPaint("#e5e5e5", 0.5)]
  set.strokeWeight = 1
  set.cornerRadius = 8
  return set
}

// ─── Icon-in-tone-box (composed) ───────────────────────────────────────────

function buildIconBoxComponentSet() {
  const components = []
  const sizes = { small: 28, medium: 36, large: 44 }
  for (const tone of TONES) {
    for (const sizeName of Object.keys(sizes)) {
      const frame = toneIconBox(tone, sizes[sizeName])
      frame.name = `Tone=${tone}, Size=${sizeName}`
      components.push(makeComponent(frame, `Tone=${tone}, Size=${sizeName}`))
    }
  }
  const set = figma.combineAsVariants(components, figma.currentPage)
  set.name = "IconInToneBox"
  set.layoutMode = "VERTICAL"
  set.itemSpacing = 12
  set.paddingTop = set.paddingRight = set.paddingBottom = set.paddingLeft = 24
  set.fills = [solidPaint("#ffffff")]
  set.strokes = [solidPaint("#e5e5e5", 0.5)]
  set.strokeWeight = 1
  set.cornerRadius = 8
  return set
}

// ─── Card ──────────────────────────────────────────────────────────────────

function buildCardInstance(variant) {
  if (variant === "hero") {
    const card = af({
      name: "Variant=hero",
      dir: "VERTICAL",
      gap: 0,
      padding: 0,
      stroke: solidPaint("#8e2dff", 0.2),
      strokeWeight: 1,
      radius: 12,
      fill: solidPaint("#ffffff"),
      w: 360,
    })
    const header = af({ name: "header", dir: "VERTICAL", gap: 0, padding: [12, 20, 12, 20], fill: solidPaint("#8e2dff", 0.05), stroke: solidPaint("#8e2dff", 0.1), strokeWeight: 1, strokeAlign: "INSIDE" })
    header.appendChild(txt("OMNISENSE VERDICT", { size: 11, weight: "Medium", color: "#5a5a69", letterSpacing: 0.5, textCase: "UPPER" }))
    card.appendChild(header)
    const body = af({ name: "body", dir: "VERTICAL", gap: 8, padding: [16, 20, 16, 20] })
    body.appendChild(txt("For OmniSense + verdict surfaces.", { size: 14, color: "#121218" }))
    body.appendChild(txt("ring-1 ring-primary/20", { size: 11, family: "JetBrains Mono", color: "#5a5a69" }))
    card.appendChild(body)
    return card
  }
  // standard
  const card = af({
    name: "Variant=standard",
    dir: "VERTICAL",
    gap: 8,
    padding: [16, 20, 16, 20],
    stroke: solidPaint("#e5e5e5"),
    strokeWeight: 1,
    radius: 12,
    fill: solidPaint("#ffffff"),
    w: 360,
  })
  card.appendChild(txt("SECTION LABEL", { size: 11, weight: "Medium", color: "#5a5a69", letterSpacing: 0.5, textCase: "UPPER" }))
  card.appendChild(txt("Card body content. Card has py-4 built in; you only set px-5.", { size: 14, color: "#121218", width: 320 }))
  return card
}

function buildCardComponentSet() {
  const components = []
  for (const v of ["standard", "hero"]) {
    components.push(makeComponent(buildCardInstance(v), `Variant=${v}`))
  }
  const set = figma.combineAsVariants(components, figma.currentPage)
  set.name = "Card"
  set.layoutMode = "VERTICAL"
  set.itemSpacing = 16
  set.paddingTop = set.paddingRight = set.paddingBottom = set.paddingLeft = 24
  set.fills = [solidPaint("#ffffff")]
  set.strokes = [solidPaint("#e5e5e5", 0.5)]
  set.strokeWeight = 1
  set.cornerRadius = 8
  return set
}

// ─── Avatar ─────────────────────────────────────────────────────────────────

const AVATAR_GRADIENTS = [
  { from: "#7c3aed", to: "#3b82f6" },
  { from: "#ec4899", to: "#f97316" },
  { from: "#06b6d4", to: "#3b82f6" },
  { from: "#10b981", to: "#06b6d4" },
]

function buildAvatarInstance(state, sizeName) {
  const sizes = { xs: 16, sm: 20, md: 28, lg: 36, xl: 48 }
  const s = sizes[sizeName]
  const frame = af({ name: `State=${state}, Size=${sizeName}`, dir: "HORIZONTAL", padding: 0, w: s, h: s, primary: "FIXED", counter: "FIXED", radius: 999, fill: null })
  frame.clipsContent = true
  frame.counterAxisAlignItems = "CENTER"
  frame.primaryAxisAlignItems = "CENTER"
  if (state === "photo") {
    // Placeholder: use a grad fill since plugin sandbox can't fetch images.
    const inner = figma.createEllipse()
    inner.resize(s, s)
    inner.fills = [{
      type: "GRADIENT_LINEAR",
      gradientTransform: [[1, 0, 0], [0, 1, 0]],
      gradientStops: [
        { position: 0, color: { ...parseHex(AVATAR_GRADIENTS[0].from), a: 1 } },
        { position: 1, color: { ...parseHex(AVATAR_GRADIENTS[0].to), a: 1 } },
      ],
    }]
    frame.appendChild(inner)
    frame.appendChild(txt("AK", { size: Math.max(8, s * 0.4), weight: "Bold", color: "#ffffff" }))
  } else if (state === "fallback") {
    const inner = figma.createEllipse()
    inner.resize(s, s)
    inner.fills = [{
      type: "GRADIENT_LINEAR",
      gradientTransform: [[1, 0, 0], [0, 1, 0]],
      gradientStops: [
        { position: 0, color: { ...parseHex(AVATAR_GRADIENTS[1].from), a: 1 } },
        { position: 1, color: { ...parseHex(AVATAR_GRADIENTS[1].to), a: 1 } },
      ],
    }]
    frame.appendChild(inner)
    frame.appendChild(txt("SH", { size: Math.max(8, s * 0.4), weight: "Bold", color: "#ffffff" }))
  } else {
    // unknown
    const inner = figma.createEllipse()
    inner.resize(s, s)
    inner.fills = [solidPaint("#f5f5f5")]
    frame.appendChild(inner)
    frame.appendChild(txt("??", { size: Math.max(8, s * 0.36), weight: "Bold", color: "#5a5a69" }))
  }
  return frame
}

function buildAvatarComponentSet() {
  const components = []
  for (const state of ["photo", "fallback", "unknown"]) {
    for (const size of ["xs", "sm", "md", "lg", "xl"]) {
      const frame = buildAvatarInstance(state, size)
      components.push(makeComponent(frame, `State=${state}, Size=${size}`))
    }
  }
  const set = figma.combineAsVariants(components, figma.currentPage)
  set.name = "Avatar"
  set.layoutMode = "VERTICAL"
  set.itemSpacing = 12
  set.paddingTop = set.paddingRight = set.paddingBottom = set.paddingLeft = 24
  set.fills = [solidPaint("#ffffff")]
  set.strokes = [solidPaint("#e5e5e5", 0.5)]
  set.strokeWeight = 1
  set.cornerRadius = 8
  return set
}

// ─── Input ──────────────────────────────────────────────────────────────────

function buildInputInstance(state) {
  const borderColor = state === "focused" ? "#8e2dff" : "#e5e5e5"
  const borderAlpha = state === "focused" ? 0.4 : 1
  const ring = state === "focused"
  const f = af({
    name: `State=${state}`,
    dir: "HORIZONTAL",
    gap: 8,
    padding: [8, 12, 8, 12],
    w: 280,
    h: 36,
    stroke: solidPaint(borderColor, borderAlpha),
    strokeWeight: 1,
    radius: 8,
    fill: solidPaint("#ffffff"),
  })
  f.counterAxisAlignItems = "CENTER"
  // Tiny search icon placeholder
  const ic = figma.createRectangle()
  ic.resize(14, 14)
  ic.cornerRadius = 2
  ic.fills = [solidPaint("#5a5a69", 0.5)]
  f.appendChild(ic)
  f.appendChild(txt(state === "disabled" ? "Disabled" : "Search by value…", { size: 12, color: state === "disabled" ? "#a0a0a0" : "#5a5a69", opacity: state === "disabled" ? 0.6 : 1 }))
  return f
}

function buildInputComponentSet() {
  const components = []
  for (const state of ["default", "focused", "disabled"]) {
    components.push(makeComponent(buildInputInstance(state), `State=${state}`))
  }
  const set = figma.combineAsVariants(components, figma.currentPage)
  set.name = "Input"
  set.layoutMode = "VERTICAL"
  set.itemSpacing = 12
  set.paddingTop = set.paddingRight = set.paddingBottom = set.paddingLeft = 24
  set.fills = [solidPaint("#ffffff")]
  set.strokes = [solidPaint("#e5e5e5", 0.5)]
  set.strokeWeight = 1
  set.cornerRadius = 8
  return set
}

// ─── Checkbox ──────────────────────────────────────────────────────────────

function buildCheckboxInstance(state) {
  const checked = state === "checked"
  const indeterminate = state === "indeterminate"
  const bg = (checked || indeterminate) ? "#8e2dff" : "#ffffff"
  const border = (checked || indeterminate) ? "#8e2dff" : "#e5e5e5"
  const box = af({
    name: `State=${state}`,
    dir: "HORIZONTAL",
    padding: 0,
    w: 16,
    h: 16,
    primary: "FIXED",
    counter: "FIXED",
    stroke: solidPaint(border),
    strokeWeight: 1.5,
    radius: 4,
    fill: solidPaint(bg),
  })
  box.counterAxisAlignItems = "CENTER"
  box.primaryAxisAlignItems = "CENTER"
  if (checked) {
    // Tiny "✓" placeholder — just a triangle/rect
    const mark = figma.createRectangle()
    mark.resize(8, 2)
    mark.fills = [solidPaint("#ffffff")]
    mark.rotation = -45
    box.appendChild(mark)
  } else if (indeterminate) {
    const mark = figma.createRectangle()
    mark.resize(8, 2)
    mark.fills = [solidPaint("#ffffff")]
    box.appendChild(mark)
  }
  if (state === "disabled") box.opacity = 0.4
  return box
}

function buildCheckboxComponentSet() {
  const components = []
  for (const state of ["unchecked", "checked", "indeterminate", "disabled"]) {
    components.push(makeComponent(buildCheckboxInstance(state), `State=${state}`))
  }
  const set = figma.combineAsVariants(components, figma.currentPage)
  set.name = "Checkbox"
  set.layoutMode = "VERTICAL"
  set.itemSpacing = 12
  set.paddingTop = set.paddingRight = set.paddingBottom = set.paddingLeft = 24
  set.fills = [solidPaint("#ffffff")]
  set.strokes = [solidPaint("#e5e5e5", 0.5)]
  set.strokeWeight = 1
  set.cornerRadius = 8
  return set
}

// ─── Switch ────────────────────────────────────────────────────────────────

function buildSwitchInstance(state) {
  const on = state === "on"
  const track = af({
    name: `State=${state}`,
    dir: "HORIZONTAL",
    padding: 2,
    w: 36,
    h: 20,
    primary: "FIXED",
    counter: "FIXED",
    radius: 999,
    fill: solidPaint(on ? "#8e2dff" : "#e5e5e5"),
  })
  track.primaryAxisAlignItems = on ? "MAX" : "MIN"
  const knob = figma.createEllipse()
  knob.resize(16, 16)
  knob.fills = [solidPaint("#ffffff")]
  knob.effects = [{ type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.15 }, offset: { x: 0, y: 1 }, radius: 2, spread: 0, visible: true, blendMode: "NORMAL" }]
  track.appendChild(knob)
  if (state === "disabled") track.opacity = 0.4
  return track
}

function buildSwitchComponentSet() {
  const components = []
  for (const state of ["off", "on", "disabled"]) {
    components.push(makeComponent(buildSwitchInstance(state), `State=${state}`))
  }
  const set = figma.combineAsVariants(components, figma.currentPage)
  set.name = "Switch"
  set.layoutMode = "VERTICAL"
  set.itemSpacing = 12
  set.paddingTop = set.paddingRight = set.paddingBottom = set.paddingLeft = 24
  set.fills = [solidPaint("#ffffff")]
  set.strokes = [solidPaint("#e5e5e5", 0.5)]
  set.strokeWeight = 1
  set.cornerRadius = 8
  return set
}

// ─── Tabs (single variant — manual underline strip) ────────────────────────

function buildTabsInstance() {
  const root = af({
    name: "Tabs",
    dir: "HORIZONTAL",
    gap: 0,
    padding: 0,
    h: 40,
    counter: "FIXED",
    fill: solidPaint("#ffffff"),
    stroke: solidPaint("#e5e5e5", 0.5),
    strokeWeight: 1,
    strokeAlign: "INSIDE",
  })
  const tabs = [
    { label: "Overview",  active: true },
    { label: "OmniSense", active: false },
    { label: "Artifacts", active: false, count: 12 },
    { label: "Entities",  active: false, count: 3 },
  ]
  for (const t of tabs) {
    const tab = af({ name: t.label, dir: "HORIZONTAL", gap: 6, padding: [0, 14, 0, 14] })
    tab.counterAxisAlignItems = "CENTER"
    tab.primaryAxisAlignItems = "CENTER"
    tab.appendChild(txt(t.label, { size: 12, weight: t.active ? "Semi Bold" : "Medium", color: t.active ? "#121218" : "#5a5a69" }))
    if (t.count !== undefined) {
      const badge = af({ name: "count", dir: "HORIZONTAL", padding: [1, 6, 1, 6], fill: solidPaint(t.active ? "#8e2dff" : "#f5f5f5", t.active ? 0.15 : 1), radius: 999 })
      badge.appendChild(txt(String(t.count), { size: 10, weight: "Semi Bold", color: t.active ? "#8e2dff" : "#5a5a69" }))
      tab.appendChild(badge)
    }
    if (t.active) {
      // Underline indicator at bottom of tab
      const underline = figma.createRectangle()
      underline.resize(36, 2)
      underline.fills = [solidPaint("#8e2dff")]
      underline.cornerRadius = 1
      // Add to absolute position — actually let's keep it as a child for layout simplicity
      // Skipping the underline in component to keep auto-layout clean.
    }
    root.appendChild(tab)
  }
  return root
}

function buildTabsComponent() {
  const inst = buildTabsInstance()
  const c = makeComponent(inst, "Tabs")
  return c
}

// ─── Tooltip (visual) ──────────────────────────────────────────────────────

function buildTooltipInstance() {
  const t = af({
    name: "Tooltip",
    dir: "HORIZONTAL",
    padding: [6, 10, 6, 10],
    fill: solidPaint("#121218"),
    radius: 6,
  })
  t.appendChild(txt("I'm a tooltip", { size: 11, color: "#ffffff" }))
  t.effects = [{ type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.12 }, offset: { x: 0, y: 4 }, radius: 8, spread: 0, visible: true, blendMode: "NORMAL" }]
  return t
}

// ─── Popover (visual) ──────────────────────────────────────────────────────

function buildPopoverInstance() {
  const p = af({
    name: "Popover",
    dir: "VERTICAL",
    gap: 8,
    padding: [12, 16, 12, 16],
    fill: solidPaint("#ffffff"),
    stroke: solidPaint("#e5e5e5"),
    strokeWeight: 1,
    radius: 10,
    w: 240,
  })
  p.appendChild(txt("POPOVER CONTENT", { size: 11, weight: "Semi Bold", color: "#5a5a69", letterSpacing: 0.5, textCase: "UPPER" }))
  p.appendChild(txt("Popovers can contain any content — forms, menus, info panels.", { size: 12, color: "#121218", width: 200 }))
  p.effects = [{ type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.12 }, offset: { x: 0, y: 8 }, radius: 16, spread: 0, visible: true, blendMode: "NORMAL" }]
  return p
}

// ─── Skeleton ──────────────────────────────────────────────────────────────

function buildSkeletonInstance(shape) {
  if (shape === "circle") {
    const c = figma.createEllipse()
    c.resize(28, 28)
    c.fills = [solidPaint("#e5e5e5")]
    c.name = "Shape=circle"
    return c
  }
  const r = figma.createRectangle()
  r.resize(180, 12)
  r.fills = [solidPaint("#e5e5e5")]
  r.cornerRadius = 4
  r.name = "Shape=bar"
  return r
}

// ────────────────────────────────────────────────────────────────────────────
// 8. DOMAIN PATTERNS
// ────────────────────────────────────────────────────────────────────────────

// ─── Verdict callout (5 tone variants) ──────────────────────────────────────

function buildVerdictCallout(tone, title, detail) {
  const t = TONE_TOKENS[tone]
  const root = af({
    name: `Tone=${tone}`,
    dir: "HORIZONTAL",
    gap: 14,
    padding: [16, 20, 16, 20],
    fill: solidPaint(t.bgTint, t.bgTintAlpha),
    w: 560,
  })
  root.counterAxisAlignItems = "MIN"
  // Icon box
  const ib = af({
    name: "icon-box",
    dir: "HORIZONTAL",
    padding: 0,
    w: 48,
    h: 48,
    primary: "FIXED",
    counter: "FIXED",
    fill: solidPaint(t.iconBoxBg, t.iconBoxBgAlpha),
    stroke: solidPaint(t.iconBoxBorder, t.iconBoxBorderAlpha),
    strokeWeight: 1,
    radius: 12,
  })
  ib.counterAxisAlignItems = "CENTER"
  ib.primaryAxisAlignItems = "CENTER"
  const inner = figma.createRectangle()
  inner.resize(24, 24)
  inner.cornerRadius = 4
  inner.fills = [solidPaint(t.iconBoxText)]
  ib.appendChild(inner)
  root.appendChild(ib)

  const text = af({ name: "text", dir: "VERTICAL", gap: 4, padding: 0 })
  text.appendChild(txt(title || t.label + " state", { size: 18, weight: "Semi Bold", color: t.chipText, letterSpacing: -0.2 }))
  text.appendChild(txt(detail || t.desc, { size: 14, color: "#121218", width: 460 }))
  root.appendChild(text)

  return root
}

function buildVerdictCalloutComponentSet() {
  const components = []
  const titles = {
    alert: ["Confirmed Active Threat", "High-confidence detection across 12 IOCs and 4 correlated alerts."],
    warn:  ["Likely True Positive",    "Strong indicators suggest active threat. Escalation recommended."],
    ok:    ["Closed — Non-Threat",     "Analysis concluded no malicious activity."],
    info:  ["Needs Analyst Review",    "Moderate confidence with mixed signals. Manual triage required."],
    muted: ["Insufficient Evidence",   "Low confidence across enriched signals."],
  }
  for (const tone of TONES) {
    const [title, detail] = titles[tone]
    const frame = buildVerdictCallout(tone, title, detail)
    frame.name = `Tone=${tone}`
    components.push(makeComponent(frame, `Tone=${tone}`))
  }
  const set = figma.combineAsVariants(components, figma.currentPage)
  set.name = "VerdictCallout"
  set.layoutMode = "VERTICAL"
  set.itemSpacing = 16
  set.paddingTop = set.paddingRight = set.paddingBottom = set.paddingLeft = 24
  set.fills = [solidPaint("#ffffff")]
  set.strokes = [solidPaint("#e5e5e5", 0.5)]
  set.strokeWeight = 1
  set.cornerRadius = 8
  return set
}

// ─── Stat tile ─────────────────────────────────────────────────────────────

function buildStatTile(label, value, sub, tone, withProgress) {
  const t = TONE_TOKENS[tone]
  const tile = af({
    name: `Tone=${tone}, Progress=${withProgress ? "yes" : "no"}`,
    dir: "VERTICAL",
    gap: 4,
    padding: [10, 20, 10, 20],
    fill: solidPaint("#ffffff"),
    stroke: solidPaint("#e5e5e5"),
    strokeWeight: 1,
    radius: 0,
    w: 200,
  })
  const top = af({ name: "top", dir: "HORIZONTAL", padding: 0 })
  top.primaryAxisSizingMode = "FIXED"
  top.counterAxisAlignItems = "CENTER"
  top.resize(160, top.height)
  const lbl = txt(label.toUpperCase(), { size: 11, weight: "Medium", color: "#5a5a69", letterSpacing: 0.5, textCase: "UPPER" })
  top.appendChild(lbl)
  const ib = toneIconBox("muted", 32)
  top.appendChild(spacer(160 - 100, 0))
  top.appendChild(ib)
  tile.appendChild(top)
  tile.appendChild(txt(String(value), { size: 24, weight: "Medium", color: "#121218", letterSpacing: -0.4 }))
  if (withProgress) {
    const prow = af({ name: "progress", dir: "HORIZONTAL", gap: 8, padding: 0 })
    prow.counterAxisAlignItems = "CENTER"
    prow.appendChild(toneBar(tone, 0.5))
    prow.appendChild(txt(sub || "", { size: 10, color: "#5a5a69" }))
    tile.appendChild(prow)
  } else {
    const subRow = af({ name: "sub", dir: "HORIZONTAL", gap: 6, padding: 0 })
    subRow.counterAxisAlignItems = "CENTER"
    if (tone !== "muted") subRow.appendChild(dot(6, t.dot))
    subRow.appendChild(txt(sub || "", { size: 12, color: "#5a5a69" }))
    tile.appendChild(subRow)
  }
  return tile
}

// ─── Header pill cluster ───────────────────────────────────────────────────

function buildHeaderPillCluster() {
  const root = af({ name: "HeaderPillCluster", dir: "HORIZONTAL", gap: 6, padding: 0 })
  root.counterAxisAlignItems = "CENTER"

  // Severity chip
  const sev = af({ dir: "HORIZONTAL", gap: 4, padding: [3, 8, 3, 8], fill: solidPaint(TONE_TOKENS.alert.chipBg, TONE_TOKENS.alert.chipBgAlpha), stroke: solidPaint(TONE_TOKENS.alert.chipBorder, TONE_TOKENS.alert.chipBorderAlpha), strokeWeight: 1, radius: 999 })
  sev.counterAxisAlignItems = "CENTER"
  sev.appendChild(dot(6, TONE_TOKENS.alert.dot))
  sev.appendChild(txt("CRITICAL", { size: 11, weight: "Semi Bold", color: TONE_TOKENS.alert.chipText, letterSpacing: 0.5, textCase: "UPPER" }))
  root.appendChild(sev)

  // Status badge
  const status = af({ dir: "HORIZONTAL", padding: [2, 8, 2, 8], fill: solidPaint("#f5f5f5"), radius: 999 })
  status.appendChild(txt("Investigating", { size: 11, weight: "Medium", color: "#121218" }))
  root.appendChild(status)

  // Priority badge
  const priority = af({ dir: "HORIZONTAL", padding: [2, 8, 2, 8], stroke: solidPaint("#e5e5e5"), strokeWeight: 1, radius: 999 })
  priority.appendChild(txt("P1", { size: 11, weight: "Bold", family: "JetBrains Mono", color: "#121218" }))
  root.appendChild(priority)

  return root
}

// ─── Activity timeline event ───────────────────────────────────────────────

function buildActivityEvent(title, detail, when) {
  const row = af({ name: "ActivityEvent", dir: "HORIZONTAL", gap: 12, padding: 0 })
  row.counterAxisAlignItems = "MIN"

  const ib = toneIconBox("info", 24)
  ib.cornerRadius = 999
  row.appendChild(ib)

  const text = af({ dir: "VERTICAL", gap: 2, padding: 0 })
  const topLine = af({ dir: "HORIZONTAL", gap: 8, padding: 0 })
  topLine.counterAxisAlignItems = "BASELINE"
  topLine.appendChild(txt(title, { size: 14, weight: "Medium", color: "#121218", width: 360 }))
  topLine.appendChild(txt(when, { size: 10, family: "JetBrains Mono", color: "#5a5a69" }))
  text.appendChild(topLine)
  text.appendChild(txt(detail, { size: 12, color: "#5a5a69", width: 440 }))
  row.appendChild(text)
  return row
}

// ─── Comment rows (system + analyst) ───────────────────────────────────────

function buildCommentRow(kind) {
  const isSystem = kind === "system"
  const row = af({
    name: `Kind=${kind}`,
    dir: "HORIZONTAL",
    gap: 12,
    padding: [12, 20, 12, 20],
    fill: isSystem ? solidPaint("#8e2dff", 0.03) : null,
    w: 560,
  })
  row.counterAxisAlignItems = "MIN"
  if (isSystem) {
    const ib = toneIconBox("info", 28)
    row.appendChild(ib)
  } else {
    row.appendChild(buildAvatarInstance("photo", "md"))
  }
  const text = af({ dir: "VERTICAL", gap: 4, padding: 0 })
  const top = af({ dir: "HORIZONTAL", gap: 8, padding: 0 })
  top.counterAxisAlignItems = "BASELINE"
  top.appendChild(txt(isSystem ? "OmniSense" : "Sara Hassan", { size: 14, weight: "Semi Bold", color: "#121218" }))
  top.appendChild(txt(isSystem ? "CO-ANALYST" : "LEAD ANALYST", { size: 10, weight: "Semi Bold", color: isSystem ? "#8e2dff" : "#5a5a69", letterSpacing: 0.5, textCase: "UPPER" }))
  top.appendChild(txt("2h ago", { size: 10, family: "JetBrains Mono", color: "#5a5a69" }))
  text.appendChild(top)
  text.appendChild(txt(
    isSystem
      ? "Recommended containment sequence posted — isolate affected hosts before domain controller patching."
      : "Reviewing containment scope. Confirming affected subnet list with network team by EOD.",
    { size: 14, color: "#121218", width: 480 }
  ))
  row.appendChild(text)
  return row
}

function buildCommentRowComponentSet() {
  const components = []
  for (const k of ["system", "analyst"]) {
    components.push(makeComponent(buildCommentRow(k), `Kind=${k}`))
  }
  const set = figma.combineAsVariants(components, figma.currentPage)
  set.name = "CommentRow"
  set.layoutMode = "VERTICAL"
  set.itemSpacing = 16
  set.paddingTop = set.paddingRight = set.paddingBottom = set.paddingLeft = 24
  set.fills = [solidPaint("#ffffff")]
  set.strokes = [solidPaint("#e5e5e5", 0.5)]
  set.strokeWeight = 1
  set.cornerRadius = 8
  return set
}

// ─── Empty state ───────────────────────────────────────────────────────────

function buildEmptyState() {
  const root = af({ name: "EmptyState", dir: "VERTICAL", gap: 8, padding: [32, 24, 32, 24], w: 360 })
  root.counterAxisAlignItems = "CENTER"
  root.appendChild(toneIconBox("muted", 40))
  root.appendChild(txt("No items match", { size: 14, weight: "Medium", color: "#121218" }))
  root.appendChild(txt("Try clearing your search or filters.", { size: 12, color: "#5a5a69" }))
  return root
}

// ────────────────────────────────────────────────────────────────────────────
// 9. PAGE BUILDERS
// ────────────────────────────────────────────────────────────────────────────

function pageTitleBlock(eyebrow, title, description) {
  const root = af({ dir: "VERTICAL", gap: 8, padding: 0 })
  root.appendChild(txt(eyebrow.toUpperCase(), { size: 10, weight: "Semi Bold", color: "#8e2dff", letterSpacing: 1, textCase: "UPPER" }))
  root.appendChild(txt(title, { size: 32, weight: "Semi Bold", color: "#121218", letterSpacing: -0.5 }))
  if (description) root.appendChild(txt(description, { size: 14, color: "#5a5a69", width: 720 }))
  return root
}

function buildComponentsPage(page) {
  const root = af({ name: "Components root", dir: "VERTICAL", padding: [48, 64, 48, 64], gap: 32, fill: solidPaint("#ffffff") })
  page.appendChild(root)
  root.appendChild(pageTitleBlock("Library", "Components", "Real Figma Component Sets with variants. Drag instances onto canvases and switch variants in the right panel."))

  // Build each primitive as a component set.
  const btn = buildButtonComponentSet()
  root.appendChild(btn)
  const badge = buildBadgeComponentSet()
  root.appendChild(badge)
  const chip = buildToneChipComponentSet()
  root.appendChild(chip)
  const ib = buildIconBoxComponentSet()
  root.appendChild(ib)
  const card = buildCardComponentSet()
  root.appendChild(card)
  const avatar = buildAvatarComponentSet()
  root.appendChild(avatar)
  const input = buildInputComponentSet()
  root.appendChild(input)
  const cb = buildCheckboxComponentSet()
  root.appendChild(cb)
  const sw = buildSwitchComponentSet()
  root.appendChild(sw)

  // Singletons
  const tabsSection = af({ dir: "VERTICAL", gap: 12, padding: [24, 24, 24, 24], stroke: solidPaint("#e5e5e5", 0.5), strokeWeight: 1, radius: 8, fill: solidPaint("#ffffff") })
  tabsSection.appendChild(txt("Tabs", { size: 16, weight: "Semi Bold" }))
  tabsSection.appendChild(buildTabsComponent())
  root.appendChild(tabsSection)

  const tooltipSection = af({ dir: "VERTICAL", gap: 12, padding: [24, 24, 24, 24], stroke: solidPaint("#e5e5e5", 0.5), strokeWeight: 1, radius: 8, fill: solidPaint("#ffffff") })
  tooltipSection.appendChild(txt("Tooltip", { size: 16, weight: "Semi Bold" }))
  const tooltipInst = buildTooltipInstance()
  const tooltipComp = makeComponent(tooltipInst, "Tooltip")
  tooltipSection.appendChild(tooltipComp)
  root.appendChild(tooltipSection)

  const popoverSection = af({ dir: "VERTICAL", gap: 12, padding: [24, 24, 24, 24], stroke: solidPaint("#e5e5e5", 0.5), strokeWeight: 1, radius: 8, fill: solidPaint("#ffffff") })
  popoverSection.appendChild(txt("Popover", { size: 16, weight: "Semi Bold" }))
  const popoverComp = makeComponent(buildPopoverInstance(), "Popover")
  popoverSection.appendChild(popoverComp)
  root.appendChild(popoverSection)

  const skSection = af({ dir: "VERTICAL", gap: 12, padding: [24, 24, 24, 24], stroke: solidPaint("#e5e5e5", 0.5), strokeWeight: 1, radius: 8, fill: solidPaint("#ffffff") })
  skSection.appendChild(txt("Skeleton", { size: 16, weight: "Semi Bold" }))
  const skRow = af({ dir: "HORIZONTAL", gap: 12, padding: 0 })
  const skBar = buildSkeletonInstance("bar")
  const skBarComp = makeComponent(skBar, "Shape=bar")
  const skCircle = buildSkeletonInstance("circle")
  const skCircleComp = makeComponent(skCircle, "Shape=circle")
  const skSet = figma.combineAsVariants([skBarComp, skCircleComp], figma.currentPage)
  skSet.name = "Skeleton"
  skSet.layoutMode = "HORIZONTAL"
  skSet.itemSpacing = 16
  skSet.paddingTop = skSet.paddingRight = skSet.paddingBottom = skSet.paddingLeft = 16
  skSection.appendChild(skSet)
  root.appendChild(skSection)
}

function buildPatternsPage(page) {
  const root = af({ name: "Patterns root", dir: "VERTICAL", padding: [48, 64, 48, 64], gap: 32, fill: solidPaint("#ffffff") })
  page.appendChild(root)
  root.appendChild(pageTitleBlock("Patterns", "Composed patterns", "Domain-specific recipes that combine primitives + tokens. Use these directly; don't re-roll your own."))

  // Verdict callout
  const vc = buildVerdictCalloutComponentSet()
  root.appendChild(vc)

  // Stat tile examples (not a component set — just a row of variants)
  const statsCard = af({ dir: "VERTICAL", gap: 12, padding: [24, 24, 24, 24], stroke: solidPaint("#e5e5e5", 0.5), strokeWeight: 1, radius: 8, fill: solidPaint("#ffffff") })
  statsCard.appendChild(txt("StatTile", { size: 16, weight: "Semi Bold" }))
  const statsRow = af({ dir: "HORIZONTAL", gap: 0, padding: 0 })
  statsRow.appendChild(buildStatTile("IOCs", 12, "7 malicious · 2 suspicious", "alert"))
  statsRow.appendChild(buildStatTile("Alerts", 4, "3 open · 1 closed", "warn"))
  statsRow.appendChild(buildStatTile("Entities", 3, "1 critical risk", "alert"))
  statsRow.appendChild(buildStatTile("Tasks", "2/4", "50% complete", "info", true))
  statsCard.appendChild(statsRow)
  root.appendChild(statsCard)

  // Header pill cluster
  const hpCard = af({ dir: "VERTICAL", gap: 12, padding: [24, 24, 24, 24], stroke: solidPaint("#e5e5e5", 0.5), strokeWeight: 1, radius: 8, fill: solidPaint("#ffffff") })
  hpCard.appendChild(txt("HeaderPillCluster", { size: 16, weight: "Semi Bold" }))
  hpCard.appendChild(buildHeaderPillCluster())
  root.appendChild(hpCard)

  // Activity timeline
  const acCard = af({ dir: "VERTICAL", gap: 12, padding: [24, 24, 24, 24], stroke: solidPaint("#e5e5e5", 0.5), strokeWeight: 1, radius: 8, fill: solidPaint("#ffffff") })
  acCard.appendChild(txt("ActivityEvent", { size: 16, weight: "Semi Bold" }))
  const events = af({ dir: "VERTICAL", gap: 12, padding: 0 })
  events.appendChild(buildActivityEvent("Advisory created", "Opened by Ahmed from Triage-EU queue", "12 min ago"))
  events.appendChild(buildActivityEvent("OmniSense analysis completed", "12 IOCs enriched · 95% confidence", "10 min ago"))
  events.appendChild(buildActivityEvent("Disposition recorded", "Marked true-positive after analyst review", "3 min ago"))
  acCard.appendChild(events)
  root.appendChild(acCard)

  // Comment rows
  const cmtSet = buildCommentRowComponentSet()
  root.appendChild(cmtSet)

  // Empty state
  const esCard = af({ dir: "VERTICAL", gap: 12, padding: [24, 24, 24, 24], stroke: solidPaint("#e5e5e5", 0.5), strokeWeight: 1, radius: 8, fill: solidPaint("#ffffff") })
  esCard.appendChild(txt("EmptyState", { size: 16, weight: "Semi Bold" }))
  esCard.appendChild(buildEmptyState())
  root.appendChild(esCard)
}

// ────────────────────────────────────────────────────────────────────────────
// 10. SAMPLE SCREEN — Incident detail (Overview tab)
// ────────────────────────────────────────────────────────────────────────────

function buildIncidentOverviewMock(page) {
  const screen = af({
    name: "Incident detail · Overview",
    dir: "VERTICAL",
    padding: 0,
    gap: 0,
    w: 1280,
    fill: solidPaint("#ffffff"),
  })
  screen.counterAxisSizingMode = "FIXED"
  screen.primaryAxisSizingMode = "AUTO"
  page.appendChild(screen)

  // Severity stripe
  const stripe = figma.createRectangle()
  stripe.resize(1280, 3)
  stripe.fills = [solidPaint("#dc2626", 0.55)]
  stripe.name = "severity-stripe"
  screen.appendChild(stripe)

  // Sticky header
  const header = af({ dir: "HORIZONTAL", gap: 12, padding: [10, 20, 10, 20], h: 48, w: 1280, fill: solidPaint("#ffffff"), stroke: solidPaint("#e5e5e5"), strokeWeight: 1, strokeAlign: "INSIDE", primary: "FIXED", counter: "FIXED" })
  header.counterAxisAlignItems = "CENTER"
  // Back chevron placeholder
  const back = figma.createRectangle()
  back.resize(16, 16)
  back.fills = [solidPaint("#5a5a69")]
  back.name = "back"
  header.appendChild(back)
  // ID badge
  const idBadge = af({ dir: "HORIZONTAL", padding: [2, 6, 2, 6], stroke: solidPaint("#e5e5e5"), strokeWeight: 1, radius: 4 })
  idBadge.appendChild(txt("INC-1247", { size: 10, family: "JetBrains Mono", color: "#5a5a69" }))
  header.appendChild(idBadge)
  // Severity dot
  header.appendChild(dot(8, "#dc2626"))
  // Title
  header.appendChild(txt("Lateral movement on DC-PROD-01", { size: 14, weight: "Semi Bold", color: "#121218", width: 360 }))
  // Spacer
  header.appendChild(spacer(140, 0))
  // Pills
  header.appendChild(buildHeaderPillCluster())
  // Spacer + actions
  header.appendChild(spacer(80, 0))
  header.appendChild(buildButtonInstance("primary", "small", false))
  header.appendChild(buildButtonInstance("outline", "small", false))
  screen.appendChild(header)

  // Tab strip
  const tabRow = af({ dir: "HORIZONTAL", gap: 0, padding: 0, h: 40, w: 1280, fill: solidPaint("#ffffff"), stroke: solidPaint("#e5e5e5"), strokeWeight: 1, strokeAlign: "INSIDE", primary: "FIXED", counter: "FIXED" })
  tabRow.counterAxisAlignItems = "CENTER"
  const tabs = [
    { label: "Overview", active: true },
    { label: "OmniSense" }, { label: "Artifacts", count: 12 },
    { label: "Entities", count: 3 }, { label: "Tasks", count: 4 },
    { label: "Comments" }, { label: "Alerts" }, { label: "Logs" },
  ]
  for (const t of tabs) {
    const tab = af({ dir: "HORIZONTAL", gap: 6, padding: [0, 14, 0, 14] })
    tab.counterAxisAlignItems = "CENTER"
    tab.appendChild(txt(t.label, { size: 12, weight: t.active ? "Semi Bold" : "Medium", color: t.active ? "#121218" : "#5a5a69" }))
    if (t.count !== undefined) {
      const cb = af({ dir: "HORIZONTAL", padding: [1, 6, 1, 6], fill: solidPaint(t.active ? "#8e2dff" : "#f5f5f5", t.active ? 0.15 : 1), radius: 999 })
      cb.appendChild(txt(String(t.count), { size: 10, weight: "Semi Bold", color: t.active ? "#8e2dff" : "#5a5a69" }))
      tab.appendChild(cb)
    }
    tabRow.appendChild(tab)
  }
  screen.appendChild(tabRow)

  // Content (padded)
  const content = af({ dir: "VERTICAL", gap: 16, padding: [24, 24, 48, 24], w: 1280, fill: solidPaint("#fafafa"), primary: "FIXED", counter: "FIXED" })
  content.counterAxisSizingMode = "FIXED"
  content.resize(1280, 800)

  // Overview card
  const ovCard = af({ dir: "VERTICAL", gap: 0, padding: 0, w: 1232, fill: solidPaint("#ffffff"), stroke: solidPaint("#e5e5e5"), strokeWeight: 1, radius: 12, primary: "AUTO", counter: "FIXED" })
  // Row 1: ID + title + source
  const r1 = af({ dir: "HORIZONTAL", gap: 12, padding: [8, 20, 8, 20] })
  r1.counterAxisAlignItems = "CENTER"
  r1.appendChild(txt("INC-1247", { size: 12, family: "JetBrains Mono", color: "#5a5a69" }))
  const div = figma.createRectangle()
  div.resize(1, 14); div.fills = [solidPaint("#e5e5e5")]
  r1.appendChild(div)
  r1.appendChild(txt("Lateral movement on DC-PROD-01", { size: 16, weight: "Semi Bold", color: "#121218", width: 700 }))
  // Source brand badge
  const src = af({ dir: "HORIZONTAL", gap: 8, padding: [6, 12, 6, 12], fill: solidPaint("#8e2dff"), radius: 8, w: 66, h: 44 })
  src.primaryAxisAlignItems = "CENTER"
  src.counterAxisAlignItems = "CENTER"
  src.appendChild(txt("OmniSense", { size: 11, weight: "Semi Bold", color: "#ffffff" }))
  r1.appendChild(src)
  ovCard.appendChild(r1)
  // Row 2: pills
  const r2 = af({ dir: "HORIZONTAL", gap: 8, padding: [8, 20, 8, 20], stroke: solidPaint("#e5e5e5"), strokeWeight: 1, strokeAlign: "INSIDE" })
  r2.counterAxisAlignItems = "CENTER"
  r2.appendChild(buildHeaderPillCluster())
  ovCard.appendChild(r2)
  // Row 4: stats strip
  const r4 = af({ dir: "HORIZONTAL", gap: 0, padding: 0, stroke: solidPaint("#e5e5e5"), strokeWeight: 1, strokeAlign: "INSIDE" })
  r4.appendChild(buildStatTile("IOCs", 12, "7 malicious · 2 suspicious", "alert"))
  r4.appendChild(buildStatTile("Alerts", 4, "3 open · 1 closed", "warn"))
  r4.appendChild(buildStatTile("Entities", 3, "1 critical risk", "alert"))
  r4.appendChild(buildStatTile("Tasks", "2/4", "50% complete", "info", true))
  ovCard.appendChild(r4)
  content.appendChild(ovCard)

  // Verdict callout card
  const vcCard = af({ dir: "VERTICAL", gap: 0, padding: 0, w: 1232, fill: solidPaint("#ffffff"), stroke: solidPaint("#8e2dff", 0.2), strokeWeight: 1, radius: 12 })
  const vcHeader = af({ dir: "HORIZONTAL", gap: 8, padding: [12, 20, 12, 20], fill: solidPaint("#8e2dff", 0.05), stroke: solidPaint("#8e2dff", 0.1), strokeWeight: 1, strokeAlign: "INSIDE" })
  vcHeader.counterAxisAlignItems = "CENTER"
  vcHeader.appendChild(txt("OMNISENSE CO-ANALYST · INVESTIGATION ROOM", { size: 11, weight: "Medium", color: "#5a5a69", letterSpacing: 0.5, textCase: "UPPER" }))
  vcCard.appendChild(vcHeader)
  vcCard.appendChild(buildVerdictCallout("alert", "Confirmed Active Threat", "High-confidence detection across 12 IOCs and 4 correlated alerts. Immediate containment recommended."))
  content.appendChild(vcCard)

  // MITRE card
  const mitre = af({ dir: "HORIZONTAL", gap: 8, padding: [12, 20, 12, 20], w: 1232, fill: solidPaint("#ffffff"), stroke: solidPaint("#e5e5e5"), strokeWeight: 1, radius: 12 })
  mitre.counterAxisAlignItems = "CENTER"
  mitre.appendChild(txt("MITRE ATT&CK", { size: 10, weight: "Semi Bold", color: "#5a5a69", letterSpacing: 0.5, textCase: "UPPER" }))
  for (const tech of ["T1021.001", "T1059.003", "T1003.001"]) {
    const chip = af({ dir: "HORIZONTAL", padding: [2, 8, 2, 8], fill: solidPaint("#8e2dff", 0.08), stroke: solidPaint("#8e2dff", 0.2), strokeWeight: 1, radius: 4 })
    chip.appendChild(txt(tech, { size: 11, weight: "Semi Bold", family: "JetBrains Mono", color: "#8e2dff" }))
    mitre.appendChild(chip)
  }
  content.appendChild(mitre)

  // Recent Activity card
  const ra = af({ dir: "VERTICAL", gap: 0, padding: 0, w: 1232, fill: solidPaint("#ffffff"), stroke: solidPaint("#e5e5e5"), strokeWeight: 1, radius: 12 })
  const raHeader = af({ dir: "HORIZONTAL", padding: [12, 20, 12, 20], stroke: solidPaint("#e5e5e5"), strokeWeight: 1, strokeAlign: "INSIDE" })
  raHeader.appendChild(txt("RECENT ACTIVITY", { size: 11, weight: "Medium", color: "#5a5a69", letterSpacing: 0.5, textCase: "UPPER" }))
  ra.appendChild(raHeader)
  const raBody = af({ dir: "VERTICAL", gap: 12, padding: [16, 20, 16, 20] })
  raBody.appendChild(buildActivityEvent("Advisory created", "Opened by Ahmed from Triage-EU queue", "12 min ago"))
  raBody.appendChild(buildActivityEvent("OmniSense analysis completed", "12 IOCs enriched · 95% confidence", "10 min ago"))
  raBody.appendChild(buildActivityEvent("Disposition recorded", "Marked true-positive after analyst review", "3 min ago"))
  ra.appendChild(raBody)
  content.appendChild(ra)

  screen.appendChild(content)
}

// ────────────────────────────────────────────────────────────────────────────
// 11. COVER PAGE
// ────────────────────────────────────────────────────────────────────────────

function buildCoverPage(page) {
  const root = af({ name: "Cover root", dir: "VERTICAL", padding: [80, 64, 80, 64], gap: 32, fill: solidPaint("#ffffff") })
  page.appendChild(root)
  root.appendChild(txt("OMNISENSE", { size: 12, weight: "Semi Bold", color: "#8e2dff", letterSpacing: 2, textCase: "UPPER" }))
  root.appendChild(txt("Design System v1", { size: 48, weight: "Semi Bold", color: "#121218", letterSpacing: -1 }))
  root.appendChild(txt("Tokens, primitives, patterns, and rules used across the OmniSense platform. Generated from the React mockup via the SIRP OmniSense — Design System Builder plugin.", { size: 16, color: "#5a5a69", width: 640, lineHeight: 24 }))

  // Pillars
  const pillars = af({ dir: "HORIZONTAL", gap: 16, padding: 0 })
  const makePillar = (title, body) => {
    const c = af({ dir: "VERTICAL", gap: 8, padding: [16, 16, 16, 16], fill: solidPaint("#ffffff"), stroke: solidPaint("#e5e5e5"), strokeWeight: 1, radius: 12, w: 280 })
    c.appendChild(txt(title.toUpperCase(), { size: 10, weight: "Semi Bold", color: "#8e2dff", letterSpacing: 1, textCase: "UPPER" }))
    c.appendChild(txt(body, { size: 13, color: "#121218", width: 250, lineHeight: 20 }))
    return c
  }
  pillars.appendChild(makePillar("One principle", "Muted is default. Color is a signal. Reserve tone for the one element per zone that carries actionable meaning."))
  pillars.appendChild(makePillar("Five tones", "alert · warn · ok · info · muted. Semantic, not brand. Every tone-coloured UI uses one of these — never a one-off."))
  pillars.appendChild(makePillar("Section labels", "text-[11px] font-medium uppercase tracking-wider text-muted-foreground. One rule, applied everywhere."))
  root.appendChild(pillars)

  // Pages list
  root.appendChild(txt("PAGES IN THIS FILE", { size: 11, weight: "Medium", color: "#5a5a69", letterSpacing: 0.5, textCase: "UPPER" }))
  const list = af({ dir: "VERTICAL", gap: 4, padding: 0 })
  const pagesText = [
    "🪨  Foundations  ·  colors, surfaces, semantic, charts, typography, radii",
    "🎨  Tone palette  ·  the 5-tone system with iconBox / chip / text / bar / bg specimens",
    "🧩  Components  ·  Button, Badge, Card, Avatar, Input, Checkbox, Switch, Tabs, Tooltip, Popover, Skeleton — and tone-driven IconBox + Chip",
    "🧱  Patterns  ·  VerdictCallout, StatTile, HeaderPillCluster, ActivityEvent, CommentRow, EmptyState",
    "🖼️  Sample screen  ·  Incident detail · Overview tab — composed from primitives + patterns",
  ]
  for (const line of pagesText) {
    list.appendChild(txt(line, { size: 13, color: "#121218" }))
  }
  root.appendChild(list)

  root.appendChild(spacer(0, 12))
  root.appendChild(txt("Live spec → localhost:5173/design-system", { size: 12, family: "JetBrains Mono", color: "#8e2dff" }))
  root.appendChild(txt("Re-run the plugin any time tokens or components change. The plugin updates existing nodes by name when possible.", { size: 11, color: "#5a5a69", width: 640 }))
}

// ────────────────────────────────────────────────────────────────────────────
// 12. MAIN
// ────────────────────────────────────────────────────────────────────────────

async function main() {
  await loadAllFonts()

  // Foundations: variables + styles
  const colors = await createColorVariables()
  const numbers = await createNumberVariables()
  const textStyles = await createTextStyles()
  const effects = createEffectStyles()

  // Repurpose first page as Cover, then add new pages.
  const cover = figma.root.children[0]
  cover.name = "🎨 Cover"
  buildCoverPage(cover)

  const foundationsPage = figma.createPage()
  foundationsPage.name = "🪨 Foundations"
  buildFoundations(foundationsPage, textStyles)

  const tonesPage = figma.createPage()
  tonesPage.name = "🌈 Tone palette"
  buildTonePage(tonesPage)

  const componentsPage = figma.createPage()
  componentsPage.name = "🧩 Components"
  await figma.setCurrentPageAsync(componentsPage)
  buildComponentsPage(componentsPage)

  const patternsPage = figma.createPage()
  patternsPage.name = "🧱 Patterns"
  await figma.setCurrentPageAsync(patternsPage)
  buildPatternsPage(patternsPage)

  const sampleScreenPage = figma.createPage()
  sampleScreenPage.name = "🖼️ Sample screen"
  await figma.setCurrentPageAsync(sampleScreenPage)
  buildIncidentOverviewMock(sampleScreenPage)

  await figma.setCurrentPageAsync(cover)

  figma.closePlugin(
    "✅ Design system built! Pages: Cover · Foundations · Tone palette · Components · Patterns · Sample screen. " +
    "Open the Color collection (SIRP/Colors) to switch between Light and Dark modes."
  )
}

main().catch((err) => {
  console.error(err)
  figma.closePlugin("❌ Error: " + (err && err.message ? err.message : String(err)))
})
