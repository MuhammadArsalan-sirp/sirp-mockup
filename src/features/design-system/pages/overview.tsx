import { Link } from "react-router"
import { ArrowRight, Layers, Palette, Sparkles, Type } from "lucide-react"
import { Code } from "../showcase"
import { NAV_GROUPS } from "../nav-config"

export function OverviewPage() {
  return (
    <div className="space-y-10">

      {/* Three pillars */}
      <section className="grid gap-3 sm:grid-cols-3">
        <Pillar
          icon={Sparkles}
          title="One principle"
          body={<>
            <strong className="text-foreground">Muted is default. Color is a signal.</strong>{" "}
            Reserve tone for the one element per zone that carries actionable meaning.
          </>}
        />
        <Pillar
          icon={Palette}
          title="Five tones"
          body={<>
            <Code>alert</Code> <Code>warn</Code> <Code>ok</Code> <Code>info</Code> <Code>muted</Code> —
            semantic, not brand colors. Imported from <Code>@/lib/tone</Code>.
          </>}
        />
        <Pillar
          icon={Type}
          title="Section labels"
          body={<>
            One rule, everywhere:{" "}
            <Code>text-[11px] font-medium uppercase tracking-wider text-muted-foreground</Code>.
          </>}
        />
      </section>

      {/* What's in here */}
      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">What's in here</h2>
        <div className="space-y-6">
          {NAV_GROUPS.filter((g) => g.label !== "Get started").map((group) => (
            <div key={group.label}>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-primary/80">
                {group.label}
              </div>
              <ul className="grid gap-2 sm:grid-cols-2">
                {group.items.map((item) => (
                  <li key={item.slug}>
                    <Link
                      to={`/design-system/${item.slug}`}
                      className="group flex items-start justify-between gap-3 rounded-lg border bg-card px-4 py-3 transition hover:border-primary/30 hover:bg-primary/3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold leading-tight">{item.title}</div>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                      </div>
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* How to use */}
      <section className="rounded-lg border bg-muted/15 px-5 py-4">
        <div className="flex items-center gap-2">
          <Layers className="size-3.5 text-muted-foreground" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">How to use this site</span>
        </div>
        <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
          <li>• <strong className="text-foreground">Engineers:</strong> import from <Code>@/lib/tone</Code> and the listed primitives. If you need a new pattern, propose it here first.</li>
          <li>• <strong className="text-foreground">Designers:</strong> this is the spec for Figma. Match what's here; if you want to extend, raise it with the team.</li>
          <li>• <strong className="text-foreground">Both:</strong> if a pattern isn't on this site, it shouldn't be in the codebase.</li>
        </ul>
      </section>
    </div>
  )
}

function Pillar({ icon: Icon, title, body }: {
  icon: typeof Sparkles
  title: string
  body: React.ReactNode
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <div className="grid size-7 place-items-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
          <Icon className="size-3.5" />
        </div>
        <div className="text-sm font-semibold">{title}</div>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{body}</p>
    </div>
  )
}
