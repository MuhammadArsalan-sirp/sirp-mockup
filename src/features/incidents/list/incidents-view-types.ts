// ─── Group / Order options ────────────────────────────────────────────────────

export type GroupByField =
  | "none"
  | "recordType"   // Alert / Case / Incident (derived)
  | "status"
  | "severity"
  | "priority"
  | "state"
  | "source"
  | "category"
  | "assignee"

export type OrderByField =
  | "updated"
  | "created"
  | "startDate"
  | "severity"
  | "priority"
  | "risk"
  | "sla"

// ─── List (Feed) view ─────────────────────────────────────────────────────────

export type ListField =
  | "id"
  | "type"
  | "title"
  | "severity"
  | "priority"
  | "status"
  | "state"
  | "source"
  | "assignee"
  | "created"
  | "updated"
  | "artifacts"
  | "iocs"
  | "sla"
  | "risk"
  | "category"
  | "tags"
  | "tenant"

export const LIST_FIELD_LABELS: Record<ListField, string> = {
  id: "ID",
  type: "Type",
  title: "Subject",
  severity: "Severity",
  priority: "Priority",
  status: "Status",
  state: "Stage",
  source: "Source",
  assignee: "Assigned To",
  created: "Created",
  updated: "Update Date",
  artifacts: "Artifacts",
  iocs: "IOCs",
  sla: "SLA",
  risk: "Risk",
  category: "Category",
  tags: "Tags",
  tenant: "Tenant",
}

/** Pixel width each field occupies in the row grid. */
export const LIST_FIELD_WIDTHS: Record<ListField, string> = {
  id: "88px",
  type: "68px",
  title: "1fr",
  severity: "46px",
  priority: "34px",
  status: "112px",
  state: "104px",
  source: "108px",
  assignee: "24px",
  created: "58px",
  updated: "72px",
  artifacts: "78px",
  iocs: "54px",
  sla: "96px",
  risk: "68px",
  category: "108px",
  tags: "120px",
  tenant: "78px",
}

/** The order fields are rendered left→right in a row. */
export const LIST_FIELD_ORDER: ListField[] = [
  "id",
  "type",
  "title",
  "severity",
  "priority",
  "status",
  "state",
  "source",
  "category",
  "assignee",
  "artifacts",
  "iocs",
  "sla",
  "risk",
  "tags",
  "tenant",
  "created",
  "updated",
]

export const DEFAULT_COLLAPSED_FIELDS: ListField[] = [
  "id",
  "type",
  "title",
  "severity",
  "priority",
  "status",
  "state",
  "source",
  "assignee",
  "created",
  "updated",
]

export const DEFAULT_EXPANDED_FIELDS: ListField[] = [
  "artifacts",
  "iocs",
  "sla",
  "risk",
  "category",
  "tags",
  "tenant",
]

export type ListViewConfig = {
  groupBy: GroupByField
  subGroupBy: GroupByField
  orderBy: OrderByField
  orderDir: "asc" | "desc"
  showEmptyGroups: boolean
  collapsedFields: ListField[]
  expandedFields: ListField[]
}

export const DEFAULT_LIST_CONFIG: ListViewConfig = {
  groupBy: "recordType",
  subGroupBy: "none",
  orderBy: "updated",
  orderDir: "desc",
  showEmptyGroups: false,
  collapsedFields: DEFAULT_COLLAPSED_FIELDS,
  expandedFields: DEFAULT_EXPANDED_FIELDS,
}

// ─── Board view ───────────────────────────────────────────────────────────────

export type BoardGroupByField = "recordType" | "state" | "status" | "severity" | "priority" | "assignee"

export type BoardField =
  | "severity"
  | "priority"
  | "category"
  | "state"
  | "source"
  | "assignee"
  | "updated"
  | "created"
  | "artifacts"
  | "iocs"
  | "sla"
  | "risk"

export const BOARD_FIELD_LABELS: Record<BoardField, string> = {
  severity: "Severity",
  priority: "Priority",
  category: "Category",
  state: "Stage",
  source: "Source",
  assignee: "Assignee",
  updated: "Updated",
  created: "Created",
  artifacts: "Artifacts",
  iocs: "IOCs",
  sla: "SLA",
  risk: "Risk",
}

export const DEFAULT_BOARD_FIELDS: BoardField[] = [
  "severity",
  "priority",
  "category",
  "updated",
  "assignee",
]

export type BoardViewConfig = {
  groupBy: BoardGroupByField
  subGroupBy: GroupByField
  orderBy: OrderByField
  orderDir: "asc" | "desc"
  showEmptyGroups: boolean
  cardFields: BoardField[]
}

export const DEFAULT_BOARD_CONFIG: BoardViewConfig = {
  groupBy: "status",
  subGroupBy: "none",
  orderBy: "updated",
  orderDir: "desc",
  showEmptyGroups: false,
  cardFields: DEFAULT_BOARD_FIELDS,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const GROUP_BY_LABELS: Record<GroupByField, string> = {
  none: "None",
  recordType: "State",
  status: "Status",
  severity: "Severity",
  priority: "Priority",
  state: "Stage",
  source: "Source",
  category: "Category",
  assignee: "Assignee",
}

export const ORDER_BY_LABELS: Record<OrderByField, string> = {
  updated: "Update Date",
  created: "Created",
  startDate: "Start Date",
  severity: "Severity",
  priority: "Priority",
  risk: "Risk",
  sla: "SLA",
}

export const BOARD_GROUP_BY_LABELS: Record<BoardGroupByField, string> = {
  recordType: "State",
  state: "Stage",
  status: "Status",
  severity: "Severity",
  priority: "Priority",
  assignee: "Assignee",
}
