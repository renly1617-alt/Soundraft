import { Router } from 'express'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const url = req.query.url as string
    if (!url) {
      res.status(400).json({ error: 'Missing url parameter' })
      return
    }

    const parsed = new URL(url)
    const allowedPatterns = [
      /^(p[1-4]\.)?music\.126\.net$/i,
      /^.*\.qq\.com$/i,
      /^.*\.qpic\.cn$/i,
    ]

    const isAllowed = allowedPatterns.some(p => p.test(parsed.hostname))
    if (!isAllowed) {
      res.status(403).json({ error: 'Host not allowed' })
      return
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://music.163.com/',
      },
    })

    clearTimeout(timeout)

    if (!resp.ok) {
      res.status(502).json({ error: `Upstream error: ${resp.status}` })
      return
    }

    const contentType = resp.headers.get('content-type') || 'image/jpeg'
    const buffer = await resp.arrayBuffer()

    res.set({
      'Content-Type': contentType,
      'Content-Length': buffer.byteLength.toString(),
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    })

    res.send(Buffer.from(buffer))
  } catch (err) {
    console.error('[ImageProxy] error:', err)
    res.status(500).json({ error: 'Proxy error' })
  }
})

export default router
