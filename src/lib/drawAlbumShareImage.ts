import type { Album } from '@/types'

const FONT_STACK = '"PingFang SC", "SF Pro Display", "Hiragino Sans", "Noto Sans JP", "Helvetica Neue", sans-serif'
const FONT_STACK_NUM = '"SF Pro Display", "Helvetica Neue", sans-serif'

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

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text
  let cut = text
  while (ctx.measureText(cut + '…').width > maxWidth && cut.length > 0) {
    cut = cut.slice(0, -1)
  }
  return cut + '…'
}

function drawFilledStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
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
  ctx.fillStyle = '#FA233B'
  ctx.fill()
  ctx.restore()
}

export async function drawAlbumShareImage(album: Album): Promise<string> {
  const W = 750
  const CARD_MARGIN = 28
  const CARD_W = W - CARD_MARGIN * 2
  const CARD_PAD = 36

  const COVER_SIZE = 164
  const COVER_RADIUS = 16

  const FONT_NAME_BOLD = `800 48px ${FONT_STACK}`
  const FONT_ARTIST = `500 28px ${FONT_STACK}`
  const FONT_META = `400 24px ${FONT_STACK}`
  const FONT_SECTION = `700 30px ${FONT_STACK}`
  const FONT_TRACK = `400 26px ${FONT_STACK}`
  const FONT_TRACK_NUM = `500 22px ${FONT_STACK}`
  const FONT_BODY = `400 24px ${FONT_STACK}`
  const FONT_SCORE = `800 32px ${FONT_STACK_NUM}`
  const FONT_TAG = `500 20px ${FONT_STACK}`

  const coverImg = album.coverUrl ? await loadImage(album.coverUrl) : null
  const hasInterpretation = !!(album.interpretation && album.interpretation.trim())

  const measureCanvas = document.createElement('canvas')
  const measureCtx = measureCanvas.getContext('2d')!

  const contentW = CARD_W - CARD_PAD * 2
  const infoX = CARD_PAD + COVER_SIZE + 24
  const infoW = contentW - COVER_SIZE - 24

  measureCtx.font = FONT_NAME_BOLD
  let nameLines = wrapText(measureCtx, album.albumName || '', infoW)
  if (nameLines.length > 3) nameLines = nameLines.slice(0, 3)
  const NAME_LINE_H = 56

  const headerH = Math.max(COVER_SIZE, nameLines.length * NAME_LINE_H + 40 + 20) + 24

  let genresH = 0
  const tagLineW = contentW
  if (album.genres.length > 0) {
    measureCtx.font = FONT_TAG
    let tagRowW = 0
    let tagRows = 1
    for (const genre of album.genres) {
      const tagW = measureCtx.measureText(genre).width + 28
      if (tagRowW + tagW + 8 > tagLineW && tagRowW > 0) {
        tagRows++
        tagRowW = tagW + 8
      } else {
        tagRowW += tagW + 8
      }
    }
    genresH = 16 + tagRows * 34 + 16
  }

  const metaH = 16 + 30 + 12
  const starH = album.averageScore > 0 ? 12 + 32 + 16 : 0

  let tracksH = 0
  if (album.tracks.length > 0) {
    tracksH = 12 + 1 + 20 + 30 + 18 + album.tracks.length * 42 + 12
  }

  let interpretationH = 0
  if (hasInterpretation) {
    const interpMaxW = contentW - 24
    measureCtx.font = FONT_BODY
    const interpLines = wrapText(measureCtx, album.interpretation!, interpMaxW)
    const maxLines = Math.min(interpLines.length, 10)
    interpretationH = 12 + 1 + 20 + 30 + 18 + maxLines * 36 + 20
  }

  const cardContentH = headerH + genresH + metaH + starH + tracksH + interpretationH
  const cardH = cardContentH + CARD_PAD * 2

  const FOOTER_H = 80
  const H = 40 + cardH + 24 + FOOTER_H + 24

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#f2f2f6'
  ctx.fillRect(0, 0, W, H)

  const cardX = CARD_MARGIN
  const cardY = 40

  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.roundRect(cardX, cardY, CARD_W, cardH, 24)
  ctx.fill()
  ctx.shadowColor = 'rgba(0,0,0,0.04)'
  ctx.shadowBlur = 30
  ctx.shadowOffsetY = 2
  ctx.fill()
  ctx.shadowColor = 'transparent'

  let y = cardY + CARD_PAD
  const contentX = cardX + CARD_PAD

  if (coverImg) {
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(contentX, y, COVER_SIZE, COVER_SIZE, COVER_RADIUS)
    ctx.clip()
    ctx.drawImage(coverImg, contentX, y, COVER_SIZE, COVER_SIZE)
    ctx.restore()
  } else {
    ctx.fillStyle = '#e5e5ea'
    ctx.beginPath()
    ctx.roundRect(contentX, y, COVER_SIZE, COVER_SIZE, COVER_RADIUS)
    ctx.fill()
    ctx.fillStyle = '#c7c7cc'
    ctx.font = `800 60px ${FONT_STACK}`
    ctx.textAlign = 'center'
    ctx.fillText((album.albumName || '?').charAt(0), contentX + COVER_SIZE / 2, y + COVER_SIZE / 2 + 20)
    ctx.textAlign = 'left'
  }

  ctx.fillStyle = '#1d1d1f'
  ctx.font = FONT_NAME_BOLD
  let nameY = y + 48
  const nameStartX = contentX + COVER_SIZE + 24
  for (const line of nameLines) {
    ctx.fillText(line, nameStartX, nameY)
    nameY += NAME_LINE_H
  }

  ctx.fillStyle = '#8e8e93'
  ctx.font = FONT_ARTIST
  nameY += 4
  ctx.fillText(truncateText(ctx, album.artistName || '', infoW), nameStartX, nameY)

  y += COVER_SIZE + 24

  if (album.genres.length > 0) {
    measureCtx.font = FONT_TAG
    let tagX = contentX
    let tagRowY = y + 16
    let tagRowW = 0
    ctx.font = FONT_TAG
    for (const genre of album.genres) {
      const tagW = measureCtx.measureText(genre).width + 28
      if (tagRowW + tagW + 8 > contentW && tagRowW > 0) {
        tagRowY += 34
        tagX = contentX
        tagRowW = tagW + 8
      } else {
        tagRowW += tagW + 8
      }
      ctx.fillStyle = '#fce4e8'
      ctx.beginPath()
      ctx.roundRect(tagX, tagRowY, tagW, 30, 15)
      ctx.fill()
      ctx.fillStyle = '#fa2d48'
      ctx.fillText(genre, tagX + 14, tagRowY + 21)
      tagX += tagW + 8
    }
    y += genresH
  }

  ctx.fillStyle = '#aeaeb2'
  ctx.font = FONT_META
  const metaText = `收听于 ${album.listenDate}  |  ${album.tracks.length} 首歌曲`
  ctx.fillText(metaText, contentX, y + 12 + 24)
  y += metaH

  if (album.averageScore > 0) {
    y += 12
    const starSize = 14
    const starGap = 26
    const starCount = Math.round(album.averageScore)
    for (let s = 0; s < starCount; s++) {
      drawFilledStar(ctx, contentX + s * starGap, y + 16, starSize)
    }
    ctx.fillStyle = '#1d1d1f'
    ctx.font = FONT_SCORE
    ctx.fillText(album.averageScore.toFixed(1), contentX + starCount * starGap + 12, y + 26)
    y += starH
  }

  if (album.tracks.length > 0) {
    y += 12
    ctx.fillStyle = '#e5e5ea'
    ctx.fillRect(contentX, y, contentW, 1)
    y += 20

    ctx.fillStyle = '#1d1d1f'
    ctx.font = FONT_SECTION
    ctx.fillText('歌曲列表', contentX, y + 30)
    y += 48

    const TRACK_ROW_H = 42
    const numW = 32
    const trackStarAreaW = 120
    const trackNameMaxW = contentW - numW - 16 - trackStarAreaW - 12
    for (let i = 0; i < album.tracks.length; i++) {
      const track = album.tracks[i]

      ctx.fillStyle = '#c7c7cc'
      ctx.font = FONT_TRACK_NUM
      ctx.textAlign = 'right'
      ctx.fillText(String(i + 1), contentX + numW, y + 28)
      ctx.textAlign = 'left'

      ctx.fillStyle = '#1d1d1f'
      ctx.font = FONT_TRACK
      const trackNameX = contentX + numW + 16
      ctx.fillText(truncateText(ctx, track.name, trackNameMaxW), trackNameX, y + 28)

      if (track.score > 0) {
        const trackStarX = contentX + contentW - trackStarAreaW
        const trackStarSize = 10
        const trackStarGap = 20
        for (let s = 0; s < track.score; s++) {
          drawFilledStar(ctx, trackStarX + s * trackStarGap, y + 16, trackStarSize)
        }
      }

      y += TRACK_ROW_H
    }
    y += 12
  }

  if (hasInterpretation) {
    y += 12
    ctx.fillStyle = '#e5e5ea'
    ctx.fillRect(contentX, y, contentW, 1)
    y += 20

    ctx.fillStyle = '#1d1d1f'
    ctx.font = FONT_SECTION
    ctx.fillText('收听感想', contentX, y + 30)
    y += 48

    const interpMaxW = contentW - 24
    ctx.font = FONT_BODY
    const interpLines = wrapText(ctx, album.interpretation!, interpMaxW)
    const maxLines = Math.min(interpLines.length, 10)
    const interpBgH = 20 + maxLines * 36 + 20

    ctx.fillStyle = '#f9f9fb'
    ctx.beginPath()
    ctx.roundRect(contentX + 12, y, contentW - 24, interpBgH, 14)
    ctx.fill()

    ctx.fillStyle = '#3a3a3c'
    let interpY = y + 20 + 24
    for (let i = 0; i < maxLines; i++) {
      ctx.fillText(interpLines[i], contentX + 12 + 20, interpY)
      interpY += 36
    }
  }

  const footerY = H - FOOTER_H - 24
  ctx.fillStyle = '#c7c7cc'
  ctx.font = `500 22px ${FONT_STACK}`
  ctx.textAlign = 'center'
  ctx.fillText('由 Soundraft 记录', W / 2, footerY)

  ctx.fillStyle = '#d1d1d6'
  ctx.font = `400 18px ${FONT_STACK}`
  ctx.fillText('记录我听过的声音', W / 2, footerY + 30)
  ctx.textAlign = 'left'

  return canvas.toDataURL('image/png', 1.0)
}
