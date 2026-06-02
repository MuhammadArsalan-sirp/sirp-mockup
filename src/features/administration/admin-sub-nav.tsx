import { NavLink } from "react-router"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { AdminNavItemConfig } from "./admin-nav-sections"

type Props = {
  /** Items for the currently active tab. */
  items: AdminNavItemConfig[]
  /** Section title (the active tab label). */
  sectionLabel?: string
}

/**
 * Boxed, in-canvas side nav for the active admin tab. Lives inside the page
 * padding, not full-bleed against the screen edge.
 */
export function AdminSubNav({ items, sectionLabel }: Props) {
  if (items.length === 0) return null

  return (
    <aside id="admin-sub-nav" className="hidden lg:block">
      <Card className="sticky top-2">
        <CardContent className="px-2 py-2">
          <div className="px-2 pt-1 pb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {sectionLabel ?? "Section"}
            </span>
          </div>
          <nav className="space-y-0.5">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex h-8 items-center gap-2 rounded-md px-2 text-[13px] transition-colors",
                    isActive
                      ? "bg-accent font-medium text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )
                }
              >
                <item.icon className="size-3.5 shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {item.meta && (
                  <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                    {item.meta}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </CardContent>
      </Card>
    </aside>
  )
}
