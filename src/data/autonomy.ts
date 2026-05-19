export type RunStatus = "success" | "running" | "failed" | "queued"
export type ApprovalStatus = "pending" | "approved" | "declined"
export type AgentType = "default" | "custom"

export type Application = {
  id: string
  name: string
  vendor: string
  category: string
  status: "connected" | "degraded" | "disconnected"
  lastSync: string
  actions: number
  ingestion: number
  callsToday: number
  initials: string
  tone: string
  /** Last 14 hourly buckets — used for the in-card sparkline. */
  trend: number[]
}

export const applications: Application[] = [
  {
    id: "APP-001",
    name: "Splunk Enterprise",
    vendor: "Splunk",
    category: "SIEM",
    status: "connected",
    lastSync: "2m ago",
    actions: 18,
    ingestion: 4,
    callsToday: 1248,
    initials: "SP",
    tone: "from-emerald-500 to-teal-600",
    trend: [42, 51, 47, 58, 64, 72, 68, 81, 76, 88, 94, 102, 96, 110],
  },
  {
    id: "APP-002",
    name: "CrowdStrike Falcon",
    vendor: "CrowdStrike",
    category: "EDR",
    status: "connected",
    lastSync: "just now",
    actions: 24,
    ingestion: 2,
    callsToday: 412,
    initials: "CS",
    tone: "from-rose-500 to-red-600",
    trend: [18, 22, 28, 24, 32, 30, 36, 41, 38, 44, 39, 46, 51, 48],
  },
  {
    id: "APP-003",
    name: "Microsoft Sentinel",
    vendor: "Microsoft",
    category: "SIEM",
    status: "connected",
    lastSync: "1m ago",
    actions: 22,
    ingestion: 3,
    callsToday: 988,
    initials: "MS",
    tone: "from-sky-500 to-blue-600",
    trend: [62, 71, 68, 78, 84, 79, 88, 92, 89, 96, 102, 108, 104, 116],
  },
  {
    id: "APP-004",
    name: "Proofpoint TAP",
    vendor: "Proofpoint",
    category: "Email security",
    status: "degraded",
    lastSync: "12m ago",
    actions: 9,
    ingestion: 1,
    callsToday: 47,
    initials: "PP",
    tone: "from-amber-500 to-orange-600",
    trend: [12, 14, 16, 18, 14, 11, 8, 6, 4, 2, 1, 0, 0, 1],
  },
  {
    id: "APP-005",
    name: "Okta",
    vendor: "Okta",
    category: "Identity",
    status: "connected",
    lastSync: "5m ago",
    actions: 12,
    ingestion: 1,
    callsToday: 184,
    initials: "OK",
    tone: "from-indigo-500 to-violet-600",
    trend: [8, 11, 9, 14, 16, 18, 14, 21, 19, 23, 26, 24, 28, 32],
  },
  {
    id: "APP-006",
    name: "Jira Service Mgmt",
    vendor: "Atlassian",
    category: "Ticketing",
    status: "connected",
    lastSync: "30s ago",
    actions: 8,
    ingestion: 0,
    callsToday: 96,
    initials: "JR",
    tone: "from-blue-500 to-indigo-600",
    trend: [3, 4, 6, 5, 8, 7, 9, 11, 8, 12, 14, 11, 15, 13],
  },
  {
    id: "APP-007",
    name: "VirusTotal",
    vendor: "Google",
    category: "Threat intel",
    status: "connected",
    lastSync: "3m ago",
    actions: 6,
    ingestion: 1,
    callsToday: 1024,
    initials: "VT",
    tone: "from-fuchsia-500 to-pink-600",
    trend: [54, 58, 62, 71, 68, 79, 82, 88, 91, 96, 102, 98, 104, 112],
  },
  {
    id: "APP-008",
    name: "Palo Alto NGFW",
    vendor: "Palo Alto",
    category: "Firewall",
    status: "disconnected",
    lastSync: "2h ago",
    actions: 14,
    ingestion: 0,
    callsToday: 0,
    initials: "PA",
    tone: "from-orange-500 to-red-600",
    trend: [22, 28, 24, 19, 14, 8, 4, 0, 0, 0, 0, 0, 0, 0],
  },
]

export type Playbook = {
  id: string
  name: string
  description: string
  status: "active" | "draft" | "disabled"
  family: string
  steps: number
  lastRun: string
  runs24h: number
  successRate: number
  owner: { name: string; initials: string; tone: string }
  tags: string[]
}

export const playbooks: Playbook[] = [
  {
    id: "PB-1042",
    name: "Phishing — auto-triage and contain",
    description:
      "Detonate URL, enrich sender, isolate endpoint, notify user, open SOC ticket.",
    status: "active",
    family: "Phishing",
    steps: 14,
    lastRun: "8m ago",
    runs24h: 42,
    successRate: 96,
    owner: { name: "Ahmed Khan", initials: "AK", tone: "from-indigo-500 to-pink-500" },
    tags: ["email", "endpoint", "user-notify"],
  },
  {
    id: "PB-1037",
    name: "Malware containment — EDR",
    description:
      "Quarantine host, snapshot memory, pull artefacts, escalate to T2 if family unknown.",
    status: "active",
    family: "Malware",
    steps: 11,
    lastRun: "23m ago",
    runs24h: 18,
    successRate: 92,
    owner: { name: "Sara Ahmed", initials: "SA", tone: "from-emerald-500 to-teal-500" },
    tags: ["edr", "endpoint", "isolation"],
  },
  {
    id: "PB-1029",
    name: "Brute force — disable & notify",
    description:
      "Disable user, force MFA, notify manager, open identity case.",
    status: "active",
    family: "Identity",
    steps: 7,
    lastRun: "1h ago",
    runs24h: 9,
    successRate: 100,
    owner: { name: "John Doe", initials: "JD", tone: "from-amber-500 to-orange-500" },
    tags: ["okta", "mfa"],
  },
  {
    id: "PB-1024",
    name: "C2 callback — block at firewall",
    description:
      "Verify domain, block at NGFW, capture pcap, enrich indicator.",
    status: "active",
    family: "Network",
    steps: 9,
    lastRun: "3h ago",
    runs24h: 4,
    successRate: 88,
    owner: { name: "Priya Sharma", initials: "PS", tone: "from-violet-500 to-fuchsia-500" },
    tags: ["network", "firewall"],
  },
  {
    id: "PB-1019",
    name: "Insider exfil — DLP triage",
    description:
      "Pull file metadata, snapshot drive, hold mailbox, open HR ticket.",
    status: "draft",
    family: "Data loss",
    steps: 12,
    lastRun: "—",
    runs24h: 0,
    successRate: 0,
    owner: { name: "Liam Chen", initials: "LC", tone: "from-cyan-500 to-blue-500" },
    tags: ["dlp", "hr"],
  },
  {
    id: "PB-1011",
    name: "Vuln triage — CVSS auto-score",
    description:
      "Pull KEV, enrich CVSS, route by asset criticality.",
    status: "active",
    family: "Vulnerability",
    steps: 6,
    lastRun: "12m ago",
    runs24h: 27,
    successRate: 99,
    owner: { name: "Ahmed Khan", initials: "AK", tone: "from-indigo-500 to-pink-500" },
    tags: ["vuln", "cvss"],
  },
  {
    id: "PB-1008",
    name: "Threat intel — IoC ingest",
    description:
      "Pull MISP feed, dedupe, enrich, push to TIP and SIEM watchlists.",
    status: "active",
    family: "Threat intel",
    steps: 8,
    lastRun: "2m ago",
    runs24h: 96,
    successRate: 100,
    owner: { name: "Sara Ahmed", initials: "SA", tone: "from-emerald-500 to-teal-500" },
    tags: ["misp", "ti"],
  },
  {
    id: "PB-1004",
    name: "Suspicious login — geo-velocity",
    description:
      "Detect impossible travel, force re-auth, page on-call if VIP.",
    status: "disabled",
    family: "Identity",
    steps: 5,
    lastRun: "2d ago",
    runs24h: 0,
    successRate: 80,
    owner: { name: "Priya Sharma", initials: "PS", tone: "from-violet-500 to-fuchsia-500" },
    tags: ["okta", "geo"],
  },
]

export type Agent = {
  id: string
  name: string
  description: string
  modules: string[]
  stages: string[]
  type: AgentType
  active: boolean
  runsToday: number
  successRate: number
  lastRun: string
  iconTone: string
  initials: string
}

export const agents: Agent[] = [
  {
    id: "AG-001",
    name: "Phish Triage Agent",
    description:
      "Classifies inbound mail reports, tags suspect URLs, and writes verdict back to ticket.",
    modules: ["Incident management", "Email security"],
    stages: ["Triage", "Enrichment"],
    type: "default",
    active: true,
    runsToday: 184,
    successRate: 96,
    lastRun: "now",
    iconTone: "from-indigo-500 to-purple-600",
    initials: "PT",
  },
  {
    id: "AG-002",
    name: "Endpoint Isolator",
    description:
      "Listens to high-severity EDR detections and isolates impacted hosts within policy.",
    modules: ["Incident management"],
    stages: ["Containment"],
    type: "default",
    active: true,
    runsToday: 22,
    successRate: 91,
    lastRun: "12m ago",
    iconTone: "from-rose-500 to-red-600",
    initials: "EI",
  },
  {
    id: "AG-003",
    name: "Threat Intel Enricher",
    description:
      "Adds VirusTotal, MISP and internal TIP context to every IoC observed.",
    modules: ["Threat intel"],
    stages: ["Enrichment"],
    type: "default",
    active: true,
    runsToday: 1024,
    successRate: 99,
    lastRun: "now",
    iconTone: "from-emerald-500 to-teal-600",
    initials: "TI",
  },
  {
    id: "AG-004",
    name: "Identity Risk Watchdog",
    description:
      "Flags impossible-travel and MFA-failure clusters across Okta and AzureAD.",
    modules: ["Incident management", "Identity"],
    stages: ["Detection"],
    type: "custom",
    active: true,
    runsToday: 47,
    successRate: 94,
    lastRun: "3m ago",
    iconTone: "from-sky-500 to-blue-600",
    initials: "IR",
  },
  {
    id: "AG-005",
    name: "Vuln Auto-Scorer",
    description:
      "Re-scores CVEs against asset criticality and KEV catalog every 4 hours.",
    modules: ["Vulnerability"],
    stages: ["Triage"],
    type: "default",
    active: true,
    runsToday: 6,
    successRate: 100,
    lastRun: "1h ago",
    iconTone: "from-amber-500 to-orange-600",
    initials: "VA",
  },
  {
    id: "AG-006",
    name: "Sara Co-Analyst",
    description:
      "Conversational analyst — drafts reports, summarises incidents, suggests next steps.",
    modules: ["Incident management", "Threat intel"],
    stages: ["Analysis"],
    type: "default",
    active: true,
    runsToday: 312,
    successRate: 98,
    lastRun: "now",
    iconTone: "from-violet-500 to-fuchsia-600",
    initials: "SA",
  },
  {
    id: "AG-007",
    name: "DLP Sentinel",
    description:
      "Monitors O365 and GDrive activity, scores anomalies and opens cases for HR review.",
    modules: ["Data loss"],
    stages: ["Detection"],
    type: "custom",
    active: false,
    runsToday: 0,
    successRate: 0,
    lastRun: "yesterday",
    iconTone: "from-cyan-500 to-sky-600",
    initials: "DL",
  },
  {
    id: "AG-008",
    name: "Backup Validator",
    description:
      "Tests restore on critical assets weekly and opens an incident on failure.",
    modules: ["Resilience"],
    stages: ["Verification"],
    type: "custom",
    active: true,
    runsToday: 2,
    successRate: 100,
    lastRun: "6h ago",
    iconTone: "from-fuchsia-500 to-pink-600",
    initials: "BV",
  },
]

export type AutonomyRuleCategory = {
  id: string
  title: string
  description: string
  rules: { name: string; effect: "auto" | "approve" | "block"; when: string }[]
}

export const autonomyRuleCategories: AutonomyRuleCategory[] = [
  {
    id: "containment",
    title: "Containment",
    description:
      "Rules that govern when SIRP can isolate hosts, disable accounts, and block indicators automatically.",
    rules: [
      { name: "Isolate endpoint on critical EDR alert", effect: "auto", when: "Severity ≥ critical · trust ≥ 0.85" },
      { name: "Disable user on impossible travel", effect: "approve", when: "Geo-velocity > 1000 mph · VIP" },
      { name: "Block IoC on confirmed C2", effect: "auto", when: "TI confidence ≥ high" },
    ],
  },
  {
    id: "communication",
    title: "Communication",
    description:
      "Notify rules — page on-call, email manager, post to Slack channel.",
    rules: [
      { name: "Page on-call on P1 incidents", effect: "auto", when: "Severity = critical · production" },
      { name: "Notify user on quarantined mailbox", effect: "auto", when: "Phishing verdict = malicious" },
    ],
  },
  {
    id: "remediation",
    title: "Remediation",
    description:
      "Patch, reset, restore — automated remediation actions and their guardrails.",
    rules: [
      { name: "Force password reset on credential leak", effect: "approve", when: "User in TI dump" },
      { name: "Restore mailbox on false positive phish", effect: "auto", when: "Analyst verdict = clean" },
      { name: "Re-image host", effect: "block", when: "Always — manual only" },
    ],
  },
  {
    id: "ticketing",
    title: "Ticketing",
    description:
      "How and when SIRP opens, escalates, and closes external tickets.",
    rules: [
      { name: "Open Jira ticket on T2 escalation", effect: "auto", when: "After 30m without action" },
      { name: "Close incident on auto-resolved", effect: "auto", when: "Verdict = false positive · 100% confidence" },
    ],
  },
]

export type ApprovalWorkflow = {
  id: string
  name: string
  description: string
  approvers: { initials: string; tone: string }[]
  rules: number
  scope: string
  updatedAt: string
}

export const approvalWorkflows: ApprovalWorkflow[] = [
  {
    id: "AW-01",
    name: "Critical containment",
    description:
      "Endpoint isolation and account disable for production assets.",
    approvers: [
      { initials: "AK", tone: "from-indigo-500 to-pink-500" },
      { initials: "SA", tone: "from-emerald-500 to-teal-500" },
      { initials: "PS", tone: "from-violet-500 to-fuchsia-500" },
    ],
    rules: 4,
    scope: "Production · all severities",
    updatedAt: "2d ago",
  },
  {
    id: "AW-02",
    name: "VIP user actions",
    description:
      "Any action on a flagged VIP user — exec team, finance, legal.",
    approvers: [
      { initials: "AK", tone: "from-indigo-500 to-pink-500" },
      { initials: "JD", tone: "from-amber-500 to-orange-500" },
    ],
    rules: 6,
    scope: "VIP roster only",
    updatedAt: "5d ago",
  },
  {
    id: "AW-03",
    name: "Firewall mutations",
    description:
      "NGFW rule changes — block, unblock, scope changes.",
    approvers: [
      { initials: "LC", tone: "from-cyan-500 to-blue-500" },
      { initials: "PS", tone: "from-violet-500 to-fuchsia-500" },
    ],
    rules: 3,
    scope: "All firewalls",
    updatedAt: "1w ago",
  },
  {
    id: "AW-04",
    name: "Out-of-hours escalation",
    description:
      "Any auto action between 22:00–06:00 routes to on-call.",
    approvers: [
      { initials: "OC", tone: "from-rose-500 to-red-500" },
    ],
    rules: 1,
    scope: "After-hours · global",
    updatedAt: "3w ago",
  },
]

export type ControlPolicy = {
  id: string
  name: string
  scope: string
  conditions: string
  effect: "allow" | "deny" | "approve"
  status: "enforced" | "monitor" | "draft"
  updatedAt: string
}

export const controlPolicies: ControlPolicy[] = [
  {
    id: "CP-001",
    name: "Auto-isolate prod endpoints",
    scope: "Production hosts",
    conditions: "Severity ≥ critical AND EDR trust ≥ 0.85",
    effect: "allow",
    status: "enforced",
    updatedAt: "12d ago",
  },
  {
    id: "CP-002",
    name: "VIP account disable requires approval",
    scope: "VIP roster",
    conditions: "Action = disable_user",
    effect: "approve",
    status: "enforced",
    updatedAt: "1w ago",
  },
  {
    id: "CP-003",
    name: "Block re-image action",
    scope: "All assets",
    conditions: "Action = reimage",
    effect: "deny",
    status: "enforced",
    updatedAt: "1m ago",
  },
  {
    id: "CP-004",
    name: "After-hours auto-actions",
    scope: "Global",
    conditions: "Time between 22:00–06:00",
    effect: "approve",
    status: "monitor",
    updatedAt: "5d ago",
  },
  {
    id: "CP-005",
    name: "Test policy — beta",
    scope: "Sandbox tenants",
    conditions: "Always",
    effect: "allow",
    status: "draft",
    updatedAt: "today",
  },
]

export type LabRun = {
  id: string
  name: string
  status: RunStatus
  container: { kind: "incident" | "advisory" | "case"; id: string }
  startedAt: string
  duration: string
  trigger: string
  user?: { name: string; initials: string; tone: string }
}

export const playbookRuns: LabRun[] = [
  {
    id: "RUN-9928",
    name: "Phishing — auto-triage and contain",
    status: "success",
    container: { kind: "incident", id: "INC-2741" },
    startedAt: "2m ago",
    duration: "47s",
    trigger: "Auto",
    user: { name: "Phish Triage Agent", initials: "PT", tone: "from-indigo-500 to-purple-600" },
  },
  {
    id: "RUN-9927",
    name: "Threat intel — IoC ingest",
    status: "success",
    container: { kind: "advisory", id: "ADV-118" },
    startedAt: "3m ago",
    duration: "12s",
    trigger: "Schedule",
  },
  {
    id: "RUN-9926",
    name: "Malware containment — EDR",
    status: "running",
    container: { kind: "incident", id: "INC-2738" },
    startedAt: "4m ago",
    duration: "—",
    trigger: "Auto",
  },
  {
    id: "RUN-9925",
    name: "Brute force — disable & notify",
    status: "success",
    container: { kind: "incident", id: "INC-2731" },
    startedAt: "12m ago",
    duration: "1m 04s",
    trigger: "Manual",
    user: { name: "Ahmed Khan", initials: "AK", tone: "from-indigo-500 to-pink-500" },
  },
  {
    id: "RUN-9924",
    name: "C2 callback — block at firewall",
    status: "failed",
    container: { kind: "incident", id: "INC-2724" },
    startedAt: "27m ago",
    duration: "9s",
    trigger: "Auto",
  },
  {
    id: "RUN-9923",
    name: "Vuln triage — CVSS auto-score",
    status: "success",
    container: { kind: "advisory", id: "ADV-114" },
    startedAt: "44m ago",
    duration: "21s",
    trigger: "Schedule",
  },
  {
    id: "RUN-9922",
    name: "Phishing — auto-triage and contain",
    status: "queued",
    container: { kind: "incident", id: "INC-2719" },
    startedAt: "—",
    duration: "—",
    trigger: "Auto",
  },
]

export type Artifact = {
  id: string
  value: string
  type: "ip" | "domain" | "hash" | "email" | "url"
  incidents: number
  threatIntel: number
  cases: number
  total: number
  lastSeen: string
  whitelisted: boolean
}

export const artifacts: Artifact[] = [
  {
    id: "ART-22341",
    value: "185.220.101.47",
    type: "ip",
    incidents: 14,
    threatIntel: 22,
    cases: 1,
    total: 37,
    lastSeen: "8m ago",
    whitelisted: false,
  },
  {
    id: "ART-22338",
    value: "malicious-update.example.io",
    type: "domain",
    incidents: 9,
    threatIntel: 12,
    cases: 0,
    total: 21,
    lastSeen: "32m ago",
    whitelisted: false,
  },
  {
    id: "ART-22336",
    value: "9f86d081884c7d659a2feaa0c55ad015",
    type: "hash",
    incidents: 6,
    threatIntel: 4,
    cases: 0,
    total: 10,
    lastSeen: "1h ago",
    whitelisted: false,
  },
  {
    id: "ART-22330",
    value: "https://acme-portal.com/login",
    type: "url",
    incidents: 0,
    threatIntel: 0,
    cases: 0,
    total: 0,
    lastSeen: "—",
    whitelisted: true,
  },
  {
    id: "ART-22321",
    value: "attacker@badactor.cn",
    type: "email",
    incidents: 4,
    threatIntel: 2,
    cases: 1,
    total: 7,
    lastSeen: "3h ago",
    whitelisted: false,
  },
  {
    id: "ART-22319",
    value: "203.0.113.42",
    type: "ip",
    incidents: 1,
    threatIntel: 0,
    cases: 0,
    total: 1,
    lastSeen: "yesterday",
    whitelisted: false,
  },
  {
    id: "ART-22314",
    value: "ad-services.amce-internal.io",
    type: "domain",
    incidents: 0,
    threatIntel: 0,
    cases: 0,
    total: 0,
    lastSeen: "—",
    whitelisted: true,
  },
]

export type ApprovalRequest = {
  id: string
  action: string
  app: string
  appInitials: string
  appTone: string
  artifact: string
  artifactType: Artifact["type"]
  container: { kind: "incident" | "advisory" | "case"; id: string; name: string }
  status: ApprovalStatus
  initiatedAt: string
  initiatedBy: string
  initiatedByInitials: string
  initiatedByTone: string
  decidedAt?: string
  decidedBy?: string
}

export const approvalRequests: ApprovalRequest[] = [
  {
    id: "AP-7741",
    action: "Isolate endpoint",
    app: "CrowdStrike Falcon",
    appInitials: "CS",
    appTone: "from-rose-500 to-red-600",
    artifact: "host-fin-laptop-091",
    artifactType: "ip",
    container: { kind: "incident", id: "INC-2741", name: "Spear-phishing — Finance dept" },
    status: "pending",
    initiatedAt: "3m ago",
    initiatedBy: "Phish Triage Agent",
    initiatedByInitials: "PT",
    initiatedByTone: "from-indigo-500 to-purple-600",
  },
  {
    id: "AP-7740",
    action: "Disable user account",
    app: "Okta",
    appInitials: "OK",
    appTone: "from-indigo-500 to-violet-600",
    artifact: "p.sharma@acme.com",
    artifactType: "email",
    container: { kind: "incident", id: "INC-2740", name: "Impossible travel — VIP" },
    status: "pending",
    initiatedAt: "9m ago",
    initiatedBy: "Identity Risk Watchdog",
    initiatedByInitials: "IR",
    initiatedByTone: "from-sky-500 to-blue-600",
  },
  {
    id: "AP-7739",
    action: "Block IoC at firewall",
    app: "Palo Alto NGFW",
    appInitials: "PA",
    appTone: "from-orange-500 to-red-600",
    artifact: "185.220.101.47",
    artifactType: "ip",
    container: { kind: "incident", id: "INC-2738", name: "C2 callback detected" },
    status: "pending",
    initiatedAt: "14m ago",
    initiatedBy: "Auto-rule · Block C2",
    initiatedByInitials: "AR",
    initiatedByTone: "from-fuchsia-500 to-pink-600",
  },
  {
    id: "AP-7738",
    action: "Quarantine mailbox",
    app: "Microsoft Sentinel",
    appInitials: "MS",
    appTone: "from-sky-500 to-blue-600",
    artifact: "INBX-9912",
    artifactType: "email",
    container: { kind: "incident", id: "INC-2735", name: "Bulk phishing wave" },
    status: "approved",
    initiatedAt: "32m ago",
    initiatedBy: "Phish Triage Agent",
    initiatedByInitials: "PT",
    initiatedByTone: "from-indigo-500 to-purple-600",
    decidedAt: "30m ago",
    decidedBy: "Ahmed Khan",
  },
  {
    id: "AP-7737",
    action: "Force password reset",
    app: "Okta",
    appInitials: "OK",
    appTone: "from-indigo-500 to-violet-600",
    artifact: "j.doe@acme.com",
    artifactType: "email",
    container: { kind: "incident", id: "INC-2729", name: "Credential leak in TI dump" },
    status: "declined",
    initiatedAt: "1h ago",
    initiatedBy: "Identity Risk Watchdog",
    initiatedByInitials: "IR",
    initiatedByTone: "from-sky-500 to-blue-600",
    decidedAt: "55m ago",
    decidedBy: "Sara Ahmed",
  },
  {
    id: "AP-7736",
    action: "Block sender domain",
    app: "Proofpoint TAP",
    appInitials: "PP",
    appTone: "from-amber-500 to-orange-600",
    artifact: "phisher.tk",
    artifactType: "domain",
    container: { kind: "advisory", id: "ADV-118", name: "Threat actor — APT-Storm" },
    status: "pending",
    initiatedAt: "1h ago",
    initiatedBy: "Threat Intel Enricher",
    initiatedByInitials: "TI",
    initiatedByTone: "from-emerald-500 to-teal-600",
  },
]
