import { useMemo, useState } from "react"
import {
  ChevronDown,
  Download,
  Network,
  Plus,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import { departments, type Department } from "@/data/admin"
import { ToneChip } from "./admin-ui"

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

      <Card>
        <CardContent className="px-0 py-0">
          <div className="flex items-center gap-2 border-b px-4 py-2.5">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search departments…" className="h-8 pl-8 text-sm" />
            </div>
          </div>
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
    </div>
  )
}
