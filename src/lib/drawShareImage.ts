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

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let current = ''
  for (const char of text) {
    const test = current + char
    if (ctx.measureText(test).width > maxWidth && current.length > 0) {
      lines.push(current)
      current = char
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines.length > 0 ? lines : ['']
}

export async function drawShareImage(monthLabel: string, albums: Album[]): Promise<string> {
  const W = 1080
  const PAD = 64
  const CARD_PAD = 40
  const COVER_SIZE = 110
  const ROW_GAP = 28
  const NAME_FONT = '700 34px "PingFang SC", "Microsoft YaHei", "SF Pro Display", "Helvetica Neue", sans-serif'
  const ARTIST_FONT = '400 24px "PingFang SC", "Microsoft YaHei", "SF Pro Display", "Helvetica Neue", sans-serif'
  const NAME_LINE_H = 42
  const ARTIST_H = 28

  // 预加载所有封面
  const coverImages = await Promise.all(
    albums.map(a => a.coverUrl ? loadImage(a.coverUrl) : Promise.resolve(null))
  )

  // 创建临时 canvas 用于测量文本
  const measureCanvas = document.createElement('canvas')
  const measureCtx = measureCanvas.getContext('2d')!

  // 布局参数
  const rankX = PAD + CARD_PAD + 29
  const coverX = rankX + 58
  const textX = coverX + COVER_SIZE + 32
  const starAreaW = 5 * 30 + 12 + 80
  const starX = W - PAD - CARD_PAD - starAreaW
  const textMaxW = starX - textX - 24

  // 计算每行高度
  interface RowInfo {
    nameLines: string[]
    rowH: number
    hasInterpretation: boolean
    interpH: number
  }
  const rowInfos: RowInfo[] = albums.map((album) => {
    measureCtx.font = NAME_FONT
    let nameLines = wrapText(measureCtx, album.albumName, textMaxW)
    if (nameLines.length > 2) {
      nameLines = nameLines.slice(0, 2)
      nameLines[1] = nameLines[1].slice(0, -1) + '…'
    }

    const textH = nameLines.length * NAME_LINE_H + (nameLines.length > 1 ? 4 : 0) + ARTIST_H + 8
    const rowH = Math.max(COVER_SIZE, textH) + ROW_GAP * 2

    const hasInterpretation = !!album.interpretation
    const interpH = hasInterpretation ? 24 + 20 + 8 + 24 * 1.55 * Math.min(4, album.interpretation.split('\n').length) + 28 : 0

    return { nameLines, rowH, hasInterpretation, interpH }
  })

  // 计算总高度
  let contentH = 0
  rowInfos.forEach((info, i) => {
    contentH += info.rowH + (i < albums.length - 1 ? 1 : 0) + info.interpH
  })

  const headerH = 60 + 48 + 14 + 88 + 14 + 60 + 10
  const footerH = 40 + 48 + 26 + 8 + 20 + 48
  const cardPad = CARD_PAD
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
  ctx.font = '600 30px "PingFang SC", "Microsoft YaHei", "SF Pro Display", "Helvetica Neue", sans-serif'
  ctx.fillText('我的月度专辑收听记录', PAD, 60 + 14)

  // 月份
  ctx.fillStyle = '#ffffff'
  ctx.font = '900 88px "PingFang SC", "Microsoft YaHei", "SF Pro Display", "Helvetica Neue", sans-serif'
  ctx.fillText(monthLabel, PAD, 60 + 48 + 14 + 88)

  // 数量
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.font = '900 60px "PingFang SC", "Microsoft YaHei", "SF Pro Display", "Helvetica Neue", sans-serif'
  const countStr = String(albums.length)
  const countW = ctx.measureText(countStr).width
  ctx.fillText(countStr, PAD, 60 + 48 + 14 + 88 + 14 + 60)
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.font = '500 30px "PingFang SC", "Microsoft YaHei", "SF Pro Display", "Helvetica Neue", sans-serif'
  ctx.fillText('张专辑', PAD + countW + 12, 60 + 48 + 14 + 88 + 14 + 60)

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
    const { nameLines, rowH, hasInterpretation, interpH } = rowInfos[i]
    const isTop3 = i < 3

    // 排名数字
    ctx.fillStyle = isTop3 ? '#FA233B' : '#c7c7cc'
    ctx.font = '800 38px "SF Pro Display", "Helvetica Neue", sans-serif'
    ctx.textAlign = 'center'
    const rankMidY = y + rowH / 2
    ctx.fillText(String(i + 1), rankX, rankMidY + 13)
    ctx.textAlign = 'left'

    // 封面 - 垂直居中
    const coverY = y + (rowH - COVER_SIZE) / 2
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
      ctx.font = '800 40px "SF Pro Display", "Helvetica Neue", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(album.albumName.charAt(0), coverX + COVER_SIZE / 2, coverY + COVER_SIZE / 2 + 14)
      ctx.textAlign = 'left'
    }

    // 文本区域垂直居中计算
    const textTotalH = nameLines.length * NAME_LINE_H + (nameLines.length > 1 ? 4 : 0) + ARTIST_H + 8
    const textStartY = y + (rowH - textTotalH) / 2

    // 专辑名（支持两行）
    ctx.fillStyle = '#1d1d1f'
    ctx.font = NAME_FONT
    ctx.fillText(nameLines[0], textX, textStartY + 34)
    if (nameLines.length > 1) {
      ctx.fillText(nameLines[1], textX, textStartY + 34 + NAME_LINE_H)
    }

    // 艺术家
    const artistY = textStartY + nameLines.length * NAME_LINE_H + (nameLines.length > 1 ? 4 : 0)
    ctx.fillStyle = '#8e8e93'
    ctx.font = ARTIST_FONT
    const artistText = album.artistName
    const artistMaxW = textMaxW
    let displayArtist = artistText
    if (ctx.measureText(artistText).width > artistMaxW) {
      let cut = artistText
      while (ctx.measureText(cut + '…').width > artistMaxW && cut.length > 0) {
        cut = cut.slice(0, -1)
      }
      displayArtist = cut + '…'
    }
    ctx.fillText(displayArtist, textX, artistY + ARTIST_H)

    // 评分星星 - 右对齐，垂直居中于文本区域
    if (album.averageScore > 0) {
      const starMidY = y + rowH / 2
      const starSize = 13
      const starGap = 30
      const rounded = Math.round(album.averageScore)
      for (let s = 0; s < 5; s++) {
        drawStar(ctx, starX + s * starGap, starMidY, starSize, s < rounded)
      }
      ctx.fillStyle = '#FA233B'
      ctx.font = '800 32px "SF Pro Display", "Helvetica Neue", sans-serif'
      ctx.fillText(album.averageScore.toFixed(1), starX + 5 * starGap + 12, starMidY + 10)
    }

    y += rowH

    // 感想
    if (hasInterpretation && album.interpretation) {
      const interpX = textX - 32
      const interpY = y
      const interpW = W - PAD - CARD_PAD - interpX
      const actualInterpH = 24 + 20 + 8 + 80 + 28

      ctx.fillStyle = '#fef2f2'
      ctx.beginPath()
      ctx.roundRect(interpX, interpY, interpW, actualInterpH, 14)
      ctx.fill()

      ctx.fillStyle = '#FA233B'
      ctx.font = '600 20px "PingFang SC", "Microsoft YaHei", "SF Pro Display", "Helvetica Neue", sans-serif'
      ctx.fillText('我的感想', interpX + 24, interpY + 24 + 20)

      ctx.fillStyle = '#3a3a3c'
      ctx.font = '400 24px "PingFang SC", "Microsoft YaHei", "SF Pro Display", "Helvetica Neue", sans-serif'
      const interpLines = album.interpretation.slice(0, 80)
      ctx.fillText(interpLines, interpX + 24, interpY + 24 + 20 + 8 + 24)

      y += actualInterpH + 12
    }

    // 分割线
    if (i < albums.length - 1) {
      ctx.fillStyle = '#f0f0f2'
      ctx.fillRect(textX - 32, y, W - PAD - CARD_PAD - textX + 32, 1)
      y += 1
    }
  })

  // 底部
  const footerY = H - 48 - 26 - 8 - 20 - 48
  ctx.fillStyle = '#c7c7cc'
  ctx.font = '600 26px "PingFang SC", "Microsoft YaHei", "SF Pro Display", "Helvetica Neue", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('由 Soundraft 记录', W / 2, footerY + 48)

  ctx.fillStyle = '#d1d1d6'
  ctx.font = '400 20px "PingFang SC", "Microsoft YaHei", "SF Pro Display", "Helvetica Neue", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('记录我这个月听过的声音', W / 2, footerY + 48 + 26 + 8)
  ctx.textAlign = 'left'

  return canvas.toDataURL('image/png', 1.0)
}
