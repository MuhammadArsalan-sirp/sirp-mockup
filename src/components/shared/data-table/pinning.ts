import type { CSSProperties } from "react"
import type { Column } from "@tanstack/react-table"
import { cn } from "@/lib/utils"

/**
 * TanStack column pinning helpers.
 * Returns inline styles + classes to render sticky pinned columns
 * with a subtle shadow on the dividing edge.
 *
 * Usage in a header / cell:
 *   <TableHead style={getPinningStyle(column)} className={getPinningClass(column)}>
 */
export function getPinningStyle<T>(column: Column<T>): CSSProperties {
  const pinned = column.getIsPinned()
  if (!pinned) return {}
  return {
    position: "sticky",
    left: pinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: pinned === "right" ? `${column.getAfter("right")}px` : undefined,
    zIndex: 1,
  }
}

/**
 * Returns Tailwind class string for a pinned cell:
 *  - solid bg matching the table surface so scrolled content doesn't bleed through
 *  - hover/selected state propagation from the parent <tr>
 *  - directional shadow on the boundary between pinned and scrollable area
 */
export function getPinningClass<T>(column: Column<T>): string {
  const pinned = column.getIsPinned()
  if (!pinned) return ""
  const isLastLeft = pinned === "left" && column.getIsLastColumn("left")
  const isFirstRight =
    pinned === "right" && column.getIsFirstColumn("right")
  return cn(
    // Solid bg so scrolled cells can't be seen through the sticky cell.
    // Matches the table wrapper's surface (transparent over bg-background).
    "bg-background",
    // Reflect row hover and selection on the pinned cell too.
    // Hover at /40 (autonomy convention) to keep the band consistent.
    "[tr:hover>&]:bg-muted/40",
    "[tr[data-state=selected]>&]:bg-muted/40",
    // Edge shadow → hint that there's content scrolled under this column.
    isLastLeft &&
      "shadow-[4px_0_8px_-4px_rgba(0,0,0,0.35)] dark:shadow-[4px_0_8px_-4px_rgba(0,0,0,0.55)]",
    isFirstRight &&
      "shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.35)] dark:shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.55)]"
  )
}
