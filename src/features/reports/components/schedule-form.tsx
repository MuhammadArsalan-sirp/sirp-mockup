import { Hash, Mail, MessageSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { users, type UserRef } from "@/data/users"
import type { DeliveryChannel, ScheduleFrequency } from "@/data/reports"

export type ScheduleFormValue = {
  frequency: ScheduleFrequency
  hourSlot: number
  dayOfMonth: number
  weekday: string
  dateRange: string
  recipientIds: string[]
  emailSubject: string
  emailContent: string
  deliveryChannel: DeliveryChannel
  /** Real backend: daily/weekly/monthly only. Everything below is new in this redesign — no live endpoint on react-go master or faiz-dev. */
  intervalDays: number
  timezone: string
}

export const DEFAULT_SCHEDULE_VALUE: ScheduleFormValue = {
  frequency: "weekly",
  hourSlot: 8,
  dayOfMonth: 1,
  weekday: "Monday",
  dateRange: "Last 7 days",
  recipientIds: [],
  emailSubject: "",
  emailContent: "",
  deliveryChannel: "email",
  intervalDays: 1,
  timezone: "UTC",
}

// Mirrors react-go's real, fixed 8-item dateRanges dropdown (Scheduler.js).
const DATE_RANGES = [
  "Today",
  "Yesterday",
  "Last 7 days",
  "Last 30 days",
  "Last 3 months",
  "Last 6 months",
  "Year to date",
  "Custom",
]

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const TIMEZONES = ["UTC", "Asia/Riyadh", "Europe/London", "America/New_York"]

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, h) => ({
  value: h,
  label: `${String(h).padStart(2, "0")}:00`,
}))

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => i + 1)

const allUsers: UserRef[] = Object.values(users)

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 rounded-md border px-3 text-xs font-medium transition-colors",
        active
          ? "border-primary/25 bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}

export function ScheduleForm({
  value,
  onChange,
}: {
  value: ScheduleFormValue
  onChange: (next: ScheduleFormValue) => void
}) {
  const patch = (p: Partial<ScheduleFormValue>) => onChange({ ...value, ...p })
  const toggleRecipient = (id: string) => {
    const has = value.recipientIds.includes(id)
    patch({ recipientIds: has ? value.recipientIds.filter((r) => r !== id) : [...value.recipientIds, id] })
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Frequency
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {(["daily", "weekly", "monthly"] as ScheduleFrequency[]).map((f) => (
            <Chip key={f} active={value.frequency === f} onClick={() => patch({ frequency: f })}>
              {f[0].toUpperCase() + f.slice(1)}
            </Chip>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {value.frequency === "weekly" && (
          <div className="space-y-2">
            <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Day of week
            </Label>
            <select
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              value={value.weekday}
              onChange={(e) => patch({ weekday: e.target.value })}
            >
              {WEEKDAYS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}
        {value.frequency === "monthly" && (
          <div className="space-y-2">
            <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Day of month
            </Label>
            <select
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              value={value.dayOfMonth}
              onChange={(e) => patch({ dayOfMonth: Number(e.target.value) })}
            >
              {DAY_OPTIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}
        <div className="space-y-2">
          <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Time
          </Label>
          <select
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            value={value.hourSlot}
            onChange={(e) => patch({ hourSlot: Number(e.target.value) })}
          >
            {HOUR_OPTIONS.map((h) => (
              <option key={h.value} value={h.value}>{h.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Timezone
          </Label>
          <select
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            value={value.timezone}
            onChange={(e) => patch({ timezone: e.target.value })}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Date range
          </Label>
          <select
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            value={value.dateRange}
            onChange={(e) => patch({ dateRange: e.target.value })}
          >
            {DATE_RANGES.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
        <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Custom interval
        </Label>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Every</span>
          <Input
            type="number"
            min={1}
            max={90}
            value={value.intervalDays}
            onChange={(e) => patch({ intervalDays: Math.max(1, Number(e.target.value) || 1) })}
            className="h-8 w-16"
          />
          <span className="text-muted-foreground">day(s), independent of the frequency above</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Recipients
        </Label>
        <div className="flex flex-wrap gap-1.5 rounded-md border p-2">
          {allUsers.map((u) => {
            const active = value.recipientIds.includes(u.id)
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => toggleRecipient(u.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5 text-xs transition-colors",
                  active
                    ? "border-primary/25 bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Avatar size="sm">
                  <AvatarImage src={u.photo} alt={u.name} />
                  <AvatarFallback className={`bg-linear-to-br ${u.gradient} text-white`}>
                    {u.initials}
                  </AvatarFallback>
                </Avatar>
                {u.name}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          Sourced from the company directory — every analyst is selectable, not just Threat Intel contacts.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Delivery channel
        </Label>
        <div className="flex flex-wrap gap-1.5">
          <Chip active={value.deliveryChannel === "email"} onClick={() => patch({ deliveryChannel: "email" })}>
            <span className="inline-flex items-center gap-1.5"><Mail className="size-3.5" />Email</span>
          </Chip>
          <Chip active={value.deliveryChannel === "slack"} onClick={() => patch({ deliveryChannel: "slack" })}>
            <span className="inline-flex items-center gap-1.5"><Hash className="size-3.5" />Slack</span>
          </Chip>
          <Badge variant="outline" className="h-8 gap-1.5 rounded-md px-3 text-muted-foreground">
            <MessageSquare className="size-3.5" />
            Teams · Coming soon
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Email subject
          </Label>
          <Input
            value={value.emailSubject}
            onChange={(e) => patch({ emailSubject: e.target.value })}
            placeholder="e.g. Weekly Executive Incident Summary"
            className="h-9"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Email content
          </Label>
          <textarea
            value={value.emailContent}
            onChange={(e) => patch({ emailContent: e.target.value })}
            placeholder="Short note included in the delivery email…"
            rows={1}
            className="w-full min-w-0 resize-none rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
      </div>
    </div>
  )
}
