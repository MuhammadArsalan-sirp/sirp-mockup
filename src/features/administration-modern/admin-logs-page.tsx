import { Fragment, useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  Bell,
  Box,
  Calendar,
  ChevronDown,
  ChevronRight,
  Download,
  Lock,
  RefreshCw,
  ScrollText,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import {
  adminLogs,
  countAdminLogsByTab,
  logHistogram,
  type AdminLogEvent,
  type AdminLogTab,
  type LogSeverity,
} from "@/data/admin"
import { AdminLogSheet } from "./admin-log-sheet"
import { AdminFiltersPopover, type AdminFilterGroups } from "./admin-filters-popover"
import { FilterBar } from "./admin-ui"
import { AlertCircle as IconAlert, FileText, Globe, KeyRound, Server, User as IconUser, ShieldCheck as IconShield, Tag, Wrench } from "lucide-react"

const LOG_FILTERS: AdminFilterGroups = [
  [
    {
      id: "severity",
      label: "Severity",
      icon: IconAlert,
      options: [
        { value: "error", label: "Error" },
        { value: "warn",  label: "Warn" },
        { value: "info",  label: "Info" },
        { value: "sara",  label: "SARA" },
      ],
    },
    {
      id: "actor",
      label: "Actor",
      icon: IconUser,
      options: [
        { value: "ahmed",  label: "Ahmed Khan" },
        { value: "sara",   label: "Sara Patel" },
        { value: "mariam", label: "Mariam Al-Saud" },
        { value: "system", label: "System" },
        { value: "sara-co", label: "SARA Co-Analyst" },
      ],
    },
    {
      id: "action",
      label: "Action",
      icon: Wrench,
      options: [
        { value: "create", label: "Create" },
        { value: "update", label: "Update" },
        { value: "delete", label: "Delete" },
        { value: "login",  label: "Sign-in" },
        { value: "export", label: "Export" },
      ],
    },
  ],
  [
    {
      id: "resourceType",
      label: "Resource type",
      icon: Tag,
      options: [
        { value: "incident",  label: "Incident" },
        { value: "user",      label: "User" },
        { value: "role",      label: "Role" },
        { value: "playbook",  label: "Playbook" },
        { value: "tenant",    label: "Tenant" },
      ],
    },
    {
      id: "source",
      label: "Source",
      icon: Globe,
      options: [
        { value: "ui",      label: "Web UI" },
        { value: "api",     label: "API" },
        { value: "webhook", label: "Webhook" },
        { value: "system",  label: "System" },
      ],
    },
  ],
  [
    {
      id: "ipRange",
      label: "IP range",
      icon: Server,
      options: [],
    },
    {
      id: "sso",
      label: "SSO provider",
      icon: KeyRound,
      options: [
        { value: "okta",   label: "Okta" },
        { value: "entra",  label: "Entra ID" },
        { value: "google", label: "Google Workspace" },
      ],
    },
    {
      id: "compliance",
      label: "Compliance scope",
      icon: IconShield,
      options: [
        { value: "pci",   label: "PCI-DSS" },
        { value: "hipaa", label: "HIPAA" },
        { value: "sox",   label: "SOX" },
      ],
    },
    {
      id: "export",
      label: "Export reason",
      icon: FileText,
      options: [],
    },
  ],
]

const severityPill: Record<LogSeverity, string> = {
  info: "border-primary/25 bg-primary/10 text-primary",
  warn: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  error: "border-destructive/25 bg-destructive/10 text-destructive",
  sara: "bg-secondary text-secondary-foreground",
}

const severityLabel: Record<LogSeverity, string> = {
  info: "INFO",
  warn: "WARN",
  error: "ERROR",
  sara: "SARA",
}

const severityBorder: Record<LogSeverity, string> = {
  info: "",
  warn: "border-l-2 border-amber-500",
  error: "border-l-2 border-destructive",
  sara: "",
}

const tabDefs: { id: AdminLogTab; label: string; icon: typeof ScrollText }[] = [
  { id: "activity", label: "Activity", icon: ScrollText },
  { id: "auth", label: "Authentication", icon: Lock },
  { id: "errors", label: "Errors", icon: AlertCircle },
  { id: "preingest", label: "Pre-ingestion", icon: Box },
  { id: "notifications", label: "Notifications", icon: Bell },
]

export function AdminLogsPage() {
  const [activeTab, setActiveTab] = useState<AdminLogTab>("activity")
  const [selectedEvent, setSelectedEvent] = useState<AdminLogEvent | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const tabCounts = useMemo(() => countAdminLogsByTab(), [])
  const totalMockEvents = adminLogs.length

  const filteredLogs = useMemo(
    () => adminLogs.filter((ev) => ev.logTab === activeTab),
    [activeTab]
  )

  const groupedByDay = useMemo(
    () =>
      filteredLogs.reduce<Record<string, AdminLogEvent[]>>((acc, ev) => {
        if (!acc[ev.day]) acc[ev.day] = []
        acc[ev.day].push(ev)
        return acc
      }, {}),
    [filteredLogs]
  )

  useEffect(() => {
    setSelectedEvent(null)
    setDrawerOpen(false)
  }, [activeTab])

  const today = "2026-04-29"

  const openEvent = (event: AdminLogEvent) => {
    setSelectedEvent(event)
    setDrawerOpen(true)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Activity Logs"
        description={
          <>
            Audit-grade record of every change, sign-in and system event in your
            workspace. Retention:{" "}
            <strong className="font-medium text-foreground">2 years</strong>.
          </>
        }
        actions={
          <>
            <Badge className="gap-1.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-50" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              Live tail
            </Badge>
            <Button variant="outline" size="sm" className="h-9">
              <Download className="size-4 text-muted-foreground" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <RefreshCw className="size-4 text-muted-foreground" />
              Refresh
            </Button>
            <Button size="sm" className="h-9">
              <Bell className="size-4" />
              Create alert
            </Button>
          </>
        }
      />

      {/* Histogram + stats */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5 lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Events · last 24 hours</div>
              <div className="text-xs text-muted-foreground">
                {totalMockEvents} sample events · histogram shows all streams · list is filtered by tab
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Legend dot="bg-chart-1" label="Activity" />
              <Legend dot="bg-amber-500" label="Auth fails" />
              <Legend dot="bg-destructive" label="Errors" />
            </div>
          </div>
          <div className="flex h-20 items-end gap-1">
            {logHistogram.map((h, idx) => {
              // Highlight a couple of bars with warn/alert tones
              const tone =
                idx === 11
                  ? "rgb(245 158 11)"
                  : idx === 22
                  ? "var(--destructive)"
                  : "var(--chart-1)"
              return (
                <div
                  key={idx}
                  className="flex-1 rounded-t-sm transition-opacity hover:opacity-70"
                  style={{ height: `${h}%`, background: tone }}
                />
              )
            })}
          </div>
          <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>now</span>
          </div>
        </div>

        <div className="space-y-3">
          <MiniStatCard
            label="Suspicious sign-ins"
            value="8"
            tone="warn"
            caption="From 3 unique IPs"
          />
          <MiniStatCard
            label="Errors (1h)"
            value="12"
            tone="alert"
            caption="0.04% error rate"
          />
          <MiniStatCard
            label="Top actor"
            value={<span className="text-sm font-medium">sara.patel@acme.com</span>}
            caption="428 events today"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="-mb-px flex items-center overflow-x-auto">
          {tabDefs.map((t) => {
            const Icon = t.icon
            const active = activeTab === t.id
            const count = tabCounts[t.id]
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  "inline-flex h-11 items-center gap-2 border-b-2 px-3.5 text-sm font-medium transition-colors",
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                {t.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 font-mono text-[10px]",
                    active
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {count.toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Filter bar */}
      <FilterBar>
        <div className="relative w-full md:w-80">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by actor, action, target, or query…"
            className="h-9 pl-9 pr-10"
          />
          <kbd className="absolute top-1/2 right-2 -translate-y-1/2 rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
            /
          </kbd>
        </div>
        <Button variant="outline" size="sm" className="h-9">
          <Calendar className="size-3.5 text-muted-foreground" />
          Last 24 hours
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground">
          Auto-refresh{" "}
          <span className="rounded bg-secondary px-1 text-[11px] tabular-nums">
            5s
          </span>
        </span>
        <AdminFiltersPopover groups={LOG_FILTERS} />
      </FilterBar>

      {/* Log list */}
      <div className="rounded-md border bg-card">
        {filteredLogs.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            No mock events for this stream yet.
          </div>
        ) : (
          Object.entries(groupedByDay).map(([day, events]) => (
            <Fragment key={day}>
              <DaySeparator day={day} isToday={day === today} />
              {events.map((ev) => {
                const isOpen = drawerOpen && selectedEvent?.id === ev.id
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => openEvent(ev)}
                    className={cn(
                      "grid w-full grid-cols-[152px_60px_1fr_120px_24px] items-center gap-3 border-t px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                      severityBorder[ev.severity],
                      severityBorder[ev.severity] && "px-[10px]",
                      isOpen && "bg-primary/8"
                    )}
                  >
                    <span className="font-mono text-xs text-muted-foreground">
                      {ev.time}
                    </span>
                    <Badge
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                        severityPill[ev.severity]
                      )}
                    >
                      {severityLabel[ev.severity]}
                    </Badge>
                    <div className="min-w-0 flex flex-wrap items-center gap-1.5 truncate">
                      <span className="font-medium">{ev.actor}</span>
                      <span className="text-muted-foreground">{ev.action}</span>
                      {ev.target && (
                        <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-secondary-foreground">
                          {ev.target}
                        </code>
                      )}
                      {ev.tag && (
                        <span className="rounded bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-secondary-foreground">
                          {ev.tag}
                        </span>
                      )}
                    </div>
                    <span className="whitespace-nowrap text-right font-mono text-xs text-muted-foreground">
                      {ev.ip}
                    </span>
                    <ChevronRight className="size-3.5 text-muted-foreground" />
                  </button>
                )
              })}
            </Fragment>
          ))
        )}
      </div>

      {/* Pagination footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing{" "}
          <span className="font-medium text-foreground">{filteredLogs.length}</span>{" "}
          of{" "}
          <span className="font-medium text-foreground">
            {tabCounts[activeTab].toLocaleString()}
          </span>{" "}
          in this tab (mock) · loaded in 84ms
        </div>
        <Button variant="outline" size="sm" className="h-8">
          <ChevronDown className="size-3.5 text-muted-foreground" />
          Load 50 more
        </Button>
      </div>

      <AdminLogSheet
        event={selectedEvent}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}

function DaySeparator({ day, isToday }: { day: string; isToday: boolean }) {
  return (
    <div className="flex items-center gap-3 border-t bg-muted/30 px-4 py-2 first:border-t-0">
      <div className="h-px flex-1 bg-border" />
      <div className="font-mono text-xs text-muted-foreground">
        {isToday ? "Today" : "Yesterday"} · {day}
      </div>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-2 rounded-sm", dot)} />
      {label}
    </span>
  )
}

function MiniStatCard({
  label,
  value,
  caption,
  tone,
}: {
  label: string
  value: React.ReactNode
  caption: string
  tone?: "alert" | "warn"
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 text-xl font-semibold tabular-nums",
          tone === "alert" && "text-destructive",
          tone === "warn" && "text-amber-600 dark:text-amber-400"
        )}
      >
        {value}
      </div>
      <div className="mt-0.5 text-xs text-muted-foreground">{caption}</div>
    </div>
  )
}

