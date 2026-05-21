import { useState } from "react"
import {
  ArrowDownUp,
  ChevronDown,
  RotateCcw,
  Settings2,
} from "lucide-react"
import type { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { AutonomyTableDensity } from "./autonomy-sortable-table"

export type AutonomyDisplayView = "card" | "list"

type Props<TData> = {
  /** Which view is active — list shows sort + visibility; card shows density. */
  currentView: AutonomyDisplayView
  /** Active table instance — required for list view, ignored for card view. */
  table?: Table<TData> | null
  density?: AutonomyTableDensity
  onDensityChange?: (d: AutonomyTableDensity) => void
}

// ─── List settings (sort + column visibility) ─────────────────────────────────

function ListSettings<TData>({ table }: { table: Table<TData> }) {
  const sortableColumns = table.getAllColumns().filter((col) => col.getCanSort())
  const hideableColumns = table.getAllColumns().filter((col) => col.getCanHide())
  const currentSort = table.getState().sorting[0]
  const sortColId = currentSort?.id ?? ""
  const sortDesc = currentSort?.desc ?? false

  const labelOf = (id: string) => {
    const col = table.getColumn(id)
    if (!col) return id
    const header = col.columnDef.header
    return typeof header === "string"
      ? header
      : id.charAt(0).toUpperCase() + id.slice(1)
  }

  const resetView = () => {
    table.resetSorting()
    table.resetColumnVisibility()
  }

  return (
    <div className="space-y-5 px-4 py-4">
      {/* Sorting */}
      <div className="space-y-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Sorting
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm">Sort by</span>
          <div className="flex items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex h-7 items-center gap-1 rounded-md border bg-background px-2.5 text-xs font-medium transition-colors hover:bg-muted/50">
                  {sortColId ? labelOf(sortColId) : "None"}
                  <ChevronDown className="size-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-44 max-h-[240px] overflow-y-auto"
              >
                {sortableColumns.map((col) => {
                  const header = col.columnDef.header
                  const label =
                    typeof header === "string"
                      ? header
                      : col.id.charAt(0).toUpperCase() + col.id.slice(1)
                  return (
                    <DropdownMenuItem
                      key={col.id}
                      className={col.id === sortColId ? "bg-muted/60" : ""}
                      onClick={() =>
                        table.setSorting([{ id: col.id, desc: sortDesc }])
                      }
                    >
                      {label}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              className="inline-flex h-7 items-center gap-1 rounded-md border bg-background px-2 text-xs font-medium transition-colors hover:bg-muted/50 disabled:opacity-40"
              disabled={!sortColId}
              onClick={() => {
                if (sortColId)
                  table.setSorting([{ id: sortColId, desc: !sortDesc }])
              }}
            >
              <ArrowDownUp className="size-3 text-muted-foreground" />
              {sortDesc ? "Desc" : "Asc"}
            </button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Column visibility */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Column Visibility
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Click to show or hide columns
        </p>
        <div className="flex flex-wrap gap-1.5">
          {hideableColumns.map((col) => {
            const header = col.columnDef.header
            const label =
              typeof header === "string"
                ? header
                : col.id.charAt(0).toUpperCase() + col.id.slice(1)
            const visible = col.getIsVisible()
            return (
              <button
                key={col.id}
                onClick={() => col.toggleVisibility()}
                className={cn(
                  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
                  visible
                    ? "border-transparent bg-muted/60 text-foreground hover:bg-muted"
                    : "border-dashed text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <Separator />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={resetView}
        >
          <RotateCcw className="size-3" />
          Reset
        </button>
        <button className="text-xs text-primary hover:underline">
          Set default for everyone
        </button>
      </div>
    </div>
  )
}

// ─── Card settings (density) ──────────────────────────────────────────────────

function CardSettings({
  density,
  onDensityChange,
}: {
  density: AutonomyTableDensity
  onDensityChange: (d: AutonomyTableDensity) => void
}) {
  const reset = () => onDensityChange("comfortable")
  return (
    <div className="space-y-5 px-4 py-4">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Card Density
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Controls card padding and grid gap
        </p>
        <div className="inline-flex w-full items-center rounded-md border bg-background p-0.5">
          {(
            [
              { key: "comfortable" as const, label: "Comfortable" },
              { key: "compact" as const, label: "Compact" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => onDensityChange(key)}
              className={cn(
                "flex-1 inline-flex h-8 items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors",
                density === key
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-pressed={density === key}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={reset}
        >
          <RotateCcw className="size-3" />
          Reset
        </button>
        <button className="text-xs text-primary hover:underline">
          Set default for everyone
        </button>
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function AutonomyViewSettings<TData>({
  currentView,
  table,
  density = "comfortable",
  onDensityChange,
}: Props<TData>) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1.5">
          <Settings2 className="size-3.5" />
          Display
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[340px] p-0" align="end" sideOffset={6}>
        <div className="max-h-[600px] overflow-y-auto">
          {currentView === "list" && table && <ListSettings table={table} />}
          {currentView === "card" && onDensityChange && (
            <CardSettings density={density} onDensityChange={onDensityChange} />
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
