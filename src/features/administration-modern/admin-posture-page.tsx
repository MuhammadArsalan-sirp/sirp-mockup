import { useMemo, useState } from "react"
import { Link } from "react-router"
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Database,
  Download,
  KeyRound,
  RefreshCw,
  Shield,
  Sparkles,
  Timer,
  Users,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import {
  computePostureScore,
  postureChecks,
  type PostureCategory,
  type PostureCheck,
  type PostureSeverity,
} from "@/data/admin"
import { saraFindings } from "@/data/admin-sara"
import { SaraDiffCard } from "./admin-sara-diff-card"
import {
  SectionLabel,
  ToneChip,
  toneDots,
  type Tone,
} from "./admin-ui"

const scoreToneText: Record<Tone, string> = {
  ok: "text-emerald-500",
  info: "text-primary",
  warn: "text-amber-500",
  alert: "text-destructive",
  muted: "text-muted-foreground",
}

function ScoreDonut({ score, tone }: { score: number; tone: Tone }) {
  const size = 76
  const strokeWidth = 7
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={strokeWidth} className="stroke-muted" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={strokeWidth}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-[stroke-dashoffset] duration-500", scoreToneText[tone])}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-medium text-xl leading-none tabular-nums">{score}</span>
      </div>
    </div>
  )
}

const categoryMeta: Record<PostureCategory, { label: string; icon: LucideIcon }> = {
  authentication: { label: "Authentication", icon: KeyRound },
  session:        { label: "Sessions",       icon: Timer    },
  data:           { label: "Data",           icon: Database },
  audit:          { label: "Audit",          icon: Shield   },
  operations:     { label: "Operations",     icon: Users    },
}

const sevTone: Record<PostureSeverity, Tone> = {
  high:   "alert",
  medium: "warn",
  low:    "info",
  ok:     "ok",
}

const sevLabel: Record<PostureSeverity, string> = {
  high: "High", medium: "Medium", low: "Low", ok: "OK",
}

type Filter = "all" | "issues" | PostureSeverity

const filters: { id: Filter; label: string }[] = [
  { id: "all",    label: "All checks" },
  { id: "issues", label: "Issues only" },
  { id: "high",   label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low",    label: "Low" },
  { id: "ok",     label: "Passing" },
]

export function AdminPosturePage() {
  const [filter, setFilter] = useState<Filter>("all")
  const score = useMemo(() => computePostureScore(postureChecks), [])

  const bandTone: Tone =
    score.band === "excellent" ? "ok"
    : score.band === "good" ? "info"
    : score.band === "fair" ? "warn"
    : "alert"

  const filtered = postureChecks.filter((c) => {
    if (filter === "all") return true
    if (filter === "issues") return c.status !== "ok"
    return c.status === filter
  })

  return (
    <div className="space-y-5">
      <PageHeader
        title="Security posture"
        description="Aggregated security score across identity, sessions, data and operations. Refreshes every 5 minutes."
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9">
              <Download className="size-4 text-muted-foreground" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <RefreshCw className="size-4 text-muted-foreground" />
              Re-run
            </Button>
          </>
        }
      />

      {/* Sara's proactive read of this checklist — same findings the admin
          dock surfaces, just contextual to the page they're about. */}
      <div className="rounded-xl border bg-linear-to-b from-primary/[0.03] to-transparent">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <span className="grid size-6 shrink-0 place-items-center rounded-md bg-linear-to-br from-primary to-chart-3 text-white">
            <Sparkles className="size-3.5" />
          </span>
          <p className="text-sm font-medium">Sara reviewed this checklist</p>
          <span className="ml-auto font-mono text-xs tabular-nums text-muted-foreground">
            {saraFindings.length} suggestions
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 p-4 lg:grid-cols-2">
          {saraFindings.map((f) => (
            <SaraDiffCard key={f.id} finding={f} compact />
          ))}
        </div>
      </div>

      {/* Score row */}
      <Card>
        <CardContent className="px-5 py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
            <div className="flex items-center gap-4">
              <ScoreDonut score={score.score} tone={bandTone} />
              <div>
                <SectionLabel>Overall score</SectionLabel>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-medium text-3xl leading-none tabular-nums tracking-tight">
                    {score.score}
                  </span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                  <ToneChip tone={bandTone} className="ml-1 capitalize">
                    {score.band.replace("-", " ")}
                  </ToneChip>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <Count tone="alert"   label="High"    value={score.counts.high} />
              <Count tone="warn"    label="Medium"  value={score.counts.medium} />
              <Count tone="info" label="Low"     value={score.counts.low} />
              <Count tone="ok"      label="Passing" value={score.counts.ok} />
            </div>
            <div className="hidden sm:block min-w-35">
              <SectionLabel>Industry benchmark</SectionLabel>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary" style={{ width: `${score.score}%` }} />
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>You · <span className="text-foreground font-medium">{score.score}</span></span>
                <span className="font-mono">p50 · 71</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
              filter === f.id
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} of {postureChecks.length}
        </span>
      </div>

      {/* Checks table */}
      <Card>
        <CardContent className="px-0 py-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2 font-medium">Check</th>
                <th className="px-4 py-2 font-medium">Category</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Indicator</th>
                <th className="px-4 py-2 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((c) => (
                <CheckRow key={c.id} check={c} />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground">
                    No checks match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

function CheckRow({ check }: { check: PostureCheck }) {
  const tone = sevTone[check.status]
  const Icon = check.status === "ok" ? CheckCircle2 : AlertTriangle
  const CategoryIcon = categoryMeta[check.category].icon

  return (
    <tr className="align-top">
      <td className="px-4 py-3">
        <div className="flex items-start gap-2">
          <Icon
            className={cn(
              "mt-0.5 size-3.5 shrink-0",
              tone === "alert" && "text-destructive",
              tone === "warn" && "text-amber-600 dark:text-amber-400",
              tone === "info" && "text-primary",
              tone === "ok" && "text-emerald-600 dark:text-emerald-400"
            )}
          />
          <div className="min-w-0">
            <div className="text-sm font-medium leading-tight">{check.label}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{check.description}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <CategoryIcon className="size-3" />
          {categoryMeta[check.category].label}
        </span>
      </td>
      <td className="px-4 py-3">
        <ToneChip tone={tone}>
          <span className={cn("size-1.5 rounded-full mr-1", toneDots[tone])} />
          {sevLabel[check.status]}
        </ToneChip>
      </td>
      <td className="px-4 py-3">
        {check.metric && (
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">{check.metric}</code>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        {check.cta && (
          <Button variant="outline" size="sm" asChild className="h-7">
            <Link to={check.cta.href} className="gap-1">
              {check.cta.label}
              <ArrowUpRight className="size-3" />
            </Link>
          </Button>
        )}
      </td>
    </tr>
  )
}

function Count({ tone, label, value }: { tone: Tone; label: string; value: number }) {
  return (
    <div className="rounded-md border bg-muted/30 px-3 py-2">
      <div className="flex items-center gap-1.5">
        <span className={cn("size-1.5 rounded-full", toneDots[tone])} />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div
        className={cn(
          "mt-0.5 font-medium text-lg leading-none tabular-nums tracking-tight",
          tone === "alert" && "text-destructive",
          tone === "warn" && "text-amber-600 dark:text-amber-400",
          tone === "ok" && "text-emerald-600 dark:text-emerald-400"
        )}
      >
        {value}
      </div>
    </div>
  )
}
