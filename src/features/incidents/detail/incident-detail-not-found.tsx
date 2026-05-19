import { Link } from "react-router"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = { id: string }

export function IncidentDetailNotFound({ id }: Props) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border bg-card px-8 py-16 text-center shadow-sm">
      <p className="text-lg font-semibold tracking-tight">Incident not found</p>
      <p className="mt-2 text-sm text-muted-foreground">
        No mock record for <span className="font-mono text-foreground">{id}</span>
      </p>
      <Button variant="default" className="mt-6 rounded-xl" asChild>
        <Link to="/incidents">
          <ArrowLeft className="mr-2 size-4" />
          Back to incidents
        </Link>
      </Button>
    </div>
  )
}
