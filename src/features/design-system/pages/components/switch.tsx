import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Code, Preview, SubSection } from "../../showcase"

export function SwitchPage() {
  const [a, setA] = useState(true)
  return (
    <div className="space-y-10">

      <SubSection title="Default" description="On/off toggle. Used for preferences and settings, not for form submission state.">
        <Preview>
          <div className="flex items-center gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Switch checked={a} onCheckedChange={setA} />
              Email notifications
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Switch />
              Slack integration
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground/60">
              <Switch disabled />
              Disabled
            </label>
          </div>
        </Preview>
      </SubSection>

      <SubSection title="In a row" description="When listing many preferences, pair the switch with a label + helper text on each row.">
        <Preview>
          <div className="w-full divide-y rounded-lg border bg-card">
            {[
              { title: "Auto-run enrichment", help: "Run VirusTotal + AbuseIPDB on new artifacts." },
              { title: "Notify on breach",    help: "Email when an incident SLA breaches." },
              { title: "Autonomous mode",     help: "Allow OmniSense to execute approved actions without confirmation." },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.help}</div>
                </div>
                <Switch />
              </div>
            ))}
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Switch vs Checkbox">
        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>• <strong className="text-foreground">Switch:</strong> setting that takes effect immediately (preferences, integrations on/off).</li>
          <li>• <strong className="text-foreground">Checkbox:</strong> selection that takes effect on form submit (multi-select rows, filter options).</li>
        </ul>
      </SubSection>

      <SubSection title="Import">
        <div className="rounded-lg border bg-muted/15 px-3 py-2">
          <Code>{`import { Switch } from "@/components/ui/switch"`}</Code>
        </div>
      </SubSection>
    </div>
  )
}
