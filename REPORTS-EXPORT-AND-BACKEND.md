# Reports: export fix + demo backend — how it all works

A plain-language explainer of what was broken, what changed, and how the
pieces fit together. Written for future-you (or anyone else on the team)
who opens this file with zero context.

---

## 1. What was broken

The Reports feature let you click "Generate PDF" or "Download Excel," but
nothing real happened:

- **PDF** called the browser's native `window.print()`. That prints
  *whatever's currently on screen* — sidebar, topbar, popup included — not
  the report itself. And browsers don't print background colors by
  default, so on our dark theme the output came out as a blank white page.
- **Excel** and **CSV** buttons existed in the menus but had no click
  handler wired up at all. Clicking them did nothing.
- There was no backend anywhere. "Schedule" and "Send report" just
  flipped some local state in the browser and forgot about it the moment
  you closed the tab.

## 2. How export works now

Instead of asking the browser to print the page, we now:

1. **Take a screenshot of the actual report**, in code, using a library
   called `html-to-image`. Think of it like a headless "select all + copy
   as image" of just the report content — not the whole app.
2. **Turn that screenshot into a real PDF** using a library called
   `jsPDF`. If the report is tall, it automatically slices the image
   across multiple PDF pages.
3. For **Excel/CSV**, instead of a screenshot, we build a real spreadsheet
   from the report's actual data (name, author, sections, dates, etc.)
   using a library called `xlsx`, and trigger a normal browser download.

All of this lives in one file: [`src/features/reports/lib/report-export.ts`](src/features/reports/lib/report-export.ts).
Every "Generate PDF" / "Download Excel" / history-download button in the
app calls into this one shared file — so there's one place to fix things,
not five copies of export logic.

### Three sneaky bugs we hit (and fixed) along the way

These are worth knowing about because they're the kind of thing that looks
fine on screen but breaks silently in the exported file:

1. **Excel sheet names have a 31-character limit.** One of our fixture
   report names was longer than that, which crashed the whole export.
   Fixed by trimming sheet names automatically.
2. **A short report left a white gap.** If a report's content was
   shorter than a full page, the leftover space on the PDF page stayed
   the printer's default white, instead of matching our dark theme. Fixed
   by painting the full page background first, then placing the content
   on top.
3. **Chart lines were invisible in the exported PDF.** Our charts set
   their color like `stroke="var(--chart-2)"` — a reference to a color
   defined once, globally, at the top of the app. When we "screenshot"
   just the report in isolation, that global reference doesn't travel
   with it, so the chart tries to draw a line in a color that doesn't
   exist anymore — and draws nothing. Fixed by resolving the real color
   value and stamping it directly onto the report right before capturing
   it, then removing it again afterward.

## 3. The demo backend (Supabase)

Until now, "Schedule" and "Send report" only existed in the browser's
memory — refresh the page and it's gone. The ask was: make those actions
*actually* go somewhere, without touching the real SIRP production
backend (which doesn't exist for this mockup, and shouldn't handle real
customer emails/schedules from a design demo anyway).

**Supabase** is a hosted Postgres database with an instant, ready-made web
API in front of it — no backend server to write or deploy. We're using it
purely as a stand-in ("this is what a real backend connection looks like")
until this mockup is ever wired to the actual SIRP API.

### The three tables

Defined in [`supabase/schema.sql`](supabase/schema.sql) — this is the file
you ran once in Supabase's SQL editor to create them:

| Table | Filled when you... | Holds |
|---|---|---|
| `report_schedules` | Save a recurring schedule | frequency, recipients, subject, delivery channel |
| `report_deliveries` | Use "Send report" (one-off) | who it went to, subject, message, status |
| `report_export_log` | Generate any PDF/Excel/CSV | which report, which format, when |

By default nothing sends a real email — "Send report" and "Schedule" just
write a row saying *"this would have been emailed to so-and-so."* That's
enough to prove the backend connection is real and demoable, without
needing an email provider account or risking sending mail to fake fixture
addresses.

**Real sending is now wired in too, for one specific path.** Fixture
recipients (Ahmed, Sara, etc.) only have synthesized `@sirp-demo.local`
addresses — there's genuinely nothing to deliver to, so those always log
as `simulated`. But the "Send report" dialog's **external email** field
(type in any real address) actually sends, via:

- [`supabase/functions/send-report-email/index.ts`](supabase/functions/send-report-email/index.ts) —
  a Supabase Edge Function (a small server-side function Supabase hosts
  for you). It holds the Resend API key and calls Resend's email API.
- **Resend** — the actual email-sending service. Its API key is stored as
  a Supabase secret (`RESEND_API_KEY`), never in this repo, never in the
  browser.

Why the extra hop through an Edge Function instead of calling Resend
straight from the browser: any key that ships inside the browser's JS
bundle (like our Supabase anon key) is visible to anyone with devtools
open. A key that can send email on your behalf has to stay server-side —
so the browser calls the Edge Function, and the Edge Function calls
Resend.

Until you verify your own sending domain with Resend, their sandbox
sender can only deliver to the email address you signed up to Resend
with — fine for demoing to yourself, not for blasting arbitrary inboxes.

### The one file that knows about Supabase

[`src/features/reports/lib/reports-backend.ts`](src/features/reports/lib/reports-backend.ts)
is the *only* place in the Reports feature that talks to Supabase
directly. Every dialog/button calls a plain function like
`reportsBackend.saveSchedule(...)` — it has no idea whether that function
talks to Supabase, a real SIRP API, or nothing at all.

This matters later: **swapping the demo backend for the real SIRP backend
means rewriting the insides of this one file.** Nothing in the UI
components needs to change.

If Supabase isn't configured yet (no `.env.local`), every function in
this file just logs a warning and quietly does nothing — the app still
works, exports still work, you just don't get persistence. That's why
nothing crashed while you were setting up your Supabase project.

### Where the credentials live

`src/lib/supabase.ts` reads two values from `.env.local`:

```
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your project's anon/publishable key>
```

`.env.local` is never committed to git (it's covered by the `*.local`
rule in `.gitignore`). `.env.example` in the repo root shows the shape
without any real values, for anyone else setting this up fresh.

The "anon" key is meant to be public-ish (it ships inside the browser
bundle, anyone can see it in devtools) — access control is supposed to
live in the database's Row Level Security policies, not in keeping the
key secret. Our demo policies are wide open ("anyone with the key can
read/write everything") because this project only ever holds fixture
data. **That would need to change before this pattern touches anything
real.**

## 4. What actually happens when you click a button

**"Generate PDF" on a report row:**
```
click → report-columns.tsx builds an off-screen copy of the report
      → report-pdf-export.tsx screenshots it (html-to-image)
      → report-export.ts turns the screenshot into a PDF (jsPDF) and downloads it
      → reports-backend.ts logs the export to Supabase (report_export_log)
```

**"Schedule" → Save schedule:**
```
click → schedule-dialog.tsx collects the form (schedule-form.tsx)
      → reports-backend.ts sends it to Supabase (report_schedules)
      → dialog shows "Schedule saved"
```

**"Send report" → Send now:**
```
click → send-report-dialog.tsx collects recipients/subject/message
      → for the roster picks (fake @sirp-demo.local addresses): logged as "simulated"
      → for the typed external email: reports-backend.ts calls the send-report-email
        Edge Function → Edge Function calls Resend → real email sent, status "sent"/"failed"
      → every recipient gets one row in Supabase (report_deliveries)
      → dialog shows "Report sent"
```

## 5. File map

```
src/
  lib/
    supabase.ts                        Supabase client + config check
  features/reports/
    lib/
      report-export.ts                 PDF/Excel/CSV/HTML generation
      report-pdf-export.tsx            Off-screen render + capture helper
      reports-backend.ts                The swappable "talk to a backend" layer
    components/
      report-printable-summary.tsx     Shared layout used by PDF captures + preview sheet
      send-report-dialog.tsx           New "Send report" dialog
      schedule-dialog.tsx               Existing dialog, now saves for real
      report-columns.tsx               Row menu — Generate PDF / Download Excel / Send report
      report-preview-sheet.tsx         Report detail drawer — history download button
    studio/
      report-studio-page.tsx           Report Studio's Export dialog
supabase/
  schema.sql                            Run once in Supabase's SQL editor
  functions/send-report-email/index.ts  Edge Function — actually sends via Resend
.env.example                            Template for .env.local
```

## 6. What's *not* done (on purpose)

- Real sending only covers the "Send report" dialog's external-email
  field — roster recipients and scheduled/recurring sends still just log,
  they don't dispatch. Wiring schedules to actually fire on a timer would
  need a separate scheduled job (e.g. a `pg_cron` trigger calling the
  Edge Function) — not built.
- The **Scheduled** and **History** tabs still show fixture data, not a
  live read from Supabase. We only wired up the *writes* (the ask was
  "prove actions have a backend connection"), not a full read/rewrite of
  those list views.
- Report Studio's Excel/CSV output format is still "Coming soon" — that's
  a real product-scope decision baked into the app (a widget-based
  dashboard doesn't cleanly become a spreadsheet), not part of this fix.

## 7. Getting real sending actually turned on (what we did, step by step)

The code for real email sending (section 3 above) was already written, but
it wasn't live yet — nothing had been deployed, and the Supabase CLI on
this machine wasn't logged in. Here's what it took to get from "code
exists" to "email actually arrives," in plain terms:

1. **The CLI wasn't logged in.** `supabase login` opens a browser to
   authenticate, but that flow doesn't complete cleanly on this machine.
   Fix: use a **Personal Access Token** instead — a long-lived password
   you generate once on supabase.com/dashboard/account/tokens and export
   as `SUPABASE_ACCESS_TOKEN` in the terminal. That let the CLI talk to
   Supabase without the browser flow.
2. **Linked the CLI to the actual Supabase project** with
   `supabase link --project-ref <ref>` — this just tells the CLI "when I
   say deploy, deploy *here*."
3. **Set the Resend API key as a secret** with `supabase secrets set
   RESEND_API_KEY=...` — this stores it server-side, inside Supabase, not
   in this repo and not in the browser.
4. **Deployed the Edge Function** with `supabase functions deploy
   send-report-email` — this uploads the actual server-side code
   (`supabase/functions/send-report-email/index.ts`) so it's live and
   callable.
5. **Started the app** (`npm run dev`) so we could test the real "Send
   report" button, not just read the code.
6. **First real test: nothing arrived.** Instead of guessing, we called
   the Edge Function directly with `curl` (skipping the browser entirely)
   to see the *exact* error Resend was sending back. It said the API key
   itself was invalid — the key stored in step 3 wasn't one Resend
   actually recognized (most likely it had been copied with a typo, extra
   space, or was already revoked on Resend's side).
7. **Generated a fresh key** on resend.com/api-keys and re-ran the
   `secrets set` command from step 3 with the new value.
8. **Re-tested with `curl` again** — this time Resend accepted the key,
   but rejected the specific test address we used, because Resend's
   sandbox mode (before you verify your own sending domain) will only
   deliver to the email address you personally signed up to Resend with.
9. **Re-tested one more time**, targeting that exact address — Resend
   accepted it and handed back a real message ID. Email arrived (in the
   spam folder — expected, see below).
10. **Confirmed through the actual UI**, not just `curl` — used the real
    "Send report" dialog in the browser and got the email again.

**Why it landed in spam:** the sender address is Resend's own shared
sandbox address (`onboarding@resend.dev`), because no custom sending
domain has been verified yet. This is normal for any email service before
domain verification — it's not a bug in our code. Two options going
forward, neither done yet:
- Leave it as-is for demo purposes (just mention "check spam" when
  showing it live), or
- Verify a real sending subdomain (e.g. `demo.sirp.io`) on Resend's
  dashboard and point `REPORT_EMAIL_FROM` at it — this both fixes spam
  placement and removes the "only delivers to your own inbox" sandbox
  limit.

**Where things stand now:** the Edge Function is deployed and live, the
Resend key is valid, and a real end-to-end send (browser → Edge Function
→ Resend → inbox) has been confirmed working.
