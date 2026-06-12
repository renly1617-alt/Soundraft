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

router.post('/interpret', async (req: Request, res: Response) => {
  try {
    const { albumName, artistName, tracks, genres } = req.body

    if (!albumName || !artistName) {
      res.status(400).json({ success: false, error: '缺少专辑信息' })
      return
    }

    const trackList = (tracks || []).slice(0, 20).join('、')
    const genreStr = (genres || []).join('、') || '未知'

    const prompt = `你是一位资深音乐评论人，请为以下专辑撰写一段约300字的深度专辑解读。解读需包含：专辑的整体风格与主题、音乐表现手法的特点、情感的传递与表达。请用流畅优美的中文散文风格书写，避免分点罗列。

专辑名：${albumName}
艺术家：${artistName}
风格分类：${genreStr}
曲目列表：${trackList}`

    const aiResp = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY || ''}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.8,
      }),
    })

    if (!aiResp.ok) {
      const errData = await aiResp.json().catch(() => ({}))
      const errMsg = (errData as { error?: { message?: string } })?.error?.message || 'AI 服务暂不可用'
      res.status(502).json({ success: false, error: errMsg })
      return
    }

    const aiJson = await aiResp.json() as { choices?: { message?: { content?: string } }[] }
    const content = aiJson.choices?.[0]?.message?.content || '未能生成解读'

    res.json({ success: true, data: { content } })
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误'
    res.status(500).json({ success: false, error: `生成失败: ${message}` })
  }
})

export default router
