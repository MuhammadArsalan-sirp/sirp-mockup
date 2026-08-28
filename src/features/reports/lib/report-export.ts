import { toCanvas } from "html-to-image"
import { jsPDF } from "jspdf"
import * as XLSX from "xlsx"
import {
  getWidgetById,
  moduleLabels,
  reportWidgetCatalog,
  type Report,
} from "@/data/reports"

/** Resolves the app's live theme background — used so captured PDF/PNG pages
 * don't come out with a transparent (effectively white) background, which is
 * exactly what made the old `window.print()` export look blank. */
function themeBackgroundColor(): string {
  return getComputedStyle(document.body).backgroundColor || "#ffffff"
}

/** Parses a `rgb()`/`rgba()` computed-style string into 0-255 channels, for jsPDF's setFillColor. */
function parseRgbColor(color: string): [number, number, number] {
  const match = color.match(/(\d+(?:\.\d+)?)/g)
  if (!match || match.length < 3) return [255, 255, 255]
  return [Number(match[0]), Number(match[1]), Number(match[2])]
}

/**
 * html-to-image clones only the captured node's subtree, not its ancestors —
 * so theme tokens declared on `:root`/`.dark` (e.g. recharts' `stroke="var(--chart-2)"`
 * SVG attributes) have nothing to resolve against once isolated, and silently
 * render invisible. Collects every custom property name declared anywhere in
 * the stylesheets (light + dark blocks) so callers can re-declare the live,
 * resolved values as real inline custom properties on the node being captured.
 */
function allCssVariableNames(): string[] {
  const names = new Set<string>()
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList
    try {
      rules = sheet.cssRules
    } catch {
      continue
    }
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule) {
        for (const prop of Array.from(rule.style)) {
          if (prop.startsWith("--")) names.add(prop)
        }
      }
    }
  }
  return Array.from(names)
}

/**
 * Temporarily writes every live theme custom property as a real inline
 * declaration on `node` (via `setProperty`, not a plain style assignment —
 * html-to-image's own `style` option uses `style[key] = value`, which just
 * creates an inert expando for `--`-prefixed keys and doesn't register an
 * actual custom property) so descendants' `var(...)` references keep
 * resolving once html-to-image clones the subtree in isolation.
 */
async function withInlinedThemeVars<T>(node: HTMLElement, fn: () => Promise<T>): Promise<T> {
  const computed = getComputedStyle(node)
  const previousCssText = node.style.cssText
  for (const name of allCssVariableNames()) {
    const value = computed.getPropertyValue(name).trim()
    if (value) node.style.setProperty(name, value)
  }
  try {
    return await fn()
  } finally {
    node.style.cssText = previousCssText
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const A4_WIDTH_PT = 595.28
const A4_HEIGHT_PT = 841.89
const LETTER_WIDTH_PT = 612
const LETTER_HEIGHT_PT = 792

export type PaperSpec = { pageSize: "A4" | "Letter"; orientation: "portrait" | "landscape" }

function paperSize({ pageSize, orientation }: PaperSpec): [number, number] {
  const [w, h] = pageSize === "Letter" ? [LETTER_WIDTH_PT, LETTER_HEIGHT_PT] : [A4_WIDTH_PT, A4_HEIGHT_PT]
  return orientation === "landscape" ? [h, w] : [w, h]
}

/**
 * Exports one PDF page per rendered page element.
 *
 * The earlier version captured the whole document as a single tall image and
 * sliced it every A4-height of pixels, which ignores where the pages actually
 * break — a section could be cut in half and a page break could land mid-page.
 * Capturing each page element separately means the PDF breaks exactly where
 * the canvas says it does.
 *
 * Each capture is fitted to the sheet rather than stretched, so a cover that
 * is exactly page-shaped fills the page and a short page sits at the top
 * against the correct ground colour.
 */
export async function exportPagesToPdf(pages: HTMLElement[], filename: string, spec: PaperSpec) {
  if (!pages.length) throw new Error("nothing to export")

  const [pageWidth, pageHeight] = paperSize(spec)
  const pdf = new jsPDF({
    orientation: spec.orientation,
    unit: "pt",
    format: spec.pageSize.toLowerCase() as "a4" | "letter",
  })
  const fillColor = parseRgbColor(themeBackgroundColor())
  let sheet = 0

  function newSheet() {
    if (sheet > 0) pdf.addPage()
    pdf.setFillColor(fillColor[0], fillColor[1], fillColor[2])
    pdf.rect(0, 0, pageWidth, pageHeight, "F")
    sheet += 1
  }

  for (const page of pages) {
    const canvas = await withInlinedThemeVars(page, () =>
      toCanvas(page, { backgroundColor: themeBackgroundColor(), pixelRatio: 2, cacheBust: true })
    )

    // Fit to width, never shrink to fit height: a page taller than the sheet
    // continues onto the next one at full size, rather than being scaled down
    // until the type is unreadable. A page-shaped page (the cover) lands on
    // exactly one sheet.
    const scale = pageWidth / canvas.width
    const sheetHeightInCanvasPx = pageHeight / scale
    let consumed = 0

    do {
      const sliceHeight = Math.min(sheetHeightInCanvasPx, canvas.height - consumed)
      const slice = document.createElement("canvas")
      slice.width = canvas.width
      slice.height = Math.max(1, Math.round(sliceHeight))
      const ctx = slice.getContext("2d")
      if (!ctx) break
      ctx.fillStyle = themeBackgroundColor()
      ctx.fillRect(0, 0, slice.width, slice.height)
      ctx.drawImage(canvas, 0, consumed, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight)

      newSheet()
      // JPEG rather than PNG: these are page-sized photographs of a rendered
      // document, and PNG was producing eight-figure byte counts no mail
      // server would accept.
      pdf.addImage(slice.toDataURL("image/jpeg", 0.94), "JPEG", 0, 0, pageWidth, sliceHeight * scale)

      consumed += sliceHeight
    } while (consumed < canvas.height - 1)
  }

  pdf.save(filename)
}

export async function exportNodeToHtmlSnapshot(node: HTMLElement, filename: string, title: string) {
  const canvas = await withInlinedThemeVars(node, () =>
    toCanvas(node, {
      backgroundColor: themeBackgroundColor(),
      pixelRatio: 2,
      cacheBust: true,
    })
  )
  const dataUrl = canvas.toDataURL("image/png", 1)

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  body { margin: 0; padding: 24px; background: ${themeBackgroundColor()}; display: flex; justify-content: center; }
  img { max-width: 100%; height: auto; border-radius: 8px; }
</style>
</head>
<body>
  <img src="${dataUrl}" alt="${escapeHtml(title)}" />
</body>
</html>`

  downloadBlob(new Blob([html], { type: "text/html" }), filename)
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string))
}

export function exportRowsToCsv(rows: Record<string, unknown>[], filename: string) {
  if (rows.length === 0) {
    downloadBlob(new Blob([""], { type: "text/csv" }), filename)
    return
  }
  const headers = Object.keys(rows[0])
  const escapeCell = (value: unknown) => {
    const str = value == null ? "" : String(value)
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
  }
  const lines = [headers.join(","), ...rows.map((row) => headers.map((h) => escapeCell(row[h])).join(","))]
  downloadBlob(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }), filename)
}

/** Excel sheet names must be <=31 chars and can't contain : \ / ? * [ ] */
function sanitizeSheetName(name: string): string {
  const cleaned = name.replace(/[:\\/?*[\]]/g, "").trim() || "Report"
  return cleaned.slice(0, 31)
}

export function exportRowsToExcel(rows: Record<string, unknown>[], filename: string, sheetName = "Report") {
  const worksheet = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ Value: "No data" }])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sanitizeSheetName(sheetName))
  XLSX.writeFile(workbook, filename)
}

export function buildReportExportRows(report: Report): Record<string, unknown>[] {
  const base = {
    Name: report.name,
    Module: moduleLabels[report.module],
    Status: report.status,
    Author: report.author.name,
    "Created On": report.createdOn,
    "Updated On": report.updatedOn,
  }

  if (report.archetype === "template" && report.sections && report.sections.length > 0) {
    return report.sections.map((section) => {
      const widget = getWidgetById(section.widgetId) ?? reportWidgetCatalog[0]
      return {
        ...base,
        Section: widget.title,
        "Widget Type": widget.type,
        Included: section.included ? "Yes" : "No",
      }
    })
  }

  if (report.archetype === "saved-export" && report.savedSearchSummary) {
    return [{ ...base, "Saved Scope": report.savedSearchSummary }]
  }

  return [base]
}
