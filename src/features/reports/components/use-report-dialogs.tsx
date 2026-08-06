import { useState } from "react"
import type { Report } from "@/data/reports"
import type { ReportRowHandlers } from "./report-columns"
import { ReportPreviewSheet } from "./report-preview-sheet"
import { CreateReportWizard } from "./create-report-wizard"
import { ScheduleDialog } from "./schedule-dialog"

/**
 * Centralizes the preview/create-edit/schedule dialog state shared by every
 * Reports tab, so each tab only needs `handlers` for its table + `dialogs`
 * rendered once, and `openCreate()` for its own "New report" button.
 */
export function useReportDialogs() {
  const [previewReport, setPreviewReport] = useState<Report | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const [wizardOpen, setWizardOpen] = useState(false)
  const [editingReport, setEditingReport] = useState<Report | undefined>(undefined)
  const [wizardTemplateId, setWizardTemplateId] = useState<string | undefined>(undefined)

  const [scheduleReport, setScheduleReport] = useState<Report | null>(null)
  const [scheduleOpen, setScheduleOpen] = useState(false)

  const handlers: ReportRowHandlers = {
    onPreview: (r) => {
      setPreviewReport(r)
      setPreviewOpen(true)
    },
    onEdit: (r) => {
      setEditingReport(r)
      setWizardTemplateId(undefined)
      setWizardOpen(true)
    },
    onSchedule: (r) => {
      setScheduleReport(r)
      setScheduleOpen(true)
    },
  }

  function openCreate(templateId?: string) {
    setEditingReport(undefined)
    setWizardTemplateId(templateId)
    setWizardOpen(true)
  }

  const dialogs = (
    <>
      <ReportPreviewSheet report={previewReport} open={previewOpen} onOpenChange={setPreviewOpen} />
      <CreateReportWizard
        // Remount per distinct target — the wizard's fields seed from
        // `report`/`initialTemplateId` only on mount, so without this key,
        // opening a different report or template after the first open would
        // keep showing stale (or blank) state instead of the new target's.
        key={editingReport?.id ?? wizardTemplateId ?? "blank"}
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        report={editingReport}
        initialTemplateId={wizardTemplateId}
      />
      <ScheduleDialog report={scheduleReport} open={scheduleOpen} onOpenChange={setScheduleOpen} />
    </>
  )

  return { handlers, openCreate, dialogs }
}
