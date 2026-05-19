import { useEffect } from "react"
import { usePreferences } from "@/stores/preferences"
import { FONT_OPTIONS } from "@/lib/preferences-types"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeMode = usePreferences((s) => s.themeMode)
  const themePreset = usePreferences((s) => s.themePreset)
  const fontFamily = usePreferences((s) => s.fontFamily)

  // Resolve "system" to the actual OS preference; subscribe to changes.
  useEffect(() => {
    const root = document.documentElement
    const mq = window.matchMedia("(prefers-color-scheme: dark)")

    const apply = () => {
      const isDark =
        themeMode === "dark" || (themeMode === "system" && mq.matches)
      root.classList.toggle("dark", isDark)
    }
    apply()

    if (themeMode === "system") {
      mq.addEventListener("change", apply)
      return () => mq.removeEventListener("change", apply)
    }
  }, [themeMode])

  // Apply theme preset by setting data-theme-preset on <html>.
  // The "default" preset is the baseline (no override), so the attribute is
  // cleared rather than set.
  useEffect(() => {
    const root = document.documentElement
    if (themePreset === "default") {
      root.removeAttribute("data-theme-preset")
    } else {
      root.setAttribute("data-theme-preset", themePreset)
    }
  }, [themePreset])

  // Apply sidebar density by setting data-density on <html>.
  const sidebarDensity = usePreferences((s) => s.sidebarDensity)
  useEffect(() => {
    const root = document.documentElement
    if (sidebarDensity === "default") {
      root.removeAttribute("data-density")
    } else {
      root.setAttribute("data-density", sidebarDensity)
    }
  }, [sidebarDensity])

  // Apply font family by setting --font-sans on the root.
  useEffect(() => {
    const stack =
      FONT_OPTIONS.find((f) => f.value === fontFamily)?.stack ??
      FONT_OPTIONS[0].stack
    document.documentElement.style.setProperty("--font-sans", stack)
  }, [fontFamily])

  return <>{children}</>
}
