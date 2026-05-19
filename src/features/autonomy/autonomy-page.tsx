import { useParams, Navigate, useNavigate } from "react-router"
import { OverviewTab } from "./tabs/overview-tab"
import { AutomationTab } from "./tabs/automation-tab"
import { PlaybooksTab } from "./tabs/playbooks-tab"
import { AgentsTab } from "./tabs/agents-tab"
import { PoliciesTab } from "./tabs/policies-tab"
import { LabTab } from "./tabs/lab-tab"
import { ArtifactsTab } from "./tabs/artifacts-tab"
import { ApprovalsTab } from "./tabs/approvals-tab"

type TabKey =
  | "overview"
  | "automation"
  | "playbooks"
  | "agents"
  | "policies"
  | "lab"
  | "artifacts"
  | "approvals"

const VALID: Set<TabKey> = new Set([
  "overview",
  "automation",
  "playbooks",
  "agents",
  "policies",
  "lab",
  "artifacts",
  "approvals",
])

export function AutonomyPage() {
  const { tab } = useParams<{ tab?: string }>()
  const navigate = useNavigate()

  const active =
    tab && VALID.has(tab as TabKey) ? (tab as TabKey) : null

  if (!active) return <Navigate to="/autonomy/overview" replace />

  return (
    <>
      {active === "overview" && (
        <OverviewTab onNavigate={(t) => navigate(`/autonomy/${t}`)} />
      )}
      {active === "automation" && <AutomationTab />}
      {active === "playbooks" && <PlaybooksTab />}
      {active === "agents" && <AgentsTab />}
      {active === "policies" && <PoliciesTab />}
      {active === "lab" && <LabTab />}
      {active === "artifacts" && <ArtifactsTab />}
      {active === "approvals" && <ApprovalsTab />}
    </>
  )
}
