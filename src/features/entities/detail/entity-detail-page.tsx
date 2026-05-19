import { useParams, Link } from "react-router"
import { ArrowLeft } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function EntityDetailPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/entities">
          <ArrowLeft className="size-4" />
          Back to entities
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{id}</span>
            <Badge
              style={{
                background: "color-mix(in srgb, var(--destructive) 15%, transparent)",
                color: "var(--destructive)",
                border: 0,
              }}
            >
              Critical
            </Badge>
            <Badge variant="outline">Active</Badge>
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">DC-PROD-01</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Host · Infrastructure · S3 Score: 94 · 18 relationships
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Edit</Button>
          <Button variant="outline" size="sm">View relationships</Button>
          <Button size="sm">Run playbook</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        {["overview", "relationships", "incidents", "alerts", "timeline", "logs"].map((t) => (
          <TabsContent key={t} value={t} className="mt-4">
            <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
              <span className="capitalize">{t}</span> · skeleton — content ports in migration week 2–3.
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
