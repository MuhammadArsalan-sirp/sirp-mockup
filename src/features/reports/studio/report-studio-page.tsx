import { useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router"
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  CheckCheck,
  ChevronLeft,
  Copy,
  Eye,
  FileDown,
  Plus,
  Save,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { moduleLabels, reportTemplates, type Report, type ReportModule } from "@/data/reports"
import { useReportsStore } from "@/stores/reports-store"
import { seedLibraryBlocks, type LibraryBlock } from "@/data/reports-ai"
import { users } from "@/data/users"
import { ScheduleDialog } from "../components/schedule-dialog"
import { CoAnalystDock } from "../ai/co-analyst-dock"
import { explainChart, rewrite } from "../ai/ai-engine"
import type { BlockChange, ComposePlan } from "../ai/ai-types"
import { exportDocumentToHtml, exportDocumentToPdf } from "../lib/export-print-document"
import { PAGE_WIDTH, PAPER_ASPECT, isCoverPage, paperKey, splitPages, toRows } from "./report-pagination"
import { reportsBackend } from "../lib/reports-backend"
import { BLOCK_ICON, ReportStudioPalette } from "./report-studio-palette"
import { ReportStudioProperties } from "./report-studio-properties"
import { DocumentSettingsDialog } from "./report-studio-document"
import { StudioBlockContent } from "./report-studio-block-content"
import {
  BLOCK_GROUPS,
  BLOCK_LABELS,
  MARGIN_PX,
  TIME_RANGES,
  blankBlocks,
  blocksFromPlan,
  blocksFromTemplateWidgets,
  createBlock,
  defaultDocSettings,
  resolveVars,
  type DocSettings,
  type StudioBlock,
  type StudioBlockBase,
  type StudioBlockType,
  type TextProps,
} from "./report-studio-types"

type StudioLocationState = { templateId?: string; plan?: ComposePlan; report?: Report } | null

export function ReportStudioPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as StudioLocationState
  const template = state?.templateId ? reportTemplates.find((t) => t.id === state.templateId) : undefined
  const plan = state?.plan
  const fixture = state?.report

  const [searchParams, setSearchParams] = useSearchParams()
  const saveDefinition = useReportsStore((s) => s.save)
  const publishDefinition = useReportsStore((s) => s.publish)
  const addEdition = useReportsStore((s) => s.addEdition)
  // Read once on mount: later store writes must not clobber what's being edited.
  const [existing] = useState(() => {
    const id = searchParams.get("id")
    return id ? useReportsStore.getState().get(id) : undefined
  })

  const [blocks, setBlocks] = useState<StudioBlock[]>(() => {
    if (existing) return existing.blocks
    if (plan) return blocksFromPlan(plan.sections)
    if (template) return blocksFromTemplateWidgets(template.widgetIds, template.name, template.description)
    if (fixture?.sections?.length)
      return blocksFromTemplateWidgets(fixture.sections.map((s) => s.widgetId), fixture.name, fixture.description ?? "")
    return blankBlocks()
  })
  const [doc, setDoc] = useState<DocSettings>(() => {
    const base = defaultDocSettings()
    if (existing) return existing.doc
    if (plan) return { ...base, module: plan.module, timeRange: plan.period, pageTarget: plan.pageTarget }
    if (template) return { ...base, module: template.module }
    if (fixture) return { ...base, module: fixture.module }
    return base
  })
  const [reportName, setReportName] = useState(
    existing?.name ?? (plan ? planTitle(plan) : (template?.name ?? fixture?.name ?? "Untitled report"))
  )
  const [savedId, setSavedId] = useState<string | null>(existing?.id ?? null)
  const [status, setStatus] = useState<"draft" | "published">(existing?.status ?? "draft")
  const [savedAt, setSavedAt] = useState<number | null>(existing?.savedAt ?? null)
  const [dirty, setDirty] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [preview, setPreview] = useState(false)
  const [reviewMode, setReviewMode] = useState(false)
  const [dockOpen, setDockOpen] = useState(Boolean(plan))
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [docOpen, setDocOpen] = useState(false)
  const [library, setLibrary] = useState<LibraryBlock[]>(seedLibraryBlocks)
  const [undoStack, setUndoStack] = useState<StudioBlock[][]>([])
  const canvasRef = useRef<HTMLDivElement>(null)

  // Anything that changes the document marks it dirty; the first render doesn't.
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    setDirty(true)
  }, [blocks, doc, reportName])

  // Autosave, but only once the author has saved deliberately — an untitled
  // scratch document shouldn't litter the list just because someone opened it.
  useEffect(() => {
    if (!dirty || !savedId) return
    const timer = setTimeout(() => persist(savedId), 1200)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, savedId, blocks, doc, reportName])

  function persist(id: string | null): string {
    const nextId = saveDefinition({ id, name: reportName, module: doc.module, blocks, doc })
    setSavedId(nextId)
    setSavedAt(Date.now())
    setDirty(false)
    if (!id) setSearchParams({ id: nextId }, { replace: true })
    return nextId
  }

  function handlePublish() {
    const id = persist(savedId)
    publishDefinition(id)
    setStatus("published")
  }

  const selected = blocks.find((b) => b.id === selectedId) ?? null
  const hasCover = blocks.some((b) => b.type === "cover")
  const disabledTypes: StudioBlockType[] = hasCover ? ["cover"] : []
  const pages = useMemo(() => splitPages(blocks), [blocks])
  const pageWidth = PAGE_WIDTH[paperKey(doc.pageSize, doc.orientation)] ?? 794
  const pageAspect = PAPER_ASPECT[paperKey(doc.pageSize, doc.orientation)] ?? "210 / 297"

  // What the cover lists as its contents: the document's own section titles.
  const coverContents = useMemo(
    () =>
      blocks
        .filter((b) => !["cover", "divider", "spacer", "pageBreak", "kpi"].includes(b.type))
        .map((b) => {
          const p = b.props as Record<string, unknown>
          return typeof p.title === "string" ? p.title : typeof p.text === "string" ? p.text : BLOCK_LABELS[b.type]
        })
        .filter((t) => t.length < 60),
    [blocks]
  )
  const unreviewed = blocks.filter((b) => b.ai?.generated && (b.ai.review ?? "unreviewed") === "unreviewed").length

  function snapshot() {
    setUndoStack((prev) => [...prev.slice(-9), blocks])
  }

  function addBlock(type: StudioBlockType) {
    if (disabledTypes.includes(type)) return
    snapshot()
    const block = createBlock(type)
    setBlocks((prev) => {
      const idx = selectedId ? prev.findIndex((b) => b.id === selectedId) + 1 : prev.length
      const next = [...prev]
      next.splice(idx, 0, block)
      return next
    })
    setSelectedId(block.id)
  }

  function appendBlock(type: StudioBlockType) {
    if (disabledTypes.includes(type)) return
    snapshot()
    const block = createBlock(type)
    setBlocks((prev) => [...prev, block])
    setSelectedId(block.id)
  }

  function addFromLibrary(entry: LibraryBlock) {
    snapshot()
    const block = createBlock(entry.blockType as StudioBlockType)
    const props = block.props as Record<string, unknown>
    if ("title" in props) props.title = entry.name
    setBlocks((prev) => [...prev, block])
    setSelectedId(block.id)
  }

  function saveToLibrary(block: StudioBlock) {
    const props = block.props as Record<string, unknown>
    const name = typeof props.title === "string" ? props.title : BLOCK_LABELS[block.type]
    setLibrary((prev) =>
      prev.some((e) => e.name === name)
        ? prev
        : [...prev, { id: crypto.randomUUID(), name, blockType: block.type, description: "Saved from this report.", usedIn: 1, owner: "personal" }]
    )
  }

  function moveBlock(id: string, dir: -1 | 1) {
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  function duplicateBlock(id: string) {
    snapshot()
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.id === id)
      if (i < 0) return prev
      const copy = { ...prev[i], id: crypto.randomUUID(), props: { ...prev[i].props } } as StudioBlock
      const next = [...prev]
      next.splice(i + 1, 0, copy)
      return next
    })
  }

  function deleteBlock(id: string) {
    snapshot()
    setBlocks((prev) => prev.filter((b) => b.id !== id))
    setSelectedId((prev) => (prev === id ? null : prev))
  }

  function updateBlockProps(id: string, patch: Record<string, unknown>) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? ({ ...b, props: { ...b.props, ...patch } } as StudioBlock) : b)))
  }

  function updateBlockBase(id: string, patch: Partial<StudioBlockBase>) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? ({ ...b, ...patch } as StudioBlock) : b)))
  }

  /** Turns a chart into prose, right below the chart it explains. */
  function handleExplainChart(block: StudioBlock) {
    if (block.type !== "chart") return
    snapshot()
    const text = createBlock("text")
    ;(text.props as TextProps).text = explainChart(block.props.title)
    ;(text.props as TextProps).generated = true
    text.ai = { generated: true, review: "unreviewed" }
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.id === block.id)
      const next = [...prev]
      next.splice(i + 1, 0, text)
      return next
    })
    setSelectedId(text.id)
  }

  /** Applies a Co-Analyst diff the human approved. */
  function applyChanges(changes: BlockChange[]) {
    snapshot()
    setBlocks((prev) => {
      let next = [...prev]
      for (const change of changes) {
        if (change.op === "remove") {
          next = next.filter((b) => b.id !== change.blockId)
        } else if (change.op === "add") {
          const block = createBlock(change.blockType as StudioBlockType)
          if (change.blockType === "table" && change.detail.includes("SLA")) {
            const props = block.props as Record<string, unknown>
            props.dataset = "slaByTeam"
            props.title = "SLA attainment by team"
          }
          next.push(block)
        } else if (change.op === "reorder") {
          const i = next.findIndex((b) => b.id === change.blockId)
          const j = i + change.direction
          if (i >= 0 && j >= 0 && j < next.length) [next[i], next[j]] = [next[j], next[i]]
        } else if (change.op === "modify") {
          next = next.map((b) => {
            if (b.id !== change.blockId) return b
            const patch = change.patch as { tone?: "executive" | "technical"; locale?: "en" | "ar" }
            const updated = { ...b, ai: { ...b.ai, ...patch, generated: true, review: "unreviewed" as const } } as StudioBlock
            if (updated.type === "text") {
              const mode = patch.locale === "ar" ? "arabic" : (patch.tone ?? "executive")
              ;(updated.props as TextProps).text = rewrite((b.props as TextProps).text, mode)
            }
            return updated
          })
        }
      }
      return next
    })

    for (const change of changes) {
      if (change.op === "document") setDoc((prev) => ({ ...prev, ...(change.patch as Partial<DocSettings>) }))
    }
  }

  function undo() {
    setUndoStack((prev) => {
      if (!prev.length) return prev
      setBlocks(prev[prev.length - 1])
      return prev.slice(0, -1)
    })
  }

  function acceptAllGenerated() {
    setBlocks((prev) =>
      prev.map((b) => (b.ai?.generated && (b.ai.review ?? "unreviewed") === "unreviewed" ? ({ ...b, ai: { ...b.ai, review: "accepted" } } as StudioBlock) : b))
    )
  }

  const scheduleReportStub = {
    id: `draft-${state?.templateId ?? "custom"}`,
    name: reportName,
    archetype: "template" as const,
    format: "PDF" as const,
    module: doc.module,
    status: "draft" as const,
    author: users.ahmed,
    createdOn: "Today",
    updatedOn: "Today",
    isScheduled: false,
    generatedCount: 0,
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-13 shrink-0 items-center gap-2 border-b bg-card px-4">
        <button
          type="button"
          onClick={() => navigate("/reports/templates")}
          className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Back to templates"
        >
          <ChevronLeft className="size-4" />
        </button>
        <input
          value={reportName}
          onChange={(e) => setReportName(e.target.value)}
          className="h-8 min-w-40 max-w-72 rounded-md border border-transparent bg-transparent px-2 text-sm font-semibold outline-none transition-colors hover:border-border focus:border-primary/40 focus:bg-accent/40"
        />
        <span
          className={cn(
            "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize",
            status === "published"
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "text-muted-foreground"
          )}
        >
          {status}
        </span>
        <span className="hidden shrink-0 font-mono text-[10px] text-muted-foreground sm:inline">
          {dirty ? "Unsaved changes" : savedAt ? "All changes saved" : "Not saved yet"}
        </span>
        <span className="flex-1" />

        {!preview && (
          <>
            {unreviewed > 0 && (
              <button
                type="button"
                onClick={() => setReviewMode((r) => !r)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                  reviewMode ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400" : "border-amber-500/25 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400"
                )}
              >
                <ShieldCheck className="size-3.5" />
                {unreviewed} to review
              </button>
            )}
            <Select value={doc.module} onValueChange={(v) => setDoc((p) => ({ ...p, module: v as ReportModule }))}>
              <SelectTrigger size="sm" className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(moduleLabels) as ReportModule[]).map((m) => (
                  <SelectItem key={m} value={m}>{moduleLabels[m]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={doc.timeRange} onValueChange={(v) => setDoc((p) => ({ ...p, timeRange: v }))}>
              <SelectTrigger size="sm" className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIME_RANGES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={() => setDocOpen(true)} title="Page setup, branding, variables">
              <Settings2 className="size-3.5" />
              Document
            </Button>
            <Button
              size="sm"
              variant="outline"
              className={cn("border-primary/25 bg-primary/10 text-primary hover:bg-primary/15", dockOpen && "bg-primary/20")}
              onClick={() => setDockOpen((d) => !d)}
            >
              <Sparkles className="size-3.5" />
              Co-Analyst
            </Button>
            <Button size="sm" variant="outline" onClick={() => setScheduleOpen(true)} disabled={!savedId} title={savedId ? undefined : "Save the report before scheduling it"}>
              Schedule
            </Button>
            <Button size="sm" variant={dirty || !savedId ? "default" : "outline"} onClick={() => persist(savedId)}>
              <Save className="size-3.5" />
              Save
            </Button>
            {status === "draft" && (
              <Button size="sm" variant="outline" onClick={handlePublish}>Publish</Button>
            )}
          </>
        )}
        <Button size="sm" onClick={() => setExportOpen(true)}>
          <FileDown className="size-3.5" />
          Export
        </Button>
      </header>

      {reviewMode && !preview && (
        <div className="flex shrink-0 items-center gap-3 border-b bg-amber-500/10 px-4 py-2 text-xs text-amber-700 dark:text-amber-300">
          <ShieldCheck className="size-3.5 shrink-0" />
          <span className="min-w-0 flex-1">
            Review mode — {unreviewed} generated section{unreviewed === 1 ? "" : "s"} still unaccepted. Rejected
            sections are dropped from the export.
          </span>
          <Button size="sm" variant="outline" className="h-7 border-amber-500/40 text-[11px]" onClick={acceptAllGenerated}>
            <CheckCheck className="size-3" />
            Accept all
          </Button>
          <button type="button" onClick={() => setReviewMode(false)} className="text-[11px] font-medium underline underline-offset-2">
            Exit
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        {!preview && (
          <aside className="min-h-0 w-56 shrink-0 overflow-y-auto border-r bg-card">
            <ReportStudioPalette onAdd={addBlock} onAddFromLibrary={addFromLibrary} library={library} disabledTypes={disabledTypes} />
          </aside>
        )}

        <main className="min-h-0 flex-1 overflow-y-auto bg-muted/30 px-6 py-6">
          <div className="mx-auto" style={{ maxWidth: pageWidth }}>
            <div className="mb-4 flex items-center justify-center gap-2">
              <div className="inline-flex items-center gap-1 rounded-lg border bg-card p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setPreview((p) => !p)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    preview ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {preview ? <ArrowLeft className="size-3.5" /> : <Eye className="size-3.5" />}
                  {preview ? "Exit preview" : "Preview"}
                </button>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">
                {pages.length} page{pages.length === 1 ? "" : "s"} · {doc.pageSize} {doc.orientation}
              </span>
            </div>

            <div ref={canvasRef} className="space-y-5">
              {pages.map((pageBlocks, pageIndex) => {
                // A cover fills its sheet edge to edge — no margins, and no
                // running header or page number over the artwork.
                const cover = isCoverPage(pageBlocks)
                return (
                <section key={pageIndex} data-report-page className="overflow-hidden rounded-xl border bg-card shadow-sm">
                  {!cover && <PageChrome doc={doc} pageIndex={pageIndex} pageCount={pages.length} position="header" />}

                  <div
                    style={cover ? undefined : { paddingLeft: MARGIN_PX[doc.margin], paddingRight: MARGIN_PX[doc.margin] }}
                    className={cover ? undefined : "py-2"}
                  >
                    {toRows(pageBlocks).map((row, rowIndex) => (
                      <div key={rowIndex} className={cn(row.length > 1 && "grid grid-cols-2 gap-3")}>
                        {row.map((block) => (
                          <StudioBlockRow
                            key={block.id}
                            block={block}
                            vars={doc.variables}
                            pageAspect={pageAspect}
                            coverContents={coverContents}
                            selected={block.id === selectedId}
                            preview={preview}
                            reviewMode={reviewMode}
                            onSelect={() => setSelectedId(block.id)}
                            onMoveUp={() => moveBlock(block.id, -1)}
                            onMoveDown={() => moveBlock(block.id, 1)}
                            onDuplicate={() => duplicateBlock(block.id)}
                            onDelete={() => deleteBlock(block.id)}
                            onReview={(review) => updateBlockBase(block.id, { ai: { ...block.ai, review } })}
                          />
                        ))}
                      </div>
                    ))}

                    {pageBlocks.length === 0 && (
                      <div className="py-10 text-center text-xs text-muted-foreground">
                        Empty page. Add a block, or remove the page break above it.
                      </div>
                    )}
                  </div>

                  {!cover && <PageChrome doc={doc} pageIndex={pageIndex} pageCount={pages.length} position="footer" />}

                  {!preview && pageIndex === pages.length - 1 && (
                    <div className="border-t px-10 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                          >
                            <Plus className="size-3.5" />
                            Add section
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-56">
                          {BLOCK_GROUPS.map((group, i) => (
                            <div key={group.label}>
                              {i > 0 && <DropdownMenuSeparator />}
                              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider">{group.label}</DropdownMenuLabel>
                              {group.types.map((type) => {
                                const Icon = BLOCK_ICON[type]
                                return (
                                  <DropdownMenuItem key={type} disabled={disabledTypes.includes(type)} onClick={() => appendBlock(type)}>
                                    <Icon className="size-3.5" />
                                    {BLOCK_LABELS[type]}
                                  </DropdownMenuItem>
                                )
                              })}
                            </div>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </section>
                )
              })}
            </div>
          </div>
        </main>

        {!preview && !dockOpen && (
          <aside className="min-h-0 w-76 shrink-0 overflow-y-auto border-l bg-card">
            <ReportStudioProperties
              block={selected}
              doc={doc}
              onChange={updateBlockProps}
              onChangeBase={updateBlockBase}
              onSaveToLibrary={saveToLibrary}
              onExplainChart={handleExplainChart}
            />
          </aside>
        )}

        {!preview && dockOpen && (
          <CoAnalystDock
            blocks={blocks}
            onApply={applyChanges}
            onUndo={undo}
            canUndo={undoStack.length > 0}
            onClose={() => setDockOpen(false)}
          />
        )}
      </div>

      <DocumentSettingsDialog open={docOpen} onOpenChange={setDocOpen} doc={doc} onChange={(patch) => setDoc((p) => ({ ...p, ...patch }))} />
      <ScheduleDialog open={scheduleOpen} onOpenChange={setScheduleOpen} report={scheduleReportStub} />
      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        reportId={scheduleReportStub.id}
        reportName={reportName}
        blocks={blocks}
        doc={doc}
        coverContents={coverContents}
        pageCount={pages.length}
        unreviewed={unreviewed}
        onExported={(format) => {
          const id = persist(savedId)
          addEdition(id, { trigger: "manual", format, blockCount: blocks.length })
        }}
      />
    </div>
  )
}

function planTitle(plan: ComposePlan): string {
  const trimmed = plan.prompt.trim()
  const first = trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
  return first.length > 58 ? `${first.slice(0, 55)}…` : first
}

/** Running header and footer — what actually prints on every page. */
function PageChrome({
  doc,
  pageIndex,
  pageCount,
  position,
}: {
  doc: DocSettings
  pageIndex: number
  pageCount: number
  position: "header" | "footer"
}) {
  const text = position === "header" ? doc.headerText : doc.footerText
  if (!text && position === "header") return null

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-10 py-2 text-[10px] text-muted-foreground",
        position === "header" ? "border-b bg-muted/30" : "border-t bg-muted/30"
      )}
    >
      {position === "header" && (
        <span className="rounded border px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-wide" style={{ borderColor: doc.accent, color: doc.accent }}>
          {doc.logoText}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate">{resolveVars(text, doc.variables)}</span>
      {position === "header" && doc.repeatClassification && (
        <span className="shrink-0 font-mono text-[9px] tracking-wide">{doc.variables.classification ?? "TLP:AMBER"}</span>
      )}
      {position === "footer" && doc.showPageNumbers && (
        <span className="shrink-0 font-mono tabular-nums">
          {pageIndex + 1} / {pageCount}
        </span>
      )}
    </div>
  )
}

function StudioBlockRow({
  block,
  vars,
  pageAspect,
  coverContents,
  selected,
  preview,
  reviewMode,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onReview,
}: {
  block: StudioBlock
  vars: Record<string, string>
  pageAspect: string
  coverContents: string[]
  selected: boolean
  preview: boolean
  reviewMode: boolean
  onSelect: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onDelete: () => void
  onReview: (review: "accepted" | "rejected") => void
}) {
  const review = block.ai?.review ?? "unreviewed"
  const needsReview = Boolean(block.ai?.generated) && review === "unreviewed"
  const rejected = review === "rejected"

  if (preview) {
    if (rejected) return null
    return (
      <div className={cn(block.style?.emphasis && "-mx-3 rounded-lg border-l-2 border-primary bg-muted/40 px-3 py-1")}>
        <StudioBlockContent block={block} vars={vars} pageAspect={pageAspect} coverContents={coverContents} />
      </div>
    )
  }

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative my-0.5 rounded-lg border border-transparent transition-colors hover:border-border",
        block.type === "cover" ? "overflow-hidden" : "-mx-2 px-2",
        selected && "border-primary/40 bg-primary/5",
        reviewMode && needsReview && "border-amber-500/50 bg-amber-500/5",
        rejected && "opacity-45",
        block.style?.emphasis && "border-l-2 border-l-primary bg-muted/40"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -top-3 right-2 z-10 items-center gap-0.5 rounded-md border bg-card p-0.5 shadow-md",
          selected ? "flex" : "hidden group-hover:flex"
        )}
      >
        <button type="button" onClick={(e) => { e.stopPropagation(); onMoveUp() }} className="pointer-events-auto grid size-6 place-items-center rounded text-muted-foreground hover:bg-accent hover:text-foreground" title="Move up">
          <ArrowUp className="size-3" />
        </button>
        <button type="button" onClick={(e) => { e.stopPropagation(); onMoveDown() }} className="pointer-events-auto grid size-6 place-items-center rounded text-muted-foreground hover:bg-accent hover:text-foreground" title="Move down">
          <ArrowDown className="size-3" />
        </button>
        <button type="button" onClick={(e) => { e.stopPropagation(); onDuplicate() }} className="pointer-events-auto grid size-6 place-items-center rounded text-muted-foreground hover:bg-accent hover:text-foreground" title="Duplicate">
          <Copy className="size-3" />
        </button>
        <button type="button" onClick={(e) => { e.stopPropagation(); onDelete() }} className="pointer-events-auto grid size-6 place-items-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="Delete">
          <Trash2 className="size-3" />
        </button>
      </div>

      {reviewMode && needsReview && (
        <div className="mb-1.5 flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1">
          <span className="text-[10px] font-medium uppercase tracking-wider text-amber-700 dark:text-amber-300">Generated — needs review</span>
          <span className="flex-1" />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onReview("accepted") }}
            className="pointer-events-auto flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300"
          >
            <Check className="size-2.5" />
            Accept
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onReview("rejected") }}
            className="pointer-events-auto rounded border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
          >
            Reject
          </button>
        </div>
      )}

      {rejected && (
        <div className="mb-1.5 rounded-md border px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Rejected — omitted from export
        </div>
      )}

      <StudioBlockContent block={block} vars={vars} pageAspect={pageAspect} coverContents={coverContents} />
    </div>
  )
}

function ExportDialog({
  open,
  onOpenChange,
  reportId,
  reportName,
  blocks,
  doc,
  coverContents,
  pageCount,
  unreviewed,
  onExported,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportId: string
  reportName: string
  blocks: StudioBlock[]
  doc: DocSettings
  coverContents: string[]
  pageCount: number
  unreviewed: number
  onExported: (format: "PDF" | "HTML") => void
}) {
  const [format, setFormat] = useState<"pdf" | "html">("pdf")
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle")

  function handleOpenChange(next: boolean) {
    if (!next) setState("idle")
    onOpenChange(next)
  }

  async function handleExport() {
    setState("working")
    try {
      const filenameBase = reportName.replace(/[^a-z0-9]+/gi, "-") || "report"
      const input = { blocks, doc, coverContents }
      if (format === "pdf") {
        await exportDocumentToPdf(input, `${filenameBase}.pdf`)
        void reportsBackend.logExport({ reportId, reportName, format: "PDF", triggeredBy: "manual" })
      } else {
        await exportDocumentToHtml(input, `${filenameBase}.html`, reportName)
      }
      onExported(format === "pdf" ? "PDF" : "HTML")
      setState("done")
      setTimeout(() => handleOpenChange(false), 900)
    } catch (err) {
      console.error("[report-studio] export failed:", err)
      setState("error")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export report</DialogTitle>
          <DialogDescription>
            {pageCount} page{pageCount === 1 ? "" : "s"} · rendered with live data at the current scope.
          </DialogDescription>
        </DialogHeader>
        {state === "done" ? (
          <div className="grid place-items-center py-8 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Check className="size-5" />
            </span>
            <p className="mt-3 text-sm font-medium">{format === "pdf" ? "PDF downloaded" : "HTML snapshot downloaded"}</p>
          </div>
        ) : state === "error" ? (
          <div className="grid place-items-center py-8 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
              <FileDown className="size-5" />
            </span>
            <p className="mt-3 text-sm font-medium">Export failed</p>
            <p className="mt-1 text-xs text-muted-foreground">Nothing to render, or the capture failed. Try again.</p>
            <Button size="sm" variant="outline" className="mt-4" onClick={() => setState("idle")}>Try again</Button>
          </div>
        ) : (
          <>
            {unreviewed > 0 && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
                {unreviewed} generated section{unreviewed === 1 ? "" : "s"} still unreviewed — they will be included
                as written. Rejected sections are left out.
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat("pdf")}
                className={cn("rounded-lg border p-3 text-left transition-colors", format === "pdf" ? "border-primary/40 bg-primary/5" : "hover:bg-accent")}
              >
                <div className="text-sm font-medium">PDF</div>
                <p className="mt-0.5 text-xs text-muted-foreground">Branded, print-ready</p>
              </button>
              <button
                type="button"
                onClick={() => setFormat("html")}
                className={cn("rounded-lg border p-3 text-left transition-colors", format === "html" ? "border-primary/40 bg-primary/5" : "hover:bg-accent")}
              >
                <div className="text-sm font-medium">HTML</div>
                <p className="mt-0.5 text-xs text-muted-foreground">Interactive, shareable</p>
              </button>
            </div>
            {state === "working" && (
              <div className="space-y-1.5">
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-primary" />
                </div>
                <p className="font-mono text-[11px] text-muted-foreground">Rendering blocks…</p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)}>Cancel</Button>
              <Button size="sm" disabled={state === "working"} onClick={handleExport}>
                Generate {format.toUpperCase()}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
