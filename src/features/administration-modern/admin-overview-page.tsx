import { Link } from "react-router"
import {
  AlertTriangle,
  ArrowRight,
  Building,
  CheckCircle2,
  Database,
  Download,
  Lock,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
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
  KpiCard,
  StatusDot,
  ToneChip,
  ToneIcon,
  toneBars,
  type Tone,
} from "./admin-ui"
import { adminGroups } from "./admin-nav-sections"
import { cn } from "@/lib/utils"

const attentionTone: Record<AdminAttentionItem["severity"], Tone> = {
  high:   "alert",
  medium: "warn",
  low:    "info",
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
    : posture.band === "good" ? "info"
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
        <KpiCard
          icon={Users}
          tone="info"
          label="Active users"
          value="142"
          unit="/ 150 seats"
          caption="12 invites pending"
          progress={{ value: 94.7, tone: "info" }}
        />
        <KpiCard
          icon={Sparkles}
          tone="ok"
          label="License"
          value="Enterprise"
          caption={
            <span className="inline-flex items-center gap-1.5">
              <ToneChip tone="ok">Active</ToneChip>
              renews in <span className="text-foreground font-medium">213d</span>
            </span>
          }
        />
        <KpiCard
          icon={ShieldCheck}
          tone={bandTone}
          label="Security posture"
          value={posture.score}
          unit="/ 100"
          caption={
            <span className="inline-flex items-center gap-1.5">
              <ToneChip tone={bandTone} className="capitalize">{posture.band.replace("-", " ")}</ToneChip>
              <Link to="/admin-modern/posture" className="text-primary hover:underline">
                Review
              </Link>
            </span>
          }
          progress={{ value: posture.score, tone: bandTone }}
        />
        <KpiCard
          icon={Database}
          tone="ok"
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
          bodyPadding="none"
        >
          <div className="divide-y">
            {adminAttention.map((item) => {
              const tone = attentionTone[item.severity]
              const body = (
                <>
                  <span className={cn("absolute inset-y-0 left-0 w-0.5", toneBars[tone])} />
                  <div className="mb-1 flex items-center gap-2">
                    <ToneChip tone={tone} className="capitalize">{item.severity}</ToneChip>
                    <span className="text-[11px] text-muted-foreground">{item.category}</span>
                  </div>
                  <div className="text-sm font-medium leading-tight">{item.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{item.description}</div>
                </>
              )
              const cls = "relative block px-5 py-3 transition-colors hover:bg-accent"
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
              to="/admin-modern/health"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Details →
            </Link>
          }
          bodyPadding="none"
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
        bodyPadding="none"
        action={
          <Link
            to="/admin-modern/logs"
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

      {/* Browse settings by area */}
      <div className="space-y-2">
        <h2 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Browse settings
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {adminGroups.map((group, idx) => {
            const tone: Tone = (["info", "ok", "warn", "muted"] as const)[idx % 4]
            return <GroupCard key={group.id} group={group} tone={tone} />
          })}
        </div>
      </div>
    </div>
  )
}

function GroupCard({
  group,
  tone,
}: {
  group: (typeof adminGroups)[number]
  tone: Tone
}) {
  const firstItem = group.items[0]
  return (
    <Link
      to={firstItem.to}
      className="group flex h-full flex-col rounded-xl border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-accent/40"
    >
      <div className="flex items-start justify-between gap-3">
        <ToneIcon icon={group.icon} tone={tone} />
        <ArrowRight className="size-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>
      <div className="mt-3 text-sm font-semibold leading-tight">{group.label}</div>
      <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{group.blurb}</div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {group.items.slice(0, 4).map((item) => (
          <span
            key={item.to}
            className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
          >
            <item.icon className="size-2.5" />
            {item.label}
          </span>
        ))}
        {group.items.length > 4 && (
          <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            +{group.items.length - 4}
          </span>
        )}
      </div>
    </Link>
  )
}

