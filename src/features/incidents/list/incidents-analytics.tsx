import { useMemo, useRef, useEffect, useState } from "react"
import {
  curveCatmullRom,
  extent,
  interpolateRdYlGn,
  line,
  max,
  scaleLinear,
  scaleSequential,
  scaleTime,
  timeFormat,
} from "d3"
import { parse } from "date-fns"
import { TrendingDown, TrendingUp } from "lucide-react"
import type { Table } from "@tanstack/react-table"
import type { Incident } from "@/data/incidents"
import { cn } from "@/lib/utils"
import type { AnalyticsDateRange, AnalyticsRecordType, AnalyticsTimeRange } from "./incidents-analytics-toolbar"

// ─── Date parsing ─────────────────────────────────────────────────────────────

function parseIncidentDate(s: string | null | undefined): Date | null {
  if (!s) return null
  const ref = new Date()
  try {
    const d = parse(s, "MMM d, HH:mm", ref)
    if (!isNaN(d.getTime())) return d
  } catch {}
  try {
    const d = parse(s, "MMM d", ref)
    if (!isNaN(d.getTime())) return d
  } catch {}
  try {
    const d = new Date(s)
    if (!isNaN(d.getTime())) return d
  } catch {}
  return null
}

// ─── Responsive size hooks ────────────────────────────────────────────────────

function useContainerWidth(ref: React.RefObject<HTMLDivElement | null>): number {
  const [w, setW] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver((e) => setW(e[0].contentRect.width))
    ro.observe(el)
    setW(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])
  return w
}

function useContainerSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ w: 0, h: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver((e) => {
      const { width, height } = e[0].contentRect
      setSize({ w: width, h: height })
    })
    ro.observe(el)
    const r = el.getBoundingClientRect()
    setSize({ w: r.width, h: r.height })
    return () => ro.disconnect()
  }, [])
  return size
}

// ─── Severity colour map ──────────────────────────────────────────────────────

const SEV_COLOR: Record<string, string> = {
  critical: "hsl(0 84% 60%)",
  high:     "hsl(25 95% 55%)",
  medium:   "hsl(45 96% 55%)",
  low:      "hsl(142 71% 45%)",
}

// ─── Static dummy data ────────────────────────────────────────────────────────

const STATUS_ROWS = [
  { label: "Open",          count: 47 },
  { label: "Investigating", count: 32 },
  { label: "In Progress",   count: 24 },
  { label: "Waiting",       count: 15 },
  { label: "Resolved",      count: 18 },
  { label: "Closed",        count:  6 },
]

const WORKLOAD_ROWS = [
  { label: "Sara Ali",      count: 14 },
  { label: "Ahmed Khan",    count: 11 },
  { label: "Unassigned",    count: 12 },
  { label: "Yusuf Kamal",   count:  9 },
  { label: "Mariam Hassan", count:  8 },
  { label: "Rashid Omer",   count:  6 },
]

const TOP_CATEGORIES = [
  { label: "Phishing",               count: 24 },
  { label: "Malware",                count: 19 },
  { label: "Cloud Misconfiguration", count: 16 },
  { label: "Credential Access",      count: 12 },
  { label: "Insider Threat",         count:  9 },
]

const TOP_SOURCES = [
  { label: "Splunk",        count: 28 },
  { label: "Sentinel",      count: 21 },
  { label: "CrowdStrike",   count: 18 },
  { label: "AWS GuardDuty", count: 13 },
  { label: "OmniSense",     count: 11 },
]

const DISPOSITION_ROWS = [
  { label: "True Positive",  count: 38 },
  { label: "Pending",        count: 21 },
  { label: "False Positive", count: 14 },
  { label: "Benign",         count:  8 },
  { label: "Not Determined", count:  7 },
]

const SEVERITY_ROWS = [
  { label: "Critical", count: 12, color: SEV_COLOR.critical },
  { label: "High",     count: 24, color: SEV_COLOR.high     },
  { label: "Medium",   count: 31, color: SEV_COLOR.medium   },
  { label: "Low",      count: 15, color: SEV_COLOR.low      },
]

const MTTR_ROWS = [
  { label: "Critical", hours:  2.1, color: SEV_COLOR.critical },
  { label: "High",     hours:  4.8, color: SEV_COLOR.high     },
  { label: "Medium",   hours: 12.3, color: SEV_COLOR.medium   },
  { label: "Low",      hours: 38.0, color: SEV_COLOR.low      },
]

// S3 score distribution — bimodal, skewed toward higher risk (realistic SOC queue)
const S3_SCORES = [
  // Low (5–25)
  5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 17, 17, 18, 19, 20, 21, 22,
  22, 23, 23, 24, 24, 25, 25,
  // Low-medium (26–45)
  26, 26, 27, 28, 28, 29, 29, 30, 30, 31, 31, 32, 32, 33, 34, 34, 35, 36, 36,
  37, 37, 38, 38, 39, 40, 40, 41, 42, 42, 43, 43, 44, 44, 45,
  // Medium (46–62)
  46, 46, 47, 48, 48, 49, 49, 50, 50, 50, 51, 51, 51, 52, 52, 53, 54, 54, 55,
  55, 56, 56, 57, 58, 58, 59, 59, 60, 60, 61, 61, 62, 62,
  // High (63–79) — denser
  63, 63, 64, 65, 65, 66, 66, 67, 68, 68, 69, 69, 70, 70, 70, 71, 71, 71, 72,
  72, 72, 73, 73, 73, 74, 74, 74, 75, 75, 75, 76, 76, 76, 77, 77, 77, 78, 78,
  78, 78, 79, 79, 79,
  // Very high (80–98) — densest
  80, 80, 80, 81, 81, 81, 82, 82, 82, 83, 83, 83, 84, 84, 84, 84, 85, 85, 85,
  85, 86, 86, 86, 86, 87, 87, 87, 87, 88, 88, 88, 88, 88, 89, 89, 89, 89, 90,
  90, 90, 90, 91, 91, 91, 92, 92, 92, 93, 93, 94, 94, 95, 95, 96, 96, 97, 98,
]

const S3_BIN = 2                          // score units per column
const S3_N_BINS = Math.ceil(100 / S3_BIN) // = 25 columns across 0–100

// Pre-bin at module level — static data, no need to recompute
const S3_BINS: number[][] = Array.from({ length: S3_N_BINS }, () => [])
S3_SCORES.forEach((s) => {
  S3_BINS[Math.min(Math.floor(s / S3_BIN), S3_N_BINS - 1)].push(s)
})
const S3_MAX_STACK = Math.max(...S3_BINS.map((b) => b.length), 1)

// Module-level stats (static data — no need for useMemo)
const _s3Sorted = [...S3_SCORES].sort((a, b) => a - b)
const S3_AVG    = Math.round(S3_SCORES.reduce((a, b) => a + b, 0) / S3_SCORES.length)
const S3_P95    = _s3Sorted[Math.floor(_s3Sorted.length * 0.95)]

// 0 = green (safe), 100 = red (critical)
const s3Color = scaleSequential()
  .domain([0, 100])
  .interpolator((t: number) => interpolateRdYlGn(1 - t))

// ─── WidgetCard ───────────────────────────────────────────────────────────────

function WidgetCard({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col rounded-lg border bg-card", className)}>
      <div className="shrink-0 border-b px-4 py-3">
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-4">{children}</div>
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

type Tone = "destructive" | "attention" | "success" | "neutral"

const TONE_CLASS: Record<Tone, string> = {
  destructive: "text-destructive",
  attention:   "text-amber-500",
  success:     "text-emerald-500",
  neutral:     "text-muted-foreground",
}

function StatCard({
  label,
  value,
  delta,
  deltaUp,
  tone = "neutral",
}: {
  label: string
  value: string | number
  delta: string
  deltaUp: boolean
  tone?: Tone
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border bg-card p-4">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-2xl font-bold tabular-nums">{value}</span>
      <span className={cn("flex items-center gap-1 text-xs font-medium", TONE_CLASS[tone])}>
        {deltaUp ? (
          <TrendingUp className="size-3 shrink-0" />
        ) : (
          <TrendingDown className="size-3 shrink-0" />
        )}
        {delta}
      </span>
    </div>
  )
}

// ─── HorizontalBars ───────────────────────────────────────────────────────────

function HorizontalBars({
  rows,
  maxVal,
  barColor = "hsl(217 91% 58%)",
  valueLabel,
}: {
  rows: { label: string; count: number; color?: string }[]
  maxVal: number
  barColor?: string
  valueLabel?: (n: number) => string
}) {
  return (
    <div className="space-y-2.5">
      {rows.map(({ label, count, color }) => (
        <div key={label} className="flex items-center gap-2">
          <span className="w-28 shrink-0 truncate text-xs text-muted-foreground" title={label}>
            {label}
          </span>
          <div className="h-5 flex-1 overflow-hidden rounded-sm bg-muted/40">
            <div
              className="h-full rounded-sm transition-all duration-500"
              style={{
                width: `${Math.max((count / maxVal) * 100, 2)}%`,
                backgroundColor: color ?? barColor,
              }}
            />
          </div>
          <span className="w-10 shrink-0 text-right text-xs font-medium tabular-nums">
            {valueLabel ? valueLabel(count) : count}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Created vs Closed — D3 line chart ───────────────────────────────────────

type DayPoint = { date: Date; created: number; closed: number }

// Fixed dummy data — real incidents mock data is too sparse for the 14-day window
const LINE_CREATED = [5, 7, 4, 8, 6, 9, 5, 7, 8,  6,  4,  7,  5,  6]
const LINE_CLOSED  = [2, 4, 3, 6, 4, 7, 4, 5, 7,  5,  3,  5,  4,  5]

function CreatedVsClosedChart() {
  const ref = useRef<HTMLDivElement>(null)
  const w = useContainerWidth(ref)

  const data = useMemo((): DayPoint[] => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (13 - i))
      return { date: d, created: LINE_CREATED[i], closed: LINE_CLOSED[i] }
    })
  }, [])

  const M = { top: 14, right: 20, bottom: 30, left: 30 }
  const H = 180
  const iW = Math.max(w - M.left - M.right, 0)
  const iH = H - M.top - M.bottom

  const xScale = useMemo(
    () => scaleTime().domain(extent(data, (d) => d.date) as [Date, Date]).range([0, iW]),
    [data, iW],
  )
  const yTop = useMemo(() => max(data, (d) => Math.max(d.created, d.closed)) ?? 1, [data])
  const yScale = useMemo(
    () => scaleLinear().domain([0, yTop + 1]).range([iH, 0]).nice(),
    [yTop, iH],
  )

  const mkPath = (key: "created" | "closed") =>
    line<DayPoint>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d[key]))
      .curve(curveCatmullRom)(data) ?? ""

  const yTicks  = yScale.ticks(4)
  const fmt     = timeFormat("%b %d")
  const xLabels = data.filter((_, i) => i % 2 === 0)

  const BLUE  = "hsl(217 91% 58%)"
  const GREEN = "hsl(142 71% 45%)"

  return (
    <div ref={ref} className="w-full">
      {w > 0 && (
        <svg width={w} height={H} className="overflow-visible">
          <g transform={`translate(${M.left},${M.top})`}>
            {/* Grid lines */}
            {yTicks.map((t) => (
              <line key={t} x1={0} x2={iW} y1={yScale(t)} y2={yScale(t)}
                stroke="var(--border)" strokeDasharray="3 3" />
            ))}
            {/* Y-axis labels */}
            {yTicks.map((t) => (
              <text key={t} x={-6} y={yScale(t)} dy="0.32em" textAnchor="end"
                fontSize={10} fill="var(--muted-foreground)">{t}</text>
            ))}
            {/* Baseline */}
            <line x1={0} x2={iW} y1={iH} y2={iH} stroke="var(--border)" />
            {/* X labels */}
            {xLabels.map((d) => (
              <text key={d.date.toISOString()} x={xScale(d.date)} y={iH + 16}
                textAnchor="middle" fontSize={10} fill="var(--muted-foreground)">
                {fmt(d.date)}
              </text>
            ))}
            {/* Lines */}
            <path d={mkPath("created")} fill="none" stroke={BLUE}  strokeWidth={2} />
            <path d={mkPath("closed")}  fill="none" stroke={GREEN} strokeWidth={2} strokeDasharray="5 3" />
            {/* Legend */}
            <g transform={`translate(${iW - 132}, -2)`}>
              <line x1={0}  x2={14} y1={7} y2={7} stroke={BLUE}  strokeWidth={2} />
              <text x={18} y={7} dy="0.32em" fontSize={10} fill="var(--muted-foreground)">Created</text>
              <line x1={68} x2={82} y1={7} y2={7} stroke={GREEN} strokeWidth={2} strokeDasharray="5 3" />
              <text x={86} y={7} dy="0.32em" fontSize={10} fill="var(--muted-foreground)">Closed</text>
            </g>
          </g>
        </svg>
      )}
    </div>
  )
}

// ─── S3 Score dot histogram ───────────────────────────────────────────────────
// Columns of stacked dots — x-axis = S3 score, column height = frequency.
// DOT_R is derived from container width so dots touch horizontally (no gaps).
// The SVG fills the card's full height; columns grow up from the baseline.

function S3ScoreHeatmap() {
  const ref = useRef<HTMLDivElement>(null)
  const { w, h } = useContainerSize(ref)

  // Margins: top leaves room for reference-line labels, bottom for x-axis
  const M  = { top: 36, right: 24, bottom: 48, left: 24 }
  const iW = Math.max(w - M.left - M.right, 0)
  const iH = Math.max(h - M.top - M.bottom, 0)

  // Derive DOT_R from the inner width so adjacent columns touch exactly —
  // each bin spans S3_BIN score units = iW * S3_BIN / 100 pixels;
  // diameter must equal that span so there are zero horizontal gaps.
  const DOT_R    = iW > 0 ? (iW * S3_BIN) / (100 * 2) : 5
  const DOT_STEP = DOT_R * 2  // zero vertical gap — dots touch

  const xScale = useMemo(
    () => scaleLinear().domain([0, 100]).range([0, iW]),
    [iW],
  )

  // Keep a label centred on the line but never clipped by the chart edges
  const clampLabelX = (x: number) => Math.max(24, Math.min(iW - 24, x))

  return (
    <div ref={ref} className="w-full flex-1">
      {w > 0 && h > 0 && (
        <svg width={w} height={h} className="overflow-visible">
          <g transform={`translate(${M.left},${M.top})`}>

            {/* ── Stacked dots per bin, growing from the baseline upward ── */}
            {S3_BINS.map((binScores, binIdx) => {
              const cx = xScale((binIdx + 0.5) * S3_BIN)
              return binScores.map((score, stackIdx) => (
                <circle
                  key={`${binIdx}-${stackIdx}`}
                  cx={cx}
                  cy={iH - DOT_R - stackIdx * DOT_STEP}
                  r={DOT_R}
                  fill={s3Color(score) as string}
                  fillOpacity={0.92}
                />
              ))
            })}

            {/* ── Baseline ─────────────────────────────────────────────── */}
            <line x1={0} x2={iW} y1={iH} y2={iH} stroke="var(--border)" strokeWidth={1} />

            {/* ── X-axis tick marks + labels ───────────────────────────── */}
            {[0, 20, 40, 60, 80, 100].map((t) => (
              <g key={t} transform={`translate(${xScale(t)},${iH})`}>
                <line y2={5} stroke="var(--border)" />
                <text y={18} textAnchor="middle" fontSize={11}
                  fill="var(--muted-foreground)">{t}</text>
              </g>
            ))}

            {/* ── Axis label ───────────────────────────────────────────── */}
            <text x={iW / 2} y={iH + 38} textAnchor="middle" fontSize={11}
              fill="var(--muted-foreground)">
              S3 Score
            </text>

            {/* ── Average reference line ───────────────────────────────── */}
            {iW > 0 && (
              <g>
                <line
                  x1={xScale(S3_AVG)} x2={xScale(S3_AVG)}
                  y1={-24} y2={iH}
                  stroke="var(--muted-foreground)"
                  strokeWidth={1.5} strokeDasharray="4 3"
                />
                <circle cx={xScale(S3_AVG)} cy={iH} r={3.5}
                  fill="var(--muted-foreground)" />
                <text
                  x={clampLabelX(xScale(S3_AVG))} y={-28}
                  textAnchor="middle" fontSize={11} fontWeight={600}
                  fill="var(--muted-foreground)"
                >
                  Avg {S3_AVG}
                </text>
              </g>
            )}

            {/* ── P95 reference line ───────────────────────────────────── */}
            {iW > 0 && (
              <g>
                <line
                  x1={xScale(S3_P95)} x2={xScale(S3_P95)}
                  y1={-24} y2={iH}
                  stroke="hsl(0 84% 60%)"
                  strokeWidth={1.5} strokeDasharray="4 3"
                />
                <circle cx={xScale(S3_P95)} cy={iH} r={3.5}
                  fill="hsl(0 84% 60%)" />
                <text
                  x={clampLabelX(xScale(S3_P95))} y={-28}
                  textAnchor="middle" fontSize={11} fontWeight={600}
                  fill="hsl(0 84% 60%)"
                >
                  P95 {S3_P95}
                </text>
              </g>
            )}

          </g>
        </svg>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function IncidentsAnalytics({
  table,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  recordType: _recordType,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  timeRange: _timeRange,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dateRange: _dateRange,
}: {
  table: Table<Incident>
  recordType: AnalyticsRecordType
  timeRange: AnalyticsTimeRange
  dateRange: AnalyticsDateRange
}) {
  const filteredRows = table.getFilteredRowModel().rows
  const rows = useMemo(
    () => filteredRows.map((r) => r.original),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredRows],
  )

  // ── KPI stats ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const breached   = rows.filter((i) => i.sla?.tone === "breach").length   || 12
    const atRisk     = rows.filter((i) => i.sla?.tone === "warn").length     || 34
    const unassigned = rows.filter((i) => !i.assignee).length                || 17
    const open       = rows.filter((i) =>
      ["open", "investigating", "in-progress", "waiting"].includes(i.status),
    ).length || 142

    const resolved = rows.filter((i) => i.closeDate && i.startDate)
    const mttrH =
      resolved.length > 0
        ? resolved.reduce((sum, i) => {
            const s = parseIncidentDate(i.startDate)
            const c = parseIncidentDate(i.closeDate)
            return sum + (s && c ? (c.getTime() - s.getTime()) / 3_600_000 : 0)
          }, 0) / resolved.length
        : 4.2

    const withDisp = rows.filter(
      (i) => i.disposition && !["not-determined", "pending"].includes(i.disposition),
    )
    const fpPct =
      withDisp.length > 0
        ? Math.round(
            (withDisp.filter((i) => i.disposition === "false-positive").length /
              withDisp.length) * 100,
          )
        : 18

    return { breached, atRisk, unassigned, open, mttrH, fpPct }
  }, [rows])

  const topIocs = [
    { type: "ip",   value: "3.21.84.122",    count: 12 },
    { type: "hash", value: "a4f2b91…e8c",     count:  9 },
    { type: "url",  value: "evil-domain.com", count:  7 },
    { type: "ip",   value: "45.142.x.x",      count:  5 },
    { type: "hash", value: "7e1d04…92a",      count:  4 },
  ]
  const topEntities = [
    { type: "host", value: "jump-srv-02",    count: 8 },
    { type: "host", value: "finance-laptop", count: 6 },
    { type: "user", value: "j.smith@acme",   count: 5 },
    { type: "dept", value: "HR",             count: 5 },
    { type: "host", value: "DC-PROD-01",     count: 4 },
  ]

  return (
    <div className="space-y-4">

      {/* ── Row 1: KPI stat cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-6 gap-4">
        <StatCard label="SLA Breached"    value={stats.breached}               delta="+3 vs yesterday"    deltaUp   tone="destructive" />
        <StatCard label="At Risk"          value={stats.atRisk}                 delta="+8 vs yesterday"    deltaUp   tone="attention"   />
        <StatCard label="Unassigned"       value={stats.unassigned}             delta="−2 vs yesterday"    deltaUp={false} tone="success" />
        <StatCard label="Open"             value={stats.open}                   delta="+11 this week"      deltaUp   tone="neutral"    />
        <StatCard label="Avg MTTR"         value={`${stats.mttrH.toFixed(1)}h`} delta="−0.6h vs last week" deltaUp={false} tone="success" />
        <StatCard label="False Positive %" value={`${stats.fpPct}%`}            delta="−2% vs last week"   deltaUp={false} tone="success" />
      </div>

      {/* ── Row 2: Status + Workload — 50/50 ─────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <WidgetCard title="Status Distribution">
          <HorizontalBars rows={STATUS_ROWS} maxVal={47} />
        </WidgetCard>
        <WidgetCard title="Workload by Analyst">
          <HorizontalBars rows={WORKLOAD_ROWS} maxVal={14} barColor="hsl(262 83% 58%)" />
        </WidgetCard>
      </div>

      {/* ── Row 3: Created vs Closed ──────────────────────────────────────── */}
      <WidgetCard title="Created vs Closed — last 14 days">
        <CreatedVsClosedChart />
      </WidgetCard>

      {/* ── Row 4: S3 heatmap (col-span-2) + Top Categories / Sources ──────── */}
      <div className="grid grid-cols-3 gap-4 items-stretch">
        <WidgetCard title="S3 Score Distribution" className="col-span-2 h-full">
          <S3ScoreHeatmap />
        </WidgetCard>
        <div className="flex flex-col gap-4">
          <WidgetCard title="Top Categories" className="flex-1">
            <HorizontalBars rows={TOP_CATEGORIES} maxVal={24} barColor="hsl(192 91% 36%)" />
          </WidgetCard>
          <WidgetCard title="Top Sources" className="flex-1">
            <HorizontalBars rows={TOP_SOURCES} maxVal={28} barColor="hsl(217 91% 58%)" />
          </WidgetCard>
        </div>
      </div>

      {/* ── Row 5: Top IOCs + Most-Affected Entities ─────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <WidgetCard title="Top IOCs">
          <div className="space-y-2.5">
            {topIocs.map((ioc, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="shrink-0 rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] uppercase">{ioc.type}</span>
                <span className="flex-1 truncate font-mono text-foreground">{ioc.value}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">{ioc.count} incidents</span>
              </div>
            ))}
          </div>
        </WidgetCard>
        <WidgetCard title="Most-Affected Entities">
          <div className="space-y-2.5">
            {topEntities.map((e, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="shrink-0 rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] uppercase">{e.type}</span>
                <span className="flex-1 truncate text-foreground">{e.value}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">{e.count} incidents</span>
              </div>
            ))}
          </div>
        </WidgetCard>
      </div>

      {/* ── Row 6: Dispositions + Severity Mix + MTTR by Severity ─────────── */}
      <div className="grid grid-cols-3 gap-4">
        <WidgetCard title="Dispositions">
          <HorizontalBars rows={DISPOSITION_ROWS} maxVal={38} />
        </WidgetCard>
        <WidgetCard title="Severity Mix">
          <HorizontalBars rows={SEVERITY_ROWS} maxVal={31} />
        </WidgetCard>
        <WidgetCard title="MTTR by Severity">
          <HorizontalBars
            rows={MTTR_ROWS.map((r) => ({ label: r.label, count: r.hours, color: r.color }))}
            maxVal={38}
            valueLabel={(n) => `${n}h`}
          />
        </WidgetCard>
      </div>

    </div>
  )
}
