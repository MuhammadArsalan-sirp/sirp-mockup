import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TONE } from "@/lib/tone"
import { Code, Preview, SubSection } from "../showcase"

export function LayoutsPage() {
  return (
    <div className="space-y-10">

      <SubSection title="Detail-page shell" description="Severity stripe + sticky single-row header + sticky tab strip + scrolling content. Used by incident / TI / entity detail pages.">
        <Preview dense>
          <div className="w-full overflow-hidden rounded-lg border">
            <div className="h-[3px] w-full bg-destructive/55" />
            <div className="flex h-10 items-center gap-2 border-b bg-card px-4 text-xs">
              <ArrowRight className="size-3 rotate-180 text-muted-foreground" />
              <Badge variant="outline" className="shrink-0 font-mono text-[9px]">INC-1247</Badge>
              <span className="truncate font-semibold">Lateral movement on DC-PROD-01</span>
              <div className="ml-auto flex items-center gap-1">
                <span className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[9px] font-semibold uppercase", TONE.alert.chip)}>Critical</span>
                <Badge variant="secondary" className="text-[9px]">Investigating</Badge>
                <Badge variant="outline" className="font-mono text-[9px]">P1</Badge>
              </div>
            </div>
            <div className="flex h-8 items-center gap-2 border-b bg-background px-4 text-[10px] font-medium text-muted-foreground">
              <span className="text-foreground">Overview</span>
              <span>OmniSense</span>
              <span>Artifacts</span>
              <span>Entities</span>
              <span>…</span>
            </div>
            <div className="space-y-2 bg-muted/10 p-3">
              <div className="h-12 rounded border bg-card" />
              <div className="h-16 rounded border bg-card" />
            </div>
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Master / detail" description="Sticky list pane + scrolling dossier. Used for Artifacts, Entities, Alerts.">
        <Preview dense>
          <div className="grid w-full grid-cols-[140px_1fr] gap-2">
            <div className="space-y-1 rounded-lg border bg-card p-2">
              <div className="rounded bg-primary/5 px-2 py-1 text-[10px] font-semibold ring-1 ring-primary/15">Item 1</div>
              <div className="rounded px-2 py-1 text-[10px] text-muted-foreground">Item 2</div>
              <div className="rounded px-2 py-1 text-[10px] text-muted-foreground">Item 3</div>
            </div>
            <div className="space-y-2">
              <div className="h-8 rounded border bg-card" />
              <div className="h-14 rounded border bg-card" />
              <div className="h-10 rounded border bg-card" />
            </div>
          </div>
        </Preview>
      </SubSection>

      <SubSection
        title="Card grid utility"
        description="The gradient wrapper that gives all child cards a subtle primary-to-card linear bg. Used in the overview tab and similar grouped surfaces."
      >
        <Preview code="*:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card">
          <div className="grid w-full grid-cols-3 gap-3 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="overflow-hidden">
                <CardContent className="px-4 py-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Card {n}</div>
                  <div className="mt-1 font-medium text-xl tabular-nums">{n * 12}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Centered page" description="Most non-detail pages use the AppShell's centered layout — max-w container, generous padding, scrolling content.">
        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>• AppShell wraps every page; <Code>isFullBleedRoute</Code> in <Code>app-shell.tsx</Code> decides which routes opt out</li>
          <li>• Centered pages: dashboard, list pages, autonomy, admin index</li>
          <li>• Full-bleed routes: <Code>/sara</Code>, <Code>/admin/*</Code>, <Code>/incidents/:id</Code>, <Code>/threat-intel/:id</Code>, <Code>/entities/:id</Code>, <Code>/design-system/*</Code></li>
        </ul>
      </SubSection>
    </div>
  )
}
