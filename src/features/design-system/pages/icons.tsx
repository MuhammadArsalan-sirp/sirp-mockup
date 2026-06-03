import type { LucideIcon } from "lucide-react"
import {
  Activity, AlertTriangle, Bell, BookOpen, Brain, CheckCircle2, Cpu,
  FileText, Globe, HelpCircle, Layers, Mail, Network, Shield, Sparkles,
  Tag, Timer, UserCheck, Wrench, XCircle, Zap,
} from "lucide-react"
import { SubSection } from "../showcase"

const COMMON_ICONS: { Icon: LucideIcon; name: string; use: string }[] = [
  { Icon: Shield,        name: "Shield",        use: "IOCs, defensive surface" },
  { Icon: Bell,          name: "Bell",          use: "alerts" },
  { Icon: Activity,      name: "Activity",      use: "timeline, signals" },
  { Icon: Layers,        name: "Layers",        use: "artifacts, entities tab" },
  { Icon: Network,       name: "Network",       use: "entities, blast radius" },
  { Icon: Brain,         name: "Brain",         use: "OmniSense analysis agent" },
  { Icon: Globe,         name: "Globe",         use: "enrichment, IP / domain" },
  { Icon: FileText,      name: "FileText",      use: "logs, files" },
  { Icon: Sparkles,      name: "Sparkles",      use: "OmniSense Co-Analyst" },
  { Icon: CheckCircle2,  name: "CheckCircle2",  use: "done state" },
  { Icon: AlertTriangle, name: "AlertTriangle", use: "warn verdict" },
  { Icon: HelpCircle,    name: "HelpCircle",    use: "unknown / inconclusive" },
  { Icon: XCircle,       name: "XCircle",       use: "failed state" },
  { Icon: Mail,          name: "Mail",          use: "email enrichment, comms" },
  { Icon: BookOpen,      name: "BookOpen",      use: "playbooks, incidents" },
  { Icon: UserCheck,     name: "UserCheck",     use: "assign / owner notify" },
  { Icon: Wrench,        name: "Wrench",        use: "remediation" },
  { Icon: Cpu,           name: "Cpu",           use: "system events" },
  { Icon: Tag,           name: "Tag",           use: "classification, tags" },
  { Icon: Timer,         name: "Timer",         use: "SLA" },
  { Icon: Zap,           name: "Zap",           use: "S3 score, actions" },
]

export function IconsPage() {
  return (
    <div className="space-y-10">
      <SubSection title="Common Lucide icons" description="The icons that show up most in the app. Use the same icon for the same concept.">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {COMMON_ICONS.map(({ Icon, name, use }) => (
            <div key={name} className="flex items-start gap-3 rounded-lg border bg-card px-3 py-2.5">
              <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[11px] font-semibold leading-tight">{name}</div>
                <div className="mt-0.5 text-[10px] leading-snug text-muted-foreground">{use}</div>
              </div>
            </div>
          ))}
        </div>
      </SubSection>

      <SubSection title="Size ladder" description="Pick the smallest size that reads. Icons inside tone boxes are sized off the box dimension.">
        <div className="overflow-hidden rounded-lg border bg-card">
          <IconSizeRow size="size-2.5" px="10px" use="micro dots inside chips" />
          <IconSizeRow size="size-3"   px="12px" use="inline labels, status dots-with-icon" />
          <IconSizeRow size="size-3.5" px="14px" use="header icons, small buttons" />
          <IconSizeRow size="size-4"   px="16px" use="icon-in-tone-box content (size-8 box)" />
          <IconSizeRow size="size-5"   px="20px" use="larger icon-in-tone-box (size-10 box)" />
          <IconSizeRow size="size-6"   px="24px" use="hero icons (verdict callout, etc.)" />
        </div>
      </SubSection>

      <SubSection title="Rules">
        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>• Default icon color is <strong className="text-foreground">currentColor</strong>. Set the color on the wrapping element, not the icon.</li>
          <li>• Inside a tone box, icon size is roughly half the box size (e.g. <strong>size-4</strong> inside a <strong>size-8</strong> box).</li>
          <li>• Brand icons (vendor logos like Splunk, AWS) live in <strong>SourceIcon</strong>, not as raw Lucide icons.</li>
        </ul>
      </SubSection>
    </div>
  )
}

function IconSizeRow({ size, px, use }: { size: string; px: string; use: string }) {
  return (
    <div className="grid grid-cols-[1fr_1fr_2fr_auto] items-center gap-4 border-b px-4 py-2.5 last:border-b-0">
      <div className="font-mono text-xs">{size}</div>
      <div className="font-mono text-[10px] text-muted-foreground">{px}</div>
      <div className="text-xs text-muted-foreground">{use}</div>
      <Shield className={size} />
    </div>
  )
}
