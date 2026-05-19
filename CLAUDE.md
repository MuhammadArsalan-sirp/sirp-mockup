# sirp-mockup — context for Claude

Standalone interactive mockup of the **SIRP OmniSense incident workspace**.
Used for design review, customer demos, and pitching the next-gen incident
detail experience. This is a UI mockup — no real backend, no real customer
data, all content is fixture data in `src/data/` and `src/features/*/...mock.ts`.

Extracted from the `react-go` monorepo at branch `design-mockups`. The old
`sirp-v3/` subfolder of `react-go` is now stale; this repo is the source of
truth.

---

## Stack

- **Vite 7** · React 19 · TypeScript 5
- **Tailwind v4** (uses the new canonical class names — e.g. `min-w-275`, not
  `min-w-[1100px]`; `bg-(--var)`, not `bg-[var(--…)]`)
- **shadcn/ui** components in `src/components/ui/` (Radix primitives)
- **Recharts** for charts · **Lucide** for icons
- **React Router 7** · **TanStack Query / Table**
- Node 20+ required (run `nvm use 20` in every fresh terminal)

## Commands

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # vite build → ./dist
npm run preview      # serve the production build
npm run typecheck    # standalone tsc -b (NOT part of build)
npm run lint
```

**Build does not run `tsc`.** The Vercel deploy uses `vite build` only.
There are pre-existing TS errors (mostly unused-locals) carried in from the
monorepo extraction. Use `npm run typecheck` to see them. Fix incrementally,
don't block on them.

## Deployment

- **Vercel.** Auto-deploys on push to `main`.
- `vercel.json` configures SPA rewrites so deep links (`/incidents/INC-…`)
  survive a hard refresh.
- `package.json` pins `engines.node >=20.0.0` so Vercel uses Node 20.

---

## Product vocabulary (matters in any user-facing copy)

- **"Co-Analyst"** — never "Copilot"
- **"OmniSense"** — the AI/automation surface. Never "the AI" / "the LLM" / "Claude" / "the assistant"
- **"SIRP"** — the platform / company
- **HimayaAI** — internal-only engine name for OmniScan. Never in customer-visible UI; use "OmniScan"
- Other products: OmniBoards, SARA (chat surface), OmniScan, OmniFlex, OmniUpdate, OmniCollective, OmniStream

## Tenant / data rules

- All values in the mock are fixture data. **Never paste real customer
  data, IOCs, tenant IDs, or credentials into a fixture file.**
- KSA data residency doesn't apply here (no real data) but keep the rule in
  mind if anyone asks to add a "real example" — they should fake it instead.

---

## Architecture cheat-sheet

```
src/
  components/
    layout/         AppShell, sidebar, topbar, nav-user (current user avatar)
    ui/             shadcn primitives (button, card, avatar, dropdown, …)
  data/
    users.ts        Fixture user registry (Ahmed, Sara, Mariam, …) with
                    randomuser/Unsplash photo URLs + tailwind gradient fallback
    incidents.ts    Fixture incident list w/ assignee, members, etc.
  features/
    dashboard/      Landing dashboard
    incidents/
      list/         Table / board / feed views + columns + filters
      detail/       The main canvas. See section below.
    threat-intel/   List + detail
    entities/       List + detail
    autonomy/       Agents / playbooks / approvals / artifacts / lab / policies
    administration/ Users, groups, roles, org, logs, placeholders
    sara/, omnisense/   AI-side surfaces
  routes/router.tsx Single React-Router config
  stores/preferences.ts   Sidebar/layout state (zustand)
```

### Incident detail — `src/features/incidents/detail/`

The default route `/incidents/:id` renders **`incident-detail-v7-page.tsx`**.
All previous variant pages (v1–v6, v8–v11, n1–n6, and a separate
"incident-detail-page.tsx" / "incident-layout-lab-nav.tsx") were removed
during the standalone extraction. Just V7.

V7 composes:
- `IncidentDetailV7Page` — page shell, tab strip, sticky header, stage bar,
  resizable Sara dock on the right
- `IncidentDetailPanels` — switches on the active tab and renders the
  matching panel. Source of truth for tab → content mapping.
- Tab list lives in `incident-detail-tabs.ts`
- Mock data builders in `incident-detail-mock.ts` (artifacts, entities, alerts,
  comments, tasks, OmniSense block, agent runs, MITRE, S3 breakdown, logs)

**Tab inventory** (12 tabs, consolidated):
overview · omnisense · artifacts · entities · remediation · comments · tasks ·
omnimap · alerts · **logs** (single tab, sub-nav for audit/playbook/SLA) ·
related · affected-products

### Panel implementations of note

- `incident-overview-tab.tsx` — biggest file. Stats strip, OmniSense card with
  confidence chip + completion bar + verdict + agents-grid (with CSS-pseudo
  connecting lines), activity/tasks/comments triptych, MITRE/tags
- `incident-artifacts-panel.tsx` — IOC-style artifacts (ip, domain, url,
  hash-md5/sha1/sha256, email, port, file, filename, user, registry) with
  verdict pills, inline enrichment chips (VirusTotal, AbuseIPDB, Shodan,
  ThreatFox, urlscan, HybridAnalysis, AlienVault, Mandiant), bulk selection,
  row expansion showing enrichment timeline + raw output
- `incident-detail-panels.tsx` — every other tab (entities, remediation,
  comments composer + thread, tasks, alerts, omnimap, logs, related, products)
  plus shared `DataCard` / `SectionCard` primitives
- `incident-sara-dock.tsx` / `incident-sara-embedded.tsx` — the Sara chat on
  the right side

---

## Design chemistry (follow these, they're load-bearing)

Pulled from the `next-shadcn-admin-dashboard` reference template and the
OmniBoards dashboard. Reference path (on the workstation we extracted from):
`/home/arsalan/Desktop/arsalan/me/templates/next-shadcn-admin-dashboard`.

### Cards

- Use **`<Card>` + `<CardContent className="px-5">`** for general panels.
- The shadcn `Card` already has `py-4`. **Do not add `py-*` to `CardContent`**
  or you'll double the vertical padding (32px instead of 16px). For inner
  multi-row cards (overview header card), use `<CardContent className="p-0">`
  and let each row set its own padding.
- Wrap card grids with the gradient pattern when needed:
  `*:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5
   *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card`

### Section labels

- Always: `text-[11px] font-medium uppercase tracking-wider text-muted-foreground`
- Lead the card with the label, then content. Match dashboard cards.

### KPI value

- `font-medium text-2xl tabular-nums leading-none tracking-tight`
  (or `text-3xl` for hero numbers on the dashboard)
- **Not** `font-bold`.

### Tone palette

Reused across stats, verdicts, enrichment chips, status indicators. Always
use these specific shades for consistency:

| Tone     | Border / bg / text                                                    |
|----------|-----------------------------------------------------------------------|
| muted    | `border bg-muted text-muted-foreground`                               |
| primary  | `border-primary/25 bg-primary/10 text-primary`                        |
| warn     | `border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400` |
| alert    | `border-destructive/25 bg-destructive/10 text-destructive`            |
| ok       | `border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400` |

### Icons in colored boxes

`grid size-8 shrink-0 place-items-center rounded-lg [tone classes]` with a
`size-4` Lucide icon inside.

### Avatars

- Always use the shadcn `Avatar` triplet:
  ```tsx
  <Avatar>
    <AvatarImage src={user.photo} alt={user.name} />
    <AvatarFallback className={cn("bg-linear-to-br …text-white", user.gradient)}>
      {user.initials}
    </AvatarFallback>
  </Avatar>
  ```
- Photos are real Unsplash headshots via `users.ts`. **Don't go back to
  pravatar / dicebear / randomuser** — we landed on Unsplash specifically
  because the user wanted "professional" portraits.
- For the OmniSense pseudo-user (`addedBy.id === "omnisense"`), use a
  primary-gradient round chip with "OS" initials, not a photo.

### Common Tailwind v4 gotchas

- Prefer canonical names: `min-w-275` over `min-w-[1100px]`,
  `bg-(--var)` over `bg-[var(--…)]`, `nth-[2n+1]:` over `[&:nth-child(2n+1)]:`
- Use `bg-linear-to-br` (Tailwind v4), not `bg-gradient-to-br` (v3 syntax)

---

## Recent design decisions worth remembering

These came from iteration with the user — don't re-introduce the old versions:

1. **Overview stats strip**: layout is label-left, icon-right, big value
   below, sub-row with a colored dot. Icons are neutral (`border bg-muted`)
   even though dots/bars take the tone color. Tasks card has a progress bar
   instead of a plain dot row.
2. **OmniSense card** (in overview):
   - Header: SARA icon + title + Autonomous badge + **confidence chip**
     (tone-colored pill, NOT a big number) + Rerun / Full Report buttons
   - Confidence is a static score → chip
   - Below header: thin **completion bar** (filled by doneCount/totalCount)
   - Body is two columns: **Overall Summary** (left) + **OmniSense Verdict**
     (right, tone-bg, icon + title + one-line recommendation)
   - **Agents Summary** section below: grid of small agent cards (2/3/4
     cols responsive), connected by CSS-pseudo horizontal lines in the gap
     between cards. Each card shows agent name + a one-liner (findings if
     available, description otherwise) + status pill. No execution time.
3. **Artifacts tab**: IOC-style, not file-style. Verdict pills, inline
   enrichment chips, bulk-select with floating action bar, row expansion
   for full enrichment timeline + raw JSON.
4. **Logs tab**: one tab, pill sub-nav for Audit / Playbook / SLA.
5. **Context bar / Workbench bar**: hidden on overview tab, collapsed by
   default on other tabs. Click chevron to expand the dropdown row.
6. **Header (ticket header)**: shows assignee avatar + name + team stack.
7. **Workbench bar's "Assign" button** is replaced by an interactive chip
   with the assignee photo + first name when assigned.
8. **Main app sidebar does NOT auto-collapse** on incident detail. The
   `setSidebarOpen(false)` `useEffect` was removed.

---

## Don'ts

- Don't add real customer data or IOCs even as "examples" — fake them
- Don't introduce per-stat colored icons in the overview stats strip; the
  user wanted them neutral
- Don't change avatar source to pravatar/dicebear/randomuser
- Don't add `tsc -b` back to the build script unless you've fixed every
  pre-existing TS error first
- Don't restore the deleted variant pages (v1–v6, v8–v11, n1–n6) — they
  were intentionally cut

## Do

- Match dashboard chemistry exactly when adding new cards
- Test the actual UI in a browser before declaring a UI task done — type
  checks aren't enough for visual changes
- Use TodoWrite for multi-step tasks
- When unsure between two designs, present them with `AskUserQuestion`
  rather than picking arbitrarily
