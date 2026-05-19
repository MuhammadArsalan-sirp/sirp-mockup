import { useMemo, useState } from "react"
import {
  Briefcase,
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
  User,
} from "lucide-react"
import { useNavigate } from "react-router"
import type { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type {
  Entity,
  EntityCriticality,
  EntityStatus,
  EntityType,
} from "@/data/entities"
import type { GroupByField, ListField, ListViewConfig, OrderByField } from "./entities-view-types"
import { LIST_FIELD_ORDER, LIST_FIELD_WIDTHS } from "./entities-view-types"

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

// ─── Shared grouping helpers ──────────────────────────────────────────────────

export function getGroupKey(entity: Entity, groupBy: GroupByField): string {
  switch (groupBy) {
    case "type": return entity.type
    case "criticality": return entity.criticality
    case "status": return entity.status
    case "department": return entity.department
    case "owner": return entity.owner?.name ?? "Unassigned"
    default: return "__all__"
  }
}

export type GroupMeta = { key: string; label: string; dot?: string; color?: string }

export function getGroupMeta(groupBy: GroupByField, key: string): GroupMeta {
  if (groupBy === "criticality")
    return { key, label: key.charAt(0).toUpperCase() + key.slice(1), color: critTone[key as EntityCriticality] }
  if (groupBy === "status") {
    const m = statusMeta[key as EntityStatus]
    return { key, label: m?.label ?? key, dot: m?.dot }
  }
  return { key, label: key }
}

export function getGroupOrder(groupBy: GroupByField): string[] {
  switch (groupBy) {
    case "type": return ["Application", "Host", "User", "Service", "Database", "Network Device", "Cloud Resource"]
    case "criticality": return ["critical", "high", "medium", "low"]
    case "status": return ["active", "inactive", "decommissioned", "unknown"]
    default: return []
  }
}

export function buildGroups(
  rows: Entity[],
  groupBy: GroupByField,
  showEmpty: boolean,
): { meta: GroupMeta; rows: Entity[] }[] {
  const fixedOrder = getGroupOrder(groupBy)
  const map = new Map<string, Entity[]>()
  rows.forEach((e) => {
    const key = getGroupKey(e, groupBy)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(e)
  })
  const orderedKeys = [
    ...fixedOrder.filter((k) => map.has(k)),
    ...[...map.keys()].filter((k) => !fixedOrder.includes(k)).sort(),
  ]
  const groups = orderedKeys
    .map((key) => ({ meta: getGroupMeta(groupBy, key), rows: map.get(key) ?? [] }))
    .filter((g) => showEmpty || g.rows.length > 0)

  if (showEmpty) {
    fixedOrder.forEach((key) => {
      if (!map.has(key)) groups.push({ meta: getGroupMeta(groupBy, key), rows: [] })
    })
  }
  return groups
}

// ─── Grid template builder ────────────────────────────────────────────────────

function buildGridTemplate(collapsedFields: ListField[]): string {
  const orderedVisible = LIST_FIELD_ORDER.filter(
    (f) => f === "name" || collapsedFields.includes(f),
  )
  const hasOwner = collapsedFields.includes("owner")
  return [
    "16px",
    ...orderedVisible.map((f) => LIST_FIELD_WIDTHS[f]),
    ...(hasOwner ? [] : ["1px", "24px"]),
    "28px",
  ].join(" ")
}

// ─── Cell renderers ───────────────────────────────────────────────────────────

function CellSelect() {
  return (
    <span className="flex justify-center">
      <span className="size-[15px] rounded-[4px] border border-input opacity-0 transition-opacity group-hover:opacity-100" />
    </span>
  )
}

function renderCell(field: ListField, entity: Entity): React.ReactNode {
  switch (field) {
    case "id":
      return <span className="truncate font-mono text-xs text-muted-foreground">#{entity.id}</span>
    case "name":
      return <span className="min-w-0 truncate font-medium">{entity.name}</span>
    case "type": {
      const Icon = typeIcons[entity.type]
      return (
        <span className="flex items-center gap-1.5">
          <Icon className="size-3 shrink-0 text-muted-foreground" />
          <span className="truncate text-xs text-muted-foreground">{entity.type}</span>
        </span>
      )
    }
    case "criticality": {
      const color = critTone[entity.criticality]
      return (
        <span
          className="inline-flex h-5 w-full items-center justify-center rounded font-mono text-[11px] font-semibold capitalize"
          style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}
        >
          {entity.criticality}
        </span>
      )
    }
    case "status": {
      const m = statusMeta[entity.status]
      return (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-1.5 shrink-0 rounded-full" style={{ background: m.dot }} />
          {m.label}
        </span>
      )
    }
    case "owner":
      return entity.owner ? (
        <span
          title={entity.owner.name}
          className={`grid size-6 place-items-center rounded-full bg-gradient-to-br ${entity.owner.gradient} text-[10px] font-semibold text-white`}
        >
          {entity.owner.initials}
        </span>
      ) : (
        <span className="size-6 rounded-full bg-muted" title="Unassigned" />
      )
    case "department":
      return <span className="truncate text-xs text-muted-foreground">{entity.department}</span>
    case "s3Score": {
      const v = entity.s3Score
      const color =
        v >= 90 ? "var(--destructive)"
        : v >= 70 ? "var(--attention)"
        : v >= 50 ? "var(--info)"
        : "var(--muted-foreground)"
      return <span className="font-mono text-xs font-medium tabular-nums" style={{ color }}>{v}</span>
    }
    case "relationships":
      return (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Briefcase className="size-3 shrink-0" />
          <span className="font-mono tabular-nums">{entity.relationships}</span>
        </span>
      )
    case "tags":
      return (
        <span className="truncate text-xs text-muted-foreground">
          {entity.tags.slice(0, 2).join(", ")}{entity.tags.length > 2 && ` +${entity.tags.length - 2}`}
        </span>
      )
    case "updated":
      return <span className="text-right text-xs text-muted-foreground">{entity.updated}</span>
    case "created":
      return <span className="text-right text-xs text-muted-foreground">{entity.created}</span>
  }
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function FeedRow({
  entity,
  gridTemplate,
  visibleFields,
}: {
  entity: Entity
  gridTemplate: string
  visibleFields: ListField[]
}) {
  const navigate = useNavigate()
  const hasOwner = visibleFields.includes("owner")

  return (
    <div
      className="group grid cursor-pointer items-center gap-x-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted/40"
      style={{ gridTemplateColumns: gridTemplate }}
      onClick={() => navigate(`/entities/${entity.id}`)}
    >
      <CellSelect />
      {LIST_FIELD_ORDER.filter((f) => f === "name" || visibleFields.includes(f)).map((f) => (
        <span key={f} className="min-w-0">
          {renderCell(f, entity)}
        </span>
      ))}
      {!hasOwner && (
        <>
          <span className="h-3 self-center bg-border" />
          {renderCell("owner", entity)}
        </>
      )}
      <span className="flex justify-end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-6 opacity-0 transition-opacity group-hover:opacity-100" aria-label="Open menu">
              <MoreHorizontal className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem>Open detail</DropdownMenuItem>
            <DropdownMenuItem>Edit entity</DropdownMenuItem>
            <DropdownMenuItem>View relationships</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </span>
    </div>
  )
}

// ─── Sub-group ────────────────────────────────────────────────────────────────

const ROWS_INITIALLY = 10

function SubGroup({
  meta,
  rows,
  gridTemplate,
  visibleFields,
}: {
  meta: GroupMeta
  rows: Entity[]
  gridTemplate: string
  visibleFields: ListField[]
}) {
  const [open, setOpen] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? rows : rows.slice(0, ROWS_INITIALLY)
  const accent = meta.dot ?? meta.color ?? "var(--border)"

  return (
    <div
      className="ml-1 border-l-2"
      style={{ borderColor: `color-mix(in srgb, ${accent} 60%, transparent)` }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 px-3 py-1.5 transition-colors hover:bg-muted/30"
      >
        <ChevronDown
          className="size-3 shrink-0 text-muted-foreground/50 transition-transform"
          style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
        />
        {(meta.dot || meta.color) && (
          <span className="size-1.5 shrink-0 rounded-full" style={{ background: accent }} />
        )}
        <span className="text-xs font-semibold text-foreground/70">{meta.label}</span>
        <span className="rounded-full bg-muted px-1.5 py-px font-mono text-[10px] tabular-nums text-muted-foreground">
          {rows.length}
        </span>
      </button>

      {open && (
        <>
          {visible.map((entity) => (
            <FeedRow key={entity.id} entity={entity} gridTemplate={gridTemplate} visibleFields={visibleFields} />
          ))}
          {!showAll && rows.length > ROWS_INITIALLY && (
            <button
              type="button"
              className="w-full px-4 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
              onClick={() => setShowAll(true)}
            >
              Show {rows.length - ROWS_INITIALLY} more…
            </button>
          )}
        </>
      )}
    </div>
  )
}

// ─── Group ────────────────────────────────────────────────────────────────────

function FeedGroup({
  meta,
  rows,
  gridTemplate,
  visibleFields,
  subGroupBy,
  showEmptyGroups,
}: {
  meta: GroupMeta
  rows: Entity[]
  gridTemplate: string
  visibleFields: ListField[]
  subGroupBy: GroupByField
  showEmptyGroups: boolean
}) {
  const [open, setOpen] = useState(true)
  const [showAll, setShowAll] = useState(false)

  const subGroups = useMemo(() => {
    if (subGroupBy === "none") return null
    return buildGroups(rows, subGroupBy, showEmptyGroups)
  }, [rows, subGroupBy, showEmptyGroups])

  const visible = showAll ? rows : rows.slice(0, ROWS_INITIALLY)

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
        <div className="divide-y">
          {subGroups ? (
            subGroups.map((sg) => (
              <SubGroup
                key={sg.meta.key}
                meta={sg.meta}
                rows={sg.rows}
                gridTemplate={gridTemplate}
                visibleFields={visibleFields}
              />
            ))
          ) : (
            <>
              {visible.map((entity) => (
                <FeedRow key={entity.id} entity={entity} gridTemplate={gridTemplate} visibleFields={visibleFields} />
              ))}
              {!showAll && rows.length > ROWS_INITIALLY && (
                <button
                  type="button"
                  className="w-full px-4 py-2 text-center text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                  onClick={() => setShowAll(true)}
                >
                  Show {rows.length - ROWS_INITIALLY} more
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
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

// ─── Main export ──────────────────────────────────────────────────────────────

type Props = { table: Table<Entity>; config: ListViewConfig }

export function EntitiesFeed({ table, config }: Props) {
  const { groupBy, subGroupBy, orderBy, orderDir, showEmptyGroups, collapsedFields } = config

  const allRows = useMemo(() => {
    const rows = table.getFilteredRowModel().rows.map((r) => r.original)
    return sortItems(rows, orderBy, orderDir)
  }, [table, orderBy, orderDir]) // eslint-disable-line react-hooks/exhaustive-deps

  const gridTemplate = useMemo(() => buildGridTemplate(collapsedFields), [collapsedFields])

  if (!allRows.length)
    return (
      <div className="rounded-md border py-16 text-center text-sm text-muted-foreground">
        No entities match the current filters.
      </div>
    )

  if (groupBy === "none") {
    return (
      <div className="overflow-hidden rounded-lg border divide-y">
        {allRows.map((entity) => (
          <FeedRow key={entity.id} entity={entity} gridTemplate={gridTemplate} visibleFields={collapsedFields} />
        ))}
      </div>
    )
  }

  const groups = buildGroups(allRows, groupBy, showEmptyGroups)

  return (
    <div className="space-y-3">
      {groups.map((g) => (
        <FeedGroup
          key={g.meta.key}
          meta={g.meta}
          rows={g.rows}
          gridTemplate={gridTemplate}
          visibleFields={collapsedFields}
          subGroupBy={subGroupBy}
          showEmptyGroups={showEmptyGroups}
        />
      ))}
    </div>
  )
}
