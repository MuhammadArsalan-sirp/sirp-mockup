import { useMemo, useState } from "react"
import { CheckSquare, Clock, Lock, ShieldCheck, Timer, XSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { saraFindings, saraBlockedActions } from "@/data/admin-sara"
import { useSaraFindingsStore } from "@/stores/sara-findings"
import { KpiCard, SectionLabel } from "./admin-ui"
import { SaraDiffCard } from "./admin-sara-diff-card"

/**
 * The durable home for everything Sara raises that she can't apply herself.
 * Findings don't disappear when the dock closes — they live here until an
 * admin approves or declines them, same shared status as the dock and the
 * Security posture page.
 */
export function AdminSaraQueuePage() {
  const queueFindings = useMemo(
    () => saraFindings.filter((f) => f.riskTier === "approve"),
    []
  )
  const status = useSaraFindingsStore((s) => s.status)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const pending = queueFindings.filter((f) => (status[f.id] ?? "pending") === "pending")
  const approvedCount = queueFindings.filter((f) => status[f.id] === "approved").length
  const declinedCount = queueFindings.filter((f) => status[f.id] === "declined").length

  const toggle = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const setStatus = useSaraFindingsStore((s) => s.setStatus)
  const bulkDecide = (decision: "approved" | "declined") => {
    selected.forEach((id) => setStatus(id, decision))
    setSelected(new Set())
  }

  return (
    <div className="space-y-5 pb-20">
      <PageHeader
        title="Sara's Approval Queue"
        description="Every change Sara found but can't make on her own. Nothing here takes effect until an admin decides."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard icon={Clock} label="Pending" value={pending.length} tone="warn" />
        <KpiCard icon={CheckSquare} label="Approved" value={approvedCount} tone="ok" caption="This session" />
        <KpiCard icon={XSquare} label="Declined" value={declinedCount} caption="This session" />
        <KpiCard icon={Timer} label="Avg time to decide" value="6m 40s" caption="Last 30 days" />
      </div>

      <div className="rounded-xl border bg-muted/20 p-4">
        <div className="flex items-center gap-2">
          <Lock className="size-3.5 text-muted-foreground" />
          <SectionLabel>Sara's boundaries</SectionLabel>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          These categories never reach this queue at all — Sara won't propose a change here regardless of policy.
        </p>
        <ul className="mt-2 space-y-1">
          {saraBlockedActions.map((a) => (
            <li key={a} className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-3 shrink-0" />
              {a}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        {queueFindings.map((f) => (
          <SaraDiffCard
            key={f.id}
            finding={f}
            context="queue"
            selectable
            selected={selected.has(f.id)}
            onSelectChange={(checked) => toggle(f.id, checked)}
          />
        ))}
        {queueFindings.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nothing waiting on a decision right now.
          </p>
        )}
      </div>

      {selected.size > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center">
          <div className="pointer-events-auto flex items-center gap-3 rounded-full border bg-popover py-1.5 pr-2 pl-4 text-sm shadow-lg">
            <span className="size-2 rounded-full bg-primary" />
            <span>
              <span className="font-semibold">{selected.size}</span> selected
            </span>
            <div className="mx-1 h-4 w-px bg-border" />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-full text-muted-foreground"
              onClick={() => bulkDecide("declined")}
            >
              Decline all
            </Button>
            <Button size="sm" className="h-8 rounded-full" onClick={() => bulkDecide("approved")}>
              Approve all
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
