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
  /** Structured before/after for config-changing events. Absent for read
   *  events and most service/system events — the log sheet says so rather
   *  than fabricating a diff for actions that don't have one. */
  diff?: { field: string; from: string; to: string }[]
}

export const adminLogs: AdminLogEvent[] = [
  { id: "evt_8f9a2c4e1b", time: "14:32:18.412", day: "2026-04-29", severity: "info", logTab: "activity", actor: "sara.patel@acme.com", action: "closed incident", target: "INC-2841", tag: "Resolved · false-positive", ip: "198.51.100.12",
    diff: [
      { field: "status", from: "investigating", to: "resolved" },
      { field: "disposition", from: "null", to: "false-positive" },
      { field: "closed_at", from: "null", to: "2026-04-29T14:32:18Z" },
    ] },
  { id: "evt_91ad7f3320", time: "14:31:55.227", day: "2026-04-29", severity: "info", logTab: "activity", actor: "ahmed@sirp.io", action: "updated role SOC Manager — added 4 permissions", ip: "10.0.4.18",
    diff: [
      { field: "incidents.sla.override", from: "denied", to: "granted" },
      { field: "cases.export", from: "denied", to: "granted" },
      { field: "ti.feeds.config", from: "denied", to: "granted" },
      { field: "sara.agents.edit", from: "denied", to: "granted" },
    ] },
  { id: "evt_7c4e1aa90b", time: "14:30:12.901", day: "2026-04-29", severity: "warn", logTab: "auth", actor: "a.miller@acme.com", action: "failed login — invalid TOTP, 3rd attempt", ip: "198.51.100.42" },
  { id: "evt_5d62e9fa4a", time: "14:29:48.044", day: "2026-04-29", severity: "info", logTab: "activity", actor: "sara.patel@acme.com", action: "assigned to maria.chen@acme.com", target: "INC-2841", ip: "198.51.100.12" },
  { id: "evt_4a8b1c0e22", time: "14:28:31.755", day: "2026-04-29", severity: "sara", logTab: "activity", actor: "sara.agent", action: "enriched IOC via VirusTotal", target: "198.51.100.42", tag: "VirusTotal", ip: "internal" },
  { id: "evt_3f17ee99aa", time: "14:27:09.318", day: "2026-04-29", severity: "error", logTab: "errors", actor: "webhook.splunk-prod", action: "delivery failed — retry 2/5", target: "503 Service Unavailable", ip: "internal" },
  { id: "evt_2e84d5bb71", time: "14:24:55.111", day: "2026-04-29", severity: "info", logTab: "activity", actor: "m.lee@acme.com", action: "accepted invite — assigned role", target: "Tier 2 Analyst", ip: "203.0.113.7" },
  { id: "evt_1abf6c4408", time: "14:22:08.560", day: "2026-04-29", severity: "info", logTab: "activity", actor: "lina.okafor@acme.com", action: "created case linking 3 incidents", target: "CASE-0431", ip: "198.51.100.18" },
  { id: "evt_0c93b2eef9", time: "14:18:37.221", day: "2026-04-29", severity: "warn", logTab: "activity", actor: "system", action: "SLA breach imminent — 28 min remaining", target: "INC-2839", ip: "internal" },
  { id: "evt_9b7a44e0c8", time: "14:15:02.812", day: "2026-04-29", severity: "info", logTab: "activity", actor: "ahmed@sirp.io", action: "rotated SAML signing certificate", ip: "10.0.4.18",
    diff: [
      { field: "sso.cert_fingerprint", from: "8f:2c:…:a1", to: "3e:91:…:c4" },
      { field: "sso.cert_expires", from: "2026-05-08", to: "2027-05-08" },
    ] },
  { id: "evt_88361b29ad", time: "14:12:29.043", day: "2026-04-29", severity: "info", logTab: "activity", actor: "scheduler", action: "backup completed", tag: "2.4 GB · 47s", ip: "internal" },
  { id: "evt_77942df51e", time: "14:10:55.327", day: "2026-04-29", severity: "info", logTab: "activity", actor: "elena.kowalski@acme.com", action: "published advisory — LockBit family activity", target: "TA-2026-041", ip: "198.51.100.51" },
  { id: "evt_661a7780e2", time: "14:08:41.001", day: "2026-04-29", severity: "sara", logTab: "activity", actor: "sara.agent", action: "requested approval — isolate-host on", target: "workstation-emea-441", tag: "isolate-host", ip: "internal" },
  { id: "evt_550fd99313", time: "14:05:12.765", day: "2026-04-29", severity: "info", logTab: "activity", actor: "maria.chen@acme.com", action: "created incident category", target: "Ransomware · LockBit", ip: "198.51.100.34" },
  { id: "evt_44e22a0bcd", time: "14:01:38.482", day: "2026-04-29", severity: "info", logTab: "auth", actor: "ahmed@sirp.io", action: "signed in via SAML", ip: "10.0.4.18" },
  { id: "evt_33b910fae6", time: "23:58:04.221", day: "2026-04-28", severity: "info", logTab: "activity", actor: "scheduler", action: "tenant switched to Enterprise plan", target: "Acme EMEA", ip: "internal",
    diff: [
      { field: "plan", from: "Team", to: "Enterprise" },
      { field: "seats", from: "50", to: "250" },
    ] },
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
    href: "/admin-modern/sso",
  },
  {
    id: "a2",
    severity: "medium",
    category: "Inactive users",
    title: "7 users inactive ≥ 90 days",
    description: "Review and revoke seats to free up licences.",
    href: "/admin-modern/users",
  },
  {
    id: "a3",
    severity: "medium",
    category: "MFA enrolment",
    title: "18 users without MFA",
    description: "Policy threshold is 95% · currently at 87%.",
    href: "/admin-modern/users",
  },
  {
    id: "a4",
    severity: "low",
    category: "Pending invites",
    title: "12 invites unaccepted > 7 days",
    description: "Resend or revoke from Users page.",
    href: "/admin-modern/users",
  },
  {
    id: "a5",
    severity: "info",
    category: "Update available",
    title: "SIRP v3.5.0 ready",
    description: "Schedule a maintenance window to upgrade.",
    href: "/admin-modern/health",
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

// ─────────────────────────────────────────────────────────────────
// Security posture
// ─────────────────────────────────────────────────────────────────

export type PostureSeverity = "high" | "medium" | "low" | "ok"
export type PostureCategory = "authentication" | "session" | "data" | "audit" | "operations"

export type PostureCheck = {
  id: string
  category: PostureCategory
  label: string
  description: string
  status: PostureSeverity
  /** Short numeric/text indicator e.g. "87%" or "9 days" */
  metric?: string
  /** Direct link into a remediation surface */
  cta?: { label: string; href: string }
}

export const postureChecks: PostureCheck[] = [
  { id: "p_mfa",      category: "authentication", label: "MFA enrolment",          description: "TOTP or WebAuthn enrolled by every active user.",                    status: "medium", metric: "87%",   cta: { label: "Open Users",     href: "/admin-modern/users"    } },
  { id: "p_sso",      category: "authentication", label: "Single sign-on",         description: "SAML or OIDC active. Just-in-time provisioning enabled.",            status: "ok",     metric: "SAML"                                                              },
  { id: "p_sso_cert", category: "authentication", label: "SSO certificate",        description: "Rotate IdP signing certificate before expiry.",                      status: "high",   metric: "9 days",cta: { label: "Rotate now",     href: "/admin-modern/sso"      } },
  { id: "p_pwd",      category: "authentication", label: "Password policy",        description: "Min 12 chars, complexity, no last 5 reuse, 90-day rotation.",        status: "ok",     metric: "strong",cta: { label: "Review policy",  href: "/admin-modern/sessions" } },
  { id: "p_session",  category: "session",        label: "Idle session timeout",   description: "Sessions expire after 30 minutes of inactivity.",                   status: "ok",     metric: "30 min"                                                            },
  { id: "p_lockout",  category: "session",        label: "Lockout threshold",      description: "Lock account after 5 failed sign-ins inside 10 minutes.",            status: "ok",     metric: "5 / 10m"                                                           },
  { id: "p_iprange",  category: "session",        label: "IP allowlist",           description: "Admin actions limited to corporate CIDR ranges.",                    status: "medium", metric: "off",   cta: { label: "Configure",      href: "/admin-modern/sessions" } },
  { id: "p_retain",   category: "audit",          label: "Audit log retention",    description: "Audit events retained beyond regulator minimum (12 months).",         status: "ok",     metric: "24 mo"                                                             },
  { id: "p_siem",     category: "audit",          label: "SIEM export",            description: "Audit log streamed to upstream SIEM in real time.",                  status: "low",    metric: "off",   cta: { label: "Enable export",  href: "/admin-modern/logs"     } },
  { id: "p_encrypt",  category: "data",           label: "Encryption at rest",     description: "Tenant volumes encrypted with KMS-managed CMK.",                     status: "ok",     metric: "AES-256"                                                           },
  { id: "p_backup",   category: "data",           label: "Backup completion",      description: "Most recent scheduled backup completed inside SLA.",                  status: "ok",     metric: "12m ago",cta:{ label: "View backups",   href: "/admin-modern/backup"   } },
  { id: "p_residency",category: "data",           label: "KSA data residency",     description: "Customer data routed to in-region storage and inference.",           status: "ok",     metric: "KSA"                                                               },
  { id: "p_health",   category: "operations",     label: "Service health",         description: "All critical subsystems reporting healthy in the last 5 minutes.",   status: "medium", metric: "1 warn",cta: { label: "Open health",    href: "/admin-modern/health"   } },
  { id: "p_invites",  category: "operations",     label: "Stale invites",          description: "Pending invites older than 7 days should be revoked or resent.",     status: "low",    metric: "8",     cta: { label: "Resolve",        href: "/admin-modern/users"    } },
  { id: "p_inactive", category: "operations",     label: "Dormant accounts",       description: "Users inactive ≥ 90 days reviewed and de-provisioned.",              status: "medium", metric: "7",     cta: { label: "Review",         href: "/admin-modern/users"    } },
]

export type PostureScoreBand = "excellent" | "good" | "fair" | "needs-work"

export function computePostureScore(checks: PostureCheck[] = postureChecks): {
  score: number
  band: PostureScoreBand
  counts: Record<PostureSeverity, number>
} {
  const weight: Record<PostureSeverity, number> = { high: 0, medium: 0.5, low: 0.8, ok: 1 }
  const counts: Record<PostureSeverity, number> = { high: 0, medium: 0, low: 0, ok: 0 }
  let sum = 0
  for (const c of checks) {
    counts[c.status] += 1
    sum += weight[c.status]
  }
  const score = Math.round((sum / checks.length) * 100)
  const band: PostureScoreBand =
    score >= 90 ? "excellent" : score >= 75 ? "good" : score >= 60 ? "fair" : "needs-work"
  return { score, band, counts }
}

// ─────────────────────────────────────────────────────────────────
// SSO providers
// ─────────────────────────────────────────────────────────────────

export type SsoProvider = {
  id: string
  kind: "saml" | "oidc"
  name: string
  description: string
  status: "active" | "draft" | "disabled"
  domain: string
  users: number
  jit: boolean
  certExpires?: string
  /** Days until cert expires; negative = expired */
  certDaysLeft?: number
  acsUrl?: string
  issuer?: string
}

export const ssoProviders: SsoProvider[] = [
  {
    id: "okta-prod",
    kind: "saml",
    name: "Okta · Production",
    description: "Primary IdP for acme.com employees. JIT provisioning maps SOC groups.",
    status: "active",
    domain: "acme.com",
    users: 138,
    jit: true,
    certExpires: "2026-05-30",
    certDaysLeft: 9,
    acsUrl: "https://app.sirp.io/sso/saml/acme/acs",
    issuer: "https://acme.okta.com/exk1f2…",
  },
  {
    id: "azure-eu",
    kind: "oidc",
    name: "Microsoft Entra · EU tenant",
    description: "EMEA contractors. Restricted to read-only roles.",
    status: "active",
    domain: "acme-emea.com",
    users: 22,
    jit: false,
    certExpires: "2027-02-14",
    certDaysLeft: 269,
    issuer: "https://login.microsoftonline.com/…",
  },
  {
    id: "google-vendor",
    kind: "oidc",
    name: "Google Workspace · Vendors",
    description: "External SOC vendor access. Scoped to specific cases.",
    status: "draft",
    domain: "partner-vendor.net",
    users: 0,
    jit: false,
  },
]

// ─────────────────────────────────────────────────────────────────
// Session / password policy
// ─────────────────────────────────────────────────────────────────

export const sessionPolicy = {
  idleTimeoutMinutes: 30,
  absoluteTimeoutHours: 12,
  rememberMeDays: 7,
  concurrentSessions: 3,
  lockoutAttempts: 5,
  lockoutWindowMinutes: 10,
  lockoutDurationMinutes: 30,
  passwordMinLength: 12,
  passwordRequireComplexity: true,
  passwordHistory: 5,
  passwordExpiryDays: 90,
  ipAllowlistEnabled: false,
  ipAllowlist: ["10.0.0.0/8", "198.51.100.0/24"],
  enforceMfaForAdmins: true,
}

// ─────────────────────────────────────────────────────────────────
// License & seats
// ─────────────────────────────────────────────────────────────────

export type LicenseInvoice = {
  id: string
  number: string
  date: string
  amount: string
  status: "paid" | "due" | "overdue"
}

export const licenseDetail = {
  plan: "Enterprise",
  status: "Active",
  seats: { used: 142, total: 150, pending: 12 },
  startDate: "2025-11-28",
  renewalDate: "2026-11-28",
  daysToRenewal: 213,
  billingCycle: "Annual",
  contactEmail: "billing@sirp.io",
  features: [
    { id: "sso",       label: "SSO (SAML & OIDC)",       included: true },
    { id: "sara",      label: "Sara Co-Analyst · agents",included: true },
    { id: "omniscan",  label: "OmniScan attack-planner", included: true },
    { id: "omniflex",  label: "OmniFlex playbooks",      included: true },
    { id: "ti-feeds",  label: "Premium TI feeds",        included: true },
    { id: "siem",      label: "SIEM export",             included: true },
    { id: "ksa",       label: "KSA data residency",      included: true },
    { id: "managed",   label: "Managed services SLA",    included: false },
  ],
  invoices: [
    { id: "inv-1", number: "INV-2025-118", date: "2025-11-28", amount: "$ 178,200", status: "paid"    },
    { id: "inv-2", number: "INV-2024-094", date: "2024-11-28", amount: "$ 162,000", status: "paid"    },
    { id: "inv-3", number: "INV-2023-071", date: "2023-11-28", amount: "$ 148,500", status: "paid"    },
  ] as LicenseInvoice[],
}

// ─────────────────────────────────────────────────────────────────
// Health & subsystems
// ─────────────────────────────────────────────────────────────────

export type HealthSubsystem = {
  id: string
  group: "core" | "data" | "ingest" | "ai"
  label: string
  status: "ok" | "warn" | "err"
  metric: string
  detail: string
  /** Optional sparkline (0–100 values) */
  spark?: number[]
}

export const healthSubsystems: HealthSubsystem[] = [
  { id: "api",        group: "core",   label: "API server",             status: "ok",   metric: "98ms",   detail: "p95 latency · last 5m",            spark: [22,26,30,28,32,29,33,30,28,35,32,30,28,29,33] },
  { id: "web",        group: "core",   label: "Web app",                status: "ok",   metric: "1.2s",   detail: "TTI · global p75",                 spark: [55,58,52,57,60,54,52,50,52,55,53,49,51,52,54] },
  { id: "auth",       group: "core",   label: "Authentication",         status: "ok",   metric: "100%",   detail: "Success rate · last hour",          spark: [99,99,100,99,100,100,99,100,100,100,99,100,100,100,99] },
  { id: "db",         group: "data",   label: "Primary database",       status: "ok",   metric: "62%",    detail: "CPU · 41% disk",                    spark: [40,45,50,55,58,60,62,65,62,60,58,55,58,60,62] },
  { id: "cache",      group: "data",   label: "Cache (Redis)",          status: "ok",   metric: "23%",    detail: "Memory · 0 evictions",              spark: [18,20,21,22,23,24,25,23,22,21,22,23,24,23,22] },
  { id: "queue",      group: "ingest", label: "Job queue",              status: "warn", metric: "2,481",  detail: "queued · 4 stuck",                  spark: [400,800,1500,2000,2300,2400,2481,2400,2500,2600,2500,2400,2300,2200,2481] },
  { id: "connectors", group: "ingest", label: "Connectors",             status: "ok",   metric: "27 / 27",detail: "active · 1.2M events/h",            spark: [70,72,75,78,80,82,85,88,85,82,80,82,85,87,86] },
  { id: "siem",       group: "ingest", label: "SIEM export",            status: "ok",   metric: "lag 4s", detail: "Splunk · 4.8k events/min",          spark: [30,32,28,30,33,31,28,29,30,31,30,29,28,30,29] },
  { id: "sara",       group: "ai",     label: "Sara LLM router",        status: "ok",   metric: "98%",    detail: "Success · 312 ms median",           spark: [88,90,92,94,95,96,98,97,98,96,95,97,98,99,98] },
  { id: "omniscan",   group: "ai",     label: "OmniScan engine",        status: "ok",   metric: "44 / m", detail: "Scans · 0 timeouts",                spark: [30,35,40,42,44,45,44,42,40,38,40,42,44,43,44] },
  { id: "omniflex",   group: "ai",     label: "OmniFlex executor",      status: "ok",   metric: "212 / h",detail: "Playbook runs · 0 failures",        spark: [180,190,200,205,210,212,210,208,205,210,212,215,212,210,212] },
]

export const healthIncidents = [
  { id: "h1", time: "2026-04-25 02:14 UTC", title: "Connector queue back-pressure cleared", durationMin: 28, severity: "warn" as const },
  { id: "h2", time: "2026-04-12 17:30 UTC", title: "Sara LLM router · provider degradation",  durationMin: 14, severity: "warn" as const },
  { id: "h3", time: "2026-03-28 09:01 UTC", title: "Scheduled maintenance · platform upgrade",durationMin: 45, severity: "info" as const },
]

// ─────────────────────────────────────────────────────────────────
// Backup & restore
// ─────────────────────────────────────────────────────────────────

export type BackupJob = {
  id: string
  startedAt: string
  durationSec: number
  size: string
  scope: "full" | "incremental"
  status: "success" | "running" | "failed"
  artifactsCount: number
  /** Comma-separated regions where backup was replicated */
  regions: string
}

export const backupConfig = {
  schedule: "Every 4 hours",
  nextRunIn: "48 min",
  retentionDays: 90,
  encryption: "AES-256 (CMK)",
  destination: "S3 · ksa-central-1",
  crossRegionReplication: true,
  lastRestoreTest: "2026-03-12",
}

export const backupJobs: BackupJob[] = [
  { id: "b_001", startedAt: "2026-04-29 14:12", durationSec: 47,  size: "2.4 GB", scope: "incremental", status: "success", artifactsCount: 142, regions: "ksa-central-1, ksa-west-1" },
  { id: "b_002", startedAt: "2026-04-29 10:12", durationSec: 52,  size: "2.6 GB", scope: "incremental", status: "success", artifactsCount: 138, regions: "ksa-central-1, ksa-west-1" },
  { id: "b_003", startedAt: "2026-04-29 06:12", durationSec: 49,  size: "2.5 GB", scope: "incremental", status: "success", artifactsCount: 140, regions: "ksa-central-1, ksa-west-1" },
  { id: "b_004", startedAt: "2026-04-29 02:12", durationSec: 318, size: "48.2 GB",scope: "full",        status: "success", artifactsCount: 4218,regions: "ksa-central-1, ksa-west-1" },
  { id: "b_005", startedAt: "2026-04-28 22:12", durationSec: 51,  size: "2.7 GB", scope: "incremental", status: "success", artifactsCount: 144, regions: "ksa-central-1, ksa-west-1" },
  { id: "b_006", startedAt: "2026-04-28 18:12", durationSec: 0,   size: "—",      scope: "incremental", status: "failed",  artifactsCount: 0,   regions: "—" },
  { id: "b_007", startedAt: "2026-04-28 14:12", durationSec: 50,  size: "2.6 GB", scope: "incremental", status: "success", artifactsCount: 139, regions: "ksa-central-1, ksa-west-1" },
]

// ─────────────────────────────────────────────────────────────────
// Email / SMTP
// ─────────────────────────────────────────────────────────────────

export const emailConfig = {
  status: "verified" as const,
  host: "smtp.acme-mail.internal",
  port: 587,
  encryption: "STARTTLS",
  username: "sirp-noreply",
  fromAddress: "noreply@sirp.acme.com",
  fromName: "SIRP · Acme Corp",
  replyTo: "soc@acme.com",
  dailyLimit: 50000,
  sentToday: 8420,
  deliveryRate: 99.4,
  bounceRate: 0.3,
  lastTestSentAt: "2026-04-29 09:14",
  dmarcAligned: true,
  spfAligned: true,
  dkimSigned: true,
}

// ─────────────────────────────────────────────────────────────────
// Notification templates
// ─────────────────────────────────────────────────────────────────

export type NotificationTemplate = {
  id: string
  name: string
  category: "incident" | "access" | "system" | "digest"
  trigger: string
  channels: ("email" | "sms" | "webhook" | "teams" | "slack")[]
  lastEditedBy: string
  lastEditedAt: string
  variables: number
  enabled: boolean
}

export const notificationTemplates: NotificationTemplate[] = [
  { id: "t_inc_assigned",  name: "Incident assigned",             category: "incident", trigger: "incident.assigned",   channels: ["email","teams"],          lastEditedBy: "Sara Patel",  lastEditedAt: "2 days ago",   variables: 11, enabled: true  },
  { id: "t_sla_warning",   name: "SLA warning · 30 min",          category: "incident", trigger: "sla.warn.30m",        channels: ["email","sms","teams"],    lastEditedBy: "Ahmed Khan",  lastEditedAt: "1 week ago",   variables: 9,  enabled: true  },
  { id: "t_sla_breach",    name: "SLA breach",                    category: "incident", trigger: "sla.breach",          channels: ["email","sms","slack"],    lastEditedBy: "Ahmed Khan",  lastEditedAt: "1 week ago",   variables: 9,  enabled: true  },
  { id: "t_user_invite",   name: "User invitation",               category: "access",   trigger: "user.invited",        channels: ["email"],                  lastEditedBy: "Maria Chen",  lastEditedAt: "3 weeks ago",  variables: 6,  enabled: true  },
  { id: "t_pwd_reset",     name: "Password reset",                category: "access",   trigger: "user.password.reset", channels: ["email"],                  lastEditedBy: "System",      lastEditedAt: "—",            variables: 4,  enabled: true  },
  { id: "t_account_lock",  name: "Account locked",                category: "access",   trigger: "user.locked",         channels: ["email"],                  lastEditedBy: "System",      lastEditedAt: "—",            variables: 5,  enabled: true  },
  { id: "t_health_alert",  name: "Subsystem unhealthy",           category: "system",   trigger: "health.degraded",     channels: ["email","slack","webhook"],lastEditedBy: "Ahmed Khan",  lastEditedAt: "1 month ago",  variables: 7,  enabled: true  },
  { id: "t_backup_fail",   name: "Backup failed",                 category: "system",   trigger: "backup.failed",       channels: ["email","sms"],            lastEditedBy: "Ahmed Khan",  lastEditedAt: "1 month ago",  variables: 6,  enabled: true  },
  { id: "t_exec_digest",   name: "Executive weekly digest",       category: "digest",   trigger: "digest.weekly",       channels: ["email"],                  lastEditedBy: "Sara Patel",  lastEditedAt: "2 weeks ago",  variables: 14, enabled: true  },
  { id: "t_oncall_digest", name: "On-call shift summary",         category: "digest",   trigger: "digest.shift.end",    channels: ["email","slack"],          lastEditedBy: "Lina Okafor", lastEditedAt: "5 days ago",   variables: 12, enabled: false },
]

// ─────────────────────────────────────────────────────────────────
// Tenants
// ─────────────────────────────────────────────────────────────────

export type Tenant = {
  id: string
  name: string
  region: string
  plan: "Enterprise" | "Premium" | "Standard"
  status: "active" | "suspended" | "trial"
  users: number
  incidents30d: number
  storageGb: number
  ksaResident: boolean
  createdAt: string
  primaryContact: string
}

export const tenants: Tenant[] = [
  { id: "t_acme_global",  name: "Acme Corp · Global",      region: "ksa-central-1", plan: "Enterprise", status: "active",    users: 142, incidents30d: 1284, storageGb: 1842, ksaResident: true,  createdAt: "2023-01-04", primaryContact: "ahmed@sirp.io"          },
  { id: "t_acme_emea",    name: "Acme EMEA · Subsidiary",  region: "eu-west-3",      plan: "Enterprise", status: "active",    users: 38,  incidents30d: 412,  storageGb: 412,  ksaResident: false, createdAt: "2024-03-18", primaryContact: "ops.eu@acme.com"        },
  { id: "t_acme_govt",    name: "Acme Government Cloud",   region: "ksa-central-1", plan: "Premium",    status: "trial",     users: 8,   incidents30d: 21,   storageGb: 38,   ksaResident: true,  createdAt: "2026-04-12", primaryContact: "govt-pilot@acme.gov.sa" },
]

// ─────────────────────────────────────────────────────────────────
// Departments
// ─────────────────────────────────────────────────────────────────

export type Department = {
  id: string
  name: string
  parentId?: string
  manager: string
  members: number
  defaultGroup?: string
}

export const departments: Department[] = [
  { id: "d_root",       name: "Acme Corp",                  manager: "Ahmed Khan",     members: 142                                              },
  { id: "d_tech",       name: "Technology",      parentId: "d_root",    manager: "Sara Patel",     members: 76                                  },
  { id: "d_sec",        name: "Security",        parentId: "d_tech",    manager: "Sara Patel",     members: 41, defaultGroup: "SOC Tier 2"      },
  { id: "d_soc_t1",     name: "SOC Tier 1",      parentId: "d_sec",     manager: "Maria Chen",     members: 18, defaultGroup: "SOC Tier 1"      },
  { id: "d_soc_t2",     name: "SOC Tier 2",      parentId: "d_sec",     manager: "Maria Chen",     members: 12, defaultGroup: "SOC Tier 2"      },
  { id: "d_ir",         name: "Incident Response", parentId: "d_sec",   manager: "Lina Okafor",    members: 11, defaultGroup: "Incident Response"},
  { id: "d_eng",        name: "Engineering",     parentId: "d_tech",    manager: "Jonas Dietrich", members: 35                                  },
  { id: "d_ops",        name: "IT Operations",   parentId: "d_root",    manager: "Ahmed Khan",     members: 24                                  },
  { id: "d_gov",        name: "Governance",      parentId: "d_root",    manager: "Theo Nakamura",  members: 14                                  },
  { id: "d_audit",      name: "Internal Audit",  parentId: "d_gov",     manager: "Theo Nakamura",  members: 6                                   },
  { id: "d_compliance", name: "Compliance",      parentId: "d_gov",     manager: "Theo Nakamura",  members: 8                                   },
  { id: "d_corp",       name: "Corporate",       parentId: "d_root",    manager: "Ahmed Khan",     members: 28                                  },
]

// ─────────────────────────────────────────────────────────────────
// Master data
// ─────────────────────────────────────────────────────────────────

export type MasterDataList = {
  id: string
  group: "Assets" | "Classification" | "People" | "Geography"
  name: string
  count: number
  managed: "system" | "custom"
  updatedAt: string
  example: string[]
}

export const masterDataLists: MasterDataList[] = [
  { id: "md_asset_types", group: "Assets",         name: "Asset types",            count: 18, managed: "system", updatedAt: "—",          example: ["Workstation","Server","Mobile","IoT","Cloud workload"] },
  { id: "md_asset_owner", group: "Assets",         name: "Asset owners",           count: 142, managed: "custom",updatedAt: "yesterday",  example: ["IT Ops","Security","Application Dev","Finance"]         },
  { id: "md_criticality", group: "Classification", name: "Criticality levels",     count: 5,  managed: "system", updatedAt: "—",          example: ["Critical","High","Elevated","Medium","Low"]              },
  { id: "md_data_class",  group: "Classification", name: "Data classifications",   count: 4,  managed: "custom", updatedAt: "2 weeks ago",example: ["Restricted","Confidential","Internal","Public"]          },
  { id: "md_industries",  group: "Classification", name: "Industries",             count: 21, managed: "system", updatedAt: "—",          example: ["Banking","Healthcare","Telecom","Government","Energy"]    },
  { id: "md_business",    group: "People",         name: "Business units",         count: 9,  managed: "custom", updatedAt: "3 days ago", example: ["Retail","Wholesale","Operations","Engineering","HR"]      },
  { id: "md_oncall",      group: "People",         name: "On-call roles",          count: 6,  managed: "custom", updatedAt: "1 week ago", example: ["L1","L2","L3","IR Lead","Comms","Exec"]                  },
  { id: "md_countries",   group: "Geography",      name: "Countries",              count: 196,managed: "system", updatedAt: "—",          example: ["SAU","ARE","BHR","KWT","OMN"]                            },
  { id: "md_sites",       group: "Geography",      name: "Sites & datacentres",    count: 14, managed: "custom", updatedAt: "1 month ago",example: ["Riyadh DC1","Riyadh DC2","Jeddah DC","Dubai DC","HQ HQ"]  },
]

// ─────────────────────────────────────────────────────────────────
// Incident setup (categories, SLAs, custom fields, states)
// ─────────────────────────────────────────────────────────────────

export type IncidentCategoryRow = {
  id: string
  name: string
  parent?: string
  defaultSeverity: "Sev1" | "Sev2" | "Sev3" | "Sev4" | "Sev5"
  /** SLA in minutes to acknowledge / resolve */
  sla: { ack: number; resolve: number }
  /** Mapped playbook id */
  playbook?: string
  enabled: boolean
}

export const incidentCategories: IncidentCategoryRow[] = [
  { id: "c_malware",      name: "Malware",                                       defaultSeverity: "Sev2", sla: { ack: 15, resolve: 240  }, playbook: "PB-Malware-Triage",       enabled: true },
  { id: "c_ransomware",   name: "Ransomware",        parent: "c_malware",        defaultSeverity: "Sev1", sla: { ack: 5,  resolve: 60   }, playbook: "PB-Ransomware-Isolate",   enabled: true },
  { id: "c_phishing",     name: "Phishing",                                      defaultSeverity: "Sev3", sla: { ack: 30, resolve: 480  }, playbook: "PB-Phish-Triage",         enabled: true },
  { id: "c_phish_bec",    name: "BEC · Wire fraud",   parent: "c_phishing",      defaultSeverity: "Sev1", sla: { ack: 10, resolve: 120  }, playbook: "PB-BEC-Response",         enabled: true },
  { id: "c_insider",      name: "Insider threat",                                defaultSeverity: "Sev2", sla: { ack: 30, resolve: 1440 }, playbook: "PB-Insider-Review",       enabled: true },
  { id: "c_data_leak",    name: "Data leak",                                     defaultSeverity: "Sev2", sla: { ack: 15, resolve: 360  }, playbook: "PB-DLP-Containment",      enabled: true },
  { id: "c_unauth_access",name: "Unauthorised access",                           defaultSeverity: "Sev2", sla: { ack: 15, resolve: 240  }, playbook: "PB-Account-Compromise",   enabled: true },
  { id: "c_dos",          name: "Denial of service",                             defaultSeverity: "Sev2", sla: { ack: 15, resolve: 240  }, playbook: "PB-DoS-Mitigate",         enabled: true },
  { id: "c_misconfig",    name: "Misconfiguration",                              defaultSeverity: "Sev4", sla: { ack: 60, resolve: 1440 },                                       enabled: true },
  { id: "c_policy",       name: "Policy violation",                              defaultSeverity: "Sev4", sla: { ack: 60, resolve: 2880 },                                       enabled: false},
]

export type IncidentState = {
  id: string
  label: string
  kind: "open" | "in-progress" | "waiting" | "closed"
  slaActive: boolean
}

export const incidentStates: IncidentState[] = [
  { id: "s_new",       label: "New",           kind: "open",        slaActive: true  },
  { id: "s_triage",    label: "Triage",        kind: "in-progress", slaActive: true  },
  { id: "s_investigate", label: "Investigating", kind: "in-progress", slaActive: true  },
  { id: "s_containment",label: "Containment",  kind: "in-progress", slaActive: true  },
  { id: "s_pending",   label: "Pending user",  kind: "waiting",     slaActive: false },
  { id: "s_resolved",  label: "Resolved",      kind: "closed",      slaActive: false },
  { id: "s_closed",    label: "Closed",        kind: "closed",      slaActive: false },
]

export type IncidentCustomField = {
  id: string
  label: string
  type: "text" | "select" | "multi-select" | "user" | "date" | "boolean" | "number"
  required: boolean
  scope: string
}

export const incidentCustomFields: IncidentCustomField[] = [
  { id: "f_attack_vector",  label: "Attack vector",        type: "select",       required: true,  scope: "All incidents" },
  { id: "f_mitre",          label: "MITRE technique",      type: "multi-select", required: false, scope: "All incidents" },
  { id: "f_kill_chain",     label: "Kill-chain stage",     type: "select",       required: false, scope: "All incidents" },
  { id: "f_business_unit",  label: "Business unit",        type: "select",       required: true,  scope: "All incidents" },
  { id: "f_data_class",     label: "Data classification",  type: "select",       required: false, scope: "Data leak"     },
  { id: "f_regulator",      label: "Regulator notified",   type: "boolean",      required: false, scope: "Data leak, BEC"},
  { id: "f_root_cause",     label: "Root cause",           type: "text",         required: false, scope: "Resolved only" },
]

// ─────────────────────────────────────────────────────────────────
// Threat-intel setup
// ─────────────────────────────────────────────────────────────────

export type TiFeed = {
  id: string
  name: string
  vendor: string
  protocol: "TAXII 2.1" | "STIX 2.1" | "MISP" | "OpenCTI" | "HTTP JSON"
  status: "active" | "error" | "paused"
  pollInterval: string
  lastSync: string
  iocs30d: number
  confidence: number
}

export const tiFeeds: TiFeed[] = [
  { id: "f_mandiant",     name: "Mandiant Advantage",          vendor: "Mandiant",        protocol: "TAXII 2.1", status: "active", pollInterval: "15 min", lastSync: "3 min ago",  iocs30d: 18_420, confidence: 88 },
  { id: "f_intel471",     name: "Intel 471 · Credentials",     vendor: "Intel 471",       protocol: "STIX 2.1",  status: "active", pollInterval: "1 h",    lastSync: "32 min ago", iocs30d: 4_201,  confidence: 92 },
  { id: "f_recorded",     name: "Recorded Future · IOC",       vendor: "Recorded Future", protocol: "HTTP JSON", status: "active", pollInterval: "30 min", lastSync: "12 min ago", iocs30d: 22_811, confidence: 84 },
  { id: "f_misp_internal",name: "Acme MISP (internal)",        vendor: "MISP",            protocol: "MISP",      status: "active", pollInterval: "5 min",  lastSync: "1 min ago",  iocs30d: 1_842,  confidence: 78 },
  { id: "f_otx",          name: "AlienVault OTX",              vendor: "AT&T",            protocol: "STIX 2.1",  status: "active", pollInterval: "1 h",    lastSync: "44 min ago", iocs30d: 9_204,  confidence: 65 },
  { id: "f_ksacert",      name: "KSA CERT advisories",         vendor: "KSA-CERT",        protocol: "HTTP JSON", status: "active", pollInterval: "Manual", lastSync: "yesterday",  iocs30d: 38,     confidence: 95 },
  { id: "f_cisa",         name: "CISA KEV catalogue",          vendor: "CISA",            protocol: "HTTP JSON", status: "paused", pollInterval: "Daily",  lastSync: "5 days ago", iocs30d: 412,    confidence: 90 },
  { id: "f_abuseipdb",    name: "AbuseIPDB enrichment",        vendor: "AbuseIPDB",       protocol: "HTTP JSON", status: "error",  pollInterval: "5 min",  lastSync: "21 min ago", iocs30d: 0,      confidence: 70 },
]

export type TiTaxonomy = {
  id: string
  label: string
  description: string
  count: number
}

export const tiTaxonomies: TiTaxonomy[] = [
  { id: "tx_actor", label: "Threat actors",    description: "Named adversaries · profiles, aliases, motivations.",          count: 142 },
  { id: "tx_camp",  label: "Campaigns",        description: "Linked operations connecting actors, TTPs and targets.",       count: 87  },
  { id: "tx_mware", label: "Malware families", description: "Curated families with hashes, capabilities, related actors.",  count: 318 },
  { id: "tx_ttp",   label: "TTPs (MITRE)",     description: "Tactics, techniques and sub-techniques observed.",             count: 612 },
  { id: "tx_vuln",  label: "Vulnerabilities",  description: "Tracked CVEs with exploitation status and patches.",            count: 1284},
]

