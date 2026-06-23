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
      const resp = await fetch(url, {
        ...opts,
        signal: controller.signal,
      })
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

function extractAlbumId(rawUrl: string): string | null {
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
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

  try {
    const resp = await fetchWithRetry(shortUrl, {
      redirect: 'follow',
      headers: { 'User-Agent': ua },
    })
    const finalUrl = resp.url
    if (finalUrl && finalUrl !== shortUrl && finalUrl.includes('music.163.com')) {
      return finalUrl
    }
  } catch {}

  try {
    const resp = await fetchWithRetry(shortUrl, {
      redirect: 'manual',
      headers: { 'User-Agent': ua },
    })

    if (resp.status >= 300 && resp.status < 400) {
      const location = resp.headers.get('location')
      if (location) return location.startsWith('http') ? location : `https://music.163.com${location}`
    }

    const text = await resp.text()
    const urlMatch = text.match(/https?:\/\/music\.163\.com\/[^\s"'<]+/)
    if (urlMatch) return urlMatch[0]
  } catch {}

  return null
}

router.post('/parse', async (req: ExpressRequest, res: ExpressResponse) => {
  try {
    const { url } = req.body
    if (!url) {
      res.status(400).json({ success: false, error: '请提供专辑链接' })
      return
    }

    let resolvedUrl = url
    if (url.includes('163cn.tv')) {
      const redirected = await resolveShortUrl(url)
      if (!redirected) {
        res.status(400).json({ success: false, error: '无法解析短链接，请确认链接是否有效' })
        return
      }
      resolvedUrl = redirected
    }

    const albumId = extractAlbumId(resolvedUrl)
    if (!albumId) {
      res.status(400).json({ success: false, error: '无法解析专辑链接，请确认是有效的网易云专辑链接' })
      return
    }

    const resp = await fetchWithRetry(
      `https://music.163.com/api/album/${albumId}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://music.163.com/',
        },
      }
    )

    const json = await resp.json()
    const album = json.album || {}

    const data = {
      albumName: album.name || '未知专辑',
      coverUrl: (album.picUrl || album.blurPicUrl || '').replace(/^http:/, 'https:'),
      artistName: album.artist?.name || '未知艺术家',
      tracks: (album.songs || []).map((s: { name: string; id: number }) => ({
        name: s.name,
        id: s.id,
      })),
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

    let resolvedUrl = url
    if (url.includes('163cn.tv')) {
      const redirected = await resolveShortUrl(url)
      if (!redirected) {
        res.status(400).json({ success: false, error: '无法解析短链接' })
        return
      }
      resolvedUrl = redirected
    }

    const idMatch = resolvedUrl.match(/[&?]id=(\d+)/)
    if (!idMatch) {
      res.status(400).json({ success: false, error: '无法解析歌曲链接' })
      return
    }

    const songId = idMatch[1]
    const resp = await fetchWithRetry(
      `https://music.163.com/api/song/detail?ids=[${songId}]`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://music.163.com/',
        },
      }
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
