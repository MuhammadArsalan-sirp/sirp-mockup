import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Code, Preview, SubSection } from "../../showcase"

export function CheckboxPage() {
  const [a, setA] = useState(false)
  const [b, setB] = useState(true)
  return (
    <div className="space-y-10">

      <SubSection title="States" description="Three visual states: unchecked, checked, indeterminate.">
        <Preview>
          <div className="flex items-center gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox checked={a} onCheckedChange={(c) => setA(!!c)} />
              Unchecked
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox checked={b} onCheckedChange={(c) => setB(!!c)} />
              Checked
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox checked="indeterminate" />
              Indeterminate
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground/60">
              <Checkbox disabled />
              Disabled
            </label>
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Bulk select header" description="The indeterminate state is what powers a header checkbox when some-but-not-all rows are selected. Pattern used in artifacts / entities tabs.">
        <Preview>
          <div className="w-full rounded-lg border bg-card">
            <div className="border-b bg-card px-4 py-2.5">
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox checked="indeterminate" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  3 selected
                </span>
              </label>
            </div>
            {[1, 2, 3, 4].map((n) => (
              <label key={n} className="flex cursor-pointer items-center gap-2 border-b px-4 py-2 text-xs last:border-b-0">
                <Checkbox checked={n <= 3} />
                Row {n}
              </label>
            ))}
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Rules">
        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>• Wrap with a <Code>{`<label>`}</Code> so the entire row is clickable.</li>
          <li>• Use the indeterminate state when a parent represents a partial selection.</li>
          <li>• For yes/no toggles in settings/preferences, prefer <Code>Switch</Code> over Checkbox.</li>
        </ul>
      </SubSection>

      <SubSection title="Import">
        <div className="rounded-lg border bg-muted/15 px-3 py-2">
          <Code>{`import { Checkbox } from "@/components/ui/checkbox"`}</Code>
        </div>
      </SubSection>
    </div>
  )
}
