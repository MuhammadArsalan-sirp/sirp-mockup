import type { ComponentType } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type ScopePickerOption<V extends string = string> = {
  value: V
  label: string
  count: number
  icon?: ComponentType<{ className?: string }>
  /** Optional one-line description shown under the label in the dropdown. */
  description?: string
}

type Props<V extends string> = {
  value: V
  onChange: (value: V) => void
  options: readonly ScopePickerOption<V>[]
  /** Optional leading label to clarify the control (e.g., "Scope", "View"). */
  label?: string
  /** Trigger menu width — defaults to fit content. */
  className?: string
}

/**
 * Scope/Context picker — a single dropdown trigger that switches the table's
 * primary scope. Used wherever a list view needs to partition by record type,
 * status group, or any other "lens" the user opens the page through.
 *
 * Why a dropdown rather than tabs/chips/segments:
 *  - Compact: one button regardless of option count (3 or 30)
 *  - Universal: same pattern can host counts, descriptions, icons cleanly
 *  - Doesn't compete visually with KPI cards or the toolbar
 *  - The dropdown panel is a richer surface than a chip — room for
 *    descriptions, counts, and the "currently selected" affordance
 *
 * Reused across every list module in SIRP (incidents, threat intel,
 * entities, autonomy, administration users, etc.).
 */
export function ScopePicker<V extends string>({
  value,
  onChange,
  options,
  label = "Scope",
  className,
}: Props<V>) {
  const active = options.find((o) => o.value === value) ?? options[0]
  const ActiveIcon = active.icon

  return (
    <div className="inline-flex items-center gap-2">
      {label && (
        <span className="text-sm text-muted-foreground">{label}</span>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-9 gap-2 px-3 text-sm font-normal",
              "hover:bg-accent/60",
              className
            )}
          >
            {ActiveIcon && (
              <ActiveIcon className="size-4 text-muted-foreground" />
            )}
            <span className="font-medium text-foreground">{active.label}</span>
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
              {active.count.toLocaleString()}
            </span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72 p-1">
          <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Switch {label.toLowerCase()}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {options.map((opt) => {
            const Icon = opt.icon
            const isActive = opt.value === value
            return (
              <DropdownMenuItem
                key={opt.value}
                onSelect={() => onChange(opt.value)}
                className={cn(
                  "gap-3 rounded-md px-2 py-2",
                  isActive && "bg-accent/60"
                )}
              >
                {Icon && (
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-md transition-colors",
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="size-3.5" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-sm">
                    <span
                      className={cn(
                        isActive ? "font-medium text-foreground" : ""
                      )}
                    >
                      {opt.label}
                    </span>
                    {isActive && (
                      <Check className="size-3 text-primary" aria-hidden />
                    )}
                  </div>
                  {opt.description && (
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      {opt.description}
                    </div>
                  )}
                </div>
                <span
                  className={cn(
                    "shrink-0 font-mono text-xs tabular-nums",
                    isActive
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {opt.count.toLocaleString()}
                </span>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
