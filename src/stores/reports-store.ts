import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Report, ReportFormat } from "@/data/reports"
import type { ReportModule } from "@/data/reports"
import { users } from "@/data/users"
import type { DocSettings, StudioBlock } from "@/features/reports/studio/report-studio-types"

/**
 * Saved reports.
 *
 * Two objects, not one — the distinction the module was missing:
 *
 *   definition  the document you edit: blocks, bindings, branding, layout.
 *               Saved, named, draft or published, and what a schedule attaches to.
 *   edition     one generated instance of that definition at a point in time.
 *               What gets exported, delivered, and listed in History.
 *
 * Persisted to localStorage so a mockup survives a refresh. In the platform
 * this is a table and a server-side renderer — the shapes below are the
 * contract that port would implement.
 */

export type ReportEdition = {
  id: string
  generatedAt: string
  trigger: "manual" | "schedule"
  format: ReportFormat | "HTML"
  blockCount: number
}

export type SavedReport = {
  id: string
  name: string
  status: "draft" | "published"
  module: ReportModule
  blocks: StudioBlock[]
  doc: DocSettings
  createdOn: string
  updatedOn: string
  savedAt: number
  isScheduled: boolean
  editions: ReportEdition[]
}

function stamp(): string {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function timeStamp(): string {
  return new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
}

type SaveInput = {
  id?: string | null
  name: string
  module: ReportModule
  blocks: StudioBlock[]
  doc: DocSettings
}

type ReportsState = {
  reports: SavedReport[]
  save: (input: SaveInput) => string
  publish: (id: string) => void
  unpublish: (id: string) => void
  remove: (id: string) => void
  get: (id: string) => SavedReport | undefined
  addEdition: (id: string, edition: Omit<ReportEdition, "id" | "generatedAt">) => void
  markScheduled: (id: string, scheduled: boolean) => void
}

export const useReportsStore = create<ReportsState>()(
  persist(
    (set, get) => ({
      reports: [],

      save: (input) => {
        const id = input.id ?? crypto.randomUUID()
        const now = Date.now()
        set((state) => {
          const existing = state.reports.find((r) => r.id === id)
          const next: SavedReport = existing
            ? { ...existing, name: input.name, module: input.module, blocks: input.blocks, doc: input.doc, updatedOn: stamp(), savedAt: now }
            : {
                id,
                name: input.name,
                status: "draft",
                module: input.module,
                blocks: input.blocks,
                doc: input.doc,
                createdOn: stamp(),
                updatedOn: stamp(),
                savedAt: now,
                isScheduled: false,
                editions: [],
              }
          return { reports: existing ? state.reports.map((r) => (r.id === id ? next : r)) : [next, ...state.reports] }
        })
        return id
      },

      publish: (id) =>
        set((state) => ({
          reports: state.reports.map((r) => (r.id === id ? { ...r, status: "published", updatedOn: stamp() } : r)),
        })),

      unpublish: (id) =>
        set((state) => ({
          reports: state.reports.map((r) => (r.id === id ? { ...r, status: "draft", updatedOn: stamp() } : r)),
        })),

      remove: (id) => set((state) => ({ reports: state.reports.filter((r) => r.id !== id) })),

      get: (id) => get().reports.find((r) => r.id === id),

      addEdition: (id, edition) =>
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === id
              ? {
                  ...r,
                  editions: [{ ...edition, id: crypto.randomUUID(), generatedAt: timeStamp() }, ...r.editions].slice(0, 25),
                }
              : r
          ),
        })),

      markScheduled: (id, scheduled) =>
        set((state) => ({ reports: state.reports.map((r) => (r.id === id ? { ...r, isScheduled: scheduled } : r)) })),
    }),
    { name: "sirp-reports", partialize: (s) => ({ reports: s.reports }) }
  )
)

/** Adapts a saved definition onto the row shape the shared reports table renders. */
export function toReportRow(saved: SavedReport): Report {
  return {
    id: saved.id,
    name: saved.name,
    description: `${saved.blocks.length} sections · ${saved.doc.timeRange.toLowerCase()}`,
    archetype: "template",
    format: "PDF",
    module: saved.module,
    status: saved.status,
    author: users.ahmed,
    createdOn: saved.createdOn,
    updatedOn: saved.updatedOn,
    sections: [],
    isScheduled: saved.isScheduled,
    generatedCount: saved.editions.length,
  }
}
