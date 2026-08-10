import { useState } from "react"
import { Check, Loader2, Send } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Report } from "@/data/reports"
import { users, type UserRef } from "@/data/users"
import { reportsBackend } from "../lib/reports-backend"

const allUsers: UserRef[] = Object.values(users)

export function SendReportDialog({
  open,
  onOpenChange,
  report,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  report: Report | null
}) {
  if (!report) return null
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <SendReportDialogBody key={report.id} report={report} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function SendReportDialogBody({ report, onDone }: { report: Report; onDone: () => void }) {
  const [recipientIds, setRecipientIds] = useState<string[]>([])
  const [externalEmail, setExternalEmail] = useState("")
  const [subject, setSubject] = useState(`Report: ${report.name}`)
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

  const toggleRecipient = (id: string) => {
    setRecipientIds((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]))
  }

  const canSend = recipientIds.length > 0 || externalEmail.trim().length > 0

  async function handleSend() {
    if (!canSend) return
    setStatus("sending")
    try {
      await reportsBackend.sendReportNow({
        report,
        recipients: recipientIds.map((id) => users[id]).filter(Boolean),
        externalEmail: externalEmail.trim() || undefined,
        subject,
        message,
        channel: "email",
      })
      setStatus("sent")
      setTimeout(onDone, 800)
    } catch {
      setStatus("error")
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Send report · {report.name}</DialogTitle>
        <DialogDescription>Emails this report's current version once, right away.</DialogDescription>
      </DialogHeader>
      {status === "sent" ? (
        <div className="grid place-items-center py-10 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Check className="size-5" />
          </span>
          <p className="mt-3 text-sm font-medium">Report sent</p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Recipients
            </Label>
            <div className="flex flex-wrap gap-1.5 rounded-md border p-2">
              {allUsers.map((u) => {
                const active = recipientIds.includes(u.id)
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleRecipient(u.id)}
                    className={
                      active
                        ? "inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 py-1 pl-1 pr-2.5 text-xs text-primary transition-colors"
                        : "inline-flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    }
                  >
                    <Avatar size="sm">
                      <AvatarImage src={u.photo} alt={u.name} />
                      <AvatarFallback className={`bg-linear-to-br ${u.gradient} text-white`}>
                        {u.initials}
                      </AvatarFallback>
                    </Avatar>
                    {u.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              External email (optional)
            </Label>
            <Input
              type="email"
              value={externalEmail}
              onChange={(e) => setExternalEmail(e.target.value)}
              placeholder="someone@example.com"
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Subject
            </Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="h-9" />
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Message
            </Label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Short note included in the delivery email…"
              rows={2}
              className="w-full min-w-0 resize-none rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>

          {status === "error" && (
            <p className="text-sm text-destructive">Couldn't send the report — check your connection and try again.</p>
          )}

          <DialogFooter>
            <Button size="sm" className="sm:ml-auto" disabled={!canSend || status === "sending"} onClick={handleSend}>
              {status === "sending" ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
              Send now
            </Button>
          </DialogFooter>
        </div>
      )}
    </>
  )
}
