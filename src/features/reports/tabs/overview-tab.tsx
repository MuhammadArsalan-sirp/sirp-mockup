import { useState } from "react"
import { CalendarClock, FileStack, PenLine, Plus, Search, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { KpiCard } from "@/components/shared/kpi-card"
import { reportHistory, reports } from "@/data/reports"
import { ReportsTable } from "../components/reports-table"
import { useReportDialogs } from "../components/use-report-dialogs"

export function OverviewTab() {
  const [query, setQuery] = useState("")
  const { handlers, openCreate, dialogs } = useReportDialogs()

  const filtered = reports.filter((r) =>
    query ? r.name.toLowerCase().includes(query.toLowerCase()) : true
  )

  // Aggregate KPIs — new in this redesign, no live GET /report/stats on react-go.
  const scheduledCount = reports.filter((r) => r.isScheduled).length
  const draftCount = reports.filter((r) => r.status === "draft").length
  const generatedThisMonth = reportHistory.filter((h) => h.generatedAt.startsWith("Jul")).length

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports"
        description="Templated PDF reports and saved-search exports, in one place."
        actions={
          <Button size="sm" className="h-8 text-sm" onClick={() => openCreate()}>
            <Plus className="size-4" />
            New report
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={<FileStack className="size-4" />} label="Total reports" value={reports.length} caption="Templates + saved exports" />
        <KpiCard icon={<CalendarClock className="size-4" />} label="Scheduled" value={scheduledCount} trendTone="info" caption="Delivering on a recurrence" />
        <KpiCard icon={<Sparkles className="size-4" />} label="Generated · July" value={generatedThisMonth} trendTone="success" caption="Manual + scheduled runs" />
        <KpiCard icon={<PenLine className="size-4" />} label="Drafts" value={draftCount} trendTone="muted" caption="Not yet published" />
      </div>

      <div className="relative w-full sm:w-70">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search reports…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-9 pl-9"
        />
      </div>

      <ReportsTable data={filtered} handlers={handlers} />
      {dialogs}
    </div>
  )
}
