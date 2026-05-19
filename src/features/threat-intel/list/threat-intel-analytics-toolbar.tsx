import React, { useState } from "react"
import { Briefcase, CalendarIcon, CheckCircle2, Clock, Layers } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

// ─── Exported types ───────────────────────────────────────────────────────────

export type AnalyticsRecordType = "all" | "pending" | "case" | "finish"
export type AnalyticsTimeRange  = "1d" | "7d" | "30d" | "90d" | "custom"

export interface AnalyticsDateRange {
  from: Date | null
  to:   Date | null
}

// ─── Segment helper ───────────────────────────────────────────────────────────

function Segment<T extends string>({
  options,
  active,
  onChange,
  renderOption,
}: {
  options: T[]
  active: T
  onChange: (v: T) => void
  renderOption?: (v: T) => React.ReactNode
}) {
  return (
    <div className="inline-flex items-center rounded-md border bg-background p-0.5">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-sm px-3 text-xs font-medium transition-colors",
            active === opt
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={active === opt}
        >
          {renderOption ? renderOption(opt) : opt}
        </button>
      ))}
    </div>
  )
}

// ─── Date range popover ───────────────────────────────────────────────────────

function DateRangeButton({
  active,
  dateRange,
  onApply,
}: {
  active: boolean
  dateRange: AnalyticsDateRange
  onApply: (r: AnalyticsDateRange) => void
}) {
  const [open, setOpen] = useState(false)
  const [range, setRange] = useState<DateRange | undefined>(() => ({
    from: dateRange.from ?? undefined,
    to:   dateRange.to   ?? undefined,
  }))

  function handleApply() {
    onApply({ from: range?.from ?? null, to: range?.to ?? null })
    setOpen(false)
  }

  const label =
    dateRange.from && dateRange.to
      ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d, yyyy")}`
      : dateRange.from
        ? `From ${format(dateRange.from, "MMM d, yyyy")}`
        : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-sm px-3 text-xs font-medium transition-colors",
            active
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={active}
        >
          <CalendarIcon className="size-3.5 shrink-0" />
          {label ?? "Custom range"}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="end" sideOffset={6}>
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={range}
          onSelect={setRange}
          disabled={{ after: new Date() }}
        />
        <div className="flex items-center justify-between border-t px-3 py-2.5">
          <span className="text-xs text-muted-foreground">
            {range?.from && range?.to
              ? `${format(range.from, "MMM d")} – ${format(range.to, "MMM d, yyyy")}`
              : range?.from
                ? `${format(range.from, "MMM d, yyyy")} – …`
                : "Select start and end date"}
          </span>
          <button
            type="button"
            disabled={!range?.from}
            onClick={handleApply}
            className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition-opacity disabled:opacity-40"
          >
            Apply
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

const RECORD_LABELS: Record<AnalyticsRecordType, string> = {
  all:     "All",
  pending: "Pending",
  case:    "Case",
  finish:  "Finish",
}

const RECORD_ICONS: Record<AnalyticsRecordType, React.ElementType> = {
  all:     Layers,
  pending: Clock,
  case:    Briefcase,
  finish:  CheckCircle2,
}

const RANGE_LABELS: Record<Exclude<AnalyticsTimeRange, "custom">, string> = {
  "1d":  "1D",
  "7d":  "7D",
  "30d": "30D",
  "90d": "90D",
}

const RANGE_OPTIONS = Object.keys(RANGE_LABELS) as Exclude<AnalyticsTimeRange, "custom">[]

type Props = {
  recordType:         AnalyticsRecordType
  onRecordTypeChange: (t: AnalyticsRecordType) => void
  timeRange:          AnalyticsTimeRange
  onTimeRangeChange:  (r: AnalyticsTimeRange) => void
  dateRange:          AnalyticsDateRange
  onDateRangeChange:  (r: AnalyticsDateRange) => void
}

export function ThreatIntelAnalyticsToolbar({
  recordType,
  onRecordTypeChange,
  timeRange,
  onTimeRangeChange,
  dateRange,
  onDateRangeChange,
}: Props) {
  function handleDateRangeApply(r: AnalyticsDateRange) {
    onDateRangeChange(r)
    onTimeRangeChange("custom")
  }

  return (
    <div className="flex items-center justify-between gap-2">
      {/* Left — record type */}
      <Segment<AnalyticsRecordType>
        options={["all", "pending", "case", "finish"]}
        active={recordType}
        onChange={onRecordTypeChange}
        renderOption={(v) => {
          const Icon = RECORD_ICONS[v]
          return <><Icon className="size-3.5" />{RECORD_LABELS[v]}</>
        }}
      />

      {/* Right — time range + custom date range */}
      <div className="inline-flex items-center rounded-md border bg-background p-0.5">
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onTimeRangeChange(opt)}
            className={cn(
              "inline-flex h-8 items-center rounded-sm px-3 text-xs font-medium transition-colors",
              timeRange === opt
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-pressed={timeRange === opt}
          >
            {RANGE_LABELS[opt]}
          </button>
        ))}
        <DateRangeButton
          active={timeRange === "custom"}
          dateRange={dateRange}
          onApply={handleDateRangeApply}
        />
      </div>
    </div>
  )
}
