import { AlertTriangle, ArrowDown, ArrowUp, CheckCircle2, Info, ShieldAlert, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { resolveVars, type StudioBlock } from "./report-studio-types"
import { AiBlockContent } from "./report-studio-ai-blocks"
import { ReportCover } from "./report-studio-cover"
import { StudioBarChart, StudioDonutChart, StudioLineChart } from "./report-studio-charts"
import {
  CALLOUT_TONE_CLASS,
  CRITICALITY_TONE,
  RUN_STATUS_TONE,
  SEVERITY_TONE,
  STUDIO_DISPOSITION,
  STUDIO_ENTITIES,
  STUDIO_INCIDENTS_OVER_TIME,
  STUDIO_KPIS,
  STUDIO_MITRE,
  STUDIO_MTTR_TREND,
  STUDIO_OPEN_CASES,
  STUDIO_PLAYBOOK_RUNS,
  STUDIO_SEVERITY,
  STUDIO_SLA_BY_TEAM,
  STUDIO_TIMELINE,
  STUDIO_TOP_IOCS,
} from "./report-studio-mock"

const CALLOUT_ICON = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  alert: ShieldAlert,
} as const

const CHART_DATASETS = {
  incidentsOverTime: STUDIO_INCIDENTS_OVER_TIME,
  mttrTrend: STUDIO_MTTR_TREND,
  severity: STUDIO_SEVERITY,
  disposition: STUDIO_DISPOSITION,
}

const KPI_DIR_TONE: Record<"up" | "down", string> = {
  up: "text-emerald-600 dark:text-emerald-400",
  down: "text-destructive",
}

function GeneratedTag() {
  return (
    <span className="mb-1.5 inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
      <Sparkles className="size-2.5" />
      Co-Analyst draft
    </span>
  )
}

export function StudioBlockContent({
  block,
  vars = {},
  pageAspect,
  coverContents,
}: {
  block: StudioBlock
  vars?: Record<string, string>
  /** CSS aspect-ratio of the paper, so the cover fills exactly one page. */
  pageAspect?: string
  /** Section titles the cover prints as its contents strip. */
  coverContents?: string[]
}) {
  switch (block.type) {
    case "cover":
      return <ReportCover props={block.props} vars={vars} aspect={pageAspect} contents={coverContents} />

    case "heading":
      return (
        <div className="flex items-center gap-2.5 py-1.5">
          <span className="h-5 w-1 shrink-0 rounded-full bg-primary" />
          <span className="text-lg font-semibold tracking-tight">{resolveVars(block.props.text, vars)}</span>
        </div>
      )
    case "text":
      return (
        <div className="py-1">
          {block.props.generated && <GeneratedTag />}
          <p
            dir={block.ai?.locale === "ar" ? "rtl" : undefined}
            className={cn(
              "max-w-[65ch] text-sm leading-relaxed text-muted-foreground",
              block.ai?.locale === "ar" && "text-right"
            )}
          >
            {resolveVars(block.props.text, vars)}
          </p>
        </div>
      )
    case "callout": {
      const Icon = CALLOUT_ICON[block.props.tone]
      return (
        <div className={cn("flex gap-2.5 rounded-lg border p-3.5", CALLOUT_TONE_CLASS[block.props.tone])}>
          <Icon className="mt-0.5 size-4 shrink-0" />
          <div>
            <div className="text-sm font-semibold">{resolveVars(block.props.title, vars)}</div>
            <p className="mt-0.5 text-xs leading-relaxed opacity-90">{resolveVars(block.props.text, vars)}</p>
          </div>
        </div>
      )
    }
    case "kpi":
      return (
        <div className="grid grid-cols-2 divide-x divide-border border-y py-1 sm:grid-cols-4">
          {STUDIO_KPIS.map((k) => (
            <div key={k.label} className="px-4 py-3">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{k.label}</div>
              <div className="mt-2 text-2xl font-medium tabular-nums leading-none tracking-tight">{k.value}</div>
              <div className={cn("mt-2 inline-flex items-center gap-1 text-[11px] font-mono", KPI_DIR_TONE[k.dir])}>
                {k.dir === "up" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                {k.delta}
              </div>
            </div>
          ))}
        </div>
      )
    case "chart": {
      const data = CHART_DATASETS[block.props.dataset]
      return (
        <div className="py-2">
          <div className="mb-3 border-b pb-1.5 text-[13px] font-medium tracking-tight">{resolveVars(block.props.title, vars)}</div>
          {block.props.chartType === "donut" ? (
            <StudioDonutChart data={data as { label: string; value: number; color: string }[]} />
          ) : block.props.chartType === "bar" ? (
            <StudioBarChart data={data} />
          ) : (
            <StudioLineChart data={data} />
          )}
        </div>
      )
    }
    case "table": {
      if (block.props.dataset === "slaByTeam")
        return <SlaByTeamTable title={resolveVars(block.props.title, vars)} threshold={block.data?.threshold} />
      const isCases = block.props.dataset === "openCases"
      return (
        <div className="py-2">
          <div className="mb-3 border-b pb-1.5 text-[13px] font-medium tracking-tight">{resolveVars(block.props.title, vars)}</div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {isCases ? (
                  <>
                    <th className="pb-2 pr-2">Case</th>
                    <th className="pb-2 pr-2">Title</th>
                    <th className="pb-2 pr-2">Owner</th>
                    <th className="pb-2 pr-2">Severity</th>
                    <th className="pb-2">Age</th>
                  </>
                ) : (
                  <>
                    <th className="pb-2 pr-2">Indicator</th>
                    <th className="pb-2 pr-2">Type</th>
                    <th className="pb-2 pr-2">Hits</th>
                    <th className="pb-2">Severity</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {isCases
                ? STUDIO_OPEN_CASES.map((r) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2 pr-2 font-mono">{r.id}</td>
                      <td className="py-2 pr-2">{r.title}</td>
                      <td className="py-2 pr-2 text-muted-foreground">{r.owner.name}</td>
                      <td className="py-2 pr-2">
                        <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize", SEVERITY_TONE[r.sev])}>{r.sev}</span>
                      </td>
                      <td className="py-2 font-mono text-muted-foreground">{r.age}</td>
                    </tr>
                  ))
                : STUDIO_TOP_IOCS.map((r) => (
                    <tr key={r.ioc} className="border-b last:border-0">
                      <td className="py-2 pr-2 font-mono">{r.ioc}</td>
                      <td className="py-2 pr-2 text-muted-foreground">{r.type}</td>
                      <td className="py-2 pr-2 font-mono">{r.hits}</td>
                      <td className="py-2">
                        <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize", SEVERITY_TONE[r.sev])}>{r.sev}</span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )
    }
    case "mitre":
      return (
        <div className="py-2">
          <div className="mb-3 border-b pb-1.5 text-[13px] font-medium tracking-tight">{resolveVars(block.props.title, vars)}</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {STUDIO_MITRE.map((m) => (
              <div key={m.id} className="rounded-md border bg-muted/40 p-2 text-center">
                <div className="font-mono text-[9.5px] text-muted-foreground">{m.id}</div>
                <div className="my-1.5 flex h-6.5 items-center justify-center text-[10.5px] font-medium leading-tight">{m.name}</div>
                <div className="mb-1.5 h-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${m.pct}%` }} />
                </div>
                <div className="font-mono text-xs font-semibold">{m.n}</div>
              </div>
            ))}
          </div>
        </div>
      )
    case "timeline":
      return (
        <div className="py-2">
          <div className="mb-3 border-b pb-1.5 text-[13px] font-medium tracking-tight">{resolveVars(block.props.title, vars)}</div>
          <div className="space-y-4 border-l pl-4">
            {STUDIO_TIMELINE.map((t) => (
              <div key={t.time} className="relative">
                <span
                  className={cn(
                    "absolute top-1 -left-[21px] size-2.5 rounded-full ring-4 ring-card",
                    t.sev === "crit" ? "bg-destructive" : t.sev === "high" ? "bg-amber-500" : t.sev === "med" ? "bg-yellow-400" : "bg-primary"
                  )}
                />
                <div className="font-mono text-[11px] text-muted-foreground">{t.time}</div>
                <div className="mt-0.5 text-[13px] font-medium">{t.title}</div>
                <div className="mt-0.5 max-w-[56ch] text-xs text-muted-foreground">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )
    case "entities":
      return (
        <div className="py-2">
          <div className="mb-3 border-b pb-1.5 text-[13px] font-medium tracking-tight">{resolveVars(block.props.title, vars)}</div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 pr-2">Entity</th>
                <th className="pb-2 pr-2">Type</th>
                <th className="pb-2 pr-2">Criticality</th>
                <th className="pb-2 pr-2">S3 score</th>
                <th className="pb-2">Owner</th>
              </tr>
            </thead>
            <tbody>
              {STUDIO_ENTITIES.map((e) => (
                <tr key={e.id} className="border-b last:border-0">
                  <td className="py-2 pr-2 font-medium">{e.name}</td>
                  <td className="py-2 pr-2 text-muted-foreground">{e.type}</td>
                  <td className="py-2 pr-2">
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize", CRITICALITY_TONE[e.criticality])}>{e.criticality}</span>
                  </td>
                  <td className="py-2 pr-2 font-mono">{e.s3Score}</td>
                  <td className="py-2 text-muted-foreground">{e.owner?.name ?? "Unassigned"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case "playbooks":
      return (
        <div className="py-2">
          <div className="mb-3 border-b pb-1.5 text-[13px] font-medium tracking-tight">{resolveVars(block.props.title, vars)}</div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 pr-2">Playbook</th>
                <th className="pb-2 pr-2">Target</th>
                <th className="pb-2 pr-2">Trigger</th>
                <th className="pb-2 pr-2">Duration</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {STUDIO_PLAYBOOK_RUNS.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="py-2 pr-2 font-medium">{r.name}</td>
                  <td className="py-2 pr-2 font-mono text-muted-foreground">{r.container.id}</td>
                  <td className="py-2 pr-2 text-muted-foreground">{r.trigger}</td>
                  <td className="py-2 pr-2 font-mono">{r.duration}</td>
                  <td className="py-2">
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize", RUN_STATUS_TONE[r.status])}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case "divider":
      return <div className="my-1 h-px bg-border" />
    case "spacer":
      return <div style={{ height: block.props.height }} />
    default:
      return <AiBlockContent block={block} vars={vars} />
  }
}

/**
 * SLA attainment per team — the one table an auditor always asks for. Rows at
 * or below the block's threshold are called out rather than left to be spotted.
 */
function SlaByTeamTable({ title, threshold }: { title: string; threshold?: number }) {
  const floor = threshold ?? 90
  return (
    <div className="py-2">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium">{title}</div>
        <span className="font-mono text-[10px] text-muted-foreground">target {floor}%</span>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <th className="pb-2 pr-2">Team</th>
            <th className="pb-2 pr-2 text-right">Incidents</th>
            <th className="pb-2 pr-2 text-right">Breaches</th>
            <th className="pb-2 text-right">Attainment</th>
          </tr>
        </thead>
        <tbody>
          {STUDIO_SLA_BY_TEAM.map((row) => {
            const under = row.attainment < floor
            return (
              <tr key={row.team} className="border-b last:border-0">
                <td className="py-2 pr-2 font-medium">{row.team}</td>
                <td className="py-2 pr-2 text-right font-mono tabular-nums">{row.incidents}</td>
                <td className="py-2 pr-2 text-right font-mono tabular-nums">{row.breaches}</td>
                <td className={cn("py-2 text-right font-mono tabular-nums", under && "text-amber-600 dark:text-amber-400")}>
                  {row.attainment.toFixed(1)}%
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
