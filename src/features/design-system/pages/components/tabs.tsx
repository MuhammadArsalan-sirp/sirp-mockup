import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Code, Preview, SubSection } from "../../showcase"

export function TabsPage() {
  return (
    <div className="space-y-10">

      <SubSection title="Default" description="Shadcn Tabs. Used for small in-card tab strips (e.g., logs sub-nav).">
        <Preview>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="iocs">IOCs</TabsTrigger>
              <TabsTrigger value="entities">Entities</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="pt-2 text-sm text-muted-foreground">Overview content.</TabsContent>
            <TabsContent value="iocs"     className="pt-2 text-sm text-muted-foreground">IOC list.</TabsContent>
            <TabsContent value="entities" className="pt-2 text-sm text-muted-foreground">Entity list.</TabsContent>
          </Tabs>
        </Preview>
      </SubSection>

      <SubSection title="Underline strip" description="The page-level tab strip used on detail pages — manually composed (not the shadcn Tabs primitive) because it needs sticky positioning and overflow handling.">
        <Preview code={`<button className={cn(\n  "relative flex shrink-0 items-center gap-1.5 px-3.5 text-xs font-medium",\n  "after:absolute after:inset-x-2 after:bottom-0 after:h-[2px] after:rounded-t-full",\n  active ? "text-foreground after:bg-primary" : "text-muted-foreground after:bg-transparent",\n)}>\n  Overview\n</button>`}>
          <div className="flex h-10 w-full items-stretch border-b">
            {[
              { label: "Overview",  active: true,  count: null },
              { label: "OmniSense", active: false, count: null },
              { label: "Artifacts", active: false, count: 12 },
              { label: "Entities",  active: false, count: 3 },
              { label: "Tasks",     active: false, count: 4 },
            ].map((t) => (
              <button
                key={t.label}
                className={cn(
                  "relative flex items-center gap-1.5 whitespace-nowrap px-3.5 text-xs font-medium transition-colors",
                  "after:absolute after:inset-x-2 after:bottom-0 after:h-[2px] after:rounded-t-full",
                  t.active
                    ? "text-foreground after:bg-primary"
                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground after:bg-transparent",
                )}
              >
                {t.label}
                {t.count !== null && (
                  <Badge variant="secondary" className={cn("px-1.5 text-[10px]", t.active && "bg-primary/15 text-primary")}>
                    {t.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Rules">
        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>• Use shadcn <Code>Tabs</Code> for in-card tab strips (Logs sub-nav, sub-views inside a panel).</li>
          <li>• Use the manual underline strip for page-level navigation on detail pages.</li>
          <li>• Show a count <Code>Badge</Code> next to a tab name when relevant (artifacts, entities, alerts).</li>
        </ul>
      </SubSection>

      <SubSection title="Import">
        <div className="rounded-lg border bg-muted/15 px-3 py-2">
          <Code>{`import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"`}</Code>
        </div>
      </SubSection>
    </div>
  )
}
