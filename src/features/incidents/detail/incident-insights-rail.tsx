import { useState } from "react"
import {
  BarChart3,
  ChevronDown,
  Compass,
  History,
  Sparkles,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { Incident } from "@/data/incidents"
import { IncidentS3Widget } from "./incident-s3-widget"
import { IncidentSaraEmbedded } from "./incident-sara-embedded"
import type {
  MitreStructured,
  MockReport,
  RelatedIncidentRow,
  S3BreakdownRow,
  TimelineKind,
  TimelineRow,
} from "./incident-detail-mock"

type Props = {
  incident: Incident
  s3Breakdown: S3BreakdownRow[]
  mitre: MitreStructured
  related: RelatedIncidentRow[]
  reports: MockReport[]
  timeline: TimelineRow[]
  members: { id: string; name: string; role: string; initials: string; gradient: string }[]
  className?: string
}

function timelineDot(kind: TimelineKind) {
  switch (kind) {
    case "integration":
      return "bg-chart-2"
    case "playbook":
      return "bg-primary/80"
    case "user":
      return "bg-attention"
    default:
      return "bg-muted-foreground"
  }
}

export function IncidentInsightsRail({
  incident,
  s3Breakdown,
  mitre,
  related,
  reports,
  timeline,
  members,
  className,
}: Props) {
  const [railTab, setRailTab] = useState<"sara" | "context" | "timeline">("sara")
  const [reportOpen, setReportOpen] = useState<MockReport | null>(null)

  const totalMitre =
    mitre.tactics.length + mitre.techniques.length + mitre.subTechniques.length

  return (
    <div
      className={cn(
        "flex min-h-[min(880px,calc(100svh-8rem))] max-h-[min(880px,calc(100svh-8rem))] flex-1 flex-col overflow-hidden rounded-2xl border bg-card shadow-md ring-1 ring-border/60",
        className
      )}
    >
      <Tabs
        value={railTab}
        onValueChange={(v) => setRailTab(v as typeof railTab)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="shrink-0 border-b bg-muted/30 p-2">
          <TabsList className="grid h-10 w-full grid-cols-3 gap-1 rounded-xl bg-muted/60 p-1">
            <TabsTrigger
              value="sara"
              className="gap-1.5 rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <Sparkles className="size-3.5 opacity-80" />
              Sara
            </TabsTrigger>
            <TabsTrigger
              value="context"
              className="gap-1.5 rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <Compass className="size-3.5 opacity-80" />
              Context
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="gap-1.5 rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <History className="size-3.5 opacity-80" />
              Timeline
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="sara"
          className="m-0 flex min-h-0 flex-1 flex-col overflow-hidden p-2 data-[state=inactive]:hidden"
        >
          <IncidentSaraEmbedded
            incident={incident}
            className="min-h-0 flex-1 rounded-xl border-0 shadow-none"
          />
        </TabsContent>

        <TabsContent
          value="context"
          className="m-0 min-h-0 flex-1 overflow-hidden p-0 data-[state=inactive]:hidden"
        >
          <div className="flex items-center justify-between border-b px-3 py-2.5">
            <span className="text-xs font-semibold tracking-wide text-muted-foreground">
              Context
            </span>
            <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-muted-foreground">
              <ChevronDown className="size-3.5" />
              Toggle all
            </Button>
          </div>
          <ScrollArea className="h-[min(720px,calc(100svh-12rem))]">
            <div className="space-y-2 p-2 pr-3">
              <Accordion
                type="multiple"
                defaultValue={["s3", "mitre", "members", "reports", "related"]}
                className="space-y-2"
              >
                <AccordionItem
                  value="s3"
                  className="overflow-hidden rounded-xl border bg-muted/15 shadow-sm"
                >
                  <AccordionTrigger className="px-3 py-3 text-sm hover:no-underline">
                    <span className="flex flex-1 items-center justify-between gap-2 pr-1">
                      <span className="font-semibold">S3 score</span>
                      <Badge variant="secondary" className="font-mono tabular-nums">
                        {Math.round(incident.s3Score)}
                      </Badge>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="border-t bg-background/50 px-3 pb-3">
                    <IncidentS3Widget
                      score={incident.s3Score}
                      breakdown={s3Breakdown}
                      compact
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="mitre"
                  className="overflow-hidden rounded-xl border bg-muted/15 shadow-sm"
                >
                  <AccordionTrigger className="px-3 py-3 text-sm hover:no-underline">
                    <span className="flex flex-1 items-center justify-between gap-2 pr-1">
                      <span className="font-semibold">MITRE</span>
                      <Badge variant="outline">{totalMitre}</Badge>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 border-t bg-background/50 px-3 pb-3 text-sm">
                    {mitre.tactics.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          Tactics
                        </p>
                        <ul className="space-y-1">
                          {mitre.tactics.map((t) => (
                            <li key={t} className="font-mono text-xs">
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {mitre.techniques.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          Techniques
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {mitre.techniques.map((t) => (
                            <Badge
                              key={t}
                              variant="secondary"
                              className="font-mono text-[10px]"
                            >
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="members"
                  className="overflow-hidden rounded-xl border bg-muted/15 shadow-sm"
                >
                  <AccordionTrigger className="px-3 py-3 text-sm hover:no-underline">
                    <span className="flex flex-1 items-center justify-between gap-2 pr-1">
                      <span className="flex items-center gap-2 font-semibold">
                        <Users className="size-3.5 opacity-70" />
                        Members
                      </span>
                      <Badge variant="outline">{members.length}</Badge>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 border-t bg-background/50 px-3 pb-3">
                    {members.length === 0 ? (
                      <p className="py-2 text-xs text-muted-foreground">No members yet.</p>
                    ) : (
                      members.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-xs shadow-sm"
                        >
                          <span className="font-medium">{m.name}</span>
                          <span className="text-muted-foreground">{m.role}</span>
                        </div>
                      ))
                    )}
                    <Button variant="outline" size="sm" className="h-8 w-full text-xs" type="button">
                      Add member
                    </Button>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="reports"
                  className="overflow-hidden rounded-xl border bg-muted/15 shadow-sm"
                >
                  <AccordionTrigger className="px-3 py-3 text-sm hover:no-underline">
                    <span className="flex flex-1 items-center justify-between gap-2 pr-1">
                      <span className="flex items-center gap-2 font-semibold">
                        <BarChart3 className="size-3.5 opacity-70" />
                        Reports
                      </span>
                      <Badge variant="outline">{reports.length}</Badge>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 border-t bg-background/50 px-3 pb-3">
                    {reports.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-lg border bg-card p-3 shadow-sm"
                      >
                        <p className="text-xs font-semibold">{r.name}</p>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="mt-2 h-8 w-full text-xs"
                          type="button"
                          onClick={() => setReportOpen(r)}
                        >
                          {r.buttonText}
                        </Button>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="related"
                  className="overflow-hidden rounded-xl border bg-muted/15 shadow-sm"
                >
                  <AccordionTrigger className="px-3 py-3 text-sm hover:no-underline">
                    <span className="flex flex-1 items-center justify-between gap-2 pr-1">
                      <span className="font-semibold">Related</span>
                      <Badge variant="outline">{related.length}</Badge>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 border-t bg-background/50 px-3 pb-3">
                    {related.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-lg border bg-card px-3 py-2 text-xs shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono">{r.id}</span>
                          <Badge variant="outline" className="capitalize">
                            {r.severity}
                          </Badge>
                        </div>
                        <p className="mt-1 line-clamp-2 text-muted-foreground">{r.title}</p>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent
          value="timeline"
          className="m-0 min-h-0 flex-1 overflow-hidden p-2 data-[state=inactive]:hidden"
        >
          <ScrollArea className="h-[min(720px,calc(100svh-12rem))]">
            <ul className="space-y-0 pr-3 pl-1">
              {timeline.map((row, i) => (
                <li
                  key={row.id}
                  className="relative flex gap-3 pb-5 pl-0.5 last:pb-2"
                >
                  {i < timeline.length - 1 && (
                    <span
                      className="absolute left-[7px] top-3 h-[calc(100%-6px)] w-px bg-border"
                      aria-hidden
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 mt-1.5 size-2 shrink-0 rounded-full ring-4 ring-card",
                      timelineDot(row.kind)
                    )}
                  />
                  <div className="min-w-0 flex-1 space-y-0.5 pb-1">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {row.when}
                    </span>
                    <p className="text-sm font-medium leading-snug">{row.title}</p>
                    {row.body && (
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {row.body}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <Dialog open={!!reportOpen} onOpenChange={(o) => !o && setReportOpen(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{reportOpen?.name}</DialogTitle>
          </DialogHeader>
          <pre className="whitespace-pre-wrap rounded-xl border bg-muted/30 p-4 text-xs leading-relaxed">
            {reportOpen?.body}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  )
}
