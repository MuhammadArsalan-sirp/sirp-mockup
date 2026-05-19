import { useRef, useState } from "react"
import {
  AlertTriangle,
  BarChart2,
  Briefcase,
  Building2,
  ChevronRight,
  Circle,
  Filter,
  FolderOpen,
  Hash,
  Layers,
  MapPin,
  Plug,
  Tag,
  Target,
  ThumbsUp,
  User,
  X,
  Zap,
} from "lucide-react"
import type { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  assigneeOptions,
  categoryOptions,
  customerOptions,
  dispositionOptions,
  locationOptions,
  mitreOptions,
  priorityOptions,
  severityOptions,
  sourceOptions,
  stateOptions,
  statusOptions,
  tagsOptions,
  typeOptions,
} from "./threat-intel-filters"
import type { FacetedOption } from "@/components/shared/data-table"
import type { ThreatIntel } from "@/data/threat-intel"

// ─── Category definitions ─────────────────────────────────────────────────────

type FilterCategory = {
  id: string
  label: string
  Icon: React.ElementType
  options: FacetedOption[]
}

const FILTER_GROUPS: FilterCategory[][] = [
  // State
  [
    { id: "state", label: "State", Icon: Layers, options: stateOptions },
  ],
  // Triage
  [
    { id: "severity", label: "Severity", Icon: AlertTriangle, options: severityOptions },
    { id: "priority", label: "Priority", Icon: BarChart2, options: priorityOptions },
    { id: "status", label: "Status", Icon: Circle, options: statusOptions },
  ],
  // Assignment
  [
    { id: "assignee", label: "Assignee", Icon: User, options: assigneeOptions },
    { id: "source", label: "Source", Icon: Plug, options: sourceOptions },
  ],
  // Classification
  [
    { id: "category", label: "Category", Icon: FolderOpen, options: categoryOptions },
    { id: "type", label: "Type", Icon: Zap, options: typeOptions },
    { id: "disposition", label: "Disposition", Icon: ThumbsUp, options: dispositionOptions },
  ],
  // Tracking
  [
    { id: "tags", label: "Tags", Icon: Hash, options: tagsOptions },
    { id: "mitre", label: "MITRE", Icon: Target, options: mitreOptions },
  ],
  // Context
  [
    { id: "tenant", label: "Tenant", Icon: Tag, options: [] },
    { id: "customer", label: "Customer", Icon: Briefcase, options: customerOptions },
    { id: "location", label: "Location", Icon: MapPin, options: locationOptions },
  ],
]

// ─── Active filter count ──────────────────────────────────────────────────────

function useActiveFilterCount(table: Table<ThreatIntel>): number {
  return table.getState().columnFilters.length
}

// ─── Sub-panel ────────────────────────────────────────────────────────────────

function FilterSubPanel({
  category,
  table,
  search,
}: {
  category: FilterCategory
  table: Table<ThreatIntel>
  search: string
}) {
  const column = table.getColumn(category.id)
  const current = (column?.getFilterValue() as string[] | undefined) ?? []

  const options = category.options.filter(
    (o) => !search || o.label.toLowerCase().includes(search.toLowerCase())
  )

  const toggle = (value: string) => {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    column?.setFilterValue(next.length ? next : undefined)
  }

  if (options.length === 0)
    return (
      <div className="px-3 py-6 text-center text-xs text-muted-foreground">
        No options
      </div>
    )

  return (
    <div className="py-1.5">
      {options.map((opt) => (
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
          {opt.icon && <opt.icon className="size-3.5 text-muted-foreground" />}
          <span className="flex-1 text-sm">{opt.label}</span>
          {current.includes(opt.value) && (
            <span className="font-mono text-[10px] text-muted-foreground">
              ✓
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

type Props = { table: Table<ThreatIntel> }

export function ThreatIntelFilterPopover({ table }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [hovered, setHovered] = useState<FilterCategory | null>(null)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeCount = useActiveFilterCount(table)

  const allCategories = FILTER_GROUPS.flat()
  const hoveredCategory = hovered ?? null

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
        if (!v) {
          setSearch("")
          setHovered(null)
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 relative"
          aria-label="Open filters"
        >
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
          {hoveredCategory && (
            <div className="w-[210px] border-r">
              <div className="border-b px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {hoveredCategory.label}
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                <FilterSubPanel
                  category={hoveredCategory}
                  table={table}
                  search=""
                />
              </div>
              {(() => {
                const current =
                  (table
                    .getColumn(hoveredCategory.id)
                    ?.getFilterValue() as string[] | undefined) ?? []
                return current.length > 0 ? (
                  <div className="border-t px-3 py-1.5">
                    <button
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() =>
                        table
                          .getColumn(hoveredCategory.id)
                          ?.setFilterValue(undefined)
                      }
                    >
                      <X className="size-3" />
                      Clear {hoveredCategory.label.toLowerCase()}
                    </button>
                  </div>
                ) : null
              })()}
            </div>
          )}

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
                    const activeCount =
                      (
                        (table
                          .getColumn(cat.id)
                          ?.getFilterValue() as string[] | undefined) ?? []
                      ).length
                    return (
                      <div
                        key={cat.id}
                        className={`flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm transition-colors ${
                          hovered?.id === cat.id
                            ? "bg-muted/60"
                            : "hover:bg-muted/40"
                        }`}
                        onMouseEnter={() => onCategoryEnter(cat)}
                      >
                        <cat.Icon className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="flex-1">{cat.label}</span>
                        {activeCount > 0 && (
                          <span className="rounded-full bg-primary/15 px-1.5 font-mono text-[10px] text-primary">
                            {activeCount}
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
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => {
                      table.resetColumnFilters()
                      setOpen(false)
                    }}
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
