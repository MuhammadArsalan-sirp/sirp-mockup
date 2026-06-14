import { Link, NavLink, Outlet, useLocation } from "react-router"
import { LayoutDashboard } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TONE, type Tone } from "@/lib/tone"
import { adminTabs, type AdminTab, type AdminStatTile } from "./admin-nav-config"

/**
 * Old-SIRP-aligned Administration shell.
 *
 * Layout: top horizontal tab bar (7 tabs) + per-tab stats strip + per-tab
 * left sub-nav. Mirrors old SIRP's IA structure while keeping v3 visual
 * chemistry (tone palette, section cards, modern type ramp).
 */
export function AdminLayout() {
  const { pathname } = useLocation()
  const isOverview = pathname === "/admin" || pathname === "/admin/"

  // Resolve the active tab from the URL: /admin/{tabId}/...
  const activeTabId = pathname.startsWith("/admin/")
    ? pathname.replace(/^\/admin\//, "").split("/")[0]
    : ""
  const activeTab = adminTabs.find((t) => t.id === activeTabId)

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      {/* ── Top tab bar ── */}
      <div className="hidden h-11 shrink-0 items-stretch border-b bg-background lg:flex">
        <div className="-mb-px flex flex-1 items-end overflow-x-auto px-2">
          <Link
            to="/admin"
            className={cn(
              "inline-flex h-full items-center gap-1.5 border-b-2 px-3.5 text-[13px] font-medium whitespace-nowrap transition-colors",
              isOverview
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutDashboard className="size-3.5" />
            Overview
          </Link>

          {adminTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = tab.id === activeTab?.id
            const firstItem = tab.items[0]
            const defaultPath = firstItem ? `/admin/${tab.id}/${firstItem.id}` : `/admin/${tab.id}`
            return (
              <Link
                key={tab.id}
                to={defaultPath}
                className={cn(
                  "inline-flex h-full items-center gap-1.5 border-b-2 px-3.5 text-[13px] font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── Content canvas ── */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="min-w-0 p-4 md:p-6">
          {activeTab ? (
            <div className="space-y-5">
              {activeTab.stats && <TabStatsStrip stats={activeTab.stats} />}
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[210px_minmax(0,1fr)]">
                <TabSubNav tab={activeTab} />
                <div className="min-w-0">
                  <Outlet />
                </div>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  )
}

function TabSubNav({ tab }: { tab: AdminTab }) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-2 rounded-lg border bg-card p-2">
        <div className="px-2 pt-1 pb-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {tab.label}
          </span>
        </div>
        <nav className="space-y-0.5">
          {tab.items.map((item) => (
            <NavLink
              key={item.id}
              to={`/admin/${tab.id}/${item.id}`}
              className={({ isActive }) =>
                cn(
                  "flex h-8 items-center gap-2 rounded-md px-2 text-[13px] transition-colors",
                  isActive
                    ? "bg-accent font-medium text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )
              }
            >
              <span className="flex-1 truncate">{item.label}</span>
              {item.isV3Addition && (
                <span className="rounded-full border border-primary/25 bg-primary/10 px-1 text-[9px] font-semibold uppercase tracking-wider text-primary">
                  new
                </span>
              )}
              {item.meta && (
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                  {item.meta}
                </span>
              )}
              {item.status === "placeholder" && (
                <span className="size-1.5 rounded-full bg-muted-foreground/40" title="Placeholder" />
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}

function TabStatsStrip({ stats }: { stats: AdminStatTile[] }) {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2"
      style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}
    >
      {stats.map((s) => (
        <StatTile key={s.label} stat={s} />
      ))}
    </div>
  )
}

function StatTile({ stat }: { stat: AdminStatTile }) {
  const tone: Tone = stat.tone ?? "muted"
  return (
    <Card>
      <CardContent className="px-5 py-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {stat.label}
          </span>
          {stat.tone && stat.tone !== "muted" && (
            <span className={cn("size-1.5 shrink-0 rounded-full", TONE[tone].dot)} />
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-medium text-2xl leading-none tracking-tight tabular-nums">
            {stat.value}
          </span>
          {stat.unit && <span className="text-xs text-muted-foreground">{stat.unit}</span>}
        </div>
        {stat.caption && (
          <div className="mt-1.5 text-xs text-muted-foreground">{stat.caption}</div>
        )}
      </CardContent>
    </Card>
  )
}
