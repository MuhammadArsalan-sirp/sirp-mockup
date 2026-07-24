import { Link } from "react-router"
import { Check, ChevronDown, ClipboardCheck, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { SaraFinding } from "@/data/admin-sara"
import { saraFindingTone, saraRiskTierMeta } from "@/data/admin-sara"
import { useSaraFindingsStore } from "@/stores/sara-findings"
import { ToneChip } from "./admin-ui"

const severityLabel: Record<SaraFinding["severity"], string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
}

/**
 * The one interaction every "Sara noticed X" surface in Administration
 * shares: a plain-English finding, what Sara checked before raising it, the
 * exact config change as a diff, and an explicit decision — never a silent
 * write. Status lives in `useSaraFindingsStore`, shared across the dock,
 * the Security posture page, and the Approval Queue, so deciding a finding
 * anywhere reflects everywhere.
 *
 * Risk tier decides what "decide" means:
 *   auto    → Apply / Dismiss, right here
 *   approve → routed to the Approval Queue; this card only shows status
 *             and a link, UNLESS `context="queue"`, where it renders the
 *             actual Approve / Decline controls.
 */
export function SaraDiffCard({
  finding,
  className,
  compact = false,
  context = "default",
  selectable = false,
  selected = false,
  onSelectChange,
}: {
  finding: SaraFinding
  className?: string
  compact?: boolean
  context?: "default" | "queue"
  selectable?: boolean
  selected?: boolean
  onSelectChange?: (checked: boolean) => void
}) {
  const status = useSaraFindingsStore((s) => s.status[finding.id] ?? "pending")
  const setStatus = useSaraFindingsStore((s) => s.setStatus)
  const riskMeta = saraRiskTierMeta[finding.riskTier]
  const isDecided = status !== "pending"
  const showQueueControls = context === "queue" && finding.riskTier === "approve"

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-card transition-opacity",
        (status === "dismissed" || status === "declined") && "opacity-60",
        className
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {selectable && status === "pending" && (
          <Checkbox
            checked={selected}
            onCheckedChange={(v) => onSelectChange?.(v === true)}
            className="mt-1 shrink-0"
            aria-label="Select finding"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <ToneChip tone={saraFindingTone[finding.severity]}>
              {severityLabel[finding.severity]}
            </ToneChip>
            <ToneChip tone={riskMeta.tone}>{riskMeta.label}</ToneChip>
          </div>
          <p className="mt-1.5 text-sm font-medium leading-snug">{finding.title}</p>
          {!compact && (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {finding.detail}
            </p>
          )}
          <Link
            to={finding.area.href}
            className="mt-1.5 inline-flex items-center gap-0.5 text-xs text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-foreground"
          >
            {finding.area.label}
          </Link>
        </div>
      </div>

      <Collapsible className="mx-4 mb-3">
        <CollapsibleTrigger className="group flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground">
          <ChevronDown className="size-3 transition-transform group-data-[state=open]:rotate-180" />
          Sara checked {finding.steps.length} things
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-1.5 rounded-lg border bg-muted/20 p-3">
          {finding.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
              <ClipboardCheck className="mt-0.5 size-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{step}</span>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <div className="mx-4 mb-3 overflow-hidden rounded-lg border font-mono text-[11px] leading-relaxed">
        <div className="border-b border-destructive/20 bg-destructive/8 px-3 py-1.5 text-destructive">
          − {finding.diff.remove}
        </div>
        <div className="bg-emerald-500/8 px-3 py-1.5 text-emerald-700 dark:text-emerald-400">
          + {finding.diff.add}
        </div>
      </div>

      <div className="flex items-center gap-2 border-t bg-muted/20 px-4 py-2.5">
        {status === "applied" && (
          <ToneChip tone="ok" icon={Check}>Applied · logged to audit trail</ToneChip>
        )}
        {status === "approved" && (
          <ToneChip tone="ok" icon={Check}>Approved · applied</ToneChip>
        )}
        {status === "dismissed" && <span className="text-xs text-muted-foreground">Dismissed</span>}
        {status === "declined" && <span className="text-xs text-muted-foreground">Declined</span>}

        {!isDecided && finding.riskTier === "auto" && (
          <>
            <Button size="sm" className="h-7 text-xs" onClick={() => setStatus(finding.id, "applied")}>
              Apply
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => setStatus(finding.id, "dismissed")}
            >
              Dismiss
            </Button>
          </>
        )}

        {!isDecided && finding.riskTier === "approve" && showQueueControls && (
          <>
            <Button size="sm" className="h-7 text-xs" onClick={() => setStatus(finding.id, "approved")}>
              <Check className="size-3" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => setStatus(finding.id, "declined")}
            >
              <X className="size-3" />
              Decline
            </Button>
          </>
        )}

        {!isDecided && finding.riskTier === "approve" && !showQueueControls && (
          <>
            <ToneChip tone="warn">Awaiting approval</ToneChip>
            <Link
              to="/admin-modern/sara-queue"
              className="text-xs text-primary hover:underline"
            >
              Review in Approval Queue →
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
