import { Link, NavLink, Outlet, useLocation } from "react-router"
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { FLAT_NAV, NAV_GROUPS, findNavItem } from "./nav-config"

const BASE = "/design-system"

export function DesignSystemLayout() {
  const location = useLocation()
  const slug = location.pathname.replace(/^\/design-system\/?/, "").replace(/\/$/, "")
  const found = findNavItem(slug) ?? findNavItem("")
  const item = found?.item
  const index = found?.index ?? 0
  const prev = index > 0 ? FLAT_NAV[index - 1] : null
  const next = index < FLAT_NAV.length - 1 ? FLAT_NAV[index + 1] : null

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">

      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <header className="shrink-0 border-b bg-card">
        <div className="flex h-12 items-center gap-3 px-6">
          <Button variant="ghost" size="sm" asChild className="-ml-2 h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground">
            <Link to="/"><ArrowLeft className="size-3.5" />Back to app</Link>
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <div className="grid size-6 place-items-center rounded-md border border-primary/25 bg-linear-to-br from-primary/20 to-primary/5 text-primary">
            <Sparkles className="size-3" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold leading-tight">OmniSense Design System</div>
            <div className="text-[10px] leading-tight text-muted-foreground">Canonical tokens · primitives · patterns</div>
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">v1</Badge>
        </div>
      </header>

      {/* ── Body: sidebar + content ──────────────────────────────────── */}
      <div className="flex min-h-0 flex-1">

        {/* Sidebar */}
        <aside className="w-66 shrink-0 overflow-y-auto border-r bg-card/50">
          <nav className="space-y-5 p-4">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <div className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  {group.label}
                </div>
                <ul className="space-y-px">
                  {group.items.map((it) => {
                    const to = it.slug ? `${BASE}/${it.slug}` : BASE
                    return (
                      <li key={it.slug || "index"}>
                        <NavLink
                          to={to}
                          end={!it.slug}
                          className={({ isActive }) => cn(
                            "block rounded px-2 py-1.5 text-xs leading-snug transition",
                            isActive
                              ? "bg-primary/10 font-medium text-primary"
                              : "text-foreground/80 hover:bg-muted/40 hover:text-foreground",
                          )}
                        >
                          {it.title}
                        </NavLink>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-8 py-10">

            {/* Page header (driven by nav-config) */}
            {item && (
              <div className="mb-10">
                {item.group && (
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-primary/80">
                    {item.group}
                  </div>
                )}
                <h1 className="mt-1 text-3xl font-semibold tracking-tight">{item.title}</h1>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            )}

            {/* Routed content */}
            <Outlet />

            {/* Prev / Next pager */}
            <div className="mt-16 grid gap-3 border-t pt-8 sm:grid-cols-2">
              {prev ? (
                <Link
                  to={prev.slug ? `${BASE}/${prev.slug}` : BASE}
                  className="group flex flex-col items-start gap-1 rounded-lg border bg-card px-4 py-3 transition hover:border-primary/30 hover:bg-primary/3"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                    ← Previous
                  </span>
                  <span className="text-sm font-semibold text-foreground transition group-hover:text-primary">
                    {prev.title}
                  </span>
                </Link>
              ) : <div />}
              {next ? (
                <Link
                  to={next.slug ? `${BASE}/${next.slug}` : BASE}
                  className="group flex flex-col items-end gap-1 rounded-lg border bg-card px-4 py-3 text-right transition hover:border-primary/30 hover:bg-primary/3 sm:col-start-2"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                    Next →
                  </span>
                  <span className="text-sm font-semibold text-foreground transition group-hover:text-primary">
                    {next.title}
                  </span>
                </Link>
              ) : <div />}
            </div>

            {/* Bottom credit */}
            <div className="mt-8 text-[10px] text-muted-foreground/60">
              SIRP OmniSense Design System · maintained by the frontend team
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export { ArrowRight }
