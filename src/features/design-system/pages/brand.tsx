import { SourceIcon } from "@/features/incidents/list/source-icon"
import { Code, SubSection } from "../showcase"

const SOURCES = ["OmniSense", "CrowdStrike", "Splunk", "Sentinel", "Proofpoint", "AWS GuardDuty", "Triage Agent"]

export function BrandPage() {
  return (
    <div className="space-y-10">
      <SubSection
        title="Source vendor badges"
        description="Landscape 3:2 brand badges. Lucide for SIRP-internal services, simple-icons SVG for Splunk, custom inline marks for everything else."
      >
        <div className="space-y-3">
          {[22, 28, 30, 44].map((size) => (
            <div key={size} className="overflow-hidden rounded-lg border bg-card">
              <div className="flex items-center gap-2 border-b bg-muted/15 px-3 py-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">size = {size}</span>
                <span className="text-[10px] text-muted-foreground/50">·</span>
                <Code>iconOnly</Code>
              </div>
              <div className="flex flex-wrap items-center gap-4 px-5 py-4">
                {SOURCES.map((s) => (
                  <SourceIcon key={s} source={s} size={size} iconOnly />
                ))}
              </div>
            </div>
          ))}
          <div className="overflow-hidden rounded-lg border bg-card">
            <div className="flex items-center gap-2 border-b bg-muted/15 px-3 py-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">size = 44</span>
              <span className="text-[10px] text-muted-foreground/50">·</span>
              <Code>icon + name</Code>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
              {SOURCES.map((s) => <SourceIcon key={s} source={s} size={44} />)}
            </div>
          </div>
        </div>
      </SubSection>

      <SubSection title="Usage">
        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>• Page header (sticky): <Code>size=30 iconOnly</Code> with a Tooltip showing the source name</li>
          <li>• Overview card hero: <Code>size=44</Code> (icon + name)</li>
          <li>• Inline list rows / dropdowns: <Code>size=22–28 iconOnly</Code></li>
          <li>• Never wrap a SourceIcon in a bordered/bg bubble — the brand <strong className="text-foreground">is</strong> the badge.</li>
          <li>• To add a new vendor: edit <Code>src/features/incidents/list/source-icon.tsx</Code> and register the brand mark.</li>
        </ul>
      </SubSection>
    </div>
  )
}
