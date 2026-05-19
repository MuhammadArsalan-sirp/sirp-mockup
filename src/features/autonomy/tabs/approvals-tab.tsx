import { useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Hourglass,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plug,
  Search,
  ShieldX,
  TimerReset,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { KpiCard } from "@/components/shared/kpi-card"
import { approvalRequests, type ApprovalRequest, type ApprovalStatus } from "@/data/autonomy"
import {
  AutonomyFilterPopover,
  useFilters,
  type FilterGroup,
} from "../_filter-popover"
import { approvalAppOptions, approvalQueueOptions } from "../_filters"
import { cn } from "@/lib/utils"
import { AutonomyDataTable } from "../autonomy-sortable-table"
import { DataTableColumnHeader } from "@/components/shared/data-table"

type ViewMode = "card" | "list"

const FILTER_INIT = { queue: ["pending"] as string[], app: [] as string[] }

const FILTER_GROUPS: FilterGroup[] = [
  {
    id: "queue",
    label: "Queue",
    icon: Hourglass,
    options: approvalQueueOptions,
    mode: "single",
  },
  { id: "app", label: "Application", icon: Plug, options: approvalAppOptions },
]

export function ApprovalsTab() {
  const [query, setQuery] = useState("")
  const [view, setView] = useState<ViewMode>("card")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const { filters, setFilters } = useFilters(FILTER_INIT)

  const filtered = approvalRequests.filter((r) => {
    if (filters.queue.length === 0) {
      // reset / show all
    } else {
      const q = filters.queue[0] as ApprovalStatus | "all"
      if (q !== "all" && r.status !== q) return false
    }
    if (filters.app.length && !filters.app.includes(r.app)) return false
    if (query && !`${r.action} ${r.artifact} ${r.container.name}`.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  const isDefaultFilters =
    filters.queue.length === 1 &&
    filters.queue[0] === "pending" &&
    filters.app.length === 0
  const filterActive = query.trim() !== "" || !isDefaultFilters

  const counts = {
    all: approvalRequests.length,
    pending: approvalRequests.filter((r) => r.status === "pending").length,
    approved: approvalRequests.filter((r) => r.status === "approved").length,
    declined: approvalRequests.filter((r) => r.status === "declined").length,
  }

  const toggle = (id: string) => setSelected((cur) => { const n = new Set(cur); n.has(id) ? n.delete(id) : n.add(id); return n })

  return (
    <div className="space-y-6">
      <PageHeader title="Approvals" description="Pending decisions for actions that require human review before SIRP can execute them." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={<Hourglass className="size-4" />} label="Pending" value={counts.pending} trend="oldest 1h ago" trendTone="attention" caption="Awaiting decision" />
        <KpiCard icon={<CheckCircle2 className="size-4" />} label="Approved · today" value={28} trend="+4" trendTone="success" trendDirection="up" caption="Average dwell 6m" />
        <KpiCard icon={<ShieldX className="size-4" />} label="Declined · today" value={7} caption="3 by analysts · 4 by policy" />
        <KpiCard icon={<TimerReset className="size-4" />} label="Avg time-to-decide" value={<>4<span className="text-xl text-muted-foreground">m</span> 12<span className="text-xl text-muted-foreground">s</span></>} trend="-1m 4s" trendTone="success" trendDirection="down" caption="Faster than yesterday" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-[260px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search approvals…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-9 pl-9" />
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
          <span className="grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground"><CheckCircle2 className="size-5" /></span>
          <h3 className="mt-4 text-base font-semibold">All caught up</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">No requests match your current view.</p>
        </div>
      ) : view === "card" ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((req) => <ApprovalCard key={req.id} req={req} selected={selected.has(req.id)} onToggle={() => toggle(req.id)} />)}
        </div>
      ) : (
        <ApprovalsListTableSortable requests={filtered} />
      )}

      {selected.size > 0 && (
        <div className="sticky bottom-4 z-20 mx-auto flex w-fit items-center gap-3 rounded-full border bg-popover px-3 py-2 shadow-lg">
          <span className="text-sm font-medium"><span className="font-mono tabular-nums">{selected.size}</span> selected</span>
          <span className="h-5 w-px bg-border" />
          <Button variant="ghost" size="sm" className="h-8" onClick={() => setSelected(new Set())}>Clear</Button>
          <Button variant="outline" size="sm" className="h-8" style={{ color: "var(--destructive)" }}><X className="size-3.5" />Decline all</Button>
          <Button size="sm" className="h-8"><Check className="size-3.5" />Approve all</Button>
        </div>
      )}
    </div>
  )
}

function ApprovalCard({ req, selected, onToggle }: { req: ApprovalRequest; selected: boolean; onToggle: () => void }) {
  return (
    <div className={cn("group flex flex-col rounded-xl border bg-card p-5 transition-shadow", selected && "ring-2 ring-primary/40", req.status === "pending" && "hover:shadow-sm")}>
      <div className="flex items-start gap-3">
        <Checkbox checked={selected} onCheckedChange={onToggle} className="mt-1" />
        <div className={`grid size-10 shrink-0 place-items-center rounded-md bg-gradient-to-br ${req.appTone} text-xs font-semibold text-white`}>{req.appInitials}</div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold leading-tight">{req.action}</div>
          <div className="mt-0.5 truncate text-xs text-muted-foreground">via {req.app}</div>
        </div>
        <StatusPill status={req.status} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-muted-foreground">Artifact</div>
          <code className="mt-0.5 block truncate rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{req.artifact}</code>
        </div>
        <div>
          <div className="text-muted-foreground">Container</div>
          <div className="mt-0.5 flex items-center gap-1">
            <Badge variant="outline" className="font-normal capitalize">{req.container.kind}</Badge>
            <span className="font-mono text-xs">{req.container.id}</span>
          </div>
        </div>
      </div>
      <div className="mt-2 truncate text-xs text-muted-foreground">{req.container.name}</div>
      <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs">
        <div className="flex items-center gap-2">
          <span className={`grid size-6 place-items-center rounded-full bg-gradient-to-br ${req.initiatedByTone} text-[10px] font-semibold text-white`}>{req.initiatedByInitials}</span>
          <div className="leading-tight">
            <div className="font-medium">{req.initiatedBy}</div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground"><Clock className="size-3" />{req.initiatedAt}</div>
          </div>
        </div>
        {req.status === "pending" ? (
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="h-8" style={{ color: "var(--destructive)" }}><X className="size-3.5" />Decline</Button>
            <Button size="sm" className="h-8"><Check className="size-3.5" />Approve</Button>
          </div>
        ) : (
          <div className="text-right text-[11px] text-muted-foreground">
            <div>{req.status === "approved" ? "Approved" : "Declined"} {req.decidedAt}</div>
            <div>by {req.decidedBy}</div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: ApprovalStatus }) {
  if (status === "pending") return <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "color-mix(in srgb, var(--attention) 15%, transparent)", color: "var(--attention)" }}><Hourglass className="size-3" />Pending</span>
  if (status === "approved") return <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "color-mix(in srgb, var(--success) 15%, transparent)", color: "var(--success)" }}><CheckCircle2 className="size-3" />Approved</span>
  return <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "color-mix(in srgb, var(--destructive) 15%, transparent)", color: "var(--destructive)" }}><AlertCircle className="size-3" />Declined</span>
}

const approvalListColumns: ColumnDef<ApprovalRequest>[] = [
  {
    accessorKey: "action",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Action" />,
    cell: ({ row }) => <span className="font-medium">{row.original.action}</span>,
    sortingFn: "alphanumeric",
  },
  {
    id: "application",
    accessorFn: (r) => r.app,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Application" />,
    cell: ({ row }) => {
      const req = row.original
      return (
        <div className="flex items-center gap-2">
          <div className={`grid size-6 place-items-center rounded bg-gradient-to-br ${req.appTone} text-[10px] font-bold text-white`}>
            {req.appInitials}
          </div>
          <span className="text-muted-foreground">{req.app}</span>
        </div>
      )
    },
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "artifact",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Artifact" />,
    cell: ({ row }) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{row.original.artifact}</code>
    ),
    sortingFn: "alphanumeric",
  },
  {
    id: "container",
    accessorFn: (r) => `${r.container.kind} ${r.container.id}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Container" />,
    cell: ({ row }) => {
      const req = row.original
      return (
        <span className="inline-flex items-center gap-1.5 text-xs">
          <Badge variant="outline" className="font-normal capitalize">{req.container.kind}</Badge>
          <span className="font-mono text-muted-foreground">{req.container.id}</span>
        </span>
      )
    },
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "initiatedBy",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Requested by" />,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.initiatedBy}</span>,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => <StatusPill status={row.original.status} />,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "initiatedAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Time" />,
    cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.initiatedAt}</span>,
    sortingFn: "alphanumeric",
  },
  {
    id: "actions",
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Actions" className="justify-end" />,
    cell: ({ row }) => {
      const req = row.original
      return req.status === "pending" ? (
        <div className="flex items-center justify-end gap-1">
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs" style={{ color: "var(--destructive)" }}>Decline</Button>
          <Button size="sm" className="h-7 px-2 text-xs">Approve</Button>
        </div>
      ) : (
        <div className="text-right">
          <Button variant="ghost" size="icon" className="size-7">
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
      )
    },
    meta: { thClass: "text-right", tdClass: "text-right" },
  },
]

function ApprovalsListTableSortable({ requests }: { requests: ApprovalRequest[] }) {
  const columns = useMemo(() => approvalListColumns, [])
  return <AutonomyDataTable data={requests} columns={columns} getRowId={(r) => r.id} />
}
