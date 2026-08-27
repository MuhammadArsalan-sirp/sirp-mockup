/**
 * The porting registry. Every surface in the Reports module, what backs it
 * today, and what an engineer has to build to ship it in v3.
 *
 * Endpoint facts were verified against react-go on `demo3`
 * (endpoints.config.js, reportManagementSaga.js) — not assumed from the
 * mockup's own comments, two of which were out of date.
 */

export type Backing = "backed" | "partial" | "none"

export type SpecEntry = {
  id: string
  screen: string
  surface: string
  backing: Backing
  endpoint?: string
  note: string
}

export const BACKING_LABEL: Record<Backing, string> = {
  backed: "Real endpoint exists",
  partial: "Partly backed",
  none: "No backend",
}

export const specEntries: SpecEntry[] = [
  {
    id: "sp-list",
    screen: "Overview",
    surface: "Report list, create, edit, delete",
    backing: "backed",
    endpoint: "GET/POST/DELETE /report · /report/{id}",
    note: "Straight port. Endpoint URL belongs in -lib/queries.ts only.",
  },
  {
    id: "sp-kpis",
    screen: "Overview",
    surface: "KPI cards (total, scheduled, generated, drafts)",
    backing: "none",
    note: "No /report/stats on demo3 — Taha's v3 scaffold calls one and will 404. Count client-side from the list, or ship the cards behind a new endpoint.",
  },
  {
    id: "sp-templates",
    screen: "Templates",
    surface: "Template gallery",
    backing: "none",
    note: "react-go's own reportTemplatesSaga returns hardcoded MOCK_TEMPLATES. Mock on both sides — needs a real templates table before it means anything.",
  },
  {
    id: "sp-versions",
    screen: "Templates",
    surface: "Template versioning",
    backing: "none",
    note: "New in this design. Needs version rows plus a publish action.",
  },
  {
    id: "sp-exports",
    screen: "Saved Exports",
    surface: "Excel snapshot list + gating",
    backing: "backed",
    endpoint: "GET /report (rp_type = EXCEL)",
    note: "Same table as reports; the Edit/Duplicate/Generate gating mirrors react-go's Reports/index.jsx.",
  },
  {
    id: "sp-schedule-one",
    screen: "Scheduled",
    surface: "Per-report schedule create/edit",
    backing: "backed",
    endpoint: "GET/POST /scheduler · /scheduler/{id}",
    note: "Straight port.",
  },
  {
    id: "sp-schedule-all",
    screen: "Scheduled",
    surface: "Cross-report schedule listing",
    backing: "backed",
    endpoint: "GET /scheduler/organization",
    note: "Corrects an out-of-date comment in the earlier mockup: this endpoint does exist. It 403s for some roles — react-go treats that as an empty list, so do the same.",
  },
  {
    id: "sp-variants",
    screen: "Scheduled",
    surface: "Audience variants + per-recipient redaction",
    backing: "none",
    note: "New. Needs variant rows on the schedule and a redaction policy the renderer honours.",
  },
  {
    id: "sp-history",
    screen: "History",
    surface: "Generation log",
    backing: "none",
    note: "No endpoint on either branch. Zainab's Supabase demo logs exports client-side — that write has to move server-side.",
  },
  {
    id: "sp-export",
    screen: "Studio · Export",
    surface: "PDF / Excel / CSV / HTML generation",
    backing: "partial",
    endpoint: "GET /report/template/export",
    note: "Client-side render (html-to-image + jsPDF + xlsx) works today and is worth keeping. Server-side rendering is what makes scheduled delivery possible without a browser.",
  },
  {
    id: "sp-studio",
    screen: "Studio",
    surface: "Block document, layout, page setup, branding, variables",
    backing: "none",
    note: "The whole document model is new. Needs a stored block schema — specs over prompts (ADR 0007): type the document, generate the renderer from it.",
  },
  {
    id: "sp-library",
    screen: "Studio",
    surface: "Block library",
    backing: "none",
    note: "New. Org-level and personal saved blocks.",
  },
  {
    id: "sp-compose",
    screen: "Compose",
    surface: "Prompt → interpretation → plan",
    backing: "none",
    note: "New. The plan is a typed contract, not free text — that's what makes it correctable before generation.",
  },
  {
    id: "sp-evidence",
    screen: "Studio · Co-Analyst",
    surface: "Claims with evidence and confidence",
    backing: "none",
    note: "Needs the generator to emit claim + query + matched-ids together. Code over prompts (ADR 0006): the binding is structural, not a request to cite sources.",
  },
  {
    id: "sp-dock",
    screen: "Studio · Co-Analyst",
    surface: "Conversational refine with diffs",
    backing: "none",
    note: "Every turn returns a typed diff the UI renders and a human applies. No direct mutation of the document by the model.",
  },
  {
    id: "sp-review",
    screen: "Studio · Review",
    surface: "Accept / reject generated sections",
    backing: "none",
    note: "Review state stores per block. Delivery reads it — unreviewed generated content holds the send.",
  },
  {
    id: "sp-approvals",
    screen: "Approvals",
    surface: "Delivery queue, diffs, risk tiers, policy",
    backing: "none",
    note: "New, and the piece that makes autonomous reporting safe. Needs editions persisted before delivery plus a policy evaluator server-side.",
  },
  {
    id: "sp-send",
    screen: "Send",
    surface: "One-off send",
    backing: "none",
    note: "No endpoint. Zainab's Supabase + Resend path is a demo prop and cannot port — KSA residency and tenant isolation both rule it out.",
  },
]

export const PORTING_NOTES = [
  {
    title: "Alias and primitives",
    body: "Mockup code imports from @/; v3 requires #/ — it type-checks either way and fails at runtime. DataCard and KpiCard are borrowed from the mockup's administration-modern feature and need v3 equivalents.",
  },
  {
    title: "Lists",
    body: "Every list here is hand-rolled. v3 renders lists through the shared DataTable with its search / filter / display toolbar.",
  },
  {
    title: "State",
    body: "Tab lives in a path param and search in useState. v3 puts filters, sort and pagination in the URL via validateSearch with zod, and server state in TanStack Query.",
  },
  {
    title: "The backend seam",
    body: "reports-backend.ts is the only file that talks to a backend. Port that shape and rewrite its bodies against the platform API — the UI layer never learns the difference. The Supabase client itself does not come across.",
  },
  {
    title: "Tests",
    body: "New behaviour ships with a test in the same PR. The deterministic ai-engine is the easy win — planFromPrompt and refineFromPrompt are pure functions over typed input.",
  },
]
