import { FileText } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { moduleLabels, reportTemplates, reports } from "@/data/reports"
import { ReportsTable } from "../components/reports-table"
import { useReportDialogs } from "../components/use-report-dialogs"

/**
 * Gallery of starter layouts — the "Report Templates" archetype from the
 * redesign proposal's Split Product Archetypes recommendation. The gallery
 * listing itself is new (faiz-dev's GET /report/templates was orphaned);
 * "Use template" launches the same real create flow as "New report".
 */
export function TemplatesTab() {
  const { handlers, openCreate, dialogs } = useReportDialogs()
  const templateReports = reports.filter((r) => r.archetype === "template")

  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates"
        description="Starter layouts — pick one to pre-fill sections, branding, and module scope."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reportTemplates.map((t) => (
          <div key={t.id} className="flex flex-col rounded-xl border bg-card p-5">
            <div className="grid size-9 place-items-center rounded-lg border bg-muted text-muted-foreground">
              <FileText className="size-4" />
            </div>
            <div className="mt-3 text-sm font-semibold leading-tight">{t.name}</div>
            <p className="mt-1 line-clamp-2 flex-1 text-xs text-muted-foreground">{t.description}</p>
            <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{t.widgetIds.length} widgets · {moduleLabels[t.module]}</span>
            </div>
            <Button size="sm" variant="outline" className="mt-3 h-8 text-xs" onClick={() => openCreate(t.id)}>
              Use template
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Built from a template
        </h3>
        <ReportsTable
          data={templateReports}
          handlers={handlers}
          emptyMessage="No template-based reports yet."
        />
      </div>
      {dialogs}
    </div>
  )
}
