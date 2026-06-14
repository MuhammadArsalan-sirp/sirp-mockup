import { CheckCircle2, Mail, Send, Server, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import { emailConfig } from "@/data/admin"
import {
  DataCard,
  FormRow,
  ReadValue,
  ToneChip,
  type Tone,
} from "./admin-ui"

export function AdminEmailPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Email server"
        description="SMTP host, sender identity, and outbound deliverability."
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9">
              <Send className="size-4 text-muted-foreground" />
              Send test
            </Button>
            <Button size="sm" className="h-9">Save changes</Button>
          </>
        }
      />

      <DataCard icon={Server} title="SMTP server">
        <FormRow label="Host"><ReadValue mono>{emailConfig.host}</ReadValue></FormRow>
        <FormRow label="Port"><ReadValue mono>{emailConfig.port}</ReadValue></FormRow>
        <FormRow label="Encryption">
          <ToneChip tone="ok">{emailConfig.encryption}</ToneChip>
        </FormRow>
        <FormRow label="Username"><ReadValue mono>{emailConfig.username}</ReadValue></FormRow>
        <FormRow label="Password"><ReadValue mono>•••••••••••• rotates 2026-08-04</ReadValue></FormRow>
      </DataCard>

      <DataCard icon={Mail} title="Sender identity">
        <FormRow label="From address" hint="Address used on every outbound message.">
          <ReadValue mono>{emailConfig.fromAddress}</ReadValue>
        </FormRow>
        <FormRow label="From name"><ReadValue>{emailConfig.fromName}</ReadValue></FormRow>
        <FormRow label="Reply-to"><ReadValue mono>{emailConfig.replyTo}</ReadValue></FormRow>
        <FormRow label="Daily limit">
          <ReadValue>{emailConfig.dailyLimit.toLocaleString()} / day</ReadValue>
        </FormRow>
      </DataCard>

      <DataCard icon={ShieldCheck} title="Authentication checks">
        <FormRow label="SPF" hint="v=spf1 include:spf.sirp.io ~all">
          <ToneChip tone={emailConfig.spfAligned ? "ok" : "alert"}>
            {emailConfig.spfAligned ? "Aligned" : "Failing"}
          </ToneChip>
        </FormRow>
        <FormRow label="DKIM" hint="sirp1024._domainkey.acme.com">
          <ToneChip tone={emailConfig.dkimSigned ? "ok" : "alert"}>
            {emailConfig.dkimSigned ? "Signed" : "Missing"}
          </ToneChip>
        </FormRow>
        <FormRow label="DMARC" hint="v=DMARC1; p=quarantine; rua=mailto:dmarc@acme.com">
          <ToneChip tone={emailConfig.dmarcAligned ? "ok" : "alert"}>
            {emailConfig.dmarcAligned ? "Aligned" : "Failing"}
          </ToneChip>
        </FormRow>
      </DataCard>

      <DataCard icon={CheckCircle2} title="Deliverability" bodyPadding="none">
        <div className="grid grid-cols-3 divide-x">
          <Metric label="Sent today" value={emailConfig.sentToday.toLocaleString()} sub={`of ${emailConfig.dailyLimit.toLocaleString()}`} />
          <Metric label="Delivered" value={`${emailConfig.deliveryRate}%`} sub="last 24h" tone="ok" />
          <Metric label="Bounce" value={`${emailConfig.bounceRate}%`} sub="last 24h" />
        </div>
      </DataCard>

      <p className="text-xs text-muted-foreground">
        Last test message sent {emailConfig.lastTestSentAt} · acknowledged in 412 ms.
      </p>
    </div>
  )
}

function Metric({ label, value, sub, tone = "muted" }: { label: string; value: string; sub: string; tone?: Tone }) {
  return (
    <div className="px-5 py-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 font-medium text-xl leading-none tabular-nums",
          tone === "ok" && "text-emerald-600 dark:text-emerald-400",
          tone === "alert" && "text-destructive",
          tone === "warn" && "text-amber-600 dark:text-amber-400"
        )}
      >
        {value}
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>
    </div>
  )
}
