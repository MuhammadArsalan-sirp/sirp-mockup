import { cn } from "@/lib/utils"
import { Code, DoCard, DontCard, SubSection } from "../showcase"

export function SpacingPage() {
  return (
    <div className="space-y-10">
      <SubSection title="Gap rhythm" description="Almost everything is one of these. Pick the smallest gap that still reads.">
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

      <SubSection title="Card padding rule">
        <div className="grid gap-3 sm:grid-cols-2">
          <DoCard>
            <Code>{`<Card>`}</Code> + <Code>{`<CardContent className="px-5">`}</Code> — relies on the built-in vertical padding.
          </DoCard>
          <DontCard>
            Don't add <Code>py-*</Code> to CardContent. You'll get 32px vertical padding instead of 16px.
          </DontCard>
        </div>
      </SubSection>

      <SubSection title="Border radii">
        <div className="flex flex-wrap items-end gap-5">
          {[
            { name: "rounded",     cls: "rounded",     note: "calc(--radius - 4px)" },
            { name: "rounded-md",  cls: "rounded-md",  note: "calc(--radius - 2px)" },
            { name: "rounded-lg",  cls: "rounded-lg",  note: "var(--radius) ≈ 10px" },
            { name: "rounded-xl",  cls: "rounded-xl",  note: "calc(--radius + 4px)" },
            { name: "rounded-2xl", cls: "rounded-2xl", note: "calc(--radius + 8px)" },
            { name: "rounded-full",cls: "rounded-full",note: "9999px (pills, dots)" },
          ].map((r) => (
            <div key={r.name} className="space-y-1.5">
              <div className={cn("size-16 border bg-primary/10", r.cls)} />
              <div className="text-center">
                <div className="font-mono text-[10px] text-foreground/85">{r.name}</div>
                <div className="font-mono text-[9px] text-muted-foreground/60">{r.note}</div>
              </div>
            </div>
          ))}
        </div>
      </SubSection>
    </div>
  )
}
