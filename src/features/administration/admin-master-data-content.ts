import type { Tone } from "@/lib/tone"

export type MasterDataRow = {
  id: string
  name: string
  description?: string
  /** Optional secondary value rendered as a tone-coloured chip */
  badge?: { label: string; tone?: Tone }
  /** Optional metric on the right side (e.g. usage count) */
  metric?: string | number
  managed?: "system" | "custom"
  updatedAt?: string
}

export type MasterDataConfig = {
  title: string
  description: string
  newButtonLabel?: string
  searchPlaceholder?: string
  /** Label of the secondary column (between Description and Updated) */
  secondaryLabel?: string
  /** Label of the right-most metric column */
  metricLabel?: string
  rows: MasterDataRow[]
}

/** Configs for every admin master-data sub-page, keyed by `{tab}/{page}`. */
export const masterDataContent: Record<string, MasterDataConfig> = {
  // ── Organization ───────────────────────────────────────────────
  "organization/organizations": {
    title: "Organisations",
    description: "All organisations registered on this SIRP instance. Super-admins can switch between them.",
    newButtonLabel: "New organisation",
    secondaryLabel: "Plan",
    metricLabel: "Tenants",
    rows: [
      { id: "org_acme",    name: "Acme Corporation",   description: "Primary tenant",                managed: "custom", badge: { label: "Enterprise", tone: "info" }, metric: 3, updatedAt: "2 days ago" },
      { id: "org_globex",  name: "Globex Industries",  description: "Customer · onboarded Q2",       managed: "custom", badge: { label: "Premium", tone: "ok" },     metric: 1, updatedAt: "1 week ago" },
      { id: "org_initech", name: "Initech",            description: "Customer · onboarded Q4",       managed: "custom", badge: { label: "Standard", tone: "muted" }, metric: 1, updatedAt: "2 weeks ago" },
    ],
  },
  "organization/users": {
    title: "Organisation users",
    description: "Users belonging to this organisation. For full access-control management see Access Control → Users.",
    newButtonLabel: "Invite user",
    secondaryLabel: "Role",
    metricLabel: "Status",
    rows: [
      { id: "u_ahmed",  name: "Ahmed Khan",     description: "ahmed.khan@acme.com",    badge: { label: "Super Admin", tone: "info" }, metric: "Active",   updatedAt: "5m ago" },
      { id: "u_sara",   name: "Sara Patel",     description: "sara.patel@acme.com",    badge: { label: "SOC Manager", tone: "info" }, metric: "Active",   updatedAt: "12m ago" },
      { id: "u_mariam", name: "Mariam Al-Saud", description: "mariam.alsaud@acme.com", badge: { label: "Analyst",      tone: "muted" }, metric: "Active",   updatedAt: "2h ago" },
      { id: "u_yusuf",  name: "Yusuf Kamal",    description: "yusuf.kamal@acme.com",   badge: { label: "Analyst",      tone: "muted" }, metric: "Pending",  updatedAt: "3 days ago" },
    ],
  },

  // ── Entities (Assets master data) ───────────────────────────────
  "entities/asset-types": {
    title: "Asset Types",
    description: "Categories of entities tracked across the platform. System types are managed by SIRP.",
    newButtonLabel: "New asset type",
    metricLabel: "Entities",
    rows: [
      { id: "at_workstation", name: "Workstation",     description: "Employee laptops and desktops",         managed: "system", metric: 642, updatedAt: "—" },
      { id: "at_server",      name: "Server",          description: "Physical and virtual servers",          managed: "system", metric: 184, updatedAt: "—" },
      { id: "at_mobile",      name: "Mobile device",   description: "MDM-managed phones and tablets",        managed: "system", metric: 308, updatedAt: "—" },
      { id: "at_cloud",       name: "Cloud workload",  description: "EC2, GCE, AKS, Lambda, GKE pods",       managed: "system", metric: 94,  updatedAt: "—" },
      { id: "at_network",     name: "Network device",  description: "Switches, firewalls, load balancers",   managed: "system", metric: 62,  updatedAt: "—" },
      { id: "at_iot",         name: "IoT / OT",        description: "Operational technology and IoT estate", managed: "custom", metric: 23,  updatedAt: "3 days ago" },
      { id: "at_app",         name: "Application",     description: "SaaS and self-hosted business apps",    managed: "custom", metric: 47,  updatedAt: "today" },
      { id: "at_container",   name: "Container image", description: "OCI images tracked in registries",      managed: "custom", metric: 218, updatedAt: "yesterday" },
    ],
  },
  "entities/classifications": {
    title: "Classifications",
    description: "Criticality tiers and data-classification labels applied to entities.",
    newButtonLabel: "New classification",
    secondaryLabel: "Tier",
    metricLabel: "Entities",
    rows: [
      { id: "cl_crit",     name: "Critical",          description: "Tier-0 — failure halts operations",         badge: { label: "Tier 0", tone: "alert" }, managed: "system", metric: 14,  updatedAt: "—" },
      { id: "cl_high",     name: "High",              description: "Revenue-impacting or customer-facing",      badge: { label: "Tier 1", tone: "warn"  }, managed: "system", metric: 78,  updatedAt: "—" },
      { id: "cl_elevated", name: "Elevated",          description: "Important internal — meaningful disruption",badge: { label: "Tier 2", tone: "info"  }, managed: "system", metric: 142, updatedAt: "—" },
      { id: "cl_medium",   name: "Medium",            description: "Standard estate — recoverable within SLA",  badge: { label: "Tier 3", tone: "muted" }, managed: "system", metric: 480, updatedAt: "—" },
      { id: "cl_low",      name: "Low",               description: "Discoverable but not critical",              badge: { label: "Tier 4", tone: "muted" }, managed: "system", metric: 218, updatedAt: "—" },
      { id: "cl_data_restr", name: "Restricted data", description: "PII / PCI / regulated workloads",            badge: { label: "Data",   tone: "alert" }, managed: "custom", metric: 32,  updatedAt: "1 week ago" },
    ],
  },
  "entities/groups": {
    title: "Asset Groups",
    description: "Logical groupings of assets used to scope alerts, dashboards, and ownership.",
    newButtonLabel: "New asset group",
    metricLabel: "Members",
    rows: [
      { id: "g_payments",  name: "Payments platform", description: "PCI scope — card processing, BIN routing", managed: "custom", metric: 24,  updatedAt: "yesterday" },
      { id: "g_corp_it",   name: "Corporate IT",       description: "Office network + employee devices",       managed: "custom", metric: 218, updatedAt: "today" },
      { id: "g_security",  name: "Security tooling",   description: "EDR, SIEM, SOAR, identity platforms",     managed: "custom", metric: 18,  updatedAt: "this morning" },
      { id: "g_data_eng",  name: "Data engineering",   description: "Lakes, pipelines, warehouses",            managed: "custom", metric: 31,  updatedAt: "3 days ago" },
      { id: "g_crown",     name: "Crown jewels",       description: "Highest-value assets",                    managed: "custom", metric: 7,   updatedAt: "1 month ago" },
    ],
  },
  "entities/sub-groups": {
    title: "Asset Sub-Groups",
    description: "Fine-grained sub-divisions inside asset groups.",
    newButtonLabel: "New sub-group",
    metricLabel: "Members",
    rows: [
      { id: "sg_payments_pci",  name: "Payments → PCI in-scope",     description: "Cardholder data environment",       managed: "custom", metric: 12, updatedAt: "today" },
      { id: "sg_corp_it_endp",  name: "Corporate IT → Endpoints",    description: "Employee laptops",                    managed: "custom", metric: 142, updatedAt: "today" },
      { id: "sg_data_eng_db",   name: "Data engineering → Databases",description: "Postgres, ClickHouse, Snowflake",     managed: "custom", metric: 9,   updatedAt: "1 week ago" },
    ],
  },
  "entities/business-groups": {
    title: "Business Groups",
    description: "Business units for cost allocation, ownership, and reporting.",
    newButtonLabel: "New business group",
    metricLabel: "Assets",
    rows: [
      { id: "bg_retail",     name: "Retail",     description: "Customer-facing storefront",   managed: "custom", metric: 218, updatedAt: "2 weeks ago" },
      { id: "bg_wholesale",  name: "Wholesale",  description: "B2B and partner-facing systems", managed: "custom", metric: 92, updatedAt: "1 month ago" },
      { id: "bg_operations", name: "Operations", description: "Internal ops and back-office",   managed: "custom", metric: 184, updatedAt: "today" },
      { id: "bg_engineering",name: "Engineering",description: "Product engineering",            managed: "custom", metric: 312, updatedAt: "today" },
    ],
  },
  "entities/owners": {
    title: "Owners",
    description: "Teams or individuals accountable for assets in this organisation.",
    newButtonLabel: "New owner",
    metricLabel: "Assets owned",
    rows: [
      { id: "o_it_ops",     name: "IT Operations",       description: "Endpoint, server, network",          managed: "custom", metric: 524, updatedAt: "today" },
      { id: "o_appdev",     name: "Application Dev",     description: "App owners, release engineering",    managed: "custom", metric: 138, updatedAt: "yesterday" },
      { id: "o_sec_ops",    name: "Security Operations", description: "SOC, IR, threat intel",              managed: "custom", metric: 32,  updatedAt: "today" },
      { id: "o_data_eng",   name: "Data Engineering",    description: "Pipelines, warehouses, ML platform", managed: "custom", metric: 47,  updatedAt: "3 days ago" },
    ],
  },
  "entities/value": {
    title: "Asset Value",
    description: "Business-value scoring used in risk and prioritisation calculations.",
    newButtonLabel: "New value tier",
    secondaryLabel: "Score",
    rows: [
      { id: "av_crown",    name: "Crown jewel", description: "Highest business value",                   badge: { label: "95–100", tone: "alert" }, managed: "system", updatedAt: "—" },
      { id: "av_critical", name: "Critical",    description: "Revenue or compliance-critical",            badge: { label: "75–94",  tone: "warn"  }, managed: "system", updatedAt: "—" },
      { id: "av_important",name: "Important",   description: "Operationally important",                    badge: { label: "50–74",  tone: "info"  }, managed: "system", updatedAt: "—" },
      { id: "av_standard", name: "Standard",    description: "Standard business asset",                    badge: { label: "25–49",  tone: "muted" }, managed: "system", updatedAt: "—" },
      { id: "av_low",      name: "Low",         description: "Low-value or development asset",             badge: { label: "0–24",   tone: "muted" }, managed: "system", updatedAt: "—" },
    ],
  },
  "entities/os": {
    title: "Operating Systems",
    description: "Operating-system catalogue used for matching CVEs, posture and patch reporting.",
    newButtonLabel: "New OS",
    metricLabel: "Devices",
    rows: [
      { id: "os_win11",  name: "Windows 11",     description: "Enterprise & Pro builds",         managed: "system", metric: 420, updatedAt: "—" },
      { id: "os_win10",  name: "Windows 10",     description: "Sunset 2025-10 — migrate to 11",  managed: "system", metric: 184, updatedAt: "—", badge: { label: "EOL", tone: "warn" } },
      { id: "os_winsrv", name: "Windows Server", description: "2016 / 2019 / 2022",              managed: "system", metric: 92,  updatedAt: "—" },
      { id: "os_macos",  name: "macOS",          description: "13 Ventura · 14 Sonoma · 15 Sequoia", managed: "system", metric: 142, updatedAt: "—" },
      { id: "os_ubuntu", name: "Ubuntu Linux",   description: "20.04 / 22.04 / 24.04 LTS",       managed: "system", metric: 124, updatedAt: "—" },
      { id: "os_rhel",   name: "Red Hat / Rocky",description: "RHEL 8/9 + Rocky equivalents",     managed: "system", metric: 38,  updatedAt: "—" },
      { id: "os_ios",    name: "iOS / iPadOS",   description: "Apple Business Manager enrolled", managed: "system", metric: 168, updatedAt: "—" },
      { id: "os_android",name: "Android",        description: "Android Enterprise managed",      managed: "system", metric: 140, updatedAt: "—" },
    ],
  },
  "entities/field-settings": {
    title: "Field Settings",
    description: "Custom fields available on entity records. Used in detail pages and reports.",
    newButtonLabel: "New field",
    secondaryLabel: "Type",
    rows: [
      { id: "f_pci_scope",   name: "PCI scope",        description: "Yes / No / Unknown",                 badge: { label: "Picklist", tone: "muted" }, managed: "system", updatedAt: "—" },
      { id: "f_cost_center", name: "Cost centre",      description: "Free-text for billing roll-up",       badge: { label: "Text",     tone: "muted" }, managed: "custom", updatedAt: "1 week ago" },
      { id: "f_warranty",    name: "Warranty expiry",   description: "Date-only field",                     badge: { label: "Date",     tone: "muted" }, managed: "custom", updatedAt: "2 weeks ago" },
      { id: "f_data_class",  name: "Data sensitivity", description: "Public / Internal / Confidential",   badge: { label: "Picklist", tone: "muted" }, managed: "custom", updatedAt: "1 month ago" },
    ],
  },

  // ── Incident Management ─────────────────────────────────────────
  "incident-management/subcategories": {
    title: "Sub-Categories",
    description: "Refinement of top-level incident categories for accurate routing and reporting.",
    newButtonLabel: "New sub-category",
    secondaryLabel: "Parent",
    metricLabel: "Incidents",
    rows: [
      { id: "sc_ransomware", name: "Ransomware",     description: "Encryption ransom incidents",        badge: { label: "Malware",       tone: "info" }, metric: 12, updatedAt: "—" },
      { id: "sc_bec",        name: "BEC · Wire fraud", description: "Business email compromise",         badge: { label: "Phishing",      tone: "info" }, metric: 8,  updatedAt: "—" },
      { id: "sc_credstuff",  name: "Credential stuffing", description: "Automated credential abuse",    badge: { label: "Unauthorised",  tone: "info" }, metric: 24, updatedAt: "—" },
      { id: "sc_dlp",        name: "Data exfiltration",description: "Outbound data movement",            badge: { label: "Data leak",     tone: "info" }, metric: 6,  updatedAt: "—" },
    ],
  },
  "incident-management/states": {
    title: "States",
    description: "Workflow states an incident can be in. Drives SLA timers and routing.",
    newButtonLabel: "New state",
    secondaryLabel: "Kind",
    rows: [
      { id: "st_open",        name: "Open",          description: "Just created, not yet acknowledged",          badge: { label: "Active", tone: "alert" }, managed: "system", updatedAt: "—" },
      { id: "st_investigating",name: "Investigating",description: "Analyst is actively working",                  badge: { label: "Active", tone: "warn"  }, managed: "system", updatedAt: "—" },
      { id: "st_inprogress",  name: "In Progress",   description: "Containment/remediation underway",             badge: { label: "Active", tone: "warn"  }, managed: "system", updatedAt: "—" },
      { id: "st_waiting",     name: "Waiting",       description: "Waiting on external party",                    badge: { label: "Pause",  tone: "info"  }, managed: "system", updatedAt: "—" },
      { id: "st_resolved",    name: "Resolved",      description: "Fixed pending closure",                        badge: { label: "Closed", tone: "ok"    }, managed: "system", updatedAt: "—" },
      { id: "st_closed",      name: "Closed",        description: "Final state",                                  badge: { label: "Closed", tone: "muted" }, managed: "system", updatedAt: "—" },
    ],
  },
  "incident-management/substates": {
    title: "Sub-States",
    description: "Fine-grained sub-states for triage, e.g. 'Open · Awaiting triage'.",
    newButtonLabel: "New sub-state",
    secondaryLabel: "Parent",
    rows: [
      { id: "ss_awaiting",  name: "Awaiting triage",       description: "No analyst assigned yet",   badge: { label: "Open",          tone: "muted" }, managed: "system", updatedAt: "—" },
      { id: "ss_analyst",   name: "With analyst",          description: "Assigned and acknowledged", badge: { label: "Investigating", tone: "muted" }, managed: "system", updatedAt: "—" },
      { id: "ss_l2",        name: "Escalated to L2",       description: "Tier-2 SOC review",         badge: { label: "Investigating", tone: "muted" }, managed: "system", updatedAt: "—" },
      { id: "ss_vendor",    name: "Waiting on vendor",      description: "External vendor response",  badge: { label: "Waiting",       tone: "muted" }, managed: "custom", updatedAt: "2 weeks ago" },
    ],
  },
  "incident-management/fields": {
    title: "Custom Fields",
    description: "Custom fields available on incident tickets. Shown in detail page + reports.",
    newButtonLabel: "New field",
    secondaryLabel: "Type",
    rows: [
      { id: "if_root_cause", name: "Root cause",     description: "Free-text RCA narrative",              badge: { label: "Text",     tone: "muted" }, managed: "custom", updatedAt: "1 week ago" },
      { id: "if_business",   name: "Business impact",description: "Picklist: low/medium/high/critical",   badge: { label: "Picklist", tone: "muted" }, managed: "custom", updatedAt: "2 weeks ago" },
      { id: "if_external",   name: "External ref",   description: "Vendor ticket id",                      badge: { label: "Text",     tone: "muted" }, managed: "custom", updatedAt: "1 month ago" },
    ],
  },
  "incident-management/locations": {
    title: "Locations",
    description: "Physical or logical locations attached to incidents.",
    newButtonLabel: "New location",
    secondaryLabel: "Type",
    rows: [
      { id: "loc_ksa_riyadh", name: "Riyadh DC1",        description: "Saudi Arabia · primary DC",   badge: { label: "Datacentre", tone: "info" }, managed: "custom", updatedAt: "—" },
      { id: "loc_ksa_jeddah", name: "Jeddah DC",         description: "Saudi Arabia · DR site",       badge: { label: "Datacentre", tone: "info" }, managed: "custom", updatedAt: "—" },
      { id: "loc_uae_dubai",  name: "Dubai DC",          description: "United Arab Emirates",         badge: { label: "Datacentre", tone: "info" }, managed: "custom", updatedAt: "—" },
      { id: "loc_uk_london",  name: "London HQ",         description: "United Kingdom · HQ office",   badge: { label: "Office",     tone: "muted" }, managed: "custom", updatedAt: "—" },
    ],
  },
  "incident-management/detection-methods": {
    title: "Detection Methods",
    description: "How the incident was first detected. Used in trend analysis.",
    newButtonLabel: "New detection method",
    rows: [
      { id: "dm_siem",      name: "SIEM rule",            description: "Detection rule fired in SIEM",       managed: "system", updatedAt: "—" },
      { id: "dm_edr",       name: "EDR alert",            description: "Endpoint detection & response",       managed: "system", updatedAt: "—" },
      { id: "dm_omnisense", name: "OmniSense agent",      description: "AI agent flagged the event",          managed: "system", updatedAt: "—" },
      { id: "dm_user",      name: "User report",          description: "Reported by an end-user",             managed: "system", updatedAt: "—" },
      { id: "dm_thirdparty",name: "Third-party feed",     description: "External threat intel feed",          managed: "custom", updatedAt: "1 month ago" },
    ],
  },
  "incident-management/containment": {
    title: "Containment Status",
    description: "States used during containment phase of incident response.",
    newButtonLabel: "New containment status",
    rows: [
      { id: "cs_pending",   name: "Pending",   description: "Containment not yet started",   managed: "system", updatedAt: "—" },
      { id: "cs_partial",   name: "Partial",   description: "Partially contained",            managed: "system", updatedAt: "—" },
      { id: "cs_contained", name: "Contained", description: "Fully contained",                managed: "system", updatedAt: "—" },
      { id: "cs_eradicated",name: "Eradicated",description: "Threat removed, monitoring continues", managed: "system", updatedAt: "—" },
    ],
  },
  "incident-management/contained-by": {
    title: "Contained By",
    description: "Who contained the incident — for routing & reporting.",
    newButtonLabel: "New entry",
    rows: [
      { id: "cb_soc_l1",  name: "SOC L1",       description: "Tier-1 analysts",        managed: "system", updatedAt: "—" },
      { id: "cb_soc_l2",  name: "SOC L2",       description: "Tier-2 analysts",        managed: "system", updatedAt: "—" },
      { id: "cb_ir_team", name: "IR Team",       description: "Incident response team", managed: "system", updatedAt: "—" },
      { id: "cb_external",name: "External MSSP", description: "Managed service provider",managed: "custom", updatedAt: "1 month ago" },
    ],
  },
  "incident-management/escalation": {
    title: "Escalation",
    description: "Escalation paths used by SLA breach and severity rules.",
    newButtonLabel: "New escalation rule",
    secondaryLabel: "Trigger",
    rows: [
      { id: "esc_sla", name: "SLA breach · 60 min", description: "Notify SOC Manager + L2 on-call",     badge: { label: "SLA",         tone: "warn"  }, managed: "custom", updatedAt: "1 week ago" },
      { id: "esc_sev1",name: "Severity 1 raised",    description: "Notify on-call + page Director",      badge: { label: "Severity",    tone: "alert" }, managed: "custom", updatedAt: "2 weeks ago" },
      { id: "esc_vip", name: "VIP user impacted",    description: "Notify Comms team",                    badge: { label: "Context",     tone: "info"  }, managed: "custom", updatedAt: "1 month ago" },
    ],
  },
  "incident-management/lessons-learned": {
    title: "Lessons Learned",
    description: "Post-incident review templates and categories.",
    newButtonLabel: "New lesson category",
    rows: [
      { id: "ll_detect", name: "Detection gap",   description: "Detection coverage shortfall",     managed: "system", updatedAt: "—" },
      { id: "ll_process",name: "Process gap",     description: "Procedure or runbook gap",          managed: "system", updatedAt: "—" },
      { id: "ll_tooling",name: "Tooling gap",     description: "Tool capability gap",                managed: "system", updatedAt: "—" },
      { id: "ll_train",  name: "Training gap",    description: "Analyst training opportunity",       managed: "system", updatedAt: "—" },
    ],
  },
  "incident-management/nciss": {
    title: "NCISS Scoring",
    description: "National Cyber Incident Severity Schema categories used for federal reporting.",
    newButtonLabel: "New NCISS entry",
    secondaryLabel: "Level",
    rows: [
      { id: "nc_5", name: "Emergency",          description: "Level 5 — emergency",                 badge: { label: "Level 5", tone: "alert" }, managed: "system", updatedAt: "—" },
      { id: "nc_4", name: "Severe",             description: "Level 4 — severe impact",             badge: { label: "Level 4", tone: "warn"  }, managed: "system", updatedAt: "—" },
      { id: "nc_3", name: "High",               description: "Level 3 — high impact",               badge: { label: "Level 3", tone: "warn"  }, managed: "system", updatedAt: "—" },
      { id: "nc_2", name: "Medium",             description: "Level 2 — medium impact",             badge: { label: "Level 2", tone: "info"  }, managed: "system", updatedAt: "—" },
      { id: "nc_1", name: "Low",                description: "Level 1 — low impact",                badge: { label: "Level 1", tone: "muted" }, managed: "system", updatedAt: "—" },
      { id: "nc_0", name: "Baseline",           description: "Level 0 — no impact",                 badge: { label: "Level 0", tone: "muted" }, managed: "system", updatedAt: "—" },
    ],
  },

  // ── Threat Intelligence ─────────────────────────────────────────
  "threat-intelligence/subcategories": {
    title: "Sub-Categories",
    description: "Refinement of top-level TI categories — used for routing intel.",
    newButtonLabel: "New sub-category",
    secondaryLabel: "Parent",
    rows: [
      { id: "tisc_lockbit", name: "LockBit",     description: "LockBit ransomware family",         badge: { label: "Ransomware", tone: "info" }, managed: "custom", updatedAt: "—" },
      { id: "tisc_blackcat",name: "BlackCat",    description: "AlphV / BlackCat ransomware",        badge: { label: "Ransomware", tone: "info" }, managed: "custom", updatedAt: "—" },
      { id: "tisc_emotet",  name: "Emotet",      description: "Emotet downloader campaigns",        badge: { label: "Malware",    tone: "info" }, managed: "custom", updatedAt: "—" },
    ],
  },
  "threat-intelligence/states": {
    title: "States",
    description: "States threat intel advisories can be in.",
    newButtonLabel: "New state",
    rows: [
      { id: "tis_pending", name: "Pending",   description: "Newly ingested, not yet triaged",  managed: "system", updatedAt: "—" },
      { id: "tis_case",    name: "In case",   description: "Linked to an active case",          managed: "system", updatedAt: "—" },
      { id: "tis_finish",  name: "Finished",  description: "Triage complete, no action",        managed: "system", updatedAt: "—" },
    ],
  },
  "threat-intelligence/threat-actors": {
    title: "Threat Actors",
    description: "Tracked adversaries — used to cluster intel and incidents.",
    newButtonLabel: "New threat actor",
    secondaryLabel: "Origin",
    metricLabel: "Campaigns",
    rows: [
      { id: "ta_apt28",  name: "APT28 (Fancy Bear)",    description: "Russia-linked, GRU 26165",   badge: { label: "Russia",  tone: "alert" }, managed: "custom", metric: 12, updatedAt: "1 week ago" },
      { id: "ta_apt41",  name: "APT41",                  description: "China-linked, dual espionage", badge: { label: "China",   tone: "alert" }, managed: "custom", metric: 18, updatedAt: "3 days ago" },
      { id: "ta_lazarus",name: "Lazarus Group",          description: "DPRK-linked, financial focus", badge: { label: "DPRK",    tone: "alert" }, managed: "custom", metric: 9,  updatedAt: "2 weeks ago" },
      { id: "ta_fin7",   name: "FIN7",                   description: "Financially motivated",         badge: { label: "Unknown", tone: "muted" }, managed: "custom", metric: 14, updatedAt: "1 month ago" },
    ],
  },
  "threat-intelligence/associated-actors": {
    title: "Associated Actors",
    description: "Aliases and associated subgroups linked to primary threat actors.",
    newButtonLabel: "New association",
    secondaryLabel: "Primary",
    rows: [
      { id: "aa_apt28_fancy",  name: "Fancy Bear",  description: "Alias for APT28",        badge: { label: "APT28",  tone: "info" }, managed: "custom", updatedAt: "1 week ago" },
      { id: "aa_apt28_strontium", name: "Strontium", description: "Microsoft naming for APT28", badge: { label: "APT28",  tone: "info" }, managed: "custom", updatedAt: "1 week ago" },
      { id: "aa_lazarus_bluenoroff", name: "BlueNoroff", description: "Subgroup of Lazarus", badge: { label: "Lazarus", tone: "info" }, managed: "custom", updatedAt: "2 weeks ago" },
    ],
  },
  "threat-intelligence/affected-products": {
    title: "Affected Products",
    description: "Products mentioned in advisories — used for impact matching.",
    newButtonLabel: "New product",
    secondaryLabel: "Vendor",
    metricLabel: "Advisories",
    rows: [
      { id: "ap_win",      name: "Microsoft Windows",  description: "All Windows versions",       badge: { label: "Microsoft",       tone: "info" }, managed: "system", metric: 84, updatedAt: "—" },
      { id: "ap_exchange", name: "Microsoft Exchange", description: "Exchange Server on-prem",     badge: { label: "Microsoft",       tone: "info" }, managed: "system", metric: 31, updatedAt: "—" },
      { id: "ap_chrome",   name: "Google Chrome",      description: "Chrome desktop browser",       badge: { label: "Google",          tone: "info" }, managed: "system", metric: 22, updatedAt: "—" },
      { id: "ap_apache",   name: "Apache HTTP Server", description: "Open-source web server",       badge: { label: "Apache",          tone: "info" }, managed: "system", metric: 14, updatedAt: "—" },
    ],
  },
  "threat-intelligence/affected-vendors": {
    title: "Affected Vendors",
    description: "Vendors whose products appear in advisories.",
    newButtonLabel: "New vendor",
    metricLabel: "Products",
    rows: [
      { id: "av_microsoft", name: "Microsoft", description: "Operating systems, productivity, cloud", managed: "system", metric: 47, updatedAt: "—" },
      { id: "av_google",    name: "Google",    description: "Chrome, Android, Workspace, GCP",       managed: "system", metric: 22, updatedAt: "—" },
      { id: "av_cisco",     name: "Cisco",     description: "Networking, security, collab",          managed: "system", metric: 18, updatedAt: "—" },
      { id: "av_fortinet",  name: "Fortinet",  description: "FortiGate, FortiAnalyzer, FortiOS",      managed: "system", metric: 12, updatedAt: "—" },
    ],
  },
  "threat-intelligence/feeds": {
    title: "Threat Feeds",
    description: "External feeds ingested into SIRP's threat intel surface.",
    newButtonLabel: "Connect new feed",
    secondaryLabel: "Protocol",
    metricLabel: "IOCs · 24h",
    rows: [
      { id: "tf_misp",      name: "MISP",          description: "Open-source TI platform",            badge: { label: "TAXII 2.1", tone: "info" }, managed: "custom", metric: 4218, updatedAt: "today" },
      { id: "tf_otx",       name: "AlienVault OTX",description: "Community threat intel",              badge: { label: "STIX 2.1",  tone: "info" }, managed: "custom", metric: 2104, updatedAt: "today" },
      { id: "tf_threatfox", name: "ThreatFox",     description: "abuse.ch IOC feed",                    badge: { label: "HTTP JSON", tone: "info" }, managed: "custom", metric: 1840, updatedAt: "today" },
      { id: "tf_anomali",   name: "Anomali",       description: "Commercial threat intel",              badge: { label: "TAXII 2.1", tone: "info" }, managed: "custom", metric:  812, updatedAt: "yesterday" },
    ],
  },

  // ── Access Control ──────────────────────────────────────────────
  "access-control/actions": {
    title: "Actions",
    description: "Granular permission actions — building blocks for roles.",
    newButtonLabel: "New action",
    secondaryLabel: "Module",
    rows: [
      { id: "act_inc_view",   name: "incident:view",        description: "Read incident records",        badge: { label: "Incidents",       tone: "info" }, managed: "system", updatedAt: "—" },
      { id: "act_inc_edit",   name: "incident:edit",        description: "Modify incident records",      badge: { label: "Incidents",       tone: "info" }, managed: "system", updatedAt: "—" },
      { id: "act_inc_close",  name: "incident:close",       description: "Close incidents",              badge: { label: "Incidents",       tone: "info" }, managed: "system", updatedAt: "—" },
      { id: "act_ti_view",    name: "ti:view",              description: "Read TI advisories",           badge: { label: "Threat Intel",    tone: "info" }, managed: "system", updatedAt: "—" },
      { id: "act_admin_users",name: "admin:users:manage",   description: "Create/edit users",            badge: { label: "Administration",   tone: "info" }, managed: "system", updatedAt: "—" },
      { id: "act_sara_chat",  name: "sara:chat",            description: "Use Sara Co-Analyst",          badge: { label: "AI",               tone: "info" }, managed: "system", updatedAt: "—" },
    ],
  },
  "access-control/action-groups": {
    title: "Action Groups",
    description: "Bundles of actions for easier role assignment.",
    newButtonLabel: "New action group",
    metricLabel: "Actions",
    rows: [
      { id: "ag_inc_full",   name: "Incident — Full access",   description: "All incident permissions",       managed: "system", metric: 12, updatedAt: "—" },
      { id: "ag_inc_read",   name: "Incident — Read-only",     description: "View incidents only",             managed: "system", metric: 4,  updatedAt: "—" },
      { id: "ag_ti_analyst", name: "TI — Analyst",             description: "View + comment on advisories",    managed: "system", metric: 6,  updatedAt: "—" },
      { id: "ag_admin_full", name: "Administration — Full",    description: "All admin permissions",           managed: "system", metric: 28, updatedAt: "—" },
    ],
  },
  "access-control/privileges": {
    title: "Privileges",
    description: "Effective privilege resolution — which actions each role can perform.",
    newButtonLabel: "New privilege",
    secondaryLabel: "Effect",
    rows: [
      { id: "pr_soc_inc",   name: "SOC Manager → Incidents", description: "All incident actions allowed", badge: { label: "Allow", tone: "ok"    }, managed: "system", updatedAt: "—" },
      { id: "pr_analyst_close", name: "Analyst → incident:close",description: "Closing requires approval",     badge: { label: "Approve",tone: "warn" }, managed: "custom", updatedAt: "1 week ago" },
      { id: "pr_readonly_edit",name: "Read-only → incident:edit",description: "Editing denied",                 badge: { label: "Deny",  tone: "alert"}, managed: "system", updatedAt: "—" },
    ],
  },
  "access-control/third-party": {
    title: "Third Party (API)",
    description: "API keys and machine identities used by external systems.",
    newButtonLabel: "New API key",
    secondaryLabel: "Scope",
    metricLabel: "Last used",
    rows: [
      { id: "tp_zapier",      name: "Zapier integration", description: "Webhook ingestion",         badge: { label: "Ingestion",   tone: "info"  }, managed: "custom", metric: "5m ago",   updatedAt: "1 month ago" },
      { id: "tp_audit_export",name: "Audit exporter",     description: "Read-only log export",       badge: { label: "Read",        tone: "muted" }, managed: "custom", metric: "1h ago",   updatedAt: "3 months ago" },
      { id: "tp_legacy_app",  name: "Legacy app sync",    description: "Older custom integration",   badge: { label: "Full",        tone: "alert" }, managed: "custom", metric: "2 days",   updatedAt: "1 year ago" },
    ],
  },

  // ── Product Settings ────────────────────────────────────────────
  "product-settings/sftp": {
    title: "SFTP Destinations",
    description: "SFTP servers used for backup uploads and report exports.",
    newButtonLabel: "Add SFTP destination",
    secondaryLabel: "Use",
    metricLabel: "Last sync",
    rows: [
      { id: "sftp_backup_a",  name: "backup-a.acme.internal",  description: "Primary backup destination",  badge: { label: "Backup",   tone: "info" }, managed: "custom", metric: "12m ago",  updatedAt: "1 month ago" },
      { id: "sftp_backup_b",  name: "backup-b.acme.internal",  description: "Secondary / DR destination",   badge: { label: "Backup",   tone: "info" }, managed: "custom", metric: "12m ago",  updatedAt: "1 month ago" },
      { id: "sftp_exports",   name: "exports.partner.com",      description: "Compliance exports drop",      badge: { label: "Exports",  tone: "muted"}, managed: "custom", metric: "3 days",   updatedAt: "2 months ago" },
    ],
  },
  "product-settings/notifications": {
    title: "Notifications",
    description: "Where SIRP sends platform notifications (incident alerts, SLA breaches, etc.).",
    newButtonLabel: "New channel",
    secondaryLabel: "Channel",
    rows: [
      { id: "nt_soc_email",   name: "SOC alerts inbox",       description: "All Sev1/Sev2 alerts",              badge: { label: "Email", tone: "muted" }, managed: "custom", updatedAt: "1 week ago" },
      { id: "nt_oncall_slack",name: "#soc-oncall (Slack)",    description: "On-call channel for paging",       badge: { label: "Slack", tone: "info"  }, managed: "custom", updatedAt: "2 weeks ago" },
      { id: "nt_exec_digest", name: "Exec weekly digest",     description: "Mariam, Ahmed, Director",          badge: { label: "Email", tone: "muted" }, managed: "custom", updatedAt: "1 month ago" },
      { id: "nt_pagerduty",   name: "PagerDuty primary",      description: "After-hours severity-1",            badge: { label: "Webhook", tone: "warn" }, managed: "custom", updatedAt: "1 month ago" },
    ],
  },
  "product-settings/widgets": {
    title: "Widgets",
    description: "Reusable widgets that can be placed on OmniBoard and dashboards.",
    newButtonLabel: "New widget",
    secondaryLabel: "Kind",
    rows: [
      { id: "wd_tickets_by_sev", name: "Tickets by severity", description: "Stacked bar chart",   badge: { label: "Chart",  tone: "info"  }, managed: "system", updatedAt: "—" },
      { id: "wd_mttr",           name: "MTTR · trend",         description: "KPI tile + trend",     badge: { label: "KPI",    tone: "muted" }, managed: "system", updatedAt: "—" },
      { id: "wd_top_artifacts",  name: "Top artifacts",        description: "List of top IoCs",     badge: { label: "List",   tone: "muted" }, managed: "system", updatedAt: "—" },
      { id: "wd_custom_sla",     name: "Custom SLA tracker",   description: "Per-tenant SLA view",   badge: { label: "Chart",  tone: "info"  }, managed: "custom", updatedAt: "1 month ago" },
    ],
  },
  "product-settings/feedback": {
    title: "Feedback",
    description: "Product feedback collected from users via the in-app feedback widget.",
    newButtonLabel: "Export feedback",
    secondaryLabel: "Severity",
    rows: [
      { id: "fb_001", name: "Filter persistence",       description: "List filters reset on tab switch",      badge: { label: "Medium", tone: "warn"  }, updatedAt: "yesterday" },
      { id: "fb_002", name: "OmniSense verdict timing",   description: "Verdict takes 2-3 minutes",            badge: { label: "Low",    tone: "muted" }, updatedAt: "3 days ago" },
      { id: "fb_003", name: "Dark-mode chart contrast",  description: "Charts hard to read in dark mode",     badge: { label: "Low",    tone: "muted" }, updatedAt: "1 week ago" },
    ],
  },

  // ── Logs ─────────────────────────────────────────────────────────
  "logs/app": {
    title: "Application Logs",
    description: "Server-side application errors and warnings.",
    newButtonLabel: "Export",
    secondaryLabel: "Level",
    metricLabel: "Source",
    rows: [
      { id: "al_001", name: "Worker queue timeout",         description: "Job redis_export timed out after 30s", badge: { label: "ERROR", tone: "alert" }, metric: "worker-2",    updatedAt: "5m ago" },
      { id: "al_002", name: "DB connection pool exhausted", description: "Pool wait 5s exceeded",                 badge: { label: "WARN",  tone: "warn"  }, metric: "api-3",       updatedAt: "12m ago" },
      { id: "al_003", name: "Cache miss spike",             description: "Redis miss rate 14%",                    badge: { label: "INFO",  tone: "info"  }, metric: "redis-1",     updatedAt: "1h ago" },
      { id: "al_004", name: "Background scan finished",     description: "Scanned 12k artifacts",                  badge: { label: "INFO",  tone: "muted" }, metric: "scanner-1",   updatedAt: "3h ago" },
    ],
  },
  "logs/authentication": {
    title: "Authentication Logs",
    description: "Sign-in attempts, MFA challenges, password resets, SSO events.",
    newButtonLabel: "Export",
    secondaryLabel: "Result",
    metricLabel: "Source IP",
    rows: [
      { id: "ath_001", name: "Sign-in · ahmed.khan",  description: "TOTP succeeded",                badge: { label: "Success", tone: "ok"    }, metric: "203.0.113.42",  updatedAt: "2m ago" },
      { id: "ath_002", name: "Sign-in · unknown",     description: "Password failed · 3rd attempt", badge: { label: "Locked",  tone: "alert" }, metric: "198.51.100.7",  updatedAt: "7m ago" },
      { id: "ath_003", name: "MFA reset · sara.patel",description: "Reset by Ahmed Khan",            badge: { label: "Admin",   tone: "warn"  }, metric: "—",              updatedAt: "1h ago" },
      { id: "ath_004", name: "SSO callback · Okta",   description: "User mariam.alsaud signed in",   badge: { label: "Success", tone: "ok"    }, metric: "Okta",           updatedAt: "2h ago" },
    ],
  },
  "logs/ingestion": {
    title: "Ingestion Logs",
    description: "Events ingested from external sources (SIEM, EDR, APIs).",
    newButtonLabel: "Export",
    secondaryLabel: "Source",
    metricLabel: "Events",
    rows: [
      { id: "ing_001", name: "Splunk · syslog-ng",      description: "Bulk batch ingested",          badge: { label: "Splunk",     tone: "info" }, metric: "12,420", updatedAt: "5m ago" },
      { id: "ing_002", name: "CrowdStrike · webhook",    description: "Live alerts ingested",         badge: { label: "CrowdStrike",tone: "info" }, metric: "84",     updatedAt: "8m ago" },
      { id: "ing_003", name: "MISP · TAXII poll",        description: "IOCs ingested",                badge: { label: "MISP",       tone: "info" }, metric: "418",    updatedAt: "12m ago" },
      { id: "ing_004", name: "AWS GuardDuty · S3",       description: "Findings batch",                badge: { label: "AWS",        tone: "info" }, metric: "32",     updatedAt: "20m ago" },
    ],
  },
  "logs/pre-ingestion": {
    title: "Pre-Ingestion Logs",
    description: "Validation, deduplication and parser-level events before ingestion finalises.",
    newButtonLabel: "Export",
    secondaryLabel: "Result",
    metricLabel: "Source",
    rows: [
      { id: "pre_001", name: "Parser · syslog-ng",       description: "Schema validation passed",        badge: { label: "Pass",    tone: "ok"    }, metric: "syslog-ng",  updatedAt: "5m ago" },
      { id: "pre_002", name: "Dedup · CrowdStrike",       description: "84 events → 71 unique",          badge: { label: "Dedup",   tone: "info"  }, metric: "CrowdStrike",updatedAt: "8m ago" },
      { id: "pre_003", name: "Parser · custom JSON",      description: "2 events failed schema",          badge: { label: "Fail",    tone: "alert" }, metric: "Webhook",    updatedAt: "1h ago" },
    ],
  },
  "logs/notifications": {
    title: "Notification Logs",
    description: "Sent notifications (email, Slack, PagerDuty, webhook).",
    newButtonLabel: "Export",
    secondaryLabel: "Channel",
    metricLabel: "Result",
    rows: [
      { id: "nl_001", name: "SLA breach · INC-2847",  description: "Sent to SOC manager",         badge: { label: "Email",    tone: "muted" }, metric: "Delivered", updatedAt: "12m ago" },
      { id: "nl_002", name: "Sev1 raised · INC-2851",  description: "Paged on-call",                badge: { label: "PagerDuty",tone: "warn"  }, metric: "Acked",     updatedAt: "20m ago" },
      { id: "nl_003", name: "Exec digest · weekly",    description: "Sent to 4 recipients",         badge: { label: "Email",    tone: "muted" }, metric: "Delivered", updatedAt: "yesterday" },
    ],
  },
}

/** Get a config by tab + page id. Returns undefined if no config exists. */
export function getMasterDataConfig(tab: string, page: string): MasterDataConfig | undefined {
  return masterDataContent[`${tab}/${page}`]
}
