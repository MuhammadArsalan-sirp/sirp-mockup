import { Code, DoCard, DontCard, SubSection } from "../showcase"

export function RulesPage() {
  return (
    <div className="space-y-10">

      <SubSection title="Color & tone">
        <div className="grid gap-3 sm:grid-cols-2">
          <DoCard>One bold color signal per zone. Verdict callout is coloured; everything around it stays muted.</DoCard>
          <DontCard>Multiple competing coloured elements in the same card. The eye doesn't know where to look.</DontCard>
          <DoCard>Use the 5-tone palette (<Code>TONE</Code>) for every tone-coloured UI.</DoCard>
          <DontCard>One-off hex colours or per-type colour palettes. The artifacts tab once had 12 — we deleted them all.</DontCard>
        </div>
      </SubSection>

      <SubSection title="Cards & padding">
        <div className="grid gap-3 sm:grid-cols-2">
          <DoCard><Code>{`<Card>`}</Code> + <Code>{`<CardContent className="px-5">`}</Code>. Card has <Code>py-4</Code> built in.</DoCard>
          <DontCard>Adding <Code>py-*</Code> to CardContent — you'll double the vertical padding (32px instead of 16px).</DontCard>
        </div>
      </SubSection>

      <SubSection title="Tailwind v4 canonical names">
        <div className="grid gap-3 sm:grid-cols-2">
          <DoCard><Code>min-w-275</Code>, <Code>bg-(--var)</Code>, <Code>bg-linear-to-br</Code>, <Code>size-7</Code></DoCard>
          <DontCard><Code>min-w-[1100px]</Code>, <Code>bg-[var(--…)]</Code>, <Code>bg-gradient-to-br</Code> (v3 syntax)</DontCard>
        </div>
      </SubSection>

      <SubSection title="Brand vocabulary">
        <div className="grid gap-3 sm:grid-cols-2">
          <DoCard>"Co-Analyst" · "OmniSense" · "the platform"</DoCard>
          <DontCard>"Copilot" · "the AI" · "Claude" · "the LLM" · "the assistant"</DontCard>
        </div>
      </SubSection>

      <SubSection title="Avatars">
        <div className="grid gap-3 sm:grid-cols-2">
          <DoCard>Unsplash headshots via <Code>users.ts</Code> with a gradient fallback.</DoCard>
          <DontCard>pravatar, dicebear, or randomuser — we landed on Unsplash because we wanted <em>professional</em> portraits.</DontCard>
        </div>
      </SubSection>

      <SubSection title="Mock data">
        <div className="grid gap-3 sm:grid-cols-2">
          <DoCard>Fake but plausible data in <Code>src/data/*</Code> and <Code>*-mock.ts</Code>.</DoCard>
          <DontCard>Real customer data, IOCs, tenant IDs, or credentials — even as "examples". This is a brand-visible mockup.</DontCard>
        </div>
      </SubSection>

      <SubSection title="Tone imports">
        <div className="grid gap-3 sm:grid-cols-2">
          <DoCard><Code>import {`{ TONE, type Tone }`} from "@/lib/tone"</Code> — one canonical home.</DoCard>
          <DontCard>Re-declaring the TONE record inline in every panel. We had 5 copies before the audit; now there's only one.</DontCard>
        </div>
      </SubSection>
    </div>
  )
}
