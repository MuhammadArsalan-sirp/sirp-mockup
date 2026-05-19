import {
  CheckCircle2,
  MoreHorizontal,
  PanelRightClose,
  Pencil,
  ShieldCheck,
  Users2,
  X,
  AlertCircle,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { AdminUser } from "@/data/admin"

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

type Props = {
  user: AdminUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminUserSheet({ user, open, onOpenChange }: Props) {
  if (!user) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full overflow-y-auto p-0 sm:max-w-md"
      >
        {/* Visually hidden — Radix requires SheetTitle for a11y */}
        <SheetHeader className="sr-only">
          <SheetTitle>{user.name}</SheetTitle>
          <SheetDescription>{user.email}</SheetDescription>
        </SheetHeader>

        {/* Drawer header */}
        <div className="flex items-center gap-3 border-b px-5 py-4">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
          >
            <PanelRightClose className="size-4" />
          </Button>
          <div className="min-w-0 flex-1 text-xs text-muted-foreground">
            User · ID <span className="font-mono">{user.id}</span>
          </div>
          <Button variant="ghost" size="icon-sm" aria-label="More">
            <MoreHorizontal className="size-4" />
          </Button>
        </div>

        {/* Profile block */}
        <div className="space-y-5 border-b px-5 py-5">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "grid size-14 shrink-0 place-items-center rounded-full bg-gradient-to-br text-base font-semibold text-white",
                user.gradient
              )}
            >
              {user.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-semibold tracking-tight">{user.name}</h2>
                <Badge className={cn("rounded-full px-2 py-0.5 text-[10px]", statusPill[user.status])}>
                  <span className={cn("size-1.5 rounded-full", statusDot[user.status])} />
                  {statusLabel[user.status]}
                </Badge>
              </div>
              <div className="mt-0.5 truncate text-sm text-muted-foreground">
                {user.email}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>Acme · EMEA</span>
                <span>·</span>
                <span>UTC+1 · London</span>
                <span>·</span>
                <span className="font-mono uppercase">{user.source}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="h-9">
              <Pencil className="size-3.5 text-muted-foreground" />
              Edit profile
            </Button>
            <Button size="sm" className="h-9">
              <ShieldCheck className="size-3.5" />
              Manage access
            </Button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 border-b px-5 py-4">
          <Stat label="Joined" value={user.joined} sub="—" />
          <Stat label="Last active" value={user.lastActive} sub="Chrome · macOS" />
          <Stat
            label="Sessions"
            value="3 active"
            sub={
              <a className="text-primary hover:underline" href="#">
                Revoke all →
              </a>
            }
          />
        </div>

        {/* Role & groups */}
        <div className="space-y-5 px-5 py-5">
          <section>
            <SectionLabel right={<button className="text-xs text-primary hover:underline">Change</button>}>
              Role
            </SectionLabel>
            <div className="mt-2 flex items-center gap-3 rounded-lg border bg-card p-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary">
                <ShieldCheck className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{user.role}</div>
                <div className="text-xs text-muted-foreground">
                  42 permissions across 8 modules
                </div>
              </div>
              <a
                href="/admin/roles"
                className="whitespace-nowrap text-xs text-muted-foreground hover:text-foreground"
              >
                View →
              </a>
            </div>
          </section>

          <section>
            <SectionLabel
              right={<button className="text-xs text-primary hover:underline">+ Add</button>}
            >
              Groups{" "}
              <span className="ml-1 font-mono text-foreground">
                {user.groups.length}
              </span>
            </SectionLabel>
            <div className="mt-2 space-y-1.5">
              {user.groups.map((g) => (
                <div
                  key={g}
                  className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm"
                >
                  <Users2 className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate">{g}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    14 members
                  </span>
                  <Button variant="ghost" size="icon-xs" aria-label={`Remove ${g}`}>
                    <X className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionLabel>Security</SectionLabel>
            <div className="mt-2 divide-y rounded-lg border bg-card">
              <SecurityRow
                title="Multi-factor auth"
                description={
                  user.mfa === "totp"
                    ? "TOTP via Authenticator app"
                    : user.mfa === "webauthn"
                    ? "WebAuthn (security key)"
                    : user.mfa === "pending"
                    ? "Pending enrolment"
                    : "Not enabled"
                }
                trailing={
                  user.mfa === "disabled" || user.mfa === "pending" ? (
                    <Badge className="bg-attention/15 text-attention rounded-full px-2 py-0.5 text-[10px]">
                      <AlertCircle className="size-2.5" />
                      Required
                    </Badge>
                  ) : (
                    <Badge className="bg-success/15 text-success rounded-full px-2 py-0.5 text-[10px]">
                      <CheckCircle2 className="size-2.5" />
                      Enabled
                    </Badge>
                  )
                }
              />
              <SecurityRow
                title="Password"
                description={
                  user.source === "saml" || user.source === "oidc"
                    ? `Managed by ${user.source.toUpperCase()} provider`
                    : "Local password · last changed 41 days ago"
                }
                trailing={
                  <button className="text-xs text-primary hover:underline">
                    Reset link
                  </button>
                }
              />
              <SecurityRow
                title="API tokens"
                description="2 active · 1 expired"
                trailing={
                  <button className="text-xs text-primary hover:underline">
                    Manage
                  </button>
                }
              />
            </div>
          </section>

          <section>
            <SectionLabel>Recent activity</SectionLabel>
            <div className="mt-2 space-y-3 text-sm">
              <ActivityItem
                tone="success"
                text={
                  <>
                    Closed incident{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                      INC-2841
                    </code>
                  </>
                }
                meta="2 min ago · 198.51.100.12"
              />
              <ActivityItem
                tone="info"
                text={
                  <>
                    Updated role <span className="font-medium">SOC Tier 2</span>
                  </>
                }
                meta="1 hr ago"
              />
              <ActivityItem
                text="Signed in"
                meta="today 09:41 · Chrome 121 · macOS 14.4"
              />
              <ActivityItem
                text="Signed in"
                meta="yesterday 18:02 · Firefox 124 · iOS 18"
              />
            </div>
          </section>

          {/* Danger zone */}
          <section>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-destructive">
              Danger zone
            </div>
            <div
              className="space-y-2 rounded-lg border p-3"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--destructive) 30%, var(--border))",
              }}
            >
              <DangerRow
                title="Deactivate user"
                description="Revoke session, keep audit history."
                actionLabel="Deactivate"
                variant="outline"
              />
              <DangerRow
                title="Delete user"
                description="Permanent. Reassigns owned items."
                actionLabel="Delete"
                variant="destructive"
              />
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function SectionLabel({
  children,
  right,
}: {
  children: React.ReactNode
  right?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {children}
      </div>
      {right}
    </div>
  )
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string
  value: React.ReactNode
  sub: React.ReactNode
}) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium">{value}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  )
}

function SecurityRow({
  title,
  description,
  trailing,
}: {
  title: string
  description: string
  trailing?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between p-3">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      {trailing}
    </div>
  )
}

function ActivityItem({
  text,
  meta,
  tone,
}: {
  text: React.ReactNode
  meta: string
  tone?: "success" | "info"
}) {
  const dotClass =
    tone === "success" ? "bg-success" : tone === "info" ? "bg-info" : "bg-muted-foreground"
  return (
    <div className="flex items-start gap-3">
      <div className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", dotClass)} />
      <div className="min-w-0 flex-1">
        <div>{text}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{meta}</div>
      </div>
    </div>
  )
}

function DangerRow({
  title,
  description,
  actionLabel,
  variant,
}: {
  title: string
  description: string
  actionLabel: string
  variant: "outline" | "destructive"
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <Button
        size="sm"
        variant={variant}
        className={cn(
          variant === "outline" && "border-destructive/40 text-destructive hover:bg-destructive/10"
        )}
      >
        {actionLabel}
      </Button>
    </div>
  )
}

