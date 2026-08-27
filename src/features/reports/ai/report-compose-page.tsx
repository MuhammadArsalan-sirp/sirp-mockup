import { useState } from "react"
import { useNavigate } from "react-router"
import { ArrowRight, Check, FileText, Info, LayoutTemplate, Sparkles, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/shared/page-header"
import { moduleLabels, type ReportModule } from "@/data/reports"
import { audienceVariants } from "@/data/reports-ai"
import { BLOCK_LABELS, TIME_RANGES, type StudioBlockType } from "../studio/report-studio-types"
import { BLOCK_ICON } from "../studio/report-studio-palette"
import { planFromPrompt } from "./ai-engine"
import type { ComposeAudience, ComposePlan } from "./ai-types"

const EXAMPLES = [
  "Summarize this week's critical incidents for the board",
  "Monthly SLA compliance report for the audit committee",
  "Threat intel digest for the detection engineering team",
  "One-page customer report on last quarter's incidents",
]

/**
 * Compose. The point of this screen is the step between the prompt and the
 * document: the Co-Analyst says what it understood and what it intends to
 * build, and the human corrects it *before* twelve sections get generated.
 * Prompt-straight-to-output would be faster and considerably worse.
 */
export function ReportComposePage() {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState("")
  const [plan, setPlan] = useState<ComposePlan | null>(null)
  const [thinking, setThinking] = useState(false)

  function interpret(text: string) {
    const value = text.trim()
    if (!value) return
    setThinking(true)
    setPrompt(value)
    setTimeout(() => {
      setPlan(planFromPrompt(value))
      setThinking(false)
    }, 460)
  }

  function toggleSection(index: number) {
    setPlan((prev) =>
      prev
        ? { ...prev, sections: prev.sections.map((s, i) => (i === index ? { ...s, included: !s.included } : s)) }
        : prev
    )
  }

  const includedCount = plan?.sections.filter((s) => s.included).length ?? 0

  return (
    <div className="space-y-5">
      <PageHeader
        title="New report"
        description="Describe what you need. The Co-Analyst proposes a structure — you correct it before anything is built."
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-8 text-sm" onClick={() => navigate("/reports/templates")}>
              <LayoutTemplate className="size-4" />
              From a template
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-sm" onClick={() => navigate("/reports/studio")}>
              <FileText className="size-4" />
              Blank canvas
            </Button>
          </div>
        }
      />

      <div className="rounded-xl border border-primary/25 bg-linear-to-br from-primary/10 via-primary/5 to-card p-5">
        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          Describe the report
        </div>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) interpret(prompt)
          }}
          placeholder="e.g. Summarize this week's critical incidents for the board, one page, no raw indicators"
          className="mt-2.5 min-h-24 bg-background text-sm"
        />
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => interpret(example)}
              className="rounded-full border border-primary/25 bg-background px-2.5 py-1 text-[11px] text-primary transition-colors hover:bg-primary/10"
            >
              {example}
            </button>
          ))}
          <span className="flex-1" />
          <Button size="sm" disabled={!prompt.trim() || thinking} onClick={() => interpret(prompt)}>
            <Wand2 className="size-3.5" />
            {thinking ? "Reading…" : "Interpret"}
          </Button>
        </div>
      </div>

      {thinking && (
        <div className="rounded-xl border bg-card p-5">
          <div className="h-3 w-40 animate-pulse rounded bg-muted" />
          <div className="mt-3 space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-9 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      )}

      {plan && !thinking && (
        <>
          <div className="rounded-xl border bg-card">
            <div className="flex flex-wrap items-center gap-2 border-b px-5 py-3">
              <span className="grid size-7 place-items-center rounded-md border border-primary/25 bg-primary/10 text-primary">
                <Sparkles className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">Here's what I understood</div>
                <p className="text-[11px] text-muted-foreground">Change anything that's wrong — the build follows this, not the prompt.</p>
              </div>
            </div>

            <div className="grid gap-4 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Audience</Label>
                <Select value={plan.audience} onValueChange={(v) => setPlan({ ...plan, audience: v as ComposeAudience })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {audienceVariants.map((a) => <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Module</Label>
                <Select value={plan.module} onValueChange={(v) => setPlan({ ...plan, module: v as ReportModule })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(moduleLabels) as ReportModule[]).map((m) => (
                      <SelectItem key={m} value={m}>{moduleLabels[m]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Period</Label>
                <Select value={plan.period} onValueChange={(v) => setPlan({ ...plan, period: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIME_RANGES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Target length</Label>
                <Select value={String(plan.pageTarget)} onValueChange={(v) => setPlan({ ...plan, pageTarget: Number(v) })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 4, 6, 8, 12].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n} page{n === 1 ? "" : "s"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {plan.assumptions.length > 0 && (
              <div className="border-t px-5 py-3">
                <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <Info className="size-3.5" />
                  Assumptions
                </div>
                <ul className="mt-1.5 space-y-1">
                  {plan.assumptions.map((a) => (
                    <li key={a} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/60" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-3">
              <div>
                <div className="text-sm font-semibold">Proposed structure</div>
                <p className="text-[11px] text-muted-foreground">
                  {includedCount} of {plan.sections.length} sections included. Every one says why it's there.
                </p>
              </div>
              <Button size="sm" onClick={() => navigate("/reports/studio", { state: { plan } })} disabled={includedCount === 0}>
                Build in Studio
                <ArrowRight className="size-3.5" />
              </Button>
            </div>

            <ul className="divide-y">
              {plan.sections.map((section, i) => {
                const Icon = BLOCK_ICON[section.blockType as StudioBlockType] ?? FileText
                return (
                  <li key={`${section.blockType}-${i}`}>
                    <button
                      type="button"
                      onClick={() => toggleSection(i)}
                      className={cn(
                        "flex w-full items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-accent/50",
                        !section.included && "opacity-45"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 grid size-5 shrink-0 place-items-center rounded border transition-colors",
                          section.included ? "border-primary bg-primary text-primary-foreground" : "border-border"
                        )}
                      >
                        {section.included && <Check className="size-3" />}
                      </span>
                      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">{section.title}</span>
                          <span className="rounded-full border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {BLOCK_LABELS[section.blockType as StudioBlockType] ?? section.blockType}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{section.why}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
