import { useMemo, useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import {
  BarChart2,
  CheckCircle2,
  Download,
  Inbox,
  Plus,
  Send,
  ShieldCheck,
  UserPlus,
} from "lucide-react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageHeader } from "@/components/shared/page-header"
import {
  DataTableActiveFilters,
  DataTableBulkBar,
  DataTablePagination,
  getPinningClass,
  getPinningStyle,
} from "@/components/shared/data-table"
import { cn } from "@/lib/utils"
import { incidents } from "@/data/incidents"
import { incidentsColumns } from "./incidents-columns"
import { IncidentsToolbar, type ViewMode } from "./incidents-toolbar"
import { IncidentsAnalytics } from "./incidents-analytics"
import {
  IncidentsAnalyticsToolbar,
  type AnalyticsDateRange,
  type AnalyticsRecordType,
  type AnalyticsTimeRange,
} from "./incidents-analytics-toolbar"
import { IncidentsBoard } from "./incidents-board"
import { IncidentsFeed } from "./incidents-feed"
import { filterLabels } from "./incidents-filters"
import type { BoardViewConfig, ListViewConfig } from "./incidents-view-types"
import { DEFAULT_BOARD_CONFIG, DEFAULT_LIST_CONFIG } from "./incidents-view-types"

type ActiveTab = "queue" | "analytics"

/**
 * Per-column horizontal padding so the leftmost (checkbox) and rightmost
 * (kebab) feel tight against their neighbours, while regular columns keep
 * comfortable px-4 breathing room.
 *   select       │ pl-4 pr-2  → snug on the right edge of the cell
 *   id (1st col) │ pl-2 pr-4  → snug on the left edge to sit close to checkbox
 *   actions      │ pl-2 pr-4  → kebab close to its previous cell
 *   everything else │ px-4
 */
function getEdgePadding(columnId: string): string {
  if (columnId === "select") return "pl-4 pr-2"
  if (columnId === "id") return "pl-2 pr-4"
  if (columnId === "actions") return "pl-2 pr-4"
  return "px-4"
}

// Mock 30-day series for the KPI sparklines (deterministic — no flicker on rerender).
const sparkOpen = [
  39, 41, 38, 40, 42, 39, 43, 44, 41, 42, 45, 43, 46, 44, 47, 45, 48, 46, 49,
  47, 50, 48, 51, 49, 47, 50, 48, 46, 49, 47,
]
const sparkCritical = [
  6, 7, 6, 7, 8, 6, 7, 8, 9, 8, 9, 10, 9, 8, 9, 10, 9, 10, 9, 11, 10, 9, 8, 9,
  10, 9, 11, 10, 9, 9,
]
const sparkSla = [
  4, 5, 4, 6, 5, 4, 5, 6, 5, 4, 5, 4, 5, 4, 5, 4, 3, 4, 3, 4, 3, 2, 3, 4, 3, 4,
  3, 4, 3, 3,
]
const sparkMttr = [
  12, 11, 12, 11, 10, 11, 10, 11, 10, 9, 10, 9, 10, 9, 10, 9, 8, 9, 8, 9, 8, 9,
  8, 7, 8, 9, 8, 8, 8, 8,
]

export function IncidentsListPage() {
  const navigate = useNavigate()

  // Table state
  const [sorting, setSorting] = useState<SortingState>([
    { id: "updated", desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  // Default-visible columns are the high-signal ones for triage.
  // The 20+ remaining columns are toggleable from "Manage table".
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    sourceId: false,
    priority: false,
    state: true,
    disposition: false,
    category: false,
    type: false,
    risk: false,
    s3Score: false,
    members: false,
    customer: false,
    location: false,
    openedBy: false,
    closedBy: false,
    artifacts: false,
    startDate: false,
    updateDate: false,
    closeDate: false,
    detectionDate: false,
    escalationDate: false,
    riskMitigationDate: false,
    created: false,
    mitre: false,
    tags: false,
    tenant: false,
    iocs: false,
    alerts: false,
    aiConfidence: false,
  })
  const [rowSelection, setRowSelection] = useState({})
  const [activeTab, setActiveTab] = useState<ActiveTab>("queue")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [listConfig, setListConfig] = useState<ListViewConfig>(DEFAULT_LIST_CONFIG)
  const [boardConfig, setBoardConfig] = useState<BoardViewConfig>(DEFAULT_BOARD_CONFIG)

  // Analytics toolbar state
  const [analyticsRecordType, setAnalyticsRecordType] = useState<AnalyticsRecordType>("all")
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState<AnalyticsTimeRange>("30d")
  const [analyticsDateRange, setAnalyticsDateRange] = useState<AnalyticsDateRange>({ from: null, to: null })

  const handleListConfigChange = (patch: Partial<ListViewConfig>) =>
    setListConfig((prev) => ({ ...prev, ...patch }))

  const handleBoardConfigChange = (patch: Partial<BoardViewConfig>) =>
    setBoardConfig((prev) => ({ ...prev, ...patch }))

  const data = useMemo(() => incidents, [])

  const table = useReactTable({
    data,
    columns: incidentsColumns,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: {
      pagination: { pageSize: 10 },
      // Selection (left) and row actions (right) stay visible while
      // the rest of the table scrolls horizontally.
      columnPinning: { left: ["select"], right: ["actions"] },
    },
  })

  return (
    <div className="space-y-5">
      <PageHeader
        title="Incidents"
        center={
          <div className="inline-flex items-center rounded-md border bg-background p-0.5">
            {(
              [
                { key: "queue"     as ActiveTab, label: "Queue",     Icon: Inbox     },
                { key: "analytics" as ActiveTab, label: "Analytics", Icon: BarChart2 },
              ] as const
            ).map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-sm px-3 text-sm font-medium transition-colors",
                  activeTab === key
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-pressed={activeTab === key}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>
        }
        actions={
          <>
            <Button variant="outline" size="sm" className="h-8 text-sm">
              <Download className="size-4" />
              Export
            </Button>
            <Button size="sm" className="h-8 text-sm">
              <Plus className="size-4" />
              New Ticket
            </Button>
          </>
        }
      />

      {/* KPI strip — with sparklines */}
      {/*<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<AlertTriangle className="size-4" />}
          label="Open incidents"
          value={47}
          trend="+12.5%"
          trendTone="destructive"
          trendDirection="up"
          caption="9 critical · 17 high · 21 medium"
          series={sparkOpen}
          sparkTone="info"
        />
        <KpiCard
          icon={<Shield className="size-4" />}
          label="Critical severity"
          value={9}
          trend="+2"
          trendTone="destructive"
          trendDirection="up"
          caption="3 unassigned · 6 in progress"
          series={sparkCritical}
          sparkTone="destructive"
        />
        <KpiCard
          icon={<Clock className="size-4" />}
          label="Breaching SLA"
          value={3}
          trend="−1"
          trendTone="success"
          trendDirection="down"
          caption="4 within next hour · soonest 28m"
          series={sparkSla}
          sparkTone="attention"
        />
        <KpiCard
          icon={<Zap className="size-4" />}
          label="Average MTTR"
          value="8m"
          trend="−20%"
          trendTone="success"
          trendDirection="down"
          caption="P50 12m · P90 41m"
          series={sparkMttr}
          sparkTone="success"
        />
      </div>*/}

      {/* Toolbar row — changes based on active tab */}
      {activeTab === "analytics" ? (
        <IncidentsAnalyticsToolbar
          recordType={analyticsRecordType}
          onRecordTypeChange={setAnalyticsRecordType}
          timeRange={analyticsTimeRange}
          onTimeRangeChange={setAnalyticsTimeRange}
          dateRange={analyticsDateRange}
          onDateRangeChange={setAnalyticsDateRange}
        />
      ) : (
        <>
          <IncidentsToolbar
            table={table}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            listConfig={listConfig}
            onListConfigChange={handleListConfigChange}
            boardConfig={boardConfig}
            onBoardConfigChange={handleBoardConfigChange}
          />
          {/* Active filter chips (only renders when filters are active) */}
          <DataTableActiveFilters table={table} labels={filterLabels} />
        </>
      )}

      {/* Main content */}
      {activeTab === "analytics" ? (
        <IncidentsAnalytics
          table={table}
          recordType={analyticsRecordType}
          timeRange={analyticsTimeRange}
          dateRange={analyticsDateRange}
        />
      ) : viewMode === "grid" ? (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table className="min-w-[1100px]">
              {/* --table-header-bg is the SOLID equivalent of "muted/40 on
                  card" — same darker tone autonomy uses for its tables.
                  Pinned cells need an opaque bg (sticky cells can't be
                  translucent or scrolled content shows through), and using
                  this variable keeps pinned and non-pinned in lockstep. */}
              <TableHeader className="bg-[var(--table-header-bg)] [&_tr]:bg-[var(--table-header-bg)]">
                {table.getHeaderGroups().map((hg) => (
                  <TableRow
                    key={hg.id}
                    className="hover:bg-[var(--table-header-bg)]"
                  >
                    {hg.headers.map((header) => {
                      const pinClass = getPinningClass(header.column)
                      const pinStyle = getPinningStyle(header.column)
                      return (
                        <TableHead
                          key={header.id}
                          className={cn(
                            "h-12",
                            getEdgePadding(header.column.id),
                            pinClass &&
                              "bg-[var(--table-header-bg)] [tr:hover>&]:bg-[var(--table-header-bg)] [tr[data-state=selected]>&]:bg-[var(--table-header-bg)]"
                          )}
                          style={{
                            ...pinStyle,
                            width:
                              header.getSize() === 150
                                ? undefined
                                : header.getSize(),
                          }}
                          data-pinned={header.column.getIsPinned() || undefined}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      // Override shadcn's default hover:bg-muted/50 → /40 to
                      // match the autonomy module's row hover intensity.
                      className="cursor-pointer hover:bg-muted/40 data-[state=selected]:bg-muted/40"
                      onClick={() => navigate(`/incidents/${row.original.id}`)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "py-4",
                            getEdgePadding(cell.column.id),
                            getPinningClass(cell.column)
                          )}
                          style={getPinningStyle(cell.column)}
                          data-pinned={cell.column.getIsPinned() || undefined}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={incidentsColumns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No incidents match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination table={table} />
        </>
      ) : viewMode === "list" ? (
        <IncidentsFeed table={table} config={listConfig} />
      ) : (
        <IncidentsBoard table={table} config={boardConfig} />
      )}

      {/* Floating bulk-action bar (hidden when 0 selected) */}
      <DataTableBulkBar table={table}>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 rounded-full">
          <Send className="size-3.5 text-muted-foreground" />
          Run playbook
        </Button>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 rounded-full">
          <ShieldCheck className="size-3.5 text-muted-foreground" />
          Isolate
        </Button>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 rounded-full">
          <UserPlus className="size-3.5 text-muted-foreground" />
          Reassign
        </Button>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 rounded-full">
          <CheckCircle2 className="size-3.5 text-muted-foreground" />
          Resolve
        </Button>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 rounded-full">
          <Download className="size-3.5 text-muted-foreground" />
          Export
        </Button>
      </DataTableBulkBar>
    </div>
  )
}
