import { SubSection, ColorSwatch } from "../showcase"

export function ColorsPage() {
  return (
    <div className="space-y-10">
      <SubSection title="Brand" description="SIRPurple is the only brand color. It carries primary CTAs, focus rings, and the info tone.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <ColorSwatch name="Primary"            value="var(--primary)"            css="--primary · #8e2dff" />
          <ColorSwatch name="Primary foreground" value="var(--primary-foreground)" css="--primary-foreground" />
          <ColorSwatch name="Ring"               value="var(--ring)"               css="--ring (focus)" />
          <ColorSwatch name="Chart 4"            value="var(--chart-4)"            css="--chart-4 (gradients)" />
        </div>
      </SubSection>

      <SubSection title="Semantic" description="Brand-independent meaning. These map to the tone palette on the next page.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <ColorSwatch name="Destructive" value="var(--destructive)" css="--destructive · alert tone" />
          <ColorSwatch name="Attention"   value="var(--attention)"   css="--attention" />
          <ColorSwatch name="Warning"     value="var(--warning)"     css="--warning · warn tone" />
          <ColorSwatch name="Success"     value="var(--success)"     css="--success · ok tone" />
          <ColorSwatch name="Info"        value="var(--info)"        css="--info" />
        </div>
      </SubSection>

      <SubSection title="Surfaces" description="Page chrome. Card and popover share a token so elevation reads consistently.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <ColorSwatch name="Background"  value="var(--background)"  css="--background" />
          <ColorSwatch name="Card"        value="var(--card)"        css="--card" />
          <ColorSwatch name="Popover"     value="var(--popover)"     css="--popover" />
          <ColorSwatch name="Muted"       value="var(--muted)"       css="--muted (subtle bg)" />
          <ColorSwatch name="Border"      value="var(--border)"      css="--border" />
          <ColorSwatch name="Sidebar"     value="var(--sidebar)"     css="--sidebar" />
          <ColorSwatch name="Foreground"  value="var(--foreground)"  css="--foreground" />
          <ColorSwatch name="Muted FG"    value="var(--muted-foreground)" css="--muted-foreground" />
        </div>
      </SubSection>

      <SubSection title="Charts" description="Brand-tinted ramp for data viz. Always use these tokens — never raw hex in charts.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {[1, 2, 3, 4, 5].map((n) => (
            <ColorSwatch key={n} name={`Chart ${n}`} value={`var(--chart-${n})`} css={`--chart-${n}`} />
          ))}
        </div>
      </SubSection>
    </div>
  )
}
