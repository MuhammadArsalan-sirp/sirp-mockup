import { create } from "zustand"

type CommandPaletteState = {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

/**
 * Global ⌘K palette open state. Kept outside React so both the Topbar
 * trigger button and the global keydown listener (mounted once in
 * AppShell) can drive the same dialog without prop drilling.
 */
export const useCommandPalette = create<CommandPaletteState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
}))
