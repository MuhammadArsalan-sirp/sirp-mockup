import { useId, type ReactNode } from "react"
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts"
import { cn } from "@/lib/utils"

type Tone = "destructive" | "attention" | "success" | "info" | "muted"

const toneColor: Record<Tone, string> = {
  destructive: "var(--destructive)",
  attention:   "var(--attention)",
  success:     "var(--success)",
  info:        "var(--info)",
  muted:       "var(--muted-foreground)",
}

const toneCls: Record<Tone, { text: string; bg: string }> = {
  destructive: { text: "text-destructive", bg: "bg-destructive/10" },
  attention:   { text: "text-amber-500",   bg: "bg-amber-500/10" },
  success:     { text: "text-success",     bg: "bg-success/10" },
  info:        { text: "text-info",        bg: "bg-info/10" },
  muted:       { text: "text-muted-foreground", bg: "bg-muted" },
}

type Props = {
  label: string
  icon?: ReactNode
  value: ReactNode
  trend?: string
  trendTone?: Tone
  trendDirection?: "up" | "down"
  caption?: string
  series?: number[]
  sparkTone?: Tone
}

export function KpiCard({
  label,
  icon,
  value,
  trend,
  trendTone = "muted",
  trendDirection,
  caption,
  series,
  sparkTone,
}: Props) {
  const uid = useId()
  const sparkColor = toneColor[sparkTone ?? trendTone]
  const sparkData  = series?.map((v) => ({ v }))
  const trendCls   = toneCls[trendTone]

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-card">
      {/* ── Content ── */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        {/* Label row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            {icon && (
              <span className="size-3 shrink-0 [&>svg]:size-3">
                {icon}
              </span>
            )}
            {label}
          </div>

          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                trendCls.bg,
                trendCls.text
              )}
            >
              {trendDirection === "up"   && <ArrowUpRight   className="size-3" />}
              {trendDirection === "down" && <ArrowDownLeft  className="size-3" />}
              {trend}
            </span>
          )}
        </div>

        {/* Value */}
        <div className="text-2xl font-bold leading-none tabular-nums tracking-tight">
          {value}
        </div>

        {/* Caption */}
        {caption && (
          <p className="text-[11px] leading-relaxed text-muted-foreground">{caption}</p>
        )}
      </div>

      {/* ── Sparkline — full-width, flush to card bottom ── */}
      {sparkData && sparkData.length > 1 && (
        <div className="h-12 w-full border-t border-border/40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={sparkData}
              margin={{ top: 6, right: 0, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id={uid} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%"  stopColor={sparkColor} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={sparkColor} stopOpacity={0}   />
                </linearGradient>
              </defs>
              <Tooltip
                content={() => null}
                cursor={{ stroke: sparkColor, strokeWidth: 1, strokeDasharray: "3 3" }}
              />
              <Area
                type="monotone"
                dataKey="v"
                stroke={sparkColor}
                strokeWidth={1.5}
                fill={`url(#${uid})`}
                isAnimationActive={false}
                dot={false}
                activeDot={{ r: 3, fill: sparkColor, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
