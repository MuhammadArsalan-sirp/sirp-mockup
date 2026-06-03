import {
  ChevronDown, Copy, Download, ExternalLink, Mail, MoreHorizontal, Pencil, Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Code, Preview, SubSection } from "../../showcase"

export function DropdownMenuPage() {
  return (
    <div className="space-y-10">

      <SubSection title="Icon-only 'More' menu" description="The standard pattern for overflow actions on a row or toolbar.">
        <Preview>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="size-8">
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem className="gap-2 text-xs"><Copy className="size-3.5 text-muted-foreground" />Copy</DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-xs"><Download className="size-3.5 text-muted-foreground" />Download</DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-xs"><ExternalLink className="size-3.5 text-muted-foreground" />Open in new tab</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-xs text-destructive focus:text-destructive">
                <Trash2 className="size-3.5" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Preview>
      </SubSection>

      <SubSection title="Trigger with chevron" description="When the menu contains a list of choices (verdict pick, sort, etc.), use a button with chevron-down.">
        <Preview>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 gap-1.5 px-3 text-xs">
                Mark verdict<ChevronDown className="size-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              {["Malicious", "Suspicious", "Clean", "Unknown"].map((label) => (
                <DropdownMenuItem key={label} className="text-xs">{label}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </Preview>
      </SubSection>

      <SubSection title="With submenu / nested" description="Dropdown actions with leading icons. Use destructive style for irreversible actions.">
        <Preview>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5">Actions<ChevronDown className="size-3 opacity-60" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuItem><Pencil className="mr-2 size-3.5 text-muted-foreground" />Edit</DropdownMenuItem>
              <DropdownMenuItem><Mail  className="mr-2 size-3.5 text-muted-foreground" />Send email</DropdownMenuItem>
              <DropdownMenuItem><Download className="mr-2 size-3.5 text-muted-foreground" />Export PDF</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 size-3.5" />Decommission
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Preview>
      </SubSection>

      <SubSection title="Rules">
        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>• Use a DropdownMenu when the menu options are <strong className="text-foreground">discrete actions</strong>. Use a Popover for forms or richer content.</li>
          <li>• Items always have a leading icon — except in tight pick-lists where the label alone is sufficient.</li>
          <li>• Destructive items use <Code>className="text-destructive focus:text-destructive"</Code> and sit at the bottom after a <Code>Separator</Code>.</li>
          <li>• Set <Code>align="end"</Code> on the content when the trigger is on the right edge of its container.</li>
        </ul>
      </SubSection>

      <SubSection title="Import">
        <div className="rounded-lg border bg-muted/15 px-3 py-2">
          <Code>{`import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"`}</Code>
        </div>
      </SubSection>
    </div>
  )
}
