import { useRef, useState } from "react"
import {
  AlertTriangle,
  Building2,
  ChevronRight,
  Circle,
  Filter,
  Hash,
  Layers,
  Tag,
  User,
  X,
} from "lucide-react"
import type { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  criticalityOptions,
  departmentOptions,
  ownerOptions,
  statusOptions,
  tagsOptions,
  typeOptions,
} from "./entities-filters"
import type { FacetedOption } from "@/components/shared/data-table"
import type { Entity } from "@/data/entities"

// ─── Category definitions ─────────────────────────────────────────────────────

type FilterCategory = {
  id: string
  label: string
  Icon: React.ElementType
  options: readonly FacetedOption[]
}

const FILTER_GROUPS: FilterCategory[][] = [
  [
    { id: "type", label: "Type", Icon: Layers, options: typeOptions },
    { id: "criticality", label: "Criticality", Icon: AlertTriangle, options: criticalityOptions },
    { id: "status", label: "Status", Icon: Circle, options: statusOptions },
  ],
  [
    { id: "owner", label: "Owner", Icon: User, options: ownerOptions },
    { id: "department", label: "Department", Icon: Building2, options: departmentOptions },
  ],
  [
    { id: "tags", label: "Tags", Icon: Hash, options: tagsOptions },
  ],
]

// ─── Sub-panel ────────────────────────────────────────────────────────────────

function FilterSubPanel({
  category,
  table,
}: {
  category: FilterCategory
  table: Table<Entity>
}) {
  const [search, setSearch] = useState("")
  const column = table.getColumn(category.id)
  const current = (column?.getFilterValue() as string[] | undefined) ?? []

  const options = category.options.filter(
    (o) => !search || o.label.toLowerCase().includes(search.toLowerCase()),
  )

  const toggle = (value: string) => {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    column?.setFilterValue(next.length ? next : undefined)
  }

  return (
    <div>
      {category.options.length > 6 && (
        <div className="border-b px-3 py-2">
          <Input
            placeholder={`Search ${category.label.toLowerCase()}…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 border-0 bg-transparent p-0 text-xs shadow-none focus-visible:ring-0 placeholder:text-muted-foreground"
          />
        </div>
      )}
      <div className="max-h-[320px] overflow-y-auto py-1.5">
        {options.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">No options</div>
        ) : (
          options.map((opt) => (
            <div
              key={opt.value}
              className="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm transition-colors hover:bg-muted/50"
              onClick={() => toggle(opt.value)}
            >
              <Checkbox
                checked={current.includes(opt.value)}
                onCheckedChange={() => toggle(opt.value)}
                className="size-3.5"
                onClick={(e) => e.stopPropagation()}
              />
              {opt.swatch && (
                <span className="size-2 shrink-0 rounded-full" style={{ background: opt.swatch }} />
              )}
              <span className="flex-1 text-sm">{opt.label}</span>
              {current.includes(opt.value) && (
                <span className="font-mono text-[10px] text-muted-foreground">✓</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

type Props = { table: Table<Entity> }

export function EntitiesFilterPopover({ table }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [hovered, setHovered] = useState<FilterCategory | null>(null)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeCount = table.getState().columnFilters.length

  const allCategories = FILTER_GROUPS.flat()

  const visibleGroups = search
    ? [allCategories.filter((c) => c.label.toLowerCase().includes(search.toLowerCase()))]
    : FILTER_GROUPS

  const onCategoryEnter = (cat: FilterCategory) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
    if (cat.options.length > 0) setHovered(cat)
  }

  const onAreaLeave = () => {
    leaveTimer.current = setTimeout(() => setHovered(null), 180)
  }

  const onAreaEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) { setSearch(""); setHovered(null) }
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2 relative" aria-label="Open filters">
          <Filter className="size-3.5" />
          Filters
          {activeCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto p-0"
        align="end"
        sideOffset={6}
        onMouseLeave={onAreaLeave}
        onMouseEnter={onAreaEnter}
      >
        <div className="flex">
          {/* Sub-panel */}
          {hovered && (
            <div className="w-[210px] border-r">
              <div className="border-b px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {hovered.label}
              </div>
              <FilterSubPanel category={hovered} table={table} />
              {(() => {
                const current =
                  (table.getColumn(hovered.id)?.getFilterValue() as string[] | undefined) ?? []
                return current.length > 0 ? (
                  <div className="border-t px-3 py-1.5">
                    <button
                      className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => table.getColumn(hovered.id)?.setFilterValue(undefined)}
                    >
                      <X className="size-3" />
                      Clear {hovered.label.toLowerCase()}
                    </button>
                  </div>
                ) : null
              })()}
            </div>
          )}

          {/* Main panel */}
          <div className="w-[220px]">
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <Input
                placeholder="Add Filter…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-7 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground"
              />
              <span className="shrink-0 rounded border bg-muted px-1 font-mono text-[10px] text-muted-foreground">
                F
              </span>
            </div>

            <div className="max-h-[380px] overflow-y-auto py-1">
              {visibleGroups.map((group, gi) => (
                <div key={gi}>
                  {gi > 0 && !search && <Separator className="my-1" />}
                  {group.map((cat) => {
                    const count =
                      ((table.getColumn(cat.id)?.getFilterValue() as string[] | undefined) ?? []).length
                    return (
                      <div
                        key={cat.id}
                        className={`flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm transition-colors ${
                          hovered?.id === cat.id ? "bg-muted/60" : "hover:bg-muted/40"
                        }`}
                        onMouseEnter={() => onCategoryEnter(cat)}
                      >
                        <cat.Icon className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="flex-1">{cat.label}</span>
                        {count > 0 && (
                          <span className="rounded-full bg-primary/15 px-1.5 font-mono text-[10px] text-primary">
                            {count}
                          </span>
                        )}
                        {cat.options.length > 0 && (
                          <ChevronRight className="size-3 shrink-0 text-muted-foreground/50" />
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {activeCount > 0 && (
              <>
                <Separator />
                <div className="px-3 py-2">
                  <button
                    className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => { table.resetColumnFilters(); setOpen(false) }}
                  >
                    <X className="size-3" />
                    Reset all filters
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
