import {
  ArrowRight,
  Cable,
  GitBranch,
  Plus,
  Tag,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import { automationPipelines, type AutomationPipeline, type PipelineStageKind } from "@/data/admin-automation"
import { KpiCard, SectionLabel, ToneChip, type Tone } from "./admin-ui"

const stageIcon: Record<PipelineStageKind, LucideIcon> = {
  vendor: Cable,
  action: Zap,
  rule: GitBranch,
  family: Tag,
}

const statusTone: Record<AutomationPipeline["status"], Tone> = {
  active: "ok",
  paused: "warn",
  draft: "muted",
}

const statusLabel: Record<AutomationPipeline["status"], string> = {
  active: "Active",
  paused: "Paused",
  draft: "Draft",
}

/**
 * The SOAR integration config drawn as the pipeline it actually is —
 * vendor → application → action → ingestion rule → case family — instead
 * of six separate tabs a person has to reconstruct mentally. Same
 * building blocks the playbook builder already draws as a canvas; this is
 * the config-time view of the same idea.
 */
export function AdminAutomationPage() {
  const active = automationPipelines.filter((p) => p.status === "active")
  const totalVolume = automationPipelines.reduce((sum, p) => sum + p.volume24h, 0)
  const connectedApps = new Set(automationPipelines.flatMap((p) => p.stages[0]?.label)).size

  return (
    <div className="space-y-5">
      <PageHeader
        title="Automation"
        description="How alerts flow in and how SIRP acts on them — every integration, action and routing rule as one pipeline."
        actions={
          <Button size="sm" className="h-9">
            <Plus className="size-4" />
            New pipeline
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard icon={Workflow} label="Pipelines" value={automationPipelines.length} tone="info" />
        <KpiCard icon={Cable} label="Connected apps" value={connectedApps} tone="ok" />
        <KpiCard icon={Zap} label="Active pipelines" value={active.length} tone="ok" />
        <KpiCard
          icon={GitBranch}
          label="Alerts routed · 24h"
          value={totalVolume}
          caption="Across all pipelines"
        />
      </div>

      <div className="flex flex-col gap-3">
        {automationPipelines.map((pipeline) => (
          <PipelineCard key={pipeline.id} pipeline={pipeline} />
        ))}
      </div>
    </div>
  )
}

function PipelineCard({ pipeline }: { pipeline: AutomationPipeline }) {
  return (
    <Card className={cn(pipeline.status === "draft" && "border-dashed")}>
      <CardContent className="px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-semibold">{pipeline.name}</h3>
            <ToneChip tone={statusTone[pipeline.status]}>{statusLabel[pipeline.status]}</ToneChip>
          </div>
          {pipeline.status === "active" && (
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {pipeline.volume24h} alerts · 24h
            </span>
          )}
        </div>

        <div className="mt-4 flex items-stretch gap-0 overflow-x-auto pb-1">
          {pipeline.stages.map((stage, i) => {
            const Icon = stageIcon[stage.kind]
            return (
              <div key={i} className="flex shrink-0 items-stretch">
                <div className="flex min-w-40 flex-col gap-1 rounded-lg border bg-muted/20 px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <Icon className="size-3.5 shrink-0 text-primary" />
                    <SectionLabel>{stage.kind}</SectionLabel>
                  </div>
                  <div className="text-sm font-medium leading-tight">{stage.label}</div>
                  <div className="text-[11px] leading-snug text-muted-foreground">{stage.detail}</div>
                </div>
                {i < pipeline.stages.length - 1 && (
                  <div className="flex w-8 shrink-0 items-center justify-center">
                    <ArrowRight className="size-4 text-muted-foreground/50" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
