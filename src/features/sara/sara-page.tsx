import { useState } from "react"
import {
  AlertTriangle,
  ArrowUp,
  AtSign,
  Check,
  ChevronDown,
  ChevronRight,
  CircleSlash,
  Copy,
  FileText,
  LayoutGrid,
  Link2,
  Mic,
  MoreHorizontal,
  PanelLeft,
  Paperclip,
  Pin,
  Plus,
  RotateCw,
  Search,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Wrench,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import "./sara-page.css"

const conversations: { group: string; items: { title: string; active?: boolean }[] }[] = [
  {
    group: "Today",
    items: [
      { title: "Triage INC-1247 — DC lateral movement", active: true },
      { title: "Draft Sigma rule for T1021.001" },
      { title: "Weekly executive summary" },
    ],
  },
  {
    group: "Yesterday",
    items: [
      { title: "Phishing campaign — finance dept" },
      { title: "CVE-2025-30406 exposure check" },
      { title: "Block 185.220.101.42 across edge" },
    ],
  },
  {
    group: "Previous 7 days",
    items: [
      { title: "Detection gaps in cloud workload" },
      { title: "APT29 mentions in tenant" },
      { title: "Sandbox eml-2741.eml" },
    ],
  },
]

const toolCalls = [
  { name: "get_incident", detail: "INC-1247 · 4 alerts grouped", duration: "120ms" },
  { name: "classify_attack", detail: "matched 3 MITRE techniques", duration: "880ms" },
  { name: "intelowl.lookup", detail: "185.220.101.42 → score 84/100", duration: "2.1s" },
  { name: "search_incidents", detail: "2 related in last 14 days", duration: "340ms" },
]

const mitre = [
  { id: "T1021.001", confidence: 94 },
  { id: "T1059.003", confidence: 88 },
  { id: "T1003.001", confidence: 72 },
]

export function SaraPage() {
  const [convOpen, setConvOpen] = useState(true)

  return (
    <div className="flex h-full overflow-hidden">
      {/* ┄┄ LEFT: Conversation history ┄┄ */}
      <aside
        className={cn(
          "flex flex-shrink-0 flex-col overflow-hidden border-r transition-[width,opacity] duration-200",
          convOpen
            ? "w-64 opacity-100"
            : "pointer-events-none w-0 border-r-0 opacity-0"
        )}
      >
        <div className="flex flex-col gap-2 p-3">
          <Button className="h-9 w-full justify-between">
            <span className="inline-flex items-center gap-2">
              <Plus className="size-4" />
              New conversation
            </span>
            <kbd className="rounded bg-white/15 px-1.5 py-0.5 font-mono text-[10px]">
              ⌘N
            </kbd>
          </Button>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations"
              className="h-8 w-full rounded-md border bg-transparent pl-8 pr-2 text-xs placeholder:text-muted-foreground focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-ring/60"
            />
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-2 pb-3">
          {conversations.map((g) => (
            <div key={g.group}>
              <div className="mb-1 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {g.group}
              </div>
              {g.items.map((c) => (
                <a
                  key={c.title}
                  className={cn(
                    "block cursor-pointer rounded-md px-2 py-1.5",
                    c.active
                      ? "sara-conv-active"
                      : "hover:bg-accent"
                  )}
                >
                  <div
                    className={cn(
                      "truncate text-sm",
                      c.active ? "font-medium" : "text-muted-foreground"
                    )}
                  >
                    {c.title}
                  </div>
                </a>
              ))}
            </div>
          ))}
        </div>
      </aside>

      {/* ┄┄ CENTER: Chat thread + composer ┄┄ */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Thread header */}
        <div className="flex h-12 flex-shrink-0 items-center justify-between gap-3 border-b px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-accent"
              title="Toggle conversations"
              onClick={() => setConvOpen((v) => !v)}
            >
              <PanelLeft className="size-4" />
            </button>
            <div className="truncate text-sm font-medium">
              Triage INC-1247 — DC lateral movement
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-accent"
              title="Pin conversation"
            >
              <Pin className="size-4" />
            </button>
            <button
              className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-accent"
              title="Share"
            >
              <Share2 className="size-4" />
            </button>
            <button
              className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-accent"
              title="More"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </div>
        </div>

        {/* Thread scroll */}
        <div className="sara-thread-glow flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[720px] space-y-8 px-6 py-6">
            {/* User turn */}
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-muted px-4 py-2.5 text-[14.5px] leading-relaxed">
                Triage{" "}
                <code className="rounded bg-background/70 px-1.5 py-0.5 font-mono text-[12.5px]">
                  INC-1247
                </code>{" "}
                — what happened, who's affected, what should I do next?
              </div>
            </div>

            {/* Sara turn */}
            <div className="flex gap-4">
              <div className="sara-avatar grid size-8 flex-shrink-0 place-items-center rounded-full">
                <img
                  src="/brand/sara-icon.png"
                  alt=""
                  className="size-4 object-contain"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-4">
                {/* Identity row */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-foreground">Sara</span>
                  <span className="sara-badge-brand">Co-Analyst</span>
                  <span
                    className="sara-pulse-dot ml-0.5"
                    title="Online"
                  />
                  <span className="text-muted-foreground">· 14:29</span>
                </div>

                {/* Tool calls */}
                <details className="sara-tool-details">
                  <summary className="inline-flex h-7 cursor-pointer items-center gap-2 rounded-md border bg-card px-2.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:bg-accent hover:text-foreground">
                    <Sparkles className="size-3 text-primary" />
                    <span>Used 4 tools</span>
                    <span className="text-muted-foreground/70">·</span>
                    <span className="tabular-nums">6.2s</span>
                    <ChevronRight className="sara-chevron ml-0.5 size-3" />
                  </summary>
                  <div className="ml-1 mt-2 space-y-1.5 border-l pl-3 text-xs text-muted-foreground">
                    {toolCalls.map((t) => (
                      <div key={t.name} className="flex items-center gap-2">
                        <Check className="size-3 flex-shrink-0 text-emerald-500" />
                        <code className="font-mono">{t.name}</code>
                        <span>· {t.detail}</span>
                        <span className="ml-auto tabular-nums">{t.duration}</span>
                      </div>
                    ))}
                  </div>
                </details>

                {/* Prose response */}
                <div className="sara-prose">
                  <p>
                    This is a post-compromise lateral movement on{" "}
                    <code>dc-prod-01.acme.lan</code>. The same actor likely had a
                    foothold from the Apr 12 phishing wave — incident{" "}
                    <code>INC-1198</code>
                    <a className="sara-cite">1</a> shows the same source IP{" "}
                    <code>185.220.101.42</code>
                    <a className="sara-cite">2</a>, a known Tor exit node flagged
                    by 3 feeds.
                  </p>

                  <h3>What happened</h3>
                  <ul>
                    <li>
                      RDP session opened to <code>dc-prod-01</code> at 14:21
                      using <code>svc_backup_eu</code> — a service account that
                      should not be interactive.
                    </li>
                    <li>
                      Two SMB pivots attempted toward <code>file-srv-04</code>{" "}
                      and <code>jump-srv-02</code> — both failed.
                    </li>
                    <li>
                      LSASS access pattern matches credential dumping
                      <a className="sara-cite">3</a>, but no exfil yet. You have
                      a window.
                    </li>
                  </ul>

                  <h3>Affected</h3>
                  <ul>
                    <li>
                      <code>dc-prod-01.acme.lan</code> — domain controller,
                      EU-West (critical)
                    </li>
                    <li>
                      <code>file-srv-04</code>, <code>jump-srv-02</code> — failed
                      pivot attempts (high)
                    </li>
                    <li>
                      <code>svc_backup_eu</code> — compromised service account
                    </li>
                  </ul>
                </div>

                {/* MITRE row */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="mr-1 inline-flex items-center gap-1.5 text-muted-foreground">
                    <LayoutGrid className="size-3" />
                    MITRE
                  </span>
                  {mitre.map((m) => (
                    <button
                      key={m.id}
                      className="inline-flex h-6 items-center gap-1.5 rounded-md border bg-card px-2 font-mono transition-colors hover:border-primary/40 hover:bg-accent"
                    >
                      {m.id}
                      <span className="text-muted-foreground">{m.confidence}%</span>
                    </button>
                  ))}
                </div>

                {/* Recommended actions */}
                <div className="overflow-hidden rounded-xl border bg-card">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-primary" />
                      <div className="text-sm font-medium">Recommended actions</div>
                    </div>
                    <span className="inline-flex h-5 items-center rounded border bg-muted/40 px-1.5 font-mono text-xs text-muted-foreground">
                      3 of 5
                    </span>
                  </div>
                  <div className="divide-y">
                    <ActionRow
                      icon={<Shield className="size-3.5 text-destructive" />}
                      iconClass="bg-destructive/10 ring-1 ring-destructive/20"
                      title={
                        <>
                          Isolate{" "}
                          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[12.5px]">
                            dc-prod-01
                          </code>{" "}
                          via CrowdStrike
                        </>
                      }
                      hint="Stops the active session. Affects ~200 downstream auths."
                      cta={
                        <Button size="sm" className="h-8 px-3 text-xs">
                          Run
                          <ChevronRight className="size-3" />
                        </Button>
                      }
                    />
                    <ActionRow
                      icon={
                        <CircleSlash className="size-3.5 text-muted-foreground" />
                      }
                      iconClass="bg-muted ring-1 ring-border"
                      title={
                        <>
                          Block{" "}
                          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[12.5px]">
                            185.220.101.42
                          </code>{" "}
                          on perimeter
                        </>
                      }
                      hint="Pushes to Palo Alto + Cloudflare. Auto-revert in 24h."
                      cta={
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs"
                        >
                          Run
                        </Button>
                      }
                    />
                    <ActionRow
                      icon={<FileText className="size-3.5 text-muted-foreground" />}
                      iconClass="bg-muted ring-1 ring-border"
                      title={
                        <>
                          Run playbook{" "}
                          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[12.5px]">
                            Triage-T1021-RDP
                          </code>
                        </>
                      }
                      hint="Pulls auth logs, snapshots LSASS, opens forensics ticket."
                      cta={
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs"
                        >
                          Run
                        </Button>
                      }
                    />
                  </div>
                  <button className="inline-flex w-full items-center justify-center gap-1.5 border-t px-4 py-2 text-xs text-muted-foreground hover:bg-muted/40 hover:text-foreground">
                    Show 2 more
                    <ChevronDown className="size-3" />
                  </button>
                </div>

                {/* Sources */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
                  <Link2 className="size-3 flex-shrink-0" />
                  <span>Sources:</span>
                  <a className="cursor-pointer hover:text-foreground">INC-1198</a>
                  <span>·</span>
                  <a className="cursor-pointer hover:text-foreground">
                    IntelOwl 185.220.101.42
                  </a>
                  <span>·</span>
                  <a className="cursor-pointer hover:text-foreground">
                    MITRE T1003.001
                  </a>
                  <span>·</span>
                  <a className="cursor-pointer hover:text-foreground">+2 more</a>
                </div>

                {/* Reactions + follow-ups */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <div className="-ml-1.5 flex items-center gap-0.5">
                    <ReactionBtn icon={<Copy className="size-3.5" />} title="Copy" />
                    <ReactionBtn
                      icon={<ThumbsUp className="size-3.5" />}
                      title="Helpful"
                    />
                    <ReactionBtn
                      icon={<ThumbsDown className="size-3.5" />}
                      title="Not helpful"
                    />
                    <ReactionBtn
                      icon={<RotateCw className="size-3.5" />}
                      title="Regenerate"
                    />
                  </div>

                  <span className="mx-0.5 h-4 w-px bg-border" />

                  <span className="text-[11px] text-muted-foreground">Try:</span>
                  <FollowupChip icon={<FileText className="size-3" />} label="Draft AAR" />
                  <FollowupChip
                    icon={<Sparkles className="size-3" />}
                    label="Related incidents"
                  />
                  <FollowupChip
                    icon={<Wrench className="size-3" />}
                    label="Sigma rule"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Composer */}
        <div className="px-6 pb-4 pt-2">
          <div className="mx-auto max-w-[720px]">
            <div className="relative overflow-hidden rounded-3xl border bg-background shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)] transition focus-within:border-primary/60 focus-within:bg-[color-mix(in_srgb,var(--primary)_3%,var(--background))] focus-within:ring-4 focus-within:ring-primary/20">
              <textarea
                rows={2}
                placeholder="Ask Sara anything. Type @ to attach an incident, asset, or playbook…"
                className="w-full resize-none bg-transparent px-4 pb-2 pt-3.5 text-[14.5px] leading-6 placeholder:text-muted-foreground focus:outline-none"
              />

              {/* Attachment chip */}
              <div className="flex flex-wrap gap-1.5 px-3 pb-1">
                <span className="inline-flex h-7 items-center gap-1.5 rounded-md border bg-muted/50 pl-2 pr-1 text-xs">
                  <span className="grid size-4 place-items-center rounded bg-destructive/15">
                    <AlertTriangle className="size-2.5 text-destructive" />
                  </span>
                  <span className="font-mono text-foreground">INC-1247</span>
                  <span className="text-muted-foreground">· DC lateral movement</span>
                  <button className="ml-0.5 grid size-5 place-items-center rounded text-muted-foreground hover:bg-accent">
                    <X className="size-3" />
                  </button>
                </span>
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-0.5 px-2 pb-2 pt-1">
                <button
                  className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-accent"
                  title="Attach (⌘+U)"
                >
                  <Paperclip className="size-4" />
                </button>
                <button
                  className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-accent"
                  title="Reference (@)"
                >
                  <AtSign className="size-4" />
                </button>
                <span className="mx-1 h-5 w-px bg-border" />
                <button className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground">
                  <Wrench className="size-3.5" />
                  Tools
                  <ChevronDown className="size-3 opacity-60" />
                </button>

                <div className="flex-1" />

                <button
                  className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-accent"
                  title="Voice"
                >
                  <Mic className="size-4" />
                </button>
                <button
                  className="ml-1 grid size-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:opacity-90"
                  title="Send (⏎)"
                >
                  <ArrowUp className="size-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Footer captions */}
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Claude Opus 4.7 · Tools enabled
              </span>
              <span className="hidden items-center gap-1.5 md:inline-flex">
                <ShieldCheck className="size-3 text-primary" />
                Destructive actions require approval
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                  ⏎
                </kbd>{" "}
                send
                <span className="mx-0.5">·</span>
                <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                  ⇧⏎
                </kbd>{" "}
                newline
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function ActionRow({
  icon,
  iconClass,
  title,
  hint,
  cta,
}: {
  icon: React.ReactNode
  iconClass: string
  title: React.ReactNode
  hint: string
  cta: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div
        className={cn(
          "grid size-7 flex-shrink-0 place-items-center rounded-md",
          iconClass
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>
      </div>
      <div className="flex-shrink-0">{cta}</div>
    </div>
  )
}

function ReactionBtn({
  icon,
  title,
}: {
  icon: React.ReactNode
  title: string
}) {
  return (
    <button
      className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-accent"
      title={title}
    >
      {icon}
    </button>
  )
}

function FollowupChip({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <button className="inline-flex h-6 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
      {icon}
      {label}
    </button>
  )
}
