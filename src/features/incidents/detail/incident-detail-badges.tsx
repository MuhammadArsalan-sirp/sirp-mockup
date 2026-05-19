import { Badge } from "@/components/ui/badge"
import type { Incident, IncidentState, Severity } from "@/data/incidents"

export const severityTone: Record<Severity, string> = {
  critical: "var(--destructive)",
  high: "var(--attention)",
  medium: "var(--info)",
  low: "var(--muted-foreground)",
}

export function SeverityBadge({ value }: { value: Severity }) {
  const color = severityTone[value]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize"
      style={{
        background: `color-mix(in srgb, ${color} 14%, transparent)`,
        color,
      }}
    >
      <span className="size-1.5 rounded-full" style={{ background: color }} />
      {value}
    </span>
  )
}

export function StatusBadge({ value }: { value: Incident["status"] }) {
  if (value === "resolved" || value === "closed")
    return (
      <Badge
        variant="outline"
        className="rounded-full capitalize"
        style={{
          borderColor: "color-mix(in srgb, var(--success) 40%, transparent)",
          color: "var(--success)",
        }}
      >
        {value === "closed" ? "Closed" : "Resolved"}
      </Badge>
    )
  if (value === "waiting")
    return (
      <Badge
        variant="outline"
        className="rounded-full"
        style={{
          borderColor: "color-mix(in srgb, var(--attention) 40%, transparent)",
          color: "var(--attention)",
        }}
      >
        Waiting
      </Badge>
    )
  return (
    <Badge variant="outline" className="rounded-full capitalize">
      <span
        className="mr-1.5 size-1.5 rounded-full"
        style={{
          background:
            value === "open" ? "var(--muted-foreground)" : "var(--chart-2)",
        }}
      />
      {value.replace("-", " ")}
    </Badge>
  )
}

export const incidentStateLabel: Record<IncidentState, string> = {
  triage: "Triage",
  investigating: "Investigating",
  containment: "Containment",
  eradication: "Eradication",
  recovery: "Recovery",
  mitigated: "Mitigated",
  closed: "Closed",
}
