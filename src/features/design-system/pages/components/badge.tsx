import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { TONE, TONES, TONE_LABEL } from "@/lib/tone"
import { Code, Preview, SubSection } from "../../showcase"

export function BadgePage() {
  return (
    <div className="space-y-10">

      <SubSection title="Variants" description="Shadcn Badge variants — used for status tags, ID badges, priorities.">
        <Preview>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Mono ID / priority" description="Wrap IDs and short alphanumeric codes in outline+mono for visual scanning.">
        <Preview>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-[10px]">INC-1247</Badge>
            <Badge variant="outline" className="font-mono text-[10px]">TI-1247</Badge>
            <Badge variant="outline" className="font-mono text-[10px]">ENT-001</Badge>
            <Badge variant="outline" className="font-mono text-xs font-bold">P1</Badge>
            <Badge variant="outline" className="font-mono text-xs font-bold">P4</Badge>
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Tone chip" description={<>
        The signature SIRP pattern. Tone classes come from <Code>TONE[tone].chip</Code> and <Code>TONE[tone].dot</Code>.
      </>}>
        <Preview code={`<span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", TONE[tone].chip)}>\n  <span className={cn("size-1.5 rounded-full", TONE[tone].dot)} />\n  {label}\n</span>`}>
          <div className="flex flex-wrap items-center gap-2">
            {TONES.map((tone) => {
              const t = TONE[tone]
              return (
                <span key={tone} className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  t.chip,
                )}>
                  <span className={cn("size-1.5 rounded-full", t.dot)} />
                  {TONE_LABEL[tone]}
                </span>
              )
            })}
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Count chip" description="Inline counts (e.g., next to a tab name). Use Badge secondary with reduced padding.">
        <Preview>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-sm">
              Artifacts <Badge variant="secondary" className="px-1.5 text-[10px]">12</Badge>
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm">
              Alerts <Badge variant="secondary" className="bg-primary/15 px-1.5 text-[10px] text-primary">4</Badge>
            </span>
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Usage">
        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>• <strong className="text-foreground">Default Badge for static labels.</strong> Outline / secondary for less prominence.</li>
          <li>• <strong className="text-foreground">Use the tone chip pattern</strong> for verdict / severity / status — never invent new chip styles.</li>
          <li>• <strong className="text-foreground">Mono font for IDs / priorities</strong> so columns line up visually.</li>
        </ul>
      </SubSection>

      <SubSection title="Import">
        <div className="rounded-lg border bg-muted/15 px-3 py-2">
          <Code>{`import { Badge } from "@/components/ui/badge"`}</Code>
        </div>
      </SubSection>
    </div>
  )
}
