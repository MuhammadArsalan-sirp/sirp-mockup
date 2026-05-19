import { useCallback, useMemo, useState } from "react"
import {
  Check,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"
import type { Table } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { DateRangeFilter, summariseDateRange } from "./date-range-filter"
import type { FacetedOption } from "./faceted-filter"

const CHIP_THRESHOLD = 12

type FacetedSection = {
  kind?: "facet"
  columnId: string
  title: string
  options: readonly FacetedOption[]
  group?: string
  singleSelect?: boolean
}

type DateRangeSection = {
  kind: "date-range"
  columnId: string
  title: string
  group?: string
}

/**
 * A single filter section in the More filters drawer.
 * Two flavours:
 *   - facet (default) — multi-select chip flow or searchable checkbox list.
 *   - date-range      — preset chips + react-day-picker calendar popover.
 */
export type MoreFilterSection = FacetedSection | DateRangeSection

type Props<TData> = {
  table: Table<TData>
  sections: readonly MoreFilterSection[]
}

/**
 * Side-drawer "More filters" panel — deferred apply.
 *
 * Selections made inside the drawer are held in local "draft" state and
 * pushed to the TanStack table only when the user clicks "Apply". Closing
 * the drawer (X or backdrop) discards the draft so the table is unchanged.
 *
 * Trigger button always reflects TABLE state (what is actually applied).
 * Inside the drawer, the "Selected filters" summary bar reflects DRAFT
 * state (what the user has selected but not yet applied).
 */
export function MoreFilters<TData>({ table, sections }: Props<TData>) {
  const [sheetOpen, setSheetOpen] = useState(false)

  // ── Draft state ────────────────────────────────────────────────────────
  // draft mirrors the table's column filter values while the drawer is open.
  // On open it is seeded from the table; on Apply it is pushed back.
  const [draft, setDraft] = useState<Map<string, unknown>>(new Map())

  const seedDraftFromTable = useCallback(() => {
    const m = new Map<string, unknown>()
    sections.forEach((s) => {
      const v = table.getColumn(s.columnId)?.getFilterValue()
      if (v !== undefined) m.set(s.columnId, v)
    })
    setDraft(m)
  }, [sections, table])

  const handleSheetOpenChange = (open: boolean) => {
    if (open) seedDraftFromTable()
    setSheetOpen(open)
  }

  const getDraftValue = (columnId: string) => draft.get(columnId)

  const setDraftValue = useCallback((columnId: string, value: unknown) => {
    setDraft((prev) => {
      const next = new Map(prev)
      if (value === undefined || value === null) next.delete(columnId)
      else next.set(columnId, value)
      return next
    })
  }, [])

  // ── Draft counts (drive the per-section indicators) ───────────────────
  const draftCounts = useMemo(() => {
    const m = new Map<string, number>()
    sections.forEach((s) => {
      const v = draft.get(s.columnId)
      if (s.kind === "date-range") m.set(s.columnId, v ? 1 : 0)
      else m.set(s.columnId, Array.isArray(v) ? v.length : 0)
    })
    return m
  }, [sections, draft])

  const draftApplied = useMemo(
    () => sections.filter((s) => (draftCounts.get(s.columnId) ?? 0) > 0),
    [sections, draftCounts]
  )

  // ── Table-applied count (drives the trigger button badge) ─────────────
  // This reads directly from the table so the badge always reflects what is
  // truly active, not the draft.
  const tableAppliedCount = useMemo(
    () =>
      sections.filter((s) => {
        const v = table.getColumn(s.columnId)?.getFilterValue()
        if (s.kind === "date-range") return !!v
        return Array.isArray(v) && v.length > 0
      }).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sections, table, sheetOpen] // re-evaluate when sheet closes (after Apply)
  )

  // ── Apply / Reset ──────────────────────────────────────────────────────
  const applyDraft = () => {
    sections.forEach((s) => {
      table.getColumn(s.columnId)?.setFilterValue(draft.get(s.columnId))
    })
    setSheetOpen(false)
  }

  const resetDraft = () => setDraft(new Map())

  // ── Expand / collapse state ────────────────────────────────────────────
  const grouped = useMemo(() => {
    const map = new Map<string, MoreFilterSection[]>()
    sections.forEach((s) => {
      const key = s.group ?? "Other"
      map.set(key, [...(map.get(key) ?? []), s])
    })
    return Array.from(map.entries())
  }, [sections])

  const initialOpen = useMemo(
    () =>
      new Set(
        sections
          .filter((s) => (draftCounts.get(s.columnId) ?? 0) > 0)
          .map((s) => s.columnId)
      ),
    // seed once — don't re-derive on every draft change or sections will keep
    // collapsing while the user is interacting
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  const [openSections, setOpenSections] = useState<Set<string>>(initialOpen)

  const allOpen = openSections.size === sections.length
  const toggleAll = () =>
    allOpen
      ? setOpenSections(new Set())
      : setOpenSections(new Set(sections.map((s) => s.columnId)))

  const toggleSection = (id: string, open: boolean) =>
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (open) next.add(id)
      else next.delete(id)
      return next
    })

  return (
    <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
      {/* ── Trigger ────────────────────────────────────────────────────── */}
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 border-dashed">
          <SlidersHorizontal className="size-3.5" />
          More filters
          {tableAppliedCount > 0 && (
            <>
              <Separator orientation="vertical" className="mx-0.5 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1.5 font-semibold tabular-nums"
              >
                {tableAppliedCount}
              </Badge>
            </>
          )}
        </Button>
      </SheetTrigger>

      {/* ── Sheet ──────────────────────────────────────────────────────── */}
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-[480px]"
      >
        {/* Row 1 — title + description (pr-10 reserves space for close X) */}
        <SheetHeader className="space-y-1 border-b px-5 py-4 pr-10">
          <SheetTitle className="text-base font-semibold">
            More filters
          </SheetTitle>
          <SheetDescription className="text-xs">
            Select filters below and click Apply to update the table.
          </SheetDescription>
        </SheetHeader>

        {/* Row 2 — meta toolbar */}
        <div className="flex items-center justify-between gap-2 border-b bg-muted/30 px-5 py-2">
          <span className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            {draftApplied.length > 0
              ? `${draftApplied.length} ${draftApplied.length === 1 ? "filter" : "filters"} selected`
              : "No filters selected"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAll}
            className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {allOpen ? (
              <>
                <ChevronsDownUp className="size-3.5" />
                Collapse all
              </>
            ) : (
              <>
                <ChevronsUpDown className="size-3.5" />
                Expand all
              </>
            )}
          </Button>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────
            min-h-0 lets flex-1 actually constrain ScrollArea height inside
            the flex-col SheetContent so the footer stays on screen. */}
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-5 px-5 py-4">
            {/* Applied filters summary — reads from DRAFT */}
            {draftApplied.length > 0 && (
              <DraftFiltersBar
                sections={draftApplied}
                draft={draft}
                onClear={(id) => setDraftValue(id, undefined)}
                onClearAll={resetDraft}
              />
            )}

            {grouped.map(([groupName, groupSections]) => (
              <FilterGroup
                key={groupName}
                title={groupName}
                showHeading={grouped.length > 1}
              >
                {groupSections.map((section) => (
                  <CollapsibleSection
                    key={section.columnId}
                    table={table}
                    section={section}
                    count={draftCounts.get(section.columnId) ?? 0}
                    filterValue={getDraftValue(section.columnId)}
                    setFilterValue={(v) => setDraftValue(section.columnId, v)}
                    isOpen={openSections.has(section.columnId)}
                    onOpenChange={(o) => toggleSection(section.columnId, o)}
                  />
                ))}
              </FilterGroup>
            ))}
          </div>
        </ScrollArea>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-2 border-t bg-background/50 px-5 py-3 backdrop-blur">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetDraft}
            disabled={draftApplied.length === 0}
            className="text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            Reset all
          </Button>
          <div className="flex items-center gap-2">
            <SheetClose asChild>
              <Button variant="outline" size="sm">
                Cancel
              </Button>
            </SheetClose>
            <Button size="sm" onClick={applyDraft}>
              Apply
              {draftApplied.length > 0 && (
                <span className="ml-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary-foreground/20 px-1 font-mono text-[10px] tabular-nums">
                  {draftApplied.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

/* ─── Draft filters summary bar ─────────────────────────────────────────── */
function DraftFiltersBar({
  sections,
  draft,
  onClear,
  onClearAll,
}: {
  sections: MoreFilterSection[]
  draft: Map<string, unknown>
  onClear: (columnId: string) => void
  onClearAll: () => void
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Selected filters
        </div>
        <button
          type="button"
          onClick={onClearAll}
          className="text-[11px] text-muted-foreground hover:text-foreground"
        >
          Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {sections.map((section) => {
          const value = draft.get(section.columnId)
          let summary: string
          if (section.kind === "date-range") {
            summary = summariseDateRange(value) ?? "—"
          } else {
            const values = (value as string[]) ?? []
            const labelById = new Map(
              section.options.map((o) => [o.value, o.label])
            )
            summary =
              values.length === 1
                ? (labelById.get(values[0]) ?? values[0])
                : `${values.length} values`
          }
          return (
            <span
              key={section.columnId}
              className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs"
            >
              <span className="text-muted-foreground">{section.title}:</span>
              <span className="font-medium">{summary}</span>
              <button
                type="button"
                onClick={() => onClear(section.columnId)}
                aria-label={`Remove ${section.title} filter`}
                className="ml-0.5 grid size-4 place-items-center rounded text-muted-foreground hover:bg-muted-foreground/15 hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </span>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Group heading ──────────────────────────────────────────────────────── */
function FilterGroup({
  title,
  showHeading,
  children,
}: {
  title: string
  showHeading: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      {showHeading && (
        <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {title}
        </div>
      )}
      <div className="space-y-2">{children}</div>
    </div>
  )
}

/* ─── Collapsible filter section ─────────────────────────────────────────── */
function CollapsibleSection<TData>({
  table,
  section,
  count,
  filterValue,
  setFilterValue,
  isOpen,
  onOpenChange,
}: {
  table: Table<TData>
  section: MoreFilterSection
  count: number
  filterValue: unknown
  setFilterValue: (v: unknown) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const isActive = count > 0

  // Brief summary shown in the trigger row when collapsed, hidden when open.
  let appliedSummary: string | null = null
  if (isActive) {
    if (section.kind === "date-range") {
      appliedSummary = summariseDateRange(filterValue) ?? null
    } else {
      const values = (filterValue as string[]) ?? []
      if (values.length === 1) {
        const opt = section.options.find((o) => o.value === values[0])
        appliedSummary = opt?.label ?? values[0]
      } else if (values.length > 1) {
        appliedSummary = `${values.length} selected`
      }
    }
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={onOpenChange}
      className={cn(
        "rounded-md border transition-colors",
        isActive
          ? "border-primary/30 bg-primary/[0.04] data-[state=open]:bg-primary/[0.06]"
          : "bg-card/30 data-[state=open]:bg-card/60"
      )}
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={cn(
            "group flex w-full items-center justify-between gap-2 rounded-md px-3 py-2.5 text-left transition-colors",
            isActive
              ? "hover:bg-primary/[0.06] data-[state=open]:bg-primary/[0.04]"
              : "hover:bg-accent/40 data-[state=open]:bg-accent/30"
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className={cn("shrink-0 text-sm font-medium", isActive && "text-foreground")}>
              {section.title}
            </span>
            {isActive && (
              <span
                aria-label={`${count} selected`}
                className="inline-flex h-[18px] min-w-[20px] shrink-0 items-center justify-center rounded-full bg-primary px-1.5 font-mono text-[10px] font-semibold tabular-nums text-primary-foreground shadow-sm"
              >
                {count}
              </span>
            )}
            {appliedSummary && (
              <span className="min-w-0 truncate text-xs text-muted-foreground group-data-[state=open]:hidden">
                · {appliedSummary}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {isActive && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  setFilterValue(undefined)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    e.stopPropagation()
                    setFilterValue(undefined)
                  }
                }}
                className="text-[11px] text-muted-foreground hover:text-foreground"
              >
                Clear
              </span>
            )}
            <ChevronDown
              className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
              aria-hidden
            />
          </div>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="border-t px-3 py-3">
          {section.kind === "date-range" ? (
            <DateRangeFilter
              value={filterValue}
              onChange={setFilterValue}
              placeholder={section.title.toLowerCase()}
            />
          ) : (
            <FacetSectionBody
              table={table}
              section={section}
              filterValue={filterValue}
              setFilterValue={setFilterValue}
            />
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

/* ─── Facet body — chip flow ≤ 12, else searchable list ─────────────────── */
function FacetSectionBody<TData>({
  table,
  section,
  filterValue,
  setFilterValue,
}: {
  table: Table<TData>
  section: FacetedSection
  filterValue: unknown
  setFilterValue: (v: unknown) => void
}) {
  const column = table.getColumn(section.columnId)
  const selectedValues = new Set((filterValue as string[] | undefined) ?? [])
  const facets = column?.getFacetedUniqueValues()
  const [search, setSearch] = useState("")

  const useChipFlow = section.options.length <= CHIP_THRESHOLD

  const toggle = (value: string) => {
    if (section.singleSelect) {
      setFilterValue(selectedValues.has(value) ? undefined : [value])
      return
    }
    const next = new Set(selectedValues)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    setFilterValue(next.size ? Array.from(next) : undefined)
  }

  const visibleOptions = useMemo(() => {
    if (useChipFlow || !search.trim()) return section.options
    const q = search.toLowerCase()
    return section.options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q)
    )
  }, [section.options, search, useChipFlow])

  if (useChipFlow) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {section.options.map((opt) => {
          const isSelected = selectedValues.has(opt.value)
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors",
                isSelected
                  ? "border-primary/40 bg-primary/[0.08] text-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground"
              )}
            >
              {opt.swatch && (
                <span
                  className="size-1.5 rounded-full"
                  style={{ background: opt.swatch }}
                />
              )}
              {opt.icon && (
                <opt.icon className="size-3 text-muted-foreground" />
              )}
              <span>{opt.label}</span>
              {isSelected && <Check className="size-3 text-primary" />}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={`Search ${section.title.toLowerCase()}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 pl-8 text-sm"
        />
      </div>
      <div className="max-h-[220px] space-y-0.5 overflow-y-auto">
        {visibleOptions.length === 0 ? (
          <div className="px-2 py-3 text-center text-xs text-muted-foreground">
            No matches.
          </div>
        ) : (
          visibleOptions.map((option) => {
            const isSelected = selectedValues.has(option.value)
            const facetCount = facets?.get(option.value)
            return (
              <button
                key={option.value}
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                onClick={() => toggle(option.value)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                  "hover:bg-accent/60",
                  isSelected && "bg-accent/40"
                )}
              >
                <span
                  className={cn(
                    "grid size-4 shrink-0 place-items-center rounded-[3px] border transition-colors",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/60"
                  )}
                >
                  {isSelected && <Check className="size-3" />}
                </span>
                {option.swatch && (
                  <span
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ background: option.swatch }}
                  />
                )}
                {option.icon && (
                  <option.icon className="size-3.5 shrink-0 text-muted-foreground" />
                )}
                <span className="flex-1 truncate">{option.label}</span>
                {facetCount !== undefined && (
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                    {facetCount}
                  </span>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
