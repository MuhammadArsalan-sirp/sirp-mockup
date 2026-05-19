import * as React from "react"

type LogoProps = { className?: string; color?: string }

/** Per-vendor brand identity: background + foreground colour. */
export const VENDOR_BRAND: Record<string, { bg: string; fg: string }> = {
  Splunk:       { bg: "#F36F20", fg: "#ffffff" },
  CrowdStrike:  { bg: "#E1001A", fg: "#ffffff" },
  Microsoft:    { bg: "#ffffff", fg: "#0078d4" }, // white tile, actual MS color squares
  Proofpoint:   { bg: "#1E3260", fg: "#ffffff" },
  Okta:         { bg: "#007DC1", fg: "#ffffff" },
  Atlassian:    { bg: "#0052CC", fg: "#ffffff" },
  Google:       { bg: "#4285F4", fg: "#ffffff" }, // VirusTotal / Google
  "Palo Alto":  { bg: "#FA582D", fg: "#ffffff" },
}

export function getVendorBrand(vendor: string) {
  return VENDOR_BRAND[vendor] ?? { bg: "#6366f1", fg: "#ffffff" }
}

/** Stylised vendor glyphs — no licensed assets needed. */
export function VendorLogo({ vendor, className, color }: { vendor: string; className?: string; color?: string }) {
  const Cmp = LOGOS[vendor] ?? FallbackInitial(vendor)
  return <Cmp className={className} color={color} />
}

const LOGOS: Record<string, (p: LogoProps) => React.ReactElement> = {
  Splunk: ({ className, color }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M5 6l6 6-6 6M12 6l6 6-6 6"
        stroke={color ?? "currentColor"}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  CrowdStrike: ({ className, color }) => (
    <svg viewBox="0 0 24 24" className={className} fill={color ?? "currentColor"}>
      <path d="M12 3.5 L20 8.5l-3.5 2L12 8 8 10.5 4 8.5zM4 14 L12 20l8-6-3.5-1.5L12 15.5 8 13z" />
    </svg>
  ),

  Microsoft: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className}>
      <rect x="3"    y="3"    width="8.4" height="8.4" fill="#F25022" />
      <rect x="12.6" y="3"   width="8.4" height="8.4" fill="#7FBA00" />
      <rect x="3"    y="12.6" width="8.4" height="8.4" fill="#00A4EF" />
      <rect x="12.6" y="12.6" width="8.4" height="8.4" fill="#FFB900" />
    </svg>
  ),

  Proofpoint: ({ className, color }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M6 21V3h8a5.5 5.5 0 0 1 0 11H9"
        stroke={color ?? "currentColor"}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  Okta: ({ className, color }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="12" cy="12" r="7.5" stroke={color ?? "currentColor"} strokeWidth="3" />
      <circle cx="12" cy="12" r="2.5" fill={color ?? "currentColor"} />
    </svg>
  ),

  Atlassian: ({ className, color }) => (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        d="M7.5 13.5 C6.5 12 5.5 9 6.5 5 L11.5 14 Z"
        fill={color ?? "currentColor"}
        opacity="0.7"
      />
      <path
        d="M11.5 5 C12.5 9 13.5 12 17.5 14 L12.5 14 Z"
        fill={color ?? "currentColor"}
      />
      <path
        d="M7 14 L12 22 L17 14 Z"
        fill={color ?? "currentColor"}
        opacity="0.85"
      />
    </svg>
  ),

  Google: ({ className, color }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M21 12c0-5-4-9-9-9a9 9 0 1 0 0 18c4 0 7-2.5 8-6h-8v-3h11c.1.6.1 1.3.1 2 0 5.5-4.1 9.5-9.1 9.5"
        stroke={color ?? "currentColor"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M12 12h9" stroke={color ?? "currentColor"} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),

  "Palo Alto": ({ className, color }) => (
    <svg viewBox="0 0 24 24" className={className} fill={color ?? "currentColor"}>
      <rect x="10.5" y="3"    width="3" height="18" rx="1.5" />
      <rect x="4.5"  y="8"    width="3" height="13" rx="1.5" />
      <rect x="16.5" y="8"    width="3" height="13" rx="1.5" />
    </svg>
  ),
}

function FallbackInitial(vendor: string): (p: LogoProps) => React.ReactElement {
  return ({ className, color }: LogoProps) => (
    <span
      className={`grid place-items-center text-sm font-bold ${className ?? ""}`}
      style={{ color: color ?? "currentColor" }}
    >
      {vendor.slice(0, 2).toUpperCase()}
    </span>
  )
}
