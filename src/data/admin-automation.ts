/**
 * Fixture data for the Automation admin page — the SOAR integration
 * pipeline (vendor → application → action → ingestion rule → case family)
 * drawn as the single pipeline it actually is, instead of six separate
 * config tabs a person has to reconstruct mentally.
 */

export type PipelineStageKind = "vendor" | "action" | "rule" | "family"

export type PipelineStage = {
  kind: PipelineStageKind
  label: string
  detail: string
}

export type PipelineStatus = "active" | "paused" | "draft"

/** Mirrors the run-level legend: every node settles into exactly one of these. */
export type ExecutionNodeStatus =
  | "pending"
  | "running"
  | "completed"
  | "timed_out"
  | "failed"
  | "skipped"
  | "blocked_requires_approval"

export type ExecutionNode = {
  id: number
  /** 1-based — which column this node renders in. */
  level: number
  name: string
  durationLabel: string
  status: ExecutionNodeStatus
  critical?: boolean
}

export type PipelineExecution = {
  status: "completed" | "running" | "failed"
  summary: string
  steps: number
  levels: number
  wallTime: string
  timedOut: number
  cascadeSkipped: number
  criticalFailed: boolean
  longestStep: string
  nodes: ExecutionNode[]
}

export type AutomationPipeline = {
  id: string
  name: string
  status: PipelineStatus
  /** Alerts routed through this pipeline in the last 24h. */
  volume24h: number
  stages: PipelineStage[]
  /** Most recent run, rendered as an expandable execution DAG. Only active
   *  pipelines get one in this fixture — paused/draft have nothing to run. */
  lastRun?: PipelineExecution
}

export const automationPipelines: AutomationPipeline[] = [
  {
    id: "pipe_edr",
    name: "CrowdStrike containment",
    status: "active",
    volume24h: 34,
    stages: [
      { kind: "vendor", label: "CrowdStrike", detail: "Application · Falcon EDR" },
      { kind: "action", label: "Isolate host", detail: "in: host_id → out: status" },
      { kind: "rule", label: "Auto-link IOC", detail: "if hash matches open case" },
      { kind: "family", label: "Malware", detail: "→ routes to Tier 2 queue" },
    ],
    lastRun: {
      status: "completed",
      summary: "Every step settled cleanly",
      steps: 10,
      levels: 7,
      wallTime: "71s",
      timedOut: 0,
      cascadeSkipped: 0,
      criticalFailed: false,
      longestStep: "ioc_enrichment_v2 · 41s",
      nodes: [
        { id: 1, level: 1, name: "alert_normalizer", durationLabel: "741ms", status: "completed", critical: true },
        { id: 2, level: 2, name: "ppa_alert", durationLabel: "251ms", status: "completed", critical: true },
        { id: 3, level: 1, name: "entity_agent", durationLabel: "1.0s", status: "completed", critical: true },
        { id: 4, level: 3, name: "ioc_enrichment_v2", durationLabel: "41s", status: "completed", critical: true },
        { id: 5, level: 4, name: "classification", durationLabel: "1.9s", status: "completed", critical: true },
        { id: 6, level: 5, name: "analysis_summary", durationLabel: "13s", status: "completed" },
        { id: 7, level: 5, name: "alert_triage", durationLabel: "550ms", status: "completed" },
        { id: 8, level: 5, name: "assign_analyst", durationLabel: "1.3s", status: "completed" },
        { id: 9, level: 6, name: "remediation_summary", durationLabel: "13s", status: "completed" },
        { id: 10, level: 7, name: "alert_brief", durationLabel: "750ms", status: "completed" },
      ],
    },
  },
  {
    id: "pipe_okta_phish",
    name: "Okta phishing response",
    status: "active",
    volume24h: 11,
    stages: [
      { kind: "vendor", label: "Okta", detail: "Application · Identity Cloud" },
      { kind: "action", label: "Force password reset", detail: "in: user_id → out: status" },
      { kind: "rule", label: "Correlate by reporter", detail: "if 3+ reports in 1h" },
      { kind: "family", label: "Phishing", detail: "→ auto-assigned to Tier 1" },
    ],
    lastRun: {
      status: "completed",
      summary: "Password reset held for approval — everything else ran",
      steps: 5,
      levels: 3,
      wallTime: "8.4s",
      timedOut: 0,
      cascadeSkipped: 0,
      criticalFailed: false,
      longestStep: "correlate_reports · 3.1s",
      nodes: [
        { id: 1, level: 1, name: "alert_normalizer", durationLabel: "310ms", status: "completed" },
        { id: 2, level: 2, name: "correlate_reports", durationLabel: "3.1s", status: "completed", critical: true },
        { id: 3, level: 3, name: "force_password_reset", durationLabel: "—", status: "blocked_requires_approval", critical: true },
        { id: 4, level: 3, name: "notify_reporter", durationLabel: "420ms", status: "completed" },
        { id: 5, level: 3, name: "alert_brief", durationLabel: "180ms", status: "completed" },
      ],
    },
  },
  {
    id: "pipe_taxii",
    name: "TAXII threat feed intake",
    status: "active",
    volume24h: 212,
    stages: [
      { kind: "vendor", label: "AlienVault OTX", detail: "Application · TAXII 2.1 feed" },
      { kind: "action", label: "Pull indicators", detail: "poll · every 15 min" },
      { kind: "rule", label: "De-dupe against IOC store", detail: "skip if seen in 30d" },
      { kind: "family", label: "Threat Intel", detail: "→ published to advisory feed" },
    ],
    lastRun: {
      status: "running",
      summary: "Publishing indicators now",
      steps: 4,
      levels: 3,
      wallTime: "6.2s so far",
      timedOut: 0,
      cascadeSkipped: 1,
      criticalFailed: false,
      longestStep: "dedupe_check · 4.8s",
      nodes: [
        { id: 1, level: 1, name: "pull_indicators", durationLabel: "1.1s", status: "completed" },
        { id: 2, level: 2, name: "dedupe_check", durationLabel: "4.8s", status: "completed", critical: true },
        { id: 3, level: 2, name: "reseen_skip", durationLabel: "—", status: "skipped" },
        { id: 4, level: 3, name: "publish_advisory", durationLabel: "…", status: "running", critical: true },
      ],
    },
  },
  {
    id: "pipe_qualys",
    name: "Qualys scan ingestion",
    status: "paused",
    volume24h: 0,
    stages: [
      { kind: "vendor", label: "Qualys", detail: "Application · VMDR" },
      { kind: "action", label: "Import scan report", detail: "in: scan_id → out: findings[]" },
      { kind: "rule", label: "Severity ≥ High only", detail: "else drop silently" },
      { kind: "family", label: "Vulnerability", detail: "→ paused since Apr 2" },
    ],
  },
  {
    id: "pipe_slack_escalation",
    name: "Slack duty-manager page",
    status: "draft",
    volume24h: 0,
    stages: [
      { kind: "vendor", label: "Slack", detail: "Application · Incoming webhook" },
      { kind: "action", label: "Post to #soc-escalations", detail: "in: incident_id → out: message_ts" },
      { kind: "rule", label: "SLA breach imminent", detail: "≤ 15 min remaining" },
      { kind: "family", label: "Incident", detail: "→ not yet enabled" },
    ],
  },
]
