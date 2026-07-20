import { Calendar, Clock, Download, Hash, Mail, PanelRightClose } from "lucide-react"
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
import { DataCard, SectionLabel } from "@/features/administration-modern/admin-ui"
import {
  getCoverPageById,
  getHistoryForReport,
  getSchedulesForReport,
  getWidgetById,
  moduleLabels,
  reportWidgetCatalog,
  type Report,
} from "@/data/reports"
import { ReportStatusBadge, ReportTypeBadge } from "./report-columns"

export function ReportPreviewSheet({
  report,
  open,
  onOpenChange,
}: {
  report: Report | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!report) return null
  const coverPage = report.coverPageId ? getCoverPageById(report.coverPageId) : undefined
  const schedules = getSchedulesForReport(report.id)
  const history = getHistoryForReport(report.id)

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

          <DataCard title="Details" bodyPadding="default">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <SectionLabel>Author</SectionLabel>
                <div className="mt-1.5 inline-flex items-center gap-2">
                  <Avatar size="sm">
                    <AvatarImage src={report.author.photo} alt={report.author.name} />
                    <AvatarFallback className={`bg-linear-to-br ${report.author.gradient} text-white`}>
                      {report.author.initials}
                    </AvatarFallback>
                  </Avatar>
                  {report.author.name}
                </div>
              </div>
              <div>
                <SectionLabel>Module</SectionLabel>
                <div className="mt-1.5">{moduleLabels[report.module]}</div>
              </div>
              <div>
                <SectionLabel>Created</SectionLabel>
                <div className="mt-1.5 tabular-nums text-muted-foreground">{report.createdOn}</div>
              </div>
              <div>
                <SectionLabel>Updated</SectionLabel>
                <div className="mt-1.5 tabular-nums text-muted-foreground">{report.updatedOn}</div>
              </div>
            </div>
          </DataCard>

          {report.archetype === "template" && report.sections && report.sections.length > 0 && (
            <DataCard title="Sections" count={report.sections.length} bodyPadding="none">
              <div className="divide-y">
                {report.sections.map((s) => {
                  const widget = getWidgetById(s.widgetId) ?? reportWidgetCatalog[0]
                  return (
                    <div key={s.widgetId} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm">
                      <span className={!s.included ? "text-muted-foreground line-through" : ""}>
                        {widget.title}
                      </span>
                      <Badge variant="secondary" className="font-normal text-[10px] capitalize">
                        {widget.type}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </DataCard>
          )}

          {report.archetype === "saved-export" && report.savedSearchSummary && (
            <DataCard title="Saved scope" bodyPadding="default">
              <p className="text-sm text-muted-foreground">{report.savedSearchSummary}</p>
            </DataCard>
          )}

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
                    <Button variant="ghost" size="icon-xs" aria-label="Download">
                      <Download className="size-3.5" />
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
