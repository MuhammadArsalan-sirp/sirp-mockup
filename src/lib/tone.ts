/**
 * Canonical tone palette — the load-bearing color system of the entire mockup.
 *
 * Rule: **muted is the default. Color is a signal.**
 * Most surfaces stay muted; tone is reserved for the *one* element per zone
 * that carries actionable meaning (verdict callout, severity pill, status dot).
 *
 * The five tones map to semantic categories, NOT brand colors:
 *   alert → critical, destructive, "this is bad"
 *   warn  → caution, suspicious, "this needs attention"
 *   ok    → clean, healthy, "this is good"
 *   info  → primary CTA, "current / focused / branded action"
 *   muted → default, neutral, "no signal — just data"
 */

export type Tone = "alert" | "warn" | "ok" | "info" | "muted"

export const TONES: Tone[] = ["alert", "warn", "ok", "info", "muted"]

export type ToneTokens = {
  /** `grid size-N place-items-center rounded-lg border [iconBox]` — icon-in-tone-box */
  iconBox: string
  /** Inline chip with border + tinted bg + tone text */
  chip:    string
  /** Subtle tone-tinted bg for a card region (verdict callouts, etc.) */
  bg:      string
  /** Tone-colored text only (no border/bg) — for inline labels */
  text:    string
  /** Small tone-colored dot indicator (size-1.5 / size-2) */
  dot:     string
  /** Tone-colored bar (progress, stripes) */
  bar:     string
}

export const TONE: Record<Tone, ToneTokens> = {
  alert: {
    iconBox: "border-destructive/30 bg-destructive/10 text-destructive",
    chip:    "border-destructive/25 bg-destructive/10 text-destructive",
    bg:      "bg-destructive/5",
    text:    "text-destructive",
    dot:     "bg-destructive",
    bar:     "bg-destructive",
  },
  warn: {
    iconBox: "border-amber-500/30 bg-amber-500/10 text-amber-500",
    chip:    "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    bg:      "bg-amber-500/5",
    text:    "text-amber-600 dark:text-amber-400",
    dot:     "bg-amber-500",
    bar:     "bg-amber-500",
  },
  ok: {
    iconBox: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
    chip:    "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    bg:      "bg-emerald-500/5",
    text:    "text-emerald-600 dark:text-emerald-400",
    dot:     "bg-emerald-500",
    bar:     "bg-emerald-500",
  },
  info: {
    iconBox: "border-primary/30 bg-primary/10 text-primary",
    chip:    "border-primary/25 bg-primary/10 text-primary",
    bg:      "bg-primary/5",
    text:    "text-primary",
    dot:     "bg-primary",
    bar:     "bg-primary",
  },
  muted: {
    iconBox: "border bg-muted text-muted-foreground",
    chip:    "border bg-muted text-muted-foreground",
    bg:      "bg-muted/40",
    text:    "text-foreground",
    dot:     "bg-muted-foreground/50",
    bar:     "bg-muted-foreground/40",
  },
}

export const TONE_LABEL: Record<Tone, string> = {
  alert: "Alert",
  warn:  "Warn",
  ok:    "OK",
  info:  "Info",
  muted: "Muted",
}

export const TONE_DESCRIPTION: Record<Tone, string> = {
  alert: "Critical signals — confirmed threats, malicious enrichment, breached SLA, destructive actions.",
  warn:  "Caution signals — suspicious enrichment, warning SLA, attention-needed states.",
  ok:    "Positive signals — clean verdicts, healthy SLA, completed states.",
  info:  "Primary signals — done agents, primary CTAs, current stage, brand affordances.",
  muted: "Default. Everywhere a tone isn't a signal. Status hints, secondary text, neutral chrome.",
}
