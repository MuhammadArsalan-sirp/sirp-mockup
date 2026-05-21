import { useMemo, useState, type ElementType } from "react"
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Ban,
  Bookmark,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Filter,
  Globe,
  Hash,
  HelpCircle,
  KeyRound,
  Link2,
  Loader2,
  Mail,
  MoreHorizontal,
  Network,
  Pin,
  Play,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type {
  ArtifactRow,
  ArtifactType,
  ArtifactVerdict,
  EnrichmentApp,
  EnrichmentResult,
} from "./incident-detail-mock"

/* ── Tone tokens (mirrors overview / omnisense chemistry) ─────────────────── */

type Tone = "alert" | "warn" | "ok" | "info" | "muted"

const TONE: Record<Tone, { iconBox: string; chip: string; bg: string; text: string; dot: string; bar: string }> = {
  alert: { iconBox: "border-destructive/30 bg-destructive/10 text-destructive",                       chip: "border-destructive/25 bg-destructive/10 text-destructive",                       bg: "bg-destructive/5",       text: "text-destructive",                       dot: "bg-destructive",       bar: "bg-destructive" },
  warn:  { iconBox: "border-amber-500/30 bg-amber-500/10 text-amber-500",                             chip: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",         bg: "bg-amber-500/5",         text: "text-amber-600 dark:text-amber-400",     dot: "bg-amber-500",         bar: "bg-amber-500" },
  ok:    { iconBox: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",                       chip: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/5",       text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500",       bar: "bg-emerald-500" },
  info:  { iconBox: "border-primary/30 bg-primary/10 text-primary",                                   chip: "border-primary/25 bg-primary/10 text-primary",                                   bg: "bg-primary/5",           text: "text-primary",                           dot: "bg-primary",           bar: "bg-primary" },
  muted: { iconBox: "border bg-muted text-muted-foreground",                                          chip: "border bg-muted text-muted-foreground",                                          bg: "bg-muted/40",            text: "text-foreground",                        dot: "bg-muted-foreground/50", bar: "bg-muted-foreground/40" },
}

/* ── Verdict + type meta ───────────────────────────────────────────────────── */

const VERDICT_TONE: Record<ArtifactVerdict, Tone> = {
  malicious:  "alert",
  suspicious: "warn",
  clean:      "ok",
  unknown:    "muted",
}

const VERDICT_META: Record<ArtifactVerdict, { label: string; icon: ElementType }> = {
  malicious:  { label: "Malicious",  icon: ShieldAlert },
  suspicious: { label: "Suspicious", icon: AlertTriangle },
  clean:      { label: "Clean",      icon: ShieldCheck },
  unknown:    { label: "Unknown",    icon: HelpCircle },
}

const TYPE_META: Record<ArtifactType, { icon: ElementType; label: string }> = {
  "ip":          { icon: Globe,    label: "IP address" },
  "domain":      { icon: Globe,    label: "Domain" },
  "url":         { icon: Link2,    label: "URL" },
  "hash-md5":    { icon: Hash,     label: "MD5 hash" },
  "hash-sha1":   { icon: Hash,     label: "SHA-1 hash" },
  "hash-sha256": { icon: Hash,     label: "SHA-256 hash" },
  "email":       { icon: Mail,     label: "Email address" },
  "port":        { icon: Network,  label: "Port" },
  "file":        { icon: FileText, label: "File" },
  "filename":    { icon: Terminal, label: "Process / command" },
  "user":        { icon: User,     label: "User account" },
  "registry":    { icon: KeyRound, label: "Registry key" },
}

const ENRICHMENT_APP_LABEL: Record<EnrichmentApp, string> = {
  virustotal:     "VirusTotal",
  abuseipdb:      "AbuseIPDB",
  threatfox:      "ThreatFox",
  shodan:         "Shodan",
  mandiant:       "Mandiant",
  alienvault:     "AlienVault",
  urlscan:        "urlscan.io",
  hybridanalysis: "Hybrid Analysis",
}

const ENRICHMENT_STATUS_TONE: Record<EnrichmentResult["status"], Tone> = {
  malicious:  "alert",
  suspicious: "warn",
  clean:      "ok",
  pending:    "muted",
}

/* ── Panel ────────────────────────────────────────────────────────────────── */

export function ArtifactsPanel({ artifacts }: { artifacts: ArtifactRow[] }) {
  const [search, setSearch]         = useState("")
  const [filterTypes, setFilterTypes]       = useState<Set<ArtifactType>>(new Set())
  const [filterVerdicts, setFilterVerdicts] = useState<Set<ArtifactVerdict>>(new Set())
  const [selectedIds, setSelectedIds]       = useState<Set<string>>(new Set())
  const [focusedId, setFocusedId]   = useState<string | null>(artifacts[0]?.id ?? null)

  const filtered = useMemo(() => {
    const s = search.toLowerCase()
    return artifacts.filter((a) => {
      if (s && !a.value.toLowerCase().includes(s)) return false
      if (filterTypes.size > 0 && !filterTypes.has(a.type)) return false
      if (filterVerdicts.size > 0 && !filterVerdicts.has(a.verdict)) return false
      return true
    })
  }, [artifacts, search, filterTypes, filterVerdicts])

  const stats = useMemo(() => ({
    total:      artifacts.length,
    malicious:  artifacts.filter((a) => a.verdict === "malicious").length,
    suspicious: artifacts.filter((a) => a.verdict === "suspicious").length,
    clean:      artifacts.filter((a) => a.verdict === "clean").length,
    unknown:    artifacts.filter((a) => a.verdict === "unknown").length,
  }), [artifacts])

  const focused = focusedId ? artifacts.find((a) => a.id === focusedId) ?? null : null
  const activeFilterCount = filterTypes.size + filterVerdicts.size

  const toggleSelected = (id: string, on: boolean) => setSelectedIds((s) => {
    const next = new Set(s); if (on) next.add(id); else next.delete(id); return next
  })
  const toggleAllVisible = (on: boolean) => setSelectedIds((s) => {
    const next = new Set(s)
    for (const a of filtered) { if (on) next.add(a.id); else next.delete(a.id) }
    return next
  })

  const allVisibleSelected = filtered.length > 0 && filtered.every((a) => selectedIds.has(a.id))
  const someVisibleSelected = filtered.some((a) => selectedIds.has(a.id))

  return (
    <div className="space-y-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">

      {/* ══ 1. HEADER CARD ════════════════════════════════════════════════════ */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Top row */}
          <div className="flex flex-wrap items-center gap-3 border-b px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="grid size-8 shrink-0 place-items-center rounded-lg border bg-muted text-muted-foreground">
                <FileText className="size-4" />
              </div>
              <div>
                <div className="text-sm font-semibold leading-tight tracking-tight">Artifacts</div>
                <div className="text-[11px] text-muted-foreground">
                  Indicators of compromise · {stats.total} total
                </div>
              </div>
            </div>

            {/* Inline count strip — quiet, just dots + counts + muted labels */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <VerdictCount tone="alert" count={stats.malicious}  label="malicious"  />
              <VerdictCount tone="warn"  count={stats.suspicious} label="suspicious" />
              <VerdictCount tone="ok"    count={stats.clean}      label="clean"      />
              <VerdictCount tone="muted" count={stats.unknown}    label="unknown"    />
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="h-8 gap-1.5 px-3 text-xs">
                    <Plus className="size-3" />
                    Add artifact
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
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2 px-5 py-3">
            {/* Search */}
            <div className="flex flex-1 items-center gap-2 rounded-lg border bg-background px-3 py-1.5 transition focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20">
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

            {/* Filters */}
            <FiltersPopover
              filterTypes={filterTypes}
              filterVerdicts={filterVerdicts}
              onTypesChange={setFilterTypes}
              onVerdictsChange={setFilterVerdicts}
              activeCount={activeFilterCount}
              typeCounts={countsByKey(artifacts, "type")}
              verdictCounts={countsByKey(artifacts, "verdict")}
            />
          </div>
        </CardContent>
      </Card>

      {/* ══ 2. LIST + DOSSIER ════════════════════════════════════════════════ */}
      <div className="grid items-start gap-4 lg:grid-cols-[360px_1fr]">

        <ArtifactList
          artifacts={filtered}
          totalCount={artifacts.length}
          focusedId={focusedId}
          onFocus={setFocusedId}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelected}
          onToggleAll={toggleAllVisible}
          allSelected={allVisibleSelected}
          someSelected={someVisibleSelected}
        />

        <div className="space-y-4">
          {focused
            ? <ArtifactDossier artifact={focused} onBack={() => setFocusedId(null)} />
            : <ArtifactSummary stats={stats} recent={artifacts.slice(0, 5)} />}
        </div>
      </div>

      {/* Floating bulk action bar (only when selection exists) */}
      {selectedIds.size > 0 && (
        <div className="sticky bottom-4 z-20 mx-auto flex max-w-fit items-center gap-2 rounded-xl border border-primary/30 bg-card px-3 py-2 shadow-lg ring-1 ring-primary/10">
          <span className="font-mono text-xs font-semibold tabular-nums text-primary">
            {selectedIds.size} selected
          </span>
          <span className="h-4 w-px bg-border" />
          <Button size="sm" className="h-7 gap-1.5 px-2.5 text-[11px]">
            <Play className="size-3" />
            Run enrichment
          </Button>
          <Button size="sm" variant="outline" className="h-7 gap-1.5 px-2.5 text-[11px]">
            <Check className="size-3" />
            Mark verdict
          </Button>
          <Button size="sm" variant="outline" className="h-7 gap-1.5 px-2.5 text-[11px]">
            <Download className="size-3" />
            Export
          </Button>
          <Button size="sm" variant="ghost" className="h-7 gap-1.5 px-2.5 text-[11px] text-destructive hover:text-destructive">
            <Trash2 className="size-3" />
            Delete
          </Button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-1 text-muted-foreground/70 hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Helper: counts by key ─────────────────────────────────────────────────── */

function countsByKey<T, K extends keyof T>(rows: T[], key: K): Map<T[K], number> {
  const m = new Map<T[K], number>()
  for (const r of rows) m.set(r[key], (m.get(r[key]) ?? 0) + 1)
  return m
}

/* ── Header verdict count (quiet dot + count + muted label) ────────────────── */

function VerdictCount({ tone, count, label }: { tone: Tone; count: number; label: string }) {
  const t = TONE[tone]
  const dimmed = count === 0
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 text-[11px]",
      dimmed && "opacity-40",
    )}>
      <span className={cn("size-1.5 shrink-0 rounded-full", t.dot)} />
      <span className="font-mono font-semibold tabular-nums">{count}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  )
}

/* ── Filters popover ──────────────────────────────────────────────────────── */

function FiltersPopover({
  filterTypes, filterVerdicts, onTypesChange, onVerdictsChange, activeCount, typeCounts, verdictCounts,
}: {
  filterTypes: Set<ArtifactType>
  filterVerdicts: Set<ArtifactVerdict>
  onTypesChange: (s: Set<ArtifactType>) => void
  onVerdictsChange: (s: Set<ArtifactVerdict>) => void
  activeCount: number
  typeCounts: Map<ArtifactType, number>
  verdictCounts: Map<ArtifactVerdict, number>
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 gap-1.5 px-3 text-xs">
          <Filter className="size-3" />
          Filters
          {activeCount > 0 && (
            <span className="ml-1 inline-flex size-4 items-center justify-center rounded-full bg-primary font-mono text-[9px] font-bold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <div className="border-b px-3 py-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Filters</span>
            {activeCount > 0 && (
              <button
                onClick={() => { onTypesChange(new Set()); onVerdictsChange(new Set()) }}
                className="text-[10px] font-medium text-primary hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        <div className="border-b px-3 py-2.5">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Verdict</div>
          <div className="space-y-1">
            {(Object.keys(VERDICT_META) as ArtifactVerdict[]).map((v) => {
              const checked = filterVerdicts.has(v)
              const count = verdictCounts.get(v) ?? 0
              const tone = VERDICT_TONE[v]
              const t = TONE[tone]
              return (
                <label key={v} className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 hover:bg-muted/40">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(c) => {
                      const next = new Set(filterVerdicts)
                      if (c) next.add(v); else next.delete(v)
                      onVerdictsChange(next)
                    }}
                    className="size-3.5"
                  />
                  <span className={cn("size-1.5 rounded-full", t.dot)} />
                  <span className="flex-1 text-xs capitalize">{VERDICT_META[v].label}</span>
                  <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">{count}</span>
                </label>
              )
            })}
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto px-3 py-2.5">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Type</div>
          <div className="space-y-1">
            {(Object.keys(TYPE_META) as ArtifactType[])
              .filter((t) => (typeCounts.get(t) ?? 0) > 0)
              .map((t) => {
                const checked = filterTypes.has(t)
                const TypeIcon = TYPE_META[t].icon
                const count = typeCounts.get(t) ?? 0
                return (
                  <label key={t} className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 hover:bg-muted/40">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(c) => {
                        const next = new Set(filterTypes)
                        if (c) next.add(t); else next.delete(t)
                        onTypesChange(next)
                      }}
                      className="size-3.5"
                    />
                    <TypeIcon className="size-3 shrink-0 text-muted-foreground/70" />
                    <span className="flex-1 text-xs">{TYPE_META[t].label}</span>
                    <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">{count}</span>
                  </label>
                )
              })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/* ── Artifact list (left sidebar) ─────────────────────────────────────────── */

function ArtifactList({
  artifacts, totalCount, focusedId, onFocus, selectedIds, onToggleSelect, onToggleAll, allSelected, someSelected,
}: {
  artifacts: ArtifactRow[]
  totalCount: number
  focusedId: string | null
  onFocus: (id: string | null) => void
  selectedIds: Set<string>
  onToggleSelect: (id: string, on: boolean) => void
  onToggleAll: (on: boolean) => void
  allSelected: boolean
  someSelected: boolean
}) {
  return (
    <Card className="overflow-hidden shadow-sm lg:sticky lg:top-2 lg:max-h-[calc(100vh-1rem)]">
      <CardContent className="flex max-h-full flex-col p-0 lg:max-h-[calc(100vh-1rem)]">

        {/* List header: select-all + count */}
        <div className="shrink-0 border-b bg-card px-4 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={(c) => onToggleAll(!!c)}
                className="size-3.5"
              />
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {selectedIds.size > 0 ? `${selectedIds.size} selected` : "Select all"}
              </span>
            </label>
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground/70">
              {artifacts.length}/{totalCount}
            </span>
          </div>
        </div>

        {/* Scrollable list */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {artifacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
              <div className="grid size-10 place-items-center rounded-xl border bg-muted text-muted-foreground/50">
                <Search className="size-5" />
              </div>
              <p className="text-sm font-medium">No artifacts match your filters</p>
              <p className="text-xs text-muted-foreground">Try clearing search or filter chips.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {artifacts.map((a) => (
                <ArtifactListRow
                  key={a.id}
                  artifact={a}
                  selected={selectedIds.has(a.id)}
                  focused={a.id === focusedId}
                  onToggleSelect={(on) => onToggleSelect(a.id, on)}
                  onFocus={() => onFocus(a.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ArtifactListRow({
  artifact, selected, focused, onToggleSelect, onFocus,
}: {
  artifact: ArtifactRow
  selected: boolean
  focused: boolean
  onToggleSelect: (on: boolean) => void
  onFocus: () => void
}) {
  const verdictTone = VERDICT_TONE[artifact.verdict]
  const vt = TONE[verdictTone]
  const TypeIcon = TYPE_META[artifact.type].icon

  return (
    <li
      className={cn(
        "group relative flex cursor-pointer items-start gap-2 px-3 py-2.5 transition",
        focused ? "bg-primary/5" : "hover:bg-muted/30",
      )}
      onClick={onFocus}
    >
      {/* Left accent stripe for focused */}
      {focused && <span className="absolute inset-y-0 left-0 w-0.5 bg-primary" />}

      {/* Checkbox */}
      <Checkbox
        checked={selected}
        onCheckedChange={(c) => onToggleSelect(!!c)}
        onClick={(e) => e.stopPropagation()}
        className="mt-2 size-3.5 shrink-0"
      />

      {/* Type icon */}
      <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border bg-muted text-muted-foreground">
        <TypeIcon className="size-3.5" />
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1">
        {/* Value (mono, truncated) */}
        <div className="truncate font-mono text-xs font-semibold leading-tight">
          {artifact.value}
        </div>

        {/* Type label + tone-colored verdict text (no bg/border) */}
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground/70">{TYPE_META[artifact.type].label}</span>
          <span className="text-muted-foreground/30">·</span>
          <span className={cn(
            "text-[10px] font-semibold uppercase tracking-wider",
            vt.text,
          )}>
            {VERDICT_META[artifact.verdict].label}
          </span>
        </div>

        {/* Enrichment dots + source + when */}
        <div className="mt-1.5 flex items-center gap-2">
          {artifact.enrichments.length > 0 ? (
            <div className="flex items-center gap-0.5">
              {artifact.enrichments.slice(0, 6).map((e, i) => {
                const tone = ENRICHMENT_STATUS_TONE[e.status]
                const t = TONE[tone]
                return (
                  <span
                    key={i}
                    title={`${ENRICHMENT_APP_LABEL[e.app]} · ${e.status}`}
                    className={cn(
                      "size-1.5 rounded-full",
                      t.dot,
                      e.status === "pending" && "animate-pulse",
                    )}
                  />
                )
              })}
              {artifact.enrichments.length > 6 && (
                <span className="font-mono text-[9px] text-muted-foreground/50">+{artifact.enrichments.length - 6}</span>
              )}
            </div>
          ) : (
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground/40">No enrichment</span>
          )}
          <span className="ml-auto truncate text-[9px] text-muted-foreground/60">
            {artifact.source} · {artifact.when}
          </span>
        </div>
      </div>
    </li>
  )
}

/* ── Empty-state summary (right pane when no artifact is focused) ──────────── */

function ArtifactSummary({ stats, recent }: {
  stats: { total: number; malicious: number; suspicious: number; clean: number; unknown: number }
  recent: ArtifactRow[]
}) {
  const verdictBars = [
    { label: "Malicious",  count: stats.malicious,  tone: "alert" as Tone },
    { label: "Suspicious", count: stats.suspicious, tone: "warn"  as Tone },
    { label: "Clean",      count: stats.clean,      tone: "ok"    as Tone },
    { label: "Unknown",    count: stats.unknown,    tone: "muted" as Tone },
  ]
  const total = stats.total || 1

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="px-5 py-5">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
              <Pin className="size-4" />
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight tracking-tight">No artifact selected</div>
              <div className="text-[11px] text-muted-foreground">Pick an artifact on the left to inspect its enrichment, relations, and activity.</div>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Verdict distribution</div>
            {verdictBars.map((v) => {
              const t = TONE[v.tone]
              const pct = Math.round((v.count / total) * 100)
              return (
                <div key={v.label} className="flex items-center gap-3">
                  <span className="w-22 shrink-0 text-xs">{v.label}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/40">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700 ease-out", t.bar)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right font-mono text-xs tabular-nums">{v.count}<span className="text-muted-foreground/60"> · {pct}%</span></span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {recent.length > 0 && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Recently added</div>
              <span className="font-mono text-xs text-muted-foreground/70">top {recent.length}</span>
            </div>
            <ul className="divide-y">
              {recent.map((a) => {
                const tone = VERDICT_TONE[a.verdict]
                const t = TONE[tone]
                const TypeIcon = TYPE_META[a.type].icon
                return (
                  <li key={a.id} className="flex items-center gap-3 px-5 py-2.5">
                    <div className="grid size-7 shrink-0 place-items-center rounded-lg border bg-muted text-muted-foreground">
                      <TypeIcon className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-mono text-xs font-medium">{a.value}</div>
                      <div className="text-[10px] text-muted-foreground/70">{TYPE_META[a.type].label} · {a.source} · {a.when}</div>
                    </div>
                    <span className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider",
                      t.text,
                    )}>
                      <span className={cn("size-1.5 rounded-full", t.dot)} />
                      {VERDICT_META[a.verdict].label}
                    </span>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </>
  )
}

/* ── Artifact dossier (right pane when an artifact is focused) ─────────────── */

function ArtifactDossier({ artifact, onBack }: { artifact: ArtifactRow; onBack: () => void }) {
  const verdictTone = VERDICT_TONE[artifact.verdict]
  const vt = TONE[verdictTone]
  const VerdictIcon = VERDICT_META[artifact.verdict].icon
  const TypeIcon = TYPE_META[artifact.type].icon

  return (
    <>
      {/* Dossier header */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Back link + id */}
          <div className="flex items-center justify-between gap-3 border-b bg-muted/15 px-5 py-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3" />
              Back to summary
            </button>
            <span className="font-mono text-[10px] text-muted-foreground/60">artifact_id: {artifact.id}</span>
          </div>

          {/* Value + type */}
          <div className="px-5 py-4">
            <div className="flex items-start gap-3.5">
              <div className="grid size-12 shrink-0 place-items-center rounded-xl border bg-muted text-muted-foreground">
                <TypeIcon className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="break-all font-mono text-lg font-semibold leading-tight tracking-tight">
                  {artifact.value}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-muted-foreground">{TYPE_META[artifact.type].label}</span>
                  <span className="text-muted-foreground/30">·</span>
                  <span className="text-muted-foreground">{artifact.source}</span>
                  <span className="text-muted-foreground/30">·</span>
                  <span className="font-mono text-muted-foreground/70">added {artifact.when}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Verdict callout */}
          <div className={cn("border-t px-5 py-3", vt.bg)}>
            <div className="flex items-center gap-3">
              <div className={cn("grid size-9 shrink-0 place-items-center rounded-lg border", vt.iconBox)}>
                <VerdictIcon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className={cn("text-sm font-semibold", vt.text)}>{VERDICT_META[artifact.verdict].label}</div>
                <div className="text-[11px] text-muted-foreground">
                  {verdictSummary(artifact)}
                </div>
              </div>
              <span className="shrink-0 font-mono text-[10px] text-muted-foreground/60">
                {artifact.enrichments.length} source{artifact.enrichments.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {/* Action toolbar */}
          <div className="flex flex-wrap items-center gap-2 border-t bg-card px-5 py-2.5">
            <Button size="sm" className="h-8 gap-1.5 px-3 text-xs">
              <Play className="size-3" />
              Run enrichment
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 gap-1.5 px-3 text-xs">
                  <Bookmark className="size-3" />
                  Mark verdict
                  <ChevronDown className="size-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                {(Object.keys(VERDICT_META) as ArtifactVerdict[]).map((v) => {
                  const VIcon = VERDICT_META[v].icon
                  const t = TONE[VERDICT_TONE[v]]
                  return (
                    <DropdownMenuItem key={v} className="gap-2 text-xs">
                      <span className={cn("grid size-4 place-items-center rounded border", t.iconBox)}>
                        <VIcon className="size-2.5" />
                      </span>
                      {VERDICT_META[v].label}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="h-8 gap-1.5 px-3 text-xs">
              <Network className="size-3" />
              Pivot in OmniMap
            </Button>
            <Button size="sm" variant="ghost" className="h-8 gap-1.5 px-3 text-xs text-muted-foreground">
              <Copy className="size-3" />
              Copy
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="ml-auto h-8 w-8 p-0 text-muted-foreground">
                  <MoreHorizontal className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem className="gap-2 text-xs"><Ban className="size-3.5 text-muted-foreground" />Add to deny-list</DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-xs"><ShieldCheck className="size-3.5 text-muted-foreground" />Add to allow-list</DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-xs"><Download className="size-3.5 text-muted-foreground" />Download enrichment</DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-xs"><ExternalLink className="size-3.5 text-muted-foreground" />Open in external tool</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-xs text-destructive focus:text-destructive">
                  <Trash2 className="size-3.5" />Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Enrichment sources */}
      <EnrichmentSourcesCard enrichments={artifact.enrichments} type={artifact.type} />

      {/* Related */}
      <RelatedCard artifact={artifact} />

      {/* Activity timeline */}
      <ActivityCard artifact={artifact} />

      {/* Notes */}
      {artifact.notes && <NotesCard notes={artifact.notes} />}
    </>
  )
}

/* ── Verdict summary helper ────────────────────────────────────────────────── */

function verdictSummary(a: ArtifactRow): string {
  const mal = a.enrichments.filter((e) => e.status === "malicious").length
  const sus = a.enrichments.filter((e) => e.status === "suspicious").length
  const clean = a.enrichments.filter((e) => e.status === "clean").length
  if (a.verdict === "malicious") {
    return `${mal} of ${a.enrichments.length} sources flagged this artifact as malicious.`
  }
  if (a.verdict === "suspicious") {
    return `${sus + mal} of ${a.enrichments.length} sources returned non-clean verdicts. Review recommended.`
  }
  if (a.verdict === "clean") {
    return clean > 0 ? `${clean} sources confirmed clean. No further action.` : "Marked clean by analyst review."
  }
  return "Insufficient enrichment data. Run additional sources to determine verdict."
}

/* ── Enrichment sources card ───────────────────────────────────────────────── */

function EnrichmentSourcesCard({ enrichments, type }: { enrichments: EnrichmentResult[]; type: ArtifactType }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-primary" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Enrichment Sources</span>
            <span className="font-mono text-xs text-muted-foreground/70">{enrichments.length}</span>
          </div>
          <Button size="sm" variant="outline" className="h-7 gap-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-wider">
            <Plus className="size-3" />
            Run additional
          </Button>
        </div>
        {enrichments.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm font-medium">No enrichment yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Run enrichment to query threat-intel sources for this {TYPE_META[type].label.toLowerCase()}.</p>
            <Button size="sm" className="mt-3 gap-1.5">
              <Play className="size-3" />
              Run enrichment
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {enrichments.map((e, i) => (
              <EnrichmentSourceRow key={i} result={e} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function EnrichmentSourceRow({ result }: { result: EnrichmentResult }) {
  const tone = ENRICHMENT_STATUS_TONE[result.status]
  const t = TONE[tone]
  const [showRaw, setShowRaw] = useState(false)
  const isPending = result.status === "pending"

  return (
    <div className="flex items-start gap-3 px-5 py-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-lg border bg-muted text-muted-foreground">
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Globe className="size-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold leading-tight">{ENRICHMENT_APP_LABEL[result.app]}</span>
          <span className={cn(
            "inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider",
            t.text,
          )}>
            <span className={cn("size-1.5 rounded-full", t.dot, isPending && "animate-pulse")} />
            {result.status}
          </span>
          <span className="ml-auto font-mono text-[10px] text-muted-foreground/60">{result.ranAt}</span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{result.summary}</p>
        <div className="mt-1.5 flex items-center gap-3">
          <button
            onClick={() => setShowRaw((v) => !v)}
            className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 hover:text-primary"
          >
            <Code2 className="size-3" />
            {showRaw ? "Hide raw" : "View raw"}
          </button>
          <button className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 hover:text-primary">
            <ExternalLink className="size-3" />
            Open in {ENRICHMENT_APP_LABEL[result.app]}
          </button>
        </div>
        {showRaw && (
          <pre className="mt-2 overflow-x-auto rounded-lg border bg-muted/30 px-3 py-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
{JSON.stringify({ app: result.app, status: result.status, summary: result.summary, ranAt: result.ranAt }, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}

/* ── Related card ─────────────────────────────────────────────────────────── */

function RelatedCard({ artifact }: { artifact: ArtifactRow }) {
  // Mock related data — varies slightly by verdict so the dossier feels alive.
  const related = {
    entities: artifact.verdict === "clean" ? 0 : 2,
    alerts:   artifact.verdict === "malicious" ? 3 : 1,
    similar:  artifact.verdict === "unknown" ? 0 : 1,
  }
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-2">
            <Network className="size-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Related</span>
          </div>
        </div>
        <div className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
          <RelatedTile icon={CircleDot}  label="Linked entities" count={related.entities} hint="Hosts and users where this artifact was observed" />
          <RelatedTile icon={Activity}   label="Linked alerts"   count={related.alerts}   hint="Alerts that surfaced this indicator" />
          <RelatedTile icon={Hash}       label="Similar in tenant" count={related.similar} hint="Other artifacts sharing IoC family or campaign" />
        </div>
      </CardContent>
    </Card>
  )
}

function RelatedTile({ icon: Icon, label, count, hint }: { icon: ElementType; label: string; count: number; hint: string }) {
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

/* ── Activity timeline ────────────────────────────────────────────────────── */

function ActivityCard({ artifact }: { artifact: ArtifactRow }) {
  // Compose mock timeline from artifact data
  const events = [
    {
      kind: "added",
      icon: Plus,
      title: "Artifact added",
      detail: `from ${artifact.source}`,
      actor: artifact.addedBy,
      when: artifact.when,
    },
    ...artifact.enrichments.map((e) => ({
      kind: "enrichment",
      icon: Globe,
      title: `${ENRICHMENT_APP_LABEL[e.app]} returned ${e.status}`,
      detail: e.summary,
      actor: null as ArtifactRow["addedBy"] | null,
      when: e.ranAt,
    })),
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
                    <div className="relative z-10 grid size-6 shrink-0 place-items-center rounded-full border-2 border-card bg-primary/10 text-primary">
                      <EvIcon className="size-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-sm font-medium leading-snug">{ev.title}</span>
                        <span className="ml-auto font-mono text-[10px] text-muted-foreground/60">{ev.when}</span>
                      </div>
                      {ev.detail && (
                        <p className="text-xs leading-relaxed text-muted-foreground">{ev.detail}</p>
                      )}
                      {ev.actor && (
                        <div className="mt-1 flex items-center gap-1.5">
                          <Avatar className="size-4">
                            {("photo" in ev.actor && ev.actor.photo) && <AvatarImage src={ev.actor.photo} alt={ev.actor.name} />}
                            <AvatarFallback className={cn("bg-linear-to-br text-[7px] font-bold text-white", ev.actor.gradient)}>
                              {ev.actor.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[10px] text-muted-foreground">{ev.actor.name}</span>
                        </div>
                      )}
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

/* ── Notes card ───────────────────────────────────────────────────────────── */

function NotesCard({ notes }: { notes: string }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="px-5 py-4">
        <div className="mb-2 flex items-center gap-2">
          <FileText className="size-3.5 text-muted-foreground" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Notes</span>
        </div>
        <p className="text-sm leading-relaxed text-foreground/85">{notes}</p>
      </CardContent>
    </Card>
  )
}
