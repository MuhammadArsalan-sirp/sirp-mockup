import { useState } from "react"
import { useNavigate } from "react-router"
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Ban,
  Check,
  CheckCheck,
  Clock,
  Hash,
  Lock,
  Mail,
  MessageSquare,
  PauseCircle,
  PenLine,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { KpiCard } from "@/components/shared/kpi-card"
import { autonomyPolicies, pendingEditions } from "@/data/reports-ai"
import type { DeliveryStatus, PendingEdition, RiskTier } from "../ai/ai-types"
import { ClaimSentence } from "../ai/evidence-popover"

const channelIcon = { email: Mail, slack: Hash, teams: MessageSquare } as const

const TIER_META: Record<RiskTier, { label: string; cls: string }> = {
  auto: { label: "Sends itself", cls: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  review: { label: "Needs approval", cls: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  blocked: { label: "Never auto-sends", cls: "border-destructive/25 bg-destructive/10 text-destructive" },
}

/**
 * The gate on autonomous reporting. A recurring report generates itself; what
 * it does *next* depends on the policy below. Anything carrying generated
 * narrative, or going outside the tenant, stops here for a human — which is the
 * difference between automation people keep and automation they switch off.
 */
export function ApprovalsTab() {
  const navigate = useNavigate()
  const [decisions, setDecisions] = useState<Record<string, DeliveryStatus>>({})

  const statusOf = (edition: PendingEdition) => decisions[edition.id] ?? edition.status
  const queue = pendingEditions.filter((e) => statusOf(e) === "pending")
  const settled = pendingEditions.filter((e) => statusOf(e) !== "pending")
  const autoSentToday = pendingEditions.filter((e) => e.riskTier === "auto" && statusOf(e) === "sent").length
  const heldCount = pendingEditions.filter((e) => statusOf(e) === "held").length

  function decide(id: string, status: DeliveryStatus) {
    setDecisions((prev) => ({ ...prev, [id]: status }))
  }

  function approveAll() {
    setDecisions((prev) => {
      const next = { ...prev }
      for (const edition of queue) next[edition.id] = "approved"
      return next
    })
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Approvals"
        description="Reports that generated themselves and are waiting on a human before they leave the building."
        actions={
          queue.length > 0 ? (
            <Button size="sm" className="h-8 text-sm" onClick={approveAll}>
              <CheckCheck className="size-4" />
              Approve all {queue.length}
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={<Clock className="size-4" />} label="Awaiting approval" value={queue.length} trendTone="attention" caption="Generated, not yet sent" />
        <KpiCard icon={<Send className="size-4" />} label="Sent automatically" value={autoSentToday} trendTone="success" caption="Inside policy, no human needed" />
        <KpiCard icon={<PauseCircle className="size-4" />} label="Held" value={heldCount} trendTone="muted" caption="Pulled back for edits" />
        <KpiCard icon={<ShieldCheck className="size-4" />} label="Policies" value={autonomyPolicies.length} caption="Govern what may auto-send" />
      </div>

      {/* Policy — read this before the queue makes sense. */}
      <section className="rounded-xl border bg-card">
        <div className="flex items-center gap-2 border-b px-5 py-3">
          <ShieldCheck className="size-4 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">Autonomy policy</div>
            <p className="text-[11px] text-muted-foreground">Decides which editions stop here and which deliver themselves.</p>
          </div>
        </div>
        <ul className="divide-y">
          {autonomyPolicies.map((policy) => (
            <li key={policy.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {policy.label}
                  {policy.locked && <Lock className="size-3 text-muted-foreground" />}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{policy.description}</p>
              </div>
              <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium", TIER_META[policy.tier].cls)}>
                {TIER_META[policy.tier].label}
              </span>
            </li>
          ))}
        </ul>
        <p className="border-t px-5 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
          Locked rows can't be relaxed from this screen — external distribution and cross-tenant scope are platform
          invariants, not preferences.
        </p>
      </section>

      {queue.length === 0 ? (
        <div className="rounded-xl border border-dashed py-14 text-center">
          <div className="mx-auto grid size-11 place-items-center rounded-xl border bg-muted text-muted-foreground">
            <CheckCheck className="size-4.5" />
          </div>
          <p className="mt-3 text-sm font-medium">Queue is clear</p>
          <p className="mt-1 text-xs text-muted-foreground">Nothing is waiting on you. Auto-tier reports keep delivering on their own.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((edition) => (
            <EditionCard
              key={edition.id}
              edition={edition}
              onApprove={() => decide(edition.id, "approved")}
              onHold={() => decide(edition.id, "held")}
              onEdit={() => navigate("/reports/studio")}
            />
          ))}
        </div>
      )}

      {settled.length > 0 && (
        <section className="rounded-xl border bg-card">
          <div className="border-b px-5 py-3 text-sm font-semibold">Recently settled</div>
          <ul className="divide-y">
            {settled.map((edition) => {
              const status = statusOf(edition)
              const Icon = channelIcon[edition.channel]
              return (
                <li key={edition.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{edition.reportName}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {edition.recipientSummary} · generated {edition.generatedAt.toLowerCase()}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize",
                      status === "sent" || status === "approved"
                        ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border bg-muted text-muted-foreground"
                    )}
                  >
                    {status}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}

function EditionCard({
  edition,
  onApprove,
  onHold,
  onEdit,
}: {
  edition: PendingEdition
  onApprove: () => void
  onHold: () => void
  onEdit: () => void
}) {
  const Icon = channelIcon[edition.channel]

  return (
    <article className="overflow-hidden rounded-xl border bg-card">
      <header className="flex flex-wrap items-start gap-3 border-b px-5 py-3.5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{edition.reportName}</span>
            <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", TIER_META[edition.riskTier].cls)}>
              {TIER_META[edition.riskTier].label}
            </span>
            <span className="rounded-full border px-2 py-0.5 text-[10px] capitalize text-muted-foreground">{edition.audience}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <Icon className="size-3" />
            {edition.recipientSummary}
            <span>·</span>
            <span>generated {edition.generatedAt.toLowerCase()}</span>
            <span>·</span>
            <span className="font-medium text-foreground">sends {edition.scheduledFor.toLowerCase()}</span>
          </div>
        </div>
      </header>

      {edition.reviewReasons.length > 0 && (
        <div className="border-b bg-amber-500/5 px-5 py-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-amber-700 dark:text-amber-400">
            <AlertTriangle className="size-3" />
            Why this stopped here
          </div>
          <ul className="mt-1 space-y-0.5">
            {edition.reviewReasons.map((reason) => (
              <li key={reason} className="text-xs text-muted-foreground">— {reason}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-0 md:grid-cols-2 md:divide-x">
        <div className="px-5 py-3.5">
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Changed since last edition</div>
          <ul className="mt-2 space-y-1.5">
            {edition.changesSinceLast.map((change) => (
              <li key={change.label} className="flex items-center gap-2 text-xs">
                {change.adverse ? (
                  <ArrowUpRight className="size-3 shrink-0 text-amber-600 dark:text-amber-400" />
                ) : (
                  <ArrowDownRight className="size-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
                )}
                <span className="min-w-0 flex-1 truncate">{change.label}</span>
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{change.detail}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="px-5 py-3.5">
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <Sparkles className="size-3 text-primary" />
            Narrative awaiting sign-off
          </div>
          {edition.narrativeClaims.length ? (
            <div className="mt-2 space-y-1.5 text-muted-foreground">
              {edition.narrativeClaims.map((claim) => (
                <p key={claim.id}>
                  <ClaimSentence claim={claim} />
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              No generated prose in this edition — figures only, which is why it clears the auto tier.
            </p>
          )}
        </div>
      </div>

      <footer className="flex flex-wrap items-center gap-2 border-t bg-muted/30 px-5 py-3">
        <Button size="sm" className="h-8" onClick={onApprove}>
          <Check className="size-3.5" />
          Approve &amp; send
        </Button>
        <Button size="sm" variant="outline" className="h-8" onClick={onHold}>
          <PauseCircle className="size-3.5" />
          Hold
        </Button>
        <Button size="sm" variant="outline" className="h-8" onClick={onEdit}>
          <PenLine className="size-3.5" />
          Edit in Studio
        </Button>
        <span className="flex-1" />
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Ban className="size-3" />
          Nothing sends while this sits here
        </span>
      </footer>
    </article>
  )
}
