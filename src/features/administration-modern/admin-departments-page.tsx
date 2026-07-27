import { useMemo, useState, type ReactNode } from "react"
import {
  ChevronDown,
  Download,
  Network,
  Plus,
  User,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import { departments, type Department } from "@/data/admin"
import { FilterBar, SearchInput, ToneChip } from "./admin-ui"
import { AdminFiltersPopover, type AdminFilterGroups } from "./admin-filters-popover"
import "./org-chart.css"

const DEPT_FILTERS: AdminFilterGroups = [
  [
    {
      id: "manager",
      label: "Manager",
      icon: User,
      options: [
        { value: "ahmed",  label: "Ahmed Khan" },
        { value: "sara",   label: "Sara Patel" },
        { value: "mariam", label: "Mariam Al-Saud" },
      ],
    },
    {
      id: "group",
      label: "Default group",
      icon: Users,
      options: [
        { value: "soc",       label: "SOC" },
        { value: "platform",  label: "Platform" },
        { value: "leadership",label: "Leadership" },
      ],
    },
  ],
]

type Node = Department & { children: Node[]; depth: number }

function buildTree(): Node[] {
  const byId = new Map<string, Node>()
  for (const d of departments) byId.set(d.id, { ...d, children: [], depth: 0 })
  const roots: Node[] = []
  for (const n of byId.values()) {
    if (n.parentId) {
      const parent = byId.get(n.parentId)
      if (parent) { n.depth = parent.depth + 1; parent.children.push(n) }
      else roots.push(n)
    } else {
      roots.push(n)
    }
  }
  return roots
}

function walk(nodes: Node[], expanded: Set<string>, out: Node[] = [], depth = 0): Node[] {
  for (const n of nodes) {
    out.push({ ...n, depth })
    if (expanded.has(n.id) && n.children.length) walk(n.children, expanded, out, depth + 1)
  }
  return out
}

export function AdminDepartmentsPage() {
  const [view, setView] = useState<"list" | "chart">("list")
  const tree = useMemo(buildTree, [])
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(departments.map((d) => d.id))
  )
  const flat = useMemo(() => walk(tree, expanded), [tree, expanded])

  const toggle = (id: string) => {
    const next = new Set(expanded)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpanded(next)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Departments"
        description="Reporting hierarchy and default group assignment. Used to scope incidents, dashboards and notifications."
        actions={
          <>
            <div className="flex items-center gap-0.5 rounded-lg border bg-muted/30 p-0.5">
              <ViewToggleButton active={view === "list"} onClick={() => setView("list")}>
                List
              </ViewToggleButton>
              <ViewToggleButton active={view === "chart"} onClick={() => setView("chart")}>
                Org chart
              </ViewToggleButton>
            </div>
            <Button variant="outline" size="sm" className="h-9">
              <Download className="size-4 text-muted-foreground" />
              Export
            </Button>
            <Button size="sm" className="h-9">
              <Plus className="size-4" />
              New department
            </Button>
          </>
        }
      />

      {view === "list" && (
      <>
      <FilterBar>
        <SearchInput placeholder="Search departments…" />
        <div className="flex-1" />
        <AdminFiltersPopover groups={DEPT_FILTERS} />
      </FilterBar>

      <Card>
        <CardContent className="px-0 py-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2 font-medium">Department</th>
                <th className="px-4 py-2 font-medium">Manager</th>
                <th className="px-4 py-2 font-medium">Default group</th>
                <th className="px-4 py-2 font-medium text-right">Members</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {flat.map((n) => {
                const hasChildren = n.children.length > 0
                const isExpanded = expanded.has(n.id)
                return (
                  <tr key={n.id} className="hover:bg-accent/40">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2" style={{ paddingLeft: `${n.depth * 16}px` }}>
                        {hasChildren ? (
                          <button onClick={() => toggle(n.id)} aria-label="toggle">
                            <ChevronDown className={cn(
                              "size-3.5 text-muted-foreground transition-transform",
                              !isExpanded && "-rotate-90"
                            )} />
                          </button>
                        ) : (
                          <span className="size-3.5" />
                        )}
                        <Network className="size-3.5 text-muted-foreground" />
                        <span className="font-medium">{n.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{n.manager}</td>
                    <td className="px-4 py-2.5">
                      {n.defaultGroup ? (
                        <ToneChip tone="muted">{n.defaultGroup}</ToneChip>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums">{n.members}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
      </>
      )}

      {view === "chart" && (
        <Card>
          <CardContent className="overflow-x-auto px-6 py-10">
            <ul className="org-tree">
              {tree.map((root) => (
                <OrgChartNode key={root.id} node={root} />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function OrgChartNode({ node }: { node: Node }) {
  return (
    <li>
      <div className="org-box relative flex w-44 flex-col items-center gap-1 rounded-lg border bg-card px-3 py-2.5 shadow-sm">
        <Network className="size-3.5 text-muted-foreground" />
        <span className="text-center text-sm font-medium leading-tight">{node.name}</span>
        <span className="text-xs text-muted-foreground">{node.manager}</span>
        <span className="mt-0.5 rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] tabular-nums text-muted-foreground">
          {node.members} members
        </span>
      </div>
      {node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <OrgChartNode key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  )
}

function ViewToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}
