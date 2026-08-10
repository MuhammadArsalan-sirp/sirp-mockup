import { useState } from "react"
import { Calendar, Clock, Download, Hash, Loader2, Mail, PanelRightClose } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DataCard } from "@/features/administration-modern/admin-ui"
import {
  getCoverPageById,
  getHistoryForReport,
  getSchedulesForReport,
  type Report,
  type ReportHistoryEntry,
} from "@/data/reports"
import { ReportStatusBadge, ReportTypeBadge } from "./report-columns"
import { ReportSummaryCards } from "./report-printable-summary"
import { buildReportExportRows, exportRowsToCsv, exportRowsToExcel } from "../lib/report-export"
import { exportReportToPdf } from "../lib/report-pdf-export"
import { reportsBackend } from "../lib/reports-backend"

export function ReportPreviewSheet({
  report,
  open,
  onOpenChange,
}: {
  report: Report | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  if (!report) return null
  const coverPage = report.coverPageId ? getCoverPageById(report.coverPageId) : undefined
  const schedules = getSchedulesForReport(report.id)
  const history = getHistoryForReport(report.id)

  async function handleDownloadHistoryEntry(entry: ReportHistoryEntry) {
    if (!report) return
    setDownloadingId(entry.id)
    try {
      const baseName = `${report.name.replace(/[^a-z0-9]+/gi, "-")}-${entry.generatedAt}`
      if (entry.format === "PDF") {
        await exportReportToPdf(report, `${baseName}.pdf`)
      } else if (entry.format === "EXCEL") {
        exportRowsToExcel(buildReportExportRows(report), `${baseName}.xlsx`)
      } else {
        exportRowsToCsv(buildReportExportRows(report), `${baseName}.csv`)
      }
      void reportsBackend.logExport({
        reportId: report.id,
        reportName: report.name,
        format: entry.format,
        triggeredBy: "manual",
      })
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" showCloseButton={false} className="w-full overflow-y-auto p-0 sm:max-w-lg">
        <SheetHeader className="sr-only">
          <SheetTitle>{report.name}</SheetTitle>
          <SheetDescription>{report.description}</SheetDescription>
        </SheetHeader>

        <div className="flex items-center gap-3 border-b px-5 py-4">
          <Button variant="ghost" size="icon-sm" onClick={() => onOpenChange(false)} aria-label="Close">
            <PanelRightClose className="size-4" />
          </Button>
          <div className="min-w-0 flex-1 text-xs text-muted-foreground">
            Report · ID <span className="font-mono">{report.id}</span>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {coverPage && (
            <div className={`h-20 rounded-lg bg-linear-to-br ${coverPage.bgFrom} ${coverPage.bgTo}`} />
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight">{report.name}</h2>
              <ReportTypeBadge report={report} />
              <ReportStatusBadge status={report.status} />
            </div>
            {report.description && (
              <p className="mt-1 text-sm text-muted-foreground">{report.description}</p>
            )}
          </div>

          <ReportSummaryCards report={report} />

          <DataCard title="Schedules" count={schedules.length} bodyPadding="none">
            {schedules.length === 0 ? (
              <p className="px-5 py-4 text-sm text-muted-foreground">Not scheduled.</p>
            ) : (
              <div className="divide-y">
                {schedules.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium capitalize">{s.frequency}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        Next run {s.nextRun}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {s.recipients.slice(0, 3).map((r) => (
                          <Avatar key={r.id} size="sm" className="ring-2 ring-card">
                            <AvatarImage src={r.photo} alt={r.name} />
                            <AvatarFallback className={`bg-linear-to-br ${r.gradient} text-white`}>
                              {r.initials}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      {s.deliveryChannel === "slack" ? (
                        <Hash className="size-3.5 text-muted-foreground" />
                      ) : (
                        <Mail className="size-3.5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DataCard>

          <DataCard title="Generation history" count={history.length} bodyPadding="none">
            {history.length === 0 ? (
              <p className="px-5 py-4 text-sm text-muted-foreground">Not generated yet.</p>
            ) : (
              <div className="divide-y">
                {history.map((h) => (
                  <div key={h.id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="size-3.5" />
                      {h.generatedAt}
                      <Badge variant="outline" className="font-normal text-[10px] capitalize">
                        {h.triggeredBy}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Download"
                      disabled={downloadingId === h.id}
                      onClick={() => handleDownloadHistoryEntry(h)}
                    >
                      {downloadingId === h.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Download className="size-3.5" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </DataCard>
        </div>
      </SheetContent>
    </Sheet>
  )
}
