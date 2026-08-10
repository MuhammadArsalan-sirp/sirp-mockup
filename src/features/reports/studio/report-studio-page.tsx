import { useRef, useState, type RefObject } from "react"
import { useLocation, useNavigate } from "react-router"
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  ChevronLeft,
  Copy,
  Eye,
  FileDown,
  Plus,
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
import { moduleLabels, reportTemplates, type ReportModule } from "@/data/reports"
import { users } from "@/data/users"
import { ScheduleDialog } from "../components/schedule-dialog"
import { exportNodeToHtmlSnapshot, exportNodeToPdf } from "../lib/report-export"
import { reportsBackend } from "../lib/reports-backend"
import { BLOCK_ICON, ReportStudioPalette } from "./report-studio-palette"
import { ReportStudioProperties } from "./report-studio-properties"
import { StudioBlockContent } from "./report-studio-block-content"
import {
  BLOCK_GROUPS,
  BLOCK_LABELS,
  blankBlocks,
  blocksFromTemplateWidgets,
  createBlock,
  type StudioBlock,
  type StudioBlockType,
} from "./report-studio-types"

const TIME_RANGES = ["Last 24 hours", "Last 7 days", "Last 30 days", "Last quarter"]

type StudioLocationState = { templateId?: string } | null

export function ReportStudioPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const templateId = (location.state as StudioLocationState)?.templateId
  const template = templateId ? reportTemplates.find((t) => t.id === templateId) : undefined

  const [blocks, setBlocks] = useState<StudioBlock[]>(() =>
    template
      ? blocksFromTemplateWidgets(template.widgetIds, template.name, template.description)
      : blankBlocks()
  )
  const [reportName, setReportName] = useState(template?.name ?? "Untitled report")
  const [moduleSel, setModuleSel] = useState<ReportModule>(template?.module ?? "incident")
  const [timeRange, setTimeRange] = useState(TIME_RANGES[1])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [preview, setPreview] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  const selected = blocks.find((b) => b.id === selectedId) ?? null
  // Only one cover/title page makes sense per report — every other block type
  // (including data blocks like Playbook runs) can repeat freely.
  const hasCover = blocks.some((b) => b.type === "cover")
  const disabledTypes: StudioBlockType[] = hasCover ? ["cover"] : []

  function addBlock(type: StudioBlockType) {
    if (disabledTypes.includes(type)) return
    const block = createBlock(type)
    setBlocks((prev) => {
      const idx = selectedId ? prev.findIndex((b) => b.id === selectedId) + 1 : prev.length
      const next = [...prev]
      next.splice(idx, 0, block)
      return next
    })
    setSelectedId(block.id)
  }

  /** Always appends at the very end, regardless of what's selected — used by
   * the "Add section" control at the bottom of the document. */
  function appendBlock(type: StudioBlockType) {
    if (disabledTypes.includes(type)) return
    const block = createBlock(type)
    setBlocks((prev) => [...prev, block])
    setSelectedId(block.id)
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
    setBlocks((prev) => prev.filter((b) => b.id !== id))
    setSelectedId((prev) => (prev === id ? null : prev))
  }

  function updateBlockProps(id: string, patch: Record<string, unknown>) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? ({ ...b, props: { ...b.props, ...patch } } as StudioBlock) : b)))
  }

  function focusSara() {
    const existing = blocks.find((b) => b.type === "text")
    if (existing) {
      setSelectedId(existing.id)
      return
    }
    const block = createBlock("text")
    setBlocks((prev) => [...prev, block])
    setSelectedId(block.id)
  }

  const scheduleReportStub = {
    id: `draft-${templateId ?? "custom"}`,
    name: reportName,
    archetype: "template" as const,
    format: "PDF" as const,
    module: moduleSel,
    status: "draft" as const,
    author: users.ahmed,
    createdOn: "Today",
    updatedOn: "Today",
    isScheduled: false,
    generatedCount: 0,
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-13 shrink-0 items-center gap-3 border-b bg-card px-4">
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
          className="h-8 min-w-48 max-w-84 rounded-md border border-transparent bg-transparent px-2 text-sm font-semibold outline-none transition-colors hover:border-border focus:border-primary/40 focus:bg-accent/40"
        />
        <span className="flex-1" />
        {!preview && (
          <>
            <Select value={moduleSel} onValueChange={(v) => setModuleSel(v as ReportModule)}>
              <SelectTrigger size="sm" className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(moduleLabels) as ReportModule[]).map((m) => (
                  <SelectItem key={m} value={m}>{moduleLabels[m]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger size="sm" className="w-38"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIME_RANGES.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" className="border-primary/25 bg-primary/10 text-primary hover:bg-primary/15" onClick={focusSara}>
              <Sparkles className="size-3.5" />
              Draft with SARA
            </Button>
            <Button size="sm" variant="outline" onClick={() => setScheduleOpen(true)}>
              Schedule
            </Button>
          </>
        )}
        <Button size="sm" onClick={() => setExportOpen(true)}>
          <FileDown className="size-3.5" />
          Export
        </Button>
      </header>

      <div className={cn("grid min-h-0 flex-1", preview ? "grid-cols-1" : "grid-cols-[220px_1fr_300px]")}>
        {!preview && (
          <aside className="min-h-0 overflow-y-auto border-r bg-card">
            <ReportStudioPalette onAdd={addBlock} disabledTypes={disabledTypes} />
          </aside>
        )}

        <main className="min-h-0 overflow-y-auto bg-muted/30 px-6 py-6">
          <div className="mx-auto max-w-190">
            <div className="mb-4 flex justify-center">
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
            </div>

            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <div ref={canvasRef} className="px-10 py-2">
                {blocks.map((block) => (
                  <StudioBlockRow
                    key={block.id}
                    block={block}
                    selected={block.id === selectedId}
                    preview={preview}
                    onSelect={() => setSelectedId(block.id)}
                    onMoveUp={() => moveBlock(block.id, -1)}
                    onMoveDown={() => moveBlock(block.id, 1)}
                    onDuplicate={() => duplicateBlock(block.id)}
                    onDelete={() => deleteBlock(block.id)}
                  />
                ))}
              </div>
              {!preview && (
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
            </div>
          </div>
        </main>

        {!preview && (
          <aside className="min-h-0 overflow-y-auto border-l bg-card">
            <ReportStudioProperties block={selected} onChange={updateBlockProps} />
          </aside>
        )}
      </div>

      <ScheduleDialog open={scheduleOpen} onOpenChange={setScheduleOpen} report={scheduleReportStub} />
      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        canvasRef={canvasRef}
        reportId={scheduleReportStub.id}
        reportName={reportName}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
      />
    </div>
  )
}

function StudioBlockRow({
  block,
  selected,
  preview,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}: {
  block: StudioBlock
  selected: boolean
  preview: boolean
  onSelect: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  if (preview) return <StudioBlockContent block={block} />

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative my-0.5 -mx-2 rounded-lg border border-transparent px-2 transition-colors hover:border-border",
        selected && "border-primary/40 bg-primary/5"
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
      <StudioBlockContent block={block} />
    </div>
  )
}

function ExportDialog({
  open,
  onOpenChange,
  canvasRef,
  reportId,
  reportName,
  selectedId,
  setSelectedId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  canvasRef: RefObject<HTMLDivElement | null>
  reportId: string
  reportName: string
  selectedId: string | null
  setSelectedId: (next: string | null) => void
}) {
  const [format, setFormat] = useState<"pdf" | "html">("pdf")
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle")

  function handleOpenChange(next: boolean) {
    if (!next) setState("idle")
    onOpenChange(next)
  }

  async function handleExport() {
    const node = canvasRef.current
    if (!node) {
      setState("error")
      return
    }
    setState("working")
    // Deselecting (rather than toggling preview mode) only changes a
    // className — unlike preview mode, it doesn't unmount/remount blocks, so
    // recharts' ResponsiveContainer never loses its measured size right
    // before capture.
    const previousSelectedId = selectedId
    setSelectedId(null)

    try {
      // The deselected row's `transition-colors` border/background fade
      // (Tailwind default ~150ms) needs to fully settle before capture, or
      // a just-deselected block's highlight bleeds into the export.
      await new Promise<void>((resolve) => setTimeout(resolve, 220))

      const filenameBase = reportName.replace(/[^a-z0-9]+/gi, "-") || "report"
      if (format === "pdf") {
        await exportNodeToPdf(node, `${filenameBase}.pdf`)
        void reportsBackend.logExport({ reportId, reportName, format: "PDF", triggeredBy: "manual" })
      } else {
        await exportNodeToHtmlSnapshot(node, `${filenameBase}.html`, reportName)
      }
      setState("done")
      setTimeout(() => handleOpenChange(false), 900)
    } catch (err) {
      console.error("[report-studio] export failed:", err)
      setState("error")
    } finally {
      setSelectedId(previousSelectedId)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export report</DialogTitle>
          <DialogDescription>Render the current layout with live data.</DialogDescription>
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
            <Button size="sm" variant="outline" className="mt-4" onClick={() => setState("idle")}>
              Try again
            </Button>
          </div>
        ) : (
          <>
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
