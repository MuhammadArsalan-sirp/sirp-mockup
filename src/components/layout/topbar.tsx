import { Moon, Search, Sun } from "lucide-react"
import { Link, useLocation } from "react-router"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePreferences } from "@/stores/preferences"
import { SirpLogo } from "@/components/shared/brand-logo"
import { PreferencesPopover } from "./preferences/preferences-popover"
import { NotificationsPopover } from "./notifications-popover"
import { navSections } from "./nav-config"

// ── Admin sub-page titles ────────────────────────────────────────
const adminSegments: Record<string, string> = {
  users: "Users",
  groups: "Groups & teams",
  roles: "Roles",
  org: "Organisation",
  logs: "Audit logs",
  departments: "Departments",
  tenants: "Tenants",
  "incident-setup": "Incident setup",
  "threat-intel-setup": "Threat intel setup",
  "master-data": "Master data",
  sso: "SSO & SAML",
  sessions: "Session policy",
  email: "Email",
  templates: "Templates",
  license: "Licences",
  health: "Server health",
  backup: "Backup & restore",
}

/**
 * Walk navSections to resolve a breadcrumb for the current path.
 * Returns { parent, current } where parent is the section label (or parent
 * item title for nested routes) and current is the active page title.
 */
function resolveBreadcrumb(pathname: string): { parent: string; current: string } {
  // Incident detail — dynamic segment under /incidents/:id
  if (pathname.startsWith("/incidents/")) {
    const parts = pathname.split("/").filter(Boolean)
    // incidents, :id, optional v1|v2|v3
    const incidentId = parts[1] ?? ""
    const mock = parts[2]
    if (mock === "v1")
      return { parent: "Incidents", current: `${incidentId} · Dossier` }
    if (mock === "v2")
      return { parent: "Incidents", current: `${incidentId} · Bento` }
    if (mock === "v3")
      return { parent: "Incidents", current: `${incidentId} · Focus` }
    return { parent: "Incidents", current: incidentId || "Incident" }
  }
  // Administration — exact index vs /admin/:section
  if (pathname === "/admin" || pathname === "/admin/") {
    return { parent: "Administration", current: "Overview" }
  }
  if (pathname.startsWith("/admin/")) {
    const seg = pathname.split("/")[2] ?? ""
    return { parent: "Administration", current: adminSegments[seg] ?? "Administration" }
  }

  for (const section of navSections) {
    for (const item of section.items) {
      // Check nested children first (more specific matches win)
      if (item.children) {
        for (const child of item.children) {
          const isActive =
            child.url === pathname ||
            (child.url !== "/" && pathname.startsWith(`${child.url}/`))
          if (isActive) {
            return { parent: item.title, current: child.title }
          }
        }
      }
      // Match the item itself
      const isActive =
        item.url === "/"
          ? pathname === "/"
          : pathname === item.url ||
            pathname.startsWith(`${item.url}/`)
      if (isActive) {
        return { parent: section.label, current: item.title }
      }
    }
  }

  return { parent: "", current: "" }
}

export function Topbar() {
  const { pathname } = useLocation()
  const themeMode = usePreferences((s) => s.themeMode)
  const toggleTheme = usePreferences((s) => s.toggleTheme)
  const navbarBehavior = usePreferences((s) => s.navbarBehavior)

  const { parent, current } = resolveBreadcrumb(pathname)

  const isDark =
    themeMode === "dark" ||
    (themeMode === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <header
      data-navbar={navbarBehavior}
      className={
        navbarBehavior === "sticky"
          ? "sticky top-0 z-50 flex h-12 shrink-0 items-center gap-4 overflow-hidden rounded-t-[inherit] border-b bg-background/50 px-4 backdrop-blur-md md:px-6"
          : "flex h-12 shrink-0 items-center gap-4 border-b px-4 md:px-6"
      }
    >
      <Link to="/" className="shrink-0 text-foreground" aria-label="SIRP">
        <SirpLogo className="h-5 w-auto" />
      </Link>
      <div className="flex items-center gap-2">
        <Separator
          orientation="vertical"
          className="data-[orientation=vertical]:h-4"
        />
        <SidebarTrigger />
        <Separator
          orientation="vertical"
          className="data-[orientation=vertical]:h-4"
        />
      </div>
      <nav className="flex items-center gap-1.5 text-sm min-w-0">
        {parent && (
          <>
            <span className="shrink-0 text-muted-foreground">{parent}</span>
            <span className="text-muted-foreground">/</span>
          </>
        )}
        <span className="truncate font-medium">{current}</span>
      </nav>
      <div className="ml-auto flex items-center gap-1">
        <button className="hidden md:flex items-center gap-2 h-9 px-3 mr-1 rounded-md border bg-background text-muted-foreground text-sm hover:text-foreground hover:bg-accent w-[260px]">
          <Search className="size-3.5" />
          <span>Search across SIRP…</span>
          <kbd className="ml-auto text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
        <PreferencesPopover />
        <NotificationsPopover />
      </div>
    </header>
  )
}
