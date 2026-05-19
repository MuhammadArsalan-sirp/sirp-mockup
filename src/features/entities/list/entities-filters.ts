import type { FacetedOption } from "@/components/shared/data-table"
import { entities } from "@/data/entities"

export const typeOptions: readonly FacetedOption[] = [
  { value: "Application", label: "Application" },
  { value: "Host", label: "Host" },
  { value: "User", label: "User" },
  { value: "Service", label: "Service" },
  { value: "Database", label: "Database" },
  { value: "Network Device", label: "Network Device" },
  { value: "Cloud Resource", label: "Cloud Resource" },
]

export const criticalityOptions: readonly FacetedOption[] = [
  { value: "critical", label: "Critical", swatch: "var(--destructive)" },
  { value: "high", label: "High", swatch: "var(--attention)" },
  { value: "medium", label: "Medium", swatch: "var(--info)" },
  { value: "low", label: "Low", swatch: "var(--muted-foreground)" },
]

export const statusOptions: readonly FacetedOption[] = [
  { value: "active", label: "Active", swatch: "var(--success)" },
  { value: "inactive", label: "Inactive", swatch: "var(--muted-foreground)" },
  { value: "decommissioned", label: "Decommissioned", swatch: "var(--muted-foreground)" },
  { value: "unknown", label: "Unknown", swatch: "var(--attention)" },
]

export const departmentOptions: readonly FacetedOption[] = [
  ...new Set(entities.map((e) => e.department)),
]
  .sort()
  .map((d) => ({ value: d, label: d }))

export const ownerOptions: readonly FacetedOption[] = [
  { value: "Ahmed Khan", label: "Ahmed Khan (you)" },
  { value: "Sara Ali", label: "Sara Ali" },
  { value: "Mariam Jaber", label: "Mariam Jaber" },
  { value: "Rashid Tariq", label: "Rashid Tariq" },
  { value: "Yusuf Kamal", label: "Yusuf Kamal" },
  { value: "Noor Hassan", label: "Noor Hassan" },
  { value: "Layla Abbas", label: "Layla Abbas" },
  { value: "__unassigned__", label: "Unassigned" },
]

export const tagsOptions: readonly FacetedOption[] = [
  ...new Set(entities.flatMap((e) => e.tags)),
]
  .sort()
  .map((t) => ({ value: t, label: t }))

export const filterLabels: Record<string, string> = {
  type: "Type",
  criticality: "Criticality",
  status: "Status",
  department: "Department",
  owner: "Owner",
  tags: "Tags",
}
