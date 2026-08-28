import type { ReportWidgetType } from "@/data/reports"
import { getWidgetById } from "@/data/reports"
import type { StudioBlockType } from "./report-studio-types"

const BY_WIDGET_TYPE: Record<ReportWidgetType, StudioBlockType> = {
  bar: "chart",
  line: "chart",
  pie: "chart",
  kpi: "kpi",
  table: "table",
}

/** Maps a catalog widget onto the Studio block that renders it. */
export function widgetBlockType(widgetId: string): StudioBlockType {
  const widget = getWidgetById(widgetId)
  return widget ? BY_WIDGET_TYPE[widget.type] : "chart"
}
