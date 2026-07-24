import {
  AlignLeft,
  Boxes,
  FileText,
  Gauge,
  Grid3x3,
  Heading,
  History,
  LineChart,
  MessageSquareWarning,
  MoveVertical,
  SeparatorHorizontal,
  Table2,
  Workflow,
} from "lucide-react"
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
}

export function ReportStudioPalette({
  onAdd,
  disabledTypes = [],
}: {
  onAdd: (type: StudioBlockType) => void
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
              return (
                <button
                  key={type}
                  type="button"
                  disabled={disabled}
                  title={disabled ? "Already added" : undefined}
                  onClick={() => onAdd(type)}
                  className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-md border bg-muted text-muted-foreground">
                    <Icon className="size-3.5" />
                  </span>
                  {BLOCK_LABELS[type]}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      <p className="px-2 text-[11px] leading-relaxed text-muted-foreground">
        Click a block to add it after the selected section. Every data block binds to the report's module and time range.
      </p>
    </div>
  )
}
