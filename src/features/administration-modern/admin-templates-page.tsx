import { useState } from "react"
import {
  AlertTriangle,
  Bell,
  ChevronRight,
  FileText,
  Mail,
  MessageSquare,
  Plus,
  Search,
  Shield,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import { notificationTemplates, type NotificationTemplate } from "@/data/admin"
import {
  DataCard,
  FormRow,
  ReadValue,
  SectionLabel,
  StatusDot,
  ToneChip,
  type Tone,
} from "./admin-ui"

const categoryMeta: Record<NotificationTemplate["category"], { label: string; icon: LucideIcon; tone: Tone }> = {
  incident: { label: "Incident", icon: AlertTriangle, tone: "alert" },
  access:   { label: "Access",   icon: Shield,        tone: "info" },
  system:   { label: "System",   icon: Bell,          tone: "warn" },
  digest:   { label: "Digest",   icon: FileText,      tone: "muted" },
}

const channelIcon: Record<NotificationTemplate["channels"][number], LucideIcon> = {
  email: Mail, sms: MessageSquare, webhook: Bell, teams: MessageSquare, slack: MessageSquare,
}

export function AdminTemplatesPage() {
  const [activeId, setActiveId] = useState(notificationTemplates[0]?.id ?? "")
  const active = notificationTemplates.find((t) => t.id === activeId) ?? notificationTemplates[0]

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notification templates"
        description="Templates for emails, SMS, webhooks, and chat. Variables resolve from incident, user, and tenant context."
        actions={
          <Button size="sm" className="h-9">
            <Plus className="size-4" />
            New template
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)]">
        <Card>
          <CardContent className="px-0 py-0">
            <div className="border-b px-4 py-2.5">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search templates…" className="h-8 pl-8 text-sm" />
              </div>
            </div>
            <div className="divide-y">
              {notificationTemplates.map((t) => {
                const isActive = t.id === active.id
                const meta = categoryMeta[t.category]
                const CategoryIcon = meta.icon
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveId(t.id)}
                    className={cn(
                      "grid w-full grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 text-left transition-colors",
                      isActive ? "bg-accent" : "hover:bg-accent/60"
                    )}
                  >
                    <CategoryIcon className={cn(
                      "size-3.5",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium">{t.name}</span>
                        {!t.enabled && (
                          <span className="rounded bg-muted px-1 text-[10px] uppercase text-muted-foreground">off</span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        <code className="font-mono">{t.trigger}</code>
                      </div>
                    </div>
                    <ChevronRight className="size-3.5 text-muted-foreground/60" />
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <DataCard
            icon={categoryMeta[active.category].icon}
            title={active.name}
            action={
              <div className="flex items-center gap-2">
                <ToneChip tone={active.enabled ? "ok" : "muted"}>
                  <StatusDot tone={active.enabled ? "ok" : "muted"} className="mr-1" />
                  {active.enabled ? "Enabled" : "Disabled"}
                </ToneChip>
                <Button variant="outline" size="sm" className="h-7">Edit</Button>
              </div>
            }
          >
            <FormRow label="Category">
              <ToneChip tone={categoryMeta[active.category].tone}>
                {categoryMeta[active.category].label}
              </ToneChip>
            </FormRow>
            <FormRow label="Trigger event">
              <code className="rounded bg-muted px-2 py-1 font-mono text-[11px]">
                {active.trigger}
              </code>
            </FormRow>
            <FormRow label="Channels">
              <div className="flex flex-wrap gap-1.5 py-1">
                {active.channels.map((ch) => {
                  const C = channelIcon[ch]
                  return (
                    <ToneChip key={ch} tone="muted" icon={C}>
                      {ch}
                    </ToneChip>
                  )
                })}
              </div>
            </FormRow>
            <FormRow label="Variables"><ReadValue>{active.variables}</ReadValue></FormRow>
            <FormRow label="Last edited">
              <ReadValue>{active.lastEditedBy} · {active.lastEditedAt}</ReadValue>
            </FormRow>
          </DataCard>

          <DataCard icon={Mail} title="Email preview">
            <div className="rounded-md border bg-muted/30 px-4 py-3">
              <div className="space-y-1 border-b pb-2 text-xs">
                <Hdr label="From">SIRP · Acme Corp &lt;noreply@sirp.acme.com&gt;</Hdr>
                <Hdr label="To">{`{{user.email}}`}</Hdr>
                <Hdr label="Subject">{previewSubject(active)}</Hdr>
              </div>
              <div className="space-y-2 pt-3 text-sm">
                <p>Hi {`{{user.first_name}}`},</p>
                <p>{previewBody(active)}</p>
                <SectionLabel>Variables</SectionLabel>
                <ul className="space-y-0.5">
                  <li><code className="font-mono text-[11px]">{`{{incident.id}}`}</code></li>
                  <li><code className="font-mono text-[11px]">{`{{incident.severity}}`}</code></li>
                  <li><code className="font-mono text-[11px]">{`{{incident.sla_remaining}}`}</code></li>
                </ul>
                <p className="text-muted-foreground">— SIRP Co-Analyst on behalf of {`{{tenant.name}}`}</p>
              </div>
            </div>
          </DataCard>
        </div>
      </div>
    </div>
  )
}

function Hdr({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[60px_minmax(0,1fr)] gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{children}</span>
    </div>
  )
}

function previewSubject(t: NotificationTemplate): string {
  switch (t.id) {
    case "t_inc_assigned":  return "Assigned to you · {{incident.id}}"
    case "t_sla_warning":   return "SLA warning · 30 min left on {{incident.id}}"
    case "t_sla_breach":    return "SLA breach · {{incident.id}}"
    case "t_user_invite":   return "You're invited to {{tenant.name}}"
    case "t_pwd_reset":     return "Reset your password"
    case "t_account_lock":  return "Your account has been locked"
    case "t_health_alert":  return "[SIRP] {{subsystem.name}} is degraded"
    case "t_backup_fail":   return "Backup job {{backup.id}} failed"
    case "t_exec_digest":   return "Weekly digest · {{date.range}}"
    case "t_oncall_digest": return "On-call summary · {{shift.id}}"
    default: return "{{notification.subject}}"
  }
}

function previewBody(t: NotificationTemplate): string {
  if (t.category === "incident") return "You've been assigned a new incident. Review the details below and acknowledge within your SLA."
  if (t.category === "access")    return "An access event was recorded for your account. If this wasn't you, contact your admin."
  if (t.category === "system")    return "A system event requires your attention. Open the linked dashboard to investigate."
  return "Your scheduled digest is ready. Highlights are below."
}
