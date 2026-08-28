import {
  AlignLeft,
  Boxes,
  FileText,
  Gauge,
  Grid3x3,
  Heading,
  History,
  Library,
  LineChart,
  MessageSquareWarning,
  MoveVertical,
  Scissors,
  SeparatorHorizontal,
  Sparkles,
  Table2,
  TrendingUp,
  Workflow,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { LibraryBlock } from "@/data/reports-ai"
import { BLOCK_GROUPS, BLOCK_LABELS, type StudioBlockType } from "./report-studio-types"

export const BLOCK_ICON: Record<StudioBlockType, typeof FileText> = {
  cover: FileText,
  heading: Heading,
  text: AlignLeft,
  callout: MessageSquareWarning,
  kpi: Gauge,
  chart: LineChart,
  table: Table2,
  mitre: Grid3x3,
  timeline: History,
  entities: Boxes,
  playbooks: Workflow,
  divider: SeparatorHorizontal,
  spacer: MoveVertical,
  pageBreak: Scissors,
  execSummary: Sparkles,
  anomalies: TrendingUp,
  whatChanged: History,
}

export function ReportStudioPalette({
  onAdd,
  onAddFromLibrary,
  library,
  disabledTypes = [],
}: {
  onAdd: (type: StudioBlockType) => void
  onAddFromLibrary: (entry: LibraryBlock) => void
  library: LibraryBlock[]
  disabledTypes?: StudioBlockType[]
}) {
  return (
    <div className="space-y-5 p-3">
      {BLOCK_GROUPS.map((group) => (
        <div key={group.label}>
          <div className="px-2 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{group.label}</div>
          <div className="space-y-0.5">
            {group.types.map((type) => {
              const Icon = BLOCK_ICON[type]
              const disabled = disabledTypes.includes(type)
              const generated = group.label === "Co-Analyst"
              return (
                <button
                  key={type}
                  type="button"
                  disabled={disabled}
                  title={disabled ? "Already added" : undefined}
                  onClick={() => onAdd(type)}
                  className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
                >
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-md border",
                      generated ? "border-primary/25 bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="size-3.5" />
                  </span>
                  {BLOCK_LABELS[type]}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <div>
        <div className="flex items-center gap-1.5 px-2 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          <Library className="size-3" />
          Library
        </div>
        <div className="space-y-0.5">
          {library.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => onAddFromLibrary(entry)}
              title={entry.description}
              className="flex w-full items-start gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-accent"
            >
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md border bg-muted text-muted-foreground">
                <Library className="size-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">{entry.name}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {entry.owner === "org" ? "Org" : "Personal"} · used in {entry.usedIn}
                </span>
              </span>
            </button>
          ))}
          {library.length === 0 && (
            <p className="px-2 py-2 text-[11px] leading-relaxed text-muted-foreground">
              Nothing saved yet. Select a block and choose "Save to library" to reuse it across reports.
            </p>
          )}
        </div>
      </div>

      <p className="px-2 text-[11px] leading-relaxed text-muted-foreground">
        Blocks land after the current selection. Data blocks inherit the report's module and period unless you pin them.
      </p>
    </div>
  )
}
