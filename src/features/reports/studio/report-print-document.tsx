import { cn } from "@/lib/utils"
import { StudioBlockContent } from "./report-studio-block-content"
import {
  PAGE_HEIGHT,
  PAGE_WIDTH,
  PAPER_ASPECT,
  isCoverPage,
  paperKey,
  splitPages,
  toRows,
} from "./report-pagination"
import { MARGIN_PX, resolveVars, type DocSettings, type StudioBlock } from "./report-studio-types"

/**
 * What actually gets exported.
 *
 * The editor canvas is a working surface — it carries an "Add section"
 * control, selection outlines, card borders around each sheet and gaps
 * between them. Capturing it put all of that in the PDF. This renders the
 * same document as print instead: exact page boxes, no editor chrome, and
 * rejected sections dropped. Export mounts it off-screen, captures a page at
 * a time, and tears it down.
 */
export function ReportPrintDocument({
  blocks,
  doc,
  coverContents,
}: {
  blocks: StudioBlock[]
  doc: DocSettings
  coverContents: string[]
}) {
  // Anything the author rejected never reaches paper.
  const printable = blocks.filter((b) => b.ai?.review !== "rejected")
  const pages = splitPages(printable)
  const key = paperKey(doc.pageSize, doc.orientation)
  const width = PAGE_WIDTH[key] ?? 794
  const height = PAGE_HEIGHT[key] ?? 1123
  const aspect = PAPER_ASPECT[key] ?? "210 / 297"
  const margin = MARGIN_PX[doc.margin]

  return (
    <div className="bg-background" style={{ width }}>
      {pages.map((pageBlocks, pageIndex) => {
        const cover = isCoverPage(pageBlocks)
        return (
          <div
            key={pageIndex}
            data-print-page
            className="relative flex flex-col overflow-hidden bg-background"
            style={{ width, height }}
          >
            {!cover && (
              <PrintChrome doc={doc} position="header" pageIndex={pageIndex} pageCount={pages.length} margin={margin} />
            )}

            <div
              className={cn("min-h-0 flex-1", cover && "flex")}
              style={cover ? undefined : { paddingLeft: margin, paddingRight: margin, paddingTop: 8 }}
            >
              {toRows(pageBlocks).map((row, rowIndex) => (
                <div key={rowIndex} className={cn("w-full", row.length > 1 && "grid grid-cols-2 gap-3")}>
                  {row.map((block) => (
                    <div key={block.id} className={cn(block.style?.emphasis && "border-l-2 border-primary bg-muted/40 px-3")}>
                      <StudioBlockContent
                        block={block}
                        vars={doc.variables}
                        pageAspect={aspect}
                        coverContents={coverContents}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {!cover && (
              <PrintChrome doc={doc} position="footer" pageIndex={pageIndex} pageCount={pages.length} margin={margin} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function PrintChrome({
  doc,
  position,
  pageIndex,
  pageCount,
  margin,
}: {
  doc: DocSettings
  position: "header" | "footer"
  pageIndex: number
  pageCount: number
  margin: number
}) {
  const text = position === "header" ? doc.headerText : doc.footerText
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-3 py-2.5 text-[10px] text-muted-foreground",
        position === "header" ? "border-b" : "border-t"
      )}
      style={{ paddingLeft: margin, paddingRight: margin }}
    >
      {position === "header" && (
        <span
          className="rounded border px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-wide"
          style={{ borderColor: doc.accent, color: doc.accent }}
        >
          {doc.logoText}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate">{resolveVars(text, doc.variables)}</span>
      {position === "header" && doc.repeatClassification && (
        <span className="shrink-0 font-mono text-[9px] tracking-wide">{doc.variables.classification ?? "TLP:AMBER"}</span>
      )}
      {position === "footer" && doc.showPageNumbers && (
        <span className="shrink-0 font-mono tabular-nums">
          {pageIndex + 1} / {pageCount}
        </span>
      )}
    </div>
  )
}
