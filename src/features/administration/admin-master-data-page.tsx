import { Download, Edit, Lock, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { masterDataLists, type MasterDataList } from "@/data/admin"
import { ToneChip, type Tone } from "./admin-ui"

const groupTone: Record<MasterDataList["group"], Tone> = {
  Assets: "primary", Classification: "warn", People: "ok", Geography: "muted",
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

      <Card>
        <CardContent className="px-0 py-0">
          <div className="flex items-center gap-2 border-b px-4 py-2.5">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search master data lists…" className="h-8 pl-8 text-sm" />
            </div>
          </div>
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
