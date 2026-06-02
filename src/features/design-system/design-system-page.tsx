import { useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Brain,
  Check,
  CheckCircle2,
  CheckSquare2,
  ChevronDown,
  Copy,
  Download,
  FileText,
  Globe,
  HelpCircle,
  Layers,
  MoreHorizontal,
  Network,
  Play,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { TONE, TONES, TONE_LABEL, TONE_DESCRIPTION, type Tone } from "@/lib/tone"
import { users } from "@/data/users"
import { SourceIcon } from "@/features/incidents/list/source-icon"
import {
  Section, SubSection, Preview, Code, TokenRow, ColorSwatch, DoCard, DontCard,
} from "./showcase"

/* ── Page anchors ────────────────────────────────────────────────────────── */

const ANCHORS: { id: string; label: string; group: "fundamentals" | "library" | "patterns" | "rules" }[] = [
  { id: "intro",         label: "Introduction",      group: "fundamentals" },
  { id: "colors",        label: "Colors",            group: "fundamentals" },
  { id: "tones",         label: "Tone palette",      group: "fundamentals" },
  { id: "typography",    label: "Typography",        group: "fundamentals" },
  { id: "spacing",       label: "Spacing & radii",   group: "fundamentals" },
  { id: "iconography",   label: "Iconography",       group: "fundamentals" },
  { id: "primitives",    label: "Primitives",        group: "library" },
  { id: "brand",         label: "Brand surfaces",    group: "library" },
  { id: "patterns",      label: "Composed patterns", group: "patterns" },
  { id: "layouts",       label: "Layout shells",     group: "patterns" },
  { id: "rules",         label: "Do / Don't",        group: "rules" },
]

/* ── Page ────────────────────────────────────────────────────────────────── */

export function DesignSystemPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)]">
      {/* Sticky sidebar nav */}
      <aside className="lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
        <div className="space-y-3 rounded-lg border bg-card p-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-primary">Design system</div>
            <div className="mt-0.5 text-xs text-muted-foreground">SIRP OmniSense · v1</div>
          </div>
          <Separator />
          <NavGroup label="Fundamentals" anchors={ANCHORS.filter((a) => a.group === "fundamentals")} />
          <NavGroup label="Library"      anchors={ANCHORS.filter((a) => a.group === "library")} />
          <NavGroup label="Patterns"     anchors={ANCHORS.filter((a) => a.group === "patterns")} />
          <NavGroup label="Rules"        anchors={ANCHORS.filter((a) => a.group === "rules")} />
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0">
        <IntroSection />
        <ColorsSection />
        <TonePaletteSection />
        <TypographySection />
        <SpacingSection />
        <IconographySection />
        <PrimitivesSection />
        <BrandSection />
        <PatternsSection />
        <LayoutsSection />
        <RulesSection />
      </main>
    </div>
  )
}

function NavGroup({ label, anchors }: { label: string; anchors: typeof ANCHORS }) {
  return (
    <div>
      <div className="mb-1.5 px-1 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/70">
        {label}
      </div>
      <ul className="space-y-0.5">
        {anchors.map((a) => (
          <li key={a.id}>
            <a
              href={`#${a.id}`}
              className="block rounded px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
            >
              {a.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ── Intro ───────────────────────────────────────────────────────────────── */

function IntroSection() {
  return (
    <Section
      id="intro"
      eyebrow="Design System"
      title="SIRP OmniSense — Design System"
      description={
        <>
          The canonical reference for visual + interaction patterns across the OmniSense platform.
          Every component, token, and recipe in this mockup is documented here. Designers use it as the spec;
          engineers use it as the source of truth. <strong>If a pattern isn't on this page, it shouldn't be in the codebase.</strong>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
              <Sparkles className="size-3.5" />
            </div>
            <div className="text-sm font-semibold">One principle</div>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Muted is the default; color is a signal.</strong>{" "}
            Reserve tone for the one element per zone that carries actionable meaning.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-lg border bg-muted text-muted-foreground">
              <Layers className="size-3.5" />
            </div>
            <div className="text-sm font-semibold">Five tones</div>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            <Code>alert</Code> <Code>warn</Code> <Code>ok</Code> <Code>info</Code> <Code>muted</Code> —
            semantic, not brand colors. Every tone-colored UI uses these.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-lg border bg-muted text-muted-foreground">
              <FileText className="size-3.5" />
            </div>
            <div className="text-sm font-semibold">Section labels</div>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            All card labels: <Code>text-[11px] font-medium uppercase tracking-wider text-muted-foreground</Code>.
            One rule, applied everywhere.
          </p>
        </div>
      </div>
    </Section>
  )
}

/* ── Colors ──────────────────────────────────────────────────────────────── */

function ColorsSection() {
  return (
    <Section
      id="colors"
      title="Colors"
      description="Brand + semantic + surface tokens. Every CSS variable here is wired into Tailwind classes via the @theme inline block in index.css."
    >
      <SubSection title="Brand" description="SIRPurple is the only brand color. It carries the primary CTA, focus rings, and the info tone.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <ColorSwatch name="Primary"            value="var(--primary)"            css="--primary · #8e2dff" />
          <ColorSwatch name="Primary foreground" value="var(--primary-foreground)" css="--primary-foreground" />
          <ColorSwatch name="Ring"               value="var(--ring)"               css="--ring (focus)" />
          <ColorSwatch name="Chart 4"            value="var(--chart-4)"            css="--chart-4 (gradients)" />
        </div>
      </SubSection>

      <SubSection title="Semantic" description="Brand-independent meaning. These map to the tone palette below.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <ColorSwatch name="Destructive" value="var(--destructive)" css="--destructive · alert tone" />
          <ColorSwatch name="Attention"   value="var(--attention)"   css="--attention" />
          <ColorSwatch name="Warning"     value="var(--warning)"     css="--warning · warn tone" />
          <ColorSwatch name="Success"     value="var(--success)"     css="--success · ok tone" />
          <ColorSwatch name="Info"        value="var(--info)"        css="--info" />
        </div>
      </SubSection>

      <SubSection title="Surfaces" description="Page chrome. Card / popover share a token so elevation reads consistently.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <ColorSwatch name="Background"  value="var(--background)"  css="--background" />
          <ColorSwatch name="Card"        value="var(--card)"        css="--card" />
          <ColorSwatch name="Popover"     value="var(--popover)"     css="--popover" />
          <ColorSwatch name="Muted"       value="var(--muted)"       css="--muted (subtle bg)" />
          <ColorSwatch name="Border"      value="var(--border)"      css="--border" />
          <ColorSwatch name="Sidebar"     value="var(--sidebar)"     css="--sidebar" />
          <ColorSwatch name="Foreground"  value="var(--foreground)"  css="--foreground" />
          <ColorSwatch name="Muted FG"    value="var(--muted-foreground)" css="--muted-foreground" />
        </div>
      </SubSection>

      <SubSection title="Chart" description="Brand-tinted ramp for data viz. Always use these — never raw hex colors in charts.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {[1, 2, 3, 4, 5].map((n) => (
            <ColorSwatch key={n} name={`Chart ${n}`} value={`var(--chart-${n})`} css={`--chart-${n}`} />
          ))}
        </div>
      </SubSection>
    </Section>
  )
}

/* ── Tone palette ────────────────────────────────────────────────────────── */

function TonePaletteSection() {
  return (
    <Section
      id="tones"
      title="Tone palette"
      description={
        <>
          The load-bearing color system. Every tone-colored element in the app uses one of these five tones —
          never a one-off color. Import from <Code>@/lib/tone</Code> and apply the matching class set.
        </>
      }
    >
      <SubSection title="The five tones" description="Same content rendered in every tone, so you can see what each tone communicates.">
        <div className="overflow-hidden rounded-lg border">
          <div className="grid grid-cols-5 border-b bg-muted/30 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {TONES.map((tone) => (
              <div key={tone} className="border-r px-3 py-2 last:border-r-0">{TONE_LABEL[tone]}</div>
            ))}
          </div>
          {/* Tokens row */}
          <div className="grid grid-cols-5 divide-x">
            {TONES.map((tone) => {
              const t = TONE[tone]
              return (
                <div key={tone} className="space-y-2.5 px-3 py-3">
                  {/* iconBox */}
                  <div className="flex items-center gap-2">
                    <div className={cn("grid size-8 place-items-center rounded-lg border", t.iconBox)}>
                      <Shield className="size-4" />
                    </div>
                    <Code>iconBox</Code>
                  </div>
                  {/* chip */}
                  <div className="flex items-center gap-2">
                    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", t.chip)}>
                      <span className={cn("size-1.5 rounded-full", t.dot)} />
                      Chip
                    </span>
                  </div>
                  {/* text */}
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-semibold uppercase tracking-wider", t.text)}>Tone text</span>
                  </div>
                  {/* bar */}
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Bar</div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted/40">
                      <div className={cn("h-full w-2/3 rounded-full", t.bar)} />
                    </div>
                  </div>
                  {/* bg callout */}
                  <div className={cn("rounded border px-2 py-1.5 text-[10px]", t.bg)}>
                    Tinted background
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </SubSection>

      <SubSection title="When to use which" description="The decision tree for picking a tone.">
        <div className="space-y-2">
          {TONES.map((tone) => {
            const t = TONE[tone]
            return (
              <div key={tone} className="flex items-start gap-3 rounded-lg border px-4 py-3">
                <div className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border", t.iconBox)}>
                  <Shield className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className={cn("text-sm font-semibold", t.text)}>{TONE_LABEL[tone]}</div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{TONE_DESCRIPTION[tone]}</p>
                </div>
                <Code>{`TONE.${tone}`}</Code>
              </div>
            )
          })}
        </div>
      </SubSection>

      <SubSection title="Mappings" description="How domain values map to tones. Use these mappings, don't invent new ones.">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border bg-card">
            <div className="border-b px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Severity</div>
            <div className="px-3 py-2">
              <TokenRow label="critical" value="→ alert" preview={<span className={cn("size-2 rounded-full", TONE.alert.dot)} />} />
              <TokenRow label="high"     value="→ warn"  preview={<span className={cn("size-2 rounded-full", TONE.warn.dot)} />} />
              <TokenRow label="medium"   value="→ info"  preview={<span className={cn("size-2 rounded-full", TONE.info.dot)} />} />
              <TokenRow label="low"      value="→ muted" preview={<span className={cn("size-2 rounded-full", TONE.muted.dot)} />} />
            </div>
          </div>
          <div className="rounded-lg border bg-card">
            <div className="border-b px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Verdict / status</div>
            <div className="px-3 py-2">
              <TokenRow label="malicious"   value="→ alert" preview={<span className={cn("size-2 rounded-full", TONE.alert.dot)} />} />
              <TokenRow label="suspicious"  value="→ warn"  preview={<span className={cn("size-2 rounded-full", TONE.warn.dot)} />} />
              <TokenRow label="clean"       value="→ ok"    preview={<span className={cn("size-2 rounded-full", TONE.ok.dot)} />} />
              <TokenRow label="unknown"     value="→ muted" preview={<span className={cn("size-2 rounded-full", TONE.muted.dot)} />} />
            </div>
          </div>
          <div className="rounded-lg border bg-card">
            <div className="border-b px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">SLA</div>
            <div className="px-3 py-2">
              <TokenRow label="breach"  value="→ alert" preview={<span className={cn("size-2 rounded-full", TONE.alert.dot)} />} />
              <TokenRow label="warn"    value="→ warn"  preview={<span className={cn("size-2 rounded-full", TONE.warn.dot)} />} />
              <TokenRow label="ok / met" value="→ muted (no chip rendered)" />
            </div>
          </div>
          <div className="rounded-lg border bg-card">
            <div className="border-b px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Agent / task status</div>
            <div className="px-3 py-2">
              <TokenRow label="done"    value="→ info"  preview={<span className={cn("size-2 rounded-full", TONE.info.dot)} />} />
              <TokenRow label="running" value="→ warn"  preview={<span className={cn("size-2 rounded-full", TONE.warn.dot)} />} />
              <TokenRow label="queued"  value="→ muted" preview={<span className={cn("size-2 rounded-full", TONE.muted.dot)} />} />
              <TokenRow label="failed"  value="→ alert" preview={<span className={cn("size-2 rounded-full", TONE.alert.dot)} />} />
            </div>
          </div>
        </div>
      </SubSection>
    </Section>
  )
}

/* ── Typography ──────────────────────────────────────────────────────────── */

function TypographySection() {
  return (
    <Section
      id="typography"
      title="Typography"
      description="DM Sans for everything except mono. Tabular numerals on numeric values. No body color other than foreground / muted-foreground."
    >
      <SubSection title="Scale">
        <div className="overflow-hidden rounded-lg border bg-card">
          <TypeRow label="Page title"     classes="text-2xl font-semibold tracking-tight" sample="OmniSense — Investigation room" />
          <TypeRow label="Card title"     classes="text-base font-semibold tracking-tight" sample="Lateral movement on DC-PROD-01" />
          <TypeRow label="Body"           classes="text-sm leading-relaxed" sample="Strong indicators suggest active threat. Escalation recommended." />
          <TypeRow label="KPI value"      classes="font-medium text-2xl tabular-nums leading-none tracking-tight" sample="92" />
          <TypeRow label="Section label"  classes="text-[11px] font-medium uppercase tracking-wider text-muted-foreground" sample="Recent Activity" />
          <TypeRow label="Micro label"    classes="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60" sample="MITRE ATT&CK" />
          <TypeRow label="Mono ID"        classes="font-mono text-xs text-muted-foreground/60" sample="INC-1247" />
          <TypeRow label="Mono numeric"   classes="font-mono text-xs font-semibold tabular-nums" sample="12 / 20 · 60%" />
        </div>
      </SubSection>

      <SubSection title="Rules">
        <ul className="space-y-1.5 text-sm leading-relaxed text-muted-foreground">
          <li>• Card section labels are <strong className="text-foreground">always</strong> <Code>text-[11px] font-medium uppercase tracking-wider text-muted-foreground</Code></li>
          <li>• KPI values are <Code>font-medium text-2xl tabular-nums</Code> — not <Code>font-bold</Code></li>
          <li>• Numeric counts use <Code>font-mono tabular-nums</Code> so columns align</li>
          <li>• IDs (incident, entity, etc.) always use <Code>font-mono</Code></li>
          <li>• Never use <Code>text-[XXpx]</Code> for sizes that have canonical Tailwind classes</li>
        </ul>
      </SubSection>
    </Section>
  )
}

function TypeRow({ label, classes, sample }: { label: string; classes: string; sample: string }) {
  return (
    <div className="grid grid-cols-[1fr_1.4fr_2fr] items-baseline gap-4 border-b px-4 py-3 last:border-b-0">
      <div className="text-xs font-semibold">{label}</div>
      <div className="font-mono text-[10px] text-muted-foreground">{classes}</div>
      <div className={classes}>{sample}</div>
    </div>
  )
}

/* ── Spacing ─────────────────────────────────────────────────────────────── */

function SpacingSection() {
  return (
    <Section
      id="spacing"
      title="Spacing & radii"
      description="Use the Tailwind scale. Almost everything is gap-1.5 / gap-2 / gap-3 / gap-4. Card padding rhythm is fixed."
    >
      <SubSection title="Gap rhythm">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { name: "gap-1.5", px: "6px",  use: "tight chip rows, dots + counts" },
            { name: "gap-2",   px: "8px",  use: "icon + label, tight inline groups" },
            { name: "gap-2.5", px: "10px", use: "list row content stacks" },
            { name: "gap-3",   px: "12px", use: "comfortable inline (header rows)" },
            { name: "gap-3.5", px: "14px", use: "timeline events, dossier rows" },
            { name: "gap-4",   px: "16px", use: "card grids, section spacing" },
            { name: "gap-5",   px: "20px", use: "section paragraph stacks" },
            { name: "gap-6",   px: "24px", use: "between major sections" },
          ].map((g) => (
            <div key={g.name} className="rounded-lg border bg-card p-3">
              <div className="font-mono text-xs font-semibold">{g.name}</div>
              <div className="text-[10px] text-muted-foreground/70">{g.px}</div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{g.use}</p>
            </div>
          ))}
        </div>
      </SubSection>

      <SubSection title="Card padding" description="Card has py-4 built in. Only set horizontal on CardContent. Never double-pad.">
        <div className="grid gap-3 sm:grid-cols-2">
          <DoCard>
            <Code>&lt;Card&gt;</Code> + <Code>&lt;CardContent className="px-5"&gt;</Code> — relies on the built-in vertical padding.
          </DoCard>
          <DontCard>
            Don't add <Code>py-*</Code> to CardContent. You'll get 32px vertical padding instead of 16px.
          </DontCard>
        </div>
      </SubSection>

      <SubSection title="Border radii">
        <div className="flex flex-wrap items-center gap-3">
          {[
            { name: "rounded",    cls: "rounded",     px: "calc(--radius - 4px)" },
            { name: "rounded-md", cls: "rounded-md",  px: "calc(--radius - 2px)" },
            { name: "rounded-lg", cls: "rounded-lg",  px: "var(--radius) ≈ 10px" },
            { name: "rounded-xl", cls: "rounded-xl",  px: "calc(--radius + 4px)" },
            { name: "rounded-2xl",cls: "rounded-2xl", px: "calc(--radius + 8px)" },
            { name: "full",       cls: "rounded-full",px: "9999px (pills, dots)" },
          ].map((r) => (
            <div key={r.name} className="space-y-1.5">
              <div className={cn("size-14 border bg-primary/10", r.cls)} />
              <div className="text-center font-mono text-[10px] text-muted-foreground">{r.name}</div>
            </div>
          ))}
        </div>
      </SubSection>
    </Section>
  )
}

/* ── Iconography ─────────────────────────────────────────────────────────── */

function IconographySection() {
  const exampleIcons: { Icon: LucideIcon; name: string }[] = [
    { Icon: Shield, name: "Shield" }, { Icon: Bell, name: "Bell" },
    { Icon: Activity, name: "Activity" }, { Icon: Layers, name: "Layers" },
    { Icon: Network, name: "Network" }, { Icon: Brain, name: "Brain" },
    { Icon: Globe, name: "Globe" }, { Icon: FileText, name: "FileText" },
    { Icon: Sparkles, name: "Sparkles" }, { Icon: CheckCircle2, name: "CheckCircle2" },
    { Icon: AlertTriangle, name: "AlertTriangle" }, { Icon: HelpCircle, name: "HelpCircle" },
  ]
  return (
    <Section
      id="iconography"
      title="Iconography"
      description="Lucide React for UI. Brand-mark SVGs for vendor logos (see Brand section)."
    >
      <SubSection title="Common Lucide icons" description="Always at size-3 to size-6. Inside tone boxes: size-3.5 or size-4.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {exampleIcons.map(({ Icon, name }) => (
            <div key={name} className="flex flex-col items-center gap-1.5 rounded-lg border bg-card px-3 py-3">
              <Icon className="size-5 text-muted-foreground" />
              <div className="font-mono text-[10px] text-muted-foreground">{name}</div>
            </div>
          ))}
        </div>
      </SubSection>

      <SubSection title="Icon sizes in context">
        <div className="overflow-hidden rounded-lg border bg-card">
          <IconSizeRow size="size-2.5" px="10px" use="micro dots inside chips" />
          <IconSizeRow size="size-3"   px="12px" use="inline labels, status dots-with-icon" />
          <IconSizeRow size="size-3.5" px="14px" use="header icons, small buttons" />
          <IconSizeRow size="size-4"   px="16px" use="icon-in-tone-box content (size-8 box)" />
          <IconSizeRow size="size-5"   px="20px" use="larger icon-in-tone-box (size-10 box)" />
          <IconSizeRow size="size-6"   px="24px" use="hero icons (verdict callout, etc.)" />
        </div>
      </SubSection>
    </Section>
  )
}

function IconSizeRow({ size, px, use }: { size: string; px: string; use: string }) {
  return (
    <div className="grid grid-cols-[1fr_1fr_2fr_auto] items-center gap-4 border-b px-4 py-2.5 last:border-b-0">
      <div className="font-mono text-xs">{size}</div>
      <div className="font-mono text-[10px] text-muted-foreground">{px}</div>
      <div className="text-xs text-muted-foreground">{use}</div>
      <Shield className={size} />
    </div>
  )
}

/* ── Primitives ──────────────────────────────────────────────────────────── */

function PrimitivesSection() {
  const [checkedState, setCheckedState] = useState(false)
  return (
    <Section
      id="primitives"
      title="Primitives"
      description="Shadcn-derived components from /components/ui. Use these — don't roll your own button or badge."
    >
      <SubSection title="Button">
        <div className="grid gap-3 sm:grid-cols-2">
          <Preview label="Variants">
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm">Primary</Button>
              <Button size="sm" variant="outline">Outline</Button>
              <Button size="sm" variant="ghost">Ghost</Button>
              <Button size="sm" variant="destructive">Destructive</Button>
              <Button size="sm" variant="secondary">Secondary</Button>
            </div>
          </Preview>
          <Preview label="With icon">
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" className="gap-1.5"><Play className="size-3.5" />Run</Button>
              <Button size="sm" variant="outline" className="gap-1.5"><RotateCcw className="size-3.5" />Re-run</Button>
              <Button size="sm" variant="outline" className="gap-1.5">
                Action<ChevronDown className="size-3 opacity-60" />
              </Button>
            </div>
          </Preview>
          <Preview label="Heights" code="h-7 (compact) · h-8 (default) · default (h-9)">
            <div className="flex items-end gap-2">
              <Button size="sm" className="h-7 px-2.5 text-[11px]">h-7</Button>
              <Button size="sm" className="h-8">h-8</Button>
              <Button size="default">default</Button>
            </div>
          </Preview>
          <Preview label="Icon only">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="size-8"><MoreHorizontal className="size-3.5" /></Button>
              <Button variant="ghost"   size="icon" className="size-7"><Trash2 className="size-3.5" /></Button>
            </div>
          </Preview>
        </div>
      </SubSection>

      <SubSection title="Badge & chip">
        <div className="grid gap-3 sm:grid-cols-2">
          <Preview label="Variants">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline" className="font-mono text-xs">P1</Badge>
            </div>
          </Preview>
          <Preview label="Tone chips (the SIRP chip pattern)">
            <div className="flex flex-wrap items-center gap-2">
              {TONES.map((tone) => {
                const t = TONE[tone]
                return (
                  <span key={tone} className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", t.chip)}>
                    <span className={cn("size-1.5 rounded-full", t.dot)} />
                    {TONE_LABEL[tone]}
                  </span>
                )
              })}
            </div>
          </Preview>
        </div>
      </SubSection>

      <SubSection title="Card">
        <div className="grid gap-3 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <CardContent className="px-5 py-4">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Standard card</div>
              <p className="mt-2 text-sm">Card + CardContent px-5 — relies on built-in py-4.</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden ring-1 ring-primary/20">
            <CardContent className="p-0">
              <div className="border-b bg-primary/5 px-5 py-3">
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Hero card (ringed)</div>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm">For OmniSense verdict + other focal cards. <Code>ring-1 ring-primary/20</Code>.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </SubSection>

      <SubSection title="Avatar">
        <Preview>
          <div className="flex items-center gap-3">
            <Avatar className="size-7">
              <AvatarImage src={users.ahmed.photo} alt={users.ahmed.name} />
              <AvatarFallback className={cn("bg-linear-to-br text-[9px] font-bold text-white", users.ahmed.gradient)}>
                {users.ahmed.initials}
              </AvatarFallback>
            </Avatar>
            <Avatar className="size-7">
              <AvatarFallback className={cn("bg-linear-to-br text-[9px] font-bold text-white", users.sara.gradient)}>
                {users.sara.initials}
              </AvatarFallback>
            </Avatar>
            <Avatar className="size-7">
              <AvatarFallback className="bg-muted text-[9px] font-bold text-muted-foreground">??</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">photo · fallback · unknown</span>
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Form controls">
        <div className="grid gap-3 sm:grid-cols-2">
          <Preview label="Input">
            <Input placeholder="Search by value…" className="max-w-xs" />
          </Preview>
          <Preview label="Checkbox + Switch">
            <div className="flex items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox checked={checkedState} onCheckedChange={(c) => setCheckedState(!!c)} />
                Toggle me
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Switch />
                Notifications
              </label>
            </div>
          </Preview>
        </div>
      </SubSection>

      <SubSection title="Overlays — Tooltip / Popover / Dropdown">
        <div className="grid gap-3 sm:grid-cols-3">
          <Preview label="Tooltip">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline">Hover me</Button>
              </TooltipTrigger>
              <TooltipContent>I'm a tooltip</TooltipContent>
            </Tooltip>
          </Preview>
          <Preview label="Popover">
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5">Open<ChevronDown className="size-3 opacity-60" /></Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3 text-sm">Popover content here.</PopoverContent>
            </Popover>
          </Preview>
          <Preview label="Dropdown">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5">Menu<ChevronDown className="size-3 opacity-60" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem><Copy className="mr-2 size-3.5" />Copy</DropdownMenuItem>
                <DropdownMenuItem><Download className="mr-2 size-3.5" />Download</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 size-3.5" />Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Preview>
        </div>
      </SubSection>

      <SubSection title="Tabs">
        <Preview>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="iocs">IOCs</TabsTrigger>
              <TabsTrigger value="entities">Entities</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="pt-2 text-sm text-muted-foreground">Overview content.</TabsContent>
            <TabsContent value="iocs" className="pt-2 text-sm text-muted-foreground">IOC list.</TabsContent>
            <TabsContent value="entities" className="pt-2 text-sm text-muted-foreground">Entity list.</TabsContent>
          </Tabs>
        </Preview>
      </SubSection>

      <SubSection title="Skeleton (loading)">
        <Preview>
          <div className="w-full space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </Preview>
      </SubSection>
    </Section>
  )
}

/* ── Brand ───────────────────────────────────────────────────────────────── */

function BrandSection() {
  const sources = ["OmniSense", "CrowdStrike", "Splunk", "Sentinel", "Proofpoint", "AWS GuardDuty", "Triage Agent"]
  return (
    <Section
      id="brand"
      title="Brand surfaces"
      description="Source-vendor logos rendered as landscape badges (3:2 aspect). Lucide for SIRP-internal services, simple-icons SVG for Splunk, custom inline SVG for everything else."
    >
      <SubSection title="SourceIcon — all variants" description="Same component, three sizes used across the app.">
        <div className="space-y-4">
          {[28, 30, 44].map((size) => (
            <div key={size} className="rounded-lg border bg-card px-5 py-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">size = {size}</span>
                <span className="text-[10px] text-muted-foreground/50">·</span>
                <Code>iconOnly</Code>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {sources.map((s) => (
                  <SourceIcon key={s} source={s} size={size} iconOnly />
                ))}
              </div>
            </div>
          ))}
          <div className="rounded-lg border bg-card px-5 py-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">size = 44</span>
              <span className="text-[10px] text-muted-foreground/50">·</span>
              <Code>icon + name</Code>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {sources.map((s) => <SourceIcon key={s} source={s} size={44} />)}
            </div>
          </div>
        </div>
      </SubSection>

      <SubSection title="Usage rules">
        <ul className="space-y-1.5 text-sm leading-relaxed text-muted-foreground">
          <li>• Page header (sticky): <Code>size=30 iconOnly</Code> with Tooltip showing the source name</li>
          <li>• Overview card hero: <Code>size=44</Code> (icon + name)</li>
          <li>• Inline list rows: <Code>size=22-28 iconOnly</Code></li>
          <li>• Never wrap in a bordered/bg bubble — the brand IS the badge</li>
        </ul>
      </SubSection>
    </Section>
  )
}

/* ── Composed patterns ───────────────────────────────────────────────────── */

function PatternsSection() {
  return (
    <Section
      id="patterns"
      title="Composed patterns"
      description="Domain-specific recipes that combine primitives + tokens. These are the building blocks of every page."
    >
      <SubSection title="Section label" description="The most-repeated micro-pattern in the app. Lead every card with this.">
        <Preview code='<span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">…</span>'>
          <div className="w-full space-y-3">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Recent Activity</div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">OmniSense Verdict</div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Indicators of Compromise</div>
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Icon-in-tone-box" description="The unit element of tone application. Always size-7 or size-8 (smaller) / size-9 (medium) / size-12 (large hero).">
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

      <SubSection title="Stat tile" description="Strip cell pattern from overview tab.">
        <Preview>
          <div className="grid w-full grid-cols-2 divide-x rounded-lg border bg-card sm:grid-cols-4">
            <StatPreview icon={Shield}      label="IOCs"      value={12} sub="7 malicious · 2 suspicious" tone="alert" />
            <StatPreview icon={Bell}        label="Alerts"    value={4}  sub="3 open · 1 closed" tone="warn" />
            <StatPreview icon={Network}     label="Entities"  value={3}  sub="1 critical risk" tone="alert" />
            <StatPreview icon={CheckSquare2} label="Tasks"    value="2/4" sub="50% complete" tone="info" progress={50} />
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
            {/* System */}
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
            {/* Analyst */}
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
    </Section>
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

/* ── Layouts ─────────────────────────────────────────────────────────────── */

function LayoutsSection() {
  return (
    <Section
      id="layouts"
      title="Layout shells"
      description="The page-level chrome. Two shells cover the app: centered (default) and full-bleed (detail pages)."
    >
      <SubSection title="Detail page shell" description="Severity stripe + sticky header (1 row) + sticky tab strip + scrolling content. Used for incident / TI / entity detail.">
        <Preview dense>
          <div className="w-full overflow-hidden rounded-lg border">
            {/* Severity stripe */}
            <div className="h-[3px] w-full bg-destructive/55" />
            {/* Row 1 header */}
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
            {/* Tab strip */}
            <div className="flex h-8 items-center gap-2 border-b bg-background px-4 text-[10px] font-medium text-muted-foreground">
              <span className="text-foreground">Overview</span>
              <span>OmniSense</span>
              <span>Artifacts</span>
              <span>Entities</span>
              <span>…</span>
            </div>
            {/* Content */}
            <div className="space-y-2 bg-muted/10 p-3">
              <div className="h-12 rounded border bg-card" />
              <div className="h-16 rounded border bg-card" />
            </div>
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Master/detail" description="Sticky list pane + scrolling dossier. Used for Artifacts, Entities, and any list-heavy tab.">
        <Preview dense>
          <div className="grid w-full grid-cols-[120px_1fr] gap-2">
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

      <SubSection title="Card grid utility" description="The gradient wrapper that gives all child cards a subtle primary-to-card linear bg.">
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
    </Section>
  )
}

/* ── Rules ───────────────────────────────────────────────────────────────── */

function RulesSection() {
  return (
    <Section
      id="rules"
      title="Do / Don't"
      description="The rules engineering + design alike must follow. Most are mechanical; the rest are taste calibrated by prior iterations."
    >
      <SubSection title="Color & tone">
        <div className="grid gap-3 sm:grid-cols-2">
          <DoCard>One bold color signal per zone. Verdict callout is colored; everything else around it stays muted.</DoCard>
          <DontCard>Multiple competing colored elements in the same card. The eye doesn't know where to look.</DontCard>
          <DoCard>Use the 5-tone palette (<Code>TONE</Code>) for every tone-colored UI.</DoCard>
          <DontCard>One-off hex colors or per-type color palettes (the artifacts tab once had 12).</DontCard>
        </div>
      </SubSection>

      <SubSection title="Cards & padding">
        <div className="grid gap-3 sm:grid-cols-2">
          <DoCard><Code>&lt;Card&gt;</Code> + <Code>&lt;CardContent className="px-5"&gt;</Code>. Card has <Code>py-4</Code> built in.</DoCard>
          <DontCard>Adding <Code>py-*</Code> to CardContent — you'll double the vertical padding (32px instead of 16px).</DontCard>
        </div>
      </SubSection>

      <SubSection title="Tailwind v4 canonical names">
        <div className="grid gap-3 sm:grid-cols-2">
          <DoCard><Code>min-w-275</Code>, <Code>bg-(--var)</Code>, <Code>bg-linear-to-br</Code>, <Code>size-7</Code></DoCard>
          <DontCard><Code>min-w-[1100px]</Code>, <Code>bg-[var(--…)]</Code>, <Code>bg-gradient-to-br</Code> (v3 syntax)</DontCard>
        </div>
      </SubSection>

      <SubSection title="Brand vocabulary">
        <div className="grid gap-3 sm:grid-cols-2">
          <DoCard>"Co-Analyst" · "OmniSense" · "the platform"</DoCard>
          <DontCard>"Copilot" · "the AI" · "Claude" · "the LLM" · "the assistant"</DontCard>
        </div>
      </SubSection>

      <SubSection title="Avatars">
        <div className="grid gap-3 sm:grid-cols-2">
          <DoCard>Unsplash headshots via <Code>users.ts</Code> with gradient fallback.</DoCard>
          <DontCard>pravatar, dicebear, or randomuser — we landed on Unsplash because we wanted *professional* portraits.</DontCard>
        </div>
      </SubSection>

      <SubSection title="Mock data">
        <div className="grid gap-3 sm:grid-cols-2">
          <DoCard>Fake but plausible data in <Code>src/data/*</Code> and <Code>*-mock.ts</Code>.</DoCard>
          <DontCard>Real customer data, IOCs, tenant IDs, or credentials — even as "examples". This is a brand-visible mockup.</DontCard>
        </div>
      </SubSection>
    </Section>
  )
}
