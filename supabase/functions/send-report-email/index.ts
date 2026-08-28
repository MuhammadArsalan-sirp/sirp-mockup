// Supabase Edge Function — the only place that holds the Resend API key.
// Deployed with: supabase functions deploy send-report-email
// Secret set with: supabase secrets set RESEND_API_KEY=re_xxx
//
// The browser never talks to Resend directly — it calls this function
// (via supabase.functions.invoke), which holds the real secret server-side
// and makes the actual send. See reports-backend.ts's sendReportNow.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
// Resend's shared sandbox sender — works without verifying a domain, but
// can only deliver to the email address you signed up to Resend with,
// until you verify your own sending domain.
const FROM_ADDRESS = Deno.env.get("REPORT_EMAIL_FROM") ?? "SIRP OmniSense Demo <onboarding@resend.dev>"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string))
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders })
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405)

  if (!RESEND_API_KEY) {
    return json({ error: "RESEND_API_KEY is not configured on this Edge Function" }, 500)
  }

  let body: { to?: string; subject?: string; message?: string; reportName?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: "Invalid JSON body" }, 400)
  }

  const { to, reportName } = body
  if (!to || !reportName) {
    return json({ error: "'to' and 'reportName' are required" }, 400)
  }

  const subject = body.subject || `Report: ${reportName}`
  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; color: #121218;">
      <h2 style="margin-bottom: 4px;">${escapeHtml(reportName)}</h2>
      <p style="color: #444;">${escapeHtml(body.message || "A report was shared with you from SIRP OmniSense.")}</p>
      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 16px 0;" />
      <p style="color: #999; font-size: 12px;">Sent from a SIRP OmniSense demo environment. This is a mockup — no real report is attached.</p>
    </div>
  `

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_ADDRESS, to: [to], subject, html }),
  })

  const data = await resendRes.json()
  if (!resendRes.ok) return json({ error: data }, resendRes.status)
  return json({ id: data.id })
})
