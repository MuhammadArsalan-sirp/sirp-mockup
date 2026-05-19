import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react"
import type { Column } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type Props<TData, TValue> = {
  column: Column<TData, TValue>
  title: string
  className?: string
}

/**
 * Click-to-open column header. Non-sortable columns just render the title.
 * Sortable columns open a popover with Asc / Desc / Hide.
 */
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: Props<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn("text-sm font-medium text-muted-foreground", className)}>{title}</div>
  }

  const sort = column.getIsSorted()

  return (
    <div className={cn("flex items-center", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 h-8 gap-1.5 px-2 text-sm font-medium text-muted-foreground hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground"
          >
            <span>{title}</span>
            {sort === "asc" ? (
              <ArrowUp className="size-3.5" />
            ) : sort === "desc" ? (
              <ArrowDown className="size-3.5" />
            ) : (
              <ChevronsUpDown className="size-3.5 opacity-60" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-36">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUp className="size-3.5 text-muted-foreground" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDown className="size-3.5 text-muted-foreground" />
            Desc
          </DropdownMenuItem>
          {column.getCanHide() && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                <EyeOff className="size-3.5 text-muted-foreground" />
                Hide
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
