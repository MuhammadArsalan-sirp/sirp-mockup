import { Link } from "react-router"
import {
  AlertTriangle,
  Building,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Download,
  Lock,
  Mail,
  Plus,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import {
  adminActivity,
  adminAttention,
  systemHealth,
  type AdminAttentionItem,
} from "@/data/admin"

const attentionTone: Record<AdminAttentionItem["severity"], string> = {
  high: "bg-destructive/15 text-destructive",
  medium: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  low: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  info: "bg-secondary text-secondary-foreground",
}

const healthTone = {
  ok: { dot: "bg-success", pill: "bg-success/15 text-success", label: "Healthy" },
  warn: { dot: "bg-attention", pill: "bg-attention/15 text-attention", label: "Backed up" },
  err: { dot: "bg-destructive", pill: "bg-destructive/15 text-destructive", label: "Down" },
}

const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  UserPlus,
  ShieldCheck,
  RefreshCw,
  Lock,
  AlertTriangle,
  Plus,
  Building,
}

type QuickAction = {
  to: string
  icon: React.ReactNode
  title: string
  description: string
  badge?: { text: string; tone: "ok" | "warn" }
}

const quickActions: QuickAction[] = [
  {
    to: "/admin/users",
    icon: <UserPlus className="size-4" />,
    title: "Invite a user",
    description: "Send an email invite, assign role and groups.",
  },
  {
    to: "/admin/roles",
    icon: <ShieldCheck className="size-4" />,
    title: "Create a role",
    description: "Bundle permissions and assign to teams.",
  },
  {
    to: "/admin/sso",
    icon: <Lock className="size-4" />,
    title: "Configure SSO",
    description: "SAML, OIDC, or Active Directory.",
    badge: { text: "Setup", tone: "warn" },
  },
  {
    to: "/admin/email",
    icon: <Mail className="size-4" />,
    title: "Email server",
    description: "SMTP host, sender identity, test send.",
    badge: { text: "Verified", tone: "ok" },
  },
  {
    to: "/admin/org",
    icon: <Building className="size-4" />,
    title: "Organisation profile",
    description: "Logo, name, address, branding colours.",
  },
  {
    to: "/admin/incident-setup",
    icon: <AlertTriangle className="size-4" />,
    title: "Incident categories",
    description: "Categories, sub-categories, SLAs.",
  },
]

export function AdminOverviewPage() {
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
            <Badge variant="outline" className="gap-1.5 bg-success/10 text-success border-success/30 px-2.5 py-1">
              <span className="size-1.5 rounded-full bg-success" />
              All systems operational
            </Badge>
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile
          icon={<Users className="size-4" />}
          label="Active users"
          value="142"
          subValue="/ 150 seats"
          progress={{ value: 94.7, color: "var(--primary)" }}
          caption={
            <>
              8 seats remaining ·{" "}
              <span className="text-foreground">12 invites pending</span>
            </>
          }
        />
        <KpiTile
          icon={<CreditCard className="size-4" />}
          label="License"
          value="Enterprise"
          caption={
            <span className="flex items-center gap-2">
              <Badge className="bg-success/15 text-success rounded-full px-2 py-0.5 text-[10px]">
                Active
              </Badge>
              renews in <span className="text-foreground font-medium">213 days</span>
            </span>
          }
          subCaption={
            <>
              Expires <span className="font-mono text-foreground">2026-11-28</span>
            </>
          }
        />
        <KpiTile
          icon={<Lock className="size-4" />}
          label="MFA coverage"
          value="87%"
          trend="+4%"
          progress={{ value: 87, color: "var(--success)" }}
          caption={
            <>
              <span className="text-attention font-medium">18 users</span> without MFA
            </>
          }
        />
        <KpiTile
          icon={<RefreshCw className="size-4" />}
          label="Last backup"
          value="12m"
          subValue=" ago"
          caption={
            <span className="flex items-center gap-2">
              <Badge className="bg-success/15 text-success rounded-full px-2 py-0.5 text-[10px]">
                <CheckCircle2 className="size-2.5" />
                Success
              </Badge>
              <span className="font-mono">2.4 GB</span>
            </span>
          }
          subCaption="Next run in 48 minutes"
        />
      </div>

      {/* Quick actions + system health */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <section className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Quick actions</h2>
            <a className="text-xs text-muted-foreground hover:text-foreground" href="#">
              Customise →
            </a>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {quickActions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="group flex items-start gap-3 rounded-xl border bg-card p-4 transition hover:-translate-y-0.5 hover:border-foreground/20"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-secondary text-foreground">
                  {action.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium leading-tight">
                    {action.title}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
                {action.badge ? (
                  <Badge
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px]",
                      action.badge.tone === "ok"
                        ? "bg-success/15 text-success"
                        : "bg-attention/15 text-attention"
                    )}
                  >
                    {action.badge.text}
                  </Badge>
                ) : (
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                )}
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">System health</h2>
            <a className="text-xs text-muted-foreground hover:text-foreground" href="#">
              Details →
            </a>
          </div>
          <div className="divide-y rounded-xl border bg-card">
            {systemHealth.map((s) => {
              const tone = healthTone[s.status]
              return (
                <div key={s.id} className="p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                    <Badge className={cn("rounded-full px-2 py-0.5 text-[10px]", tone.pill)}>
                      <span className={cn("size-1.5 rounded-full", tone.dot)} />
                      {s.status === "warn" ? "Backed up" : tone.label}
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-base font-semibold tabular-nums">{s.metric}</div>
                    <span className="text-xs text-muted-foreground">{s.metricSub}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {/* Recent activity + needs attention */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <section className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent admin activity</h2>
            <Link
              to="/admin/logs"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              View all logs →
            </Link>
          </div>
          <div className="space-y-0.5 rounded-xl border bg-card p-2">
            {adminActivity.map((a) => {
              const Icon = activityIcons[a.icon] ?? AlertTriangle
              return (
                <div
                  key={a.id}
                  className="grid grid-cols-[28px_1fr_auto] items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-accent"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-md bg-secondary text-muted-foreground">
                    <Icon className="size-3.5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm leading-tight">{a.text}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {a.context}
                    </div>
                  </div>
                  <div className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                    {a.time}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Needs your attention</h2>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {adminAttention.length}
            </span>
          </div>
          <div className="divide-y rounded-xl border bg-card">
            {adminAttention.map((item) => {
              const body = (
                <>
                  <div className="mb-1 flex items-center gap-2">
                    <Badge
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] capitalize",
                        attentionTone[item.severity]
                      )}
                    >
                      {item.severity}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {item.category}
                    </span>
                  </div>
                  <div className="text-sm font-medium leading-tight">{item.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {item.description}
                  </div>
                </>
              )
              const className =
                "block p-4 transition-colors hover:bg-accent" +
                (item.href ? " focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" : "")
              return item.href ? (
                <Link key={item.id} to={item.href} className={className}>
                  {body}
                </Link>
              ) : (
                <div key={item.id} className={className}>
                  {body}
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Local KPI tile — admin-flavoured: optional progress bar and
// secondary captions slotted under the metric.
// ─────────────────────────────────────────────────────────────────
type KpiTileProps = {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  subValue?: React.ReactNode
  trend?: string
  progress?: { value: number; color: string }
  caption?: React.ReactNode
  subCaption?: React.ReactNode
}

function KpiTile({
  icon,
  label,
  value,
  subValue,
  trend,
  progress,
  caption,
  subCaption,
}: KpiTileProps) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2.5">
        <span className="grid size-7 shrink-0 place-items-center rounded-md border bg-secondary text-muted-foreground">
          {icon}
        </span>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-2xl font-bold tabular-nums tracking-tight">{value}</div>
        {subValue && (
          <span className="text-xs font-medium text-muted-foreground">{subValue}</span>
        )}
        {trend && (
          <span className="text-xs font-medium text-success">{trend}</span>
        )}
      </div>
      {progress && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full"
            style={{ width: `${progress.value}%`, background: progress.color }}
          />
        </div>
      )}
      {caption && (
        <div className="mt-2 text-xs text-muted-foreground">{caption}</div>
      )}
      {subCaption && (
        <div className="mt-1 text-xs text-muted-foreground">{subCaption}</div>
      )}
    </div>
  )
}
