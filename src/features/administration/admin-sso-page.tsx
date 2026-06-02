import { useState } from "react"
import {
  AlertTriangle,
  Copy,
  Download,
  KeyRound,
  Plus,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import { ssoProviders, type SsoProvider } from "@/data/admin"
import {
  DataCard,
  FormRow,
  ReadValue,
  SectionLabel,
  StatusDot,
  ToggleRow,
  ToneChip,
  type Tone,
} from "./admin-ui"

const statusTone: Record<SsoProvider["status"], Tone> = {
  active: "ok", draft: "warn", disabled: "muted",
}

const statusLabel: Record<SsoProvider["status"], string> = {
  active: "Active", draft: "Draft", disabled: "Disabled",
}

export function AdminSsoPage() {
  const [activeId, setActiveId] = useState(ssoProviders[0]?.id ?? "")
  const active = ssoProviders.find((p) => p.id === activeId) ?? ssoProviders[0]
  const certTone: Tone =
    active.certDaysLeft === undefined ? "muted"
    : active.certDaysLeft <= 14 ? "alert"
    : active.certDaysLeft <= 45 ? "warn"
    : "ok"

  return (
    <div className="space-y-5">
      <PageHeader
        title="SSO & SAML"
        description="Identity providers, certificates, and JIT provisioning."
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9">
              <Download className="size-4 text-muted-foreground" />
              SP metadata
            </Button>
            <Button size="sm" className="h-9">
              <Plus className="size-4" />
              Add provider
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Provider list */}
        <Card>
          <CardContent className="px-2 py-2">
            <div className="px-2 pt-1 pb-2">
              <SectionLabel>Identity providers</SectionLabel>
            </div>
            <div className="space-y-0.5">
              {ssoProviders.map((p) => {
                const isActive = p.id === active.id
                return (
                  <button
                    key={p.id}
                    onClick={() => setActiveId(p.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition-colors",
                      isActive ? "bg-accent" : "hover:bg-accent/60"
                    )}
                  >
                    <KeyRound className={cn(
                      "size-3.5 shrink-0",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium">{p.name}</span>
                        <span className="rounded bg-muted px-1 font-mono text-[10px] uppercase text-muted-foreground">
                          {p.kind}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <StatusDot tone={statusTone[p.status]} />
                        {statusLabel[p.status]} · {p.users} users
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Provider detail */}
        <div className="min-w-0 space-y-4">
          {active.certDaysLeft !== undefined && active.certDaysLeft <= 30 && (
            <div className="flex items-start gap-3 rounded-md border border-destructive/25 bg-destructive/5 px-3 py-2.5">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <div className="flex-1">
                <div className="text-sm font-medium text-destructive">
                  Certificate expires in {active.certDaysLeft} days
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload a new IdP signing certificate to {active.name} before {active.certExpires}.
                </p>
              </div>
              <Button size="sm" className="h-7">Rotate</Button>
            </div>
          )}

          <DataCard
            icon={KeyRound}
            title={active.name}
            action={
              <div className="flex items-center gap-1.5">
                <ToneChip tone={statusTone[active.status]}>{statusLabel[active.status]}</ToneChip>
                <ToneChip tone="muted">{active.kind.toUpperCase()}</ToneChip>
                <ToneChip tone={certTone}>Cert {active.certDaysLeft ?? "—"}d</ToneChip>
              </div>
            }
          >
            <p className="mb-3 text-sm text-muted-foreground">{active.description}</p>

            <FormRow label="Domain"><ReadValue mono>{active.domain}</ReadValue></FormRow>
            <FormRow label="ACS URL" hint="Where the IdP posts SAML assertions.">
              <div className="flex items-center gap-2">
                <ReadValue mono className="flex-1">
                  {active.acsUrl ?? "https://app.sirp.io/sso/saml/acs"}
                </ReadValue>
                <Button variant="outline" size="icon-sm" className="size-9">
                  <Copy className="size-3.5" />
                </Button>
              </div>
            </FormRow>
            <FormRow label="Issuer / Entity ID">
              <ReadValue mono>{active.issuer ?? "urn:sirp:tenant:acme"}</ReadValue>
            </FormRow>
            <FormRow label="Certificate expiry" hint="Rotate before this date to avoid SSO disruption.">
              <ReadValue>{active.certExpires ?? "—"}</ReadValue>
            </FormRow>
          </DataCard>

          <DataCard icon={RefreshCw} title="Provisioning">
            <div className="space-y-1">
              <ToggleRow
                label="Just-in-time provisioning"
                description="Create new users on first successful sign-in."
                enabled={active.jit}
              />
              <ToggleRow
                label="De-provision on group removal"
                description="Deactivate users when their IdP group membership is revoked."
                enabled
              />
              <ToggleRow
                label="SCIM 2.0 sync"
                description="Push user lifecycle events from the IdP."
                enabled={active.kind === "saml"}
              />
            </div>
          </DataCard>

          <DataCard icon={KeyRound} title="Group mapping" contentClassName="px-0 py-0 pt-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-2 font-medium">IdP group</th>
                  <th className="px-5 py-2 font-medium">SIRP group</th>
                  <th className="px-5 py-2 font-medium">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  ["okta-soc-managers", "SOC Managers",     "SOC Manager"],
                  ["okta-soc-tier2",    "SOC Tier 2",       "Tier 2 Analyst"],
                  ["okta-soc-tier1",    "SOC Tier 1",       "Tier 1 Analyst"],
                  ["okta-ir-leads",     "Incident Response","IR Lead"],
                  ["okta-auditors",     "Compliance",       "Auditor (read-only)"],
                ].map(([idp, group, role]) => (
                  <tr key={idp}>
                    <td className="px-5 py-2.5">
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">{idp}</code>
                    </td>
                    <td className="px-5 py-2.5 font-medium">{group}</td>
                    <td className="px-5 py-2.5 text-muted-foreground">{role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataCard>
        </div>
      </div>
    </div>
  )
}
