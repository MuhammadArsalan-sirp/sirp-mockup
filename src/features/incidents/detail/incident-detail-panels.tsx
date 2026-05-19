import { useState, type ReactNode, type ElementType } from "react"
import { Link } from "react-router"
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  Cloud,
  FileText,
  Layers,
  Map,
  Monitor,
  Network,
  PanelRightOpen,
  Plus,
  ScrollText,
  Send,
  Server,
  Shield,
  ShieldCheck,
  Sparkles,
  Timer,
  Trash2,
  Wrench,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { Incident } from "@/data/incidents"
import type {
  AgentRun,
  ArtifactRow,
  CommentRow,
  EntityRow,
  LinkedAlertRow,
  LogRow,
  MitreStructured,
  OmniSenseBlock,
  RelatedIncidentRow,
  S3BreakdownRow,
  TaskRow,
  TimelineRow,
} from "./incident-detail-mock"
import type { DetailTab } from "./incident-detail-tabs"
import { ArtifactsPanel } from "./incident-artifacts-panel"
import { IncidentOmniSenseRunner } from "./incident-omnisense-runner"
import { IncidentOverviewTab } from "./incident-overview-tab"

export type IncidentPanelData = {
  incident: Incident
  omni: OmniSenseBlock | null
  artifacts: ArtifactRow[]
  entities: EntityRow[]
  alerts: LinkedAlertRow[]
  tasks: TaskRow[]
  comments: CommentRow[]
  remediation: string
  auditLogs: LogRow[]
  playbookLogs: LogRow[]
  slaLogs: LogRow[]
  related: RelatedIncidentRow[]
  affectedProducts: { product: string; vendor: string }[]
  s3Breakdown: S3BreakdownRow[]
  mitreStructured: MitreStructured
  timeline: TimelineRow[]
  agentRuns: AgentRun[]
}

type Props = {
  tab: DetailTab
  data: IncidentPanelData
  onOpenWorkbench: () => void
  onOpenOmniSenseTab: () => void
}

export function IncidentDetailPanels({ tab, data, onOpenWorkbench, onOpenOmniSenseTab }: Props) {
  const {
    incident, omni, artifacts, entities, alerts, tasks, comments,
    remediation, auditLogs, playbookLogs, slaLogs, related,
    affectedProducts, s3Breakdown, mitreStructured, timeline, agentRuns,
  } = data

  switch (tab) {
    case "overview":
      if (!omni) return null
      return (
        <IncidentOverviewTab
          incident={incident}
          omni={omni}
          s3Breakdown={s3Breakdown}
          mitre={mitreStructured}
          timeline={timeline}
          agentRuns={agentRuns}
          tasks={tasks}
          comments={comments}
          entities={entities}
          alerts={alerts}
          onOpenOmniSenseTab={onOpenOmniSenseTab}
        />
      )

    case "omnisense":
      return <IncidentOmniSenseRunner incident={incident} />

    case "artifacts":
      return <ArtifactsPanel artifacts={artifacts} />

    case "entities":
      return <EntitiesPanel entities={entities} />

    case "remediation":
      return <RemediationPanel remediation={remediation} />

    case "comments":
      return <CommentsPanel comments={comments} incident={incident} />

    case "tasks":
      return <TasksPanel tasks={tasks} />

    case "omnimap":
      return (
        <DataCard
          title="OmniMap"
          description="Entity relationships and blast radius."
          icon={Map}
          action={
            <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs" onClick={onOpenWorkbench}>
              <PanelRightOpen className="size-3.5" />
              Workbench
            </Button>
          }
        >
          <div className="flex aspect-[2/1] max-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-primary/25 bg-gradient-to-b from-primary/5 to-transparent text-center">
            <div className="mb-3 grid size-14 place-items-center rounded-2xl border bg-card/80 shadow-sm">
              <Map className="size-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-semibold text-foreground/70">Graph canvas</p>
            <p className="mt-1 max-w-xs px-4 text-xs text-muted-foreground">
              OmniGraph renders entity relationships here in production. Use the workbench for full-screen analysis.
            </p>
          </div>
        </DataCard>
      )

    case "alerts":
      return <AlertsPanel alerts={alerts} />

    case "logs":
      return (
        <LogsPanel
          auditLogs={auditLogs}
          playbookLogs={playbookLogs}
          slaLogs={slaLogs}
          incident={incident}
        />
      )

    case "related":
      return <RelatedPanel related={related} />

    case "affected-products":
      return <AffectedProductsPanel products={affectedProducts} />

    default:
      return null
  }
}

/* ══════════════════════════════════════════════════════════════════════════════
   ARTIFACTS — see incident-artifacts-panel.tsx
══════════════════════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════════════════════
   ENTITIES
══════════════════════════════════════════════════════════════════════════════ */

const ENTITY_TYPE_ICON: Record<string, ElementType> = {
  "Host": Monitor,
  "Domain controller": Server,
  "Server": Server,
  "SaaS": Cloud,
}

const RISK_CONFIG = {
  critical: { label: "Critical", cls: "text-destructive",    bg: "bg-destructive/10 border-destructive/25",  stripe: "bg-destructive" },
  high:     { label: "High",     cls: "text-amber-500",      bg: "bg-amber-500/10 border-amber-500/25",      stripe: "bg-amber-500" },
  medium:   { label: "Medium",   cls: "text-blue-500",       bg: "bg-blue-500/10 border-blue-500/25",        stripe: "bg-blue-500" },
  low:      { label: "Low",      cls: "text-muted-foreground", bg: "bg-muted/60 border-border",              stripe: "bg-muted-foreground/30" },
}

function S3ScoreBadge({ score }: { score: number }) {
  const cls =
    score > 66
      ? "border-destructive text-destructive"
      : score > 33
      ? "border-amber-500 text-amber-600"
      : "border-emerald-500 text-emerald-600"
  return (
    <div className={cn(
      "grid size-9 place-items-center rounded-full border-2 font-mono text-xs font-bold tabular-nums",
      cls
    )}>
      {score}
    </div>
  )
}

function EntitiesPanel({ entities }: { entities: EntityRow[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-2">
          <Layers className="size-3.5 shrink-0 text-muted-foreground/60" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Affected Entities</span>
          <span className="font-mono text-xs tabular-nums text-muted-foreground/70">{entities.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
            <Plus className="size-3" />
            Create entity
          </Button>
          <Button size="sm" variant="default" className="h-7 gap-1.5 text-xs">
            <Plus className="size-3" />
            Add affected entity
          </Button>
        </div>
      </div>
      <CardContent className="border-t p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent [&>th]:h-10 [&>th]:bg-muted/40 [&>th]:text-[11px] [&>th]:font-semibold [&>th]:uppercase [&>th]:tracking-wide">
                <TableHead className="w-[220px] pl-5">Name</TableHead>
                <TableHead className="w-[140px]">Entity Type</TableHead>
                <TableHead className="w-[120px]">Criticality</TableHead>
                <TableHead className="w-[110px]">Owner</TableHead>
                <TableHead className="w-[120px]">Relationships</TableHead>
                <TableHead className="w-[90px] text-center">S3 Score</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {entities.map((e) => {
                const risk = RISK_CONFIG[e.risk] ?? RISK_CONFIG.low
                const TypeIcon = ENTITY_TYPE_ICON[e.type] ?? Server
                const initials = e.owner
                  ? e.owner.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                  : null
                return (
                  <TableRow key={e.id} className="group border-border/50 hover:bg-muted/20">
                    {/* Name */}
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-2.5">
                        <div className="grid size-7 shrink-0 place-items-center rounded-lg border bg-muted/40">
                          <TypeIcon className="size-3.5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{e.name}</p>
                          {e.ip && (
                            <p className="font-mono text-[10px] text-muted-foreground">{e.ip}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Entity Type */}
                    <TableCell className="text-xs text-muted-foreground">{e.type}</TableCell>

                    {/* Criticality */}
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        risk.bg, risk.cls
                      )}>
                        <span className={cn("size-1.5 rounded-full", risk.stripe)} />
                        {risk.label}
                      </span>
                    </TableCell>

                    {/* Owner */}
                    <TableCell>
                      {initials ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex cursor-default items-center gap-2">
                              <Avatar className="size-6">
                                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-blue-500 text-[10px] font-bold text-white">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">{e.owner!.split(" ")[0]}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>{e.owner}</TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">—</span>
                      )}
                    </TableCell>

                    {/* Relationships */}
                    <TableCell>
                      {e.relationships !== undefined ? (
                        <button className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary">
                          <Network className="size-3" />
                          {String(e.relationships).padStart(2, "0")}
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">—</span>
                      )}
                    </TableCell>

                    {/* S3 Score */}
                    <TableCell className="text-center">
                      {e.s3Score !== undefined ? (
                        <div className="flex justify-center">
                          <S3ScoreBadge score={e.s3Score} />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">—</span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="pr-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 text-muted-foreground/40 opacity-0 transition-all hover:text-destructive group-hover:opacity-100"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   REMEDIATION
══════════════════════════════════════════════════════════════════════════════ */

function RemediationPanel({ remediation }: { remediation: string }) {
  return (
    <div className="space-y-4">
      <SectionCard icon={ShieldCheck} title="Implemented Remediation">
        <p className="text-sm leading-relaxed text-foreground/80">{remediation}</p>
      </SectionCard>

      <SectionCard icon={Wrench} title="Containment Details">
        <dl className="space-y-3">
          {[
            { label: "Containment status", value: "In progress" },
            { label: "Contained by", value: "Network isolation · L4 firewall rule" },
            { label: "Lesson learned", value: "Privileged accounts on jump hosts should require MFA for all lateral paths. Review policy IR-12." },
          ].map(({ label, value }) => (
            <div key={label} className="grid grid-cols-[180px_1fr] gap-3 border-b border-border/40 pb-3 last:border-0 last:pb-0">
              <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground/70 pt-0.5">
                {label}
              </dt>
              <dd className="text-sm text-foreground/85">{value}</dd>
            </div>
          ))}
        </dl>
      </SectionCard>

      <SectionCard icon={FileText} title="Remediation Details">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Eradication steps in progress. Coordinate with infrastructure owners before issuing permanent firewall changes. All containment actions require SOC lead approval per policy.
        </p>
      </SectionCard>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   COMMENTS
══════════════════════════════════════════════════════════════════════════════ */

function CommentsPanel({ comments, incident }: { comments: CommentRow[]; incident: Incident }) {
  const [note, setNote] = useState("")

  return (
    <DataCard
      title="Comments"
      description="Collaboration thread for this ticket."
      icon={ScrollText}
      count={comments.length}
    >
      <div className="space-y-3">
        {comments.map((c) => (
          <div
            key={c.id}
            className={cn(
              "relative overflow-hidden rounded-xl border p-4",
              c.isSystem
                ? "border-primary/20 bg-primary/[0.04]"
                : "bg-card shadow-sm"
            )}
          >
            {c.isSystem && (
              <div className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-primary to-chart-3" />
            )}
            <div className={cn("flex items-start gap-3", c.isSystem && "pl-1")}>
              <Avatar className="size-8 shrink-0">
                {!c.isSystem && c.photo && <AvatarImage src={c.photo} alt={c.author} />}
                <AvatarFallback
                  className={cn(
                    "text-[10px] font-bold text-white",
                    c.isSystem
                      ? "bg-linear-to-br from-primary to-chart-3"
                      : cn("bg-linear-to-br", c.gradient)
                  )}
                >
                  {c.isSystem ? <Sparkles className="size-3.5" /> : c.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{c.author}</span>
                  {c.role && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "rounded-full text-[10px]",
                        c.isSystem && "bg-primary/10 text-primary hover:bg-primary/10"
                      )}
                    >
                      {c.role}
                    </Badge>
                  )}
                  <span className="ml-auto text-[11px] tabular-nums text-muted-foreground">
                    {c.when}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Composer */}
      <div className="mt-4">
        <Separator className="mb-4" />
        <div className="flex items-center gap-3">
          {incident.assignee && (
            <Avatar className="size-7 shrink-0">
              <AvatarImage src={incident.assignee.photo} alt={incident.assignee.name} />
              <AvatarFallback className={cn("bg-linear-to-br text-[10px] font-bold text-white", incident.assignee.gradient)}>
                {incident.assignee.initials}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex flex-1 items-center gap-2 rounded-xl border bg-muted/20 px-3 py-2 transition-all focus-within:border-primary/40 focus-within:bg-card focus-within:ring-1 focus-within:ring-primary/20">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              onKeyDown={(e) => { if (e.key === "Enter" && note.trim()) setNote("") }}
            />
            <Button
              size="icon"
              variant={note.trim() ? "default" : "ghost"}
              className="size-6 shrink-0"
              disabled={!note.trim()}
              onClick={() => setNote("")}
            >
              <Send className="size-3" />
            </Button>
          </div>
        </div>
      </div>
    </DataCard>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   TASKS
══════════════════════════════════════════════════════════════════════════════ */

const PRIORITY_CFG = {
  high:   { cls: "text-destructive",  bg: "bg-destructive/10 border-destructive/20"   },
  medium: { cls: "text-amber-500",    bg: "bg-amber-500/10 border-amber-400/20"       },
  low:    { cls: "text-muted-foreground", bg: "bg-muted/60 border-border"             },
}

function TasksPanel({ tasks }: { tasks: TaskRow[] }) {
  const open = tasks.filter((t) => !t.done)
  const done = tasks.filter((t) => t.done)

  return (
    <DataCard
      title="Tasks"
      description="Checklist and ownership for this incident."
      icon={CheckCircle2}
      action={
        <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
          <Plus className="size-3" />
          New task
        </Button>
      }
      headerExtra={
        <div className="flex items-center gap-1.5">
          {open.length > 0 && (
            <Badge variant="secondary" className="rounded-full bg-amber-500/10 text-amber-600 hover:bg-amber-500/10 text-xs">
              {open.length} open
            </Badge>
          )}
          {done.length > 0 && (
            <Badge variant="secondary" className="rounded-full text-xs">
              {done.length} done
            </Badge>
          )}
        </div>
      }
    >
      {open.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60">
            Open · {open.length}
          </p>
          <div className="space-y-2">
            {open.map((t) => <TaskRow key={t.id} task={t} />)}
          </div>
        </div>
      )}

      {open.length > 0 && done.length > 0 && <Separator className="my-4" />}

      {done.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60">
            Done · {done.length}
          </p>
          <div className="space-y-2">
            {done.map((t) => <TaskRow key={t.id} task={t} />)}
          </div>
        </div>
      )}
    </DataCard>
  )
}

function TaskRow({ task: t }: { task: TaskRow }) {
  const priority = t.priority ? PRIORITY_CFG[t.priority] : null
  return (
    <div className={cn(
      "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
      t.done ? "bg-muted/10 opacity-60" : "bg-card shadow-sm hover:border-primary/20"
    )}>
      {t.done
        ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
        : <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground/40" />
      }
      <div className="min-w-0 flex-1">
        <p className={cn("font-medium leading-snug", t.done && "line-through text-muted-foreground")}>
          {t.label}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {t.category && (
            <span className="rounded-md border bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {t.category}
            </span>
          )}
          {t.owner && (
            <span className="text-[11px] text-muted-foreground">@{t.owner.split(" ")[0]}</span>
          )}
          {t.dueDate && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="size-2.5" />{t.dueDate}
            </span>
          )}
        </div>
      </div>
      {priority && !t.done && (
        <span className={cn(
          "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
          priority.bg, priority.cls
        )}>
          {t.priority}
        </span>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   ALERTS
══════════════════════════════════════════════════════════════════════════════ */

const SEVERITY_STRIPE: Record<string, string> = {
  critical: "bg-destructive",
  high:     "bg-amber-500",
  medium:   "bg-blue-500",
  low:      "bg-muted-foreground/40",
  info:     "bg-muted-foreground/20",
}

const SEVERITY_BADGE: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  high:     "bg-amber-500/10 text-amber-600 border-amber-400/20",
  medium:   "bg-blue-500/10 text-blue-600 border-blue-400/20",
  low:      "bg-muted/60 text-muted-foreground border-border",
  info:     "bg-muted/60 text-muted-foreground border-border",
}

const ALERT_STATUS_CFG: Record<string, { label: string; cls: string }> = {
  "new":         { label: "New",         cls: "bg-primary/10 text-primary border-primary/20" },
  "in-progress": { label: "In Progress", cls: "bg-amber-500/10 text-amber-600 border-amber-400/20" },
  "closed":      { label: "Closed",      cls: "bg-muted/60 text-muted-foreground border-border" },
}

function AlertsPanel({ alerts }: { alerts: LinkedAlertRow[] }) {
  return (
    <DataCard
      title="Linked Alerts"
      description="Correlated detections and deduplicated signals."
      icon={AlertTriangle}
      count={alerts.length}
    >
      <div className="space-y-2">
        {alerts.map((a) => {
          const stripe = SEVERITY_STRIPE[a.severity] ?? SEVERITY_STRIPE.info
          const sevBadge = SEVERITY_BADGE[a.severity] ?? SEVERITY_BADGE.info
          const statusCfg = a.status ? ALERT_STATUS_CFG[a.status] : null
          return (
            <div key={a.id} className="relative overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
              <div className={cn("absolute inset-y-0 left-0 w-[3px]", stripe)} />
              <div className="px-4 py-3.5 pl-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{a.id}</span>
                  <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide capitalize", sevBadge)}>
                    {a.severity}
                  </span>
                  {statusCfg && (
                    <span className={cn("ml-auto rounded-full border px-2 py-0.5 text-[10px] font-semibold", statusCfg.cls)}>
                      {statusCfg.label}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm font-medium leading-snug">{a.title}</p>
                {(a.source || a.when) && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {[a.source, a.when].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </DataCard>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   AUDIT LOG
══════════════════════════════════════════════════════════════════════════════ */

const ACTOR_CFG: Record<string, { cls: string; bg: string }> = {
  system:     { cls: "text-muted-foreground",  bg: "bg-muted/60 border-border"              },
  OmniSense:  { cls: "text-primary",           bg: "bg-primary/10 border-primary/20"        },
}
const ACTOR_FALLBACK = { cls: "text-blue-500", bg: "bg-blue-500/10 border-blue-400/20" }

const LOG_LEVEL_DOT: Record<string, string> = {
  info:    "bg-muted-foreground/40",
  warn:    "bg-amber-500",
  error:   "bg-destructive",
  success: "bg-emerald-500",
}

type LogView = "audit" | "playbook" | "sla"

function LogsPanel({
  auditLogs, playbookLogs, slaLogs, incident,
}: {
  auditLogs: LogRow[]
  playbookLogs: LogRow[]
  slaLogs: LogRow[]
  incident: Incident
}) {
  const [view, setView] = useState<LogView>("audit")

  const views: { id: LogView; label: string; icon: ElementType; count: number }[] = [
    { id: "audit",    label: "Audit",    icon: ScrollText, count: auditLogs.length },
    { id: "playbook", label: "Playbook", icon: Activity,   count: playbookLogs.length },
    { id: "sla",      label: "SLA",      icon: Timer,      count: slaLogs.length },
  ]

  return (
    <div className="space-y-3">
      {/* Sub-nav */}
      <div className="flex items-center gap-0.5 rounded-lg border bg-muted/30 p-0.5 w-fit">
        {views.map((v) => {
          const active = view === v.id
          const Icon = v.icon
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setView(v.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-3.5" />
              {v.label} Logs
              <span className="ml-0.5 font-mono text-[10px] tabular-nums opacity-60">{v.count}</span>
            </button>
          )
        })}
      </div>

      {/* Active panel */}
      {view === "audit" && <AuditLogPanel rows={auditLogs} />}
      {view === "playbook" && <PlaybookLogsPanel rows={playbookLogs} />}
      {view === "sla" && <SlaLogsPanel rows={slaLogs} incident={incident} />}
    </div>
  )
}

function AuditLogPanel({ rows }: { rows: LogRow[] }) {
  return (
    <DataCard title="Incident Audit Log" icon={ScrollText} count={rows.length}>
      <div className="-mx-1 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60 hover:bg-transparent [&>th]:h-9 [&>th]:bg-muted/40 [&>th]:text-[11px] [&>th]:font-semibold [&>th]:uppercase [&>th]:tracking-wide">
              <TableHead className="w-[140px] pl-3">Time</TableHead>
              <TableHead className="w-[130px]">Actor</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const actorCfg = ACTOR_CFG[r.actor] ?? ACTOR_FALLBACK
              const levelDot = r.level ? LOG_LEVEL_DOT[r.level] : LOG_LEVEL_DOT.info
              return (
                <TableRow key={r.id} className="border-border/50 align-top">
                  <TableCell className="pl-3 font-mono text-[11px] text-muted-foreground tabular-nums">
                    <div className="flex items-center gap-2 pt-0.5">
                      <div className={cn("size-1.5 shrink-0 rounded-full", levelDot)} />
                      {r.at}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                      actorCfg.bg, actorCfg.cls
                    )}>
                      {r.actor}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-foreground/80">{r.message}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </DataCard>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   PLAYBOOK LOGS
══════════════════════════════════════════════════════════════════════════════ */

const PLAYBOOK_STATUS_CFG = {
  success: { icon: CheckCircle2, cls: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Success" },
  failed:  { icon: AlertTriangle, cls: "text-destructive", bg: "bg-destructive/10 border-destructive/20", label: "Failed" },
  pending: { icon: Timer,         cls: "text-amber-500",   bg: "bg-amber-500/10 border-amber-400/20",    label: "Pending" },
}

function PlaybookLogsPanel({ rows }: { rows: LogRow[] }) {
  return (
    <DataCard title="Playbook Runs" icon={Activity} count={rows.length}>
      <div className="space-y-3">
        {rows.map((r) => {
          const cfg = r.status ? PLAYBOOK_STATUS_CFG[r.status] : PLAYBOOK_STATUS_CFG.pending
          const StatusIcon = cfg.icon
          return (
            <div key={r.id} className="flex items-start gap-3 rounded-xl border bg-card px-4 py-3.5 shadow-sm">
              <div className={cn("mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border", cfg.bg)}>
                <StatusIcon className={cn("size-3.5", cfg.cls)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{r.actor}</span>
                  <span className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    cfg.bg, cfg.cls
                  )}>
                    {cfg.label}
                  </span>
                  {r.duration && (
                    <span className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="size-2.5" />{r.duration}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{r.message}</p>
                <p className="mt-1.5 font-mono text-[11px] text-muted-foreground/60 tabular-nums">{r.at}</p>
              </div>
            </div>
          )
        })}
      </div>
    </DataCard>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   SLA LOGS
══════════════════════════════════════════════════════════════════════════════ */

const SLA_LEVEL_CFG = {
  info:    { dot: "bg-muted-foreground/50 ring-muted-foreground/20",  chip: "bg-muted/60 text-muted-foreground border-border" },
  success: { dot: "bg-emerald-500 ring-emerald-500/25",               chip: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  warn:    { dot: "bg-amber-500 ring-amber-500/25",                   chip: "bg-amber-500/10 text-amber-600 border-amber-400/20" },
  error:   { dot: "bg-destructive ring-destructive/25",               chip: "bg-destructive/10 text-destructive border-destructive/20" },
}

function SlaLogsPanel({ rows, incident }: { rows: LogRow[]; incident: Incident }) {
  return (
    <DataCard
      title="SLA Transitions"
      icon={Timer}
      count={rows.length}
      headerExtra={
        <div className={cn(
          "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
          incident.sla.tone === "breach" ? "bg-destructive/10 text-destructive border-destructive/20" :
          incident.sla.tone === "warn"   ? "bg-amber-500/10 text-amber-600 border-amber-400/20" :
          "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
        )}>
          <Timer className="size-3" />
          {incident.sla.label}
        </div>
      }
    >
      <div className="relative pl-6">
        <div className="absolute bottom-0 left-[7px] top-0 w-px bg-border/50" />
        <div className="space-y-5">
          {rows.map((r) => {
            const cfg = SLA_LEVEL_CFG[r.level ?? "info"] ?? SLA_LEVEL_CFG.info
            return (
              <div key={r.id} className="relative flex gap-3">
                <div className={cn(
                  "absolute -left-6 mt-1 size-3 rounded-full ring-[3px]",
                  cfg.dot
                )} />
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                      cfg.chip
                    )}>
                      {r.actor}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{r.at}</span>
                  </div>
                  <p className="mt-1 text-sm text-foreground/80">{r.message}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DataCard>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   RELATED INCIDENTS
══════════════════════════════════════════════════════════════════════════════ */

function RelatedPanel({ related }: { related: RelatedIncidentRow[] }) {
  if (related.length === 0) {
    return (
      <DataCard title="Related Incidents" icon={Layers}>
        <EmptyState icon={Layers} message="No related incidents found." />
      </DataCard>
    )
  }
  return (
    <DataCard
      title="Related Incidents"
      description="Same customer, shared IOCs, or campaign links."
      icon={Layers}
      count={related.length}
    >
      <div className="space-y-2">
        {related.map((r) => {
          const stripe = SEVERITY_STRIPE[r.severity] ?? SEVERITY_STRIPE.info
          const sevBadge = SEVERITY_BADGE[r.severity] ?? SEVERITY_BADGE.info
          return (
            <Link
              key={r.id}
              to={`/incidents/${r.id}`}
              className="relative block overflow-hidden rounded-xl border bg-card px-4 py-3.5 pl-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className={cn("absolute inset-y-0 left-0 w-[3px]", stripe)} />
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">{r.id}</span>
                <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide capitalize", sevBadge)}>
                  {r.severity}
                </span>
                <span className="ml-auto text-[11px] text-muted-foreground">{r.updated}</span>
              </div>
              <p className="mt-1.5 text-sm font-medium leading-snug text-foreground/85">{r.title}</p>
            </Link>
          )
        })}
      </div>
    </DataCard>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   AFFECTED PRODUCTS
══════════════════════════════════════════════════════════════════════════════ */

function AffectedProductsPanel({ products }: { products: { product: string; vendor: string }[] }) {
  return (
    <DataCard
      title="Affected Products"
      description="Vendors and products implicated in this incident."
      icon={Shield}
      count={products.length}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((ap) => (
          <div
            key={ap.product}
            className="flex flex-col gap-1.5 rounded-xl border bg-card px-4 py-3.5 shadow-sm"
          >
            <div className="grid size-8 place-items-center rounded-lg border bg-muted/40">
              <Shield className="size-4 text-muted-foreground/60" />
            </div>
            <p className="mt-1 text-sm font-semibold leading-snug">{ap.product}</p>
            <p className="text-xs text-muted-foreground">{ap.vendor}</p>
          </div>
        ))}
      </div>
    </DataCard>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   SHARED PRIMITIVES
══════════════════════════════════════════════════════════════════════════════ */

function DataCard({
  title, description, children, action, icon: Icon, count, headerExtra,
}: {
  title: string
  description?: string
  children: ReactNode
  action?: ReactNode
  icon?: ElementType
  count?: number
  headerExtra?: ReactNode
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="px-5 py-4">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {Icon && <Icon className="size-3.5 shrink-0 text-muted-foreground/60" />}
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{title}</span>
            {count !== undefined && (
              <span className="font-mono text-xs tabular-nums text-muted-foreground/70">{count}</span>
            )}
            {headerExtra}
          </div>
          {action}
        </div>
        {description && <p className="mb-3 text-sm text-muted-foreground">{description}</p>}
        {children}
      </CardContent>
    </Card>
  )
}

function SectionCard({ icon: Icon, title, children }: { icon: ElementType; title: string; children: ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="px-5 py-4">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="grid size-7 place-items-center rounded-lg border bg-muted text-muted-foreground">
            <Icon className="size-3.5" />
          </div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{title}</span>
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

function EmptyState({ icon: Icon, message }: { icon: ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="mb-3 size-10 text-muted-foreground/25" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
