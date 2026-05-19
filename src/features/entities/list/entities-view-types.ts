// ─── Group / Order options ────────────────────────────────────────────────────

export type GroupByField =
  | "none"
  | "type"
  | "criticality"
  | "status"
  | "department"
  | "owner"

export type OrderByField =
  | "s3Score"
  | "criticality"
  | "relationships"
  | "updated"
  | "created"
  | "name"

// ─── List (Feed) view ─────────────────────────────────────────────────────────

export type ListField =
  | "id"
  | "name"
  | "type"
  | "criticality"
  | "status"
  | "owner"
  | "department"
  | "s3Score"
  | "relationships"
  | "tags"
  | "updated"
  | "created"

export const LIST_FIELD_LABELS: Record<ListField, string> = {
  id: "ID",
  name: "Name",
  type: "Type",
  criticality: "Criticality",
  status: "Status",
  owner: "Owner",
  department: "Department",
  s3Score: "S3 Score",
  relationships: "Relationships",
  tags: "Tags",
  updated: "Updated",
  created: "Created",
}

export const LIST_FIELD_WIDTHS: Record<ListField, string> = {
  id: "82px",
  name: "1fr",
  type: "116px",
  criticality: "76px",
  status: "110px",
  owner: "24px",
  department: "132px",
  s3Score: "78px",
  relationships: "96px",
  tags: "140px",
  updated: "80px",
  created: "72px",
}

export const LIST_FIELD_ORDER: ListField[] = [
  "id",
  "name",
  "type",
  "criticality",
  "status",
  "owner",
  "department",
  "s3Score",
  "relationships",
  "tags",
  "updated",
  "created",
]

export const DEFAULT_COLLAPSED_FIELDS: ListField[] = [
  "id",
  "name",
  "type",
  "criticality",
  "status",
  "owner",
  "s3Score",
  "relationships",
  "updated",
]

export type ListViewConfig = {
  groupBy: GroupByField
  subGroupBy: GroupByField
  orderBy: OrderByField
  orderDir: "asc" | "desc"
  showEmptyGroups: boolean
  collapsedFields: ListField[]
}

export const DEFAULT_LIST_CONFIG: ListViewConfig = {
  groupBy: "type",
  subGroupBy: "none",
  orderBy: "s3Score",
  orderDir: "desc",
  showEmptyGroups: false,
  collapsedFields: DEFAULT_COLLAPSED_FIELDS,
}

// ─── Board (card grid) view ───────────────────────────────────────────────────

export type BoardField =
  | "type"
  | "criticality"
  | "status"
  | "owner"
  | "department"
  | "s3Score"
  | "relationships"
  | "tags"
  | "updated"
  | "created"

export const BOARD_FIELD_LABELS: Record<BoardField, string> = {
  type: "Type",
  criticality: "Criticality",
  status: "Status",
  owner: "Owner",
  department: "Department",
  s3Score: "S3 Score",
  relationships: "Relationships",
  tags: "Tags",
  updated: "Updated",
  created: "Created",
}

export type BoardViewConfig = {
  groupBy: GroupByField
  subGroupBy: GroupByField
  orderBy: OrderByField
  orderDir: "asc" | "desc"
  cardFields: BoardField[]
  showEmptyGroups: boolean
  columns: 2 | 3 | 4
}

export const DEFAULT_BOARD_CONFIG: BoardViewConfig = {
  groupBy: "type",
  subGroupBy: "none",
  orderBy: "s3Score",
  orderDir: "desc",
  cardFields: ["criticality", "status", "s3Score", "relationships", "owner"],
  showEmptyGroups: false,
  columns: 3,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const GROUP_BY_LABELS: Record<GroupByField, string> = {
  none: "None",
  type: "Type",
  criticality: "Criticality",
  status: "Status",
  department: "Department",
  owner: "Owner",
}

export const ORDER_BY_LABELS: Record<OrderByField, string> = {
  s3Score: "S3 Score",
  criticality: "Criticality",
  relationships: "Relationships",
  updated: "Updated",
  created: "Created",
  name: "Name",
}
