import {
  Users,
  Users2,
  ShieldCheck,
  Building,
  Network,
  Globe,
  AlertTriangle,
  Shield,
  Database,
  Lock,
  Clock,
  Mail,
  FileText,
  CreditCard,
  Activity,
  RefreshCw,
  ScrollText,
  Settings2,
  type LucideIcon,
} from "lucide-react"

export type AdminNavItemConfig = {
  to: string
  label: string
  icon: LucideIcon
  meta?: string
}

export type AdminTabConfig = {
  id: string
  label: string
  icon: LucideIcon
  defaultPath: string
  items: AdminNavItemConfig[]
}

/** Mirrors the 7 production admin tabs exactly. */
export const adminTabs: AdminTabConfig[] = [
  {
    id: "organizations",
    label: "Organizations",
    icon: Building,
    defaultPath: "/admin/org",
    items: [
      { to: "/admin/org", label: "Profile & Branding", icon: Building },
      { to: "/admin/departments", label: "Departments", icon: Network },
      { to: "/admin/tenants", label: "Tenants", icon: Globe, meta: "3" },
    ],
  },
  {
    id: "entities",
    label: "Entities",
    icon: Database,
    defaultPath: "/admin/master-data",
    items: [
      { to: "/admin/master-data", label: "Master Data", icon: Database },
    ],
  },
  {
    id: "incident-mgmt",
    label: "Incident Management",
    icon: AlertTriangle,
    defaultPath: "/admin/incident-setup",
    items: [
      { to: "/admin/incident-setup", label: "Incident Setup", icon: AlertTriangle },
    ],
  },
  {
    id: "threat-intel",
    label: "Threat Intelligence",
    icon: Shield,
    defaultPath: "/admin/threat-intel-setup",
    items: [
      { to: "/admin/threat-intel-setup", label: "Configuration", icon: Shield },
    ],
  },
  {
    id: "access-control",
    label: "Access Control",
    icon: ShieldCheck,
    defaultPath: "/admin/users",
    items: [
      { to: "/admin/users", label: "Users", icon: Users, meta: "142" },
      { to: "/admin/groups", label: "Groups & Teams", icon: Users2, meta: "5" },
      { to: "/admin/roles", label: "Roles & Permissions", icon: ShieldCheck, meta: "12" },
    ],
  },
  {
    id: "product-settings",
    label: "Product Settings",
    icon: Settings2,
    defaultPath: "/admin/sso",
    items: [
      { to: "/admin/sso", label: "SSO & SAML", icon: Lock },
      { to: "/admin/sessions", label: "Session Policy", icon: Clock },
      { to: "/admin/email", label: "Email", icon: Mail },
      { to: "/admin/templates", label: "Notification Templates", icon: FileText },
      { to: "/admin/license", label: "Licenses", icon: CreditCard },
      { to: "/admin/health", label: "Server Health", icon: Activity },
      { to: "/admin/backup", label: "Backup & Restore", icon: RefreshCw },
    ],
  },
  {
    id: "logs",
    label: "Logs",
    icon: ScrollText,
    defaultPath: "/admin/logs",
    items: [
      { to: "/admin/logs", label: "Activity Logs", icon: ScrollText },
    ],
  },
]

/** Flat list used by the mobile dropdown and Overview "Needs attention" links. */
export function flattenAdminNavForSelect(): {
  value: string
  label: string
  section?: string
}[] {
  const out: { value: string; label: string; section?: string }[] = [
    { value: "/admin", label: "Overview", section: undefined },
  ]
  for (const tab of adminTabs) {
    for (const item of tab.items) {
      out.push({ value: item.to, label: item.label, section: tab.label })
    }
  }
  return out
}
