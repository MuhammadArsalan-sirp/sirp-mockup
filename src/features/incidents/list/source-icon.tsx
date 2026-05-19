import { Bot, Eye } from "lucide-react"

/**
 * Brand identifiers for incident sources.
 * - Real security vendors (CrowdStrike, Splunk, Sentinel, etc.) get a tinted
 *   monogram badge in the vendor's brand colour. Most security vendors aren't
 *   in `simple-icons` due to trademark policy, so we approximate.
 * - Internal SIRP services (OmniSense, Triage Agent) get Lucide icons in
 *   our SIRPurple brand.
 */

type SourceMeta =
  | { kind: "monogram"; initial: string; bg: string }
  | { kind: "icon"; icon: typeof Eye; bg: string }

const sourceRegistry: Record<string, SourceMeta> = {
  OmniSense: { kind: "icon", icon: Eye, bg: "#8E2DFF" },
  CrowdStrike: { kind: "monogram", initial: "C", bg: "#FC0000" },
  Splunk: { kind: "monogram", initial: "S", bg: "#65A637" },
  Sentinel: { kind: "monogram", initial: "S", bg: "#0078D4" },
  Proofpoint: { kind: "monogram", initial: "P", bg: "#0072CE" },
  "AWS GuardDuty": { kind: "monogram", initial: "G", bg: "#FF9900" },
  "Triage Agent": { kind: "icon", icon: Bot, bg: "#A457FF" },
}

const fallback: SourceMeta = {
  kind: "monogram",
  initial: "?",
  bg: "var(--muted)",
}

type Props = {
  source: string
  /** When true, renders icon only (no name). Default: false. */
  iconOnly?: boolean
  /** Avatar/icon size in pixels. Defaults to 24 (size-6). */
  size?: number
}

export function SourceIcon({ source, iconOnly = false, size = 24 }: Props) {
  const meta = sourceRegistry[source] ?? fallback

  const badge = (
    <span
      className="grid shrink-0 place-items-center rounded-md font-semibold text-white"
      style={{
        background: meta.bg,
        width: size,
        height: size,
        fontSize: Math.round(size * 0.5),
      }}
      aria-hidden
    >
      {meta.kind === "monogram" ? (
        meta.initial
      ) : (
        <meta.icon
          style={{ width: Math.round(size * 0.55), height: Math.round(size * 0.55) }}
        />
      )}
    </span>
  )

  if (iconOnly) return badge

  return (
    <span className="inline-flex items-center gap-2 text-sm">
      {badge}
      <span className="font-medium">{source}</span>
    </span>
  )
}
