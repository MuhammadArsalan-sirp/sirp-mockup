import { useState } from "react"
import { Ban, FilePlus2, ListOrdered, Link2, MoreHorizontal, Plus, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import {
  preIngestionRules,
  preIngestionActionMeta,
  type PreIngestionAction,
  type PreIngestionRule,
} from "@/data/admin-preingestion"
import { KpiCard, ToneChip, type Tone } from "./admin-ui"
import "./rule-cascade.css"

const actionIcon: Record<PreIngestionAction, LucideIcon> = {
  link_and_update: Link2,
  create_new: FilePlus2,
  discard: Ban,
}

const actionTone: Record<PreIngestionAction, Tone> = {
  link_and_update: "info",
  create_new: "ok",
  discard: "muted",
}

/**
 * The one piece of the old Automation chain that's actually live —
 * Vendor/Application/Actions upstream of this are still disabled. Rules
 * evaluate top to bottom (lowest order first, first match wins), drawn as
 * a priority cascade instead of a flat table so that order reads as the
 * fact it is, not just another column to scan.
 */
export function AdminPreIngestionRulesPage() {
  const [rules, setRules] = useState(preIngestionRules)
  const sorted = [...rules].sort((a, b) => a.ruleOrder - b.ruleOrder || a.id - b.id)
  const enabledCount = rules.filter((r) => r.enabled).length

  const toggle = (id: number) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)))
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pre-Ingestion Rules"
        description="Decide what happens to an incoming alert before it becomes a case — evaluated top to bottom, first match wins."
        actions={
          <Button size="sm" className="h-9">
            <Plus className="size-4" />
            New rule
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard icon={ListOrdered} label="Total rules" value={rules.length} tone="info" />
        <KpiCard icon={Link2} label="Enabled" value={enabledCount} tone="ok" />
        <KpiCard icon={Ban} label="Disabled" value={rules.length - enabledCount} />
        <KpiCard icon={FilePlus2} label="Evaluated first" value={sorted[0]?.name ?? "—"} />
      </div>

      <div className="relative">
        <div className="absolute top-6 bottom-6 left-6 w-px bg-border" aria-hidden />
        <div className="flex flex-col gap-3">
          {sorted.map((rule, i) => (
            <RuleRow key={rule.id} rule={rule} index={i} onToggle={() => toggle(rule.id)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function RuleRow({
  rule,
  index,
  onToggle,
}: {
  rule: PreIngestionRule
  index: number
  onToggle: () => void
}) {
  const Icon = actionIcon[rule.action]

  return (
    <div
      className="rule-cascade-item flex items-start gap-4"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div
        className={cn(
          "relative z-10 grid size-12 shrink-0 place-items-center rounded-full font-mono text-sm font-semibold text-white shadow-sm",
          rule.enabled ? "bg-linear-to-br from-primary to-chart-3" : "bg-muted-foreground/40"
        )}
      >
        {index + 1}
      </div>

      <Card className={cn("flex-1", !rule.enabled && "opacity-60")}>
        <CardContent className="px-4 py-3.5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">{rule.name}</h3>
                <ToneChip tone={actionTone[rule.action]} icon={Icon}>
                  {preIngestionActionMeta[rule.action].label}
                </ToneChip>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{rule.description}</p>
              <p className="mt-1.5 font-mono text-[11px] text-muted-foreground/70">
                #{rule.id} · created {rule.createdAt}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Switch checked={rule.enabled} onCheckedChange={onToggle} aria-label="Enable rule" />
              <Button variant="ghost" size="icon-sm" aria-label="More">
                <MoreHorizontal className="size-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
