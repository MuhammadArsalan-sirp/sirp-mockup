import { useEffect, useRef, useState } from "react"
import { ArrowUp, Check, Minus, Plus, RotateCcw, Sparkles, Undo2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { StudioBlock } from "../studio/report-studio-types"
import { refineFromPrompt } from "./ai-engine"
import type { BlockChange, ChatTurn } from "./ai-types"

const SUGGESTIONS = [
  "Drop the MITRE section and add SLA by team",
  "Make it one page",
  "Re-tone it for the board",
  "Re-scope to last 30 days",
  "Translate the written sections to Arabic",
]

const OP_ICON = {
  add: Plus,
  remove: Minus,
  modify: Sparkles,
  reorder: ArrowUp,
  document: Sparkles,
} as const

const OP_TONE: Record<BlockChange["op"], string> = {
  add: "text-emerald-600 dark:text-emerald-400",
  remove: "text-destructive",
  modify: "text-primary",
  reorder: "text-muted-foreground",
  document: "text-primary",
}

/**
 * The Co-Analyst dock. Nothing it proposes touches the document until a human
 * presses Apply — every turn returns a reviewable diff, and the last applied
 * turn can be undone in one click. That gate is the whole point: conversational
 * editing without it means a report silently drifting from what its author read.
 */
export function CoAnalystDock({
  blocks,
  onApply,
  onUndo,
  canUndo,
  onClose,
}: {
  blocks: StudioBlock[]
  onApply: (changes: BlockChange[]) => void
  onUndo: () => void
  canUndo: boolean
  onClose: () => void
}) {
  const [turns, setTurns] = useState<ChatTurn[]>([
    {
      id: "seed",
      role: "co-analyst",
      text: "I can restructure this report — add or drop sections, re-scope the period, re-tone the writing, or cut it to a page. Every change lands as a diff you approve.",
    },
  ])
  const [input, setInput] = useState("")
  const [thinking, setThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [turns, thinking])

  function send(text: string) {
    const prompt = text.trim()
    if (!prompt || thinking) return
    setInput("")
    setTurns((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text: prompt }])
    setThinking(true)

    // A beat of latency — instant replies read as canned, not considered.
    setTimeout(() => {
      const result = refineFromPrompt(prompt, blocks)
      setTurns((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "co-analyst",
          text: result.reply,
          changes: result.changes.length ? result.changes : undefined,
          status: result.changes.length ? "pending" : undefined,
        },
      ])
      setThinking(false)
    }, 420)
  }

  function decide(turnId: string, decision: "applied" | "discarded") {
    // Apply outside the state updater: React runs updaters during the render
    // phase, and onApply writes to the Studio's state — doing it inside is a
    // cross-component setState during render.
    const turn = turns.find((t) => t.id === turnId)
    if (decision === "applied" && turn?.changes) onApply(turn.changes)
    setTurns((prev) => prev.map((t) => (t.id === turnId ? { ...t, status: decision } : t)))
  }

  return (
    <aside className="flex min-h-0 w-88 shrink-0 flex-col border-l bg-card">
      <header className="flex h-13 shrink-0 items-center gap-2 border-b px-3.5">
        <span className="grid size-7 place-items-center rounded-md border border-primary/25 bg-primary/10 text-primary">
          <Sparkles className="size-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">Co-Analyst</div>
          <div className="text-[11px] text-muted-foreground">Edits this report on request</div>
        </div>
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo last applied change"
          className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
        >
          <Undo2 className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onClose}
          title="Close"
          className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3.5">
        {turns.map((turn) => (
          <div key={turn.id} className={cn("flex", turn.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[92%] rounded-xl px-3 py-2 text-[13px] leading-relaxed",
                turn.role === "user" ? "bg-primary text-primary-foreground" : "border bg-background"
              )}
            >
              <p>{turn.text}</p>

              {turn.changes && (
                <div className="mt-2.5 overflow-hidden rounded-lg border bg-card">
                  <div className="border-b bg-muted/40 px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Proposed changes · {turn.changes.length}
                  </div>
                  <ul className="divide-y">
                    {turn.changes.map((change, i) => {
                      const Icon = OP_ICON[change.op]
                      return (
                        <li key={i} className="flex items-start gap-2 px-2.5 py-2">
                          <Icon className={cn("mt-0.5 size-3 shrink-0", OP_TONE[change.op])} />
                          <div className="min-w-0">
                            <div className="text-[11.5px] font-medium">{change.label}</div>
                            <div className="text-[11px] text-muted-foreground">{change.detail}</div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                  {turn.status === "pending" ? (
                    <div className="flex gap-1.5 border-t p-2">
                      <Button size="sm" className="h-7 flex-1 text-[11px]" onClick={() => decide(turn.id, "applied")}>
                        <Check className="size-3" />
                        Apply
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 flex-1 text-[11px]" onClick={() => decide(turn.id, "discarded")}>
                        Discard
                      </Button>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "border-t px-2.5 py-1.5 text-[11px] font-medium",
                        turn.status === "applied" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                      )}
                    >
                      {turn.status === "applied" ? "Applied to the document" : "Discarded"}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {thinking && (
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <RotateCcw className="size-3 animate-spin" />
            Reading the document…
          </div>
        )}
      </div>

      <div className="shrink-0 border-t p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS.slice(0, 3).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="rounded-full border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                send(input)
              }
            }}
            placeholder="Ask for a change — drop a section, re-scope, re-tone…"
            className="min-h-18 resize-none pr-11 text-[13px]"
          />
          <Button
            size="icon-sm"
            className="absolute right-2 bottom-2"
            disabled={!input.trim() || thinking}
            onClick={() => send(input)}
            aria-label="Send"
          >
            <ArrowUp className="size-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
