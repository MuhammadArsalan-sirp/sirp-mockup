import { Link } from "react-router"
import { Plus, Search, Users2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { adminGroups } from "@/data/admin"

export function AdminGroupsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Groups & teams"
        description="Security groups, on-call rosters, and distribution lists. Assign roles in bulk and scope notifications."
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9" asChild>
              <Link to="/admin/users">View users</Link>
            </Button>
            <Button size="sm" className="h-9">
              <Plus className="size-4" />
              New group
            </Button>
          </>
        }
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search groups…" className="h-9 pl-9" />
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <div className="grid min-w-[560px] grid-cols-[1fr_100px_120px_100px] gap-3 border-b px-4 py-2.5 text-xs font-medium text-muted-foreground">
          <div>Name</div>
          <div className="text-right">Members</div>
          <div>Type</div>
          <div className="text-right">Source</div>
        </div>
        {adminGroups.map((g) => (
          <div
            key={g.id}
            className="grid min-w-[560px] grid-cols-[1fr_100px_120px_100px] items-center gap-3 border-t px-4 py-3 text-sm first:border-t-0"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary text-muted-foreground">
                <Users2 className="size-4" />
              </span>
              <div className="min-w-0">
                <div className="truncate font-medium">{g.name}</div>
                <div className="truncate text-xs text-muted-foreground">{g.description}</div>
              </div>
            </div>
            <div className="text-right font-mono text-xs tabular-nums">{g.members}</div>
            <div>
              <Badge variant="secondary" className="text-[11px] font-normal">
                {g.kind}
              </Badge>
            </div>
            <div className="text-right text-xs text-muted-foreground">{g.source}</div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Mock data only — member counts and SSO sync are illustrative.
      </p>
    </div>
  )
}
