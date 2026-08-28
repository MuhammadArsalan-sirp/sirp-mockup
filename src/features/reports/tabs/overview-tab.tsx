import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { CalendarClock, FileStack, Lock, PenLine, Plus, RefreshCw, Search, Sparkles, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/shared/page-header"
import { KpiCard } from "@/components/shared/kpi-card"
import { reportHistory, reports } from "@/data/reports"
import { ReportsTable } from "../components/reports-table"
import { useReportDialogs } from "../components/use-report-dialogs"
import { Annotate } from "../spec/annotations"

/**
 * Module home. Two things had to change from the first cut: the primary entry
 * point is now describing what you want rather than picking a template, and
 * anything the platform generated on its own that needs a human surfaces here
 * instead of waiting to be found.
 */
export function OverviewTab() {
  const [query, setQuery] = useState("")
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { handlers, openCreate, dialogs } = useReportDialogs()

  const demoState = params.get("state")
  const filtered = reports.filter((r) => (query ? r.name.toLowerCase().includes(query.toLowerCase()) : true))

  // Aggregate KPIs — counted client-side; there is no /report/stats on demo3.
  const scheduledCount = reports.filter((r) => r.isScheduled).length
  const draftCount = reports.filter((r) => r.status === "draft").length
  const generatedThisMonth = reportHistory.filter((h) => h.generatedAt.startsWith("Jul")).length

  if (demoState === "denied") return <DeniedState />
  if (demoState === "error") return <ErrorState />

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports"
        description="Templated reports, saved-search exports, and everything the platform writes on a schedule."
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-8 text-sm" onClick={() => openCreate()}>
              <Plus className="size-4" />
              Blank report
            </Button>
            <Button size="sm" className="h-8 text-sm" onClick={() => navigate("/reports/new")}>
              <Sparkles className="size-4" />
              Describe a report
            </Button>
          </div>
        }
      />

      {demoState === "loading" ? (
        <LoadingState />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard icon={<FileStack className="size-4" />} label="Total reports" value={demoState === "empty" ? 0 : reports.length} caption="Templates + saved exports" />
            <KpiCard icon={<CalendarClock className="size-4" />} label="Scheduled" value={demoState === "empty" ? 0 : scheduledCount} trendTone="info" caption="Delivering on a recurrence" />
            <KpiCard icon={<Sparkles className="size-4" />} label="Generated · July" value={demoState === "empty" ? 0 : generatedThisMonth} trendTone="success" caption="Manual + scheduled runs" />
            <KpiCard icon={<PenLine className="size-4" />} label="Drafts" value={demoState === "empty" ? 0 : draftCount} trendTone="muted" caption="Not yet published" />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-70">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search reports…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9 pl-9"
              />
            </div>
            <Annotate id="sp-kpis" />
            <Annotate id="sp-list" />
          </div>

          {demoState === "empty" ? <EmptyState onCompose={() => navigate("/reports/new")} /> : <ReportsTable data={filtered} handlers={handlers} />}
        </>
      )}
      {dialogs}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-9 w-70 rounded-md" />
      <Skeleton className="h-72 rounded-xl" />
    </div>
  )
}

function EmptyState({ onCompose }: { onCompose: () => void }) {
  return (
    <div className="rounded-xl border border-dashed py-16 text-center">
      <div className="mx-auto grid size-11 place-items-center rounded-xl border bg-muted text-muted-foreground">
        <FileStack className="size-4.5" />
      </div>
      <p className="mt-3 text-sm font-medium">No reports yet</p>
      <p className="mx-auto mt-1 max-w-80 text-xs leading-relaxed text-muted-foreground">
        Describe what you need in plain language and the Co-Analyst proposes a structure — or start from a template.
      </p>
      <Button size="sm" className="mt-4" onClick={onCompose}>
        <Sparkles className="size-3.5" />
        Describe a report
      </Button>
    </div>
  )
}

function ErrorState() {
  return (
    <div className="space-y-5">
      <PageHeader title="Reports" description="Templated reports, saved-search exports, and scheduled delivery." />
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 py-16 text-center">
        <div className="mx-auto grid size-11 place-items-center rounded-xl border border-destructive/30 bg-destructive/10 text-destructive">
          <TriangleAlert className="size-4.5" />
        </div>
        <p className="mt-3 text-sm font-medium">Couldn't load reports</p>
        <p className="mx-auto mt-1 max-w-84 text-xs leading-relaxed text-muted-foreground">
          The report service didn't respond. Nothing was lost — scheduled deliveries continue independently.
        </p>
        <Button size="sm" variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          <RefreshCw className="size-3.5" />
          Try again
        </Button>
      </div>
    </div>
  )
}

function DeniedState() {
  return (
    <div className="space-y-5">
      <PageHeader title="Reports" description="Templated reports, saved-search exports, and scheduled delivery." />
      <div className="rounded-xl border py-16 text-center">
        <div className="mx-auto grid size-11 place-items-center rounded-xl border bg-muted text-muted-foreground">
          <Lock className="size-4.5" />
        </div>
        <p className="mt-3 text-sm font-medium">You don't have access to Reports</p>
        <p className="mx-auto mt-1 max-w-84 text-xs leading-relaxed text-muted-foreground">
          Reports can expose data across every module, so access is granted separately. Ask an administrator for the
          Reports reader role.
        </p>
      </div>
    </div>
  )
}
