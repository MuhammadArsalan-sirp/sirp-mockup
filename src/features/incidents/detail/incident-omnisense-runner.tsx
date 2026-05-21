import { useCallback, useMemo, useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  Bell,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Clock,
  Code2,
  Cpu,
  ExternalLink,
  FileSearch,
  Globe,
  HelpCircle,
  KeyRound,
  Layers,
  Loader2,
  Mail,
  MinusCircle,
  Pin,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  ShieldAlert,
  Sparkles,
  Tag,
  Target,
  UserCheck,
  Wrench,
  XCircle,
  Zap,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Incident } from "@/data/incidents"
import {
  buildAgentRuns,
  buildOmniSense,
  buildOmniSenseRunDelta,
  type AgentRun,
  type AgentStatus,
  type OmniSenseBlock,
} from "./incident-detail-mock"

// ── Tone tokens (mirrors overview tab) ───────────────────────────────────────

type Tone = "alert" | "warn" | "ok" | "info" | "muted"

const TONE: Record<Tone, { iconBox: string; chip: string; ring: string; bg: string; text: string; dot: string; bar: string }> = {
  alert: {
    iconBox: "border-destructive/30 bg-destructive/10 text-destructive",
    chip:    "border-destructive/25 bg-destructive/10 text-destructive",
    ring:    "ring-destructive/20",
    bg:      "bg-destructive/5",
    text:    "text-destructive",
    dot:     "bg-destructive",
    bar:     "bg-destructive",
  },
  warn: {
    iconBox: "border-amber-500/30 bg-amber-500/10 text-amber-500",
    chip:    "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    ring:    "ring-amber-500/20",
    bg:      "bg-amber-500/5",
    text:    "text-amber-600 dark:text-amber-400",
    dot:     "bg-amber-500",
    bar:     "bg-amber-500",
  },
  ok: {
    iconBox: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
    chip:    "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    ring:    "ring-emerald-500/20",
    bg:      "bg-emerald-500/5",
    text:    "text-emerald-600 dark:text-emerald-400",
    dot:     "bg-emerald-500",
    bar:     "bg-emerald-500",
  },
  info: {
    iconBox: "border-primary/30 bg-primary/10 text-primary",
    chip:    "border-primary/25 bg-primary/10 text-primary",
    ring:    "ring-primary/20",
    bg:      "bg-primary/5",
    text:    "text-primary",
    dot:     "bg-primary",
    bar:     "bg-primary",
  },
  muted: {
    iconBox: "border bg-muted text-muted-foreground",
    chip:    "border bg-muted text-muted-foreground",
    ring:    "ring-border",
    bg:      "bg-muted/40",
    text:    "text-foreground",
    dot:     "bg-muted-foreground/50",
    bar:     "bg-muted-foreground/40",
  },
}

// ── Verdict (derived from disposition + severity + confidence) ───────────────

type Verdict = { tone: Tone; icon: LucideIcon; title: string; detail: string }

function getVerdict(incident: Incident, confidencePct: number): Verdict {
  const sev = incident.severity
  const iocs = incident.iocs
  if (incident.disposition === "false-positive") {
    return { tone: "ok", icon: CheckCircle2, title: "False Positive",
      detail: "Detection ruled out after analysis — no malicious activity confirmed. Closing with no further action." }
  }
  if (incident.disposition === "benign") {
    return { tone: "ok", icon: CheckCircle2, title: "Benign Activity",
      detail: "Confirmed as legitimate behavior. No containment required." }
  }
  if (incident.disposition === "not-determined") {
    return { tone: "muted", icon: HelpCircle, title: "Inconclusive",
      detail: "Available evidence does not support a definitive verdict. Manual review recommended." }
  }
  if (incident.disposition === "true-positive" && (sev === "critical" || sev === "high") && confidencePct >= 80) {
    return { tone: "alert", icon: ShieldAlert, title: "Confirmed Active Threat",
      detail: `High-confidence detection across ${iocs} IOC${iocs === 1 ? "" : "s"} and ${incident.alerts} correlated alert${incident.alerts === 1 ? "" : "s"}. Immediate containment recommended.` }
  }
  if (incident.disposition === "true-positive" || confidencePct >= 75) {
    return { tone: "warn", icon: AlertTriangle, title: "Likely True Positive",
      detail: "Strong indicators suggest malicious activity. Escalation to Tier 2 recommended for containment." }
  }
  if (confidencePct >= 50) {
    return { tone: "info", icon: Search, title: "Needs Analyst Review",
      detail: "Moderate confidence with mixed signals. Manual triage required to confirm verdict." }
  }
  return { tone: "muted", icon: HelpCircle, title: "Insufficient Evidence",
    detail: "Low confidence across enriched signals. Gather additional context before action." }
}

// ── Agent presentation ───────────────────────────────────────────────────────

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

const STATUS_META: Record<AgentStatus, { tone: Tone; label: string; Icon: LucideIcon }> = {
  done:    { tone: "info",  label: "Done",    Icon: CheckCircle2 },
  running: { tone: "warn",  label: "Running", Icon: Loader2 },
  queued:  { tone: "muted", label: "Queued",  Icon: Clock },
  skipped: { tone: "muted", label: "Skipped", Icon: MinusCircle },
  failed:  { tone: "alert", label: "Failed",  Icon: XCircle },
}

type StageName = AgentRun["stage"]
const STAGES: StageName[] = ["Triage", "Analysis", "Recovery"]

// ── Agent result types & builder ─────────────────────────────────────────────

type EnrichmentApp = "virustotal" | "abuseipdb" | "threatfox" | "shodan" | "hybridanalysis" | "mandiant" | "urlscan"
type EnrichmentStatus = "malicious" | "suspicious" | "clean" | "pending"
type ActionKind = "isolate" | "block" | "rotate" | "notify" | "patch"
type RemStatus = "done" | "in-progress" | "queued"

type AgentResult =
  | { kind: "classification"; category: string; severity: string; priority: string; technique: string; confidencePct: number }
  | { kind: "enrichment";     sources: { app: EnrichmentApp; status: EnrichmentStatus; summary: string; ranAt: string }[] }
  | { kind: "analysis";       reading: { iocs: number; artifacts: number; alerts: number }; patterns: string[]; narrative: string; confidencePct: number }
  | { kind: "actions";        items: { kind: ActionKind; label: string; target: string }[] }
  | { kind: "playbooks";      matches: { name: string; fitPct: number; tag?: string }[] }
  | { kind: "assignment";     analyst: { name: string; role: string; specialty: string; load: string; photo?: string; gradient: string; initials: string } | null; reason: string }
  | { kind: "remediation";    steps: { label: string; eta: string; status: RemStatus }[]; totalEta: string }
  | { kind: "skipped";        reason: string }
  | { kind: "queued";         reason: string }
  | { kind: "failed";         reason: string }

function buildAgentResult(agent: AgentRun, inc: Incident): AgentResult {
  if (agent.status === "queued")  return { kind: "queued",  reason: "Waiting on a prior stage to complete." }
  if (agent.status === "skipped") return { kind: "skipped", reason: `Not applicable to incident category "${inc.category}".` }
  if (agent.status === "failed")  return { kind: "failed",  reason: "Upstream dependency unavailable · retried 3×." }

  const n = agent.name.toLowerCase()

  if (n.includes("classif")) {
    return {
      kind: "classification",
      category: inc.category,
      severity: inc.severity,
      priority: inc.priority,
      technique: inc.type.technique,
      confidencePct: Math.round(inc.aiConfidence * 100),
    }
  }
  if (n.includes("enrich")) {
    return {
      kind: "enrichment",
      sources: [
        { app: "virustotal",     status: "malicious",  summary: `${inc.iocs} queried · ${Math.ceil(inc.iocs * 0.6)} malicious`, ranAt: "2h ago" },
        { app: "abuseipdb",      status: "malicious",  summary: "94% abuse score · 312 reports",                                ranAt: "2h ago" },
        { app: "threatfox",      status: "malicious",  summary: `Matched ${inc.mitre[0] ?? "T1078"} · Cobalt Strike cluster`,   ranAt: "2h ago" },
        { app: "shodan",         status: "suspicious", summary: "3 hosts · 1 Tor exit identified",                              ranAt: "1h ago" },
        { app: "hybridanalysis", status: "pending",    summary: "1 sample queued for dynamic analysis · ETA 8m",                ranAt: "30m ago" },
      ],
    }
  }
  if (n.includes("analy") || n.includes("investigat")) {
    return {
      kind: "analysis",
      reading: { iocs: inc.iocs, artifacts: inc.artifacts, alerts: inc.alerts },
      patterns: ["Lateral movement", "Credential reuse", "Off-hours authentication"],
      narrative: `${inc.title} shows hallmarks of ${inc.category} consistent with ${inc.type.technique}. Activity originated from ${inc.source.label} and propagated across the ${inc.location} environment.`,
      confidencePct: Math.round(inc.aiConfidence * 100),
    }
  }
  if (n.includes("action")) {
    return {
      kind: "actions",
      items: [
        { kind: "isolate", label: "Isolate affected host",       target: "Network L4 · primary workload" },
        { kind: "block",   label: "Block malicious IPs",         target: "4 IPs at perimeter firewall" },
        { kind: "rotate",  label: "Force credential rotation",   target: inc.assignee ? `${inc.assignee.name} + 1 service account` : "1 service account" },
      ],
    }
  }
  if (n.includes("playbook")) {
    return {
      kind: "playbooks",
      matches: [
        { name: `${inc.category} Response`, fitPct: 78, tag: "Primary" },
        { name: "Endpoint Isolation",        fitPct: 71 },
        { name: "Credential Rotation",       fitPct: 62 },
      ],
    }
  }
  if (n.includes("assign")) {
    return {
      kind: "assignment",
      analyst: inc.assignee
        ? {
            name: inc.assignee.name,
            role: "Lead SOC Analyst",
            specialty: `${inc.category.split(" ")[0]} specialist`,
            load: "3 active cases",
            photo: inc.assignee.photo,
            gradient: inc.assignee.gradient,
            initials: inc.assignee.initials,
          }
        : null,
      reason: inc.assignee
        ? `Selected on expertise in ${inc.category}, current availability, and historical close-rate.`
        : "No eligible analyst available — auto-assignment deferred.",
    }
  }
  if (n.includes("remedi")) {
    return {
      kind: "remediation",
      steps: [
        { label: "Containment",     eta: "≈30m",        status: "done" },
        { label: "Eradication",     eta: "≈1h 30m",     status: "in-progress" },
        { label: "Recovery",        eta: "≈2h",         status: "queued" },
        { label: "Validation",      eta: "≈30m",        status: "queued" },
        { label: "Lessons learned", eta: "post-mortem", status: "queued" },
      ],
      totalEta: "4–6 hours",
    }
  }

  return { kind: "skipped", reason: "No structured output available for this agent." }
}

// ── Main component ───────────────────────────────────────────────────────────

type Props = { incident: Incident }

export function IncidentOmniSenseRunner({ incident }: Props) {
  const baseOmni = useMemo<OmniSenseBlock>(() => buildOmniSense(incident), [incident])
  const baseAgents = useMemo<AgentRun[]>(() => buildAgentRuns(incident), [incident])

  const [running, setRunning] = useState(false)
  const [runCount, setRunCount] = useState(1)
  const [extra, setExtra] = useState("")
  const [showNarrative, setShowNarrative] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)

  const run = useCallback(() => {
    setRunning(true)
    window.setTimeout(() => {
      setExtra(buildOmniSenseRunDelta(incident))
      setRunCount((c) => c + 1)
      setRunning(false)
    }, 1400)
  }, [incident])

  const verdict     = getVerdict(incident, baseOmni.confidencePct)
  const verdictTone = TONE[verdict.tone]
  const VerdictIcon = verdict.icon

  const activeAgents  = baseAgents.filter((a) => a.status !== "skipped").length
  const doneAgents    = baseAgents.filter((a) => a.status === "done").length
  const runningAgent  = baseAgents.find((a) => a.status === "running")
  const completionPct = activeAgents > 0 ? Math.round((doneAgents / activeAgents) * 100) : 0

  const selectedAgent = selectedAgentId ? baseAgents.find((a) => a.id === selectedAgentId) ?? null : null
  const situation     = extra ? `${baseOmni.situation}\n\n${extra}` : baseOmni.situation

  return (
    <div className="space-y-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">

      {/* ══ 1. VERDICT HERO ══════════════════════════════════════════════════ */}
      <Card className="overflow-hidden ring-1 ring-primary/20">
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-3 border-b border-primary/10 bg-primary/5 px-5 py-3.5">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-primary/25 bg-linear-to-br from-primary/20 to-primary/5">
              <Sparkles className="size-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold tracking-tight">OmniSense Co-Analyst</span>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-xs text-muted-foreground">Investigation room</span>
                <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/8 py-0 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  <span className={cn("size-1.5 rounded-full bg-primary", running && "animate-pulse")} />
                  Autonomous
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Run #{runCount} · model v3.2 · {runningAgent ? `running ${runningAgent.name}` : `analyzed ${baseOmni.analyzedAt}`}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button size="sm" className="h-8 gap-1.5 px-3 text-xs" onClick={run} disabled={running}>
                {running ? <Loader2 className="size-3 animate-spin" /> : <RotateCcw className="size-3" />}
                {running ? "Re-running…" : "Re-run analysis"}
              </Button>
              <Button size="sm" variant="outline" className="h-8 gap-1.5 px-3 text-xs">
                <Settings2 className="size-3" />
                Configure
              </Button>
              <Button size="sm" variant="ghost" className="h-8 gap-1.5 px-3 text-xs text-muted-foreground">
                <ExternalLink className="size-3" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] lg:divide-x">
            <div className={cn("px-5 py-5", verdictTone.bg)}>
              <div className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                OmniSense Verdict
              </div>
              <div className="flex items-start gap-3.5">
                <div className={cn("grid size-12 shrink-0 place-items-center rounded-xl border", verdictTone.iconBox)}>
                  <VerdictIcon className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className={cn("text-lg font-semibold leading-tight tracking-tight", verdictTone.text)}>
                    {verdict.title}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">
                    {verdict.detail}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 py-5">
              <div className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Confidence
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-3xl tabular-nums leading-none tracking-tight">{baseOmni.confidencePct}</span>
                <span className="text-sm font-medium text-muted-foreground">%</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted/40">
                <div
                  className="h-full rounded-full bg-linear-to-r from-primary to-chart-3 transition-all duration-700 ease-out"
                  style={{ width: `${baseOmni.confidencePct}%` }}
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Agents</div>
                  <div className="mt-0.5 font-mono text-sm font-semibold tabular-nums">
                    {doneAgents} / {activeAgents}<span className="ml-1 text-xs font-normal text-muted-foreground/70">done</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Completion</div>
                  <div className="mt-0.5 font-mono text-sm font-semibold tabular-nums">
                    {completionPct}<span className="text-xs font-normal text-muted-foreground/70">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ══ 2. SIDEBAR + MAIN PANE ═══════════════════════════════════════════ */}
      <div className="grid items-start gap-4 lg:grid-cols-[300px_1fr]">

        <AgentSidebar
          agents={baseAgents}
          selectedAgentId={selectedAgentId}
          onSelect={setSelectedAgentId}
          doneAgents={doneAgents}
          activeAgents={activeAgents}
          completionPct={completionPct}
        />

        <div className="space-y-4">
          {selectedAgent
            ? <AgentDossier agent={selectedAgent} incident={incident} onBack={() => setSelectedAgentId(null)} />
            : <InvestigationSummary omni={baseOmni} />}
        </div>
      </div>

      {/* ══ 3. ANALYSIS NARRATIVE (collapsible, bottom) ═════════════════════ */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <button
            type="button"
            onClick={() => setShowNarrative((v) => !v)}
            className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left hover:bg-muted/30"
          >
            <div className="flex items-center gap-2.5">
              <div className="grid size-8 shrink-0 place-items-center rounded-lg border bg-muted text-muted-foreground">
                <CircleDashed className="size-4" />
              </div>
              <div>
                <div className="text-sm font-semibold leading-tight tracking-tight">Analysis Narrative</div>
                <div className="text-[11px] text-muted-foreground">Full situational summary written by OmniSense</div>
              </div>
            </div>
            <ChevronRight className={cn("size-4 shrink-0 text-muted-foreground transition-transform", showNarrative && "rotate-90")} />
          </button>
          {showNarrative && (
            <div className="border-t bg-muted/10 px-5 py-4">
              <p className="text-sm font-semibold leading-snug text-foreground">{baseOmni.headline}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">{situation}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Sidebar ──────────────────────────────────────────────────────────────────

function AgentSidebar({
  agents, selectedAgentId, onSelect, doneAgents, activeAgents, completionPct,
}: {
  agents: AgentRun[]
  selectedAgentId: string | null
  onSelect: (id: string | null) => void
  doneAgents: number
  activeAgents: number
  completionPct: number
}) {
  return (
    <Card className="overflow-hidden shadow-sm lg:sticky lg:top-2 lg:max-h-[calc(100vh-1rem)]">
      <CardContent className="flex max-h-full flex-col p-0 lg:max-h-[calc(100vh-1rem)]">

        {/* Header — counts + progress (sticky inside the sidebar scroll area) */}
        <div className="shrink-0 border-b bg-card px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Agent Team</span>
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground/70">
              {doneAgents}/{activeAgents} · {completionPct}%
            </span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted/40">
            <div
              className="h-full rounded-full bg-linear-to-r from-primary to-chart-3 transition-all duration-700 ease-out"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        {/* Scrollable list */}
        <div className="min-h-0 flex-1 overflow-y-auto">

          {/* Summary view selector */}
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={cn(
              "flex w-full items-center gap-2.5 border-b px-4 py-2.5 text-left transition",
              selectedAgentId === null ? "bg-primary/5" : "hover:bg-muted/30",
            )}
          >
            <div className="grid size-7 shrink-0 place-items-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
              <Pin className="size-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold leading-tight">Investigation summary</div>
              <div className="mt-0.5 text-[10px] text-muted-foreground/70">Evidence · actions · gaps</div>
            </div>
            {selectedAgentId === null && <ChevronRight className="size-3.5 shrink-0 text-primary" />}
          </button>

          {/* Stage sections */}
          <div className="divide-y">
            {STAGES.map((stage) => {
              const stageAgents = agents.filter((a) => a.stage === stage)
              return (
                <div key={stage} className="px-3 py-3">
                  <div className="mb-2 flex items-center gap-2 px-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                      {stage}
                    </span>
                    <span className="font-mono text-[9px] tabular-nums text-muted-foreground/50">
                      {stageAgents.length}
                    </span>
                    <div className="ml-auto flex items-center gap-1">
                      {stageAgents.map((a) => {
                        const aTone = TONE[STATUS_META[a.status].tone]
                        return (
                          <span
                            key={a.id}
                            className={cn(
                              "size-1.5 shrink-0 rounded-full",
                              a.status === "skipped" ? "bg-muted-foreground/20" : aTone.dot,
                              a.status === "running" && "animate-pulse",
                            )}
                          />
                        )
                      })}
                    </div>
                  </div>
                  <div className="space-y-1">
                    {stageAgents.map((agent) => (
                      <AgentSidebarCard
                        key={agent.id}
                        agent={agent}
                        selected={agent.id === selectedAgentId}
                        onSelect={() => onSelect(agent.id)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AgentSidebarCard({ agent, selected, onSelect }: {
  agent: AgentRun
  selected: boolean
  onSelect: () => void
}) {
  const meta = STATUS_META[agent.status]
  const tone = TONE[meta.tone]
  const Icon = agentIconOf(agent.name)
  const shortName = agent.name.replace(/ Agent$/i, "")
  const isSkipped = agent.status === "skipped"
  const isRunning = agent.status === "running"

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left transition",
        selected
          ? "border-primary/40 bg-primary/5 ring-1 ring-primary/15"
          : "border-transparent hover:border-border hover:bg-muted/30",
        isSkipped && !selected && "opacity-55",
      )}
    >
      <div className={cn("grid size-7 shrink-0 place-items-center rounded-lg border", tone.iconBox)}>
        {isRunning ? <Loader2 className="size-3.5 animate-spin" /> : <Icon className="size-3.5" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="min-w-0 flex-1 truncate text-xs font-semibold leading-tight">{shortName}</span>
          {agent.status === "done"   && <CheckCircle2 className="size-3 shrink-0 text-primary" />}
          {agent.status === "failed" && <XCircle      className="size-3 shrink-0 text-destructive" />}
          {agent.status === "skipped"&& <MinusCircle  className="size-3 shrink-0 text-muted-foreground/40" />}
        </div>
        <div className="mt-0.5 truncate text-[10px] text-muted-foreground/70">
          {meta.label}
          {agent.duration && ` · ${agent.duration}`}
          {isRunning && agent.progress !== undefined && ` · ${agent.progress}%`}
        </div>
        {isRunning && agent.progress !== undefined && (
          <div className="mt-1.5 h-0.5 overflow-hidden rounded-full bg-muted/40">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-700 ease-out"
              style={{ width: `${agent.progress}%` }}
            />
          </div>
        )}
      </div>
    </button>
  )
}

// ── Investigation summary (default right pane) ───────────────────────────────

function InvestigationSummary({ omni }: { omni: OmniSenseBlock }) {
  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="px-5 py-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Evidence Chain</div>
            <span className="font-mono text-xs text-muted-foreground/70">{omni.evidence.length} items</span>
          </div>
          <div className="relative">
            <div className="absolute bottom-2 left-3.25 top-2 w-px bg-border/60" />
            <div className="space-y-3.5">
              {omni.evidence.map((e, i) => (
                <div key={i} className="relative flex gap-3.5">
                  <div className="relative z-10 mt-1 grid size-7 shrink-0 place-items-center rounded-lg border border-primary/25 bg-primary/10 text-primary shadow-sm">
                    <FileSearch className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1 rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                    <div className="text-sm font-medium leading-snug">{e.label}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-muted-foreground/70">{e.ref}</span>
                      <button className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary/80 hover:text-primary">
                        Open <ChevronRight className="size-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="overflow-hidden">
          <CardContent className="px-5 py-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Recommended Actions</div>
              <span className="font-mono text-xs text-muted-foreground/70">{omni.nextSteps.length}</span>
            </div>
            <ol className="space-y-3">
              {omni.nextSteps.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border border-primary/25 bg-primary/10 font-mono text-[10px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm leading-snug">{s.label}</div>
                    <div className="mt-1 flex items-center gap-2">
                      {s.hint && (
                        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">{s.hint}</span>
                      )}
                      <button className="ml-auto inline-flex items-center gap-1 rounded border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary">
                        <Plus className="size-2.5" />
                        Add task
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="px-5 py-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Open Questions</div>
              <span className="font-mono text-xs text-muted-foreground/70">{omni.gaps.length}</span>
            </div>
            <ul className="space-y-3">
              {omni.gaps.map((g, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border border-amber-500/25 bg-amber-500/10 text-amber-500">
                    <HelpCircle className="size-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug text-foreground/85">{g}</p>
                    <div className="mt-1 flex items-center justify-end">
                      <button className="inline-flex items-center gap-1 rounded border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary">
                        <Search className="size-2.5" />
                        Investigate
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

// ── Agent dossier (right pane when agent selected) ───────────────────────────

function AgentDossier({ agent, incident, onBack }: {
  agent: AgentRun
  incident: Incident
  onBack: () => void
}) {
  const meta = STATUS_META[agent.status]
  const tone = TONE[meta.tone]
  const Icon = agentIconOf(agent.name)
  const StatusIcon = meta.Icon
  const shortName = agent.name.replace(/ Agent$/i, "")
  const isDone = agent.status === "done"
  const isRunning = agent.status === "running"
  const isSkipped = agent.status === "skipped"
  const result = buildAgentResult(agent, incident)
  const [showRaw, setShowRaw] = useState(false)

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center justify-between gap-3 border-b bg-muted/15 px-5 py-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3" />
              Back to summary
            </button>
            <span className="font-mono text-[10px] text-muted-foreground/60">agent_id: {agent.id}</span>
          </div>

          <div className="flex flex-wrap items-start gap-4 px-5 py-4">
            <div className={cn("grid size-12 shrink-0 place-items-center rounded-xl border", tone.iconBox)}>
              {isRunning ? <Loader2 className="size-6 animate-spin" /> : <Icon className="size-6" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold leading-tight tracking-tight">{shortName}</h3>
                <span className="text-xs text-muted-foreground">{agent.stage} stage</span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{agent.description}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <span className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
                tone.chip,
              )}>
                {isRunning ? <Loader2 className="size-3 animate-spin" /> : <StatusIcon className="size-3" />}
                {meta.label}
              </span>
              {agent.duration && (
                <span className="font-mono text-[11px] text-muted-foreground/70">{agent.duration}</span>
              )}
            </div>
          </div>

          {agent.findings && (
            <div className="border-t bg-primary/5 px-5 py-3">
              <div className="flex items-start gap-2.5">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-primary/70">Findings</div>
                  <p className="mt-0.5 text-sm leading-relaxed text-foreground/90">{agent.findings}</p>
                </div>
              </div>
            </div>
          )}

          {isRunning && agent.progress !== undefined && (
            <div className="border-t bg-amber-500/5 px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  In progress
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/40">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-700 ease-out"
                    style={{ width: `${agent.progress}%` }}
                  />
                </div>
                <span className="font-mono text-xs font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                  {agent.progress}%
                </span>
              </div>
            </div>
          )}

          {isSkipped && (
            <div className="border-t bg-muted/30 px-5 py-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Skipped — this agent is not applicable to the current incident category
                <span className="ml-1 font-medium text-foreground/80">({incident.category})</span>.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-2.5">
            <div className="flex items-center gap-2">
              {showRaw
                ? <Code2 className="size-3.5 text-muted-foreground" />
                : <Sparkles className="size-3.5 text-primary" />}
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {showRaw ? "Raw JSON Output" : "Agent Result"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Segmented toggle: UI / Raw JSON */}
              <div className="inline-flex items-center rounded-md border bg-background p-0.5">
                <button
                  type="button"
                  onClick={() => setShowRaw(false)}
                  className={cn(
                    "rounded-sm px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition",
                    !showRaw ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  UI
                </button>
                <button
                  type="button"
                  onClick={() => setShowRaw(true)}
                  className={cn(
                    "rounded-sm px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition",
                    showRaw ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Raw JSON
                </button>
              </div>
              {isDone && (
                <Button size="sm" variant="ghost" className="h-7 gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <RotateCcw className="size-3" />
                  Re-run
                </Button>
              )}
            </div>
          </div>
          {showRaw ? (
            <pre className="overflow-x-auto px-5 py-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
{JSON.stringify(result, null, 2)}
            </pre>
          ) : (
            <AgentResultUI result={result} />
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Configuration</div>
            <Button size="sm" variant="outline" className="h-7 gap-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-wider">
              <Settings2 className="size-3" />
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {[
              { k: "Model",       v: "OmniSense v3.2" },
              { k: "Mode",        v: "Autonomous" },
              { k: "Temperature", v: "0.2" },
              { k: "Timeout",     v: "300s" },
              { k: "Stage",       v: agent.stage },
              { k: "Retries",     v: "3" },
            ].map(({ k, v }) => (
              <div key={k} className="flex items-baseline gap-3">
                <span className="w-20 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">{k}</span>
                <span className="min-w-0 truncate font-mono text-xs">{v}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}

// ── Result renderer dispatcher ──────────────────────────────────────────────

function AgentResultUI({ result }: { result: AgentResult }) {
  switch (result.kind) {
    case "classification": return <ClassificationResult result={result} />
    case "enrichment":     return <EnrichmentResult result={result} />
    case "analysis":       return <AnalysisResult result={result} />
    case "actions":        return <ActionsResult result={result} />
    case "playbooks":      return <PlaybookResult result={result} />
    case "assignment":     return <AssignmentResult result={result} />
    case "remediation":    return <RemediationResult result={result} />
    case "queued":         return <EmptyResult kind="queued"  reason={result.reason} />
    case "skipped":        return <EmptyResult kind="skipped" reason={result.reason} />
    case "failed":         return <EmptyResult kind="failed"  reason={result.reason} />
  }
}

// ── Shared bits ──────────────────────────────────────────────────────────────

function SectionLabel({ children, count }: { children: React.ReactNode; count?: number | string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{children}</span>
      {count !== undefined && <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">{count}</span>}
    </div>
  )
}

const SEVERITY_TONE: Record<string, Tone> = {
  critical: "alert",
  high:     "warn",
  medium:   "info",
  low:      "muted",
}

function TonePill({ tone, children, mono = false }: { tone: Tone; children: React.ReactNode; mono?: boolean }) {
  const t = TONE[tone]
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
      mono && "font-mono",
      t.chip,
    )}>
      {children}
    </span>
  )
}

// ── Classification ────────────────────────────────────────────────────────────

function ClassificationResult({ result }: { result: Extract<AgentResult, { kind: "classification" }> }) {
  const sevTone = SEVERITY_TONE[result.severity] ?? "muted"
  return (
    <div className="space-y-4 px-5 py-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ClassField label="Category"  value={<TonePill tone="info">{result.category}</TonePill>} />
        <ClassField label="Severity"  value={<TonePill tone={sevTone}>{result.severity}</TonePill>} />
        <ClassField label="Priority"  value={<TonePill tone={result.priority === "P1" ? "alert" : result.priority === "P2" ? "warn" : "muted"} mono>{result.priority}</TonePill>} />
        <ClassField label="Technique" value={<span className="font-mono text-sm font-medium">{result.technique}</span>} />
      </div>
      <div>
        <SectionLabel>Confidence</SectionLabel>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/40">
            <div
              className="h-full rounded-full bg-linear-to-r from-primary to-chart-3 transition-all duration-700 ease-out"
              style={{ width: `${result.confidencePct}%` }}
            />
          </div>
          <span className="font-mono text-sm font-semibold tabular-nums">{result.confidencePct}%</span>
        </div>
      </div>
    </div>
  )
}

function ClassField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">{label}</div>
      <div className="mt-1.5 flex items-center gap-2 capitalize">{value}</div>
    </div>
  )
}

// ── Enrichment ────────────────────────────────────────────────────────────────

const ENRICHMENT_APP_LABEL: Record<EnrichmentApp, string> = {
  virustotal:     "VirusTotal",
  abuseipdb:      "AbuseIPDB",
  threatfox:      "ThreatFox",
  shodan:         "Shodan",
  hybridanalysis: "Hybrid Analysis",
  mandiant:       "Mandiant",
  urlscan:        "urlscan.io",
}

const ENRICHMENT_STATUS_TONE: Record<EnrichmentStatus, Tone> = {
  malicious:  "alert",
  suspicious: "warn",
  clean:      "ok",
  pending:    "muted",
}

function EnrichmentResult({ result }: { result: Extract<AgentResult, { kind: "enrichment" }> }) {
  return (
    <div className="divide-y">
      {result.sources.map((s) => {
        const tone = ENRICHMENT_STATUS_TONE[s.status]
        const t = TONE[tone]
        return (
          <div key={s.app} className="flex items-start gap-3 px-5 py-3">
            <div className={cn("grid size-8 shrink-0 place-items-center rounded-lg border", t.iconBox)}>
              <Globe className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold leading-tight">{ENRICHMENT_APP_LABEL[s.app]}</span>
                <TonePill tone={tone}>{s.status}</TonePill>
                <span className="ml-auto font-mono text-[10px] text-muted-foreground/60">{s.ranAt}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.summary}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Analysis ──────────────────────────────────────────────────────────────────

function AnalysisResult({ result }: { result: Extract<AgentResult, { kind: "analysis" }> }) {
  return (
    <div className="space-y-4 px-5 py-4">
      {/* Reading stats */}
      <div>
        <SectionLabel>Reading</SectionLabel>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <ReadingTile icon={Tag}     label="IOCs"      value={result.reading.iocs} />
          <ReadingTile icon={Layers}  label="Artifacts" value={result.reading.artifacts} />
          <ReadingTile icon={Bell}    label="Alerts"    value={result.reading.alerts} />
        </div>
      </div>

      {/* Patterns detected */}
      <div>
        <SectionLabel count={result.patterns.length}>Patterns Detected</SectionLabel>
        <ul className="mt-2 space-y-1.5">
          {result.patterns.map((p, i) => (
            <li key={i} className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-1.5">
              <Sparkles className="size-3.5 shrink-0 text-primary" />
              <span className="text-sm leading-snug">{p}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Narrative */}
      <div>
        <SectionLabel>Narrative</SectionLabel>
        <p className="mt-2 rounded-lg border border-primary/15 bg-primary/3 px-3 py-2.5 text-sm leading-relaxed text-foreground/85">
          {result.narrative}
        </p>
      </div>

      {/* Confidence */}
      <div>
        <SectionLabel>Confidence</SectionLabel>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/40">
            <div
              className="h-full rounded-full bg-linear-to-r from-primary to-chart-3 transition-all duration-700 ease-out"
              style={{ width: `${result.confidencePct}%` }}
            />
          </div>
          <span className="font-mono text-sm font-semibold tabular-nums">{result.confidencePct}%</span>
        </div>
      </div>
    </div>
  )
}

function ReadingTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
      <div className="flex items-center gap-1.5">
        <Icon className="size-3 shrink-0 text-muted-foreground/70" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">{label}</span>
      </div>
      <div className="mt-1 font-medium text-xl tabular-nums leading-none">{value}</div>
    </div>
  )
}

// ── Actions ───────────────────────────────────────────────────────────────────

const ACTION_KIND_META: Record<ActionKind, { tone: Tone; icon: LucideIcon; label: string }> = {
  isolate: { tone: "alert", icon: ShieldAlert, label: "Isolate" },
  block:   { tone: "alert", icon: Ban,         label: "Block" },
  rotate:  { tone: "warn",  icon: KeyRound,    label: "Rotate" },
  notify:  { tone: "info",  icon: Bell,        label: "Notify" },
  patch:   { tone: "info",  icon: Wrench,      label: "Patch" },
}

function ActionsResult({ result }: { result: Extract<AgentResult, { kind: "actions" }> }) {
  return (
    <div className="divide-y">
      {result.items.map((a, i) => {
        const m = ACTION_KIND_META[a.kind]
        const t = TONE[m.tone]
        const ActionIcon = m.icon
        return (
          <div key={i} className="flex items-start gap-3 px-5 py-3.5">
            <div className={cn("grid size-9 shrink-0 place-items-center rounded-lg border", t.iconBox)}>
              <ActionIcon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">#{i + 1}</span>
                <span className="text-sm font-semibold leading-tight">{a.label}</span>
                <TonePill tone={m.tone}>{m.label}</TonePill>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Target className="size-3 shrink-0 opacity-60" />
                <span className="min-w-0 truncate">{a.target}</span>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-1.5">
              <Button size="sm" className="h-7 gap-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-wider">
                <Zap className="size-3" />
                Run
              </Button>
              <button className="inline-flex items-center gap-1 rounded border border-border/60 bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:border-primary/30 hover:text-primary">
                <Plus className="size-2.5" />
                Task
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Playbooks ─────────────────────────────────────────────────────────────────

function PlaybookResult({ result }: { result: Extract<AgentResult, { kind: "playbooks" }> }) {
  return (
    <div className="divide-y">
      {result.matches.map((m, i) => {
        const tone: Tone = m.fitPct >= 75 ? "info" : m.fitPct >= 50 ? "warn" : "muted"
        const t = TONE[tone]
        return (
          <div key={i} className="px-5 py-3">
            <div className="flex items-center gap-3">
              <div className={cn("grid size-8 shrink-0 place-items-center rounded-lg border", t.iconBox)}>
                <BookOpen className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold leading-tight">{m.name}</span>
                  {m.tag && <TonePill tone="info">{m.tag}</TonePill>}
                </div>
              </div>
              <span className="shrink-0 font-mono text-xs font-semibold tabular-nums">{m.fitPct}%</span>
              <button className="inline-flex shrink-0 items-center gap-1 rounded border border-border/60 bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:border-primary/30 hover:text-primary">
                Open
                <ChevronRight className="size-3" />
              </button>
            </div>
            <div className="ml-11 mt-2 h-1 overflow-hidden rounded-full bg-muted/40">
              <div
                className={cn("h-full rounded-full transition-all duration-700 ease-out", t.bar)}
                style={{ width: `${m.fitPct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Assignment ────────────────────────────────────────────────────────────────

function AssignmentResult({ result }: { result: Extract<AgentResult, { kind: "assignment" }> }) {
  if (!result.analyst) {
    return (
      <div className="px-5 py-5">
        <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
            <div>
              <div className="text-sm font-semibold text-amber-600 dark:text-amber-400">No analyst assigned</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{result.reason}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  const a = result.analyst
  return (
    <div className="space-y-4 px-5 py-4">
      <div className="flex items-center gap-3.5 rounded-lg border border-primary/15 bg-primary/3 px-4 py-3">
        <Avatar className="size-12 ring-2 ring-background">
          {a.photo && <AvatarImage src={a.photo} alt={a.name} />}
          <AvatarFallback className={cn("bg-linear-to-br text-sm font-bold text-white", a.gradient)}>
            {a.initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold leading-tight">{a.name}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{a.role}</div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <TonePill tone="info">{a.specialty}</TonePill>
            <span className="text-[10px] text-muted-foreground/70">{a.load}</span>
          </div>
        </div>
        <Button size="sm" variant="outline" className="h-7 gap-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-wider">
          <UserCheck className="size-3" />
          Reassign
        </Button>
      </div>
      <div>
        <SectionLabel>Reasoning</SectionLabel>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{result.reason}</p>
      </div>
    </div>
  )
}

// ── Remediation ───────────────────────────────────────────────────────────────

const REM_STATUS_META: Record<RemStatus, { tone: Tone; icon: LucideIcon; label: string }> = {
  done:          { tone: "info",  icon: CheckCircle2, label: "Done" },
  "in-progress": { tone: "warn",  icon: Loader2,      label: "In progress" },
  queued:        { tone: "muted", icon: Clock,        label: "Queued" },
}

function RemediationResult({ result }: { result: Extract<AgentResult, { kind: "remediation" }> }) {
  return (
    <div className="space-y-3 px-5 py-4">
      <div className="flex items-center justify-between">
        <SectionLabel count={result.steps.length}>Remediation Plan</SectionLabel>
        <span className="font-mono text-[10px] text-muted-foreground/60">est. {result.totalEta}</span>
      </div>

      <div className="relative">
        <div className="absolute bottom-2 left-3 top-2 w-px bg-border/60" />
        <ol className="space-y-2.5">
          {result.steps.map((s, i) => {
            const m = REM_STATUS_META[s.status]
            const t = TONE[m.tone]
            const StepIcon = m.icon
            const isRunning = s.status === "in-progress"
            return (
              <li key={i} className="relative flex items-start gap-3">
                <div className={cn("relative z-10 grid size-6 shrink-0 place-items-center rounded-full border-2 border-card", t.iconBox)}>
                  {isRunning ? <StepIcon className="size-3 animate-spin" /> : <StepIcon className="size-3" />}
                </div>
                <div className={cn("min-w-0 flex-1 rounded-lg border px-3 py-1.5",
                  s.status === "done" ? "border-primary/15 bg-primary/3" :
                  isRunning ? "border-amber-500/20 bg-amber-500/5" :
                  "border-border/60 bg-muted/20",
                )}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">Step {i + 1}</span>
                    <span className="text-sm font-medium leading-tight">{s.label}</span>
                    <span className="ml-auto font-mono text-[10px] text-muted-foreground/70">{s.eta}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={cn("size-1.5 rounded-full", t.dot, isRunning && "animate-pulse")} />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{m.label}</span>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

// ── Empty states (queued / skipped / failed) ─────────────────────────────────

function EmptyResult({ kind, reason }: { kind: "queued" | "skipped" | "failed"; reason: string }) {
  const meta = {
    queued:  { tone: "muted" as Tone, Icon: Clock,       title: "Agent is queued" },
    skipped: { tone: "muted" as Tone, Icon: MinusCircle, title: "Agent was skipped" },
    failed:  { tone: "alert" as Tone, Icon: XCircle,     title: "Agent failed" },
  }[kind]
  const t = TONE[meta.tone]
  return (
    <div className="px-5 py-6">
      <div className={cn("flex items-start gap-3 rounded-lg border px-4 py-3", t.chip)}>
        <div className={cn("grid size-9 shrink-0 place-items-center rounded-lg border bg-card", t.iconBox)}>
          <meta.Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className={cn("text-sm font-semibold", t.text)}>{meta.title}</div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{reason}</p>
        </div>
      </div>
    </div>
  )
}
