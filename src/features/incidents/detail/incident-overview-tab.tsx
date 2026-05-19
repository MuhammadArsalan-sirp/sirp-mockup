import type { LucideIcon } from "lucide-react"
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Brain,
  CheckCircle2,
  CheckSquare2,
  Cpu,
  ExternalLink,
  Globe,
  HelpCircle,
  Loader2,
  Mail,
  MinusCircle,
  Network,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  Tag,
  Timer,
  UserCheck,
  Wrench,
  XCircle,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { Incident, IncidentState, Severity } from "@/data/incidents"
import { SourceIcon } from "@/features/incidents/list/source-icon"
import type {
  AgentRun,
  AgentStatus,
  CommentRow,
  EntityRow,
  LinkedAlertRow,
  MitreStructured,
  OmniSenseBlock,
  S3BreakdownRow,
  TaskRow,
  TimelineRow,
} from "./incident-detail-mock"
import { IncidentS3Widget } from "./incident-s3-widget"

// ── Static maps ───────────────────────────────────────────────────────────────

const severityColor: Record<Severity, string> = {
  critical: "text-destructive",
  high:     "text-orange-500",
  medium:   "text-amber-500",
  low:      "text-muted-foreground",
}
const severityBg: Record<Severity, string> = {
  critical: "bg-destructive/10 border-destructive/20",
  high:     "bg-orange-500/10 border-orange-400/20",
  medium:   "bg-amber-500/10 border-amber-400/20",
  low:      "bg-muted/40 border-border",
}
const stateLabel: Record<IncidentState, string> = {
  triage: "Triage", investigating: "Investigating", containment: "Containment",
  eradication: "Eradication", recovery: "Recovery", mitigated: "Mitigated", closed: "Closed",
}
const TL_DOT: Record<string, string> = {
  system: "bg-muted-foreground/40", user: "bg-blue-500",
  playbook: "bg-violet-500", integration: "bg-amber-500",
}
const TL_LABEL: Record<string, string> = {
  system: "System", user: "User", playbook: "Playbook", integration: "Integration",
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function agentIconOf(name: string): LucideIcon {
  const n = name.toLowerCase()
  if (n.includes("classif"))                            return Tag
  if (n.includes("enrich"))                             return Globe
  if (n.includes("action"))                             return Zap
  if (n.includes("header") || n.includes("mail"))      return Mail
  if (n.includes("playbook"))                           return BookOpen
  if (n.includes("assign"))                             return UserCheck
  if (n.includes("remedi"))                             return Wrench
  if (n.includes("analy") || n.includes("investigat")) return Brain
  return Cpu
}

type VerdictTone = "alert" | "warn" | "ok" | "info" | "muted"

const VERDICT_TONE: Record<VerdictTone, { iconBox: string; ring: string; bg: string; text: string }> = {
  alert: { iconBox: "border-destructive/30 bg-destructive/10 text-destructive",       ring: "ring-destructive/20",  bg: "bg-destructive/5",       text: "text-destructive"       },
  warn:  { iconBox: "border-amber-500/30 bg-amber-500/10 text-amber-500",             ring: "ring-amber-500/20",    bg: "bg-amber-500/5",          text: "text-amber-600 dark:text-amber-400" },
  ok:    { iconBox: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",       ring: "ring-emerald-500/20",  bg: "bg-emerald-500/5",        text: "text-emerald-600 dark:text-emerald-400" },
  info:  { iconBox: "border-primary/30 bg-primary/10 text-primary",                   ring: "ring-primary/20",      bg: "bg-primary/5",            text: "text-primary"           },
  muted: { iconBox: "border bg-muted text-muted-foreground",                          ring: "ring-border",          bg: "bg-muted/40",             text: "text-foreground"        },
}

type Verdict = {
  tone: VerdictTone
  icon: LucideIcon
  title: string
  detail: string
}

function getOmniSenseVerdict(incident: Incident, confidencePct: number): Verdict {
  const sev = incident.severity
  const iocs = incident.iocs

  if (incident.disposition === "false-positive") {
    return {
      tone: "ok",
      icon: CheckCircle2,
      title: "False Positive",
      detail: "Detection ruled out after analysis — no malicious activity confirmed. Closing with no further action.",
    }
  }
  if (incident.disposition === "benign") {
    return {
      tone: "ok",
      icon: CheckCircle2,
      title: "Benign Activity",
      detail: "Confirmed as legitimate behavior. No containment required.",
    }
  }
  if (incident.disposition === "not-determined") {
    return {
      tone: "muted",
      icon: HelpCircle,
      title: "Inconclusive",
      detail: "Available evidence does not support a definitive verdict. Manual review recommended.",
    }
  }
  if (incident.disposition === "true-positive" && (sev === "critical" || sev === "high") && confidencePct >= 80) {
    return {
      tone: "alert",
      icon: ShieldAlert,
      title: "Confirmed Active Threat",
      detail: `High-confidence detection across ${iocs} IOC${iocs === 1 ? "" : "s"} and ${incident.alerts} correlated alert${incident.alerts === 1 ? "" : "s"}. Immediate containment recommended.`,
    }
  }
  if (incident.disposition === "true-positive" || confidencePct >= 75) {
    return {
      tone: "warn",
      icon: AlertTriangle,
      title: "Likely True Positive",
      detail: `Strong indicators suggest malicious activity. Escalation to Tier 2 recommended for containment.`,
    }
  }
  if (confidencePct >= 50) {
    return {
      tone: "info",
      icon: Search,
      title: "Needs Analyst Review",
      detail: "Moderate confidence with mixed signals. Manual triage required to confirm verdict.",
    }
  }
  return {
    tone: "muted",
    icon: HelpCircle,
    title: "Insufficient Evidence",
    detail: "Low confidence across enriched signals. Gather additional context before action.",
  }
}

// ── Props ─────────────────────────────────────────────────────────────────────

type Props = {
  incident: Incident
  omni: OmniSenseBlock
  s3Breakdown: S3BreakdownRow[]
  mitre: MitreStructured
  timeline: TimelineRow[]
  agentRuns: AgentRun[]
  tasks: TaskRow[]
  comments: CommentRow[]
  entities: EntityRow[]
  alerts: LinkedAlertRow[]
  onOpenOmniSenseTab: () => void
}

// ── Main component ────────────────────────────────────────────────────────────

export function IncidentOverviewTab({
  incident, omni, s3Breakdown, mitre, timeline,
  agentRuns, tasks, comments, entities, alerts,
  onOpenOmniSenseTab,
}: Props) {

  const members = [
    ...(incident.assignee ? [incident.assignee] : []),
    ...incident.members.filter((m) => m.id !== incident.assignee?.id),
  ]

  const doneCount    = agentRuns.filter(a => a.status === "done" || a.status === "skipped").length
  const totalCount   = agentRuns.length
  const runningAgent = agentRuns.find(a => a.status === "running")

  const verdict      = getOmniSenseVerdict(incident, omni.confidencePct)
  const verdictTone  = VERDICT_TONE[verdict.tone]
  const VerdictIcon  = verdict.icon

  const maliciousIocs  = Math.ceil(incident.iocs * 0.6)
  const suspiciousIocs = Math.ceil(incident.iocs * 0.2)
  const doneTasks      = tasks.filter(t => t.done).length
  const criticalEnts   = entities.filter(e => e.risk === "critical").length
  const highEnts       = entities.filter(e => e.risk === "high").length
  const openAlerts     = alerts.filter(a => a.status !== "closed").length
  const taskPct        = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0

  return (
    <div className="space-y-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">

      {/* ══ 1. OVERVIEW CARD + STATS STRIP ═══════════════════════════════════ */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">

          {/* Card label */}
          <div className="px-5 pt-4 pb-0">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Incident Overview</span>
          </div>

          {/* Row 1 — ID + title + Source */}
          <div className="flex items-center justify-between gap-4 px-5 pt-3 pb-2.5">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="shrink-0 font-mono text-xs font-medium text-muted-foreground/60">
                  {incident.id}
                </span>
                <span className="h-3.5 w-px shrink-0 bg-border" />
                <h2 className="min-w-0 truncate text-base font-semibold leading-snug">
                  {incident.title}
                </h2>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-xl border bg-muted/40 px-3 py-1.5">
              <div className="grid size-5 shrink-0 place-items-center">
                <SourceIcon source={incident.source.label} size={20} iconOnly />
              </div>
              <p className="text-sm font-semibold leading-none">{incident.source.label}</p>
            </div>
          </div>

          {/* Row 2 — status chips + SLA + avatars */}
          <div className="flex flex-wrap items-center gap-2 border-t px-5 py-2.5">
            <Badge variant="outline" className={cn("gap-1.5 border text-xs capitalize", severityBg[incident.severity], severityColor[incident.severity])}>
              <span className="size-1.5 rounded-full" style={{ background: "currentColor" }} />
              {incident.severity}
            </Badge>
            <Badge variant="secondary" className="text-xs">{stateLabel[incident.state]}</Badge>
            <Badge variant="outline" className="font-mono text-xs">{incident.priority}</Badge>
            <div className={cn(
              "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium",
              incident.sla.tone === "breach"
                ? "border-destructive/25 bg-destructive/10 text-destructive"
                : "border-transparent bg-muted/50 text-muted-foreground",
            )}>
              <Timer className="size-3 shrink-0" />
              {incident.sla.label}
              {incident.sla.tone === "breach" && <span className="font-semibold"> · Breached</span>}
            </div>
            {members.length > 0 && (
              <div className="ml-auto flex shrink-0 items-center">
                {members.slice(0, 5).map((u, i) => (
                  <Avatar key={u.id} className={cn("size-7 ring-2 ring-background", i > 0 && "-ml-2")}>
                    <AvatarImage src={u.photo} alt={u.name} />
                    <AvatarFallback className={cn("bg-linear-to-br text-[9px] font-bold text-white", u.gradient)}>
                      {u.initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            )}
          </div>

          {/* Row 3 — Classification + S3 */}
          <div className="grid border-t lg:grid-cols-[3fr_1fr] lg:divide-x">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 px-5 py-4">
              {([
                { label: "Category",    value: incident.category },
                { label: "Type",        value: incident.type.label },
                { label: "Technique",   value: incident.type.technique },
                { label: "Disposition", value: incident.disposition.replace(/-/g, " ") },
                { label: "Customer",    value: incident.customer },
                { label: "Location",    value: incident.location },
                { label: "Opener",      value: incident.openedBy.name },
                { label: "Detected",    value: incident.detectionDate },
                { label: "Started",     value: incident.startDate },
                { label: "Source ID",   value: incident.sourceId },
                { label: "Artifacts",   value: String(incident.artifacts) },
                ...(incident.escalationDate ? [{ label: "Escalated", value: incident.escalationDate }] : []),
              ] as { label: string; value: string }[]).map(({ label, value }) => (
                <div key={label} className="flex items-baseline gap-3">
                  <span className="w-17 shrink-0 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                    {label}
                  </span>
                  <span className="min-w-0 truncate text-sm font-medium capitalize">{value}</span>
                </div>
              ))}
            </div>
            <div className="px-5 py-4">
              <IncidentS3Widget score={incident.s3Score} breakdown={s3Breakdown} />
            </div>
          </div>

          {/* Row 4 — Stats strip */}
          <div className="grid grid-cols-2 divide-x divide-y border-t sm:grid-cols-4 sm:divide-y-0">
            <StatStrip
              icon={<Shield className="size-4" />}
              label="IOCs"
              value={incident.iocs}
              sub={`${maliciousIocs} malicious · ${suspiciousIocs} suspicious`}
              tone={maliciousIocs > 0 ? "alert" : suspiciousIocs > 0 ? "warn" : "muted"}
            />
            <StatStrip
              icon={<Bell className="size-4" />}
              label="Alerts"
              value={incident.alerts}
              sub={`${openAlerts} open · ${incident.alerts - openAlerts} closed`}
              tone={openAlerts > 0 ? "warn" : "ok"}
            />
            <StatStrip
              icon={<Network className="size-4" />}
              label="Entities"
              value={entities.length}
              sub={criticalEnts > 0 ? `${criticalEnts} critical risk` : highEnts > 0 ? `${highEnts} high risk` : "All low risk"}
              tone={criticalEnts > 0 ? "alert" : highEnts > 0 ? "warn" : "ok"}
            />
            <StatStrip
              icon={<CheckSquare2 className="size-4" />}
              label="Tasks"
              value={`${doneTasks}/${tasks.length}`}
              sub={`${taskPct}% complete`}
              tone={taskPct === 100 ? "ok" : taskPct > 0 ? "primary" : "muted"}
              progress={taskPct}
            />
          </div>
        </CardContent>
      </Card>

      {/* ══ 2. OMNISENSE ═════════════════════════════════════════════════════ */}
      <Card className="overflow-hidden ring-1 ring-primary/20">
        <CardContent className="p-0">

          {/* Header */}
          <div className="border-b border-primary/10 bg-primary/3 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-primary/25 bg-linear-to-br from-primary/20 to-primary/5">
                <img src="/brand/sara-icon.png" alt="" className="size-5 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold tracking-tight">OmniSense Co-Analysis</span>
                  <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/8 py-0 text-[10px] font-semibold uppercase tracking-wider text-primary">
                    <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                    Autonomous
                  </Badge>
                  {(() => {
                    const c = omni.confidencePct
                    const conf =
                      c >= 85 ? { cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" } :
                      c >= 70 ? { cls: "border-primary/30 bg-primary/10 text-primary" } :
                      c >= 50 ? { cls: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400" } :
                                { cls: "border bg-muted text-muted-foreground" }
                    return (
                      <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5", conf.cls)}>
                        <span className="font-mono text-xs font-bold tabular-nums">{c}%</span>
                        <span className="text-[9px] font-semibold uppercase tracking-wider opacity-80">Confidence</span>
                      </span>
                    )
                  })()}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {runningAgent
                    ? `Running · ${runningAgent.name}`
                    : doneCount === totalCount
                      ? `Complete · ${totalCount} agents processed`
                      : `${doneCount} of ${totalCount} agents complete`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button size="sm" variant="outline" className="h-8 gap-1.5 px-3 text-xs">
                  <RotateCcw className="size-3" />Rerun
                </Button>
                <Button size="sm" variant="outline" onClick={onOpenOmniSenseTab} className="h-8 gap-1.5 px-3 text-xs">
                  <ExternalLink className="size-3" />Full Report
                </Button>
              </div>
            </div>

            {/* Completion progress */}
            <div className="mt-3 flex items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Completion</span>
              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted/40">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-primary to-chart-3 transition-all duration-700 ease-out"
                  style={{ width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%` }}
                />
              </div>
              <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
                {doneCount}/{totalCount}
              </span>
            </div>
          </div>

          {/* Verdict + Summary side by side */}
          <div className="grid grid-cols-1 border-b lg:grid-cols-2 lg:divide-x">
            {/* Overall summary */}
            <div className="px-5 py-4">
              <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Overall Summary
              </div>
              <p className="text-sm leading-relaxed text-foreground/85">{omni.situation}</p>
            </div>

            {/* Verdict */}
            <div className={cn("px-5 py-4", verdictTone.bg)}>
              <div className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                OmniSense Verdict
              </div>
              <div className="flex items-start gap-3">
                <div className={cn("grid size-10 shrink-0 place-items-center rounded-lg border", verdictTone.iconBox)}>
                  <VerdictIcon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className={cn("text-base font-semibold leading-snug", verdictTone.text)}>
                    {verdict.title}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {verdict.detail}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Agents Summary */}
          <div className="px-5 py-4">
            <div className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Agents Summary
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-3 md:grid-cols-3 xl:grid-cols-4">
              {agentRuns.map((agent) => {
                const Icon = agentIconOf(agent.name)
                return <AgentPipelineCard key={agent.id} agent={agent} Icon={Icon} />
              })}
            </div>
          </div>

        </CardContent>
      </Card>

      {/* ══ 3. ACTIVITY + TASKS + COMMENTS ══════════════════════════════════ */}
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr]">

        {/* Timeline */}
        <Card className="overflow-hidden">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Recent Activity</div>
              <span className="font-mono text-xs text-muted-foreground">{timeline.length} events</span>
            </div>
            <div className="relative">
              <div className="absolute bottom-0 left-1.25 top-0 w-px bg-border/40" />
              <div className="space-y-4">
                {timeline.slice(0, 7).map((ev) => {
                  const dot   = TL_DOT[ev.kind]   ?? TL_DOT.system
                  const badge = TL_LABEL[ev.kind] ?? "System"
                  return (
                    <div key={ev.id} className="relative flex gap-3.5">
                      <div className={cn("relative z-10 mt-1.5 size-3 shrink-0 rounded-full border-2 border-background shadow-sm", dot)} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground/60">{ev.when}</span>
                          <span className="rounded bg-muted/60 px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">
                            {badge}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm font-medium leading-snug">{ev.title}</p>
                        {ev.body && (
                          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{ev.body}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card className="overflow-hidden">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Tasks</div>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">{doneTasks}/{tasks.length} done</span>
            </div>
            <div className="space-y-3">
              {tasks.slice(0, 7).map((task) => (
                <div key={task.id} className="flex items-start gap-3">
                  <div className={cn(
                    "mt-0.5 grid size-4 shrink-0 place-items-center rounded border",
                    task.done ? "border-emerald-500/40 bg-emerald-500/15" : "border-border/60 bg-muted/20",
                  )}>
                    {task.done && <CheckCircle2 className="size-2.5 text-emerald-500" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      "text-sm leading-snug",
                      task.done && "text-muted-foreground/50 line-through decoration-muted-foreground/30",
                    )}>
                      {task.label}
                    </p>
                    {task.owner && (
                      <p className="mt-0.5 text-xs text-muted-foreground/60">{task.owner}</p>
                    )}
                  </div>
                  {task.priority === "high" && (
                    <span className="mt-0.5 shrink-0 rounded bg-destructive/10 px-1.5 py-px text-[10px] font-bold text-destructive/80">!</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comments */}
        <Card className="overflow-hidden">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Comments</div>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">{comments.length}</span>
            </div>
            <div className="space-y-4">
              {comments.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-start gap-3">
                  <Avatar className="mt-0.5 size-7 shrink-0">
                    {c.photo && <AvatarImage src={c.photo} alt={c.author} />}
                    <AvatarFallback className={cn("bg-linear-to-br text-[9px] font-bold text-white", c.gradient)}>
                      {c.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{c.author}</span>
                      <span className="text-xs text-muted-foreground/60">{c.when}</span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {c.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ══ 4. MITRE + TAGS ═════════════════════════════════════════════════ */}
      {(mitre.tactics.length > 0 || mitre.techniques.length > 0 || incident.tags.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-[3fr_1fr]">
          {(mitre.tactics.length > 0 || mitre.techniques.length > 0) && (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-wrap items-center gap-2 px-5 py-4">
                  <span className="mr-1 text-sm font-semibold">MITRE ATT&amp;CK</span>
                  {mitre.techniques.map((t) => (
                    <span key={t} className="rounded border border-primary/20 bg-primary/8 px-2.5 py-1 font-mono text-xs font-semibold text-primary">
                      {t}
                    </span>
                  ))}
                  {mitre.tactics.map((t) => (
                    <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {incident.tags.length > 0 && (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-wrap items-center gap-2 px-5 py-4">
                  <Tag className="size-4 shrink-0 text-muted-foreground/60" />
                  {incident.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

type StatTone = "muted" | "primary" | "warn" | "alert" | "ok"

const STAT_ICON_BOX = "border bg-muted text-muted-foreground"

const STAT_TONE: Record<StatTone, { dot: string; bar: string }> = {
  muted:   { dot: "bg-muted-foreground/50",  bar: "bg-muted-foreground/40" },
  primary: { dot: "bg-primary",              bar: "bg-primary"             },
  warn:    { dot: "bg-amber-500",            bar: "bg-amber-500"           },
  alert:   { dot: "bg-destructive",          bar: "bg-destructive"         },
  ok:      { dot: "bg-emerald-500",          bar: "bg-emerald-500"         },
}

function StatStrip({ icon, label, value, sub, tone = "muted", progress }: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  tone?: StatTone
  progress?: number
}) {
  const t = STAT_TONE[tone]
  return (
    <div className="flex flex-col gap-1.5 px-5 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className={cn("grid size-8 shrink-0 place-items-center rounded-lg", STAT_ICON_BOX)}>
          {icon}
        </div>
      </div>
      <div className="font-medium text-2xl tabular-nums leading-none tracking-tight">{value}</div>
      {progress !== undefined ? (
        <div className="flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted/40">
            <div
              className={cn("h-full rounded-full transition-all duration-700 ease-out", t.bar)}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          {sub && <span className="shrink-0 text-[10px] text-muted-foreground">{sub}</span>}
        </div>
      ) : (
        sub && (
          <div className="flex items-center gap-1.5">
            {tone !== "muted" && <span className={cn("size-1.5 shrink-0 rounded-full", t.dot)} />}
            <span className="text-xs text-muted-foreground">{sub}</span>
          </div>
        )
      )}
    </div>
  )
}

function AgentPipelineCard({ agent, Icon }: {
  agent: AgentRun
  Icon: LucideIcon
}) {
  const shortName = agent.name.replace(/ Agent$/i, "")
  const blurb = agent.findings ?? agent.description

  const styles = {
    done:    { card: "border-primary/20 bg-primary/[0.03]",        icon: "border-primary/25 bg-primary/10 text-primary",             dot: "bg-primary",                 label: "Done"    },
    running: { card: "border-amber-400/25 bg-amber-500/[0.03]",    icon: "border-amber-400/25 bg-amber-500/10 text-amber-500",       dot: "bg-amber-400 animate-pulse", label: "Running" },
    queued:  { card: "border-border/40",                            icon: "border-border/40 bg-muted/30 text-muted-foreground/40",    dot: "bg-muted-foreground/25",     label: "Queued"  },
    skipped: { card: "border-dashed border-border/30 opacity-50",   icon: "border-border/30 bg-muted/20 text-muted-foreground/30",    dot: "hidden",                     label: "Skipped" },
    failed:  { card: "border-destructive/25 bg-destructive/[0.03]", icon: "border-destructive/25 bg-destructive/10 text-destructive", dot: "bg-destructive",             label: "Failed"  },
  }[agent.status]

  return (
    <div
      className={cn(
        "relative flex min-w-0 flex-col gap-2 rounded-xl border p-3",
        // Connecting line on the left side, spanning the grid gap
        "before:absolute before:-left-5 before:top-6.5 before:h-px before:w-5 before:bg-border before:content-['']",
        // Hide the line for the first card of each row at each breakpoint
        // (the override uses the same selector specificity so it actually wins)
        "nth-[2n+1]:before:hidden",
        "md:nth-[2n+1]:before:block md:nth-[3n+1]:before:hidden",
        "xl:nth-[3n+1]:before:block xl:nth-[4n+1]:before:hidden",
        styles.card,
      )}
    >
      {/* Icon + name */}
      <div className="flex items-center gap-2">
        <div className={cn("grid size-7 shrink-0 place-items-center rounded-lg border", styles.icon)}>
          {agent.status === "running"
            ? <Loader2 className="size-3.5 animate-spin" />
            : agent.status === "failed"
              ? <XCircle className="size-3.5" />
              : agent.status === "skipped"
                ? <MinusCircle className="size-3.5" />
                : <Icon className="size-3.5" />}
        </div>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold leading-tight">{shortName}</span>
      </div>

      {/* One-liner summary */}
      <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">{blurb}</p>

      {/* Status */}
      <div className="mt-auto flex items-center gap-1.5 pt-0.5">
        <span className={cn("size-1.5 rounded-full", styles.dot)} />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">{styles.label}</span>
      </div>
    </div>
  )
}

export type { AgentStatus }
