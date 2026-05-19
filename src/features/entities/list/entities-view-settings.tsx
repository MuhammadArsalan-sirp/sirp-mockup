import { useState } from "react"
import {
  ArrowDownUp,
  ChevronDown,
  GripVertical,
  Plus,
  RotateCcw,
  Settings2,
} from "lucide-react"
import type { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { Entity } from "@/data/entities"
import type { ViewMode } from "./entities-toolbar"
import type {
  BoardField,
  BoardViewConfig,
  GroupByField,
  ListField,
  ListViewConfig,
  OrderByField,
} from "./entities-view-types"
import {
  BOARD_FIELD_LABELS,
  DEFAULT_BOARD_CONFIG,
  DEFAULT_LIST_CONFIG,
  GROUP_BY_LABELS,
  LIST_FIELD_LABELS,
  LIST_FIELD_ORDER,
  ORDER_BY_LABELS,
} from "./entities-view-types"

// ─── Small helpers ────────────────────────────────────────────────────────────

function DropdownSelect<T extends string>({
  value,
  options,
  labels,
  onChange,
}: {
  value: T
  options: T[]
  labels: Record<T, string>
  onChange: (v: T) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex h-7 items-center gap-1 rounded-md border bg-background px-2.5 text-xs font-medium transition-colors hover:bg-muted/50">
          {labels[value]}
          <ChevronDown className="size-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {options.map((o) => (
          <DropdownMenuItem
            key={o}
            className={o === value ? "bg-muted/60" : ""}
            onClick={() => onChange(o)}
          >
            {labels[o]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function FieldChip({
  label,
  onRemove,
  required,
}: {
  label: string
  onRemove?: () => void
  required?: boolean
}) {
  if (!required && onRemove) {
    return (
      <button
        onClick={onRemove}
        className="inline-flex items-center rounded-md border bg-muted/60 px-2 py-0.5 text-xs font-medium transition-colors hover:bg-muted/40"
      >
        {label}
      </button>
    )
  }
  return (
    <span className="inline-flex items-center rounded-md border bg-muted/60 px-2 py-0.5 text-xs font-medium">
      {label}
    </span>
  )
}

function AddFieldButton({ available, onAdd }: { available: string[]; onAdd: (f: string) => void }) {
  if (available.length === 0) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex items-center gap-1 rounded-md border border-dashed px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground">
          <Plus className="size-3" />
          Add field
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-[240px] w-44 overflow-y-auto">
        {available.map((f) => (
          <DropdownMenuItem key={f} onClick={() => onAdd(f)}>{f}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Option arrays ────────────────────────────────────────────────────────────

const GROUP_OPTIONS = Object.keys(GROUP_BY_LABELS) as GroupByField[]
const ORDER_OPTIONS = Object.keys(ORDER_BY_LABELS) as OrderByField[]

// ─── Panel: List view settings ────────────────────────────────────────────────

function ListSettings({
  config,
  onChange,
  onReset,
}: {
  config: ListViewConfig
  onChange: (patch: Partial<ListViewConfig>) => void
  onReset: () => void
}) {
  const toggleableFields = LIST_FIELD_ORDER.filter((f) => f !== "name")
  const available = toggleableFields
    .filter((f) => !config.collapsedFields.includes(f))
    .map((f) => LIST_FIELD_LABELS[f])

  const removeField = (field: ListField) =>
    onChange({ collapsedFields: config.collapsedFields.filter((f) => f !== field) })

  const addField = (label: string) => {
    const field = LIST_FIELD_ORDER.find((f) => LIST_FIELD_LABELS[f] === label)
    if (field) onChange({ collapsedFields: [...config.collapsedFields, field] })
  }

  return (
    <div className="space-y-5 px-4 py-4">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-sm">Grouping</span>
          <DropdownSelect<GroupByField>
            value={config.groupBy}
            options={GROUP_OPTIONS}
            labels={GROUP_BY_LABELS}
            onChange={(v) => onChange({ groupBy: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Sub-grouping</span>
          <DropdownSelect<GroupByField>
            value={config.subGroupBy}
            options={GROUP_OPTIONS}
            labels={GROUP_BY_LABELS}
            onChange={(v) => onChange({ subGroupBy: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm">
            <GripVertical className="size-3.5 text-muted-foreground" />
            Ordering
          </span>
          <DropdownSelect<OrderByField>
            value={config.orderBy}
            options={ORDER_OPTIONS}
            labels={ORDER_BY_LABELS}
            onChange={(v) => onChange({ orderBy: v })}
          />
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <span className="text-sm">Show empty groups</span>
        <Switch
          checked={config.showEmptyGroups}
          onCheckedChange={(v) => onChange({ showEmptyGroups: v })}
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Fields</p>
        <div className="flex flex-wrap gap-1.5">
          <FieldChip label="Name" required />
          {config.collapsedFields.filter((f) => f !== "name").map((f) => (
            <FieldChip key={f} label={LIST_FIELD_LABELS[f]} onRemove={() => removeField(f)} />
          ))}
          <AddFieldButton available={available} onAdd={addField} />
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          onClick={onReset}
        >
          <RotateCcw className="size-3" />
          Reset
        </button>
        <button className="text-xs text-primary hover:underline">Set default for everyone</button>
      </div>
    </div>
  )
}

// ─── Panel: Board view settings ───────────────────────────────────────────────

function BoardSettings({
  config,
  onChange,
  onReset,
}: {
  config: BoardViewConfig
  onChange: (patch: Partial<BoardViewConfig>) => void
  onReset: () => void
}) {
  const allBoardFields = Object.keys(BOARD_FIELD_LABELS) as BoardField[]
  const available = allBoardFields
    .filter((f) => !config.cardFields.includes(f))
    .map((f) => BOARD_FIELD_LABELS[f])

  const removeField = (field: BoardField) =>
    onChange({ cardFields: config.cardFields.filter((f) => f !== field) })

  const addField = (label: string) => {
    const field = allBoardFields.find((f) => BOARD_FIELD_LABELS[f] === label)
    if (field) onChange({ cardFields: [...config.cardFields, field] })
  }

  return (
    <div className="space-y-5 px-4 py-4">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-sm">Grouping</span>
          <DropdownSelect<GroupByField>
            value={config.groupBy}
            options={GROUP_OPTIONS}
            labels={GROUP_BY_LABELS}
            onChange={(v) => onChange({ groupBy: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Sub-grouping</span>
          <DropdownSelect<GroupByField>
            value={config.subGroupBy}
            options={GROUP_OPTIONS}
            labels={GROUP_BY_LABELS}
            onChange={(v) => onChange({ subGroupBy: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm">
            <GripVertical className="size-3.5 text-muted-foreground" />
            Ordering
          </span>
          <DropdownSelect<OrderByField>
            value={config.orderBy}
            options={ORDER_OPTIONS}
            labels={ORDER_BY_LABELS}
            onChange={(v) => onChange({ orderBy: v })}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-sm">Show empty groups</span>
          <Switch
            checked={config.showEmptyGroups}
            onCheckedChange={(v) => onChange({ showEmptyGroups: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Columns</span>
          <div className="inline-flex items-center gap-0.5 rounded-md border p-0.5">
            {([2, 3, 4] as const).map((n) => (
              <button
                key={n}
                onClick={() => onChange({ columns: n })}
                className={cn(
                  "inline-flex h-6 w-7 items-center justify-center rounded-sm text-xs font-medium transition-colors",
                  config.columns === n
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Card Fields</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Shown on each card</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {config.cardFields.map((f) => (
            <FieldChip key={f} label={BOARD_FIELD_LABELS[f]} onRemove={() => removeField(f)} />
          ))}
          <AddFieldButton available={available} onAdd={addField} />
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          onClick={onReset}
        >
          <RotateCcw className="size-3" />
          Reset
        </button>
        <button className="text-xs text-primary hover:underline">Set default for everyone</button>
      </div>
    </div>
  )
}

// ─── Panel: Grid view settings ────────────────────────────────────────────────

function GridSettings({ table }: { table: Table<Entity> }) {
  const columns = table.getAllColumns().filter((col) => col.getCanHide())
  const sortableColumns = table.getAllColumns().filter((col) => col.getCanSort())
  const currentSort = table.getState().sorting[0]
  const sortColId = currentSort?.id ?? ""
  const sortDesc = currentSort?.desc ?? false

  return (
    <div className="space-y-5 px-4 py-4">
      <div className="space-y-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Sorting</p>
        <div className="flex items-center justify-between">
          <span className="text-sm">Sort by</span>
          <div className="flex items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex h-7 items-center gap-1 rounded-md border bg-background px-2.5 text-xs font-medium transition-colors hover:bg-muted/50">
                  {sortColId ? sortColId.charAt(0).toUpperCase() + sortColId.slice(1) : "None"}
                  <ChevronDown className="size-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-[240px] w-44 overflow-y-auto">
                {sortableColumns.map((col) => (
                  <DropdownMenuItem
                    key={col.id}
                    className={col.id === sortColId ? "bg-muted/60" : ""}
                    onClick={() => table.setSorting([{ id: col.id, desc: sortDesc }])}
                  >
                    {col.id.charAt(0).toUpperCase() + col.id.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              className="inline-flex h-7 items-center gap-1 rounded-md border bg-background px-2 text-xs font-medium transition-colors hover:bg-muted/50 disabled:opacity-40"
              disabled={!sortColId}
              onClick={() => { if (sortColId) table.setSorting([{ id: sortColId, desc: !sortDesc }]) }}
            >
              <ArrowDownUp className="size-3 text-muted-foreground" />
              {sortDesc ? "Desc" : "Asc"}
            </button>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Column Visibility</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Click to show or hide columns</p>
        <div className="flex flex-wrap gap-1.5">
          {columns.map((col) => {
            const visible = col.getIsVisible()
            return (
              <button
                key={col.id}
                onClick={() => col.toggleVisibility()}
                className={cn(
                  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
                  visible
                    ? "border-transparent bg-muted/60 text-foreground hover:bg-muted"
                    : "border-dashed text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                )}
              >
                {col.id.charAt(0).toUpperCase() + col.id.slice(1)}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

type Props = {
  currentView: ViewMode
  table: Table<Entity>
  listConfig: ListViewConfig
  onListConfigChange: (patch: Partial<ListViewConfig>) => void
  boardConfig: BoardViewConfig
  onBoardConfigChange: (patch: Partial<BoardViewConfig>) => void
}

export function EntitiesViewSettings({
  currentView,
  table,
  listConfig,
  onListConfigChange,
  boardConfig,
  onBoardConfigChange,
}: Props) {
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
          {currentView === "list" && (
            <ListSettings
              config={listConfig}
              onChange={onListConfigChange}
              onReset={() => onListConfigChange(DEFAULT_LIST_CONFIG)}
            />
          )}
          {currentView === "board" && (
            <BoardSettings
              config={boardConfig}
              onChange={onBoardConfigChange}
              onReset={() => onBoardConfigChange(DEFAULT_BOARD_CONFIG)}
            />
          )}
          {currentView === "grid" && <GridSettings table={table} />}
        </div>
      </PopoverContent>
    </Popover>
  )
}
