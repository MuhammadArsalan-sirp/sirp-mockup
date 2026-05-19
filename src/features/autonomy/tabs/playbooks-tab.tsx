import { useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  CheckCircle2,
  Circle,
  Clock,
  Download,
  GitBranch,
  Layers,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  TrendingUp,
  Upload,
  User,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PageHeader } from "@/components/shared/page-header"
import { KpiCard } from "@/components/shared/kpi-card"
import { playbooks, type Playbook } from "@/data/autonomy"
import {
  AutonomyFilterPopover,
  useFilters,
  type FilterGroup,
} from "../_filter-popover"
import {
  playbookFamilyOptions,
  playbookLibraryOptions,
  playbookOwnerOptions,
  playbookStatusOptions,
} from "../_filters"
import { AutonomyDataTable } from "../autonomy-sortable-table"
import { DataTableColumnHeader } from "@/components/shared/data-table"

const MINE_OWNER = "Ahmed Khan"

const FILTER_INIT = {
  library: [] as string[],
  status: [] as string[],
  family: [] as string[],
  owner: [] as string[],
}

const FILTER_GROUPS: FilterGroup[] = [
  {
    id: "library",
    label: "Library",
    icon: GitBranch,
    options: playbookLibraryOptions,
    mode: "single",
  },
  { id: "status", label: "Status", icon: Circle, options: playbookStatusOptions },
  { id: "family", label: "Family", icon: Layers, options: playbookFamilyOptions },
  { id: "owner", label: "Owner", icon: User, options: playbookOwnerOptions },
]

export function PlaybooksTab() {
  const [query, setQuery] = useState("")
  const { filters, setFilters } = useFilters(FILTER_INIT)

  const library = filters.library[0] as "all" | "mine" | "marketplace" | undefined

  const data =
    library === "marketplace"
      ? []
      : playbooks.filter((p) => {
          if (library === "mine" && p.owner.name !== MINE_OWNER) return false
          if (filters.status.length && !filters.status.includes(p.status)) return false
          if (filters.family.length && !filters.family.includes(p.family)) return false
          if (filters.owner.length && !filters.owner.includes(p.owner.name)) return false
          if (
            query &&
            !`${p.name} ${p.family} ${p.tags.join(" ")}`
              .toLowerCase()
              .includes(query.toLowerCase())
          )
            return false
          return true
        })

  const filterActive =
    query.trim() !== "" ||
    filters.status.length > 0 ||
    filters.family.length > 0 ||
    filters.owner.length > 0 ||
    (library !== undefined && library !== "all")

  return (
    <div className="space-y-6">
      <PageHeader
        title="Playbooks"
        description="Author, share, and execute automation workflows. 47 playbooks active across 6 use-case families."
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9">
              <Upload className="size-4" />
              Import
            </Button>
            <Button size="sm" className="h-9">
              <Plus className="size-4" />
              New playbook
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<GitBranch className="size-4" />}
          label="Total playbooks"
          value={playbooks.length}
          trend="+3"
          trendTone="success"
          trendDirection="up"
          caption={`${playbooks.filter((p) => p.status === "active").length} active · ${playbooks.filter((p) => p.status === "draft").length} draft`}
        />
        <KpiCard
          icon={<Play className="size-4" />}
          label="Runs · 24h"
          value={196}
          trend="+12.4%"
          trendTone="success"
          trendDirection="up"
          caption="Across all playbooks"
        />
        <KpiCard
          icon={<CheckCircle2 className="size-4" />}
          label="Success rate"
          value={<>94<span className="text-xl text-muted-foreground">%</span></>}
          trend="+0.3%"
          trendTone="success"
          trendDirection="up"
          caption="Last 30 days"
        />
        <KpiCard
          icon={<Clock className="size-4" />}
          label="Median duration"
          value={<>42<span className="text-xl text-muted-foreground">s</span></>}
          trend="-8%"
          trendTone="success"
          trendDirection="down"
          caption="P50 across runs"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-[260px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search playbooks…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 pl-9"
          />
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
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <Download className="size-4" />
            Export
          </Button>
          <AutonomyFilterPopover groups={FILTER_GROUPS} value={filters} onChange={setFilters} />
        </div>
      </div>

      {library === "marketplace" ? (
        <MarketplaceEmpty />
      ) : (
        <PlaybooksTableSortable data={data} />
      )}
    </div>
  )
}

function PlaybookStatusBadge({ status }: { status: Playbook["status"] }) {
  if (status === "active")
    return (
      <Badge variant="outline" style={{ borderColor: "color-mix(in srgb, var(--success) 35%, transparent)", color: "var(--success)" }}>
        <span className="mr-1.5 size-1.5 rounded-full bg-current" />Active
      </Badge>
    )
  if (status === "draft")
    return <Badge variant="outline" className="text-muted-foreground">Draft</Badge>
  return (
    <Badge variant="outline" style={{ borderColor: "color-mix(in srgb, var(--attention) 35%, transparent)", color: "var(--attention)" }}>
      Disabled
    </Badge>
  )
}

function playbookSuccessCell(pb: Playbook) {
  const successColor =
    pb.successRate >= 95
      ? "var(--success)"
      : pb.successRate >= 80
        ? "var(--info)"
        : pb.successRate > 0
          ? "var(--attention)"
          : "var(--muted-foreground)"
  if (pb.runs24h <= 0) return <span className="text-xs text-muted-foreground">—</span>
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${pb.successRate}%`, background: successColor }}
        />
      </div>
      <span className="font-mono text-xs tabular-nums" style={{ color: successColor }}>
        {pb.successRate}%
      </span>
    </div>
  )
}

const playbookTableColumns: ColumnDef<Playbook>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.id}</span>,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Playbook" />,
    cell: ({ row }) => {
      const pb = row.original
      return (
        <div className="max-w-[400px]">
          <div className="truncate font-medium">{pb.name}</div>
          <div className="mt-0.5 truncate text-xs text-muted-foreground">{pb.description}</div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {pb.tags.slice(0, 3).map((t) => (
              <span key={t} className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        </div>
      )
    },
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => <PlaybookStatusBadge status={row.original.status} />,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "family",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Family" />,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.family}</span>,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "steps",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Steps" className="justify-end" />,
    cell: ({ row }) => (
      <span className="block text-right font-mono tabular-nums">{row.original.steps}</span>
    ),
    sortingFn: "basic",
  },
  {
    accessorKey: "runs24h",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Runs · 24h" className="justify-end" />,
    cell: ({ row }) => (
      <span className="block text-right font-mono tabular-nums">{row.original.runs24h}</span>
    ),
    sortingFn: "basic",
  },
  {
    accessorKey: "successRate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Success" />,
    cell: ({ row }) => playbookSuccessCell(row.original),
    sortingFn: "basic",
  },
  {
    accessorKey: "lastRun",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last run" />,
    cell: ({ row }) => <span className="whitespace-nowrap text-xs text-muted-foreground">{row.original.lastRun}</span>,
    sortingFn: "alphanumeric",
  },
  {
    id: "owner",
    accessorFn: (r) => r.owner.name,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Owner" />,
    cell: ({ row }) => {
      const pb = row.original
      return (
        <span className="inline-flex items-center gap-2">
          <span className={`grid size-6 place-items-center rounded-full bg-gradient-to-br ${pb.owner.tone} text-[10px] font-semibold text-white`}>
            {pb.owner.initials}
          </span>
          <span className="text-sm">{pb.owner.name}</span>
        </span>
      )
    },
    sortingFn: "alphanumeric",
  },
  {
    id: "menu",
    enableSorting: false,
    header: () => <span className="sr-only">Menu</span>,
    cell: ({ row }) => (
      <div className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem><Play className="size-3.5" />Run now</DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Share</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    meta: { tdClass: "text-right" },
  },
]

function PlaybooksTableSortable({ data }: { data: Playbook[] }) {
  const columns = useMemo(() => playbookTableColumns, [])
  return (
    <AutonomyDataTable
      data={data}
      columns={columns}
      getRowId={(r) => r.id}
      emptyMessage="No playbooks match your filters."
    />
  )
}

function MarketplaceEmpty() {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed bg-card py-16 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground">
        <TrendingUp className="size-5" />
      </span>
      <h3 className="mt-4 text-base font-semibold">Marketplace is coming soon</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Browse community-published playbooks and share your own with the broader SIRP network.
      </p>
      <Button variant="outline" size="sm" className="mt-4 h-9">
        Notify me when it launches
      </Button>
    </div>
  )
}
