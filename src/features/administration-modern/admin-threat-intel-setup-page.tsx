import {
  AlertCircle,
  CheckCircle2,
  Download,
  Pause,
  PlayCircle,
  Plus,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import {
  tiFeeds,
  tiTaxonomies,
  type TiFeed,
} from "@/data/admin"
import {
  DataCard,
  StatusDot,
  ToneChip,
  ToggleRow,
  type Tone,
} from "./admin-ui"

const statusTone: Record<TiFeed["status"], Tone> = {
  active: "ok", error: "alert", paused: "muted",
}

const statusLabel: Record<TiFeed["status"], string> = {
  active: "Active", error: "Error", paused: "Paused",
}

const statusIcon: Record<TiFeed["status"], LucideIcon> = {
  active: CheckCircle2, error: AlertCircle, paused: Pause,
}

export function AdminThreatIntelSetupPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Threat intel setup"
        description="Manage TI feeds, polling cadence, and entity taxonomy. New IOCs are routed to enrichment and auto-correlation."
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9">
              <Download className="size-4 text-muted-foreground" />
              Export catalogue
            </Button>
            <Button size="sm" className="h-9">
              <Plus className="size-4" />
              Add feed
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="px-0 py-0">
          <div className="border-b px-5 py-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Feeds
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-2 font-medium">Feed</th>
                  <th className="px-5 py-2 font-medium">Vendor</th>
                  <th className="px-5 py-2 font-medium">Protocol</th>
                  <th className="px-5 py-2 font-medium">Poll</th>
                  <th className="px-5 py-2 font-medium">Last sync</th>
                  <th className="px-5 py-2 font-medium text-right">IOCs · 30d</th>
                  <th className="px-5 py-2 font-medium">Confidence</th>
                  <th className="px-5 py-2 font-medium">Status</th>
                  <th className="w-10 px-5 py-2 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {tiFeeds.map((f) => {
                  const Icon = statusIcon[f.status]
                  const tone = statusTone[f.status]
                  return (
                    <tr key={f.id} className="hover:bg-accent/40">
                      <td className="px-5 py-2.5 font-medium">{f.name}</td>
                      <td className="px-5 py-2.5 text-muted-foreground">{f.vendor}</td>
                      <td className="px-5 py-2.5">
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">{f.protocol}</code>
                      </td>
                      <td className="px-5 py-2.5 text-muted-foreground">{f.pollInterval}</td>
                      <td className="px-5 py-2.5 font-mono text-[12px] text-muted-foreground">{f.lastSync}</td>
                      <td className="px-5 py-2.5 text-right font-mono tabular-nums">{f.iocs30d.toLocaleString()}</td>
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                f.confidence >= 85 ? "bg-emerald-500"
                                : f.confidence >= 70 ? "bg-primary"
                                : "bg-amber-500"
                              )}
                              style={{ width: `${f.confidence}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{f.confidence}</span>
                        </div>
                      </td>
                      <td className="px-5 py-2.5">
                        <ToneChip tone={tone}>
                          <Icon className="size-3" />
                          {statusLabel[f.status]}
                        </ToneChip>
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <Button variant="ghost" size="icon-sm" title={f.status === "paused" ? "Resume" : "Pause"}>
                          {f.status === "paused" ? <PlayCircle className="size-3.5" /> : <Pause className="size-3.5" />}
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <DataCard icon={CheckCircle2} title="Entity taxonomy" bodyPadding="none">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-2 font-medium">Taxonomy</th>
              <th className="px-5 py-2 font-medium">Description</th>
              <th className="px-5 py-2 font-medium text-right">Count</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tiTaxonomies.map((tx) => (
              <tr key={tx.id}>
                <td className="px-5 py-2.5 font-medium">{tx.label}</td>
                <td className="px-5 py-2.5 text-muted-foreground">{tx.description}</td>
                <td className="px-5 py-2.5 text-right font-mono tabular-nums">{tx.count.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataCard>

      <DataCard icon={CheckCircle2} title="Auto-correlation rules">
        <div className="space-y-1">
          {[
            { label: "Match IOCs against active incidents in last 90 days",     enabled: true,  detail: "Sweeps every 5 min" },
            { label: "Auto-promote KSA-CERT advisories to bulletins",            enabled: true,  detail: "Confidence ≥ 90" },
            { label: "Quarantine community-contributed IOCs below 60 confidence", enabled: true,  detail: "Hold for analyst review" },
            { label: "Pull CISA KEV catalogue into Vulnerability backlog",        enabled: false, detail: "Feed disabled" },
          ].map((r) => (
            <ToggleRow
              key={r.label}
              label={r.label}
              description={r.detail}
              enabled={r.enabled}
              badge={<StatusDot tone={r.enabled ? "ok" : "muted"} />}
            />
          ))}
        </div>
      </DataCard>
    </div>
  )
}
