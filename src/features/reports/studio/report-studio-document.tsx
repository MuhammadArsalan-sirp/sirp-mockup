import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ACCENTS, type DocSettings, type PageMargin, type PageOrientation, type PageSize } from "./report-studio-types"

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-[11px] leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  )
}

function Choice<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { v: T; l: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="flex gap-1.5 rounded-lg border bg-muted/40 p-1">
      {options.map((opt) => (
        <button
          key={opt.v}
          type="button"
          onClick={() => onChange(opt.v)}
          className={cn(
            "flex-1 rounded-md py-1.5 text-[11px] font-medium transition-colors",
            value === opt.v ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
          )}
        >
          {opt.l}
        </button>
      ))}
    </div>
  )
}

/**
 * Report-level settings: how the page is set up, how it's branded, and what the
 * {{variables}} resolve to. Kept out of the per-block panel deliberately —
 * these apply to every page, and burying them in a block's properties is how
 * you end up with three cover pages disagreeing about the tenant name.
 */
export function DocumentSettingsDialog({
  open,
  onOpenChange,
  doc,
  onChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  doc: DocSettings
  onChange: (patch: Partial<DocSettings>) => void
}) {
  const [newVar, setNewVar] = useState("")

  function setVar(key: string, value: string) {
    onChange({ variables: { ...doc.variables, [key]: value } })
  }

  function removeVar(key: string) {
    const next = { ...doc.variables }
    delete next[key]
    onChange({ variables: next })
  }

  function addVar() {
    const key = newVar.trim().replace(/[^a-zA-Z0-9_]/g, "")
    if (!key) return
    setVar(key, "")
    setNewVar("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Document settings</DialogTitle>
          <DialogDescription>Page setup, branding and variables — applied to every page of this report.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="page">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="page" className="text-xs">Page</TabsTrigger>
            <TabsTrigger value="brand" className="text-xs">Branding</TabsTrigger>
            <TabsTrigger value="vars" className="text-xs">Variables</TabsTrigger>
          </TabsList>

          <TabsContent value="page" className="space-y-4 pt-4">
            <Field label="Paper size">
              <Choice<PageSize>
                value={doc.pageSize}
                options={[{ v: "A4", l: "A4" }, { v: "Letter", l: "US Letter" }]}
                onChange={(v) => onChange({ pageSize: v })}
              />
            </Field>
            <Field label="Orientation">
              <Choice<PageOrientation>
                value={doc.orientation}
                options={[{ v: "portrait", l: "Portrait" }, { v: "landscape", l: "Landscape" }]}
                onChange={(v) => onChange({ orientation: v })}
              />
            </Field>
            <Field label="Margins">
              <Choice<PageMargin>
                value={doc.margin}
                options={[{ v: "narrow", l: "Narrow" }, { v: "normal", l: "Normal" }, { v: "wide", l: "Wide" }]}
                onChange={(v) => onChange({ margin: v })}
              />
            </Field>
            <Field label="Running header" hint="Repeats at the top of every page. Supports {{variables}}.">
              <Input value={doc.headerText} onChange={(e) => onChange({ headerText: e.target.value })} />
            </Field>
            <Field label="Running footer">
              <Input value={doc.footerText} onChange={(e) => onChange({ footerText: e.target.value })} />
            </Field>
            <div className="flex items-center justify-between rounded-lg border p-2.5">
              <div className="text-xs font-medium">Page numbers</div>
              <Switch checked={doc.showPageNumbers} onCheckedChange={(v) => onChange({ showPageNumbers: v })} />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border p-2.5">
              <div className="min-w-0">
                <div className="text-xs font-medium">Repeat classification banner</div>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                  Prints the TLP marking on every page, not just the cover — required for most distribution policies.
                </p>
              </div>
              <Switch checked={doc.repeatClassification} onCheckedChange={(v) => onChange({ repeatClassification: v })} />
            </div>
          </TabsContent>

          <TabsContent value="brand" className="space-y-4 pt-4">
            <Field label="Logo mark" hint="Shown in the running header. A real tenant logo uploads here.">
              <Input value={doc.logoText} onChange={(e) => onChange({ logoText: e.target.value })} maxLength={12} />
            </Field>
            <Field label="Accent">
              <div className="grid grid-cols-2 gap-1.5">
                {ACCENTS.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => onChange({ accent: a.value })}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-2.5 py-2 text-[11px] font-medium transition-colors",
                      doc.accent === a.value ? "border-primary/40 bg-primary/5" : "hover:bg-accent"
                    )}
                  >
                    <span className="size-3 rounded-full" style={{ background: a.value }} />
                    {a.label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Body typeface">
              <Choice<"sans" | "serif">
                value={doc.bodyFont}
                options={[{ v: "sans", l: "Sans" }, { v: "serif", l: "Serif" }]}
                onChange={(v) => onChange({ bodyFont: v })}
              />
            </Field>
            <p className="rounded-lg border bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
              Branding is per report here. In the platform it inherits from the tenant, so a customer-facing report
              carries their marks and an internal one carries yours.
            </p>
          </TabsContent>

          <TabsContent value="vars" className="space-y-3 pt-4">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Write <code className="rounded bg-muted px-1 py-0.5 font-mono">{"{{tenant}}"}</code> anywhere in the
              document and it resolves at render. Unknown tokens stay visible rather than printing blank.
            </p>
            <div className="space-y-1.5">
              {Object.entries(doc.variables).map(([key, value]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <code className="w-32 shrink-0 truncate rounded-md border bg-muted/60 px-2 py-1.5 font-mono text-[11px]">
                    {`{{${key}}}`}
                  </code>
                  <Input value={value} onChange={(e) => setVar(key, e.target.value)} className="h-8 text-xs" />
                  <button
                    type="button"
                    onClick={() => removeVar(key)}
                    className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Remove ${key}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 border-t pt-3">
              <Input
                value={newVar}
                onChange={(e) => setNewVar(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addVar()}
                placeholder="new_variable"
                className="h-8 font-mono text-xs"
              />
              <Button size="sm" variant="outline" className="h-8 shrink-0" onClick={addVar} disabled={!newVar.trim()}>
                <Plus className="size-3.5" />
                Add
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button size="sm" onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
