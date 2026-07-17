import {
  Bell,
  ChevronDown,
  Copy,
  ExternalLink,
  MoreHorizontal,
  PanelRightClose,
  ShieldCheck,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { AdminLogEvent, LogSeverity } from "@/data/admin"

const severityPill: Record<LogSeverity, string> = {
  info: "border-primary/25 bg-primary/10 text-primary",
  warn: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  error: "border-destructive/25 bg-destructive/10 text-destructive",
  sara: "bg-secondary text-secondary-foreground",
}

const severityLabel: Record<LogSeverity, string> = {
  info: "INFO",
  warn: "WARN",
  error: "ERROR",
  sara: "SARA",
}

type Props = {
  event: AdminLogEvent | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminLogSheet({ event, open, onOpenChange }: Props) {
  if (!event) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full overflow-y-auto p-0 sm:max-w-lg"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{event.id}</SheetTitle>
          <SheetDescription>{event.action}</SheetDescription>
        </SheetHeader>

        {/* Drawer header */}
        <div className="flex items-center gap-3 border-b px-5 py-4">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
          >
            <PanelRightClose className="size-4" />
          </Button>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Badge
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium",
                severityPill[event.severity]
              )}
            >
              {severityLabel[event.severity]}
            </Badge>
            <div className="font-mono text-xs text-muted-foreground">
              {event.id}
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" aria-label="Copy link">
            <ExternalLink className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="More">
            <MoreHorizontal className="size-4" />
          </Button>
        </div>

        {/* Action header */}
        <div className="space-y-3 border-b px-5 py-5">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Action
            </div>
            <div className="mt-1 text-base font-semibold capitalize">
              {event.action}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Timestamp
              </div>
              <div className="mt-1 font-mono text-sm">
                {event.day} {event.time}
              </div>
              <div className="text-xs text-muted-foreground">
                UTC+1 · 12 minutes ago
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Source IP
              </div>
              <div className="mt-1 font-mono text-sm">{event.ip}</div>
              <div className="text-xs text-muted-foreground">
                {event.ip === "internal" ? "service event" : "London, UK · trusted"}
              </div>
            </div>
          </div>
        </div>

        {/* Actor + Target cards */}
        <div className="space-y-3 border-b px-5 py-4">
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Actor
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-linear-to-br from-violet-500 to-fuchsia-600 text-xs font-semibold text-white">
                SP
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{event.actor}</div>
                <div className="truncate text-xs text-muted-foreground">
                  SOC Manager
                </div>
              </div>
              <a
                href="/admin-modern/users"
                className="whitespace-nowrap text-xs text-primary hover:underline"
              >
                View →
              </a>
            </div>
          </div>

          {event.target && (
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Target
              </div>
              <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary">
                  <ShieldCheck className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {event.target}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    Resource id <span className="font-mono">{event.target}</span>
                  </div>
                </div>
                <a
                  href="/incidents"
                  className="whitespace-nowrap text-xs text-primary hover:underline"
                >
                  View →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Diff */}
        <div className="space-y-2 border-b px-5 py-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Changes
          </div>
          {event.diff && event.diff.length > 0 ? (
            event.diff.map((d) => (
              <div
                key={d.field}
                className="rounded-md border-l-2 border-emerald-500 bg-emerald-500/10 p-2.5 font-mono text-xs"
              >
                <span className="text-muted-foreground">{d.field}:</span> {d.from}{" "}
                <span className="text-muted-foreground">→</span> {d.to}
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">
              No structured before/after captured for this event type.
            </p>
          )}
        </div>

        {/* Raw JSON */}
        <div className="space-y-2 border-b px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Raw event
            </div>
            <Button variant="ghost" size="xs" className="text-xs text-muted-foreground">
              <Copy className="size-3" />
              Copy JSON
            </Button>
          </div>
          <pre className="overflow-x-auto whitespace-pre rounded-md bg-muted p-3 font-mono text-xs leading-relaxed">
{`"id": "${event.id}",
"timestamp": "${event.day}T${event.time}Z",
"action": "${event.action}",
"actor": {
  "id": "u_4f8a92c1",
  "email": "${event.actor}",
  "role": "soc_manager"
},
"target": {
  "id": "${event.target ?? "—"}",
  "tenant": "acme_emea"
},
"context": {
  "ip": "${event.ip}",
  "user_agent": "Chrome/121 macOS/14.4",
  "session_id": "sess_2k4j3l9d",
  "request_id": "req_8a2f"
},
"latency_ms": 42,
"status": "success"`}
          </pre>
        </div>

        <div className="flex items-center gap-2 px-5 py-4">
          <Button variant="outline" size="sm" className="h-9 flex-1">
            <ChevronDown className="size-3.5 text-muted-foreground" />
            Show in context
          </Button>
          <Button size="sm" className="h-9 flex-1">
            <Bell className="size-3.5" />
            Alert on similar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

