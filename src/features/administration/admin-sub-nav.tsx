import { NavLink } from "react-router"
import { cn } from "@/lib/utils"
import type { AdminNavItemConfig } from "./admin-nav-sections"

type Props = {
  /** When false, the rail collapses. */
  open: boolean
  /** Items for the currently active tab. Empty = no rail rendered. */
  items: AdminNavItemConfig[]
}

export function AdminSubNav({ open, items }: Props) {
  if (items.length === 0) return null

  return (
    <aside
      id="admin-sub-nav"
      className={cn(
        "hidden min-h-0 shrink-0 flex-col overflow-hidden border-r bg-background transition-[width,opacity] duration-200 ease-out lg:flex",
        open
          ? "w-52 border-border opacity-100"
          : "pointer-events-none w-0 border-r-0 opacity-0"
      )}
    >
      <nav className="min-h-0 w-52 flex-1 space-y-0.5 overflow-y-auto px-1.5 py-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex h-8 items-center gap-2 rounded-md px-2.5 text-[13px] transition-colors",
                isActive
                  ? "bg-accent font-medium text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )
            }
          >
            <item.icon className="size-4 shrink-0" />
            <span className="flex-1 truncate">{item.label}</span>
            {item.meta && (
              <span className="font-mono text-[11px] text-muted-foreground">{item.meta}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
