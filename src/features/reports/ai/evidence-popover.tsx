import { AlertTriangle, ArrowUpRight, Database } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { evidenceRecords } from "@/data/reports-ai"
import { moduleLabels } from "@/data/reports"
import { LOW_CONFIDENCE, type Claim } from "./ai-types"

/**
 * The credibility surface. Every generated sentence in a report carries one of
 * these — the query behind it, the records it matched, the window, and a
 * confidence figure. A reviewer who doesn't trust a claim can check it in two
 * clicks instead of taking it on faith.
 */
export function EvidencePopover({ evidenceId, children }: { evidenceId: string; children: React.ReactNode }) {
  const evidence = evidenceRecords[evidenceId]
  if (!evidence) return <>{children}</>

  const low = evidence.confidence < LOW_CONFIDENCE
  const pct = Math.round(evidence.confidence * 100)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "cursor-pointer rounded-sm text-left underline decoration-dotted decoration-1 underline-offset-4 transition-colors",
            low ? "decoration-amber-500/70 hover:bg-amber-500/10" : "decoration-primary/50 hover:bg-primary/10"
          )}
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-88 p-0">
        <div className="border-b px-3.5 py-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <Database className="size-3" />
            Evidence
          </div>
          <code className="mt-1.5 block rounded-md border bg-muted/60 px-2 py-1.5 font-mono text-[11px] leading-relaxed break-words">
            {evidence.query}
          </code>
        </div>

        <div className="grid grid-cols-3 divide-x border-b text-center">
          <div className="px-2 py-2">
            <div className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">Matched</div>
            <div className="mt-0.5 font-mono text-sm tabular-nums">{evidence.matched}</div>
          </div>
          <div className="px-2 py-2">
            <div className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">Module</div>
            <div className="mt-0.5 truncate text-[11px]">{moduleLabels[evidence.module]}</div>
          </div>
          <div className="px-2 py-2">
            <div className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">Confidence</div>
            <div className={cn("mt-0.5 font-mono text-sm tabular-nums", low && "text-amber-600 dark:text-amber-400")}>{pct}%</div>
          </div>
        </div>

        <div className="px-3.5 py-2.5">
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Window</div>
          <div className="mt-0.5 text-xs">{evidence.window}</div>
          {evidence.comparedWith && (
            <div className="mt-1 text-[11px] text-muted-foreground">Compared with {evidence.comparedWith}</div>
          )}
        </div>

        {evidence.samples.length > 0 && (
          <div className="border-t px-3.5 py-2.5">
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Sample records</div>
            <ul className="mt-1.5 space-y-1">
              {evidence.samples.map((s) => (
                <li key={s.id} className="flex items-start gap-2 text-[11px]">
                  <span className="font-mono text-primary">{s.id}</span>
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">{s.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {evidence.matched === 0 && (
          <div className="border-t bg-muted/40 px-3.5 py-2 text-[11px] text-muted-foreground">
            A zero-match claim is an absence of evidence, not evidence of absence — worth a human read before it ships.
          </div>
        )}

        {low && (
          <div className="flex items-start gap-2 border-t bg-amber-500/10 px-3.5 py-2 text-[11px] text-amber-700 dark:text-amber-400">
            <AlertTriangle className="mt-px size-3.5 shrink-0" />
            <span>Below the {Math.round(LOW_CONFIDENCE * 100)}% confidence floor. Scheduled delivery holds for review.</span>
          </div>
        )}

        <button
          type="button"
          className="flex w-full items-center justify-between border-t px-3.5 py-2 text-[11px] font-medium text-primary transition-colors hover:bg-primary/5"
        >
          Open matching records
          <ArrowUpRight className="size-3.5" />
        </button>
      </PopoverContent>
    </Popover>
  )
}

/** A generated sentence: the text, plus its evidence, inline. */
export function ClaimSentence({ claim }: { claim: Claim }) {
  return (
    <EvidencePopover evidenceId={claim.evidenceId}>
      <span className="text-sm leading-relaxed">{claim.text}</span>
    </EvidencePopover>
  )
}
