import { useMemo, useState } from "react"
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  Folder,
  Link2,
  Loader2,
  MoreHorizontal,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Target,
} from "lucide-react"
import type { Table } from "@tanstack/react-table"
import { useNavigate } from "react-router"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import type { Incident, IncidentState, IncidentStatus, Priority, Severity } from "@/data/incidents"
import type { BoardField, BoardGroupByField, BoardViewConfig, GroupByField } from "./incidents-view-types"
import { buildGroups, getRecordType, type GroupMeta } from "./incidents-feed"

// ─── Tone maps (card-level) ───────────────────────────────────────────────────

const sevTone: Record<Severity, string> = {
  critical: "var(--destructive)",
  high: "var(--attention)",
  medium: "var(--info)",
  low: "var(--muted-foreground)",
}
const priTone: Record<Priority, string> = {
  P1: "var(--destructive)",
  P2: "var(--attention)",
  P3: "var(--info)",
  P4: "var(--muted-foreground)",
}
const stageTone: Record<IncidentState, string> = {
  triage: "var(--muted-foreground)",
  investigating: "var(--chart-2)",
  containment: "var(--attention)",
  eradication: "var(--attention)",
  recovery: "var(--info)",
  mitigated: "var(--success)",
  closed: "var(--muted-foreground)",
}

// ─── Lane definitions ─────────────────────────────────────────────────────────

type Lane = { key: string; label: string; tone: string; Icon?: React.ElementType }

const LANES_BY_GROUP: Record<BoardGroupByField, Lane[]> = {
  recordType: [
    { key: "Alert", label: "Alert", tone: "var(--info)" },
    { key: "Case", label: "Case", tone: "var(--attention)" },
    { key: "Incident", label: "Incident", tone: "var(--destructive)" },
  ],
  state: [
    { key: "triage", label: "Triage", tone: "var(--muted-foreground)", Icon: Target },
    { key: "investigating", label: "Investigating", tone: "var(--chart-2)", Icon: Search },
    { key: "containment", label: "Containment", tone: "var(--attention)", Icon: Shield },
    { key: "eradication", label: "Eradication", tone: "var(--attention)", Icon: ShieldAlert },
    { key: "recovery", label: "Recovery", tone: "var(--info)", Icon: Loader2 },
    { key: "mitigated", label: "Mitigated", tone: "var(--success)", Icon: ShieldCheck },
    { key: "closed", label: "Closed", tone: "var(--muted-foreground)", Icon: CheckCircle2 },
  ],
  status: [
    { key: "open", label: "Open", tone: "var(--muted-foreground)" },
    { key: "investigating", label: "Investigating", tone: "var(--chart-2)" },
    { key: "in-progress", label: "In Progress", tone: "var(--chart-2)" },
    { key: "waiting", label: "Waiting", tone: "var(--attention)" },
    { key: "resolved", label: "Resolved", tone: "var(--success)" },
    { key: "closed", label: "Closed", tone: "var(--muted-foreground)" },
  ],
  severity: [
    { key: "critical", label: "Critical", tone: "var(--destructive)" },
    { key: "high", label: "High", tone: "var(--attention)" },
    { key: "medium", label: "Medium", tone: "var(--info)" },
    { key: "low", label: "Low", tone: "var(--muted-foreground)" },
  ],
  priority: [
    { key: "P1", label: "P1", tone: "var(--destructive)" },
    { key: "P2", label: "P2", tone: "var(--attention)" },
    { key: "P3", label: "P3", tone: "var(--info)" },
    { key: "P4", label: "P4", tone: "var(--muted-foreground)" },
  ],
  assignee: [], // built dynamically from data
}

function getLaneKey(inc: Incident, groupBy: BoardGroupByField): string {
  switch (groupBy) {
    case "recordType": return getRecordType(inc.id)
    case "state": return inc.state
    case "status": return inc.status
    case "severity": return inc.severity
    case "priority": return inc.priority
    case "assignee": return inc.assignee?.name ?? "Unassigned"
  }
}

// ─── Card field renderers ─────────────────────────────────────────────────────

function renderCardField(field: BoardField, inc: Incident): React.ReactNode {
  switch (field) {
    case "severity": {
      const color = sevTone[inc.severity]
      return (
        <span
          key="severity"
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize"
          style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}
        >
          <span className="size-1.5 rounded-full" style={{ background: color }} />
          {inc.severity}
        </span>
      )
    }
    case "priority": {
      const color = priTone[inc.priority]
      return (
        <Badge key="priority" variant="outline" className="font-mono text-[10px]"
          style={{ borderColor: `color-mix(in srgb, ${color} 35%, transparent)`, color }}>
          {inc.priority}
        </Badge>
      )
    }
    case "category":
      return (
        <Badge key="category" variant="secondary" className="text-[10px] font-normal">
          {inc.category}
        </Badge>
      )
    case "state": {
      const color = stageTone[inc.state]
      return (
        <span
          key="state"
          className="rounded-md border px-1.5 py-0.5 text-[10px]"
          style={{ borderColor: `color-mix(in srgb, ${color} 35%, transparent)`, color }}
        >
          {inc.state}
        </span>
      )
    }
    case "source":
      return (
        <Badge key="source" variant="outline" className="text-[10px] font-normal">
          {inc.source.label}
        </Badge>
      )
    case "updated":
      return (
        <span key="updated" className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3" />
          {inc.updated}
        </span>
      )
    case "created":
      return (
        <span key="created" className="text-xs text-muted-foreground">
          {inc.created}
        </span>
      )
    case "artifacts":
      return (
        <span key="artifacts" className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Folder className="size-3" />
          {inc.artifacts}
        </span>
      )
    case "iocs":
      return (
        <span key="iocs" className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Link2 className="size-3" />
          {inc.iocs}
        </span>
      )
    case "sla": {
      const color =
        inc.sla.tone === "met" ? "var(--muted-foreground)"
        : inc.sla.tone === "ok" ? "var(--success)"
        : inc.sla.tone === "warn" ? "var(--attention)"
        : "var(--destructive)"
      return (
        <span key="sla" className="text-xs font-medium tabular-nums" style={{ color }}>
          {inc.sla.label}
        </span>
      )
    }
    case "risk": {
      const color =
        inc.risk >= 90 ? "var(--destructive)"
        : inc.risk >= 70 ? "var(--attention)"
        : inc.risk >= 50 ? "var(--info)"
        : "var(--success)"
      return (
        <span key="risk" className="font-mono text-xs font-medium" style={{ color }}>
          Risk {inc.risk}
        </span>
      )
    }
    case "assignee":
      return inc.assignee ? (
        <Avatar key="assignee" title={inc.assignee.name} className="size-6 shrink-0">
          <AvatarImage src={inc.assignee.photo} alt={inc.assignee.name} />
          <AvatarFallback className={cn("bg-linear-to-br text-[9px] font-semibold text-white", inc.assignee.gradient)}>
            {inc.assignee.initials}
          </AvatarFallback>
        </Avatar>
      ) : (
        <span key="assignee" className="text-[10px] italic text-muted-foreground">
          Unassigned
        </span>
      )
  }
}

// ─── Board card ───────────────────────────────────────────────────────────────

function BoardCard({
  incident,
  cardFields,
  onOpen,
}: {
  incident: Incident
  cardFields: BoardField[]
  onOpen: () => void
}) {
  // Separate "footer" fields (assignee, updated, created) from badge fields
  const badgeFields = cardFields.filter(
    (f) => !["assignee", "updated", "created"].includes(f)
  )
  const footerFields = cardFields.filter((f) =>
    ["assignee", "updated", "created"].includes(f)
  )

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen() }
      }}
      className="group cursor-pointer rounded-md border bg-card p-3 text-left transition-colors hover:border-foreground/20"
    >
      {/* Header: ID + menu */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] text-muted-foreground">{incident.id}</span>
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
            <DropdownMenuItem>Run playbook</DropdownMenuItem>
            <DropdownMenuItem>Reassign</DropdownMenuItem>
            <DropdownMenuItem>Resolve</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Title */}
      <div className="mt-1 line-clamp-2 text-sm font-medium leading-snug">
        {incident.title}
      </div>

      {/* Badge fields */}
      {badgeFields.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {badgeFields.map((f) => renderCardField(f, incident))}
        </div>
      )}

      {/* Footer fields */}
      {footerFields.length > 0 && (
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {footerFields
              .filter((f) => f !== "assignee")
              .map((f) => renderCardField(f, incident))}
          </div>
          {footerFields.includes("assignee") && renderCardField("assignee", incident)}
        </div>
      )}
    </div>
  )
}

// ─── Board sub-group ──────────────────────────────────────────────────────────

function BoardSubGroup({
  meta,
  rows,
  cardFields,
  onOpen,
}: {
  meta: GroupMeta
  rows: Incident[]
  cardFields: BoardField[]
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
        className="flex w-full items-center gap-2 px-2 py-1.5 transition-colors hover:bg-muted/30"
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
        <div className="flex flex-col gap-2 px-2 pb-2 pt-1">
          {rows.length === 0 ? (
            <div className="grid h-12 place-items-center rounded border border-dashed text-[11px] text-muted-foreground">
              Empty
            </div>
          ) : (
            rows.map((inc) => (
              <BoardCard
                key={inc.id}
                incident={inc}
                cardFields={cardFields}
                onOpen={() => onOpen(inc.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

type Props = {
  table: Table<Incident>
  config: BoardViewConfig
}

export function IncidentsBoard({ table, config }: Props) {
  const navigate = useNavigate()
  const { groupBy, subGroupBy, cardFields, showEmptyGroups } = config

  const rows = table.getFilteredRowModel().rows.map((r) => r.original)

  const { lanes, grouped } = useMemo(() => {
    let baseLanes: Lane[] = LANES_BY_GROUP[groupBy]

    if (groupBy === "assignee") {
      const names = new Set<string>()
      rows.forEach((r) => names.add(r.assignee?.name ?? "Unassigned"))
      baseLanes = [...names].sort().map((name) => ({
        key: name,
        label: name,
        tone: name === "Unassigned" ? "var(--muted-foreground)" : "var(--primary)",
      }))
    }

    const map = new Map<string, Incident[]>()
    baseLanes.forEach((l) => map.set(l.key, []))
    rows.forEach((r) => {
      const key = getLaneKey(r, groupBy)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(r)
    })

    return { lanes: baseLanes, grouped: map }
  }, [rows, groupBy]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ScrollArea className="rounded-md border">
      <div className="flex min-w-max gap-3 p-3">
        {lanes.map((lane) => {
          const items = grouped.get(lane.key) ?? []
          if (!showEmptyGroups && items.length === 0) return null
          const Icon = lane.Icon
          return (
            <div
              key={lane.key}
              className="flex w-[300px] shrink-0 flex-col rounded-md border bg-muted/30"
            >
              <div className="flex items-center justify-between gap-2 border-b px-3 py-2.5">
                <div className="inline-flex items-center gap-2">
                  {Icon ? (
                    <Icon className="size-3.5 shrink-0" style={{ color: lane.tone }} />
                  ) : (
                    <span className="size-2 rounded-full" style={{ background: lane.tone }} />
                  )}
                  <span className="text-sm font-medium">{lane.label}</span>
                  <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-muted-foreground">
                    {items.length}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </div>

              <div className="flex flex-1 flex-col gap-2 p-2">
                {items.length === 0 ? (
                  <div className="grid h-24 place-items-center rounded-md border border-dashed text-xs text-muted-foreground">
                    No incidents in this lane
                  </div>
                ) : subGroupBy !== "none" ? (
                  buildGroups(items, subGroupBy, showEmptyGroups).map((sg) => (
                    <BoardSubGroup
                      key={sg.meta.key}
                      meta={sg.meta}
                      rows={sg.rows}
                      cardFields={cardFields}
                      onOpen={(id) => navigate(`/incidents/${id}`)}
                    />
                  ))
                ) : (
                  items.map((inc) => (
                    <BoardCard
                      key={inc.id}
                      incident={inc}
                      cardFields={cardFields}
                      onOpen={() => navigate(`/incidents/${inc.id}`)}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
