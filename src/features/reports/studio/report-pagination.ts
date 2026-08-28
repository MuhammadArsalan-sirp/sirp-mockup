import type { StudioBlock } from "./report-studio-types"

/** Page width in px at 96dpi, so the canvas is the shape of the paper it prints on. */
export const PAGE_WIDTH: Record<string, number> = {
  "A4-portrait": 794,
  "A4-landscape": 1123,
  "Letter-portrait": 816,
  "Letter-landscape": 1056,
}

export const PAGE_HEIGHT: Record<string, number> = {
  "A4-portrait": 1123,
  "A4-landscape": 794,
  "Letter-portrait": 1056,
  "Letter-landscape": 816,
}

export const PAPER_ASPECT: Record<string, string> = {
  "A4-portrait": "210 / 297",
  "A4-landscape": "297 / 210",
  "Letter-portrait": "216 / 279",
  "Letter-landscape": "279 / 216",
}

export function paperKey(pageSize: string, orientation: string) {
  return `${pageSize}-${orientation}`
}

/**
 * Splits the document into pages — the same boundaries the editor shows and
 * the export writes. A cover always owns its page: it's a full-bleed artwork,
 * and nothing should share a sheet with it.
 */
export function splitPages(blocks: StudioBlock[]): StudioBlock[][] {
  const pages: StudioBlock[][] = [[]]
  for (const block of blocks) {
    if (block.type === "pageBreak") {
      pages.push([])
      continue
    }
    if (block.type === "cover") {
      if (pages[pages.length - 1].length > 0) pages.push([])
      pages[pages.length - 1].push(block)
      pages.push([])
      continue
    }
    pages[pages.length - 1].push(block)
  }
  // Drop trailing empties — a cover pushes a fresh page whether or not
  // anything follows it, and an export must not ship that as a blank sheet.
  while (pages.length > 1 && pages[pages.length - 1].length === 0) pages.pop()
  return pages
}

/** Groups consecutive half-width blocks into rows so they render side by side. */
export function toRows(blocks: StudioBlock[]): StudioBlock[][] {
  const rows: StudioBlock[][] = []
  for (const block of blocks) {
    const last = rows.at(-1)
    if (block.width === "half" && last && last.length === 1 && last[0].width === "half") {
      last.push(block)
    } else {
      rows.push([block])
    }
  }
  return rows
}

export const isCoverPage = (page: StudioBlock[]) => page.length === 1 && page[0].type === "cover"
