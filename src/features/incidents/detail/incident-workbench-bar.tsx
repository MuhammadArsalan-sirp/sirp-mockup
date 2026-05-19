import { useState, type ReactNode } from "react"
import {
  ChevronDown,
  Download,
  Mail,
  Pencil,
  Play,
  PanelRightOpen,
  UserRoundCog,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Incident, IncidentState, Severity } from "@/data/incidents"
import { SourceIcon } from "@/features/incidents/list/source-icon"
import { cn } from "@/lib/utils"

const severities: Severity[] = ["critical", "high", "medium", "low"]
const priorities: Incident["priority"][] = ["P1", "P2", "P3", "P4"]
const states: IncidentState[] = [
  "triage",
  "investigating",
  "containment",
  "eradication",
  "recovery",
  "mitigated",
  "closed",
]
const statuses: Incident["status"][] = [
  "open",
  "investigating",
  "in-progress",
  "waiting",
  "resolved",
  "closed",
]

type Props = {
  incident: Incident
  onOpenWorkbench: () => void
  className?: string
  defaultCollapsed?: boolean
}

export function IncidentWorkbenchBar({
  incident,
  onOpenWorkbench,
  className,
  defaultCollapsed = false,
}: Props) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  return (
    <div
      className={cn(
        "rounded-2xl border bg-muted/20 shadow-sm ring-1 ring-border/60",
        className
      )}
    >
      <div className="flex flex-col gap-3 px-3 py-3 sm:px-4 sm:py-3.5">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <SourceIcon source={incident.source.label} size={28} />
            <Separator orientation="vertical" className="hidden h-7 sm:block" />
            <div className="min-w-0">
              <p className="truncate font-mono text-[11px] text-muted-foreground">
                {incident.id}
              </p>
              <Badge variant="outline" className="mt-0.5 font-mono text-[10px]">
                {incident.sourceId}
              </Badge>
            </div>
          </div>

          <div className="flex flex-1 flex-wrap items-center justify-end gap-1">
            <IconAction label="Run playbook" shortcut="Playbook queue">
              <Button type="button" size="icon" variant="secondary" className="size-9 rounded-lg shadow-sm">
                <Play className="size-4" />
              </Button>
            </IconAction>
            <IconAction label="Email stakeholders" shortcut="Notify">
              <Button type="button" size="icon" variant="outline" className="size-9 rounded-lg bg-background">
                <Mail className="size-4" />
              </Button>
            </IconAction>
            <IconAction label="Export PDF" shortcut="PDF report">
              <Button type="button" size="icon" variant="outline" className="size-9 rounded-lg bg-background">
                <Download className="size-4" />
              </Button>
            </IconAction>
            <IconAction label="Edit ticket" shortcut="Full form">
              <Button type="button" size="icon" variant="outline" className="size-9 rounded-lg bg-background">
                <Pencil className="size-4" />
              </Button>
            </IconAction>
            <IconAction label="Workbench" shortcut="Queries & graph">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="size-9 rounded-lg border-dashed bg-background"
                onClick={onOpenWorkbench}
              >
                <PanelRightOpen className="size-4" />
              </Button>
            </IconAction>
            <Separator orientation="vertical" className="mx-0.5 hidden h-7 md:block" />
            {incident.assignee ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="flex h-9 items-center gap-2 rounded-lg border bg-background px-2 pr-3 shadow-sm transition-colors hover:bg-muted/50"
                  >
                    <Avatar className="size-6 shrink-0">
                      <AvatarImage src={incident.assignee.photo} alt={incident.assignee.name} />
                      <AvatarFallback className={cn("bg-linear-to-br text-[9px] font-bold text-white", incident.assignee.gradient)}>
                        {incident.assignee.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-xs font-medium leading-none sm:inline">{incident.assignee.name.split(" ")[0]}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <p className="font-medium">Assigned to {incident.assignee.name}</p>
                  <p className="text-muted-foreground">Click to reassign</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                type="button"
                variant="default"
                size="sm"
                className="h-9 gap-2 rounded-lg px-4 shadow-sm"
              >
                <UserRoundCog className="size-4" />
                <span className="hidden sm:inline">Assign</span>
              </Button>
            )}
            <Separator orientation="vertical" className="mx-0.5 hidden h-7 md:block" />
            <IconAction
              label={collapsed ? "Show details" : "Hide details"}
              shortcut="Severity · Priority · Status · Stage · Category"
            >
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-9 rounded-lg"
                onClick={() => setCollapsed((c) => !c)}
                aria-expanded={!collapsed}
                aria-label={collapsed ? "Show details" : "Hide details"}
              >
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform duration-200",
                    collapsed ? "" : "rotate-180"
                  )}
                />
              </Button>
            </IconAction>
          </div>
        </div>

        {!collapsed && (
        <div className="flex flex-wrap items-end gap-2 border-t border-border/60 pt-3">
          <WorkbenchSelect
            label="Severity"
            value={incident.severity}
            options={severities.map((s) => ({ value: s, label: s }))}
          />
          <WorkbenchSelect
            label="Priority"
            value={incident.priority}
            options={priorities.map((s) => ({ value: s, label: s }))}
          />
          <WorkbenchSelect
            label="Status"
            value={incident.status}
            options={statuses.map((s) => ({
              value: s,
              label: s.replace("-", " "),
            }))}
          />
          <WorkbenchSelect
            label="Stage"
            value={incident.state}
            options={states.map((s) => ({
              value: s,
              label: s.charAt(0).toUpperCase() + s.slice(1),
            }))}
          />
          <div className="min-w-[min(100%,160px)] flex-1 sm:max-w-[200px]">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Category
            </p>
            <div className="truncate rounded-lg border bg-background px-2.5 py-2 text-xs font-medium shadow-sm">
              {incident.category}
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

function IconAction({
  label,
  shortcut,
  children,
}: {
  label: string
  shortcut: string
  children: ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[220px] text-xs">
        <p className="font-medium">{label}</p>
        <p className="text-muted-foreground">{shortcut}</p>
      </TooltipContent>
    </Tooltip>
  )
}

function WorkbenchSelect({
  label,
  value,
  options,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
}) {
  return (
    <div className="min-w-[104px] flex-1 sm:flex-initial sm:min-w-[112px]">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <Select defaultValue={value}>
        <SelectTrigger
          size="sm"
          className="h-9 w-full min-w-0 rounded-lg border bg-background shadow-sm"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
