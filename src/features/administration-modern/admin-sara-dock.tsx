import { useCallback, useEffect, useRef, useState } from "react"
import { Loader2, Send, Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSaraAdminDock } from "@/stores/sara-admin-dock"
import { saraFindings, matchSaraFinding, mockAdminSaraReply } from "@/data/admin-sara"
import { SaraDiffCard } from "./admin-sara-diff-card"

type Msg = {
  id: string
  role: "user" | "assistant"
  text?: string
  findingId?: string
  pending?: boolean
}

const SUGGESTIONS = [
  "Any unused SSO providers?",
  "Show me last week's permission changes",
  "Which accounts are dormant?",
]

/**
 * Persistent Sara affordance mounted once in AdminLayout, so it's available
 * from every /admin-modern page — not one config tab among twelve. Opens as
 * a floating dock; free text either matches a known finding (rendered as a
 * SaraDiffCard — never a silent write) or gets a plain-English answer.
 */
export function AdminSaraDock() {
  const open = useSaraAdminDock((s) => s.open)
  const setOpen = useSaraAdminDock((s) => s.setOpen)
  const pendingPrompt = useSaraAdminDock((s) => s.pendingPrompt)
  const clearPending = useSaraAdminDock((s) => s.clearPending)

  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Msg[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(0)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = useCallback((text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setInput("")
    const seq = nextId.current++
    const userId = `u-${seq}`
    const assistantId = `a-${seq}`
    setMessages((m) => [
      ...m,
      { id: userId, role: "user", text: trimmed },
      { id: assistantId, role: "assistant", pending: true },
    ])
    window.setTimeout(() => {
      const finding = matchSaraFinding(trimmed)
      setMessages((m) =>
        m.map((x) =>
          x.id === assistantId
            ? finding
              ? { ...x, pending: false, findingId: finding.id, text: "Here's what I found — nothing changes until you say so:" }
              : { ...x, pending: false, text: mockAdminSaraReply(trimmed) }
            : x
        )
      )
    }, 650 + Math.random() * 350)
  }, [])

  // A prompt queued from the command palette gets sent once the dock is
  // open. Guarded against React StrictMode's double effect invocation
  // (and any other duplicate fire) actually sending the same prompt twice.
  const lastHandledPrompt = useRef<string | null>(null)
  useEffect(() => {
    if (open && pendingPrompt && pendingPrompt !== lastHandledPrompt.current) {
      lastHandledPrompt.current = pendingPrompt
      send(pendingPrompt)
      clearPending()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pendingPrompt])

  const isEmpty = messages.length === 0

  return (
    <>
      {/* ── Floating trigger ── */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed right-6 bottom-6 z-40 flex items-center gap-2 rounded-full bg-linear-to-br from-primary to-chart-3 py-3 pr-4 pl-3 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-transform hover:scale-[1.03]"
        >
          <Sparkles className="size-4" />
          Ask Sara
          {saraFindings.length > 0 && (
            <span className="ml-0.5 grid size-4 place-items-center rounded-full bg-white/25 font-mono text-[10px] tabular-nums">
              {saraFindings.length}
            </span>
          )}
        </button>
      )}

      {/* ── Panel ── */}
      {open && (
        <div className="fixed right-6 bottom-6 z-40 flex h-[min(600px,calc(100vh-3rem))] w-[min(420px,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl">
          <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-muted/30 px-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-linear-to-br from-primary to-chart-3 text-white shadow-sm">
                <Sparkles className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Sara · Admin operator</p>
                <p className="truncate text-[11px] text-muted-foreground">Scoped to this workspace's configuration</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Close Sara"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {isEmpty ? (
              <div className="flex flex-col gap-5 px-4 py-5">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  I've been watching this workspace's configuration. Here's what's worth a look —
                  nothing changes until you apply it.
                </p>

                <div className="flex flex-col gap-3">
                  {saraFindings.map((f) => (
                    <SaraDiffCard key={f.id} finding={f} compact />
                  ))}
                </div>

                <div className="flex flex-col gap-1.5">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Or ask me something
                  </p>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/[0.04] hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 px-4 py-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex gap-2.5", msg.role === "user" && "flex-row-reverse")}>
                    {msg.role === "assistant" && (
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-linear-to-br from-primary to-chart-3 text-white">
                        <Sparkles className="size-3" />
                      </span>
                    )}
                    <div className={cn("flex max-w-[90%] flex-col gap-2", msg.role === "user" && "items-end")}>
                      <div
                        className={cn(
                          "rounded-xl px-3 py-2 text-xs leading-relaxed",
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/50 text-foreground"
                        )}
                      >
                        {msg.pending ? (
                          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                            <Loader2 className="size-3 animate-spin" />
                            Checking the configuration…
                          </span>
                        ) : (
                          msg.text
                        )}
                      </div>
                      {msg.findingId && (
                        <SaraDiffCard
                          finding={saraFindings.find((f) => f.id === msg.findingId)!}
                          className="w-full"
                          compact
                        />
                      )}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <div className="shrink-0 border-t bg-background p-3">
            <div className="flex items-center gap-2 rounded-xl border bg-muted/20 px-3 py-2 transition-all focus-within:border-primary/40 focus-within:bg-background focus-within:ring-1 focus-within:ring-primary/20">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    send(input)
                  }
                }}
                placeholder="Ask Sara to check or change something…"
                className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim()}
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-lg transition-all",
                  input.trim() ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground/40"
                )}
                aria-label="Send"
              >
                <Send className="size-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
