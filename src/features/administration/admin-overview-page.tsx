import { Link } from "react-router"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Database,
  Download,
  RefreshCw,
  ShieldCheck,
  Sparkles,
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
import { TONE, type Tone } from "@/lib/tone"
import { adminTabs } from "./admin-nav-config"

const attentionTone: Record<AdminAttentionItem["severity"], Tone> = {
  high:   "alert",
  medium: "warn",
  low:    "info",
  info:   "muted",
}

const healthDotTone: Record<"ok" | "warn" | "err", Tone> = {
  ok: "ok", warn: "warn", err: "alert",
}

const healthLabel: Record<"ok" | "warn" | "err", string> = {
  ok: "Healthy", warn: "Degraded", err: "Down",
}

const activityIcons: Record<string, LucideIcon> = {
  UserPlus, ShieldCheck, RefreshCw, AlertTriangle, Users,
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
            Configure organisation settings, access, master data, integrations and
            audit for <strong className="font-medium text-foreground">Acme Corp</strong>.
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
        <KpiTile icon={Users}        tone="info" label="Active users"     value="142" unit="/ 150 seats" caption="12 invites pending" />
        <KpiTile icon={Sparkles}     tone="ok"   label="License"          value="Enterprise"           caption="Renews in 213d" />
        <KpiTile icon={ShieldCheck}  tone={bandTone} label="Security posture" value={posture.score} unit="/ 100" caption={`Band: ${posture.band.replace("-", " ")}`} />
        <KpiTile icon={Database}     tone="ok"   label="Last backup"      value="12m"     unit="ago"   caption="2.4 GB · success" />
      </div>

      {/* Needs attention + Service health */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <CardContent className="p-0">
            <SectionHeader icon={AlertTriangle} title="Needs attention" count={adminAttention.length} />
            <div className="divide-y">
              {adminAttention.map((item) => {
                const tone = attentionTone[item.severity]
                return (
                  <div key={item.id} className="relative block px-5 py-3 transition-colors hover:bg-accent">
                    <span className={cn("absolute inset-y-0 left-0 w-0.5", TONE[tone].bar)} />
                    <div className="mb-1 flex items-center gap-2">
                      <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize", TONE[tone].chip)}>
                        {item.severity}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{item.category}</span>
                    </div>
                    <div className="text-sm font-medium leading-tight">{item.title}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{item.description}</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <SectionHeader
              icon={CheckCircle2}
              title="Service health"
              action={
                <Link to="/admin/product-settings/server-health" className="text-xs text-muted-foreground hover:text-foreground">
                  Details →
                </Link>
              }
            />
            <div className="divide-y">
              {systemHealth.map((s) => {
                const tone = healthDotTone[s.status]
                return (
                  <div key={s.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={cn("size-1.5 rounded-full", TONE[tone].dot)} />
                      <span className="text-sm font-medium">{s.label}</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-sm tabular-nums">{s.metric}</span>
                      <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ml-1", TONE[tone].chip)}>
                        {healthLabel[s.status]}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent admin activity */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <SectionHeader
            icon={RefreshCw}
            title="Recent admin activity"
            action={
              <Link to="/admin/logs/activity" className="text-xs text-muted-foreground hover:text-foreground">
                View all logs →
              </Link>
            }
          />
          <div className="divide-y">
            {adminActivity.slice(0, 6).map((a) => {
              const Icon = activityIcons[a.icon] ?? AlertTriangle
              return (
                <div key={a.id} className="grid grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-3 px-5 py-2.5">
                  <Icon className="size-3.5 text-muted-foreground" />
                  <div className="min-w-0">
                    <div className="text-sm leading-tight">{a.text}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{a.context}</div>
                  </div>
                  <div className="whitespace-nowrap font-mono text-[11px] text-muted-foreground">{a.time}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Browse tabs (compact — just 7 links, no group cards) */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <SectionHeader icon={ArrowRight} title="Browse administration" />
          <div className="grid grid-cols-2 divide-x divide-y sm:grid-cols-4 lg:grid-cols-7">
            {adminTabs.map((tab) => {
              const first = tab.items[0]
              const to = first ? `/admin/${tab.id}/${first.id}` : `/admin/${tab.id}`
              return (
                <Link
                  key={tab.id}
                  to={to}
                  className="flex flex-col items-start gap-1.5 p-4 transition-colors hover:bg-accent/40"
                >
                  <tab.icon className="size-4 text-muted-foreground" />
                  <div className="text-sm font-medium leading-tight">{tab.label}</div>
                  <div className="text-[10px] text-muted-foreground">{tab.items.length} sections</div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function KpiTile({
  icon: Icon,
  tone,
  label,
  value,
  unit,
  caption,
}: {
  icon: LucideIcon
  tone: Tone
  label: string
  value: React.ReactNode
  unit?: React.ReactNode
  caption?: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
          <span className={cn("grid size-7 shrink-0 place-items-center rounded-md border", TONE[tone].chip)}>
            <Icon className="size-3.5" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-medium text-2xl leading-none tracking-tight tabular-nums">{value}</span>
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        </div>
        {caption && <div className="mt-2 text-xs text-muted-foreground">{caption}</div>}
      </CardContent>
    </Card>
  )
}

function SectionHeader({
  icon: Icon,
  title,
  count,
  action,
}: {
  icon: LucideIcon
  title: string
  count?: number | string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b px-5 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Icon className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{title}</span>
        {count !== undefined && (
          <span className="font-mono text-xs tabular-nums text-muted-foreground/70">{count}</span>
        )}
      </div>
      {action}
    </div>
  )
}
