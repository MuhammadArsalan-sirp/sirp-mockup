import { create } from "zustand"

export type SaraFindingStatus = "pending" | "applied" | "dismissed" | "approved" | "declined"

type SaraFindingsState = {
  /** Keyed by SaraFinding.id. Absent = "pending". Shared so the dock, the
   *  Security posture page, and the Approval Queue all agree on where a
   *  finding stands — deciding it in one place reflects everywhere. */
  status: Record<string, SaraFindingStatus>
  setStatus: (id: string, status: SaraFindingStatus) => void
}

export const useSaraFindingsStore = create<SaraFindingsState>((set) => ({
  status: {},
  setStatus: (id, status) =>
    set((s) => ({ status: { ...s.status, [id]: status } })),
}))
