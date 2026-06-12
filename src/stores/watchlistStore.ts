import { create } from 'zustand'

export interface WatchlistItem {
  id: string
  albumName: string
  artistName: string
  genre: string
  coverUrl: string
  year: string
  blurb: string
  addedAt: number
}

interface WatchlistState {
  items: WatchlistItem[]
  addItem: (item: Omit<WatchlistItem, 'id' | 'addedAt'>) => void
  removeItem: (albumName: string, artistName: string) => void
  isWatched: (albumName: string, artistName: string) => boolean
}

const load = (): WatchlistItem[] => {
  try {
    const raw = localStorage.getItem('watchlist')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const save = (items: WatchlistItem[]) => {
  localStorage.setItem('watchlist', JSON.stringify(items))
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  items: load(),

  addItem: (item) => {
    if (get().isWatched(item.albumName, item.artistName)) return
    const entry: WatchlistItem = {
      ...item,
      id: Date.now().toString(36),
      addedAt: Date.now(),
    }
    const items = [entry, ...get().items]
    save(items)
    set({ items })
  },

  removeItem: (albumName, artistName) => {
    const items = get().items.filter(
      i => !(i.albumName === albumName && i.artistName === artistName)
    )
    save(items)
    set({ items })
  },

  isWatched: (albumName, artistName) => {
    return get().items.some(
      i => i.albumName === albumName && i.artistName === artistName
    )
  },
}))
