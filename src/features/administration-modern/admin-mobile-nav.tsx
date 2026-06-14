import { useLocation, useNavigate } from "react-router"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { flattenAdminNavForSelect } from "./admin-nav-sections"

/**
 * Compact admin IA for viewports where the desktop sub-nav is hidden.
 */
export function AdminMobileNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const flat = flattenAdminNavForSelect()

  const value = flat.some((e) => e.value === pathname) ? pathname : "/admin"

  return (
    <div className="mb-5 space-y-2 lg:hidden">
      <Label htmlFor="admin-mobile-section" className="text-xs text-muted-foreground">
        Administration
      </Label>
      <Select
        value={value}
        onValueChange={(next) => {
          navigate(next)
        }}
      >
        <SelectTrigger id="admin-mobile-section" className="w-full" size="default">
          <SelectValue placeholder="Choose a page" />
        </SelectTrigger>
        <SelectContent className="max-h-[min(70vh,420px)]">
          {adminNavSelectGroups(flat).map((group) => (
            <SelectGroup key={group.label ?? "root"}>
              {group.label && <SelectLabel>{group.label}</SelectLabel>}
              {group.items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function adminNavSelectGroups(
  flat: ReturnType<typeof flattenAdminNavForSelect>
): { label?: string; items: { value: string; label: string }[] }[] {
  const groups: { label?: string; items: { value: string; label: string }[] }[] = []
  for (const row of flat) {
    const last = groups[groups.length - 1]
    if (!last || last.label !== row.section) {
      groups.push({ label: row.section, items: [{ value: row.value, label: row.label }] })
    } else {
      last.items.push({ value: row.value, label: row.label })
    }
  }
  return groups
}
