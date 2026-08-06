import { useState } from "react"
import { Clock, Hash, Mail, MessageSquare, Pause, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PageHeader } from "@/components/shared/page-header"
import { DataCard } from "@/features/administration-modern/admin-ui"
import { getReportById, reportSchedules, type Report, type ReportSchedule } from "@/data/reports"
import { ScheduleDialog } from "../components/schedule-dialog"
import { ReportTypeBadge } from "../components/report-columns"

const channelIcon: Record<ReportSchedule["deliveryChannel"], typeof Mail> = {
  email: Mail,
  slack: Hash,
  teams: MessageSquare,
}

/**
 * Cross-report schedule view. New in this redesign — react-go only exposes
 * a per-report `GET /scheduler?id=`; a cross-report listing (faiz-dev's
 * `/scheduler/all`) never had backend support. This aggregates the fixture
 * `reportSchedules` client-side.
 */
export function ScheduledTab() {
  const [editing, setEditing] = useState<Report | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const rows = reportSchedules
    .map((s) => ({ schedule: s, report: getReportById(s.reportId) }))
    .filter((r): r is { schedule: ReportSchedule; report: Report } => !!r.report)

  return (
    <div className="space-y-5">
      <PageHeader
        title="Scheduled"
        description="Every recurring delivery across templates and saved exports, in one list."
      />

      <DataCard bodyPadding="none">
        <div className="divide-y">
          {rows.map(({ schedule, report }) => {
            const Icon = channelIcon[schedule.deliveryChannel]
            return (
              <div key={schedule.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{report.name}</span>
                    <ReportTypeBadge report={report} />
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    <span className="capitalize">{schedule.frequency}</span>
                    <span>·</span>
                    <span>Next run {schedule.nextRun}</span>
                    {schedule.timezone && (
                      <>
                        <span>·</span>
                        <span>{schedule.timezone}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {schedule.recipients.slice(0, 3).map((r) => (
                    <Avatar key={r.id} size="sm" className="ring-2 ring-card">
                      <AvatarImage src={r.photo} alt={r.name} />
                      <AvatarFallback className={`bg-linear-to-br ${r.gradient} text-white`}>
                        {r.initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <Icon className="size-4 text-muted-foreground" />
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Edit schedule"
                    onClick={() => {
                      setEditing(report)
                      setEditOpen(true)
                    }}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label="Pause schedule">
                    <Pause className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label="Delete schedule" className="text-destructive">
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}
          {rows.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              No scheduled reports yet.
            </div>
          )}
        </div>
      </DataCard>

      <ScheduleDialog report={editing} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  )
}
