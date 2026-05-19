import { useParams, Link } from "react-router"
import { ArrowLeft } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function ThreatIntelDetailPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/threat-intel">
          <ArrowLeft className="size-4" />
          Back to threat intel
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {id}
            </span>
            <Badge
              style={{
                background: "color-mix(in srgb, var(--destructive) 15%, transparent)",
                color: "var(--destructive)",
                border: 0,
              }}
            >
              Critical
            </Badge>
            <Badge variant="outline">In Progress</Badge>
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Lateral movement on DC-PROD-01
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sara: APT29 attribution (95%) · 3 entities · 12 IOCs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Run playbook
          </Button>
          <Button variant="outline" size="sm">
            Reassign
          </Button>
          <Button size="sm">Resolve</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="omnisense">OmniSense</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
          <TabsTrigger value="entities">Affected Entities</TabsTrigger>
          <TabsTrigger value="remediation">Remediation</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="omnimap">OmniMap</TabsTrigger>
          <TabsTrigger value="alerts">Linked Alerts</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        {[
          "overview",
          "omnisense",
          "artifacts",
          "entities",
          "remediation",
          "comments",
          "tasks",
          "omnimap",
          "alerts",
          "logs",
        ].map((t) => (
          <TabsContent key={t} value={t} className="mt-4">
            <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
              <span className="capitalize">{t}</span> · skeleton — content
              ports from existing v2 module in week 2–3 of migration.
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
