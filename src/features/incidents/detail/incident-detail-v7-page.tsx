/**
 * V7 — Default incident detail workspace
 * Properly composed with shadcn Avatar, Badge, Tabs, Tooltip, Collapsible,
 * DropdownMenu, Button — no bespoke HTML/CSS where a library component fits.
 */
import { useLayoutEffect, useRef, useState } from "react"
import {
  ArrowLeft, Check, CheckCircle2,
  ChevronDown, ChevronRight, Clock, Download, FolderTree,
  GitBranch, Layers, LayoutDashboard, Link2, ListTree, Mail,
  Map as MapIcon, MessageSquare, MoreHorizontal,
  PanelRightClose, PanelRightOpen,
  Play, ScrollText, Send, Shield, Target, Timer, UserRoundCog,
} from "lucide-react"
import { Link, useParams } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { IncidentDetailPanels } from "./incident-detail-panels"
import { IncidentDetailNotFound } from "./incident-detail-not-found"
import { IncidentDetailWorkbenchSheet } from "./incident-detail-workbench-sheet"
import { useIncidentDetailModel } from "./use-incident-detail-model"
import { SeverityBadge, StatusBadge, incidentStateLabel, severityTone } from "./incident-detail-badges"
import { IncidentSaraEmbedded } from "./incident-sara-embedded"
import { SourceIcon } from "@/features/incidents/list/source-icon"
import type { DetailTab } from "./incident-detail-tabs"
import type { IncidentState } from "@/data/incidents"

/* ── Stage config ─────────────────────────────────────────────────────────── */
const STAGES: { key: IncidentState; label: string }[] = [
  { key: "triage",        label: "Triage" },
  { key: "investigating", label: "Investigating" },
  { key: "containment",   label: "Containment" },
  { key: "eradication",   label: "Eradication" },
  { key: "recovery",      label: "Recovery" },
  { key: "mitigated",     label: "Mitigated" },
]

/* ── Main tab definitions ─────────────────────────────────────────────────── */
type TabDef = { id: DetailTab; label: string; icon: React.ElementType; ck?: string }

const ALL_TABS: TabDef[] = [
  { id: "overview",          label: "Overview",      icon: LayoutDashboard },
  { id: "omnisense",         label: "OmniSense",     icon: () => <img src="/brand/sara-icon.png" className="size-3.5 object-contain" alt="" /> },
  { id: "artifacts",         label: "Artifacts",     icon: FolderTree,    ck: "artifacts" },
  { id: "entities",          label: "Entities",      icon: Layers,        ck: "entities" },
  { id: "remediation",       label: "Remediation",   icon: Shield },
  { id: "comments",          label: "Comments",      icon: MessageSquare, ck: "comments" },
  { id: "tasks",             label: "Tasks",         icon: ListTree,      ck: "tasks" },
  { id: "alerts",            label: "Alerts",        icon: GitBranch,     ck: "alerts" },
  { id: "omnimap",           label: "OmniMap",       icon: MapIcon },
  { id: "logs",              label: "Logs",          icon: ScrollText },
  { id: "related",           label: "Related",       icon: Link2,         ck: "related" },
  { id: "affected-products", label: "Products",      icon: Target },
]

/* ── Page ─────────────────────────────────────────────────────────────────── */
export function IncidentDetailV7Page() {
  const { id = "" } = useParams<{ id: string }>()
  const model = useIncidentDetailModel(id)

  const [tab, setTab]               = useState<DetailTab>("overview")
  const [rightOpen, setRightOpen]   = useState(true)
  const [workbenchOpen, setWorkbenchOpen] = useState(false)

  /* Tab overflow measurement */
  const tabBarRef  = useRef<HTMLDivElement>(null)
  const tabElsRef  = useRef<globalThis.Map<string, HTMLButtonElement>>(new globalThis.Map())
  const tabWidths  = useRef<globalThis.Map<string, number>>(new globalThis.Map())
  const [overflowIds, setOverflowIds] = useState<Set<string>>(new Set())

  useLayoutEffect(() => {
    const bar = tabBarRef.current
    if (!bar) return
    const MORE_W = 80
    const recalc = () => {
      tabElsRef.current.forEach((el, id) => {
        if (el.offsetWidth > 0) tabWidths.current.set(id, el.offsetWidth)
      })
      const totalW = ALL_TABS.reduce((s, t) => s + (tabWidths.current.get(t.id) ?? 0), 0)
      const needsMore = totalW > bar.clientWidth
      const available = bar.clientWidth - (needsMore ? MORE_W : 0)
      let cum = 0
      const hidden = new Set<string>()
      for (const t of ALL_TABS) {
        const w = tabWidths.current.get(t.id) ?? 0
        if (w === 0) continue
        if (cum + w > available) hidden.add(t.id)
        else cum += w
      }
      setOverflowIds(hidden)
    }
    const ro = new ResizeObserver(recalc)
    ro.observe(bar)
    const rafId = requestAnimationFrame(recalc)
    return () => { ro.disconnect(); cancelAnimationFrame(rafId) }
  }, [])

  if (!model) return <IncidentDetailNotFound id={id} />
  const { incident, panelData } = model

  const sevColor  = severityTone[incident.severity]
  const openTasks = panelData.tasks.filter((t) => !t.done).length
  const stageIdx  = STAGES.findIndex((s) => s.key === incident.state)

  const counts: Record<string, number> = {
    artifacts: panelData.artifacts.length,
    entities:  panelData.entities.length,
    tasks:     openTasks,
    alerts:    panelData.alerts.length,
    related:   panelData.related.length,
    comments:  3,
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">

      {/* ════════ HEADER ════════════════════════════════════════════════════ */}
      <header className="shrink-0 border-b bg-card shadow-sm">
        <div className="h-[3px] w-full" style={{ background: `color-mix(in srgb, ${sevColor} 55%, transparent)` }} />

        {/* Single-row header with inline pills + stage popover */}
        <div className="flex h-12 items-center gap-3 px-5">
          <Button variant="ghost" size="icon" className="size-7 shrink-0 text-muted-foreground" asChild>
            <Link to="/incidents"><ArrowLeft className="size-4" /></Link>
          </Button>

          <Badge variant="outline" className="shrink-0 font-mono text-[10px]">{incident.id}</Badge>

          <h1 className="min-w-0 flex-1 truncate text-sm font-semibold">{incident.title}</h1>

          {/* Inline metadata pills */}
          <div className="flex shrink-0 items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-default"><SeverityBadge value={incident.severity} /></span>
              </TooltipTrigger>
              <TooltipContent side="bottom">Severity</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-default"><StatusBadge value={incident.status} /></span>
              </TooltipTrigger>
              <TooltipContent side="bottom">Status</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="cursor-default font-mono text-xs font-bold">{incident.priority}</Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom">Priority — P1 highest, P4 lowest</TooltipContent>
            </Tooltip>
          </div>

          {/* Stage popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border/60 bg-muted/40 px-2.5 py-1 text-xs transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Stage</span>
                <span className="font-semibold">{incidentStateLabel[incident.state] ?? incident.state}</span>
                <ChevronDown className="size-3 opacity-60" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between border-b px-4 py-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Workflow Stage</span>
                <span className="font-mono text-[10px] text-muted-foreground/60">{Math.min(stageIdx + 1, STAGES.length)} of {STAGES.length}</span>
              </div>
              <div className="space-y-1.5 px-4 py-3">
                {STAGES.map((stage, i) => {
                  const done    = i < stageIdx
                  const current = i === stageIdx
                  return (
                    <div key={stage.key} className="flex items-center gap-3">
                      <div className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-full border-2 font-mono text-[10px] font-bold",
                        done                  && "border-primary bg-primary/10 text-primary",
                        current               && "border-primary bg-primary text-primary-foreground",
                        !done && !current     && "border-border/60 bg-muted/30 text-muted-foreground/50",
                      )}>
                        {done ? <Check className="size-3" /> : i + 1}
                      </div>
                      <span className={cn(
                        "flex-1 text-sm",
                        current             && "font-semibold",
                        !done && !current   && "text-muted-foreground/60",
                      )}>
                        {stage.label}
                      </span>
                      {current && (
                        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                          Current
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center justify-end gap-2 border-t bg-muted/15 px-4 py-2">
                <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]">Edit</Button>
                <Button size="sm" className="h-7 gap-1.5 px-2.5 text-[11px]">Advance<ChevronRight className="size-3" /></Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* SLA — only when breach / warn */}
          {(incident.sla.tone === "breach" || incident.sla.tone === "warn") && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold",
                  incident.sla.tone === "breach"
                    ? "border-destructive/25 bg-destructive/10 text-destructive"
                    : "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                )}>
                  <Timer className="size-3 shrink-0" />{incident.sla.label}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">SLA</TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="shrink-0 cursor-default">
                <SourceIcon source={incident.source.label} size={30} iconOnly />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">Source: {incident.source.label}</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-5" />

          <div className="flex shrink-0 items-center gap-1.5">
            <Button size="sm" className="h-8 gap-1.5 text-xs"><CheckCircle2 className="size-3.5" />Resolve</Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs"><Play className="size-3.5" />Playbook</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="size-8"><MoreHorizontal className="size-3.5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem><Mail className="size-3.5 mr-2 text-muted-foreground" />Send email</DropdownMenuItem>
                <DropdownMenuItem><Download className="size-3.5 mr-2 text-muted-foreground" />Export PDF</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setWorkbenchOpen(true)}>
                  <UserRoundCog className="size-3.5 mr-2 text-muted-foreground" />Edit ticket
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ════════ THREE-COLUMN BODY ══════════════════════════════════════════ */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* ── CENTER ─────────────────────────────────────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col border-r">
          {/* Tab strip */}
          <div ref={tabBarRef} className="flex h-10 shrink-0 items-stretch overflow-hidden border-b bg-background">
            {ALL_TABS.map(({ id: tid, label, icon: Icon, ck }) => {
              const active = tab === tid
              const count  = ck ? counts[ck] : undefined
              const hidden = overflowIds.has(tid)
              return (
                <button
                  key={tid}
                  ref={(el) => { if (el) tabElsRef.current.set(tid, el) }}
                  onClick={() => setTab(tid)}
                  style={{ display: hidden ? "none" : undefined }}
                  className={cn(
                    "relative flex shrink-0 items-center gap-1.5 px-3.5 text-xs font-medium whitespace-nowrap transition-colors",
                    "after:absolute after:inset-x-2 after:bottom-0 after:h-[2px] after:rounded-t-full",
                    active
                      ? "text-foreground after:bg-primary"
                      : "text-muted-foreground hover:bg-muted/30 hover:text-foreground after:bg-transparent"
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  {label}
                  {count !== undefined && count > 0 && (
                    <Badge variant="secondary" className={cn("px-1.5 text-[10px]", active ? "bg-primary/15 text-primary" : "")}>
                      {count}
                    </Badge>
                  )}
                </button>
              )
            })}

            {overflowIds.size > 0 && (() => {
              const overflowTabs = ALL_TABS.filter((t) => overflowIds.has(t.id))
              const moreActive   = overflowTabs.some((t) => t.id === tab)
              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={cn(
                      "flex shrink-0 items-center gap-1.5 px-3 text-xs font-medium transition-colors hover:bg-muted/30",
                      moreActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}>
                      More <ChevronDown className="size-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {overflowTabs.map(({ id: tid, label, icon: Icon, ck }) => {
                      const count = ck ? counts[ck] : undefined
                      return (
                        <DropdownMenuItem key={tid} onClick={() => setTab(tid)}
                          className={cn(tab === tid && "bg-accent text-accent-foreground")}>
                          <Icon className="mr-2 size-3.5 shrink-0 text-muted-foreground" />
                          <span className="flex-1">{label}</span>
                          {count !== undefined && count > 0 && (
                            <Badge variant="secondary" className="ml-2 text-[10px]">{count}</Badge>
                          )}
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            })()}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="p-6">
              <IncidentDetailPanels
                tab={tab}
                data={panelData}
                onOpenWorkbench={() => setWorkbenchOpen(true)}
                onOpenOmniSenseTab={() => setTab("omnisense")}
              />
            </div>
          </div>
        </div>

        {/* ── RIGHT RAIL — shadcn Tabs ───────────────────────────────────── */}
        {rightOpen ? (
          <div className="flex w-[360px] shrink-0 flex-col overflow-hidden border-l">
            <Tabs defaultValue="sara" className="flex min-h-0 flex-1 flex-col gap-0">
              {/* TabsList as the header strip */}
              <div className="flex h-10 shrink-0 items-center border-b px-2">
                <TabsList variant="line" className="h-10 flex-1 gap-0 rounded-none bg-transparent p-0">
                  <TabsTrigger value="sara" className="flex-1 gap-1.5 text-sm data-[state=active]:bg-transparent">
                    <img src="/brand/sara-icon.png" className="size-3.5 object-contain" alt="Sara" />
                    Sara
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="flex-1 gap-1.5 text-sm data-[state=active]:bg-transparent">
                    <Clock className="size-3.5" />
                    Timeline
                  </TabsTrigger>
                </TabsList>
                <Button variant="ghost" size="icon" className="size-7 shrink-0 text-muted-foreground hover:text-foreground" onClick={() => setRightOpen(false)}>
                  <PanelRightClose className="size-3.5" />
                </Button>
              </div>

              <TabsContent value="sara" className="m-0 min-h-0 flex-1">
                <div className="flex h-full flex-col p-2">
                  <IncidentSaraEmbedded incident={incident} className="flex min-h-0 flex-1 flex-col" />
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="m-0 min-h-0 flex-1">
                <div className="flex h-full flex-col">
                  <div className="min-h-0 flex-1 overflow-y-auto">
                    <div className="relative px-5 py-5">
                      <div className="absolute bottom-0 left-[29px] top-5 w-px bg-border/50" />
                      <div className="space-y-6">
                        {panelData.timeline.map((ev) => {
                          const TL_CFG: Record<string, { dot: string; chip: string; label: string }> = {
                            system:      { dot: "bg-muted-foreground/50", chip: "bg-muted text-muted-foreground",                  label: "System" },
                            user:        { dot: "bg-blue-500",            chip: "bg-blue-500/10 text-blue-600 dark:text-blue-400", label: "User" },
                            playbook:    { dot: "bg-violet-500",          chip: "bg-violet-500/10 text-violet-600",                label: "Playbook" },
                            integration: { dot: "bg-amber-500",           chip: "bg-amber-500/10 text-amber-600",                 label: "Integration" },
                          }
                          const cfg = TL_CFG[ev.kind] ?? TL_CFG.system
                          return (
                            <div key={ev.id} className="relative flex gap-4">
                              <div className={cn("relative z-10 mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-background shadow-sm", cfg.dot)} />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <Badge variant="secondary" className={cn("rounded-full text-xs", cfg.chip)}>{cfg.label}</Badge>
                                  <span className="text-[11px] tabular-nums text-muted-foreground">{ev.when}</span>
                                </div>
                                <p className="mt-1.5 text-sm font-semibold leading-snug">{ev.title}</p>
                                {ev.body && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{ev.body}</p>}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 border-t bg-background p-3">
                    <NoteComposer />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex w-10 shrink-0 flex-col items-center gap-2.5 border-l bg-sidebar pt-2.5">
            <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground" onClick={() => setRightOpen(true)}>
              <PanelRightOpen className="size-4" />
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => setRightOpen(true)}
                  className="grid size-7 place-items-center rounded-lg border bg-background transition-colors hover:bg-accent">
                  <img src="/brand/sara-icon.png" className="size-4 object-contain" alt="Sara" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">Open Sara</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => setRightOpen(true)}
                  className="grid size-7 place-items-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                  <Clock className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">Open Timeline</TooltipContent>
            </Tooltip>
          </div>
        )}

      </div>

      <IncidentDetailWorkbenchSheet open={workbenchOpen} onOpenChange={setWorkbenchOpen} incidentId={incident.id} />
    </div>
  )
}

/* ── Timeline note composer ─────────────────────────────────────────────── */
function NoteComposer() {
  const [note, setNote] = useState("")
  return (
    <div className="flex items-center gap-2 rounded-xl border bg-muted/20 px-3 py-2 transition-all focus-within:border-primary/40 focus-within:bg-background focus-within:ring-1 focus-within:ring-primary/20">
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a note to the timeline…"
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        onKeyDown={(e) => { if (e.key === "Enter" && note.trim()) setNote("") }}
      />
      <Button
        size="icon"
        variant={note.trim() ? "default" : "ghost"}
        className="size-6 shrink-0"
        disabled={!note.trim()}
        onClick={() => setNote("")}
      >
        <Send className="size-3" />
      </Button>
    </div>
  )
}
