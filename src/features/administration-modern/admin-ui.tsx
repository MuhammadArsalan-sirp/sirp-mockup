/**
 * Shared admin primitives — keeps every admin page on the same chemistry.
 * Follows the dashboard / incident-detail chemistry rules from CLAUDE.md:
 *   - Card → CardContent px-5 py-4
 *   - Section labels: text-[11px] font-medium uppercase tracking-wider
 *   - KPI value: font-medium text-2xl tabular-nums leading-none tracking-tight
 *   - Tone palette comes from the canonical @/lib/tone (alert | warn | ok | info | muted)
 */
import type { ElementType, ReactNode } from "react"
import { ChevronRight, Search } from "lucide-react"
import { Link } from "react-router"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { TONE, type Tone } from "@/lib/tone"

// ─── tone palette ─────────────────────────────────────────────────
// Re-export so admin pages keep their existing import surface.

export { type Tone }

export const toneClasses: Record<Tone, string> = {
  muted: TONE.muted.chip,
  info:  TONE.info.chip,
  warn:  TONE.warn.chip,
  alert: TONE.alert.chip,
  ok:    TONE.ok.chip,
}

export const toneDots: Record<Tone, string> = {
  muted: TONE.muted.dot,
  info:  TONE.info.dot,
  warn:  TONE.warn.dot,
  alert: TONE.alert.dot,
  ok:    TONE.ok.dot,
}

export const toneBars: Record<Tone, string> = {
  muted: TONE.muted.bar,
  info:  TONE.info.bar,
  warn:  TONE.warn.bar,
  alert: TONE.alert.bar,
  ok:    TONE.ok.bar,
}

// ─── section label / heading ──────────────────────────────────────

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "text-[11px] font-medium uppercase tracking-wider text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  )
}

// ─── DataCard — flexible wrapper used by most panels ──────────────
//
// Header zone (border-b, px-5 py-3) and body zone (px-5 py-4 by default) are
// independent: divide-y row patterns can opt out of body padding via
// `bodyPadding="none"` and still get a properly padded title.

export function DataCard({
  title,
  description,
  icon: Icon,
  action,
  count,
  children,
  className,
  bodyPadding = "default",
  bodyClassName,
}: {
  title?: string
  description?: ReactNode
  icon?: ElementType
  action?: ReactNode
  count?: number | string
  children: ReactNode
  className?: string
  bodyPadding?: "default" | "none"
  bodyClassName?: string
}) {
  const hasHeader = Boolean(title || Icon || action || count !== undefined)
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0">
        {hasHeader && (
          <div className="flex items-center justify-between gap-4 border-b px-5 py-3">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {Icon && <Icon className="size-3.5 shrink-0 text-muted-foreground" />}
              {title && <SectionLabel>{title}</SectionLabel>}
              {count !== undefined && (
                <span className="font-mono text-xs tabular-nums text-muted-foreground/70">
                  {count}
                </span>
              )}
            </div>
            {action}
          </div>
        )}
        {description && (
          <p className="px-5 pt-4 text-sm text-muted-foreground">{description}</p>
        )}
        <div
          className={cn(
            bodyPadding === "default" && "px-5 py-4",
            bodyClassName
          )}
        >
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Icon-in-tile (used for label headers) ────────────────────────

export function ToneIcon({
  icon: Icon,
  tone = "muted",
  size = "md",
}: {
  icon: ElementType
  tone?: Tone
  size?: "sm" | "md" | "lg"
}) {
  const dim = size === "sm" ? "size-7" : size === "lg" ? "size-10" : "size-8"
  const icoSize = size === "sm" ? "size-3.5" : size === "lg" ? "size-5" : "size-4"
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-lg",
        dim,
        toneClasses[tone]
      )}
    >
      <Icon className={icoSize} />
    </span>
  )
}

// ─── ToneChip — for small status pills ────────────────────────────

export function ToneChip({
  tone = "muted",
  icon: Icon,
  children,
  className,
}: {
  tone?: Tone
  icon?: ElementType
  children: ReactNode
  className?: string
}) {
  return (
    <Badge
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        toneClasses[tone],
        className
      )}
    >
      {Icon && <Icon className="size-3" />}
      {children}
    </Badge>
  )
}

// ─── StatusDot ────────────────────────────────────────────────────

export function StatusDot({ tone = "muted", className }: { tone?: Tone; className?: string }) {
  return <span className={cn("inline-block size-1.5 rounded-full", toneDots[tone], className)} />
}

// ─── KpiCard — uniform KPI block ──────────────────────────────────

export function KpiCard({
  icon: Icon,
  label,
  value,
  unit,
  delta,
  caption,
  progress,
  tone = "muted",
}: {
  icon: ElementType
  label: string
  value: ReactNode
  unit?: ReactNode
  delta?: { value: ReactNode; tone?: Tone }
  caption?: ReactNode
  progress?: { value: number; tone?: Tone }
  tone?: Tone
}) {
  return (
    <Card>
      <CardContent className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <SectionLabel>{label}</SectionLabel>
          <ToneIcon icon={Icon} tone={tone} size="sm" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-medium text-2xl leading-none tracking-tight tabular-nums">
            {value}
          </span>
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
          {delta && (
            <span
              className={cn(
                "text-xs font-medium",
                delta.tone === "ok"   && "text-emerald-600 dark:text-emerald-400",
                delta.tone === "warn" && "text-amber-600 dark:text-amber-400",
                delta.tone === "alert" && "text-destructive",
                !delta.tone && "text-muted-foreground"
              )}
            >
              {delta.value}
            </span>
          )}
        </div>
        {progress && (
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full", toneBars[progress.tone ?? "info"])}
              style={{ width: `${Math.min(100, Math.max(0, progress.value))}%` }}
            />
          </div>
        )}
        {caption && (
          <div className="mt-2 text-xs text-muted-foreground">{caption}</div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── FormRow — label + value layout for settings pages ────────────

export function FormRow({
  label,
  hint,
  children,
  className,
}: {
  label: ReactNode
  hint?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 border-b py-4 last:border-b-0 last:pb-0 sm:grid-cols-[220px_1fr] sm:items-start sm:gap-6",
        className
      )}
    >
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {hint && (
          <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</div>
        )}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

// ─── SettingsCard — section card for forms ────────────────────────

export function SettingsCard({
  icon: Icon,
  title,
  description,
  action,
  tone = "muted",
  children,
}: {
  icon: ElementType
  title: string
  description?: ReactNode
  action?: ReactNode
  tone?: Tone
  children: ReactNode
}) {
  return (
    <Card>
      <CardContent className="px-5 py-4">
        <div className="flex items-start justify-between gap-3 border-b pb-4">
          <div className="flex items-start gap-3">
            <ToneIcon icon={Icon} tone={tone} />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold leading-tight">{title}</h3>
              {description && (
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          </div>
          {action}
        </div>
        <div className="pt-1">{children}</div>
      </CardContent>
    </Card>
  )
}

// ─── LinkRow — a single navigable row used in lists ───────────────

export function LinkRow({
  to,
  icon: Icon,
  title,
  description,
  meta,
  tone = "muted",
}: {
  to: string
  icon: ElementType
  title: ReactNode
  description?: ReactNode
  meta?: ReactNode
  tone?: Tone
}) {
  return (
    <Link
      to={to}
      className="group grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-accent"
    >
      <ToneIcon icon={Icon} tone={tone} size="sm" />
      <div className="min-w-0">
        <div className="truncate text-sm font-medium leading-tight">{title}</div>
        {description && (
          <div className="mt-0.5 truncate text-xs text-muted-foreground">{description}</div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {meta}
        <ChevronRight className="size-4 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

// ─── Stat tile (compact, used in dense KPI strips) ────────────────

export function StatTile({
  label,
  value,
  caption,
  tone,
}: {
  label: ReactNode
  value: ReactNode
  caption?: ReactNode
  tone?: Tone
}) {
  return (
    <Card>
      <CardContent className="px-5 py-4">
        <SectionLabel>{label}</SectionLabel>
        <div
          className={cn(
            "mt-2 font-medium text-2xl leading-none tracking-tight tabular-nums",
            tone === "alert" && "text-destructive",
            tone === "warn" && "text-amber-600 dark:text-amber-400",
            tone === "ok" && "text-emerald-600 dark:text-emerald-400"
          )}
        >
          {value}
        </div>
        {caption && <div className="mt-1.5 text-xs text-muted-foreground">{caption}</div>}
      </CardContent>
    </Card>
  )
}

// ─── Toggle row (visual only — mockup) ────────────────────────────

export function ToggleRow({
  label,
  description,
  enabled,
  badge,
}: {
  label: ReactNode
  description?: ReactNode
  enabled: boolean
  badge?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-medium">
          {label}
          {badge}
        </div>
        {description && (
          <div className="mt-0.5 text-xs text-muted-foreground">{description}</div>
        )}
      </div>
      <span
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
          enabled ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "inline-block size-3.5 rounded-full bg-white shadow transition-transform",
            enabled ? "translate-x-4.5" : "translate-x-1"
          )}
        />
      </span>
    </div>
  )
}

// ─── Read-only "input-like" pill for settings displays ────────────

export function ReadValue({
  children,
  mono = false,
  className,
}: {
  children: ReactNode
  mono?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "inline-flex h-9 min-w-0 max-w-full items-center rounded-md border bg-muted/40 px-3 text-sm text-foreground/90",
        mono && "font-mono text-xs",
        className
      )}
    >
      <span className="truncate">{children}</span>
    </div>
  )
}

// ─── Sparkline (inline SVG, 60×18) ────────────────────────────────

export function Sparkline({ data, tone = "info" }: { data: number[]; tone?: Tone }) {
  if (!data.length) return null
  const w = 60
  const h = 18
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = w / (data.length - 1 || 1)
  const points = data
    .map((d, i) => `${(i * step).toFixed(1)},${(h - ((d - min) / range) * (h - 2) - 1).toFixed(1)}`)
    .join(" ")
  const stroke =
    tone === "ok" ? "rgb(16 185 129)" :
    tone === "warn" ? "rgb(245 158 11)" :
    tone === "alert" ? "var(--destructive)" :
    tone === "muted" ? "var(--muted-foreground)" :
    "var(--primary)"
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

// ─── Filter chemistry — matches incidents-toolbar canonical pattern ──

/**
 * Standard search input used at the top of every admin list page.
 * Width: 260px on md+, full width on mobile.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
  width = "default",
}: {
  value?: string
  onChange?: (next: string) => void
  placeholder?: string
  className?: string
  width?: "default" | "wide" | "full"
}) {
  return (
    <div
      className={cn(
        "relative",
        width === "default" && "w-full md:w-65",
        width === "wide" && "w-full md:w-80",
        width === "full" && "w-full",
        className
      )}
    >
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="h-9 pl-9"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  )
}

/**
 * Container for the standard search + filter row at the top of a list page.
 * Children render as direct flex items (search input, spacers, popover).
 */
export function FilterBar({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {children}
    </div>
  )
}
