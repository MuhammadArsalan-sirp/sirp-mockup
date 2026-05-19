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
  Shield,
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
import { threatIntelItems } from "@/data/threat-intel"
import { threatIntelColumns } from "./threat-intel-columns"
import { ThreatIntelToolbar, type ViewMode } from "./threat-intel-toolbar"
import { ThreatIntelAnalytics } from "./threat-intel-analytics"
import {
  ThreatIntelAnalyticsToolbar,
  type AnalyticsDateRange,
  type AnalyticsRecordType,
  type AnalyticsTimeRange,
} from "./threat-intel-analytics-toolbar"
import { ThreatIntelBoard } from "./threat-intel-board"
import { ThreatIntelFeed } from "./threat-intel-feed"
import { filterLabels } from "./threat-intel-filters"
import type { BoardViewConfig, ListViewConfig } from "./threat-intel-view-types"
import { DEFAULT_BOARD_CONFIG, DEFAULT_LIST_CONFIG } from "./threat-intel-view-types"

type ActiveTab = "queue" | "analytics"

function getEdgePadding(columnId: string): string {
  if (columnId === "select") return "pl-4 pr-2"
  if (columnId === "id") return "pl-2 pr-4"
  if (columnId === "actions") return "pl-2 pr-4"
  return "px-4"
}

export function ThreatIntelListPage() {
  const navigate = useNavigate()

  const [sorting, setSorting] = useState<SortingState>([
    { id: "updated", desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
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

  const handleListConfigChange = (patch: Partial<ListViewConfig>) =>
    setListConfig((prev) => ({ ...prev, ...patch }))

  const handleBoardConfigChange = (patch: Partial<BoardViewConfig>) =>
    setBoardConfig((prev) => ({ ...prev, ...patch }))

  // Analytics toolbar state
  const [analyticsRecordType, setAnalyticsRecordType] = useState<AnalyticsRecordType>("all")
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState<AnalyticsTimeRange>("30d")
  const [analyticsDateRange, setAnalyticsDateRange] = useState<AnalyticsDateRange>({ from: null, to: null })

  const data = useMemo(() => threatIntelItems, [])

  const table = useReactTable({
    data,
    columns: threatIntelColumns,
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
      columnPinning: { left: ["select"], right: ["actions"] },
    },
  })

  return (
    <div className="space-y-5">
      <PageHeader
        title="Threat Intel"
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
              New Item
            </Button>
          </>
        }
      />

      {/* Toolbar row — changes based on active tab */}
      {activeTab === "analytics" ? (
        <ThreatIntelAnalyticsToolbar
          recordType={analyticsRecordType}
          onRecordTypeChange={setAnalyticsRecordType}
          timeRange={analyticsTimeRange}
          onTimeRangeChange={setAnalyticsTimeRange}
          dateRange={analyticsDateRange}
          onDateRangeChange={setAnalyticsDateRange}
        />
      ) : (
        <>
          <ThreatIntelToolbar
            table={table}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            listConfig={listConfig}
            onListConfigChange={handleListConfigChange}
            boardConfig={boardConfig}
            onBoardConfigChange={handleBoardConfigChange}
          />
          <DataTableActiveFilters table={table} labels={filterLabels} />
        </>
      )}

      {/* Main content */}
      {activeTab === "analytics" ? (
        <ThreatIntelAnalytics
          table={table}
          recordType={analyticsRecordType}
          timeRange={analyticsTimeRange}
          dateRange={analyticsDateRange}
        />
      ) : viewMode === "grid" ? (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table className="min-w-[1100px]">
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
                      className="cursor-pointer hover:bg-muted/40 data-[state=selected]:bg-muted/40"
                      onClick={() => navigate(`/threat-intel/${row.original.id}`)}
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
                      colSpan={threatIntelColumns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No threat intel items match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination table={table} />
        </>
      ) : viewMode === "list" ? (
        <ThreatIntelFeed table={table} config={listConfig} />
      ) : (
        <ThreatIntelBoard table={table} config={boardConfig} />
      )}

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
