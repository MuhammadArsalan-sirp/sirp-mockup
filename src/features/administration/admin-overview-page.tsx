import { Link } from "react-router"
import {
  AlertTriangle,
  Building,
  CheckCircle2,
  CreditCard,
  Download,
  KeyRound,
  Lock,
  Plus,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import {
  adminActivity,
  adminAttention,
  computePostureScore,
  postureChecks,
  systemHealth,
  type AdminAttentionItem,
} from "@/data/admin"
import {
  DataCard,
  SectionLabel,
  StatusDot,
  ToneChip,
  type Tone,
} from "./admin-ui"

const attentionTone: Record<AdminAttentionItem["severity"], Tone> = {
  high:   "alert",
  medium: "warn",
  low:    "primary",
  info:   "muted",
}

const activityIcons: Record<string, LucideIcon> = {
  UserPlus,
  ShieldCheck,
  RefreshCw,
  Lock,
  AlertTriangle,
  Plus,
  Building,
}

const healthDotTone: Record<"ok" | "warn" | "err", Tone> = {
  ok:   "ok",
  warn: "warn",
  err:  "alert",
}

const healthLabel: Record<"ok" | "warn" | "err", string> = {
  ok: "Healthy",
  warn: "Degraded",
  err: "Down",
}

export function AdminOverviewPage() {
  const posture = computePostureScore(postureChecks)
  const bandTone: Tone =
    posture.band === "excellent" ? "ok"
    : posture.band === "good" ? "primary"
    : posture.band === "fair" ? "warn"
    : "alert"

  return (
    <div className="space-y-5">
      <PageHeader
        title="Administration"
        description={
          <>
            Manage users, access, organisation settings and system health for{" "}
            <strong className="font-medium text-foreground">Acme Corp</strong>.
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9">
              <Download className="size-4 text-muted-foreground" />
              Export config
            </Button>
            <Button size="sm" className="h-9">
              <UserPlus className="size-4" />
              Invite user
            </Button>
          </>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          label="Active users"
          value="142"
          unit="/ 150 seats"
          caption="12 invites pending"
          progress={{ value: 94.7, tone: "primary" }}
        />
        <Kpi
          label="License"
          value="Enterprise"
          caption={
            <span className="inline-flex items-center gap-1.5">
              <ToneChip tone="ok">Active</ToneChip>
              renews in <span className="text-foreground font-medium">213d</span>
            </span>
          }
        />
        <Kpi
          label="Security posture"
          value={posture.score}
          unit="/ 100"
          caption={
            <span className="inline-flex items-center gap-1.5">
              <ToneChip tone={bandTone} className="capitalize">{posture.band.replace("-", " ")}</ToneChip>
              <Link to="/admin/posture" className="text-primary hover:underline">
                Review
              </Link>
            </span>
          }
          progress={{ value: posture.score, tone: bandTone }}
        />
        <Kpi
          label="Last backup"
          value="12m"
          unit="ago"
          caption={
            <span className="inline-flex items-center gap-1.5">
              <ToneChip tone="ok" icon={CheckCircle2}>Success</ToneChip>
              <span className="font-mono">2.4 GB</span>
            </span>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Needs attention */}
        <DataCard
          title="Needs attention"
          icon={AlertTriangle}
          count={adminAttention.length}
          className="lg:col-span-2"
          contentClassName="px-0 py-0 pt-3"
        >
          <div className="divide-y">
            {adminAttention.map((item) => {
              const tone = attentionTone[item.severity]
              const body = (
                <>
                  <div className="mb-1 flex items-center gap-2">
                    <ToneChip tone={tone} className="capitalize">{item.severity}</ToneChip>
                    <span className="text-[11px] text-muted-foreground">{item.category}</span>
                  </div>
                  <div className="text-sm font-medium leading-tight">{item.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{item.description}</div>
                </>
              )
              const cls = "block px-5 py-3 transition-colors hover:bg-accent"
              return item.href ? (
                <Link key={item.id} to={item.href} className={cls}>{body}</Link>
              ) : (
                <div key={item.id} className={cls}>{body}</div>
              )
            })}
          </div>
        </DataCard>

        {/* Service health */}
        <DataCard
          title="Service health"
          icon={CheckCircle2}
          action={
            <Link
              to="/admin/health"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Details →
            </Link>
          }
          contentClassName="px-0 py-0 pt-3"
        >
          <div className="divide-y">
            {systemHealth.map((s) => {
              const tone = healthDotTone[s.status]
              return (
                <div key={s.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                  <div className="flex items-center gap-2">
                    <StatusDot tone={tone} />
                    <span className="text-sm font-medium">{s.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-sm tabular-nums">{s.metric}</span>
                    <ToneChip tone={tone} className="ml-1">
                      {healthLabel[s.status]}
                    </ToneChip>
                  </div>
                </div>
              )
            })}
          </div>
        </DataCard>
      </div>

      {/* Recent activity */}
      <DataCard
        title="Recent admin activity"
        icon={RefreshCw}
        contentClassName="px-0 py-0 pt-3"
        action={
          <Link
            to="/admin/logs"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            View all logs →
          </Link>
        }
      >
        <div className="divide-y">
          {adminActivity.slice(0, 6).map((a) => {
            const Icon = activityIcons[a.icon] ?? AlertTriangle
            return (
              <div
                key={a.id}
                className="grid grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-3 px-5 py-2.5"
              >
                <Icon className="size-3.5 text-muted-foreground" />
                <div className="min-w-0">
                  <div className="text-sm leading-tight">{a.text}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{a.context}</div>
                </div>
                <div className="whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                  {a.time}
                </div>
              </div>
            )
          })}
        </div>
      </DataCard>

      {/* Shortcuts */}
      <DataCard title="Quick links" icon={CreditCard} contentClassName="px-0 py-0 pt-3">
        <div className="grid grid-cols-2 divide-x divide-y sm:grid-cols-4">
          <Shortcut to="/admin/users"   icon={Users}       label="Users"     hint="142 active" />
          <Shortcut to="/admin/roles"   icon={ShieldCheck} label="Roles"     hint="12 roles" />
          <Shortcut to="/admin/sso"     icon={KeyRound}    label="SSO"       hint="Okta, Entra" />
          <Shortcut to="/admin/license" icon={CreditCard}  label="License"   hint="Enterprise" />
        </div>
      </DataCard>
    </div>
  )
}

function Kpi({
  label,
  value,
  unit,
  caption,
  progress,
}: {
  label: string
  value: React.ReactNode
  unit?: React.ReactNode
  caption?: React.ReactNode
  progress?: { value: number; tone: Tone }
}) {
  return (
    <Card>
      <CardContent className="px-5 py-4">
        <SectionLabel>{label}</SectionLabel>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-medium text-2xl leading-none tracking-tight tabular-nums">{value}</span>
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        </div>
        {progress && (
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full",
                progress.tone === "ok" && "bg-emerald-500",
                progress.tone === "warn" && "bg-amber-500",
                progress.tone === "alert" && "bg-destructive",
                progress.tone === "primary" && "bg-primary",
                progress.tone === "muted" && "bg-muted-foreground/40"
              )}
              style={{ width: `${Math.min(100, Math.max(0, progress.value))}%` }}
            />
          </div>
        )}
        {caption && <div className="mt-2 text-xs text-muted-foreground">{caption}</div>}
      </CardContent>
    </Card>
  )
}

function Shortcut({
  to,
  icon: Icon,
  label,
  hint,
}: {
  to: string
  icon: LucideIcon
  label: string
  hint: string
}) {
  return (
    <Link to={to} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50">
      <Icon className="size-4 text-muted-foreground" />
      <div className="min-w-0">
        <div className="text-sm font-medium leading-tight">{label}</div>
        <div className="text-[11px] text-muted-foreground">{hint}</div>
      </div>
    </Link>
  )
}
