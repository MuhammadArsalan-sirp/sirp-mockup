import { LayoutGrid, LayoutList, Rows3, Search, X } from "lucide-react"
import type { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { Incident } from "@/data/incidents"
import type { BoardViewConfig, ListViewConfig } from "./incidents-view-types"
import { IncidentsFilterPopover } from "./incidents-filter-popover"
import { IncidentsViewSettings } from "./incidents-view-settings"

export type ViewMode = "grid" | "list" | "board"

type Props = {
  table: Table<Incident>
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  listConfig: ListViewConfig
  onListConfigChange: (patch: Partial<ListViewConfig>) => void
  boardConfig: BoardViewConfig
  onBoardConfigChange: (patch: Partial<BoardViewConfig>) => void
}

export function IncidentsToolbar({
  table,
  viewMode,
  onViewModeChange,
  listConfig,
  onListConfigChange,
  boardConfig,
  onBoardConfigChange,
}: Props) {
  const searchValue = (table.getColumn("title")?.getFilterValue() as string) ?? ""
  const isFiltered = searchValue.length > 0

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative w-[260px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search incidents…"
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("title")?.setFilterValue(e.target.value)
          }
          className="h-9 pl-9"
        />
      </div>

      {/* Reset — only when filters active */}
      {isFiltered && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-2 text-muted-foreground hover:text-foreground"
          onClick={() => table.getColumn("title")?.setFilterValue("")}
        >
          Reset
          <X className="size-3.5" />
        </Button>
      )}

      <div className="ml-auto" />

      {/* Grid / List / Board view toggle */}
      <div className="inline-flex items-center rounded-md border bg-background p-0.5">
        {(
          [
            { key: "grid"  as ViewMode, label: "Grid",  Icon: Rows3      },
            { key: "list"  as ViewMode, label: "List",  Icon: LayoutList },
            { key: "board" as ViewMode, label: "Board", Icon: LayoutGrid },
          ] as const
        ).map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onViewModeChange(key)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-sm px-2.5 text-xs font-medium transition-colors",
              viewMode === key
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={viewMode === key}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* View settings */}
      <IncidentsViewSettings
        currentView={viewMode}
        table={table}
        listConfig={listConfig}
        onListConfigChange={onListConfigChange}
        boardConfig={boardConfig}
        onBoardConfigChange={onBoardConfigChange}
      />

      {/* Filter popover */}
      <IncidentsFilterPopover table={table} />
    </div>
  )
}
