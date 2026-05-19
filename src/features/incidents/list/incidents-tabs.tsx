import { useState } from "react"
import { AlertTriangle, Briefcase, Clock, Inbox, Layers } from "lucide-react"
import { cn } from "@/lib/utils"

const TABS = [
  { key: "all", label: "All", icon: Layers, count: 313 },
  // { key: "buffer", label: "Buffer", icon: Clock, count: 128 },
  { key: "alert", label: "Alert", icon: Inbox, count: 89 },
  { key: "case", label: "Case", icon: Briefcase, count: 32 },
  { key: "incident", label: "Incident", icon: AlertTriangle, count: 47 },
] as const

type TabKey = (typeof TABS)[number]["key"]

/**
 * Record-type scope selector. Matches the segmented sub-tab pattern used
 * inside the autonomy module's automation tab (Applications · Actions ·
 * Ingestion sources · Artifact types) — bordered card container, raised
 * active tab on bg-secondary, with icons and count badges added.
 */
export function IncidentsTabs() {
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
            {/*<span
              className={cn(
                "inline-flex h-[18px] min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {tab.count}
            </span>*/}
          </button>
        )
      })}
    </div>
  )
}
