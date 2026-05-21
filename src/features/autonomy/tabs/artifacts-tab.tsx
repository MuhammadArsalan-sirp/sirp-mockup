import { useMemo, useState } from "react"
import type { ColumnDef, Table as RTTable } from "@tanstack/react-table"
import {
  AtSign,
  Boxes,
  Circle,
  Download,
  Eye,
  FileDigit,
  Globe,
  Hash,
  LayoutGrid,
  Link as LinkIcon,
  List,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Upload,
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
import { artifacts, type Artifact } from "@/data/autonomy"
import { cn } from "@/lib/utils"
import { AutonomyDataTable, type AutonomyTableDensity } from "../autonomy-sortable-table"
import { AutonomyViewSettings } from "../autonomy-view-settings"
import { DataTableColumnHeader } from "@/components/shared/data-table"
import {
  AutonomyFilterPopover,
  useFilters,
  type FilterGroup,
} from "../_filter-popover"
import {
  artifactStatusOptions,
  artifactTypeOptions,
} from "../_filters"

const FILTER_GROUPS: FilterGroup[] = [
  { id: "type", label: "Type", icon: Boxes, options: artifactTypeOptions },
  { id: "status", label: "Status", icon: Circle, options: artifactStatusOptions },
]

type ViewMode = "card" | "list"

const TYPE_META: Record<Artifact["type"], { label: string; icon: typeof Hash }> = {
  ip: { label: "IP", icon: Globe },
  domain: { label: "Domain", icon: AtSign },
  hash: { label: "Hash", icon: Hash },
  email: { label: "Email", icon: AtSign },
  url: { label: "URL", icon: LinkIcon },
}

const ARTIFACT_FILTER_INIT = { type: [] as string[], status: [] as string[] }

export function ArtifactsTab() {
  const [query, setQuery] = useState("")
  const [view, setView] = useState<ViewMode>("list")
  const [density, setDensity] = useState<AutonomyTableDensity>("comfortable")
  const [listTable, setListTable] = useState<RTTable<Artifact> | null>(null)
  const { filters, setFilters, reset, active } = useFilters(ARTIFACT_FILTER_INIT)

  const filtered = artifacts.filter((a) => {
    if (filters.type.length && !filters.type.includes(a.type)) return false
    if (filters.status.length) {
      const okActive = filters.status.includes("active") && !a.whitelisted
      const okWl = filters.status.includes("whitelisted") && a.whitelisted
      if (!okActive && !okWl) return false
    }
    if (query && !a.value.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Artifacts"
        description="Every IoC observed across incidents, threat intel, and cases — with cross-reference counts and whitelist controls."
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9">
              <Upload className="size-4" />
              Import
            </Button>
            <Button size="sm" className="h-9">
              <Plus className="size-4" />
              Add artifact
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={<Boxes className="size-4" />} label="Total artifacts" value="22,341" trend="+184" trendTone="success" trendDirection="up" caption="across 9 type definitions" />
        <KpiCard icon={<FileDigit className="size-4" />} label="New · 24h" value={184} trend="+12.4%" trendTone="success" trendDirection="up" caption="79 IPs · 52 domains · 33 hashes · 20 emails" />
        <KpiCard icon={<Eye className="size-4" />} label="Most observed" value="185.220.101.47" caption="37 occurrences across all containers" />
        <KpiCard icon={<ShieldCheck className="size-4" />} label="Whitelisted" value={artifacts.filter((a) => a.whitelisted).length} caption="Excluded from auto-actions" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-[260px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search artifacts…"
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
        <div className="ml-auto flex flex-wrap items-center gap-2">
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
          <Button variant="outline" size="sm" className="h-9">
            <Download className="size-4" />Export
          </Button>
          <AutonomyViewSettings
            currentView={view}
            table={listTable}
            density={density}
            onDensityChange={setDensity}
          />
          <AutonomyFilterPopover groups={FILTER_GROUPS} value={filters} onChange={setFilters} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="grid place-items-center rounded-xl border border-dashed bg-card py-16 text-center text-sm text-muted-foreground">
          No artifacts match your filters.
        </div>
      ) : view === "card" ? (
        <div
          className={cn(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
            density === "compact" ? "gap-2" : "gap-3"
          )}
        >
          {filtered.map((a) => (
            <ArtifactCard key={a.id} artifact={a} />
          ))}
        </div>
      ) : (
        <ArtifactsListTableSortable rows={filtered} density={density} onTableReady={setListTable} />
      )}
    </div>
  )
}

function ArtifactCard({ artifact: a }: { artifact: Artifact }) {
  const meta = TYPE_META[a.type]
  const Icon = meta.icon
  return (
    <div className="group flex flex-col rounded-xl border bg-card p-4 transition-colors hover:bg-accent/20">
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium">
          <Icon className="size-3" />
          {meta.label}
        </span>
        {a.whitelisted ? (
          <Badge variant="outline" className="font-normal" style={{ borderColor: "color-mix(in srgb, var(--success) 35%, transparent)", color: "var(--success)" }}>
            Whitelisted
          </Badge>
        ) : (
          <Badge variant="outline" className="font-normal text-muted-foreground">Active</Badge>
        )}
      </div>
      <code className="mt-3 block truncate font-mono text-sm">{a.value}</code>
      <div className="mt-3 grid grid-cols-3 gap-2 border-t pt-3 text-center text-xs">
        <div>
          <div className="text-muted-foreground">Incidents</div>
          <div className="font-mono font-semibold tabular-nums">{a.incidents}</div>
        </div>
        <div>
          <div className="text-muted-foreground">TI</div>
          <div className="font-mono font-semibold tabular-nums">{a.threatIntel}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Total</div>
          <div className="font-mono font-semibold tabular-nums">{a.total}</div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{a.lastSeen}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View occurrences</DropdownMenuItem>
            <DropdownMenuItem>Run action</DropdownMenuItem>
            <DropdownMenuItem>{a.whitelisted ? "Remove from whitelist" : "Whitelist"}</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function ArtifactCountCell({ count }: { count: number }) {
  if (count === 0)
    return <span className="block text-right font-mono text-xs tabular-nums text-muted-foreground">0</span>
  return (
    <div className="text-right">
      <button
        type="button"
        className="inline-flex h-6 min-w-[36px] items-center justify-center rounded-md bg-secondary px-2 font-mono text-xs font-semibold tabular-nums hover:bg-accent"
      >
        {count}
      </button>
    </div>
  )
}

const artifactListColumns: ColumnDef<Artifact>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.id}</span>,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => {
      const meta = TYPE_META[row.original.type]
      const Icon = meta.icon
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs">
          <Icon className="size-3" />
          {meta.label}
        </span>
      )
    },
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "value",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Value" />,
    cell: ({ row }) => <code className="font-mono text-sm">{row.original.value}</code>,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "incidents",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Incidents" className="justify-end" />,
    cell: ({ row }) => <ArtifactCountCell count={row.original.incidents} />,
    sortingFn: "basic",
  },
  {
    accessorKey: "threatIntel",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Threat intel" className="justify-end" />,
    cell: ({ row }) => <ArtifactCountCell count={row.original.threatIntel} />,
    sortingFn: "basic",
  },
  {
    accessorKey: "cases",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cases" className="justify-end" />,
    cell: ({ row }) => <ArtifactCountCell count={row.original.cases} />,
    sortingFn: "basic",
  },
  {
    accessorKey: "total",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total" className="justify-end" />,
    cell: ({ row }) => (
      <span className="block text-right font-mono font-semibold tabular-nums">{row.original.total}</span>
    ),
    sortingFn: "basic",
  },
  {
    accessorKey: "lastSeen",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last seen" />,
    cell: ({ row }) => <span className="whitespace-nowrap text-xs text-muted-foreground">{row.original.lastSeen}</span>,
    sortingFn: "alphanumeric",
  },
  {
    id: "whitelist",
    accessorFn: (r) => (r.whitelisted ? "whitelisted" : "active"),
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const a = row.original
      return a.whitelisted ? (
        <Badge variant="outline" className="font-normal" style={{ borderColor: "color-mix(in srgb, var(--success) 35%, transparent)", color: "var(--success)" }}>
          Whitelisted
        </Badge>
      ) : (
        <Badge variant="outline" className="font-normal text-muted-foreground">Active</Badge>
      )
    },
    sortingFn: "alphanumeric",
  },
  {
    id: "menu",
    enableSorting: false,
    header: () => <span className="sr-only">Menu</span>,
    cell: ({ row }) => {
      const a = row.original
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View occurrences</DropdownMenuItem>
              <DropdownMenuItem>Run action</DropdownMenuItem>
              <DropdownMenuItem>{a.whitelisted ? "Remove from whitelist" : "Whitelist"}</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
    meta: { tdClass: "text-right" },
  },
]

function ArtifactsListTableSortable({
  rows,
  density,
  onTableReady,
}: {
  rows: Artifact[]
  density: AutonomyTableDensity
  onTableReady: (t: RTTable<Artifact>) => void
}) {
  const columns = useMemo(() => artifactListColumns, [])
  return (
    <AutonomyDataTable
      data={rows}
      columns={columns}
      getRowId={(r) => r.id}
      emptyMessage="No artifacts match your filters."
      density={density}
      onTableReady={onTableReady}
    />
  )
}
