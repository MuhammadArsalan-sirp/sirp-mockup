import { Code, SubSection } from "../showcase"

export function TypographyPage() {
  return (
    <div className="space-y-10">
      <SubSection title="Scale" description="Every type style used across the app.">
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
        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>• Card section labels are <strong className="text-foreground">always</strong> <Code>text-[11px] font-medium uppercase tracking-wider text-muted-foreground</Code></li>
          <li>• KPI values are <Code>font-medium text-2xl tabular-nums</Code> — never <Code>font-bold</Code></li>
          <li>• Numeric counts use <Code>font-mono tabular-nums</Code> so columns align</li>
          <li>• IDs (incident, entity, etc.) always use <Code>font-mono</Code></li>
          <li>• Avoid <Code>text-[XXpx]</Code> when a canonical Tailwind class exists</li>
          <li>• Body color is either <Code>text-foreground</Code> or <Code>text-muted-foreground</Code>. No other neutrals.</li>
        </ul>
      </SubSection>
    </div>
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
