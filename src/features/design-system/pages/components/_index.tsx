import { Link } from "react-router"
import { ArrowRight } from "lucide-react"
import { NAV_GROUPS } from "../../nav-config"
import { SubSection } from "../../showcase"

export function ComponentsIndexPage() {
  const componentsGroup = NAV_GROUPS.find((g) => g.label === "Components")
  // Skip the index itself.
  const items = (componentsGroup?.items ?? []).filter((i) => i.slug !== "components")

  return (
    <div className="space-y-10">
      <SubSection
        title="Primitives index"
        description="Every shadcn-derived component used across the app. Click in to see variants, examples, and rules."
      >
        <ul className="grid gap-2 sm:grid-cols-2">
          {items.map((item) => (
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
      </SubSection>
    </div>
  )
}
