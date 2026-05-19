import { useMemo } from "react"
import { getIncidentById } from "@/data/incidents"
import type { Incident } from "@/data/incidents"
import {
  buildAffectedProducts,
  buildAgentRuns,
  buildArtifactRows,
  buildAuditLogRows,
  buildCommentRows,
  buildEntityRows,
  buildLinkedAlerts,
  buildMitreStructured,
  buildOmniSense,
  buildPlaybookLogRows,
  buildRelatedIncidents,
  buildS3Breakdown,
  buildSlaLogRows,
  buildTasks,
  buildTimeline,
} from "./incident-detail-mock"
import type { IncidentPanelData } from "./incident-detail-panels"

function buildRemediation(incident: Incident): string {
  if (incident.disposition === "true-positive") {
    return `Containment completed. Root cause aligned with ${incident.category}. Controls documented; residual risk accepted per policy.`
  }
  if (incident.disposition === "false-positive" || incident.disposition === "benign") {
    return `Reconciled as non-malicious. Ready for closure with lessons learned.`
  }
  return `Remediation in progress (${incident.state}). Coordinate with SOC and owners before irreversible steps.`
}

export type IncidentDetailModel = {
  incident: Incident
  panelData: IncidentPanelData
}

export function useIncidentDetailModel(incidentId: string): IncidentDetailModel | null {
  const incident = useMemo(() => getIncidentById(incidentId), [incidentId])

  const omni = useMemo(
    () => (incident ? buildOmniSense(incident) : null),
    [incident]
  )
  const s3Breakdown = useMemo(
    () => (incident ? buildS3Breakdown(incident) : []),
    [incident]
  )
  const mitreStructured = useMemo(
    () =>
      incident
        ? buildMitreStructured(incident)
        : { tactics: [], techniques: [], subTechniques: [] },
    [incident]
  )
  const related = useMemo(
    () => (incident ? buildRelatedIncidents(incident) : []),
    [incident]
  )
  const timeline = useMemo(
    () => (incident ? buildTimeline(incident) : []),
    [incident]
  )
  const artifacts = useMemo(
    () => (incident ? buildArtifactRows(incident) : []),
    [incident]
  )
  const entities = useMemo(
    () => (incident ? buildEntityRows(incident) : []),
    [incident]
  )
  const alerts = useMemo(
    () => (incident ? buildLinkedAlerts(incident) : []),
    [incident]
  )
  const tasks = useMemo(
    () => (incident ? buildTasks(incident) : []),
    [incident]
  )
  const auditLogs = useMemo(
    () => (incident ? buildAuditLogRows(incident) : []),
    [incident]
  )
  const playbookLogs = useMemo(
    () => (incident ? buildPlaybookLogRows(incident) : []),
    [incident]
  )
  const slaLogs = useMemo(
    () => (incident ? buildSlaLogRows(incident) : []),
    [incident]
  )
  const agentRuns = useMemo(
    () => (incident ? buildAgentRuns(incident) : []),
    [incident]
  )

  const comments = useMemo(
    () => (incident ? buildCommentRows(incident) : []),
    [incident]
  )

  const affectedProducts = useMemo(
    () => (incident ? buildAffectedProducts(incident) : []),
    [incident]
  )

  return useMemo(() => {
    if (!incident || !omni) return null
    const panelData: IncidentPanelData = {
      incident,
      omni,
      artifacts,
      entities,
      alerts,
      tasks,
      comments,
      remediation: buildRemediation(incident),
      agentRuns,
      auditLogs,
      playbookLogs,
      slaLogs,
      related,
      affectedProducts,
      s3Breakdown,
      mitreStructured,
      timeline,
    }
    return { incident, panelData }
  }, [
    incident,
    omni,
    artifacts,
    entities,
    alerts,
    tasks,
    comments,
    agentRuns,
    auditLogs,
    playbookLogs,
    slaLogs,
    related,
    affectedProducts,
    s3Breakdown,
    mitreStructured,
    timeline,
  ])
}
