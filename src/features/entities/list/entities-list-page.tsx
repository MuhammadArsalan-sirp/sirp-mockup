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
import { Download, Plus, TrendingDown, TrendingUp } from "lucide-react"
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
  DataTablePagination,
  getPinningClass,
  getPinningStyle,
} from "@/components/shared/data-table"
import { cn } from "@/lib/utils"
import { entities } from "@/data/entities"
import { entitiesColumns } from "./entities-columns"
import { EntitiesToolbar, type ViewMode } from "./entities-toolbar"
import { EntitiesFeed } from "./entities-feed"
import { EntitiesBoard } from "./entities-board"
import { filterLabels } from "./entities-filters"
import type { BoardViewConfig, ListViewConfig } from "./entities-view-types"
import { DEFAULT_BOARD_CONFIG, DEFAULT_LIST_CONFIG } from "./entities-view-types"

function StatCard({
  label,
  value,
  delta,
  deltaUp,
  tone = "neutral",
}: {
  label: string
  value: string | number
  delta: string
  deltaUp: boolean
  tone?: "destructive" | "attention" | "success" | "neutral"
}) {
  const toneClass = {
    destructive: "text-destructive",
    attention:   "text-amber-500",
    success:     "text-emerald-500",
    neutral:     "text-muted-foreground",
  }[tone]

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border bg-card p-4">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-2xl font-bold tabular-nums">{value}</span>
      <span className={cn("flex items-center gap-1 text-xs font-medium", toneClass)}>
        {deltaUp ? <TrendingUp className="size-3 shrink-0" /> : <TrendingDown className="size-3 shrink-0" />}
        {delta}
      </span>
    </div>
  )
}

function getEdgePadding(columnId: string): string {
  if (columnId === "select") return "pl-4 pr-2"
  if (columnId === "name") return "pl-2 pr-4"
  if (columnId === "actions") return "pl-2 pr-4"
  return "px-4"
}

export function EntitiesListPage() {
  const navigate = useNavigate()

  const [sorting, setSorting] = useState<SortingState>([
    { id: "s3Score", desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: false,
    department: false,
    tags: false,
    created: false,
  })
  const [rowSelection, setRowSelection] = useState({})
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [listConfig, setListConfig] = useState<ListViewConfig>(DEFAULT_LIST_CONFIG)
  const [boardConfig, setBoardConfig] = useState<BoardViewConfig>(DEFAULT_BOARD_CONFIG)

  const handleListConfigChange = (patch: Partial<ListViewConfig>) =>
    setListConfig((prev) => ({ ...prev, ...patch }))

  const handleBoardConfigChange = (patch: Partial<BoardViewConfig>) =>
    setBoardConfig((prev) => ({ ...prev, ...patch }))

  const data = useMemo(() => entities, [])

  const table = useReactTable({
    data,
    columns: entitiesColumns,
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

  const stats = useMemo(() => {
    const rows = table.getFilteredRowModel().rows.map((r) => r.original)
    const critical = rows.filter((e) => e.criticality === "critical").length || 8
    const highRisk = rows.filter((e) => e.s3Score >= 75).length              || 14
    const avgS3    = rows.length
      ? Math.round(rows.reduce((s, e) => s + e.s3Score, 0) / rows.length)
      : 71
    const active   = rows.filter((e) => e.status === "active").length        || 31
    const inactive = rows.filter((e) => e.status === "inactive" || e.status === "unknown").length || 9
    const unowned  = rows.filter((e) => !e.owner).length                     || 6
    return { critical, highRisk, avgS3, active, inactive, unowned }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.getFilteredRowModel().rows])

  return (
    <div className="space-y-5">
      <PageHeader
        title="Entities"
        actions={
          <>
            <Button variant="outline" size="sm" className="h-8 text-sm">
              <Download className="size-4" />
              Export
            </Button>
            <Button size="sm" className="h-8 text-sm">
              <Plus className="size-4" />
              New Entity
            </Button>
          </>
        }
      />

      <EntitiesToolbar
        table={table}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        listConfig={listConfig}
        onListConfigChange={handleListConfigChange}
        boardConfig={boardConfig}
        onBoardConfigChange={handleBoardConfigChange}
      />

      <DataTableActiveFilters table={table} labels={filterLabels} />

      {/* ── KPI strip ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-6 gap-4">
        <StatCard label="Critical"         value={stats.critical} delta="+1 vs last week"  deltaUp   tone="destructive" />
        <StatCard label="High Risk S3"     value={stats.highRisk} delta="+3 vs last week"  deltaUp   tone="attention"   />
        <StatCard label="Avg S3 Score"     value={stats.avgS3}    delta="+2 vs last week"  deltaUp   tone="attention"   />
        <StatCard label="Active"           value={stats.active}   delta="+4 vs last week"  deltaUp   tone="neutral"     />
        <StatCard label="Inactive / Unknown" value={stats.inactive} delta="−1 vs last week" deltaUp={false} tone="success" />
        <StatCard label="Unowned"          value={stats.unowned}  delta="no change"        deltaUp={false} tone="neutral" />
      </div>

      {viewMode === "grid" ? (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table className="min-w-[900px]">
              <TableHeader className="bg-[var(--table-header-bg)] [&_tr]:bg-[var(--table-header-bg)]">
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id} className="hover:bg-[var(--table-header-bg)]">
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
                              "bg-[var(--table-header-bg)] [tr:hover>&]:bg-[var(--table-header-bg)] [tr[data-state=selected]>&]:bg-[var(--table-header-bg)]",
                          )}
                          style={{
                            ...pinStyle,
                            width: header.getSize() === 150 ? undefined : header.getSize(),
                          }}
                          data-pinned={header.column.getIsPinned() || undefined}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
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
                      onClick={() => navigate(`/entities/${row.original.id}`)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "py-4",
                            getEdgePadding(cell.column.id),
                            getPinningClass(cell.column),
                          )}
                          style={getPinningStyle(cell.column)}
                          data-pinned={cell.column.getIsPinned() || undefined}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={entitiesColumns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No entities match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination table={table} />
        </>
      ) : viewMode === "list" ? (
        <EntitiesFeed table={table} config={listConfig} />
      ) : (
        <EntitiesBoard table={table} config={boardConfig} />
      )}
    </div>
  )
}
