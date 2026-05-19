import type { ReactNode } from "react"

type Props = {
  title: string
  description?: ReactNode
  center?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ title, description, center, actions }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {center && <div className="flex items-center">{center}</div>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
