import { SlidersHorizontal } from "lucide-react"
import type { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Props<TData> = {
  table: Table<TData>
  /** Map of column-id → friendly label for the toggle list. Falls back to id. */
  labels?: Record<string, string>
}

/**
 * "Manage Table" dropdown — toggles column visibility.
 * Lists every column that opted-in via `enableHiding !== false`.
 */
export function DataTableViewOptions<TData>({ table, labels }: Props<TData>) {
  const toggleable = table
    .getAllColumns()
    .filter((c) => typeof c.accessorFn !== "undefined" && c.getCanHide())

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 hidden lg:flex">
          <SlidersHorizontal className="size-3.5" />
          Manage table
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {toggleable.map((col) => (
          <DropdownMenuCheckboxItem
            key={col.id}
            className="capitalize"
            checked={col.getIsVisible()}
            onCheckedChange={(v) => col.toggleVisibility(!!v)}
          >
            {labels?.[col.id] ?? col.id}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
