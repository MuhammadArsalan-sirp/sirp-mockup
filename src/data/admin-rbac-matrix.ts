/**
 * Cross-role permission matrix — every role against every permission
 * module, at a glance. Complements `socManagerPermissions` (the detailed,
 * one-role-at-a-time permission editor in `admin.ts`): that view answers
 * "what can this role do", this fixture answers "who can touch this
 * module" — the comparison you can't get from opening 12 roles one by one.
 *
 * Levels are coarse on purpose (full / partial / none) — a mockup stand-in
 * for "all permissions in this module granted" vs "some" vs "none".
 */

export type AccessLevel = "full" | "partial" | "none"

export const roleGroupAccess: Record<string, Record<string, AccessLevel>> = {
  r_super_admin:   { incidents: "full",    cases: "full",    ti: "full",    sara: "full",    users: "full",    config: "full",    system: "full",    audit: "full" },
  r_soc_mgr:       { incidents: "full",    cases: "full",    ti: "partial", sara: "full",    users: "partial", config: "partial", system: "none",    audit: "partial" },
  r_tier2:         { incidents: "partial", cases: "partial", ti: "partial", sara: "partial", users: "none",    config: "none",    system: "none",    audit: "none" },
  r_tier1:         { incidents: "partial", cases: "partial", ti: "partial", sara: "partial", users: "none",    config: "none",    system: "none",    audit: "none" },
  r_ir_lead:       { incidents: "full",    cases: "full",    ti: "partial", sara: "partial", users: "none",    config: "partial", system: "none",    audit: "partial" },
  r_threat_hunter: { incidents: "partial", cases: "partial", ti: "full",    sara: "partial", users: "none",    config: "none",    system: "none",    audit: "none" },
  r_auditor:       { incidents: "partial", cases: "partial", ti: "partial", sara: "none",    users: "partial", config: "none",    system: "none",    audit: "full" },
  r_compliance:    { incidents: "none",    cases: "none",    ti: "none",    sara: "none",    users: "partial", config: "partial", system: "partial", audit: "full" },
  r_asset_owner:   { incidents: "partial", cases: "none",    ti: "none",    sara: "none",    users: "none",    config: "none",    system: "none",    audit: "none" },
  r_dept_head:     { incidents: "partial", cases: "partial", ti: "none",   sara: "none",    users: "partial", config: "none",    system: "none",    audit: "none" },
  r_external:      { incidents: "partial", cases: "partial", ti: "none",   sara: "none",    users: "none",    config: "none",    system: "none",    audit: "none" },
  r_api:           { incidents: "partial", cases: "none",    ti: "partial", sara: "partial", users: "none",    config: "none",    system: "none",    audit: "none" },
}
