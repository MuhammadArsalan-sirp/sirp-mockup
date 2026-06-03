import type { LucideIcon } from "lucide-react"
import {
  Bell, Check, CheckSquare2, ChevronDown, FileText,
  Network, Play, Search, Shield, ShieldAlert, ShieldCheck, Sparkles, Trash2,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { TONE, TONES, type Tone } from "@/lib/tone"
import { users } from "@/data/users"
import { Code, Preview, SubSection } from "../showcase"

export function PatternsPage() {
  return (
    <div className="space-y-10">

      <SubSection title="Section label" description="The most-repeated micro-pattern in the app. Lead every card with this.">
        <Preview code='<span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">…</span>'>
          <div className="w-full space-y-3">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Recent Activity</div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">OmniSense Verdict</div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Indicators of Compromise</div>
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Icon-in-tone-box" description="The unit element of tone application. size-7 / size-8 / size-9 / size-12 cover every case.">
        <Preview>
          <div className="flex items-center gap-4">
            {TONES.map((tone) => {
              const t = TONE[tone]
              return (
                <div key={tone} className="flex flex-col items-center gap-1.5">
                  <div className={cn("grid size-9 place-items-center rounded-lg border", t.iconBox)}>
                    <Shield className="size-4" />
                  </div>
                  <Code>{tone}</Code>
                </div>
              )
            })}
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Verdict callout" description="The one tone-tinted band per dossier. Carries the focal-point color signal.">
        <Preview dense>
          <div className={cn("w-full px-5 py-4", TONE.alert.bg)}>
            <div className="flex items-start gap-3.5">
              <div className={cn("grid size-12 shrink-0 place-items-center rounded-xl border", TONE.alert.iconBox)}>
                <ShieldAlert className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className={cn("text-lg font-semibold leading-tight tracking-tight", TONE.alert.text)}>
                  Confirmed Active Threat
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">
                  High-confidence detection across 12 IOCs and 4 correlated alerts. Immediate containment recommended.
                </p>
              </div>
            </div>
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Stat tile" description="Strip cell pattern. Label top-left, neutral icon-in-muted-box top-right, big tabular value, tone-coded sub.">
        <Preview>
          <div className="grid w-full grid-cols-2 divide-x rounded-lg border bg-card sm:grid-cols-4">
            <StatPreview icon={Shield}      label="IOCs"      value={12}   sub="7 malicious · 2 suspicious" tone="alert" />
            <StatPreview icon={Bell}        label="Alerts"    value={4}    sub="3 open · 1 closed" tone="warn" />
            <StatPreview icon={Network}     label="Entities"  value={3}    sub="1 critical risk" tone="alert" />
            <StatPreview icon={CheckSquare2} label="Tasks"    value="2/4"  sub="50% complete" tone="info" progress={50} />
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Activity timeline event" description="Primary-tinted icon-in-circle with content stack. Connecting line behind via absolute positioning.">
        <Preview>
          <div className="w-full">
            <div className="relative">
              <div className="absolute bottom-2 left-3 top-2 w-px bg-border/60" />
              <ol className="space-y-3">
                {[
                  { icon: FileText, title: "Advisory created", detail: "Opened by Ahmed from Triage-EU queue", when: "12 min ago" },
                  { icon: Sparkles, title: "OmniSense analysis completed", detail: "12 IOCs enriched · 95% confidence", when: "10 min ago" },
                  { icon: ShieldCheck, title: "Disposition recorded", detail: "Marked true-positive after analyst review", when: "3 min ago" },
                ].map((ev, i) => {
                  const Icon = ev.icon
                  return (
                    <li key={i} className="relative flex gap-3">
                      <div className="relative z-10 grid size-6 shrink-0 place-items-center rounded-full border-2 border-card bg-primary/10 text-primary">
                        <Icon className="size-3" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="text-sm font-medium leading-snug">{ev.title}</span>
                          <span className="ml-auto font-mono text-[10px] text-muted-foreground/60">{ev.when}</span>
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground">{ev.detail}</p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Header pill cluster" description="Inline metadata pills in the page header — severity + status + priority with tooltips.">
        <Preview>
          <div className="flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={cn("inline-flex cursor-default items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider", TONE.alert.chip)}>
                  <span className={cn("size-1.5 rounded-full", TONE.alert.dot)} />
                  Critical
                </span>
              </TooltipTrigger>
              <TooltipContent>Severity</TooltipContent>
            </Tooltip>
            <Badge variant="secondary" className="cursor-default text-xs">Investigating</Badge>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="cursor-default font-mono text-xs font-bold">P1</Badge>
              </TooltipTrigger>
              <TooltipContent>Priority — P1 highest, P4 lowest</TooltipContent>
            </Tooltip>
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Stage popover trigger" description="Replaces the inline stepper in the header. Click to view the full workflow stepper.">
        <Preview>
          <Popover>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/40 px-2.5 py-1 text-xs transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Stage</span>
                <span className="font-semibold">Investigating</span>
                <ChevronDown className="size-3 opacity-60" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-0">
              <div className="flex items-center justify-between border-b px-4 py-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Workflow Stage</span>
                <span className="font-mono text-[10px] text-muted-foreground/60">2 of 6</span>
              </div>
              <div className="space-y-1.5 px-4 py-3">
                {["Triage", "Investigating", "Containment", "Eradication", "Recovery", "Mitigated"].map((s, i) => {
                  const done = i < 1, current = i === 1
                  return (
                    <div key={s} className="flex items-center gap-3">
                      <div className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-full border-2 font-mono text-[10px] font-bold",
                        done && "border-primary bg-primary/10 text-primary",
                        current && "border-primary bg-primary text-primary-foreground",
                        !done && !current && "border-border/60 bg-muted/30 text-muted-foreground/50",
                      )}>
                        {done ? <Check className="size-3" /> : i + 1}
                      </div>
                      <span className={cn(
                        "flex-1 text-sm",
                        current && "font-semibold",
                        !done && !current && "text-muted-foreground/60",
                      )}>{s}</span>
                      {current && (
                        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">Current</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </PopoverContent>
          </Popover>
        </Preview>
      </SubSection>

      <SubSection title="Comment row — system vs analyst" description="OmniSense / playbook comments get a Sparkles icon-box and subtle primary tint. Analyst comments use a normal avatar.">
        <Preview>
          <div className="w-full divide-y rounded-lg border bg-card">
            <div className="flex items-start gap-3 bg-primary/3 px-5 py-3">
              <div className="grid size-7 shrink-0 place-items-center rounded-lg border border-primary/25 bg-linear-to-br from-primary/20 to-primary/5 text-primary">
                <Sparkles className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold leading-tight">OmniSense</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Co-Analyst</span>
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground/60">2h ago</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-foreground/85">
                  Recommended containment sequence posted — isolate affected hosts before domain controller patching.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 px-5 py-3">
              <Avatar className="size-7 shrink-0">
                <AvatarImage src={users.sara.photo} alt={users.sara.name} />
                <AvatarFallback className={cn("bg-linear-to-br text-[9px] font-bold text-white", users.sara.gradient)}>
                  {users.sara.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold leading-tight">{users.sara.name}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Lead Analyst</span>
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground/60">15 min ago</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-foreground/85">
                  Reviewing containment scope. Confirming affected subnet list with network team by EOD.
                </p>
              </div>
            </div>
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Empty state" description="Icon-in-muted-box + title + sub-line. Used in lists, comments, tasks, etc.">
        <Preview>
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <div className="grid size-10 place-items-center rounded-xl border bg-muted text-muted-foreground/50">
              <Search className="size-5" />
            </div>
            <p className="text-sm font-medium">No items match</p>
            <p className="text-xs text-muted-foreground">Try clearing your search or filters.</p>
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Floating action bar" description="Sticky bottom pill that appears on bulk selection. Always primary-ringed.">
        <Preview dense>
          <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-card px-3 py-2 shadow-lg ring-1 ring-primary/10">
            <span className="font-mono text-xs font-semibold tabular-nums text-primary">3 selected</span>
            <span className="h-4 w-px bg-border" />
            <Button size="sm" className="h-7 gap-1.5 px-2.5 text-[11px]"><Play className="size-3" />Run enrichment</Button>
            <Button size="sm" variant="outline" className="h-7 gap-1.5 px-2.5 text-[11px]"><Check className="size-3" />Mark verdict</Button>
            <Button size="sm" variant="ghost" className="h-7 gap-1.5 px-2.5 text-[11px] text-destructive hover:text-destructive">
              <Trash2 className="size-3" />Delete
            </Button>
          </div>
        </Preview>
      </SubSection>
    </div>
  )
}

function StatPreview({ icon: Icon, label, value, sub, tone, progress }: {
  icon: LucideIcon
  label: string
  value: string | number
  sub: string
  tone: Tone
  progress?: number
}) {
  const t = TONE[tone]
  return (
    <div className="flex flex-col gap-1 px-5 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className="grid size-8 place-items-center rounded-lg border bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </div>
      </div>
      <div className="font-medium text-2xl tabular-nums leading-none tracking-tight">{value}</div>
      {progress !== undefined ? (
        <div className="flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted/40">
            <div className={cn("h-full rounded-full", t.bar)} style={{ width: `${progress}%` }} />
          </div>
          <span className="shrink-0 text-[10px] text-muted-foreground">{sub}</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          {tone !== "muted" && <span className={cn("size-1.5 rounded-full", t.dot)} />}
          <span className="text-xs text-muted-foreground">{sub}</span>
        </div>
      )}
    </div>
  )
}
