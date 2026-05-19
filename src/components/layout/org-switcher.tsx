import { useState } from "react"
import { ChevronsUpDown, Plus, Settings2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type Tenant = {
  id: string
  name: string
  scope: string
  initials: string
  gradient: string
}

const tenants: Tenant[] = [
  {
    id: "acme",
    name: "Acme Corp",
    scope: "prod · Tier 1 SOC",
    initials: "AC",
    gradient: "from-fuchsia-500 to-violet-600",
  },
  {
    id: "acme-stg",
    name: "Acme Corp",
    scope: "staging · sandbox",
    initials: "AC",
    gradient: "from-amber-500 to-rose-500",
  },
  {
    id: "globex",
    name: "Globex EU",
    scope: "prod · MSSP-managed",
    initials: "GE",
    gradient: "from-emerald-500 to-teal-600",
  },
]

export function OrgSwitcher() {
  const { isMobile } = useSidebar()
  const [activeId, setActiveId] = useState(tenants[0].id)
  const active = tenants.find((t) => t.id === activeId) ?? tenants[0]

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar
                className={cn(
                  "size-8 rounded-lg bg-gradient-to-br",
                  active.gradient
                )}
              >
                <AvatarFallback className="rounded-lg bg-transparent text-xs font-semibold text-white">
                  {active.initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{active.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {active.scope}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Tenants
            </DropdownMenuLabel>
            {tenants.map((t, i) => (
              <DropdownMenuItem
                key={t.id}
                onSelect={() => setActiveId(t.id)}
                className={cn(
                  "gap-2 p-2",
                  t.id === activeId && "bg-accent/50"
                )}
              >
                <Avatar
                  className={cn(
                    "size-7 rounded-md bg-gradient-to-br",
                    t.gradient
                  )}
                >
                  <AvatarFallback className="rounded-md bg-transparent text-[10px] font-semibold text-white">
                    {t.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-medium">{t.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {t.scope}
                  </span>
                </div>
                <DropdownMenuShortcut>⌘{i + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2 text-muted-foreground">
              <div className="grid size-7 place-items-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <span className="text-sm font-medium">Add tenant</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 p-2 text-muted-foreground">
              <div className="grid size-7 place-items-center rounded-md border bg-background">
                <Settings2 className="size-4" />
              </div>
              <span className="text-sm font-medium">Manage tenants</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
