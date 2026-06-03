import { Card, CardContent } from "@/components/ui/card"
import { Code, DoCard, DontCard, Preview, SubSection } from "../../showcase"

export function CardPage() {
  return (
    <div className="space-y-10">

      <SubSection title="Standard" description={<>
        The default. Card has <Code>py-4</Code> built in — set horizontal padding on CardContent only.
      </>}>
        <Preview code={`<Card className="overflow-hidden">\n  <CardContent className="px-5">\n    <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Label</div>\n    <p className="mt-2 text-sm">…body…</p>\n  </CardContent>\n</Card>`}>
          <Card className="w-full overflow-hidden">
            <CardContent className="px-5">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Section label</div>
              <p className="mt-2 text-sm">Card body content. The card has <Code>py-4</Code> built in; you only set <Code>px-5</Code>.</p>
            </CardContent>
          </Card>
        </Preview>
      </SubSection>

      <SubSection title="Hero (ringed)" description="For focal cards like the OmniSense verdict surface.">
        <Preview>
          <Card className="w-full overflow-hidden ring-1 ring-primary/20">
            <CardContent className="p-0">
              <div className="border-b bg-primary/5 px-5 py-3">
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">OmniSense verdict</div>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm">Use <Code>ring-1 ring-primary/20</Code> + a tinted header strip for hero cards.</p>
              </div>
            </CardContent>
          </Card>
        </Preview>
      </SubSection>

      <SubSection title="Multi-row (zero padding)" description="When you need multiple sub-rows with their own padding (header card, master/detail dossier header), use p-0 on CardContent and let each child row set its own padding.">
        <Preview>
          <Card className="w-full overflow-hidden">
            <CardContent className="p-0">
              <div className="px-5 py-3 border-b">
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Row 1</div>
                <p className="mt-1 text-sm">Each row sets its own padding.</p>
              </div>
              <div className="px-5 py-3 border-b bg-muted/15">
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Row 2 — tinted</div>
              </div>
              <div className="px-5 py-3">
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Row 3</div>
              </div>
            </CardContent>
          </Card>
        </Preview>
      </SubSection>

      <SubSection title="Gradient grid utility" description={<>
        Wrap a grid with the gradient utility to give all child Cards a subtle primary tint.
      </>}>
        <Preview code="*:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card">
          <div className="grid w-full grid-cols-3 gap-3 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="overflow-hidden">
                <CardContent className="px-4">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Card {n}</div>
                  <div className="mt-1 font-medium text-xl tabular-nums">{n * 12}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Do & Don't">
        <div className="grid gap-3 sm:grid-cols-2">
          <DoCard><Code>{`<Card>`}</Code> + <Code>{`<CardContent className="px-5">`}</Code>.</DoCard>
          <DontCard>Adding <Code>py-*</Code> to CardContent — you'll double the vertical padding.</DontCard>
          <DoCard>Use <Code>p-0</Code> when the card has multiple rows with borders or backgrounds.</DoCard>
          <DontCard>Custom hex shadows or rounded radii — use the default Card class.</DontCard>
        </div>
      </SubSection>

      <SubSection title="Import">
        <div className="rounded-lg border bg-muted/15 px-3 py-2">
          <Code>{`import { Card, CardContent } from "@/components/ui/card"`}</Code>
        </div>
      </SubSection>
    </div>
  )
}
