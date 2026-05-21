import { useMemo, useState, type ElementType } from "react"
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bell,
  Building2,
  ChevronRight,
  CircleDot,
  Cloud,
  Copy,
  Cpu,
  ExternalLink,
  FileText,
  Filter,
  Globe,
  HelpCircle,
  Layers,
  Monitor,
  MoreHorizontal,
  Network,
  Pin,
  Plus,
  Power,
  Search,
  Server,
  Shield,
  ShieldAlert,
  Sparkles,
  Trash2,
  UserCheck,
  X,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import type { EntityRow } from "./incident-detail-mock"

/* ── Tone tokens ──────────────────────────────────────────────────────────── */

type Tone = "alert" | "warn" | "ok" | "info" | "muted"

const TONE: Record<Tone, { iconBox: string; chip: string; bg: string; text: string; dot: string; bar: string }> = {
  alert: { iconBox: "border-destructive/30 bg-destructive/10 text-destructive",                       chip: "border-destructive/25 bg-destructive/10 text-destructive",                       bg: "bg-destructive/5",  text: "text-destructive",                       dot: "bg-destructive",       bar: "bg-destructive" },
  warn:  { iconBox: "border-amber-500/30 bg-amber-500/10 text-amber-500",                             chip: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",         bg: "bg-amber-500/5",     text: "text-amber-600 dark:text-amber-400",     dot: "bg-amber-500",         bar: "bg-amber-500" },
  ok:    { iconBox: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",                       chip: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/5",   text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500",       bar: "bg-emerald-500" },
  info:  { iconBox: "border-primary/30 bg-primary/10 text-primary",                                   chip: "border-primary/25 bg-primary/10 text-primary",                                   bg: "bg-primary/5",       text: "text-primary",                           dot: "bg-primary",           bar: "bg-primary" },
  muted: { iconBox: "border bg-muted text-muted-foreground",                                          chip: "border bg-muted text-muted-foreground",                                          bg: "bg-muted/40",        text: "text-foreground",                        dot: "bg-muted-foreground/50", bar: "bg-muted-foreground/40" },
}

/* ── Risk & type meta ─────────────────────────────────────────────────────── */

const RISK_TONE: Record<EntityRow["risk"], Tone> = {
  critical: "alert",
  high:     "warn",
  medium:   "info",
  low:      "muted",
}

const RISK_META: Record<EntityRow["risk"], { label: string; icon: ElementType; detail: (e: EntityRow) => string }> = {
  critical: { label: "Critical", icon: ShieldAlert,
    detail: (e) => `${e.type} with critical exposure. Immediate containment recommended — confirmed lateral pathway from this entity.` },
  high:     { label: "High",     icon: AlertTriangle,
    detail: (e) => `${e.type} flagged as high risk based on recent signals. Owner review recommended within 2h.` },
  medium:   { label: "Medium",   icon: Shield,
    detail: (e) => `${e.type} showed anomalous activity but no confirmed compromise. Continue monitoring.` },
  low:      { label: "Low",      icon: HelpCircle,
    detail: () => "Entity is in scope but no concerning signals. Tracked for context only." },
}

const ENTITY_TYPE_ICON: Record<string, ElementType> = {
  "Host":              Monitor,
  "Domain controller": Server,
  "Server":            Server,
  "SaaS":              Cloud,
  "Workstation":       Monitor,
  "User":              Building2,
}

/* ── Panel ────────────────────────────────────────────────────────────────── */

export function EntitiesPanel({ entities }: { entities: EntityRow[] }) {
  const [search, setSearch]   = useState("")
  const [filterRisks, setFilterRisks] = useState<Set<EntityRow["risk"]>>(new Set())
  const [filterTypes, setFilterTypes] = useState<Set<string>>(new Set())
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [focusedId, setFocusedId] = useState<string | null>(entities[0]?.id ?? null)

  const filtered = useMemo(() => {
    const s = search.toLowerCase()
    return entities.filter((e) => {
      if (s && !`${e.name} ${e.ip ?? ""} ${e.type}`.toLowerCase().includes(s)) return false
      if (filterRisks.size > 0 && !filterRisks.has(e.risk)) return false
      if (filterTypes.size > 0 && !filterTypes.has(e.type)) return false
      return true
    })
  }, [entities, search, filterRisks, filterTypes])

  const stats = useMemo(() => ({
    total:    entities.length,
    critical: entities.filter((e) => e.risk === "critical").length,
    high:     entities.filter((e) => e.risk === "high").length,
    medium:   entities.filter((e) => e.risk === "medium").length,
    low:      entities.filter((e) => e.risk === "low").length,
  }), [entities])

  const focused = focusedId ? entities.find((e) => e.id === focusedId) ?? null : null
  const activeFilterCount = filterRisks.size + filterTypes.size

  const toggleSelected = (id: string, on: boolean) => setSelectedIds((s) => {
    const next = new Set(s); if (on) next.add(id); else next.delete(id); return next
  })
  const toggleAllVisible = (on: boolean) => setSelectedIds((s) => {
    const next = new Set(s)
    for (const e of filtered) { if (on) next.add(e.id); else next.delete(e.id) }
    return next
  })
  const allSelected = filtered.length > 0 && filtered.every((e) => selectedIds.has(e.id))
  const someSelected = filtered.some((e) => selectedIds.has(e.id))

  const typeCounts = useMemo(() => {
    const m = new Map<string, number>()
    for (const e of entities) m.set(e.type, (m.get(e.type) ?? 0) + 1)
    return m
  }, [entities])
  const riskCounts = useMemo(() => {
    const m = new Map<EntityRow["risk"], number>()
    for (const e of entities) m.set(e.risk, (m.get(e.risk) ?? 0) + 1)
    return m
  }, [entities])

  return (
    <div className="space-y-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">

      {/* ══ 1. HEADER ════════════════════════════════════════════════════════ */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-3 border-b px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="grid size-8 shrink-0 place-items-center rounded-lg border bg-muted text-muted-foreground">
                <Layers className="size-4" />
              </div>
              <div>
                <div className="text-sm font-semibold leading-tight tracking-tight">Affected Entities</div>
                <div className="text-[11px] text-muted-foreground">
                  Hosts, accounts, and services touched by this incident · {stats.total} total
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <RiskCountPill tone="alert" count={stats.critical} label="Critical" />
              <RiskCountPill tone="warn"  count={stats.high}     label="High" />
              <RiskCountPill tone="info"  count={stats.medium}   label="Medium" />
              <RiskCountPill tone="muted" count={stats.low}      label="Low" />
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-2">
              <Button size="sm" variant="outline" className="h-8 gap-1.5 px-3 text-xs">
                <Plus className="size-3" />
                Create entity
              </Button>
              <Button size="sm" className="h-8 gap-1.5 px-3 text-xs">
                <Plus className="size-3" />
                Add affected
              </Button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2 px-5 py-3">
            <div className="flex flex-1 items-center gap-2 rounded-lg border bg-background px-3 py-1.5 transition focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20">
              <Search className="size-3.5 shrink-0 text-muted-foreground/50" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, IP, or type…"
                className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/40"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-muted-foreground/50 hover:text-foreground">
                  <X className="size-3" />
                </button>
              )}
            </div>

            <FiltersPopover
              filterRisks={filterRisks}
              filterTypes={filterTypes}
              onRisksChange={setFilterRisks}
              onTypesChange={setFilterTypes}
              activeCount={activeFilterCount}
              riskCounts={riskCounts}
              typeCounts={typeCounts}
            />
          </div>
        </CardContent>
      </Card>

      {/* ══ 2. LIST + DOSSIER ════════════════════════════════════════════════ */}
      <div className="grid items-start gap-4 lg:grid-cols-[360px_1fr]">

        <EntityList
          entities={filtered}
          totalCount={entities.length}
          focusedId={focusedId}
          onFocus={setFocusedId}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelected}
          onToggleAll={toggleAllVisible}
          allSelected={allSelected}
          someSelected={someSelected}
        />

        <div className="space-y-4">
          {focused
            ? <EntityDossier entity={focused} onBack={() => setFocusedId(null)} />
            : <EntitySummary stats={stats} recent={entities.slice(0, 5)} />}
        </div>
      </div>

      {/* Floating bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="sticky bottom-4 z-20 mx-auto flex max-w-fit items-center gap-2 rounded-xl border border-primary/30 bg-card px-3 py-2 shadow-lg ring-1 ring-primary/10">
          <span className="font-mono text-xs font-semibold tabular-nums text-primary">
            {selectedIds.size} selected
          </span>
          <span className="h-4 w-px bg-border" />
          <Button size="sm" className="h-7 gap-1.5 px-2.5 text-[11px]">
            <Power className="size-3" />
            Quarantine
          </Button>
          <Button size="sm" variant="outline" className="h-7 gap-1.5 px-2.5 text-[11px]">
            <UserCheck className="size-3" />
            Notify owners
          </Button>
          <Button size="sm" variant="ghost" className="h-7 gap-1.5 px-2.5 text-[11px] text-destructive hover:text-destructive">
            <Trash2 className="size-3" />
            Remove
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

/* ── Header risk count pill ───────────────────────────────────────────────── */

function RiskCountPill({ tone, count, label }: { tone: Tone; count: number; label: string }) {
  const t = TONE[tone]
  const dimmed = count === 0
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
      t.chip,
      dimmed && "opacity-40",
    )}>
      <span className={cn("size-1.5 rounded-full", t.dot)} />
      <span className="font-mono tabular-nums">{count}</span>
      <span>{label}</span>
    </span>
  )
}

/* ── Filters popover ──────────────────────────────────────────────────────── */

function FiltersPopover({
  filterRisks, filterTypes, onRisksChange, onTypesChange, activeCount, riskCounts, typeCounts,
}: {
  filterRisks: Set<EntityRow["risk"]>
  filterTypes: Set<string>
  onRisksChange: (s: Set<EntityRow["risk"]>) => void
  onTypesChange: (s: Set<string>) => void
  activeCount: number
  riskCounts: Map<EntityRow["risk"], number>
  typeCounts: Map<string, number>
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
                onClick={() => { onRisksChange(new Set()); onTypesChange(new Set()) }}
                className="text-[10px] font-medium text-primary hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        <div className="border-b px-3 py-2.5">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Risk</div>
          <div className="space-y-1">
            {(["critical", "high", "medium", "low"] as EntityRow["risk"][]).map((r) => {
              const checked = filterRisks.has(r)
              const count = riskCounts.get(r) ?? 0
              const tone = RISK_TONE[r]
              const t = TONE[tone]
              return (
                <label key={r} className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 hover:bg-muted/40">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(c) => {
                      const next = new Set(filterRisks)
                      if (c) next.add(r); else next.delete(r)
                      onRisksChange(next)
                    }}
                    className="size-3.5"
                  />
                  <span className={cn("size-1.5 rounded-full", t.dot)} />
                  <span className="flex-1 text-xs capitalize">{RISK_META[r].label}</span>
                  <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">{count}</span>
                </label>
              )
            })}
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto px-3 py-2.5">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Type</div>
          <div className="space-y-1">
            {Array.from(typeCounts.keys()).map((t) => {
              const checked = filterTypes.has(t)
              const TypeIcon = ENTITY_TYPE_ICON[t] ?? Cpu
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
                  <span className="flex-1 text-xs">{t}</span>
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

/* ── Entity list (left sidebar) ───────────────────────────────────────────── */

function EntityList({
  entities, totalCount, focusedId, onFocus, selectedIds, onToggleSelect, onToggleAll, allSelected, someSelected,
}: {
  entities: EntityRow[]
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
              {entities.length}/{totalCount}
            </span>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {entities.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
              <div className="grid size-10 place-items-center rounded-xl border bg-muted text-muted-foreground/50">
                <Search className="size-5" />
              </div>
              <p className="text-sm font-medium">No entities match your filters</p>
              <p className="text-xs text-muted-foreground">Try clearing search or filter chips.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {entities.map((e) => (
                <EntityListRow
                  key={e.id}
                  entity={e}
                  selected={selectedIds.has(e.id)}
                  focused={e.id === focusedId}
                  onToggleSelect={(on) => onToggleSelect(e.id, on)}
                  onFocus={() => onFocus(e.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function EntityListRow({
  entity, selected, focused, onToggleSelect, onFocus,
}: {
  entity: EntityRow
  selected: boolean
  focused: boolean
  onToggleSelect: (on: boolean) => void
  onFocus: () => void
}) {
  const tone = RISK_TONE[entity.risk]
  const t = TONE[tone]
  const TypeIcon = ENTITY_TYPE_ICON[entity.type] ?? Cpu
  const ownerInitials = entity.owner
    ? entity.owner.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : null

  return (
    <li
      className={cn(
        "group relative flex cursor-pointer items-start gap-2 px-3 py-2.5 transition",
        focused ? "bg-primary/5" : "hover:bg-muted/30",
      )}
      onClick={onFocus}
    >
      {focused && <span className="absolute inset-y-0 left-0 w-0.5 bg-primary" />}

      <Checkbox
        checked={selected}
        onCheckedChange={(c) => onToggleSelect(!!c)}
        onClick={(e) => e.stopPropagation()}
        className="mt-2 size-3.5 shrink-0"
      />

      <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border bg-muted text-muted-foreground">
        <TypeIcon className="size-3.5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="min-w-0 flex-1 truncate text-xs font-semibold leading-tight">{entity.name}</span>
          {entity.s3Score !== undefined && (
            <span className={cn("shrink-0 font-mono text-[10px] font-bold tabular-nums", t.text)}>
              {entity.s3Score}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5">
          {entity.ip && entity.ip !== "—" && (
            <span className="truncate font-mono text-[10px] text-muted-foreground/70">{entity.ip}</span>
          )}
          <span className="text-muted-foreground/30">·</span>
          <span className="text-[10px] text-muted-foreground/70">{entity.type}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className={cn(
            "inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider",
            t.chip,
          )}>
            <span className={cn("size-1 rounded-full", t.dot)} />
            {RISK_META[entity.risk].label}
          </span>
          {entity.relationships !== undefined && (
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/60">
              <Network className="size-2.5" />
              <span className="font-mono tabular-nums">{entity.relationships}</span>
            </span>
          )}
          {ownerInitials && (
            <span className="ml-auto inline-flex items-center gap-1">
              <Avatar className="size-4">
                <AvatarFallback className="bg-linear-to-br from-violet-500 to-blue-500 text-[7px] font-bold text-white">
                  {ownerInitials}
                </AvatarFallback>
              </Avatar>
            </span>
          )}
        </div>
      </div>
    </li>
  )
}

/* ── Summary (right pane when no entity selected) ─────────────────────────── */

function EntitySummary({ stats, recent }: {
  stats: { total: number; critical: number; high: number; medium: number; low: number }
  recent: EntityRow[]
}) {
  const total = stats.total || 1
  const bars = [
    { label: "Critical", count: stats.critical, tone: "alert" as Tone },
    { label: "High",     count: stats.high,     tone: "warn"  as Tone },
    { label: "Medium",   count: stats.medium,   tone: "info"  as Tone },
    { label: "Low",      count: stats.low,      tone: "muted" as Tone },
  ]
  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="px-5 py-5">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
              <Pin className="size-4" />
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight tracking-tight">No entity selected</div>
              <div className="text-[11px] text-muted-foreground">Pick an entity on the left to inspect blast radius, signals, and properties.</div>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Risk distribution</div>
            {bars.map((v) => {
              const t = TONE[v.tone]
              const pct = Math.round((v.count / total) * 100)
              return (
                <div key={v.label} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-xs">{v.label}</span>
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
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Highest S3 score</div>
              <span className="font-mono text-xs text-muted-foreground/70">top {recent.length}</span>
            </div>
            <ul className="divide-y">
              {[...recent].sort((a, b) => (b.s3Score ?? 0) - (a.s3Score ?? 0)).map((e) => {
                const tone = RISK_TONE[e.risk]
                const t = TONE[tone]
                const TypeIcon = ENTITY_TYPE_ICON[e.type] ?? Cpu
                return (
                  <li key={e.id} className="flex items-center gap-3 px-5 py-2.5">
                    <div className="grid size-7 shrink-0 place-items-center rounded-lg border bg-muted text-muted-foreground">
                      <TypeIcon className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium">{e.name}</div>
                      <div className="text-[10px] text-muted-foreground/70">{e.type} · {e.signal}</div>
                    </div>
                    {e.s3Score !== undefined && (
                      <span className={cn("font-mono text-sm font-bold tabular-nums", t.text)}>{e.s3Score}</span>
                    )}
                    <span className={cn(
                      "shrink-0 rounded-full border px-2 py-px text-[9px] font-semibold uppercase tracking-wider",
                      t.chip,
                    )}>
                      {RISK_META[e.risk].label}
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

/* ── Entity dossier (right pane when entity is selected) ──────────────────── */

function EntityDossier({ entity, onBack }: { entity: EntityRow; onBack: () => void }) {
  const tone = RISK_TONE[entity.risk]
  const t = TONE[tone]
  const RiskIcon = RISK_META[entity.risk].icon
  const TypeIcon = ENTITY_TYPE_ICON[entity.type] ?? Cpu
  const ownerInitials = entity.owner
    ? entity.owner.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : null

  return (
    <>
      {/* Dossier header */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Back + id */}
          <div className="flex items-center justify-between gap-3 border-b bg-muted/15 px-5 py-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3" />
              Back to summary
            </button>
            <span className="font-mono text-[10px] text-muted-foreground/60">entity_id: {entity.id}</span>
          </div>

          {/* Name + type + signal */}
          <div className="px-5 py-4">
            <div className="flex items-start gap-3.5">
              <div className="grid size-12 shrink-0 place-items-center rounded-xl border bg-muted text-muted-foreground">
                <TypeIcon className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-semibold leading-tight tracking-tight">{entity.name}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-muted-foreground">{entity.type}</span>
                  {entity.ip && entity.ip !== "—" && (
                    <>
                      <span className="text-muted-foreground/30">·</span>
                      <span className="font-mono text-muted-foreground">{entity.ip}</span>
                    </>
                  )}
                  {entity.os && (
                    <>
                      <span className="text-muted-foreground/30">·</span>
                      <span className="text-muted-foreground">{entity.os}</span>
                    </>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground/85">{entity.signal}</p>
              </div>
              {entity.s3Score !== undefined && (
                <div className="flex shrink-0 flex-col items-center gap-1">
                  <div className={cn(
                    "grid size-12 place-items-center rounded-full border-2 font-mono text-sm font-bold tabular-nums",
                    t.iconBox,
                  )}>
                    {entity.s3Score}
                  </div>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">S3</span>
                </div>
              )}
            </div>
          </div>

          {/* Risk callout */}
          <div className={cn("border-t px-5 py-3", t.bg)}>
            <div className="flex items-center gap-3">
              <div className={cn("grid size-9 shrink-0 place-items-center rounded-lg border", t.iconBox)}>
                <RiskIcon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className={cn("text-sm font-semibold", t.text)}>{RISK_META[entity.risk].label} risk</div>
                <div className="text-[11px] text-muted-foreground">{RISK_META[entity.risk].detail(entity)}</div>
              </div>
            </div>
          </div>

          {/* Action toolbar */}
          <div className="flex flex-wrap items-center gap-2 border-t bg-card px-5 py-2.5">
            <Button size="sm" className="h-8 gap-1.5 px-3 text-xs">
              <Power className="size-3" />
              Quarantine
            </Button>
            <Button size="sm" variant="outline" className="h-8 gap-1.5 px-3 text-xs">
              <UserCheck className="size-3" />
              Notify owner
            </Button>
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
                <DropdownMenuItem className="gap-2 text-xs"><ExternalLink className="size-3.5 text-muted-foreground" />Open CMDB record</DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-xs"><FileText className="size-3.5 text-muted-foreground" />Download properties</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-xs text-destructive focus:text-destructive">
                  <Trash2 className="size-3.5" />Remove from incident
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Blast radius */}
      <BlastRadiusCard entity={entity} />

      {/* Signals / activity */}
      <SignalsCard entity={entity} />

      {/* Properties */}
      <PropertiesCard entity={entity} ownerInitials={ownerInitials} />
    </>
  )
}

/* ── Blast radius ─────────────────────────────────────────────────────────── */

function BlastRadiusCard({ entity }: { entity: EntityRow }) {
  // Mock — varies by risk so the dossier feels alive.
  const radius = {
    artifacts: entity.risk === "critical" ? 8 : entity.risk === "high" ? 4 : entity.risk === "medium" ? 2 : 0,
    alerts:    entity.risk === "critical" ? 5 : entity.risk === "high" ? 3 : 1,
    incidents: entity.risk === "critical" ? 2 : entity.risk === "high" ? 1 : 0,
  }
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-2">
            <Network className="size-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Blast Radius</span>
            {entity.relationships !== undefined && (
              <span className="font-mono text-xs text-muted-foreground/70">{entity.relationships} relationships</span>
            )}
          </div>
          <Button size="sm" variant="outline" className="h-7 gap-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-wider">
            <ExternalLink className="size-3" />
            View graph
          </Button>
        </div>
        <div className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
          <BlastTile icon={Globe}      label="Linked artifacts" count={radius.artifacts} hint="IOCs observed on or against this entity" />
          <BlastTile icon={Bell}       label="Linked alerts"    count={radius.alerts}    hint="Alerts fired where this entity participated" />
          <BlastTile icon={CircleDot}  label="Related incidents" count={radius.incidents} hint="Other incidents that touch this entity" />
        </div>
      </CardContent>
    </Card>
  )
}

function BlastTile({ icon: Icon, label, count, hint }: { icon: ElementType; label: string; count: number; hint: string }) {
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

/* ── Signals / activity ───────────────────────────────────────────────────── */

function SignalsCard({ entity }: { entity: EntityRow }) {
  const tone = RISK_TONE[entity.risk]
  // Mock signals derived from the entity's main signal description.
  const events = [
    { tone: tone, icon: AlertTriangle, title: entity.signal, detail: `Detected by OmniSense correlation engine`, when: entity.lastSeen ?? "recent" },
    { tone: "info" as Tone, icon: Sparkles, title: "Enrichment completed", detail: "Tagged with MITRE techniques and asset context", when: entity.lastSeen ?? "recent" },
    { tone: "muted" as Tone, icon: Activity, title: "Entity added to incident scope", detail: `From source: ${entity.signal.split(" ")[0]}`, when: entity.lastSeen ?? "recent" },
  ]
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-2">
            <Activity className="size-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Signals & Activity</span>
            <span className="font-mono text-xs text-muted-foreground/70">{events.length}</span>
          </div>
        </div>
        <div className="px-5 py-4">
          <div className="relative">
            <div className="absolute bottom-2 left-3 top-2 w-px bg-border/60" />
            <ol className="space-y-3">
              {events.map((ev, i) => {
                const evTone = TONE[ev.tone]
                const Icon = ev.icon
                return (
                  <li key={i} className="relative flex gap-3">
                    <div className={cn("relative z-10 grid size-6 shrink-0 place-items-center rounded-full border-2 border-card", evTone.iconBox)}>
                      <Icon className="size-3" />
                    </div>
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

/* ── Properties ───────────────────────────────────────────────────────────── */

function PropertiesCard({ entity, ownerInitials }: { entity: EntityRow; ownerInitials: string | null }) {
  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Entity type",   value: entity.type },
    { label: "IP address",    value: entity.ip && entity.ip !== "—" ? <span className="font-mono">{entity.ip}</span> : <span className="text-muted-foreground/40">—</span> },
    { label: "Operating system", value: entity.os ?? <span className="text-muted-foreground/40">—</span> },
    { label: "Owner",         value: entity.owner
      ? (
          <span className="inline-flex items-center gap-1.5">
            <Avatar className="size-4">
              <AvatarFallback className="bg-linear-to-br from-violet-500 to-blue-500 text-[7px] font-bold text-white">
                {ownerInitials ?? "??"}
              </AvatarFallback>
            </Avatar>
            <span>{entity.owner}</span>
          </span>
        )
      : <span className="text-muted-foreground/40">Unassigned</span> },
    { label: "Last seen",     value: entity.lastSeen ?? <span className="text-muted-foreground/40">—</span> },
    { label: "Relationships", value: entity.relationships !== undefined
      ? <span className="font-mono tabular-nums">{entity.relationships}</span>
      : <span className="text-muted-foreground/40">—</span> },
    { label: "S3 score",      value: entity.s3Score !== undefined
      ? <span className="font-mono font-semibold tabular-nums">{entity.s3Score}<span className="ml-1 text-muted-foreground/60">/ 100</span></span>
      : <span className="text-muted-foreground/40">—</span> },
  ]
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-2">
            <FileText className="size-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Properties</span>
          </div>
          <Button size="sm" variant="ghost" className="h-7 gap-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <ExternalLink className="size-3" />
            CMDB
          </Button>
        </div>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-2.5 px-5 py-4 sm:grid-cols-2">
          {fields.map(({ label, value }) => (
            <div key={label} className="flex items-baseline gap-3">
              <dt className="w-28 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">{label}</dt>
              <dd className="min-w-0 truncate text-sm">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
