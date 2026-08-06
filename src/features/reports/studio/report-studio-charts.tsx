import { useId } from "react"
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const tooltipStyle: React.CSSProperties = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  boxShadow: "0 6px 16px rgba(0,0,0,0.10)",
  padding: "8px 10px",
}
const C = { c1: "var(--chart-1)", c2: "var(--chart-2)", c3: "var(--chart-3)", c4: "var(--chart-4)", c5: "var(--chart-5)" } as const

type SeriesPoint = { label: string; value: number }
type SliceDatum = { label: string; value: number; color: string }

export function StudioLineChart({ data }: { data: SeriesPoint[] }) {
  const gradientId = `studio-line-fill-${useId()}`
  return (
    <div className="h-44">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={C.c2} stopOpacity={0.28} />
              <stop offset="100%" stopColor={C.c2} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={28} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area type="monotone" dataKey="value" stroke={C.c2} strokeWidth={1.75} fill={`url(#${gradientId})`} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export function StudioBarChart({ data }: { data: SeriesPoint[] }) {
  return (
    <div className="h-44">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={28} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)", opacity: 0.4 }} />
          <Bar dataKey="value" fill={C.c2} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function StudioDonutChart({ data }: { data: SliceDatum[] }) {
  return (
    <div className="flex h-44 items-center gap-5">
      <ResponsiveContainer width="55%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={46} outerRadius={64} paddingAngle={2} stroke="var(--card)" strokeWidth={2}>
            {data.map((entry) => (
              <Cell key={entry.label} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-1 flex-col gap-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-xs">
            <span className="size-2.5 shrink-0 rounded-sm" style={{ background: d.color }} />
            <span className="text-muted-foreground">{d.label}</span>
            <span className="ml-auto font-mono text-foreground">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
