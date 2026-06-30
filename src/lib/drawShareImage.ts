import type { Album } from '@/types'

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, filled: boolean) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
    const x = Math.cos(angle) * r
    const y = Math.sin(angle) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  if (filled) {
    ctx.fillStyle = '#FA233B'
    ctx.fill()
  } else {
    ctx.strokeStyle = '#d1d1d6'
    ctx.lineWidth = 2
    ctx.stroke()
  }
  ctx.restore()
}

export async function drawShareImage(monthLabel: string, albums: Album[]): Promise<string> {
  const W = 1080
  const PAD = 64
  const COVER_SIZE = 110
  const ROW_GAP = 28
  const LINE_H = 1

  // 预加载所有封面
  const coverImages = await Promise.all(
    albums.map(a => a.coverUrl ? loadImage(a.coverUrl) : Promise.resolve(null))
  )

  // 计算高度
  let contentH = 0
  albums.forEach((a, i) => {
    const hasInterpretation = !!a.interpretation
    const rowH = COVER_SIZE + ROW_GAP * 2
    const interpH = hasInterpretation ? 24 + 20 + 8 + 24 * 1.55 * Math.min(4, a.interpretation.split('\n').length) + 28 : 0
    contentH += rowH + interpH + (i < albums.length - 1 ? LINE_H : 0)
  })

  const headerH = 60 + 48 + 14 + 88 + 14 + 60 + 10 // 约 294
  const footerH = 40 + 48 + 26 + 8 + 20 + 48 // 约 190
  const cardPad = 12 + 28 // 40
  const H = headerH + cardPad + contentH + cardPad + footerH

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // 背景
  ctx.fillStyle = '#f2f2f6'
  ctx.fillRect(0, 0, W, H)

  // 顶部红色渐变
  const grad = ctx.createLinearGradient(0, 0, W, headerH)
  grad.addColorStop(0, '#FA233B')
  grad.addColorStop(1, '#C9182B')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, headerH)

  // 标题
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.font = '600 30px -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", sans-serif'
  ctx.letterSpacing = '5px'
  ctx.fillText('我的月度专辑收听记录', PAD, 60 + 14)

  // 月份
  ctx.fillStyle = '#ffffff'
  ctx.font = '900 88px -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", sans-serif'
  ctx.letterSpacing = '-2px'
  ctx.fillText(monthLabel, PAD, 60 + 48 + 14 + 88)

  // 数量
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.font = '900 60px -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", sans-serif'
  ctx.fillText(String(albums.length), PAD, 60 + 48 + 14 + 88 + 14 + 60)
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.font = '500 30px -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", sans-serif'
  ctx.fillText('张专辑', PAD + String(albums.length).length * 36, 60 + 48 + 14 + 88 + 14 + 60)

  // 白色卡片
  const cardY = headerH - 20
  const cardH = H - headerH + 20 - footerH + 48
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.roundRect(40, cardY, W - 80, cardH, 32)
  ctx.fill()
  ctx.shadowColor = 'rgba(0,0,0,0.06)'
  ctx.shadowBlur = 40
  ctx.shadowOffsetY = 4
  ctx.fill()
  ctx.shadowColor = 'transparent'

  // 专辑列表
  let y = cardY + 12
  albums.forEach((album, i) => {
    const coverImg = coverImages[i]
    const isTop3 = i < 3

    // 排名数字
    ctx.fillStyle = isTop3 ? '#FA233B' : '#c7c7cc'
    ctx.font = '800 38px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(String(i + 1), PAD + 29, y + ROW_GAP + 55)
    ctx.textAlign = 'left'

    // 封面
    const coverX = PAD + 58 + 32
    const coverY = y + ROW_GAP
    if (coverImg) {
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(coverX, coverY, COVER_SIZE, COVER_SIZE, 14)
      ctx.clip()
      ctx.drawImage(coverImg, coverX, coverY, COVER_SIZE, COVER_SIZE)
      ctx.restore()
    } else {
      ctx.fillStyle = '#e5e5ea'
      ctx.beginPath()
      ctx.roundRect(coverX, coverY, COVER_SIZE, COVER_SIZE, 14)
      ctx.fill()
      ctx.fillStyle = '#c7c7cc'
      ctx.font = '800 40px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(album.albumName.charAt(0), coverX + COVER_SIZE / 2, coverY + COVER_SIZE / 2 + 14)
      ctx.textAlign = 'left'
    }

    // 专辑名
    const textX = coverX + COVER_SIZE + 32
    ctx.fillStyle = '#1d1d1f'
    ctx.font = '700 34px -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", sans-serif'
    const maxTextW = W - PAD - 60 - textX - 200
    const albumName = album.albumName
    let line1 = albumName
    let line2 = ''
    if (ctx.measureText(albumName).width > maxTextW) {
      // 简单截断到2行
      let cut = albumName
      while (ctx.measureText(cut + '…').width > maxTextW && cut.length > 0) {
        cut = cut.slice(0, -1)
      }
      line1 = cut + '…'
    }
    ctx.fillText(line1, textX, coverY + 38)
    if (line2) ctx.fillText(line2, textX, coverY + 38 + 34 * 1.25)

    // 艺术家
    ctx.fillStyle = '#8e8e93'
    ctx.font = '400 24px -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", sans-serif'
    ctx.fillText(album.artistName, textX, coverY + 38 + 34 + 10)

    // 评分星星
    if (album.averageScore > 0) {
      const starX = W - PAD - 60 - 200
      const starY = coverY + 20
      const rounded = Math.round(album.averageScore)
      for (let s = 0; s < 5; s++) {
        drawStar(ctx, starX + s * 28, starY, 12, s < rounded)
      }
      ctx.fillStyle = '#FA233B'
      ctx.font = '800 32px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
      ctx.fillText(album.averageScore.toFixed(1), starX + 5 * 28 + 12, starY + 10)
    }

    y += COVER_SIZE + ROW_GAP * 2

    // 感想
    if (album.interpretation) {
      const interpX = textX - 32
      const interpY = y
      const interpW = W - PAD - 60 - interpX
      const interpH = 24 + 20 + 8 + 80 + 28

      ctx.fillStyle = '#fef2f2'
      ctx.beginPath()
      ctx.roundRect(interpX, interpY, interpW, interpH, 14)
      ctx.fill()

      ctx.fillStyle = '#FA233B'
      ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
      ctx.fillText('我的感想', interpX + 24, interpY + 24 + 20)

      ctx.fillStyle = '#3a3a3c'
      ctx.font = '400 24px -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", sans-serif'
      const lines = album.interpretation.slice(0, 80)
      ctx.fillText(lines, interpX + 24, interpY + 24 + 20 + 8 + 24)

      y += interpH + 12
    }

    // 分割线
    if (i < albums.length - 1) {
      ctx.fillStyle = '#f0f0f2'
      ctx.fillRect(textX - 32, y, W - PAD - 60 - textX + 32, 1)
      y += 1
    }
  })

  // 底部
  const footerY = H - 48 - 26 - 8 - 20 - 48
  ctx.fillStyle = '#c7c7cc'
  ctx.font = '600 26px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
  ctx.textAlign = 'center'
  ctx.letterSpacing = '4px'
  ctx.fillText('由 Soundraft 记录', W / 2, footerY + 48)

  ctx.fillStyle = '#d1d1d6'
  ctx.font = '400 20px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
  ctx.fillText('记录我这个月听过的声音', W / 2, footerY + 48 + 26 + 8)

  return canvas.toDataURL('image/png', 1.0)
}
