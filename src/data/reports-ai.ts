/**
 * Fixtures for the Co-Analyst layer of Reports — evidence records, insights,
 * narrative claims, saved searches, audience variants and the block library.
 *
 * Fixture data only. Never paste real tenant data, IOCs or credentials here.
 */

import type { Claim, ComposeAudience, Evidence, Insight } from "@/features/reports/ai/ai-types"
import type { ReportModule } from "./reports"

/* ------------------------------------------------------------------ */
/* Evidence — every generated claim points at one of these             */
/* ------------------------------------------------------------------ */

export const evidenceRecords: Record<string, Evidence> = {
  "ev-volume": {
    id: "ev-volume",
    query: "incidents where created_at in last 7 days",
    module: "incident",
    window: "12–18 Aug 2026",
    matched: 139,
    samples: [
      { id: "INC-4471", label: "Credential stuffing — VPN gateway" },
      { id: "INC-4468", label: "Suspicious OAuth grant — finance tenant" },
      { id: "INC-4455", label: "Phishing wave — invoice lure" },
    ],
    confidence: 0.94,
    comparedWith: "5–11 Aug 2026 (124 incidents)",
  },
  "ev-mttr": {
    id: "ev-mttr",
    query: "avg(responded_at - created_at) where state != 'new'",
    module: "incident",
    window: "12–18 Aug 2026",
    matched: 131,
    samples: [
      { id: "INC-4471", label: "Responded in 12m" },
      { id: "INC-4460", label: "Responded in 51m" },
      { id: "INC-4433", label: "Responded in 2h 04m" },
    ],
    confidence: 0.88,
    comparedWith: "prior 7 days (51m)",
  },
  "ev-vpn": {
    id: "ev-vpn",
    query: "incidents where detection_rule = 'auth.bruteforce.vpn'",
    module: "incident",
    window: "12–18 Aug 2026",
    matched: 47,
    samples: [
      { id: "INC-4471", label: "312 failed auths from 14 ASNs" },
      { id: "INC-4469", label: "Same source range, second wave" },
    ],
    confidence: 0.91,
  },
  "ev-critical-aging": {
    id: "ev-critical-aging",
    query: "incidents where severity = 'critical' and state = 'open' and age > 72h",
    module: "incident",
    window: "as of 18 Aug 2026, 06:00",
    matched: 3,
    samples: [
      { id: "INC-4402", label: "Open 5d — awaiting vendor patch" },
      { id: "INC-4388", label: "Open 4d — pending legal review" },
      { id: "INC-4361", label: "Open 8d — blocked on asset owner" },
    ],
    confidence: 0.99,
  },
  "ev-sla": {
    id: "ev-sla",
    query: "sla_breaches / total_incidents group by team",
    module: "incident",
    window: "12–18 Aug 2026",
    matched: 139,
    samples: [
      { id: "TEAM-TIER1", label: "96.4% within target" },
      { id: "TEAM-TIER2", label: "91.2% within target" },
      { id: "TEAM-IR", label: "88.7% within target" },
    ],
    confidence: 0.82,
    comparedWith: "prior 7 days (93.1% overall)",
  },
  "ev-exfil": {
    id: "ev-exfil",
    query: "incidents where category = 'data-exfiltration' and disposition = 'true-positive'",
    module: "incident",
    window: "12–18 Aug 2026",
    matched: 0,
    samples: [],
    confidence: 0.71,
  },
  "ev-attck": {
    id: "ev-attck",
    query: "technique_hits group by attck_id order by count desc",
    module: "incident",
    window: "12–18 Aug 2026",
    matched: 214,
    samples: [
      { id: "T1110", label: "Brute force — 47 hits" },
      { id: "T1566", label: "Phishing — 38 hits" },
      { id: "T1078", label: "Valid accounts — 29 hits" },
    ],
    confidence: 0.86,
  },
  "ev-intel": {
    id: "ev-intel",
    query: "threat_intel where confidence >= 90 and disposition = 'true-positive'",
    module: "threatIntel",
    window: "12–18 Aug 2026",
    matched: 62,
    samples: [
      { id: "TI-2291", label: "APT29 infrastructure overlap" },
      { id: "TI-2288", label: "Commodity loader C2 rotation" },
    ],
    confidence: 0.79,
  },
  "ev-automation": {
    id: "ev-automation",
    query: "playbook_runs where outcome = 'contained' and trigger = 'auto'",
    module: "incident",
    window: "12–18 Aug 2026",
    matched: 1204,
    samples: [
      { id: "RUN-88412", label: "Isolate host — 41s" },
      { id: "RUN-88377", label: "Disable account — 12s" },
    ],
    confidence: 0.93,
  },
  "ev-phishing": {
    id: "ev-phishing",
    query: "cases where category = 'phishing' and state != 'closed'",
    module: "cases",
    window: "as of 18 Aug 2026",
    matched: 18,
    samples: [
      { id: "CASE-771", label: "Invoice lure — 6 recipients" },
      { id: "CASE-768", label: "Payroll redirect attempt" },
    ],
    confidence: 0.9,
  },
}

/* ------------------------------------------------------------------ */
/* Insights the platform surfaces on its own                           */
/* ------------------------------------------------------------------ */

export const reportInsights: Insight[] = [
  {
    id: "in-1",
    kind: "anomaly",
    headline: "VPN brute-force volume tripled midweek",
    detail:
      "47 incidents fired on auth.bruteforce.vpn between Wednesday and Thursday, against a 14-day baseline of 5 per day. Source addresses rotated across 14 ASNs, which is why per-source rate limiting did not suppress it.",
    delta: "+212%",
    direction: "up",
    adverse: true,
    evidenceId: "ev-vpn",
  },
  {
    id: "in-2",
    kind: "improvement",
    headline: "Mean time to respond improved to 42 minutes",
    detail:
      "Automated containment handled the majority of tier-1 triage this period, cutting nine minutes off the median response. The gain is concentrated in credential-access incidents; manual investigation time is flat.",
    delta: "−18%",
    direction: "down",
    adverse: false,
    evidenceId: "ev-mttr",
  },
  {
    id: "in-3",
    kind: "risk",
    headline: "Three critical incidents have aged past 72 hours",
    detail:
      "All three are blocked on parties outside the SOC — a vendor patch, a legal review, and an unresponsive asset owner. None have moved state in four days.",
    direction: "up",
    adverse: true,
    evidenceId: "ev-critical-aging",
  },
  {
    id: "in-4",
    kind: "trend",
    headline: "SLA attainment slipped in the IR team only",
    detail:
      "Overall attainment held at 94%, but the incident-response team dropped to 88.7% — driven by the same aging critical cases rather than by intake volume.",
    delta: "−4.4pp",
    direction: "down",
    adverse: true,
    evidenceId: "ev-sla",
  },
  {
    id: "in-5",
    kind: "improvement",
    headline: "No confirmed data exfiltration this period",
    detail:
      "Zero exfiltration incidents reached a true-positive disposition. Confidence is moderate: two cases are still under investigation and could reclassify.",
    adverse: false,
    evidenceId: "ev-exfil",
  },
]

/* ------------------------------------------------------------------ */
/* Narrative claims — generated prose, sentence by sentence            */
/* ------------------------------------------------------------------ */

export const execSummaryClaims: Claim[] = [
  {
    id: "cl-1",
    text: "Incident volume rose 12% to 139 cases, driven mainly by a credential-stuffing campaign against the VPN gateway.",
    evidenceId: "ev-volume",
  },
  {
    id: "cl-2",
    text: "Mean time to respond improved to 42 minutes as automated containment absorbed most tier-1 triage.",
    evidenceId: "ev-mttr",
  },
  {
    id: "cl-3",
    text: "Three critical incidents remain open past 72 hours, each blocked on a party outside the SOC.",
    evidenceId: "ev-critical-aging",
  },
  {
    id: "cl-4",
    text: "No confirmed data exfiltration was observed during the reporting period.",
    evidenceId: "ev-exfil",
  },
]

export const recommendationClaims: Claim[] = [
  {
    id: "cl-5",
    text: "Roll out conditional access on the VPN and identity plane to close the gap this campaign exploited.",
    evidenceId: "ev-vpn",
  },
  {
    id: "cl-6",
    text: "Tune auth.bruteforce.vpn to correlate across source ASNs so a rotating campaign raises one incident, not 47.",
    evidenceId: "ev-vpn",
  },
  {
    id: "cl-7",
    text: "Escalate the three aging critical cases to their blocking owners at the next handover.",
    evidenceId: "ev-critical-aging",
  },
]

/* ------------------------------------------------------------------ */
/* Saved searches — what a data block can bind to                      */
/* ------------------------------------------------------------------ */

export type SavedSearch = {
  id: string
  name: string
  module: ReportModule
  summary: string
}

export const savedSearches: SavedSearch[] = [
  { id: "ss-1", name: "Critical & open", module: "incident", summary: "severity: critical · state: open, in progress" },
  { id: "ss-2", name: "SLA at risk", module: "incident", summary: "sla_remaining < 4h · state: not closed" },
  { id: "ss-3", name: "Credential access", module: "incident", summary: "attck_tactic: credential-access" },
  { id: "ss-4", name: "High-confidence intel", module: "threatIntel", summary: "confidence ≥ 90 · disposition: true-positive" },
  { id: "ss-5", name: "Phishing backlog", module: "cases", summary: "category: phishing · state: not closed" },
  { id: "ss-6", name: "Automation-contained", module: "incident", summary: "closed_by: playbook · outcome: contained" },
]

/* ------------------------------------------------------------------ */
/* Audience variants — one report, several cuts                        */
/* ------------------------------------------------------------------ */

export type AudienceVariant = {
  id: ComposeAudience
  label: string
  description: string
  pageTarget: number
  omits: string[]
}

export const audienceVariants: AudienceVariant[] = [
  {
    id: "executive",
    label: "Executive",
    description: "Headline figures, narrative, and recommendations. No record-level detail.",
    pageTarget: 2,
    omits: ["Entity tables", "Raw indicator lists", "Playbook run logs"],
  },
  {
    id: "analyst",
    label: "Analyst",
    description: "Everything the executive cut has, plus record-level appendices.",
    pageTarget: 8,
    omits: [],
  },
  {
    id: "auditor",
    label: "Auditor",
    description: "Control coverage, SLA attainment and evidence trail. Narrative removed.",
    pageTarget: 6,
    omits: ["Generated narrative", "Recommendations"],
  },
  {
    id: "customer",
    label: "Customer",
    description: "Tenant-scoped figures only, with internal analyst names and IOC detail redacted.",
    pageTarget: 3,
    omits: ["Analyst names", "Indicator values", "Detection rule names"],
  },
]

/* ------------------------------------------------------------------ */
/* Block library — reusable saved sections                             */
/* ------------------------------------------------------------------ */

export type LibraryBlock = {
  id: string
  name: string
  blockType: string
  description: string
  usedIn: number
  owner: "org" | "personal"
}

export const seedLibraryBlocks: LibraryBlock[] = [
  {
    id: "lb-1",
    name: "Board cover — SIRP branded",
    blockType: "cover",
    description: "TLP:AMBER banner, tenant logo, prepared-for line.",
    usedIn: 7,
    owner: "org",
  },
  {
    id: "lb-2",
    name: "Standard exec summary",
    blockType: "execSummary",
    description: "Generated narrative with evidence, four claims.",
    usedIn: 5,
    owner: "org",
  },
  {
    id: "lb-3",
    name: "SLA by team table",
    blockType: "table",
    description: "Attainment per team with breach counts.",
    usedIn: 4,
    owner: "org",
  },
  {
    id: "lb-4",
    name: "Confidentiality footer",
    blockType: "callout",
    description: "Standard distribution restriction wording.",
    usedIn: 9,
    owner: "org",
  },
]

/* ------------------------------------------------------------------ */
/* Template versions                                                   */
/* ------------------------------------------------------------------ */

export type TemplateVersion = {
  version: string
  publishedOn: string
  author: string
  note: string
  current?: boolean
}

export const templateVersions: Record<string, TemplateVersion[]> = {
  "t-1": [
    { version: "v4", publishedOn: "14 Aug 2026", author: "Ahmed Al-Rashid", note: "Added anomaly callout; MITRE section moved to appendix.", current: true },
    { version: "v3", publishedOn: "28 Jul 2026", author: "Sara Chen", note: "Switched cover to tenant branding." },
    { version: "v2", publishedOn: "02 Jul 2026", author: "Ahmed Al-Rashid", note: "Dropped raw IOC table for the exec cut." },
    { version: "v1", publishedOn: "11 Jun 2026", author: "Sara Chen", note: "Initial publish." },
  ],
}
