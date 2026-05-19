import { useCallback, useMemo, useState } from "react"
import { Loader2, Play, RotateCw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Incident, IncidentState } from "@/data/incidents"
import {
  buildOmniSense,
  buildOmniSenseRunDelta,
  type OmniSenseBlock,
} from "./incident-detail-mock"

const workflowStates: IncidentState[] = [
  "triage",
  "investigating",
  "containment",
  "eradication",
  "recovery",
  "mitigated",
  "closed",
]

type Props = {
  incident: Incident
}

export function IncidentOmniSenseRunner({ incident }: Props) {
  const [running, setRunning] = useState(false)
  const [runCount, setRunCount] = useState(1)
  const [workflow, setWorkflow] = useState<IncidentState>(incident.state)

  const base = useMemo(() => buildOmniSense(incident), [incident])
  const [extra, setExtra] = useState("")

  const merged: OmniSenseBlock = useMemo(
    () => ({
      ...base,
      situation: extra ? `${base.situation}\n\n${extra}` : base.situation,
      analyzedAt: incident.updateDate,
    }),
    [base, extra, incident.updateDate]
  )

  const run = useCallback(() => {
    setRunning(true)
    window.setTimeout(() => {
      setExtra(buildOmniSenseRunDelta(incident))
      setRunCount((c) => c + 1)
      setRunning(false)
    }, 1400)
  }, [incident])

  return (
    <Card className="overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-b from-primary/[0.06] via-card to-card shadow-md ring-1 ring-border/50">
      <CardHeader className="flex flex-col gap-4 border-b bg-muted/15 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-chart-3 text-white shadow-lg">
            <Sparkles className="size-5" />
          </span>
          <div className="space-y-1">
            <CardTitle className="text-lg tracking-tight">OmniSense</CardTitle>
            <CardDescription className="text-xs leading-relaxed sm:text-sm">
              Correlation and narrative engine · Run #{runCount} · model v3.2
            </CardDescription>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button
            type="button"
            size="sm"
            className="h-9 gap-2 rounded-lg px-4 shadow-sm"
            onClick={run}
            disabled={running}
          >
            {running ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Running…
              </>
            ) : (
              <>
                <Play className="size-4" />
                Run analysis
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 rounded-lg bg-background"
            onClick={run}
            disabled={running}
          >
            <RotateCw className="size-3.5" />
            Re-run
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-[200px] max-w-md flex-1 space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Workflow stage
            </p>
            <Select
              value={workflow}
              onValueChange={(v) => setWorkflow(v as IncidentState)}
            >
              <SelectTrigger className="h-10 rounded-xl bg-background shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {workflowStates.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Badge
            variant="secondary"
            className="h-9 shrink-0 rounded-lg px-3 font-mono text-xs"
          >
            {merged.confidencePct}% confidence
          </Badge>
        </div>

        <Separator />

        <div className="rounded-xl border bg-muted/20 px-4 py-4">
          <p className="text-sm font-semibold leading-snug text-foreground">
            {merged.headline}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {merged.situation}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border bg-card/80 p-4 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Evidence
            </p>
            <ul className="mt-3 space-y-3 text-sm">
              {merged.evidence.map((e, i) => (
                <li key={i}>
                  <span className="leading-snug">{e.label}</span>
                  <span className="mt-1 block font-mono text-[10px] text-muted-foreground">
                    {e.ref}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border bg-card/80 p-4 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Next steps
            </p>
            <ol className="mt-3 list-decimal space-y-2.5 pl-4 text-sm leading-snug">
              {merged.nextSteps.map((s, i) => (
                <li key={i}>
                  {s.label}
                  {s.hint && (
                    <span className="text-muted-foreground"> · {s.hint}</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-xl border bg-card/80 p-4 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Gaps
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {merged.gaps.map((g, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary">·</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
