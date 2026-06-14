import { Download, Edit, Layers, Lock, MapPin, Plus, ShieldCheck, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { masterDataLists, type MasterDataList } from "@/data/admin"
import { FilterBar, SearchInput, ToneChip, type Tone } from "./admin-ui"
import { AdminFiltersPopover, type AdminFilterGroups } from "./admin-filters-popover"

const MD_FILTERS: AdminFilterGroups = [
  [
    {
      id: "group",
      label: "Group",
      icon: Layers,
      options: [
        { value: "Assets",         label: "Assets",         icon: ShieldCheck },
        { value: "Classification", label: "Classification", icon: ShieldCheck },
        { value: "People",         label: "People",         icon: Users       },
        { value: "Geography",      label: "Geography",      icon: MapPin      },
      ],
    },
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
]

const groupTone: Record<MasterDataList["group"], Tone> = {
  Assets: "info", Classification: "warn", People: "ok", Geography: "muted",
}

export function AdminMasterDataPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Master data"
        description="Reference lists used across incidents, entities, and reporting. System lists are managed by SIRP; custom lists are editable."
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9">
              <Download className="size-4 text-muted-foreground" />
              Export
            </Button>
            <Button size="sm" className="h-9">
              <Plus className="size-4" />
              New list
            </Button>
          </>
        }
      />

      <FilterBar>
        <SearchInput placeholder="Search master data lists…" />
        <div className="flex-1" />
        <AdminFiltersPopover groups={MD_FILTERS} />
      </FilterBar>

      <Card>
        <CardContent className="px-0 py-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Group</th>
                <th className="px-4 py-2 font-medium">Examples</th>
                <th className="px-4 py-2 font-medium">Managed</th>
                <th className="px-4 py-2 font-medium">Updated</th>
                <th className="px-4 py-2 font-medium text-right">Entries</th>
                <th className="w-12 px-4 py-2 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {masterDataLists.map((l) => (
                <tr key={l.id} className="hover:bg-accent/40">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">{l.name}</span>
                      {l.managed === "system" && (
                        <Lock className="size-3 text-muted-foreground" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <ToneChip tone={groupTone[l.group]}>{l.group}</ToneChip>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="truncate text-xs text-muted-foreground">
                      {l.example.slice(0, 3).join(", ")}
                      {l.example.length > 3 && "…"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs capitalize text-muted-foreground">{l.managed}</span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{l.updatedAt}</td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">{l.count.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Button variant="ghost" size="icon-sm" disabled={l.managed === "system"}>
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
