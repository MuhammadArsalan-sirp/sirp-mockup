import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/* ── Section wrapper with anchor target ──────────────────────────────────── */

export function Section({
  id, title, eyebrow, description, children,
}: {
  id: string
  title: string
  eyebrow?: string
  description?: ReactNode
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20 space-y-6 border-b py-10 last:border-b-0">
      <div>
        {eyebrow && (
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-primary/80">
            {eyebrow}
          </div>
        )}
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}

/* ── Sub-section: smaller heading + content ─────────────────────────────── */

export function SubSection({
  title, description, children,
}: {
  title: string
  description?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        {description && (
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}

/* ── Preview: surface for showcasing a live component ──────────────────── */

export function Preview({
  children, label, code, dense = false, dark = false,
}: {
  children: ReactNode
  /** Optional label above the preview */
  label?: string
  /** Optional code snippet rendered below the preview */
  code?: string
  /** Tighter padding for inline previews */
  dense?: boolean
  /** Force dark background (for elements that only look right on dark) */
  dark?: boolean
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      {label && (
        <div className="border-b bg-muted/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
      )}
      <div className={cn(
        "flex items-center justify-center gap-3",
        dense ? "px-3 py-3" : "px-5 py-6",
        dark && "bg-zinc-900",
      )}>
        {children}
      </div>
      {code && (
        <pre className="overflow-x-auto border-t bg-muted/10 px-3 py-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
          <code>{code}</code>
        </pre>
      )}
    </div>
  )
}

/* ── Code: inline code chip ─────────────────────────────────────────────── */

export function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground/85">
      {children}
    </code>
  )
}

/* ── TokenRow: token table row (label, value, optional preview) ────────── */

export function TokenRow({
  label, value, preview,
}: {
  label: string
  value: ReactNode
  preview?: ReactNode
}) {
  return (
    <div className="grid grid-cols-[1fr_1.2fr_auto] items-center gap-4 border-b py-2 last:border-b-0">
      <span className="font-mono text-xs text-foreground/85">{label}</span>
      <span className="font-mono text-[11px] text-muted-foreground">{value}</span>
      {preview && <div className="shrink-0">{preview}</div>}
    </div>
  )
}

/* ── ColorSwatch: a color chip with label + value ──────────────────────── */

export function ColorSwatch({
  name, value, css, dark = false,
}: {
  name: string
  /** CSS color value (hex, var(--name), etc.) used for the chip background */
  value: string
  /** The CSS variable / token name shown beneath */
  css?: string
  dark?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          "h-12 w-full rounded-lg border shadow-sm",
          dark && "border-white/10",
        )}
        style={{ background: value }}
      />
      <div>
        <div className="text-xs font-medium leading-tight">{name}</div>
        {css && <div className="font-mono text-[10px] text-muted-foreground">{css}</div>}
      </div>
    </div>
  )
}

/* ── Do / Don't side-by-side cards ─────────────────────────────────────── */

export function DoCard({ children, label = "Do" }: { children: ReactNode; label?: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-emerald-500/30 bg-emerald-500/5">
      <div className="flex items-center gap-1.5 border-b border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        {label}
      </div>
      <div className="px-4 py-3 text-sm leading-relaxed">{children}</div>
    </div>
  )
}

export function DontCard({ children, label = "Don't" }: { children: ReactNode; label?: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-destructive/30 bg-destructive/5">
      <div className="flex items-center gap-1.5 border-b border-destructive/20 bg-destructive/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-destructive">
        <span className="size-1.5 rounded-full bg-destructive" />
        {label}
      </div>
      <div className="px-4 py-3 text-sm leading-relaxed">{children}</div>
    </div>
  )
}
