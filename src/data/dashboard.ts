// Dashboard data

// ─── Shared ──────────────────────────────────────────────────────────────────

export type Severity = "critical" | "high" | "medium" | "low"

// Shared time-series bucket used by both Tickets and Threat Intel charts
export type SevBucket = {
  day: string
  sev5: number
  sev4: number
  sev3: number
  sev2: number
  sev1: number
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
function dayLabel(offset: number): string {
  const d = new Date(2026, 3, 7 + offset)
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

// ─── Operations ──────────────────────────────────────────────────────────────

export const ticketsStat = {
  total: 300,
  sev5: 60,
  sev4: 44,
  sev3: 39,
  sev2: 25,
  sev1: 99,
}

// Keep TicketsBucket as alias for backwards compat within this file
export type TicketsBucket = SevBucket

const rawTickets: [number, number, number, number, number][] = [
  [3,3,2,1,5],  [2,2,1,0,3],  [4,4,3,2,7],  [1,2,1,0,2],  [5,4,4,2,8],
  [2,3,2,1,4],  [3,2,2,1,3],  [6,5,4,3,9],  [2,2,1,1,3],  [4,3,3,2,7],
  [1,1,1,0,2],  [3,2,2,1,4],  [5,4,4,2,8],  [2,3,2,1,5],  [4,3,3,2,7],
  [2,2,1,1,3],  [3,3,2,1,6],  [7,6,5,3,10], [1,2,1,0,2],  [4,3,3,2,7],
  [2,2,2,1,4],  [3,3,2,1,5],  [5,4,4,2,8],  [2,2,1,1,4],  [4,3,3,2,7],
  [3,3,2,1,6],  [2,2,1,1,3],  [5,4,4,2,8],  [3,3,2,1,6],  [4,3,3,2,7],
]

export const ticketsTimeSeries: SevBucket[] = rawTickets.map(
  ([sev5, sev4, sev3, sev2, sev1], i) => ({ day: dayLabel(i), sev5, sev4, sev3, sev2, sev1 })
)

export const mttrStat = {
  value: "2h 13m",
  trend: "14%",
  direction: "up" as const,
  vsLastWeek: "1h 57m",
}

export const mttdStat = {
  value: "8m 42s",
  trend: "8%",
  direction: "down" as const,
  vsLastWeek: "1h 57m",
}

export const mttaStat = {
  value: "4m 12s",
  trend: "5%",
  direction: "down" as const,
  vsLastWeek: "4m 38s",
}

export type ThreatFeedItem = {
  title: string
  source: string
  age: string
  tags: string[]
}

export const threatFeedItems: ThreatFeedItem[] = [
  {
    title: "DC Attorney General Alleges Violation of Consumer Protection Law — Facebook Sued in U.S.",
    source: "Reuters Security",
    age: "2d ago",
    tags: ["Privacy", "Legal"],
  },
  {
    title: "Did Quora Hack Expose 100 Million Users? Answer: Yes, Hashed Passwords Stolen",
    source: "SecurityFocus",
    age: "3d ago",
    tags: ["Breach"],
  },
  {
    title: "[SECURITY] [DSA 4267-1] kamailio security update — buffer overflow vulnerability",
    source: "Bugtraq",
    age: "5d ago",
    tags: ["CVE", "Patch"],
  },
  {
    title: "North Korean Hackers Spotted Using New Golang-Based Backdoor for Espionage",
    source: "The Hacker News",
    age: "6d ago",
    tags: ["APT", "Malware"],
  },
]

export type ApprovalItem = {
  action: string
  target: string
  contextKind: "playbook" | "sara" | "sara-ai"
  contextLabel: string
  ref: string
  timeLeft: string
  urgent: boolean
}

export const approvalItems: ApprovalItem[] = [
  {
    action: "Block IP",
    target: "198.51.100.44",
    contextKind: "playbook",
    contextLabel: "Playbook",
    ref: "CSE-235461",
    timeLeft: "1h 11m",
    urgent: false,
  },
  {
    action: "Get IP info",
    target: "172.20.4.232",
    contextKind: "sara",
    contextLabel: "Sara",
    ref: "ALR-235461",
    timeLeft: "16m 25s",
    urgent: true,
  },
  {
    action: "Quarantine endpoint",
    target: "WKSTN-4471",
    contextKind: "sara-ai",
    contextLabel: "Sara AI",
    ref: "INC-235461",
    timeLeft: "1h 11m",
    urgent: false,
  },
]

// ─── Investigation ────────────────────────────────────────────────────────────

export type EntityRisk = "critical" | "high" | "elevated" | "medium" | "low"

export const entitiesStat = {
  total: 1595,
  low: 450,
  medium: 365,
  elevated: 305,
  high: 250,
  critical: 225,
}

export type EntityListItem = {
  name: string
  kind: string
  risk: EntityRisk
  count: number
}

export const entityList: EntityListItem[] = [
  { name: "payments-api-prod",     kind: "Application", risk: "critical", count: 33 },
  { name: "customer-pii-warehouse", kind: "Data",        risk: "critical", count: 33 },
  { name: "okta-saml-bridge",      kind: "Identity",    risk: "elevated", count: 12 },
  { name: "jenkins-ci-runner",     kind: "Application", risk: "medium",   count:  6 },
  { name: "corp-vpn-gateway",      kind: "Network",     risk: "low",      count:  4 },
]

export const threatIntelStat = {
  total: 186,
  sev5: 38,
  sev4: 29,
  sev3: 52,
  sev2: 41,
  sev1: 26,
}

const rawThreatIntel: [number, number, number, number, number][] = [
  [2,1,2,2,1], [1,1,1,1,1], [3,2,3,2,2], [1,1,2,1,1], [2,2,3,2,2],
  [1,1,2,2,1], [2,1,2,1,1], [3,2,3,3,2], [1,1,1,1,1], [2,2,2,2,1],
  [1,1,1,1,0], [2,1,2,1,1], [3,2,3,2,2], [1,2,2,1,1], [2,2,2,2,1],
  [1,1,1,1,1], [2,2,2,1,2], [4,3,4,3,2], [1,1,1,1,1], [2,2,2,2,1],
  [1,1,2,1,1], [2,2,2,1,2], [3,2,3,2,2], [1,1,1,1,1], [2,2,2,2,1],
  [2,1,2,1,2], [1,1,1,1,1], [3,2,3,2,2], [2,1,2,2,1], [2,2,2,2,1],
]

export const threatIntelTimeSeries: SevBucket[] = rawThreatIntel.map(
  ([sev5, sev4, sev3, sev2, sev1], i) => ({ day: dayLabel(i), sev5, sev4, sev3, sev2, sev1 })
)

// Hardcoded display stats — chart shape determined by s3Scores array below
export const s3Stat = { median: 13, avg: 20.9, p95: 68 }

// Distribution skewed low — majority of items are low-risk
export const s3Scores: number[] = [
  // Dense low cluster (5–13) — ~50% of data
  5, 6, 6, 7, 7, 7, 8, 8, 8, 8,
  9, 9, 9, 9, 9,
  10, 10, 10, 10, 10, 10,
  11, 11, 11, 11, 11,
  12, 12, 12, 12, 12, 12,
  13, 13, 13, 13, 13, 13, 13,
  // Low-medium (14–25) — ~25%
  14, 14, 15, 15, 16, 17, 17, 18, 19, 20, 20, 21, 22, 23, 24, 25, 25, 25,
  // Medium (26–50) — ~12%
  27, 29, 31, 34, 36, 39, 42, 45, 48, 50,
  // High (51–67) — ~8%
  53, 56, 59, 62, 65, 67,
  // Very high (68–100) — ~5% (P95 boundary)
  68, 72, 77, 82, 88, 95,
]

export type ArtifactKind = "SOURCE IP" | "HOSTNAME" | "VULNERABILITY" | "DOMAIN" | "FILE HASH"

export type ArtifactItem = {
  value: string
  kind: ArtifactKind
  incidents: number
  cases: number
  intels: number
  score: number
}

// ─── Automation ──────────────────────────────────────────────────────────────

export const agentActivityStat = {
  total: 8277,
  ready:    708,
  triage:  2060,
  analysis: 1849,
  mitigate: 1350,
  recover:   935,
  comms:     774,
  improve:   601,
}

export const AGENT_STAGE_KEYS = ["ready", "triage", "analysis", "mitigate", "recover", "comms", "improve"] as const
export type AgentStage = typeof AGENT_STAGE_KEYS[number]

export const AGENT_STAGE_COLORS: Record<AgentStage, string> = {
  ready:    "var(--muted-foreground)",
  triage:   "var(--info)",
  analysis: "var(--success)",
  mitigate: "var(--destructive)",
  recover:  "var(--warning)",
  comms:    "var(--attention)",
  improve:  "var(--primary)",
}

export type PlaybookStatus = "EXECUTED" | "RUNNING" | "FAILED"
export type PlaybookContextKind = "Case" | "Incident"

export type PlaybookRun = {
  name: string
  contextKind: PlaybookContextKind
  contextRef: string
  duration: string
  status: PlaybookStatus
}

export const playbookRuns: PlaybookRun[] = [
  { name: "Phishing Email Triage",             contextKind: "Case",     contextRef: "HZ-Testing",  duration: "2m 14s", status: "EXECUTED" },
  { name: "IOC Enrichment & Reputation Check", contextKind: "Incident", contextRef: "INC-2847",    duration: "42s",    status: "EXECUTED" },
  { name: "Endpoint Quarantine Workflow",       contextKind: "Incident", contextRef: "WKSTN-4471",  duration: "3m 47s", status: "RUNNING"  },
  { name: "Credential Stuffing Response",       contextKind: "Case",     contextRef: "CSE-1193",    duration: "1m 32s", status: "EXECUTED" },
  { name: "Brute Force Detection & Block",      contextKind: "Incident", contextRef: "INC-2851",    duration: "1m 08s", status: "EXECUTED" },
  { name: "Lateral Movement Containment",       contextKind: "Incident", contextRef: "INC-2849",    duration: "5m 22s", status: "RUNNING"  },
]

export const failedRunsStat = {
  count: 44,
  trend: "23%",
  direction: "up" as const,
  mostFailures: "Phishing Agent",
}

export const ingestionHealthStat = {
  value: "99.4%",
  trend: "0.2%",
  direction: "down" as const,
  activeSources: 18,
  totalSources: 19,
  lastDayIngests: "1.2M events",
  degradedSource: "Syslog-NG",
}

export const playbookRunsStat = {
  count: 254,
  trend: "8%",
  direction: "up" as const,
  mostRun: "Phishing Response",
}

// ─── Time-filtered dashboard data ────────────────────────────────────────────

export type TimeFilter = "1H" | "24H" | "7D" | "30D" | "90D"

export type SevStat   = { total: number; sev5: number; sev4: number; sev3: number; sev2: number; sev1: number }
export type MtrStat   = { value: string; trend: string; direction: "up" | "down"; vsLastWeek: string }
export type CountStat = { count: number; trend: string; direction: "up" | "down"; mostFailures?: string; mostRun?: string }
export type AgentStat = { total: number; ready: number; triage: number; analysis: number; mitigate: number; recover: number; comms: number; improve: number }

export type FilteredData = {
  ticketsStat: SevStat
  ticketsTimeSeries: SevBucket[]
  threatIntelStat: SevStat
  threatIntelTimeSeries: SevBucket[]
  mttr: MtrStat
  mttd: MtrStat
  mtta: MtrStat
  playbookRuns: CountStat
  failedRuns: CountStat
  agentActivity: AgentStat
}

function genBuckets(
  pat: [number, number, number, number, number][],
  n: number,
  scale: number,
  labelFn: (i: number) => string,
): SevBucket[] {
  return Array.from({ length: n }, (_, i) => {
    const [s5, s4, s3, s2, s1] = pat[i % pat.length]
    return {
      day:  labelFn(i),
      sev5: Math.max(0, Math.round(s5 * scale)),
      sev4: Math.max(0, Math.round(s4 * scale)),
      sev3: Math.max(0, Math.round(s3 * scale)),
      sev2: Math.max(0, Math.round(s2 * scale)),
      sev1: Math.max(0, Math.round(s1 * scale)),
    }
  })
}

const MIN_LBL   = (i: number): string => { const m = i * 5; return `${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}` }
const HOUR_LBL  = (i: number): string => `${String(i).padStart(2,"0")}:00`
const WDAY_LBL  = (i: number): string => ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i % 7]
const DAY90_LBL = (i: number): string => { const d = new Date(2026, 1, 6 + i); return `${MONTHS[d.getMonth()]} ${d.getDate()}` }

export const FILTER_DASHBOARD: Record<TimeFilter, FilteredData> = {
  "1H": {
    ticketsStat:           { total: 8,     sev5: 2,   sev4: 1,   sev3: 1,   sev2: 1,   sev1: 3   },
    ticketsTimeSeries:     genBuckets(rawTickets,     12, 0.15, MIN_LBL),
    threatIntelStat:       { total: 3,     sev5: 1,   sev4: 0,   sev3: 1,   sev2: 1,   sev1: 0   },
    threatIntelTimeSeries: genBuckets(rawThreatIntel, 12, 0.15, MIN_LBL),
    mttr: { value: "2h 04m", trend: "3%",  direction: "up",   vsLastWeek: "2h 01m" },
    mttd: { value: "7m 38s", trend: "4%",  direction: "down", vsLastWeek: "7m 58s" },
    mtta: { value: "3m 52s", trend: "2%",  direction: "down", vsLastWeek: "3m 58s" },
    playbookRuns: { count: 11,  trend: "3%",  direction: "up",   mostRun:      "Phishing Response" },
    failedRuns:   { count: 2,   trend: "5%",  direction: "up",   mostFailures: "Phishing Agent"    },
    agentActivity:{ total: 344,   ready: 29,   triage: 86,   analysis: 77,   mitigate: 56,  recover: 39,  comms: 32,  improve: 25  },
  },
  "24H": {
    ticketsStat:           { total: 47,    sev5: 9,   sev4: 6,   sev3: 8,   sev2: 7,   sev1: 17  },
    ticketsTimeSeries:     genBuckets(rawTickets,     24, 0.3, HOUR_LBL),
    threatIntelStat:       { total: 22,    sev5: 5,   sev4: 4,   sev3: 6,   sev2: 4,   sev1: 3   },
    threatIntelTimeSeries: genBuckets(rawThreatIntel, 24, 0.3, HOUR_LBL),
    mttr: { value: "1h 58m", trend: "6%",  direction: "down", vsLastWeek: "2h 06m" },
    mttd: { value: "7m 51s", trend: "9%",  direction: "down", vsLastWeek: "8m 37s" },
    mtta: { value: "3m 58s", trend: "2%",  direction: "up",   vsLastWeek: "3m 54s" },
    playbookRuns: { count: 62,  trend: "11%", direction: "up",   mostRun:      "Phishing Response" },
    failedRuns:   { count: 9,   trend: "10%", direction: "down", mostFailures: "Phishing Agent"    },
    agentActivity:{ total: 1822,  ready: 156,  triage: 453,  analysis: 407,  mitigate: 297, recover: 206, comms: 170, improve: 133 },
  },
  "7D": {
    ticketsStat:           { total: 124,   sev5: 22,  sev4: 18,  sev3: 24,  sev2: 16,  sev1: 44  },
    ticketsTimeSeries:     genBuckets(rawTickets,     7, 1, WDAY_LBL),
    threatIntelStat:       { total: 71,    sev5: 14,  sev4: 11,  sev3: 19,  sev2: 14,  sev1: 13  },
    threatIntelTimeSeries: genBuckets(rawThreatIntel, 7, 1, WDAY_LBL),
    mttr: { value: "2h 01m", trend: "7%",  direction: "down", vsLastWeek: "2h 10m" },
    mttd: { value: "8m 14s", trend: "5%",  direction: "down", vsLastWeek: "8m 41s" },
    mtta: { value: "4m 02s", trend: "1%",  direction: "down", vsLastWeek: "4m 04s" },
    playbookRuns: { count: 148, trend: "6%",  direction: "up",   mostRun:      "Phishing Response" },
    failedRuns:   { count: 21,  trend: "7%",  direction: "up",   mostFailures: "Phishing Agent"    },
    agentActivity:{ total: 5183,  ready: 444,  triage: 1288, analysis: 1156, mitigate: 844, recover: 585, comms: 484, improve: 376 },
  },
  "30D": {
    ticketsStat,
    ticketsTimeSeries,
    threatIntelStat,
    threatIntelTimeSeries,
    mttr: mttrStat,
    mttd: mttdStat,
    mtta: mttaStat,
    playbookRuns: playbookRunsStat,
    failedRuns:   failedRunsStat,
    agentActivity: agentActivityStat,
  },
  "90D": {
    ticketsStat:           { total: 891,   sev5: 178, sev4: 131, sev3: 116, sev2: 74,  sev1: 392 },
    ticketsTimeSeries:     genBuckets(rawTickets,     90, 1, DAY90_LBL),
    threatIntelStat:       { total: 556,   sev5: 113, sev4: 86,  sev3: 155, sev2: 122, sev1: 80  },
    threatIntelTimeSeries: genBuckets(rawThreatIntel, 90, 1, DAY90_LBL),
    mttr: { value: "2h 31m", trend: "18%", direction: "up",  vsLastWeek: "2h 08m" },
    mttd: { value: "9m 14s", trend: "12%", direction: "up",  vsLastWeek: "8m 14s" },
    mtta: { value: "4m 38s", trend: "4%",  direction: "up",  vsLastWeek: "4m 27s" },
    playbookRuns: { count: 762,  trend: "22%", direction: "up",  mostRun:      "Phishing Response" },
    failedRuns:   { count: 132,  trend: "15%", direction: "up",  mostFailures: "Phishing Agent"    },
    agentActivity:{ total: 24831, ready: 2124, triage: 6180, analysis: 5547, mitigate: 4050, recover: 2805, comms: 2322, improve: 1803 },
  },
}

// ─────────────────────────────────────────────────────────────────────────────

export const artifactList: ArtifactItem[] = [
  { value: "198.51.100.44",        kind: "SOURCE IP",     incidents: 47, cases: 12, intels:  3, score: 62 },
  { value: "WKSTN-4471",           kind: "HOSTNAME",      incidents: 23, cases:  8, intels:  1, score: 32 },
  { value: "CVE-2026-33557",       kind: "VULNERABILITY", incidents: 18, cases:  5, intels: 12, score: 35 },
  { value: "malware.example.com",  kind: "DOMAIN",        incidents: 15, cases:  7, intels:  0, score: 22 },
  { value: "d41d8cd98f00b204e980", kind: "FILE HASH",     incidents: 11, cases:  4, intels:  9, score: 24 },
]
