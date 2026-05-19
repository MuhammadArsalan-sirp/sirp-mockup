import { useState } from "react"
import { Link, Outlet, useLocation } from "react-router"
import { LayoutDashboard, PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AdminMobileNav } from "./admin-mobile-nav"
import { AdminSubNav } from "./admin-sub-nav"
import { adminTabs } from "./admin-nav-sections"

/**
 * Administration sub-app shell.
 *
 * Top bar mirrors the production 7-tab structure so admins feel at home.
 * Left rail appears only for tabs that have multiple sub-pages (Organizations,
 * Access Control, Product Settings). Single-page tabs navigate directly.
 */
export function AdminLayout() {
  const [adminNavOpen, setAdminNavOpen] = useState(true)
  const { pathname } = useLocation()

  const activeTab = adminTabs.find((tab) =>
    tab.items.some(
      (item) => pathname === item.to || pathname.startsWith(item.to + "/")
    )
  )

  // Only show sub-nav when the active tab has more than one page.
  const subNavItems = (activeTab?.items.length ?? 0) > 1 ? (activeTab?.items ?? []) : []
  const hasSubNav = subNavItems.length > 0

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden">
      <AdminSubNav open={adminNavOpen && hasSubNav} items={subNavItems} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* ── Desktop header: toggle + production-style tab bar ── */}
        <div className="hidden h-11 shrink-0 items-stretch border-b lg:flex">
          {/* Rail toggle — only meaningful when sub-nav exists */}
          <div className="flex shrink-0 items-center border-r px-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "size-8 text-muted-foreground transition-opacity",
                !hasSubNav && "pointer-events-none opacity-30"
              )}
              title={adminNavOpen ? "Hide navigation" : "Show navigation"}
              aria-expanded={adminNavOpen}
              aria-controls="admin-sub-nav"
              tabIndex={hasSubNav ? 0 : -1}
              onClick={() => setAdminNavOpen((o) => !o)}
            >
              <PanelLeft className="size-4" />
            </Button>
          </div>

          {/* Tab strip — mirrors production tab order */}
          <div className="-mb-px flex items-end overflow-x-auto">
            <Link
              to="/admin"
              className={cn(
                "inline-flex h-full items-center gap-1.5 border-b-2 px-3.5 text-sm font-medium whitespace-nowrap transition-colors",
                pathname === "/admin"
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
                    "inline-flex h-full items-center gap-1.5 border-b-2 px-3.5 text-sm font-medium whitespace-nowrap transition-colors",
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

        {/* ── Content area ── */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="min-w-0 p-4 md:p-6">
            <AdminMobileNav />
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
