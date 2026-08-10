import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DataCard, SectionLabel } from "@/features/administration-modern/admin-ui"
import {
  getCoverPageById,
  getWidgetById,
  moduleLabels,
  reportWidgetCatalog,
  type Report,
} from "@/data/reports"

/**
 * Details/Sections/saved-scope cards — shared by the preview sheet (which
 * wraps them with its own cover/title/badges header) and the standalone
 * `ReportPrintableSummary` below (used for offscreen PDF capture).
 */
export function ReportSummaryCards({ report }: { report: Report }) {
  return (
    <>
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
    </>
  )
}

/**
 * Standalone printable version (cover + title + summary cards) — mounted
 * offscreen for row-menu "Generate PDF" / history downloads, where there's
 * no live rendered canvas to capture (unlike Report Studio).
 */
export function ReportPrintableSummary({ report }: { report: Report }) {
  const coverPage = report.coverPageId ? getCoverPageById(report.coverPageId) : undefined

  return (
    <div className="w-175 space-y-4 bg-background p-6 text-foreground">
      {coverPage && (
        <div className={`h-20 rounded-lg bg-linear-to-br ${coverPage.bgFrom} ${coverPage.bgTo}`} />
      )}

      <div>
        <h2 className="text-lg font-semibold tracking-tight">{report.name}</h2>
        {report.description && (
          <p className="mt-1 text-sm text-muted-foreground">{report.description}</p>
        )}
      </div>

      <ReportSummaryCards report={report} />
    </div>
  )
}
