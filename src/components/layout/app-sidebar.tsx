import { NavLink, useLocation } from "react-router"
import { ChevronRight } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { navSections, type NavItem } from "./nav-config"
import { OrgSwitcher } from "./org-switcher"
import { NavUser } from "./nav-user"
import type {
  SidebarCollapsible,
  SidebarVariant,
} from "@/lib/preferences-types"

type Props = {
  variant?: SidebarVariant
  collapsible?: SidebarCollapsible
}

function isPathActive(pathname: string, url: string): boolean {
  if (url === "/") return pathname === "/"
  return pathname === url || pathname.startsWith(`${url}/`)
}

function ItemBadge({ badge }: { badge: string | number }) {
  if (typeof badge === "number") {
    return (
      <span className="ml-auto inline-flex h-[18px] min-w-[20px] items-center justify-center rounded-full bg-destructive/15 px-1.5 text-xs font-semibold text-destructive">
        {badge}
      </span>
    )
  }
  return (
    <span className="ml-auto inline-flex h-[18px] items-center justify-center rounded-full border bg-transparent px-1.5 text-[10px] font-medium text-muted-foreground">
      {badge}
    </span>
  )
}

function FlatNavItem({ item }: { item: NavItem }) {
  const Icon = item.icon
  const { pathname } = useLocation()
  const active = isPathActive(pathname, item.url)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
        <NavLink to={item.url}>
          {Icon && <Icon className="size-4" />}
          <span>{item.title}</span>
          {item.badge !== undefined && <ItemBadge badge={item.badge} />}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function CollapsibleNavItem({ item }: { item: NavItem }) {
  const Icon = item.icon
  const { pathname } = useLocation()
  const { state, isMobile } = useSidebar()
  const collapsed = state === "collapsed"
  const childActive = item.children?.some((c) => isPathActive(pathname, c.url))
  const active = isPathActive(pathname, item.url) || !!childActive

  /**
   * Collapsed mode — show a flyout dropdown to the right.
   * The icon acts as the trigger; hovering/clicking reveals all
   * sub-items in a compact menu positioned to the right of the rail.
   */
  if (collapsed) {
    return (
      <SidebarMenuItem>
        <DropdownMenu modal={false}>
          {/*
            Do not wrap DropdownMenuTrigger in TooltipTrigger — Radix tooltip + menu on the same
            control often blocks the first click / menu open. Use native title on the button for
            a hover hint on the icon rail instead.
          */}
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              isActive={active}
              type="button"
              aria-label={`${item.title}: open submenu`}
              title={isMobile ? undefined : `${item.title} — click for pages`}
            >
              {Icon && <Icon className="size-4" />}
              <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" sideOffset={6} className="min-w-[200px]">
            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
              {item.title}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {item.children?.map((child) => {
              const childActive = isPathActive(pathname, child.url)
              return (
                <DropdownMenuItem key={child.url} asChild className={childActive ? "bg-accent" : ""}>
                  <NavLink to={child.url} className="flex items-center gap-2">
                    <span className="flex-1">{child.title}</span>
                    {child.badge !== undefined && (
                      <span className="inline-flex h-[16px] min-w-[18px] items-center justify-center rounded-full bg-destructive/15 px-1 text-[10px] font-semibold text-destructive">
                        {child.badge}
                      </span>
                    )}
                  </NavLink>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    )
  }

  /**
   * Expanded mode — collapsible with animated chevron.
   */
  return (
    <SidebarMenuItem>
      <Collapsible
        defaultOpen={item.defaultOpen || !!childActive}
        className="group/collapsible w-full"
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title} isActive={active}>
            {Icon && <Icon className="size-4" />}
            <span>{item.title}</span>
            <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children!.map((child) => {
              const childIsActive = isPathActive(pathname, child.url)
              return (
                <SidebarMenuSubItem key={child.url}>
                  <SidebarMenuSubButton asChild isActive={childIsActive}>
                    <NavLink to={child.url}>
                      <span>{child.title}</span>
                      {child.badge !== undefined && (
                        <ItemBadge badge={child.badge} />
                      )}
                    </NavLink>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  )
}

export function AppSidebar({ variant = "inset", collapsible = "icon" }: Props) {
  return (
    <Sidebar variant={variant} collapsible={collapsible}>
      <SidebarHeader>
        <OrgSwitcher />
      </SidebarHeader>

      <SidebarContent>
        {navSections.map((section, idx) => (
          <SidebarGroup key={section.label || `group-${idx}`}>
            {section.label && (
              <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) =>
                  item.children?.length ? (
                    <CollapsibleNavItem key={item.url} item={item} />
                  ) : (
                    <FlatNavItem key={item.url} item={item} />
                  )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
