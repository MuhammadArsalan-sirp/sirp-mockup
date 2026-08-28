import { createRoot } from "react-dom/client"
import type { Report } from "@/data/reports"
import { ReportPrintableSummary } from "../components/report-printable-summary"
import { exportPagesToPdf } from "./report-export"

/**
 * Row-menu "Generate PDF" and history downloads don't have a live rendered
 * canvas to capture (unlike Report Studio) — so this mounts the shared
 * printable summary offscreen, captures it, then tears it down.
 */
export async function exportReportToPdf(report: Report, filename: string) {
  const container = document.createElement("div")
  container.style.position = "fixed"
  container.style.top = "0"
  container.style.left = "-99999px"
  container.style.pointerEvents = "none"
  document.body.appendChild(container)

  const root = createRoot(container)
  await new Promise<void>((resolve) => {
    root.render(<ReportPrintableSummary report={report} />)
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })

  try {
    const node = container.firstElementChild as HTMLElement | null
    if (node) await exportPagesToPdf([node], filename, { pageSize: "A4", orientation: "portrait" })
  } finally {
    root.unmount()
    container.remove()
  }
}
