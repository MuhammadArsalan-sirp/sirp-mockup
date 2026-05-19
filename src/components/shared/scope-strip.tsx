import type { ComponentType } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export type ScopeOption<V extends string = string> = {
  value: V
  label: string
  count: number
  icon?: ComponentType<{ className?: string }>
}

type Props<V extends string> = {
  value: V
  onChange: (value: V) => void
  options: readonly ScopeOption<V>[]
  /** Optional aria-label for the radiogroup. */
  label?: string
  className?: string
}

/**
 * Scope strip — the canonical SIRP pattern for "which slice of the table
 * am I looking at" controls (record type, status group, view, etc.).
 *
 * Design rationale:
 *  - Reads as one connected data band, not five tabs/chips. Single border
 *    around the whole, vertical dividers between segments.
 *  - The COUNT is the primary visual (large, tabular). Label is secondary.
 *    Analysts scan workload, not labels.
 *  - Active state is communicated three ways without any fill or shadow:
 *      • foreground text colour
 *      • primary-tinted icon
 *      • a small primary check indicator
 *    No "tab feel", no "button feel" — it's a data strip with one cell
 *    marked as the current lens.
 *  - Equal-width segments (flex-1) so the strip lays out predictably
 *    regardless of how many options each module has.
 *
 * Used in: incidents list, threat intel list, entities list, autonomy
 * runs list, etc. Single source of truth for scope selection across SIRP.
 */
export function ScopeStrip<V extends string>({
  value,
  onChange,
  options,
  label = "Filter scope",
  className,
}: Props<V>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "flex items-stretch divide-x divide-border overflow-hidden rounded-lg border bg-card",
        className
      )}
    >
      {options.map((opt) => {
        const Icon = opt.icon
        const isActive = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.value)}
            className={cn(
              "group relative flex flex-1 items-center gap-3 px-4 py-3 text-left transition-colors",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset",
              isActive
                ? "bg-primary/[0.04]"
                : "hover:bg-accent/40"
            )}
          >
            {Icon && (
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-md transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground group-hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "text-xs",
                    isActive
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {opt.label}
                </span>
                {isActive && (
                  <Check
                    className="size-3 text-primary"
                    aria-label="selected"
                  />
                )}
              </div>
              <div
                className={cn(
                  "font-mono text-xl font-semibold tabular-nums leading-tight tracking-tight",
                  isActive ? "text-foreground" : "text-foreground/70"
                )}
              >
                {opt.count.toLocaleString()}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
