import { Router, type Request as ExpressRequest, type Response as ExpressResponse } from 'express'

const router = Router()

class FetchError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'FetchError'
    this.status = status
  }
}

async function fetchWithRetry(url: string, opts: RequestInit = {}, retries = 3): Promise<globalThis.Response> {
  let lastErr: unknown
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 12000)
      const resp = await fetch(url, { ...opts, signal: controller.signal })
      clearTimeout(timeout)
      if (!resp.ok && i < retries - 1) {
        const status = resp.status
        const body = await resp.text().catch(() => '')
        lastErr = new FetchError(`HTTP ${status}: ${body.slice(0, 200)}`, status)
        await sleep((i + 1) * 1000)
        continue
      }
      if (!resp.ok) {
        const body = await resp.text().catch(() => '')
        throw new FetchError(`HTTP ${resp.status}: ${body.slice(0, 200)}`, resp.status)
      }
      return resp
    } catch (e) {
      lastErr = e
      if (e instanceof FetchError && e.status && e.status < 500) throw e
      if (i < retries - 1) await sleep((i + 1) * 1000)
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr))
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

function extractNeteaseAlbumId(rawUrl: string): string | null {
  const cleanUrl = rawUrl.replace(/#\//, '/')
  const patterns = [/\/album\/\d+/]
  for (const p of patterns) {
    const m = cleanUrl.match(p)
    if (m) return m[0].split('/').pop() || null
  }
  const idMatch = cleanUrl.match(/[&?]id=(\d+)/)
  if (idMatch) return idMatch[1]
  return null
}

async function resolveShortUrl(shortUrl: string): Promise<string | null> {
  try {
    const resp = await fetchWithRetry(shortUrl, {
      redirect: 'follow',
      headers: { 'User-Agent': UA },
    })
    const finalUrl = resp.url
    if (finalUrl && finalUrl !== shortUrl) return finalUrl
  } catch {}

  try {
    const resp = await fetchWithRetry(shortUrl, {
      redirect: 'manual',
      headers: { 'User-Agent': UA },
    })
    if (resp.status >= 300 && resp.status < 400) {
      const location = resp.headers.get('location')
      if (location) return location.startsWith('http') ? location : `https://music.163.com${location}`
    }
    const text = await resp.text()
    const urlMatch = text.match(/https?:\/\/[\w.-]+\/[^\s"'<]+/)
    if (urlMatch) return urlMatch[0]
  } catch {}

  return null
}

function isQQUrl(url: string): boolean {
  return url.includes('y.qq.com') || url.includes('qq.com')
}

function extractQQNumericId(url: string, type: 'album' | 'song'): string | null {
  if (type === 'album') {
    const m = url.match(/albumDetail\/(\d+)/)
    if (m) return m[1]
  }
  if (type === 'song') {
    const m = url.match(/songDetail\/(\d+)/)
    if (m) return m[1]
    const m2 = url.match(/playsong(?:\.\w+)?\?.*songid=(\d+)/)
    if (m2) return m2[1]
  }
  return null
}

async function resolveQQAlbum(albumId: string) {
  const resp = await fetchWithRetry(
    `https://c.y.qq.com/v8/fcg-bin/fcg_v8_album_detail_cp.fcg?albumid=${albumId}&format=json`,
    { headers: { 'User-Agent': UA, 'Referer': 'https://y.qq.com/' } }
  )
  const json = await resp.json()
  if (json.code !== 0) throw new Error(`QQ API error: ${json.code}`)
  const data = json.data || {}
  const gi = data.getAlbumInfo || {}
  const si = data.getSingerInfo || {}
  const songs = (Array.isArray(data.getSongInfo) ? data.getSongInfo : []).map(
    (s: { songname?: string; songmid?: string }) => ({ name: s.songname || '', id: s.songmid || '' })
  )
  const mid = gi.Falbum_mid || ''
  return {
    albumName: gi.Falbum_name || '未知专辑',
    artistName: si.Fsinger_name || '未知艺术家',
    coverUrl: mid ? `https://y.qq.com/music/photo_new/T002R300x300M000${mid}.jpg` : '',
    tracks: songs,
    genres: [],
  }
}

async function resolveQQTrack(songId: string) {
  const resp = await fetchWithRetry(
    `https://c.y.qq.com/v8/fcg-bin/fcg_v8_song_detail_cp.fcg?songid=${songId}&format=json`,
    { headers: { 'User-Agent': UA, 'Referer': 'https://y.qq.com/' } }
  )
  const json = await resp.json()
  if (json.code !== 0) throw new Error(`QQ API error: ${json.code}`)
  const info = json.data?.track_info || {}
  const album = info.album || {}
  const singers = (info.singer || []).map((s: { name: string }) => s.name)
  const mid = album.mid || info.album_mid || ''
  return {
    songName: info.name || '未知歌曲',
    artistName: singers.join('/') || '未知艺人',
    albumName: album.name || '',
    coverUrl: mid ? `https://y.qq.com/music/photo_new/T002R300x300M000${mid}.jpg` : (album.pmid ? `https://y.qq.com/music/photo_new/T002R300x300M000${album.pmid}.jpg` : ''),
  }
}

async function resolveUrl(rawUrl: string): Promise<string> {
  if (rawUrl.includes('163cn.tv') || /c\d+\.y\.qq\.com/.test(rawUrl)) {
    const redirected = await resolveShortUrl(rawUrl)
    if (redirected) return redirected
  }
  return rawUrl
}

router.post('/parse', async (req: ExpressRequest, res: ExpressResponse) => {
  try {
    const { url } = req.body
    if (!url) {
      res.status(400).json({ success: false, error: '请提供专辑链接' })
      return
    }

    const resolvedUrl = await resolveUrl(url)

    if (isQQUrl(resolvedUrl)) {
      const albumId = extractQQNumericId(resolvedUrl, 'album')
      if (!albumId) {
        res.status(400).json({ success: false, error: '无法解析 QQ 音乐专辑链接' })
        return
      }
      const data = await resolveQQAlbum(albumId)
      res.json({ success: true, data })
      return
    }

    const albumId = extractNeteaseAlbumId(resolvedUrl)
    if (!albumId) {
      res.status(400).json({ success: false, error: '无法解析专辑链接，请确认是有效的网易云/QQ音乐专辑链接' })
      return
    }

    const resp = await fetchWithRetry(
      `https://music.163.com/api/album/${albumId}`,
      { headers: { 'User-Agent': UA, 'Referer': 'https://music.163.com/' } }
    )
    const json = await resp.json()
    const album = json.album || {}
    const data = {
      albumName: album.name || '未知专辑',
      coverUrl: (album.picUrl || album.blurPicUrl || '').replace(/^http:/, 'https:'),
      artistName: album.artist?.name || '未知艺术家',
      tracks: (album.songs || []).map((s: { name: string; id: number }) => ({ name: s.name, id: s.id })),
      genres: album.subType ? [album.subType] : [],
    }
    res.json({ success: true, data })
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误'
    res.status(500).json({ success: false, error: `解析失败: ${message}` })
  }
})

router.post('/parse-track', async (req: ExpressRequest, res: ExpressResponse) => {
  try {
    const { url } = req.body
    if (!url) {
      res.status(400).json({ success: false, error: '请提供歌曲链接' })
      return
    }

    const resolvedUrl = await resolveUrl(url)

    if (isQQUrl(resolvedUrl)) {
      const songId = extractQQNumericId(resolvedUrl, 'song')
      if (!songId) {
        res.status(400).json({ success: false, error: '无法解析 QQ 音乐歌曲链接' })
        return
      }
      const data = await resolveQQTrack(songId)
      res.json({ success: true, data })
      return
    }

    const idMatch = resolvedUrl.match(/[&?]id=(\d+)/)
    if (!idMatch) {
      res.status(400).json({ success: false, error: '无法解析歌曲链接' })
      return
    }
    const songId = idMatch[1]
    const resp = await fetchWithRetry(
      `https://music.163.com/api/song/detail?ids=[${songId}]`,
      { headers: { 'User-Agent': UA, 'Referer': 'https://music.163.com/' } }
    )
    const json = await resp.json()
    const song = json?.songs?.[0]
    if (!song) {
      res.status(404).json({ success: false, error: '未找到该歌曲' })
      return
    }
    const data = {
      songName: song.name || '未知歌曲',
      artistName: (song.artists || song.ar)?.map((a: { name: string }) => a.name).join('/') || '未知艺人',
      albumName: (song.album || song.al)?.name || '',
      coverUrl: ((song.album || song.al)?.picUrl || '').replace(/^http:/, 'https:'),
    }
    res.json({ success: true, data })
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误'
    res.status(500).json({ success: false, error: `解析失败: ${message}` })
  }
})

export default router
