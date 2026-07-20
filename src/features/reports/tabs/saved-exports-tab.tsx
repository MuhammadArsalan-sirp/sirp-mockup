import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { reports } from "@/data/reports"
import { ReportsTable } from "../components/reports-table"
import { useReportDialogs } from "../components/use-report-dialogs"

/**
 * Formally split from Templates per the redesign proposal's "Split Product
 * Archetypes" recommendation — react-go keeps these as `rp_type === "EXCEL"`
 * rows of the same `report` table, gated to Schedule/Delete/Download only
 * (no Edit/Duplicate/Generate), which this view preserves.
 */
export function SavedExportsTab() {
  const [query, setQuery] = useState("")
  const { handlers, openCreate, dialogs } = useReportDialogs()

  const savedExports = reports.filter((r) => r.format === "EXCEL")
  const filtered = savedExports.filter((r) =>
    query ? r.name.toLowerCase().includes(query.toLowerCase()) : true
  )

  return (
    <div className="space-y-5">
      <PageHeader
        title="Saved Exports"
        description="Snapshots of Incident, Threat Intel, and Case list filters, exported as Excel."
        actions={
          <Button size="sm" className="h-8 text-sm" onClick={() => openCreate()}>
            <Plus className="size-4" />
            Save new export
          </Button>
        }
      />

      <div className="relative w-full sm:w-70">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search saved exports…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-9 pl-9"
        />
      </div>

      <ReportsTable data={filtered} handlers={handlers} emptyMessage="No saved exports match the current filters." />
      {dialogs}
    </div>
  )
}
