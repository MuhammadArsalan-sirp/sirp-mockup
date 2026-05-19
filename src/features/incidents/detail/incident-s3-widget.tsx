import { PieChart, Pie, Cell, Label, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"
import type { S3BreakdownRow } from "./incident-detail-mock"

const FACTOR_COLOR: Record<string, string> = {
  severity:           "#8e2dff",
  asset_criticality:  "#a78bfa",
  exploitability_now: "#f43f5e",
  blast_radius:       "#f97316",
}

function ringColor(score: number) {
  if (score >= 85) return "#f43f5e"
  if (score >= 70) return "#f97316"
  if (score >= 50) return "#f59e0b"
  return "#10b981"
}

function severityLabel(score: number) {
  if (score >= 85) return "Critical"
  if (score >= 70) return "High"
  if (score >= 50) return "Medium"
  return "Low"
}

type Props = {
  score: number
  breakdown: S3BreakdownRow[]
  label?: string
  className?: string
}

export function IncidentS3Widget({ score, breakdown, label = "S3 Risk Score", className }: Props) {
  const fill = ringColor(score)
  const maxVal = Math.max(...breakdown.map((r) => r.value), 1)

  const donutData = [
    { name: "score", value: score,       fill },
    { name: "rest",  value: 100 - score, fill: "rgba(148,163,184,0.12)" },
  ]

  return (
    <div className={cn("flex w-full flex-col", className)}>
      {/* Label */}
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/55">
        {label}
      </p>

      {/* Donut ring */}
      <div className="mx-auto h-32.5 w-full max-w-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={donutData}
              cx="50%"
              cy="50%"
              innerRadius={42}
              outerRadius={58}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
              cornerRadius={3}
            >
              {donutData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  const { cx, cy } = viewBox as { cx: number; cy: number }
                  return (
                    <text x={cx} y={cy} textAnchor="middle">
                      <tspan
                        x={cx}
                        y={cy - 2}
                        fill="var(--foreground)"
                        fontSize={26}
                        fontWeight={600}
                        dominantBaseline="auto"
                      >
                        {score}
                      </tspan>
                      <tspan
                        x={cx}
                        y={cy + 16}
                        fill="var(--muted-foreground)"
                        fontSize={9}
                        fontWeight={600}
                        letterSpacing="0.08em"
                        dominantBaseline="auto"
                      >
                        {severityLabel(score).toUpperCase()}
                      </tspan>
                    </text>
                  )
                }}
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Factor breakdown bars */}
      <div className="mt-1 space-y-2">
        {breakdown.map((row) => {
          const color = FACTOR_COLOR[row.id] ?? "#8e2dff"
          const pct   = Math.round((row.value / maxVal) * 100)
          return (
            <div key={row.id}>
              <div className="mb-1 flex items-center justify-between">
                <span className="truncate text-[10px] text-muted-foreground">{row.label}</span>
                <span className="font-mono text-[10px] font-bold tabular-nums">{row.value}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted/40">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}55` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
