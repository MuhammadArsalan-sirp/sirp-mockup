import { Check, ChevronDown, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Code, Preview, SubSection } from "../../showcase"

export function PopoverPage() {
  return (
    <div className="space-y-10">

      <SubSection title="Default" description="Click a trigger to reveal a small floating panel.">
        <Preview>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5">Open<ChevronDown className="size-3 opacity-60" /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3 text-sm">
              <p className="text-xs text-muted-foreground">Popovers can contain any content — forms, menus, info panels.</p>
            </PopoverContent>
          </Popover>
        </Preview>
      </SubSection>

      <SubSection title="Stage popover pattern" description="Used in the detail-page header to replace the inline workflow stepper.">
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

      <SubSection title="Filter popover pattern" description="Active-count badge on the trigger. Used in Artifacts / Entities filter UIs.">
        <Preview>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 gap-1.5 px-3 text-xs">
                <Filter className="size-3" />
                Filters
                <span className="ml-1 inline-flex size-4 items-center justify-center rounded-full bg-primary font-mono text-[9px] font-bold text-primary-foreground">
                  2
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-0">
              <div className="border-b px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Filters</span>
                  <button className="text-[10px] font-medium text-primary hover:underline">Clear all</button>
                </div>
              </div>
              <div className="px-3 py-2.5">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Verdict</div>
                <div className="space-y-1">
                  {[
                    { label: "Malicious",  checked: true,  count: 7 },
                    { label: "Suspicious", checked: true,  count: 2 },
                    { label: "Clean",      checked: false, count: 1 },
                    { label: "Unknown",    checked: false, count: 2 },
                  ].map((v) => (
                    <label key={v.label} className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 hover:bg-muted/40">
                      <Checkbox checked={v.checked} className="size-3.5" />
                      <span className="flex-1 text-xs">{v.label}</span>
                      <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">{v.count}</span>
                    </label>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </Preview>
      </SubSection>

      <SubSection title="Rules">
        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>• <strong className="text-foreground">Popovers can take any layout.</strong> Filter checklists, mini steppers, info panels — anything that doesn't fit inline.</li>
          <li>• Use <Code>align="end"</Code> when the trigger is on the right edge of a row.</li>
          <li>• For dropdown-style action menus, prefer <Code>DropdownMenu</Code> (next page) over Popover.</li>
          <li>• Default padding is <Code>p-3</Code>. Use <Code>p-0</Code> when the content has its own multi-section structure with borders.</li>
        </ul>
      </SubSection>

      <SubSection title="Import">
        <div className="rounded-lg border bg-muted/15 px-3 py-2">
          <Code>{`import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"`}</Code>
        </div>
      </SubSection>
    </div>
  )
}
