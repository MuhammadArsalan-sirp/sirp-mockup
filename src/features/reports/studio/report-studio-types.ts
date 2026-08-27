import type { ReportModule } from "@/data/reports"
import type { ReviewState } from "../ai/ai-types"

export type TlpClassification = "TLP:CLEAR" | "TLP:GREEN" | "TLP:AMBER" | "TLP:RED"

export type ChartKind = "line" | "bar" | "donut"
export type ChartDataset = "incidentsOverTime" | "mttrTrend" | "severity" | "disposition"
export type TableDataset = "topIOCs" | "openCases" | "slaByTeam"

/* ------------------------------------------------------------------ */
/* Per-block controls — the customization surface                      */
/* ------------------------------------------------------------------ */

/** Half-width blocks pair up side by side; full-width blocks always break the row. */
export type BlockWidth = "full" | "half"

/**
 * What data a block reads. Every field is optional: unset means "inherit the
 * report's setting," which is what keeps a 20-block report editable — change
 * the period once at the top and every block follows, unless it was pinned.
 */
export type BlockDataBinding = {
  module?: ReportModule
  savedSearchId?: string
  timeRange?: string
  groupBy?: string
  topN?: number
  compare?: "none" | "previous" | "year"
  /** Values at or above this are emphasized in the render. */
  threshold?: number
}

export type BlockStyle = {
  palette?: "brand" | "severity" | "mono"
  showLegend?: boolean
  showGrid?: boolean
  showValues?: boolean
  emphasis?: boolean
}

/** Anything the Co-Analyst touched carries this, so review mode can find it. */
export type BlockAi = {
  generated?: boolean
  review?: ReviewState
  tone?: "executive" | "technical"
  locale?: "en" | "ar"
}

export type StudioBlockBase = {
  id: string
  width?: BlockWidth
  data?: BlockDataBinding
  style?: BlockStyle
  ai?: BlockAi
}

/* ------------------------------------------------------------------ */
/* Block props                                                         */
/* ------------------------------------------------------------------ */

export type CoverProps = {
  title: string
  subtitle: string
  preparedFor: string
  classification: TlpClassification
}
export type HeadingProps = { text: string }
export type TextProps = { text: string; generated: boolean }
export type KpiProps = { title: string }
export type ChartProps = { title: string; chartType: ChartKind; dataset: ChartDataset }
export type TableProps = { title: string; dataset: TableDataset }
export type MitreProps = { title: string }
export type TimelineProps = { title: string }
export type EntitiesProps = { title: string }
export type PlaybooksProps = { title: string }
export type CalloutTone = "info" | "warning" | "success" | "alert"
export type CalloutProps = { title: string; text: string; tone: CalloutTone }
export type DividerProps = Record<string, never>
export type SpacerProps = { height: number }
export type PageBreakProps = Record<string, never>
/** Generated narrative — text lives in claims so each sentence keeps its evidence. */
export type ExecSummaryProps = { title: string; claimIds: string[]; overrideText?: string }
export type AnomaliesProps = { title: string; insightIds: string[] }
export type WhatChangedProps = { title: string; comparePeriod: string }

export type StudioBlock = StudioBlockBase &
  (
    | { type: "cover"; props: CoverProps }
    | { type: "heading"; props: HeadingProps }
    | { type: "text"; props: TextProps }
    | { type: "callout"; props: CalloutProps }
    | { type: "kpi"; props: KpiProps }
    | { type: "chart"; props: ChartProps }
    | { type: "table"; props: TableProps }
    | { type: "mitre"; props: MitreProps }
    | { type: "timeline"; props: TimelineProps }
    | { type: "entities"; props: EntitiesProps }
    | { type: "playbooks"; props: PlaybooksProps }
    | { type: "divider"; props: DividerProps }
    | { type: "spacer"; props: SpacerProps }
    | { type: "pageBreak"; props: PageBreakProps }
    | { type: "execSummary"; props: ExecSummaryProps }
    | { type: "anomalies"; props: AnomaliesProps }
    | { type: "whatChanged"; props: WhatChangedProps }
  )

export type StudioBlockType = StudioBlock["type"]

export const BLOCK_LABELS: Record<StudioBlockType, string> = {
  cover: "Cover",
  heading: "Section heading",
  text: "Text",
  callout: "Callout",
  kpi: "KPI row",
  chart: "Chart",
  table: "Table",
  mitre: "MITRE ATT&CK",
  timeline: "Incident timeline",
  entities: "Entities table",
  playbooks: "Playbook runs",
  divider: "Divider",
  spacer: "Spacer",
  pageBreak: "Page break",
  execSummary: "Executive summary",
  anomalies: "Anomalies",
  whatChanged: "What changed",
}

export const BLOCK_GROUPS: { label: string; types: StudioBlockType[] }[] = [
  { label: "Layout", types: ["cover", "heading", "text", "callout", "divider", "spacer", "pageBreak"] },
  { label: "Data", types: ["kpi", "chart", "table"] },
  { label: "Security", types: ["mitre", "timeline", "entities", "playbooks"] },
  { label: "Co-Analyst", types: ["execSummary", "anomalies", "whatChanged"] },
]

/** Blocks the Co-Analyst authors — they carry evidence and go through review. */
export const GENERATED_TYPES: StudioBlockType[] = ["execSummary", "anomalies", "whatChanged"]

/* ------------------------------------------------------------------ */
/* Document settings — page setup, branding, variables                 */
/* ------------------------------------------------------------------ */

export type PageSize = "A4" | "Letter"
export type PageOrientation = "portrait" | "landscape"
export type PageMargin = "narrow" | "normal" | "wide"

export type DocSettings = {
  pageSize: PageSize
  orientation: PageOrientation
  margin: PageMargin
  headerText: string
  footerText: string
  showPageNumbers: boolean
  repeatClassification: boolean
  logoText: string
  accent: string
  bodyFont: "sans" | "serif"
  timeRange: string
  module: ReportModule
  pageTarget: number
  variables: Record<string, string>
}

export const TIME_RANGES = ["Last 24 hours", "Last 7 days", "Last 30 days", "Last quarter"]

export const ACCENTS: { value: string; label: string }[] = [
  { value: "var(--primary)", label: "SIRP purple" },
  { value: "var(--info)", label: "Signal blue" },
  { value: "var(--success)", label: "Operational green" },
  { value: "var(--destructive)", label: "Alert red" },
]

export const MARGIN_PX: Record<PageMargin, number> = { narrow: 24, normal: 40, wide: 64 }

export function defaultDocSettings(): DocSettings {
  return {
    pageSize: "A4",
    orientation: "portrait",
    margin: "normal",
    headerText: "{{tenant}} · {{module}}",
    footerText: "Confidential — distribution restricted per {{classification}}",
    showPageNumbers: true,
    repeatClassification: true,
    logoText: "SIRP",
    accent: "var(--primary)",
    bodyFont: "sans",
    timeRange: "Last 7 days",
    module: "incident",
    pageTarget: 4,
    variables: {
      tenant: "Acme Corp SOC",
      period: "12–18 Aug 2026",
      module: "Incident Management",
      classification: "TLP:AMBER",
      severityFloor: "High",
    },
  }
}

/** Replaces `{{name}}` tokens. Unknown tokens stay visible on purpose — a
 *  silent blank in a board report is worse than an obvious placeholder. */
export function resolveVars(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => vars[key] ?? match)
}

/* ------------------------------------------------------------------ */
/* Block construction                                                  */
/* ------------------------------------------------------------------ */

function defaultPropsFor(type: StudioBlockType): StudioBlock["props"] {
  switch (type) {
    case "cover":
      return {
        title: "Untitled report",
        subtitle: "Add a one-line summary of what this report covers.",
        preparedFor: "{{tenant}}",
        classification: "TLP:AMBER",
      }
    case "heading":
      return { text: "Section heading" }
    case "text":
      return { text: "Click to write, or ask the Co-Analyst to draft this section from case data.", generated: false }
    case "kpi":
      return { title: "Key metrics" }
    case "chart":
      return { title: "Incidents over time", chartType: "line", dataset: "incidentsOverTime" }
    case "table":
      return { title: "Top indicators of compromise", dataset: "topIOCs" }
    case "mitre":
      return { title: "ATT&CK technique coverage" }
    case "timeline":
      return { title: "Response timeline" }
    case "entities":
      return { title: "Entities involved" }
    case "playbooks":
      return { title: "Playbook executions" }
    case "callout":
      return { title: "Note", text: "Add a callout to flag something important in this section.", tone: "info" }
    case "divider":
      return {}
    case "spacer":
      return { height: 28 }
    case "pageBreak":
      return {}
    case "execSummary":
      return { title: "Executive summary", claimIds: ["cl-1", "cl-2", "cl-3", "cl-4"] }
    case "anomalies":
      return { title: "Anomalies worth your attention", insightIds: ["in-1", "in-3"] }
    case "whatChanged":
      return { title: "What changed since last period", comparePeriod: "Previous 7 days" }
  }
}

export function createBlock(type: StudioBlockType): StudioBlock {
  const base: StudioBlockBase = { id: crypto.randomUUID(), width: "full" }
  if (GENERATED_TYPES.includes(type)) base.ai = { generated: true, review: "unreviewed" }
  return { ...base, type, props: defaultPropsFor(type) } as StudioBlock
}

/** Seeds a blank report — used by the "Build your own" entry point. */
export function blankBlocks(): StudioBlock[] {
  return [createBlock("cover")]
}

/**
 * Maps a `ReportTemplate`'s abstract widget catalog entries onto concrete
 * Studio blocks. Not a strict 1:1 — a few catalog widgets (the "kpi" type
 * ones especially) collapse onto shared blocks so the studio document reads
 * naturally rather than mirroring the catalog mechanically.
 */
export function blocksFromTemplateWidgets(
  widgetIds: string[],
  templateName: string,
  templateDescription: string
): StudioBlock[] {
  const blocks: StudioBlock[] = [
    {
      id: crypto.randomUUID(),
      width: "full",
      type: "cover",
      props: { title: templateName, subtitle: templateDescription, preparedFor: "{{tenant}}", classification: "TLP:AMBER" },
    },
    createBlock("execSummary"),
  ]

  let kpiAdded = false
  for (const widgetId of widgetIds) {
    const mapped = WIDGET_TO_BLOCK[widgetId]
    if (!mapped) continue
    if (mapped.type === "kpi") {
      if (kpiAdded) continue
      kpiAdded = true
    }
    blocks.push({ id: crypto.randomUUID(), width: "full", ...mapped } as StudioBlock)
  }

  const recommendations = createBlock("text")
  ;(recommendations.props as TextProps).text = RECOMMENDATIONS_DRAFT
  ;(recommendations.props as TextProps).generated = true
  recommendations.ai = { generated: true, review: "unreviewed" }

  blocks.push(
    { id: crypto.randomUUID(), width: "full", type: "heading", props: { text: "Recommendations" } },
    recommendations
  )

  return blocks
}

/** Builds a document from a Co-Analyst compose plan. */
export function blocksFromPlan(sections: { blockType: string; title: string; included: boolean }[]): StudioBlock[] {
  const blocks: StudioBlock[] = []
  for (const section of sections) {
    if (!section.included) continue
    const type = section.blockType as StudioBlockType
    if (!(type in BLOCK_LABELS)) continue
    const block = createBlock(type)
    const props = block.props as Record<string, unknown>

    if (type === "cover") {
      props.title = section.title === "Cover page" ? "{{tenant}} — {{module}} report" : section.title
      props.subtitle = "Covering {{period}}. Figures reflect case records at generation time."
    } else if (type === "text") {
      props.text = RECOMMENDATIONS_DRAFT
      props.generated = true
      block.ai = { generated: true, review: "unreviewed" }
    } else if ("title" in props) {
      props.title = section.title
    }

    // Charts read better paired two-up in a generated document.
    if (type === "chart") block.width = "half"

    blocks.push(block)
  }
  return blocks
}

export const SUMMARY_DRAFT =
  "During the reporting period, OmniSense correlated a rise in incident volume driven mainly by a credential-stuffing campaign against the VPN gateway. Open critical incidents remain under active investigation by the SOC. Mean time to respond improved as automated containment handled the majority of tier-1 triage, and no confirmed data exfiltration was observed."

export const RECOMMENDATIONS_DRAFT =
  "Prioritize rollout of conditional-access policies for the VPN and identity plane to close the gap exploited this period. Tune the detection rule that fired on repeated source ASNs to reduce duplicate alerting. Schedule a validation pass on the credential-access coverage highlighted in the ATT&CK map, and review aging critical cases at the next handover."

export const SCOPE_DRAFT =
  "This report covers all incidents raised against the selected module and time range. Figures are drawn from live case records, detection telemetry, and playbook execution logs, reflecting the state of investigations at generation time. Classification is applied per the organization's Traffic Light Protocol policy."

const WIDGET_TO_BLOCK: Record<string, Omit<StudioBlock, "id" | "width">> = {
  "w-1": { type: "chart", props: { title: "Incidents by Severity", chartType: "bar", dataset: "severity" } },
  "w-2": { type: "chart", props: { title: "MTTR Trend", chartType: "line", dataset: "mttrTrend" } },
  "w-3": { type: "chart", props: { title: "Disposition Breakdown", chartType: "donut", dataset: "disposition" } },
  "w-4": { type: "kpi", props: { title: "Key metrics" } },
  "w-5": { type: "kpi", props: { title: "Key metrics" } },
  "w-6": { type: "mitre", props: { title: "Top MITRE Techniques" } },
  "w-7": { type: "chart", props: { title: "Threat Intel Volume", chartType: "line", dataset: "incidentsOverTime" } },
  "w-8": { type: "table", props: { title: "Analyst Workload", dataset: "openCases" } },
  "w-9": { type: "chart", props: { title: "Risk Score Distribution", chartType: "bar", dataset: "severity" } },
  "w-10": { type: "kpi", props: { title: "Key metrics" } },
}
