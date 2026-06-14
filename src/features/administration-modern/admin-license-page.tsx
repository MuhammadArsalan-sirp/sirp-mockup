import {
  CheckCircle2,
  CreditCard,
  Download,
  ExternalLink,
  Sparkles,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import { licenseDetail } from "@/data/admin"
import {
  DataCard,
  FormRow,
  ReadValue,
  ToneChip,
  type Tone,
} from "./admin-ui"

const invoiceTone: Record<"paid" | "due" | "overdue", Tone> = {
  paid: "ok", due: "warn", overdue: "alert",
}

export function AdminLicensePage() {
  const seatUsedPct = (licenseDetail.seats.used / licenseDetail.seats.total) * 100

  return (
    <div className="space-y-5">
      <PageHeader
        title="License & seats"
        description="Subscription plan, seat allocation, renewal dates, and invoices."
        actions={
          <Button variant="outline" size="sm" className="h-9">
            <Sparkles className="size-4 text-muted-foreground" />
            Request upgrade
          </Button>
        }
      />

      <DataCard icon={CreditCard} title="Plan">
        <FormRow label="Plan">
          <div className="flex items-center gap-2">
            <span className="font-medium">{licenseDetail.plan}</span>
            <ToneChip tone="ok">{licenseDetail.status}</ToneChip>
            <ToneChip tone="muted">{licenseDetail.billingCycle}</ToneChip>
          </div>
        </FormRow>
        <FormRow label="Started"><ReadValue>{licenseDetail.startDate}</ReadValue></FormRow>
        <FormRow label="Renews" hint={`${licenseDetail.daysToRenewal} days remaining`}>
          <ReadValue>{licenseDetail.renewalDate}</ReadValue>
        </FormRow>
        <FormRow label="Seats">
          <div className="space-y-2 py-1">
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-lg tabular-nums">{licenseDetail.seats.used}</span>
              <span className="text-sm text-muted-foreground">/ {licenseDetail.seats.total}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {licenseDetail.seats.pending} pending
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${seatUsedPct}%` }} />
            </div>
          </div>
        </FormRow>
      </DataCard>

      <DataCard icon={Sparkles} title="Features included" bodyPadding="none">
        <div className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="divide-y">
            {licenseDetail.features.slice(0, 4).map((f) => (
              <FeatureRow key={f.id} included={f.included} label={f.label} />
            ))}
          </div>
          <div className="divide-y">
            {licenseDetail.features.slice(4).map((f) => (
              <FeatureRow key={f.id} included={f.included} label={f.label} />
            ))}
          </div>
        </div>
      </DataCard>

      <DataCard icon={CreditCard} title="Billing contact">
        <FormRow label="Owner"><ReadValue>Ahmed Khan</ReadValue></FormRow>
        <FormRow label="Email"><ReadValue mono>{licenseDetail.contactEmail}</ReadValue></FormRow>
        <FormRow label="Account ID"><ReadValue mono>acct_acme_010423</ReadValue></FormRow>
        <FormRow label="Payment method"><ReadValue mono>ACH · ••••0421</ReadValue></FormRow>
        <FormRow label="Portal">
          <Button variant="outline" size="sm" className="h-8">
            <ExternalLink className="size-3.5 text-muted-foreground" />
            Open billing portal
          </Button>
        </FormRow>
      </DataCard>

      <DataCard icon={Download} title="Invoice history" bodyPadding="none">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-2 font-medium">Invoice</th>
              <th className="px-5 py-2 font-medium">Date</th>
              <th className="px-5 py-2 font-medium">Amount</th>
              <th className="px-5 py-2 font-medium">Status</th>
              <th className="w-10 px-5 py-2 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {licenseDetail.invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="px-5 py-2.5 font-medium">{inv.number}</td>
                <td className="px-5 py-2.5 font-mono text-[12px] text-muted-foreground">{inv.date}</td>
                <td className="px-5 py-2.5 font-mono tabular-nums">{inv.amount}</td>
                <td className="px-5 py-2.5">
                  <ToneChip tone={invoiceTone[inv.status]}>{inv.status}</ToneChip>
                </td>
                <td className="px-5 py-2.5 text-right">
                  <Button variant="ghost" size="icon-sm">
                    <Download className="size-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataCard>
    </div>
  )
}

function FeatureRow({ included, label }: { included: boolean; label: string }) {
  return (
    <div className={cn("flex items-center gap-2 px-5 py-2.5 text-sm", !included && "opacity-60")}>
      {included ? (
        <CheckCircle2 className="size-3.5 text-emerald-500" />
      ) : (
        <X className="size-3.5 text-muted-foreground" />
      )}
      <span className="flex-1">{label}</span>
      {!included && (
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
          Add-on
        </span>
      )}
    </div>
  )
}
