import { useMemo, useState } from "react"
import { useParams, Link } from "react-router"
import type { LucideIcon } from "lucide-react"
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Hash,
  HelpCircle,
  Layers,
  Link2,
  Mail,
  MoreHorizontal,
  Network,
  Package,
  Pin,
  Search,
  Send,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tag,
  Terminal,
  Timer,
  Users,
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
import { threatIntelItems, type ThreatIntel, type Severity, type ThreatIntelStatus, type ThreatIntelState } from "@/data/threat-intel"
import { SourceIcon } from "@/features/incidents/list/source-icon"

/* ── Tone tokens (mirrors overview / omnisense / artifacts) ───────────────── */

type Tone = "alert" | "warn" | "ok" | "info" | "muted"

const TONE: Record<Tone, { iconBox: string; chip: string; bg: string; text: string; dot: string; bar: string }> = {
  alert: { iconBox: "border-destructive/30 bg-destructive/10 text-destructive",                       chip: "border-destructive/25 bg-destructive/10 text-destructive",                       bg: "bg-destructive/5",  text: "text-destructive",                       dot: "bg-destructive",         bar: "bg-destructive" },
  warn:  { iconBox: "border-amber-500/30 bg-amber-500/10 text-amber-500",                             chip: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",         bg: "bg-amber-500/5",     text: "text-amber-600 dark:text-amber-400",     dot: "bg-amber-500",           bar: "bg-amber-500" },
  ok:    { iconBox: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",                       chip: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/5",   text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500",         bar: "bg-emerald-500" },
  info:  { iconBox: "border-primary/30 bg-primary/10 text-primary",                                   chip: "border-primary/25 bg-primary/10 text-primary",                                   bg: "bg-primary/5",       text: "text-primary",                           dot: "bg-primary",             bar: "bg-primary" },
  muted: { iconBox: "border bg-muted text-muted-foreground",                                          chip: "border bg-muted text-muted-foreground",                                          bg: "bg-muted/40",        text: "text-foreground",                        dot: "bg-muted-foreground/50", bar: "bg-muted-foreground/40" },
}

const SEVERITY_TONE: Record<Severity, Tone> = {
  critical: "alert",
  high:     "warn",
  medium:   "info",
  low:      "muted",
}

const SEVERITY_HEX: Record<Severity, string> = {
  critical: "var(--destructive)",
  high:     "var(--color-amber-500, oklch(0.79 0.16 75))",
  medium:   "var(--primary)",
  low:      "var(--muted-foreground)",
}

const STATUS_LABEL: Record<ThreatIntelStatus, string> = {
  open: "Open", investigating: "Investigating", "in-progress": "In progress",
  waiting: "Waiting", resolved: "Resolved", closed: "Closed",
}

const STATES: { key: ThreatIntelState; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "case",    label: "Case"    },
  { key: "finish",  label: "Finish"  },
]

/* ── Verdict (mirrors incident overview chemistry) ────────────────────────── */

type Verdict = { tone: Tone; icon: LucideIcon; title: string; detail: string }

function getVerdict(ti: ThreatIntel): Verdict {
  const conf = Math.round(ti.aiConfidence * 100)
  if (ti.disposition === "true-positive" && (ti.severity === "critical" || ti.severity === "high") && conf >= 80) {
    return { tone: "alert", icon: ShieldAlert, title: "Confirmed Active Threat",
      detail: `High-confidence attribution across ${ti.iocs} IOC${ti.iocs === 1 ? "" : "s"} and ${ti.alerts} correlated alert${ti.alerts === 1 ? "" : "s"}. Immediate response recommended.` }
  }
  if (ti.disposition === "true-positive" || conf >= 75) {
    return { tone: "warn", icon: AlertTriangle, title: "Likely True Positive",
      detail: "Strong indicators suggest active threat. Escalation to Tier 2 recommended for containment." }
  }
  if (ti.disposition === "false-positive" || ti.disposition === "benign") {
    return { tone: "ok", icon: CheckCircle2, title: "Closed — Non-Threat",
      detail: "Analysis concluded no malicious activity. Advisory retained for context." }
  }
  if (conf >= 50) {
    return { tone: "info", icon: Search, title: "Needs Analyst Review",
      detail: "Moderate confidence with mixed signals. Manual triage required to confirm verdict." }
  }
  return { tone: "muted", icon: HelpCircle, title: "Insufficient Evidence",
    detail: "Low confidence across enriched signals. Gather additional context before action." }
}

/* ── Tabs ─────────────────────────────────────────────────────────────────── */

type TabId = "overview" | "iocs" | "entities" | "products" | "related" | "mitre" | "activity"

const TABS: { id: TabId; label: string; icon: LucideIcon; ck?: string }[] = [
  { id: "overview", label: "Overview",          icon: Pin,                            },
  { id: "iocs",     label: "IOCs",              icon: Shield,        ck: "iocs"       },
  { id: "entities", label: "Affected entities", icon: Users,         ck: "entities"   },
  { id: "products", label: "Affected products", icon: Package,       ck: "products"   },
  { id: "related",  label: "Related",           icon: Activity,      ck: "related"    },
  { id: "mitre",    label: "MITRE & tags",      icon: Tag,                            },
  { id: "activity", label: "Activity",          icon: FileText,                       },
]

/* ── Page ────────────────────────────────────────────────────────────────── */

export function ThreatIntelDetailPage() {
  const { id } = useParams<{ id: string }>()
  const ti = useMemo(() => threatIntelItems.find((t) => t.id === id) ?? threatIntelItems[0]!, [id])
  const [tab, setTab] = useState<TabId>("overview")

  const verdict = useMemo(() => getVerdict(ti), [ti])
  const sevHex  = SEVERITY_HEX[ti.severity]
  const stageIdx = STATES.findIndex((s) => s.key === ti.state)

  const counts: Record<string, number> = {
    iocs:     ti.iocs,
    entities: Math.min(4, Math.max(1, Math.ceil(ti.iocs / 4))),
    products: 3,
    related:  Math.max(1, Math.min(3, ti.alerts)),
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">

      {/* ════════ HEADER ════════════════════════════════════════════════════ */}
      <header className="shrink-0 border-b bg-card shadow-sm">
        <div className="h-[3px] w-full" style={{ background: `color-mix(in srgb, ${sevHex} 55%, transparent)` }} />

        {/* Row 1 */}
        <div className="flex h-12 items-center gap-3 px-5">
          <Button variant="ghost" size="icon" className="size-7 shrink-0 text-muted-foreground" asChild>
            <Link to="/threat-intel"><ArrowLeft className="size-4" /></Link>
          </Button>
          <Badge variant="outline" className="shrink-0 font-mono text-[10px]">{ti.id}</Badge>
          <span className="size-2 shrink-0 rounded-full" style={{ background: `color-mix(in srgb, ${sevHex} 80%, transparent)` }} />
          <h1 className="min-w-0 flex-1 truncate text-sm font-semibold">{ti.title}</h1>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="shrink-0 cursor-default opacity-70 transition-opacity hover:opacity-100">
                <SourceIcon source={ti.source.label} size={18} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">{ti.source.label}</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-5" />

          <div className="flex shrink-0 items-center gap-1.5">
            <Button size="sm" className="h-8 gap-1.5 text-xs"><Send className="size-3.5" />Publish</Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs"><Share2 className="size-3.5" />Convert to case</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="size-8"><MoreHorizontal className="size-3.5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem><Mail className="mr-2 size-3.5 text-muted-foreground" />Send email</DropdownMenuItem>
                <DropdownMenuItem><Download className="mr-2 size-3.5 text-muted-foreground" />Export PDF</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem><FileText className="mr-2 size-3.5 text-muted-foreground" />Edit advisory</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Row 2 — metadata + state stepper */}
        <div className="flex h-11 shrink-0 items-center border-t">
          <div className="flex h-full shrink-0 items-center gap-2.5 border-r px-4">
            <SeverityChip severity={ti.severity} />
            <StatusChip status={ti.status} />
            <Badge variant="outline" className="font-mono text-xs font-bold">{ti.priority}</Badge>

            {ti.assignee && (
              <>
                <div className="h-3.5 w-px shrink-0 bg-border/60" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex cursor-default items-center gap-1.5">
                      <Avatar className="size-5 shrink-0">
                        {ti.assignee.photo && <AvatarImage src={ti.assignee.photo} alt={ti.assignee.name} />}
                        <AvatarFallback className={cn("bg-linear-to-br text-[8px] font-bold text-white", ti.assignee.gradient)}>
                          {ti.assignee.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{ti.assignee.name}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Lead analyst</TooltipContent>
                </Tooltip>
              </>
            )}

            <div className="h-3.5 w-px shrink-0 bg-border/60" />

            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold",
                  ti.sla.tone === "breach" ? "bg-destructive/10 text-destructive" : "bg-muted/60 text-muted-foreground",
                )}>
                  <Timer className="size-3 shrink-0" />{ti.sla.label}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">SLA remaining</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold tabular-nums",
                  ti.s3Score >= 70 ? "bg-destructive/10 text-destructive" :
                  ti.s3Score >= 40 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                  "bg-muted/60 text-muted-foreground",
                )}>
                  <Zap className="size-3 shrink-0" />S3&nbsp;{ti.s3Score}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">Severity · Scope · Speed</TooltipContent>
            </Tooltip>
          </div>

          {/* State stepper */}
          <div className="flex min-w-0 flex-1 items-center overflow-x-auto px-5">
            <span className="mr-3 shrink-0 text-xs font-semibold uppercase tracking-widest text-muted-foreground">State</span>
            {STATES.map((stage, i) => {
              const done    = i < stageIdx
              const current = i === stageIdx
              const future  = i > stageIdx
              return (
                <div key={stage.key} className="flex items-center">
                  {i > 0 && <div className={cn("mx-1.5 h-px w-5 shrink-0", done ? "bg-primary/40" : "bg-border/60")} />}
                  <div className={cn(
                    "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium transition-all",
                    done    && "text-primary/60",
                    current && "bg-primary font-semibold text-primary-foreground shadow-sm",
                    future  && "text-muted-foreground/35",
                  )}>
                    {done && <Check className="size-3 shrink-0" />}
                    {stage.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </header>

      {/* ════════ BODY: tab strip + scrolling content ════════════════════════ */}
      <div className="flex min-h-0 flex-1 flex-col">

        {/* Tab strip (sticky inside scroll container) */}
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
            {tab === "overview" && <OverviewTab ti={ti} verdict={verdict} />}
            {tab === "iocs"     && <IOCsCard ti={ti} />}
            {tab === "entities" && <AffectedEntitiesCard ti={ti} />}
            {tab === "products" && <AffectedProductsCard ti={ti} />}
            {tab === "related"  && <RelatedIncidentsCard ti={ti} />}
            {tab === "mitre"    && <MitreTagsCard ti={ti} />}
            {tab === "activity" && <ActivityCard ti={ti} />}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Compact severity & status chips for header ───────────────────────────── */

function SeverityChip({ severity }: { severity: Severity }) {
  const t = TONE[SEVERITY_TONE[severity]]
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider", t.chip)}>
      <span className={cn("size-1.5 rounded-full", t.dot)} />
      {severity}
    </span>
  )
}

function StatusChip({ status }: { status: ThreatIntelStatus }) {
  return <Badge variant="secondary" className="text-xs">{STATUS_LABEL[status]}</Badge>
}

/* ── Overview tab ─────────────────────────────────────────────────────────── */

function OverviewTab({ ti, verdict }: { ti: ThreatIntel; verdict: Verdict }) {
  const verdictTone = TONE[verdict.tone]
  const VerdictIcon = verdict.icon
  const confidence  = Math.round(ti.aiConfidence * 100)
  const malicious   = Math.ceil(ti.iocs * 0.6)
  const suspicious  = Math.ceil(ti.iocs * 0.2)

  return (
    <>
      {/* Overview card — classification grid + stats + S3 widget */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="px-5 pt-4 pb-0">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Advisory Overview</span>
          </div>

          <div className="grid border-b lg:grid-cols-[3fr_1fr] lg:divide-x">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 px-5 py-4">
              {([
                { label: "Category",    value: ti.category },
                { label: "Type",        value: ti.type.label },
                { label: "Technique",   value: ti.type.technique },
                { label: "Disposition", value: ti.disposition.replace(/-/g, " ") },
                { label: "Customer",    value: ti.customer },
                { label: "Location",    value: ti.location },
                { label: "Opener",      value: ti.openedBy.name },
                { label: "Created",     value: ti.created },
                { label: "Detected",    value: ti.detectionDate },
                { label: "Updated",     value: ti.updateDate },
              ] as { label: string; value: string }[]).map(({ label, value }) => (
                <div key={label} className="flex items-baseline gap-3">
                  <span className="w-17 shrink-0 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">{label}</span>
                  <span className="min-w-0 truncate text-sm font-medium capitalize">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-center gap-2 px-5 py-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">S3 Score</div>
              <div className={cn(
                "grid size-16 place-items-center rounded-full border-2 font-mono text-xl font-bold tabular-nums",
                ti.s3Score > 80 ? "border-destructive text-destructive" :
                ti.s3Score > 50 ? "border-amber-500 text-amber-600 dark:text-amber-400" :
                "border-emerald-500 text-emerald-600 dark:text-emerald-400",
              )}>{ti.s3Score}</div>
              <div className="font-mono text-[10px] text-muted-foreground/60">/ 100</div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 divide-x divide-y sm:grid-cols-4 sm:divide-y-0">
            <StatTile icon={Shield}   label="IOCs"        value={ti.iocs}             sub={`${malicious} malicious · ${suspicious} suspicious`} tone={malicious > 0 ? "alert" : "muted"} />
            <StatTile icon={Bell}     label="Alerts"      value={ti.alerts}           sub="correlated"                                          tone={ti.alerts > 0 ? "warn" : "muted"} />
            <StatTile icon={Layers}   label="Artifacts"   value={ti.artifacts}        sub="attached"                                            tone="muted" />
            <StatTile icon={Sparkles} label="Confidence"  value={`${confidence}%`}    sub="OmniSense"                                           tone="info" />
          </div>
        </CardContent>
      </Card>

      {/* OmniSense verdict */}
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
                <span className="text-xs text-muted-foreground">Advisory verdict</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">Confidence {confidence}% · model v3.2 · analyzed {ti.updateDate}</p>
            </div>
            <Button size="sm" variant="outline" className="h-8 gap-1.5 px-3 text-xs">
              <ExternalLink className="size-3" />
              Full report
            </Button>
          </div>

          <div className={cn("px-5 py-5", verdictTone.bg)}>
            <div className="flex items-start gap-3.5">
              <div className={cn("grid size-12 shrink-0 place-items-center rounded-xl border", verdictTone.iconBox)}>
                <VerdictIcon className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className={cn("text-lg font-semibold leading-tight tracking-tight", verdictTone.text)}>{verdict.title}</div>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">{verdict.detail}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function StatTile({ icon: Icon, label, value, sub, tone }: { icon: LucideIcon; label: string; value: string | number; sub?: string; tone: Tone }) {
  const t = TONE[tone]
  return (
    <div className="flex flex-col gap-1.5 px-5 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className="grid size-8 shrink-0 place-items-center rounded-lg border bg-muted text-muted-foreground"><Icon className="size-4" /></div>
      </div>
      <div className="font-medium text-2xl tabular-nums leading-none tracking-tight">{value}</div>
      {sub && (
        <div className="flex items-center gap-1.5">
          {tone !== "muted" && <span className={cn("size-1.5 shrink-0 rounded-full", t.dot)} />}
          <span className="text-xs text-muted-foreground">{sub}</span>
        </div>
      )}
    </div>
  )
}

/* ── IOCs ─────────────────────────────────────────────────────────────────── */

type MockIOC = { value: string; type: "ip" | "domain" | "url" | "hash" | "email" | "filename"; verdict: "malicious" | "suspicious" | "clean" | "unknown"; sources: number; source: string; when: string }
const IOC_TYPE_ICON: Record<MockIOC["type"], LucideIcon> = { ip: Globe, domain: Globe, url: Link2, hash: Hash, email: Mail, filename: Terminal }
const IOC_TYPE_LABEL: Record<MockIOC["type"], string> = { ip: "IP", domain: "Domain", url: "URL", hash: "Hash", email: "Email", filename: "Process" }
const VERDICT_TONE: Record<MockIOC["verdict"], Tone> = { malicious: "alert", suspicious: "warn", clean: "ok", unknown: "muted" }
const VERDICT_LABEL: Record<MockIOC["verdict"], string> = { malicious: "Malicious", suspicious: "Suspicious", clean: "Clean", unknown: "Unknown" }

function buildIOCs(ti: ThreatIntel): MockIOC[] {
  const seeds: MockIOC[] = [
    { value: "185.220.101.42", type: "ip",       verdict: "malicious",  sources: 3, source: "OmniSense correlation", when: "2h ago" },
    { value: "a3f2c81b9d7e045d8c6b…", type: "hash", verdict: "malicious", sources: 2, source: "CrowdStrike EDR", when: "3h ago" },
    { value: "secure-update-cdn[.]com", type: "domain", verdict: "malicious", sources: 3, source: "DNS gateway", when: "2h ago" },
    { value: "104.21.45.118", type: "ip",       verdict: "suspicious", sources: 3, source: "Firewall logs", when: "5h ago" },
    { value: "no-reply@secure-update-cdn[.]com", type: "email", verdict: "malicious", sources: 1, source: "Proofpoint", when: "4h ago" },
    { value: "https://secure-update-cdn[.]com/portal/login.php", type: "url", verdict: "malicious", sources: 2, source: "Email gateway", when: "4h ago" },
    { value: "rundll32.exe -s C:\\Users\\Public\\update.dll", type: "filename", verdict: "malicious", sources: 1, source: "Sysmon event 1", when: "2h ago" },
    { value: "TCP/4444", type: "ip", verdict: "suspicious", sources: 1, source: "Sentinel detection", when: "3h ago" },
  ]
  return seeds.slice(0, Math.min(ti.iocs, seeds.length))
}

function IOCsCard({ ti }: { ti: ThreatIntel }) {
  const iocs = buildIOCs(ti)
  const stats = {
    malicious:  iocs.filter((i) => i.verdict === "malicious").length,
    suspicious: iocs.filter((i) => i.verdict === "suspicious").length,
    clean:      iocs.filter((i) => i.verdict === "clean").length,
    unknown:    iocs.filter((i) => i.verdict === "unknown").length,
  }
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg border bg-muted text-muted-foreground"><Shield className="size-4" /></div>
            <div>
              <div className="text-sm font-semibold leading-tight tracking-tight">Indicators of Compromise</div>
              <div className="text-[11px] text-muted-foreground">Atomic IOCs attached to this advisory · {iocs.length} total</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Count tone="alert" count={stats.malicious}  label="malicious" />
            <Count tone="warn"  count={stats.suspicious} label="suspicious" />
            <Count tone="ok"    count={stats.clean}      label="clean" />
            <Count tone="muted" count={stats.unknown}    label="unknown" />
          </div>
        </div>
        <ul className="divide-y">
          {iocs.map((ioc, i) => {
            const tone = VERDICT_TONE[ioc.verdict]
            const vt = TONE[tone]
            const TypeIcon = IOC_TYPE_ICON[ioc.type]
            return (
              <li key={i} className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/20">
                <div className="grid size-7 shrink-0 place-items-center rounded-lg border bg-muted text-muted-foreground"><TypeIcon className="size-3.5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-mono text-xs font-semibold leading-tight">{ioc.value}</div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground/70">{IOC_TYPE_LABEL[ioc.type]}</span>
                    <span className="text-muted-foreground/30">·</span>
                    <span className="text-[10px] text-muted-foreground/70">{ioc.source}</span>
                    <span className="text-muted-foreground/30">·</span>
                    <span className="font-mono text-[10px] text-muted-foreground/60">{ioc.when}</span>
                  </div>
                </div>
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">{ioc.sources} src</span>
                <span className={cn("inline-flex shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider", vt.text)}>
                  <span className={cn("size-1.5 rounded-full", vt.dot)} />
                  {VERDICT_LABEL[ioc.verdict]}
                </span>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

function Count({ tone, count, label }: { tone: Tone; count: number; label: string }) {
  const t = TONE[tone]
  const dimmed = count === 0
  return (
    <div className={cn("inline-flex items-center gap-1.5 text-[11px]", dimmed && "opacity-40")}>
      <span className={cn("size-1.5 shrink-0 rounded-full", t.dot)} />
      <span className="font-mono font-semibold tabular-nums">{count}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  )
}

/* ── Affected entities (mock) ─────────────────────────────────────────────── */

function AffectedEntitiesCard({ ti }: { ti: ThreatIntel }) {
  const RISK_TONE = { critical: "alert", high: "warn", medium: "info", low: "muted" } as const
  const entities = [
    { name: `Primary workload · ${ti.location}`, type: "Host",              risk: "critical" as const, signal: "Suspicious PS exec" },
    { name: `Auth plane · ${ti.location}`,       type: "Domain controller", risk: "high"     as const, signal: "TGT anomalies" },
    { name: `Jump host · ${ti.location}`,        type: "Server",            risk: "high"     as const, signal: "Inbound RDP burst" },
    { name: "Identity provider",                 type: "SaaS",              risk: "medium"   as const, signal: "OAuth scope drift" },
  ].slice(0, Math.min(4, Math.max(1, Math.ceil(ti.iocs / 4))))

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-2">
            <Users className="size-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Affected Entities</span>
            <span className="font-mono text-xs text-muted-foreground/70">{entities.length}</span>
          </div>
        </div>
        <ul className="divide-y">
          {entities.map((e, i) => {
            const tone = TONE[RISK_TONE[e.risk]]
            return (
              <li key={i} className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/20">
                <div className="grid size-7 shrink-0 place-items-center rounded-lg border bg-muted text-muted-foreground"><Network className="size-3.5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{e.name}</div>
                  <div className="text-[10px] text-muted-foreground/70">{e.type} · {e.signal}</div>
                </div>
                <span className={cn("inline-flex shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider", tone.text)}>
                  <span className={cn("size-1.5 rounded-full", tone.dot)} />
                  {e.risk}
                </span>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

/* ── Affected products (mock) ─────────────────────────────────────────────── */

function AffectedProductsCard({ ti: _ti }: { ti: ThreatIntel }) {
  const TONE_MAP = { critical: "alert", high: "warn", medium: "info", low: "muted" } as const
  const products = [
    { product: "Microsoft 365",     vendor: "Microsoft",  version: "—",      impact: "high"     as const, cve: "CVE-2024-32896" },
    { product: "Active Directory",  vendor: "Microsoft",  version: "WS2022", impact: "critical" as const, cve: null },
    { product: "Proofpoint TAP",    vendor: "Proofpoint", version: "v8.21",  impact: "medium"   as const, cve: null },
  ]
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-2">
            <Package className="size-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Affected Products</span>
            <span className="font-mono text-xs text-muted-foreground/70">{products.length}</span>
          </div>
        </div>
        <ul className="divide-y">
          {products.map((p, i) => {
            const tone = TONE[TONE_MAP[p.impact]]
            return (
              <li key={i} className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/20">
                <div className="grid size-7 shrink-0 place-items-center rounded-lg border bg-muted text-muted-foreground"><Package className="size-3.5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{p.product}</div>
                  <div className="text-[10px] text-muted-foreground/70">
                    {p.vendor} · {p.version}
                    {p.cve && <> · <span className="font-mono">{p.cve}</span></>}
                  </div>
                </div>
                <span className={cn("inline-flex shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider", tone.text)}>
                  <span className={cn("size-1.5 rounded-full", tone.dot)} />
                  {p.impact} impact
                </span>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

/* ── Related incidents (mock) ─────────────────────────────────────────────── */

function RelatedIncidentsCard({ ti }: { ti: ThreatIntel }) {
  const TONE_MAP = { critical: "alert", high: "warn", medium: "info", low: "muted" } as const
  const related = [
    { id: "INC-1247", title: "Lateral movement on DC-PROD-01",     severity: "critical" as const, when: "Apr 26", commonality: "Same actor + 8 IOCs" },
    { id: "INC-1233", title: "Malware beacon — finance-laptop-07", severity: "critical" as const, when: "Apr 30", commonality: "Same C2 infra" },
    { id: "INC-1217", title: "Malicious macro in vendor invoice",  severity: "high"     as const, when: "Apr 28", commonality: "Same campaign" },
  ].slice(0, Math.max(1, Math.min(3, ti.alerts)))

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-2">
            <Activity className="size-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Related Incidents</span>
            <span className="font-mono text-xs text-muted-foreground/70">{related.length}</span>
          </div>
        </div>
        <ul className="divide-y">
          {related.map((r) => {
            const tone = TONE[TONE_MAP[r.severity]]
            return (
              <li key={r.id} className="group flex items-center gap-3 px-5 py-2.5 hover:bg-muted/20">
                <div className="grid size-7 shrink-0 place-items-center rounded-lg border bg-muted text-muted-foreground"><BookOpen className="size-3.5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground/60">{r.id}</span>
                    <span className="truncate text-sm font-medium">{r.title}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground/70">{r.when}</span>
                    <span className="text-muted-foreground/30">·</span>
                    <span className="text-[10px] text-muted-foreground/70">{r.commonality}</span>
                  </div>
                </div>
                <span className={cn("inline-flex shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider", tone.text)}>
                  <span className={cn("size-1.5 rounded-full", tone.dot)} />
                  {r.severity}
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

/* ── MITRE + tags ─────────────────────────────────────────────────────────── */

function MitreTagsCard({ ti }: { ti: ThreatIntel }) {
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardContent className="px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">MITRE ATT&amp;CK</div>
            <span className="font-mono text-xs text-muted-foreground/70">{ti.mitre.length}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {ti.mitre.map((t) => (
              <span key={t} className="rounded border border-primary/20 bg-primary/8 px-2.5 py-1 font-mono text-xs font-semibold text-primary">{t}</span>
            ))}
          </div>
        </CardContent>
      </Card>
      {ti.tags.length > 0 && (
        <Card className="overflow-hidden">
          <CardContent className="px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Tags</div>
              <span className="font-mono text-xs text-muted-foreground/70">{ti.tags.length}</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {ti.tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-full border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  <Tag className="size-2.5" />
                  {t}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/* ── Activity ─────────────────────────────────────────────────────────────── */

function ActivityCard({ ti }: { ti: ThreatIntel }) {
  const events = [
    { icon: FileText,    title: "Advisory created",                  detail: `Opened by ${ti.openedBy.name} from queue Triage-${ti.location}`, when: ti.created },
    { icon: Sparkles,    title: "OmniSense analysis completed",      detail: `Correlation job ${ti.sourceId} · ${ti.iocs} IOCs enriched · ${Math.round(ti.aiConfidence * 100)}% confidence`, when: ti.startDate },
    { icon: ShieldCheck, title: "Disposition recorded",              detail: `Marked ${ti.disposition.replace(/-/g, " ")} after analyst review`, when: ti.updateDate },
    ...(ti.escalationDate ? [{ icon: AlertTriangle, title: "Escalated to L2", detail: ti.assignee ? `Routed to ${ti.assignee.name}` : "Awaiting assignment", when: ti.escalationDate }] : []),
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
