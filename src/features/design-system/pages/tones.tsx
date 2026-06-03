import { Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { TONE, TONES, TONE_LABEL, TONE_DESCRIPTION } from "@/lib/tone"
import { SubSection, TokenRow, Code } from "../showcase"

export function TonesPage() {
  return (
    <div className="space-y-10">
      <SubSection
        title="The five tones"
        description="Same content rendered in every tone, so you can see what each tone communicates at a glance."
      >
        <div className="overflow-hidden rounded-lg border">
          <div className="grid grid-cols-5 border-b bg-muted/30 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {TONES.map((tone) => (
              <div key={tone} className="border-r px-3 py-2 last:border-r-0">{TONE_LABEL[tone]}</div>
            ))}
          </div>
          <div className="grid grid-cols-5 divide-x">
            {TONES.map((tone) => {
              const t = TONE[tone]
              return (
                <div key={tone} className="space-y-3 px-3 py-4">
                  <div className="flex items-center gap-2">
                    <div className={cn("grid size-8 place-items-center rounded-lg border", t.iconBox)}>
                      <Shield className="size-4" />
                    </div>
                    <Code>iconBox</Code>
                  </div>
                  <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", t.chip)}>
                    <span className={cn("size-1.5 rounded-full", t.dot)} />
                    Chip
                  </span>
                  <div className={cn("text-xs font-semibold uppercase tracking-wider", t.text)}>Tone text</div>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Bar</div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted/40">
                      <div className={cn("h-full w-2/3 rounded-full", t.bar)} />
                    </div>
                  </div>
                  <div className={cn("rounded border px-2 py-1.5 text-[10px]", t.bg)}>
                    Tinted bg
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

      <SubSection title="Domain mappings" description="How domain values map to tones. Use these mappings; don't invent new ones.">
        <div className="grid gap-3 sm:grid-cols-2">
          <MappingCard
            title="Severity"
            rows={[
              ["critical", "alert", TONE.alert.dot],
              ["high",     "warn",  TONE.warn.dot],
              ["medium",   "info",  TONE.info.dot],
              ["low",      "muted", TONE.muted.dot],
            ]}
          />
          <MappingCard
            title="Verdict / enrichment status"
            rows={[
              ["malicious",  "alert", TONE.alert.dot],
              ["suspicious", "warn",  TONE.warn.dot],
              ["clean",      "ok",    TONE.ok.dot],
              ["unknown",    "muted", TONE.muted.dot],
            ]}
          />
          <MappingCard
            title="SLA"
            rows={[
              ["breach",   "alert", TONE.alert.dot],
              ["warn",     "warn",  TONE.warn.dot],
              ["ok / met", "(no chip rendered)", ""],
            ]}
          />
          <MappingCard
            title="Agent / task status"
            rows={[
              ["done",    "info",  TONE.info.dot],
              ["running", "warn",  TONE.warn.dot],
              ["queued",  "muted", TONE.muted.dot],
              ["failed",  "alert", TONE.alert.dot],
            ]}
          />
        </div>
      </SubSection>
    </div>
  )
}

function MappingCard({ title, rows }: { title: string; rows: [string, string, string][] }) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="px-3 py-2">
        {rows.map(([label, target, dotCls]) => (
          <TokenRow
            key={label}
            label={label}
            value={`→ ${target}`}
            preview={dotCls ? <span className={cn("size-2 rounded-full", dotCls)} /> : undefined}
          />
        ))}
      </div>
    </div>
  )
}
