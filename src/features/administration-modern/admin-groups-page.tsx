import { Link } from "react-router"
import {
  Mail,
  Phone,
  Plus,
  Shield,
  Users,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import { adminGroups, type AdminGroup } from "@/data/admin"
import { FilterBar, SearchInput, ToneChip, type Tone } from "./admin-ui"
import { AdminFiltersPopover, type AdminFilterGroups } from "./admin-filters-popover"

const GROUP_FILTERS: AdminFilterGroups = [
  [
    {
      id: "kind",
      label: "Kind",
      icon: Shield,
      options: [
        { value: "security",     label: "Security" },
        { value: "distribution", label: "Distribution" },
        { value: "on-call",      label: "On-call" },
      ],
    },
    {
      id: "source",
      label: "Source",
      icon: Users,
      options: [
        { value: "local",  label: "Local" },
        { value: "okta",   label: "Okta" },
        { value: "entra",  label: "Entra ID" },
        { value: "google", label: "Google Workspace" },
      ],
    },
    {
      id: "size",
      label: "Size",
      icon: Mail,
      options: [
        { value: "sm", label: "Small (< 10)" },
        { value: "md", label: "Medium (10-50)" },
        { value: "lg", label: "Large (> 50)" },
      ],
    },
  ],
]

const kindTone: Record<AdminGroup["kind"], Tone> = {
  Security: "info", Distribution: "muted", "On-call": "warn",
}

const kindIcon: Record<AdminGroup["kind"], LucideIcon> = {
  Security: Shield, Distribution: Mail, "On-call": Phone,
}

export function AdminGroupsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Groups & teams"
        description="Security groups, on-call rosters, and distribution lists. Bulk-assign roles and scope notifications."
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9" asChild>
              <Link to="/admin-modern/users">View users</Link>
            </Button>
            <Button size="sm" className="h-9">
              <Plus className="size-4" />
              New group
            </Button>
          </>
        }
      />

      <FilterBar>
        <SearchInput placeholder="Search groups…" />
        <div className="flex-1" />
        <AdminFiltersPopover groups={GROUP_FILTERS} />
      </FilterBar>

      <Card>
        <CardContent className="px-0 py-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Kind</th>
                <th className="px-4 py-2 font-medium">Source</th>
                <th className="px-4 py-2 font-medium text-right">Members</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {adminGroups.map((g) => {
                const Icon = kindIcon[g.kind]
                const tone = kindTone[g.kind]
                return (
                  <tr key={g.id} className="hover:bg-accent/40 cursor-pointer">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2.5">
                        <Icon className={cn(
                          "mt-0.5 size-3.5 shrink-0",
                          tone === "info" && "text-primary",
                          tone === "warn" && "text-amber-600 dark:text-amber-400",
                          tone === "muted" && "text-muted-foreground"
                        )} />
                        <div className="min-w-0">
                          <div className="truncate font-medium">{g.name}</div>
                          <div className="truncate text-xs text-muted-foreground">{g.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ToneChip tone={tone}>{g.kind}</ToneChip>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "rounded px-1.5 py-0.5 text-[11px] uppercase tracking-wider",
                        g.source === "SAML"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {g.source}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1.5 font-mono text-sm tabular-nums">
                        <Users className="size-3 text-muted-foreground" />
                        {g.members}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Mock data only — member counts and SSO sync are illustrative.
      </p>
    </div>
  )
}
