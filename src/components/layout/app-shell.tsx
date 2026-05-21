import { Outlet, useLocation } from "react-router"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { Topbar } from "./topbar"
import { usePreferences } from "@/stores/preferences"
import { cn } from "@/lib/utils"

// Routes that own the entire inset frame and should not be wrapped in
// padding or have their own scroll context — they manage layout edge-to-edge.
function isFullBleedRoute(pathname: string) {
  if (pathname === "/sara" || pathname.startsWith("/admin")) return true
  // Incident / threat-intel / entity detail pages manage their own scroll and
  // layout edge-to-edge so they can host sticky headers + tabs.
  if (/^\/(incidents|threat-intel|entities)\/[^/]+(\/[nv]\d+)?$/.test(pathname)) return true
  return false
}

/**
 * Top-level shell that composes Sidebar + Topbar + the routed page.
 * Reads preferences (sidebar variant/collapsible, page layout) from the store.
 */
export function AppShell() {
  const sidebarVariant = usePreferences((s) => s.sidebarVariant)
  const sidebarCollapsible = usePreferences((s) => s.sidebarCollapsible)
  const pageLayout = usePreferences((s) => s.pageLayout)
  const sidebarOpen = usePreferences((s) => s.sidebarOpen)
  const setSidebarOpen = usePreferences((s) => s.setSidebarOpen)
  const { pathname } = useLocation()
  const fullBleed = isFullBleedRoute(pathname)

  return (
    <SidebarProvider
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
      style={{ "--sidebar-width": "17rem" } as React.CSSProperties}
    >
      <AppSidebar variant={sidebarVariant} collapsible={sidebarCollapsible} />
      {/* min-w-0 is critical: without it, flex children default to
          min-width:auto (= content width). A wide inner table with
          min-width set would push the entire page into horizontal
          scroll. With min-w-0 the inset shrinks to its allotted width
          and overflowing tables scroll inside their own container. */}
      <SidebarInset className="min-w-0 peer-data-[variant=inset]:border">
        <Topbar />
        {fullBleed ? (
          // Definite height (svh − topbar 3rem − inset margins 1rem − border/buffer 1rem)
          // so children can resolve `h-full` to a real number. Anything taller
          // is clipped, not pushed onto the outer scrollbar.
          <div className="h-[calc(100svh-5rem)] min-w-0 overflow-hidden">
            <Outlet />
          </div>
        ) : (
          <div className="min-w-0 flex-1 overflow-y-auto">
            <div
              className={cn(
                "h-full min-w-0 p-4 md:p-6",
                pageLayout === "centered" && "mx-auto w-full max-w-screen-2xl"
              )}
            >
              <Outlet />
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
