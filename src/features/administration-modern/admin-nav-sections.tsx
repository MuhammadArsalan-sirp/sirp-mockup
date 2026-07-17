import {
  Activity,
  AlertTriangle,
  Boxes,
  Building,
  Building2,
  ClipboardList,
  CreditCard,
  Database,
  FileText,
  Globe,
  KeyRound,
  Layers,
  Mail,
  Network,
  Palette,
  RefreshCw,
  ScrollText,
  Shield,
  ShieldCheck,
  Tag,
  Timer,
  Users,
  Users2,
  Workflow,
  type LucideIcon,
} from "lucide-react"

export type AdminNavItem = {
  to: string
  label: string
  icon: LucideIcon
  meta?: string
  /** One-line hint used in mobile nav + tooltips */
  hint?: string
}

export type AdminNavGroup = {
  id: string
  label: string
  icon: LucideIcon
  /** Short description shown on the overview / group quick-jump cards */
  blurb: string
  items: AdminNavItem[]
}

/**
 * Admin IA — Overview + 4 groups.
 * The left rail renders these groups; each item routes to its own page.
 * For product modules (Incidents / TI / Entities), the page itself owns
 * its taxonomy sub-tabs so the rail stays flat.
 */
export const adminGroups: AdminNavGroup[] = [
  {
    id: "workspace",
    label: "Workspace",
    icon: Building,
    blurb: "Tenant identity, branding, departments, sub-tenants, and license.",
    items: [
      { to: "/admin-modern/org",         label: "Organisation",     icon: Building2,  hint: "Profile, address, contacts, regional defaults" },
      { to: "/admin-modern/branding",    label: "Branding & theme", icon: Palette,    hint: "Logo, favicon, brand colours, email signature" },
      { to: "/admin-modern/departments", label: "Departments",      icon: Network,    hint: "Hierarchy and reporting lines" },
      { to: "/admin-modern/tenants",     label: "Tenants",          icon: Globe,      meta: "3", hint: "Child tenants and data residency" },
      { to: "/admin-modern/license",     label: "License & seats",  icon: CreditCard, hint: "Plan, renewal date, invoices" },
    ],
  },
  {
    id: "identity",
    label: "Identity & access",
    icon: KeyRound,
    blurb: "Users, groups, roles, SSO, session policy, MFA, and posture.",
    items: [
      { to: "/admin-modern/users",    label: "Users",               icon: Users,       meta: "142", hint: "Members, invites, seats" },
      { to: "/admin-modern/groups",   label: "Groups & teams",      icon: Users2,      meta: "5",   hint: "Security and on-call rosters" },
      { to: "/admin-modern/roles",    label: "Roles & permissions", icon: ShieldCheck, meta: "12",  hint: "Bundle permissions into roles" },
      { to: "/admin-modern/sso",      label: "SSO & SAML",          icon: KeyRound,    hint: "Okta, Entra, Google Workspace" },
      { to: "/admin-modern/sessions", label: "Session policy",      icon: Timer,       hint: "Timeouts, MFA, password rules, IP allowlist" },
      { to: "/admin-modern/posture",  label: "Security posture",    icon: Shield,      hint: "Identity hygiene checks and remediation" },
    ],
  },
  {
    id: "products",
    label: "Product configuration",
    icon: Boxes,
    blurb: "Per-module taxonomy, workflow states, SLAs, custom fields, and feeds.",
    items: [
      { to: "/admin-modern/products/incidents",    label: "Incidents",         icon: AlertTriangle, hint: "Categories, states, SLAs, custom fields, locations" },
      { to: "/admin-modern/products/threat-intel", label: "Threat intelligence", icon: Shield,        hint: "Categories, states, sources, feeds" },
      { to: "/admin-modern/products/entities",     label: "Entities",           icon: Database,      hint: "Asset types, classifications, groups, owners" },
    ],
  },
  {
    id: "automation",
    label: "Automation",
    icon: Workflow,
    blurb: "Vendor integrations, actions, and how incoming alerts route to a case.",
    items: [
      { to: "/admin-modern/automation", label: "Pipelines", icon: Workflow, meta: "5", hint: "Vendors, applications, actions, ingestion rules" },
    ],
  },
  {
    id: "platform",
    label: "Platform",
    icon: Layers,
    blurb: "Health, backups, email, notification templates, and audit logs.",
    items: [
      { to: "/admin-modern/health",    label: "Service health",         icon: Activity,      hint: "Subsystems, uptime, latency" },
      { to: "/admin-modern/backup",    label: "Backup & restore",       icon: RefreshCw,     hint: "Snapshots, retention, SFTP destinations" },
      { to: "/admin-modern/email",     label: "Email & SMTP",           icon: Mail,          hint: "Outbound SMTP, deliverability" },
      { to: "/admin-modern/templates", label: "Notification templates", icon: FileText,      hint: "Email, SMS, webhook, Slack copy" },
      { to: "/admin-modern/logs",      label: "Activity logs",          icon: ClipboardList, hint: "Audit trail across the workspace" },
    ],
  },
]

/** Flat list for the mobile dropdown + search affordances. */
export function flattenAdminNavForSelect(): {
  value: string
  label: string
  section?: string
}[] {
  const out: { value: string; label: string; section?: string }[] = [
    { value: "/admin-modern", label: "Overview" },
  ]
  for (const group of adminGroups) {
    for (const item of group.items) {
      out.push({ value: item.to, label: item.label, section: group.label })
    }
  }
  return out
}

/** Icon registry used by activity feeds + ad-hoc lookups. */
export const adminIconRegistry = {
  Activity,
  AlertTriangle,
  Boxes,
  Building,
  Building2,
  ClipboardList,
  CreditCard,
  Database,
  FileText,
  Globe,
  KeyRound,
  Layers,
  Mail,
  Network,
  Palette,
  RefreshCw,
  ScrollText,
  Shield,
  ShieldCheck,
  Tag,
  Timer,
  Users,
  Users2,
  Workflow,
} as const
