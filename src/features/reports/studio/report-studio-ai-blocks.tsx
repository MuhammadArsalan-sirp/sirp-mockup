import { AlertTriangle, ArrowDownRight, ArrowUpRight, Minus, Sparkles, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { execSummaryClaims, recommendationClaims, reportInsights } from "@/data/reports-ai"
import type { Insight } from "../ai/ai-types"
import { ClaimSentence, EvidencePopover } from "../ai/evidence-popover"
import { resolveVars, type StudioBlock } from "./report-studio-types"

/** Marks Co-Analyst output wherever it appears in a document. */
export function GeneratedBadge({ reviewed }: { reviewed?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
        reviewed
          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "border-primary/25 bg-primary/10 text-primary"
      )}
    >
      <Sparkles className="size-2.5" />
      {reviewed ? "Reviewed" : "Co-Analyst draft"}
    </span>
  )
}

const INSIGHT_ICON = {
  anomaly: AlertTriangle,
  trend: TrendingUp,
  risk: AlertTriangle,
  improvement: TrendingUp,
} as const

function insightTone(insight: Insight) {
  if (insight.adverse) return "border-amber-500/25 bg-amber-500/5"
  return "border-emerald-500/25 bg-emerald-500/5"
}

const WHAT_CHANGED_ROWS = [
  { label: "Incident volume", from: "124", to: "139", delta: "+12%", adverse: true, evidenceId: "ev-volume" },
  { label: "Mean time to respond", from: "51m", to: "42m", delta: "−18%", adverse: false, evidenceId: "ev-mttr" },
  { label: "Critical open past 72h", from: "1", to: "3", delta: "+2", adverse: true, evidenceId: "ev-critical-aging" },
  { label: "SLA attainment", from: "93.1%", to: "94.0%", delta: "+0.9pp", adverse: false, evidenceId: "ev-sla" },
  { label: "Auto-contained runs", from: "1,142", to: "1,204", delta: "+5%", adverse: false, evidenceId: "ev-automation" },
]

/**
 * The three block types the Co-Analyst authors rather than the user. Each one
 * renders claims — text bound to evidence — never loose prose.
 */
export function AiBlockContent({ block, vars = {} }: { block: StudioBlock; vars?: Record<string, string> }) {
  const reviewed = block.ai?.review === "accepted"

  switch (block.type) {
    case "pageBreak":
      return (
        <div className="flex items-center gap-3 py-3" aria-label="Page break">
          <span className="h-px flex-1 border-t border-dashed border-border" />
          <span className="rounded-full border bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Page break
          </span>
          <span className="h-px flex-1 border-t border-dashed border-border" />
        </div>
      )

    case "execSummary": {
      const claims = block.props.claimIds.includes("cl-5") ? recommendationClaims : execSummaryClaims
      const arabic = block.ai?.locale === "ar"
      return (
        <div className="py-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-5 w-1 shrink-0 rounded-full bg-primary" />
            <span className="text-lg font-semibold tracking-tight">{resolveVars(block.props.title, vars)}</span>
            <GeneratedBadge reviewed={reviewed} />
          </div>
          {block.props.overrideText ? (
            <p
              dir={arabic ? "rtl" : undefined}
              className={cn("max-w-[65ch] text-sm leading-relaxed text-muted-foreground", arabic && "text-right")}
            >
              {block.props.overrideText}
            </p>
          ) : (
            <div className="max-w-[68ch] space-y-1.5 text-muted-foreground">
              {claims.map((claim) => (
                <p key={claim.id}>
                  <ClaimSentence claim={claim} />
                </p>
              ))}
            </div>
          )}
          <p className="mt-2 text-[11px] text-muted-foreground/70">
            Every sentence links to the query behind it. Hover to check the working.
          </p>
        </div>
      )
    }

    case "anomalies": {
      const insights = reportInsights.filter((i) => block.props.insightIds.includes(i.id))
      return (
        <div className="py-1">
          <div className="mb-2.5 flex items-center gap-2">
            <span className="h-5 w-1 shrink-0 rounded-full bg-primary" />
            <span className="text-lg font-semibold tracking-tight">{resolveVars(block.props.title, vars)}</span>
            <GeneratedBadge reviewed={reviewed} />
          </div>
          <div className="space-y-2">
            {insights.map((insight) => {
              const Icon = INSIGHT_ICON[insight.kind]
              return (
                <div key={insight.id} className={cn("rounded-lg border p-3.5", insightTone(insight))}>
                  <div className="flex items-start gap-2.5">
                    <Icon
                      className={cn(
                        "mt-0.5 size-4 shrink-0",
                        insight.adverse ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <EvidencePopover evidenceId={insight.evidenceId}>
                          <span className="text-sm font-semibold">{insight.headline}</span>
                        </EvidencePopover>
                        {insight.delta && (
                          <span
                            className={cn(
                              "inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 font-mono text-[10px]",
                              insight.adverse
                                ? "border-amber-500/25 text-amber-600 dark:text-amber-400"
                                : "border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
                            )}
                          >
                            {insight.direction === "up" ? <ArrowUpRight className="size-2.5" /> : <ArrowDownRight className="size-2.5" />}
                            {insight.delta}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{insight.detail}</p>
                    </div>
                  </div>
                </div>
              )
            })}
            {insights.length === 0 && (
              <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                Nothing anomalous in this window. The block stays in the report and says so — a quiet week is a finding.
              </div>
            )}
          </div>
        </div>
      )
    }

    case "whatChanged":
      return (
        <div className="py-1">
          <div className="mb-2.5 flex items-center gap-2">
            <span className="h-5 w-1 shrink-0 rounded-full bg-primary" />
            <span className="text-lg font-semibold tracking-tight">{resolveVars(block.props.title, vars)}</span>
            <GeneratedBadge reviewed={reviewed} />
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">vs {block.props.comparePeriod}</span>
          </div>
          <div className="overflow-hidden rounded-lg border bg-card">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-3 py-2">Measure</th>
                  <th className="px-3 py-2 text-right">Previous</th>
                  <th className="px-3 py-2 text-right">This period</th>
                  <th className="px-3 py-2 text-right">Change</th>
                </tr>
              </thead>
              <tbody>
                {WHAT_CHANGED_ROWS.map((row) => (
                  <tr key={row.label} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      <EvidencePopover evidenceId={row.evidenceId}>
                        <span>{row.label}</span>
                      </EvidencePopover>
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">{row.from}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums font-medium">{row.to}</td>
                    <td
                      className={cn(
                        "px-3 py-2 text-right font-mono tabular-nums",
                        row.adverse ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                      )}
                    >
                      {row.delta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )

    default:
      return (
        <div className="flex items-center gap-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
          <Minus className="size-3.5" />
          Nothing to render for this block.
        </div>
      )
  }
}
