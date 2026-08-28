import { useState } from "react"
import { Check, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getSchedulesForReport, type Report } from "@/data/reports"
import { users } from "@/data/users"
import { reportsBackend } from "../lib/reports-backend"
import { ScheduleForm, DEFAULT_SCHEDULE_VALUE, type ScheduleFormValue } from "./schedule-form"

/**
 * Standalone schedule editor for an existing report — mirrors react-go's
 * dedicated Scheduler.js modal (separate from the create wizard), reachable
 * from the row action menu on any tab.
 */
export function ScheduleDialog({
  open,
  onOpenChange,
  report,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  report: Report | null
}) {
  if (!report) return null
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <ScheduleDialogBody key={report.id} report={report} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function scheduleToFormValue(reportId: string): ScheduleFormValue {
  const existing = getSchedulesForReport(reportId)[0]
  if (!existing) return DEFAULT_SCHEDULE_VALUE
  return {
    frequency: existing.frequency,
    hourSlot: existing.hourSlot ?? 8,
    dayOfMonth: existing.dayOfMonth ?? 1,
    weekday: existing.weekday ?? "Monday",
    dateRange: existing.dateRange,
    recipientIds: existing.recipients.map((r) => r.id),
    emailSubject: existing.emailSubject,
    emailContent: existing.emailContent,
    deliveryChannel: existing.deliveryChannel,
    intervalDays: existing.intervalDays ?? 1,
    timezone: existing.timezone ?? "UTC",
  }
}

function ScheduleDialogBody({ report, onDone }: { report: Report; onDone: () => void }) {
  const [value, setValue] = useState<ScheduleFormValue>(() => scheduleToFormValue(report.id))
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  async function handleSave() {
    setStatus("saving")
    try {
      const recipients = value.recipientIds.map((id) => users[id]).filter(Boolean)
      await reportsBackend.saveSchedule({
        report,
        frequency: value.frequency,
        hourSlot: value.hourSlot,
        dayOfMonth: value.dayOfMonth,
        weekday: value.weekday,
        dateRange: value.dateRange,
        intervalDays: value.intervalDays,
        timezone: value.timezone,
        recipients,
        emailSubject: value.emailSubject,
        emailContent: value.emailContent,
        deliveryChannel: value.deliveryChannel,
      })
      setStatus("saved")
      setTimeout(onDone, 800)
    } catch {
      setStatus("error")
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Schedule · {report.name}</DialogTitle>
        <DialogDescription>
          Recipients are sourced from the company directory below — {Object.keys(users).length} analysts available.
        </DialogDescription>
      </DialogHeader>
      {status === "saved" ? (
        <div className="grid place-items-center py-10 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Check className="size-5" />
          </span>
          <p className="mt-3 text-sm font-medium">Schedule saved</p>
        </div>
      ) : (
        <>
          <ScheduleForm value={value} onChange={setValue} />
          {status === "error" && (
            <p className="text-sm text-destructive">Couldn't save the schedule — check your connection and try again.</p>
          )}
          <DialogFooter className="mt-2">
            <Button size="sm" className="sm:ml-auto" disabled={status === "saving"} onClick={handleSave}>
              {status === "saving" && <Loader2 className="size-3.5 animate-spin" />}
              Save schedule
            </Button>
          </DialogFooter>
        </>
      )}
    </>
  )
}
