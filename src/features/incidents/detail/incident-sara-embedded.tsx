import { useCallback, useEffect, useRef, useState } from "react"
import { Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Incident } from "@/data/incidents"

type Role = "user" | "assistant"
type Msg  = { id: string; role: Role; text: string; pending?: boolean }

const SUGGESTIONS = [
  "Summarise this incident",
  "What are the IOCs?",
  "What's the SLA status?",
  "Recommend next steps",
]

function mockReply(incident: Incident, question: string): string {
  const q = question.toLowerCase()
  if (q.includes("ioc") || q.includes("indicator"))
    return `Across ${incident.id} I count **${incident.iocs} IOCs** tied to ${incident.source.label}. Strongest overlap is ${incident.mitre[0] ?? "MITRE"} — recommend pivoting from the artifact bundle in the Evidence tab.`
  if (q.includes("sla") || q.includes("due"))
    return `SLA is **${incident.sla.label}** (${incident.sla.tone}). ${incident.sla.tone === "breach" ? "Escalate to duty manager." : "Still inside policy window for " + incident.priority + "."}`
  if (q.includes("summar") || q.includes("overview"))
    return `${incident.title} — ${incident.severity} / ${incident.state}. ${incident.subtitle ?? "No subtitle."} Customer **${incident.customer}** · ${incident.location}.`
  if (q.includes("next") || q.includes("recommend"))
    return `Based on ${incident.category} at **${incident.severity}** severity:\n\n1. Isolate affected assets immediately\n2. Collect forensic artifacts before remediation\n3. Rotate credentials for all implicated accounts\n4. Notify stakeholders per the escalation matrix`
  return `I've pulled context for **${incident.id}**. ${incident.category} with S3 score **${incident.s3Score}** — prioritise containment on privileged assets. Ask about IOCs, SLA, or playbooks.`
}

type Props = { incident: Incident; className?: string }

export function IncidentSaraEmbedded({ incident, className }: Props) {
  const [input,    setInput]    = useState("")
  const [messages, setMessages] = useState<Msg[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = useCallback((text?: string) => {
    const trimmed = (text ?? input).trim()
    if (!trimmed) return
    setInput("")
    const userId = `u-${Date.now()}`
    setMessages((m) => [
      ...m,
      { id: userId, role: "user", text: trimmed },
      { id: `a-${userId}`, role: "assistant", text: "", pending: true },
    ])
    window.setTimeout(() => {
      setMessages((m) =>
        m.map((x) =>
          x.id === `a-${userId}`
            ? { ...x, pending: false, text: mockReply(incident, trimmed) }
            : x
        )
      )
    }, 700 + Math.random() * 400)
  }, [incident, input])

  const isEmpty = messages.length === 0

  return (
    <div className={cn("flex flex-col overflow-hidden bg-background", className)}>

      {/* ── Welcome / Chat area ── */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {isEmpty ? (
          /* Welcome state */
          <div className="flex flex-col items-center justify-center gap-5 px-5 py-8 text-center h-full min-h-[280px]">
            {/* Sara icon */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-chart-3/20 blur-xl" />
                <img
                  src="/brand/sara-icon.png"
                  alt="Sara"
                  className="relative size-14 object-contain drop-shadow-md"
                />
              </div>
              <div>
                <p className="text-sm font-semibold">Sara · Co-Analyst</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Scoped to {incident.id}
                </p>
              </div>
            </div>

            <p className="max-w-[240px] text-xs leading-relaxed text-muted-foreground">
              I've analysed this incident. Ask me anything or pick a suggestion below.
            </p>

            {/* Suggestion chips */}
            <div className="flex flex-col gap-1.5 w-full max-w-[260px]">
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
          /* Chat messages */
          <div className="space-y-4 px-4 py-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-2.5", msg.role === "user" && "flex-row-reverse")}>
                {/* Avatar */}
                {msg.role === "assistant" && (
                  <img
                    src="/brand/sara-icon.png"
                    alt="Sara"
                    className="mt-0.5 size-5 shrink-0 object-contain"
                  />
                )}
                {msg.role === "user" && (
                  <div className={cn(
                    "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[8px] font-bold text-white",
                    incident.assignee.gradient
                  )}>
                    {incident.assignee.initials}
                  </div>
                )}

                {/* Bubble */}
                <div className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-foreground"
                )}>
                  {msg.pending ? (
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Loader2 className="size-3 animate-spin" />
                      Thinking…
                    </span>
                  ) : msg.role === "assistant" ? (
                    <p className="whitespace-pre-wrap">
                      {msg.text.split("**").map((chunk, i) =>
                        i % 2 === 1
                          ? <strong key={i} className="font-semibold">{chunk}</strong>
                          : <span key={i}>{chunk}</span>
                      )}
                    </p>
                  ) : (
                    <p>{msg.text}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input ── */}
      <div className="shrink-0 border-t bg-background p-3">
        <div className="flex items-center gap-2 rounded-xl border bg-muted/20 px-3 py-2 transition-all focus-within:border-primary/40 focus-within:bg-background focus-within:ring-1 focus-within:ring-primary/20">
          <img src="/brand/sara-icon.png" alt="" className="size-4 shrink-0 object-contain opacity-50" />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Ask Sara anything…"
            className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim()}
            className={cn(
              "grid size-6 shrink-0 place-items-center rounded-lg transition-all",
              input.trim() ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground/40"
            )}
          >
            <Send className="size-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
