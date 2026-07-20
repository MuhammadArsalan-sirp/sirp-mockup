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
} from "@tanstack/react-table"
import { Send, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DataTableBulkBar,
  DataTablePagination,
  getPinningClass,
  getPinningStyle,
} from "@/components/shared/data-table"
import { cn } from "@/lib/utils"
import type { Report } from "@/data/reports"
import { createReportColumns, type ReportRowHandlers } from "./report-columns"

function getEdgePadding(columnId: string): string {
  if (columnId === "select") return "pl-4 pr-2"
  if (columnId === "actions") return "pl-2 pr-4"
  return "px-4"
}

export function ReportsTable({
  data,
  handlers,
  emptyMessage = "No reports match the current filters.",
}: {
  data: Report[]
  handlers: ReportRowHandlers
  emptyMessage?: string
}) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "updatedOn", desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})
  const columns = useMemo(() => createReportColumns(handlers), [handlers])

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: {
      pagination: { pageSize: 8 },
      columnPinning: { left: ["select"], right: ["actions"] },
    },
  })

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-md border">
        <Table>
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
                        "h-11 whitespace-nowrap",
                        getEdgePadding(header.column.id),
                        pinClass &&
                          "bg-[var(--table-header-bg)] [tr:hover>&]:bg-[var(--table-header-bg)] [tr[data-state=selected]>&]:bg-[var(--table-header-bg)]"
                      )}
                      style={pinStyle}
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
                  onClick={() => handlers.onPreview(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn("py-3", getEdgePadding(cell.column.id), getPinningClass(cell.column))}
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
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
      <DataTableBulkBar table={table}>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 rounded-full">
          <Send className="size-3.5 text-muted-foreground" />
          Email now
        </Button>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 rounded-full">
          <Trash2 className="size-3.5 text-muted-foreground" />
          Delete
        </Button>
      </DataTableBulkBar>
    </div>
  )
}
