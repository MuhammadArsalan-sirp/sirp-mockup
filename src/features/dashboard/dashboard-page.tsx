import { useRef, useEffect, useState, useMemo } from "react"
import { NavLink } from "react-router"
import {
  axisBottom,
  axisLeft,
  interpolateRdYlGn,
  max,
  scaleBand,
  scaleLinear,
  scaleSequential,
  select,
  stack,
} from "d3"
import { AlertTriangle, Calendar, Check, Clock, ExternalLink, Layers, X } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import {
  AGENT_STAGE_COLORS,
  AGENT_STAGE_KEYS,
  approvalItems,
  artifactList,
  entitiesStat,
  entityList,
  ingestionHealthStat,
  playbookRuns,
  s3Scores,
  s3Stat,
  threatFeedItems,
  FILTER_DASHBOARD,
  type ArtifactItem,
  type EntityListItem,
  type EntityRisk,
  type PlaybookRun,
  type SevBucket,
  type TimeFilter,
} from "@/data/dashboard"

// ─── Responsive hooks ─────────────────────────────────────────────────────────

function useContainerWidth(ref: React.RefObject<HTMLDivElement | null>): number {
  const [w, setW] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(e => setW(e[0].contentRect.width))
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
    const ro = new ResizeObserver(e => {
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

// ─── Severity colours ─────────────────────────────────────────────────────────

const SEV_COLORS = {
  sev5: "var(--info)",
  sev4: "var(--success)",
  sev3: "var(--warning)",
  sev2: "var(--attention)",
  sev1: "var(--destructive)",
}

const SEV_KEYS = ["sev5", "sev4", "sev3", "sev2", "sev1"] as const
type SevKey = typeof SEV_KEYS[number]

const ENTITY_RISK_STYLE: Record<EntityRisk, { badge: string; bar: string }> = {
  critical: { badge: "bg-destructive/15 text-destructive font-semibold", bar: "var(--destructive)" },
  high:     { badge: "bg-attention/15 text-attention",                   bar: "var(--attention)" },
  elevated: { badge: "bg-warning/15 text-warning",                       bar: "var(--warning)" },
  medium:   { badge: "bg-success/15 text-success",                       bar: "var(--success)" },
  low:      { badge: "bg-muted text-muted-foreground",                   bar: "var(--info)" },
}

const ENTITY_BAR_ORDER: EntityRisk[] = ["low", "medium", "elevated", "high", "critical"]
const ENTITIES_TOTAL =
  entitiesStat.low + entitiesStat.medium + entitiesStat.elevated +
  entitiesStat.high + entitiesStat.critical

// ─── Stacked bar chart with hover tooltip ─────────────────────────────────────

type ChartTip = { x: number; y: number; bucket: SevBucket }

function SevStackedBarChart({ data, fixedHeight }: { data: SevBucket[]; fixedHeight?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef       = useRef<SVGSVGElement>(null)
  const { w, h: containerH } = useContainerSize(containerRef)
  const [tip, setTip] = useState<ChartTip | null>(null)
  const setTipRef = useRef(setTip)

  const H = fixedHeight ?? containerH
  const M = { top: 4, right: 4, bottom: 24, left: 30 }

  useEffect(() => {
    if (!svgRef.current || w === 0 || H === 0) return
    const el = containerRef.current

    const svg = select(svgRef.current)
    svg.selectAll("*").remove()

    const iW = w - M.left - M.right
    const iH = H - M.top - M.bottom

    const stackGen = stack<SevBucket>().keys([...SEV_KEYS])
    const series = stackGen(data)

    const xScale = scaleBand<string>()
      .domain(data.map(d => d.day))
      .range([0, iW])
      .padding(0.22)

    const yMax = max(series[series.length - 1], d => d[1]) ?? 0
    const yScale = scaleLinear().domain([0, yMax * 1.15]).range([iH, 0])

    const g = svg.append("g").attr("transform", `translate(${M.left},${M.top})`)

    g.selectAll<SVGLineElement, number>(".grid-h")
      .data(yScale.ticks(4))
      .join("line")
      .attr("class", "grid-h")
      .attr("x1", 0).attr("x2", iW)
      .attr("y1", d => yScale(d)).attr("y2", d => yScale(d))
      .attr("stroke", "var(--border)")
      .attr("stroke-width", 0.5)

    series.forEach((s, si) => {
      const key = SEV_KEYS[si] as SevKey
      g.selectAll<SVGRectElement, (typeof s)[number]>(`.bar-${si}`)
        .data(s)
        .join("rect")
        .attr("x", d => xScale(d.data.day) ?? 0)
        .attr("y", d => yScale(d[1]))
        .attr("height", d => Math.max(0, yScale(d[0]) - yScale(d[1]) - 2))
        .attr("width", xScale.bandwidth())
        .attr("fill", SEV_COLORS[key])
    })

    g.append("g")
      .attr("transform", `translate(0,${iH})`)
      .call(
        axisBottom<string>(xScale)
          .tickValues(data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 7)) === 0).map(d => d.day))
          .tickSize(3)
      )
      .call(ax => {
        ax.select(".domain").remove()
        ax.selectAll("line").attr("stroke", "var(--border)")
        ax.selectAll("text")
          .style("font-size", "10px")
          .style("fill", "var(--muted-foreground)")
          .attr("dy", "1.4em")
      })

    g.append("g")
      .call(axisLeft<number>(yScale).ticks(4).tickSize(0))
      .call(ax => {
        ax.select(".domain").remove()
        ax.selectAll("text")
          .style("font-size", "10px")
          .style("fill", "var(--muted-foreground)")
          .attr("dx", "-0.3em")
      })

    // Transparent hover bands — rendered last so they're on top
    const moveHandler = function(event: Event, d: SevBucket) {
      if (!el) return
      const me = event as MouseEvent
      const rect = el.getBoundingClientRect()
      setTipRef.current({ x: me.clientX - rect.left, y: me.clientY - rect.top, bucket: d })
    }
    g.selectAll<SVGRectElement, SevBucket>(".hover-band")
      .data(data)
      .join("rect")
      .attr("class", "hover-band")
      .attr("x", d => xScale(d.day) ?? 0)
      .attr("y", 0)
      .attr("height", iH)
      .attr("width", xScale.bandwidth())
      .attr("fill", "transparent")
      .style("cursor", "default")
      .on("mouseover", moveHandler)
      .on("mousemove", moveHandler)
      .on("mouseout",  () => setTipRef.current(null))

  }, [data, w, H])

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={fixedHeight ? { height: fixedHeight } : { flex: 1, minHeight: 0 }}
    >
      {w > 0 && H > 0 && <svg ref={svgRef} width={w} height={H} />}

      {tip && (
        <div
          className="pointer-events-none absolute z-50 min-w-37 rounded-lg border bg-popover px-3 py-2 text-xs shadow-md"
          style={{ left: Math.min(tip.x + 14, w - 160), top: Math.max(4, tip.y - 8) }}
        >
          <p className="mb-1.5 font-semibold text-foreground">{tip.bucket.day}</p>
          {(["sev1","sev2","sev3","sev4","sev5"] as SevKey[]).map(k => (
            <div key={k} className="flex items-center gap-1.5 py-0.5">
              <span className="size-2 shrink-0 rounded-[2px]" style={{ background: SEV_COLORS[k] }} />
              <span className="flex-1 text-muted-foreground">{k.replace("sev","SEV ")}</span>
              <span className="font-mono tabular-nums">{tip.bucket[k]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── S3 score dot histogram ───────────────────────────────────────────────────

const S3_BIN    = 2
const S3_N_BINS = Math.ceil(100 / S3_BIN)

const S3_BINS: number[][] = Array.from({ length: S3_N_BINS }, () => [])
s3Scores.forEach(s => {
  S3_BINS[Math.min(Math.floor(s / S3_BIN), S3_N_BINS - 1)].push(s)
})

const s3Color = scaleSequential()
  .domain([0, 100])
  .interpolator((t: number) => interpolateRdYlGn(1 - t))

function S3Histogram() {
  const ref = useRef<HTMLDivElement>(null)
  const { w, h } = useContainerSize(ref)

  const M  = { top: 36, right: 24, bottom: 48, left: 24 }
  const iW = Math.max(w - M.left - M.right, 0)
  const iH = Math.max(h - M.top - M.bottom, 0)

  const DOT_R    = iW > 0 ? (iW * S3_BIN) / (100 * 2) : 5
  const DOT_STEP = DOT_R * 2

  const xScale = useMemo(
    () => scaleLinear().domain([0, 100]).range([0, iW]),
    [iW]
  )

  const clamp = (x: number) => Math.max(24, Math.min(iW - 24, x))

  return (
    <div ref={ref} className="w-full flex-1 min-h-0">
      {w > 0 && h > 0 && (
        <svg width={w} height={h} className="overflow-visible">
          <g transform={`translate(${M.left},${M.top})`}>
            {S3_BINS.map((binScores, binIdx) =>
              binScores.map((score, stackIdx) => (
                <circle
                  key={`${binIdx}-${stackIdx}`}
                  cx={xScale((binIdx + 0.5) * S3_BIN)}
                  cy={iH - DOT_R - stackIdx * DOT_STEP}
                  r={DOT_R}
                  fill={s3Color(score) as string}
                  fillOpacity={0.92}
                />
              ))
            )}

            <line x1={0} x2={iW} y1={iH} y2={iH} stroke="var(--border)" strokeWidth={1} />

            {[0, 20, 40, 60, 80, 100].map(t => (
              <g key={t} transform={`translate(${xScale(t)},${iH})`}>
                <line y2={5} stroke="var(--border)" />
                <text y={18} textAnchor="middle" fontSize={11} fill="var(--muted-foreground)">{t}</text>
              </g>
            ))}

            <text x={iW / 2} y={iH + 38} textAnchor="middle" fontSize={11} fill="var(--muted-foreground)">
              S3 Score
            </text>

            {iW > 0 && (
              <g>
                <line
                  x1={xScale(s3Stat.median)} x2={xScale(s3Stat.median)}
                  y1={-24} y2={iH}
                  stroke="var(--muted-foreground)"
                  strokeWidth={1.5} strokeDasharray="4 3"
                />
                <circle cx={xScale(s3Stat.median)} cy={iH} r={3.5} fill="var(--muted-foreground)" />
                <text
                  x={clamp(xScale(s3Stat.median))} y={-28}
                  textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--muted-foreground)"
                >
                  Median {s3Stat.median}
                </text>
              </g>
            )}

            {iW > 0 && (
              <g>
                <line
                  x1={xScale(s3Stat.p95)} x2={xScale(s3Stat.p95)}
                  y1={-24} y2={iH}
                  stroke="hsl(0 84% 60%)"
                  strokeWidth={1.5} strokeDasharray="4 3"
                />
                <circle cx={xScale(s3Stat.p95)} cy={iH} r={3.5} fill="hsl(0 84% 60%)" />
                <text
                  x={clamp(xScale(s3Stat.p95))} y={-28}
                  textAnchor="middle" fontSize={11} fontWeight={600} fill="hsl(0 84% 60%)"
                >
                  P95 {s3Stat.p95}
                </text>
              </g>
            )}
          </g>
        </svg>
      )}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIME_FILTERS: TimeFilter[] = ["1H", "24H", "7D", "30D", "90D"]

function trendClass(direction: "up" | "down", goodDir: "up" | "down") {
  return direction === goodDir ? "text-emerald-500" : "text-destructive"
}
function trendArrow(direction: "up" | "down") {
  return direction === "up" ? "▲" : "▼"
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("30D")
  const [pendingApprovals, setPendingApprovals] = useState(approvalItems)

  const f = useMemo(() => FILTER_DASHBOARD[timeFilter], [timeFilter])

  const handleApproval = (index: number) => {
    setPendingApprovals(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">

      {/* Page header */}
      <PageHeader
        title="OmniBoard"
        description="Live security operations overview across all tenants and detection sources."
        actions={
          <div className="flex items-center gap-1 rounded-lg border bg-card p-1">
          {TIME_FILTERS.map(filter => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`h-7 rounded-md px-3 text-xs font-medium transition-colors ${
                timeFilter === filter
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter}
            </button>
          ))}
          <button className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:text-foreground">
            <Calendar className="size-3.5" />
          </button>
        </div>
        }
      />

      {/* ── Operations ── */}

      {/* Row 1 — Tickets + MTTR / MTTD / MTTA */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Tickets
              </div>
              <div className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
                {f.ticketsStat.total}
              </div>
            </div>
            <div className="flex items-center gap-5 pt-1">
              {SEV_KEYS.map(k => (
                <div key={k} className="text-center">
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <span className="inline-block h-2 w-2 rounded-[2px]" style={{ background: SEV_COLORS[k] }} />
                    {k.replace("sev", "SEV")}
                  </div>
                  <div className="mt-0.5 text-sm font-semibold tabular-nums">{f.ticketsStat[k]}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <SevStackedBarChart data={f.ticketsTimeSeries} fixedHeight={380} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* MTTR — up is bad */}
          <div className="flex-1 rounded-xl border bg-card p-5">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">MTTR</div>
            <div className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">{f.mttr.value}</div>
            <div className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${trendClass(f.mttr.direction, "down")}`}>
              <span>{trendArrow(f.mttr.direction)}</span><span>{f.mttr.trend}</span>
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">vs {f.mttr.vsLastWeek} last week</div>
          </div>

          {/* MTTD — down is good */}
          <div className="flex-1 rounded-xl border bg-card p-5">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">MTTD</div>
            <div className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">{f.mttd.value}</div>
            <div className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${trendClass(f.mttd.direction, "down")}`}>
              <span>{trendArrow(f.mttd.direction)}</span><span>{f.mttd.trend}</span>
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">vs {f.mttd.vsLastWeek} last week</div>
          </div>

          {/* MTTA — down is good */}
          <div className="flex-1 rounded-xl border bg-card p-5">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">MTTA</div>
            <div className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">{f.mtta.value}</div>
            <div className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${trendClass(f.mtta.direction, "down")}`}>
              <span>{trendArrow(f.mtta.direction)}</span><span>{f.mtta.trend}</span>
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">vs {f.mtta.vsLastWeek} last week</div>
          </div>
        </div>
      </div>

      {/* Row 2 — Threat Feeds + Approvals */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Threat Feeds</div>
            <NavLink to="/threat-intel" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              View All <ExternalLink className="size-3" />
            </NavLink>
          </div>
          <div className="mt-3 divide-y divide-border">
            {threatFeedItems.map((item, i) => (
              <div key={i} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 text-sm font-medium leading-snug">{item.title}</div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{item.source}</span>
                    <span>·</span>
                    <span>{item.age}</span>
                    {item.tags.map(tag => (
                      <span key={tag} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground">
                  <ExternalLink className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Approvals {pendingApprovals.length > 0 && (
                <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive/15 px-1 text-[10px] font-semibold text-destructive">
                  {pendingApprovals.length}
                </span>
              )}
            </div>
            <NavLink to="/autonomy/approvals" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              View All <ExternalLink className="size-3" />
            </NavLink>
          </div>
          {pendingApprovals.length === 0 ? (
            <div className="mt-8 flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
              <Check className="size-8 rounded-full bg-emerald-500/10 p-1.5 text-emerald-500" />
              <p>All approvals handled</p>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {pendingApprovals.map((item, i) => (
                <div key={i} className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{item.action}</div>
                      <div className="mt-0.5 font-mono text-xs text-muted-foreground">{item.target}</div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-muted-foreground/50" />
                          {item.contextLabel}
                        </span>
                        <span className="font-mono">{item.ref}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 pt-0.5">
                      <span className={`flex items-center gap-1 font-mono text-xs tabular-nums ${item.urgent ? "text-amber-400" : "text-muted-foreground"}`}>
                        <Clock className="size-3" />
                        {item.timeLeft}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleApproval(i)}
                          className="grid size-6 place-items-center rounded border text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                          title="Reject"
                        >
                          <X className="size-3" />
                        </button>
                        <button
                          onClick={() => handleApproval(i)}
                          className="grid size-6 place-items-center rounded border text-muted-foreground transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-500"
                          title="Approve"
                        >
                          <Check className="size-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Investigation ── */}

      {/* Row 3 — Entities + Threat Intel chart */}
      <div className="grid gap-4 lg:grid-cols-3">

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Entities</div>
            <NavLink to="/entities" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              View All <ExternalLink className="size-3" />
            </NavLink>
          </div>

          <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
            <div className="text-3xl font-semibold tabular-nums tracking-tight">{entitiesStat.total.toLocaleString()}</div>
            <div className="flex items-center gap-3">
              {(["low","medium","elevated","high","critical"] as EntityRisk[]).map(r => (
                <div key={r} className="text-center">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{r}</div>
                  <div className="mt-0.5 text-sm font-semibold tabular-nums">
                    {entitiesStat[r as keyof typeof entitiesStat]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 flex h-4 overflow-hidden rounded-none">
            {ENTITY_BAR_ORDER.map(r => (
              <div
                key={r}
                style={{
                  width: `${(entitiesStat[r as keyof typeof entitiesStat] as number / ENTITIES_TOTAL) * 100}%`,
                  background: ENTITY_RISK_STYLE[r].bar,
                }}
              />
            ))}
          </div>

          <div className="mt-8 space-y-2">
            {entityList.map((e: EntityListItem) => (
              <div key={e.name} className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
                <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-xs font-semibold tabular-nums text-muted-foreground">
                  {e.count}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{e.name}</div>
                  <div className="text-xs text-muted-foreground">{e.kind}</div>
                </div>
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${ENTITY_RISK_STYLE[e.risk].badge}`}>
                  {e.risk}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col rounded-xl border bg-card p-5 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4 shrink-0">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Threat Intel</div>
              <div className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">{f.threatIntelStat.total}</div>
            </div>
            <div className="flex items-center gap-5 pt-1">
              {SEV_KEYS.map(k => (
                <div key={k} className="text-center">
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <span className="inline-block h-2 w-2 rounded-[2px]" style={{ background: SEV_COLORS[k] }} />
                    {k.replace("sev", "SEV")}
                  </div>
                  <div className="mt-0.5 text-sm font-semibold tabular-nums">{f.threatIntelStat[k]}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-col flex-1 min-h-0">
            <SevStackedBarChart data={f.threatIntelTimeSeries} />
          </div>
        </div>
      </div>

      {/* Row 4 — S3 Score histogram + Artifacts */}
      <div className="grid gap-4 lg:grid-cols-3">

        <div className="flex flex-col rounded-xl border bg-card p-5 lg:col-span-2" style={{ minHeight: 340 }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">S3 Score</div>
            </div>
            <div className="flex items-center gap-5">
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Median</div>
                <div className="mt-0.5 text-sm font-semibold tabular-nums">{s3Stat.median}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg</div>
                <div className="mt-0.5 text-sm font-semibold tabular-nums">{s3Stat.avg}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-destructive">P95</div>
                <div className="mt-0.5 text-sm font-semibold tabular-nums text-destructive">{s3Stat.p95}</div>
              </div>
            </div>
          </div>
          <S3Histogram />
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Artifacts</div>
            <NavLink to="/autonomy/artifacts" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              View All <ExternalLink className="size-3" />
            </NavLink>
          </div>
          <div className="mt-3 divide-y divide-border">
            {artifactList.map((a: ArtifactItem) => (
              <div key={a.value} className="py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 font-mono text-sm font-medium truncate">{a.value}</div>
                  <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {a.kind}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {a.incidents} Incidents&nbsp;·&nbsp;{a.cases} Cases&nbsp;·&nbsp;{a.intels} Intels
                  </div>
                  <span className="ml-3 shrink-0 text-sm font-semibold tabular-nums">{a.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Automation ── */}

      <div className="grid gap-4 lg:grid-cols-3">

        <div className="flex flex-col gap-4 lg:col-span-2">

          {/* Agent Activity */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Agent Activity</div>
                <div className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
                  {f.agentActivity.total.toLocaleString()}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                {AGENT_STAGE_KEYS.map(k => (
                  <div key={k} className="text-center">
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <span className="inline-block h-2 w-2" style={{ background: AGENT_STAGE_COLORS[k] }} />
                      {k.toUpperCase()}
                    </div>
                    <div className="mt-0.5 text-sm font-semibold tabular-nums">
                      {f.agentActivity[k].toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex h-4 overflow-hidden">
              {AGENT_STAGE_KEYS.map(k => {
                const total = AGENT_STAGE_KEYS.reduce((s, key) => s + f.agentActivity[key], 0)
                return (
                  <div
                    key={k}
                    style={{
                      width: `${(f.agentActivity[k] / total) * 100}%`,
                      background: AGENT_STAGE_COLORS[k],
                    }}
                  />
                )
              })}
            </div>
          </div>

          {/* Playbooks */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Playbooks</div>
              <NavLink to="/autonomy/playbooks" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                View All <ExternalLink className="size-3" />
              </NavLink>
            </div>
            <div className="mt-3 divide-y divide-border">
              {playbookRuns.map((run: PlaybookRun, i) => (
                <div key={i} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{run.name}</div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      {run.contextKind === "Case"
                        ? <Layers className="size-3 shrink-0" />
                        : <AlertTriangle className="size-3 shrink-0" />
                      }
                      <span>{run.contextKind}</span>
                      <span>·</span>
                      <span className="font-mono">{run.contextRef}</span>
                      <span>·</span>
                      <span>{run.duration}</span>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    run.status === "RUNNING"
                      ? "bg-amber-500/15 text-amber-400"
                      : run.status === "FAILED"
                      ? "bg-destructive/15 text-destructive"
                      : "bg-emerald-500/15 text-emerald-400"
                  }`}>
                    {run.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column — stat cards */}
        <div className="flex flex-col gap-4">

          {/* Failed Runs — up is bad */}
          <div className="flex-1 rounded-xl border bg-card p-5">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Failed Runs</div>
            <div className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">{f.failedRuns.count}</div>
            <div className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${trendClass(f.failedRuns.direction, "down")}`}>
              <span>{trendArrow(f.failedRuns.direction)}</span><span>{f.failedRuns.trend}</span>
            </div>
            <div className="mt-3 border-t pt-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Most failures</div>
              <div className="mt-1 text-sm font-medium">{f.failedRuns.mostFailures}</div>
            </div>
          </div>

          {/* Ingestion Health — static */}
          <div className="flex-1 rounded-xl border bg-card p-5">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Ingestion Health</div>
            <div className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">{ingestionHealthStat.value}</div>
            <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-destructive">
              <span>▼</span><span>{ingestionHealthStat.trend}</span>
            </div>
            <div className="mt-3 space-y-2 border-t pt-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active sources</span>
                <span className="font-medium tabular-nums">
                  {ingestionHealthStat.activeSources}/{ingestionHealthStat.totalSources}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last 24h ingests</span>
                <span className="font-medium">{ingestionHealthStat.lastDayIngests}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Degraded source</span>
                <span className="font-medium text-amber-400">{ingestionHealthStat.degradedSource}</span>
              </div>
            </div>
          </div>

          {/* Playbook Runs — up is good */}
          <div className="flex-1 rounded-xl border bg-card p-5">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Playbook Runs</div>
            <div className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">{f.playbookRuns.count}</div>
            <div className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${trendClass(f.playbookRuns.direction, "up")}`}>
              <span>{trendArrow(f.playbookRuns.direction)}</span><span>{f.playbookRuns.trend}</span>
            </div>
            <div className="mt-3 border-t pt-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Most run</div>
              <div className="mt-1 text-sm font-medium">{f.playbookRuns.mostRun}</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
