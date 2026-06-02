import { Link, Outlet, useLocation } from "react-router"
import { LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"
import { AdminMobileNav } from "./admin-mobile-nav"
import { AdminSubNav } from "./admin-sub-nav"
import { adminTabs } from "./admin-nav-sections"

/**
 * Administration sub-app shell.
 *
 * Top bar mirrors the production 7-tab structure. The sub-nav renders as a
 * boxed card inside the canvas (no full-bleed left rail) — closer to the
 * production SIRP layout.
 */
export function AdminLayout() {
  const { pathname } = useLocation()

  const activeTab = adminTabs.find((tab) =>
    tab.items.some(
      (item) => pathname === item.to || pathname.startsWith(item.to + "/")
    )
  )

  const subNavItems = activeTab?.items ?? []
  const hasSubNav = subNavItems.length > 1
  const isOverview = pathname === "/admin"

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      {/* ── Desktop header: production-style tab bar (full width) ── */}
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
            return (
              <Link
                key={tab.id}
                to={tab.defaultPath}
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
          <AdminMobileNav />

          {hasSubNav ? (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[210px_minmax(0,1fr)]">
              <AdminSubNav items={subNavItems} sectionLabel={activeTab?.label} />
              <div className="min-w-0">
                <Outlet />
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
