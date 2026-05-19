import {
  LayoutDashboard,
  AlertTriangle,
  Shield,
  Monitor,
  Sparkles,
  Globe,
  Settings,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  title: string
  url: string
  icon?: LucideIcon | (() => React.ReactElement)
  badge?: string | number
  /**
   * Nested children render as a collapsible submenu in the sidebar.
   * Parent rows with `children` toggle expand/collapse on click rather than
   * navigating directly.
   */
  children?: NavItem[]
  /** Whether the submenu starts expanded. Only meaningful with `children`. */
  defaultOpen?: boolean
}

export type NavSection = {
  label: string
  items: NavItem[]
}

const SaraIcon = () => (
  <img
    src="/brand/sara-icon.png"
    alt=""
    className="size-4 shrink-0 object-contain"
  />
)

export const navSections: NavSection[] = [
  {
    label: "Dashboard",
    items: [{ title: "OmniBoard", url: "/", icon: LayoutDashboard }],
  },
  {
    label: "Intelligence",
    items: [
      { title: "Sara · Co-Analyst", url: "/sara", icon: SaraIcon },
      { title: "OmniSense", url: "/omnisense", icon: Globe },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Incidents", url: "/incidents", icon: AlertTriangle, badge: 47 },
      { title: "Threat Intel", url: "/threat-intel", icon: Shield },
      { title: "Entities", url: "/entities", icon: Monitor },
    ],
  },
  {
    label: "Automation",
    items: [
      {
        title: "Autonomy",
        url: "/autonomy",
        icon: Sparkles,
        defaultOpen: true,
        children: [
          { title: "Overview", url: "/autonomy/overview" },
          { title: "Automation", url: "/autonomy/automation" },
          { title: "Playbooks", url: "/autonomy/playbooks" },
          { title: "Agents", url: "/autonomy/agents" },
          { title: "Policies", url: "/autonomy/policies" },
          { title: "Lab", url: "/autonomy/lab" },
          { title: "Artifacts", url: "/autonomy/artifacts" },
          { title: "Approvals", url: "/autonomy/approvals", badge: 2 },
        ],
      },
    ],
  },
  {
    label: "System",
    items: [{ title: "Administration", url: "/admin", icon: Settings }],
  },
]
