export const GENRE_OPTIONS = ['流行', '摇滚', '电子', '嘻哈', 'R&B', '爵士', '古典', '民谣', '金属', '朋克', '另类', '独立', '后摇', '梦幻流行', '低保真', '世界音乐']

export interface Track {
  id: string
  name: string
  score: number
}

export interface Album {
  id: string
  albumName: string
  artistName: string
  coverUrl: string
  listenDate: string
  genres: string[]
  interpretation: string
  tracks: Track[]
  averageScore: number
}

export interface ParseResult {
  albumName: string
  coverUrl: string
  artistName: string
  tracks: { name: string; id: number }[]
  genres: string[]
}
