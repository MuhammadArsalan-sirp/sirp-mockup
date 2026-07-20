import type { UserRef } from "./users"
import { users } from "./users"

export type { UserRef } from "./users"

/** Mirrors react-go's `rp_type` field on the shared `report` table (GET/POST/PUT/DELETE /report). */
export type ReportFormat = "PDF" | "EXCEL" | "CSV"

/**
 * Mockup-only grouping. react-go has no such field — PDF-builder reports and
 * Excel saved-searches are rows of the *same* table, told apart only by
 * `rp_type`. Kept explicit here so the redesign's "Split Product Archetypes"
 * recommendation (PDF proposal §4) can render the two as distinct surfaces.
 */
export type ReportArchetype = "template" | "saved-export"

/** Mirrors `rp_module` — which module a template is built from, or a saved search was captured from. */
export type ReportModule = "incident" | "threatIntel" | "cases"

/** Mirrors `rp_status` (0 = draft, 1 = published) on react-go's `report` table. */
export type ReportStatus = "draft" | "published"

export const moduleLabels: Record<ReportModule, string> = {
  incident: "Incident Management",
  threatIntel: "Threat Intelligence",
  cases: "Cases",
}

export type ReportSection = {
  widgetId: string
  /** Whether this section is included in the generated output — the ordered-list equivalent of react-go's drag/resize grid canvas (deferred per PDF Phase 1). */
  included: boolean
}

export type Report = {
  id: string
  name: string
  description?: string
  archetype: ReportArchetype
  format: ReportFormat
  module: ReportModule
  status: ReportStatus
  author: UserRef
  createdOn: string
  updatedOn: string
  /** rcp_* cover page, template archetype only. */
  coverPageId?: string
  /** Ordered widget sections, template archetype only. */
  sections?: ReportSection[]
  /** Frozen filter/scope snapshot, saved-export archetype only — mirrors SaveSearchModal's `report_data` blob. */
  savedSearchSummary?: string
  isScheduled: boolean
  generatedCount: number
}

export type ReportCoverPage = {
  id: string
  name: string
  bgFrom: string
  bgTo: string
}

export type ReportWidgetType = "bar" | "line" | "pie" | "kpi" | "table"

/** Mirrors `gra_*` rows from the dashboards widget catalog (GET /dashboards/all-widget-list) — only the report-safe subset, matching react-go's AddWidget.jsx exclusion list. */
export type ReportWidget = {
  id: string
  title: string
  type: ReportWidgetType
}

/** Real, locked to exactly these three on react-go (Scheduler.js:101-105). */
export type ScheduleFrequency = "daily" | "weekly" | "monthly"

export type DeliveryChannel = "email" | "slack" | "teams"

export type ReportSchedule = {
  id: string
  reportId: string
  frequency: ScheduleFrequency
  /** Hour 0-23 (daily) — react-go enumerates the full 24, not a truncated list. */
  hourSlot?: number
  /** Day of month 1-31 (monthly) — react-go enumerates the full range. */
  dayOfMonth?: number
  weekday?: string
  dateRange: string
  isCustomRange: boolean
  recipients: UserRef[]
  emailSubject: string
  emailContent: string
  deliveryChannel: DeliveryChannel
  nextRun: string
  /** New in this redesign — no live backend on react-go master or faiz-dev. */
  intervalDays?: number
  timezone?: string
  sendTimes?: string[]
}

/** New in this redesign — faiz-dev's /report/history was frontend-only, never backed. */
export type ReportHistoryEntry = {
  id: string
  reportId: string
  generatedAt: string
  triggeredBy: "manual" | "schedule"
  format: ReportFormat
  sizeKb: number
}

/** Gallery preset — faiz-dev's /report/templates listing was also frontend-only/orphaned; the "Use template" action it launches (create a real report row) is real. */
export type ReportTemplate = {
  id: string
  name: string
  description: string
  module: ReportModule
  coverPageId: string
  widgetIds: string[]
}

export const coverPages: ReportCoverPage[] = [
  { id: "cp-1", name: "Minimal Light", bgFrom: "from-emerald-500", bgTo: "to-teal-600" },
  { id: "cp-2", name: "Executive Dark", bgFrom: "from-slate-700", bgTo: "to-slate-900" },
  { id: "cp-3", name: "Classic Blue", bgFrom: "from-sky-500", bgTo: "to-blue-600" },
  { id: "cp-4", name: "Amber Highlight", bgFrom: "from-amber-500", bgTo: "to-orange-600" },
]

export const reportWidgetCatalog: ReportWidget[] = [
  { id: "w-1", title: "Incidents by Severity", type: "bar" },
  { id: "w-2", title: "MTTR Trend", type: "line" },
  { id: "w-3", title: "Disposition Breakdown", type: "pie" },
  { id: "w-4", title: "Open Incidents", type: "kpi" },
  { id: "w-5", title: "SLA Compliance", type: "kpi" },
  { id: "w-6", title: "Top MITRE Techniques", type: "table" },
  { id: "w-7", title: "Threat Intel Volume", type: "line" },
  { id: "w-8", title: "Analyst Workload", type: "table" },
  { id: "w-9", title: "Risk Score Distribution", type: "bar" },
  { id: "w-10", title: "Case Resolution Time", type: "kpi" },
]

export const reportTemplates: ReportTemplate[] = [
  {
    id: "rt-1",
    name: "Executive Incident Summary",
    description: "High-level severity, MTTR, and SLA rollup for leadership review.",
    module: "incident",
    coverPageId: "cp-2",
    widgetIds: ["w-1", "w-4", "w-5", "w-2"],
  },
  {
    id: "rt-2",
    name: "Threat Intel Digest",
    description: "Weekly volume, disposition mix, and top MITRE coverage from Threat Intel.",
    module: "threatIntel",
    coverPageId: "cp-3",
    widgetIds: ["w-7", "w-3", "w-6"],
  },
  {
    id: "rt-3",
    name: "SLA Compliance Report",
    description: "SLA attainment and MTTR trend against contracted thresholds.",
    module: "incident",
    coverPageId: "cp-1",
    widgetIds: ["w-5", "w-2", "w-4"],
  },
  {
    id: "rt-4",
    name: "MITRE Coverage Report",
    description: "Technique coverage and risk distribution across active incidents.",
    module: "incident",
    coverPageId: "cp-2",
    widgetIds: ["w-6", "w-9"],
  },
  {
    id: "rt-5",
    name: "Monthly Board Report",
    description: "Full-picture monthly rollup — severity, SLA, disposition, and MTTR.",
    module: "incident",
    coverPageId: "cp-2",
    widgetIds: ["w-1", "w-4", "w-5", "w-3", "w-2"],
  },
]

export const reports: Report[] = [
  // ── Template archetype (PDF, real: report_type='PDF') ──────────────────
  {
    id: "RPT-1001",
    name: "Weekly Executive Incident Summary",
    description: "Severity mix, MTTR, and SLA rollup circulated to leadership every Monday.",
    archetype: "template",
    format: "PDF",
    module: "incident",
    status: "published",
    author: users.ahmed,
    createdOn: "Jun 02",
    updatedOn: "Jul 14",
    coverPageId: "cp-2",
    sections: [
      { widgetId: "w-1", included: true },
      { widgetId: "w-4", included: true },
      { widgetId: "w-5", included: true },
      { widgetId: "w-2", included: true },
    ],
    isScheduled: true,
    generatedCount: 24,
  },
  {
    id: "RPT-1002",
    name: "Threat Intel Digest",
    description: "Weekly volume and disposition mix from Threat Intel.",
    archetype: "template",
    format: "PDF",
    module: "threatIntel",
    status: "published",
    author: users.sara,
    createdOn: "May 20",
    updatedOn: "Jul 13",
    coverPageId: "cp-3",
    sections: [
      { widgetId: "w-7", included: true },
      { widgetId: "w-3", included: true },
      { widgetId: "w-6", included: true },
    ],
    isScheduled: true,
    generatedCount: 18,
  },
  {
    id: "RPT-1003",
    name: "SLA Compliance Report",
    description: "SLA attainment against contracted thresholds, quarterly view.",
    archetype: "template",
    format: "PDF",
    module: "incident",
    status: "draft",
    author: users.mariam,
    createdOn: "Jul 10",
    updatedOn: "Jul 16",
    coverPageId: "cp-1",
    sections: [
      { widgetId: "w-5", included: true },
      { widgetId: "w-2", included: false },
      { widgetId: "w-4", included: true },
    ],
    isScheduled: false,
    generatedCount: 0,
  },
  {
    id: "RPT-1004",
    name: "MITRE ATT&CK Coverage Report",
    description: "Technique coverage and risk distribution for the last 90 days.",
    archetype: "template",
    format: "PDF",
    module: "incident",
    status: "published",
    author: users.yusuf,
    createdOn: "Apr 28",
    updatedOn: "Jun 30",
    coverPageId: "cp-2",
    sections: [
      { widgetId: "w-6", included: true },
      { widgetId: "w-9", included: true },
    ],
    isScheduled: false,
    generatedCount: 6,
  },
  {
    id: "RPT-1005",
    name: "Monthly Board Report",
    description: "Full-picture monthly rollup for the board pack.",
    archetype: "template",
    format: "PDF",
    module: "incident",
    status: "published",
    author: users.ahmed,
    createdOn: "Mar 03",
    updatedOn: "Jul 01",
    coverPageId: "cp-2",
    sections: [
      { widgetId: "w-1", included: true },
      { widgetId: "w-4", included: true },
      { widgetId: "w-5", included: true },
      { widgetId: "w-3", included: true },
      { widgetId: "w-2", included: true },
    ],
    isScheduled: true,
    generatedCount: 5,
  },
  {
    id: "RPT-1006",
    name: "SOC Analyst Shift Handover",
    description: "Open incidents and workload snapshot for shift handover.",
    archetype: "template",
    format: "PDF",
    module: "incident",
    status: "draft",
    author: users.noor,
    createdOn: "Jul 17",
    updatedOn: "Jul 18",
    coverPageId: "cp-1",
    sections: [
      { widgetId: "w-4", included: true },
      { widgetId: "w-8", included: true },
    ],
    isScheduled: false,
    generatedCount: 0,
  },
  {
    id: "RPT-1007",
    name: "Case Closure Summary",
    description: "Resolution time and closure mix across active cases.",
    archetype: "template",
    format: "PDF",
    module: "cases",
    status: "published",
    author: users.layla,
    createdOn: "Jun 11",
    updatedOn: "Jul 05",
    coverPageId: "cp-4",
    sections: [
      { widgetId: "w-10", included: true },
      { widgetId: "w-3", included: true },
    ],
    isScheduled: false,
    generatedCount: 3,
  },
  {
    id: "RPT-1008",
    name: "Analyst Workload Overview",
    description: "Open-ticket distribution across the analyst roster.",
    archetype: "template",
    format: "PDF",
    module: "incident",
    status: "draft",
    author: users.rashid,
    createdOn: "Jul 15",
    updatedOn: "Jul 15",
    coverPageId: "cp-1",
    sections: [{ widgetId: "w-8", included: true }],
    isScheduled: false,
    generatedCount: 0,
  },
  {
    id: "RPT-1009",
    name: "Quarterly Threat Landscape",
    description: "Threat Intel volume and top techniques over the quarter.",
    archetype: "template",
    format: "PDF",
    module: "threatIntel",
    status: "published",
    author: users.sara,
    createdOn: "Jan 08",
    updatedOn: "Jul 02",
    coverPageId: "cp-3",
    sections: [
      { widgetId: "w-7", included: true },
      { widgetId: "w-6", included: true },
    ],
    isScheduled: false,
    generatedCount: 4,
  },

  // ── Saved-export archetype (Excel, real: report_type='EXCEL') ──────────
  {
    id: "RPT-2001",
    name: "Critical Incidents — Last 30 Days",
    archetype: "saved-export",
    format: "EXCEL",
    module: "incident",
    status: "published",
    author: users.ahmed,
    createdOn: "Jul 01",
    updatedOn: "Jul 19",
    savedSearchSummary: "Severity: Critical · Status: Open, In Progress · Updated: last 30 days",
    isScheduled: true,
    generatedCount: 9,
  },
  {
    id: "RPT-2002",
    name: "Unresolved Phishing Cases",
    archetype: "saved-export",
    format: "EXCEL",
    module: "cases",
    status: "published",
    author: users.layla,
    createdOn: "Jun 22",
    updatedOn: "Jul 10",
    savedSearchSummary: "Category: Phishing · Status: not closed",
    isScheduled: false,
    generatedCount: 2,
  },
  {
    id: "RPT-2003",
    name: "High-Confidence APT29 Intel",
    archetype: "saved-export",
    format: "EXCEL",
    module: "threatIntel",
    status: "published",
    author: users.sara,
    createdOn: "May 30",
    updatedOn: "Jul 17",
    savedSearchSummary: "Disposition: True Positive · Tag: APT29 · AI confidence ≥ 90%",
    isScheduled: true,
    generatedCount: 11,
  },
  {
    id: "RPT-2004",
    name: "P1 Incidents by Assignee",
    archetype: "saved-export",
    format: "EXCEL",
    module: "incident",
    status: "draft",
    author: users.mariam,
    createdOn: "Jul 16",
    updatedOn: "Jul 16",
    savedSearchSummary: "Priority: P1 · Grouped by assignee",
    isScheduled: false,
    generatedCount: 0,
  },
  {
    id: "RPT-2005",
    name: "False-Positive Threat Intel Backlog",
    archetype: "saved-export",
    format: "EXCEL",
    module: "threatIntel",
    status: "published",
    author: users.yusuf,
    createdOn: "Apr 14",
    updatedOn: "Jun 25",
    savedSearchSummary: "Disposition: False Positive · Status: open",
    isScheduled: false,
    generatedCount: 5,
  },
]

export const reportSchedules: ReportSchedule[] = [
  {
    id: "SCH-1",
    reportId: "RPT-1001",
    frequency: "weekly",
    weekday: "Monday",
    hourSlot: 8,
    dateRange: "Last 7 days",
    isCustomRange: false,
    recipients: [users.ahmed, users.mariam, users.rashid],
    emailSubject: "Weekly Executive Incident Summary",
    emailContent: "Attached is this week's executive incident summary.",
    deliveryChannel: "email",
    nextRun: "Jul 21, 08:00",
  },
  {
    id: "SCH-2",
    reportId: "RPT-1002",
    frequency: "weekly",
    weekday: "Friday",
    hourSlot: 17,
    dateRange: "Last 7 days",
    isCustomRange: false,
    recipients: [users.sara, users.yusuf],
    emailSubject: "Threat Intel Digest",
    emailContent: "This week's threat intel digest is attached.",
    deliveryChannel: "email",
    nextRun: "Jul 25, 17:00",
  },
  {
    id: "SCH-3",
    reportId: "RPT-1005",
    frequency: "monthly",
    dayOfMonth: 1,
    hourSlot: 7,
    dateRange: "Last 30 days",
    isCustomRange: false,
    recipients: [users.ahmed, users.noor, users.layla],
    emailSubject: "Monthly Board Report",
    emailContent: "The monthly board report is ready for review.",
    deliveryChannel: "email",
    nextRun: "Aug 01, 07:00",
    // New in this redesign — no live backend on react-go master or faiz-dev.
    timezone: "Asia/Riyadh",
  },
  {
    id: "SCH-4",
    reportId: "RPT-2001",
    frequency: "daily",
    hourSlot: 6,
    dateRange: "Last 30 days",
    isCustomRange: false,
    recipients: [users.ahmed],
    emailSubject: "Critical Incidents — Last 30 Days",
    emailContent: "Daily export of critical incidents attached.",
    deliveryChannel: "slack",
    nextRun: "Jul 20, 06:00",
  },
  {
    id: "SCH-5",
    reportId: "RPT-2003",
    frequency: "daily",
    hourSlot: 9,
    dateRange: "Custom",
    isCustomRange: true,
    recipients: [users.sara, users.mariam],
    emailSubject: "High-Confidence APT29 Intel",
    emailContent: "Daily APT29 intel export attached.",
    deliveryChannel: "email",
    nextRun: "Jul 20, 09:00",
    // New in this redesign — no live backend on react-go master or faiz-dev.
    intervalDays: 2,
    timezone: "UTC",
  },
]

export const reportHistory: ReportHistoryEntry[] = [
  { id: "HIST-1", reportId: "RPT-1001", generatedAt: "Jul 14, 08:00", triggeredBy: "schedule", format: "PDF", sizeKb: 842 },
  { id: "HIST-2", reportId: "RPT-1001", generatedAt: "Jul 07, 08:00", triggeredBy: "schedule", format: "PDF", sizeKb: 811 },
  { id: "HIST-3", reportId: "RPT-1002", generatedAt: "Jul 13, 17:00", triggeredBy: "schedule", format: "PDF", sizeKb: 604 },
  { id: "HIST-4", reportId: "RPT-1004", generatedAt: "Jun 30, 11:22", triggeredBy: "manual", format: "PDF", sizeKb: 1180 },
  { id: "HIST-5", reportId: "RPT-1005", generatedAt: "Jul 01, 07:00", triggeredBy: "schedule", format: "PDF", sizeKb: 2340 },
  { id: "HIST-6", reportId: "RPT-1007", generatedAt: "Jul 05, 15:41", triggeredBy: "manual", format: "PDF", sizeKb: 398 },
  { id: "HIST-7", reportId: "RPT-2001", generatedAt: "Jul 19, 06:00", triggeredBy: "schedule", format: "EXCEL", sizeKb: 212 },
  { id: "HIST-8", reportId: "RPT-2001", generatedAt: "Jul 18, 06:00", triggeredBy: "schedule", format: "EXCEL", sizeKb: 208 },
  { id: "HIST-9", reportId: "RPT-2003", generatedAt: "Jul 17, 09:00", triggeredBy: "schedule", format: "EXCEL", sizeKb: 156 },
  { id: "HIST-10", reportId: "RPT-2005", generatedAt: "Jun 25, 10:12", triggeredBy: "manual", format: "EXCEL", sizeKb: 94 },
]

export function getReportById(id: string): Report | undefined {
  return reports.find((r) => r.id === id)
}

export function getSchedulesForReport(reportId: string): ReportSchedule[] {
  return reportSchedules.filter((s) => s.reportId === reportId)
}

export function getHistoryForReport(reportId: string): ReportHistoryEntry[] {
  return reportHistory.filter((h) => h.reportId === reportId)
}

export function getWidgetById(id: string): ReportWidget | undefined {
  return reportWidgetCatalog.find((w) => w.id === id)
}

export function getCoverPageById(id: string): ReportCoverPage | undefined {
  return coverPages.find((c) => c.id === id)
}
