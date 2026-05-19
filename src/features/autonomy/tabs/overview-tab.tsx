import { useMemo, useState } from "react"
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bot,
  Boxes,
  Cable,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  GitBranch,
  Loader2,
  Plug,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react"
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { KpiCard } from "@/components/shared/kpi-card"
import { cn } from "@/lib/utils"
import { Segmented } from "./_segmented"
import {
  agents,
  applications,
  approvalRequests,
  artifacts,
  playbookRuns,
  playbooks,
} from "@/data/autonomy"
import { VendorLogo, getVendorBrand } from "../_vendor-logo"

/** OmniBoard-aligned chart tokens (primary purple family). */
const C = {
  c1: "var(--chart-1)",
  c2: "var(--chart-2)",
  c3: "var(--chart-3)",
  c4: "var(--chart-4)",
  c5: "var(--chart-5)",
} as const

const widgetCard =
  "overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm"
const widgetIcon =
  "grid size-7 shrink-0 place-items-center rounded-lg border border-primary/15 bg-primary/10 text-primary"

const ingestionByApp = [...applications]
  .filter((a) => a.ingestion > 0)
  .sort((a, b) => b.ingestion - a.ingestion)
  .map((a) => ({
    name: a.name.length > 14 ? `${a.name.slice(0, 14)}…` : a.name,
    pipes: a.ingestion,
  }))

const integrationCallTrend = [
  { day: "Apr 11", calls: 1.82 },
  { day: "Apr 12", calls: 1.94 },
  { day: "Apr 13", calls: 2.08 },
  { day: "Apr 14", calls: 2.12 },
  { day: "Apr 15", calls: 2.21 },
  { day: "Apr 16", calls: 2.18 },
  { day: "Apr 17", calls: 2.34 },
]

const agentFailureTrend = [
  { day: "Mon", fails: 14 },
  { day: "Tue", fails: 9 },
  { day: "Wed", fails: 11 },
  { day: "Thu", fails: 6 },
  { day: "Fri", fails: 12 },
  { day: "Sat", fails: 4 },
  { day: "Sun", fails: 3 },
]

type OverviewSection = "summary" | "automation" | "playbooks" | "agents" | "lab" | "artifacts"

type Props = {
  onNavigate: (
    tab:
      | "automation"
      | "playbooks"
      | "agents"
      | "policies"
      | "lab"
      | "artifacts"
      | "approvals"
  ) => void
}

const tooltipStyle: React.CSSProperties = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  boxShadow: "0 6px 16px rgba(0,0,0,0.10)",
  padding: "8px 10px",
}

const automationTrend = [
  { day: "Apr 04", auto: 142, manual: 38 },
  { day: "Apr 05", auto: 168, manual: 41 },
  { day: "Apr 06", auto: 186, manual: 33 },
  { day: "Apr 07", auto: 154, manual: 39 },
  { day: "Apr 08", auto: 192, manual: 44 },
  { day: "Apr 09", auto: 218, manual: 36 },
  { day: "Apr 10", auto: 207, manual: 31 },
  { day: "Apr 11", auto: 234, manual: 28 },
  { day: "Apr 12", auto: 258, manual: 32 },
  { day: "Apr 13", auto: 246, manual: 35 },
  { day: "Apr 14", auto: 271, manual: 29 },
  { day: "Apr 15", auto: 264, manual: 27 },
  { day: "Apr 16", auto: 294, manual: 24 },
  { day: "Apr 17", auto: 312, manual: 22 },
]

const runMix = [
  { day: "Mon", success: 248, failed: 8 },
  { day: "Tue", success: 281, failed: 6 },
  { day: "Wed", success: 312, failed: 11 },
  { day: "Thu", success: 268, failed: 4 },
  { day: "Fri", success: 297, failed: 9 },
  { day: "Sat", success: 142, failed: 3 },
  { day: "Sun", success: 118, failed: 2 },
]

/** Synthetic hourly throughput for the overview spark (deterministic). */
const hourlyThroughput = [
  { hour: "00", runs: 38 },
  { hour: "02", runs: 44 },
  { hour: "04", runs: 41 },
  { hour: "06", runs: 52 },
  { hour: "08", runs: 78 },
  { hour: "10", runs: 96 },
  { hour: "12", runs: 112 },
  { hour: "14", runs: 104 },
  { hour: "16", runs: 118 },
  { hour: "18", runs: 94 },
  { hour: "20", runs: 72 },
  { hour: "22", runs: 56 },
]

const INTEGRATION_PIE_FILL: Record<string, string> = {
  Connected: C.c2,
  Degraded: C.c4,
  Offline: C.c1,
}

const ARTIFACT_CHART_COLORS = [C.c1, C.c2, C.c3, C.c4, C.c5]

const artifactTypeCounts = (() => {
  const m: Record<string, number> = {}
  for (const a of artifacts) {
    m[a.type] = (m[a.type] ?? 0) + 1
  }
  return Object.entries(m).map(([name, value]) => ({ name, value }))
})()

const agentRunsTop = [...agents]
  .sort((a, b) => b.runsToday - a.runsToday)
  .slice(0, 8)
  .map((a) => ({
    name: a.name.length > 14 ? `${a.name.slice(0, 14)}…` : a.name,
    runs: a.runsToday,
  }))

export function OverviewTab({ onNavigate }: Props) {
  const [section, setSection] = useState<OverviewSection>("summary")

  const labOutcomeSlices = useMemo(() => {
    const c = { success: 0, failed: 0, running: 0, queued: 0 }
    for (const r of playbookRuns) {
      c[r.status]++
    }
    return [
      { name: "Success", value: c.success, fill: C.c2 },
      { name: "Failed", value: c.failed, fill: C.c5 },
      { name: "Running", value: c.running, fill: C.c4 },
      { name: "Queued", value: c.queued, fill: "var(--muted-foreground)" },
    ].filter((x) => x.value > 0)
  }, [playbookRuns])

  const activePlaybooks = playbooks.filter((p) => p.status === "active").length
  const activeAgents = agents.filter((a) => a.active).length
  const connectedApps = applications.filter((a) => a.status === "connected").length
  const pending = approvalRequests.filter((r) => r.status === "pending").length
  const totalIngestionPipes = applications.reduce((s, a) => s + a.ingestion, 0)
  const totalPublishedActions = applications.reduce((s, a) => s + a.actions, 0)
  const callsTodaySum = applications.reduce((s, a) => s + a.callsToday, 0)

  const topPlaybooks = [...playbooks]
    .filter((p) => p.runs24h > 0)
    .sort((a, b) => b.runs24h - a.runs24h)
    .slice(0, 4)

  const recentRuns = playbookRuns.slice(0, 5)

  const appHealthData = [
    {
      name: "Connected",
      value: applications.filter((a) => a.status === "connected").length,
    },
    {
      name: "Degraded",
      value: applications.filter((a) => a.status === "degraded").length,
    },
    {
      name: "Offline",
      value: applications.filter((a) => a.status === "disconnected").length,
    },
  ].filter((d) => d.value > 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="Autonomy health at a glance. Use the focus strip for module charts (same control as Automation), or jump from Summary."
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9">
              <Calendar className="size-4 text-muted-foreground" />
              Last 24 hours
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <Download className="size-4 text-muted-foreground" />
              Export
            </Button>
          </>
        }
      />

      {/* Hero KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<Activity className="size-4" />}
          label="Runs · 24h"
          value="1,248"
          trend="+12.4%"
          trendTone="success"
          trendDirection="up"
          caption="96% success · 28s P50 duration"
        />
        <KpiCard
          icon={<Sparkles className="size-4" />}
          label="Auto-handled"
          value={
            <>
              92<span className="text-xl text-muted-foreground">%</span>
            </>
          }
          trend="+1.8 pts"
          trendTone="success"
          trendDirection="up"
          caption="of all eligible actions"
        />
        <KpiCard
          icon={<Clock className="size-4" />}
          label="Pending approvals"
          value={pending}
          trend="oldest 1h ago"
          trendTone="attention"
          caption="Awaiting decision"
        />
        <KpiCard
          icon={<AlertCircle className="size-4" />}
          label="Failed runs"
          value={51}
          trend="-12"
          trendTone="success"
          trendDirection="down"
          caption="2 retried · 49 closed"
        />
      </div>

      <Segmented
        value={section}
        onChange={(k) => setSection(k as OverviewSection)}
        options={[
          { key: "summary", label: "Summary" },
          { key: "automation", label: "Automation" },
          { key: "playbooks", label: "Playbooks" },
          { key: "agents", label: "Agents" },
          { key: "lab", label: "Lab" },
          { key: "artifacts", label: "Artifacts" },
        ]}
      />

      {section === "summary" && (
      <div className="space-y-6">
      {/* Hero charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Auto vs Manual trend */}
        <div className={cn(widgetCard, "lg:col-span-2")}>
          <div className="flex items-start justify-between gap-4 px-6 pb-3 pt-6">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className={widgetIcon}>
                  <Sparkles className="size-4" />
                </span>
                Auto vs Manual
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Action mix across all playbooks · last 14 days
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <div className="text-2xl font-semibold tabular-nums tracking-tight">
                  3,346
                </div>
                <span className="text-xs text-muted-foreground">automated</span>
                <span
                  className="ml-2 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    background: "color-mix(in srgb, var(--success) 18%, transparent)",
                    color: "var(--success)",
                  }}
                >
                  +18.2%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ background: C.c2 }} />
                Auto
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-muted-foreground/60" />
                Manual
              </span>
            </div>
          </div>
          <div className="px-6 pb-6">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={automationTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="overviewAutoFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={C.c2} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={C.c2} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    interval={1}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="auto"
                    stroke={C.c2}
                    strokeWidth={1.75}
                    fill="url(#overviewAutoFill)"
                  />
                  <Line
                    type="monotone"
                    dataKey="manual"
                    stroke="var(--muted-foreground)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Run outcomes */}
        <div className={widgetCard}>
          <div className="flex items-start justify-between px-6 pb-3 pt-6">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className={widgetIcon}>
                  <Activity className="size-4" />
                </span>
                Run outcomes
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Success vs failure · last 7 days
              </div>
              <div className="mt-3 text-2xl font-semibold tabular-nums tracking-tight">
                1,666 runs
              </div>
            </div>
          </div>
          <div className="px-6 pb-6">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={runMix} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)", opacity: 0.4 }} />
                  <Bar dataKey="success" stackId="a" fill={C.c2} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="failed" stackId="a" fill={C.c5} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ background: C.c2 }} />
                Success 1,615
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ background: C.c5 }} />
                Failed 51
              </span>
            </div>
          </div>
        </div>

        {/* Integration health — share of connected / degraded / offline */}
        <div className={widgetCard}>
          <div className="flex items-start justify-between px-6 pb-3 pt-6">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className={widgetIcon}>
                  <Plug className="size-4" />
                </span>
                Integrations
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Application connection mix</div>
            </div>
          </div>
          <div className="flex flex-col items-center px-4 pb-6">
            <div className="h-[200px] w-full max-w-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={appHealthData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={72}
                    paddingAngle={2}
                    stroke="var(--card)"
                    strokeWidth={2}
                  >
                    {appHealthData.map((entry) => (
                      <Cell key={entry.name} fill={INTEGRATION_PIE_FILL[entry.name] ?? C.c3} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    wrapperStyle={{ fontSize: 11 }}
                    formatter={(value) => <span className="text-muted-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          widgetCard,
          "border-primary/12 bg-gradient-to-br from-primary/[0.05] via-card to-card p-4 sm:p-5"
        )}
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold">Jump to an area</div>
          <p className="text-xs text-muted-foreground">Open the full workspace from the sidebar anytime.</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(
            [
              { id: "automation" as const, label: "Automation", icon: Plug },
              { id: "playbooks" as const, label: "Playbooks", icon: GitBranch },
              { id: "agents" as const, label: "Agents", icon: Bot },
              { id: "lab" as const, label: "Lab", icon: Zap },
              { id: "artifacts" as const, label: "Artifacts", icon: Boxes },
              { id: "approvals" as const, label: "Approvals", icon: CheckCircle2 },
              { id: "policies" as const, label: "Policies", icon: ShieldCheck },
            ] as const
          ).map((x) => {
            const Icon = x.icon
            return (
              <Button key={x.id} variant="outline" size="sm" className="h-9 gap-2" onClick={() => onNavigate(x.id)}>
                <Icon className="size-4 text-muted-foreground" />
                {x.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Lower row: Top playbooks, Recent runs, Pending approvals */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Top playbooks */}
        <Panel
          title="Top playbooks"
          subtitle="Most-run in the last 24 hours"
          icon={<Workflow className="size-4" />}
          onSeeAll={() => onNavigate("playbooks")}
        >
          <div className="px-6 pb-5">
            <ul className="space-y-2.5">
              {topPlaybooks.map((p) => {
                const max = topPlaybooks[0]?.runs24h ?? 1
                const widthPct = (p.runs24h / max) * 100
                return (
                  <li key={p.id} className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="flex-1 truncate font-medium">{p.name}</span>
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {p.runs24h} runs
                      </span>
                      <span
                        className="font-mono text-xs tabular-nums"
                        style={{
                          color:
                            p.successRate >= 95
                              ? "var(--success)"
                              : p.successRate >= 80
                                ? "var(--info)"
                                : "var(--attention)",
                        }}
                      >
                        ✓{p.successRate}%
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </Panel>

        {/* Recent runs */}
        <Panel
          title="Recent runs"
          subtitle="Live execution feed"
          icon={<Zap className="size-4" />}
          onSeeAll={() => onNavigate("lab")}
        >
          <ul className="divide-y">
            {recentRuns.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-6 py-3 text-sm">
                <RunStatusDot status={r.status} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{r.name}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Badge variant="outline" className="capitalize font-normal">
                      {r.container.kind}
                    </Badge>
                    <span className="font-mono">{r.container.id}</span>
                    <span>·</span>
                    <span>{r.startedAt}</span>
                  </div>
                </div>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {r.duration}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        {/* Pending approvals */}
        <Panel
          title="Pending approvals"
          subtitle={`${pending} waiting for decision`}
          icon={<CheckCircle2 className="size-4" />}
          onSeeAll={() => onNavigate("approvals")}
        >
          <ul className="divide-y">
            {approvalRequests
              .filter((r) => r.status === "pending")
              .slice(0, 3)
              .map((req) => (
                <li key={req.id} className="px-6 py-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div
                      className={`grid size-8 shrink-0 place-items-center rounded-md bg-gradient-to-br ${req.appTone} text-[10px] font-semibold text-white`}
                    >
                      {req.appInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{req.action}</div>
                      <div className="mt-0.5 truncate text-xs text-muted-foreground">
                        on{" "}
                        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
                          {req.artifact}
                        </code>{" "}
                        · {req.initiatedAt}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </Panel>
      </div>
      </div>
      )}

      {section === "automation" && (
      <div className="space-y-6">
          <div className={widgetCard}>
            <div className="flex flex-wrap items-start justify-between gap-4 px-6 pb-3 pt-6">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className={widgetIcon}>
                    <Activity className="size-4" />
                  </span>
                  Run throughput
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Playbook and agent executions by hour (UTC) · today
                </div>
              </div>
              <Button variant="outline" size="sm" className="h-9" onClick={() => onNavigate("automation")}>
                Open automation
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
            <div className="h-[200px] px-4 pb-5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyThroughput} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)", opacity: 0.35 }} />
                  <Bar dataKey="runs" fill={C.c2} radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div
              className={cn(
                widgetCard,
                "border-primary/15 bg-gradient-to-br from-primary/[0.07] via-card to-card p-5"
              )}
            >
              <div className="text-xs font-medium text-muted-foreground">Ingestion sources</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-primary">
                {totalIngestionPipes}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">Pipelines across connected apps</div>
            </div>
            <div
              className={cn(
                widgetCard,
                "border-primary/15 bg-gradient-to-br from-primary/[0.07] via-card to-card p-5"
              )}
            >
              <div className="text-xs font-medium text-muted-foreground">Published actions</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-primary">
                {totalPublishedActions}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">Callable from playbooks and agents</div>
            </div>
            <div
              className={cn(
                widgetCard,
                "border-primary/15 bg-gradient-to-br from-primary/[0.07] via-card to-card p-5"
              )}
            >
              <div className="text-xs font-medium text-muted-foreground">API calls · today</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-primary">
                {callsTodaySum >= 1000 ? `${(callsTodaySum / 1000).toFixed(1)}k` : callsTodaySum}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">Outbound automation traffic</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className={widgetCard}>
              <div className="flex items-start justify-between gap-3 px-6 pb-3 pt-6">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className={widgetIcon}>
                      <Cable className="size-4" />
                    </span>
                    Ingestion by integration
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">Active named sources (mock)</div>
                </div>
              </div>
              <div className="h-[220px] px-4 pb-5">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ingestionByApp}
                    layout="vertical"
                    margin={{ top: 4, right: 12, left: 4, bottom: 0 }}
                  >
                    <CartesianGrid stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={108}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)", opacity: 0.35 }} />
                    <Bar dataKey="pipes" fill={C.c3} radius={[0, 4, 4, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className={widgetCard}>
              <div className="flex items-start justify-between gap-3 px-6 pb-3 pt-6">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className={widgetIcon}>
                      <Zap className="size-4" />
                    </span>
                    Integration call volume
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">Millions of calls · trailing week</div>
                </div>
              </div>
              <div className="h-[220px] px-4 pb-5">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={integrationCallTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => `${v}M`}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="calls" stroke={C.c2} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <Panel
            title="Connected applications"
            subtitle={`${connectedApps} healthy · ${applications.filter((a) => a.status === "degraded").length} degraded · ${applications.filter((a) => a.status === "disconnected").length} offline`}
            icon={<Plug className="size-4" />}
            onSeeAll={() => onNavigate("automation")}
          >
            <div className="grid grid-cols-2 gap-px overflow-hidden bg-border md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
              {applications.map((app) => {
                const brand = getVendorBrand(app.vendor)
                const statusColor =
                  app.status === "connected"
                    ? "var(--success)"
                    : app.status === "degraded"
                      ? "var(--attention)"
                      : "var(--destructive)"
                return (
                  <button
                    key={app.id}
                    onClick={() => onNavigate("automation")}
                    className="flex flex-col items-start gap-3 bg-card p-4 text-left transition-colors hover:bg-accent/40"
                  >
                    <div className="flex w-full items-start justify-between">
                      <div
                        className="grid size-10 place-items-center rounded-lg"
                        style={{ background: brand.bg }}
                      >
                        <VendorLogo vendor={app.vendor} className="size-6" color={brand.fg} />
                      </div>
                      <span
                        className="mt-1 size-2 rounded-full"
                        style={{ background: statusColor }}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{app.name}</div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {app.category} · {app.lastSync}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </Panel>
      </div>
      )}

      {section === "playbooks" && (
      <div className="space-y-6">
          <div className={widgetCard}>
            <div className="px-6 pb-3 pt-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className={widgetIcon}>
                  <Activity className="size-4" />
                </span>
                Run outcomes
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Success vs failure · last 7 days</div>
            </div>
            <div className="h-[220px] px-6 pb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={runMix} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)", opacity: 0.4 }} />
                  <Bar dataKey="success" stackId="a" fill={C.c2} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="failed" stackId="a" fill={C.c5} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <Panel
            title="Top playbooks"
            subtitle="Most-run in the last 24 hours"
            icon={<Workflow className="size-4" />}
            onSeeAll={() => onNavigate("playbooks")}
          >
            <div className="px-6 pb-5">
              <ul className="space-y-2.5">
                {topPlaybooks.map((p) => {
                  const max = topPlaybooks[0]?.runs24h ?? 1
                  const widthPct = (p.runs24h / max) * 100
                  return (
                    <li key={p.id} className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="flex-1 truncate font-medium">{p.name}</span>
                        <span className="font-mono text-xs tabular-nums text-muted-foreground">
                          {p.runs24h} runs
                        </span>
                        <span
                          className="font-mono text-xs tabular-nums"
                          style={{
                            color:
                              p.successRate >= 95
                                ? "var(--success)"
                                : p.successRate >= 80
                                  ? "var(--info)"
                                  : "var(--attention)",
                          }}
                        >
                          ✓{p.successRate}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${widthPct}%`, background: C.c2 }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </Panel>
      </div>
      )}

      {section === "agents" && (
      <div className="space-y-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div
              className={cn(
                widgetCard,
                "border-destructive/20 bg-gradient-to-br from-destructive/[0.06] via-card to-card p-5"
              )}
            >
              <div className="text-xs font-medium text-muted-foreground">Failed runs · sample</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-destructive">
                {playbookRuns.filter((r) => r.status === "failed").length}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">From recent lab executions</div>
            </div>
            <div
              className={cn(
                widgetCard,
                "border-primary/15 bg-gradient-to-br from-primary/[0.07] via-card to-card p-5"
              )}
            >
              <div className="text-xs font-medium text-muted-foreground">Queued</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-primary">
                {playbookRuns.filter((r) => r.status === "queued").length}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">Waiting for capacity</div>
            </div>
            <div
              className={cn(
                widgetCard,
                "border-primary/15 bg-gradient-to-br from-primary/[0.07] via-card to-card p-5"
              )}
            >
              <div className="text-xs font-medium text-muted-foreground">Avg agent success</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-primary">
                {Math.round(agents.reduce((s, a) => s + a.successRate, 0) / Math.max(agents.length, 1))}
                <span className="text-base text-muted-foreground">%</span>
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">Across configured agents</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className={cn(widgetCard, "lg:col-span-2")}>
            <div className="flex flex-wrap items-start justify-between gap-4 px-6 pb-3 pt-6">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className={widgetIcon}>
                    <Bot className="size-4" />
                  </span>
                  Runs today · top agents
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {activeAgents} active of {agents.length} configured
                </div>
              </div>
              <Button variant="outline" size="sm" className="h-9" onClick={() => onNavigate("agents")}>
                Open agents
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
            <div className="h-[280px] px-4 pb-5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentRunsTop} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)", opacity: 0.35 }} />
                  <Bar dataKey="runs" fill={C.c2} radius={[0, 4, 4, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            </div>

            <div className={widgetCard}>
              <div className="px-6 pb-2 pt-6">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className={widgetIcon}>
                    <Activity className="size-4" />
                  </span>
                  Lab outcomes
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Recent execution mix</div>
              </div>
              <div className="flex flex-col items-center px-4 pb-4">
                <div className="h-[200px] w-full max-w-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={labOutcomeSlices}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={72}
                        paddingAngle={2}
                      >
                        {labOutcomeSlices.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend
                        wrapperStyle={{ fontSize: 11 }}
                        formatter={(value) => <span className="text-muted-foreground">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="border-t px-6 pb-5 pt-4">
                <div className="text-xs font-medium text-muted-foreground">Failure trend · 7d (mock)</div>
                <div className="mt-2 h-[100px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={agentFailureTrend} margin={{ top: 0, right: 4, left: -18, bottom: 0 }}>
                      <CartesianGrid stroke="var(--border)" vertical={false} />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis hide />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)", opacity: 0.35 }} />
                      <Bar dataKey="fails" fill={C.c5} radius={[3, 3, 0, 0]} maxBarSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
      </div>
      )}

      {section === "lab" && (
      <div className="space-y-6">
          <Panel
            title="Recent runs"
            subtitle="Latest executions across channels"
            icon={<Zap className="size-4" />}
            onSeeAll={() => onNavigate("lab")}
          >
            <ul className="divide-y">
              {recentRuns.map((r) => (
                <li key={r.id} className="flex items-center gap-3 px-6 py-3 text-sm">
                  <RunStatusDot status={r.status} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{r.name}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Badge variant="outline" className="capitalize font-normal">
                        {r.container.kind}
                      </Badge>
                      <span className="font-mono">{r.container.id}</span>
                      <span>·</span>
                      <span>{r.startedAt}</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {r.duration}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
      </div>
      )}

      {section === "artifacts" && (
      <div className="space-y-6">
          <div className={widgetCard}>
            <div className="flex flex-wrap items-start justify-between gap-4 px-6 pb-3 pt-6">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className={widgetIcon}>
                    <Boxes className="size-4" />
                  </span>
                  Artifacts by type
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Observed records in this mock dataset</div>
              </div>
              <Button variant="outline" size="sm" className="h-9" onClick={() => onNavigate("artifacts")}>
                Open artifacts
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
            <div className="flex flex-col items-center px-4 pb-6">
              <div className="h-[220px] w-full max-w-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={artifactTypeCounts}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={56}
                      outerRadius={82}
                      paddingAngle={2}
                      stroke="var(--card)"
                      strokeWidth={2}
                    >
                      {artifactTypeCounts.map((entry, i) => (
                        <Cell key={entry.name} fill={ARTIFACT_CHART_COLORS[i % ARTIFACT_CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend
                      wrapperStyle={{ fontSize: 11 }}
                      formatter={(value) => <span className="text-muted-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
      </div>
      )}
    </div>
  )
}

function Panel({
  title,
  subtitle,
  icon,
  onSeeAll,
  children,
}: {
  title: string
  subtitle: string
  icon: React.ReactNode
  onSeeAll?: () => void
  children: React.ReactNode
}) {
  return (
    <div className={widgetCard}>
      <div className="flex items-start justify-between gap-3 px-6 pb-3 pt-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className={widgetIcon}>{icon}</span>
            {title}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>
        </div>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            See all
            <ArrowRight className="size-3.5" />
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

function RunStatusDot({ status }: { status: "success" | "running" | "failed" | "queued" }) {
  if (status === "success")
    return (
      <span
        className="grid size-7 shrink-0 place-items-center rounded-md"
        style={{
          background: "color-mix(in srgb, var(--success) 15%, transparent)",
          color: "var(--success)",
        }}
      >
        <CheckCircle2 className="size-3.5" />
      </span>
    )
  if (status === "running")
    return (
      <span
        className="grid size-7 shrink-0 place-items-center rounded-md"
        style={{
          background: "color-mix(in srgb, var(--info) 15%, transparent)",
          color: "var(--info)",
        }}
      >
        <Loader2 className="size-3.5 animate-spin" />
      </span>
    )
  if (status === "failed")
    return (
      <span
        className="grid size-7 shrink-0 place-items-center rounded-md"
        style={{
          background: "color-mix(in srgb, var(--destructive) 15%, transparent)",
          color: "var(--destructive)",
        }}
      >
        <AlertCircle className="size-3.5" />
      </span>
    )
  return (
    <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
      <Clock className="size-3.5" />
    </span>
  )
}
