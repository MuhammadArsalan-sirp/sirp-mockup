import { X } from "lucide-react"
import type { Table } from "@tanstack/react-table"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type Props<TData> = {
  table: Table<TData>
  /** Action buttons to show inside the bar (rendered between count and clear). */
  children: ReactNode
}

/**
 * Floating pill at bottom-center; appears only when rows are selected.
 * Children are the bulk action buttons (Run playbook, Reassign, etc.).
 */
export function DataTableBulkBar<TData>({ table, children }: Props<TData>) {
  const selected = table.getFilteredSelectedRowModel().rows.length
  const isVisible = selected > 0

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4 transition-all duration-200",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-3 opacity-0"
      )}
    >
      <div
        className={cn(
          "pointer-events-auto inline-flex items-center gap-1 rounded-full border bg-popover py-1.5 pl-4 pr-1.5 text-popover-foreground shadow-xl",
          !isVisible && "pointer-events-none"
        )}
      >
        <div className="text-xs">
          <span className="font-mono font-semibold tabular-nums">{selected}</span>{" "}
          selected
        </div>
        <Separator orientation="vertical" className="mx-1 h-5" />
        <div className="flex items-center gap-0.5">{children}</div>
        <Separator orientation="vertical" className="mx-1 h-5" />
        <Button
          variant="ghost"
          size="icon"
          className="size-7 rounded-full"
          onClick={() => table.resetRowSelection()}
          aria-label="Clear selection"
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
