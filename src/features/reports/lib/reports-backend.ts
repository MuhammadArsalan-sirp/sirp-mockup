import { isSupabaseConfigured, supabase } from "@/lib/supabase"
import type { UserRef } from "@/data/users"
import type { DeliveryChannel, Report, ReportFormat, ScheduleFrequency } from "@/data/reports"

/**
 * The single swappable seam between the UI and "a backend." Today this talks
 * to a demo Supabase project (see supabase/schema.sql); later, swapping to
 * the real SIRP backend means rewriting the bodies below to `fetch` real
 * endpoints — nothing in the UI layer needs to change.
 */

/** Fixture `UserRef` has no email field (used app-wide beyond Reports) — synthesize a clearly-fake demo address instead of inventing real-looking PII. */
export function toDemoEmail(user: UserRef): string {
  return `${user.id}@sirp-demo.local`
}

export type SaveScheduleInput = {
  report: Report
  frequency: ScheduleFrequency
  hourSlot?: number
  dayOfMonth?: number
  weekday?: string
  dateRange: string
  intervalDays?: number
  timezone?: string
  recipients: UserRef[]
  emailSubject: string
  emailContent: string
  deliveryChannel: DeliveryChannel
}

export type SendReportNowInput = {
  report: Report
  recipients: UserRef[]
  externalEmail?: string
  subject: string
  message: string
  channel: DeliveryChannel
}

export type LogExportInput = {
  reportId: string
  reportName: string
  format: ReportFormat
  triggeredBy: "manual" | "schedule"
  sizeKb?: number
}

export type ReportDeliveryRecord = {
  id: string
  recipientEmail: string
  recipientName: string | null
  channel: string
  status: string
  createdAt: string
}

function randomId(): string {
  return crypto.randomUUID()
}

async function saveSchedule(input: SaveScheduleInput): Promise<{ id: string; persisted: boolean }> {
  if (!isSupabaseConfigured || !supabase) {
    console.warn("[reportsBackend] saveSchedule: Supabase not configured — not persisted.")
    return { id: randomId(), persisted: false }
  }

  const { data, error } = await supabase
    .from("report_schedules")
    .insert({
      report_id: input.report.id,
      report_name: input.report.name,
      frequency: input.frequency,
      hour_slot: input.hourSlot ?? null,
      day_of_month: input.dayOfMonth ?? null,
      weekday: input.weekday ?? null,
      date_range: input.dateRange,
      interval_days: input.intervalDays ?? null,
      timezone: input.timezone ?? null,
      recipient_emails: input.recipients.map(toDemoEmail),
      recipient_names: input.recipients.map((r) => r.name),
      email_subject: input.emailSubject,
      email_content: input.emailContent,
      delivery_channel: input.deliveryChannel,
    })
    .select("id")
    .single()

  if (error) {
    console.error("[reportsBackend] saveSchedule failed:", error.message)
    throw error
  }
  return { id: data.id as string, persisted: true }
}

/**
 * Roster recipients only have synthesized `@sirp-demo.local` addresses —
 * there's nothing real to deliver to, so those are always logged as
 * "simulated." Only a real, user-typed external email is actually sent,
 * via the send-report-email Edge Function (which holds the Resend API key
 * server-side — the browser never sees it).
 */
async function sendRealEmail(input: {
  to: string
  subject: string
  message: string
  reportName: string
}): Promise<"sent" | "failed"> {
  if (!supabase) return "failed"
  try {
    const { error } = await supabase.functions.invoke("send-report-email", { body: input })
    if (error) console.error("[reportsBackend] send-report-email failed:", error.message)
    return error ? "failed" : "sent"
  } catch (err) {
    console.error("[reportsBackend] send-report-email invoke threw:", err)
    return "failed"
  }
}

async function sendReportNow(input: SendReportNowInput): Promise<{ ids: string[]; persisted: boolean }> {
  const recipientRows = [
    ...input.recipients.map((r) => ({ email: toDemoEmail(r), name: r.name as string | null, real: false })),
    ...(input.externalEmail ? [{ email: input.externalEmail, name: null as string | null, real: true }] : []),
  ]

  if (!isSupabaseConfigured || !supabase) {
    console.warn("[reportsBackend] sendReportNow: Supabase not configured — not persisted.")
    return { ids: recipientRows.map(() => randomId()), persisted: false }
  }

  const rows = await Promise.all(
    recipientRows.map(async (r) => {
      const status =
        r.real && input.channel === "email"
          ? await sendRealEmail({
              to: r.email,
              subject: input.subject,
              message: input.message,
              reportName: input.report.name,
            })
          : "simulated"
      return {
        report_id: input.report.id,
        report_name: input.report.name,
        trigger_type: "manual",
        recipient_email: r.email,
        recipient_name: r.name,
        channel: input.channel,
        subject: input.subject,
        message: input.message,
        status,
      }
    })
  )

  const { data, error } = await supabase.from("report_deliveries").insert(rows).select("id")

  if (error) {
    console.error("[reportsBackend] sendReportNow failed:", error.message)
    throw error
  }
  return { ids: (data ?? []).map((row) => row.id as string), persisted: true }
}

async function logExport(input: LogExportInput): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return
  const { error } = await supabase.from("report_export_log").insert({
    report_id: input.reportId,
    report_name: input.reportName,
    format: input.format,
    triggered_by: input.triggeredBy,
    size_kb: input.sizeKb ?? null,
  })
  if (error) console.error("[reportsBackend] logExport failed:", error.message)
}

async function listDeliveries(reportId: string): Promise<ReportDeliveryRecord[]> {
  if (!isSupabaseConfigured || !supabase) return []
  const { data, error } = await supabase
    .from("report_deliveries")
    .select("id, recipient_email, recipient_name, channel, status, created_at")
    .eq("report_id", reportId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[reportsBackend] listDeliveries failed:", error.message)
    return []
  }
  return (data ?? []).map((row) => ({
    id: row.id as string,
    recipientEmail: row.recipient_email as string,
    recipientName: row.recipient_name as string | null,
    channel: row.channel as string,
    status: row.status as string,
    createdAt: row.created_at as string,
  }))
}

export const reportsBackend = {
  saveSchedule,
  sendReportNow,
  logExport,
  listDeliveries,
}
