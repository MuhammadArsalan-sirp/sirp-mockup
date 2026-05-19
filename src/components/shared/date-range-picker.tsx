import { useState } from "react"
import {
  endOfDay,
  format,
  startOfDay,
  subDays,
  subYears,
} from "date-fns"
import { CalendarDays, ChevronDown } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// ── Types ─────────────────────────────────────────────────────────────────────

export type DateRangePreset =
  | "today"
  | "last-7"
  | "last-30"
  | "last-60"
  | "last-90"
  | "last-year"
  | "all-time"
  | "custom"

export type DateRangeValue = {
  preset: DateRangePreset
  from?: Date
  to?: Date
}

// ── Preset metadata ────────────────────────────────────────────────────────────

type PresetItem = {
  key: Exclude<DateRangePreset, "custom">
  label: string
}

const PRESETS: PresetItem[] = [
  { key: "today", label: "Today" },
  { key: "last-7", label: "Last 7 days" },
  { key: "last-30", label: "Last 30 days" },
  { key: "last-60", label: "Last 60 days" },
  { key: "last-90", label: "Last 90 days" },
  { key: "last-year", label: "Last year" },
  { key: "all-time", label: "All time" },
]

function computePreset(
  key: Exclude<DateRangePreset, "custom">
): { from: Date; to: Date } {
  const now = new Date()
  const to = endOfDay(now)
  switch (key) {
    case "today":
      return { from: startOfDay(now), to }
    case "last-7":
      return { from: startOfDay(subDays(now, 6)), to }
    case "last-30":
      return { from: startOfDay(subDays(now, 29)), to }
    case "last-60":
      return { from: startOfDay(subDays(now, 59)), to }
    case "last-90":
      return { from: startOfDay(subDays(now, 89)), to }
    case "last-year":
      return { from: startOfDay(subYears(now, 1)), to }
    case "all-time":
      return { from: new Date(2000, 0, 1), to }
  }
}

// ── Trigger label ──────────────────────────────────────────────────────────────

function triggerLabel(value: DateRangeValue): string {
  if (value.preset !== "custom") {
    return PRESETS.find((p) => p.key === value.preset)?.label ?? "Select range"
  }
  if (value.from && value.to) {
    // Same year: "Apr 1 – Apr 30, 2026"
    // Cross-year: "Dec 1, 2025 – Jan 15, 2026"
    const sameYear = value.from.getFullYear() === value.to.getFullYear()
    return sameYear
      ? `${format(value.from, "MMM d")} – ${format(value.to, "MMM d, yyyy")}`
      : `${format(value.from, "MMM d, yyyy")} – ${format(value.to, "MMM d, yyyy")}`
  }
  if (value.from) return `From ${format(value.from, "MMM d, yyyy")}`
  return "Custom range"
}

// ── Component ─────────────────────────────────────────────────────────────────

type Props = {
  /** Controlled value. If provided the caller manages state. */
  value?: DateRangeValue
  /** Called whenever the selection changes. */
  onChange?: (value: DateRangeValue) => void
  /** Default preset when uncontrolled. Defaults to "last-30". */
  defaultPreset?: DateRangePreset
  /** Button size. */
  size?: "sm" | "default"
  /** Optional extra className on the trigger button. */
  className?: string
  align?: "start" | "end" | "center"
}

export function DateRangePicker({
  value,
  onChange,
  defaultPreset = "last-30",
  size = "sm",
  className,
  align = "end",
}: Props) {
  const [open, setOpen] = useState(false)

  // ── Uncontrolled internal state ──────────────────────────────────────────────
  const initialPreset = defaultPreset
  const initialRange =
    initialPreset !== "custom" ? computePreset(initialPreset) : undefined

  const [internalValue, setInternalValue] = useState<DateRangeValue>({
    preset: initialPreset,
    from: initialRange?.from,
    to: initialRange?.to,
  })
  const [calendarMonth, setCalendarMonth] = useState<Date>(
    initialRange?.from ?? new Date()
  )

  const current = value ?? internalValue

  const commit = (next: DateRangeValue) => {
    if (!value) setInternalValue(next)
    onChange?.(next)
  }

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handlePreset = (item: PresetItem) => {
    const range = computePreset(item.key)
    commit({ preset: item.key, ...range })
    setOpen(false)
  }

  const handleCustomClick = () => {
    // Enter custom mode — keep popover open so user can pick
    commit({ preset: "custom", from: current.from, to: current.to })
  }

  const handleCalendarSelect = (range: DateRange | undefined) => {
    const next: DateRangeValue = {
      preset: "custom",
      from: range?.from,
      to: range?.to,
    }
    commit(next)
    if (range?.from && range?.to) {
      setOpen(false)
    }
  }

  const isCustom = current.preset === "custom"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={size}
          className={cn("gap-1.5 font-normal", className)}
        >
          <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{triggerLabel(current)}</span>
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        sideOffset={8}
        className={cn(
          "flex w-auto min-w-0 p-0 shadow-lg",
          // When custom is active, the calendar panel slides in on the right;
          // otherwise just the preset list is visible.
          isCustom ? "flex-row" : ""
        )}
      >
        {/* ── Left: preset list ──────────────────────────────────────── */}
        <div
          className={cn(
            "flex w-44 flex-col py-1",
            isCustom && "border-r"
          )}
        >
          {PRESETS.map((p) => {
            const active = current.preset === p.key
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => handlePreset(p)}
                className={cn(
                  "flex w-full items-center gap-2.5 px-4 py-1.5 text-sm transition-colors hover:bg-accent",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {/* Radio indicator */}
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    active
                      ? "border-primary"
                      : "border-muted-foreground/35"
                  )}
                >
                  {active && (
                    <span className="size-1.5 rounded-full bg-primary" />
                  )}
                </span>
                {p.label}
              </button>
            )
          })}

          {/* Custom date option */}
          <div className="mx-3 my-1 border-t" />
          <button
            type="button"
            onClick={handleCustomClick}
            className={cn(
              "flex w-full items-center gap-2.5 px-4 py-1.5 text-sm transition-colors hover:bg-accent",
              isCustom ? "text-foreground font-medium" : "text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                isCustom ? "border-primary" : "border-muted-foreground/35"
              )}
            >
              {isCustom && (
                <span className="size-1.5 rounded-full bg-primary" />
              )}
            </span>
            Custom date
          </button>
        </div>

        {/* ── Right: calendar (custom mode only) ─────────────────────── */}
        {isCustom && (
          <div className="p-3">
            <Calendar
              mode="range"
              selected={
                current.from
                  ? { from: current.from, to: current.to }
                  : undefined
              }
              onSelect={handleCalendarSelect}
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              numberOfMonths={2}
              disabled={{ after: new Date() }}
            />
            {/* Footer — shows selected range or hint */}
            <div className="mt-2 flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
              {current.from && current.to ? (
                <>
                  <span>
                    {format(current.from, "MMM d, yyyy")} –{" "}
                    {format(current.to, "MMM d, yyyy")}
                  </span>
                  <span
                    className={cn(
                      "font-medium tabular-nums",
                      "text-foreground"
                    )}
                  >
                    {Math.round(
                      (current.to.getTime() - current.from.getTime()) /
                        (1000 * 60 * 60 * 24)
                    ) + 1}{" "}
                    days
                  </span>
                </>
              ) : (
                <span>Pick start and end date</span>
              )}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
