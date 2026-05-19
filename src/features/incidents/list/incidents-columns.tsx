import {
  CheckCircle2,
  Folder,
  Loader2,
  MapPin,
  MoreHorizontal,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Target,
} from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/shared/data-table"
import type {
  Disposition,
  Incident,
  IncidentState,
  Priority,
  Severity,
  UserRef,
} from "@/data/incidents"
import { SourceIcon } from "./source-icon"

const severityTone: Record<Severity, string> = {
  critical: "var(--destructive)",
  high: "var(--attention)",
  medium: "var(--info)",
  low: "var(--muted-foreground)",
}

function SeverityPill({ value }: { value: Severity }) {
  const color = severityTone[value]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize"
      style={{
        background: `color-mix(in srgb, ${color} 15%, transparent)`,
        color,
      }}
    >
      <span className="size-1.5 rounded-full" style={{ background: color }} />
      {value}
    </span>
  )
}

function StatusPill({ value }: { value: Incident["status"] }) {
  if (value === "resolved" || value === "closed")
    return (
      <Badge
        variant="outline"
        style={{
          borderColor: "color-mix(in srgb, var(--success) 35%, transparent)",
          color: "var(--success)",
        }}
      >
        {value === "closed" ? "Closed" : "Resolved"}
      </Badge>
    )
  if (value === "waiting")
    return (
      <Badge
        variant="outline"
        style={{
          borderColor: "color-mix(in srgb, var(--attention) 35%, transparent)",
          color: "var(--attention)",
        }}
      >
        Waiting · approval
      </Badge>
    )
  return (
    <Badge variant="outline" className="capitalize">
      <span
        className="mr-1.5 size-1.5 rounded-full"
        style={{
          background:
            value === "open" ? "var(--muted-foreground)" : "var(--chart-2)",
        }}
      />
      {value.replace("-", " ")}
    </Badge>
  )
}

const priorityTone: Record<Priority, string> = {
  P1: "var(--destructive)",
  P2: "var(--attention)",
  P3: "var(--info)",
  P4: "var(--muted-foreground)",
}

function PriorityPill({ value }: { value: Priority }) {
  const color = priorityTone[value]
  return (
    <span
      className="inline-flex h-6 min-w-[32px] items-center justify-center rounded-md px-2 font-mono text-xs font-semibold tabular-nums"
      style={{
        background: `color-mix(in srgb, ${color} 15%, transparent)`,
        color,
      }}
    >
      {value}
    </span>
  )
}

const stateMeta: Record<
  IncidentState,
  { label: string; tone: string; icon: typeof Target }
> = {
  triage: { label: "Triage", tone: "var(--muted-foreground)", icon: Target },
  investigating: {
    label: "Investigating",
    tone: "var(--chart-2)",
    icon: Search,
  },
  containment: {
    label: "Containment",
    tone: "var(--attention)",
    icon: Shield,
  },
  eradication: {
    label: "Eradication",
    tone: "var(--attention)",
    icon: ShieldAlert,
  },
  recovery: { label: "Recovery", tone: "var(--info)", icon: Loader2 },
  mitigated: {
    label: "Mitigated",
    tone: "var(--success)",
    icon: ShieldCheck,
  },
  closed: { label: "Closed", tone: "var(--muted-foreground)", icon: CheckCircle2 },
}

function StatePill({ value }: { value: IncidentState }) {
  const meta = stateMeta[value]
  const Icon = meta.icon
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs"
      style={{
        borderColor: `color-mix(in srgb, ${meta.tone} 35%, transparent)`,
        color: meta.tone,
      }}
    >
      <Icon className="size-3" />
      {meta.label}
    </span>
  )
}

const dispositionMeta: Record<Disposition, { label: string; tone: string }> = {
  "true-positive": { label: "True Positive", tone: "var(--destructive)" },
  "false-positive": { label: "False Positive", tone: "var(--muted-foreground)" },
  benign: { label: "Benign", tone: "var(--success)" },
  "not-determined": { label: "Not Determined", tone: "var(--muted-foreground)" },
  pending: { label: "Pending", tone: "var(--muted-foreground)" },
}

function DispositionPill({ value }: { value: Disposition }) {
  const meta = dispositionMeta[value]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs"
      style={{
        borderColor: `color-mix(in srgb, ${meta.tone} 35%, transparent)`,
        color: meta.tone,
      }}
    >
      <span className="size-1.5 rounded-full" style={{ background: meta.tone }} />
      {meta.label}
    </span>
  )
}

function UserCell({
  user,
  showWorkload = false,
  size = "md",
}: {
  user: UserRef | null | undefined
  showWorkload?: boolean
  size?: "sm" | "md"
}) {
  if (!user)
    return (
      <span className="text-sm italic text-muted-foreground">Unassigned</span>
    )
  // Reference shadcnblocks-admin uses size-8 (32px) avatars for primary users.
  const sizeCls = size === "sm" ? "size-7" : "size-8"
  const textCls = size === "sm" ? "text-[11px]" : "text-xs"
  return (
    <div className="inline-flex items-center gap-2.5">
      <Avatar className={cn("shrink-0", sizeCls)}>
        <AvatarImage src={user.photo} alt={user.name} />
        <AvatarFallback className={cn("bg-linear-to-br font-semibold text-white", user.gradient, textCls)}>
          {user.initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="text-sm font-medium leading-tight">{user.name}</div>
        {showWorkload && user.workload != null && (
          <div className="mt-0.5 text-xs text-muted-foreground">
            {user.workload} open
          </div>
        )}
      </div>
    </div>
  )
}

function MembersStack({ members }: { members: UserRef[] }) {
  if (members.length === 0)
    return <span className="text-sm text-muted-foreground">—</span>
  const visible = members.slice(0, 3)
  const overflow = members.length - visible.length
  return (
    <div className="inline-flex items-center">
      <div className="flex -space-x-2">
        {visible.map((m) => (
          <Avatar key={m.id} title={m.name} className="size-7 shrink-0 ring-2 ring-card">
            <AvatarImage src={m.photo} alt={m.name} />
            <AvatarFallback className={cn("bg-linear-to-br text-[11px] font-semibold text-white", m.gradient)}>
              {m.initials}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      {overflow > 0 && (
        <span className="ml-2 grid size-7 place-items-center rounded-full bg-muted text-xs font-medium text-muted-foreground ring-2 ring-card">
          +{overflow}
        </span>
      )}
    </div>
  )
}

export const incidentsColumnLabels: Record<string, string> = {
  id: "ID",
  sourceId: "Source ID",
  title: "Incident",
  severity: "Severity",
  priority: "Priority",
  status: "Status",
  state: "State",
  disposition: "Disposition",
  category: "Category",
  type: "Type",
  risk: "Risk",
  s3Score: "S3 Score",
  assignee: "Assignee",
  members: "Members",
  source: "Source",
  customer: "Customer",
  location: "Location",
  openedBy: "Opened by",
  closedBy: "Closed by",
  artifacts: "Artifacts",
  updated: "Updated",
  startDate: "Start date",
  updateDate: "Update date",
  closeDate: "Close date",
  detectionDate: "Detection date",
  escalationDate: "Escalation date",
  riskMitigationDate: "Risk mitigation",
  created: "Created",
  sla: "SLA",
  mitre: "MITRE",
  tags: "Tags",
  tenant: "Tenant",
  iocs: "IOCs",
  alerts: "Alerts",
  aiConfidence: "AI confidence",
}

export const incidentsColumns: ColumnDef<Incident>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        onClick={(e) => e.stopPropagation()}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => (
      <span className="font-mono text-sm text-muted-foreground">
        {row.original.id}
      </span>
    ),
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Incident" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[440px]">
        <span className="font-medium underline decoration-muted-foreground/30 underline-offset-4 hover:decoration-foreground">
          {row.original.title}
        </span>
        {row.original.subtitle && (
          <div className="mt-0.5 truncate text-xs text-muted-foreground">
            {row.original.subtitle}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "severity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Severity" />
    ),
    cell: ({ row }) => <SeverityPill value={row.original.severity} />,
    filterFn: (row, id, value) =>
      Array.isArray(value) && value.includes(row.getValue<string>(id)),
    sortingFn: (a, b) => {
      const order: Record<Severity, number> = {
        critical: 4,
        high: 3,
        medium: 2,
        low: 1,
      }
      return order[a.original.severity] - order[b.original.severity]
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <StatusPill value={row.original.status} />,
    filterFn: (row, id, value) =>
      Array.isArray(value) && value.includes(row.getValue<string>(id)),
  },
  {
    id: "type",
    accessorFn: (row) => row.type.label,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs">
        <span>{row.original.type.label}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.type.technique}
        </span>
      </span>
    ),
    filterFn: (row, _id, value) =>
      Array.isArray(value) && value.includes(row.original.type.label),
  },
  {
    accessorKey: "risk",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Risk" />
    ),
    cell: ({ row }) => {
      const v = row.original.risk
      const color =
        v >= 90
          ? "var(--destructive)"
          : v >= 70
            ? "var(--attention)"
            : v >= 50
              ? "var(--info)"
              : "var(--success)"
      return (
        <div className="flex items-center gap-2">
          <div className="relative h-1.5 w-12 overflow-hidden rounded-full bg-muted">
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${v}%`, background: color }}
            />
          </div>
          <span
            className="text-sm font-medium tabular-nums"
            style={{ color }}
          >
            {v}
          </span>
        </div>
      )
    },
  },
  {
    id: "assignee",
    accessorFn: (row) => row.assignee?.name ?? "__unassigned__",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assignee" />
    ),
    cell: ({ row }) => (
      <UserCell user={row.original.assignee} showWorkload />
    ),
    filterFn: (row, _id, value) => {
      if (!Array.isArray(value)) return true
      const v = row.original.assignee?.name ?? "__unassigned__"
      return value.includes(v)
    },
  },
  {
    id: "source",
    accessorFn: (row) => row.source.label,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Source" />
    ),
    cell: ({ row }) => <SourceIcon source={row.original.source.label} />,
    filterFn: (row, _id, value) =>
      Array.isArray(value) && value.includes(row.original.source.label),
  },
  {
    accessorKey: "updated",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap font-mono text-sm tabular-nums text-muted-foreground">
        {row.original.updated}
      </span>
    ),
  },
  {
    accessorKey: "sla",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SLA" />
    ),
    cell: ({ row }) => {
      const s = row.original.sla
      if (s.tone === "met")
        return (
          <span className="text-sm text-muted-foreground">{s.label}</span>
        )
      const color =
        s.tone === "ok"
          ? "var(--success)"
          : s.tone === "warn"
            ? "var(--attention)"
            : "var(--destructive)"
      return (
        <div className="min-w-[120px]">
          <span
            className="whitespace-nowrap text-sm font-medium tabular-nums"
            style={{ color }}
          >
            {s.label}
          </span>
          <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-[width]"
              style={{ width: `${s.pct}%`, background: color }}
            />
          </div>
        </div>
      )
    },
    sortingFn: (a, b) => a.original.sla.pct - b.original.sla.pct,
  },
  {
    accessorKey: "created",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">
        {row.original.created}
      </span>
    ),
  },
  {
    id: "mitre",
    accessorFn: (row) => row.mitre,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="MITRE" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center gap-1 max-w-[180px]">
        {row.original.mitre.slice(0, 2).map((id) => (
          <span
            key={id}
            className="inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
          >
            {id}
          </span>
        ))}
        {row.original.mitre.length > 2 && (
          <span className="text-xs text-muted-foreground">
            +{row.original.mitre.length - 2}
          </span>
        )}
      </div>
    ),
    filterFn: (row, _id, value) => {
      if (!Array.isArray(value) || value.length === 0) return true
      return row.original.mitre.some((id) => value.includes(id))
    },
    enableSorting: false,
  },
  {
    id: "tags",
    accessorFn: (row) => row.tags,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tags" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center gap-1 max-w-[200px]">
        {row.original.tags.slice(0, 2).map((t) => (
          <Badge
            key={t}
            variant="secondary"
            className="rounded font-normal text-xs"
          >
            {t}
          </Badge>
        ))}
        {row.original.tags.length > 2 && (
          <span className="text-xs text-muted-foreground">
            +{row.original.tags.length - 2}
          </span>
        )}
      </div>
    ),
    filterFn: (row, _id, value) => {
      if (!Array.isArray(value) || value.length === 0) return true
      return row.original.tags.some((t) => value.includes(t))
    },
    enableSorting: false,
  },
  {
    accessorKey: "tenant",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tenant" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-xs text-muted-foreground">
        {row.original.tenant}
      </span>
    ),
    filterFn: (row, id, value) =>
      Array.isArray(value) && value.includes(row.getValue<string>(id)),
  },
  {
    accessorKey: "iocs",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="IOCs" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-sm tabular-nums text-muted-foreground">
        {row.original.iocs}
      </span>
    ),
  },
  {
    accessorKey: "alerts",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Alerts" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-sm tabular-nums text-muted-foreground">
        {row.original.alerts}
      </span>
    ),
  },
  {
    id: "aiConfidence",
    accessorFn: (row) => row.aiConfidence,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="AI confidence" />
    ),
    cell: ({ row }) => {
      const pct = Math.round(row.original.aiConfidence * 100)
      const color =
        pct >= 90
          ? "var(--success)"
          : pct >= 70
            ? "var(--info)"
            : "var(--attention)"
      return (
        <span
          className="inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-xs"
          style={{ color }}
        >
          <span
            className="size-1.5 rounded-full"
            style={{ background: color }}
          />
          <span className="font-mono tabular-nums">{pct}%</span>
        </span>
      )
    },
  },
  // ─── Production-aligned additional columns (all hidden by default) ───
  {
    accessorKey: "sourceId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Source ID" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-sm text-muted-foreground">
        {row.original.sourceId}
      </span>
    ),
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => <PriorityPill value={row.original.priority} />,
    filterFn: (row, id, value) =>
      Array.isArray(value) && value.includes(row.getValue<string>(id)),
    sortingFn: (a, b) => {
      const order: Record<Priority, number> = { P1: 4, P2: 3, P3: 2, P4: 1 }
      return order[a.original.priority] - order[b.original.priority]
    },
  },
  {
    accessorKey: "state",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="State" />
    ),
    cell: ({ row }) => <StatePill value={row.original.state} />,
    filterFn: (row, id, value) =>
      Array.isArray(value) && value.includes(row.getValue<string>(id)),
  },
  {
    accessorKey: "disposition",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Disposition" />
    ),
    cell: ({ row }) => <DispositionPill value={row.original.disposition} />,
    filterFn: (row, id, value) =>
      Array.isArray(value) && value.includes(row.getValue<string>(id)),
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-normal">
        {row.original.category}
      </Badge>
    ),
    filterFn: (row, id, value) =>
      Array.isArray(value) && value.includes(row.getValue<string>(id)),
  },
  {
    id: "members",
    accessorFn: (row) => row.members.map((m) => m.name).join(","),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Members" />
    ),
    cell: ({ row }) => <MembersStack members={row.original.members} />,
    enableSorting: false,
  },
  {
    accessorKey: "customer",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm">{row.original.customer}</span>
    ),
    filterFn: (row, id, value) =>
      Array.isArray(value) && value.includes(row.getValue<string>(id)),
  },
  {
    accessorKey: "location",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="size-3" />
        {row.original.location}
      </span>
    ),
    filterFn: (row, id, value) =>
      Array.isArray(value) && value.includes(row.getValue<string>(id)),
  },
  {
    id: "openedBy",
    accessorFn: (row) => row.openedBy.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Opened by" />
    ),
    cell: ({ row }) => <UserCell user={row.original.openedBy} size="sm" />,
  },
  {
    id: "closedBy",
    accessorFn: (row) => row.closedBy?.name ?? "",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Closed by" />
    ),
    cell: ({ row }) =>
      row.original.closedBy ? (
        <UserCell user={row.original.closedBy} size="sm" />
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "artifacts",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Artifacts" />
    ),
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Folder className="size-3" />
        <span className="font-mono tabular-nums">{row.original.artifacts}</span>
      </span>
    ),
  },
  {
    accessorKey: "s3Score",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="S3 Score" />
    ),
    cell: ({ row }) => {
      const v = row.original.s3Score
      const color =
        v >= 90
          ? "var(--destructive)"
          : v >= 70
            ? "var(--attention)"
            : v >= 50
              ? "var(--info)"
              : "var(--success)"
      return (
        <div className="flex items-center gap-2">
          <div className="relative h-1.5 w-12 overflow-hidden rounded-full bg-muted">
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${v}%`, background: color }}
            />
          </div>
          <span
            className="font-mono text-sm font-medium tabular-nums"
            style={{ color }}
          >
            {v}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Start date" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">
        {row.original.startDate}
      </span>
    ),
  },
  {
    accessorKey: "updateDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Update date" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">
        {row.original.updateDate}
      </span>
    ),
  },
  {
    accessorKey: "closeDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Close date" />
    ),
    cell: ({ row }) =>
      row.original.closeDate ? (
        <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">
          {row.original.closeDate}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "detectionDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Detection date" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">
        {row.original.detectionDate}
      </span>
    ),
  },
  {
    accessorKey: "escalationDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Escalation date" />
    ),
    cell: ({ row }) =>
      row.original.escalationDate ? (
        <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">
          {row.original.escalationDate}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "riskMitigationDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Risk mitigation" />
    ),
    cell: ({ row }) =>
      row.original.riskMitigationDate ? (
        <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">
          {row.original.riskMitigationDate}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      ),
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={(e) => e.stopPropagation()}
            aria-label="Open menu"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem>Open detail</DropdownMenuItem>
          <DropdownMenuItem>Run playbook</DropdownMenuItem>
          <DropdownMenuItem>Reassign</DropdownMenuItem>
          <DropdownMenuItem>Resolve</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
]
