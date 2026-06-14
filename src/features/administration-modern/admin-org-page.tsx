import { useState } from "react"
import {
  Building,
  ExternalLink,
  Globe,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"

type SectionId =
  | "general"
  | "address"
  | "contacts"
  | "regional"
  | "privacy"

const sections: {
  id: SectionId
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: "general", label: "General", icon: Building },
  { id: "address", label: "Address", icon: MapPin },
  { id: "contacts", label: "Contacts", icon: Users },
  { id: "regional", label: "Regional", icon: Globe },
  { id: "privacy", label: "Privacy & data", icon: Lock },
]

export function AdminOrgPage() {
  const [active, setActive] = useState<SectionId>("general")
  const [analytics, setAnalytics] = useState(true)
  const [redactPii, setRedactPii] = useState(true)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organisation"
        description={
          <>
            Profile information, branding, address, and tenant identity for{" "}
            <strong className="font-medium text-foreground">Acme Corp</strong>.
          </>
        }
        actions={
          <Button variant="outline" size="sm" className="h-9">
            <ExternalLink className="size-4 text-muted-foreground" />
            View public page
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[200px_1fr]">
        {/* Left rail of section anchors */}
        <aside className="hidden lg:block">
          <nav className="sticky top-0 space-y-0.5">
            {sections.map((s) => {
              const Icon = s.icon
              const isActive = active === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setActive(s.id)
                    document
                      .getElementById(s.id)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
                    isActive
                      ? "bg-accent font-medium text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    isActive && "border-l-2 border-primary"
                  )}
                >
                  <Icon className="size-3.5" />
                  {s.label}
                </button>
              )
            })}
            <div className="mt-3 border-t pt-3">
              <div className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Danger zone
              </div>
              <button className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/10">
                <Trash2 className="size-3.5" />
                Archive workspace
              </button>
            </div>
          </nav>
        </aside>

        {/* Form sections */}
        <div className="min-w-0 space-y-6">
          {/* General */}
          <Section
            id="general"
            title="General"
            description="Public-facing identity for your organisation."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Organisation name" hint="Used in emails, reports and the SOC dashboard header.">
                <Input defaultValue="Acme Corporation" />
              </Field>
              <Field label="Display name" hint="Short form shown in the sidebar.">
                <Input defaultValue="Acme Corp" />
              </Field>
            </div>

            <Field label="About" hint="Up to 280 characters. Visible to invited external collaborators.">
              <Textarea
                defaultValue="Acme Corp operates a 24/7 SOC across EMEA and APAC, supporting financial-services and healthcare clients. SIRP is our primary case management platform."
                rows={3}
              />
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Industry">
                <SelectInput
                  defaultValue="finance"
                  options={[
                    { value: "finance", label: "Financial Services" },
                    { value: "health", label: "Healthcare" },
                    { value: "tech", label: "Technology" },
                    { value: "gov", label: "Government" },
                  ]}
                />
              </Field>
              <Field label="Workspace size">
                <SelectInput
                  defaultValue="m"
                  options={[
                    { value: "s", label: "50–250 users" },
                    { value: "m", label: "250–1000 users" },
                    { value: "l", label: "1000+ users" },
                  ]}
                />
              </Field>
            </div>

            <Field
              label="Workspace URL"
              hint="Changing this will invalidate existing magic links and SSO redirect URIs."
            >
              <div className="flex items-center">
                <span className="inline-flex h-9 items-center rounded-l-md border border-r-0 bg-muted px-3 font-mono text-sm text-muted-foreground">
                  acme-corp.
                </span>
                <Input
                  className="rounded-l-none bg-muted text-muted-foreground"
                  defaultValue="sirp.io"
                  readOnly
                />
                <Button variant="outline" size="sm" className="ml-2 h-9">
                  Change
                </Button>
              </div>
            </Field>
          </Section>

          {/* Address */}
          <Section
            id="address"
            title="Address"
            description="Used for billing, compliance reports and customer-facing contracts."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Country">
                <SelectInput
                  defaultValue="uk"
                  options={[
                    { value: "uk", label: "United Kingdom" },
                    { value: "us", label: "United States" },
                    { value: "de", label: "Germany" },
                  ]}
                />
              </Field>
              <Field label="Region / state">
                <Input defaultValue="Greater London" />
              </Field>
              <Field label="City">
                <Input defaultValue="London" />
              </Field>
              <Field label="Postal code">
                <Input defaultValue="EC2A 4DP" />
              </Field>
            </div>
            <Field label="Street address">
              <Input defaultValue="58 Tabernacle Street, Shoreditch" />
            </Field>
          </Section>

          {/* Contacts */}
          <Section
            id="contacts"
            title="Contacts"
            description="Where SIRP sends billing, security and incident-escalation notifications."
          >
            <ContactRow
              icon={<ShieldCheck className="size-4" />}
              title="Primary admin"
              meta="ahmed.khan@sirp.io"
            />
            <ContactRow
              icon={<Mail className="size-4" />}
              title="Billing email"
              meta="billing@acme.com"
            />
            <ContactRow
              icon={<Phone className="size-4" />}
              title="Out-of-hours escalation"
              meta="+44 20 7000 0000 · soc-oncall@acme.com"
            />
          </Section>

          {/* Regional */}
          <Section
            id="regional"
            title="Regional defaults"
            description="New users inherit these settings; individual users can override."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Default timezone">
                <SelectInput
                  defaultValue="london"
                  options={[
                    { value: "london", label: "(UTC+01:00) Europe/London" },
                    { value: "utc", label: "(UTC+00:00) UTC" },
                    { value: "ny", label: "(UTC−05:00) America/New York" },
                  ]}
                />
              </Field>
              <Field label="Date format">
                <SelectInput
                  defaultValue="iso"
                  options={[
                    { value: "iso", label: "2026-04-29 (ISO 8601)" },
                    { value: "intl", label: "29 Apr 2026" },
                    { value: "us", label: "04/29/2026" },
                  ]}
                />
              </Field>
              <Field label="Default language">
                <SelectInput
                  defaultValue="en-uk"
                  options={[
                    { value: "en-uk", label: "English (UK)" },
                    { value: "en-us", label: "English (US)" },
                    { value: "de", label: "Deutsch" },
                    { value: "fr", label: "Français" },
                  ]}
                />
              </Field>
              <Field label="First day of week">
                <SelectInput
                  defaultValue="mon"
                  options={[
                    { value: "mon", label: "Monday" },
                    { value: "sun", label: "Sunday" },
                  ]}
                />
              </Field>
            </div>
          </Section>

          {/* Privacy */}
          <Section
            id="privacy"
            title="Privacy & data"
            description="How SIRP handles, retains, and exports your data."
          >
            <PrivacyRow
              title="Allow analytics & product telemetry"
              description="Aggregate, anonymised usage data used to improve the product."
              control={<Switch checked={analytics} onChange={setAnalytics} label="Toggle analytics" />}
            />
            <PrivacyRow
              title="Auto-redact PII in incident exports"
              description="Mask emails, phone numbers and IDs in PDF/CSV exports by default."
              control={<Switch checked={redactPii} onChange={setRedactPii} label="Toggle PII redaction" />}
            />
            <PrivacyRow
              title="Audit log retention"
              description={
                <>
                  Currently <span className="font-medium text-foreground">2 years</span> · Enterprise
                  plan supports up to 7 years.
                </>
              }
              control={
                <SelectInput
                  defaultValue="2y"
                  className="w-35"
                  options={[
                    { value: "2y", label: "2 years" },
                    { value: "3y", label: "3 years" },
                    { value: "5y", label: "5 years" },
                    { value: "7y", label: "7 years" },
                  ]}
                />
              }
            />
            <PrivacyRow
              title="Request data export"
              description="Generate a complete export of all workspace data (GDPR Article 15)."
              control={
                <Button variant="outline" size="sm" className="h-8 shrink-0">
                  Request export
                </Button>
              }
            />
          </Section>
        </div>
      </div>

      {/* Save bar */}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center">
        <div className="pointer-events-auto flex items-center gap-3 rounded-full border bg-popover py-1.5 pr-2 pl-4 text-sm shadow-lg">
          <span className="size-2 rounded-full bg-amber-500" />
          <span>
            <span className="font-semibold">Unsaved changes</span> in Organisation
          </span>
          <div className="mx-1 h-4 w-px bg-border" />
          <Button variant="ghost" size="sm" className="h-8 rounded-full">
            Discard
          </Button>
          <Button size="sm" className="h-8 rounded-full">
            Save changes
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Building blocks
// ─────────────────────────────────────────────────────────────────

function Section({
  id,
  title,
  description,
  badge,
  children,
}: {
  id: SectionId
  title: string
  description: string
  badge?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section id={id} className="rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        {badge}
      </div>
      <div className="space-y-5 p-6">{children}</div>
    </section>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: React.ReactNode
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="block">{label}</Label>
      {children}
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  )
}

function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-20 w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
        className
      )}
      {...props}
    />
  )
}

function SelectInput({
  defaultValue,
  options,
  className,
}: {
  defaultValue: string
  options: { value: string; label: string }[]
  className?: string
}) {
  return (
    <Select defaultValue={defaultValue}>
      <SelectTrigger className={cn("w-full", className)}>
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
  )
}

function ContactRow({
  icon,
  title,
  meta,
}: {
  icon: React.ReactNode
  title: string
  meta: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary text-foreground">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{title}</div>
        <div className="truncate text-xs text-muted-foreground">{meta}</div>
      </div>
      <button className="text-xs text-primary hover:underline">Change</button>
    </div>
  )
}

function PrivacyRow({
  title,
  description,
  control,
}: {
  title: string
  description: React.ReactNode
  control: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
      <div className="min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{description}</div>
      </div>
      <div className="mt-1 shrink-0">{control}</div>
    </div>
  )
}

/**
 * Tiny custom toggle — no shadcn `switch` is shipped in this project,
 * and adding a Radix primitive just for one widget is overkill. Mirrors
 * shadcn's visual API (rounded pill, transition, focus ring).
 */
function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        checked ? "bg-primary" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "inline-block size-3.5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-4.5" : "translate-x-0.75"
        )}
      />
    </button>
  )
}
