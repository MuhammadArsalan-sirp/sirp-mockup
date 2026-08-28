import { SirpLogo } from "@/components/shared/brand-logo"
import { cn } from "@/lib/utils"
import { resolveVars, type CoverProps } from "./report-studio-types"

const TLP_TONE: Record<string, string> = {
  "TLP:RED": "border-red-400/40 bg-red-500/15 text-red-200",
  "TLP:AMBER": "border-amber-400/40 bg-amber-500/15 text-amber-200",
  "TLP:GREEN": "border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
  "TLP:CLEAR": "border-white/20 bg-white/10 text-white/80",
}

/**
 * The cover page.
 *
 * Deliberately its own visual world: always the dark SIRP ground with the
 * brand violet behind it, whatever theme the app is in. A cover is the one
 * page that gets looked at rather than read — it carries the identity so the
 * rest of the document can stay quiet.
 *
 * The identity behind the type is built from the logo's own geometry — the
 * capsule — rather than a scaled copy of the mark. A watermarked logo fights
 * the wordmark in the masthead, and the mark's gradient can't be dimmed
 * without also dimming what it's supposed to sit behind.
 *
 * Everything is CSS and inline SVG so `html-to-image` captures it faithfully:
 * no external assets, no webfont surprises in the PDF.
 */
export function ReportCover({
  props,
  vars,
  aspect = "210 / 297",
  contents = [],
  generatedOn,
}: {
  props: CoverProps
  vars: Record<string, string>
  aspect?: string
  /** Section titles, printed as a contents strip. */
  contents?: string[]
  generatedOn?: string
}) {
  const title = resolveVars(props.title, vars)
  const subtitle = resolveVars(props.subtitle, vars)
  const preparedFor = resolveVars(props.preparedFor, vars)
  const period = vars.period ?? "This period"
  const generated =
    generatedOn ??
    new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

  return (
    <div
      className="relative flex w-full flex-col overflow-hidden bg-[#0b0714] text-white"
      style={{ aspectRatio: aspect }}
    >
      {/* Violet field */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(115% 80% at 8% 0%, rgba(142,45,255,0.60) 0%, rgba(142,45,255,0.20) 40%, rgba(11,7,20,0) 74%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 55% at 100% 96%, rgba(187,129,255,0.28) 0%, rgba(11,7,20,0) 62%)",
        }}
      />

      {/* Grid, full bleed, fading into the type area */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.14) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "linear-gradient(to bottom, black 0%, black 46%, transparent 82%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 46%, transparent 82%)",
        }}
      />

      {/* The mark's geometry, at architectural scale — two capsules on the
          logo's 45° axis, bleeding off the right edge. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute right-[-9%] top-[13%] h-[46%] w-[26%] rotate-45 rounded-full border border-white/10"
          style={{ background: "linear-gradient(150deg, rgba(187,129,255,0.16), rgba(142,45,255,0.02))" }}
        />
        <div
          className="absolute right-[16%] top-[34%] h-[34%] w-[19%] rotate-45 rounded-full border border-white/[0.07]"
          style={{ background: "linear-gradient(150deg, rgba(187,129,255,0.09), rgba(142,45,255,0.01))" }}
        />
      </div>

      {/* Top hairline */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(to right, transparent, rgba(187,129,255,0.85), transparent)" }}
      />

      {/* Masthead */}
      <div className="relative flex items-start justify-between px-14 pt-12">
        <div className="flex items-center gap-3">
          <SirpLogo className="h-7 w-auto text-white" />
          <span className="h-6 w-px bg-white/20" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">OmniSense</span>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-medium tracking-wider",
            TLP_TONE[props.classification] ?? TLP_TONE["TLP:CLEAR"]
          )}
        >
          <span className="size-1.5 rounded-full bg-current" />
          {props.classification}
        </span>
      </div>

      {/* Contents strip — fills the field with something the reader can use,
          and tells them what's inside before they turn the page. */}
      {contents.length > 0 && (
        <div className="relative mt-14 px-14">
          <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/35">In this report</div>
          <ol className="mt-3 max-w-[62%] space-y-1.5">
            {contents.slice(0, 7).map((entry, i) => (
              <li key={`${entry}-${i}`} className="flex items-baseline gap-3 border-b border-white/[0.07] pb-1.5">
                <span className="font-mono text-[10px] tabular-nums text-[#bb81ff]/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="truncate text-[12.5px] text-white/70">{entry}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Title block */}
      <div className="relative mt-auto px-14">
        <div
          className="mb-6 h-px w-24"
          style={{ background: "linear-gradient(to right, #8e2dff, rgba(187,129,255,0.15))" }}
        />
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#bb81ff]">
          Security operations report
        </div>
        <h1 className="mt-3 max-w-[16ch] text-[42px] font-semibold leading-[1.06] tracking-[-0.03em] text-balance">
          {title}
        </h1>
        <p className="mt-4 max-w-[52ch] text-[13px] leading-relaxed text-white/60">{subtitle}</p>
      </div>

      {/* Meta */}
      <div className="relative mt-9 grid grid-cols-3 gap-6 border-t border-white/10 px-14 pt-6">
        <CoverMeta label="Prepared for" value={preparedFor} />
        <CoverMeta label="Reporting period" value={period} />
        <CoverMeta label="Generated" value={generated} mono />
      </div>

      {/* Footer */}
      <div className="relative mt-5 flex items-center justify-between px-14 pb-9">
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/60">
          Confidential — distribution restricted per {props.classification}
        </span>
        <span className="font-mono text-[9px] tracking-wider text-white/60">sirp.io</span>
      </div>
      <div
        className="absolute inset-x-0 bottom-0 h-1"
        style={{ background: "linear-gradient(to right, #8e2dff, #bb81ff 45%, rgba(142,45,255,0.15))" }}
      />
    </div>
  )
}

function CoverMeta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">{label}</div>
      <div className={cn("mt-1.5 text-[13px] font-medium text-white/90", mono && "font-mono text-[12px]")}>{value}</div>
    </div>
  )
}
