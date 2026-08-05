import { NavLink, Outlet } from "react-router"
import { LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"
import { AdminMobileNav } from "./admin-mobile-nav"
import { adminGroups } from "./admin-nav-sections"
import { AdminSaraDock } from "./admin-sara-dock"

/**
 * Administration sub-app shell.
 *
 * Single full-height left rail (no top tab bar). Groups are non-collapsible
 * — every item is one click away, like Linear / Vercel settings.
 */
export function AdminLayout() {
  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden">
      {/* ── Left rail ── */}
      <aside className="hidden h-full w-60 shrink-0 border-r bg-background lg:flex lg:flex-col">
        <div className="border-b px-4 py-3">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Administration
          </div>
          <div className="mt-0.5 truncate text-sm font-medium">Acme Corp</div>
        </div>

        <div className="flex-1 overflow-y-auto py-3">
          <RailItem
            to="/admin-modern"
            label="Overview"
            icon={LayoutDashboard}
            end
          />

          {adminGroups.map((group) => (
            <div key={group.id} className="mt-4 px-2">
              <div className="flex items-center gap-1.5 px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                <group.icon className="size-3" />
                {group.label}
              </div>
              <nav className="space-y-0.5">
                {group.items.map((item) => (
                  <RailItem
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    icon={item.icon}
                    meta={item.meta}
                  />
                ))}
              </nav>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Content ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="min-w-0 p-4 md:p-6">
            <AdminMobileNav />
            <Outlet />
          </div>
        </div>
      </div>

      <AdminSaraDock />
    </div>
  )
}

function RailItem({
  to,
  label,
  icon: Icon,
  meta,
  end,
}: {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  meta?: string
  end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "mx-2 flex h-8 items-center gap-2 rounded-md px-2 text-[13px] transition-colors",
          isActive
            ? "bg-accent font-medium text-foreground"
            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
        )
      }
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {meta && (
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground/80">
          {meta}
        </span>
      )}
    </NavLink>
  )
}
