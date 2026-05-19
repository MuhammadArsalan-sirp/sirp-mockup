import { useMemo, useState, type ElementType } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  FileText,
  Filter,
  Globe,
  Hash,
  HelpCircle,
  KeyRound,
  Link2,
  Mail,
  MoreHorizontal,
  Network,
  Pencil,
  Play,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type {
  ArtifactRow,
  ArtifactType,
  ArtifactVerdict,
  EnrichmentApp,
  EnrichmentResult,
} from "./incident-detail-mock"

/* ── Static lookups ───────────────────────────────────────────────────────── */

const TYPE_META: Record<ArtifactType, { icon: ElementType; label: string; chip: string; box: string }> = {
  "ip":          { icon: Globe,    label: "IP",       chip: "border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400",
                                                       box:  "border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  "domain":      { icon: Globe,    label: "Domain",   chip: "border-cyan-500/25 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
                                                       box:  "border-cyan-500/25 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
  "url":         { icon: Link2,    label: "URL",      chip: "border-indigo-500/25 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
                                                       box:  "border-indigo-500/25 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
  "hash-md5":    { icon: Hash,     label: "MD5",      chip: "border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-400",
                                                       box:  "border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  "hash-sha1":   { icon: Hash,     label: "SHA-1",    chip: "border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-400",
                                                       box:  "border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  "hash-sha256": { icon: Hash,     label: "SHA-256",  chip: "border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-400",
                                                       box:  "border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  "email":       { icon: Mail,     label: "Email",    chip: "border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400",
                                                       box:  "border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  "port":        { icon: Network,  label: "Port",     chip: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                                                       box:  "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  "file":        { icon: FileText, label: "File",     chip: "border-slate-500/25 bg-slate-500/10 text-slate-600 dark:text-slate-400",
                                                       box:  "border-slate-500/25 bg-slate-500/10 text-slate-600 dark:text-slate-400" },
  "filename":    { icon: Terminal, label: "Process",  chip: "border-orange-500/25 bg-orange-500/10 text-orange-600 dark:text-orange-400",
                                                       box:  "border-orange-500/25 bg-orange-500/10 text-orange-600 dark:text-orange-400" },
  "user":        { icon: User,     label: "User",     chip: "border-pink-500/25 bg-pink-500/10 text-pink-600 dark:text-pink-400",
                                                       box:  "border-pink-500/25 bg-pink-500/10 text-pink-600 dark:text-pink-400" },
  "registry":    { icon: KeyRound, label: "Registry", chip: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                                                       box:  "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
}

const VERDICT_META: Record<ArtifactVerdict, { label: string; chip: string; icon: ElementType }> = {
  malicious:  { label: "Malicious",  chip: "border-destructive/30 bg-destructive/10 text-destructive",                    icon: ShieldAlert  },
  suspicious: { label: "Suspicious", chip: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",      icon: AlertTriangle },
  clean:      { label: "Clean",      chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", icon: ShieldCheck },
  unknown:    { label: "Unknown",    chip: "border bg-muted text-muted-foreground",                                       icon: HelpCircle   },
}

const ENRICHMENT_APPS: Record<EnrichmentApp, { name: string; short: string }> = {
  virustotal:     { name: "VirusTotal",     short: "VT"    },
  abuseipdb:      { name: "AbuseIPDB",      short: "ABDB"  },
  threatfox:      { name: "ThreatFox",      short: "TF"    },
  shodan:         { name: "Shodan",         short: "SHO"   },
  mandiant:       { name: "Mandiant",       short: "MAN"   },
  alienvault:     { name: "AlienVault",     short: "OTX"   },
  urlscan:        { name: "urlscan.io",     short: "URL"   },
  hybridanalysis: { name: "HybridAnalysis", short: "HA"    },
}

const STATUS_CHIP: Record<EnrichmentResult["status"], string> = {
  malicious:  "border-destructive/25 bg-destructive/10 text-destructive",
  suspicious: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  clean:      "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  pending:    "border bg-muted text-muted-foreground",
}

const ENRICHMENT_OPTIONS: { app: EnrichmentApp; supportedTypes: ArtifactType[] }[] = [
  { app: "virustotal",     supportedTypes: ["ip", "domain", "url", "hash-md5", "hash-sha1", "hash-sha256", "email"] },
  { app: "abuseipdb",      supportedTypes: ["ip"] },
  { app: "shodan",         supportedTypes: ["ip", "port"] },
  { app: "threatfox",      supportedTypes: ["ip", "domain", "url", "hash-md5", "hash-sha1", "hash-sha256"] },
  { app: "urlscan",        supportedTypes: ["url", "domain"] },
  { app: "hybridanalysis", supportedTypes: ["hash-md5", "hash-sha1", "hash-sha256", "file"] },
  { app: "alienvault",     supportedTypes: ["ip", "domain", "url", "hash-md5", "hash-sha1", "hash-sha256"] },
  { app: "mandiant",       supportedTypes: ["ip", "domain", "url", "hash-md5", "hash-sha1", "hash-sha256", "filename"] },
]

/* ── Panel ────────────────────────────────────────────────────────────────── */

export function ArtifactsPanel({ artifacts }: { artifacts: ArtifactRow[] }) {
  const [search, setSearch]     = useState("")
  const [filter, setFilter]     = useState<"all" | ArtifactType>("all")
  const [verdict, setVerdict]   = useState<"all" | ArtifactVerdict>("all")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<string | null>(null)

  const typeCounts = useMemo(() => {
    const m = new Map<ArtifactType, number>()
    for (const a of artifacts) m.set(a.type, (m.get(a.type) ?? 0) + 1)
    return m
  }, [artifacts])

  const visible = artifacts
    .filter((a) => filter === "all" || a.type === filter)
    .filter((a) => verdict === "all" || a.verdict === verdict)
    .filter((a) => !search || a.value.toLowerCase().includes(search.toLowerCase()))

  const allVisibleChecked = visible.length > 0 && visible.every((a) => selected.has(a.id))
  const someVisibleChecked = visible.some((a) => selected.has(a.id))

  const toggleSelect = (id: string, on: boolean) =>
    setSelected((s) => {
      const next = new Set(s)
      if (on) next.add(id); else next.delete(id)
      return next
    })

  const toggleAllVisible = (on: boolean) =>
    setSelected((s) => {
      const next = new Set(s)
      for (const a of visible) {
        if (on) next.add(a.id); else next.delete(a.id)
      }
      return next
    })

  const stats = {
    total:      artifacts.length,
    malicious:  artifacts.filter((a) => a.verdict === "malicious").length,
    suspicious: artifacts.filter((a) => a.verdict === "suspicious").length,
    clean:      artifacts.filter((a) => a.verdict === "clean").length,
  }

  return (
    <div className="space-y-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
      {/* ── Stats ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Artifacts"  value={stats.total}      tone="muted" icon={FileText}     />
        <StatTile label="Malicious"  value={stats.malicious}  tone="alert" icon={ShieldAlert}  />
        <StatTile label="Suspicious" value={stats.suspicious} tone="warn"  icon={AlertTriangle}/>
        <StatTile label="Clean"      value={stats.clean}      tone="ok"    icon={ShieldCheck}  />
      </div>

      {/* ── Main panel ────────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <CardContent className="px-5">
          {/* Header */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="size-3.5 text-muted-foreground/60" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Artifacts</span>
              <span className="font-mono text-xs tabular-nums text-muted-foreground/70">{visible.length}/{artifacts.length}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="default" className="h-7 gap-1.5 px-3 text-xs">
                  <Plus className="size-3" />Add artifact
                  <ChevronDown className="size-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem className="gap-2 text-xs"><Plus className="size-3.5 text-muted-foreground" />Add single</DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-xs"><FileText className="size-3.5 text-muted-foreground" />Bulk paste</DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-xs"><Upload className="size-3.5 text-muted-foreground" />Upload file</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Toolbar */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-lg border bg-muted/20 px-3 py-1.5 transition-all focus-within:border-primary/40 focus-within:bg-card focus-within:ring-1 focus-within:ring-primary/20">
              <Search className="size-3.5 shrink-0 text-muted-foreground/50" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by value (IP, hash, domain, URL, email)…"
                className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/40"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-muted-foreground/50 hover:text-foreground">
                  <X className="size-3" />
                </button>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                  <Filter className="size-3" />
                  Verdict: {verdict === "all" ? "Any" : VERDICT_META[verdict].label}
                  <ChevronDown className="size-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setVerdict("all")}        className="gap-2 text-xs">Any verdict</DropdownMenuItem>
                <DropdownMenuSeparator />
                {(Object.keys(VERDICT_META) as ArtifactVerdict[]).map((v) => {
                  const Icon = VERDICT_META[v].icon
                  return (
                    <DropdownMenuItem key={v} onClick={() => setVerdict(v)} className="gap-2 text-xs">
                      <Icon className="size-3.5" />{VERDICT_META[v].label}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Type filter pills */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            <FilterPill
              active={filter === "all"}
              onClick={() => setFilter("all")}
              count={artifacts.length}
              chipClass="border-primary/30 bg-primary/10 text-primary"
            >
              All
            </FilterPill>
            {(Object.keys(TYPE_META) as ArtifactType[]).map((t) => {
              const count = typeCounts.get(t) ?? 0
              if (count === 0) return null
              const meta = TYPE_META[t]
              const TypeIcon = meta.icon
              return (
                <FilterPill
                  key={t}
                  active={filter === t}
                  onClick={() => setFilter(filter === t ? "all" : t)}
                  count={count}
                  chipClass={meta.chip}
                >
                  <TypeIcon className="size-3" />
                  {meta.label}
                </FilterPill>
              )
            })}
          </div>

          {/* Bulk bar */}
          {selected.size > 0 && (
            <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-md bg-primary px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">{selected.size}</span>
                <span className="font-medium">selected</span>
                <button onClick={() => setSelected(new Set())} className="text-muted-foreground hover:text-foreground">
                  <X className="size-3" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="h-7 gap-1.5 bg-background text-xs">
                      <Play className="size-3" />Run enrichment
                      <ChevronDown className="size-3 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Threat intel</DropdownMenuLabel>
                    {ENRICHMENT_OPTIONS.map(({ app }) => (
                      <DropdownMenuItem key={app} className="gap-2 text-xs">
                        <span className="grid size-5 place-items-center rounded bg-muted font-mono text-[9px] font-bold">{ENRICHMENT_APPS[app].short}</span>
                        {ENRICHMENT_APPS[app].name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="h-7 gap-1.5 bg-background text-xs">
                      Mark as<ChevronDown className="size-3 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    {(Object.keys(VERDICT_META) as ArtifactVerdict[]).map((v) => {
                      const Icon = VERDICT_META[v].icon
                      return (
                        <DropdownMenuItem key={v} className="gap-2 text-xs">
                          <Icon className="size-3.5" />{VERDICT_META[v].label}
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" variant="outline" className="h-7 gap-1.5 bg-background text-xs">
                  <Download className="size-3" />Export
                </Button>
                <Button size="sm" variant="outline" className="h-7 gap-1.5 bg-background text-xs text-destructive hover:text-destructive">
                  <Trash2 className="size-3" />Delete
                </Button>
              </div>
            </div>
          )}

          {/* Select-all row */}
          {visible.length > 0 && (
            <div className="mb-2 flex items-center gap-3 px-1">
              <Checkbox
                checked={allVisibleChecked ? true : someVisibleChecked ? "indeterminate" : false}
                onCheckedChange={(v) => toggleAllVisible(Boolean(v))}
              />
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                {allVisibleChecked ? "Deselect all" : "Select all visible"}
              </span>
            </div>
          )}

          {/* List */}
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="mb-3 size-10 text-muted-foreground/25" />
              <p className="text-sm text-muted-foreground">No artifacts match the current filters.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {visible.map((a) => (
                <ArtifactRowItem
                  key={a.id}
                  artifact={a}
                  selected={selected.has(a.id)}
                  expanded={expanded === a.id}
                  onToggleSelect={(on) => toggleSelect(a.id, on)}
                  onToggleExpand={() => setExpanded(expanded === a.id ? null : a.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* ── Stat tile (top KPI row) ──────────────────────────────────────────────── */

function StatTile({
  label, value, tone, icon: Icon,
}: {
  label: string; value: number; tone: "muted" | "alert" | "warn" | "ok"; icon: ElementType
}) {
  const tones = {
    muted: "border bg-muted text-muted-foreground",
    alert: "border-destructive/25 bg-destructive/10 text-destructive",
    warn:  "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    ok:    "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  }[tone]
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col gap-1.5 px-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
          <div className={cn("grid size-7 shrink-0 place-items-center rounded-md", tones)}>
            <Icon className="size-3.5" />
          </div>
        </div>
        <div className="font-medium text-2xl tabular-nums leading-none tracking-tight">{value}</div>
      </CardContent>
    </Card>
  )
}

/* ── Filter pill ──────────────────────────────────────────────────────────── */

function FilterPill({
  active, onClick, count, chipClass, children,
}: {
  active: boolean; onClick: () => void; count: number; chipClass: string; children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
        active
          ? cn(chipClass, "shadow-xs")
          : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      )}
    >
      {children}
      <span className={cn(
        "rounded-full px-1.5 py-px font-mono text-[10px] font-bold tabular-nums",
        active ? "bg-current/15" : "bg-muted",
      )}>
        {count}
      </span>
    </button>
  )
}

/* ── Single artifact row ─────────────────────────────────────────────────── */

function ArtifactRowItem({
  artifact, selected, expanded, onToggleSelect, onToggleExpand,
}: {
  artifact: ArtifactRow
  selected: boolean
  expanded: boolean
  onToggleSelect: (on: boolean) => void
  onToggleExpand: () => void
}) {
  const typeMeta    = TYPE_META[artifact.type]
  const TypeIcon    = typeMeta.icon
  const verdictMeta = VERDICT_META[artifact.verdict]
  const VerdictIcon = verdictMeta.icon
  const addedBy     = artifact.addedBy
  const isOmni      = addedBy.id === "omnisense"

  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-card shadow-xs transition-all",
        selected
          ? "border-primary/40 ring-1 ring-primary/15"
          : "hover:border-primary/25 hover:shadow-sm",
      )}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Checkbox */}
        <div className="pt-1">
          <Checkbox checked={selected} onCheckedChange={(v) => onToggleSelect(Boolean(v))} aria-label="Select artifact" />
        </div>

        {/* Type icon */}
        <div className={cn("mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg border", typeMeta.box)}>
          <TypeIcon className="size-4" />
        </div>

        {/* Body */}
        <button
          type="button"
          onClick={onToggleExpand}
          className="min-w-0 flex-1 text-left"
        >
          {/* Value + type label + verdict */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold text-foreground/90 break-all">
              {artifact.value}
            </span>
            <span className={cn("rounded-md border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider", typeMeta.chip)}>
              {typeMeta.label}
            </span>
            <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold", verdictMeta.chip)}>
              <VerdictIcon className="size-2.5" />
              {verdictMeta.label}
            </span>
          </div>

          {/* Enrichment chips */}
          {artifact.enrichments.length > 0 && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {artifact.enrichments.map((e, i) => (
                <span
                  key={i}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
                    STATUS_CHIP[e.status],
                  )}
                  title={`${ENRICHMENT_APPS[e.app].name} · ${e.ranAt}`}
                >
                  <span className="font-mono font-bold">{ENRICHMENT_APPS[e.app].short}</span>
                  <span className="opacity-90">{e.summary}</span>
                </span>
              ))}
            </div>
          )}

          {/* Metadata footer */}
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground/70">
            <span className="inline-flex items-center gap-1.5">
              {isOmni ? (
                <span className="grid size-4 place-items-center rounded-full bg-linear-to-br from-primary to-chart-3 text-[8px] font-bold text-white">OS</span>
              ) : (
                <Avatar className="size-4">
                  <AvatarImage src={"photo" in addedBy ? addedBy.photo : undefined} alt={addedBy.name} />
                  <AvatarFallback className={cn("bg-linear-to-br text-[7px] font-bold text-white", "gradient" in addedBy ? addedBy.gradient : "from-muted to-muted")}>
                    {addedBy.initials}
                  </AvatarFallback>
                </Avatar>
              )}
              <span>{addedBy.name}</span>
            </span>
            <span className="text-border">·</span>
            <span>{artifact.addedAt}</span>
            <span className="text-border">·</span>
            <span>{artifact.source}</span>
            {artifact.notes && (
              <>
                <span className="text-border">·</span>
                <span className="italic">{artifact.notes}</span>
              </>
            )}
          </div>
        </button>

        {/* Action menu */}
        <div className="flex shrink-0 items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground">
                <Copy className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">Copy value</TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2 text-xs"><Play className="size-3.5 text-muted-foreground" />Run enrichment</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-44">
                  <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Threat intel</DropdownMenuLabel>
                  {ENRICHMENT_OPTIONS
                    .filter((opt) => opt.supportedTypes.includes(artifact.type))
                    .map(({ app }) => (
                      <DropdownMenuItem key={app} className="gap-2 text-xs">
                        <span className="grid size-5 place-items-center rounded bg-muted font-mono text-[9px] font-bold">{ENRICHMENT_APPS[app].short}</span>
                        {ENRICHMENT_APPS[app].name}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2 text-xs"><ShieldAlert className="size-3.5 text-muted-foreground" />Mark as</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-36">
                  {(Object.keys(VERDICT_META) as ArtifactVerdict[]).map((v) => {
                    const Icon = VERDICT_META[v].icon
                    return (
                      <DropdownMenuItem key={v} className="gap-2 text-xs">
                        <Icon className="size-3.5" />{VERDICT_META[v].label}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-xs"><Pencil className="size-3.5 text-muted-foreground" />Edit notes</DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-xs text-destructive focus:text-destructive">
                <Trash2 className="size-3.5" />Delete artifact
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && <ArtifactRowExpansion artifact={artifact} />}
    </div>
  )
}

/* ── Expanded details ─────────────────────────────────────────────────────── */

function ArtifactRowExpansion({ artifact }: { artifact: ArtifactRow }) {
  return (
    <div className="border-t bg-muted/15 px-4 py-3.5">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Enrichment timeline */}
        <div>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Enrichment timeline
          </div>
          {artifact.enrichments.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No enrichment runs yet. Use the action menu to query a threat intel provider.</p>
          ) : (
            <ul className="space-y-2">
              {artifact.enrichments.map((e, i) => (
                <li key={i} className="flex items-start gap-2.5 rounded-lg border bg-card px-2.5 py-2">
                  <span className={cn("grid size-7 shrink-0 place-items-center rounded-md border font-mono text-[9px] font-bold", STATUS_CHIP[e.status])}>
                    {ENRICHMENT_APPS[e.app].short}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold">{ENRICHMENT_APPS[e.app].name}</span>
                      <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">{e.ranAt}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{e.summary}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Raw output preview */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Raw output</span>
            <Button size="sm" variant="ghost" className="h-6 gap-1 px-2 text-[11px]">
              <Copy className="size-3" />Copy
            </Button>
          </div>
          <pre className="max-h-40 overflow-auto rounded-lg border bg-muted/30 p-3 font-mono text-[10px] leading-relaxed text-muted-foreground/90">
{rawSample(artifact)}
          </pre>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
              <ShieldAlert className="size-3" />Add to evidence
            </Button>
            <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
              <Pencil className="size-3" />Edit notes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function rawSample(a: ArtifactRow): string {
  const latest = a.enrichments[0]
  if (!latest) {
    return `{
  "artifact": "${a.value}",
  "type": "${a.type}",
  "enrichments": []
}`
  }
  return `{
  "artifact": "${a.value}",
  "type": "${a.type}",
  "verdict": "${a.verdict}",
  "latest_provider": "${ENRICHMENT_APPS[latest.app].name}",
  "summary": "${latest.summary}",
  "ran_at": "${latest.ranAt}",
  "source": "${a.source}"
}`
}
