import { create } from 'zustand'

interface AuthState {
  user: { id: string; email: string; role: string; name: string; profilePhoto?: string | null } | null
  panelOpen: boolean
  setUser: (user: AuthState['user']) => void
  setPanelOpen: (open: boolean) => void
  openPanel: () => void
  closePanel: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  panelOpen: false,
  setUser: (user) => set({ user, panelOpen: true }),
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  openPanel: () => set({ panelOpen: true }),
  closePanel: () => set({ panelOpen: false }),
  logout: () => set({ user: null, panelOpen: false }),
}))
