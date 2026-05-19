/** Lightweight user registry — referenced by incident assignee/members/openedBy. */
export type UserRef = {
  id: string
  name: string
  initials: string
  /** Tailwind gradient class for the avatar background. */
  gradient: string
  /** Profile photo URL (used as Avatar source; falls back to initials). */
  photo: string
  /** Optional active workload count shown under name in cells. */
  workload?: number
}

export const users: Record<string, UserRef> = {
  ahmed: {
    id: "ahmed",
    name: "Ahmed Khan",
    initials: "AK",
    gradient: "from-indigo-500 to-pink-500",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&h=160&fit=crop&crop=faces&auto=format&q=80",
    workload: 5,
  },
  sara: {
    id: "sara",
    name: "Sara Ali",
    initials: "SA",
    gradient: "from-sky-500 to-emerald-500",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&crop=faces&auto=format&q=80",
    workload: 3,
  },
  mariam: {
    id: "mariam",
    name: "Mariam Jaber",
    initials: "MJ",
    gradient: "from-amber-500 to-rose-500",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&h=160&fit=crop&crop=faces&auto=format&q=80",
    workload: 7,
  },
  rashid: {
    id: "rashid",
    name: "Rashid Tariq",
    initials: "RT",
    gradient: "from-emerald-500 to-sky-500",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=faces&auto=format&q=80",
    workload: 2,
  },
  yusuf: {
    id: "yusuf",
    name: "Yusuf Kamal",
    initials: "YK",
    gradient: "from-violet-500 to-fuchsia-500",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=160&h=160&fit=crop&crop=faces&auto=format&q=80",
    workload: 4,
  },
  noor: {
    id: "noor",
    name: "Noor Hassan",
    initials: "NH",
    gradient: "from-cyan-500 to-blue-500",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&h=160&fit=crop&crop=faces&auto=format&q=80",
    workload: 1,
  },
  layla: {
    id: "layla",
    name: "Layla Abbas",
    initials: "LA",
    gradient: "from-rose-500 to-orange-500",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop&crop=faces&auto=format&q=80",
    workload: 6,
  },
}
