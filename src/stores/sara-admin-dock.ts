import { create } from "zustand"

type SaraAdminDockState = {
  open: boolean
  /** A prompt queued from outside the dock (e.g. the command palette) —
   *  the dock sends it automatically on mount/open, then clears it. */
  pendingPrompt: string | null
  setOpen: (open: boolean) => void
  /** Open the dock and immediately ask it something. */
  askSara: (prompt: string) => void
  clearPending: () => void
}

export const useSaraAdminDock = create<SaraAdminDockState>((set) => ({
  open: false,
  pendingPrompt: null,
  setOpen: (open) => set({ open }),
  askSara: (prompt) => set({ open: true, pendingPrompt: prompt }),
  clearPending: () => set({ pendingPrompt: null }),
}))
