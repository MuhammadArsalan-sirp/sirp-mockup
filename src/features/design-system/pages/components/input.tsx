import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Code, Preview, SubSection } from "../../showcase"

export function InputPage() {
  return (
    <div className="space-y-10">

      <SubSection title="Default" description="Standard text input. Use the shadcn Input directly.">
        <Preview>
          <Input placeholder="Enter your name…" className="max-w-xs" />
        </Preview>
      </SubSection>

      <SubSection title="Search input pattern" description="A wrapping div with focus-within ring is the SIRP-standard search input.">
        <Preview code={`<div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 transition focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20">\n  <Search className="size-3.5 shrink-0 text-muted-foreground/50" />\n  <input className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/40" />\n</div>`}>
          <div className="flex w-full items-center gap-2 rounded-lg border bg-background px-3 py-1.5 transition focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20">
            <Search className="size-3.5 shrink-0 text-muted-foreground/50" />
            <input
              type="text"
              placeholder="Search by value (IP, hash, domain, URL, email)…"
              className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/40"
            />
            <button className="text-muted-foreground/50 hover:text-foreground"><X className="size-3" /></button>
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Composer input pattern" description="Used in the comments composer — pinned-bottom row with avatar + input + send button.">
        <Preview>
          <div className="flex w-full items-center gap-2 rounded-md border bg-muted/15 px-3 py-2 transition focus-within:bg-muted/25">
            <div className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground/70">?</div>
            <input
              type="text"
              placeholder="Add a comment…"
              className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/40"
            />
            <button className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary">Send</button>
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Rules">
        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>• Use the shadcn <Code>{`<Input />`}</Code> for form fields; use the wrapping-div pattern for search and composer affordances.</li>
          <li>• Placeholder color is <Code>text-muted-foreground/40</Code> (or /50). Never full muted-foreground — placeholders should feel quieter than disabled text.</li>
          <li>• Focus-within ring uses <Code>ring-primary/20</Code> + a slightly bolder border. Matches the rest of the form chemistry.</li>
        </ul>
      </SubSection>

      <SubSection title="Import">
        <div className="rounded-lg border bg-muted/15 px-3 py-2">
          <Code>{`import { Input } from "@/components/ui/input"`}</Code>
        </div>
      </SubSection>
    </div>
  )
}
