import { useMemo, useState } from "react"
import type { ColumnDef, Table as RTTable } from "@tanstack/react-table"
import {
  Boxes,
  Cable,
  Download,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plug,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Webhook,
  X,
  Zap,
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
import { applications, type Application } from "@/data/autonomy"
import {
  AutonomyFilterPopover,
  useFilters,
  type FilterGroup,
} from "../_filter-popover"
import { Segmented } from "./_segmented"
import {
  appCategoryOptions,
  appStatusOptions,
  appVendorOptions,
  actionScopeOptions,
  artifactTypeOriginOptions,
  ingestionHealthOptions,
  ingestionModeOptions,
} from "../_filters"
import { VendorLogo, getVendorBrand } from "../_vendor-logo"
import { AutonomyDataTable, type AutonomyTableDensity } from "../autonomy-sortable-table"
import { AutonomyViewSettings } from "../autonomy-view-settings"
import { DataTableColumnHeader } from "@/components/shared/data-table"
import { cn } from "@/lib/utils"

type SubKey = "applications" | "actions" | "ingestion" | "artifact-types"
type ViewMode = "card" | "list"

const SUB_TABS: { key: SubKey; label: string }[] = [
  { key: "applications", label: "Applications" },
  { key: "actions", label: "Actions" },
  { key: "ingestion", label: "Ingestion sources" },
  { key: "artifact-types", label: "Artifact types" },
]

export function AutomationTab() {
  const [sub, setSub] = useState<SubKey>("applications")

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automation"
        description="Connect tools, define actions, configure ingestion — the building blocks of every playbook and agent."
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9">
              <RefreshCw className="size-4" />
              Refresh
            </Button>
            <Button size="sm" className="h-9">
              <Plus className="size-4" />
              {sub === "applications" && "New application"}
              {sub === "actions" && "New action"}
              {sub === "ingestion" && "New source"}
              {sub === "artifact-types" && "New type"}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={<Plug className="size-4" />} label="Connected apps" value={applications.filter((a) => a.status === "connected").length} trend={`${applications.length} total`} trendTone="muted" caption="6 healthy · 1 degraded · 1 offline" />
        <KpiCard icon={<Zap className="size-4" />} label="Configured actions" value={113} trend="+8" trendTone="success" trendDirection="up" caption="Across all integrations" />
        <KpiCard icon={<Cable className="size-4" />} label="Ingestion sources" value={12} trend="+1" trendTone="success" trendDirection="up" caption="11 polling · 1 webhook" />
        <KpiCard icon={<Boxes className="size-4" />} label="Artifact types" value={9} caption="IP, domain, hash, email, url, and 4 more" />
      </div>

      {/* Same segmented control pattern as incidents record-type tabs */}
      <Segmented
        value={sub}
        onChange={(k) => setSub(k as SubKey)}
        options={SUB_TABS.map((t) => ({ key: t.key, label: t.label }))}
      />

      {sub === "applications" && <ApplicationsView />}
      {sub === "actions" && <ActionsView />}
      {sub === "ingestion" && <IngestionView />}
      {sub === "artifact-types" && <ArtifactTypesView />}
    </div>
  )
}

/* ── Application filter groups ───────────────────────────────── */
const APP_FILTER_GROUPS: FilterGroup[] = [
  { id: "status", label: "Status", icon: Plug, options: appStatusOptions },
  { id: "category", label: "Category", icon: Boxes, options: appCategoryOptions },
  { id: "vendor", label: "Vendor", icon: Cable, options: appVendorOptions },
]
const APP_FILTER_INIT = { status: [], category: [], vendor: [] }

/* ── Applications ─────────────────────────────────────────────── */
function ApplicationsView() {
  const [query, setQuery] = useState("")
  const [view, setView] = useState<ViewMode>("card")
  const [density, setDensity] = useState<AutonomyTableDensity>("comfortable")
  const [listTable, setListTable] = useState<RTTable<Application> | null>(null)
  const { filters, setFilters, reset, active } = useFilters(APP_FILTER_INIT)

  const filtered = applications.filter((a) => {
    if (filters.status.length && !filters.status.includes(a.status)) return false
    if (filters.category.length && !filters.category.includes(a.category)) return false
    if (filters.vendor.length && !filters.vendor.includes(a.vendor)) return false
    if (query && !`${a.name} ${a.vendor} ${a.category}`.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-4">
      <Toolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search applications…"
        filters={<AutonomyFilterPopover groups={APP_FILTER_GROUPS} value={filters} onChange={setFilters} />}
        view={view}
        onView={setView}
        right={<Button variant="outline" size="sm" className="h-9"><Download className="size-4" />Export</Button>}
        showReset={active || query.trim() !== ""}
        onReset={() => {
          reset()
          setQuery("")
        }}
        display={{ table: listTable, density, onDensityChange: setDensity }}
      />
      {filtered.length === 0
        ? <EmptyState icon={<Plug className="size-5" />} title="No applications match" line="Try adjusting your search or filters." />
        : view === "card"
          ? <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", density === "compact" ? "gap-2" : "gap-3")}>{filtered.map((a) => <AppCard key={a.id} app={a} />)}</div>
          : <ApplicationsListTable apps={filtered} density={density} onTableReady={setListTable} />}
    </div>
  )
}

function AppCard({ app }: { app: Application }) {
  const brand = getVendorBrand(app.vendor)
  const { color, label } = statusMeta(app.status)
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:bg-accent/20">
      <div className="flex h-[88px] items-center justify-center" style={{ background: brand.bg }}>
        <VendorLogo vendor={app.vendor} className="size-11" color={brand.fg} />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="absolute right-2 top-2 size-7 bg-black/20 text-white opacity-0 hover:bg-black/30 group-hover:opacity-100">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Configure</DropdownMenuItem>
          <DropdownMenuItem>Test connection</DropdownMenuItem>
          <DropdownMenuItem>Sync now</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">Disconnect</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex items-start justify-between gap-2 px-4 py-3">
        <div className="min-w-0">
          <div className="truncate font-semibold leading-tight">{app.name}</div>
          <div className="mt-0.5 truncate text-xs text-muted-foreground">{app.vendor} · {app.category}</div>
        </div>
        <span className="mt-0.5 size-2 shrink-0 rounded-full" style={{ background: color, boxShadow: `0 0 0 3px color-mix(in srgb, ${color} 22%, transparent)` }} title={label} />
      </div>
      <div className="mt-auto grid grid-cols-3 divide-x border-t text-center text-xs">
        <div className="py-2.5"><div className="font-mono font-semibold">{app.actions}</div><div className="text-[10px] text-muted-foreground">Actions</div></div>
        <div className="py-2.5"><div className="font-mono font-semibold">{app.ingestion}</div><div className="text-[10px] text-muted-foreground">Ingestion</div></div>
        <div className="py-2.5"><div className="font-mono font-semibold">{app.callsToday >= 1000 ? `${(app.callsToday / 1000).toFixed(1)}K` : app.callsToday || "—"}</div><div className="text-[10px] text-muted-foreground">Calls / 24h</div></div>
      </div>
    </div>
  )
}

const applicationTableColumns: ColumnDef<Application>[] = [
  {
    id: "application",
    accessorFn: (r) => r.name,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Application" />,
    cell: ({ row }) => {
      const app = row.original
      const brand = getVendorBrand(app.vendor)
      return (
        <div className="flex items-center gap-3">
          <div className="grid size-8 shrink-0 place-items-center rounded-lg" style={{ background: brand.bg }}>
            <VendorLogo vendor={app.vendor} className="size-5" color={brand.fg} />
          </div>
          <div>
            <div className="font-medium">{app.name}</div>
            <div className="text-xs text-muted-foreground">{app.vendor}</div>
          </div>
        </div>
      )
    },
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "category",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
    cell: ({ row }) => <Badge variant="outline" className="font-normal">{row.original.category}</Badge>,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const { color, label } = statusMeta(row.original.status)
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color }}>
          <span className="size-1.5 rounded-full" style={{ background: color }} />
          {label}
        </span>
      )
    },
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "actions",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Actions" className="justify-end" />,
    cell: ({ row }) => <span className="block text-right font-mono tabular-nums">{row.original.actions}</span>,
    sortingFn: "basic",
  },
  {
    accessorKey: "callsToday",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Calls · 24h" className="justify-end" />,
    cell: ({ row }) => (
      <span className="block text-right font-mono tabular-nums">{row.original.callsToday.toLocaleString()}</span>
    ),
    sortingFn: "basic",
  },
  {
    accessorKey: "lastSync",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last sync" />,
    cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.lastSync}</span>,
    sortingFn: "alphanumeric",
  },
  {
    id: "menu",
    enableSorting: false,
    header: () => <span className="sr-only">Actions</span>,
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

function ApplicationsListTable({
  apps,
  density,
  onTableReady,
}: {
  apps: Application[]
  density: AutonomyTableDensity
  onTableReady: (t: RTTable<Application>) => void
}) {
  const columns = useMemo(() => applicationTableColumns, [])
  return (
    <AutonomyDataTable
      data={apps}
      columns={columns}
      getRowId={(r) => r.id}
      density={density}
      onTableReady={onTableReady}
    />
  )
}

function statusMeta(s: Application["status"]) {
  if (s === "connected") return { label: "Connected", color: "var(--success)" }
  if (s === "degraded") return { label: "Degraded", color: "var(--attention)" }
  return { label: "Offline", color: "var(--destructive)" }
}

/* ── Actions ──────────────────────────────────────────────────── */
const ACTIONS_FILTER_GROUPS: FilterGroup[] = [
  { id: "scope", label: "Scope", icon: Zap, options: actionScopeOptions },
  { id: "vendor", label: "Vendor", icon: Cable, options: appVendorOptions },
]
const ACTIONS_DATA = [
  { id: "ACT-101", name: "Isolate endpoint", app: "CrowdStrike Falcon", vendor: "CrowdStrike", method: "POST /isolation", scope: "Hosts", calls: 248 },
  { id: "ACT-102", name: "Disable user", app: "Okta", vendor: "Okta", method: "POST /users/{id}/lifecycle/suspend", scope: "Users", calls: 32 },
  { id: "ACT-103", name: "Block IoC", app: "Palo Alto NGFW", vendor: "Palo Alto", method: "POST /policy/rules", scope: "Network", calls: 96 },
  { id: "ACT-104", name: "Quarantine mailbox", app: "Microsoft Sentinel", vendor: "Microsoft", method: "POST /quarantine", scope: "Email", calls: 64 },
  { id: "ACT-105", name: "Enrich indicator", app: "VirusTotal", vendor: "Google", method: "GET /api/v3/intelligence", scope: "TI", calls: 1024 },
  { id: "ACT-106", name: "Open ticket", app: "Jira Service Mgmt", vendor: "Atlassian", method: "POST /rest/api/2/issue", scope: "Ticketing", calls: 412 },
  { id: "ACT-107", name: "Force password reset", app: "Okta", vendor: "Okta", method: "POST /users/{id}/lifecycle/reset_password", scope: "Users", calls: 14 },
  { id: "ACT-108", name: "Detonate URL", app: "VirusTotal", vendor: "Google", method: "POST /urls", scope: "TI", calls: 188 },
  { id: "ACT-109", name: "Search events", app: "Splunk Enterprise", vendor: "Splunk", method: "POST /search/jobs", scope: "Hosts", calls: 504 },
]

type ActionRow = (typeof ACTIONS_DATA)[number]

function ActionsView() {
  const [query, setQuery] = useState("")
  const [view, setView] = useState<ViewMode>("list")
  const [density, setDensity] = useState<AutonomyTableDensity>("comfortable")
  const [listTable, setListTable] = useState<RTTable<ActionRow> | null>(null)
  const ACTIONS_FILTER_INIT = { scope: [] as string[], vendor: [] as string[] }
  const { filters, setFilters, reset, active } = useFilters(ACTIONS_FILTER_INIT)
  const rows = ACTIONS_DATA.filter((r) => {
    if (filters.scope.length && !filters.scope.includes(r.scope)) return false
    if (filters.vendor.length && !filters.vendor.includes(r.vendor)) return false
    if (query && !`${r.id} ${r.name} ${r.app} ${r.method}`.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })
  return (
    <div className="space-y-4">
      <Toolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search actions…"
        filters={<AutonomyFilterPopover groups={ACTIONS_FILTER_GROUPS} value={filters} onChange={setFilters} />}
        view={view}
        onView={setView}
        showReset={active || query.trim() !== ""}
        onReset={() => {
          reset()
          setQuery("")
        }}
        display={{ table: listTable, density, onDensityChange: setDensity }}
      />
      {rows.length === 0
        ? <EmptyState icon={<Zap className="size-5" />} title="No actions match" line="Try adjusting your search or filters." />
        : view === "card"
          ? <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", density === "compact" ? "gap-2" : "gap-3")}>{rows.map((r) => <ActionCard key={r.id} row={r} />)}</div>
          : <ActionsListTableSortable rows={rows} density={density} onTableReady={setListTable} />}
    </div>
  )
}

function ActionCard({ row }: { row: ActionRow }) {
  return (
    <div className="group flex flex-col rounded-xl border bg-card p-4 transition-colors hover:bg-accent/20">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary">
            <Zap className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold leading-tight">{row.name}</div>
            <div className="mt-0.5 truncate text-xs text-muted-foreground">{row.app}</div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="size-7 shrink-0 opacity-0 group-hover:opacity-100">
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
      <code className="mt-3 block truncate rounded-md bg-muted px-2 py-1.5 font-mono text-[11px] text-muted-foreground">{row.method}</code>
      <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3 text-xs">
        <Badge variant="outline" className="font-normal">{row.scope}</Badge>
        <span className="font-mono tabular-nums text-muted-foreground">{row.calls.toLocaleString()} calls · 30d</span>
      </div>
      <div className="mt-2 font-mono text-[10px] text-muted-foreground">{row.id}</div>
    </div>
  )
}

const actionTableColumns: ColumnDef<ActionRow>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.id}</span>,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Action" />,
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "app",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Application" />,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.app}</span>,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "method",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Method" />,
    cell: ({ row }) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{row.original.method}</code>
    ),
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "scope",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Scope" />,
    cell: ({ row }) => <Badge variant="outline" className="font-normal">{row.original.scope}</Badge>,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "calls",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Calls · 30d" className="justify-end" />,
    cell: ({ row }) => (
      <span className="block text-right font-mono tabular-nums">{row.original.calls.toLocaleString()}</span>
    ),
    sortingFn: "basic",
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

function ActionsListTableSortable({
  rows,
  density,
  onTableReady,
}: {
  rows: ActionRow[]
  density: AutonomyTableDensity
  onTableReady: (t: RTTable<ActionRow>) => void
}) {
  const columns = useMemo(() => actionTableColumns, [])
  return (
    <AutonomyDataTable
      data={rows}
      columns={columns}
      getRowId={(r) => r.id}
      density={density}
      onTableReady={onTableReady}
    />
  )
}

/* ── Ingestion sources ────────────────────────────────────────── */
type Source = { id: string; name: string; app: string; vendor: string; mode: "Polling" | "Webhook"; interval: string; lastEvent: string; events: number; health: "healthy" | "delayed"; tone: string }
const SOURCES: Source[] = [
  { id: "ING-01", name: "Splunk — alerts", app: "Splunk Enterprise", vendor: "Splunk", mode: "Polling", interval: "30s", lastEvent: "2s ago", events: 1248, health: "healthy", tone: "" },
  { id: "ING-02", name: "CrowdStrike — detections", app: "CrowdStrike Falcon", vendor: "CrowdStrike", mode: "Webhook", interval: "—", lastEvent: "now", events: 412, health: "healthy", tone: "" },
  { id: "ING-03", name: "Sentinel — incidents", app: "Microsoft Sentinel", vendor: "Microsoft", mode: "Polling", interval: "60s", lastEvent: "12s ago", events: 318, health: "healthy", tone: "" },
  { id: "ING-04", name: "Proofpoint — phish reports", app: "Proofpoint TAP", vendor: "Proofpoint", mode: "Polling", interval: "5m", lastEvent: "12m ago", events: 47, health: "delayed", tone: "" },
  { id: "ING-05", name: "VT feed — malicious URLs", app: "VirusTotal", vendor: "Google", mode: "Polling", interval: "1h", lastEvent: "23m ago", events: 96, health: "healthy", tone: "" },
  { id: "ING-06", name: "Okta — auth events", app: "Okta", vendor: "Okta", mode: "Webhook", interval: "—", lastEvent: "1s ago", events: 2148, health: "healthy", tone: "" },
]
const ING_FILTER_GROUPS: FilterGroup[] = [
  { id: "mode", label: "Mode", icon: Radio, options: ingestionModeOptions },
  { id: "health", label: "Health", icon: Cable, options: ingestionHealthOptions },
  { id: "vendor", label: "Vendor", icon: Plug, options: appVendorOptions },
]

function IngestionView() {
  const [query, setQuery] = useState("")
  const [view, setView] = useState<ViewMode>("card")
  const [density, setDensity] = useState<AutonomyTableDensity>("comfortable")
  const [listTable, setListTable] = useState<RTTable<Source> | null>(null)
  const ING_FILTER_INIT = { mode: [] as string[], health: [] as string[], vendor: [] as string[] }
  const { filters, setFilters, reset, active } = useFilters(ING_FILTER_INIT)
  const rows = SOURCES.filter((s) => {
    if (filters.mode.length && !filters.mode.includes(s.mode)) return false
    if (filters.health.length && !filters.health.includes(s.health)) return false
    if (filters.vendor.length && !filters.vendor.includes(s.vendor)) return false
    if (query && !`${s.id} ${s.name} ${s.app}`.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })
  return (
    <div className="space-y-4">
      <Toolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search ingestion sources…"
        filters={<AutonomyFilterPopover groups={ING_FILTER_GROUPS} value={filters} onChange={setFilters} />}
        view={view}
        onView={setView}
        showReset={active || query.trim() !== ""}
        onReset={() => {
          reset()
          setQuery("")
        }}
        display={{ table: listTable, density, onDensityChange: setDensity }}
      />
      {rows.length === 0
        ? <EmptyState icon={<Cable className="size-5" />} title="No sources match" line="Try adjusting your search or filters." />
        : view === "card"
          ? <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", density === "compact" ? "gap-2" : "gap-3")}>{rows.map((s) => <SourceCard key={s.id} src={s} />)}</div>
          : <SourcesListTableSortable sources={rows} density={density} onTableReady={setListTable} />}
    </div>
  )
}

function SourceCard({ src }: { src: Source }) {
  const brand = getVendorBrand(src.vendor)
  const healthy = src.health === "healthy"
  const hc = healthy ? "var(--success)" : "var(--attention)"
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:bg-accent/20">
      <div className="flex h-[88px] flex-col items-center justify-center gap-1.5" style={{ background: brand.bg }}>
        <VendorLogo vendor={src.vendor} className="size-10" color={brand.fg} />
        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: "rgba(0,0,0,0.25)", color: brand.fg }}>
          {src.mode === "Webhook" ? <Webhook className="size-3" /> : <Radio className="size-3" />}
          {src.mode}
        </span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="absolute right-2 top-2 size-7 bg-black/20 text-white opacity-0 hover:bg-black/30 group-hover:opacity-100">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Test fetch</DropdownMenuItem>
          <DropdownMenuItem>Pause</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex items-start justify-between gap-2 px-4 py-3">
        <div className="min-w-0">
          <div className="truncate font-semibold leading-tight">{src.name}</div>
          <div className="mt-0.5 truncate text-xs text-muted-foreground">{src.app}{src.interval !== "—" && ` · every ${src.interval}`}</div>
        </div>
        <span className="mt-0.5 size-2 shrink-0 rounded-full" style={{ background: hc, boxShadow: `0 0 0 3px color-mix(in srgb, ${hc} 22%, transparent)` }} title={healthy ? "Healthy" : "Delayed"} />
      </div>
      <div className="mt-auto grid grid-cols-3 divide-x border-t text-center text-xs">
        <div className="py-2.5"><div className="font-mono font-semibold">{src.events >= 1000 ? `${(src.events / 1000).toFixed(1)}K` : src.events}</div><div className="text-[10px] text-muted-foreground">Events / 24h</div></div>
        <div className="py-2.5"><div className="font-semibold">{src.lastEvent}</div><div className="text-[10px] text-muted-foreground">Last event</div></div>
        <div className="py-2.5"><div className="font-mono font-semibold">{src.id}</div><div className="text-[10px] text-muted-foreground">Source ID</div></div>
      </div>
    </div>
  )
}

const sourceTableColumns: ColumnDef<Source>[] = [
  {
    id: "source",
    accessorFn: (r) => r.name,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Source" />,
    cell: ({ row }) => {
      const s = row.original
      const brand = getVendorBrand(s.vendor)
      return (
        <div className="flex items-center gap-3">
          <div className="grid size-8 shrink-0 place-items-center rounded-lg" style={{ background: brand.bg }}>
            <VendorLogo vendor={s.vendor} className="size-5" color={brand.fg} />
          </div>
          <div>
            <div className="font-medium">{s.name}</div>
            <div className="text-xs text-muted-foreground">{s.app}</div>
          </div>
        </div>
      )
    },
    sortingFn: "alphanumeric",
  },
  {
    id: "mode",
    accessorFn: (r) => `${r.mode} ${r.interval}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Mode" />,
    cell: ({ row }) => {
      const s = row.original
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          {s.mode === "Webhook" ? <Webhook className="size-3" /> : <Radio className="size-3" />}
          {s.mode}{s.interval !== "—" && ` · ${s.interval}`}
        </span>
      )
    },
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "health",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Health" />,
    cell: ({ row }) => {
      const healthy = row.original.health === "healthy"
      const hc = healthy ? "var(--success)" : "var(--attention)"
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: hc }}>
          <span className="size-1.5 rounded-full" style={{ background: hc }} />
          {healthy ? "Healthy" : "Delayed"}
        </span>
      )
    },
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "events",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Events · 24h" className="justify-end" />,
    cell: ({ row }) => (
      <span className="block text-right font-mono tabular-nums">{row.original.events.toLocaleString()}</span>
    ),
    sortingFn: "basic",
  },
  {
    accessorKey: "lastEvent",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last event" />,
    cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.lastEvent}</span>,
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

function SourcesListTableSortable({
  sources,
  density,
  onTableReady,
}: {
  sources: Source[]
  density: AutonomyTableDensity
  onTableReady: (t: RTTable<Source>) => void
}) {
  const columns = useMemo(() => sourceTableColumns, [])
  return (
    <AutonomyDataTable
      data={sources}
      columns={columns}
      getRowId={(r) => r.id}
      density={density}
      onTableReady={onTableReady}
    />
  )
}

/* ── Artifact types ───────────────────────────────────────────── */
const AT_FILTER_GROUPS: FilterGroup[] = [
  { id: "origin", label: "Origin", icon: Boxes, options: artifactTypeOriginOptions },
]
const TYPES_DATA = [
  { id: "AT-001", name: "IP address", regex: "^\\d{1,3}(\\.\\d{1,3}){3}$", count: 4128, origin: "system" },
  { id: "AT-002", name: "Domain", regex: "^([a-z0-9-]+\\.)+[a-z]{2,}$", count: 2387, origin: "system" },
  { id: "AT-003", name: "MD5 hash", regex: "^[a-f0-9]{32}$", count: 942, origin: "system" },
  { id: "AT-004", name: "SHA256 hash", regex: "^[a-f0-9]{64}$", count: 1201, origin: "system" },
  { id: "AT-005", name: "Email address", regex: "^.+@.+\\..+$", count: 314, origin: "system" },
  { id: "AT-006", name: "URL", regex: "^https?://.+", count: 882, origin: "system" },
  { id: "AT-007", name: "Bitcoin wallet", regex: "^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$", count: 12, origin: "custom" },
  { id: "AT-008", name: "Mutex name", regex: "^Global\\\\\\\\.+", count: 4, origin: "custom" },
  { id: "AT-009", name: "Registry key", regex: "^HKEY_.+", count: 27, origin: "custom" },
] as const

type TypeRow = (typeof TYPES_DATA)[number]

function ArtifactTypesView() {
  const [query, setQuery] = useState("")
  const [view, setView] = useState<ViewMode>("card")
  const [density, setDensity] = useState<AutonomyTableDensity>("comfortable")
  const [listTable, setListTable] = useState<RTTable<TypeRow> | null>(null)
  const AT_FILTER_INIT = { origin: [] as string[] }
  const { filters, setFilters, reset, active } = useFilters(AT_FILTER_INIT)
  const rows = TYPES_DATA.filter((t) => {
    if (filters.origin.length && !filters.origin.includes(t.origin)) return false
    if (query && !`${t.id} ${t.name}`.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })
  return (
    <div className="space-y-4">
      <Toolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search artifact types…"
        filters={<AutonomyFilterPopover groups={AT_FILTER_GROUPS} value={filters} onChange={setFilters} />}
        view={view}
        onView={setView}
        showReset={active || query.trim() !== ""}
        onReset={() => {
          reset()
          setQuery("")
        }}
        display={{ table: listTable, density, onDensityChange: setDensity }}
      />
      {rows.length === 0
        ? <EmptyState icon={<Boxes className="size-5" />} title="No artifact types match" line="Try adjusting your search or filters." />
        : view === "card"
          ? <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", density === "compact" ? "gap-2" : "gap-3")}>{rows.map((t) => <ArtifactTypeCard key={t.id} row={t} />)}</div>
          : <ArtifactTypesListTableSortable rows={rows} density={density} onTableReady={setListTable} />}
    </div>
  )
}

function ArtifactTypeCard({ row }: { row: TypeRow }) {
  return (
    <div className="group flex flex-col rounded-xl border bg-card p-4 transition-colors hover:bg-accent/20">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-mono text-[10px] text-muted-foreground">{row.id}</div>
          <div className="mt-1 font-semibold">{row.name}</div>
        </div>
        {row.origin === "system"
          ? <Badge variant="outline" className="font-normal shrink-0">System</Badge>
          : <Badge variant="outline" className="shrink-0 font-normal" style={{ borderColor: "color-mix(in srgb, var(--primary) 35%, transparent)", color: "var(--primary)" }}>Custom</Badge>}
      </div>
      <code className="mt-3 line-clamp-2 rounded-md bg-muted px-2 py-1.5 font-mono text-[11px] text-muted-foreground">{row.regex}</code>
      <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs">
        <span className="text-muted-foreground">Observations</span>
        <span className="font-mono font-semibold tabular-nums">{row.count.toLocaleString()}</span>
      </div>
      <div className="mt-2 flex justify-end">
        <Button variant="ghost" size="icon" className="size-7" disabled={row.origin === "system"}>
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
    </div>
  )
}

const artifactTypeTableColumns: ColumnDef<TypeRow>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.id}</span>,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "regex",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Pattern" />,
    cell: ({ row }) => (
      <code className="max-w-[200px] truncate rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
        {row.original.regex}
      </code>
    ),
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "origin",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Origin" />,
    cell: ({ row }) => {
      const t = row.original
      return t.origin === "system" ? (
        <Badge variant="outline" className="font-normal">System</Badge>
      ) : (
        <Badge variant="outline" className="font-normal" style={{ borderColor: "color-mix(in srgb, var(--primary) 35%, transparent)", color: "var(--primary)" }}>Custom</Badge>
      )
    },
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "count",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Observations" className="justify-end" />,
    cell: ({ row }) => (
      <span className="block text-right font-mono tabular-nums">{row.original.count.toLocaleString()}</span>
    ),
    sortingFn: "basic",
  },
  {
    id: "menu",
    enableSorting: false,
    header: () => <span className="sr-only">Menu</span>,
    cell: ({ row }) => (
      <div className="text-right">
        <Button variant="ghost" size="icon" className="size-7" disabled={row.original.origin === "system"}>
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
    ),
    meta: { tdClass: "text-right" },
  },
]

function ArtifactTypesListTableSortable({
  rows,
  density,
  onTableReady,
}: {
  rows: TypeRow[]
  density: AutonomyTableDensity
  onTableReady: (t: RTTable<TypeRow>) => void
}) {
  const columns = useMemo(() => artifactTypeTableColumns, [])
  return (
    <AutonomyDataTable
      data={[...rows]}
      columns={columns}
      getRowId={(r) => r.id}
      density={density}
      onTableReady={onTableReady}
    />
  )
}

/* ── Shared toolbar ───────────────────────────────────────────── */
function Toolbar<TData>({
  query,
  onQuery,
  placeholder,
  filters,
  view,
  onView,
  right,
  showReset,
  onReset,
  display,
}: {
  query: string
  onQuery: (v: string) => void
  placeholder: string
  filters?: React.ReactNode
  view?: ViewMode
  onView?: (v: ViewMode) => void
  right?: React.ReactNode
  showReset?: boolean
  onReset?: () => void
  display?: {
    table: RTTable<TData> | null
    density: AutonomyTableDensity
    onDensityChange: (d: AutonomyTableDensity) => void
  }
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-[260px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={placeholder} value={query} onChange={(e) => onQuery(e.target.value)} className="h-9 pl-9" />
      </div>
      {showReset && onReset && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-2 text-muted-foreground hover:text-foreground"
          onClick={onReset}
        >
          Reset
          <X className="size-3.5" />
        </Button>
      )}
      <div className="ml-auto flex flex-wrap items-center gap-2">
        {view !== undefined && onView && (
          <div className="inline-flex items-center rounded-md border bg-background p-0.5">
            <button
              type="button"
              onClick={() => onView("card")}
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
              onClick={() => onView("list")}
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
        )}
        {right}
        {display && (
          <AutonomyViewSettings
            currentView={view ?? "list"}
            table={display.table}
            density={display.density}
            onDensityChange={display.onDensityChange}
          />
        )}
        {filters}
      </div>
    </div>
  )
}

/* ── Empty state ──────────────────────────────────────────────── */
function EmptyState({ icon, title, line }: { icon: React.ReactNode; title: string; line: string }) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed bg-card py-16 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground">{icon}</span>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{line}</p>
    </div>
  )
}
