import { create } from 'zustand'
import type { Album, Track } from '@/types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function calcAverage(tracks: Track[]): number {
  const scored = tracks.filter(t => t.score > 0)
  if (scored.length === 0) return 0
  return Math.round((scored.reduce((a, b) => a + b.score, 0) / scored.length) * 10) / 10
}

interface AlbumState {
  albums: Album[]
  addAlbum: (album: Omit<Album, 'id' | 'averageScore' | 'tracks'> & { tracks: { name: string }[] }) => void
  updateAlbum: (id: string, updates: Partial<Album>) => void
  deleteAlbum: (id: string) => void
  updateTrackScore: (albumId: string, trackIndex: number, score: number) => void
}

const loadAlbums = (): Album[] => {
  try {
    const raw = localStorage.getItem('album_collection')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveAlbums = (albums: Album[]) => {
  localStorage.setItem('album_collection', JSON.stringify(albums))
}

export const useAlbumStore = create<AlbumState>((set, get) => ({
  albums: loadAlbums(),

  addAlbum: (data) => {
    const tracks: Track[] = data.tracks.map(t => ({
      id: generateId(),
      name: t.name,
      score: 0,
    }))
    const album: Album = {
      id: generateId(),
      albumName: data.albumName,
      artistName: data.artistName,
      coverUrl: data.coverUrl,
      listenDate: data.listenDate,
      genres: data.genres,
      interpretation: data.interpretation,
      tracks,
      averageScore: 0,
    }
    const albums = [album, ...get().albums]
    saveAlbums(albums)
    set({ albums })
  },

  updateAlbum: (id, updates) => {
    const albums = get().albums.map(a => {
      if (a.id !== id) return a
      const merged = { ...a, ...updates }
      if (updates.tracks) {
        merged.averageScore = calcAverage(merged.tracks)
      }
      return merged
    })
    saveAlbums(albums)
    set({ albums })
  },

  deleteAlbum: (id) => {
    const albums = get().albums.filter(a => a.id !== id)
    saveAlbums(albums)
    set({ albums })
  },

  updateTrackScore: (albumId, trackIndex, score) => {
    const albums = get().albums.map(a => {
      if (a.id !== albumId) return a
      const tracks = a.tracks.map((t, i) =>
        i === trackIndex ? { ...t, score } : t
      )
      return { ...a, tracks, averageScore: calcAverage(tracks) }
    })
    saveAlbums(albums)
    set({ albums })
  },
}))
