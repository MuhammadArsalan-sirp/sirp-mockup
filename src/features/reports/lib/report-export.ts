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

export async function exportNodeToPdf(node: HTMLElement, filename: string) {
  const canvas = await withInlinedThemeVars(node, () =>
    toCanvas(node, {
      backgroundColor: themeBackgroundColor(),
      pixelRatio: 2,
      cacheBust: true,
    })
  )

  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" })
  const pageWidth = A4_WIDTH_PT
  const pageHeight = A4_HEIGHT_PT
  const scaledWidth = pageWidth
  const pageHeightInCanvasPx = (pageHeight * canvas.width) / pageWidth
  const fillColor = parseRgbColor(themeBackgroundColor())

  let renderedHeightPx = 0
  let pageIndex = 0

  while (renderedHeightPx < canvas.height) {
    const sliceHeightPx = Math.min(pageHeightInCanvasPx, canvas.height - renderedHeightPx)

    const sliceCanvas = document.createElement("canvas")
    sliceCanvas.width = canvas.width
    sliceCanvas.height = sliceHeightPx
    const ctx = sliceCanvas.getContext("2d")
    if (!ctx) break
    ctx.fillStyle = themeBackgroundColor()
    ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height)
    ctx.drawImage(canvas, 0, renderedHeightPx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx)

    const sliceDataUrl = sliceCanvas.toDataURL("image/png", 1)
    const sliceHeightPt = (sliceHeightPx * scaledWidth) / canvas.width

    if (pageIndex > 0) pdf.addPage()
    // Fill the full page first — a short last slice otherwise leaves jsPDF's
    // default white background showing below the image on dark themes.
    pdf.setFillColor(fillColor[0], fillColor[1], fillColor[2])
    pdf.rect(0, 0, pageWidth, pageHeight, "F")
    pdf.addImage(sliceDataUrl, "PNG", 0, 0, scaledWidth, sliceHeightPt)

    renderedHeightPx += sliceHeightPx
    pageIndex += 1
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
