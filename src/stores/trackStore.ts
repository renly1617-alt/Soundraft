import { create } from 'zustand'

export interface TrackEntry {
  id: string
  songName: string
  artistName: string
  albumName: string
  coverUrl: string
  listenDate: string
  genres: string[]
  score: number
  notes: string
}

interface TrackState {
  tracks: TrackEntry[]
  addTrack: (data: Omit<TrackEntry, 'id'>) => void
  updateTrack: (id: string, updates: Partial<TrackEntry>) => void
  deleteTrack: (id: string) => void
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

const load = (): TrackEntry[] => {
  try {
    const raw = localStorage.getItem('track_collection')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const save = (tracks: TrackEntry[]) => {
  localStorage.setItem('track_collection', JSON.stringify(tracks))
}

export const useTrackStore = create<TrackState>((set, get) => ({
  tracks: load(),

  addTrack: (data) => {
    const entry: TrackEntry = { ...data, id: generateId() }
    const tracks = [entry, ...get().tracks]
    save(tracks)
    set({ tracks })
  },

  updateTrack: (id, updates) => {
    const tracks = get().tracks.map(t => t.id === id ? { ...t, ...updates } : t)
    save(tracks)
    set({ tracks })
  },

  deleteTrack: (id) => {
    const tracks = get().tracks.filter(t => t.id !== id)
    save(tracks)
    set({ tracks })
  },
}))
