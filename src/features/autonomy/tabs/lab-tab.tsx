import { useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Circle,
  Layers,
  Loader2,
  PauseCircle,
  Search,
  TimerReset,
  X,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { KpiCard } from "@/components/shared/kpi-card"
import { playbookRuns, type LabRun, type RunStatus } from "@/data/autonomy"
import { AutonomyDataTable } from "../autonomy-sortable-table"
import { DataTableColumnHeader } from "@/components/shared/data-table"
import { Segmented } from "./_segmented"
import {
  AutonomyFilterPopover,
  useFilters,
  type FilterGroup,
} from "../_filter-popover"
import {
  runContainerOptions,
  runStatusOptions,
  runTriggerOptions,
} from "../_filters"

type SubKey = "playbooks" | "agents" | "actions" | "ingestion"

const FILTER_GROUPS: FilterGroup[] = [
  { id: "status", label: "Status", icon: Circle, options: runStatusOptions },
  { id: "container", label: "Container", icon: Layers, options: runContainerOptions },
  { id: "trigger", label: "Trigger", icon: Zap, options: runTriggerOptions },
]

const LAB_FILTER_INIT = { status: [] as string[], container: [] as string[], trigger: [] as string[] }

export function LabTab() {
  const [sub, setSub] = useState<SubKey>("playbooks")
  const [query, setQuery] = useState("")
  const { filters, setFilters, reset, active } = useFilters(LAB_FILTER_INIT)

  const filtered = playbookRuns.filter((r) => {
    if (filters.status.length && !filters.status.includes(r.status)) return false
    if (filters.container.length && !filters.container.includes(r.container.kind)) return false
    if (filters.trigger.length && !filters.trigger.includes(r.trigger)) return false
    if (query && !`${r.id} ${r.name} ${r.container.id}`.toLowerCase().includes(query.toLowerCase()))
      return false
    return true
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lab"
        description="Execution history for every playbook, agent, action, and ingestion run."
        actions={
          <Button variant="outline" size="sm" className="h-9">
            <Calendar className="size-4" />
            Last 24 hours
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<Activity className="size-4" />}
          label="Total runs · 24h"
          value={1248}
          trend="+8.4%"
          trendTone="success"
          trendDirection="up"
          caption="All execution channels"
        />
        <KpiCard
          icon={<CheckCircle2 className="size-4" />}
          label="Success rate"
          value={<>96<span className="text-xl text-muted-foreground">%</span></>}
          trend="+0.4%"
          trendTone="success"
          trendDirection="up"
          caption="vs previous 24 hours"
        />
        <KpiCard
          icon={<AlertCircle className="size-4" />}
          label="Failed runs"
          value={51}
          trend="-12"
          trendTone="success"
          trendDirection="down"
          caption="2 retried · 49 manually closed"
        />
        <KpiCard
          icon={<TimerReset className="size-4" />}
          label="Median duration"
          value={<>28<span className="text-xl text-muted-foreground">s</span></>}
          trend="-4s"
          trendTone="success"
          trendDirection="down"
          caption="P50 across 1,248 runs"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Segmented
          value={sub}
          onChange={setSub}
          options={[
            { key: "playbooks", label: "Playbook runs" },
            { key: "agents", label: "Agent runs" },
            { key: "actions", label: "Action runs" },
            { key: "ingestion", label: "Ingestion runs" },
          ]}
        />
        <div className="relative w-[260px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search runs…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 pl-9"
          />
        </div>
        {(active || query.trim() !== "") && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-2 text-muted-foreground hover:text-foreground"
            onClick={() => {
              reset()
              setQuery("")
            }}
          >
            Reset
            <X className="size-3.5" />
          </Button>
        )}
        <div className="ml-auto">
          <AutonomyFilterPopover groups={FILTER_GROUPS} value={filters} onChange={setFilters} />
        </div>
      </div>

      <LabRunsTableSortable runs={filtered} />
    </div>
  )
}

function RunStatusPill({ status }: { status: RunStatus }) {
  if (status === "success")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "color-mix(in srgb, var(--success) 15%, transparent)", color: "var(--success)" }}>
        <CheckCircle2 className="size-3" />Success
      </span>
    )
  if (status === "running")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "color-mix(in srgb, var(--info) 15%, transparent)", color: "var(--info)" }}>
        <Loader2 className="size-3 animate-spin" />Running
      </span>
    )
  if (status === "queued")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
        <PauseCircle className="size-3" />Queued
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "color-mix(in srgb, var(--destructive) 15%, transparent)", color: "var(--destructive)" }}>
      <AlertCircle className="size-3" />Failed
    </span>
  )
}

const labRunColumns: ColumnDef<LabRun>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Run ID" />,
    cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.id}</span>,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const r = row.original
      return (
        <div>
          <div className="font-medium">{r.name}</div>
          {r.user && (
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={`grid size-4 place-items-center rounded-full bg-gradient-to-br ${r.user.tone} text-[8px] font-semibold text-white`}>
                {r.user.initials}
              </span>
              {r.user.name}
            </div>
          )}
        </div>
      )
    },
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => <RunStatusPill status={row.original.status} />,
    sortingFn: "alphanumeric",
  },
  {
    id: "container",
    accessorFn: (r) => `${r.container.kind} ${r.container.id}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Container" />,
    cell: ({ row }) => {
      const r = row.original
      return (
        <span className="inline-flex items-center gap-1.5 text-xs">
          <Badge variant="outline" className="font-normal capitalize">{r.container.kind}</Badge>
          <span className="font-mono text-muted-foreground">{r.container.id}</span>
        </span>
      )
    },
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "trigger",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trigger" />,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.trigger}</span>,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "startedAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Started" />,
    cell: ({ row }) => <span className="whitespace-nowrap text-xs text-muted-foreground">{row.original.startedAt}</span>,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "duration",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Duration" className="justify-end" />,
    cell: ({ row }) => (
      <span className="block text-right font-mono tabular-nums">{row.original.duration}</span>
    ),
    sortingFn: "alphanumeric",
  },
  {
    id: "logs",
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Logs" className="justify-end" />,
    cell: () => (
      <div className="text-right">
        <Button variant="ghost" size="sm" className="h-8">View</Button>
      </div>
    ),
    meta: { thClass: "text-right", tdClass: "text-right" },
  },
]

function LabRunsTableSortable({ runs }: { runs: LabRun[] }) {
  const columns = useMemo(() => labRunColumns, [])
  return (
    <AutonomyDataTable
      data={runs}
      columns={columns}
      getRowId={(r) => r.id}
      emptyMessage="No runs match your filters."
    />
  )
}
