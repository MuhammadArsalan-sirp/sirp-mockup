import {
  Activity,
  AlertTriangle,
  Building,
  Building2,
  ClipboardList,
  CreditCard,
  Database,
  FileText,
  Globe,
  KeyRound,
  Layers,
  Lock,
  Mail,
  Network,
  RefreshCw,
  Rss,
  ScrollText,
  Settings2,
  Shield,
  ShieldCheck,
  Tag,
  Timer,
  Users,
  Users2,
  type LucideIcon,
} from "lucide-react"

export type AdminNavItemConfig = {
  to: string
  label: string
  icon: LucideIcon
  meta?: string
  /** Optional one-line description for hover / mobile nav */
  hint?: string
}

export type AdminTabConfig = {
  id: string
  label: string
  icon: LucideIcon
  defaultPath: string
  items: AdminNavItemConfig[]
}

/** 7 production-aligned tabs. Each tab pre-loads its first sub-page. */
export const adminTabs: AdminTabConfig[] = [
  {
    id: "organizations",
    label: "Organizations",
    icon: Building,
    defaultPath: "/admin/org",
    items: [
      { to: "/admin/org",         label: "Profile & Branding", icon: Building2, hint: "Tenant identity, logo, locale" },
      { to: "/admin/departments", label: "Departments",        icon: Network,   hint: "Hierarchy and reporting lines" },
      { to: "/admin/tenants",     label: "Tenants",            icon: Globe,     meta: "3", hint: "Child tenants and residency" },
    ],
  },
  {
    id: "entities",
    label: "Entities",
    icon: Database,
    defaultPath: "/admin/master-data",
    items: [
      { to: "/admin/master-data", label: "Master data", icon: Layers, hint: "Asset types, owners, classifications" },
    ],
  },
  {
    id: "incident-mgmt",
    label: "Incident Management",
    icon: AlertTriangle,
    defaultPath: "/admin/incident-setup",
    items: [
      { to: "/admin/incident-setup", label: "Categories & SLAs", icon: Tag, hint: "Taxonomy, default severities, SLAs" },
    ],
  },
  {
    id: "threat-intel",
    label: "Threat Intelligence",
    icon: Shield,
    defaultPath: "/admin/threat-intel-setup",
    items: [
      { to: "/admin/threat-intel-setup", label: "Feeds & taxonomy", icon: Rss, hint: "TI feeds and entity taxonomy" },
    ],
  },
  {
    id: "access-control",
    label: "Access Control",
    icon: ShieldCheck,
    defaultPath: "/admin/posture",
    items: [
      { to: "/admin/posture",  label: "Security posture",    icon: Shield,      hint: "Tenant security score" },
      { to: "/admin/users",    label: "Users",               icon: Users,       meta: "142", hint: "Members and seats" },
      { to: "/admin/groups",   label: "Groups & teams",      icon: Users2,      meta: "5",   hint: "Security and on-call rosters" },
      { to: "/admin/roles",    label: "Roles & permissions", icon: ShieldCheck, meta: "12",  hint: "Bundle permissions into roles" },
      { to: "/admin/sso",      label: "SSO & SAML",          icon: KeyRound,    hint: "Identity providers" },
      { to: "/admin/sessions", label: "Sessions & policy",   icon: Timer,       hint: "Timeouts, lockout, IP allowlist" },
    ],
  },
  {
    id: "product-settings",
    label: "Product Settings",
    icon: Settings2,
    defaultPath: "/admin/license",
    items: [
      { to: "/admin/license",   label: "License & seats",        icon: CreditCard, hint: "Plan, renewal, invoices" },
      { to: "/admin/email",     label: "Email server",           icon: Mail,       hint: "SMTP and deliverability" },
      { to: "/admin/templates", label: "Notification templates", icon: FileText,   hint: "Email, SMS, webhook copy" },
      { to: "/admin/health",    label: "Service health",         icon: Activity,   hint: "Subsystems and uptime" },
      { to: "/admin/backup",    label: "Backup & restore",       icon: RefreshCw,  hint: "Snapshots and retention" },
    ],
  },
  {
    id: "logs",
    label: "Logs",
    icon: ScrollText,
    defaultPath: "/admin/logs",
    items: [
      { to: "/admin/logs", label: "Activity logs", icon: ClipboardList, hint: "Audit trail across the workspace" },
    ],
  },
]

/** Flat list used by the mobile dropdown and overview links. */
export function flattenAdminNavForSelect(): {
  value: string
  label: string
  section?: string
}[] {
  const out: { value: string; label: string; section?: string }[] = [
    { value: "/admin", label: "Overview" },
  ]
  for (const tab of adminTabs) {
    for (const item of tab.items) {
      out.push({ value: item.to, label: item.label, section: tab.label })
    }
  }
  return out
}

/** Single source of truth for icon lookup on overview / search surfaces. */
export const adminIconRegistry = {
  Lock,
  ShieldCheck,
  KeyRound,
  Timer,
  Mail,
  CreditCard,
  Activity,
  RefreshCw,
  Tag,
  Rss,
  Database,
  Layers,
  Network,
  Globe,
  Building,
  Building2,
  Users,
  Users2,
  Shield,
  ScrollText,
  ClipboardList,
  FileText,
} as const
