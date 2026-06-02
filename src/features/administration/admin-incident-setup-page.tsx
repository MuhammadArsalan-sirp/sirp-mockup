import { useState } from "react"
import {
  ChevronRight,
  Clock,
  Layers,
  Plus,
  Search,
  Tag,
  Workflow,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import {
  incidentCategories,
  incidentCustomFields,
  incidentStates,
  type IncidentCategoryRow,
  type IncidentState,
} from "@/data/admin"
import {
  StatusDot,
  ToneChip,
  type Tone,
} from "./admin-ui"

const sevTone: Record<IncidentCategoryRow["defaultSeverity"], Tone> = {
  Sev1: "alert", Sev2: "warn", Sev3: "primary", Sev4: "muted", Sev5: "ok",
}

const stateTone: Record<IncidentState["kind"], Tone> = {
  open: "alert", "in-progress": "warn", waiting: "primary", closed: "ok",
}

type Tab = "categories" | "states" | "fields"

const tabs: { id: Tab; label: string; icon: LucideIcon; count: number }[] = [
  { id: "categories", label: "Categories & SLAs", icon: Tag,      count: incidentCategories.length },
  { id: "states",     label: "Workflow states",   icon: Workflow, count: incidentStates.length },
  { id: "fields",     label: "Custom fields",     icon: Layers,   count: incidentCustomFields.length },
]

export function AdminIncidentSetupPage() {
  const [tab, setTab] = useState<Tab>("categories")

  return (
    <div className="space-y-5">
      <PageHeader
        title="Incident setup"
        description="Taxonomy, default severities, SLA targets, workflow states, and custom fields. Changes apply to new incidents only."
        actions={
          <Button size="sm" className="h-9">
            <Plus className="size-4" />
            {tab === "categories" ? "New category" : tab === "states" ? "New state" : "New field"}
          </Button>
        }
      />

      {/* Sub-tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b pb-1.5">
        {tabs.map((t) => {
          const Icon = t.icon
          const isActive = t.id === tab
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-2 border-b-2 -mb-1.5 px-3 py-2 text-sm transition-colors",
                isActive
                  ? "border-primary font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-3.5" />
              {t.label}
              <span className={cn(
                "rounded px-1 font-mono text-[10px] tabular-nums",
                isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {t.count}
              </span>
            </button>
          )
        })}
      </div>

      {tab === "categories" && <CategoriesTab />}
      {tab === "states" && <StatesTab />}
      {tab === "fields" && <FieldsTab />}
    </div>
  )
}

function CategoriesTab() {
  return (
    <Card>
      <CardContent className="px-0 py-0">
        <div className="flex items-center gap-2 border-b px-4 py-2.5">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search categories…" className="h-8 pl-8 text-sm" />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-2 font-medium">Category</th>
              <th className="px-4 py-2 font-medium">Default severity</th>
              <th className="px-4 py-2 font-medium">Ack SLA</th>
              <th className="px-4 py-2 font-medium">Resolve SLA</th>
              <th className="px-4 py-2 font-medium">Playbook</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {incidentCategories.map((c) => (
              <tr key={c.id} className="hover:bg-accent/40">
                <td className="px-4 py-2.5">
                  <div className={cn("flex items-center gap-2", c.parent && "pl-5")}>
                    {c.parent && <ChevronRight className="size-3 text-muted-foreground" />}
                    <span className="font-medium">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <ToneChip tone={sevTone[c.defaultSeverity]}>{c.defaultSeverity}</ToneChip>
                </td>
                <td className="px-4 py-2.5 font-mono tabular-nums text-[12px]">{formatSla(c.sla.ack)}</td>
                <td className="px-4 py-2.5 font-mono tabular-nums text-[12px]">{formatSla(c.sla.resolve)}</td>
                <td className="px-4 py-2.5">
                  {c.playbook ? (
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">{c.playbook}</code>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <ToneChip tone={c.enabled ? "ok" : "muted"}>
                    <StatusDot tone={c.enabled ? "ok" : "muted"} className="mr-1" />
                    {c.enabled ? "Enabled" : "Disabled"}
                  </ToneChip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

function StatesTab() {
  return (
    <Card>
      <CardContent className="px-0 py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-2 font-medium">State</th>
              <th className="px-4 py-2 font-medium">Kind</th>
              <th className="px-4 py-2 font-medium">SLA timer</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {incidentStates.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-2.5 font-medium">{s.label}</td>
                <td className="px-4 py-2.5">
                  <ToneChip tone={stateTone[s.kind]} className="capitalize">{s.kind.replace("-", " ")}</ToneChip>
                </td>
                <td className="px-4 py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <Clock className="size-3 text-muted-foreground" />
                    {s.slaActive ? "Counts against SLA" : "Paused"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

function FieldsTab() {
  return (
    <Card>
      <CardContent className="px-0 py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-2 font-medium">Field</th>
              <th className="px-4 py-2 font-medium">Type</th>
              <th className="px-4 py-2 font-medium">Required</th>
              <th className="px-4 py-2 font-medium">Scope</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {incidentCustomFields.map((f) => (
              <tr key={f.id}>
                <td className="px-4 py-2.5">
                  <div>
                    <div className="font-medium">{f.label}</div>
                    <code className="text-[11px] text-muted-foreground font-mono">{f.id}</code>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <ToneChip tone="muted">{f.type}</ToneChip>
                </td>
                <td className="px-4 py-2.5">
                  <ToneChip tone={f.required ? "warn" : "muted"}>
                    {f.required ? "Required" : "Optional"}
                  </ToneChip>
                </td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{f.scope}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

function formatSla(minutes: number): string {
  if (minutes >= 60 * 24) return `${(minutes / (60 * 24)).toFixed(0)} d`
  if (minutes >= 60) return `${(minutes / 60).toFixed(minutes % 60 ? 1 : 0)} h`
  return `${minutes} min`
}
