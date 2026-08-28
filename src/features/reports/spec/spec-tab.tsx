import { Link } from "react-router"
import { ArrowUpRight, CircleAlert, CircleCheck, CircleDot } from "lucide-react"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/shared/page-header"
import { BACKING_LABEL, PORTING_NOTES, specEntries, type Backing } from "./spec-data"
import { NotesToggle } from "./annotations"

const TONE: Record<Backing, string> = {
  backed: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  partial: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  none: "border-destructive/25 bg-destructive/10 text-destructive",
}

const ICON: Record<Backing, typeof CircleCheck> = {
  backed: CircleCheck,
  partial: CircleDot,
  none: CircleAlert,
}

const SCREENS = [
  { path: "/reports/overview", label: "Overview", note: "List, KPIs, entry points" },
  { path: "/reports/new", label: "Compose", note: "Prompt → interpretation → plan" },
  { path: "/reports/templates", label: "Templates", note: "Gallery, versions" },
  { path: "/reports/saved-exports", label: "Saved Exports", note: "Excel snapshots, gated actions" },
  { path: "/reports/scheduled", label: "Scheduled", note: "Recurrences, audience variants" },
  { path: "/reports/history", label: "History", note: "Generation log" },
  { path: "/reports/studio", label: "Studio", note: "Document, Co-Analyst dock, review mode" },
]

const STATES = [
  { path: "/reports/overview?state=loading", label: "Loading", note: "Skeletons per widget" },
  { path: "/reports/overview?state=empty", label: "Empty", note: "First-run, nothing created yet" },
  { path: "/reports/overview?state=error", label: "Error", note: "Fetch failed, retry offered" },
  { path: "/reports/overview?state=denied", label: "Permission denied", note: "Role can't read reports" },
]

/**
 * The signoff index. One page an engineer can read start to finish before
 * porting: every screen, every state, what's actually backed, and the
 * conventions delta.
 */
export function SpecTab() {
  const counts = {
    backed: specEntries.filter((e) => e.backing === "backed").length,
    partial: specEntries.filter((e) => e.backing === "partial").length,
    none: specEntries.filter((e) => e.backing === "none").length,
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Spec & porting notes"
        description="What this mockup contains, what backs each surface, and what has to be built for v3."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(["backed", "partial", "none"] as Backing[]).map((backing) => {
          const Icon = ICON[backing]
          return (
            <div key={backing} className="rounded-xl border bg-card px-5 py-4">
              <div className="flex items-center gap-2">
                <span className={cn("grid size-7 place-items-center rounded-md border", TONE[backing])}>
                  <Icon className="size-3.5" />
                </span>
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {BACKING_LABEL[backing]}
                </span>
              </div>
              <div className="mt-2 text-2xl font-medium tabular-nums">{counts[backing]}</div>
              <p className="mt-0.5 text-xs text-muted-foreground">of {specEntries.length} surfaces</p>
            </div>
          )
        })}
      </div>

      <section className="rounded-xl border bg-card">
        <div className="border-b px-5 py-3">
          <div className="text-sm font-semibold">Every screen</div>
          <p className="text-[11px] text-muted-foreground">Walk these in order for a full review pass.</p>
        </div>
        <ul className="grid divide-y sm:grid-cols-2 sm:divide-y-0">
          {SCREENS.map((screen) => (
            <li key={screen.path} className="border-b last:border-b-0 sm:border-b">
              <Link to={screen.path} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-accent/50">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{screen.label}</div>
                  <div className="text-xs text-muted-foreground">{screen.note}</div>
                </div>
                <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border bg-card">
        <div className="border-b px-5 py-3">
          <div className="text-sm font-semibold">States</div>
          <p className="text-[11px] text-muted-foreground">
            Every list screen renders these on demand — no need to break the fixtures to see them.
          </p>
        </div>
        <ul className="divide-y">
          {STATES.map((state) => (
            <li key={state.path}>
              <Link to={state.path} className="flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-accent/50">
                <code className="rounded border bg-muted/60 px-1.5 py-0.5 font-mono text-[11px]">{state.label}</code>
                <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{state.note}</span>
                <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border bg-card">
        <div className="border-b px-5 py-3">
          <div className="text-sm font-semibold">Surface by surface</div>
          <p className="text-[11px] text-muted-foreground">
            Endpoints verified against react-go on <code className="font-mono">demo3</code>, not assumed.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-2">Screen</th>
                <th className="px-3 py-2">Surface</th>
                <th className="px-3 py-2">Backing</th>
                <th className="px-5 py-2">What it needs</th>
              </tr>
            </thead>
            <tbody>
              {specEntries.map((entry) => (
                <tr key={entry.id} className="border-b last:border-0 align-top">
                  <td className="px-5 py-2.5 text-xs text-muted-foreground">{entry.screen}</td>
                  <td className="px-3 py-2.5 text-xs font-medium">{entry.surface}</td>
                  <td className="px-3 py-2.5">
                    <span className={cn("inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-medium", TONE[entry.backing])}>
                      {BACKING_LABEL[entry.backing]}
                    </span>
                    {entry.endpoint && (
                      <code className="mt-1 block font-mono text-[10px] text-muted-foreground">{entry.endpoint}</code>
                    )}
                  </td>
                  <td className="px-5 py-2.5 text-xs leading-relaxed text-muted-foreground">{entry.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border bg-card">
        <div className="border-b px-5 py-3 text-sm font-semibold">Conventions delta for v3</div>
        <ul className="divide-y">
          {PORTING_NOTES.map((note) => (
            <li key={note.title} className="px-5 py-3">
              <div className="text-sm font-medium">{note.title}</div>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{note.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4">
        <div className="text-sm font-semibold text-destructive">Does not port</div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          The Supabase demo backend behind Schedule, Send and export logging stays in the mockup. Its policies are
          wide-open behind a public key, and hosted Postgres outside our infrastructure cannot hold tenant-scoped report
          data under KSA residency. Port the seam in <code className="font-mono">reports-backend.ts</code>; leave the
          client behind.
        </p>
      </div>

      <NotesToggle />
    </div>
  )
}
