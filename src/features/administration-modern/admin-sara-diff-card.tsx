import { useState } from "react"
import { Link } from "react-router"
import { Check, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SaraFinding } from "@/data/admin-sara"
import { saraFindingTone } from "@/data/admin-sara"
import { ToneChip } from "./admin-ui"

const severityLabel: Record<SaraFinding["severity"], string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
}

/**
 * The one interaction every "Sara noticed X" surface in Administration
 * shares: a plain-English finding, the exact config change as a diff, and
 * an explicit Apply / Dismiss — never a silent write. Used by both the
 * admin Sara dock and the Security posture page, reading the same
 * `saraFindings` fixture, so a finding's state is consistent wherever it
 * shows up in this session.
 */
export function SaraDiffCard({
  finding,
  className,
  compact = false,
}: {
  finding: SaraFinding
  className?: string
  compact?: boolean
}) {
  const [state, setState] = useState<"pending" | "applied" | "dismissed">("pending")

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-card transition-opacity",
        state === "dismissed" && "opacity-50",
        className
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <ToneChip tone={saraFindingTone[finding.severity]} className="mt-0.5 shrink-0">
          {severityLabel[finding.severity]}
        </ToneChip>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug">{finding.title}</p>
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
            <ChevronRight className="size-3" />
          </Link>
        </div>
      </div>

      <div className="mx-4 mb-3 overflow-hidden rounded-lg border font-mono text-[11px] leading-relaxed">
        <div className="border-b border-destructive/20 bg-destructive/8 px-3 py-1.5 text-destructive">
          − {finding.diff.remove}
        </div>
        <div className="bg-emerald-500/8 px-3 py-1.5 text-emerald-700 dark:text-emerald-400">
          + {finding.diff.add}
        </div>
      </div>

      <div className="flex items-center gap-2 border-t bg-muted/20 px-4 py-2.5">
        {state === "applied" ? (
          <ToneChip tone="ok" icon={Check}>
            Applied · logged to audit trail
          </ToneChip>
        ) : state === "dismissed" ? (
          <span className="text-xs text-muted-foreground">Dismissed</span>
        ) : (
          <>
            <Button size="sm" className="h-7 text-xs" onClick={() => setState("applied")}>
              Apply
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => setState("dismissed")}
            >
              Dismiss
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
