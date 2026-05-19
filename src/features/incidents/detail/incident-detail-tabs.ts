import type { LucideIcon } from "lucide-react"
import {
  FolderTree,
  GitBranch,
  Layers,
  LayoutDashboard,
  Link2,
  ListTree,
  Map,
  MessageSquare,
  ScrollText,
  Shield,
  Sparkles,
  Target,
} from "lucide-react"

/** Primary incident workspace tabs — sticky strip navigation. */
export type DetailTab =
  | "overview"
  | "omnisense"
  | "artifacts"
  | "entities"
  | "remediation"
  | "comments"
  | "tasks"
  | "omnimap"
  | "alerts"
  | "logs"
  | "related"
  | "affected-products"

export type DetailTabItem = {
  id: DetailTab
  label: string
  icon: LucideIcon
}

export const DETAIL_TABS: DetailTabItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "omnisense", label: "OmniSense", icon: Sparkles },
  { id: "artifacts", label: "Artifacts", icon: FolderTree },
  { id: "entities", label: "Entities", icon: Layers },
  { id: "remediation", label: "Remediation", icon: Shield },
  { id: "comments", label: "Comments", icon: MessageSquare },
  { id: "tasks", label: "Tasks", icon: ListTree },
  { id: "omnimap", label: "OmniMap", icon: Map },
  { id: "alerts", label: "Linked alerts", icon: GitBranch },
  { id: "logs", label: "Logs", icon: ScrollText },
  { id: "related", label: "Related", icon: Link2 },
  { id: "affected-products", label: "Products", icon: Target },
]
