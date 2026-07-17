import { useEffect } from "react"
import { useNavigate } from "react-router"
import {
  AlertTriangle,
  Bot,
  Boxes,
  Database,
  LayoutDashboard,
  Network,
  Shield,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { useCommandPalette } from "@/stores/command-palette"
import { useSaraAdminDock } from "@/stores/sara-admin-dock"
import { flattenAdminNavForSelect } from "@/features/administration-modern/admin-nav-sections"

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/incidents", label: "Incidents", icon: AlertTriangle },
  { to: "/threat-intel", label: "Threat intelligence", icon: Shield },
  { to: "/entities", label: "Entities", icon: Database },
  { to: "/autonomy", label: "Autonomy", icon: Network },
  { to: "/sara", label: "Sara", icon: Sparkles },
  { to: "/omnisense", label: "OmniSense", icon: Boxes },
]

const ASK_SARA_PROMPTS = [
  "Any unused SSO providers?",
  "Which roles can delete without viewing?",
  "Show dormant accounts",
]

/**
 * Global ⌘K palette. Mounted once in AppShell so the shortcut and the
 * Topbar's search button both work from any page. Three kinds of results:
 * jump to a top-level section, jump straight into a specific admin setting
 * (reuses the same list that drives the admin left rail), or hand off to
 * Sara with a prompt already queued.
 */
export function CommandPalette() {
  const open = useCommandPalette((s) => s.open)
  const setOpen = useCommandPalette((s) => s.setOpen)
  const navigate = useNavigate()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        useCommandPalette.getState().toggle()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const go = (to: string) => {
    navigate(to)
    setOpen(false)
  }

  const askSara = (prompt: string) => {
    useSaraAdminDock.getState().askSara(prompt)
    navigate("/admin-modern")
    setOpen(false)
  }

  const adminItems = flattenAdminNavForSelect().filter((i) => i.section)

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search across SIRP"
      description="Jump to a page, an admin setting, or ask Sara"
    >
      <CommandInput placeholder="Search pages, settings, or ask Sara…" />
      <CommandList>
        <CommandEmpty>No results. Try asking Sara instead.</CommandEmpty>

        <CommandGroup heading="Go to">
          {NAV_ITEMS.map((item) => (
            <CommandItem key={item.to} value={item.label} onSelect={() => go(item.to)}>
              <item.icon />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Administration">
          {adminItems.map((item) => (
            <CommandItem
              key={item.value}
              value={`${item.section} ${item.label}`}
              onSelect={() => go(item.value)}
            >
              <ShieldCheck />
              {item.label}
              <CommandShortcut>{item.section}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Ask Sara">
          {ASK_SARA_PROMPTS.map((prompt) => (
            <CommandItem key={prompt} value={`ask sara ${prompt}`} onSelect={() => askSara(prompt)}>
              <Bot />
              {prompt}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
