import type { ColumnDef } from "@tanstack/react-table"
import { Calendar, FileSpreadsheet, FileText, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/shared/data-table"
import { moduleLabels, type Report, type ReportModule, type ReportStatus } from "@/data/reports"
import { buildReportExportRows, exportRowsToExcel } from "../lib/report-export"
import { exportReportToPdf } from "../lib/report-pdf-export"
import { reportsBackend } from "../lib/reports-backend"

export function ReportTypeBadge({ report }: { report: Report }) {
  const isExcel = report.format === "EXCEL"
  const color = isExcel ? "var(--success)" : "var(--info)"
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs whitespace-nowrap"
      style={{ borderColor: `color-mix(in srgb, ${color} 35%, transparent)`, color }}
    >
      {isExcel ? <FileSpreadsheet className="size-3" /> : <FileText className="size-3" />}
      {report.archetype === "template" ? "Template" : "Saved Export"}
    </span>
  )
}

const statusMeta: Record<ReportStatus, { label: string; tone: string }> = {
  draft: { label: "Draft", tone: "var(--muted-foreground)" },
  published: { label: "Published", tone: "var(--success)" },
}

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  const meta = statusMeta[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ background: `color-mix(in srgb, ${meta.tone} 15%, transparent)`, color: meta.tone }}
    >
      <span className="size-1.5 rounded-full" style={{ background: meta.tone }} />
      {meta.label}
    </span>
  )
}

export function ScheduledIndicator({ scheduled }: { scheduled: boolean }) {
  if (!scheduled) return <span className="text-sm text-muted-foreground">—</span>
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <Calendar className="size-3.5 text-primary" />
      Scheduled
    </span>
  )
}

export function AuthorCell({ author }: { author: Report["author"] }) {
  return (
    <div className="inline-flex items-center gap-2">
      <Avatar size="sm">
        <AvatarImage src={author.photo} alt={author.name} />
        <AvatarFallback className={`bg-linear-to-br ${author.gradient} text-white`}>
          {author.initials}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm text-muted-foreground">{author.name}</span>
    </div>
  )
}

export type ReportRowHandlers = {
  onPreview: (report: Report) => void
  onEdit: (report: Report) => void
  onSchedule: (report: Report) => void
  onSendNow: (report: Report) => void
}

async function handleGeneratePdf(report: Report) {
  const filename = `${report.name.replace(/[^a-z0-9]+/gi, "-")}.pdf`
  await exportReportToPdf(report, filename)
  void reportsBackend.logExport({
    reportId: report.id,
    reportName: report.name,
    format: "PDF",
    triggeredBy: "manual",
  })
}

function handleDownloadExcel(report: Report) {
  const filename = `${report.name.replace(/[^a-z0-9]+/gi, "-")}.xlsx`
  exportRowsToExcel(buildReportExportRows(report), filename, report.name)
  void reportsBackend.logExport({
    reportId: report.id,
    reportName: report.name,
    format: "EXCEL",
    triggeredBy: "manual",
  })
}

/**
 * Preserves react-go's real, dynamic gating (Reports/index.jsx): Edit,
 * Duplicate, and Generate PDF are hidden for `rp_type === "EXCEL"` rows —
 * saved exports can only be scheduled/deleted/downloaded.
 */
export function createReportColumns(handlers: ReportRowHandlers): ColumnDef<Report>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          onClick={(e) => e.stopPropagation()}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <div className="max-w-[360px]">
          <span className="font-medium underline decoration-muted-foreground/30 underline-offset-4 hover:decoration-foreground">
            {row.original.name}
          </span>
          {(row.original.description ?? row.original.savedSearchSummary) && (
            <div className="mt-0.5 truncate text-xs text-muted-foreground">
              {row.original.description ?? row.original.savedSearchSummary}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "type",
      accessorFn: (r) => r.archetype,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => <ReportTypeBadge report={row.original} />,
      filterFn: (row, id, value) => Array.isArray(value) && value.includes(row.getValue<string>(id)),
    },
    {
      id: "module",
      accessorFn: (r) => r.module,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Module" />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {moduleLabels[row.original.module as ReportModule]}
        </span>
      ),
      filterFn: (row, id, value) => Array.isArray(value) && value.includes(row.getValue<string>(id)),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <ReportStatusBadge status={row.original.status} />,
      filterFn: (row, id, value) => Array.isArray(value) && value.includes(row.getValue<string>(id)),
    },
    {
      id: "author",
      accessorFn: (r) => r.author.name,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Author" />,
      cell: ({ row }) => <AuthorCell author={row.original.author} />,
    },
    {
      accessorKey: "updatedOn",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">
          {row.original.updatedOn}
        </span>
      ),
    },
    {
      id: "scheduled",
      accessorFn: (r) => r.isScheduled,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Scheduled" />,
      cell: ({ row }) => <ScheduledIndicator scheduled={row.original.isScheduled} />,
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      size: 40,
      cell: ({ row }) => {
        const report = row.original
        const isExcel = report.format === "EXCEL"
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={(e) => e.stopPropagation()}
                aria-label="Open menu"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem onClick={() => handlers.onPreview(report)}>Preview</DropdownMenuItem>
              {!isExcel && (
                <DropdownMenuItem onClick={() => handlers.onEdit(report)}>Edit</DropdownMenuItem>
              )}
              {!isExcel && <DropdownMenuItem>Duplicate</DropdownMenuItem>}
              {!isExcel && (
                <DropdownMenuItem onClick={() => void handleGeneratePdf(report)}>Generate PDF</DropdownMenuItem>
              )}
              {isExcel && (
                <DropdownMenuItem onClick={() => handleDownloadExcel(report)}>Download Excel</DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handlers.onSchedule(report)}>Schedule</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlers.onSendNow(report)}>Send report…</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
