import { useEffect, useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type Table as RTTable,
  type VisibilityState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export type AutonomyColumnMeta = {
  thClass?: string
  tdClass?: string
}

export type AutonomyTableDensity = "comfortable" | "compact"

function metaOf(def: { meta?: unknown }): AutonomyColumnMeta {
  return (def.meta ?? {}) as AutonomyColumnMeta
}

type Props<TData extends object> = {
  data: TData[]
  columns: ColumnDef<TData, unknown>[]
  getRowId?: (row: TData, index: number) => string
  initialSorting?: SortingState
  emptyMessage?: string
  /** Lift the table instance so a parent toolbar (e.g. Display popover) can read sorting / visibility / columns. */
  onTableReady?: (table: RTTable<TData>) => void
  density?: AutonomyTableDensity
}

/**
 * Autonomy list tables — same sortable header UX as incidents (DataTableColumnHeader).
 * Defaults to `enableHiding: true` so the Display popover can toggle column visibility.
 */
export function AutonomyDataTable<TData extends object>({
  data,
  columns,
  getRowId,
  initialSorting = [],
  emptyMessage = "No rows.",
  onTableReady,
  density = "comfortable",
}: Props<TData>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: getRowId ? (row, i) => getRowId(row as TData, i) : undefined,
    defaultColumn: {
      enableHiding: true,
    },
  })

  useEffect(() => {
    onTableReady?.(table)
  }, [table, onTableReady])

  const rows = table.getRowModel().rows
  const visibleCols = table.getVisibleLeafColumns().length

  const cellY = density === "compact" ? "py-1.5" : "py-3"

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="border-b bg-muted/40 hover:bg-muted/40">
              {hg.headers.map((header) => {
                const meta = metaOf(header.column.columnDef)
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "h-10 px-4 py-2.5 text-xs font-medium text-muted-foreground",
                      meta?.thClass
                    )}
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
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={visibleCols}
                className="h-24 px-4 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/40">
                {row.getVisibleCells().map((cell) => {
                  const meta = metaOf(cell.column.columnDef)
                  return (
                    <TableCell
                      key={cell.id}
                      className={cn("px-4 text-sm", cellY, meta?.tdClass)}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
