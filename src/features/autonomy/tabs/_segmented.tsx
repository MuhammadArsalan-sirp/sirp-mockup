import { cn } from "@/lib/utils"

type Option<K extends string> = { key: K; label: string; count?: number }

export function Segmented<K extends string>({
  value,
  onChange,
  options,
}: {
  value: K
  onChange: (k: K) => void
  options: Option<K>[]
}) {
  return (
    <div className="inline-flex items-center rounded-lg border bg-card p-1">
      {options.map((opt) => {
        const isActive = value === opt.key
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-secondary text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span
                className={cn(
                  "inline-flex h-[18px] min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums",
                  isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
