import { incidents, type Incident } from "@/data/incidents"

export type TimelineKind = "system" | "user" | "integration" | "playbook"

export type TimelineRow = {
  id: string
  when: string
  kind: TimelineKind
  title: string
  body?: string
}

export type OmniSenseBlock = {
  situation: string
  evidence: { label: string; ref: string }[]
  nextSteps: { label: string; hint?: string }[]
  gaps: string[]
  analyzedAt: string
  confidencePct: number
  headline: string
}

export type AgentStatus = "done" | "running" | "queued" | "skipped" | "failed"

export type AgentRun = {
  id: string
  name: string
  stage: "Triage" | "Analysis" | "Recovery"
  description: string
  status: AgentStatus
  duration?: string
  findings?: string
  progress?: number
}

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }

export function buildAgentRuns(inc: Incident): AgentRun[] {
  const s = inc.state
  const confidencePct = Math.round(inc.aiConfidence * 100)
  const malicious     = Math.ceil(inc.iocs * 0.6)
  const suspicious    = Math.ceil(inc.iocs * 0.2)
  const triageDone    = s !== "triage"
  const analysisDone  = s === "containment" || s === "eradication" || s === "recovery" || s === "mitigated" || s === "closed"
  const recoveryDone  = s === "mitigated" || s === "closed"
  const inTriage      = s === "triage"
  const inAnalysis    = s === "investigating"
  const inRecovery    = s === "eradication" || s === "recovery"

  return [
    // ── Triage ────────────────────────────────────────────────────────────
    {
      id: "a1",
      name: "Classification Agent",
      stage: "Triage",
      description: "Classifies severity, category and priority using incident context and historical patterns",
      status: triageDone ? "done" : inTriage ? "running" : "queued",
      duration: triageDone ? "0m 48s" : undefined,
      // What it did: applied severity + category + priority classification
      findings: triageDone
        ? `${cap(inc.severity)} severity · ${inc.category} · ${inc.priority} — classification applied`
        : undefined,
      progress: inTriage ? 65 : undefined,
    },
    {
      id: "a2",
      name: "Enrichment Agent",
      stage: "Triage",
      description: "Enriches IOCs and artifacts against VirusTotal, AbuseIPDB, ThreatFox and other intel feeds",
      status: triageDone ? "done" : "queued",
      duration: triageDone ? "2m 14s" : undefined,
      // What it did: IOC enrichment verdict
      findings: triageDone
        ? `${inc.iocs} IOCs enriched — ${malicious} malicious · ${suspicious} suspicious · ${inc.iocs - malicious - suspicious} clean`
        : undefined,
    },
    // ── Analysis ──────────────────────────────────────────────────────────
    {
      id: "a3",
      name: "Analysis Agent",
      stage: "Analysis",
      description: "Reads full incident context and generates situation narrative, key findings and confidence score",
      status: analysisDone ? "done" : inAnalysis ? "running" : "queued",
      duration: analysisDone ? "1m 32s" : undefined,
      // What it did: full analysis with confidence
      findings: analysisDone
        ? `${confidencePct}% confidence — situation narrative generated, lateral movement detected`
        : undefined,
      progress: inAnalysis ? 40 : undefined,
    },
    {
      id: "a4",
      name: "Actions Agent",
      stage: "Analysis",
      description: "Generates specific response actions and workflow tasks based on the analysis and IOC context",
      status: analysisDone ? "done" : "queued",
      duration: analysisDone ? "0m 55s" : undefined,
      // What it did: recommended workflow actions
      findings: analysisDone
        ? "3 response actions generated — isolate host, block IPs, reset credentials"
        : undefined,
    },
    {
      id: "a5",
      name: "Header Analysis Agent",
      stage: "Analysis",
      description: "Parses email headers and file artifacts to detect phishing indicators and authentication failures",
      status: "skipped",
    },
    // ── Recovery ──────────────────────────────────────────────────────────
    {
      id: "a6",
      name: "Suggest Playbook Agent",
      stage: "Recovery",
      description: "Matches incident profile against playbook library to identify the most relevant response procedures",
      status: recoveryDone ? "done" : inRecovery ? "running" : "queued",
      duration: recoveryDone ? "0m 38s" : undefined,
      // What it did: playbook suggestions
      findings: recoveryDone
        ? `"${inc.category} Response" and "Endpoint Isolation" playbooks recommended`
        : undefined,
      progress: inRecovery ? 60 : undefined,
    },
    {
      id: "a7",
      name: "Assign Case Agent",
      stage: "Recovery",
      description: "Evaluates analyst expertise, workload and availability to recommend the best case owner",
      status: recoveryDone ? "done" : "queued",
      duration: recoveryDone ? "0m 12s" : undefined,
      // What it did: analyst assignment
      findings: recoveryDone
        ? (inc.assignee ? `Assigned to ${inc.assignee.name} — ${inc.category.split(" ")[0]} specialist` : "Auto-assigned based on expertise match")
        : undefined,
    },
    {
      id: "a8",
      name: "Remediation Agent",
      stage: "Recovery",
      description: "Generates a step-by-step remediation and recovery plan using past case patterns and best practices",
      status: recoveryDone ? "done" : "queued",
      duration: recoveryDone ? "1m 18s" : undefined,
      // What it did: remediation plan
      findings: recoveryDone
        ? "5-step remediation plan — containment → eradication → recovery, est. 4–6 h"
        : undefined,
    },
  ]
}

export type ArtifactType =
  | "ip"
  | "domain"
  | "url"
  | "hash-md5"
  | "hash-sha1"
  | "hash-sha256"
  | "email"
  | "port"
  | "file"
  | "filename"
  | "user"
  | "registry"

export type ArtifactVerdict = "malicious" | "suspicious" | "clean" | "unknown"

export type EnrichmentApp =
  | "virustotal"
  | "abuseipdb"
  | "threatfox"
  | "shodan"
  | "mandiant"
  | "alienvault"
  | "urlscan"
  | "hybridanalysis"

export type EnrichmentResult = {
  app: EnrichmentApp
  status: "malicious" | "suspicious" | "clean" | "pending"
  summary: string
  ranAt: string
}

export type ArtifactRow = {
  id: string
  value: string
  type: ArtifactType
  verdict: ArtifactVerdict
  addedBy: import("@/data/users").UserRef | { id: "omnisense"; name: "OmniSense"; initials: "OS"; gradient: string; photo?: string }
  addedAt: string
  source: string
  enrichments: EnrichmentResult[]
  notes?: string
  /** Legacy display name kept for any callers still showing a filename. */
  name: string
  /** Legacy field for type label compatibility. */
  typeLabel: string
  /** Legacy alias for when. */
  when: string
}

export type EntityRow = {
  id: string
  name: string
  type: string
  signal: string
  risk: "critical" | "high" | "medium" | "low"
  ip?: string
  lastSeen?: string
  os?: string
  owner?: string
  relationships?: number
  s3Score?: number
}

export type LinkedAlertRow = {
  id: string
  title: string
  severity: string
  source?: string
  when?: string
  status?: "new" | "in-progress" | "closed"
}

export type TaskRow = {
  id: string
  label: string
  done: boolean
  owner?: string
  priority?: "high" | "medium" | "low"
  dueDate?: string
  category?: string
}

const artifactTypes = [
  "Event log",
  "Memory image",
  "PCAP",
  "Process tree",
  "Disk image",
  "Email artifact",
] as const

export function buildOmniSense(inc: Incident): OmniSenseBlock {
  const confidencePct = Math.round(inc.aiConfidence * 100)
  const headline =
    inc.subtitle?.split("·")[0]?.trim() ??
    `OmniSense triage · ${inc.category}`

  const situation = `${inc.title} is classified as ${inc.category} (${inc.type.technique}) with ${inc.severity} severity. Primary signal originates from ${inc.source.label} in ${inc.location}. Correlation suggests ${inc.alerts} related alert${inc.alerts === 1 ? "" : "s"} and ${inc.iocs} IOC${inc.iocs === 1 ? "" : "s"} under active review. Current workflow stage: ${inc.state.replace("-", " ")}.`

  const evidence = [
    {
      label: `${inc.source.label} detection cluster`,
      ref: `Timeline · ${inc.detectionDate}`,
    },
    {
      label: `${inc.artifacts} collected artifact${inc.artifacts === 1 ? "" : "s"}`,
      ref: "Evidence tab",
    },
    {
      label: `MITRE: ${inc.mitre.slice(0, 2).join(", ")}${inc.mitre.length > 2 ? "…" : ""}`,
      ref: "Scope · techniques",
    },
  ]

  const nextSteps = [
    {
      label: "Validate lateral paths from initial host",
      hint: "Entities",
    },
    {
      label: "Contain privileged sessions on domain controllers",
      hint: "Playbooks",
    },
    {
      label: "Preserve chain-of-custody on top 3 artifacts",
      hint: "Evidence",
    },
  ]

  const gaps =
    inc.disposition === "pending"
      ? [
          "User callback pending from IT owner",
          "EDR telemetry gap 09:12–09:18 UTC",
        ]
      : ["No blocking gaps — disposition recorded"]

  return {
    headline,
    situation,
    evidence,
    nextSteps,
    gaps,
    analyzedAt: inc.updateDate,
    confidencePct,
  }
}

export function buildTimeline(inc: Incident): TimelineRow[] {
  const rows: TimelineRow[] = [
    {
      id: "t1",
      when: inc.detectionDate,
      kind: "integration",
      title: "Detection ingested",
      body: `${inc.source.label} forwarded normalized event bundle.`,
    },
    {
      id: "t2",
      when: inc.startDate,
      kind: "system",
      title: "Incident record opened",
      body: `Ticket ${inc.id} · ${inc.customer} · ${inc.location}`,
    },
  ]

  if (inc.escalationDate) {
    rows.push({
      id: "t3",
      when: inc.escalationDate,
      kind: "user",
      title: "Escalated to L2",
      body: inc.assignee
        ? `Routed to ${inc.assignee.name}.`
        : "Awaiting assignment.",
    })
  }

  rows.push(
    {
      id: "t4",
      when: inc.updateDate,
      kind: "playbook",
      title: "Enrichment playbook completed",
      body: "IOC expansion, geo-IP, and asset context merged into timeline.",
    },
    {
      id: "t5",
      when: inc.updateDate,
      kind: "system",
      title: "OmniSense analysis refreshed",
      body: `Confidence ${Math.round(inc.aiConfidence * 100)}% · model v3.2`,
    }
  )

  return rows.sort((a, b) => (a.when < b.when ? 1 : -1))
}

const artifactSources = ["CrowdStrike EDR", "Splunk SIEM", "Sentinel", "Proofpoint", "AWS GuardDuty"] as const

const OMNISENSE_USER = {
  id: "omnisense" as const,
  name: "OmniSense" as const,
  initials: "OS" as const,
  gradient: "from-primary to-chart-3",
}

type Seed = {
  type: ArtifactType
  value: string
  verdict: ArtifactVerdict
  source: string
  enrich: EnrichmentResult[]
  notes?: string
}

const ARTIFACT_SEEDS: Seed[] = [
  {
    type: "ip", value: "185.220.101.42", verdict: "malicious",
    source: "Sentinel detection",
    enrich: [
      { app: "virustotal",  status: "malicious", summary: "67 / 89 engines",                  ranAt: "2h ago" },
      { app: "abuseipdb",   status: "malicious", summary: "94% abuse score · 312 reports",    ranAt: "2h ago" },
      { app: "shodan",      status: "suspicious", summary: "Tor exit node · 12 open ports",   ranAt: "1h ago" },
    ],
    notes: "Tor exit node observed delivering second-stage payload.",
  },
  {
    type: "hash-sha256", value: "a3f2c81b9d7e045d8c6b2a1e9f4d3c5a8e7b1c9d2f6e3b8a4d7c1e9f2b5a8d3c", verdict: "malicious",
    source: "CrowdStrike EDR",
    enrich: [
      { app: "virustotal",     status: "malicious", summary: "58 / 72 engines · TrickBot",   ranAt: "3h ago" },
      { app: "hybridanalysis", status: "malicious", summary: "Banker trojan family",         ranAt: "3h ago" },
    ],
  },
  {
    type: "domain", value: "secure-update-cdn[.]com", verdict: "malicious",
    source: "DNS gateway",
    enrich: [
      { app: "virustotal", status: "malicious", summary: "41 / 92 engines",                  ranAt: "2h ago" },
      { app: "threatfox",  status: "malicious", summary: "Listed as Cobalt Strike C2",       ranAt: "2h ago" },
      { app: "urlscan",    status: "malicious", summary: "Phishing kit detected",            ranAt: "2h ago" },
    ],
    notes: "Newly registered (3 days ago). Uses Cloudflare proxy.",
  },
  {
    type: "url", value: "https://secure-update-cdn[.]com/portal/login.php", verdict: "malicious",
    source: "Email gateway",
    enrich: [
      { app: "virustotal", status: "malicious", summary: "38 / 92 engines",                  ranAt: "4h ago" },
      { app: "urlscan",    status: "malicious", summary: "MS365 phish · screenshot captured", ranAt: "4h ago" },
    ],
  },
  {
    type: "ip", value: "104.21.45.118", verdict: "suspicious",
    source: "Firewall logs",
    enrich: [
      { app: "virustotal", status: "suspicious", summary: "4 / 89 engines",                  ranAt: "5h ago" },
      { app: "abuseipdb",  status: "clean",      summary: "Cloudflare · 0% abuse score",     ranAt: "5h ago" },
      { app: "shodan",     status: "clean",      summary: "Cloudflare WAF",                  ranAt: "5h ago" },
    ],
  },
  {
    type: "hash-md5", value: "d41d8cd98f00b204e9800998ecf8427e", verdict: "suspicious",
    source: "Email attachment",
    enrich: [
      { app: "virustotal",     status: "suspicious", summary: "12 / 68 engines",             ranAt: "6h ago" },
      { app: "hybridanalysis", status: "pending",    summary: "Sample queued · ETA 8m",      ranAt: "6h ago" },
    ],
  },
  {
    type: "email", value: "no-reply@secure-update-cdn[.]com", verdict: "malicious",
    source: "Proofpoint",
    enrich: [
      { app: "virustotal", status: "malicious", summary: "Listed in 3 phishing campaigns",   ranAt: "4h ago" },
    ],
  },
  {
    type: "ip", value: "10.10.5.23", verdict: "unknown",
    source: "Internal asset",
    enrich: [],
    notes: "Initial access target — Windows 11 workstation, finance team.",
  },
  {
    type: "domain", value: "microsoft.com", verdict: "clean",
    source: "DNS gateway",
    enrich: [
      { app: "virustotal", status: "clean", summary: "0 / 92 engines",                       ranAt: "1d ago" },
    ],
  },
  {
    type: "port", value: "TCP/4444", verdict: "suspicious",
    source: "Sentinel detection",
    enrich: [
      { app: "threatfox", status: "suspicious", summary: "Common Metasploit reverse-shell port", ranAt: "3h ago" },
    ],
  },
  {
    type: "filename", value: "rundll32.exe -s C:\\Users\\Public\\update.dll", verdict: "malicious",
    source: "Sysmon event 1",
    enrich: [
      { app: "mandiant", status: "malicious", summary: "Matches APT29 LOLBin signature",     ranAt: "2h ago" },
    ],
  },
  {
    type: "user", value: "svc-finance-bkp", verdict: "suspicious",
    source: "Active Directory",
    enrich: [],
    notes: "Service account exhibited interactive logon outside business hours.",
  },
]

export function buildArtifactRows(inc: Incident): ArtifactRow[] {
  const n = Math.min(Math.max(inc.artifacts, 5), ARTIFACT_SEEDS.length)
  const userKeys = ["sara", "ahmed", "mariam", "rashid"] as const
  return ARTIFACT_SEEDS.slice(0, n).map((s, i) => {
    const isOmni = i % 3 === 1
    const addedBy = isOmni ? OMNISENSE_USER : usersFromIncident(inc, userKeys[i % userKeys.length]!)
    return {
      id: `${inc.id}-art-${i}`,
      value: s.value,
      type: s.type,
      verdict: s.verdict,
      addedBy,
      addedAt: i < 3 ? `${1 + i}h ago` : `${4 + i}h ago`,
      source: s.source,
      enrichments: s.enrich,
      notes: s.notes,
      // Legacy aliases
      name: s.value,
      typeLabel: artifactTypeLabel(s.type),
      when: i < 3 ? `${1 + i}h ago` : `${4 + i}h ago`,
    }
  })
}

function artifactTypeLabel(t: ArtifactType): string {
  return ({
    "ip":          "IP Address",
    "domain":      "Domain",
    "url":         "URL",
    "hash-md5":    "MD5 Hash",
    "hash-sha1":   "SHA-1 Hash",
    "hash-sha256": "SHA-256 Hash",
    "email":       "Email Address",
    "port":        "Port",
    "file":        "File",
    "filename":    "Process/Command",
    "user":        "User Account",
    "registry":    "Registry Key",
  } satisfies Record<ArtifactType, string>)[t]
}

function usersFromIncident(inc: Incident, fallbackId: string) {
  // Prefer a known incident member, otherwise look up the user registry.
  const found =
    inc.members.find((m) => m.id === fallbackId) ??
    (inc.assignee && inc.assignee.id === fallbackId ? inc.assignee : null) ??
    inc.members[0] ??
    inc.assignee ??
    inc.openedBy
  return found
}

export function buildEntityRows(inc: Incident): EntityRow[] {
  const ownerName = inc.assignee?.name
  const seeds: Array<Omit<EntityRow, "id" | "name">> = [
    { type: "Host",              signal: "Suspicious PS exec",  risk: "critical", ip: "10.10.5.23",  os: "Windows 11",          lastSeen: "2h ago",  owner: ownerName,  relationships: 4,  s3Score: 87 },
    { type: "Domain controller", signal: "TGT anomalies",       risk: "high",     ip: "10.10.1.5",   os: "Windows Server 2022", lastSeen: "4h ago",  owner: undefined,  relationships: 8,  s3Score: 74 },
    { type: "Server",            signal: "Inbound RDP burst",   risk: "high",     ip: "10.10.2.12",  os: "Ubuntu 22.04",        lastSeen: "6h ago",  owner: undefined,  relationships: 2,  s3Score: 62 },
    { type: "SaaS",              signal: "OAuth scope drift",   risk: "medium",   ip: "—",           os: "SaaS",                lastSeen: "1d ago",  owner: undefined,  relationships: 1,  s3Score: 45 },
  ]
  const labels = ["Primary workload", "Auth plane", "Jump host", "Identity provider"]
  const count = Math.min(4, Math.max(1, Math.ceil((inc.iocs + 1) / 5)))
  return seeds.slice(0, count).map((s, i) => ({
    id: `${inc.id}-ent-${i}`,
    name: `${labels[i]} · ${inc.location}`,
    ...s,
  }))
}

export function buildLinkedAlerts(inc: Incident): LinkedAlertRow[] {
  const n = Math.min(inc.alerts, 5)
  if (n === 0) {
    return [{ id: "LA-0", title: "No linked alerts in mock dataset", severity: "info", status: "closed" }]
  }
  const statuses: LinkedAlertRow["status"][] = ["new", "in-progress", "new", "closed", "in-progress"]
  const hoursAgo = [1, 2, 3, 5, 8]
  return Array.from({ length: n }, (_, i) => ({
    id: `${inc.source.code}-${8800 + i}`,
    title: `Correlated signal ${i + 1} — ${inc.category}`,
    severity: i === 0 ? inc.severity : (i === 1 ? "high" : "medium"),
    source: inc.source.label,
    when: `${hoursAgo[i]}h ago`,
    status: statuses[i % statuses.length],
  }))
}

export function buildTasks(inc: Incident): TaskRow[] {
  return [
    {
      id: "task-1",
      label: "Confirm blast radius with IT owner",
      done: inc.state !== "triage",
      owner: inc.assignee?.name,
      priority: "high",
      dueDate: "May 10",
      category: "Investigation",
    },
    {
      id: "task-2",
      label: "Isolate affected hosts (network L4)",
      done: ["containment", "eradication", "recovery", "mitigated", "closed"].includes(inc.state),
      priority: "high",
      dueDate: "May 8",
      category: "Containment",
    },
    {
      id: "task-3",
      label: "Executive summary for risk committee",
      done: inc.status === "resolved" || inc.status === "closed",
      owner: inc.assignee?.name,
      priority: "medium",
      dueDate: "May 15",
      category: "Reporting",
    },
    {
      id: "task-4",
      label: "Preserve chain-of-custody on top 3 artifacts",
      done: inc.state !== "triage" && inc.state !== "investigating",
      priority: "medium",
      dueDate: "May 9",
      category: "Evidence",
    },
  ]
}

export function remediationSummary(inc: Incident): string {
  if (inc.disposition === "true-positive") {
    return `Containment completed. Root cause aligned with ${inc.category}. Implemented controls documented; residual risk accepted per policy IR-12.`
  }
  if (inc.disposition === "false-positive" || inc.disposition === "benign") {
    return `Activity reconciled as non-malicious after vendor correlation and internal validation. Ticket ready for closure with lessons learned captured.`
  }
  return `Remediation in progress. Focus: ${inc.state} phase. Coordinate with SOC and infrastructure owners before irreversible containment steps.`
}

/** S3 breakdown — 4 dimensions matching production `iti_s3_breakdown` axes. */
export type S3BreakdownRow = {
  id: "severity" | "asset_criticality" | "exploitability_now" | "blast_radius"
  label: string
  value: number
}

const SEV_WEIGHT: Record<string, number> = {
  critical: 0.32, high: 0.27, medium: 0.21, low: 0.13,
}

export function buildS3Breakdown(inc: Incident): S3BreakdownRow[] {
  const s   = inc.s3Score
  const sev = Math.round(s * (SEV_WEIGHT[inc.severity] ?? 0.27))
  const exp = Math.round(s * 0.26)
  const blast = Math.round(s * 0.24)
  const asset = s - sev - exp - blast
  return [
    { id: "severity",           label: "Severity",           value: sev },
    { id: "asset_criticality",  label: "Entity Criticality", value: asset },
    { id: "exploitability_now", label: "Exploitability",     value: exp },
    { id: "blast_radius",       label: "Blast Radius",       value: blast },
  ]
}

export type MitreStructured = {
  tactics: string[]
  techniques: string[]
  subTechniques: string[]
}

export function buildMitreStructured(inc: Incident): MitreStructured {
  const techniques = [...inc.mitre]
  const tactics = [
    ...new Set(techniques.map((t) => t.split(".")[0] ?? t).filter(Boolean)),
  ]
  const subTechniques = techniques.filter((t) => t.split(".").length >= 3)
  return { tactics, techniques, subTechniques }
}

export type RelatedIncidentRow = {
  id: string
  title: string
  severity: Incident["severity"]
  updated: string
}

export function buildRelatedIncidents(inc: Incident): RelatedIncidentRow[] {
  return incidents
    .filter(
      (x) =>
        x.id !== inc.id &&
        (x.customer === inc.customer ||
          x.tags.some((t) => inc.tags.includes(t)))
    )
    .slice(0, 5)
    .map((x) => ({
      id: x.id,
      title: x.title,
      severity: x.severity,
      updated: x.updated,
    }))
}

export type MockReport = {
  id: string
  name: string
  buttonText: string
  body: string
}

export function buildMockReports(inc: Incident): MockReport[] {
  return [
    {
      id: "headerAnalysis",
      name: "Header Analysis Report",
      buttonText: "View header analysis",
      body: `Mock header analysis for ${inc.id}.\n\nAuthentication-Results, ARC-Seal, and Received chains show ${inc.source.label} ingestion path is consistent with enterprise relay policy.`,
    },
    {
      id: "phishingAnalysis",
      name: "Phishing Analysis Report",
      buttonText: "View phishing analysis",
      body: `Mock phishing classifier output for ${inc.category}.\n\nURL reputation: mixed. Attachment entropy elevated. Recommended user re-training cohort: ${inc.location}.`,
    },
    {
      id: "preProcessing",
      name: "Pre-processing report",
      buttonText: "View pre-processing",
      body: `Normalization pipeline v4 completed for ${inc.sourceId}.\n\nFields mapped: 42 · Dropped: 0 · Enrichment latency 312ms.`,
    },
  ]
}

export type LogRow = {
  id: string
  at: string
  actor: string
  message: string
  status?: "success" | "failed" | "pending"
  duration?: string
  level?: "info" | "warn" | "error" | "success"
}

export type CommentRow = {
  id: string
  author: string
  initials: string
  gradient: string
  photo?: string
  body: string
  when: string
  isSystem?: boolean
  role?: string
}

export function buildAuditLogRows(inc: Incident): LogRow[] {
  return [
    {
      id: "l1",
      at: inc.updateDate,
      actor: "system",
      message: "Field iti_ticket_status updated · transition logged",
      level: "info",
    },
    {
      id: "l2",
      at: inc.detectionDate,
      actor: inc.openedBy.name,
      message: `Opened incident from queue Triage-EU · ticket ${inc.id} created`,
      level: "info",
    },
    {
      id: "l3",
      at: inc.startDate,
      actor: "OmniSense",
      message: `Correlation job #${inc.sourceId} completed · ${inc.iocs} IOCs enriched`,
      level: "success",
    },
    {
      id: "l4",
      at: inc.startDate,
      actor: "system",
      message: `SLA timer started · priority ${inc.priority}`,
      level: "info",
    },
  ]
}

export function buildPlaybookLogRows(inc: Incident): LogRow[] {
  return [
    {
      id: "p1",
      at: inc.updateDate,
      actor: "Enrich-IOC-v2",
      message: `${inc.iocs} IOCs enriched and correlated against threat intel feeds`,
      status: "success",
      duration: "1m 23s",
      level: "success",
    },
    {
      id: "p2",
      at: inc.startDate,
      actor: "Notify-Slack-SOC",
      message: "SOC channel notified · on-call analyst pinged",
      status: "success",
      duration: "0m 04s",
      level: "success",
    },
    {
      id: "p3",
      at: inc.detectionDate,
      actor: "Triage-Agent-Route",
      message: "Awaiting human approval before routing to L2 analyst",
      status: "pending",
      level: "warn",
    },
  ]
}

export function buildSlaLogRows(inc: Incident): LogRow[] {
  return [
    {
      id: "s1",
      at: inc.startDate,
      actor: "SLA engine",
      message: `Timer started · priority ${inc.priority} · response SLA initiated`,
      level: "info",
    },
    {
      id: "s2",
      at: inc.updateDate,
      actor: "SLA engine",
      message: `Elapsed ${inc.sla.label} · ${Math.round(inc.sla.pct)}% of allowance consumed`,
      level: inc.sla.tone === "breach" ? "error" : inc.sla.tone === "warn" ? "warn" : "success",
    },
    ...(inc.sla.tone === "breach" ? [{
      id: "s3",
      at: inc.updateDate,
      actor: "SLA engine",
      message: "SLA breached · escalation notification sent to team lead",
      level: "error" as const,
    }] : []),
  ]
}

export function buildAffectedProducts(_inc: Incident): { product: string; vendor: string }[] {
  return [
    { product: "Microsoft 365", vendor: "Microsoft" },
    { product: "Proofpoint TAP", vendor: "Proofpoint" },
    { product: "Chrome 124", vendor: "Google" },
  ]
}

export function buildCommentRows(inc: Incident): CommentRow[] {
  const rows: CommentRow[] = [
    {
      id: "c1",
      author: inc.openedBy.name,
      initials: inc.openedBy.initials,
      gradient: inc.openedBy.gradient,
      photo: inc.openedBy.photo,
      body: `Initial triage complete. Requested packet capture on DC uplinks. Flagged ${inc.source.label} as primary detection source — correlating with SIEM alerts.`,
      when: inc.detectionDate,
      role: "SOC Analyst",
    },
    {
      id: "c2",
      author: "OmniSense",
      initials: "OS",
      gradient: "bg-gradient-to-br from-primary to-chart-3",
      body: `Recommended containment sequence posted — isolate affected hosts before domain controller patching. ${Math.round(inc.aiConfidence * 100)}% confidence. Awaiting analyst approval to proceed.`,
      when: inc.startDate,
      isSystem: true,
      role: "Co-Analyst",
    },
  ]
  if (inc.assignee) {
    rows.push({
      id: "c3",
      author: inc.assignee.name,
      initials: inc.assignee.initials,
      gradient: inc.assignee.gradient,
      photo: inc.assignee.photo,
      body: `Reviewing containment scope. Confirming affected subnet list with network team by EOD. Will update ticket on completion.`,
      when: inc.updateDate,
      role: "Lead Analyst",
    })
  }
  return rows
}

/** Extra narrative appended after a successful OmniSense "run". */
export function buildOmniSenseRunDelta(inc: Incident): string {
  return `Live correlation refresh completed. Elevated attention on ${inc.mitre[0] ?? "MITRE"} with ${inc.iocs} IOC${inc.iocs === 1 ? "" : "s"} re-scored against last 14d tenant history. Recommended containment order unchanged; confidence band tightened.`
}
