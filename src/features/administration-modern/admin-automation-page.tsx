import { useState } from "react"
import {
  Cable,
  ChevronDown,
  GitBranch,
  Pause,
  Plus,
  Tag,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import { automationPipelines, type AutomationPipeline, type PipelineStageKind } from "@/data/admin-automation"
import { KpiCard, SectionLabel, ToneChip, type Tone } from "./admin-ui"
import { PipelineExecutionView } from "./admin-pipeline-execution"
import "./pipeline-flow.css"

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
  const [showRun, setShowRun] = useState(false)

  return (
    <Card className={cn(pipeline.status === "draft" && "border-dashed")}>
      <CardContent className="px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-semibold">{pipeline.name}</h3>
            <ToneChip tone={statusTone[pipeline.status]}>{statusLabel[pipeline.status]}</ToneChip>
          </div>
          <div className="flex items-center gap-3">
            {pipeline.status === "active" && (
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {pipeline.volume24h} alerts · 24h
              </span>
            )}
            {pipeline.lastRun && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
                onClick={() => setShowRun((v) => !v)}
              >
                {showRun ? "Hide" : "View"} last run
                <ChevronDown className={cn("size-3 transition-transform", showRun && "rotate-180")} />
              </Button>
            )}
          </div>
        </div>

        <div className={cn("mt-4 flex items-stretch gap-0 overflow-x-auto pb-1", pipeline.status === "draft" && "opacity-60")}>
          {pipeline.stages.map((stage, i) => {
            const Icon = stageIcon[stage.kind]
            return (
              <div key={i} className="flex shrink-0 items-stretch">
                <div className={cn("flex min-w-40 flex-col gap-1 rounded-lg border bg-muted/20 px-3 py-2.5", pipeline.status === "draft" && "border-dashed")}>
                  <div className="flex items-center gap-1.5">
                    <Icon className="size-3.5 shrink-0 text-primary" />
                    <SectionLabel>{stage.kind}</SectionLabel>
                  </div>
                  <div className="text-sm font-medium leading-tight">{stage.label}</div>
                  <div className="text-[11px] leading-snug text-muted-foreground">{stage.detail}</div>
                </div>
                {i < pipeline.stages.length - 1 && (
                  <PipelineConnector status={pipeline.status} />
                )}
              </div>
            )
          })}
        </div>

        {pipeline.lastRun && (
          <Collapsible open={showRun} onOpenChange={setShowRun}>
            <CollapsibleContent className="mt-4">
              <PipelineExecutionView execution={pipeline.lastRun} />
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * The gap between two pipeline stages — a live flowing-dot line for active
 * pipelines, a static dim line for paused ones, and a bare dashed gap for
 * drafts (nothing to flow yet).
 */
function PipelineConnector({ status }: { status: AutomationPipeline["status"] }) {
  if (status === "draft") {
    return (
      <div className="flex w-8 shrink-0 items-center justify-center">
        <div className="h-px w-full border-t border-dashed border-muted-foreground/30" />
      </div>
    )
  }
  if (status === "paused") {
    return (
      <div className="relative flex w-8 shrink-0 items-center justify-center">
        <div className="h-px w-full bg-muted-foreground/20" />
        <Pause className="absolute size-3 fill-current text-muted-foreground/50" />
      </div>
    )
  }
  return (
    <div className="relative flex w-8 shrink-0 items-center overflow-hidden">
      <div className="h-px w-full bg-emerald-500/25" />
      {[0, 0.6, 1.2].map((delay) => (
        <span
          key={delay}
          className="pipeline-flow-dot absolute size-1.5 rounded-full bg-emerald-500"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </div>
  )
}
