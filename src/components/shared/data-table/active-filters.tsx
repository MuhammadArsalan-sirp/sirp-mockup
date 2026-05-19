import { X } from "lucide-react"
import type { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type FacetLabelMap = {
  /** column id → label registry: { value → label } for friendly display */
  [columnId: string]: { label: string; values: Record<string, string> }
}

type Props<TData> = {
  table: Table<TData>
  /** Maps each filterable column id → friendly column name + value labels. */
  labels: FacetLabelMap
}

/**
 * Active-filters bar — shows applied filters as pills with X to remove.
 * Renders nothing if no column filters are active.
 */
export function DataTableActiveFilters<TData>({ table, labels }: Props<TData>) {
  const filters = table.getState().columnFilters
  if (filters.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="text-muted-foreground">Filtered by:</span>
      {filters.map((f) => {
        const meta = labels[f.id]
        const values = (f.value as string[]) ?? []
        const colName = meta?.label ?? f.id
        return (
          <Badge
            key={f.id}
            variant="secondary"
            className="gap-1.5 pr-1 font-normal"
          >
            <span className="text-muted-foreground">{colName}:</span>
            <span className="font-medium">
              {values.length === 1
                ? meta?.values[values[0]] ?? values[0]
                : `${values.length} selected`}
            </span>
            <button
              type="button"
              onClick={() => table.getColumn(f.id)?.setFilterValue(undefined)}
              className="ml-0.5 grid size-4 place-items-center rounded-full text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground"
              aria-label={`Remove ${colName} filter`}
            >
              <X className="size-3" />
            </button>
          </Badge>
        )
      })}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-muted-foreground hover:text-foreground"
        onClick={() => table.resetColumnFilters()}
      >
        Clear all
        <X className="size-3" />
      </Button>
    </div>
  )
}
