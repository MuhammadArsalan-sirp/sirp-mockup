import { useMemo, useState } from "react"
import { useParams } from "react-router"
import {
  Construction,
  Download,
  Edit,
  Filter,
  Lock,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import { TONE, type Tone } from "@/lib/tone"
import { getTab } from "./admin-nav-config"
import { getMasterDataConfig, type MasterDataConfig, type MasterDataRow } from "./admin-master-data-content"

/**
 * Generic master-data list rendered for any /admin/{tab}/{page} route
 * that has a config in admin-master-data-content. Each page = a list of
 * named entries with name, description, optional badge, optional metric,
 * managed flag, and updated timestamp.
 */
export function AdminMasterDataPage() {
  const { tab: tabId, page: pageId } = useParams<{ tab: string; page: string }>()
  const tab = tabId ? getTab(tabId) : undefined
  const config = tabId && pageId ? getMasterDataConfig(tabId, pageId) : undefined

  if (!config) {
    // Fallback for sub-pages we haven't authored content for yet.
    const subPage = tab?.items.find((i) => i.id === pageId)
    const title = subPage?.label ?? "Settings page"
    return (
      <div className="space-y-5">
        <PageHeader title={title} description={`${tab?.label ?? "Administration"} · sub-page`} />
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/20 px-6 py-16 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground">
            <Construction className="size-6" />
          </span>
          <p className="max-w-md text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{title}</span> renders here. Detailed UI queued for a later iteration.
          </p>
        </div>
      </div>
    )
  }

  return <MasterDataList config={config} />
}

function MasterDataList({ config }: { config: MasterDataConfig }) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return config.rows
    return config.rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
    )
  }, [query, config.rows])

  const showSecondary = !!config.secondaryLabel && config.rows.some((r) => r.badge)
  const showMetric    = !!config.metricLabel    && config.rows.some((r) => r.metric !== undefined)

  return (
    <div className="space-y-5">
      <PageHeader
        title={config.title}
        description={config.description}
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9">
              <Download className="size-4 text-muted-foreground" />
              Export
            </Button>
            <Button size="sm" className="h-9">
              <Plus className="size-4" />
              {config.newButtonLabel ?? "New"}
            </Button>
          </>
        }
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full md:w-65">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={config.searchPlaceholder ?? `Search ${config.title.toLowerCase()}…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 pl-9"
          />
        </div>
        <Button variant="outline" size="sm" className="h-9">
          <Filter className="size-3.5 text-muted-foreground" />
          Filters
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="px-0 py-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Description</th>
                {showSecondary && (
                  <th className="px-4 py-2.5 font-medium">{config.secondaryLabel}</th>
                )}
                {showMetric && (
                  <th className="px-4 py-2.5 text-right font-medium">{config.metricLabel}</th>
                )}
                <th className="px-4 py-2.5 font-medium">Updated</th>
                <th className="w-12 px-4 py-2.5 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No results match "{query}"
                  </td>
                </tr>
              ) : (
                filtered.map((row) => <Row key={row.id} row={row} showSecondary={showSecondary} showMetric={showMetric} />)
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing <span className="font-medium text-foreground">{filtered.length}</span> of{" "}
          <span className="font-medium text-foreground">{config.rows.length}</span>
        </span>
        <span>Sorted by Updated · desc</span>
      </div>
    </div>
  )
}

function Row({
  row,
  showSecondary,
  showMetric,
}: {
  row: MasterDataRow
  showSecondary: boolean
  showMetric: boolean
}) {
  const isSystem = row.managed === "system"
  return (
    <tr className="hover:bg-accent/40">
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.name}</span>
          {isSystem && <Lock className="size-3 text-muted-foreground" />}
        </div>
        <div className="mt-0.5 font-mono text-[10px] text-muted-foreground/70">{row.id}</div>
      </td>
      <td className="px-4 py-2.5 text-xs text-muted-foreground">
        {row.description ?? "—"}
      </td>
      {showSecondary && (
        <td className="px-4 py-2.5">
          {row.badge ? (
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
                TONE[row.badge.tone ?? ("muted" as Tone)].chip
              )}
            >
              {row.badge.label}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </td>
      )}
      {showMetric && (
        <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums">
          {row.metric ?? "—"}
        </td>
      )}
      <td className="px-4 py-2.5 text-xs text-muted-foreground">{row.updatedAt ?? "—"}</td>
      <td className="px-4 py-2.5 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" disabled={isSystem} aria-label="Row actions">
              <MoreHorizontal className="size-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled={isSystem}>
              <Edit className="size-3.5" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={isSystem} className="text-destructive focus:text-destructive">
              <Trash2 className="size-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}
