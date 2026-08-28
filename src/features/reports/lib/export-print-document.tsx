import { createRoot } from "react-dom/client"
import { ReportPrintDocument } from "../studio/report-print-document"
import type { DocSettings, StudioBlock } from "../studio/report-studio-types"
import { exportNodeToHtmlSnapshot, exportPagesToPdf } from "./report-export"

type PrintInput = {
  blocks: StudioBlock[]
  doc: DocSettings
  coverContents: string[]
}

/**
 * Mounts the print document off-screen, hands the rendered page nodes to the
 * exporter, then tears it down. Off-screen rather than hidden: `display:none`
 * gives recharts a zero-size container and the charts come out empty.
 */
async function withPrintDocument<T>(input: PrintInput, fn: (container: HTMLElement) => Promise<T>): Promise<T> {
  const container = document.createElement("div")
  container.style.position = "fixed"
  container.style.top = "0"
  container.style.left = "-99999px"
  container.style.pointerEvents = "none"
  document.body.appendChild(container)

  const root = createRoot(container)
  try {
    root.render(<ReportPrintDocument blocks={input.blocks} doc={input.doc} coverContents={input.coverContents} />)
    // Two frames for React to commit and lay out, then a beat for recharts to
    // measure its container and draw. Capturing earlier yields blank charts.
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    await new Promise<void>((resolve) => setTimeout(resolve, 450))
    return await fn(container)
  } finally {
    root.unmount()
    container.remove()
  }
}

export async function exportDocumentToPdf(input: PrintInput, filename: string) {
  await withPrintDocument(input, async (container) => {
    const pages = [...container.querySelectorAll<HTMLElement>("[data-print-page]")]
    if (!pages.length) throw new Error("nothing to export")
    await exportPagesToPdf(pages, filename, {
      pageSize: input.doc.pageSize,
      orientation: input.doc.orientation,
    })
  })
}

export async function exportDocumentToHtml(input: PrintInput, filename: string, title: string) {
  await withPrintDocument(input, async (container) => {
    const node = container.firstElementChild as HTMLElement | null
    if (!node) throw new Error("nothing to export")
    await exportNodeToHtmlSnapshot(node, filename, title)
  })
}
