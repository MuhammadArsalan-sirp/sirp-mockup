import { useState } from "react"
import {
  CheckCircle2,
  ChevronDown,
  Download,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Search,
  SlidersHorizontal,
  UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import { adminUsers, type AdminUser } from "@/data/admin"
import { AdminUserSheet } from "./admin-user-sheet"

const statusPill: Record<AdminUser["status"], string> = {
  active: "bg-success/15 text-success",
  locked: "bg-destructive/15 text-destructive",
  inactive: "bg-attention/15 text-attention",
  pending: "bg-info/15 text-info",
}

const statusDot: Record<AdminUser["status"], string> = {
  active: "bg-success",
  locked: "bg-destructive",
  inactive: "bg-attention",
  pending: "bg-info",
}

const statusLabel: Record<AdminUser["status"], string> = {
  active: "Active",
  locked: "Locked",
  inactive: "Inactive",
  pending: "Pending invite",
}

const mfaPill: Record<AdminUser["mfa"], { tone: string; label: string }> = {
  totp: { tone: "bg-success/15 text-success", label: "TOTP" },
  webauthn: { tone: "bg-success/15 text-success", label: "WebAuthn" },
  pending: { tone: "bg-attention/15 text-attention", label: "Pending" },
  disabled: { tone: "bg-attention/15 text-attention", label: "Disabled" },
}

export function AdminUsersPage() {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  const openUser = (user: AdminUser) => {
    setSelectedUser(user)
    setDrawerOpen(true)
  }

  const toggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const next = new Set(selectedRows)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedRows(next)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users"
        description={
          <>
            142 active users · 12 pending invites · 8 seats remaining on your{" "}
            <strong className="font-medium text-foreground">Enterprise</strong>{" "}
            licence.
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9">
              <Download className="size-4 text-muted-foreground" />
              Import CSV
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <RefreshCw className="size-4 text-muted-foreground" />
              Sync from SSO
            </Button>
            <Button size="sm" className="h-9">
              <UserPlus className="size-4" />
              Invite user
            </Button>
          </>
        }
      />

      {/* Mini stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MiniStat
          label="Active"
          value="142"
          caption={
            <>
              <span className="font-medium text-success">+6</span> this month
            </>
          }
        />
        <MiniStat
          label="Locked"
          value="3"
          caption="Requires unlock"
          tone="destructive"
        />
        <MiniStat
          label="Inactive ≥ 90d"
          value="7"
          caption="Consider deactivating"
          tone="attention"
        />
        <MiniStat label="Pending invites" value="12" caption="8 unaccepted > 7d" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-[280px]">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users…"
            className="h-9 pl-9"
          />
        </div>
        <FilterTrigger label="Status" badge="2" />
        <FilterTrigger label="Role" />
        <FilterTrigger label="Group" />
        <FilterTrigger label="Source" />
        <Button variant="outline" size="sm" className="h-9">
          <Filter className="size-4 text-muted-foreground" />
          More filters
        </Button>
        <div className="flex-1" />
        <Button variant="outline" size="sm" className="h-9">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          Manage table
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="border-b">
              <th className="w-10 px-4 py-2.5 text-left">
                <input
                  type="checkbox"
                  className="size-4 rounded border-border"
                  aria-label="Select all"
                />
              </th>
              <Th>User</Th>
              <Th>Status</Th>
              <Th>Role</Th>
              <Th>Groups</Th>
              <Th>Last active</Th>
              <Th>MFA</Th>
              <Th>Source</Th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {adminUsers.map((user) => {
              const isSelected = selectedRows.has(user.id)
              const isOpen = drawerOpen && selectedUser?.id === user.id
              return (
                <tr
                  key={user.id}
                  onClick={() => openUser(user)}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-muted/40",
                    isSelected && "bg-primary/5 hover:bg-primary/10",
                    isOpen && "bg-primary/8"
                  )}
                  style={
                    isOpen
                      ? { borderLeft: "2px solid var(--primary)" }
                      : undefined
                  }
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="size-4 rounded border-border"
                      checked={isSelected}
                      onChange={() => {}}
                      onClick={(e) => toggleRow(user.id, e)}
                      aria-label={`Select ${user.name}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-br text-xs font-semibold text-white",
                          user.gradient
                        )}
                      >
                        {user.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium leading-tight">
                          {user.name}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-medium",
                        statusPill[user.status]
                      )}
                    >
                      <span
                        className={cn("size-1.5 rounded-full", statusDot[user.status])}
                      />
                      {statusLabel[user.status]}
                      {user.statusDetail && (
                        <span className="ml-0.5 text-muted-foreground">
                          {" "}
                          {user.statusDetail}
                        </span>
                      )}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {user.role === "—" ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      user.role
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-secondary-foreground">
                        {user.groups[0]}
                      </span>
                      {user.groups.length > 1 && (
                        <span className="rounded bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-secondary-foreground">
                          +{user.groups.length - 1}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {user.lastActive}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px]",
                        mfaPill[user.mfa].tone
                      )}
                    >
                      {(user.mfa === "totp" || user.mfa === "webauthn") && (
                        <CheckCircle2 className="size-2.5" />
                      )}
                      {mfaPill[user.mfa].label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs uppercase text-muted-foreground">
                      {user.source}
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Actions for ${user.name}`}
                    >
                      <MoreHorizontal className="size-4 text-muted-foreground" />
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing{" "}
          <span className="font-medium text-foreground">1–{adminUsers.length}</span>{" "}
          of <span className="font-medium text-foreground">142</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span>Rows</span>
            <Button variant="outline" size="sm" className="h-7 px-2">
              10 <ChevronDown className="size-3" />
            </Button>
          </div>
          <div className="font-mono text-xs">Page 1 of 15</div>
        </div>
      </div>

      <AdminUserSheet
        user={selectedUser}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
      {children}
    </th>
  )
}

function FilterTrigger({ label, badge }: { label: string; badge?: string }) {
  return (
    <Button variant="outline" size="sm" className="h-9">
      {label}
      {badge && (
        <span className="ml-1 rounded bg-secondary px-1 text-[11px] tabular-nums">
          {badge}
        </span>
      )}
      <ChevronDown className="size-3.5 text-muted-foreground" />
    </Button>
  )
}

function MiniStat({
  label,
  value,
  caption,
  tone,
}: {
  label: string
  value: string
  caption: React.ReactNode
  tone?: "destructive" | "attention"
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 text-xl font-semibold tabular-nums",
          tone === "destructive" && "text-destructive",
          tone === "attention" && "text-attention"
        )}
      >
        {value}
      </div>
      <div className="mt-0.5 text-xs text-muted-foreground">{caption}</div>
    </div>
  )
}
