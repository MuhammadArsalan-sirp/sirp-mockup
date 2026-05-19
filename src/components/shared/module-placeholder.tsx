import type { LucideIcon } from "lucide-react"
import { PageHeader } from "./page-header"

type Props = {
  title: string
  description: string
  icon: LucideIcon
  note?: string
}

export function ModulePlaceholder({ title, description, icon: Icon, note }: Props) {
  return (
    <div className="space-y-5">
      <PageHeader title={title} description={description} />
      <div className="grid place-items-center rounded-xl border bg-card p-16 text-center">
        <div className="max-w-md space-y-3">
          <div className="mx-auto grid size-12 place-items-center rounded-xl bg-primary/15 text-primary">
            <Icon className="size-6" />
          </div>
          <div className="text-sm text-muted-foreground">
            {note ??
              "Module skeleton — full UI ports from the existing v2 module during the 1-month migration sprint."}
          </div>
        </div>
      </div>
    </div>
  )
}
