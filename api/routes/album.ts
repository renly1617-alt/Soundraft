import { Router, type Request, type Response } from 'express'

const router = Router()

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
  try {
    const resp = await fetch(shortUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })
    return resp.url || null
  } catch {
    return null
  }
}

router.post('/parse', async (req: Request, res: Response) => {
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

    const resp = await fetch(
      `https://music.163.com/api/album/${albumId}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://music.163.com/',
        },
      }
    )

    if (!resp.ok) {
      res.status(502).json({ success: false, error: '获取专辑信息失败' })
      return
    }

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

router.post('/parse-track', async (req: Request, res: Response) => {
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
    const resp = await fetch(
      `https://music.163.com/api/song/detail?ids=[${songId}]`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://music.163.com/',
        },
      }
    )

    if (!resp.ok) {
      res.status(502).json({ success: false, error: '获取歌曲信息失败' })
      return
    }

    const json = await resp.json()
    const song = json?.songs?.[0]
    if (!song) {
      res.status(404).json({ success: false, error: '未找到该歌曲' })
      return
    }

    const data = {
      songName: song.name || '未知歌曲',
      artistName: song.ar?.map((a: { name: string }) => a.name).join('/') || '未知艺人',
      albumName: song.al?.name || '',
      coverUrl: (song.al?.picUrl || '').replace(/^http:/, 'https:'),
    }

    res.json({ success: true, data })
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误'
    res.status(500).json({ success: false, error: `解析失败: ${message}` })
  }
})

export default router
