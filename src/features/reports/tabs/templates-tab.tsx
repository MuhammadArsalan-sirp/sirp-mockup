import {
  ArrowRight,
  BarChart3,
  Gauge,
  LineChart,
  PieChart,
  Sparkles,
  Table2,
} from "lucide-react"
import { useNavigate } from "react-router"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import {
  getWidgetById,
  moduleLabels,
  reportTemplates,
  reports,
  type ReportWidgetType,
} from "@/data/reports"
import { ReportsTable } from "../components/reports-table"
import { useReportDialogs } from "../components/use-report-dialogs"

const WIDGET_TYPE_ICON: Record<ReportWidgetType, typeof BarChart3> = {
  bar: BarChart3,
  line: LineChart,
  pie: PieChart,
  kpi: Gauge,
  table: Table2,
}

/** How many widget-type glyphs to stack before collapsing the rest into a "+N" chip. */
const MAX_GLYPHS = 4

/**
 * Gallery of starter layouts — the "Report Templates" archetype from the
 * redesign proposal's Split Product Archetypes recommendation. The gallery
 * listing itself is new (faiz-dev's GET /report/templates was orphaned).
 * Picking a card (or "Build your own") opens the full-screen Report Studio
 * block editor pre-seeded from that template, rather than the smaller
 * step-by-step wizard used elsewhere in Reports.
 *
 * Cards read as a stacked "contents preview" (each widget's chart-type icon,
 * avatar-stack style) rather than a paragraph of prose — denser, and it
 * shows what's inside the report instead of describing it.
 */
export function TemplatesTab() {
  const navigate = useNavigate()
  const { handlers, dialogs } = useReportDialogs()
  const templateReports = reports.filter((r) => r.archetype === "template")

  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates"
        description="Starter layouts — pick one to pre-fill sections, branding, and module scope."
      />

      <div className="flex flex-col gap-3 rounded-xl border border-dashed border-primary/40 bg-linear-to-r from-primary/10 via-primary/5 to-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-linear-to-br from-primary to-primary/70 text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <div>
            <div className="text-sm font-semibold leading-tight">Build your own report</div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Skip the presets — start from a blank canvas and pick your own module and widgets.
            </p>
          </div>
        </div>
        <Button size="sm" className="shrink-0" onClick={() => navigate("/reports/studio", { state: {} })}>
          Start from scratch
        </Button>
      </div>

      <div className="space-y-2">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Or start from a layout
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {reportTemplates.map((t) => {
            const shown = t.widgetIds.slice(0, MAX_GLYPHS)
            const overflow = t.widgetIds.length - shown.length
            return (
              <button
                key={t.id}
                type="button"
                title={t.description}
                onClick={() => navigate("/reports/studio", { state: { templateId: t.id } })}
                className={cn(
                  "group flex flex-col items-start gap-2.5 rounded-xl border bg-card p-3.5 text-left transition-colors",
                  "hover:border-primary/40 hover:bg-primary/5"
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex -space-x-1.5">
                    {shown.map((widgetId) => {
                      const widget = getWidgetById(widgetId)
                      const Icon = widget ? WIDGET_TYPE_ICON[widget.type] : BarChart3
                      return (
                        <span
                          key={widgetId}
                          className="grid size-6 place-items-center rounded-md border bg-muted text-muted-foreground ring-2 ring-card"
                        >
                          <Icon className="size-3" />
                        </span>
                      )
                    })}
                    {overflow > 0 && (
                      <span className="grid size-6 place-items-center rounded-md border bg-muted text-[10px] font-medium text-muted-foreground ring-2 ring-card">
                        +{overflow}
                      </span>
                    )}
                  </div>
                  <ArrowRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="text-sm font-medium leading-tight">{t.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {t.widgetIds.length} widgets · {moduleLabels[t.module]}
                </div>
              </button>
            )
          })}
        </div>
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
