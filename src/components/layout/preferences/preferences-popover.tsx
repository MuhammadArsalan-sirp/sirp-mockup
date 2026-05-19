import { Check, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Segmented } from "@/components/shared/segmented"
import { usePreferences } from "@/stores/preferences"
import { cn } from "@/lib/utils"
import {
  FONT_OPTIONS,
  THEME_PRESET_OPTIONS,
  type FontFamily,
  type NavbarBehavior,
  type PageLayout,
  type SidebarCollapsible,
  type SidebarDensity,
  type SidebarVariant,
  type ThemeMode,
  type ThemePreset,
} from "@/lib/preferences-types"
import { PreferencesSection } from "./preferences-section"

const themeModeOpts = [
  { value: "light" as ThemeMode, label: "Light" },
  { value: "dark" as ThemeMode, label: "Dark" },
  { value: "system" as ThemeMode, label: "System" },
]

const pageLayoutOpts = [
  { value: "centered" as PageLayout, label: "Centered" },
  { value: "full-width" as PageLayout, label: "Full Width" },
]

const navbarBehaviorOpts = [
  { value: "sticky" as NavbarBehavior, label: "Sticky" },
  { value: "scroll" as NavbarBehavior, label: "Scroll" },
]

const sidebarVariantOpts = [
  { value: "inset" as SidebarVariant, label: "Inset" },
  { value: "sidebar" as SidebarVariant, label: "Sidebar" },
  { value: "floating" as SidebarVariant, label: "Floating" },
]

const sidebarCollapsibleOpts = [
  { value: "icon" as SidebarCollapsible, label: "Icon" },
  { value: "offcanvas" as SidebarCollapsible, label: "OffCanvas" },
]

const sidebarDensityOpts = [
  { value: "compact" as SidebarDensity, label: "Compact" },
  { value: "default" as SidebarDensity, label: "Default" },
  { value: "spacious" as SidebarDensity, label: "Spacious" },
]

export function PreferencesPopover() {
  const prefs = usePreferences()

  // Render preset swatches in whichever mode is currently active so the
  // mini previews match what the user will actually see.
  const isDark =
    prefs.themeMode === "dark" ||
    (prefs.themeMode === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Preferences">
          <Settings className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[320px] p-0 overflow-hidden"
      >
        <div className="px-4 py-3 border-b">
          <div className="text-sm font-semibold">Preferences</div>
          <div className="text-xs text-muted-foreground">
            Customize your dashboard layout preferences.
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-4 py-3 space-y-4">
          <PreferencesSection label="Theme Preset">
            <div className="-mx-1 space-y-0.5">
              {THEME_PRESET_OPTIONS.map((p) => {
                const active = prefs.themePreset === p.value
                const tones = isDark ? p.dark : p.light
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() =>
                      prefs.set("themePreset", p.value as ThemePreset)
                    }
                    title={p.description}
                    aria-pressed={active}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/60"
                    )}
                  >
                    {/* Palette dots — bg / card / accent / brand */}
                    <span aria-hidden className="flex shrink-0 gap-1">
                      <span
                        className="size-3 rounded-[2px]"
                        style={{ background: tones.bg }}
                      />
                      <span
                        className="size-3 rounded-[2px]"
                        style={{ background: tones.card }}
                      />
                      <span
                        className="size-3 rounded-[2px]"
                        style={{ background: tones.accent }}
                      />
                      <span
                        className="size-3 rounded-[2px]"
                        style={{ background: "#8e2dff" }}
                      />
                    </span>
                    <span className="flex-1 truncate text-sm">{p.label}</span>
                    {active && (
                      <Check className="size-4 shrink-0 text-foreground" />
                    )}
                  </button>
                )
              })}
            </div>
          </PreferencesSection>

          <PreferencesSection label="Font">
            <Select
              value={prefs.fontFamily}
              onValueChange={(v) => prefs.set("fontFamily", v as FontFamily)}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  // Render the chosen font name in its own face so the trigger
                  // previews what's active.
                  asChild
                >
                  <span
                    style={{
                      fontFamily: FONT_OPTIONS.find(
                        (f) => f.value === prefs.fontFamily
                      )?.stack,
                    }}
                    className="truncate"
                  >
                    {
                      FONT_OPTIONS.find((f) => f.value === prefs.fontFamily)
                        ?.label
                    }
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {FONT_OPTIONS.map((f) => (
                  <SelectItem key={f.value} value={f.value} className="py-1.5">
                    <span className="flex w-full items-center gap-3">
                      <span
                        aria-hidden
                        className="grid w-7 shrink-0 place-items-center text-[15px] font-medium leading-none text-foreground"
                        style={{ fontFamily: f.stack }}
                      >
                        Aa
                      </span>
                      <span className="text-sm">{f.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </PreferencesSection>

          <PreferencesSection label="Theme Mode">
            <Segmented
              value={prefs.themeMode}
              onChange={(v) => prefs.set("themeMode", v)}
              options={themeModeOpts}
            />
          </PreferencesSection>

          <Separator />

          <PreferencesSection label="Page Layout">
            <Segmented
              value={prefs.pageLayout}
              onChange={(v) => prefs.set("pageLayout", v)}
              options={pageLayoutOpts}
            />
          </PreferencesSection>

          <PreferencesSection label="Navbar Behavior">
            <Segmented
              value={prefs.navbarBehavior}
              onChange={(v) => prefs.set("navbarBehavior", v)}
              options={navbarBehaviorOpts}
            />
          </PreferencesSection>

          <PreferencesSection label="Sidebar Style">
            <Segmented
              value={prefs.sidebarVariant}
              onChange={(v) => prefs.set("sidebarVariant", v)}
              options={sidebarVariantOpts}
            />
          </PreferencesSection>

          <PreferencesSection label="Sidebar Collapse Mode">
            <Segmented
              value={prefs.sidebarCollapsible}
              onChange={(v) => prefs.set("sidebarCollapsible", v)}
              options={sidebarCollapsibleOpts}
            />
          </PreferencesSection>

          <PreferencesSection label="Sidebar Density">
            <Segmented
              value={prefs.sidebarDensity}
              onChange={(v) => prefs.set("sidebarDensity", v)}
              options={sidebarDensityOpts}
            />
          </PreferencesSection>
        </div>

        <div className="border-t p-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => prefs.reset()}
          >
            Restore Defaults
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
