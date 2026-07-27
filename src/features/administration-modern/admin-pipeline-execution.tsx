import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ExecutionNodeStatus, PipelineExecution } from "@/data/admin-automation"
import { SectionLabel } from "./admin-ui"

const nodeStatusDot: Record<ExecutionNodeStatus, string> = {
  pending: "bg-muted-foreground/30",
  running: "bg-primary animate-pulse",
  completed: "bg-emerald-500",
  timed_out: "bg-amber-500",
  failed: "bg-destructive",
  skipped: "bg-transparent border border-muted-foreground/50",
  blocked_requires_approval: "bg-violet-500",
}

const nodeStatusLabel: Record<ExecutionNodeStatus, string> = {
  pending: "pending",
  running: "running",
  completed: "completed",
  timed_out: "timed_out",
  failed: "failed",
  skipped: "skipped",
  blocked_requires_approval: "blocked_requires_approval",
}

const nodeBorder: Record<ExecutionNodeStatus, string> = {
  pending: "border-border",
  running: "border-primary/40",
  completed: "border-emerald-500/30",
  timed_out: "border-amber-500/30",
  failed: "border-destructive/40",
  skipped: "border-dashed border-muted-foreground/30",
  blocked_requires_approval: "border-violet-500/40",
}

const runStatusMeta = {
  completed: { icon: CheckCircle2, label: "Completed", tone: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/8 border-emerald-500/20" },
  running: { icon: Loader2, label: "Running", tone: "text-primary", bg: "bg-primary/8 border-primary/20" },
  failed: { icon: XCircle, label: "Failed", tone: "text-destructive", bg: "bg-destructive/8 border-destructive/20" },
} as const

const LEGEND: ExecutionNodeStatus[] = [
  "pending",
  "running",
  "completed",
  "timed_out",
  "failed",
  "skipped",
  "blocked_requires_approval",
]

/**
 * The most recent run of a pipeline, drawn as a leveled DAG — what actually
 * executed, not just what's configured. Nodes group into columns by level;
 * each carries its own status and timing so a slow or stuck step is visible
 * at a glance instead of buried in a log line.
 */
export function PipelineExecutionView({ execution }: { execution: PipelineExecution }) {
  const meta = runStatusMeta[execution.status]
  const Icon = meta.icon
  const levels = Math.max(...execution.nodes.map((n) => n.level))
  const columns = Array.from({ length: levels }, (_, i) =>
    execution.nodes.filter((n) => n.level === i + 1)
  )

  return (
    <div className="space-y-3 border-t pt-4">
      <div className={cn("flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3", meta.bg)}>
        <div className="flex items-center gap-2.5">
          <Icon className={cn("size-5 shrink-0", meta.tone, execution.status === "running" && "animate-spin")} />
          <div>
            <div className={cn("text-sm font-semibold", meta.tone)}>{meta.label}</div>
            <div className="text-xs text-muted-foreground">{execution.summary}</div>
          </div>
        </div>
        <div className="flex items-center gap-5 font-mono text-xs tabular-nums text-muted-foreground">
          <Stat value={execution.steps} label="steps" />
          <Stat value={execution.levels} label="levels" />
          <Stat value={execution.wallTime} label="wall time" />
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-1">
        {columns.map((col, i) => (
          <div key={i} className="flex shrink-0 flex-col gap-2" style={{ minWidth: 168 }}>
            <SectionLabel className="px-0.5">L{i + 1}</SectionLabel>
            {col.map((node) => (
              <div
                key={node.id}
                className={cn("rounded-lg border bg-card px-3 py-2", nodeBorder[node.status])}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground">{node.id}</span>
                  {node.critical && (
                    <span className="rounded bg-muted px-1 py-0.5 font-mono text-[9px] font-medium tracking-wide text-muted-foreground">
                      CRIT
                    </span>
                  )}
                </div>
                <div className="mt-0.5 truncate font-mono text-[12px] font-medium">{node.name}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className={cn("size-1.5 shrink-0 rounded-full", nodeStatusDot[node.status])} />
                  <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                    {node.durationLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t pt-3">
        {LEGEND.map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
            <span className={cn("size-1.5 rounded-full", nodeStatusDot[s])} />
            {nodeStatusLabel[s]}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <FooterStat label="Wall time" value={execution.wallTime} />
        <FooterStat label="Timed-out" value={execution.timedOut} />
        <FooterStat label="Cascade-skipped" value={execution.cascadeSkipped} />
        <FooterStat
          label="Critical failed"
          value={execution.criticalFailed ? "yes" : "no"}
          tone={execution.criticalFailed ? "text-destructive" : undefined}
        />
        <FooterStat label="Longest step" value={execution.longestStep} />
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <span className="flex flex-col items-end leading-tight">
      <span className="text-sm font-semibold text-foreground">{value}</span>
      <span className="text-[10px] uppercase tracking-wide">{label}</span>
    </span>
  )
}

function FooterStat({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="rounded-lg border bg-muted/20 px-3 py-2">
      <SectionLabel>{label}</SectionLabel>
      <div className={cn("mt-1 truncate font-mono text-sm font-medium tabular-nums", tone)}>{value}</div>
    </div>
  )
}
