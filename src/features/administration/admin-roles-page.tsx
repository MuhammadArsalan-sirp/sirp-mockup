import { useState } from "react"
import {
  AlertTriangle,
  Building,
  ChevronDown,
  ChevronRight,
  Copy,
  FileText,
  Folder,
  Lock,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import {
  adminRoles,
  socManagerPermissions,
  type AdminRole,
  type PermissionGroup,
} from "@/data/admin"

const groupIcons: Record<string, LucideIcon> = {
  AlertTriangle,
  Folder,
  Shield,
  Sparkles,
  Users,
  Settings,
  Building,
  FileText,
}

export function AdminRolesPage() {
  const [activeRoleId, setActiveRoleId] = useState("r_soc_mgr")
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(["config", "system", "audit"])
  )

  const activeRole = adminRoles.find((r) => r.id === activeRoleId) ?? adminRoles[0]
  const systemRoles = adminRoles.filter((r) => r.kind === "system")
  const customRoles = adminRoles.filter((r) => r.kind === "custom")

  const toggleGroup = (id: string) => {
    const next = new Set(collapsedGroups)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setCollapsedGroups(next)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Roles & Permissions"
        description="Bundle granular permissions into reusable roles. System roles are managed by SIRP; custom roles are yours to shape."
      />

      {/* Two-pane: roles list + role detail */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* Roles list */}
        <aside className="rounded-xl border bg-card">
          <div className="space-y-3 border-b p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Roles</h2>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {adminRoles.length}
              </span>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search roles…" className="h-8 pl-8 text-sm" />
            </div>
            <Button size="sm" className="h-8 w-full">
              <Plus className="size-3.5" />
              New role
            </Button>
          </div>

          <div className="max-h-[640px] space-y-1 overflow-y-auto p-2">
            <RoleSection
              label="System"
              roles={systemRoles}
              activeId={activeRoleId}
              onSelect={setActiveRoleId}
            />
            <RoleSection
              label="Custom"
              roles={customRoles}
              activeId={activeRoleId}
              onSelect={setActiveRoleId}
            />
          </div>
        </aside>

        {/* Role detail */}
        <main className="min-w-0 space-y-5">
          {/* Role header */}
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {activeRole.name}
                </h2>
                <Badge className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] text-primary">
                  {activeRole.granted} permissions
                </Badge>
                <Badge className="rounded-full bg-info/15 px-2 py-0.5 text-[11px] text-info">
                  {activeRole.members} users assigned
                </Badge>
                {activeRole.locked && (
                  <Badge className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
                    <Lock className="size-2.5" />
                    Locked
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeRole.description}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
                <span>id: {activeRole.id}</span>
                <span>·</span>
                <span>created 2024-08-12 by ahmed@sirp.io</span>
                <span>·</span>
                <span>last edited 14m ago</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9">
                <Copy className="size-4 text-muted-foreground" />
                Duplicate
              </Button>
              <Button variant="outline" size="icon-sm" className="h-9 w-9">
                <MoreHorizontal className="size-4 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <div className="-mb-px flex items-center">
              <TabButton active label="Permissions" badge={`${activeRole.granted} / ${activeRole.total}`} />
              <TabButton label="Members" badge={`${activeRole.members}`} />
              <TabButton label="Settings" />
              <TabButton label="History" />
            </div>
          </div>

          {/* Permission toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-[320px]">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search permissions…"
                className="h-9 pl-9"
              />
            </div>
            <Button variant="outline" size="sm" className="h-9">
              Show only granted
            </Button>
            <div className="flex-1" />
            <Button variant="outline" size="sm" className="h-9">
              Copy from…
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              Group: Module
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </Button>
          </div>

          {/* Permission groups */}
          <div className="space-y-3">
            {socManagerPermissions.map((group) => (
              <PermissionGroupCard
                key={group.id}
                group={group}
                collapsed={collapsedGroups.has(group.id)}
                onToggle={() => toggleGroup(group.id)}
              />
            ))}
          </div>
        </main>
      </div>

      {/* Sticky save bar */}
      <SaveBar />
    </div>
  )
}

function RoleSection({
  label,
  roles,
  activeId,
  onSelect,
}: {
  label: string
  roles: AdminRole[]
  activeId: string
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <div className="px-2.5 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      {roles.map((role) => {
        const active = role.id === activeId
        return (
          <button
            key={role.id}
            onClick={() => onSelect(role.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-md p-2.5 text-left transition-colors",
              active
                ? "border border-primary/30 bg-primary/8"
                : "border border-transparent hover:bg-accent"
            )}
          >
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-md",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
              )}
            >
              <ShieldCheck className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <div className="truncate text-sm font-medium">{role.name}</div>
                {role.locked && (
                  <Lock className="size-3 shrink-0 text-muted-foreground" />
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {role.granted} permissions · {role.members} users
              </div>
            </div>
            {active && (
              <ChevronRight className="size-4 shrink-0 text-primary" />
            )}
          </button>
        )
      })}
    </div>
  )
}

function TabButton({
  label,
  badge,
  active,
}: {
  label: string
  badge?: string
  active?: boolean
}) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center gap-2 border-b-2 px-3 text-sm transition-colors",
        active
          ? "border-foreground font-medium text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
      {badge && (
        <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
          {badge}
        </span>
      )}
    </button>
  )
}

function PermissionGroupCard({
  group,
  collapsed,
  onToggle,
}: {
  group: PermissionGroup
  collapsed: boolean
  onToggle: () => void
}) {
  const Icon = groupIcons[group.icon] ?? Shield
  const grantedCount = group.permissions.filter((p) => p.granted).length
  const total = group.permissions.length
  const pct = total ? (grantedCount / total) * 100 : 0
  const allGranted = grantedCount === total
  const noneGranted = grantedCount === 0

  const barColor = allGranted
    ? "var(--success)"
    : noneGranted
    ? "var(--muted-foreground)"
    : pct >= 50
    ? "var(--success)"
    : "var(--attention)"

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-accent/50"
      >
        <input
          type="checkbox"
          checked={allGranted}
          ref={(el) => {
            if (el) el.indeterminate = !allGranted && !noneGranted
          }}
          onChange={() => {}}
          onClick={(e) => e.stopPropagation()}
          className="size-4 rounded border-border"
        />
        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-secondary">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">{group.label}</div>
            <span className="text-xs text-muted-foreground">
              {grantedCount} of {total} granted
            </span>
            {group.id === "sara" && (
              <Badge className="rounded-full bg-primary/15 px-1.5 py-0 text-[10px] text-primary">
                AI
              </Badge>
            )}
            {group.id === "system" && (
              <Badge className="rounded-full bg-secondary px-1.5 py-0 text-[10px] text-secondary-foreground">
                <Lock className="size-2.5" />
                Restricted
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">{group.description}</div>
        </div>
        <div className="hidden h-1.5 w-32 overflow-hidden rounded-full bg-muted sm:block">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: barColor }}
          />
        </div>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            collapsed && "-rotate-90"
          )}
        />
      </button>

      {!collapsed && (
        <div className="border-t">
          {group.permissions.map((perm, idx) => (
            <div
              key={perm.id}
              className={cn(
                "grid grid-cols-[28px_1fr_auto] items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/30",
                idx > 0 && "border-t border-border/60"
              )}
            >
              <input
                type="checkbox"
                checked={perm.granted}
                onChange={() => {}}
                className="size-4 rounded border-border"
              />
              <div>
                <div className="text-sm">{perm.label}</div>
                <div className="text-xs text-muted-foreground">
                  {perm.description}
                </div>
              </div>
              <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-secondary-foreground">
                {perm.scope}
              </code>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SaveBar() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border bg-popover py-1.5 pr-2 pl-4 text-sm shadow-lg">
        <span className="size-2 rounded-full bg-attention" />
        <span>
          <span className="font-semibold">3 changes</span> not saved
        </span>
        <div className="mx-1 h-4 w-px bg-border" />
        <Button variant="ghost" size="sm" className="h-8 rounded-full">
          Discard
        </Button>
        <Button size="sm" className="h-8 rounded-full">
          Save changes
        </Button>
      </div>
    </div>
  )
}
