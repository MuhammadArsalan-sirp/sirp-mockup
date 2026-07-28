import { useMemo, useState, type ReactNode } from "react"
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  FilePlus2,
  ListOrdered,
  LayoutList,
  Link2,
  MoreHorizontal,
  Plus,
  Rows3,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import {
  preIngestionRules,
  preIngestionActionMeta,
  type PreIngestionAction,
  type PreIngestionRule,
} from "@/data/admin-preingestion"
import { KpiCard, SearchInput, Sparkline, ToneChip, type Tone } from "./admin-ui"
import "./rule-cascade.css"

const actionIcon: Record<PreIngestionAction, LucideIcon> = {
  link_and_update: Link2,
  create_new: FilePlus2,
  discard: Ban,
}

const actionTone: Record<PreIngestionAction, Tone> = {
  link_and_update: "info",
  create_new: "ok",
  discard: "muted",
}

const actionBadgeGradient: Record<PreIngestionAction, string> = {
  link_and_update: "from-primary to-chart-3",
  create_new: "from-emerald-500 to-emerald-600",
  discard: "from-muted-foreground/50 to-muted-foreground/70",
}

const CASCADE_PREVIEW_COUNT = 8
const PAGE_SIZE = 10

export function AdminPreIngestionRulesPage() {
  const [view, setView] = useState<"cascade" | "list">("cascade")
  const [rules, setRules] = useState(preIngestionRules)
  const sorted = useMemo(
    () => [...rules].sort((a, b) => a.ruleOrder - b.ruleOrder || a.id - b.id),
    [rules]
  )
  const enabledCount = rules.filter((r) => r.enabled).length

  const toggle = (id: number) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)))
  }

  return (
    <div className="space-y-5 pb-16">
      <PageHeader
        title="Pre-Ingestion Rules"
        description="Decide what happens to an incoming alert before it becomes a case — evaluated top to bottom, first match wins."
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5 rounded-lg border bg-muted/30 p-0.5">
              <ViewToggleButton icon={Rows3} active={view === "cascade"} onClick={() => setView("cascade")}>
                Cascade
              </ViewToggleButton>
              <ViewToggleButton icon={LayoutList} active={view === "list"} onClick={() => setView("list")}>
                List
              </ViewToggleButton>
            </div>
            <Button size="sm" className="h-9">
              <Plus className="size-4" />
              New rule
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard icon={ListOrdered} label="Total rules" value={rules.length} tone="info" />
        <KpiCard icon={Link2} label="Enabled" value={enabledCount} tone="ok" />
        <KpiCard icon={Ban} label="Disabled" value={rules.length - enabledCount} />
        <KpiCard icon={FilePlus2} label="Evaluated first" value={sorted[0]?.name ?? "—"} />
      </div>

      {view === "cascade" ? (
        <CascadeView rules={sorted} onToggle={toggle} onSwitchToList={() => setView("list")} />
      ) : (
        <ListView rules={sorted} onToggle={toggle} />
      )}
    </div>
  )
}

function ViewToggleButton({
  icon: Icon,
  active,
  onClick,
  children,
}: {
  icon: LucideIcon
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="size-3.5" />
      {children}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────
// Cascade view — the small-scale, "understand the flow" view. Caps at
// CASCADE_PREVIEW_COUNT so it stays a showcase, not a scroll marathon;
// anything beyond that lives in List view, which is built for volume.
// ─────────────────────────────────────────────────────────────────

function CascadeView({
  rules,
  onToggle,
  onSwitchToList,
}: {
  rules: PreIngestionRule[]
  onToggle: (id: number) => void
  onSwitchToList: () => void
}) {
  const preview = rules.slice(0, CASCADE_PREVIEW_COUNT)
  const remaining = rules.length - preview.length

  return (
    <div className="relative">
      <div
        className="absolute top-6 bottom-6 left-6 w-px bg-border [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)]"
        aria-hidden
      />
      <div className="flex flex-col gap-3">
        {preview.map((rule, i) => (
          <RuleRow key={rule.id} rule={rule} index={i} onToggle={() => onToggle(rule.id)} />
        ))}
      </div>

      {remaining > 0 && (
        <button
          onClick={onSwitchToList}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed py-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <LayoutList className="size-4" />
          +{remaining} more rule{remaining === 1 ? "" : "s"} — view all in List
        </button>
      )}
    </div>
  )
}

function RuleRow({
  rule,
  index,
  onToggle,
}: {
  rule: PreIngestionRule
  index: number
  onToggle: () => void
}) {
  const Icon = actionIcon[rule.action]

  return (
    <div
      className="rule-cascade-item flex items-start gap-4"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="relative z-10 shrink-0">
        <div
          className={cn(
            "grid size-12 place-items-center rounded-full bg-linear-to-br shadow-sm",
            actionBadgeGradient[rule.action],
            !rule.enabled && "grayscale opacity-50"
          )}
        >
          <Icon className="size-5 text-white" />
        </div>
        <span className="absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full border-2 border-background bg-foreground font-mono text-[9px] font-bold text-background">
          {index + 1}
        </span>
      </div>

      <Card className={cn("flex-1", !rule.enabled && "opacity-60")}>
        <CardContent className="px-4 py-3.5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">{rule.name}</h3>
                <ToneChip tone={actionTone[rule.action]} icon={Icon}>
                  {preIngestionActionMeta[rule.action].label}
                </ToneChip>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{rule.description}</p>
              <p className="mt-1.5 font-mono text-[11px] text-muted-foreground/70">
                #{rule.id} · created {rule.createdAt}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <div className="hidden flex-col items-end gap-0.5 sm:flex">
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  {rule.matchesToday} matched · 24h
                </span>
                <Sparkline data={rule.matchTrend} tone={rule.enabled ? actionTone[rule.action] : "muted"} />
              </div>
              <Switch checked={rule.enabled} onCheckedChange={onToggle} aria-label="Enable rule" />
              <Button variant="ghost" size="icon-sm" aria-label="More">
                <MoreHorizontal className="size-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// List view — dense, searchable, filterable, paginated. This is the one
// built to hold up at hundreds or thousands of rules, not the showcase.
// ─────────────────────────────────────────────────────────────────

type StatusFilter = "all" | "enabled" | "disabled"
type ActionFilter = "all" | PreIngestionAction

function ListView({
  rules,
  onToggle,
}: {
  rules: PreIngestionRule[]
  onToggle: (id: number) => void
}) {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [action, setAction] = useState<ActionFilter>("all")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rules.filter((r) => {
      if (status === "enabled" && !r.enabled) return false
      if (status === "disabled" && r.enabled) return false
      if (action !== "all" && r.action !== action) return false
      if (q && !r.name.toLowerCase().includes(q) && !r.description.toLowerCase().includes(q)) return false
      return true
    })
  }, [rules, search, status, action])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const clampedPage = Math.min(page, totalPages)
  const pageRows = filtered.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE)

  const updateFilter = <T,>(setter: (v: T) => void, value: T) => {
    setter(value)
    setPage(1)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={search}
          onChange={(v) => updateFilter(setSearch, v)}
          placeholder="Search rules…"
          width="wide"
        />
        <div className="flex items-center gap-1 rounded-lg border bg-muted/20 p-0.5">
          {(["all", "enabled", "disabled"] as StatusFilter[]).map((s) => (
            <FilterPill key={s} active={status === s} onClick={() => updateFilter(setStatus, s)}>
              {s === "all" ? "All" : s === "enabled" ? "Enabled" : "Disabled"}
            </FilterPill>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-lg border bg-muted/20 p-0.5">
          <FilterPill active={action === "all"} onClick={() => updateFilter(setAction, "all" as ActionFilter)}>
            All actions
          </FilterPill>
          {(Object.keys(preIngestionActionMeta) as PreIngestionAction[]).map((a) => (
            <FilterPill key={a} active={action === a} onClick={() => updateFilter(setAction, a)}>
              {preIngestionActionMeta[a].label}
            </FilterPill>
          ))}
        </div>
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          {filtered.length} of {rules.length}
        </span>
      </div>

      <Card>
        <CardContent className="px-0 py-0">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="w-14 px-4 py-2.5 font-medium">Order</th>
                <th className="px-4 py-2.5 font-medium">Rule</th>
                <th className="w-36 px-4 py-2.5 font-medium">Action</th>
                <th className="w-32 px-4 py-2.5 font-medium">Matched · 24h</th>
                <th className="w-28 px-4 py-2.5 font-medium">Created</th>
                <th className="w-20 px-4 py-2.5 font-medium">Status</th>
                <th className="w-10 px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {pageRows.map((rule) => {
                const Icon = actionIcon[rule.action]
                return (
                  <tr key={rule.id} className={cn("hover:bg-accent/40", !rule.enabled && "opacity-60")}>
                    <td className="px-4 py-2.5 font-mono text-xs tabular-nums text-muted-foreground">
                      {rule.ruleOrder}
                    </td>
                    <td className="max-w-0 px-4 py-2.5">
                      <div className="truncate font-medium">{rule.name}</div>
                      <div className="truncate text-xs text-muted-foreground">#{rule.id} · {rule.description}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <ToneChip tone={actionTone[rule.action]} icon={Icon}>
                        {preIngestionActionMeta[rule.action].label}
                      </ToneChip>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Sparkline data={rule.matchTrend} tone={rule.enabled ? actionTone[rule.action] : "muted"} />
                        <span className="font-mono text-xs tabular-nums text-muted-foreground">{rule.matchesToday}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{rule.createdAt}</td>
                    <td className="px-4 py-2.5">
                      <Switch checked={rule.enabled} onCheckedChange={() => onToggle(rule.id)} aria-label="Enable rule" />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Button variant="ghost" size="icon-sm" aria-label="More">
                        <MoreHorizontal className="size-4 text-muted-foreground" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No rules match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </CardContent>
      </Card>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
          <span>
            Showing {(clampedPage - 1) * PAGE_SIZE + 1}–{Math.min(clampedPage * PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={clampedPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <span className="px-2 font-mono tabular-nums">
              {clampedPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={clampedPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors",
        active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}
