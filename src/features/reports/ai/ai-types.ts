/**
 * Types for the Co-Analyst layer of Reports.
 *
 * Everything the Co-Analyst produces in this mockup carries provenance: a
 * generated sentence is never just text, it's text plus the query, records and
 * window it came from. That's deliberate — a report that claims "MTTR improved
 * 18%" without showing its working is a liability, not a feature.
 */

import type { ReportModule } from "@/data/reports"

/* ------------------------------------------------------------------ */
/* Provenance                                                          */
/* ------------------------------------------------------------------ */

/** Where a generated claim came from. Rendered by <EvidencePopover>. */
export type Evidence = {
  id: string
  /** Human-readable form of the query that produced the claim. */
  query: string
  /** Module the query ran against. */
  module: ReportModule
  /** Time window the query covered. */
  window: string
  /** How many records matched. */
  matched: number
  /** A few real record ids so a reviewer can spot-check. */
  samples: { id: string; label: string }[]
  /** 0–1. Below `LOW_CONFIDENCE` the UI nags for review. */
  confidence: number
  /** Set when the figure was compared against a prior period. */
  comparedWith?: string
}

export const LOW_CONFIDENCE = 0.75

/** A single generated claim inside a narrative block. */
export type Claim = {
  id: string
  text: string
  evidenceId: string
}

/** Review state of anything the Co-Analyst wrote. */
export type ReviewState = "unreviewed" | "accepted" | "edited" | "rejected"

/* ------------------------------------------------------------------ */
/* Insights                                                            */
/* ------------------------------------------------------------------ */

export type InsightKind = "anomaly" | "trend" | "risk" | "improvement"

export type Insight = {
  id: string
  kind: InsightKind
  headline: string
  detail: string
  /** Signed change vs the comparison period, already formatted. */
  delta?: string
  direction?: "up" | "down"
  /** True when the direction is bad news, regardless of arrow direction. */
  adverse: boolean
  evidenceId: string
}

/* ------------------------------------------------------------------ */
/* Compose (natural language → report plan)                            */
/* ------------------------------------------------------------------ */

export type ComposeAudience = "executive" | "analyst" | "auditor" | "customer"

export type PlannedSection = {
  /** Studio block type this section becomes. */
  blockType: string
  title: string
  /** Why the Co-Analyst chose it — shown in the interpretation card. */
  why: string
  /** User can drop a section before building. */
  included: boolean
}

export type ComposePlan = {
  prompt: string
  /** What the Co-Analyst understood — every field is editable before building. */
  audience: ComposeAudience
  module: ReportModule
  period: string
  tone: "concise" | "detailed"
  pageTarget: number
  sections: PlannedSection[]
  /** Things the Co-Analyst wants the human to confirm. */
  assumptions: string[]
}

/* ------------------------------------------------------------------ */
/* Conversational refine                                               */
/* ------------------------------------------------------------------ */

export type BlockChange =
  | { op: "add"; label: string; detail: string; blockType: string; afterId?: string }
  | { op: "remove"; label: string; detail: string; blockId: string }
  | { op: "modify"; label: string; detail: string; blockId: string; patch: Record<string, unknown> }
  | { op: "reorder"; label: string; detail: string; blockId: string; direction: -1 | 1 }
  | { op: "document"; label: string; detail: string; patch: Record<string, unknown> }

export type RefineResult = {
  /** What the Co-Analyst says back, in the dock. */
  reply: string
  changes: BlockChange[]
  /** Set when the request wasn't understood — no changes proposed. */
  unrecognized?: boolean
}

export type ChatTurn = {
  id: string
  role: "user" | "co-analyst"
  text: string
  changes?: BlockChange[]
  /** Applied / discarded / pending — drives the dock's diff card. */
  status?: "pending" | "applied" | "discarded"
}
