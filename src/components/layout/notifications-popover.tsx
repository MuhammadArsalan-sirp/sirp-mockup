import { useMemo, useState } from "react"
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  UserPlus,
  Settings as SettingsIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type Tone = "destructive" | "attention" | "success" | "info" | "muted"

type Notification = {
  id: string
  tone: Tone
  icon: React.ComponentType<{ className?: string }>
  title: React.ReactNode
  body: string
  time: string
  read: boolean
  ref?: string
}

const seed: Notification[] = [
  {
    id: "n-1",
    tone: "destructive",
    icon: AlertTriangle,
    title: (
      <>
        Critical incident: <span className="font-mono">INC-1248</span>
      </>
    ),
    body: "Cred dump on jump-srv-02 — unassigned, SLA breaches in 18m.",
    time: "2m ago",
    read: false,
    ref: "INC-1248",
  },
  {
    id: "n-2",
    tone: "attention",
    icon: ShieldAlert,
    title: "2 approvals waiting",
    body: "Sara · AI proposed isolation of dc-prod-01 + block on 185.220.101.42.",
    time: "12m ago",
    read: false,
    ref: "Approvals",
  },
  {
    id: "n-3",
    tone: "info",
    icon: Sparkles,
    title: "Sara summarised INC-1247",
    body: "Triage notes ready · 4 tools used · 3 MITRE techniques mapped.",
    time: "29m ago",
    read: false,
    ref: "INC-1247",
  },
  {
    id: "n-4",
    tone: "success",
    icon: CheckCircle2,
    title: "Playbook completed",
    body: "Triage-T1021-RDP closed alert-9918 as false positive.",
    time: "1h ago",
    read: true,
    ref: "alert-9918",
  },
  {
    id: "n-5",
    tone: "info",
    icon: UserPlus,
    title: "Mariam Jaber joined the tenant",
    body: "Role: Analyst · invited by Ahmed Khan.",
    time: "3h ago",
    read: true,
  },
  {
    id: "n-6",
    tone: "muted",
    icon: SettingsIcon,
    title: "Detection ruleset updated",
    body: "OmniSense merged 12 new rules from MITRE feed v3.4.2.",
    time: "Yesterday",
    read: true,
  },
]

const toneRing: Record<Tone, string> = {
  destructive: "bg-destructive/15 text-destructive ring-destructive/20",
  attention:
    "bg-amber-500/15 text-amber-700 dark:text-amber-400 ring-amber-500/20",
  success:
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 ring-emerald-500/20",
  info: "bg-primary/12 text-primary ring-primary/25",
  muted: "bg-muted text-muted-foreground ring-border",
}

export function NotificationsPopover() {
  const [items, setItems] = useState(seed)
  const unread = useMemo(() => items.filter((n) => !n.read).length, [items])

  function markAllRead() {
    setItems((xs) => xs.map((n) => ({ ...n, read: true })))
  }

  function markRead(id: string) {
    setItems((xs) => xs.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={
            unread > 0
              ? `Notifications, ${unread} unread`
              : "Notifications"
          }
        >
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground ring-2 ring-background tabular-nums">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[380px] overflow-hidden p-0"
      >
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <div>
            <div className="text-sm font-semibold">Notifications</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {unread > 0 ? `${unread} unread` : "All caught up"}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            disabled={unread === 0}
            onClick={markAllRead}
          >
            <CheckCheck className="size-3.5" />
            Mark all read
          </Button>
        </div>

        <div className="max-h-[400px] divide-y overflow-y-auto">
          {items.length === 0 ? (
            <div className="grid place-items-center px-6 py-12 text-center">
              <div className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
                <Bell className="size-5" />
              </div>
              <div className="mt-3 text-sm font-medium">All clear</div>
              <div className="mt-1 text-xs text-muted-foreground">
                You don't have any notifications right now.
              </div>
            </div>
          ) : (
            items.map((n) => {
              const Icon = n.icon
              return (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={cn(
                    "group relative w-full text-left transition-colors hover:bg-accent",
                    !n.read && "bg-accent/40"
                  )}
                >
                  {!n.read && (
                    <span className="absolute left-1.5 top-4 size-1.5 rounded-full bg-primary" />
                  )}
                  <div className="flex items-start gap-3 px-4 py-3">
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-md ring-1",
                        toneRing[n.tone]
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="truncate text-sm font-medium">
                          {n.title}
                        </div>
                        <div className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                          {n.time}
                        </div>
                      </div>
                      <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {n.body}
                      </div>
                      {n.ref && (
                        <div className="mt-1.5 inline-flex items-center gap-1 rounded border bg-muted/40 px-1.5 py-0.5 font-mono text-[10.5px] text-muted-foreground">
                          {n.ref}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t px-4 py-2.5 text-xs">
          <button className="text-muted-foreground hover:text-foreground">
            Notification settings
          </button>
          <button className="font-medium hover:underline">View all →</button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
