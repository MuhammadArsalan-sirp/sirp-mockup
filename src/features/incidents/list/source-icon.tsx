import { Bot, Eye } from "lucide-react"
import { siSplunk } from "simple-icons"

/**
 * Brand identifiers for incident sources.
 *
 * Most security vendors aren't in simple-icons (trademark policy), so we
 * approximate with distinctive marks per brand:
 *   - OmniSense / Triage Agent: Lucide icons in SIRPurple
 *   - Microsoft Sentinel: the 4-colour Microsoft square (well-known geometry)
 *   - AWS GuardDuty: lowercase "aws" wordmark on AWS navy
 *   - Splunk: actual Splunk path from simple-icons
 *   - CrowdStrike / Proofpoint: polished monograms in brand colour
 */

type Brand =
  | { kind: "lucide";    icon: typeof Eye }
  | { kind: "splunk" }
  | { kind: "microsoft" }
  | { kind: "aws" }
  | { kind: "monogram";  letters: string; weight?: 700 | 800 | 900 }

type SourceMeta = { brand: Brand; bg: string }

const sourceRegistry: Record<string, SourceMeta> = {
  OmniSense:       { brand: { kind: "lucide", icon: Eye }, bg: "#8E2DFF" },
  "Triage Agent":  { brand: { kind: "lucide", icon: Bot }, bg: "#A457FF" },
  CrowdStrike:     { brand: { kind: "monogram", letters: "CS", weight: 800 }, bg: "#EE2629" },
  Splunk:          { brand: { kind: "splunk" }, bg: "#000000" },
  Sentinel:        { brand: { kind: "microsoft" }, bg: "#FFFFFF" },
  Proofpoint:      { brand: { kind: "monogram", letters: "P",  weight: 800 }, bg: "#0072CE" },
  "AWS GuardDuty": { brand: { kind: "aws" }, bg: "#232F3E" },
}

const fallback: SourceMeta = {
  brand: { kind: "monogram", letters: "?", weight: 700 },
  bg: "var(--muted)",
}

function renderMark(brand: Brand, size: number) {
  const inner = Math.round(size * 0.7)
  switch (brand.kind) {
    case "lucide": {
      const Icon = brand.icon
      return <Icon style={{ width: inner, height: inner, color: "white" }} />
    }
    case "monogram":
      return (
        <span
          style={{
            color: "white",
            fontWeight: brand.weight ?? 700,
            fontSize: Math.round(size * (brand.letters.length === 1 ? 0.62 : 0.46)),
            letterSpacing: brand.letters.length > 1 ? "-0.05em" : "normal",
            lineHeight: 1,
          }}
        >
          {brand.letters}
        </span>
      )
    case "splunk":
      return (
        <svg
          viewBox="0 0 24 24"
          width={inner}
          height={inner}
          xmlns="http://www.w3.org/2000/svg"
          fill="#65A637"
          aria-hidden
        >
          <path d={siSplunk.path} />
        </svg>
      )
    case "microsoft": {
      // Microsoft 4-square logo on white background.
      const s = Math.round(size * 0.62)
      const half = (s - 2) / 2
      return (
        <svg width={s} height={s} viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <rect x="0"  y="0"  width={half} height={half} fill="#F25022" />
          <rect x={half + 1} y="0"  width={half} height={half} fill="#7FBA00" />
          <rect x="0"  y={half + 1} width={half} height={half} fill="#00A4EF" />
          <rect x={half + 1} y={half + 1} width={half} height={half} fill="#FFB900" />
        </svg>
      )
    }
    case "aws":
      return (
        <span
          style={{
            color: "#FF9900",
            fontWeight: 900,
            fontSize: Math.round(size * 0.42),
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          aws
        </span>
      )
  }
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
      className="grid shrink-0 place-items-center rounded-lg"
      style={{
        background: meta.bg,
        width: Math.round(size * 1.5),
        height: size,
      }}
      aria-hidden
    >
      {renderMark(meta.brand, size)}
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
