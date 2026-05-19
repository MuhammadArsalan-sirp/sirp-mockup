import { Sparkles } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { Incident } from "@/data/incidents"
import { SourceIcon } from "@/features/incidents/list/source-icon"
import {
  incidentStateLabel,
  SeverityBadge,
  StatusBadge,
} from "./incident-detail-badges"

type Props = {
  incident: Incident
  className?: string
  onSaraMobile?: () => void
  showSaraMobileButton?: boolean
}

export function IncidentDetailTicketHeader({
  incident,
  className,
  onSaraMobile,
  showSaraMobileButton,
}: Props) {
  return (
    <header
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card/90 shadow-sm ring-1 ring-border/50 backdrop-blur-sm",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge value={incident.severity} />
            <StatusBadge value={incident.status} />
            <Badge variant="secondary" className="rounded-full font-normal">
              {incidentStateLabel[incident.state]}
            </Badge>
            <Badge variant="outline" className="rounded-full font-mono text-[11px]">
              {incident.priority}
            </Badge>
          </div>
          <div>
            <CardTitle className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
              {incident.title}
            </CardTitle>
            {incident.subtitle && (
              <CardDescription className="mt-1.5 line-clamp-2 text-pretty text-sm leading-relaxed sm:line-clamp-none">
                {incident.subtitle}
              </CardDescription>
            )}
          </div>

          {/* Assignee + team */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {incident.assignee ? (
              <div className="flex items-center gap-2">
                <Avatar className="size-8 ring-2 ring-background">
                  <AvatarImage src={incident.assignee.photo} alt={incident.assignee.name} />
                  <AvatarFallback className={cn("bg-linear-to-br text-[10px] font-bold text-white", incident.assignee.gradient)}>
                    {incident.assignee.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Assignee</p>
                  <p className="truncate text-sm font-medium leading-tight">{incident.assignee.name}</p>
                </div>
              </div>
            ) : (
              <Badge variant="outline" className="gap-1.5 rounded-full">
                <span className="size-1.5 rounded-full bg-muted-foreground/50" />
                Unassigned
              </Badge>
            )}

            {incident.members.length > 0 && (
              <>
                <Separator orientation="vertical" className="h-9" />
                <div className="flex items-center gap-2.5">
                  <div className="flex -space-x-2">
                    {incident.members.slice(0, 4).map((m) => (
                      <Avatar key={m.id} className="size-7 ring-2 ring-background" title={m.name}>
                        <AvatarImage src={m.photo} alt={m.name} />
                        <AvatarFallback className={cn("bg-linear-to-br text-[9px] font-bold text-white", m.gradient)}>
                          {m.initials}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {incident.members.length > 4 && (
                      <span className="grid size-7 place-items-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground ring-2 ring-background">
                        +{incident.members.length - 4}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Team</p>
                    <p className="text-sm font-medium leading-tight">
                      {incident.members.length} member{incident.members.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-start sm:flex-col sm:items-end">
          {showSaraMobileButton && onSaraMobile && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 rounded-xl lg:hidden"
              onClick={onSaraMobile}
            >
              <Sparkles className="size-4 text-primary" />
              Sara
            </Button>
          )}
          <div className="rounded-xl border bg-muted/20 p-2 shadow-inner">
            <SourceIcon source={incident.source.label} size={32} />
          </div>
        </div>
      </div>
    </header>
  )
}
