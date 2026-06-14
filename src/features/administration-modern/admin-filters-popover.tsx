import { useMemo, useRef, useState } from "react"
import { ChevronRight, Filter, X, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

/**
 * Generic, self-contained filter popover for admin list pages.
 *
 * Mirrors the chemistry of {incidents,threat-intel}-filter-popover:
 *   - single "Filters" trigger button (h-9, active-count dot)
 *   - popover with categorised list of filter categories
 *   - hovered category opens a side flyout with checkbox options
 *
 * Admin pages don't use TanStack Table, so this component holds its own
 * selection state via useState. Visual-only — selecting a value just
 * updates the count chip and the trigger badge.
 */

export type AdminFilterOption = {
  value: string
  label: string
  icon?: LucideIcon
}

export type AdminFilterCategory = {
  id: string
  label: string
  icon: LucideIcon
  /** Empty options array renders a "No options yet" sub-panel — useful for
   *  mockup categories where the user can still see the structure. */
  options: AdminFilterOption[]
}

/** A 2-D array: top level = visual groups (separated by a rule), each inner
 *  array = categories shown together without a separator. */
export type AdminFilterGroups = AdminFilterCategory[][]

type Selections = Record<string, string[]>

export function AdminFiltersPopover({
  groups,
  initialSelections,
  align = "end",
}: {
  groups: AdminFilterGroups
  initialSelections?: Selections
  align?: "start" | "center" | "end"
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [hovered, setHovered] = useState<AdminFilterCategory | null>(null)
  const [selections, setSelections] = useState<Selections>(initialSelections ?? {})
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const allCategories = useMemo(() => groups.flat(), [groups])

  const activeCount = useMemo(
    () => Object.values(selections).filter((v) => v.length > 0).length,
    [selections]
  )

  const visibleGroups: AdminFilterGroups = search
    ? [allCategories.filter((c) =>
        c.label.toLowerCase().includes(search.toLowerCase())
      )]
    : groups

  const onCategoryEnter = (cat: AdminFilterCategory) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
    setHovered(cat)
  }

  const onAreaLeave = () => {
    leaveTimer.current = setTimeout(() => setHovered(null), 180)
  }

  const onAreaEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
  }

  const toggle = (catId: string, value: string) => {
    setSelections((prev) => {
      const current = prev[catId] ?? []
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      return { ...prev, [catId]: next }
    })
  }

  const clearCategory = (catId: string) => {
    setSelections((prev) => ({ ...prev, [catId]: [] }))
  }

  const resetAll = () => {
    setSelections({})
    setOpen(false)
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
          className="relative h-9 gap-2"
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
        align={align}
        sideOffset={6}
        onMouseLeave={onAreaLeave}
        onMouseEnter={onAreaEnter}
      >
        <div className="flex">
          {/* Side flyout — appears to the left when a category is hovered */}
          {hovered && (
            <div className="w-52 border-r">
              <div className="border-b px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {hovered.label}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {hovered.options.length === 0 ? (
                  <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                    No options
                  </div>
                ) : (
                  <div className="py-1.5">
                    {hovered.options.map((opt) => {
                      const checked =
                        (selections[hovered.id] ?? []).includes(opt.value)
                      return (
                        <div
                          key={opt.value}
                          className="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm transition-colors hover:bg-muted/50"
                          onClick={() => toggle(hovered.id, opt.value)}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggle(hovered.id, opt.value)}
                            className="size-3.5"
                            onClick={(e) => e.stopPropagation()}
                          />
                          {opt.icon && <opt.icon className="size-3.5 text-muted-foreground" />}
                          <span className="flex-1 text-sm">{opt.label}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              {(selections[hovered.id]?.length ?? 0) > 0 && (
                <div className="border-t px-3 py-1.5">
                  <button
                    type="button"
                    onClick={() => clearCategory(hovered.id)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="size-3" />
                    Clear {hovered.label.toLowerCase()}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Main panel */}
          <div className="w-56">
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <Input
                placeholder="Add filter…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-7 border-0 bg-transparent p-0 text-sm shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
              />
              <span className="shrink-0 rounded border bg-muted px-1 font-mono text-[10px] text-muted-foreground">
                F
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto py-1">
              {visibleGroups.map((group, gi) => (
                <div key={gi}>
                  {gi > 0 && !search && <Separator className="my-1" />}
                  {group.map((cat) => {
                    const catActive = (selections[cat.id] ?? []).length
                    return (
                      <div
                        key={cat.id}
                        className={
                          "flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm transition-colors " +
                          (hovered?.id === cat.id
                            ? "bg-muted/60"
                            : "hover:bg-muted/40")
                        }
                        onMouseEnter={() => onCategoryEnter(cat)}
                      >
                        <cat.icon className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="flex-1">{cat.label}</span>
                        {catActive > 0 && (
                          <span className="rounded-full bg-primary/15 px-1.5 font-mono text-[10px] text-primary">
                            {catActive}
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
                    type="button"
                    onClick={resetAll}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
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
