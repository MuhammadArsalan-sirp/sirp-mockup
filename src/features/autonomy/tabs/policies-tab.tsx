import { useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  ChevronDown,
  Circle,
  Lock,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Workflow,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PageHeader } from "@/components/shared/page-header"
import {
  approvalWorkflows,
  autonomyRuleCategories,
  controlPolicies,
  type AutonomyRuleCategory,
  type ControlPolicy,
} from "@/data/autonomy"
import { Segmented } from "./_segmented"
import {
  AutonomyFilterPopover,
  useFilters,
  type FilterGroup,
} from "../_filter-popover"
import {
  policyEffectOptions,
  policyStatusOptions,
} from "../_filters"
import { AutonomyDataTable } from "../autonomy-sortable-table"
import { DataTableColumnHeader } from "@/components/shared/data-table"

const CONTROL_POLICY_FILTER_GROUPS: FilterGroup[] = [
  { id: "effect", label: "Effect", icon: ShieldCheck, options: policyEffectOptions },
  { id: "status", label: "Status", icon: Circle, options: policyStatusOptions },
]

type SubKey = "rules" | "workflows" | "policies"

export function PoliciesTab() {
  const [sub, setSub] = useState<SubKey>("rules")

  return (
    <div className="space-y-6">
      <PageHeader
        title="Policies"
        description="Govern what SIRP is allowed to automate, who must approve, and which actions are blocked outright."
        actions={
          <Button size="sm" className="h-9">
            <Plus className="size-4" />
            {sub === "rules" && "New rule"}
            {sub === "workflows" && "New workflow"}
            {sub === "policies" && "New policy"}
          </Button>
        }
      />

      <Segmented
        value={sub}
        onChange={setSub}
        options={[
          { key: "rules", label: "Autonomy rules", count: autonomyRuleCategories.length },
          { key: "workflows", label: "Approval workflows", count: approvalWorkflows.length },
          { key: "policies", label: "Control policies", count: controlPolicies.length },
        ]}
      />

      {sub === "rules" && <AutonomyRulesView />}
      {sub === "workflows" && <ApprovalWorkflowsView />}
      {sub === "policies" && <ControlPoliciesView />}
    </div>
  )
}

function AutonomyRulesView() {
  const [open, setOpen] = useState<string | null>(autonomyRuleCategories[0]?.id ?? null)
  return (
    <div className="space-y-3">
      {autonomyRuleCategories.map((cat) => (
        <RuleCategory
          key={cat.id}
          cat={cat}
          isOpen={open === cat.id}
          onToggle={() => setOpen((cur) => (cur === cat.id ? null : cat.id))}
        />
      ))}
    </div>
  )
}

function RuleCategory({ cat, isOpen, onToggle }: { cat: AutonomyRuleCategory; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="rounded-xl border bg-card">
      <button onClick={onToggle} className="flex w-full items-center gap-4 px-5 py-4 text-left">
        <span className="grid size-9 place-items-center rounded-md border bg-secondary text-muted-foreground">
          <ShieldCheck className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{cat.title}</span>
            <Badge variant="outline" className="font-normal text-muted-foreground">{cat.rules.length} rules</Badge>
          </div>
          <div className="mt-0.5 truncate text-xs text-muted-foreground">{cat.description}</div>
        </div>
        <ChevronDown className={`size-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="border-t">
          <div className="divide-y">
            {cat.rules.map((r) => (
              <div key={r.name} className="flex items-center gap-3 px-5 py-3 text-sm">
                <EffectPill effect={r.effect} />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{r.name}</div>
                  <div className="mt-0.5 truncate font-mono text-xs text-muted-foreground">when {r.when}</div>
                </div>
                <Button variant="ghost" size="sm" className="h-8">Edit</Button>
              </div>
            ))}
          </div>
          <div className="border-t bg-muted/30 px-5 py-3">
            <Button variant="outline" size="sm" className="h-8">
              <Plus className="size-3.5" />Add rule
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function EffectPill({ effect }: { effect: "auto" | "approve" | "block" }) {
  if (effect === "auto")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "color-mix(in srgb, var(--success) 15%, transparent)", color: "var(--success)" }}>
        <span className="size-1.5 rounded-full bg-current" />Auto
      </span>
    )
  if (effect === "approve")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "color-mix(in srgb, var(--attention) 15%, transparent)", color: "var(--attention)" }}>
        <span className="size-1.5 rounded-full bg-current" />Approval
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "color-mix(in srgb, var(--destructive) 15%, transparent)", color: "var(--destructive)" }}>
      <Lock className="size-3" />Block
    </span>
  )
}

function ApprovalWorkflowsView() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {approvalWorkflows.map((w) => (
        <div key={w.id} className="rounded-xl border bg-card p-5">
          <div className="flex items-start gap-3">
            <span className="grid size-9 place-items-center rounded-md border bg-secondary text-muted-foreground">
              <Workflow className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">{w.name}</div>
              <div className="mt-0.5 truncate text-xs text-muted-foreground">{w.scope}</div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{w.description}</p>
          <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs">
            <div>
              <div className="text-muted-foreground">Approvers</div>
              <div className="mt-1 flex -space-x-1.5">
                {w.approvers.map((ap, i) => (
                  <span key={i} className={`grid size-6 place-items-center rounded-full bg-gradient-to-br ${ap.tone} text-[10px] font-semibold text-white ring-2 ring-card`}>
                    {ap.initials}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="text-muted-foreground">Rules</div>
              <div className="font-mono font-semibold tabular-nums">{w.rules}</div>
            </div>
            <div className="text-right">
              <div className="text-muted-foreground">Updated</div>
              <div className="font-medium">{w.updatedAt}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ControlPoliciesView() {
  const [query, setQuery] = useState("")
  const { filters, setFilters } = useFilters({ effect: [], status: [] })

  const filtered = controlPolicies.filter((p) => {
    if (filters.effect.length && !filters.effect.includes(p.effect)) return false
    if (filters.status.length && !filters.status.includes(p.status)) return false
    if (query && !`${p.id} ${p.name} ${p.scope}`.toLowerCase().includes(query.toLowerCase()))
      return false
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-[260px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search policies…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 pl-9"
          />
        </div>
        <AutonomyFilterPopover groups={CONTROL_POLICY_FILTER_GROUPS} value={filters} onChange={setFilters} />
      </div>
      <ControlPoliciesTableSortable policies={filtered} />
    </div>
  )
}

function PolicyEffect({ effect }: { effect: ControlPolicy["effect"] }) {
  const map: Record<ControlPolicy["effect"], { label: string; color: string }> = {
    allow: { label: "Allow", color: "var(--success)" },
    approve: { label: "Approve", color: "var(--attention)" },
    deny: { label: "Deny", color: "var(--destructive)" },
  }
  const { label, color } = map[effect]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}>
      <span className="size-1.5 rounded-full bg-current" />{label}
    </span>
  )
}

function PolicyStatus({ status }: { status: ControlPolicy["status"] }) {
  if (status === "enforced")
    return <Badge variant="outline" className="font-normal">Enforced</Badge>
  if (status === "monitor")
    return <Badge variant="outline" className="font-normal" style={{ borderColor: "color-mix(in srgb, var(--info) 35%, transparent)", color: "var(--info)" }}>Monitor</Badge>
  return <Badge variant="outline" className="font-normal text-muted-foreground">Draft</Badge>
}

const controlPolicyColumns: ColumnDef<ControlPolicy>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.id}</span>,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Policy" />,
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "scope",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Scope" />,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.scope}</span>,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "conditions",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Conditions" />,
    cell: ({ row }) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
        {row.original.conditions}
      </code>
    ),
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "effect",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Effect" />,
    cell: ({ row }) => <PolicyEffect effect={row.original.effect} />,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => <PolicyStatus status={row.original.status} />,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
    cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.updatedAt}</span>,
    sortingFn: "alphanumeric",
  },
  {
    id: "menu",
    enableSorting: false,
    header: () => <span className="sr-only">Menu</span>,
    cell: () => (
      <div className="text-right">
        <Button variant="ghost" size="icon" className="size-7">
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
    ),
    meta: { tdClass: "text-right" },
  },
]

function ControlPoliciesTableSortable({ policies }: { policies: ControlPolicy[] }) {
  const columns = useMemo(() => controlPolicyColumns, [])
  return (
    <AutonomyDataTable
      data={policies}
      columns={columns}
      getRowId={(p) => p.id}
      emptyMessage="No policies match your filters."
    />
  )
}
