import { useState } from "react"
import { Check, Languages, Library, Maximize2, Minimize2, Sparkles, Wand2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { moduleLabels, type ReportModule } from "@/data/reports"
import { savedSearches } from "@/data/reports-ai"
import { REWRITE_LABELS, rewrite, type RewriteMode } from "../ai/ai-engine"
import {
  BLOCK_LABELS,
  RECOMMENDATIONS_DRAFT,
  SCOPE_DRAFT,
  SUMMARY_DRAFT,
  TIME_RANGES,
  type BlockDataBinding,
  type BlockStyle,
  type CalloutTone,
  type ChartDataset,
  type ChartKind,
  type DocSettings,
  type StudioBlock,
  type StudioBlockBase,
  type StudioBlockType,
  type TlpClassification,
} from "./report-studio-types"

const TLP_OPTIONS: TlpClassification[] = ["TLP:CLEAR", "TLP:GREEN", "TLP:AMBER", "TLP:RED"]
const TREND_DATASETS: { value: ChartDataset; label: string }[] = [
  { value: "incidentsOverTime", label: "Incidents over time" },
  { value: "mttrTrend", label: "MTTR trend" },
]
const SLICE_DATASETS: { value: ChartDataset; label: string }[] = [
  { value: "severity", label: "Severity breakdown" },
  { value: "disposition", label: "Disposition breakdown" },
]
const AI_PRESETS = [
  { key: "summary", label: "Executive summary", draft: SUMMARY_DRAFT },
  { key: "recommendations", label: "Recommendations", draft: RECOMMENDATIONS_DRAFT },
  { key: "scope", label: "Scope statement", draft: SCOPE_DRAFT },
]
const CALLOUT_TONES: { value: CalloutTone; label: string; dot: string }[] = [
  { value: "info", label: "Info", dot: "bg-primary" },
  { value: "warning", label: "Warning", dot: "bg-amber-500" },
  { value: "success", label: "Success", dot: "bg-emerald-500" },
  { value: "alert", label: "Alert", dot: "bg-destructive" },
]

/** Blocks that read data — these get the Data tab. */
const DATA_BOUND: StudioBlockType[] = [
  "kpi", "chart", "table", "mitre", "timeline", "entities", "playbooks", "execSummary", "anomalies", "whatChanged",
]
/** Blocks with nothing worth styling. */
const NO_STYLE: StudioBlockType[] = ["divider", "spacer", "pageBreak"]

const GROUP_BY_OPTIONS = ["None", "Severity", "Team", "Category", "Assignee", "Source", "ATT&CK tactic"]

type Props = {
  block: StudioBlock | null
  doc: DocSettings
  onChange: (id: string, patch: Record<string, unknown>) => void
  onChangeBase: (id: string, patch: Partial<StudioBlockBase>) => void
  onSaveToLibrary: (block: StudioBlock) => void
  onExplainChart: (block: StudioBlock) => void
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-[11px] leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  )
}

const INHERIT = "__inherit__"

export function ReportStudioProperties({ block, doc, onChange, onChangeBase, onSaveToLibrary, onExplainChart }: Props) {
  if (!block) return <DocumentHint />

  const set = (patch: Record<string, unknown>) => onChange(block.id, patch)
  const setData = (patch: Partial<BlockDataBinding>) => onChangeBase(block.id, { data: { ...block.data, ...patch } })
  const setStyle = (patch: Partial<BlockStyle>) => onChangeBase(block.id, { style: { ...block.style, ...patch } })

  const showData = DATA_BOUND.includes(block.type)
  const showStyle = !NO_STYLE.includes(block.type)

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="text-sm font-semibold">{BLOCK_LABELS[block.type]}</div>
        <button
          type="button"
          onClick={() => onSaveToLibrary(block)}
          title="Save to library"
          className="flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Library className="size-3" />
          Save
        </button>
      </div>

      <Tabs defaultValue="content" className="min-h-0 flex-1">
        <TabsList className="mx-4 mt-3 grid w-auto grid-cols-3">
          <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
          <TabsTrigger value="data" disabled={!showData} className="text-xs">Data</TabsTrigger>
          <TabsTrigger value="style" disabled={!showStyle} className="text-xs">Style</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4 p-4">
          <ContentTab block={block} set={set} onChangeBase={onChangeBase} onExplainChart={onExplainChart} />
        </TabsContent>

        <TabsContent value="data" className="space-y-4 p-4">
          <DataTab block={block} doc={doc} setData={setData} />
        </TabsContent>

        <TabsContent value="style" className="space-y-4 p-4">
          <StyleTab block={block} setStyle={setStyle} onChangeBase={onChangeBase} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DocumentHint() {
  return (
    <div className="p-6 text-center">
      <div className="mx-auto mb-3 grid size-11 place-items-center rounded-xl border bg-muted text-muted-foreground">
        <Sparkles className="size-4.5" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">Nothing selected</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Select a block to edit its content, data binding and style — or open Document settings in the header for page
        setup, branding and variables.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

function ContentTab({
  block,
  set,
  onChangeBase,
  onExplainChart,
}: {
  block: StudioBlock
  set: (patch: Record<string, unknown>) => void
  onChangeBase: (id: string, patch: Partial<StudioBlockBase>) => void
  onExplainChart: (block: StudioBlock) => void
}) {
  return (
    <>
      {block.type === "cover" && (
        <>
          <Field label="Title" hint="Supports {{variables}} — set their values in Document settings.">
            <Input value={block.props.title} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <Field label="Subtitle">
            <Textarea value={block.props.subtitle} onChange={(e) => set({ subtitle: e.target.value })} className="min-h-16 text-sm" />
          </Field>
          <Field label="Prepared for">
            <Input value={block.props.preparedFor} onChange={(e) => set({ preparedFor: e.target.value })} />
          </Field>
          <Field label="Classification (TLP)">
            <Select value={block.props.classification} onValueChange={(v) => set({ classification: v })}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TLP_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </>
      )}

      {block.type === "heading" && (
        <Field label="Heading text">
          <Input value={block.props.text} onChange={(e) => set({ text: e.target.value })} />
        </Field>
      )}

      {block.type === "text" && <TextProperties block={block} onChange={set} onChangeBase={onChangeBase} />}

      {block.type === "callout" && (
        <>
          <Field label="Title">
            <Input value={block.props.title} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <Field label="Text">
            <Textarea value={block.props.text} onChange={(e) => set({ text: e.target.value })} className="min-h-20 text-sm" />
          </Field>
          <Field label="Tone">
            <div className="grid grid-cols-2 gap-1.5">
              {CALLOUT_TONES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set({ tone: t.value })}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                    block.props.tone === t.value ? "border-primary/40 bg-primary/5" : "hover:bg-accent"
                  )}
                >
                  <span className={cn("size-2 rounded-full", t.dot)} />
                  {t.label}
                </button>
              ))}
            </div>
          </Field>
        </>
      )}

      {block.type === "kpi" && (
        <>
          <Field label="Title">
            <Input value={block.props.title} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Renders the headline metrics for this block's scope. Change what it counts on the Data tab.
          </p>
        </>
      )}

      {block.type === "chart" && (
        <>
          <Field label="Title">
            <Input value={block.props.title} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <Field label="Chart type">
            <div className="flex gap-1.5 rounded-lg border bg-muted/40 p-1">
              {(["line", "bar", "donut"] as ChartKind[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    const isSlice = block.props.dataset === "severity" || block.props.dataset === "disposition"
                    let dataset = block.props.dataset
                    if (k === "donut" && !isSlice) dataset = "severity"
                    if (k === "line" && isSlice) dataset = "incidentsOverTime"
                    set({ chartType: k, dataset })
                  }}
                  className={cn(
                    "flex-1 rounded-md py-1.5 text-xs font-medium capitalize transition-colors",
                    block.props.chartType === k ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
                  )}
                >
                  {k}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Dataset">
            <Select value={block.props.dataset} onValueChange={(v) => set({ dataset: v })}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(block.props.chartType === "line" ? TREND_DATASETS : block.props.chartType === "donut" ? SLICE_DATASETS : [...TREND_DATASETS, ...SLICE_DATASETS]).map((d) => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <button
            type="button"
            onClick={() => onExplainChart(block)}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-primary/25 bg-primary/5 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
          >
            <Wand2 className="size-3.5" />
            Explain this chart in prose
          </button>
        </>
      )}

      {block.type === "table" && (
        <>
          <Field label="Title">
            <Input value={block.props.title} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <Field label="Records">
            <Select value={block.props.dataset} onValueChange={(v) => set({ dataset: v })}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="topIOCs">Top indicators of compromise</SelectItem>
                <SelectItem value="openCases">Open cases</SelectItem>
                <SelectItem value="slaByTeam">SLA attainment by team</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </>
      )}

      {(block.type === "mitre" || block.type === "timeline" || block.type === "entities" || block.type === "playbooks") && (
        <Field label="Title">
          <Input value={block.props.title} onChange={(e) => set({ title: e.target.value })} />
        </Field>
      )}

      {block.type === "execSummary" && <GeneratedProperties block={block} set={set} onChangeBase={onChangeBase} />}

      {block.type === "anomalies" && (
        <>
          <Field label="Title">
            <Input value={block.props.title} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <p className="text-xs leading-relaxed text-muted-foreground">
            The platform selects which anomalies clear the reporting threshold. Tighten the scope on the Data tab to
            change what it considers.
          </p>
          <ReviewControls block={block} onChangeBase={onChangeBase} />
        </>
      )}

      {block.type === "whatChanged" && (
        <>
          <Field label="Title">
            <Input value={block.props.title} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <Field label="Compare against">
            <Select value={block.props.comparePeriod} onValueChange={(v) => set({ comparePeriod: v })}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Previous 7 days">Previous 7 days</SelectItem>
                <SelectItem value="Previous 30 days">Previous 30 days</SelectItem>
                <SelectItem value="Same period last year">Same period last year</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <ReviewControls block={block} onChangeBase={onChangeBase} />
        </>
      )}

      {block.type === "divider" && <p className="text-xs text-muted-foreground">A plain horizontal rule — no editable options.</p>}

      {block.type === "pageBreak" && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          Export starts a new page here. Everything after this marker begins at the top of the next sheet.
        </p>
      )}

      {block.type === "spacer" && (
        <Field label="Height (px)">
          <Input type="number" value={block.props.height} onChange={(e) => set({ height: parseInt(e.target.value) || 0 })} />
        </Field>
      )}
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Data binding                                                        */
/* ------------------------------------------------------------------ */

function DataTab({ block, doc, setData }: { block: StudioBlock; doc: DocSettings; setData: (patch: Partial<BlockDataBinding>) => void }) {
  const data = block.data ?? {}
  const effectiveModule = data.module ?? doc.module
  const searches = savedSearches.filter((s) => s.module === effectiveModule)

  return (
    <>
      <div className="rounded-lg border bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
        Unset controls inherit the report: <span className="font-medium text-foreground">{moduleLabels[doc.module]}</span>,{" "}
        <span className="font-medium text-foreground">{doc.timeRange.toLowerCase()}</span>. Pin a block only when it
        genuinely differs — pinned blocks stop following the header.
      </div>

      <Field label="Module">
        <Select value={data.module ?? INHERIT} onValueChange={(v) => setData({ module: v === INHERIT ? undefined : (v as ReportModule) })}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={INHERIT}>Inherit — {moduleLabels[doc.module]}</SelectItem>
            {(Object.keys(moduleLabels) as ReportModule[]).map((m) => (
              <SelectItem key={m} value={m}>{moduleLabels[m]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Filter" hint="Reuses the saved searches analysts already maintain in the list views.">
        <Select value={data.savedSearchId ?? INHERIT} onValueChange={(v) => setData({ savedSearchId: v === INHERIT ? undefined : v })}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={INHERIT}>No filter — everything in scope</SelectItem>
            {searches.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {data.savedSearchId && (
        <p className="-mt-2 rounded-md border bg-card px-2.5 py-1.5 font-mono text-[10.5px] leading-relaxed text-muted-foreground">
          {savedSearches.find((s) => s.id === data.savedSearchId)?.summary}
        </p>
      )}

      <Field label="Time range">
        <Select value={data.timeRange ?? INHERIT} onValueChange={(v) => setData({ timeRange: v === INHERIT ? undefined : v })}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={INHERIT}>Inherit — {doc.timeRange}</SelectItem>
            {TIME_RANGES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>

      {(block.type === "chart" || block.type === "table" || block.type === "kpi") && (
        <Field label="Group by">
          <Select value={data.groupBy ?? "None"} onValueChange={(v) => setData({ groupBy: v === "None" ? undefined : v })}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {GROUP_BY_OPTIONS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      )}

      {(block.type === "table" || block.type === "mitre" || block.type === "entities" || block.type === "playbooks") && (
        <Field label="Show top" hint="Caps long appendices so a report stays readable.">
          <Input
            type="number"
            min={1}
            value={data.topN ?? 10}
            onChange={(e) => setData({ topN: parseInt(e.target.value) || undefined })}
          />
        </Field>
      )}

      <Field label="Compare with">
        <div className="flex gap-1.5 rounded-lg border bg-muted/40 p-1">
          {([
            { v: "none", l: "None" },
            { v: "previous", l: "Previous period" },
            { v: "year", l: "Last year" },
          ] as const).map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setData({ compare: opt.v })}
              className={cn(
                "flex-1 rounded-md py-1.5 text-[11px] font-medium transition-colors",
                (data.compare ?? "none") === opt.v ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
              )}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Highlight threshold" hint="Values at or beyond this are emphasized in the render and in export.">
        <Input
          type="number"
          placeholder="None"
          value={data.threshold ?? ""}
          onChange={(e) => setData({ threshold: e.target.value === "" ? undefined : Number(e.target.value) })}
        />
      </Field>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Style                                                               */
/* ------------------------------------------------------------------ */

function StyleTab({
  block,
  setStyle,
  onChangeBase,
}: {
  block: StudioBlock
  setStyle: (patch: Partial<BlockStyle>) => void
  onChangeBase: (id: string, patch: Partial<StudioBlockBase>) => void
}) {
  const style = block.style ?? {}
  const width = block.width ?? "full"

  return (
    <>
      <Field label="Width" hint="Two half-width blocks in a row sit side by side on the page.">
        <div className="grid grid-cols-2 gap-1.5">
          {([
            { v: "full", l: "Full width", Icon: Maximize2 },
            { v: "half", l: "Half width", Icon: Minimize2 },
          ] as const).map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => onChangeBase(block.id, { width: opt.v })}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-xs font-medium transition-colors",
                width === opt.v ? "border-primary/40 bg-primary/5 text-primary" : "hover:bg-accent"
              )}
            >
              <opt.Icon className="size-3.5" />
              {opt.l}
            </button>
          ))}
        </div>
      </Field>

      {(block.type === "chart" || block.type === "kpi") && (
        <Field label="Palette">
          <div className="grid grid-cols-3 gap-1.5">
            {([
              { v: "brand", l: "Brand" },
              { v: "severity", l: "Severity" },
              { v: "mono", l: "Mono" },
            ] as const).map((opt) => (
              <button
                key={opt.v}
                type="button"
                onClick={() => setStyle({ palette: opt.v })}
                className={cn(
                  "rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors",
                  (style.palette ?? "brand") === opt.v ? "border-primary/40 bg-primary/5 text-primary" : "hover:bg-accent"
                )}
              >
                {opt.l}
              </button>
            ))}
          </div>
        </Field>
      )}

      {block.type === "chart" && (
        <>
          <ToggleLine label="Legend" checked={style.showLegend ?? true} onChange={(v) => setStyle({ showLegend: v })} />
          <ToggleLine label="Grid lines" checked={style.showGrid ?? true} onChange={(v) => setStyle({ showGrid: v })} />
          <ToggleLine label="Value labels" checked={style.showValues ?? false} onChange={(v) => setStyle({ showValues: v })} />
        </>
      )}

      <ToggleLine
        label="Emphasize this block"
        hint="Adds a rule and heavier ground so a key section stands out on the page."
        checked={style.emphasis ?? false}
        onChange={(v) => setStyle({ emphasis: v })}
      />
    </>
  )
}

function ToggleLine({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border p-2.5">
      <div className="min-w-0">
        <div className="text-xs font-medium">{label}</div>
        {hint && <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Co-Analyst controls                                                 */
/* ------------------------------------------------------------------ */

function ReviewControls({ block, onChangeBase }: { block: StudioBlock; onChangeBase: (id: string, patch: Partial<StudioBlockBase>) => void }) {
  const review = block.ai?.review ?? "unreviewed"
  if (!block.ai?.generated) return null

  return (
    <div className="rounded-lg border p-3">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Review</div>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
        {review === "accepted"
          ? "Accepted — this section is cleared for delivery."
          : review === "rejected"
            ? "Rejected — it stays out of the generated document."
            : "Generated content is held until a human accepts it."}
      </p>
      <div className="mt-2 flex gap-1.5">
        <Button
          size="sm"
          variant={review === "accepted" ? "default" : "outline"}
          className="h-7 flex-1 text-[11px]"
          onClick={() => onChangeBase(block.id, { ai: { ...block.ai, review: "accepted" } })}
        >
          <Check className="size-3" />
          Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 flex-1 text-[11px]"
          onClick={() => onChangeBase(block.id, { ai: { ...block.ai, review: "rejected" } })}
        >
          <X className="size-3" />
          Reject
        </Button>
      </div>
    </div>
  )
}

function GeneratedProperties({
  block,
  set,
  onChangeBase,
}: {
  block: Extract<StudioBlock, { type: "execSummary" }>
  set: (patch: Record<string, unknown>) => void
  onChangeBase: (id: string, patch: Partial<StudioBlockBase>) => void
}) {
  return (
    <>
      <Field label="Title">
        <Input value={block.props.title} onChange={(e) => set({ title: e.target.value })} />
      </Field>
      <Field label="Content source">
        <div className="flex gap-1.5 rounded-lg border bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => set({ claimIds: ["cl-1", "cl-2", "cl-3", "cl-4"], overrideText: undefined })}
            className={cn(
              "flex-1 rounded-md py-1.5 text-[11px] font-medium transition-colors",
              !block.props.overrideText ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
            )}
          >
            Generated
          </button>
          <button
            type="button"
            onClick={() => set({ overrideText: SUMMARY_DRAFT })}
            className={cn(
              "flex-1 rounded-md py-1.5 text-[11px] font-medium transition-colors",
              block.props.overrideText ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
            )}
          >
            Written by hand
          </button>
        </div>
      </Field>
      {block.props.overrideText !== undefined && (
        <Field label="Text" hint="Hand-written text carries no evidence links — reviewers see that difference.">
          <Textarea value={block.props.overrideText} onChange={(e) => set({ overrideText: e.target.value })} className="min-h-28 text-sm" />
        </Field>
      )}
      {block.props.overrideText === undefined && (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Four claims, each bound to the query that produced it. Editing a claim by hand detaches its evidence, so the
          Co-Analyst offers a rewrite instead.
        </p>
      )}
      <ReviewControls block={block} onChangeBase={onChangeBase} />
    </>
  )
}

function TextProperties({
  block,
  onChange,
  onChangeBase,
}: {
  block: Extract<StudioBlock, { type: "text" }>
  onChange: (patch: Record<string, unknown>) => void
  onChangeBase: (id: string, patch: Partial<StudioBlockBase>) => void
}) {
  const [prompt, setPrompt] = useState("")
  const [drafting, setDrafting] = useState(false)

  function draft(text: string, locale?: "en" | "ar") {
    setDrafting(true)
    onChange({ text: "", generated: true })
    onChangeBase(block.id, { ai: { ...block.ai, generated: true, review: "unreviewed", locale: locale ?? "en" } })
    let i = 0
    const timer = setInterval(() => {
      i += 4
      onChange({ text: text.slice(0, i), generated: true })
      if (i >= text.length) {
        clearInterval(timer)
        onChange({ text, generated: true })
        setDrafting(false)
      }
    }, 18)
  }

  function draftFromPrompt() {
    if (!prompt.trim()) return
    const key = /recommend/i.test(prompt) ? "recommendations" : /scope/i.test(prompt) ? "scope" : "summary"
    const preset = AI_PRESETS.find((p) => p.key === key) ?? AI_PRESETS[0]
    draft(preset.draft)
  }

  function applyRewrite(mode: RewriteMode) {
    draft(rewrite(block.props.text, mode), mode === "arabic" ? "ar" : "en")
  }

  return (
    <>
      <Field label="Content">
        <Textarea
          value={block.props.text}
          onChange={(e) => {
            onChange({ text: e.target.value, generated: false })
            onChangeBase(block.id, { ai: { ...block.ai, generated: false, review: "edited" } })
          }}
          className="min-h-24 text-sm"
        />
      </Field>

      <div className="rounded-lg border border-primary/25 bg-primary/5 p-3">
        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          Draft with the Co-Analyst
        </div>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Summarize this week's incidents for leadership…"
          className="mt-2 min-h-14 bg-background text-xs"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {AI_PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPrompt(p.label)}
              className="rounded-full border border-primary/25 bg-background px-2.5 py-1 text-[11px] text-primary transition-colors hover:bg-primary/10"
            >
              {p.label}
            </button>
          ))}
        </div>
        <Button size="sm" className="mt-2.5 w-full" disabled={drafting || !prompt.trim()} onClick={draftFromPrompt}>
          <Sparkles className="size-3.5" />
          {drafting ? "Drafting…" : "Draft from case data"}
        </Button>
      </div>

      <Field label="Rewrite">
        <div className="grid grid-cols-2 gap-1.5">
          {(Object.keys(REWRITE_LABELS) as RewriteMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              disabled={drafting || !block.props.text.trim()}
              onClick={() => applyRewrite(mode)}
              className="flex items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
            >
              {mode === "arabic" ? <Languages className="size-3" /> : <Wand2 className="size-3" />}
              {REWRITE_LABELS[mode]}
            </button>
          ))}
        </div>
      </Field>

      <ReviewControls block={block} onChangeBase={onChangeBase} />
    </>
  )
}
