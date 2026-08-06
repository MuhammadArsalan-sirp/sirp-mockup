import { entities, type EntityCriticality } from "@/data/entities"
import { playbookRuns, type RunStatus } from "@/data/autonomy"
import { users } from "@/data/users"

/** Fixture content the Studio's data blocks render — bound to the report's
 * selected module/time range in spirit, not literally recomputed per change
 * (this is a mockup — the numbers are illustrative, not live). */

export const STUDIO_KPIS = [
  { label: "Total incidents", value: "139", delta: "+12%", dir: "up" as const },
  { label: "Mean time to respond", value: "42m", delta: "-8%", dir: "up" as const },
  { label: "Critical open", value: "3", delta: "2 aging", dir: "down" as const },
  { label: "Playbooks run", value: "1,204", delta: "+5%", dir: "up" as const },
]

export const STUDIO_INCIDENTS_OVER_TIME = [
  { label: "Mon", value: 14 },
  { label: "Tue", value: 22 },
  { label: "Wed", value: 19 },
  { label: "Thu", value: 31 },
  { label: "Fri", value: 26 },
  { label: "Sat", value: 11 },
  { label: "Sun", value: 16 },
]

export const STUDIO_MTTR_TREND = [
  { label: "Mon", value: 58 },
  { label: "Tue", value: 51 },
  { label: "Wed", value: 55 },
  { label: "Thu", value: 46 },
  { label: "Fri", value: 44 },
  { label: "Sat", value: 39 },
  { label: "Sun", value: 42 },
]

export const STUDIO_SEVERITY = [
  { label: "Critical", value: 8, color: "var(--destructive)" },
  { label: "High", value: 21, color: "var(--attention)" },
  { label: "Medium", value: 47, color: "var(--warning)" },
  { label: "Low", value: 63, color: "var(--info)" },
]

export const STUDIO_DISPOSITION = [
  { label: "True positive", value: 42, color: "var(--destructive)" },
  { label: "False positive", value: 58, color: "var(--info)" },
  { label: "Under review", value: 17, color: "var(--warning)" },
]

export const STUDIO_TOP_IOCS = [
  { ioc: "203.0.113.101", type: "IP · C2", hits: 412, sev: "crit" as const },
  { ioc: "a7f3…e91b (SHA-256)", type: "File hash", hits: 88, sev: "high" as const },
  { ioc: "update-svc.example", type: "Domain", hits: 64, sev: "high" as const },
  { ioc: "/tmp/.x0rk", type: "Path", hits: 37, sev: "med" as const },
  { ioc: "svchost-run.ps1", type: "Script", hits: 19, sev: "med" as const },
]

export const STUDIO_OPEN_CASES = [
  { id: "INC-4821", title: "Credential stuffing — VPN gateway", owner: users.mariam, sev: "crit" as const, age: "2d" },
  { id: "INC-4817", title: "Suspicious PowerShell on FIN-DB01", owner: users.rashid, sev: "high" as const, age: "1d" },
  { id: "INC-4809", title: "Impossible travel — SSO", owner: users.noor, sev: "high" as const, age: "3d" },
  { id: "INC-4802", title: "Beaconing to update-svc.example", owner: users.ahmed, sev: "med" as const, age: "4h" },
]

export const STUDIO_MITRE = [
  { id: "TA0001", name: "Initial Access", pct: 80, n: 12 },
  { id: "TA0002", name: "Execution", pct: 65, n: 9 },
  { id: "TA0003", name: "Persistence", pct: 40, n: 5 },
  { id: "TA0006", name: "Cred. Access", pct: 90, n: 14 },
  { id: "TA0008", name: "Lateral Mvmt", pct: 35, n: 4 },
  { id: "TA0011", name: "C2", pct: 55, n: 7 },
]

export const STUDIO_TIMELINE = [
  { time: "Mon 02:14", title: "First alert — anomalous auth volume", desc: "Detection rule fired on thousands of failed authentications from a single ASN within minutes.", sev: "crit" as const },
  { time: "Mon 02:19", title: "Auto-containment playbook executed", desc: "Source ranges blocked at the edge; affected accounts forced to re-authenticate.", sev: "high" as const },
  { time: "Mon 02:41", title: "Analyst triage — scope confirmed", desc: "A handful of accounts showed successful auth. Sessions revoked, MFA re-enrolled.", sev: "med" as const },
  { time: "Mon 05:02", title: "Case closed — no data access observed", desc: "No lateral movement or exfiltration detected across EDR and cloud audit logs.", sev: "low" as const },
]

export const SEVERITY_TONE: Record<"crit" | "high" | "med" | "low", string> = {
  crit: "border-destructive/25 bg-destructive/10 text-destructive",
  high: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  med: "border bg-muted text-muted-foreground",
  low: "border-primary/25 bg-primary/10 text-primary",
}

/** First few entities, reused straight from the Entities module fixture. */
export const STUDIO_ENTITIES = entities.slice(0, 6)

export const CRITICALITY_TONE: Record<EntityCriticality, string> = {
  critical: "border-destructive/25 bg-destructive/10 text-destructive",
  high: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  medium: "border bg-muted text-muted-foreground",
  low: "border-primary/25 bg-primary/10 text-primary",
}

/** First few playbook runs, reused straight from the Autonomy module fixture. */
export const STUDIO_PLAYBOOK_RUNS = playbookRuns.slice(0, 5)

export const RUN_STATUS_TONE: Record<RunStatus, string> = {
  success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  running: "border-primary/25 bg-primary/10 text-primary",
  failed: "border-destructive/25 bg-destructive/10 text-destructive",
  queued: "border bg-muted text-muted-foreground",
}

export const CALLOUT_TONE_CLASS: Record<"info" | "warning" | "success" | "alert", string> = {
  info: "border-primary/25 bg-primary/10 text-primary",
  warning: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  alert: "border-destructive/25 bg-destructive/10 text-destructive",
}
