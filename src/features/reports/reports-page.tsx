import { Navigate, useParams } from "react-router"
import { OverviewTab } from "./tabs/overview-tab"
import { TemplatesTab } from "./tabs/templates-tab"
import { SavedExportsTab } from "./tabs/saved-exports-tab"
import { ScheduledTab } from "./tabs/scheduled-tab"
import { HistoryTab } from "./tabs/history-tab"

type TabKey = "overview" | "templates" | "saved-exports" | "scheduled" | "history"

const VALID: Set<TabKey> = new Set([
  "overview",
  "templates",
  "saved-exports",
  "scheduled",
  "history",
])

export function ReportsPage() {
  const { tab } = useParams<{ tab?: string }>()

  const active = tab && VALID.has(tab as TabKey) ? (tab as TabKey) : null

  if (!active) return <Navigate to="/reports/overview" replace />

  return (
    <>
      {active === "overview" && <OverviewTab />}
      {active === "templates" && <TemplatesTab />}
      {active === "saved-exports" && <SavedExportsTab />}
      {active === "scheduled" && <ScheduledTab />}
      {active === "history" && <HistoryTab />}
    </>
  )
}
