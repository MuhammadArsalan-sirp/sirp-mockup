import { useMemo, useState } from "react"
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Loader2,
  MoreHorizontal,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Target,
} from "lucide-react"
import { useNavigate } from "react-router"
import type { Table } from "@tanstack/react-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type {
  Incident,
  IncidentState,
  IncidentStatus,
  Priority,
  Severity,
} from "@/data/incidents"
import type { GroupByField, ListField, ListViewConfig } from "./incidents-view-types"
import { LIST_FIELD_ORDER, LIST_FIELD_WIDTHS } from "./incidents-view-types"

// ─── Tone maps ────────────────────────────────────────────────────────────────

const sevTone: Record<Severity, string> = {
  critical: "var(--destructive)",
  high: "var(--attention)",
  medium: "var(--info)",
  low: "var(--muted-foreground)",
}
const sevShort: Record<Severity, string> = {
  critical: "SEV1",
  high: "SEV2",
  medium: "SEV3",
  low: "SEV4",
}
const priTone: Record<Priority, string> = {
  P1: "var(--destructive)",
  P2: "var(--attention)",
  P3: "var(--info)",
  P4: "var(--muted-foreground)",
}
const statusMeta: Record<IncidentStatus, { label: string; dot: string }> = {
  open: { label: "Open", dot: "var(--muted-foreground)" },
  investigating: { label: "Investigating", dot: "var(--chart-2)" },
  "in-progress": { label: "In Progress", dot: "var(--chart-2)" },
  waiting: { label: "Waiting", dot: "var(--attention)" },
  resolved: { label: "Resolved", dot: "var(--success)" },
  closed: { label: "Closed", dot: "var(--success)" },
}
const stageMeta: Record<IncidentState, { label: string; color: string; Icon: React.ElementType }> = {
  triage: { label: "Triage", color: "var(--muted-foreground)", Icon: Target },
  investigating: { label: "Investigating", color: "var(--chart-2)", Icon: Search },
  containment: { label: "Containment", color: "var(--attention)", Icon: Shield },
  eradication: { label: "Eradication", color: "var(--attention)", Icon: ShieldAlert },
  recovery: { label: "Recovery", color: "var(--info)", Icon: Loader2 },
  mitigated: { label: "Mitigated", color: "var(--success)", Icon: ShieldCheck },
  closed: { label: "Closed", color: "var(--muted-foreground)", Icon: CheckCircle2 },
}

// ─── Record type (replaces the removed tabs) ──────────────────────────────────

const recordTypes = ["Alert", "Case", "Incident"] as const
export function getRecordType(id: string): "Alert" | "Case" | "Incident" {
  const n = parseInt(id.replace(/\D/g, ""), 10)
  return recordTypes[n % 3]
}

// ─── Shared grouping helpers (also used by board) ─────────────────────────────

export function getGroupKey(inc: Incident, groupBy: GroupByField): string {
  switch (groupBy) {
    case "recordType": return getRecordType(inc.id)
    case "status": return inc.status
    case "severity": return inc.severity
    case "priority": return inc.priority
    case "state": return inc.state
    case "source": return inc.source.label
    case "category": return inc.category
    case "assignee": return inc.assignee?.name ?? "Unassigned"
    default: return "__all__"
  }
}

export type GroupMeta = { key: string; label: string; dot?: string; color?: string }

export function getGroupMeta(groupBy: GroupByField, key: string): GroupMeta {
  if (groupBy === "recordType") return { key, label: key }
  if (groupBy === "status") {
    const m = statusMeta[key as IncidentStatus]
    return { key, label: m?.label ?? key, dot: m?.dot }
  }
  if (groupBy === "severity")
    return { key, label: key.charAt(0).toUpperCase() + key.slice(1), color: sevTone[key as Severity] }
  if (groupBy === "priority")
    return { key, label: key, color: priTone[key as Priority] }
  if (groupBy === "state") {
    const m = stageMeta[key as IncidentState]
    return { key, label: m?.label ?? key, color: m?.color }
  }
  return { key, label: key }
}

export function getGroupOrder(groupBy: GroupByField): string[] {
  switch (groupBy) {
    case "recordType": return ["Alert", "Case", "Incident"]
    case "status": return ["open", "investigating", "in-progress", "waiting", "resolved", "closed"]
    case "severity": return ["critical", "high", "medium", "low"]
    case "priority": return ["P1", "P2", "P3", "P4"]
    case "state": return ["triage", "investigating", "containment", "eradication", "recovery", "mitigated", "closed"]
    default: return []
  }
}

export function buildGroups(
  rows: Incident[],
  groupBy: GroupByField,
  showEmpty: boolean
): { meta: GroupMeta; rows: Incident[] }[] {
  const fixedOrder = getGroupOrder(groupBy)
  const map = new Map<string, Incident[]>()
  rows.forEach((inc) => {
    const key = getGroupKey(inc, groupBy)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(inc)
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
    (f) => f === "title" || collapsedFields.includes(f)
  )
  const hasAssignee = collapsedFields.includes("assignee")
  return [
    "16px",
    ...orderedVisible.map((f) => LIST_FIELD_WIDTHS[f]),
    ...(hasAssignee ? [] : ["1px", "24px"]),
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

function renderCell(field: ListField, inc: Incident): React.ReactNode {
  switch (field) {
    case "id":
      return <span className="truncate font-mono text-xs text-muted-foreground">#{inc.id}</span>
    case "type":
      return (
        <span className="flex items-center">
          <span className="inline-flex h-5 w-full items-center justify-center rounded-full border text-[11px] font-medium text-muted-foreground">
            {getRecordType(inc.id)}
          </span>
        </span>
      )
    case "title":
      return <span className="min-w-0 truncate font-medium">{inc.title}</span>
    case "severity": {
      const color = sevTone[inc.severity]
      return (
        <span
          className="inline-flex h-5 w-full items-center justify-center rounded font-mono text-[11px] font-semibold"
          style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}
        >
          {sevShort[inc.severity]}
        </span>
      )
    }
    case "priority": {
      const color = priTone[inc.priority]
      return (
        <span
          className="inline-flex h-5 w-full items-center justify-center rounded font-mono text-[11px] font-semibold"
          style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}
        >
          {inc.priority}
        </span>
      )
    }
    case "status": {
      const m = statusMeta[inc.status]
      return (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-1.5 shrink-0 rounded-full" style={{ background: m.dot }} />
          {m.label}
        </span>
      )
    }
    case "state": {
      const m = stageMeta[inc.state]
      return <span className="truncate text-xs" style={{ color: m.color }}>{m.label}</span>
    }
    case "source":
      return <span className="truncate text-xs text-muted-foreground">{inc.source.label}</span>
    case "category":
      return <span className="truncate text-xs text-muted-foreground">{inc.category}</span>
    case "assignee":
      return inc.assignee ? (
        <Avatar title={inc.assignee.name} className="size-6 shrink-0">
          <AvatarImage src={inc.assignee.photo} alt={inc.assignee.name} />
          <AvatarFallback className={cn("bg-linear-to-br text-[10px] font-semibold text-white", inc.assignee.gradient)}>
            {inc.assignee.initials}
          </AvatarFallback>
        </Avatar>
      ) : (
        <span className="size-6 rounded-full bg-muted" title="Unassigned" />
      )
    case "created":
      return <span className="text-right text-xs text-muted-foreground">{inc.created}</span>
    case "updated":
      return <span className="text-right text-xs text-muted-foreground">{inc.updated}</span>
    case "artifacts":
      return <span className="text-xs text-muted-foreground"><span className="font-mono">{inc.artifacts}</span> art.</span>
    case "iocs":
      return <span className="font-mono text-xs text-muted-foreground">{inc.iocs}</span>
    case "sla": {
      const color =
        inc.sla.tone === "met" ? "var(--muted-foreground)"
        : inc.sla.tone === "ok" ? "var(--success)"
        : inc.sla.tone === "warn" ? "var(--attention)"
        : "var(--destructive)"
      return <span className="text-xs font-medium tabular-nums" style={{ color }}>{inc.sla.label}</span>
    }
    case "risk": {
      const color =
        inc.risk >= 90 ? "var(--destructive)"
        : inc.risk >= 70 ? "var(--attention)"
        : inc.risk >= 50 ? "var(--info)"
        : "var(--success)"
      return <span className="font-mono text-xs font-medium" style={{ color }}>{inc.risk}</span>
    }
    case "tags":
      return (
        <span className="truncate text-xs text-muted-foreground">
          {inc.tags.slice(0, 2).join(", ")}{inc.tags.length > 2 && ` +${inc.tags.length - 2}`}
        </span>
      )
    case "tenant":
      return <span className="truncate text-xs text-muted-foreground">{inc.tenant}</span>
  }
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function FeedRow({
  inc,
  gridTemplate,
  visibleFields,
}: {
  inc: Incident
  gridTemplate: string
  visibleFields: ListField[]
}) {
  const navigate = useNavigate()
  const hasAssignee = visibleFields.includes("assignee")

  return (
    <div
      className="group grid cursor-pointer items-center gap-x-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted/40"
      style={{ gridTemplateColumns: gridTemplate }}
      onClick={() => navigate(`/incidents/${inc.id}`)}
    >
      <CellSelect />
      {LIST_FIELD_ORDER.filter((f) => f === "title" || visibleFields.includes(f)).map((f) => (
        <span key={f} className="min-w-0" onClick={f === "severity" || f === "priority" ? (e) => e.stopPropagation() : undefined}>
          {renderCell(f, inc)}
        </span>
      ))}
      {!hasAssignee && (
        <>
          <span className="h-3 self-center bg-border" />
          {renderCell("assignee", inc)}
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
            <DropdownMenuItem>Run playbook</DropdownMenuItem>
            <DropdownMenuItem>Reassign</DropdownMenuItem>
            <DropdownMenuItem>Resolve</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </span>
    </div>
  )
}

// ─── Sub-group (inner group) ──────────────────────────────────────────────────

const ROWS_INITIALLY = 10

function SubGroup({
  meta,
  rows,
  gridTemplate,
  visibleFields,
}: {
  meta: GroupMeta
  rows: Incident[]
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
          {visible.map((inc) => (
            <FeedRow key={inc.id} inc={inc} gridTemplate={gridTemplate} visibleFields={visibleFields} />
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

// ─── Group (outer group) ──────────────────────────────────────────────────────

function FeedGroup({
  meta,
  rows,
  gridTemplate,
  visibleFields,
  subGroupBy,
  showEmptyGroups,
}: {
  meta: GroupMeta
  rows: Incident[]
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
              {visible.map((inc) => (
                <FeedRow key={inc.id} inc={inc} gridTemplate={gridTemplate} visibleFields={visibleFields} />
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

function sortIncidents(rows: Incident[], orderBy: ListViewConfig["orderBy"], dir: "asc" | "desc"): Incident[] {
  const mul = dir === "asc" ? 1 : -1
  const sev = (v: Severity) => ({ critical: 4, high: 3, medium: 2, low: 1 })[v]
  const pri = (v: Priority) => ({ P1: 4, P2: 3, P3: 2, P4: 1 })[v]
  return [...rows].sort((a, b) => {
    switch (orderBy) {
      case "severity": return mul * (sev(a.severity) - sev(b.severity))
      case "priority": return mul * (pri(a.priority) - pri(b.priority))
      case "risk": return mul * (a.risk - b.risk)
      case "sla": return mul * (a.sla.pct - b.sla.pct)
      default: return 0
    }
  })
}

// ─── Main export ──────────────────────────────────────────────────────────────

type Props = { table: Table<Incident>; config: ListViewConfig }

export function IncidentsFeed({ table, config }: Props) {
  const { groupBy, subGroupBy, orderBy, orderDir, showEmptyGroups, collapsedFields } = config

  const allRows = useMemo(() => {
    const rows = table.getFilteredRowModel().rows.map((r) => r.original)
    return sortIncidents(rows, orderBy, orderDir)
  }, [table, orderBy, orderDir]) // eslint-disable-line react-hooks/exhaustive-deps

  const gridTemplate = useMemo(() => buildGridTemplate(collapsedFields), [collapsedFields])

  if (!allRows.length)
    return (
      <div className="rounded-md border py-16 text-center text-sm text-muted-foreground">
        No incidents match the current filters.
      </div>
    )

  if (groupBy === "none") {
    return (
      <div className="overflow-hidden rounded-lg border divide-y">
        {allRows.map((inc) => (
          <FeedRow key={inc.id} inc={inc} gridTemplate={gridTemplate} visibleFields={collapsedFields} />
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
