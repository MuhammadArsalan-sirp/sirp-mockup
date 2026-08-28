/**
 * The deterministic stand-in for the Co-Analyst.
 *
 * Every AI surface in Reports — compose, the Studio dock, per-block rewrites,
 * the insight blocks — routes through this one module. It is deliberately
 * *deterministic*: the same prompt always produces the same plan, so a demo
 * can be rehearsed and a reviewer can re-run what they just saw. No
 * `Math.random`, no wall-clock branching.
 *
 * When this is built for real, this file is the seam that gets replaced —
 * everything above it works against these types, not against a model.
 */

import type { ReportModule } from "@/data/reports"
import type { StudioBlock, StudioBlockType } from "../studio/report-studio-types"
import { BLOCK_LABELS } from "../studio/report-studio-types"
import type {
  BlockChange,
  ComposeAudience,
  ComposePlan,
  PlannedSection,
  RefineResult,
} from "./ai-types"

/* ------------------------------------------------------------------ */
/* Intent matching                                                      */
/* ------------------------------------------------------------------ */

const has = (text: string, ...needles: string[]) => needles.some((n) => text.includes(n))

/** Maps free text onto a block type — used by both compose and refine. */
const BLOCK_ALIASES: { type: StudioBlockType; words: string[] }[] = [
  { type: "execSummary", words: ["executive summary", "exec summary", "summary", "overview narrative"] },
  { type: "anomalies", words: ["anomal", "outlier", "unusual", "spike"] },
  { type: "whatChanged", words: ["what changed", "since last", "week over week", "comparison", "delta"] },
  { type: "kpi", words: ["kpi", "metric", "headline number", "key figure"] },
  { type: "chart", words: ["chart", "graph", "trend", "over time", "breakdown"] },
  { type: "table", words: ["table", "list of", "records", "top ioc", "indicator", "open case"] },
  { type: "mitre", words: ["mitre", "att&ck", "attck", "technique"] },
  { type: "timeline", words: ["timeline", "sequence of events", "chronolog"] },
  { type: "entities", words: ["entit", "asset", "host", "affected system"] },
  { type: "playbooks", words: ["playbook", "automation run", "response action"] },
  { type: "callout", words: ["callout", "warning box", "note box"] },
  { type: "text", words: ["paragraph", "prose", "recommendation", "narrative"] },
  { type: "pageBreak", words: ["page break", "new page", "start a page"] },
  { type: "cover", words: ["cover", "title page", "front page"] },
]

function matchBlockType(text: string): StudioBlockType | null {
  for (const entry of BLOCK_ALIASES) {
    if (has(text, ...entry.words)) return entry.type
  }
  return null
}

function matchModule(text: string): ReportModule {
  if (has(text, "threat intel", "intel", "ioc", "indicator")) return "threatIntel"
  if (has(text, "case", "phishing backlog")) return "cases"
  return "incident"
}

function matchAudience(text: string): ComposeAudience {
  if (has(text, "board", "exec", "leadership", "ciso", "c-level")) return "executive"
  if (has(text, "audit", "compliance", "regulator", "sama", "sdaia")) return "auditor"
  if (has(text, "customer", "client", "tenant-facing")) return "customer"
  return "analyst"
}

function matchPeriod(text: string): string {
  if (has(text, "today", "last 24", "24 hour", "yesterday")) return "Last 24 hours"
  if (has(text, "quarter", "90 day")) return "Last quarter"
  if (has(text, "month", "30 day")) return "Last 30 days"
  return "Last 7 days"
}

/* ------------------------------------------------------------------ */
/* Compose — natural language in, an editable plan out                 */
/* ------------------------------------------------------------------ */

type SectionSpec = { blockType: StudioBlockType; title: string; why: string }

const CORE_SECTIONS: SectionSpec[] = [
  { blockType: "cover", title: "Cover page", why: "Every distributed report opens with classification and scope." },
  { blockType: "execSummary", title: "Executive summary", why: "Written from this period's figures, with evidence attached to each claim." },
  { blockType: "kpi", title: "Headline metrics", why: "Volume, MTTR, critical open and automation coverage." },
]

const AUDIENCE_SECTIONS: Record<ComposeAudience, SectionSpec[]> = {
  executive: [
    { blockType: "whatChanged", title: "What changed since last period", why: "Executives read the delta, not the absolute." },
    { blockType: "chart", title: "Incidents over time", why: "One trend chart carries the volume story without a table." },
    { blockType: "anomalies", title: "Anomalies worth your attention", why: "Surfaces the VPN campaign that drove the volume rise." },
    { blockType: "text", title: "Recommendations", why: "Closes with actions rather than observations." },
    { blockType: "table", title: "Top indicators of compromise", why: "Appendix for whoever reads past page one — dropped if you ask for a one-pager." },
  ],
  analyst: [
    { blockType: "chart", title: "Incidents over time", why: "Volume trend across the window." },
    { blockType: "chart", title: "Severity breakdown", why: "Shows where the volume actually landed." },
    { blockType: "anomalies", title: "Anomalies", why: "Detection-level outliers with their source queries." },
    { blockType: "mitre", title: "ATT&CK coverage", why: "Ties incidents to technique coverage." },
    { blockType: "table", title: "Top indicators of compromise", why: "Record-level appendix for follow-up." },
    { blockType: "entities", title: "Entities involved", why: "Assets and identities in scope this period." },
    { blockType: "playbooks", title: "Automation runs", why: "What responded without a human." },
  ],
  auditor: [
    { blockType: "table", title: "SLA attainment by team", why: "The control the audit actually tests." },
    { blockType: "timeline", title: "Response timeline", why: "Evidence trail for the sampled incidents." },
    { blockType: "playbooks", title: "Automation runs", why: "Demonstrates the documented process ran as written." },
  ],
  customer: [
    { blockType: "chart", title: "Incidents over time", why: "Tenant-scoped volume only." },
    { blockType: "whatChanged", title: "What changed this period", why: "Keeps a recurring customer report readable." },
    { blockType: "text", title: "What we did about it", why: "Customer reports close on service delivered." },
  ],
}

const AUDIENCE_PAGES: Record<ComposeAudience, number> = {
  executive: 2,
  analyst: 8,
  auditor: 6,
  customer: 3,
}

export function planFromPrompt(prompt: string): ComposePlan {
  const text = prompt.toLowerCase()
  const audience = matchAudience(text)
  const module = matchModule(text)
  const period = matchPeriod(text)
  const wantsShort = has(text, "one page", "1 page", "short", "brief", "concise")

  const specs = [...CORE_SECTIONS, ...AUDIENCE_SECTIONS[audience]]

  // An explicitly named block gets added if the audience default missed it.
  const explicit = matchBlockType(text)
  if (explicit && !specs.some((s) => s.blockType === explicit)) {
    specs.push({
      blockType: explicit,
      title: BLOCK_LABELS[explicit],
      why: "You asked for this explicitly.",
    })
  }

  const sections: PlannedSection[] = specs.map((s) => ({
    blockType: s.blockType,
    title: s.title,
    why: s.why,
    // A short brief drops the record-level appendices by default, but the
    // human sees them listed and can put them back before building.
    included: !(wantsShort && (s.blockType === "table" || s.blockType === "entities" || s.blockType === "playbooks")),
  }))

  const assumptions: string[] = []
  assumptions.push(`Scoped to ${module === "incident" ? "Incident Management" : module === "threatIntel" ? "Threat Intelligence" : "Cases"} — say the word to change it.`)
  assumptions.push(`Period read as ${period.toLowerCase()}.`)
  if (audience === "executive") assumptions.push("Written for an executive reader: narrative first, no record-level tables.")
  if (audience === "customer") assumptions.push("Customer cut redacts analyst names, indicator values and detection rule names.")
  if (audience === "auditor") assumptions.push("Generated narrative is omitted — audit cuts carry figures and evidence only.")
  if (wantsShort) assumptions.push("Trimmed to fit a short report; appendices are listed but switched off.")

  return {
    prompt,
    audience,
    module,
    period,
    tone: wantsShort || audience === "executive" ? "concise" : "detailed",
    pageTarget: wantsShort ? 2 : AUDIENCE_PAGES[audience],
    sections,
    assumptions,
  }
}

/* ------------------------------------------------------------------ */
/* Refine — conversational edits, returned as a reviewable diff         */
/* ------------------------------------------------------------------ */

function findBlocks(blocks: StudioBlock[], text: string): StudioBlock[] {
  const type = matchBlockType(text)
  const byType = type ? blocks.filter((b) => b.type === type) : []
  if (byType.length) return byType

  // Fall back to matching a block's own title text.
  return blocks.filter((b) => {
    const props = b.props as Record<string, unknown>
    const title = typeof props.title === "string" ? props.title.toLowerCase() : ""
    const heading = typeof props.text === "string" ? props.text.toLowerCase() : ""
    const words = text.split(/\s+/).filter((w) => w.length > 4)
    return words.some((w) => title.includes(w) || heading.includes(w))
  })
}

const APPENDIX_TYPES: StudioBlockType[] = ["table", "entities", "playbooks", "timeline"]

export function refineFromPrompt(prompt: string, blocks: StudioBlock[]): RefineResult {
  const text = prompt.toLowerCase().trim()
  const changes: BlockChange[] = []

  /* --- shrink to a page count -------------------------------------- */
  if (has(text, "one page", "1 page", "single page", "make it shorter", "make it short", "cut it down", "trim")) {
    const victims = blocks.filter((b) => APPENDIX_TYPES.includes(b.type))
    for (const b of victims) {
      changes.push({
        op: "remove",
        label: `Remove ${BLOCK_LABELS[b.type]}`,
        detail: "Record-level detail doesn't survive a one-page cut.",
        blockId: b.id,
      })
    }
    changes.push({
      op: "document",
      label: "Set page target to 1",
      detail: victims.length ? "Layout tightens and the appendix is dropped." : "Layout tightens; nothing else to remove.",
      patch: { pageTarget: 1 },
    })
    return {
      reply:
        victims.length > 0
          ? `Cutting to one page means dropping the record-level sections — ${victims.length} of them. Headline figures, narrative and recommendations stay.`
          : "Already down to narrative and figures — nothing left worth cutting for a one-pager.",
      changes,
    }
  }

  /* --- remove ------------------------------------------------------- */
  if (has(text, "remove", "drop", "delete", "get rid of", "take out", "without")) {
    const targets = findBlocks(blocks, text)
    if (!targets.length) {
      return { reply: "I couldn't find that section in this report. Name the block — for example \"drop the MITRE section\".", changes: [], unrecognized: true }
    }
    for (const b of targets) {
      changes.push({
        op: "remove",
        label: `Remove ${BLOCK_LABELS[b.type]}`,
        detail: "Requested removal.",
        blockId: b.id,
      })
    }
    return { reply: `Removing ${targets.length === 1 ? BLOCK_LABELS[targets[0].type] : `${targets.length} sections`}.`, changes }
  }

  /* --- add ---------------------------------------------------------- */
  if (has(text, "add", "include", "insert", "put in", "append")) {
    const type = matchBlockType(text)
    if (!type) {
      return { reply: "Tell me which section to add — a chart, a table, ATT&CK coverage, an anomaly callout, a page break.", changes: [], unrecognized: true }
    }
    changes.push({
      op: "add",
      label: `Add ${BLOCK_LABELS[type]}`,
      detail: type === "table" && has(text, "sla") ? "SLA attainment by team." : "Bound to this report's module and period.",
      blockType: type,
      afterId: blocks.at(-1)?.id,
    })
    return { reply: `Adding ${BLOCK_LABELS[type]} at the end — drag it where you want it.`, changes }
  }

  /* --- tone --------------------------------------------------------- */
  if (has(text, "tone", "more technical", "less technical", "for the board", "plain english", "simpler", "formal")) {
    const targets = blocks.filter((b) => b.type === "text" || b.type === "execSummary")
    if (!targets.length) {
      return { reply: "There's no written section here yet to re-tone. Add an executive summary first.", changes: [], unrecognized: true }
    }
    const technical = has(text, "more technical", "technical", "detailed")
    for (const b of targets) {
      changes.push({
        op: "modify",
        label: `Re-tone ${BLOCK_LABELS[b.type]}`,
        detail: technical ? "Detection names and technique ids kept in." : "Jargon removed; figures kept.",
        blockId: b.id,
        patch: { tone: technical ? "technical" : "executive" },
      })
    }
    return { reply: `Rewriting ${targets.length} written section${targets.length > 1 ? "s" : ""} in a ${technical ? "more technical" : "plainer"} register. Evidence links are preserved.`, changes }
  }

  /* --- translate ---------------------------------------------------- */
  if (has(text, "arabic", "translate", "بالعربي")) {
    const targets = blocks.filter((b) => b.type === "text" || b.type === "execSummary")
    for (const b of targets) {
      changes.push({
        op: "modify",
        label: `Translate ${BLOCK_LABELS[b.type]}`,
        detail: "Arabic rendering, right-to-left. Figures and evidence unchanged.",
        blockId: b.id,
        patch: { locale: "ar" },
      })
    }
    return {
      reply: targets.length
        ? "Translating the written sections to Arabic. Charts and tables keep their original labels — say the word if you want those too."
        : "Nothing written to translate yet.",
      changes,
      unrecognized: targets.length === 0,
    }
  }

  /* --- period ------------------------------------------------------- */
  if (has(text, "last 30", "last month", "last quarter", "last 24", "last 7", "this week")) {
    const period = matchPeriod(text)
    changes.push({
      op: "document",
      label: `Set period to ${period}`,
      detail: "Every data block re-binds to the new window.",
      patch: { timeRange: period },
    })
    return { reply: `Re-scoping the whole report to ${period.toLowerCase()}. Comparisons move with it.`, changes }
  }

  /* --- reorder ------------------------------------------------------ */
  if (has(text, "move", "reorder", "to the top", "to the end", "first", "last")) {
    const targets = findBlocks(blocks, text)
    if (!targets.length) {
      return { reply: "Name the section you want moved and where it should go.", changes: [], unrecognized: true }
    }
    const up = has(text, "top", "first", "up", "before")
    changes.push({
      op: "reorder",
      label: `Move ${BLOCK_LABELS[targets[0].type]} ${up ? "up" : "down"}`,
      detail: up ? "Moves one position earlier." : "Moves one position later.",
      blockId: targets[0].id,
      direction: up ? -1 : 1,
    })
    return { reply: `Moving ${BLOCK_LABELS[targets[0].type]} ${up ? "earlier" : "later"} in the document.`, changes }
  }

  /* --- page break --------------------------------------------------- */
  if (has(text, "page break", "new page", "start a new page")) {
    changes.push({
      op: "add",
      label: "Add page break",
      detail: "Export will start a fresh page here.",
      blockType: "pageBreak",
      afterId: blocks.at(-1)?.id,
    })
    return { reply: "Page break added — export slices on it.", changes }
  }

  return {
    reply:
      "I can restructure this report — add or drop sections, change the period, re-tone the writing, translate it, or cut it to a page. Try \"drop the MITRE section and add SLA by team\".",
    changes: [],
    unrecognized: true,
  }
}

/* ------------------------------------------------------------------ */
/* Per-block rewrites                                                  */
/* ------------------------------------------------------------------ */

export type RewriteMode = "shorten" | "expand" | "executive" | "technical" | "arabic"

export const REWRITE_LABELS: Record<RewriteMode, string> = {
  shorten: "Shorten",
  expand: "Expand",
  executive: "Plainer tone",
  technical: "More technical",
  arabic: "Arabic",
}

const REWRITES: Record<RewriteMode, (source: string) => string> = {
  shorten: (s) => {
    const sentences = s.split(/(?<=\.)\s+/)
    return sentences.slice(0, Math.max(1, Math.ceil(sentences.length / 2))).join(" ")
  },
  expand: (s) =>
    `${s} Detection coverage for the techniques involved was reviewed during the period, and the containment actions taken are logged against each incident for audit.`,
  executive: () =>
    "Incident volume rose 12% this week, driven by an attempted credential-stuffing campaign against remote access. Automation absorbed most of the response and no data was confirmed stolen. Three critical cases remain open and need owners outside the SOC to act.",
  technical: () =>
    "139 incidents were raised in the window, 47 of them by auth.bruteforce.vpn (T1110) across 14 source ASNs. Median time-to-respond fell to 42m as auto-containment closed tier-1 credential-access cases without analyst touch. Three critical incidents exceed 72h age, each blocked externally. No true-positive disposition on data-exfiltration categories.",
  arabic: () =>
    "ارتفع حجم الحوادث بنسبة ١٢٪ خلال هذه الفترة، مدفوعًا بحملة لحشو بيانات الاعتماد استهدفت بوابة الوصول عن بُعد. تولّت الأتمتة معظم الاستجابة، ولم يُرصد أي تسريب مؤكد للبيانات. لا تزال ثلاث حوادث حرجة مفتوحة بانتظار إجراء من جهات خارج مركز العمليات.",
}

export function rewrite(source: string, mode: RewriteMode): string {
  return REWRITES[mode](source)
}

/** Charts get explained in prose, bound to the same dataset the chart reads. */
export function explainChart(title: string): string {
  return `${title} shows the shape of this period rather than a single number: volume climbs through midweek, peaks on Thursday at 31 incidents, then falls away over the weekend. The midweek peak is the credential-stuffing campaign against the VPN gateway, not a broad rise across categories.`
}
