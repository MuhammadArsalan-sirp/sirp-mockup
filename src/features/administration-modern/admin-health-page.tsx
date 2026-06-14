import { Activity, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import {
  healthIncidents,
  healthSubsystems,
  type HealthSubsystem,
} from "@/data/admin"
import {
  DataCard,
  Sparkline,
  StatusDot,
  ToneChip,
  type Tone,
} from "./admin-ui"

const statusTone: Record<HealthSubsystem["status"], Tone> = {
  ok: "ok", warn: "warn", err: "alert",
}

const statusLabel: Record<HealthSubsystem["status"], string> = {
  ok: "Healthy", warn: "Degraded", err: "Down",
}

const groupLabel: Record<HealthSubsystem["group"], string> = {
  core: "Core", data: "Data", ingest: "Ingestion", ai: "AI engines",
}

export function AdminHealthPage() {
  const counts = healthSubsystems.reduce(
    (acc, s) => { acc[s.status]++; return acc },
    { ok: 0, warn: 0, err: 0 } as Record<HealthSubsystem["status"], number>
  )
  const overall: HealthSubsystem["status"] =
    counts.err > 0 ? "err" : counts.warn > 0 ? "warn" : "ok"

  return (
    <div className="space-y-5">
      <PageHeader
        title="Service health"
        description="Live status of platform subsystems. Updates every 30 seconds."
        actions={
          <>
            <ToneChip tone={statusTone[overall]}>
              <StatusDot tone={statusTone[overall]} className="mr-1" />
              {overall === "ok" ? "All systems operational" : overall === "warn" ? "Degraded service" : "Service incident"}
            </ToneChip>
            <Button variant="outline" size="sm" className="h-9">
              <RefreshCw className="size-4 text-muted-foreground" />
              Refresh
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="px-0 py-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-2 font-medium">Subsystem</th>
                <th className="px-5 py-2 font-medium">Group</th>
                <th className="px-5 py-2 font-medium">Metric</th>
                <th className="px-5 py-2 font-medium">Trend</th>
                <th className="px-5 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {healthSubsystems.map((sub) => {
                const tone = statusTone[sub.status]
                return (
                  <tr key={sub.id}>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <StatusDot tone={tone} />
                        <div>
                          <div className="text-sm font-medium leading-tight">{sub.label}</div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">{sub.detail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-muted-foreground">{groupLabel[sub.group]}</td>
                    <td className="px-5 py-2.5 font-mono tabular-nums">{sub.metric}</td>
                    <td className="px-5 py-2.5">
                      {sub.spark && <Sparkline data={sub.spark} tone={tone} />}
                    </td>
                    <td className="px-5 py-2.5">
                      <ToneChip tone={tone}>{statusLabel[sub.status]}</ToneChip>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DataCard icon={Activity} title="Recent incidents" bodyPadding="none">
          <div className="divide-y text-sm">
            {healthIncidents.map((inc) => (
              <div key={inc.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{inc.title}</div>
                  <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{inc.time}</div>
                </div>
                <ToneChip tone={inc.severity === "warn" ? "warn" : "muted"}>{inc.durationMin} min</ToneChip>
              </div>
            ))}
          </div>
        </DataCard>

        <DataCard icon={Activity} title="Capacity headroom" bodyPadding="none">
          <div className="space-y-2 px-5 py-3">
            <Headroom label="API CPU"        used={42} note="58% headroom" />
            <Headroom label="Database disk"  used={41} note="59% headroom" />
            <Headroom label="Object storage" used={45} note="2.2 TB free" />
            <Headroom label="Ingest queue"   used={72} note="monitor"      tone="warn" />
            <Headroom label="LLM rate limit" used={28} note="2.5k req/min" />
          </div>
        </DataCard>
      </div>
    </div>
  )
}

function Headroom({
  label, used, note, tone = "ok",
}: { label: string; used: number; note: string; tone?: Tone }) {
  return (
    <div className="grid grid-cols-[130px_minmax(0,1fr)_auto] items-center gap-3 py-1">
      <span className="text-sm">{label}</span>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full",
            tone === "ok" && "bg-emerald-500",
            tone === "warn" && "bg-amber-500",
            tone === "alert" && "bg-destructive",
            tone === "info" && "bg-primary"
          )}
          style={{ width: `${used}%` }}
        />
      </div>
      <span className="font-mono text-[11px] text-muted-foreground">{note}</span>
    </div>
  )
}
