import { useState } from "react"
import {
  Boxes,
  Cpu,
  Edit,
  Layers,
  Lock,
  MonitorSmartphone,
  Plus,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import { FilterBar, SearchInput, ToneChip, type Tone } from "./admin-ui"
import { AdminFiltersPopover, type AdminFilterGroups } from "./admin-filters-popover"

const ENTITY_FILTERS: AdminFilterGroups = [
  [
    {
      id: "managed",
      label: "Managed by",
      icon: Lock,
      options: [
        { value: "system", label: "System" },
        { value: "custom", label: "Custom" },
      ],
    },
  ],
  [
    {
      id: "tier",
      label: "Classification tier",
      icon: ShieldCheck,
      options: [
        { value: "0", label: "Tier 0 · Critical" },
        { value: "1", label: "Tier 1 · High" },
        { value: "2", label: "Tier 2 · Elevated" },
        { value: "3", label: "Tier 3 · Medium" },
        { value: "4", label: "Tier 4 · Low" },
      ],
    },
    {
      id: "scope",
      label: "Compliance scope",
      icon: Layers,
      options: [
        { value: "pci",   label: "PCI-DSS" },
        { value: "hipaa", label: "HIPAA" },
        { value: "sox",   label: "SOX" },
        { value: "gdpr",  label: "GDPR" },
      ],
    },
  ],
]

// ── Fixtures (kept inline; small enough not to need a data file split) ──

type Row = {
  id: string
  name: string
  description?: string
  count: number
  managed: "system" | "custom"
  updatedAt: string
  tone?: Tone
  meta?: string
}

const assetTypes: Row[] = [
  { id: "at_workstation", name: "Workstation",     description: "Employee laptops and desktops",        count: 642, managed: "system", updatedAt: "—",            tone: "muted" },
  { id: "at_server",      name: "Server",          description: "Physical and virtual servers",         count: 184, managed: "system", updatedAt: "—",            tone: "muted" },
  { id: "at_mobile",      name: "Mobile device",   description: "Phones and tablets — MDM-managed",     count: 308, managed: "system", updatedAt: "—",            tone: "muted" },
  { id: "at_cloud",       name: "Cloud workload",  description: "EC2, GCE, AKS, Lambda, GKE pods",      count: 94,  managed: "system", updatedAt: "—",            tone: "muted" },
  { id: "at_network",     name: "Network device",  description: "Switches, firewalls, load balancers",  count: 62,  managed: "system", updatedAt: "—",            tone: "muted" },
  { id: "at_iot",         name: "IoT / OT",        description: "Operational technology and IoT estate",count: 23,  managed: "custom", updatedAt: "3 days ago",   tone: "info" },
  { id: "at_application", name: "Application",     description: "SaaS and self-hosted business apps",   count: 47,  managed: "custom", updatedAt: "this morning", tone: "info" },
  { id: "at_container",   name: "Container image", description: "OCI images tracked in registries",     count: 218, managed: "custom", updatedAt: "yesterday",    tone: "info" },
]

const classifications: Row[] = [
  { id: "cl_crit",         name: "Critical",     description: "Tier-0 asset — failure halts revenue or operations", count: 14,  managed: "system", updatedAt: "—",      meta: "Tier 0", tone: "alert" },
  { id: "cl_high",         name: "High",         description: "Revenue-impacting or customer-facing",                count: 78,  managed: "system", updatedAt: "—",      meta: "Tier 1", tone: "warn"  },
  { id: "cl_elevated",     name: "Elevated",     description: "Important internal — meaningful disruption if down",  count: 142, managed: "system", updatedAt: "—",      meta: "Tier 2", tone: "info"  },
  { id: "cl_medium",       name: "Medium",       description: "Standard estate — recoverable within SLA",            count: 480, managed: "system", updatedAt: "—",      meta: "Tier 3", tone: "muted" },
  { id: "cl_low",          name: "Low",          description: "Discoverable but not critical to operations",          count: 218, managed: "system", updatedAt: "—",      meta: "Tier 4", tone: "muted" },
  { id: "cl_data_restr",   name: "Restricted data",   description: "PII / PCI / regulated workloads",              count: 32,  managed: "custom", updatedAt: "1w ago", meta: "Data",   tone: "alert" },
  { id: "cl_data_conf",    name: "Confidential data", description: "Internal-only commercial information",         count: 124, managed: "custom", updatedAt: "1w ago", meta: "Data",   tone: "warn"  },
  { id: "cl_data_internal",name: "Internal",          description: "General internal use",                          count: 612, managed: "custom", updatedAt: "1w ago", meta: "Data",   tone: "muted" },
  { id: "cl_data_public",  name: "Public",            description: "Approved for external distribution",            count: 86,  managed: "custom", updatedAt: "1w ago", meta: "Data",   tone: "ok"    },
]

const groups: Row[] = [
  { id: "g_payments",    name: "Payments platform",   description: "PCI scope — card processing, BIN routing", count: 24, managed: "custom", updatedAt: "yesterday",   meta: "Business", tone: "alert" },
  { id: "g_corp_it",     name: "Corporate IT",         description: "Office network, employee devices, IT apps", count: 218, managed: "custom", updatedAt: "today",      meta: "Business", tone: "info"  },
  { id: "g_security",    name: "Security tooling",     description: "EDR, SIEM, SOAR, identity platforms",     count: 18, managed: "custom", updatedAt: "this morning",meta: "Business", tone: "info"  },
  { id: "g_dataeng",     name: "Data engineering",     description: "Lakes, pipelines, warehouses",            count: 31, managed: "custom", updatedAt: "3 days ago",  meta: "Business", tone: "info"  },
  { id: "g_crown",       name: "Crown jewels",          description: "Highest-value assets — board reporting",   count: 7,  managed: "custom", updatedAt: "1 month ago", meta: "Risk",     tone: "alert" },
  { id: "g_pci",         name: "PCI-DSS in-scope",      description: "Subject to quarterly attestation",        count: 24, managed: "custom", updatedAt: "1 week ago",  meta: "Compliance", tone: "warn" },
  { id: "g_hipaa",       name: "Patient data systems", description: "Subject to HIPAA controls",                count: 9,  managed: "custom", updatedAt: "1 week ago",  meta: "Compliance", tone: "warn" },
]

const owners: Row[] = [
  { id: "o_it_ops",     name: "IT Operations",        description: "Endpoint, server, network",            count: 524, managed: "custom", updatedAt: "today",      tone: "info" },
  { id: "o_appdev",     name: "Application Dev",      description: "App owners, release engineering",      count: 138, managed: "custom", updatedAt: "yesterday",  tone: "info" },
  { id: "o_sec_ops",    name: "Security Operations",  description: "SOC, IR, threat intel",                count: 32,  managed: "custom", updatedAt: "today",      tone: "info" },
  { id: "o_dataeng",    name: "Data Engineering",     description: "Pipelines, warehouses, ML platform",   count: 47,  managed: "custom", updatedAt: "3 days ago", tone: "info" },
  { id: "o_finance",    name: "Finance & Treasury",   description: "Reconciliation, payments back-office", count: 12,  managed: "custom", updatedAt: "1w ago",     tone: "muted" },
  { id: "o_compliance", name: "Compliance & Risk",    description: "GRC, audit, regulatory",               count: 8,   managed: "custom", updatedAt: "1w ago",     tone: "muted" },
]

const operatingSystems: Row[] = [
  { id: "os_win11",  name: "Windows 11",       description: "Enterprise & Pro builds",         count: 420, managed: "system", updatedAt: "—" },
  { id: "os_win10",  name: "Windows 10",       description: "Sunset 2025-10 — migrate to 11",  count: 184, managed: "system", updatedAt: "—", meta: "EOL", tone: "warn" },
  { id: "os_winsrv", name: "Windows Server",   description: "2016 / 2019 / 2022",              count: 92,  managed: "system", updatedAt: "—" },
  { id: "os_macos",  name: "macOS",            description: "13 Ventura · 14 Sonoma · 15 Sequoia", count: 142, managed: "system", updatedAt: "—" },
  { id: "os_ubuntu", name: "Ubuntu Linux",     description: "20.04 LTS · 22.04 LTS · 24.04 LTS", count: 124, managed: "system", updatedAt: "—" },
  { id: "os_rhel",   name: "Red Hat / Rocky",  description: "RHEL 8/9 + Rocky Linux equivalents", count: 38, managed: "system", updatedAt: "—" },
  { id: "os_ios",    name: "iOS / iPadOS",     description: "Apple Business Manager enrolled", count: 168, managed: "system", updatedAt: "—" },
  { id: "os_android",name: "Android",          description: "Android Enterprise managed",      count: 140, managed: "system", updatedAt: "—" },
]

type TabId = "types" | "classifications" | "groups" | "owners" | "os"

const tabs: { id: TabId; label: string; icon: LucideIcon; data: Row[] }[] = [
  { id: "types",           label: "Asset types",     icon: Boxes,             data: assetTypes        },
  { id: "classifications", label: "Classifications", icon: ShieldCheck,       data: classifications   },
  { id: "groups",          label: "Asset groups",    icon: Layers,            data: groups            },
  { id: "owners",          label: "Owners",          icon: UsersRound,        data: owners            },
  { id: "os",              label: "Operating systems", icon: Cpu,             data: operatingSystems  },
]

export function AdminEntitiesSetupPage() {
  const [tab, setTab] = useState<TabId>("types")
  const activeTab = tabs.find((t) => t.id === tab) ?? tabs[0]
  const data = activeTab.data

  return (
    <div className="space-y-5">
      <PageHeader
        title="Entities setup"
        description="Asset taxonomy — types, classifications, groups, owners and operating systems. Drives entity ingestion, posture scoring, and risk attribution."
        actions={
          <Button size="sm" className="h-9">
            <Plus className="size-4" />
            New {tab === "types" ? "type" : tab === "classifications" ? "classification" : tab === "groups" ? "group" : tab === "owners" ? "owner" : "OS"}
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
                {t.data.length}
              </span>
            </button>
          )
        })}
      </div>

      {/* Filter bar */}
      <FilterBar>
        <SearchInput placeholder={`Search ${activeTab.label.toLowerCase()}…`} />
        <div className="flex-1" />
        <Button variant="outline" size="sm" className="h-9">
          <MonitorSmartphone className="size-3.5 text-muted-foreground" />
          View asset registry
        </Button>
        <AdminFiltersPopover groups={ENTITY_FILTERS} />
      </FilterBar>

      {/* Table */}
      <Card>
        <CardContent className="px-0 py-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Description</th>
                {tab === "classifications" || tab === "groups" || tab === "os" ? (
                  <th className="px-4 py-2 font-medium">Tag</th>
                ) : null}
                <th className="px-4 py-2 font-medium">Managed</th>
                <th className="px-4 py-2 font-medium">Updated</th>
                <th className="px-4 py-2 font-medium text-right">Assets</th>
                <th className="w-12 px-4 py-2 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-accent/40">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">{row.name}</span>
                      {row.managed === "system" && (
                        <Lock className="size-3 text-muted-foreground" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{row.description ?? "—"}</td>
                  {tab === "classifications" || tab === "groups" || tab === "os" ? (
                    <td className="px-4 py-2.5">
                      {row.meta ? (
                        <ToneChip tone={row.tone ?? "muted"}>{row.meta}</ToneChip>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                  ) : null}
                  <td className="px-4 py-2.5">
                    <span className="text-xs capitalize text-muted-foreground">{row.managed}</span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{row.updatedAt}</td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">{row.count.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Button variant="ghost" size="icon-sm" disabled={row.managed === "system"}>
                      <Edit className="size-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
