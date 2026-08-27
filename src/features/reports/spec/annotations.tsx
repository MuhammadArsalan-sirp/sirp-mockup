import { useSearchParams } from "react-router"
import { NotebookPen, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { BACKING_LABEL, specEntries, type Backing } from "./spec-data"

const TONE: Record<Backing, string> = {
  backed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  partial: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  none: "border-destructive/30 bg-destructive/10 text-destructive",
}

/** Notes are off by default and turn on with ?notes=1 — the demo stays clean. */
export function useNotesEnabled() {
  const [params] = useSearchParams()
  return params.get("notes") === "1"
}

/**
 * A pin an engineer can click during design signoff: what backs this surface,
 * and what has to be built. Invisible unless notes are on, so the same build
 * serves both the walkthrough and the review.
 */
export function Annotate({ id, className }: { id: string; className?: string }) {
  const enabled = useNotesEnabled()
  const entry = specEntries.find((e) => e.id === id)
  if (!enabled || !entry) return null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex size-4.5 shrink-0 items-center justify-center rounded-full border align-middle transition-transform hover:scale-110",
            TONE[entry.backing],
            className
          )}
          aria-label={`Porting note: ${entry.surface}`}
        >
          <NotebookPen className="size-2.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0">
        <div className="border-b px-3.5 py-2.5">
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{entry.screen}</div>
          <div className="mt-0.5 text-sm font-semibold">{entry.surface}</div>
        </div>
        <div className="space-y-2 px-3.5 py-2.5">
          <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium", TONE[entry.backing])}>
            {BACKING_LABEL[entry.backing]}
          </span>
          {entry.endpoint && (
            <code className="block rounded-md border bg-muted/60 px-2 py-1.5 font-mono text-[11px] break-words">{entry.endpoint}</code>
          )}
          <p className="text-xs leading-relaxed text-muted-foreground">{entry.note}</p>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** Floating switch so a reviewer can flip annotations on mid-walkthrough. */
export function NotesToggle() {
  const [params, setParams] = useSearchParams()
  const enabled = params.get("notes") === "1"

  function toggle() {
    const next = new URLSearchParams(params)
    if (enabled) next.delete("notes")
    else next.set("notes", "1")
    setParams(next, { replace: true })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "fixed right-5 bottom-5 z-40 flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium shadow-lg transition-colors",
        enabled ? "border-primary/40 bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
      )}
    >
      {enabled ? <X className="size-3.5" /> : <NotebookPen className="size-3.5" />}
      {enabled ? "Hide porting notes" : "Porting notes"}
    </button>
  )
}
