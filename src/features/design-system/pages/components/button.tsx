import {
  ChevronDown, Download, Loader2, MoreHorizontal, Play, Plus, RotateCcw, Send, Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Code, Preview, SubSection } from "../../showcase"

export function ButtonPage() {
  return (
    <div className="space-y-10">

      <SubSection title="Variants" description="Five styles. Use the primary variant for the single hero CTA per zone.">
        <Preview code={`<Button>Primary</Button>\n<Button variant="outline">Outline</Button>\n<Button variant="secondary">Secondary</Button>\n<Button variant="ghost">Ghost</Button>\n<Button variant="destructive">Destructive</Button>`}>
          <div className="flex flex-wrap items-center gap-2">
            <Button>Primary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Sizes" description="Three sizes cover the app. Default for primary CTAs, small for tight rows / toolbars, h-7 for very dense lists.">
        <Preview>
          <div className="flex flex-wrap items-end gap-2">
            <Button size="default">Default</Button>
            <Button size="sm">Small (h-8)</Button>
            <Button size="sm" className="h-7 px-2.5 text-[11px]">Compact (h-7)</Button>
          </div>
        </Preview>
      </SubSection>

      <SubSection title="With icon" description="Icon + label. Use gap-1.5 between icon and text.">
        <Preview>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" className="gap-1.5"><Play className="size-3.5" />Run</Button>
            <Button size="sm" variant="outline" className="gap-1.5"><RotateCcw className="size-3.5" />Re-run</Button>
            <Button size="sm" variant="outline" className="gap-1.5"><Plus className="size-3.5" />Add task</Button>
            <Button size="sm" variant="ghost" className="gap-1.5"><Download className="size-3.5" />Export</Button>
            <Button size="sm" variant="destructive" className="gap-1.5"><Trash2 className="size-3.5" />Delete</Button>
          </div>
        </Preview>
      </SubSection>

      <SubSection title="With dropdown chevron" description="For buttons that open a menu or popover, append a small chevron with reduced opacity.">
        <Preview>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1.5">
              Action<ChevronDown className="size-3 opacity-60" />
            </Button>
            <Button size="sm" className="gap-1.5">
              <Send className="size-3.5" />Publish<ChevronDown className="size-3 opacity-60" />
            </Button>
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Icon-only" description="Use for tertiary actions in dense areas (more menus, close, etc.). Always pair with a tooltip.">
        <Preview>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="size-8"><MoreHorizontal className="size-3.5" /></Button>
            <Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-3.5" /></Button>
            <Button variant="ghost" size="icon" className="size-7"><Trash2 className="size-3.5" /></Button>
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Loading & disabled states">
        <Preview>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" disabled className="gap-1.5"><Loader2 className="size-3.5 animate-spin" />Running…</Button>
            <Button size="sm" variant="outline" disabled>Disabled</Button>
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Usage">
        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>• <strong className="text-foreground">One primary per zone.</strong> If you have two primary buttons next to each other, one is wrong.</li>
          <li>• <strong className="text-foreground">Destructive only for irreversible actions.</strong> Delete, decommission, force-rotate.</li>
          <li>• <strong className="text-foreground">Ghost for tertiary actions.</strong> Inline links, dismiss buttons, "View all" affordances.</li>
          <li>• <strong className="text-foreground">Icon-only buttons need tooltips.</strong> A floating "MoreHorizontal" icon means nothing without a label on hover.</li>
        </ul>
      </SubSection>

      <SubSection title="Import">
        <div className="rounded-lg border bg-muted/15 px-3 py-2">
          <Code>{`import { Button } from "@/components/ui/button"`}</Code>
        </div>
      </SubSection>
    </div>
  )
}
