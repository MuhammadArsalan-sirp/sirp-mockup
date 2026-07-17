import {
  AlertTriangle,
  Folder,
  Settings,
  Shield,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { adminRoles, socManagerPermissions } from "@/data/admin"
import { roleGroupAccess, type AccessLevel } from "@/data/admin-rbac-matrix"
import { SectionLabel } from "./admin-ui"

const groupIcons: Record<string, LucideIcon> = {
  AlertTriangle,
  Folder,
  Shield,
  Sparkles,
  Users,
  Settings,
}

const levelDot: Record<AccessLevel, string> = {
  full: "bg-emerald-500 dark:bg-emerald-500/90",
  partial: "bg-amber-500 dark:bg-amber-500/90",
  none: "bg-muted-foreground/15",
}

const levelLabel: Record<AccessLevel, string> = {
  full: "Full access",
  partial: "Partial access",
  none: "No access",
}

/**
 * Every role against every permission module, in one grid — the thing you
 * can't get from `admin-roles-page.tsx`'s one-role-at-a-time editor.
 * Read-only by design: click a cell's role/module pair mentally, then go
 * open that role if you actually want to change something.
 */
export function AdminRolesMatrix() {
  const groups = socManagerPermissions.map((g) => ({ id: g.id, label: g.label, icon: g.icon }))

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="px-0 py-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-muted/20">
                  <th className="sticky left-0 z-10 min-w-40 bg-card px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Module
                  </th>
                  {adminRoles.map((r) => (
                    <th key={r.id} className="min-w-24 px-2 py-3 text-center align-bottom">
                      <div className="truncate text-xs font-medium leading-tight">{r.name}</div>
                      <div className="mt-0.5 font-mono text-[10px] tabular-nums text-muted-foreground">
                        {r.members}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {groups.map((g) => {
                  const Icon = groupIcons[g.icon] ?? Shield
                  return (
                    <tr key={g.id} className="hover:bg-muted/20">
                      <td className="sticky left-0 z-10 bg-card px-4 py-2.5">
                        <div className="flex items-center gap-2 text-sm">
                          <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                          <span className="truncate">{g.label}</span>
                        </div>
                      </td>
                      {adminRoles.map((r) => {
                        const level = roleGroupAccess[r.id]?.[g.id] ?? "none"
                        return (
                          <td key={r.id} className="px-2 py-2.5 text-center">
                            <span
                              title={`${r.name} · ${g.label} · ${levelLabel[level]}`}
                              className={cn("inline-block size-3.5 rounded-[4px]", levelDot[level])}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4 px-1">
        <SectionLabel>Legend</SectionLabel>
        {(["full", "partial", "none"] as const).map((level) => (
          <span key={level} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn("inline-block size-3 rounded-[3px]", levelDot[level])} />
            {levelLabel[level]}
          </span>
        ))}
      </div>
    </div>
  )
}
