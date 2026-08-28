import { useState } from "react"
import { useNavigate } from "react-router"
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  FileSpreadsheet,
  FileText,
  Plus,
  Sparkles,
  Wand2,
  X,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

/** Sentinel `templateId` meaning "skip the preset gallery, build sections from a blank canvas." */
export const CUSTOM_TEMPLATE_ID = "custom"
import { useReportsStore } from "@/stores/reports-store"
import { blocksFromPlan, defaultDocSettings } from "../studio/report-studio-types"
import { widgetBlockType } from "../studio/widget-block-type"
import {
  coverPages,
  getWidgetById,
  moduleLabels,
  reportTemplates,
  reportWidgetCatalog,
  type Report,
  type ReportArchetype,
  type ReportFormat,
  type ReportModule,
  type ReportSection,
} from "@/data/reports"
import { ScheduleForm, DEFAULT_SCHEDULE_VALUE, type ScheduleFormValue } from "./schedule-form"

const SAVED_SEARCH_PRESETS: Record<ReportModule, string> = {
  incident: "Severity: Critical · Status: Open, In Progress · Updated: last 30 days",
  threatIntel: "Disposition: True Positive · AI confidence ≥ 90%",
  cases: "Category: Phishing · Status: not closed",
}

function initialSections(report: Report | undefined, templateId: string | undefined): ReportSection[] {
  if (report?.sections) return report.sections
  const t = reportTemplates.find((t) => t.id === templateId)
  if (t) return t.widgetIds.map((w) => ({ widgetId: w, included: true }))
  return []
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  report?: Report
  initialTemplateId?: string
  initialStep?: 1 | 2 | 3
}

const STEP_LABELS = ["Choose", "Configure", "Delivery"]

export function CreateReportWizard({
  open,
  onOpenChange,
  report,
  initialTemplateId,
  initialStep = 1,
}: Props) {
  const isEdit = !!report
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2 | 3>(initialStep)
  const [archetype, setArchetype] = useState<ReportArchetype>(report?.archetype ?? "template")
  const [format, setFormat] = useState<ReportFormat>(report?.format ?? "PDF")
  const [templateId, setTemplateId] = useState<string | undefined>(initialTemplateId)
  const initialTemplate = reportTemplates.find((t) => t.id === initialTemplateId)
  const [moduleSel, setModuleSel] = useState<ReportModule>(
    report?.module ?? initialTemplate?.module ?? "incident"
  )
  const [name, setName] = useState(report?.name ?? initialTemplate?.name ?? "")
  const [description, setDescription] = useState(report?.description ?? initialTemplate?.description ?? "")
  const [savedSearchSummary, setSavedSearchSummary] = useState(
    report?.savedSearchSummary ?? SAVED_SEARCH_PRESETS[report?.module ?? "incident"]
  )
  const [coverPageId, setCoverPageId] = useState(
    report?.coverPageId ?? initialTemplate?.coverPageId ?? coverPages[0].id
  )
  const [sections, setSections] = useState<ReportSection[]>(() => initialSections(report, initialTemplateId))
  const [saraPrompt, setSaraPrompt] = useState("")
  const [schedule, setSchedule] = useState<ScheduleFormValue>(DEFAULT_SCHEDULE_VALUE)
  const [scheduleEnabled, setScheduleEnabled] = useState(report?.isScheduled ?? false)
  const [submitted, setSubmitted] = useState(false)

  function resetAll() {
    setStep(initialStep)
    setSubmitted(false)
    if (!isEdit) {
      setArchetype("template")
      setFormat("PDF")
      setTemplateId(undefined)
      setModuleSel("incident")
      setName("")
      setDescription("")
      setSavedSearchSummary(SAVED_SEARCH_PRESETS.incident)
      setCoverPageId(coverPages[0].id)
      setSections([])
      setSaraPrompt("")
      setSchedule(DEFAULT_SCHEDULE_VALUE)
      setScheduleEnabled(false)
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetAll()
    onOpenChange(next)
  }

  function applyTemplate(id: string) {
    const t = reportTemplates.find((t) => t.id === id)
    if (!t) return
    setTemplateId(id)
    setModuleSel(t.module)
    setCoverPageId(t.coverPageId)
    setName((prev) => prev || t.name)
    setDescription((prev) => prev || t.description)
    setSections(t.widgetIds.map((w) => ({ widgetId: w, included: true })))
  }

  function applySaraDraft() {
    if (!saraPrompt.trim()) return
    setArchetype("template")
    applyTemplate(reportTemplates[0].id)
    setName(saraPrompt.length > 60 ? `${saraPrompt.slice(0, 57)}…` : saraPrompt)
    setStep(2)
  }

  function moveSection(index: number, dir: -1 | 1) {
    setSections((prev) => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      const tmp = next[index]
      next[index] = next[target]
      next[target] = tmp
      return next
    })
  }

  function toggleSection(index: number) {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, included: !s.included } : s)))
  }

  function addWidget(widgetId: string) {
    setSections((prev) => (prev.some((s) => s.widgetId === widgetId) ? prev : [...prev, { widgetId, included: true }]))
  }

  function removeSection(index: number) {
    setSections((prev) => prev.filter((_, i) => i !== index))
  }

  /** Creates a real draft from the wizard's fields and opens it in the Studio. */
  function handleSubmit() {
    setSubmitted(true)
    const doc = { ...defaultDocSettings(), module: moduleSel }
    const blocks = blocksFromPlan([
      { blockType: "cover", title: name || "Untitled report", included: true },
      { blockType: "execSummary", title: "Executive summary", included: true },
      ...sections
        .filter((s) => s.included)
        .map((s) => ({ blockType: widgetBlockType(s.widgetId), title: getWidgetById(s.widgetId)?.title ?? "Section", included: true })),
    ])
    const id = useReportsStore.getState().save({ name: name || "Untitled report", module: moduleSel, blocks, doc })
    setTimeout(() => {
      handleOpenChange(false)
      navigate(`/reports/studio?id=${id}`)
    }, 700)
  }

  // "Build your own" enters with templateId === CUSTOM_TEMPLATE_ID — it never
  // matches a gallery entry, so it skips the required-template gate below and
  // starts from an empty section list the user fills in on step 2.
  const isCustomFlow = templateId === CUSTOM_TEMPLATE_ID

  // Only require picking a gallery template when creating fresh — an
  // existing report already has its sections/branding configured and has
  // no `templateId` of its own to match against.
  const canAdvanceStep1 = !isEdit && archetype === "template" ? isCustomFlow || !!templateId : true
  const canAdvanceStep2 = name.trim().length > 0
  const availableWidgets = reportWidgetCatalog.filter((w) => !sections.some((s) => s.widgetId === w.id))

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit report" : "Create report"}</DialogTitle>
          <DialogDescription>
            {STEP_LABELS.map((label, i) => (
              <span
                key={label}
                className={cn(
                  "mr-3 inline-flex items-center gap-1.5",
                  step === i + 1 ? "font-medium text-foreground" : ""
                )}
              >
                <span
                  className={cn(
                    "grid size-4 place-items-center rounded-full text-[10px]",
                    step > i + 1
                      ? "bg-primary text-primary-foreground"
                      : step === i + 1
                        ? "border border-primary text-primary"
                        : "border text-muted-foreground"
                  )}
                >
                  {step > i + 1 ? <Check className="size-2.5" /> : i + 1}
                </span>
                {label}
              </span>
            ))}
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="grid place-items-center py-10 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Check className="size-5" />
            </span>
            <p className="mt-3 text-sm font-medium">
              {isEdit ? "Changes saved" : "Report created"}
            </p>
          </div>
        ) : (
          <>
            {step === 1 && (
              <div className="space-y-5">
                {!isEdit && (
                  <div className="rounded-lg border bg-primary/5 p-3">
                    <Label className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      <Sparkles className="size-3.5 text-primary" />
                      Draft with the Co-Analyst
                    </Label>
                    <div className="mt-2 flex gap-2">
                      <Input
                        value={saraPrompt}
                        onChange={(e) => setSaraPrompt(e.target.value)}
                        placeholder="e.g. Summarize this week's critical incidents for the board"
                        className="h-9"
                      />
                      <Button size="sm" className="h-9 shrink-0" onClick={applySaraDraft} disabled={!saraPrompt.trim()}>
                        Draft
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Report type
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={isEdit}
                      onClick={() => setArchetype("template")}
                      className={cn(
                        "rounded-lg border p-3 text-left transition-colors disabled:opacity-60",
                        archetype === "template" ? "border-primary/40 bg-primary/5" : "hover:bg-accent"
                      )}
                    >
                      <FileText className="size-4 text-primary" />
                      <div className="mt-2 text-sm font-medium">Template report</div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Widget-based layout with cover-page branding.
                      </p>
                    </button>
                    <button
                      type="button"
                      disabled={isEdit}
                      onClick={() => setArchetype("saved-export")}
                      className={cn(
                        "rounded-lg border p-3 text-left transition-colors disabled:opacity-60",
                        archetype === "saved-export" ? "border-primary/40 bg-primary/5" : "hover:bg-accent"
                      )}
                    >
                      <FileSpreadsheet className="size-4 text-emerald-600 dark:text-emerald-400" />
                      <div className="mt-2 text-sm font-medium">Saved search export</div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Snapshot of a list-view filter, exported as Excel.
                      </p>
                    </button>
                  </div>
                </div>

                {archetype === "template" ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Output format
                      </Label>
                      <div className="flex gap-1.5">
                        <Badge
                          className={cn(
                            "rounded-md border px-2.5 py-1 text-xs",
                            format === "PDF" ? "border-primary/25 bg-primary/10 text-primary" : "text-muted-foreground"
                          )}
                          onClick={() => setFormat("PDF")}
                        >
                          PDF
                        </Badge>
                        <Badge variant="outline" className="rounded-md px-2.5 py-1 text-xs text-muted-foreground">
                          Excel · Coming soon
                        </Badge>
                        <Badge variant="outline" className="rounded-md px-2.5 py-1 text-xs text-muted-foreground">
                          CSV · Coming soon
                        </Badge>
                      </div>
                    </div>

                    <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Template
                    </Label>
                    {isCustomFlow ? (
                      <div className="flex items-center gap-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3">
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-linear-to-br from-primary to-primary/70 text-primary-foreground">
                          <Wand2 className="size-4" />
                        </span>
                        <div className="flex-1">
                          <div className="text-sm font-medium">Building from scratch</div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            No preset applied — you'll add your own widgets on the next step.
                          </p>
                        </div>
                        <Button size="sm" variant="ghost" className="h-7 shrink-0 text-xs" onClick={() => setTemplateId(undefined)}>
                          Browse templates
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {reportTemplates.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => applyTemplate(t.id)}
                            className={cn(
                              "rounded-lg border p-3 text-left transition-colors",
                              templateId === t.id ? "border-primary/40 bg-primary/5" : "hover:bg-accent"
                            )}
                          >
                            <div className="text-sm font-medium">{t.name}</div>
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{t.description}</p>
                            <div className="mt-1.5 text-[11px] text-muted-foreground">
                              {t.widgetIds.length} widgets · {moduleLabels[t.module]}
                            </div>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setTemplateId(CUSTOM_TEMPLATE_ID)}
                          className="flex items-center gap-2 rounded-lg border border-dashed p-3 text-left text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                        >
                          <Sparkles className="size-4 shrink-0" />
                          <div>
                            <div className="text-sm font-medium">Build your own</div>
                            <p className="mt-0.5 text-xs">Skip the presets, pick your own widgets</p>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Source module
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(moduleLabels) as ReportModule[]).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setModuleSel(m)
                            setSavedSearchSummary(SAVED_SEARCH_PRESETS[m])
                          }}
                          className={cn(
                            "rounded-lg border p-2.5 text-xs font-medium transition-colors",
                            moduleSel === m ? "border-primary/40 bg-primary/5 text-primary" : "hover:bg-accent"
                          )}
                        >
                          {moduleLabels[m]}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Output format: Excel (matches the saved search it was captured from).
                    </p>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="report-name">Name</Label>
                    <Input
                      id="report-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Report name"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="report-desc">Description</Label>
                    <Input
                      id="report-desc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Optional one-line description"
                      className="h-9"
                    />
                  </div>
                </div>

                {archetype === "template" ? (
                  <>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Cover page
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {coverPages.map((cp) => (
                          <button
                            key={cp.id}
                            type="button"
                            onClick={() => setCoverPageId(cp.id)}
                            className={cn(
                              "flex items-center gap-2 rounded-md border p-1.5 pr-3 text-xs transition-colors",
                              coverPageId === cp.id ? "border-primary/40 bg-primary/5" : "hover:bg-accent"
                            )}
                          >
                            <span className={`size-6 rounded bg-linear-to-br ${cp.bgFrom} ${cp.bgTo}`} />
                            {cp.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          Sections
                        </Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              disabled={availableWidgets.length === 0}
                            >
                              <Plus className="size-3.5" />
                              Add widget
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            {availableWidgets.map((w) => (
                              <DropdownMenuItem key={w.id} onClick={() => addWidget(w.id)}>
                                <span className="flex-1">{w.title}</span>
                                <Badge variant="secondary" className="font-normal text-[10px] capitalize">
                                  {w.type}
                                </Badge>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="divide-y rounded-lg border">
                        {sections.map((s, i) => {
                          const widget = reportWidgetCatalog.find((w) => w.id === s.widgetId)
                          return (
                            <div key={s.widgetId} className="flex items-center gap-2 px-3 py-2">
                              <Checkbox checked={s.included} onCheckedChange={() => toggleSection(i)} />
                              <span className={cn("flex-1 text-sm", !s.included && "text-muted-foreground line-through")}>
                                {widget?.title ?? s.widgetId}
                              </span>
                              <Badge variant="secondary" className="font-normal text-[10px] capitalize">
                                {widget?.type}
                              </Badge>
                              <div className="flex items-center gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  disabled={i === 0}
                                  onClick={() => moveSection(i, -1)}
                                >
                                  <ArrowUp className="size-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  disabled={i === sections.length - 1}
                                  onClick={() => moveSection(i, 1)}
                                >
                                  <ArrowDown className="size-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={() => removeSection(i)}
                                >
                                  <X className="size-3" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                        {sections.length === 0 && (
                          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                            No sections yet — add a widget above to start building.
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Saved scope
                    </Label>
                    <div className="rounded-lg border bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
                      {savedSearchSummary}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Frozen from {moduleLabels[moduleSel]} at save time — editing the search here re-captures a new scope.
                    </p>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
                  <div>
                    <div className="text-sm font-medium">Schedule this report</div>
                    <p className="text-xs text-muted-foreground">Deliver automatically on a recurring basis.</p>
                  </div>
                  <Checkbox checked={scheduleEnabled} onCheckedChange={(v) => setScheduleEnabled(!!v)} />
                </div>
                {scheduleEnabled && <ScheduleForm value={schedule} onChange={setSchedule} />}
              </div>
            )}

            <DialogFooter className="mt-2">
              {step > 1 && (
                <Button variant="outline" size="sm" onClick={() => setStep((s) => (s - 1) as 1 | 2)}>
                  <ArrowLeft className="size-3.5" />
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button
                  size="sm"
                  className="sm:ml-auto"
                  disabled={step === 1 ? !canAdvanceStep1 : !canAdvanceStep2}
                  onClick={() => setStep((s) => (s + 1) as 2 | 3)}
                >
                  Next
                  <ArrowRight className="size-3.5" />
                </Button>
              ) : (
                <Button size="sm" className="sm:ml-auto" onClick={handleSubmit}>
                  {isEdit ? "Save changes" : "Create report"}
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
