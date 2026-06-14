import {
  AlertTriangle,
  Boxes,
  Building,
  ScrollText,
  Settings2,
  Shield,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"
import type { Tone } from "@/lib/tone"

export type AdminSubPage = {
  id: string
  label: string
  /** Optional meta count shown next to the label (e.g. "12", "3 new") */
  meta?: string
  /** Whether this sub-page is wired to a real component yet. */
  status?: "ready" | "placeholder"
  /** v3 addition that wasn't in old SIRP — gets a small "new" indicator. */
  isV3Addition?: boolean
}

export type AdminStatTile = {
  label: string
  value: string | number
  unit?: string
  caption?: string
  tone?: Tone
}

export type AdminTab = {
  id: string
  label: string
  icon: LucideIcon
  /** First sub-page is the tab's default route */
  items: AdminSubPage[]
  /** 4 small KPI tiles rendered above the sub-page content */
  stats?: AdminStatTile[]
}

/**
 * 7 top-level tabs matching old SIRP admin's IA, with v3 visual chemistry
 * layered on top. Sub-pages within each tab are accessed via a left rail
 * inside the tab. v3 additions (not in old SIRP) are marked with isV3Addition.
 */
export const adminTabs: AdminTab[] = [
  {
    id: "organization",
    label: "Organization",
    icon: Building,
    stats: [
      { label: "Organisations", value: 1,    caption: "Acme Corp"                     },
      { label: "Tenants",       value: 3,    caption: "1 KSA · 1 EU · 1 US",  tone: "info" },
      { label: "Org users",     value: 142,  caption: "8 admins · 134 analysts"       },
      { label: "Last updated",  value: "2d", caption: "By Ahmed Khan",        tone: "muted" },
    ],
    items: [
      { id: "organizations", label: "Organisations",         status: "placeholder" },
      { id: "tenants",       label: "Tenants",     meta: "3",status: "ready" },
      { id: "users",         label: "Organisation users",    status: "placeholder" },
      { id: "information",   label: "Organisation information", status: "ready" },
    ],
  },
  {
    id: "entities",
    label: "Entities",
    icon: Boxes,
    stats: [
      { label: "Total entities", value: 1595, caption: "across 9 asset types" },
      { label: "Asset types",    value: 10,   caption: "8 system · 2 custom" },
      { label: "Classifications",value: 9,    caption: "Tier 0 → Tier 4 + Data"      },
      { label: "Owners assigned",value: "92%",caption: "Unowned: 6 entities", tone: "warn" },
    ],
    items: [
      { id: "asset-types",     label: "Asset Types",       status: "placeholder" },
      { id: "classifications", label: "Classifications",   status: "placeholder" },
      { id: "groups",          label: "Asset Groups",      status: "placeholder" },
      { id: "sub-groups",      label: "Asset Sub-Groups",  status: "placeholder" },
      { id: "business-groups", label: "Business Groups",   status: "placeholder" },
      { id: "owners",          label: "Owners",            status: "placeholder" },
      { id: "value",           label: "Asset Value",       status: "placeholder" },
      { id: "os",              label: "Operating Systems", status: "placeholder" },
      { id: "field-settings",  label: "Field Settings",    status: "placeholder" },
      { id: "departments",     label: "Departments",       status: "ready" },
    ],
  },
  {
    id: "incident-management",
    label: "Incident Management",
    icon: AlertTriangle,
    stats: [
      { label: "Categories",   value: 12, caption: "10 active · 2 disabled" },
      { label: "Workflow states", value: 6,  caption: "Open → Closed"        },
      { label: "Custom fields",   value: 8,  caption: "5 required · 3 optional" },
      { label: "SLA targets",     value: 4,  caption: "Sev1–Sev4",  tone: "info" },
    ],
    items: [
      { id: "categories",        label: "Categories & SLAs", status: "ready" },
      { id: "subcategories",     label: "Sub-Categories",    status: "placeholder" },
      { id: "states",            label: "States",            status: "placeholder" },
      { id: "substates",         label: "Sub-States",        status: "placeholder" },
      { id: "fields",            label: "Custom Fields",     status: "placeholder" },
      { id: "locations",         label: "Locations",         status: "placeholder" },
      { id: "detection-methods", label: "Detection Methods", status: "placeholder" },
      { id: "containment",       label: "Containment Status",status: "placeholder" },
      { id: "contained-by",      label: "Contained By",      status: "placeholder" },
      { id: "escalation",        label: "Escalation",        status: "placeholder" },
      { id: "lessons-learned",   label: "Lessons Learned",   status: "placeholder" },
      { id: "nciss",             label: "NCISS",             status: "placeholder" },
    ],
  },
  {
    id: "threat-intelligence",
    label: "Threat Intelligence",
    icon: Shield,
    stats: [
      { label: "Categories",     value: 18,  caption: "Phishing, Malware, BEC, …"   },
      { label: "Threat actors",  value: 42,  caption: "Tracked across feeds"        },
      { label: "Affected products", value: 217, caption: "By 89 vendors"               },
      { label: "Feeds connected", value: 8,   caption: "MISP, OTX, ThreatFox, …", tone: "info" },
    ],
    items: [
      { id: "categories",         label: "Categories",         status: "ready" },
      { id: "subcategories",      label: "Sub-Categories",     status: "placeholder" },
      { id: "states",             label: "States",             status: "placeholder" },
      { id: "threat-actors",      label: "Threat Actors",      status: "placeholder" },
      { id: "associated-actors",  label: "Associated Actors",  status: "placeholder" },
      { id: "affected-products",  label: "Affected Products",  status: "placeholder" },
      { id: "affected-vendors",   label: "Affected Vendors",   status: "placeholder" },
      { id: "feeds",              label: "Threat Feeds",       status: "placeholder", isV3Addition: true },
    ],
  },
  {
    id: "access-control",
    label: "Access Control",
    icon: ShieldCheck,
    stats: [
      { label: "Users",          value: 142,    caption: "12 invites pending" },
      { label: "Roles",          value: 12,     caption: "8 system · 4 custom" },
      { label: "MFA enrolment",  value: "94%",  caption: "8 users pending",   tone: "warn" },
      { label: "Active sessions",value: 28,     caption: "Across 7 SSO providers" },
    ],
    items: [
      { id: "users",           label: "Users",              meta: "142", status: "ready" },
      { id: "groups",          label: "Groups",             meta: "5",   status: "ready" },
      { id: "roles",           label: "Roles",              meta: "12",  status: "ready" },
      { id: "actions",         label: "Actions",                         status: "placeholder" },
      { id: "action-groups",   label: "Action Groups",                   status: "placeholder" },
      { id: "privileges",      label: "Privileges",                      status: "placeholder" },
      { id: "third-party",     label: "Third Party (API)",               status: "placeholder" },
      { id: "session-policy",  label: "Session & Password",              status: "ready" },
      { id: "sso",             label: "SSO & SAML",                      status: "ready", isV3Addition: true },
    ],
  },
  {
    id: "product-settings",
    label: "Product Settings",
    icon: Settings2,
    stats: [
      { label: "License",      value: "Active",  caption: "Enterprise · renews 213d", tone: "ok" },
      { label: "Last backup",  value: "12m ago", caption: "Success · 2.4 GB",         tone: "ok" },
      { label: "Email delivery", value: "99.4%", caption: "Last 24h",                  tone: "ok" },
      { label: "Unread feedback", value: 3,    caption: "2 high · 1 low",            tone: "warn" },
    ],
    items: [
      { id: "license",       label: "License",          status: "ready" },
      { id: "backup",        label: "Backup & Restore", status: "ready" },
      { id: "sftp",          label: "SFTP",             status: "placeholder" },
      { id: "email",         label: "Email Config",     status: "ready" },
      { id: "notifications", label: "Notifications",    status: "placeholder" },
      { id: "templates",     label: "Templates",        status: "ready", isV3Addition: true },
      { id: "server-health", label: "Server Health",    status: "ready" },
      { id: "widgets",       label: "Widgets",          status: "placeholder" },
      { id: "feedback",      label: "Feedback",         status: "placeholder" },
    ],
  },
  {
    id: "logs",
    label: "Logs",
    icon: ScrollText,
    stats: [
      { label: "Events (24h)",     value: "1.2M", caption: "Across 5 streams" },
      { label: "Errors (24h)",     value: 12,    caption: "0.04% error rate", tone: "warn" },
      { label: "Auth failures",    value: 8,    caption: "From 3 unique IPs", tone: "warn" },
      { label: "Retention",        value: "2y",  caption: "Enterprise plan",  tone: "info" },
    ],
    items: [
      { id: "activity",      label: "Activity",      status: "ready" },
      { id: "app",           label: "Application",   status: "placeholder" },
      { id: "authentication",label: "Authentication",status: "placeholder" },
      { id: "ingestion",     label: "Ingestion",     status: "placeholder" },
      { id: "pre-ingestion", label: "Pre-Ingestion", status: "placeholder" },
      { id: "notifications", label: "Notifications", status: "placeholder" },
    ],
  },
]

/** Find a tab by id. */
export function getTab(id: string): AdminTab | undefined {
  return adminTabs.find((t) => t.id === id)
}
