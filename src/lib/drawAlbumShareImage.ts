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

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const tokens: string[] = []
  let i = 0
  while (i < text.length) {
    const char = text[i]
    if (/[a-zA-Z0-9]/.test(char)) {
      let word = ''
      while (i < text.length && /[a-zA-Z0-9]/.test(text[i])) {
        word += text[i]
        i++
      }
      tokens.push(word)
    } else if (char === ' ') {
      tokens.push(' ')
      i++
    } else {
      tokens.push(char)
      i++
    }
  }

  const lines: string[] = []
  let currentLine = ''
  for (const token of tokens) {
    const testLine = currentLine + token
    if (ctx.measureText(testLine).width > maxWidth && currentLine.length > 0) {
      const trimmed = currentLine.trimEnd()
      if (trimmed) lines.push(trimmed)
      currentLine = token.startsWith(' ') ? token.trimStart() : token
    } else {
      currentLine = testLine
    }
  }
  const trimmed = currentLine.trimEnd()
  if (trimmed) lines.push(trimmed)
  return lines.length > 0 ? lines : ['']
}

export async function drawAlbumShareImage(album: Album): Promise<string> {
  const W = 1080
  const PAD = 64
  const COVER_SIZE = 280
  const CARD_RADIUS = 32
  const GAP = 28

  const NAME_FONT = '900 52px "PingFang SC", "Microsoft YaHei", "SF Pro Display", "Helvetica Neue", sans-serif'
  const ARTIST_FONT = '500 30px "PingFang SC", "Microsoft YaHei", "SF Pro Display", "Helvetica Neue", sans-serif'
  const SECTION_TITLE_FONT = '700 32px "PingFang SC", "Microsoft YaHei", "SF Pro Display", "Helvetica Neue", sans-serif'
  const TRACK_FONT = '400 28px "PingFang SC", "Microsoft YaHei", "SF Pro Display", "Helvetica Neue", sans-serif'
  const BODY_FONT = '400 24px "PingFang SC", "Microsoft YaHei", "SF Pro Display", "Helvetica Neue", sans-serif'

  const coverImg = album.coverUrl ? await loadImage(album.coverUrl) : null

  const hasInterpretation = !!album.interpretation

  // 预计算布局
  const measureCanvas = document.createElement('canvas')
  const measureCtx = measureCanvas.getContext('2d')!

  // 专辑名换行
  const nameMaxW = W - PAD * 2 - COVER_SIZE - 40
  measureCtx.font = NAME_FONT
  let nameLines = album.albumName.length > 0 ? wrapText(measureCtx, album.albumName, nameMaxW) : ['']
  if (nameLines.length > 3) nameLines = nameLines.slice(0, 3)

  // 头部区域高度
  const nameLineH = 62
  const headerInfoH = nameLines.length * nameLineH + 36 + 48 + 20

  // 头部：封面与信息并排
  const headerH = Math.max(COVER_SIZE, headerInfoH) + PAD

  // 标签区域
  let genresH = 0
  if (album.genres.length > 0) {
    genresH = 24 + 16 + 36
  }

  // 元信息行
  const metaH = 24 + 16 + 24

  // 星级
  const starH = album.averageScore > 0 ? 20 + 30 + 20 : 0

  // 曲目列表
  let tracksH = 0
  if (album.tracks.length > 0) {
    const trackRowH = 36 + 16
    tracksH = 28 + 32 + 20 + album.tracks.length * trackRowH + 20
  }

  // 感想
  let interpretationH = 0
  if (hasInterpretation && album.interpretation) {
    const interpMaxW = W - PAD * 2 - 48
    measureCtx.font = BODY_FONT
    const interpLines = wrapText(measureCtx, album.interpretation, interpMaxW)
    const interpLineH = 34
    const maxInterpLines = Math.min(interpLines.length, 8)
    interpretationH = 28 + 32 + 20 + maxInterpLines * interpLineH + 24
  }

  const cardTopPad = 32
  const cardBottomPad = 32
  const contentH = headerH + genresH + metaH + starH + tracksH + interpretationH
  const cardH = contentH + cardTopPad + cardBottomPad

  const footerH = 60 + 26 + 8 + 20 + 48

  const H = PAD + cardH + PAD + footerH

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // 背景
  ctx.fillStyle = '#f2f2f6'
  ctx.fillRect(0, 0, W, H)

  // 白色卡片
  const cardX = 40
  const cardY = PAD
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.roundRect(cardX, cardY, W - 80, cardH, CARD_RADIUS)
  ctx.fill()
  ctx.shadowColor = 'rgba(0,0,0,0.06)'
  ctx.shadowBlur = 40
  ctx.shadowOffsetY = 4
  ctx.fill()
  ctx.shadowColor = 'transparent'

  let y = cardY + cardTopPad

  // ---- 头部：封面 + 信息 ----
  const coverX = PAD

  // 封面
  if (coverImg) {
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(coverX, y, COVER_SIZE, COVER_SIZE, 20)
    ctx.clip()
    ctx.drawImage(coverImg, coverX, y, COVER_SIZE, COVER_SIZE)
    ctx.restore()
  } else {
    ctx.fillStyle = '#e5e5ea'
    ctx.beginPath()
    ctx.roundRect(coverX, y, COVER_SIZE, COVER_SIZE, 20)
    ctx.fill()
    ctx.fillStyle = '#c7c7cc'
    ctx.font = '800 80px "SF Pro Display", "Helvetica Neue", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(album.albumName.charAt(0), coverX + COVER_SIZE / 2, y + COVER_SIZE / 2 + 28)
    ctx.textAlign = 'left'
  }

  // 右侧信息
  const infoX = coverX + COVER_SIZE + 40

  // 专辑名
  ctx.fillStyle = '#1d1d1f'
  ctx.font = NAME_FONT
  let nameY = y + 52
  for (const line of nameLines) {
    ctx.fillText(line, infoX, nameY)
    nameY += nameLineH
  }

  // 艺术家
  nameY += 8
  ctx.fillStyle = '#8e8e93'
  ctx.font = ARTIST_FONT
  ctx.fillText(album.artistName, infoX, nameY)

  y += headerH

  // ---- 标签 ----
  if (album.genres.length > 0) {
    ctx.fillStyle = '#fce4e8'
    const tagFont = '500 22px "PingFang SC", "Microsoft YaHei", "SF Pro Display", "Helvetica Neue", sans-serif'
    ctx.font = tagFont
    let tagX = PAD
    for (const genre of album.genres) {
      const tagW = ctx.measureText(genre).width + 32
      const tagH = 36
      ctx.beginPath()
      ctx.roundRect(tagX, y, tagW, tagH, 18)
      ctx.fill()
      ctx.fillStyle = '#fa2d48'
      ctx.fillText(genre, tagX + 16, y + 25)
      ctx.fillStyle = '#fce4e8'
      tagX += tagW + 12
    }
    y += genresH
  }

  // ---- 元信息 ----
  ctx.fillStyle = '#8e8e93'
  ctx.font = BODY_FONT
  const metaY = y + 4
  const metaText = `收听于 ${album.listenDate}  |  ${album.tracks.length} 首歌曲`
  ctx.fillText(metaText, PAD, metaY + 24)
  y += metaH

  // ---- 星级 ----
  if (album.averageScore > 0) {
    const starSize = 20
    const starGap = 34
    const rounded = Math.round(album.averageScore)
    for (let s = 0; s < 5; s++) {
      drawStar(ctx, PAD + s * starGap, y + 18, starSize, s < rounded)
    }
    ctx.fillStyle = '#1d1d1f'
    ctx.font = '800 36px "SF Pro Display", "Helvetica Neue", sans-serif'
    ctx.fillText(album.averageScore.toFixed(1), PAD + 5 * starGap + 16, y + 28)
    y += starH
  }

  // ---- 歌曲列表 ----
  if (album.tracks.length > 0) {
    // 分割线
    y += 8
    ctx.fillStyle = '#f0f0f2'
    ctx.fillRect(PAD, y, W - PAD * 2, 1)
    y += 20

    ctx.fillStyle = '#1d1d1f'
    ctx.font = SECTION_TITLE_FONT
    ctx.fillText('歌曲列表', PAD, y + 32)
    y += 44

    const trackRowH = 36 + 16
    for (let i = 0; i < album.tracks.length; i++) {
      const track = album.tracks[i]

      ctx.fillStyle = '#c7c7cc'
      ctx.font = TRACK_FONT
      ctx.textAlign = 'center'
      ctx.fillText(String(i + 1), PAD + 20, y + 30)
      ctx.textAlign = 'left'

      ctx.fillStyle = '#1d1d1f'
      ctx.font = TRACK_FONT
      const trackNameMaxW = W - PAD * 2 - 80 - 220
      let displayName = track.name
      if (ctx.measureText(track.name).width > trackNameMaxW) {
        let cut = track.name
        while (ctx.measureText(cut + '…').width > trackNameMaxW && cut.length > 0) {
          cut = cut.slice(0, -1)
        }
        displayName = cut + '…'
      }
      ctx.fillText(displayName, PAD + 60, y + 30)

      // 曲目星级
      if (track.score > 0) {
        const trackStarX = W - PAD - 220
        const trackStarSize = 11
        const trackStarGap = 22
        for (let s = 0; s < 5; s++) {
          drawStar(ctx, trackStarX + s * trackStarGap, y + 14, trackStarSize, s < track.score)
        }
      }

      y += trackRowH
    }
    y += 20
  }

  // ---- 感想（可选） ----
  if (hasInterpretation && album.interpretation) {
    // 分割线
    ctx.fillStyle = '#f0f0f2'
    ctx.fillRect(PAD, y, W - PAD * 2, 1)
    y += 28

    ctx.fillStyle = '#1d1d1f'
    ctx.font = SECTION_TITLE_FONT
    ctx.fillText('收听感想', PAD, y + 32)
    y += 52

    const interpMaxW = W - PAD * 2 - 48
    ctx.font = BODY_FONT
    const interpLines = wrapText(ctx, album.interpretation, interpMaxW)
    const interpLineH = 34
    const maxInterpLines = Math.min(interpLines.length, 8)
    const interpBgH = 24 + maxInterpLines * interpLineH + 24

    ctx.fillStyle = '#f9f9fb'
    ctx.beginPath()
    ctx.roundRect(PAD + 12, y, W - PAD * 2 - 24, interpBgH, 16)
    ctx.fill()

    ctx.fillStyle = '#1d1d1f'
    let interpY = y + 24 + 24
    for (let i = 0; i < maxInterpLines; i++) {
      ctx.fillText(interpLines[i], PAD + 12 + 24, interpY)
      interpY += interpLineH
    }
  }

  // ---- 底部 ----
  const footerBaseY = H - footerH
  ctx.fillStyle = '#c7c7cc'
  ctx.font = '600 26px "PingFang SC", "Microsoft YaHei", "SF Pro Display", "Helvetica Neue", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('由 Soundraft 记录', W / 2, footerBaseY + 48)

  ctx.fillStyle = '#d1d1d6'
  ctx.font = '400 20px "PingFang SC", "Microsoft YaHei", "SF Pro Display", "Helvetica Neue", sans-serif'
  ctx.fillText('记录我听过的声音', W / 2, footerBaseY + 48 + 26 + 8)
  ctx.textAlign = 'left'

  return canvas.toDataURL('image/png', 1.0)
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
