import type { FacetedOption } from "@/components/shared/data-table"

export const severityOptions: readonly FacetedOption[] = [
  { value: "critical", label: "Critical", swatch: "var(--destructive)" },
  { value: "high", label: "High", swatch: "var(--attention)" },
  { value: "medium", label: "Medium", swatch: "var(--info)" },
  { value: "low", label: "Low", swatch: "var(--muted-foreground)" },
]

export const statusOptions: readonly FacetedOption[] = [
  { value: "open", label: "Open", swatch: "var(--muted-foreground)" },
  { value: "investigating", label: "Investigating", swatch: "var(--chart-2)" },
  { value: "in-progress", label: "In Progress", swatch: "var(--chart-2)" },
  { value: "waiting", label: "Waiting · approval", swatch: "var(--attention)" },
  { value: "resolved", label: "Resolved", swatch: "var(--success)" },
]

export const sourceOptions: readonly FacetedOption[] = [
  { value: "OmniSense", label: "OmniSense", swatch: "var(--chart-1)" },
  { value: "CrowdStrike", label: "CrowdStrike", swatch: "var(--destructive)" },
  { value: "Splunk", label: "Splunk", swatch: "var(--chart-3)" },
  { value: "Sentinel", label: "Sentinel", swatch: "var(--info)" },
  { value: "Proofpoint", label: "Proofpoint", swatch: "var(--info)" },
  { value: "AWS GuardDuty", label: "AWS GuardDuty", swatch: "var(--attention)" },
  { value: "Triage Agent", label: "Triage Agent", swatch: "var(--primary)" },
]

export const assigneeOptions: readonly FacetedOption[] = [
  { value: "Ahmed Khan", label: "Ahmed Khan (you)" },
  { value: "Sara Ali", label: "Sara Ali" },
  { value: "Mariam Jaber", label: "Mariam Jaber" },
  { value: "Rashid Tariq", label: "Rashid Tariq" },
  { value: "Yusuf Kamal", label: "Yusuf Kamal" },
  { value: "__unassigned__", label: "Unassigned" },
]

export const typeOptions: readonly FacetedOption[] = [
  { value: "Lateral movement", label: "Lateral movement" },
  { value: "Credential dump", label: "Credential dump" },
  { value: "Phishing", label: "Phishing" },
  { value: "Brute force", label: "Brute force" },
  { value: "Data leak", label: "Data leak" },
  { value: "Account anomaly", label: "Account anomaly" },
  { value: "Cloud misconfig", label: "Cloud misconfig" },
  { value: "Ransomware", label: "Ransomware" },
]

export const mitreOptions: readonly FacetedOption[] = [
  { value: "T1003.001", label: "T1003.001 · OS Cred Dumping" },
  { value: "T1021.001", label: "T1021.001 · RDP" },
  { value: "T1059.003", label: "T1059.003 · Cmd Shell" },
  { value: "T1078", label: "T1078 · Valid Accounts" },
  { value: "T1078.004", label: "T1078.004 · Cloud Accounts" },
  { value: "T1110.003", label: "T1110.003 · Password Spraying" },
  { value: "T1204.002", label: "T1204.002 · Malicious File" },
  { value: "T1486", label: "T1486 · Data Encrypted" },
  { value: "T1490", label: "T1490 · Inhibit Recovery" },
  { value: "T1530", label: "T1530 · Cloud Storage" },
  { value: "T1566.001", label: "T1566.001 · Spear Phishing Attachment" },
]

export const tagsOptions: readonly FacetedOption[] = [
  { value: "APT29", label: "APT29" },
  { value: "ransomware", label: "ransomware" },
  { value: "phishing", label: "phishing" },
  { value: "campaign-T123", label: "campaign-T123" },
  { value: "domain-controller", label: "domain-controller" },
  { value: "jumphost", label: "jumphost" },
  { value: "linux", label: "linux" },
  { value: "vpn", label: "vpn" },
  { value: "external", label: "external" },
  { value: "finance", label: "finance" },
  { value: "compliance", label: "compliance" },
  { value: "pii", label: "pii" },
  { value: "aws", label: "aws" },
  { value: "s3", label: "s3" },
  { value: "service-account", label: "service-account" },
  { value: "approval", label: "approval" },
  { value: "high-priority", label: "high-priority" },
  { value: "contained", label: "contained" },
]

export const tenantOptions: readonly FacetedOption[] = [
  { value: "Acme Corp", label: "Acme Corp" },
  { value: "Acme EU", label: "Acme EU" },
  { value: "Acme US", label: "Acme US" },
]

export const priorityOptions: readonly FacetedOption[] = [
  { value: "P1", label: "P1 — highest", swatch: "var(--destructive)" },
  { value: "P2", label: "P2", swatch: "var(--attention)" },
  { value: "P3", label: "P3", swatch: "var(--info)" },
  { value: "P4", label: "P4 — lowest", swatch: "var(--muted-foreground)" },
]

export const stateOptions: readonly FacetedOption[] = [
  { value: "pending", label: "Pending" },
  { value: "case", label: "Case" },
  { value: "finish", label: "Finish" },
]

export const dispositionOptions: readonly FacetedOption[] = [
  { value: "true-positive", label: "True Positive", swatch: "var(--destructive)" },
  { value: "false-positive", label: "False Positive", swatch: "var(--muted-foreground)" },
  { value: "benign", label: "Benign", swatch: "var(--success)" },
  { value: "not-determined", label: "Not Determined", swatch: "var(--muted-foreground)" },
  { value: "pending", label: "Pending", swatch: "var(--muted-foreground)" },
]

export const categoryOptions: readonly FacetedOption[] = [
  { value: "Phishing", label: "Phishing" },
  { value: "Malware", label: "Malware" },
  { value: "Lateral Movement", label: "Lateral Movement" },
  { value: "Credential Access", label: "Credential Access" },
  { value: "Data Exfiltration", label: "Data Exfiltration" },
  { value: "Cloud Misconfig", label: "Cloud Misconfig" },
  { value: "Insider Threat", label: "Insider Threat" },
  { value: "Brute Force", label: "Brute Force" },
  { value: "Reconnaissance", label: "Reconnaissance" },
  { value: "DLP", label: "DLP" },
]

export const customerOptions: readonly FacetedOption[] = [
  { value: "Acme Corp", label: "Acme Corp" },
  { value: "Acme EU", label: "Acme EU" },
  { value: "Acme US", label: "Acme US" },
]

export const locationOptions: readonly FacetedOption[] = [
  { value: "HQ", label: "HQ" },
  { value: "EU-West-1", label: "EU-West-1" },
  { value: "US-East", label: "US-East" },
  { value: "US-West", label: "US-West" },
  { value: "APAC", label: "APAC" },
]

export const filterLabels = {
  severity: {
    label: "Severity",
    values: Object.fromEntries(severityOptions.map((o) => [o.value, o.label])),
  },
  status: {
    label: "Status",
    values: Object.fromEntries(statusOptions.map((o) => [o.value, o.label])),
  },
  source: {
    label: "Source",
    values: Object.fromEntries(sourceOptions.map((o) => [o.value, o.label])),
  },
  assignee: {
    label: "Assignee",
    values: Object.fromEntries(assigneeOptions.map((o) => [o.value, o.label])),
  },
  type: {
    label: "Type",
    values: Object.fromEntries(typeOptions.map((o) => [o.value, o.label])),
  },
  mitre: {
    label: "MITRE",
    values: Object.fromEntries(mitreOptions.map((o) => [o.value, o.label])),
  },
  tags: {
    label: "Tags",
    values: Object.fromEntries(tagsOptions.map((o) => [o.value, o.label])),
  },
  tenant: {
    label: "Tenant",
    values: Object.fromEntries(tenantOptions.map((o) => [o.value, o.label])),
  },
  priority: {
    label: "Priority",
    values: Object.fromEntries(priorityOptions.map((o) => [o.value, o.label])),
  },
  state: {
    label: "State",
    values: Object.fromEntries(stateOptions.map((o) => [o.value, o.label])),
  },
  disposition: {
    label: "Disposition",
    values: Object.fromEntries(dispositionOptions.map((o) => [o.value, o.label])),
  },
  category: {
    label: "Category",
    values: Object.fromEntries(categoryOptions.map((o) => [o.value, o.label])),
  },
  customer: {
    label: "Customer",
    values: Object.fromEntries(customerOptions.map((o) => [o.value, o.label])),
  },
  location: {
    label: "Location",
    values: Object.fromEntries(locationOptions.map((o) => [o.value, o.label])),
  },
}
