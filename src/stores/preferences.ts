import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  DEFAULT_PREFERENCES,
  type Preferences,
} from "@/lib/preferences-types"

type PreferencesActions = {
  set: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void
  reset: () => void
  toggleTheme: () => void
  toggleSidebar: () => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export type PreferencesState = Preferences & PreferencesActions

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,
      sidebarOpen: true,
      set: (key, value) => set({ [key]: value } as Partial<PreferencesState>),
      reset: () => set({ ...DEFAULT_PREFERENCES }),
      toggleTheme: () =>
        set((s) => ({
          themeMode: s.themeMode === "dark" ? "light" : "dark",
        })),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: "sirp-prefs",
      partialize: (s) => ({
        themeMode: s.themeMode,
        themePreset: s.themePreset,
        fontFamily: s.fontFamily,
        sidebarVariant: s.sidebarVariant,
        sidebarCollapsible: s.sidebarCollapsible,
        sidebarDensity: s.sidebarDensity,
        pageLayout: s.pageLayout,
        navbarBehavior: s.navbarBehavior,
        sidebarOpen: s.sidebarOpen,
      }),
    }
  )
)
