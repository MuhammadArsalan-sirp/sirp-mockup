import { useState } from "react"
import {
  CheckCircle2,
  ChevronDown,
  Download,
  Filter,
  KeyRound,
  Lock,
  MoreHorizontal,
  RefreshCw,
  Search,
  SlidersHorizontal,
  UserPlus,
  Users,
  UsersRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import { adminUsers, type AdminUser } from "@/data/admin"
import { AdminUserSheet } from "./admin-user-sheet"
import {
  ToneChip,
  StatusDot,
  type Tone,
} from "./admin-ui"

const statusTone: Record<AdminUser["status"], Tone> = {
  active:   "ok",
  locked:   "alert",
  inactive: "warn",
  pending:  "primary",
}

const statusLabel: Record<AdminUser["status"], string> = {
  active:   "Active",
  locked:   "Locked",
  inactive: "Inactive",
  pending:  "Pending invite",
}

const mfaTone: Record<AdminUser["mfa"], { tone: Tone; label: string }> = {
  totp:     { tone: "ok",    label: "TOTP" },
  webauthn: { tone: "ok",    label: "WebAuthn" },
  pending:  { tone: "warn",  label: "Pending" },
  disabled: { tone: "alert", label: "Disabled" },
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
            142 active · 12 pending invites · 8 seats remaining on your{" "}
            <strong className="font-medium text-foreground">Enterprise</strong> licence.
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

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-70">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search users…" className="h-9 pl-9" />
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
          Display
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </div>

      {/* Bulk action bar */}
      {selectedRows.size > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center justify-between gap-3 px-5 py-3">
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="size-4 text-primary" />
              <span className="font-medium">{selectedRows.size} selected</span>
              <span className="text-muted-foreground">— actions apply to every selected user</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8">
                <Lock className="size-3.5 mr-1" />
                Lock
              </Button>
              <Button variant="outline" size="sm" className="h-8">
                <KeyRound className="size-3.5 mr-1" />
                Reset MFA
              </Button>
              <Button variant="outline" size="sm" className="h-8">
                <UsersRound className="size-3.5 mr-1" />
                Add to group
              </Button>
              <Button variant="outline" size="sm" className="h-8" onClick={() => setSelectedRows(new Set())}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="px-0 py-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="w-10 px-4 py-2.5 text-left">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-border"
                      aria-label="Select all"
                    />
                  </th>
                  <Th><Users className="mr-1 inline size-3" />User</Th>
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
                        "cursor-pointer transition-colors hover:bg-accent/40",
                        isSelected && "bg-primary/5 hover:bg-primary/10",
                        isOpen && "bg-primary/10"
                      )}
                      style={isOpen ? { borderLeft: "2px solid var(--primary)" } : undefined}
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
                              "grid size-7 shrink-0 place-items-center rounded-full bg-linear-to-br text-xs font-semibold text-white",
                              user.gradient
                            )}
                          >
                            {user.initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium leading-tight">{user.name}</div>
                            <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <ToneChip tone={statusTone[user.status]}>
                          <StatusDot tone={statusTone[user.status]} className="mr-1" />
                          {statusLabel[user.status]}
                          {user.statusDetail && (
                            <span className="ml-0.5 text-muted-foreground"> {user.statusDetail}</span>
                          )}
                        </ToneChip>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {user.role === "—" ? <span className="text-muted-foreground">—</span> : user.role}
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
                      <td className="px-4 py-3 text-sm text-muted-foreground">{user.lastActive}</td>
                      <td className="px-4 py-3">
                        <ToneChip tone={mfaTone[user.mfa].tone}>
                          {(user.mfa === "totp" || user.mfa === "webauthn") && (
                            <CheckCircle2 className="size-3" />
                          )}
                          {mfaTone[user.mfa].label}
                        </ToneChip>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs uppercase text-muted-foreground">{user.source}</span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${user.name}`}>
                          <MoreHorizontal className="size-4 text-muted-foreground" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing <span className="font-medium text-foreground">1–{adminUsers.length}</span> of{" "}
          <span className="font-medium text-foreground">142</span>
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
    <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
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
