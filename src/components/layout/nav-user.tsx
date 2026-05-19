import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  Keyboard,
  LogOut,
  Moon,
  Sparkles,
  Sun,
  UserRound,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePreferences } from "@/stores/preferences"

export const currentUser = {
  name: "Ahmed Khan",
  email: "ahmed@sirp.io",
  initials: "AK",
  gradient: "from-indigo-500 to-pink-500",
  photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&h=160&fit=crop&crop=faces&auto=format&q=80",
}

/**
 * Shared dropdown body — used by the sidebar footer (NavUser) and by the
 * topbar avatar so account actions are available from both surfaces.
 */
export function NavUserMenuContent({
  side = "right",
  align = "end",
  className = "w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-lg",
}: {
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  className?: string
}) {
  const themeMode = usePreferences((s) => s.themeMode)
  const toggleTheme = usePreferences((s) => s.toggleTheme)

  const isDark =
    themeMode === "dark" ||
    (themeMode === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <DropdownMenuContent
      className={className}
      side={side}
      align={align}
      sideOffset={4}
    >
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5">
          <Avatar
            className={`size-8 rounded-lg bg-linear-to-br ${currentUser.gradient}`}
          >
            <AvatarImage src={currentUser.photo} alt={currentUser.name} className="rounded-lg" />
            <AvatarFallback className="rounded-lg bg-transparent text-xs font-semibold text-white">
              {currentUser.initials}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{currentUser.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {currentUser.email}
            </span>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        <DropdownMenuItem>
          <Sparkles />
          Upgrade plan
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        <DropdownMenuItem>
          <UserRound />
          Account
          <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <BadgeCheck />
          Preferences
          <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CreditCard />
          Billing
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Bell />
          Notifications
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Keyboard />
          Keyboard shortcuts
          <DropdownMenuShortcut>⌘/</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />

      <DropdownMenuItem
        onSelect={(e) => {
          e.preventDefault()
          toggleTheme()
        }}
      >
        {isDark ? <Sun /> : <Moon />}
        {isDark ? "Light theme" : "Dark theme"}
      </DropdownMenuItem>
      <DropdownMenuSeparator />

      <DropdownMenuItem className="text-destructive focus:text-destructive">
        <LogOut className="text-destructive" />
        Log out
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}

export function NavUser() {
  const { isMobile } = useSidebar()

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
                className={`size-8 rounded-lg bg-gradient-to-br ${currentUser.gradient}`}
              >
                <AvatarFallback className="rounded-lg bg-transparent text-xs font-semibold text-white">
                  {currentUser.initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{currentUser.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {currentUser.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <NavUserMenuContent side={isMobile ? "bottom" : "right"} align="end" />
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
