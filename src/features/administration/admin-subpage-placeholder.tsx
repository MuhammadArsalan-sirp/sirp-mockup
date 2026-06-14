import { useParams } from "react-router"
import { Construction, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { getTab } from "./admin-nav-config"

/**
 * Placeholder rendered for sub-pages whose detailed UI hasn't been
 * implemented yet in v3. Shows the right title, the tab context, and
 * a "Coming soon" empty state. Keeps the IA navigable while we focus
 * detailed work on the high-priority sub-pages.
 */
export function AdminSubPagePlaceholder() {
  const { tab: tabId, page: pageId } = useParams<{ tab: string; page: string }>()
  const tab = tabId ? getTab(tabId) : undefined
  const subPage = tab?.items.find((i) => i.id === pageId)

  const title = subPage?.label ?? "Settings page"
  const tabLabel = tab?.label ?? "Administration"

  return (
    <div className="space-y-5">
      <PageHeader
        title={title}
        description={
          <>
            {tabLabel} · This sub-page reuses existing master-data endpoints.
            Detailed UI lands in a follow-up pass.
          </>
        }
        actions={
          <Button size="sm" className="h-9" disabled>
            <Plus className="size-4" />
            New {title.toLowerCase()}
          </Button>
        }
      />

      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/20 px-6 py-16 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground">
          <Construction className="size-6" />
        </span>
        <p className="max-w-md text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{title}</span> renders here.
          The IA, breadcrumbs and shell all work — the list/form UI for this
          specific master-data type is queued for a later iteration.
        </p>
      </div>
    </div>
  )
}
