import { useState } from "react"
import { AlertTriangle, Briefcase, Inbox, Layers } from "lucide-react"
import { cn } from "@/lib/utils"

const TABS = [
  { key: "all", label: "All", icon: Layers, count: 313 },
  { key: "alert", label: "Alert", icon: Inbox, count: 89 },
  { key: "case", label: "Case", icon: Briefcase, count: 32 },
  { key: "incident", label: "Incident", icon: AlertTriangle, count: 47 },
] as const

type TabKey = (typeof TABS)[number]["key"]

export function ThreatIntelTabs() {
  const [active, setActive] = useState<TabKey>("incident")

  return (
    <div className="inline-flex flex-wrap items-center rounded-lg border bg-card p-1">
      {TABS.map((tab) => {
        const isActive = active === tab.key
        const Icon = tab.icon
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-secondary text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
