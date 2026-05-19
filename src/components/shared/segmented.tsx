import { cn } from "@/lib/utils"

type Option<T extends string> = {
  value: T
  label: string
}

type Props<T extends string> = {
  value: T
  onChange: (value: T) => void
  options: readonly Option<T>[]
  className?: string
}

/**
 * Segmented control. Pill row with one selected segment.
 * Used in the Preferences popover for theme mode, page layout, etc.
 */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: Props<T>) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md bg-muted p-0.5 w-full",
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 h-7 px-2.5 rounded-sm text-xs font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
