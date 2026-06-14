import { Link, useLocation } from "react-router"
import { ArrowLeft, Construction } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { getAdminPlaceholderCopy } from "./admin-placeholder-copy"

/**
 * Lightweight stand-in for admin routes that are not fully mocked yet.
 * Avoids dead NavLinks while keeping IA discoverable.
 */
export function AdminPlaceholderPage() {
  const { pathname } = useLocation()
  const segment = pathname.replace(/^\/admin\/?/, "").split("/")[0] ?? ""
  const { title, description } = getAdminPlaceholderCopy(segment)

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button variant="outline" size="sm" className="h-9" asChild>
            <Link to="/admin" className="inline-flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Overview
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 py-16 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground">
          <Construction className="size-6" />
        </span>
        <p className="mt-4 max-w-md text-sm text-muted-foreground">
          This route is reserved in the v3 mock. Navigation and breadcrumbs work;
          interactive forms and tables will be added when this slice is prioritised.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button variant="secondary" size="sm" asChild>
            <Link to="/admin/users">Users</Link>
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <Link to="/admin/roles">Roles</Link>
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <Link to="/admin/logs">Activity logs</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
