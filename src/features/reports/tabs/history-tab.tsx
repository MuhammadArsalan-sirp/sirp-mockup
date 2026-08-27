import { Download, FileSpreadsheet, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { DataCard } from "@/features/administration-modern/admin-ui"
import { getReportById, reportHistory, type Report, type ReportHistoryEntry } from "@/data/reports"
import { Annotate } from "../spec/annotations"

type HistoryRow = { history: ReportHistoryEntry; report: Report }

/**
 * Generation log — new in this redesign. faiz-dev's `GET /report/history`
 * was frontend-only and never had backend support on either branch.
 */
export function HistoryTab() {
  const rows: HistoryRow[] = reportHistory
    .map((h) => ({ history: h, report: getReportById(h.reportId) }))
    .filter((r): r is HistoryRow => !!r.report)
    .sort((a, b) => b.history.generatedAt.localeCompare(a.history.generatedAt))

  return (
    <div className="space-y-5">
      <PageHeader
        title="History"
        description="Every past generation run, manual or scheduled."
        actions={<Annotate id="sp-history" />}
      />

      <DataCard bodyPadding="none">
        <div className="divide-y">
          {rows.map(({ history, report }) => {
            const FormatIcon = history.format === "EXCEL" ? FileSpreadsheet : FileText
            return (
              <div key={history.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
                <div className="grid size-8 shrink-0 place-items-center rounded-lg border bg-muted text-muted-foreground">
                  <FormatIcon className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{report.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{history.generatedAt}</div>
                </div>
                <Badge variant="outline" className="font-normal text-[10px] capitalize">
                  {history.triggeredBy}
                </Badge>
                <span className="w-16 text-right font-mono text-xs text-muted-foreground">
                  {history.sizeKb} KB
                </span>
                <Button variant="ghost" size="icon-sm" aria-label="Download">
                  <Download className="size-3.5" />
                </Button>
              </div>
            )
          })}
          {rows.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              Nothing generated yet.
            </div>
          )}
        </div>
      </DataCard>
    </div>
  )
}
