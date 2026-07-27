import { useState } from "react"
import { Eye, Palette, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import { DataCard, ToneChip } from "./admin-ui"

const DEFAULT_COLORS = { primary: "#10B981", accent: "#0D9488", highlight: "#F59E0B" }

export function AdminBrandingPage() {
  const [signatureOn, setSignatureOn] = useState(true)
  const [customFromOn, setCustomFromOn] = useState(false)
  const [colors, setColors] = useState(DEFAULT_COLORS)

  return (
    <div className="space-y-5">
      <PageHeader
        title="Branding & theme"
        description={
          <>
            Logo, favicon, brand colours, and email styling for{" "}
            <strong className="font-medium text-foreground">Acme Corp</strong>. Applied to the
            sidebar, reports, and outbound notifications.
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9">
              <Eye className="size-4 text-muted-foreground" />
              Preview email
            </Button>
            <Button size="sm" className="h-9">Save changes</Button>
          </>
        }
      />

      <DataCard icon={Palette} title="Logo & icon" bodyPadding="default">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Primary logo" hint="SVG preferred. Max 2 MB. Used in the sidebar tenant switcher and email headers.">
            <UploadCard
              preview={
                <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 font-bold text-white">
                  A
                </div>
              }
              filename="acme-logo.svg"
              meta="SVG · 4.2 KB · uploaded 2024-08-12"
              buttonLabel="Replace logo"
            />
          </Field>

          <Field label="Favicon" hint="PNG or ICO, 32×32 minimum. Shown in browser tabs.">
            <UploadCard
              preview={
                <div className="grid size-12 shrink-0 place-items-center rounded-md bg-linear-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white">
                  A
                </div>
              }
              filename="acme-favicon.png"
              meta="PNG · 32×32 · 1.8 KB"
              buttonLabel="Replace favicon"
            />
          </Field>
        </div>
      </DataCard>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        <DataCard icon={Palette} title="Brand colours" bodyPadding="default">
          <div className="grid grid-cols-3 gap-3">
            <ColorSwatch
              label="Primary"
              value={colors.primary}
              onChange={(v) => setColors((c) => ({ ...c, primary: v }))}
            />
            <ColorSwatch
              label="Accent"
              value={colors.accent}
              onChange={(v) => setColors((c) => ({ ...c, accent: v }))}
            />
            <ColorSwatch
              label="Highlight"
              value={colors.highlight}
              onChange={(v) => setColors((c) => ({ ...c, highlight: v }))}
            />
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs">
            <button className="text-primary hover:underline" onClick={() => setColors(DEFAULT_COLORS)}>
              Reset to SIRP defaults
            </button>
            <span className="text-muted-foreground">·</span>
            <button className="text-muted-foreground hover:text-foreground">Preview email theme →</button>
            <ToneChip tone="info" className="ml-auto">Enterprise feature</ToneChip>
          </div>
        </DataCard>

        <BrandingLivePreview colors={colors} />
      </div>

      <DataCard icon={Palette} title="Email customisation" bodyPadding="default">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            label={
              <span className="flex w-full items-center justify-between">
                Email signature
                <Switch checked={signatureOn} onChange={setSignatureOn} label="Enable email signature" />
              </span>
            }
            hint="Appended to all outbound notification emails."
          >
            <Textarea
              rows={4}
              defaultValue={`Acme Corp Security Operations
soc@acme.com · +44 20 7000 0000
Confidential — do not forward.`}
            />
          </Field>

          <Field
            label={
              <span className="flex w-full items-center justify-between">
                Custom email-from name
                <Switch checked={customFromOn} onChange={setCustomFromOn} label="Enable custom email-from name" />
              </span>
            }
            hint="Requires DNS verification of your sending domain."
          >
            <Input defaultValue="Acme SOC" disabled={!customFromOn} />
          </Field>
        </div>
      </DataCard>
    </div>
  )
}

// ─── Local helpers (single-page; not promoted to admin-ui yet) ───────

function Field({
  label,
  hint,
  children,
}: {
  label: React.ReactNode
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="block">{label}</Label>
      {children}
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  )
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-20 w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
        className
      )}
      {...props}
    />
  )
}

function UploadCard({
  preview,
  filename,
  meta,
  buttonLabel,
}: {
  preview: React.ReactNode
  filename: string
  meta: string
  buttonLabel: string
}) {
  return (
    <div className="rounded-xl border border-dashed bg-card/50 p-4">
      <div className="flex items-center gap-3">
        {preview}
        <div className="min-w-0 flex-1 text-left">
          <div className="truncate text-sm font-medium">{filename}</div>
          <div className="truncate text-xs text-muted-foreground">{meta}</div>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Remove file">
          <X className="size-3.5" />
        </Button>
      </div>
      <Button variant="outline" size="sm" className="mt-3 h-8 w-full">
        <Upload className="size-3.5" />
        {buttonLabel}
      </Button>
    </div>
  )
}

function ColorSwatch({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (next: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <label className="relative flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-md border bg-background pl-2 pr-3 text-left text-sm transition-colors hover:bg-accent">
        <span
          className="size-5 shrink-0 rounded ring-1 ring-inset ring-border"
          style={{ background: value }}
        />
        <span className="font-mono text-xs uppercase">{value}</span>
        <span className="ml-auto text-muted-foreground">▾</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
          aria-label={`${label} colour`}
        />
      </label>
    </div>
  )
}

/**
 * A live-updating miniature of the actual chrome (sidebar + topbar) instead
 * of only an email preview — the one place brand colours show up most, and
 * the one place a swatch-and-hex-code page never lets you actually see.
 */
function BrandingLivePreview({ colors }: { colors: typeof DEFAULT_COLORS }) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="border-b px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Live preview
      </div>
      <div className="p-3">
        <div className="overflow-hidden rounded-lg border">
          <div className="flex h-7 items-center gap-1.5 border-b bg-muted/40 px-2.5">
            <span className="size-1.5 rounded-full bg-muted-foreground/30" />
            <span className="size-1.5 rounded-full bg-muted-foreground/30" />
            <span className="size-1.5 rounded-full bg-muted-foreground/30" />
          </div>
          <div className="flex h-44">
            <div className="flex w-20 flex-col gap-1.5 border-r bg-muted/20 p-2">
              <div className="mb-1 flex items-center gap-1.5">
                <span
                  className="grid size-4 shrink-0 place-items-center rounded text-[8px] font-bold text-white"
                  style={{ background: colors.primary }}
                >
                  A
                </span>
                <span className="h-1.5 w-8 rounded-full bg-muted-foreground/20" />
              </div>
              <div
                className="flex items-center gap-1 rounded px-1.5 py-1"
                style={{ background: `${colors.primary}1a` }}
              >
                <span className="size-2 shrink-0 rounded-full" style={{ background: colors.primary }} />
                <span className="h-1.5 w-9 rounded-full" style={{ background: colors.primary }} />
              </div>
              {[6, 7, 5].map((w, i) => (
                <div key={i} className="flex items-center gap-1 px-1.5 py-1">
                  <span className="size-2 shrink-0 rounded-full bg-muted-foreground/25" />
                  <span className="h-1.5 rounded-full bg-muted-foreground/20" style={{ width: `${w * 4}px` }} />
                </div>
              ))}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-2.5">
              <div className="flex items-center justify-between">
                <span className="h-2 w-16 rounded-full bg-muted-foreground/25" />
                <span
                  className="rounded px-1.5 py-0.5 text-[8px] font-medium text-white"
                  style={{ background: colors.primary }}
                >
                  Invite user
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="rounded border p-1.5">
                  <span className="block h-1 w-6 rounded-full bg-muted-foreground/20" />
                  <span className="mt-1 block h-2 w-8 rounded-full" style={{ background: colors.accent }} />
                </div>
                <div className="relative rounded border p-1.5">
                  <span
                    className="absolute top-1 right-1 size-1.5 rounded-full"
                    style={{ background: colors.highlight }}
                  />
                  <span className="block h-1 w-6 rounded-full bg-muted-foreground/20" />
                  <span className="mt-1 block h-2 w-7 rounded-full bg-muted-foreground/25" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">Sidebar, active nav, and buttons — updates as you pick.</p>
      </div>
    </div>
  )
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        checked ? "bg-primary" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "inline-block size-3.5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-4.5" : "translate-x-0.5"
        )}
      />
    </button>
  )
}
