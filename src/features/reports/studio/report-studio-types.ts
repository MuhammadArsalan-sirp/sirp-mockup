export type TlpClassification = "TLP:CLEAR" | "TLP:GREEN" | "TLP:AMBER" | "TLP:RED"

export type ChartKind = "line" | "bar" | "donut"
export type ChartDataset = "incidentsOverTime" | "mttrTrend" | "severity" | "disposition"
export type TableDataset = "topIOCs" | "openCases"

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

export type StudioBlock =
  | { id: string; type: "cover"; props: CoverProps }
  | { id: string; type: "heading"; props: HeadingProps }
  | { id: string; type: "text"; props: TextProps }
  | { id: string; type: "callout"; props: CalloutProps }
  | { id: string; type: "kpi"; props: KpiProps }
  | { id: string; type: "chart"; props: ChartProps }
  | { id: string; type: "table"; props: TableProps }
  | { id: string; type: "mitre"; props: MitreProps }
  | { id: string; type: "timeline"; props: TimelineProps }
  | { id: string; type: "entities"; props: EntitiesProps }
  | { id: string; type: "playbooks"; props: PlaybooksProps }
  | { id: string; type: "divider"; props: DividerProps }
  | { id: string; type: "spacer"; props: SpacerProps }

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
}

export const BLOCK_GROUPS: { label: string; types: StudioBlockType[] }[] = [
  { label: "Layout", types: ["cover", "heading", "text", "callout", "divider", "spacer"] },
  { label: "Data", types: ["kpi", "chart", "table"] },
  { label: "Security", types: ["mitre", "timeline", "entities", "playbooks"] },
]

function defaultPropsFor(type: StudioBlockType): StudioBlock["props"] {
  switch (type) {
    case "cover":
      return {
        title: "Untitled report",
        subtitle: "Add a one-line summary of what this report covers.",
        preparedFor: "Acme Corp SOC",
        classification: "TLP:AMBER",
      }
    case "heading":
      return { text: "Section heading" }
    case "text":
      return { text: "Click to write, or use Draft with SARA to generate this section from case data.", generated: false }
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
  }
}

export function createBlock(type: StudioBlockType): StudioBlock {
  return { id: crypto.randomUUID(), type, props: defaultPropsFor(type) } as StudioBlock
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
    { id: crypto.randomUUID(), type: "cover", props: { title: templateName, subtitle: templateDescription, preparedFor: "Acme Corp SOC", classification: "TLP:AMBER" } },
    { id: crypto.randomUUID(), type: "heading", props: { text: "Executive summary" } },
    { id: crypto.randomUUID(), type: "text", props: { text: SUMMARY_DRAFT, generated: true } },
  ]

  let kpiAdded = false
  for (const widgetId of widgetIds) {
    const mapped = WIDGET_TO_BLOCK[widgetId]
    if (!mapped) continue
    if (mapped.type === "kpi") {
      if (kpiAdded) continue
      kpiAdded = true
    }
    blocks.push({ id: crypto.randomUUID(), ...mapped } as StudioBlock)
  }

  blocks.push(
    { id: crypto.randomUUID(), type: "heading", props: { text: "Recommendations" } },
    { id: crypto.randomUUID(), type: "text", props: { text: RECOMMENDATIONS_DRAFT, generated: true } }
  )

  return blocks
}

export const SUMMARY_DRAFT =
  "During the reporting period, OmniSense correlated a rise in incident volume driven mainly by a credential-stuffing campaign against the VPN gateway. Open critical incidents remain under active investigation by the SOC. Mean time to respond improved as automated containment handled the majority of tier-1 triage, and no confirmed data exfiltration was observed."

export const RECOMMENDATIONS_DRAFT =
  "Prioritize rollout of conditional-access policies for the VPN and identity plane to close the gap exploited this period. Tune the detection rule that fired on repeated source ASNs to reduce duplicate alerting. Schedule a validation pass on the credential-access coverage highlighted in the ATT&CK map, and review aging critical cases at the next handover."

export const SCOPE_DRAFT =
  "This report covers all incidents raised against the selected module and time range. Figures are drawn from live case records, detection telemetry, and playbook execution logs, reflecting the state of investigations at generation time. Classification is applied per the organization's Traffic Light Protocol policy."

const WIDGET_TO_BLOCK: Record<string, Omit<StudioBlock, "id">> = {
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
