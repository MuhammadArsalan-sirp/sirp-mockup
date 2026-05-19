import type { ReactNode } from "react"

type Props = {
  label: string
  description?: string
  children: ReactNode
}

/** A labelled row in the preferences popover. */
export function PreferencesSection({ label, description, children }: Props) {
  return (
    <div className="space-y-1.5">
      <div>
        <div className="text-xs font-medium">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground">{description}</div>
        )}
      </div>
      {children}
    </div>
  )
}
