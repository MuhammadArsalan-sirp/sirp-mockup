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
      { to: "/admin/org",         label: "Organisation",     icon: Building2,  hint: "Profile, address, contacts, regional defaults" },
      { to: "/admin/branding",    label: "Branding & theme", icon: Palette,    hint: "Logo, favicon, brand colours, email signature" },
      { to: "/admin/departments", label: "Departments",      icon: Network,    hint: "Hierarchy and reporting lines" },
      { to: "/admin/tenants",     label: "Tenants",          icon: Globe,      meta: "3", hint: "Child tenants and data residency" },
      { to: "/admin/license",     label: "License & seats",  icon: CreditCard, hint: "Plan, renewal date, invoices" },
    ],
  },
  {
    id: "identity",
    label: "Identity & access",
    icon: KeyRound,
    blurb: "Users, groups, roles, SSO, session policy, MFA, and posture.",
    items: [
      { to: "/admin/users",    label: "Users",               icon: Users,       meta: "142", hint: "Members, invites, seats" },
      { to: "/admin/groups",   label: "Groups & teams",      icon: Users2,      meta: "5",   hint: "Security and on-call rosters" },
      { to: "/admin/roles",    label: "Roles & permissions", icon: ShieldCheck, meta: "12",  hint: "Bundle permissions into roles" },
      { to: "/admin/sso",      label: "SSO & SAML",          icon: KeyRound,    hint: "Okta, Entra, Google Workspace" },
      { to: "/admin/sessions", label: "Session policy",      icon: Timer,       hint: "Timeouts, MFA, password rules, IP allowlist" },
      { to: "/admin/posture",  label: "Security posture",    icon: Shield,      hint: "Identity hygiene checks and remediation" },
    ],
  },
  {
    id: "products",
    label: "Product configuration",
    icon: Boxes,
    blurb: "Per-module taxonomy, workflow states, SLAs, custom fields, and feeds.",
    items: [
      { to: "/admin/products/incidents",    label: "Incidents",         icon: AlertTriangle, hint: "Categories, states, SLAs, custom fields, locations" },
      { to: "/admin/products/threat-intel", label: "Threat intelligence", icon: Shield,        hint: "Categories, states, sources, feeds" },
      { to: "/admin/products/entities",     label: "Entities",           icon: Database,      hint: "Asset types, classifications, groups, owners" },
    ],
  },
  {
    id: "platform",
    label: "Platform",
    icon: Layers,
    blurb: "Health, backups, email, notification templates, and audit logs.",
    items: [
      { to: "/admin/health",    label: "Service health",         icon: Activity,      hint: "Subsystems, uptime, latency" },
      { to: "/admin/backup",    label: "Backup & restore",       icon: RefreshCw,     hint: "Snapshots, retention, SFTP destinations" },
      { to: "/admin/email",     label: "Email & SMTP",           icon: Mail,          hint: "Outbound SMTP, deliverability" },
      { to: "/admin/templates", label: "Notification templates", icon: FileText,      hint: "Email, SMS, webhook, Slack copy" },
      { to: "/admin/logs",      label: "Activity logs",          icon: ClipboardList, hint: "Audit trail across the workspace" },
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
    { value: "/admin", label: "Overview" },
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
} as const
