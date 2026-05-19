import { useMemo, useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Cloud,
  Cpu,
  Database,
  Monitor,
  MoreHorizontal,
  Network,
  Server,
  Share2,
  User,
} from "lucide-react"
import { useNavigate } from "react-router"
import type { Table } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type {
  Entity,
  EntityCriticality,
  EntityStatus,
  EntityType,
} from "@/data/entities"
import type { BoardField, BoardViewConfig, GroupByField, OrderByField } from "./entities-view-types"
import { buildGroups, type GroupMeta } from "./entities-feed"

// ─── Tone / meta maps ─────────────────────────────────────────────────────────

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

const typeIcons: Record<EntityType, React.ElementType> = {
  Application: Monitor,
  Host: Server,
  User,
  Service: Cpu,
  Database,
  "Network Device": Network,
  "Cloud Resource": Cloud,
}

// ─── Sort helper ──────────────────────────────────────────────────────────────

function sortItems(rows: Entity[], orderBy: OrderByField, dir: "asc" | "desc"): Entity[] {
  const mul = dir === "asc" ? 1 : -1
  const crit = (v: EntityCriticality) => ({ critical: 4, high: 3, medium: 2, low: 1 })[v]
  return [...rows].sort((a, b) => {
    switch (orderBy) {
      case "s3Score": return mul * (a.s3Score - b.s3Score)
      case "criticality": return mul * (crit(a.criticality) - crit(b.criticality))
      case "relationships": return mul * (a.relationships - b.relationships)
      case "name": return mul * a.name.localeCompare(b.name)
      default: return 0
    }
  })
}

// ─── S3 Score ring ────────────────────────────────────────────────────────────

function S3Ring({ value }: { value: number }) {
  const size = 38
  const sw = 3.5
  const r = (size - sw) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - value / 100)
  const color =
    value >= 90 ? "var(--destructive)"
    : value >= 70 ? "var(--attention)"
    : value >= 50 ? "var(--info)"
    : "var(--muted-foreground)"

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 -rotate-90"
      >
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          strokeWidth={sw}
          className="stroke-muted"
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          strokeWidth={sw}
          strokeLinecap="round"
          style={{
            stroke: color,
            strokeDasharray: circ,
            strokeDashoffset: offset,
            transition: "stroke-dashoffset 0.4s ease",
          }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span
          className="font-mono text-[9px] font-bold tabular-nums leading-none"
          style={{ color }}
        >
          {value}
        </span>
      </div>
    </div>
  )
}

// ─── Card field renderer ──────────────────────────────────────────────────────

function renderCardField(field: BoardField, entity: Entity): React.ReactNode {
  switch (field) {
    case "type": {
      const Icon = typeIcons[entity.type]
      return (
        <Badge key="type" variant="secondary" className="gap-1 text-[10px] font-normal">
          <Icon className="size-3" />
          {entity.type}
        </Badge>
      )
    }
    case "criticality": {
      const color = critTone[entity.criticality]
      return (
        <span
          key="criticality"
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize"
          style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}
        >
          <span className="size-1.5 rounded-full" style={{ background: color }} />
          {entity.criticality}
        </span>
      )
    }
    case "status": {
      const m = statusMeta[entity.status]
      return (
        <span key="status" className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="size-1.5 shrink-0 rounded-full" style={{ background: m.dot }} />
          {m.label}
        </span>
      )
    }
    case "s3Score":
      return null
    case "relationships":
      return (
        <span key="relationships" className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
          <Share2 className="size-3 shrink-0" />
          <span className="font-mono tabular-nums">{entity.relationships}</span>
        </span>
      )
    case "owner":
      return entity.owner ? (
        <span
          key="owner"
          title={entity.owner.name}
          className={`grid size-6 place-items-center rounded-full bg-gradient-to-br ${entity.owner.gradient} text-[10px] font-semibold text-white`}
        >
          {entity.owner.initials}
        </span>
      ) : (
        <span key="owner" className="size-6 rounded-full bg-muted" title="Unassigned" />
      )
    case "department":
      return (
        <Badge key="department" variant="outline" className="text-[10px] font-normal">
          {entity.department}
        </Badge>
      )
    case "tags":
      return entity.tags.length > 0 ? (
        <span key="tags" className="text-[10px] text-muted-foreground">
          {entity.tags.slice(0, 2).join(", ")}
          {entity.tags.length > 2 && ` +${entity.tags.length - 2}`}
        </span>
      ) : null
    case "updated":
      return (
        <span key="updated" className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="size-3 shrink-0" />
          {entity.updated}
        </span>
      )
    case "created":
      return (
        <span key="created" className="text-[10px] text-muted-foreground">
          {entity.created}
        </span>
      )
  }
}

// ─── Entity card ──────────────────────────────────────────────────────────────

function EntityCard({
  entity,
  cardFields,
  onOpen,
}: {
  entity: Entity
  cardFields: BoardField[]
  onOpen: () => void
}) {
  const TypeIcon = typeIcons[entity.type]
  const critColor = critTone[entity.criticality]
  const showS3Ring = cardFields.includes("s3Score")

  const badgeFields = cardFields.filter(
    (f) => f !== "s3Score" && !["owner", "updated", "created"].includes(f),
  )
  const footerFields = cardFields.filter((f) => ["owner", "updated", "created"].includes(f))

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen() }
      }}
      className="group cursor-pointer overflow-hidden rounded-xl border bg-card p-3.5 text-left shadow-sm transition-all hover:border-foreground/20 hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-lg"
            style={{ background: `color-mix(in srgb, ${critColor} 12%, transparent)` }}
          >
            <TypeIcon className="size-4" style={{ color: critColor }} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-snug">{entity.name}</p>
            <p className="font-mono text-[10px] leading-tight text-muted-foreground">{entity.id}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {showS3Ring && <S3Ring value={entity.s3Score} />}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem>Open detail</DropdownMenuItem>
              <DropdownMenuItem>Edit entity</DropdownMenuItem>
              <DropdownMenuItem>View relationships</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Badge fields */}
      {badgeFields.length > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {badgeFields.map((f) => renderCardField(f, entity))}
        </div>
      )}

      {/* Footer */}
      {footerFields.length > 0 && (
        <div className="mt-3 flex items-center justify-between border-t pt-2.5">
          <div className="flex items-center gap-2">
            {footerFields.filter((f) => f !== "owner").map((f) => renderCardField(f, entity))}
          </div>
          {footerFields.includes("owner") && renderCardField("owner", entity)}
        </div>
      )}
    </div>
  )
}

// ─── Card grid wrapper ────────────────────────────────────────────────────────

function CardGrid({
  rows,
  cardFields,
  columns,
  onOpen,
}: {
  rows: Entity[]
  cardFields: BoardField[]
  columns: 2 | 3 | 4
  onOpen: (id: string) => void
}) {
  if (rows.length === 0)
    return (
      <div className="grid h-20 place-items-center rounded-md border border-dashed text-xs text-muted-foreground">
        No entities
      </div>
    )
  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {rows.map((entity) => (
        <EntityCard
          key={entity.id}
          entity={entity}
          cardFields={cardFields}
          onOpen={() => onOpen(entity.id)}
        />
      ))}
    </div>
  )
}

// ─── Sub-group ────────────────────────────────────────────────────────────────

function BoardSubGroup({
  meta,
  rows,
  cardFields,
  columns,
  onOpen,
}: {
  meta: GroupMeta
  rows: Entity[]
  cardFields: BoardField[]
  columns: 2 | 3 | 4
  onOpen: (id: string) => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const accent = meta.dot ?? meta.color ?? "var(--border)"

  return (
    <div
      className="border-l-2"
      style={{ borderColor: `color-mix(in srgb, ${accent} 60%, transparent)` }}
    >
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center gap-2 px-3 py-1.5 transition-colors hover:bg-muted/30"
      >
        <ChevronDown
          className="size-3 shrink-0 text-muted-foreground/50 transition-transform"
          style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)" }}
        />
        {(meta.dot || meta.color) && (
          <span className="size-1.5 shrink-0 rounded-full" style={{ background: accent }} />
        )}
        <span className="text-xs font-semibold text-foreground/70">{meta.label}</span>
        <span className="rounded-full bg-muted px-1.5 py-px font-mono text-[10px] tabular-nums text-muted-foreground">
          {rows.length}
        </span>
      </button>

      {!collapsed && (
        <div className="px-3 pb-3 pt-1">
          <CardGrid rows={rows} cardFields={cardFields} columns={columns} onOpen={onOpen} />
        </div>
      )}
    </div>
  )
}

// ─── Group ────────────────────────────────────────────────────────────────────

function BoardGroup({
  meta,
  rows,
  cardFields,
  columns,
  subGroupBy,
  showEmptyGroups,
  onOpen,
}: {
  meta: GroupMeta
  rows: Entity[]
  cardFields: BoardField[]
  columns: 2 | 3 | 4
  subGroupBy: GroupByField
  showEmptyGroups: boolean
  onOpen: (id: string) => void
}) {
  const [open, setOpen] = useState(true)

  const subGroups = useMemo(() => {
    if (subGroupBy === "none") return null
    return buildGroups(rows, subGroupBy, showEmptyGroups)
  }, [rows, subGroupBy, showEmptyGroups])

  return (
    <div className="overflow-hidden rounded-lg border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 bg-muted/30 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted/50"
      >
        {open
          ? <ChevronDown className="size-3.5 text-muted-foreground" />
          : <ChevronRight className="size-3.5 text-muted-foreground" />
        }
        {(meta.dot || meta.color) && (
          <span className="size-2 rounded-full" style={{ background: meta.dot ?? meta.color }} />
        )}
        <span>{meta.label}</span>
        <span className="font-mono text-xs font-normal text-muted-foreground">
          {rows.length.toLocaleString()}
        </span>
      </button>

      {open && (
        <div className="p-4">
          {subGroups ? (
            <div className="space-y-3">
              {subGroups.map((sg) => (
                <BoardSubGroup
                  key={sg.meta.key}
                  meta={sg.meta}
                  rows={sg.rows}
                  cardFields={cardFields}
                  columns={columns}
                  onOpen={onOpen}
                />
              ))}
            </div>
          ) : (
            <CardGrid rows={rows} cardFields={cardFields} columns={columns} onOpen={onOpen} />
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

type Props = {
  table: Table<Entity>
  config: BoardViewConfig
}

export function EntitiesBoard({ table, config }: Props) {
  const navigate = useNavigate()
  const { groupBy, subGroupBy, cardFields, showEmptyGroups, columns, orderBy, orderDir } = config

  const allRows = useMemo(() => {
    const rows = table.getFilteredRowModel().rows.map((r) => r.original)
    return sortItems(rows, orderBy, orderDir)
  }, [table, orderBy, orderDir]) // eslint-disable-line react-hooks/exhaustive-deps

  const onOpen = (id: string) => navigate(`/entities/${id}`)

  if (!allRows.length)
    return (
      <div className="rounded-md border py-16 text-center text-sm text-muted-foreground">
        No entities match the current filters.
      </div>
    )

  if (groupBy === "none") {
    return (
      <CardGrid rows={allRows} cardFields={cardFields} columns={columns} onOpen={onOpen} />
    )
  }

  const groups = buildGroups(allRows, groupBy, showEmptyGroups)

  return (
    <div className="space-y-3">
      {groups.map((g) => (
        <BoardGroup
          key={g.meta.key}
          meta={g.meta}
          rows={g.rows}
          cardFields={cardFields}
          columns={columns}
          subGroupBy={subGroupBy}
          showEmptyGroups={showEmptyGroups}
          onOpen={onOpen}
        />
      ))}
    </div>
  )
}
