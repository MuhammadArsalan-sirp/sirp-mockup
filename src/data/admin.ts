/**
 * Seed data for the Administration module — lightweight, deterministic,
 * good enough to make every page feel real. No PII.
 */

export type AdminUserStatus = "active" | "locked" | "inactive" | "pending"
export type AdminAuthSource = "local" | "saml" | "oidc"
export type MfaState = "totp" | "webauthn" | "disabled" | "pending"

export type AdminUser = {
  id: string
  name: string
  email: string
  initials: string
  /** Tailwind gradient classes for avatar bg */
  gradient: string
  status: AdminUserStatus
  /** Status sub-label (e.g., "92d") for inactive users */
  statusDetail?: string
  role: string
  groups: string[]
  lastActive: string
  joined: string
  mfa: MfaState
  source: AdminAuthSource
}

export type AdminGroup = {
  id: string
  name: string
  description: string
  members: number
  kind: "Security" | "Distribution" | "On-call"
  source: "Local" | "SAML"
}

export const adminGroups: AdminGroup[] = [
  {
    id: "g_soc2",
    name: "SOC Tier 2",
    description: "Escalations, containment, and major incident bridge",
    members: 24,
    kind: "Security",
    source: "SAML",
  },
  {
    id: "g_t1",
    name: "SOC Tier 1",
    description: "Triage, enrichment, first response",
    members: 58,
    kind: "Security",
    source: "SAML",
  },
  {
    id: "g_emea",
    name: "EMEA on-call",
    description: "PagerDuty rotation · L3",
    members: 8,
    kind: "On-call",
    source: "Local",
  },
  {
    id: "g_ir",
    name: "Incident Response",
    description: "Forensics and comms leads",
    members: 11,
    kind: "Security",
    source: "Local",
  },
  {
    id: "g_exec",
    name: "Executive digest",
    description: "Weekly summary · no PII attachments",
    members: 6,
    kind: "Distribution",
    source: "Local",
  },
]

export const adminUsers: AdminUser[] = [
  {
    id: "u_4f8a92c1",
    name: "Sara Patel",
    email: "sara.patel@acme.com",
    initials: "SP",
    gradient: "from-violet-500 to-fuchsia-600",
    status: "active",
    role: "SOC Manager",
    groups: ["SOC Tier 2", "EMEA on-call", "Phishing triage"],
    lastActive: "2 min ago",
    joined: "2024-08-12",
    mfa: "totp",
    source: "saml",
  },
  {
    id: "u_ahmed",
    name: "Ahmed Khan",
    email: "ahmed@sirp.io",
    initials: "AK",
    gradient: "from-indigo-500 to-pink-500",
    status: "active",
    role: "Super Admin",
    groups: ["Admins"],
    lastActive: "just now",
    joined: "2023-01-04",
    mfa: "webauthn",
    source: "local",
  },
  {
    id: "u_maria",
    name: "Maria Chen",
    email: "maria.chen@acme.com",
    initials: "MC",
    gradient: "from-cyan-500 to-violet-600",
    status: "active",
    role: "Tier 2 Analyst",
    groups: ["SOC Tier 2", "APAC on-call"],
    lastActive: "23 min ago",
    joined: "2024-11-18",
    mfa: "totp",
    source: "saml",
  },
  {
    id: "u_jonas",
    name: "Jonas Dietrich",
    email: "jonas.dietrich@acme.com",
    initials: "JD",
    gradient: "from-amber-500 to-rose-600",
    status: "inactive",
    statusDetail: "92d",
    role: "Tier 1 Analyst",
    groups: ["SOC Tier 1"],
    lastActive: "3 months ago",
    joined: "2024-02-22",
    mfa: "disabled",
    source: "saml",
  },
  {
    id: "u_lina",
    name: "Lina Okafor",
    email: "lina.okafor@acme.com",
    initials: "LO",
    gradient: "from-emerald-500 to-teal-600",
    status: "active",
    role: "IR Lead",
    groups: ["Incident Response"],
    lastActive: "11 min ago",
    joined: "2023-09-30",
    mfa: "webauthn",
    source: "saml",
  },
  {
    id: "u_rohan",
    name: "Rohan Trivedi",
    email: "rohan.trivedi@acme.com",
    initials: "RT",
    gradient: "from-violet-500 to-amber-500",
    status: "locked",
    role: "Tier 2 Analyst",
    groups: ["SOC Tier 2"],
    lastActive: "5 days ago",
    joined: "2024-05-14",
    mfa: "pending",
    source: "saml",
  },
  {
    id: "u_elena",
    name: "Elena Kowalski",
    email: "elena.kowalski@acme.com",
    initials: "EK",
    gradient: "from-fuchsia-500 to-cyan-600",
    status: "active",
    role: "Threat Hunter",
    groups: ["Threat Intel"],
    lastActive: "1 hr ago",
    joined: "2024-04-02",
    mfa: "totp",
    source: "saml",
  },
  {
    id: "u_diego",
    name: "Diego Ramirez",
    email: "diego.ramirez@acme.com",
    initials: "DR",
    gradient: "from-yellow-500 to-orange-600",
    status: "pending",
    role: "—",
    groups: ["SOC Tier 1"],
    lastActive: "never",
    joined: "—",
    mfa: "disabled",
    source: "local",
  },
  {
    id: "u_theo",
    name: "Theo Nakamura",
    email: "theo.nakamura@acme.com",
    initials: "TN",
    gradient: "from-violet-700 to-rose-600",
    status: "active",
    role: "Auditor (read-only)",
    groups: ["Compliance"],
    lastActive: "2 hrs ago",
    joined: "2024-06-08",
    mfa: "pending",
    source: "saml",
  },
  {
    id: "u_fatima",
    name: "Fatima Abboud",
    email: "fatima.abboud@acme.com",
    initials: "FA",
    gradient: "from-emerald-500 to-violet-600",
    status: "active",
    role: "Tier 1 Analyst",
    groups: ["SOC Tier 1"],
    lastActive: "38 min ago",
    joined: "2025-01-11",
    mfa: "totp",
    source: "saml",
  },
]

// ─────────────────────────────────────────────────────────────────
// Roles & permissions
// ─────────────────────────────────────────────────────────────────

export type AdminRoleKind = "system" | "custom"

export type AdminRole = {
  id: string
  name: string
  description: string
  kind: AdminRoleKind
  /** Number of users assigned */
  members: number
  /** Granted permissions count */
  granted: number
  /** Total permissions in catalogue */
  total: number
  /** Locked roles (e.g., Super Admin) cannot be edited */
  locked?: boolean
}

export const adminRoles: AdminRole[] = [
  {
    id: "r_super_admin",
    name: "Super Admin",
    description: "All permissions across every module. Cannot be modified.",
    kind: "system",
    members: 1,
    granted: 96,
    total: 96,
    locked: true,
  },
  {
    id: "r_soc_mgr",
    name: "SOC Manager",
    description:
      "Owns incidents, manages analysts, configures playbooks. Cannot change billing or system-wide auth.",
    kind: "system",
    members: 6,
    granted: 42,
    total: 96,
  },
  {
    id: "r_tier2",
    name: "Tier 2 Analyst",
    description: "Triage, investigate, escalate. Edit incident fields.",
    kind: "system",
    members: 18,
    granted: 28,
    total: 96,
  },
  {
    id: "r_tier1",
    name: "Tier 1 Analyst",
    description: "Read incidents, basic triage, run pre-approved actions.",
    kind: "system",
    members: 47,
    granted: 19,
    total: 96,
  },
  {
    id: "r_ir_lead",
    name: "IR Lead",
    description: "Incident response, evidence handling, case ownership.",
    kind: "system",
    members: 4,
    granted: 35,
    total: 96,
  },
  {
    id: "r_threat_hunter",
    name: "Threat Hunter",
    description: "Threat intel, hunting queries, IOC management.",
    kind: "system",
    members: 8,
    granted: 31,
    total: 96,
  },
  {
    id: "r_auditor",
    name: "Auditor (read-only)",
    description: "Read-only access for compliance evidence collection.",
    kind: "custom",
    members: 3,
    granted: 12,
    total: 96,
  },
  {
    id: "r_compliance",
    name: "Compliance Officer",
    description: "Manages policies, audit log access, retention controls.",
    kind: "custom",
    members: 2,
    granted: 21,
    total: 96,
  },
  {
    id: "r_asset_owner",
    name: "Asset Owner",
    description: "Manages owned assets, accepts risks for assigned scope.",
    kind: "custom",
    members: 31,
    granted: 15,
    total: 96,
  },
  {
    id: "r_dept_head",
    name: "Department Head",
    description: "Department-scoped read of incidents and assets.",
    kind: "custom",
    members: 12,
    granted: 18,
    total: 96,
  },
  {
    id: "r_external",
    name: "External Vendor",
    description: "Limited contractor access scoped to specific cases.",
    kind: "custom",
    members: 9,
    granted: 7,
    total: 96,
  },
  {
    id: "r_api",
    name: "API Integration",
    description: "Service-account role for webhook and API tokens.",
    kind: "custom",
    members: 2,
    granted: 5,
    total: 96,
  },
]

export type Permission = {
  id: string
  label: string
  description: string
  scope: string
  granted: boolean
}

export type PermissionGroup = {
  id: string
  label: string
  description: string
  /** lucide icon name (looked up at render time) */
  icon: string
  permissions: Permission[]
}

/**
 * Permission catalogue for the **SOC Manager** role (the demo selection).
 * In a real app this would come keyed by role id; for the mockup the
 * single-role view is plenty.
 */
export const socManagerPermissions: PermissionGroup[] = [
  {
    id: "incidents",
    label: "Incidents",
    description: "Triage, investigate, resolve security incidents",
    icon: "AlertTriangle",
    permissions: [
      { id: "incidents.read", label: "View incidents", description: "List, filter, and view incident details across all teams.", scope: "incidents.read", granted: true },
      { id: "incidents.create", label: "Create incident", description: "Manually create incidents and bulk import from CSV.", scope: "incidents.create", granted: true },
      { id: "incidents.assign", label: "Assign & reassign", description: "Set assignee, change owning team, escalate.", scope: "incidents.assign", granted: true },
      { id: "incidents.update", label: "Edit incident fields", description: "Modify severity, status, category, custom fields.", scope: "incidents.update", granted: true },
      { id: "incidents.close", label: "Close / resolve", description: "Close incidents and submit resolution notes.", scope: "incidents.close", granted: true },
      { id: "incidents.reopen", label: "Reopen incident", description: "Reopen previously closed incidents within 90 days.", scope: "incidents.reopen", granted: true },
      { id: "incidents.sla.override", label: "Override SLA", description: "Pause or extend SLA timers with audit reason.", scope: "incidents.sla.override", granted: true },
      { id: "incidents.delete", label: "Delete incident", description: "Permanent delete · audit log retained.", scope: "incidents.delete", granted: true },
    ],
  },
  {
    id: "cases",
    label: "Cases & Investigations",
    description: "Long-running investigations, evidence handling",
    icon: "Folder",
    permissions: [
      { id: "cases.read", label: "View cases", description: "List and read all cases the user is a participant of.", scope: "cases.read", granted: true },
      { id: "cases.create", label: "Create case", description: "Open new case, link related incidents and entities.", scope: "cases.create", granted: true },
      { id: "cases.evidence.add", label: "Add evidence", description: "Upload artefacts, attach IOCs, write timeline notes.", scope: "cases.evidence.add", granted: true },
      { id: "cases.participants", label: "Manage participants", description: "Add or remove analysts from a case.", scope: "cases.participants", granted: true },
      { id: "cases.close", label: "Close case", description: "Mark closed with disposition · requires summary.", scope: "cases.close", granted: true },
      { id: "cases.export", label: "Export case file", description: "Download case as PDF / ZIP for external sharing.", scope: "cases.export", granted: false },
    ],
  },
  {
    id: "ti",
    label: "Threat Intelligence",
    description: "IOCs, advisories, threat actors, campaigns",
    icon: "Shield",
    permissions: [
      { id: "ti.advisories.read", label: "View advisories", description: "Read all active advisories and TTPs.", scope: "ti.advisories.read", granted: true },
      { id: "ti.advisories.create", label: "Create advisory", description: "Publish new advisories to the org feed.", scope: "ti.advisories.create", granted: true },
      { id: "ti.iocs.write", label: "Manage IOCs", description: "Add, edit, withdraw IOC records.", scope: "ti.iocs.write", granted: true },
      { id: "ti.actors.write", label: "Manage threat actors", description: "Edit threat actor profiles and aliases.", scope: "ti.actors.write", granted: true },
      { id: "ti.feeds.config", label: "Configure feeds", description: "Add or remove external TI feeds (TAXII, MISP, etc.).", scope: "ti.feeds.config", granted: false },
      { id: "ti.community.publish", label: "Push to community", description: "Share advisories with external SIRP community.", scope: "ti.community.publish", granted: false },
    ],
  },
  {
    id: "sara",
    label: "Sara · Co-Analyst",
    description: "AI assistant chat, agent runs, autonomous actions",
    icon: "Sparkles",
    permissions: [
      { id: "sara.chat", label: "Use Sara chat", description: "Ask questions, get summaries, draft replies.", scope: "sara.chat", granted: true },
      { id: "sara.agents.run", label: "Run agents", description: "Launch agentic workflows on incidents/cases.", scope: "sara.agents.run", granted: true },
      { id: "sara.agents.approve", label: "Approve agent actions", description: "Approve or reject queued agent actions.", scope: "sara.agents.approve", granted: true },
      { id: "sara.agents.edit", label: "Edit agent prompts", description: "Customise system prompts and tool allowlists.", scope: "sara.agents.edit", granted: false },
      { id: "sara.providers.config", label: "Configure model providers", description: "Set API keys, choose models, route by tenant.", scope: "sara.providers.config", granted: false },
    ],
  },
  {
    id: "users",
    label: "Users & Access",
    description: "Invite users, manage groups, assign roles",
    icon: "Users",
    permissions: [
      { id: "users.read", label: "View users", description: "Read user list and individual profiles.", scope: "users.read", granted: true },
      { id: "users.invite", label: "Invite user", description: "Send invites to your team only (scoped).", scope: "users.invite", granted: true },
      { id: "users.update", label: "Edit user profile", description: "Change roles, groups, status, contact info.", scope: "users.update", granted: false },
      { id: "users.delete", label: "Deactivate / delete user", description: "Revoke access · audit history retained.", scope: "users.delete", granted: false },
      { id: "roles.manage", label: "Manage roles", description: "Create, edit, delete roles and permissions.", scope: "roles.manage", granted: false },
      { id: "users.impersonate", label: "Impersonate user", description: "Sign in as another user · all actions audited.", scope: "users.impersonate", granted: false },
    ],
  },
  {
    id: "config",
    label: "Configuration",
    description: "Categories, SLAs, fields, master data",
    icon: "Settings",
    permissions: [
      { id: "config.categories", label: "Manage categories", description: "Incident categories and sub-categories.", scope: "config.categories", granted: false },
      { id: "config.sla", label: "Manage SLAs", description: "Define SLA thresholds per category.", scope: "config.sla", granted: false },
      { id: "config.fields", label: "Custom fields", description: "Add custom fields to incidents, cases, assets.", scope: "config.fields", granted: false },
      { id: "config.master_data", label: "Master data", description: "Asset types, owners, departments.", scope: "config.master_data", granted: false },
    ],
  },
  {
    id: "system",
    label: "System & Tenancy",
    description: "License, backups, server health, tenants",
    icon: "Building",
    permissions: [
      { id: "system.tenants", label: "Manage tenants", description: "Create, switch, suspend tenants.", scope: "system.tenants", granted: false },
      { id: "system.license", label: "Manage license", description: "View seats, upgrade plan, see invoices.", scope: "system.license", granted: false },
      { id: "system.backup", label: "Backup & restore", description: "Trigger backups, restore from snapshot.", scope: "system.backup", granted: false },
      { id: "system.health", label: "View server health", description: "CPU, memory, queue and storage telemetry.", scope: "system.health", granted: false },
    ],
  },
  {
    id: "audit",
    label: "Audit & Logs",
    description: "Activity, auth, errors, pre-ingestion",
    icon: "FileText",
    permissions: [
      { id: "logs.activity", label: "View activity log", description: "Read audit-grade activity history.", scope: "logs.activity", granted: true },
      { id: "logs.auth", label: "View auth log", description: "Sign-ins and SSO events.", scope: "logs.auth", granted: true },
      { id: "logs.errors", label: "View error log", description: "System and integration errors.", scope: "logs.errors", granted: true },
      { id: "logs.export", label: "Export logs", description: "Stream audit log to SIEM or download CSV.", scope: "logs.export", granted: false },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────
// Activity logs
// ─────────────────────────────────────────────────────────────────

export type LogSeverity = "info" | "warn" | "error" | "sara"

/** Stream selector aligned with the logs UI tabs (production: Activity / Auth / Errors / Pre-ingestion / Notifications). */
export type AdminLogTab =
  | "activity"
  | "auth"
  | "errors"
  | "preingest"
  | "notifications"

export type AdminLogEvent = {
  id: string
  /** ISO-ish HH:MM:SS.mmm — the day grouping is handled separately */
  time: string
  /** YYYY-MM-DD bucket key */
  day: string
  severity: LogSeverity
  logTab: AdminLogTab
  /** Free-form actor identifier (email or service name) */
  actor: string
  /** Past-tense action sentence */
  action: string
  /** Optional resource id rendered as a chip */
  target?: string
  /** Optional inline tag rendered as a chip */
  tag?: string
  ip: string
}

export const adminLogs: AdminLogEvent[] = [
  { id: "evt_8f9a2c4e1b", time: "14:32:18.412", day: "2026-04-29", severity: "info", logTab: "activity", actor: "sara.patel@acme.com", action: "closed incident", target: "INC-2841", tag: "Resolved · false-positive", ip: "198.51.100.12" },
  { id: "evt_91ad7f3320", time: "14:31:55.227", day: "2026-04-29", severity: "info", logTab: "activity", actor: "ahmed@sirp.io", action: "updated role SOC Manager — added 4 permissions", ip: "10.0.4.18" },
  { id: "evt_7c4e1aa90b", time: "14:30:12.901", day: "2026-04-29", severity: "warn", logTab: "auth", actor: "a.miller@acme.com", action: "failed login — invalid TOTP, 3rd attempt", ip: "198.51.100.42" },
  { id: "evt_5d62e9fa4a", time: "14:29:48.044", day: "2026-04-29", severity: "info", logTab: "activity", actor: "sara.patel@acme.com", action: "assigned to maria.chen@acme.com", target: "INC-2841", ip: "198.51.100.12" },
  { id: "evt_4a8b1c0e22", time: "14:28:31.755", day: "2026-04-29", severity: "sara", logTab: "activity", actor: "sara.agent", action: "enriched IOC via VirusTotal", target: "198.51.100.42", tag: "VirusTotal", ip: "internal" },
  { id: "evt_3f17ee99aa", time: "14:27:09.318", day: "2026-04-29", severity: "error", logTab: "errors", actor: "webhook.splunk-prod", action: "delivery failed — retry 2/5", target: "503 Service Unavailable", ip: "internal" },
  { id: "evt_2e84d5bb71", time: "14:24:55.111", day: "2026-04-29", severity: "info", logTab: "activity", actor: "m.lee@acme.com", action: "accepted invite — assigned role", target: "Tier 2 Analyst", ip: "203.0.113.7" },
  { id: "evt_1abf6c4408", time: "14:22:08.560", day: "2026-04-29", severity: "info", logTab: "activity", actor: "lina.okafor@acme.com", action: "created case linking 3 incidents", target: "CASE-0431", ip: "198.51.100.18" },
  { id: "evt_0c93b2eef9", time: "14:18:37.221", day: "2026-04-29", severity: "warn", logTab: "activity", actor: "system", action: "SLA breach imminent — 28 min remaining", target: "INC-2839", ip: "internal" },
  { id: "evt_9b7a44e0c8", time: "14:15:02.812", day: "2026-04-29", severity: "info", logTab: "activity", actor: "ahmed@sirp.io", action: "rotated SAML signing certificate", ip: "10.0.4.18" },
  { id: "evt_88361b29ad", time: "14:12:29.043", day: "2026-04-29", severity: "info", logTab: "activity", actor: "scheduler", action: "backup completed", tag: "2.4 GB · 47s", ip: "internal" },
  { id: "evt_77942df51e", time: "14:10:55.327", day: "2026-04-29", severity: "info", logTab: "activity", actor: "elena.kowalski@acme.com", action: "published advisory — LockBit family activity", target: "TA-2026-041", ip: "198.51.100.51" },
  { id: "evt_661a7780e2", time: "14:08:41.001", day: "2026-04-29", severity: "sara", logTab: "activity", actor: "sara.agent", action: "requested approval — isolate-host on", target: "workstation-emea-441", tag: "isolate-host", ip: "internal" },
  { id: "evt_550fd99313", time: "14:05:12.765", day: "2026-04-29", severity: "info", logTab: "activity", actor: "maria.chen@acme.com", action: "created incident category", target: "Ransomware · LockBit", ip: "198.51.100.34" },
  { id: "evt_44e22a0bcd", time: "14:01:38.482", day: "2026-04-29", severity: "info", logTab: "auth", actor: "ahmed@sirp.io", action: "signed in via SAML", ip: "10.0.4.18" },
  { id: "evt_33b910fae6", time: "23:58:04.221", day: "2026-04-28", severity: "info", logTab: "activity", actor: "scheduler", action: "tenant switched to Enterprise plan", target: "Acme EMEA", ip: "internal" },
  { id: "evt_pre01", time: "13:55:01.100", day: "2026-04-29", severity: "info", logTab: "preingest", actor: "connector.sentinel", action: "normalised alert batch", target: "1,240 rows", tag: "Microsoft Sentinel", ip: "internal" },
  { id: "evt_pre02", time: "13:40:22.330", day: "2026-04-29", severity: "warn", logTab: "preingest", actor: "connector.qradar", action: "schema validation failed — rows quarantined", target: "3 rows", tag: "CEF", ip: "internal" },
  { id: "evt_pre03", time: "12:08:00.000", day: "2026-04-29", severity: "info", logTab: "preingest", actor: "connector.mimecast", action: "deduplicated phishing events", target: "88 → 41", ip: "internal" },
  { id: "evt_ntf01", time: "14:25:00.000", day: "2026-04-29", severity: "info", logTab: "notifications", actor: "mailer", action: "digest email dispatched", target: "Executive digest", tag: "18 recipients", ip: "internal" },
  { id: "evt_ntf02", time: "14:20:11.555", day: "2026-04-29", severity: "info", logTab: "notifications", actor: "teams.webhook", action: "posted SLA warning to channel", target: "#soc-bridge", ip: "internal" },
  { id: "evt_ntf03", time: "13:02:44.881", day: "2026-04-29", severity: "warn", logTab: "notifications", actor: "smtp.relay", action: "deferred message — greylisting", target: "partner-vendor.net", ip: "internal" },
  { id: "evt_auth02", time: "11:45:00.000", day: "2026-04-29", severity: "warn", logTab: "auth", actor: "jonas.dietrich@acme.com", action: "session revoked — admin reset password", ip: "10.0.4.2" },
  { id: "evt_err02", time: "09:12:33.000", day: "2026-04-29", severity: "error", logTab: "errors", actor: "worker.ingest", action: "dead letter after max retries", target: "queue:vt-enrich", ip: "internal" },
]

/** Tab counts derived from mock log rows (totals in the UI use these, not fictional aggregates). */
export function countAdminLogsByTab(): Record<AdminLogTab, number> {
  const base: Record<AdminLogTab, number> = {
    activity: 0,
    auth: 0,
    errors: 0,
    preingest: 0,
    notifications: 0,
  }
  for (const ev of adminLogs) {
    base[ev.logTab] += 1
  }
  return base
}

/** 24h binned event volume for the histogram strip on the logs page */
export const logHistogram = [
  30, 25, 35, 42, 38, 45, 55, 62, 58, 65, 78, 85,
  72, 80, 88, 75, 68, 72, 65, 60, 55, 48, 62, 42,
  38, 45, 52, 48, 55, 60, 65, 70, 62, 55, 48, 42,
  50, 58, 72, 68, 75, 82, 68, 55, 42, 48, 55, 52,
] as const

// ─────────────────────────────────────────────────────────────────
// Overview KPIs and feed
// ─────────────────────────────────────────────────────────────────

export type AdminAttentionItem = {
  id: string
  severity: "high" | "medium" | "low" | "info"
  category: string
  title: string
  description: string
  /** When set, overview “Needs attention” links into the admin mock */
  href?: string
}

export const adminAttention: AdminAttentionItem[] = [
  {
    id: "a1",
    severity: "high",
    category: "SSO certificate",
    title: "Expires in 9 days",
    description: "Rotate before 2026-05-08 to avoid SSO disruption.",
    href: "/admin/sso",
  },
  {
    id: "a2",
    severity: "medium",
    category: "Inactive users",
    title: "7 users inactive ≥ 90 days",
    description: "Review and revoke seats to free up licences.",
    href: "/admin/users",
  },
  {
    id: "a3",
    severity: "medium",
    category: "MFA enrolment",
    title: "18 users without MFA",
    description: "Policy threshold is 95% · currently at 87%.",
    href: "/admin/users",
  },
  {
    id: "a4",
    severity: "low",
    category: "Pending invites",
    title: "12 invites unaccepted > 7 days",
    description: "Resend or revoke from Users page.",
    href: "/admin/users",
  },
  {
    id: "a5",
    severity: "info",
    category: "Update available",
    title: "SIRP v3.5.0 ready",
    description: "Schedule a maintenance window to upgrade.",
    href: "/admin/health",
  },
]

export type AdminActivityItem = {
  id: string
  /** lucide icon name */
  icon: string
  text: string
  context: string
  time: string
}

export const adminActivity: AdminActivityItem[] = [
  { id: "act1", icon: "UserPlus", text: "Sara Patel invited m.lee@acme.com as Tier-2 Analyst", context: "Access Control · Users", time: "2m ago" },
  { id: "act2", icon: "ShieldCheck", text: "Ahmed Khan added 4 permissions to role SOC Manager", context: "Access Control · Roles", time: "14m ago" },
  { id: "act3", icon: "RefreshCw", text: "Scheduled backup completed · 2.4 GB", context: "System · Backup & Restore", time: "12m ago" },
  { id: "act4", icon: "Lock", text: "Ahmed Khan rotated SAML signing certificate", context: "Authentication · SSO", time: "1h ago" },
  { id: "act5", icon: "AlertTriangle", text: "Failed login attempt from 198.51.100.42 for a.miller@acme.com", context: "Logs · Authentication", time: "2h ago" },
  { id: "act6", icon: "Plus", text: "Maria Chen created incident category Ransomware · LockBit family", context: "Configuration · Incident Setup", time: "3h ago" },
  { id: "act7", icon: "Building", text: "Tenant Acme EMEA switched to Enterprise plan", context: "Organization · Tenants", time: "yesterday" },
]

export type SystemHealth = {
  id: string
  label: string
  metric: string
  metricSub: string
  status: "ok" | "warn" | "err"
}

export const systemHealth: SystemHealth[] = [
  { id: "api", label: "API server", metric: "98ms", metricSub: "p95 · last 5m", status: "ok" },
  { id: "db", label: "Database", metric: "62%", metricSub: "CPU · 41% disk", status: "ok" },
  { id: "queue", label: "Job queue", metric: "2,481", metricSub: "jobs · 4 stuck", status: "warn" },
  { id: "storage", label: "Storage", metric: "1.8 TB", metricSub: "/ 4 TB used", status: "ok" },
]
