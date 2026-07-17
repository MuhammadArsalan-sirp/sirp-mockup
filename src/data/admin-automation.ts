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

export type AutomationPipeline = {
  id: string
  name: string
  status: PipelineStatus
  /** Alerts routed through this pipeline in the last 24h. */
  volume24h: number
  stages: PipelineStage[]
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
