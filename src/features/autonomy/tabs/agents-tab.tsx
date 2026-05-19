import { useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Activity,
  Bot,
  Brain,
  CheckCircle2,
  LayoutGrid,
  Layers,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PageHeader } from "@/components/shared/page-header"
import { KpiCard } from "@/components/shared/kpi-card"
import { agents, type Agent } from "@/data/autonomy"
import {
  AutonomyFilterPopover,
  useFilters,
  type FilterGroup,
} from "../_filter-popover"
import {
  agentModuleOptions,
  agentScopeOptions,
  agentStageOptions,
} from "../_filters"
import { cn } from "@/lib/utils"
import { AutonomyDataTable } from "../autonomy-sortable-table"
import { DataTableColumnHeader } from "@/components/shared/data-table"

type ViewMode = "card" | "list"

const FILTER_GROUPS: FilterGroup[] = [
  {
    id: "scope",
    label: "Scope",
    icon: Layers,
    options: agentScopeOptions,
    mode: "single",
  },
  { id: "module", label: "Module", icon: Brain, options: agentModuleOptions },
  { id: "stage", label: "Stage", icon: Activity, options: agentStageOptions },
]

const FILTER_INIT = { scope: [] as string[], module: [] as string[], stage: [] as string[] }

export function AgentsTab() {
  const [query, setQuery] = useState("")
  const [view, setView] = useState<ViewMode>("card")
  const { filters, setFilters } = useFilters(FILTER_INIT)

  const scope = (filters.scope[0] ?? "all_active") as
    | "all_active"
    | "default"
    | "custom"
    | "inactive"

  const filtered = agents.filter((a) => {
    if (scope === "default" && a.type !== "default") return false
    if (scope === "custom" && a.type !== "custom") return false
    if (scope === "inactive" && a.active) return false
    if (scope === "all_active" && !a.active) return false
    if (filters.module.length && !a.modules.some((m) => filters.module.includes(m))) return false
    if (filters.stage.length && !a.stages.some((s) => filters.stage.includes(s))) return false
    if (query && !`${a.name} ${a.description}`.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  const filterActive =
    query.trim() !== "" ||
    filters.module.length > 0 ||
    filters.stage.length > 0 ||
    (filters.scope[0] !== undefined && filters.scope[0] !== "all_active")

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agents"
        description="Specialised executors that listen to events, run actions, and write findings back into incidents."
        actions={<Button size="sm" className="h-9"><Plus className="size-4" />New agent</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={<Bot className="size-4" />} label="Active agents" value={agents.filter((a) => a.active).length} trend={`${agents.length} total`} trendTone="muted" caption="6 default · 1 custom" />
        <KpiCard icon={<Activity className="size-4" />} label="Runs · today" value={agents.reduce((s, a) => s + a.runsToday, 0).toLocaleString()} trend="+18.2%" trendTone="success" trendDirection="up" caption="Across all active agents" />
        <KpiCard icon={<CheckCircle2 className="size-4" />} label="Avg success rate" value={<>97<span className="text-xl text-muted-foreground">%</span></>} trend="+0.6%" trendTone="success" trendDirection="up" caption="Last 24 hours" />
        <KpiCard icon={<Brain className="size-4" />} label="Modules covered" value={6} caption="Incident · TI · Identity · DLP · Vuln · Resilience" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-[260px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search agents…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-9 pl-9" />
        </div>
        {filterActive && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-2 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setFilters(FILTER_INIT)
              setQuery("")
            }}
          >
            Reset
            <X className="size-3.5" />
          </Button>
        )}
        <div className="ml-auto" />
        <div className="inline-flex items-center rounded-md border bg-background p-0.5">
          <button
            type="button"
            onClick={() => setView("card")}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-sm px-2.5 text-xs font-medium transition-colors",
              view === "card"
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={view === "card"}
          >
            <LayoutGrid className="size-3.5" />
            Cards
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-sm px-2.5 text-xs font-medium transition-colors",
              view === "list"
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={view === "list"}
          >
            <List className="size-3.5" />
            List
          </button>
        </div>
        <AutonomyFilterPopover groups={FILTER_GROUPS} value={filters} onChange={setFilters} />
      </div>

      {filtered.length === 0 ? (
        <div className="grid place-items-center rounded-xl border border-dashed bg-card py-16 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground"><Bot className="size-5" /></span>
          <h3 className="mt-4 text-base font-semibold">No agents match your filters</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">Try clearing the search or switching scope.</p>
        </div>
      ) : view === "card" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => <AgentCard key={a.id} agent={a} />)}
        </div>
      ) : (
        <AgentsListTableSortable agents={filtered} />
      )}
    </div>
  )
}

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div className="group flex flex-col rounded-xl border bg-card p-5">
      <div className="flex items-start gap-3">
        <div className={`grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${agent.iconTone} text-sm font-semibold text-white`}>
          {agent.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold">{agent.name}</span>
            {agent.type === "default"
              ? <Badge variant="outline" className="font-normal">Default</Badge>
              : <Badge variant="outline" className="font-normal" style={{ borderColor: "color-mix(in srgb, var(--primary) 35%, transparent)", color: "var(--primary)" }}>Custom</Badge>}
          </div>
          <div className="mt-0.5 font-mono text-xs text-muted-foreground">{agent.id}</div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem><Settings className="size-3.5" />Configure</DropdownMenuItem>
            <DropdownMenuItem>Test connection</DropdownMenuItem>
            <DropdownMenuItem>View runs</DropdownMenuItem>
            {agent.type === "custom" && <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{agent.description}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {agent.modules.map((m) => <span key={m} className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs">{m}</span>)}
        {agent.stages.map((s) => <span key={s} className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs text-muted-foreground">{s}</span>)}
      </div>
      <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs">
        <div className="flex items-center gap-4">
          <div><div className="text-muted-foreground">Runs · today</div><div className="font-mono font-semibold tabular-nums">{agent.runsToday.toLocaleString()}</div></div>
          <div><div className="text-muted-foreground">Success</div><div className="font-mono font-semibold tabular-nums">{agent.runsToday > 0 ? `${agent.successRate}%` : "—"}</div></div>
          <div><div className="text-muted-foreground">Last run</div><div className="font-medium">{agent.lastRun}</div></div>
        </div>
        <span className={cn("inline-flex h-5 items-center gap-1.5 rounded-full px-2 text-xs", agent.active ? "bg-success/15 text-[color:var(--success)]" : "bg-muted text-muted-foreground")}>
          <span className="size-1.5 rounded-full" style={{ background: agent.active ? "var(--success)" : "var(--muted-foreground)" }} />
          {agent.active ? "On" : "Off"}
        </span>
      </div>
    </div>
  )
}

const agentListColumns: ColumnDef<Agent>[] = [
  {
    id: "agent",
    accessorFn: (r) => r.name,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Agent" />,
    cell: ({ row }) => {
      const a = row.original
      return (
        <div className="flex items-center gap-3">
          <div className={`grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${a.iconTone} text-xs font-semibold text-white`}>
            {a.initials}
          </div>
          <div>
            <div className="font-medium">{a.name}</div>
            <div className="font-mono text-xs text-muted-foreground">{a.id}</div>
          </div>
        </div>
      )
    },
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => {
      const a = row.original
      return a.type === "default" ? (
        <Badge variant="outline" className="font-normal">Default</Badge>
      ) : (
        <Badge variant="outline" className="font-normal" style={{ borderColor: "color-mix(in srgb, var(--primary) 35%, transparent)", color: "var(--primary)" }}>Custom</Badge>
      )
    },
    sortingFn: "alphanumeric",
  },
  {
    id: "modules",
    accessorFn: (r) => r.modules.join(" "),
    header: ({ column }) => <DataTableColumnHeader column={column} title="Modules" />,
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.modules.slice(0, 2).map((m) => (
          <span key={m} className="rounded-sm bg-secondary px-1.5 py-0.5 text-[11px]">{m}</span>
        ))}
        {row.original.modules.length > 2 && (
          <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
            +{row.original.modules.length - 2}
          </span>
        )}
      </div>
    ),
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "runsToday",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Runs · today" className="justify-end" />,
    cell: ({ row }) => (
      <span className="block text-right font-mono tabular-nums">{row.original.runsToday.toLocaleString()}</span>
    ),
    sortingFn: "basic",
  },
  {
    accessorKey: "successRate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Success" />,
    cell: ({ row }) => {
      const a = row.original
      return <span className="font-mono text-xs">{a.runsToday > 0 ? `${a.successRate}%` : "—"}</span>
    },
    sortingFn: "basic",
  },
  {
    accessorKey: "lastRun",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last run" />,
    cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.lastRun}</span>,
    sortingFn: "alphanumeric",
  },
  {
    id: "status",
    accessorFn: (r) => (r.active ? "on" : "off"),
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const a = row.original
      return (
        <span className={cn("inline-flex h-5 items-center gap-1.5 rounded-full px-2 text-xs", a.active ? "bg-success/15 text-[color:var(--success)]" : "bg-muted text-muted-foreground")}>
          <span className="size-1.5 rounded-full" style={{ background: a.active ? "var(--success)" : "var(--muted-foreground)" }} />
          {a.active ? "On" : "Off"}
        </span>
      )
    },
    sortingFn: "alphanumeric",
  },
  {
    id: "menu",
    enableSorting: false,
    header: () => <span className="sr-only">Menu</span>,
    cell: () => (
      <div className="text-right">
        <Button variant="ghost" size="icon" className="size-7">
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
    ),
    meta: { tdClass: "text-right" },
  },
]

function AgentsListTableSortable({ agents }: { agents: Agent[] }) {
  const columns = useMemo(() => agentListColumns, [])
  return <AutonomyDataTable data={agents} columns={columns} getRowId={(r) => r.id} />
}
