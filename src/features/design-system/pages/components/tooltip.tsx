import { Settings2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Code, Preview, SubSection } from "../../showcase"

export function TooltipPage() {
  return (
    <div className="space-y-10">

      <SubSection title="Default" description="Hover to reveal a small label.">
        <Preview>
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline">Hover me</Button>
              </TooltipTrigger>
              <TooltipContent>This explains the button</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="size-7"><Settings2 className="size-3.5" /></Button>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
          </div>
        </Preview>
      </SubSection>

      <SubSection title="On a non-button (pill)" description="Tooltips work on any element. Wrap with cursor-default to avoid the text-select cursor.">
        <Preview>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="cursor-default font-mono text-xs font-bold">P1</Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom">Priority — P1 highest, P4 lowest</TooltipContent>
          </Tooltip>
        </Preview>
      </SubSection>

      <SubSection title="Sides" description="side='top' | 'right' | 'bottom' | 'left'. Default is top.">
        <Preview>
          <div className="flex items-center gap-3">
            {(["top", "right", "bottom", "left"] as const).map((side) => (
              <Tooltip key={side}>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline">{side}</Button>
                </TooltipTrigger>
                <TooltipContent side={side}>Tooltip on {side}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Rules">
        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>• <strong className="text-foreground">Always pair icon-only buttons with a tooltip.</strong> A floating icon means nothing without it.</li>
          <li>• Tooltip content should be short — 1-6 words. For longer help, use Popover.</li>
          <li>• Always set <Code>asChild</Code> on the trigger and wrap the element directly.</li>
          <li>• Avoid tooltips on touch-only flows — they don't render on tap.</li>
        </ul>
      </SubSection>

      <SubSection title="Import">
        <div className="rounded-lg border bg-muted/15 px-3 py-2">
          <Code>{`import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"`}</Code>
        </div>
      </SubSection>
    </div>
  )
}
