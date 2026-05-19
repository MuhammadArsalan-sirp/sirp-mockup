import { useRef, useState } from "react"
import { ChevronRight, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import type { FacetedOption } from "@/components/shared/data-table"

export type FilterGroup = {
  id: string
  label: string
  icon: React.ElementType
  options: readonly FacetedOption[]
  /** Single-select: at most one option per group (radio-style in the panel). */
  mode?: "multi" | "single"
}

type FiltersState = Record<string, string[]>

type Props = {
  groups: FilterGroup[]
  value: FiltersState
  onChange: (next: FiltersState) => void
}

/**
 * Two-panel filter popover — matches the incidents filter UX exactly.
 * Left panel: searchable category list.
 * Right panel: checkbox options for the hovered category, flies out to the left.
 *
 * State-driven — no TanStack Table dependency.
 */
export function AutonomyFilterPopover({ groups, value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [hovered, setHovered] = useState<FilterGroup | null>(null)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeCount = Object.values(value).filter((v) => v.length > 0).length

  const visible = search
    ? [groups.filter((g) => g.label.toLowerCase().includes(search.toLowerCase()))]
    : [groups]

  const onEnter = (g: FilterGroup) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
    if (g.options.length > 0) setHovered(g)
  }

  const onLeave = () => {
    leaveTimer.current = setTimeout(() => setHovered(null), 180)
  }

  const onStay = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
  }

  const toggle = (groupId: string, optValue: string, mode: "multi" | "single") => {
    const cur = value[groupId] ?? []
    if (mode === "single") {
      const next = cur.includes(optValue) ? [] : [optValue]
      onChange({ ...value, [groupId]: next })
      return
    }
    const next = cur.includes(optValue)
      ? cur.filter((v) => v !== optValue)
      : [...cur, optValue]
    onChange({ ...value, [groupId]: next })
  }

  const clearGroup = (groupId: string) => {
    onChange({ ...value, [groupId]: [] })
  }

  const resetAll = () => {
    const cleared: FiltersState = {}
    groups.forEach((g) => (cleared[g.id] = []))
    onChange(cleared)
    setOpen(false)
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
        <Button variant="outline" size="sm" className="relative h-9 gap-2" aria-label="Filters">
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
        onMouseLeave={onLeave}
        onMouseEnter={onStay}
      >
        <div className="flex">
          {/* Sub-panel — options for hovered group */}
          {hovered && (
            <div className="w-[200px] border-r">
              <div className="border-b px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {hovered.label}
              </div>
              <div className="max-h-[300px] overflow-y-auto py-1.5">
                {hovered.options
                  .filter((o) => !search || o.label.toLowerCase().includes(search.toLowerCase()))
                  .map((opt) => {
                    const cur = value[hovered.id] ?? []
                    const checked = cur.includes(opt.value)
                    return (
                      <div
                        key={opt.value}
                        className="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 transition-colors hover:bg-muted/50"
                        onClick={() =>
                          toggle(hovered.id, opt.value, hovered.mode ?? "multi")
                        }
                      >
                        <Checkbox
                          checked={checked}
                          className="size-3.5"
                          onClick={(e) => e.stopPropagation()}
                          onCheckedChange={() =>
                            toggle(hovered.id, opt.value, hovered.mode ?? "multi")
                          }
                        />
                        {opt.swatch && (
                          <span className="size-2 shrink-0 rounded-full" style={{ background: opt.swatch }} />
                        )}
                        <span className="flex-1 text-sm">{opt.label}</span>
                      </div>
                    )
                  })}
              </div>
              {(value[hovered.id]?.length ?? 0) > 0 && (
                <div className="border-t px-3 py-1.5">
                  <button
                    className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => clearGroup(hovered.id)}
                  >
                    <X className="size-3" />
                    Clear {hovered.label.toLowerCase()}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Main category panel */}
          <div className="w-[210px]">
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <Input
                placeholder="Add filter…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-7 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground"
              />
              <span className="shrink-0 rounded border bg-muted px-1 font-mono text-[10px] text-muted-foreground">F</span>
            </div>

            <div className="max-h-[360px] overflow-y-auto py-1">
              {visible.map((grp, gi) => (
                <div key={gi}>
                  {gi > 0 && !search && <Separator className="my-1" />}
                  {grp.map((g) => {
                    const cnt = (value[g.id] ?? []).length
                    return (
                      <div
                        key={g.id}
                        className={`flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm transition-colors ${
                          hovered?.id === g.id ? "bg-muted/60" : "hover:bg-muted/40"
                        }`}
                        onMouseEnter={() => onEnter(g)}
                      >
                        <g.icon className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="flex-1">{g.label}</span>
                        {cnt > 0 && (
                          <span className="rounded-full bg-primary/15 px-1.5 font-mono text-[10px] text-primary">
                            {cnt}
                          </span>
                        )}
                        {g.options.length > 0 && (
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
                    onClick={resetAll}
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

/** Returns true when any filter group has an active value. */
export function hasActiveFilters(value: FiltersState): boolean {
  return Object.values(value).some((v) => v.length > 0)
}

/** Merges an incoming filter into current state. */
export function useFilters(initial: FiltersState) {
  const [filters, setFilters] = useState<FiltersState>(initial)
  const reset = () => setFilters(Object.fromEntries(Object.keys(initial).map((k) => [k, []])))
  return { filters, setFilters, reset, active: hasActiveFilters(filters) }
}
