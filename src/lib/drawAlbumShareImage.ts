import type { Album } from '@/types'

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "PingFang SC", "Hiragino Sans", "Noto Sans JP", sans-serif'

const COLORS = {
  background: '#F4F4F8',
  card: '#FFFFFF',
  textPrimary: '#1C1C1E',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  divider: '#E5E5EA',
  red: '#FF2D55',
  tagBg: '#FFEAF0',
  tagText: '#FF2D55',
  noteBg: '#F8F8FA',
}

const CANVAS_WIDTH = 750
const PAGE_PADDING = 48
const CARD_WIDTH = CANVAS_WIDTH - PAGE_PADDING * 2
const CARD_RADIUS = 28
const CARD_PADDING = 44
const CARD_GAP = 40

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
  ctx.fillStyle = COLORS.red
  ctx.fill()
  ctx.restore()
}

function drawRoundedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.clip()
  ctx.drawImage(img, x, y, w, h)
  ctx.restore()
}

function drawCard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = COLORS.card
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, CARD_RADIUS)
  ctx.fill()
  ctx.shadowColor = 'rgba(0,0,0,0.04)'
  ctx.shadowBlur = 24
  ctx.shadowOffsetY = 2
  ctx.fill()
  ctx.shadowColor = 'transparent'
}

export async function drawAlbumShareImage(album: Album): Promise<string> {
  const coverImg = album.coverUrl ? await loadImage(album.coverUrl) : null
  const hasInterpretation = !!(album.interpretation && album.interpretation.trim())

  const cardInnerW = CARD_WIDTH - CARD_PADDING * 2
  const coverSize = cardInnerW

  const measureCanvas = document.createElement('canvas')
  const measureCtx = measureCanvas.getContext('2d')!

  // ---- 预计算各卡片高度 ----

  // 封面已固定 coverSize

  // 专辑名
  const FONT_NAME = `800 48px ${FONT_FAMILY}`
  const NAME_LINE_H = 58
  measureCtx.font = FONT_NAME
  let nameLines = wrapText(measureCtx, album.albumName || '', cardInnerW)
  if (nameLines.length > 3) nameLines = nameLines.slice(0, 3)
  const nameH = nameLines.length * NAME_LINE_H

  // 艺术家
  const FONT_ARTIST = `400 30px ${FONT_FAMILY}`
  const ARTIST_H = 40

  // 标签
  let tagRows = 0
  const FONT_TAG = `500 22px ${FONT_FAMILY}`
  measureCtx.font = FONT_TAG
  if (album.genres.length > 0) {
    let rowW = 0
    tagRows = 1
    for (const genre of album.genres) {
      const tagW = measureCtx.measureText(genre).width + 28
      if (rowW + tagW + 8 > cardInnerW && rowW > 0) {
        tagRows++
        rowW = tagW + 8
      } else {
        rowW += tagW + 8
      }
    }
  }
  const TAG_ROW_H = 34
  const tagsH = album.genres.length > 0 ? tagRows * TAG_ROW_H + 8 : 0

  // 元信息行
  const FONT_META = `400 26px ${FONT_FAMILY}`
  const META_H = 34

  // 评分星星
  const starH = album.averageScore > 0 ? 40 : 0
  const FONT_RATING = `700 30px ${FONT_FAMILY}`

  // 专辑信息卡片内容高度
  const infoCardAboveCover = CARD_PADDING
  const infoCardBelowCover =
    24 + nameH + 8 + ARTIST_H + (album.genres.length > 0 ? 16 + tagsH : 0) + 16 + META_H + (album.averageScore > 0 ? 12 + starH : 0)
  const infoCardH = infoCardAboveCover + coverSize + infoCardBelowCover + CARD_PADDING

  // 歌曲列表卡片
  let songsCardH = 0
  const FONT_SECTION = `700 34px ${FONT_FAMILY}`
  const FONT_SONG_NUM = `500 24px ${FONT_FAMILY}`
  const FONT_SONG_NAME = `400 28px ${FONT_FAMILY}`
  const SONG_ROW_H = 60
  const NUM_AREA_W = 44

  if (album.tracks.length > 0) {
    const headerH = CARD_PADDING + 34 + 24
    const bodyH = album.tracks.length * SONG_ROW_H + (album.tracks.length - 1) * 1
    songsCardH = headerH + bodyH + CARD_PADDING
  }

  // 感想卡片
  let reviewCardH = 0
  let interpLines: string[] = []
  const FONT_NOTE = `400 28px ${FONT_FAMILY}`

  if (hasInterpretation) {
    measureCtx.font = FONT_NOTE
    const interpMaxW = cardInnerW - 40
    interpLines = wrapText(measureCtx, album.interpretation!, interpMaxW).slice(0, 12)
    const NOTE_LINE_H = 40
    const noteContentH = 20 + interpLines.length * NOTE_LINE_H + 20
    const headerH = CARD_PADDING + 34 + 20
    reviewCardH = headerH + noteContentH + CARD_PADDING
  }

  // 总高度
  const footerH = 80
  const H = 48 + infoCardH + CARD_GAP + songsCardH + (reviewCardH > 0 ? CARD_GAP + reviewCardH : 0) + CARD_GAP + footerH + 48

  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_WIDTH
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // 背景
  ctx.fillStyle = COLORS.background
  ctx.fillRect(0, 0, CANVAS_WIDTH, H)

  let y = 48

  // ==================== 专辑信息卡片 ====================
  drawCard(ctx, PAGE_PADDING, y, CARD_WIDTH, infoCardH)

  const infoX = PAGE_PADDING + CARD_PADDING

  // 封面
  const coverY = y + CARD_PADDING
  if (coverImg) {
    drawRoundedImage(ctx, coverImg, infoX, coverY, coverSize, coverSize, 24)
  } else {
    ctx.fillStyle = '#e5e5ea'
    ctx.beginPath()
    ctx.roundRect(infoX, coverY, coverSize, coverSize, 24)
    ctx.fill()
    ctx.fillStyle = '#c7c7cc'
    ctx.font = `800 80px ${FONT_FAMILY}`
    ctx.textAlign = 'center'
    ctx.fillText((album.albumName || '?').charAt(0), infoX + coverSize / 2, coverY + coverSize / 2 + 28)
    ctx.textAlign = 'left'
  }

  let infoY = coverY + coverSize + 24

  // 专辑名
  ctx.fillStyle = COLORS.textPrimary
  ctx.font = FONT_NAME
  for (const line of nameLines) {
    ctx.fillText(line, infoX, infoY + 48)
    infoY += NAME_LINE_H
  }

  // 艺术家
  infoY += 8
  ctx.fillStyle = COLORS.textSecondary
  ctx.font = FONT_ARTIST
  ctx.fillText(truncateText(ctx, album.artistName || '', cardInnerW), infoX, infoY + 30)
  infoY += ARTIST_H

  // 标签
  if (album.genres.length > 0) {
    infoY += 16
    ctx.font = FONT_TAG
    let tagX = infoX
    let tagY = infoY
    for (const genre of album.genres) {
      const tagW = measureCtx.measureText(genre).width + 28
      if (tagX + tagW > infoX + cardInnerW && tagX > infoX) {
        tagY += TAG_ROW_H
        tagX = infoX
      }
      ctx.fillStyle = COLORS.tagBg
      ctx.beginPath()
      ctx.roundRect(tagX, tagY, tagW, 30, 15)
      ctx.fill()
      ctx.fillStyle = COLORS.tagText
      ctx.fillText(genre, tagX + 14, tagY + 21)
      tagX += tagW + 8
    }
    infoY = tagY + TAG_ROW_H
  }

  // 元信息
  infoY += 16
  ctx.fillStyle = COLORS.textTertiary
  ctx.font = FONT_META
  const metaText = `收听于 ${album.listenDate}  |  ${album.tracks.length} 首歌曲`
  ctx.fillText(metaText, infoX, infoY + 26)
  infoY += META_H

  // 评分
  if (album.averageScore > 0) {
    infoY += 12
    const starSize = 16
    const starGap = 30
    const starCount = Math.round(album.averageScore)
    const starBaseX = infoX + starSize
    for (let s = 0; s < starCount; s++) {
      drawFilledStar(ctx, starBaseX + s * starGap, infoY + 18, starSize)
    }
    ctx.fillStyle = COLORS.textPrimary
    ctx.font = FONT_RATING
    ctx.fillText(album.averageScore.toFixed(1), starBaseX + starCount * starGap + 14, infoY + 26)
  }

  y += infoCardH + CARD_GAP

  // ==================== 歌曲列表卡片 ====================
  if (album.tracks.length > 0) {
    drawCard(ctx, PAGE_PADDING, y, CARD_WIDTH, songsCardH)
    const songsX = PAGE_PADDING + CARD_PADDING

    let sy = y + CARD_PADDING
    ctx.fillStyle = COLORS.textPrimary
    ctx.font = FONT_SECTION
    ctx.fillText('歌曲列表', songsX, sy + 34)
    sy += 34 + 24

    // 标题下方分割线
    ctx.fillStyle = COLORS.divider
    ctx.fillRect(songsX, sy, cardInnerW, 1)
    sy += 1

    const MAX_TRACK_W = cardInnerW - NUM_AREA_W - 16 - 140
    const nameX = songsX + NUM_AREA_W + 16
    const trackStarX = songsX + cardInnerW - 140
    const trackStarSize = 11
    const trackStarGap = 22

    ctx.textBaseline = 'middle'

    for (let i = 0; i < album.tracks.length; i++) {
      const track = album.tracks[i]
      const rowMidY = sy + SONG_ROW_H / 2

      // 序号
      ctx.fillStyle = COLORS.textTertiary
      ctx.font = FONT_SONG_NUM
      ctx.textAlign = 'right'
      ctx.fillText(String(i + 1), songsX + NUM_AREA_W, rowMidY)
      ctx.textAlign = 'left'

      // 歌曲名
      ctx.fillStyle = COLORS.textPrimary
      ctx.font = FONT_SONG_NAME
      ctx.fillText(truncateText(ctx, track.name, MAX_TRACK_W), nameX, rowMidY)

      // 评分星星
      if (track.score > 0) {
        const starCY = rowMidY
        for (let s = 0; s < track.score; s++) {
          drawFilledStar(ctx, trackStarX + s * trackStarGap, starCY, trackStarSize)
        }
      }

      sy += SONG_ROW_H

      // 行间分割线
      if (i < album.tracks.length - 1) {
        ctx.fillStyle = COLORS.divider
        ctx.fillRect(songsX, sy, cardInnerW, 1)
        sy += 1
      }
    }

    ctx.textBaseline = 'alphabetic'

    y += songsCardH + CARD_GAP
  }

  // ==================== 收听感想卡片 ====================
  if (hasInterpretation) {
    drawCard(ctx, PAGE_PADDING, y, CARD_WIDTH, reviewCardH)
    const reviewX = PAGE_PADDING + CARD_PADDING

    let ry = y + CARD_PADDING
    ctx.fillStyle = COLORS.textPrimary
    ctx.font = FONT_SECTION
    ctx.fillText('收听感想', reviewX, ry + 34)
    ry += 34 + 20

    const noteContentH = 20 + interpLines.length * 40 + 20
    ctx.fillStyle = COLORS.noteBg
    ctx.beginPath()
    ctx.roundRect(reviewX, ry, cardInnerW, noteContentH, 16)
    ctx.fill()

    ctx.fillStyle = '#3C3C43'
    ctx.font = FONT_NOTE
    let noteY = ry + 20 + 28
    for (const line of interpLines) {
      ctx.fillText(line, reviewX + 20, noteY)
      noteY += 40
    }

    y += reviewCardH + CARD_GAP
  }

  // ==================== 底部署名 ====================
  ctx.fillStyle = COLORS.textTertiary
  ctx.font = `500 24px ${FONT_FAMILY}`
  ctx.textAlign = 'center'
  ctx.fillText('由 Soundraft 记录', CANVAS_WIDTH / 2, y + 24)

  ctx.fillStyle = '#D1D1D6'
  ctx.font = `400 20px ${FONT_FAMILY}`
  ctx.fillText('记录我听过的声音', CANVAS_WIDTH / 2, y + 56)
  ctx.textAlign = 'left'

  return canvas.toDataURL('image/png', 1.0)
}
