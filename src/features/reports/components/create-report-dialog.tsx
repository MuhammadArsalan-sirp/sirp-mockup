import { useState } from "react"
import { useNavigate } from "react-router"
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  FileSpreadsheet,
  FileText,
  Gauge,
  LayoutTemplate,
  LineChart,
  PieChart,
  Sparkles,
  Table2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getWidgetById, moduleLabels, reportTemplates, type ReportWidgetType } from "@/data/reports"

const WIDGET_TYPE_ICON: Record<ReportWidgetType, typeof BarChart3> = {
  bar: BarChart3,
  line: LineChart,
  pie: PieChart,
  kpi: Gauge,
  table: Table2,
}

/**
 * One way into a new report.
 *
 * Before this there were two buttons on Overview and a separate gallery on
 * Templates, which meant the answer to "how do I make a report" depended on
 * which screen you happened to be on. Now: one Create report button, and the
 * three ways in are laid out as a choice with the trade-off written on each.
 */
export function CreateReportDialog({
  open,
  onOpenChange,
  onSavedExport,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The fourth path — a list-view filter saved as Excel — uses the older wizard. */
  onSavedExport: () => void
}) {
  const navigate = useNavigate()
  const [step, setStep] = useState<"choose" | "template">("choose")

  function close() {
    onOpenChange(false)
    // Reset after the close animation so the dialog doesn't visibly rewind.
    setTimeout(() => setStep("choose"), 200)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close()
        else onOpenChange(true)
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        {step === "choose" ? (
          <>
            <DialogHeader>
              <DialogTitle>Create report</DialogTitle>
              <DialogDescription>Three ways in. All of them land in the same editor.</DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <ChoiceRow
                icon={<Sparkles className="size-4" />}
                title="Describe what you need"
                description="Say it in plain language. The Co-Analyst proposes a structure with its reasoning, and you correct it before anything is built."
                badge="Fastest"
                accent
                onClick={() => {
                  close()
                  navigate("/reports/new")
                }}
              />
              <ChoiceRow
                icon={<LayoutTemplate className="size-4" />}
                title="Start from a template"
                description="A ready layout with sections, branding and module scope already set. Edit anything after."
                onClick={() => setStep("template")}
              />
              <ChoiceRow
                icon={<FileText className="size-4" />}
                title="Blank canvas"
                description="An empty document and the full block palette. Most control, most work."
                onClick={() => {
                  close()
                  navigate("/reports/studio")
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                close()
                onSavedExport()
              }}
              className="flex items-center gap-2 rounded-lg border border-dashed px-3.5 py-2.5 text-left transition-colors hover:bg-accent"
            >
              <FileSpreadsheet className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium">Saving a list-view filter instead?</span>
                <span className="block text-[11px] text-muted-foreground">
                  Create a saved export — an Excel snapshot rather than a document.
                </span>
              </span>
              <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
            </button>
          </>
        ) : (
          <>
            <DialogHeader>
              <button
                type="button"
                onClick={() => setStep("choose")}
                className="mb-1 flex w-fit items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" />
                Back
              </button>
              <DialogTitle>Pick a template</DialogTitle>
              <DialogDescription>Sections, branding and scope come pre-filled. Nothing is locked.</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {reportTemplates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    close()
                    navigate("/reports/studio", { state: { templateId: t.id } })
                  }}
                  className="group flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="flex -space-x-1.5">
                    {t.widgetIds.slice(0, 4).map((widgetId) => {
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
                    {t.widgetIds.length > 4 && (
                      <span className="grid size-6 place-items-center rounded-md border bg-muted text-[10px] font-medium text-muted-foreground ring-2 ring-card">
                        +{t.widgetIds.length - 4}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium leading-tight">{t.name}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {t.widgetIds.length} sections · {moduleLabels[t.module]}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ChoiceRow({
  icon,
  title,
  description,
  badge,
  accent,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  badge?: string
  accent?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-start gap-3 rounded-lg border p-3.5 text-left transition-colors",
        accent ? "border-primary/30 bg-primary/5 hover:bg-primary/10" : "hover:border-primary/40 hover:bg-accent"
      )}
    >
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-lg border",
          accent ? "border-primary/25 bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-sm font-medium">{title}</span>
          {badge && (
            <span className="rounded-full border border-primary/25 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              {badge}
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{description}</span>
      </span>
      <ArrowRight className="mt-1 size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </button>
  )
}
