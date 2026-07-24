import type { Tone } from "@/lib/tone"

/**
 * Fixture data for the admin-wide Sara dock (`admin-sara-dock.tsx`) and the
 * "Sara recommends" panel on the Security Posture page. Both surfaces read
 * from the same `saraFindings` list on purpose — it's the same proactive
 * audit, just surfaced in two places, so applying/dismissing a finding in
 * one place is a fact about the finding, not about the page.
 *
 * `diff` is a one-line before/after pair rendered in monospace — mockup
 * shorthand for "the exact config change Sara would make."
 */

export type SaraFindingSeverity = "high" | "medium" | "low"

/**
 * How Sara is allowed to act on this finding — separate axis from severity.
 * A "high" severity issue and a "medium" one can carry the same risk tier;
 * what matters here is blast radius / reversibility of the FIX, not how bad
 * the underlying problem is.
 *   auto    → Sara can apply it directly (Apply / Dismiss)
 *   approve → goes to the Approval Queue; no direct Apply from chat or posture
 */
export type SaraRiskTier = "auto" | "approve"

export type SaraFinding = {
  id: string
  title: string
  detail: string
  severity: SaraFindingSeverity
  riskTier: SaraRiskTier
  /** Short steps Sara says it checked before raising this — builds trust, shown collapsed by default. */
  steps: string[]
  /** Where this finding is "about" — used to link back into the relevant admin page. */
  area: { label: string; href: string }
  diff: { remove: string; add: string }
  /** Matched against free-text chat input to surface this finding as a reply. */
  trigger: RegExp
}

export const saraFindingTone: Record<SaraFindingSeverity, Tone> = {
  high: "alert",
  medium: "warn",
  low: "info",
}

export const saraRiskTierMeta: Record<SaraRiskTier, { label: string; tone: Tone }> = {
  auto: { label: "Auto-safe", tone: "ok" },
  approve: { label: "Needs approval", tone: "warn" },
}

/** Categories Sara is never allowed to touch, at any tier — shown as a static
 *  boundary note on the Approval Queue, not tied to any individual finding. */
export const saraBlockedActions: string[] = [
  "Deleting a tenant or organization",
  "Changing billing, license plan, or seat count",
  "Editing the Super Admin role",
]

export const saraFindings: SaraFinding[] = [
  {
    id: "f_sso_unused",
    title: "Google Workspace SSO hasn't been used in 94 days",
    detail:
      "0 sign-ins via this provider since Jan 24. Okta and Entra cover 100% of active users — this is likely a leftover from a pilot that never launched.",
    severity: "medium",
    riskTier: "approve",
    steps: [
      "Checked sign-in logs for every active SSO provider · last 90 days",
      "Compared against the active-user list — 0 of 142 users signed in via Google Workspace",
      "Confirmed Okta + Entra together already cover 100% of active users",
    ],
    area: { label: "SSO & SAML", href: "/admin-modern/sso" },
    diff: { remove: "Google Workspace SSO: enabled", add: "Google Workspace SSO: disabled" },
    trigger: /sso|google workspace|okta|entra|unused provider/i,
  },
  {
    id: "f_role_unused_delete",
    title: "Tier 1 Analyst can delete incidents but has never used it",
    detail:
      "47 people hold this role. Zero uses of incidents.delete across all of them in the last 180 days, and the role's own description doesn't mention deletion.",
    severity: "high",
    riskTier: "approve",
    steps: [
      "Checked incidents.delete usage across all 47 Tier 1 Analyst holders · last 180 days",
      "Found 0 uses — no analyst has ever exercised this permission",
      "Cross-checked the role's own description — deletion isn't part of its stated scope",
    ],
    area: { label: "Roles & permissions", href: "/admin-modern/roles" },
    diff: { remove: "Tier 1 Analyst: incidents.delete — granted", add: "Tier 1 Analyst: incidents.delete — revoked" },
    trigger: /delete[- ]?all|unused permission|tier ?1.*delete|delete.*tier ?1/i,
  },
  {
    id: "f_dormant_accounts",
    title: "7 accounts have been inactive for 90+ days",
    detail:
      "Same accounts flagged on the Security posture checklist. Deactivating keeps seat count accurate and shrinks the pool of credentials that could be phished.",
    severity: "medium",
    riskTier: "auto",
    steps: [
      "Checked last-active timestamp for all 142 users",
      "Found 7 accounts with no activity in 90+ days, none with a pending investigation assigned",
      "Confirmed deactivation is reversible — reactivating restores the same role and groups",
    ],
    area: { label: "Users", href: "/admin-modern/users" },
    diff: { remove: "7 accounts: status = active", add: "7 accounts: status = deactivated" },
    trigger: /dormant|inactive account|stale account/i,
  },
  {
    id: "f_escalation_dead_rule",
    title: "One escalation rule can never fire",
    detail:
      "\"Notify duty manager\" requires Priority = P1 AND Category = Malware, but Malware incidents are always seeded with Priority = P2 in the intake form. This rule has matched 0 incidents since it was created.",
    severity: "low",
    riskTier: "auto",
    steps: [
      "Simulated this rule against every Malware incident created in the last 6 months",
      "Confirmed intake always sets Priority = P2 for this category, never P1",
      "This only widens when the existing notification fires — no access or data changes",
    ],
    area: { label: "Incident setup", href: "/admin-modern/products/incidents" },
    diff: { remove: "Rule condition: category = Malware AND priority = P1", add: "Rule condition: category = Malware AND priority = P1 OR P2" },
    trigger: /escalation|contradict|dead rule|never fire/i,
  },
]

/** First finding (if any) whose trigger matches free-text input. */
export function matchSaraFinding(question: string): SaraFinding | undefined {
  return saraFindings.find((f) => f.trigger.test(question))
}

// ── Free-text chat replies (no diff) — anything not matched by a finding ──

const FREE_TEXT_REPLIES: { match: RegExp; reply: string }[] = [
  {
    match: /permission (change|log|history)|last week/i,
    reply:
      "In the last 7 days: 3 role edits (all by ahmed@sirp.io), 1 new SSO provider added, and 12 users invited. The biggest change was SOC Manager gaining `incidents.sla.override` on Tuesday. Want the full diff?",
  },
  {
    match: /dormant|inactive|stale/i,
    reply:
      "7 accounts have been inactive for 90+ days, and 8 invites are still pending after a week. I can draft a deactivation batch for the dormant accounts — want to see it?",
  },
  {
    match: /health|status|uptime/i,
    reply:
      "All subsystems are healthy except the ingestion worker, which is running warm (78% queue depth). Nothing needs action right now.",
  },
]

export function mockAdminSaraReply(question: string): string {
  for (const { match, reply } of FREE_TEXT_REPLIES) {
    if (match.test(question)) return reply
  }
  return "I looked across Access Control, SSO and the audit log for that. Nothing conclusive yet — try asking about dormant accounts, recent permission changes, or system health, or open one of the findings below."
}
