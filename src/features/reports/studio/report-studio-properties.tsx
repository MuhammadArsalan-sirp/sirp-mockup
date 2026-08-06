import { useState } from "react"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BLOCK_LABELS,
  RECOMMENDATIONS_DRAFT,
  SCOPE_DRAFT,
  SUMMARY_DRAFT,
  type CalloutTone,
  type ChartDataset,
  type ChartKind,
  type StudioBlock,
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

type Props = {
  block: StudioBlock | null
  onChange: (id: string, patch: Record<string, unknown>) => void
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

export function ReportStudioProperties({ block, onChange }: Props) {
  if (!block) {
    return (
      <div className="p-6 text-center">
        <div className="mx-auto mb-3 grid size-11 place-items-center rounded-xl border bg-muted text-muted-foreground">
          <Sparkles className="size-4.5" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Nothing selected</p>
        <p className="mt-1 text-xs text-muted-foreground">Select a block on the page to edit its content and data binding.</p>
      </div>
    )
  }

  const set = (patch: Record<string, unknown>) => onChange(block.id, patch)

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2.5 border-b pb-3">
        <div className="text-sm font-semibold">{BLOCK_LABELS[block.type]}</div>
      </div>

      {block.type === "cover" && (
        <>
          <Field label="Title">
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
                {TLP_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
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

      {block.type === "text" && (
        <TextProperties block={block} onChange={set} />
      )}

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
        <p className="text-xs leading-relaxed text-muted-foreground">
          Pulls the headline metrics for the report's module and time range. No layout options — reorder or remove the block instead.
        </p>
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
                {(block.props.chartType === "line"
                  ? TREND_DATASETS
                  : block.props.chartType === "donut"
                    ? SLICE_DATASETS
                    : [...TREND_DATASETS, ...SLICE_DATASETS]
                ).map((d) => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
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
              </SelectContent>
            </Select>
          </Field>
        </>
      )}

      {(block.type === "mitre" || block.type === "timeline") && (
        <Field label="Title">
          <Input value={block.props.title} onChange={(e) => set({ title: e.target.value })} />
        </Field>
      )}

      {block.type === "entities" && (
        <>
          <Field label="Title">
            <Input value={block.props.title} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <p className="text-xs leading-relaxed text-muted-foreground">Pulls entities from the Entities module — assets, users, and services tied to this report's scope.</p>
        </>
      )}

      {block.type === "playbooks" && (
        <>
          <Field label="Title">
            <Input value={block.props.title} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <p className="text-xs leading-relaxed text-muted-foreground">Pulls recent automation runs from Autonomy — playbook, target, trigger, and outcome.</p>
        </>
      )}

      {block.type === "divider" && (
        <p className="text-xs text-muted-foreground">A plain horizontal rule — no editable options.</p>
      )}

      {block.type === "spacer" && (
        <Field label="Height (px)">
          <Input type="number" value={block.props.height} onChange={(e) => set({ height: parseInt(e.target.value) || 0 })} />
        </Field>
      )}
    </div>
  )
}

function TextProperties({ block, onChange }: { block: Extract<StudioBlock, { type: "text" }>; onChange: (patch: Record<string, unknown>) => void }) {
  const [prompt, setPrompt] = useState("")
  const [drafting, setDrafting] = useState(false)

  function draft(text: string) {
    setDrafting(true)
    onChange({ text: "", generated: true })
    let i = 0
    const timer = setInterval(() => {
      i += Math.max(2, Math.round(Math.random() * 5))
      onChange({ text: text.slice(0, i), generated: true })
      if (i >= text.length) {
        clearInterval(timer)
        onChange({ text, generated: true })
        setDrafting(false)
      }
    }, 22)
  }

  function draftFromPrompt() {
    if (!prompt.trim()) return
    const key = /recommend/i.test(prompt) ? "recommendations" : /scope/i.test(prompt) ? "scope" : "summary"
    const preset = AI_PRESETS.find((p) => p.key === key) ?? AI_PRESETS[0]
    draft(preset.draft)
  }

  return (
    <>
      <Field label="Content">
        <Textarea
          value={block.props.text}
          onChange={(e) => onChange({ text: e.target.value, generated: false })}
          className="min-h-24 text-sm"
        />
      </Field>
      <div className="rounded-lg border border-primary/25 bg-primary/5 p-3">
        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          Draft with SARA
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
    </>
  )
}
