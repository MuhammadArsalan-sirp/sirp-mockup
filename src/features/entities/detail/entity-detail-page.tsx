import { useMemo, useState } from "react"
import { useParams, Link } from "react-router"
import type { LucideIcon } from "lucide-react"
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bell,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Cpu,
  Database,
  ExternalLink,
  FileText,
  HelpCircle,
  Layers,
  Monitor,
  MoreHorizontal,
  Network,
  Pencil,
  Pin,
  Power,
  Server,
  Shield,
  ShieldAlert,
  Sparkles,
  Tag,
  Trash2,
  User,
  UserCheck,
  Wifi,
  Zap,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { entities, type Entity, type EntityCriticality, type EntityStatus, type EntityType } from "@/data/entities"

/* ── Tone tokens ──────────────────────────────────────────────────────────── */

type Tone = "alert" | "warn" | "ok" | "info" | "muted"

const TONE: Record<Tone, { iconBox: string; chip: string; bg: string; text: string; dot: string; bar: string }> = {
  alert: { iconBox: "border-destructive/30 bg-destructive/10 text-destructive",                       chip: "border-destructive/25 bg-destructive/10 text-destructive",                       bg: "bg-destructive/5",  text: "text-destructive",                       dot: "bg-destructive",         bar: "bg-destructive" },
  warn:  { iconBox: "border-amber-500/30 bg-amber-500/10 text-amber-500",                             chip: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",         bg: "bg-amber-500/5",     text: "text-amber-600 dark:text-amber-400",     dot: "bg-amber-500",           bar: "bg-amber-500" },
  ok:    { iconBox: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",                       chip: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/5",   text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500",         bar: "bg-emerald-500" },
  info:  { iconBox: "border-primary/30 bg-primary/10 text-primary",                                   chip: "border-primary/25 bg-primary/10 text-primary",                                   bg: "bg-primary/5",       text: "text-primary",                           dot: "bg-primary",             bar: "bg-primary" },
  muted: { iconBox: "border bg-muted text-muted-foreground",                                          chip: "border bg-muted text-muted-foreground",                                          bg: "bg-muted/40",        text: "text-foreground",                        dot: "bg-muted-foreground/50", bar: "bg-muted-foreground/40" },
}

/* ── Criticality + status meta ────────────────────────────────────────────── */

const CRIT_TONE: Record<EntityCriticality, Tone> = {
  critical: "alert", high: "warn", medium: "info", low: "muted",
}

const CRIT_HEX: Record<EntityCriticality, string> = {
  critical: "var(--destructive)",
  high:     "var(--color-amber-500, oklch(0.79 0.16 75))",
  medium:   "var(--primary)",
  low:      "var(--muted-foreground)",
}

const CRIT_LABEL: Record<EntityCriticality, string> = {
  critical: "Critical", high: "High", medium: "Medium", low: "Low",
}

const CRIT_DETAIL: Record<EntityCriticality, (e: Entity) => string> = {
  critical: (e) => `${e.type} carries critical business impact. Compromise would directly affect production. Owner alerting on changes is mandatory.`,
  high:     (e) => `${e.type} with significant exposure. Treat changes and access events with elevated scrutiny.`,
  medium:   () => "Standard monitoring applies. Track changes and access events; escalate on anomalies.",
  low:      () => "Tracked for context only. No elevated monitoring required.",
}

const CRIT_ICON: Record<EntityCriticality, LucideIcon> = {
  critical: ShieldAlert, high: AlertTriangle, medium: Shield, low: HelpCircle,
}

const STATUS_TONE: Record<EntityStatus, Tone> = {
  active: "ok", inactive: "muted", decommissioned: "muted", unknown: "warn",
}

const STATUS_LABEL: Record<EntityStatus, string> = {
  active: "Active", inactive: "Inactive", decommissioned: "Decommissioned", unknown: "Unknown",
}

const TYPE_ICON: Record<EntityType, LucideIcon> = {
  "Application":    BookOpen,
  "Host":           Monitor,
  "User":           User,
  "Service":        Server,
  "Database":       Database,
  "Network Device": Wifi,
  "Cloud Resource": Cloud,
}

/* ── Tabs ─────────────────────────────────────────────────────────────────── */

type TabId = "overview" | "blast" | "incidents" | "threat-intel" | "relationships" | "activity"

const TABS: { id: TabId; label: string; icon: LucideIcon; ck?: string }[] = [
  { id: "overview",      label: "Overview",       icon: Pin },
  { id: "blast",         label: "Blast radius",   icon: Network,    ck: "blast" },
  { id: "incidents",     label: "Incidents",      icon: BookOpen,   ck: "incidents" },
  { id: "threat-intel",  label: "Threat intel",   icon: Shield,     ck: "ti" },
  { id: "relationships", label: "Relationships",  icon: Building2,  ck: "rel" },
  { id: "activity",      label: "Activity",       icon: Activity },
]

/* ── Page ────────────────────────────────────────────────────────────────── */

export function EntityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const entity = useMemo(() => entities.find((e) => e.id === id) ?? entities[0]!, [id])
  const [tab, setTab] = useState<TabId>("overview")

  const critTone   = CRIT_TONE[entity.criticality]
  const critHex    = CRIT_HEX[entity.criticality]
  const TypeIcon   = TYPE_ICON[entity.type] ?? Cpu

  const counts: Record<string, number> = {
    blast:     entity.relationships,
    incidents: entity.criticality === "critical" ? 3 : entity.criticality === "high" ? 2 : 1,
    ti:        entity.criticality === "critical" ? 2 : entity.criticality === "high" ? 1 : 0,
    rel:       entity.relationships,
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">

      {/* ════════ HEADER ════════════════════════════════════════════════════ */}
      <header className="shrink-0 border-b bg-card shadow-sm">
        <div className="h-[3px] w-full" style={{ background: `color-mix(in srgb, ${critHex} 55%, transparent)` }} />

        {/* Row 1 */}
        <div className="flex h-12 items-center gap-3 px-5">
          <Button variant="ghost" size="icon" className="size-7 shrink-0 text-muted-foreground" asChild>
            <Link to="/entities"><ArrowLeft className="size-4" /></Link>
          </Button>
          <Badge variant="outline" className="shrink-0 font-mono text-[10px]">{entity.id}</Badge>
          <span className="size-2 shrink-0 rounded-full" style={{ background: `color-mix(in srgb, ${critHex} 80%, transparent)` }} />
          <h1 className="min-w-0 flex-1 truncate text-sm font-semibold">{entity.name}</h1>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="shrink-0 cursor-default opacity-70 transition-opacity hover:opacity-100">
                <div className="grid size-5 place-items-center rounded border bg-muted text-muted-foreground">
                  <TypeIcon className="size-3" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">{entity.type}</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-5" />

          <div className="flex shrink-0 items-center gap-1.5">
            <Button size="sm" className="h-8 gap-1.5 text-xs"><Power className="size-3.5" />Quarantine</Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs"><UserCheck className="size-3.5" />Notify owner</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="size-8"><MoreHorizontal className="size-3.5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem><Pencil className="mr-2 size-3.5 text-muted-foreground" />Edit entity</DropdownMenuItem>
                <DropdownMenuItem><ExternalLink className="mr-2 size-3.5 text-muted-foreground" />Open CMDB record</DropdownMenuItem>
                <DropdownMenuItem><FileText className="mr-2 size-3.5 text-muted-foreground" />Download properties</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 size-3.5" />Decommission
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Row 2 — metadata strip */}
        <div className="flex h-11 shrink-0 items-center border-t">
          <div className="flex h-full shrink-0 items-center gap-2.5 border-r px-4">
            <CritChip criticality={entity.criticality} />
            <StatusChip status={entity.status} />

            {entity.owner && (
              <>
                <div className="h-3.5 w-px shrink-0 bg-border/60" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex cursor-default items-center gap-1.5">
                      <Avatar className="size-5 shrink-0">
                        {entity.owner.photo && <AvatarImage src={entity.owner.photo} alt={entity.owner.name} />}
                        <AvatarFallback className={cn("bg-linear-to-br text-[8px] font-bold text-white", entity.owner.gradient)}>
                          {entity.owner.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{entity.owner.name}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Owner</TooltipContent>
                </Tooltip>
              </>
            )}

            <div className="h-3.5 w-px shrink-0 bg-border/60" />

            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold tabular-nums",
                  entity.s3Score >= 80 ? "bg-destructive/10 text-destructive" :
                  entity.s3Score >= 50 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                  "bg-muted/60 text-muted-foreground",
                )}>
                  <Zap className="size-3 shrink-0" />S3&nbsp;{entity.s3Score}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">S3 score · Severity · Scope · Speed</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1 text-xs font-semibold text-muted-foreground">
                  <Network className="size-3 shrink-0" />
                  <span className="font-mono tabular-nums">{entity.relationships}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">Relationships</TooltipContent>
            </Tooltip>
          </div>

          {/* Right side: department + dates */}
          <div className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto px-5 text-xs text-muted-foreground">
            <div className="flex shrink-0 items-center gap-1.5">
              <Building2 className="size-3 shrink-0 opacity-60" />
              <span>{entity.department}</span>
            </div>
            <div className="h-3.5 w-px shrink-0 bg-border/60" />
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="text-muted-foreground/60">Created</span>
              <span>{entity.created}</span>
            </div>
            <div className="h-3.5 w-px shrink-0 bg-border/60" />
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="text-muted-foreground/60">Updated</span>
              <span>{entity.updated}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ════════ BODY: tab strip + scrolling content ════════════════════════ */}
      <div className="flex min-h-0 flex-1 flex-col">

        {/* Tab strip */}
        <div className="flex h-10 shrink-0 items-stretch overflow-hidden overflow-x-auto border-b bg-background">
          {TABS.map(({ id: tid, label, icon: Icon, ck }) => {
            const active = tab === tid
            const count  = ck ? counts[ck] : undefined
            return (
              <button
                key={tid}
                onClick={() => setTab(tid)}
                className={cn(
                  "relative flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3.5 text-xs font-medium transition-colors",
                  "after:absolute after:inset-x-2 after:bottom-0 after:h-[2px] after:rounded-t-full",
                  active ? "text-foreground after:bg-primary"
                         : "text-muted-foreground hover:bg-muted/30 hover:text-foreground after:bg-transparent",
                )}
              >
                <Icon className="size-3.5 shrink-0" />
                {label}
                {count !== undefined && count > 0 && (
                  <Badge variant="secondary" className={cn("px-1.5 text-[10px]", active && "bg-primary/15 text-primary")}>
                    {count}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>

        {/* Scrolling content */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-4 p-4 md:p-6 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
            {tab === "overview"      && <OverviewTab entity={entity} critTone={critTone} />}
            {tab === "blast"         && <BlastRadiusCard entity={entity} />}
            {tab === "incidents"     && <RelatedIncidentsCard entity={entity} />}
            {tab === "threat-intel"  && <RelatedThreatIntelCard entity={entity} />}
            {tab === "relationships" && <RelationshipsCard entity={entity} />}
            {tab === "activity"      && <ActivityCard entity={entity} />}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Compact chips for header ─────────────────────────────────────────────── */

function CritChip({ criticality }: { criticality: EntityCriticality }) {
  const t = TONE[CRIT_TONE[criticality]]
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider", t.chip)}>
      <span className={cn("size-1.5 rounded-full", t.dot)} />
      {CRIT_LABEL[criticality]}
    </span>
  )
}

function StatusChip({ status }: { status: EntityStatus }) {
  const t = TONE[STATUS_TONE[status]]
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs", t.chip)}>
      <span className={cn("size-1.5 rounded-full", t.dot)} />
      {STATUS_LABEL[status]}
    </span>
  )
}

/* ── Overview tab ─────────────────────────────────────────────────────────── */

function OverviewTab({ entity, critTone }: { entity: Entity; critTone: Tone }) {
  const ct        = TONE[critTone]
  const CritIcon  = CRIT_ICON[entity.criticality]
  const ownerInitials = entity.owner
    ? entity.owner.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : null

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Type",          value: entity.type },
    { label: "Department",    value: entity.department },
    { label: "Status",        value: STATUS_LABEL[entity.status] },
    { label: "Criticality",   value: CRIT_LABEL[entity.criticality] },
    { label: "Owner",         value: entity.owner
      ? (
          <span className="inline-flex items-center gap-1.5">
            <Avatar className="size-4">
              {entity.owner.photo && <AvatarImage src={entity.owner.photo} alt={entity.owner.name} />}
              <AvatarFallback className={cn("bg-linear-to-br text-[7px] font-bold text-white", entity.owner.gradient)}>
                {ownerInitials ?? "??"}
              </AvatarFallback>
            </Avatar>
            <span>{entity.owner.name}</span>
          </span>
        )
      : <span className="text-muted-foreground/40">Unassigned</span> },
    { label: "Relationships", value: <span className="font-mono tabular-nums">{entity.relationships}</span> },
    { label: "Created",       value: entity.created },
    { label: "Updated",       value: entity.updated },
  ]

  return (
    <>
      {/* Properties + S3 widget */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="px-5 pt-4 pb-0">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Entity Overview</span>
          </div>
          <div className="grid border-b lg:grid-cols-[3fr_1fr] lg:divide-x">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 px-5 py-4">
              {fields.map(({ label, value }) => (
                <div key={label} className="flex items-baseline gap-3">
                  <dt className="w-22 shrink-0 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">{label}</dt>
                  <dd className="min-w-0 truncate text-sm">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-col items-center justify-center gap-2 px-5 py-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">S3 Score</div>
              <div className={cn(
                "grid size-16 place-items-center rounded-full border-2 font-mono text-xl font-bold tabular-nums",
                entity.s3Score > 80 ? "border-destructive text-destructive" :
                entity.s3Score > 50 ? "border-amber-500 text-amber-600 dark:text-amber-400" :
                "border-emerald-500 text-emerald-600 dark:text-emerald-400",
              )}>{entity.s3Score}</div>
              <div className="font-mono text-[10px] text-muted-foreground/60">/ 100</div>
            </div>
          </div>

          {/* Tags */}
          {entity.tags.length > 0 && (
            <div className="border-t px-5 py-3">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Tags</div>
              <div className="flex flex-wrap items-center gap-1.5">
                {entity.tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-full border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    <Tag className="size-2.5" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk callout — the one focal-point colored band */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className={cn("px-5 py-4", ct.bg)}>
            <div className="flex items-start gap-3.5">
              <div className={cn("grid size-12 shrink-0 place-items-center rounded-xl border", ct.iconBox)}>
                <CritIcon className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Risk &amp; Criticality</div>
                <div className={cn("mt-1 text-lg font-semibold leading-tight tracking-tight", ct.text)}>
                  {CRIT_LABEL[entity.criticality]} criticality
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">{CRIT_DETAIL[entity.criticality](entity)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

/* ── Blast radius ─────────────────────────────────────────────────────────── */

function BlastRadiusCard({ entity }: { entity: Entity }) {
  const radius = {
    incidents: entity.criticality === "critical" ? 4 : entity.criticality === "high" ? 2 : 1,
    threatIntel: entity.criticality === "critical" ? 3 : entity.criticality === "high" ? 1 : 0,
    artifacts: Math.round(entity.relationships * 0.4),
    alerts:    entity.criticality === "critical" ? 8 : entity.criticality === "high" ? 4 : 1,
  }
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-2">
            <Network className="size-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Blast Radius</span>
            <span className="font-mono text-xs text-muted-foreground/70">{entity.relationships} relationships</span>
          </div>
          <Button size="sm" variant="outline" className="h-7 gap-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-wider">
            <ExternalLink className="size-3" />
            View graph
          </Button>
        </div>
        <div className="grid grid-cols-2 divide-x divide-y border-t sm:grid-cols-4 sm:divide-y-0">
          <BlastTile icon={BookOpen} label="Related incidents"     count={radius.incidents}    hint="Incidents this entity participated in" />
          <BlastTile icon={Shield}   label="Linked threat intel"   count={radius.threatIntel}  hint="Advisories matching this entity" />
          <BlastTile icon={Layers}   label="Observed artifacts"    count={radius.artifacts}    hint="IOCs ever seen against this entity" />
          <BlastTile icon={Bell}     label="Linked alerts"         count={radius.alerts}       hint="Alerts where this entity participated" />
        </div>
      </CardContent>
    </Card>
  )
}

function BlastTile({ icon: Icon, label, count, hint }: { icon: LucideIcon; label: string; count: number; hint: string }) {
  return (
    <button className="group flex flex-col items-start gap-1.5 px-5 py-3 text-left transition hover:bg-muted/30">
      <div className="flex w-full items-center gap-2">
        <div className="grid size-7 shrink-0 place-items-center rounded-lg border bg-muted text-muted-foreground">
          <Icon className="size-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">{label}</div>
          <div className="font-medium text-lg tabular-nums leading-none">{count}</div>
        </div>
        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
      <p className="text-[10px] leading-snug text-muted-foreground/70">{hint}</p>
    </button>
  )
}

/* ── Related incidents (mock) ─────────────────────────────────────────────── */

function RelatedIncidentsCard({ entity }: { entity: Entity }) {
  const TONE_MAP = { critical: "alert", high: "warn", medium: "info", low: "muted" } as const
  const items = [
    { id: "INC-1247", title: "Lateral movement on DC-PROD-01",         severity: "critical" as const, when: "Apr 26", role: "Primary target" },
    { id: "INC-1229", title: "Mimikatz execution blocked",             severity: "high"     as const, when: "Apr 27", role: "Observed" },
    { id: "INC-1238", title: "Cloud config drift — S3 bucket public",  severity: "high"     as const, when: "Apr 20", role: "Source host" },
  ].slice(0, entity.criticality === "critical" ? 3 : entity.criticality === "high" ? 2 : 1)

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-2">
            <BookOpen className="size-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Related Incidents</span>
            <span className="font-mono text-xs text-muted-foreground/70">{items.length}</span>
          </div>
        </div>
        <ul className="divide-y">
          {items.map((it) => {
            const tone = TONE[TONE_MAP[it.severity]]
            return (
              <li key={it.id} className="group flex items-center gap-3 px-5 py-2.5 hover:bg-muted/20">
                <div className="grid size-7 shrink-0 place-items-center rounded-lg border bg-muted text-muted-foreground"><BookOpen className="size-3.5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground/60">{it.id}</span>
                    <span className="truncate text-sm font-medium">{it.title}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground/70">{it.when}</span>
                    <span className="text-muted-foreground/30">·</span>
                    <span className="text-[10px] text-muted-foreground/70">{it.role}</span>
                  </div>
                </div>
                <span className={cn("inline-flex shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider", tone.text)}>
                  <span className={cn("size-1.5 rounded-full", tone.dot)} />
                  {it.severity}
                </span>
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

/* ── Related threat intel (mock) ──────────────────────────────────────────── */

function RelatedThreatIntelCard({ entity }: { entity: Entity }) {
  const TONE_MAP = { critical: "alert", high: "warn", medium: "info", low: "muted" } as const
  const items = [
    { id: "TI-1247", title: "APT29 lateral movement pattern",  severity: "critical" as const, when: "Apr 26", source: "OmniSense" },
    { id: "TI-1226", title: "APT34 C2 infra observed",         severity: "high"     as const, when: "May 1",  source: "Triage Agent" },
  ].slice(0, entity.criticality === "critical" ? 2 : entity.criticality === "high" ? 1 : 0)

  if (items.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center gap-2 border-b px-5 py-3">
            <Shield className="size-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Related Threat Intel</span>
            <span className="font-mono text-xs text-muted-foreground/70">0</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 px-5 py-12 text-center">
            <div className="grid size-10 place-items-center rounded-xl border bg-muted text-muted-foreground/50">
              <Shield className="size-5" />
            </div>
            <p className="text-sm font-medium">No advisories matched</p>
            <p className="text-xs text-muted-foreground">This entity isn't currently linked to any threat intel.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-2">
            <Shield className="size-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Related Threat Intel</span>
            <span className="font-mono text-xs text-muted-foreground/70">{items.length}</span>
          </div>
        </div>
        <ul className="divide-y">
          {items.map((it) => {
            const tone = TONE[TONE_MAP[it.severity]]
            return (
              <li key={it.id} className="group flex items-center gap-3 px-5 py-2.5 hover:bg-muted/20">
                <div className="grid size-7 shrink-0 place-items-center rounded-lg border bg-muted text-muted-foreground"><Shield className="size-3.5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground/60">{it.id}</span>
                    <span className="truncate text-sm font-medium">{it.title}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground/70">{it.when}</span>
                    <span className="text-muted-foreground/30">·</span>
                    <span className="text-[10px] text-muted-foreground/70">{it.source}</span>
                  </div>
                </div>
                <span className={cn("inline-flex shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider", tone.text)}>
                  <span className={cn("size-1.5 rounded-full", tone.dot)} />
                  {it.severity}
                </span>
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

/* ── Relationships ────────────────────────────────────────────────────────── */

function RelationshipsCard({ entity }: { entity: Entity }) {
  const upstream = [
    { name: "core-switch-01", type: "Network Device", relation: "Routes traffic" },
    { name: "aws-vpc-prod",   type: "Cloud Resource", relation: "Network parent" },
  ].slice(0, entity.relationships > 20 ? 2 : 1)

  const downstream = [
    { name: "Auth Service",     type: "Service",  relation: "Depends on" },
    { name: "prod-postgres-01", type: "Database", relation: "Talks to" },
    { name: "WEB-APP-02",       type: "Host",     relation: "Connects from" },
  ].slice(0, Math.min(3, Math.ceil(entity.relationships / 4)))

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-2">
            <Building2 className="size-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Relationships</span>
            <span className="font-mono text-xs text-muted-foreground/70">{entity.relationships}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
          <RelationshipColumn label="Upstream"   sub="This entity depends on" items={upstream} />
          <RelationshipColumn label="Downstream" sub="Depends on this entity" items={downstream} />
        </div>
      </CardContent>
    </Card>
  )
}

function RelationshipColumn({ label, sub, items }: {
  label: string
  sub: string
  items: { name: string; type: string; relation: string }[]
}) {
  return (
    <div className="px-5 py-3">
      <div className="mb-2 flex items-baseline gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{label}</span>
        <span className="text-[10px] text-muted-foreground/50">· {sub}</span>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground/60">No relationships in this direction.</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((it, i) => {
            const Icon = TYPE_ICON[it.type as EntityType] ?? Cpu
            return (
              <li key={i} className="group flex items-center gap-2.5 rounded-lg border border-transparent px-2 py-1.5 transition hover:border-border hover:bg-muted/20">
                <div className="grid size-7 shrink-0 place-items-center rounded-lg border bg-muted text-muted-foreground"><Icon className="size-3.5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{it.name}</div>
                  <div className="text-[10px] text-muted-foreground/70">{it.type} · {it.relation}</div>
                </div>
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/* ── Activity timeline ────────────────────────────────────────────────────── */

function ActivityCard({ entity }: { entity: Entity }) {
  const events = [
    { icon: FileText,      title: "Entity created",             detail: `Registered from CMDB · ${entity.department}`, when: entity.created },
    { icon: Sparkles,      title: "OmniSense classified",       detail: `Tagged as ${CRIT_LABEL[entity.criticality]} criticality · S3 ${entity.s3Score}`, when: entity.created },
    { icon: AlertTriangle, title: "Participated in incident",   detail: "Linked to INC-1247 as primary target",       when: "12 days ago" },
    { icon: CheckCircle2,  title: "Owner notified",             detail: entity.owner ? `Email sent to ${entity.owner.name}` : "No owner — notification skipped", when: "3h ago" },
    { icon: Activity,      title: "Last seen",                  detail: "Heartbeat received from CMDB sync",          when: entity.updated },
  ]

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-2">
            <Activity className="size-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Activity</span>
            <span className="font-mono text-xs text-muted-foreground/70">{events.length}</span>
          </div>
        </div>
        <div className="px-5 py-4">
          <div className="relative">
            <div className="absolute bottom-2 left-3 top-2 w-px bg-border/60" />
            <ol className="space-y-3">
              {events.map((ev, i) => {
                const EvIcon = ev.icon
                return (
                  <li key={i} className="relative flex gap-3">
                    <div className="relative z-10 grid size-6 shrink-0 place-items-center rounded-full border-2 border-card bg-primary/10 text-primary"><EvIcon className="size-3" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-sm font-medium leading-snug">{ev.title}</span>
                        <span className="ml-auto font-mono text-[10px] text-muted-foreground/60">{ev.when}</span>
                      </div>
                      <p className="text-xs leading-relaxed text-muted-foreground">{ev.detail}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
