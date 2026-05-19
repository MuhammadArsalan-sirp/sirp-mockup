import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Incident } from "@/data/incidents"
import { IncidentSaraEmbedded } from "./incident-sara-embedded"

type Props = {
  incident: Incident
  collapsed: boolean
  onToggleCollapsed: () => void
  className?: string
}

export function IncidentSaraDock({
  incident,
  collapsed,
  onToggleCollapsed,
  className,
}: Props) {
  return (
    <aside
      className={cn(
        "relative z-20 flex shrink-0 flex-col border-l bg-card shadow-[inset_1px_0_0_0_hsl(var(--border))]",
        collapsed ? "w-[52px]" : "w-full min-w-0 sm:w-[min(100%,420px)] lg:w-[400px]",
        className
      )}
    >
      {collapsed ? (
        <div className="flex flex-1 flex-col items-center gap-3 py-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 rounded-xl border bg-muted/40 shadow-sm"
            onClick={onToggleCollapsed}
            aria-label="Expand Sara"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="flex flex-1 flex-col items-center gap-2 py-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Expand Sara co-analyst"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-3 text-white shadow-md">
              <Sparkles className="size-4" />
            </span>
            <span
              className="writing-mode-vertical max-h-[200px] text-center leading-tight"
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            >
              Sara
            </span>
          </button>
        </div>
      ) : (
        <>
          <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b bg-muted/30 px-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-chart-3 text-white shadow-sm">
                <Sparkles className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Sara</p>
                <p className="truncate text-[11px] text-muted-foreground">Co-Analyst</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 rounded-lg"
              onClick={onToggleCollapsed}
              aria-label="Collapse Sara panel"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <div className="flex min-h-[min(360px,50vh)] flex-1 flex-col p-2">
            <IncidentSaraEmbedded
              incident={incident}
              className="flex min-h-0 flex-1 flex-col rounded-xl border-0 shadow-none"
            />
          </div>
        </>
      )}
    </aside>
  )
}
