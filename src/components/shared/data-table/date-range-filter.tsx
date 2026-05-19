import { useState } from "react"
import { addDays, format, startOfDay, subDays } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type Preset = {
  label: string
  rangeFromToday: () => DateRange
}

const TODAY = () => startOfDay(new Date())

const PRESETS: Preset[] = [
  {
    label: "Today",
    rangeFromToday: () => ({ from: TODAY(), to: TODAY() }),
  },
  {
    label: "Yesterday",
    rangeFromToday: () => {
      const y = subDays(TODAY(), 1)
      return { from: y, to: y }
    },
  },
  {
    label: "Last 7 days",
    rangeFromToday: () => ({ from: subDays(TODAY(), 6), to: TODAY() }),
  },
  {
    label: "Last 30 days",
    rangeFromToday: () => ({ from: subDays(TODAY(), 29), to: TODAY() }),
  },
  {
    label: "Last 90 days",
    rangeFromToday: () => ({ from: subDays(TODAY(), 89), to: TODAY() }),
  },
]

type StoredRange = { from: string; to: string; label?: string }

type Props = {
  /** Current filter value (StoredRange | undefined). */
  value: unknown
  /** Called with a new StoredRange when the user commits a selection. */
  onChange: (v: StoredRange | undefined) => void
  /** Lower-case noun used in placeholders (e.g. "created date"). */
  placeholder?: string
}

/**
 * Date-range filter body for the More filters drawer.
 * Reads/writes via value/onChange (not directly from a table column) so
 * the drawer can hold deferred "draft" state and push to the table only
 * when the user clicks Apply.
 */
export function DateRangeFilter({ value, onChange, placeholder = "date" }: Props) {
  const stored = value as StoredRange | undefined
  const range: DateRange | undefined = stored
    ? { from: new Date(stored.from), to: new Date(stored.to) }
    : undefined

  const [open, setOpen] = useState(false)
  const [calDraft, setCalDraft] = useState<DateRange | undefined>(range)

  const apply = (r: DateRange | undefined, label?: string) => {
    if (!r?.from) {
      onChange(undefined)
    } else {
      onChange({
        from: r.from.toISOString(),
        to: (r.to ?? r.from).toISOString(),
        label,
      })
    }
  }

  const summary = stored
    ? stored.label ?? formatRange(stored.from, stored.to)
    : null

  const isPresetActive = (preset: Preset) => {
    if (!stored) return false
    if (stored.label === preset.label) return true
    const r = preset.rangeFromToday()
    return (
      r.from?.toISOString() === stored.from &&
      (r.to ?? r.from)?.toISOString() === stored.to
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((preset) => {
          const active = isPresetActive(preset)
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => apply(preset.rangeFromToday(), preset.label)}
              className={cn(
                "inline-flex items-center rounded-md border px-2.5 py-1 text-xs transition-colors",
                active
                  ? "border-primary/40 bg-primary/[0.08] text-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground"
              )}
            >
              {preset.label}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-1.5">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 flex-1 justify-start gap-2 px-2.5 text-xs font-normal",
                !summary && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="size-3.5" />
              {summary ?? `Pick ${placeholder} range…`}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start" sideOffset={6}>
            <Calendar
              mode="range"
              numberOfMonths={2}
              defaultMonth={range?.from ?? subDays(TODAY(), 30)}
              selected={calDraft ?? range}
              onSelect={(r) => setCalDraft(r)}
              autoFocus
            />
            <Separator />
            <div className="flex items-center justify-between gap-2 p-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCalDraft(undefined)
                  apply(undefined)
                  setOpen(false)
                }}
                disabled={!stored}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCalDraft(range)
                    setOpen(false)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!calDraft?.from}
                  onClick={() => {
                    apply(calDraft)
                    setOpen(false)
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        {summary && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={() => apply(undefined)}
            aria-label="Clear date range"
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}

function formatRange(fromIso: string, toIso: string) {
  const from = new Date(fromIso)
  const to = new Date(toIso)
  const sameDay = startOfDay(from).getTime() === startOfDay(to).getTime()
  if (sameDay) return format(from, "MMM d, yyyy")
  return `${format(from, "MMM d")} → ${format(to, "MMM d, yyyy")}`
}

/** Helper: read stored value as a human-readable string (used by applied-filters chip bar). */
export function summariseDateRange(value: unknown): string | null {
  if (!value || typeof value !== "object") return null
  const v = value as StoredRange
  if (!v.from || !v.to) return null
  if (v.label) return v.label
  return formatRange(v.from, v.to)
}

export type DateRangeFilterValue = StoredRange

void addDays // imported for date-fns convenience; tree-shaken if unused
