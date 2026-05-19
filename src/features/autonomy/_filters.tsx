import { Check, PlusCircle, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { FacetedOption } from "@/components/shared/data-table"

/**
 * State-driven faceted filter — visually identical to
 * DataTableFacetedFilter but takes value/onChange instead of a TanStack
 * column. Lets us reuse the exact filter UX in card grids and simple
 * data shapes without forcing every Autonomy tab onto TanStack Table.
 */
export function FacetedFilter({
  value,
  onChange,
  title,
  options,
  facets,
}: {
  value: string[]
  onChange: (next: string[]) => void
  title: string
  options: readonly FacetedOption[]
  /** Optional value→count map shown next to each option. */
  facets?: Map<string, number> | Record<string, number>
}) {
  const selected = new Set(value)
  const getCount = (v: string) =>
    facets instanceof Map ? facets.get(v) : facets?.[v]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 border-dashed">
          <PlusCircle className="size-3.5" />
          {title}
          {selected.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-0.5 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selected.size}
              </Badge>
              <div className="hidden gap-1 lg:flex">
                {selected.size > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selected.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((o) => selected.has(o.value))
                    .map((o) => (
                      <Badge
                        key={o.value}
                        variant="secondary"
                        className="rounded-sm px-1 font-normal"
                      >
                        {o.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const isSelected = selected.has(opt.value)
                return (
                  <CommandItem
                    key={opt.value}
                    onSelect={() => {
                      const next = new Set(selected)
                      if (isSelected) next.delete(opt.value)
                      else next.add(opt.value)
                      onChange(Array.from(next))
                    }}
                  >
                    <div
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-[3px] border border-muted-foreground/60",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "opacity-70 [&_svg]:invisible"
                      )}
                    >
                      <Check className="size-3" />
                    </div>
                    {opt.swatch && (
                      <span
                        className="size-1.5 shrink-0 rounded-full"
                        style={{ background: opt.swatch }}
                      />
                    )}
                    {opt.icon && <opt.icon className="size-3.5 text-muted-foreground" />}
                    <span>{opt.label}</span>
                    {getCount(opt.value) !== undefined && (
                      <span className="ml-auto font-mono text-xs tabular-nums text-muted-foreground">
                        {getCount(opt.value)}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selected.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onChange([])}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/** Reset chip — matches incidents toolbar reset behaviour. */
export function ResetFilters({ onReset }: { onReset: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-9 px-2 text-muted-foreground hover:text-foreground"
      onClick={onReset}
    >
      Reset
      <X className="size-3.5" />
    </Button>
  )
}

/* ── Filter option registries ─────────────────────────────────────── */

export const appStatusOptions: readonly FacetedOption[] = [
  { value: "connected", label: "Connected", swatch: "var(--success)" },
  { value: "degraded", label: "Degraded", swatch: "var(--attention)" },
  { value: "disconnected", label: "Disconnected", swatch: "var(--destructive)" },
]

export const appCategoryOptions: readonly FacetedOption[] = [
  { value: "SIEM", label: "SIEM" },
  { value: "EDR", label: "EDR" },
  { value: "Email security", label: "Email security" },
  { value: "Identity", label: "Identity" },
  { value: "Ticketing", label: "Ticketing" },
  { value: "Threat intel", label: "Threat intel" },
  { value: "Firewall", label: "Firewall" },
]

export const appVendorOptions: readonly FacetedOption[] = [
  { value: "Splunk", label: "Splunk" },
  { value: "CrowdStrike", label: "CrowdStrike" },
  { value: "Microsoft", label: "Microsoft" },
  { value: "Proofpoint", label: "Proofpoint" },
  { value: "Okta", label: "Okta" },
  { value: "Atlassian", label: "Atlassian" },
  { value: "Google", label: "Google" },
  { value: "Palo Alto", label: "Palo Alto" },
]

/* Actions */
export const actionScopeOptions: readonly FacetedOption[] = [
  { value: "Hosts", label: "Hosts" },
  { value: "Users", label: "Users" },
  { value: "Network", label: "Network" },
  { value: "Email", label: "Email" },
  { value: "TI", label: "Threat intel" },
  { value: "Ticketing", label: "Ticketing" },
]

/* Ingestion */
export const ingestionModeOptions: readonly FacetedOption[] = [
  { value: "Polling", label: "Polling", swatch: "var(--info)" },
  { value: "Webhook", label: "Webhook", swatch: "var(--chart-1)" },
]

export const ingestionHealthOptions: readonly FacetedOption[] = [
  { value: "healthy", label: "Healthy", swatch: "var(--success)" },
  { value: "delayed", label: "Delayed", swatch: "var(--attention)" },
]

/* Artifact types */
export const artifactTypeOriginOptions: readonly FacetedOption[] = [
  { value: "system", label: "System" },
  { value: "custom", label: "Custom" },
]

/* Playbooks */
export const playbookStatusOptions: readonly FacetedOption[] = [
  { value: "active", label: "Active", swatch: "var(--success)" },
  { value: "draft", label: "Draft", swatch: "var(--muted-foreground)" },
  { value: "disabled", label: "Disabled", swatch: "var(--attention)" },
]

export const playbookFamilyOptions: readonly FacetedOption[] = [
  { value: "Phishing", label: "Phishing" },
  { value: "Malware", label: "Malware" },
  { value: "Identity", label: "Identity" },
  { value: "Network", label: "Network" },
  { value: "Data loss", label: "Data loss" },
  { value: "Vulnerability", label: "Vulnerability" },
  { value: "Threat intel", label: "Threat intel" },
]

export const playbookOwnerOptions: readonly FacetedOption[] = [
  { value: "Ahmed Khan", label: "Ahmed Khan (you)" },
  { value: "Sara Ahmed", label: "Sara Ahmed" },
  { value: "John Doe", label: "John Doe" },
  { value: "Priya Sharma", label: "Priya Sharma" },
  { value: "Liam Chen", label: "Liam Chen" },
]

/** Single-select in Autonomy filter popover — agent listing scope. */
export const agentScopeOptions: readonly FacetedOption[] = [
  { value: "all_active", label: "All active" },
  { value: "default", label: "Default agents" },
  { value: "custom", label: "Custom agents" },
  { value: "inactive", label: "Inactive only" },
]

/** Single-select — playbook library slice. */
export const playbookLibraryOptions: readonly FacetedOption[] = [
  { value: "all", label: "All playbooks" },
  { value: "mine", label: "Mine" },
  { value: "marketplace", label: "Marketplace" },
]

/** Single-select — approval queue (empty in state = show every status). */
export const approvalQueueOptions: readonly FacetedOption[] = [
  { value: "pending", label: "Pending", swatch: "var(--attention)" },
  { value: "approved", label: "Approved", swatch: "var(--success)" },
  { value: "declined", label: "Declined", swatch: "var(--destructive)" },
  { value: "all", label: "All statuses" },
]

/* Agents */
export const agentModuleOptions: readonly FacetedOption[] = [
  { value: "Incident management", label: "Incident management" },
  { value: "Email security", label: "Email security" },
  { value: "Threat intel", label: "Threat intel" },
  { value: "Identity", label: "Identity" },
  { value: "Vulnerability", label: "Vulnerability" },
  { value: "Data loss", label: "Data loss" },
  { value: "Resilience", label: "Resilience" },
]

export const agentStageOptions: readonly FacetedOption[] = [
  { value: "Detection", label: "Detection" },
  { value: "Triage", label: "Triage" },
  { value: "Enrichment", label: "Enrichment" },
  { value: "Containment", label: "Containment" },
  { value: "Analysis", label: "Analysis" },
  { value: "Verification", label: "Verification" },
]

/* Lab runs */
export const runStatusOptions: readonly FacetedOption[] = [
  { value: "success", label: "Success", swatch: "var(--success)" },
  { value: "running", label: "Running", swatch: "var(--info)" },
  { value: "queued", label: "Queued", swatch: "var(--muted-foreground)" },
  { value: "failed", label: "Failed", swatch: "var(--destructive)" },
]

export const runContainerOptions: readonly FacetedOption[] = [
  { value: "incident", label: "Incident" },
  { value: "advisory", label: "Advisory" },
  { value: "case", label: "Case" },
]

export const runTriggerOptions: readonly FacetedOption[] = [
  { value: "Auto", label: "Auto" },
  { value: "Manual", label: "Manual" },
  { value: "Schedule", label: "Schedule" },
]

/* Artifacts */
export const artifactTypeOptions: readonly FacetedOption[] = [
  { value: "ip", label: "IP address" },
  { value: "domain", label: "Domain" },
  { value: "hash", label: "Hash" },
  { value: "email", label: "Email" },
  { value: "url", label: "URL" },
]

export const artifactStatusOptions: readonly FacetedOption[] = [
  { value: "active", label: "Active" },
  { value: "whitelisted", label: "Whitelisted", swatch: "var(--success)" },
]

/* Approvals */
export const approvalStatusOptions: readonly FacetedOption[] = [
  { value: "pending", label: "Pending", swatch: "var(--attention)" },
  { value: "approved", label: "Approved", swatch: "var(--success)" },
  { value: "declined", label: "Declined", swatch: "var(--destructive)" },
]

export const approvalAppOptions: readonly FacetedOption[] = [
  { value: "CrowdStrike Falcon", label: "CrowdStrike Falcon" },
  { value: "Okta", label: "Okta" },
  { value: "Palo Alto NGFW", label: "Palo Alto NGFW" },
  { value: "Microsoft Sentinel", label: "Microsoft Sentinel" },
  { value: "Proofpoint TAP", label: "Proofpoint TAP" },
]

/* Control policies */
export const policyEffectOptions: readonly FacetedOption[] = [
  { value: "allow", label: "Allow", swatch: "var(--success)" },
  { value: "approve", label: "Approve", swatch: "var(--attention)" },
  { value: "deny", label: "Deny", swatch: "var(--destructive)" },
]

export const policyStatusOptions: readonly FacetedOption[] = [
  { value: "enforced", label: "Enforced" },
  { value: "monitor", label: "Monitor", swatch: "var(--info)" },
  { value: "draft", label: "Draft", swatch: "var(--muted-foreground)" },
]
