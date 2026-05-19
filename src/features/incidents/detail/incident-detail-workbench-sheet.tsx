import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  incidentId: string
}

export function IncidentDetailWorkbenchSheet({
  open,
  onOpenChange,
  incidentId,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col border-l bg-background/95 backdrop-blur-sm sm:max-w-xl md:max-w-2xl">
        <SheetHeader className="space-y-1 border-b pb-4 text-left">
          <SheetTitle className="text-xl">Workbench</SheetTitle>
          <SheetDescription className="text-pretty leading-relaxed">
            Queries, pinned searches, and OmniMap — full-width tools without
            compressing the incident narrative.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 flex flex-1 flex-col gap-4 rounded-2xl border border-dashed border-primary/20 bg-muted/20 p-6 text-sm text-muted-foreground">
          <p>
            Mock workspace. Incident{" "}
            <span className="font-mono text-foreground">{incidentId}</span> is bound as
            context for SPL / KQL and graph widgets.
          </p>
          <Button type="button" variant="secondary" size="sm" className="w-fit rounded-lg">
            New pinned query
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
