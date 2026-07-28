/**
 * Pre-Ingestion Rules — the one piece of the old Automation tab's SOAR
 * chain (Vendor → Application → Actions → Ingestion Sources →
 * Pre-Ingestion Rules) that's actually live today; everything upstream of
 * it is disabled. Field shape matches the real table (id, name, enabled,
 * action, rule order, created at) — sample set is deliberately larger
 * (24 rows) than the real 5, to demo how the page behaves once a tenant
 * has actually accumulated rules over time, not just a handful.
 */

export type PreIngestionAction = "link_and_update" | "create_new" | "discard"

export type PreIngestionRule = {
  id: number
  name: string
  description: string
  enabled: boolean
  action: PreIngestionAction
  /** Evaluation priority — lower runs first. Ties break by id. */
  ruleOrder: number
  createdAt: string
  /** Alerts this rule matched today — real operational signal, not just config. */
  matchesToday: number
  /** 7-point sparkline, oldest to newest. */
  matchTrend: number[]
}

export const preIngestionActionMeta: Record<PreIngestionAction, { label: string }> = {
  link_and_update: { label: "Link & update" },
  create_new: { label: "Create new" },
  discard: { label: "Discard" },
}

export const preIngestionRules: PreIngestionRule[] = [
  { id: 10, name: "New vendor alert intake", description: "First-seen source with no matching open case — always start fresh.", enabled: true, action: "create_new", ruleOrder: 0, createdAt: "2025-03-04", matchesToday: 18, matchTrend: [12, 15, 14, 19, 16, 20, 18] },
  { id: 6, name: "Closing note", description: "Alert references a case already resolved in the last 24h — attach as a note, don't reopen.", enabled: true, action: "link_and_update", ruleOrder: 1, createdAt: "2025-02-24", matchesToday: 6, matchTrend: [4, 5, 3, 6, 5, 7, 6] },
  { id: 3, name: "Re-opened ticket sync", description: "Vendor marks the underlying ticket re-opened — link back to the original case.", enabled: true, action: "link_and_update", ruleOrder: 2, createdAt: "2025-02-18", matchesToday: 3, matchTrend: [2, 1, 3, 2, 4, 2, 3] },
  { id: 2, name: "Duplicate phishing report", description: "Same reporter, same sender, within 1 hour — fold into the existing case instead of duplicating.", enabled: false, action: "link_and_update", ruleOrder: 3, createdAt: "2025-02-17", matchesToday: 0, matchTrend: [3, 2, 1, 0, 0, 0, 0] },
  { id: 13, name: "QA test traffic", description: "Synthetic alerts from the staging connector — never create a real case.", enabled: true, action: "discard", ruleOrder: 4, createdAt: "2026-07-15", matchesToday: 41, matchTrend: [30, 35, 33, 38, 40, 37, 41] },
  { id: 14, name: "Known false-positive scanner IP", description: "Internal vuln-scanner IP range — always benign, never worth a case.", enabled: true, action: "discard", ruleOrder: 5, createdAt: "2025-04-02", matchesToday: 12, matchTrend: [9, 11, 8, 13, 10, 12, 12] },
  { id: 15, name: "Vendor heartbeat / keepalive", description: "Connector health-check pings misclassified as alerts by two older feeds.", enabled: true, action: "discard", ruleOrder: 6, createdAt: "2025-04-09", matchesToday: 87, matchTrend: [80, 84, 79, 90, 85, 88, 87] },
  { id: 16, name: "Re-triggered SLA breach", description: "Same incident, SLA timer re-fires after a snooze — update instead of new case.", enabled: true, action: "link_and_update", ruleOrder: 7, createdAt: "2025-05-01", matchesToday: 2, matchTrend: [1, 2, 1, 3, 2, 2, 2] },
  { id: 17, name: "Merge duplicate malware hash", description: "Same file hash reported by 2+ EDR agents within 10 minutes.", enabled: true, action: "link_and_update", ruleOrder: 8, createdAt: "2025-05-14", matchesToday: 9, matchTrend: [6, 8, 7, 10, 9, 11, 9] },
  { id: 18, name: "Contractor VPN noise", description: "Known noisy contractor VPN egress range — high volume, low signal.", enabled: true, action: "discard", ruleOrder: 9, createdAt: "2025-05-22", matchesToday: 23, matchTrend: [18, 20, 22, 19, 24, 21, 23] },
  { id: 19, name: "Cloud provider maintenance window", description: "Suppress alerts during published cloud-provider maintenance windows.", enabled: false, action: "discard", ruleOrder: 10, createdAt: "2025-06-03", matchesToday: 5, matchTrend: [0, 0, 12, 8, 0, 0, 5] },
  { id: 20, name: "Escalation acknowledgement sync", description: "On-call ack received via PagerDuty — reflect back on the case timeline.", enabled: true, action: "link_and_update", ruleOrder: 11, createdAt: "2025-06-11", matchesToday: 4, matchTrend: [3, 4, 2, 5, 3, 4, 4] },
  { id: 21, name: "New tenant onboarding alert", description: "First alert from a newly provisioned tenant — always opens a case.", enabled: true, action: "create_new", ruleOrder: 12, createdAt: "2025-06-20", matchesToday: 1, matchTrend: [0, 1, 0, 2, 1, 0, 1] },
  { id: 22, name: "Suppressed low-confidence IOC", description: "Threat-intel confidence below 40 — log for review, don't case it.", enabled: true, action: "discard", ruleOrder: 13, createdAt: "2025-07-02", matchesToday: 15, matchTrend: [10, 13, 11, 16, 14, 17, 15] },
  { id: 23, name: "Analyst manual re-open", description: "Analyst-tagged re-open request via portal — link to prior case.", enabled: true, action: "link_and_update", ruleOrder: 14, createdAt: "2025-07-18", matchesToday: 2, matchTrend: [1, 2, 1, 1, 2, 3, 2] },
  { id: 24, name: "Third-party enrichment callback", description: "Async enrichment result returns after the alert already landed.", enabled: true, action: "link_and_update", ruleOrder: 15, createdAt: "2025-08-05", matchesToday: 7, matchTrend: [5, 6, 8, 7, 9, 6, 7] },
  { id: 25, name: "Bulk import batch marker", description: "Historical bulk-import marker rows — never real alerts.", enabled: false, action: "discard", ruleOrder: 16, createdAt: "2025-08-19", matchesToday: 0, matchTrend: [0, 0, 0, 0, 0, 0, 0] },
  { id: 26, name: "Vendor rebrand alias match", description: "Old vendor name still appears in a subset of feeds post-rebrand.", enabled: true, action: "link_and_update", ruleOrder: 17, createdAt: "2025-09-01", matchesToday: 3, matchTrend: [2, 3, 2, 4, 3, 3, 3] },
  { id: 27, name: "Weekend on-call auto-ack", description: "Weekend low-priority alerts auto-acknowledged, still linked for Monday review.", enabled: true, action: "link_and_update", ruleOrder: 18, createdAt: "2025-09-14", matchesToday: 1, matchTrend: [0, 1, 2, 1, 0, 1, 1] },
  { id: 28, name: "Sandbox detonation result", description: "OmniScan sandbox verdict returns — always worth a fresh case.", enabled: true, action: "create_new", ruleOrder: 19, createdAt: "2025-10-02", matchesToday: 6, matchTrend: [4, 5, 6, 5, 7, 6, 6] },
  { id: 29, name: "Staging environment alerts", description: "Alerts tagged env=staging — never customer-facing.", enabled: false, action: "discard", ruleOrder: 20, createdAt: "2025-10-20", matchesToday: 0, matchTrend: [0, 0, 0, 0, 0, 0, 0] },
  { id: 30, name: "Legacy SIEM migration tag", description: "Transitional rule while the old Splunk pipeline winds down.", enabled: true, action: "link_and_update", ruleOrder: 21, createdAt: "2025-11-11", matchesToday: 2, matchTrend: [4, 3, 3, 2, 2, 1, 2] },
  { id: 31, name: "Compliance audit trail note", description: "Auditor-tagged alerts get attached as a note on the compliance case.", enabled: true, action: "link_and_update", ruleOrder: 22, createdAt: "2025-12-01", matchesToday: 1, matchTrend: [0, 1, 1, 0, 1, 2, 1] },
  { id: 32, name: "Default catch-all", description: "Nothing else matched — always safe to open a new case.", enabled: true, action: "create_new", ruleOrder: 23, createdAt: "2026-01-05", matchesToday: 4, matchTrend: [3, 4, 5, 3, 4, 4, 4] },
]
