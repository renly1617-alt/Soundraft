import { Router, type Request, type Response } from 'express'
import { ALBUMS, type AlbumEntry } from '../data/albums.js'
import { STYLES } from '../data/styles.js'

const router = Router()

function hashDate(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return hash
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

async function searchAlbumCover(albumName: string, artistName: string): Promise<string> {
  try {
    const query = encodeURIComponent(`${albumName} ${artistName}`)
    const resp = await fetch(
      `https://music.163.com/api/search/get?s=${query}&type=10&limit=1`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://music.163.com/',
        },
      }
    )
    if (!resp.ok) return ''
    const json = await resp.json()
    const album = json?.result?.albums?.[0]
    if (album?.picUrl) {
      return (album.picUrl as string).replace(/^http:/, 'https:')
    }
    return ''
  } catch {
    return ''
  }
}

const GENRE_MAP: Record<string, string> = {
  'Rock': '摇滚',
  'Alternative': '另类',
  'Pop': '流行',
  'Electronic': '电子',
  'Hip-Hop': '嘻哈',
  'R&B': 'R&B',
  'Jazz': '爵士',
  'Folk': '民谣',
  'Punk': '朋克',
  'Metal': '金属',
  'Soul': 'R&B',
  'Funk': '放克',
  'Indie Pop': '独立流行',
  'Art Pop': '艺术流行',
  'Baroque Pop': '巴洛克流行',
  'Reggae': '世界音乐',
  'Post-Punk': '后朋克',
  'Shoegaze': '梦幻流行',
  'Synth-Pop': '电子',
  'Dream Pop': '梦幻流行',
  'Trip Hop': '电子',
  'Jazz-Funk': '爵士',
  'Grunge': '摇滚',
  'Ambient': '电子',
  'Lo-Fi': '低保真',
  'Garage Rock': '摇滚',
  'Indie Rock': '独立',
  'Neo-Soul': 'R&B',
  'World Music': '世界音乐',
  'Electro-Funk': '电子',
  'Modern Classical': '古典',
  'Post-Rock': '后摇',
  'Jazz Rap': '嘻哈',
  'Indie Folk': '民谣',
  'Progressive Rock': '前卫摇滚',
}

function matchGenre(albumGenre: string, userGenres: string[]): boolean {
  const mapped = GENRE_MAP[albumGenre] || albumGenre
  return userGenres.some(g => mapped.includes(g) || g.includes(mapped) || mapped === g)
}

const coverCache: Record<string, string> = {}

async function getCover(album: AlbumEntry): Promise<string> {
  const key = `${album.albumName}_${album.artistName}`
  if (coverCache[key]) return coverCache[key]
  const cover = await searchAlbumCover(album.albumName, album.artistName)
  coverCache[key] = cover
  return cover
}

router.post('/recommend', async (_req: Request, res: Response) => {
  try {
    const idx = Math.abs(hashDate(todayStr())) % ALBUMS.length
    const album = ALBUMS[idx]
    const coverUrl = await getCover(album)

    res.json({
      success: true,
      data: {
        albumName: album.albumName,
        artistName: album.artistName,
        year: album.year,
        genre: album.genre,
        blurb: album.blurb,
        intro: album.intro,
        tracks: album.tracks,
        coverUrl,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误'
    res.status(500).json({ success: false, error: `推荐失败: ${message}` })
  }
})

router.post('/review', async (_req: Request, res: Response) => {
  try {
    const idx = Math.abs(hashDate(todayStr() + '_review')) % STYLES.length
    const style = STYLES[idx]
    res.json({ success: true, data: style })
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误'
    res.status(500).json({ success: false, error: `风格介绍失败: ${message}` })
  }
})

router.post('/similar', async (req: Request, res: Response) => {
  try {
    const { likedAlbums, likedGenres } = req.body

    if (!likedAlbums || !likedGenres) {
      res.status(400).json({ success: false, error: '缺少收藏数据' })
      return
    }

    const userGenres: string[] = typeof likedGenres === 'string'
      ? (likedGenres as string).split('、')
      : likedGenres

    const userAlbums: string = typeof likedAlbums === 'string' ? likedAlbums : ''

    const scored = userAlbums.split('、').map(s => s.trim()).filter(Boolean)

    const matches = ALBUMS.filter(a => {
      const isMatch = matchGenre(a.genre, userGenres)
      const isNotOwned = !scored.some(s => s.includes(a.albumName) && s.includes(a.artistName))
      return isMatch && isNotOwned
    })

    const shuffled = [...matches].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, 3)

    const enriched = await Promise.all(
      selected.map(async (a) => ({
        albumName: a.albumName,
        artistName: a.artistName,
        year: a.year,
        genre: a.genre,
        blurb: a.blurb,
        intro: a.intro,
        reasons: a.reasons,
        tracks: a.tracks,
        coverUrl: await getCover(a),
      }))
    )

    res.json({ success: true, data: enriched })
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误'
    res.status(500).json({ success: false, error: `相似推荐失败: ${message}` })
  }
})

export default router
