import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { tenants, type Tenant } from "@/data/admin"
import {
  StatusDot,
  ToneChip,
  type Tone,
} from "./admin-ui"

const statusTone: Record<Tenant["status"], Tone> = {
  active: "ok", suspended: "alert", trial: "warn",
}

const statusLabel: Record<Tenant["status"], string> = {
  active: "Active", suspended: "Suspended", trial: "Trial",
}

export function AdminTenantsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Tenants"
        description="Child tenants you operate under this SIRP account. Each tenant has independent data, users, and residency."
        actions={
          <Button size="sm" className="h-9">
            <Plus className="size-4" />
            New tenant
          </Button>
        }
      />

      <Card>
        <CardContent className="px-0 py-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-2 font-medium">Tenant</th>
                <th className="px-5 py-2 font-medium">Plan</th>
                <th className="px-5 py-2 font-medium">Region</th>
                <th className="px-5 py-2 font-medium">Users</th>
                <th className="px-5 py-2 font-medium">Incidents · 30d</th>
                <th className="px-5 py-2 font-medium">Storage</th>
                <th className="px-5 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-accent/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div>
                        <div className="text-sm font-medium leading-tight">{t.name}</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                          {t.primaryContact} · created {t.createdAt}
                        </div>
                      </div>
                      {t.ksaResident && <ToneChip tone="ok">KSA</ToneChip>}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <ToneChip tone="muted">{t.plan}</ToneChip>
                  </td>
                  <td className="px-5 py-3 font-mono text-[12px] text-muted-foreground">{t.region}</td>
                  <td className="px-5 py-3 font-mono tabular-nums">{t.users}</td>
                  <td className="px-5 py-3 font-mono tabular-nums">{t.incidents30d.toLocaleString()}</td>
                  <td className="px-5 py-3 font-mono tabular-nums">{t.storageGb} GB</td>
                  <td className="px-5 py-3">
                    <ToneChip tone={statusTone[t.status]}>
                      <StatusDot tone={statusTone[t.status]} className="mr-1" />
                      {statusLabel[t.status]}
                    </ToneChip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Tenant isolation: row-level security on every table. KSA tenants never route data or inference outside ksa-central-1.
      </p>
    </div>
  )
}
