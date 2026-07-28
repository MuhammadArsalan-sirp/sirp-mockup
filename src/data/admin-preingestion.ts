/**
 * Pre-Ingestion Rules — the one piece of the old Automation tab's SOAR
 * chain (Vendor → Application → Actions → Ingestion Sources →
 * Pre-Ingestion Rules) that's actually live today; everything upstream of
 * it is disabled. Field shape matches the real table (id, name, enabled,
 * action, rule order, created at) — only the sample names are cleaned up
 * for a demo instead of leftover QA rows.
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
}

export const preIngestionActionMeta: Record<PreIngestionAction, { label: string }> = {
  link_and_update: { label: "Link & update" },
  create_new: { label: "Create new" },
  discard: { label: "Discard" },
}

export const preIngestionRules: PreIngestionRule[] = [
  {
    id: 10,
    name: "New vendor alert intake",
    description: "First-seen source with no matching open case — always start fresh.",
    enabled: true,
    action: "create_new",
    ruleOrder: 0,
    createdAt: "2025-03-04",
  },
  {
    id: 6,
    name: "Closing note",
    description: "Alert references a case already resolved in the last 24h — attach as a note, don't reopen.",
    enabled: true,
    action: "link_and_update",
    ruleOrder: 1,
    createdAt: "2025-02-24",
  },
  {
    id: 3,
    name: "Re-opened ticket sync",
    description: "Vendor marks the underlying ticket re-opened — link back to the original case.",
    enabled: true,
    action: "link_and_update",
    ruleOrder: 2,
    createdAt: "2025-02-18",
  },
  {
    id: 2,
    name: "Duplicate phishing report",
    description: "Same reporter, same sender, within 1 hour — fold into the existing case instead of duplicating.",
    enabled: false,
    action: "link_and_update",
    ruleOrder: 3,
    createdAt: "2025-02-17",
  },
  {
    id: 13,
    name: "QA test traffic",
    description: "Synthetic alerts from the staging connector — never create a real case.",
    enabled: true,
    action: "discard",
    ruleOrder: 4,
    createdAt: "2026-07-15",
  },
]
