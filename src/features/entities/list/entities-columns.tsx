import {
  Cloud,
  Cpu,
  Database,
  Monitor,
  MoreHorizontal,
  Network,
  Server,
  User,
} from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/shared/data-table"
import type {
  Entity,
  EntityCriticality,
  EntityStatus,
  EntityType,
  UserRef,
} from "@/data/entities"

// ─── Tone maps ────────────────────────────────────────────────────────────────

const critTone: Record<EntityCriticality, string> = {
  critical: "var(--destructive)",
  high: "var(--attention)",
  medium: "var(--info)",
  low: "var(--muted-foreground)",
}

const statusMeta: Record<EntityStatus, { label: string; dot: string }> = {
  active: { label: "Active", dot: "var(--success)" },
  inactive: { label: "Inactive", dot: "var(--muted-foreground)" },
  decommissioned: { label: "Decommissioned", dot: "var(--muted-foreground)" },
  unknown: { label: "Unknown", dot: "var(--attention)" },
}

export const typeIcons: Record<EntityType, React.ElementType> = {
  Application: Monitor,
  Host: Server,
  User,
  Service: Cpu,
  Database,
  "Network Device": Network,
  "Cloud Resource": Cloud,
}

// ─── Pill components ──────────────────────────────────────────────────────────

function CriticalityPill({ value }: { value: EntityCriticality }) {
  const color = critTone[value]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize"
      style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}
    >
      <span className="size-1.5 rounded-full" style={{ background: color }} />
      {value}
    </span>
  )
}

function StatusPill({ value }: { value: EntityStatus }) {
  const m = statusMeta[value]
  return (
    <Badge variant="outline" className="capitalize">
      <span className="mr-1.5 size-1.5 rounded-full" style={{ background: m.dot }} />
      {m.label}
    </Badge>
  )
}

function TypeCell({ value }: { value: EntityType }) {
  const Icon = typeIcons[value]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs">
      <Icon className="size-3 shrink-0 text-muted-foreground" />
      {value}
    </span>
  )
}

function UserCell({ user }: { user: UserRef | null }) {
  if (!user) return <span className="text-sm italic text-muted-foreground">Unassigned</span>
  return (
    <div className="inline-flex items-center gap-2.5">
      <span
        className={`grid size-8 place-items-center rounded-full bg-gradient-to-br ${user.gradient} text-xs font-semibold text-white`}
      >
        {user.initials}
      </span>
      <span className="text-sm font-medium">{user.name}</span>
    </div>
  )
}

// ─── Column labels (for view settings) ────────────────────────────────────────

export const entityColumnLabels: Record<string, string> = {
  id: "ID",
  name: "Entity",
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

// ─── Column definitions ───────────────────────────────────────────────────────

export const entitiesColumns: ColumnDef<Entity>[] = [
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
      <span className="font-mono text-sm text-muted-foreground">{row.original.id}</span>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Entity" />,
    cell: ({ row }) => (
      <span className="font-medium underline decoration-muted-foreground/30 underline-offset-4 hover:decoration-foreground">
        {row.original.name}
      </span>
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => <TypeCell value={row.original.type} />,
    filterFn: (row, id, value) =>
      Array.isArray(value) && value.includes(row.getValue<string>(id)),
  },
  {
    accessorKey: "criticality",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Criticality" />,
    cell: ({ row }) => <CriticalityPill value={row.original.criticality} />,
    filterFn: (row, id, value) =>
      Array.isArray(value) && value.includes(row.getValue<string>(id)),
    sortingFn: (a, b) => {
      const order: Record<EntityCriticality, number> = { critical: 4, high: 3, medium: 2, low: 1 }
      return order[a.original.criticality] - order[b.original.criticality]
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => <StatusPill value={row.original.status} />,
    filterFn: (row, id, value) =>
      Array.isArray(value) && value.includes(row.getValue<string>(id)),
  },
  {
    id: "owner",
    accessorFn: (row) => row.owner?.name ?? "__unassigned__",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Owner" />,
    cell: ({ row }) => <UserCell user={row.original.owner} />,
    filterFn: (row, _id, value) => {
      if (!Array.isArray(value)) return true
      const v = row.original.owner?.name ?? "__unassigned__"
      return value.includes(v)
    },
  },
  {
    accessorKey: "department",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.department}</span>
    ),
    filterFn: (row, id, value) =>
      Array.isArray(value) && value.includes(row.getValue<string>(id)),
  },
  {
    accessorKey: "s3Score",
    header: ({ column }) => <DataTableColumnHeader column={column} title="S3 Score" />,
    cell: ({ row }) => {
      const v = row.original.s3Score
      const color =
        v >= 90 ? "var(--destructive)"
        : v >= 70 ? "var(--attention)"
        : v >= 50 ? "var(--info)"
        : "var(--muted-foreground)"
      return (
        <div className="flex items-center gap-2">
          <div className="relative h-1.5 w-12 overflow-hidden rounded-full bg-muted">
            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${v}%`, background: color }} />
          </div>
          <span className="font-mono text-sm font-medium tabular-nums" style={{ color }}>{v}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "relationships",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Relationships" />,
    cell: ({ row }) => (
      <span className="font-mono text-sm tabular-nums text-muted-foreground">
        {row.original.relationships}
      </span>
    ),
  },
  {
    id: "tags",
    accessorFn: (row) => row.tags,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tags" />,
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center gap-1 max-w-[200px]">
        {row.original.tags.slice(0, 2).map((t) => (
          <Badge key={t} variant="secondary" className="rounded font-normal text-xs">{t}</Badge>
        ))}
        {row.original.tags.length > 2 && (
          <span className="text-xs text-muted-foreground">+{row.original.tags.length - 2}</span>
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
    accessorKey: "updated",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
    cell: ({ row }) => (
      <span className="whitespace-nowrap font-mono text-sm tabular-nums text-muted-foreground">
        {row.original.updated}
      </span>
    ),
  },
  {
    accessorKey: "created",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">
        {row.original.created}
      </span>
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
          <DropdownMenuItem>Edit entity</DropdownMenuItem>
          <DropdownMenuItem>View relationships</DropdownMenuItem>
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
