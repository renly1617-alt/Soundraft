import { create } from 'zustand'

export interface UserProfile {
  name: string
  avatarUrl: string
}

interface UserState {
  profile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void
}

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  avatarUrl: '',
}

const loadProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem('user_profile')
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : DEFAULT_PROFILE
  } catch {
    return DEFAULT_PROFILE
  }
}

export const useUserStore = create<UserState>((set) => ({
  profile: loadProfile(),

  updateProfile: (updates) => {
    set((state) => {
      const profile = { ...state.profile, ...updates }
      localStorage.setItem('user_profile', JSON.stringify(profile))
      return { profile }
    })
  },
}))
