import { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import { ArrowLeft, Disc3, Music2, TrendingUp, BarChart3, Star, ChevronRight, Share2, X, Loader2, Download } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAlbumStore } from '@/stores/albumStore'
import { useTrackStore } from '@/stores/trackStore'
import { toPng } from 'html-to-image'
import ShareImage from '@/components/ShareImage'
import type { Album } from '@/types'

const GENRE_COLORS = [
  '#FA233B', '#E65100', '#2E7D32', '#1A56DB', '#7B1FA2',
  '#C9182B', '#E65100', '#1B5E20', '#0D47A1', '#4A148C',
]

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

function toMonthKey(dateStr: string) {
  return dateStr.slice(0, 7)
}

function monthKeyToLabel(key: string) {
  const [y, m] = key.split('-')
  return `${y}年${parseInt(m)}月`
}

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = src
  })
}

export default function StatsPage() {
  const navigate = useNavigate()
  const albums = useAlbumStore(s => s.albums)
  const tracks = useTrackStore(s => s.tracks)

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const thisMonthAlbums = useMemo(
    () => albums.filter(a => a.listenDate.startsWith(thisMonth)),
    [albums, thisMonth]
  )
  const thisMonthTracks = useMemo(
    () => tracks.filter(t => t.listenDate.startsWith(thisMonth)),
    [tracks, thisMonth]
  )

  const genreStats = useMemo(() => {
    const map: Record<string, number> = {}
    albums.forEach(a => a.genres.forEach(g => { map[g] = (map[g] || 0) + 1 }))
    tracks.forEach(t => t.genres.forEach(g => { map[g] = (map[g] || 0) + 1 }))
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8)
    const max = sorted[0]?.[1] || 1
    return sorted.map(([genre, count], i) => ({
      genre,
      count,
      pct: Math.round((count / max) * 100),
      color: GENRE_COLORS[i % GENRE_COLORS.length],
    }))
  }, [albums, tracks])

  const monthlyTrend = useMemo(() => {
    const last6: { month: string; label: string; albumCount: number; trackCount: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      last6.push({
        month: key,
        label: MONTHS[d.getMonth()],
        albumCount: albums.filter(a => a.listenDate.startsWith(key)).length,
        trackCount: tracks.filter(t => t.listenDate.startsWith(key)).length,
      })
    }
    const maxVal = Math.max(...last6.map(m => m.albumCount + m.trackCount), 1)
    return last6.map(m => ({ ...m, maxVal }))
  }, [albums, tracks, now])

  const highRankedAlbums = useMemo(
    () => albums.filter(a => a.averageScore >= 4).sort((a, b) => b.averageScore - a.averageScore).slice(0, 10),
    [albums]
  )
  const highRankedTracks = useMemo(
    () => tracks.filter(t => t.score >= 4).sort((a, b) => b.score - a.score).slice(0, 10),
    [tracks]
  )

  const availableMonths = useMemo(() => {
    const months = new Set<string>()
    albums.forEach(a => {
      if (a.listenDate && a.listenDate.length >= 7) {
        months.add(toMonthKey(a.listenDate))
      }
    })
    return Array.from(months).sort((a, b) => b.localeCompare(a))
  }, [albums])

  const [showMonthSelector, setShowMonthSelector] = useState(false)
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)
  const shareRef = useRef<HTMLDivElement>(null)

  const monthAlbums: Album[] = useMemo(() => {
    if (!selectedMonthKey) return []
    return albums.filter(a => toMonthKey(a.listenDate) === selectedMonthKey)
  }, [albums, selectedMonthKey])

  const monthLabel = useMemo(() => {
    if (!selectedMonthKey) return ''
    return monthKeyToLabel(selectedMonthKey)
  }, [selectedMonthKey])

  const handleShareClick = () => {
    if (availableMonths.length === 0) {
      alert('暂无可分享的收听记录')
      return
    }
    setShowMonthSelector(true)
    setGeneratedUrl(null)
  }

  const handleSelectMonth = (monthKey: string) => {
    setSelectedMonthKey(monthKey)
    setShowMonthSelector(false)
  }

  const generateImage = useCallback(() => {
    if (monthAlbums.length === 0) {
      alert('该月份没有专辑记录')
      return
    }
    console.log('[ShareImage] 开始生成，选中月份:', selectedMonthKey, '专辑数:', monthAlbums.length)
    setGenerating(true)
  }, [monthAlbums, selectedMonthKey])

  useEffect(() => {
    if (!generating) return

    let cancelled = false

    const doGenerate = async () => {
      await new Promise(r => setTimeout(r, 100))

      if (cancelled) return

      if (!shareRef.current) {
        console.error('[ShareImage] shareRef.current 为空，组件未挂载')
        alert('图片生成失败，请重试')
        setGenerating(false)
        return
      }

      try {
        const covers = monthAlbums.map(a => a.coverUrl).filter(Boolean) as string[]
        console.log('[ShareImage] 预加载封面:', covers.length, '张')
        await Promise.all(covers.map(preloadImage))

        await new Promise(r => setTimeout(r, 300))

        if (cancelled) return

        console.log('[ShareImage] 调用 toPng...')
        const dataUrl = await toPng(shareRef.current, {
          quality: 1,
          pixelRatio: 1,
          skipAutoScale: true,
        })
        console.log('[ShareImage] toPng 完成, dataUrl 长度:', dataUrl.length)
        setGeneratedUrl(dataUrl)
      } catch (err) {
        console.error('[ShareImage] 图片生成失败', err)
        alert('图片生成失败，请重试')
      } finally {
        if (!cancelled) {
          setGenerating(false)
        }
      }
    }

    doGenerate()

    return () => {
      cancelled = true
    }
  }, [generating, monthAlbums])

  const handleShare = async () => {
    if (!generatedUrl) return
    const blob = await (await fetch(generatedUrl)).blob()
    const file = new File([blob], `Soundraft_${selectedMonthKey}.png`, { type: 'image/png' })
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: '月度专辑收听记录' })
      } catch {
        // 用户取消分享，忽略
      }
    } else {
      const a = document.createElement('a')
      a.href = generatedUrl
      a.download = `Soundraft_${selectedMonthKey}.png`
      a.click()
    }
  }

  const handleClosePreview = () => {
    setSelectedMonthKey(null)
    setGeneratedUrl(null)
  }

  return (
    <div className="min-h-screen bg-[#f2f2f6]">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-[#e5e5ea]/60 pt-safe">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full bg-[#f2f2f6] flex items-center justify-center hover:bg-[#e5e5ea] transition-colors"
          >
            <ArrowLeft size={20} className="text-[#1d1d1f]" />
          </button>
          <h1 className="text-2xl font-bold text-[#1C1C1E] tracking-tight flex-1">统计</h1>
          <button
            onClick={handleShareClick}
            className="w-9 h-9 rounded-full bg-[#f2f2f6] flex items-center justify-center hover:bg-[#fce4e8] hover:text-[#fa2d48] transition-colors text-[#8e8e93]"
          >
            <Share2 size={18} />
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8 pb-safe">
        {/* 本月概览 */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-[#FA233B]" />
            <h2 className="text-lg font-bold text-[#1C1C1E]">本月概览</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-5 border border-[#f0f0f2]">
              <div className="flex items-center gap-2 mb-2">
                <Disc3 size={16} className="text-[#FA233B]" />
                <span className="text-xs text-[#8E8E93] font-medium">本月专辑</span>
              </div>
              <p className="text-3xl font-bold text-[#1C1C1E]">{thisMonthAlbums.length}</p>
              <p className="text-xs text-[#c7c7cc] mt-1">张</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-[#f0f0f2]">
              <div className="flex items-center gap-2 mb-2">
                <Music2 size={16} className="text-[#FA233B]" />
                <span className="text-xs text-[#8E8E93] font-medium">本月单曲</span>
              </div>
              <p className="text-3xl font-bold text-[#1C1C1E]">{thisMonthTracks.length}</p>
              <p className="text-xs text-[#c7c7cc] mt-1">首</p>
            </div>
          </div>
        </section>

        {/* 品味分布 */}
        {genreStats.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={18} className="text-[#FA233B]" />
              <h2 className="text-lg font-bold text-[#1C1C1E]">品味分布</h2>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-[#f0f0f2] space-y-3">
              {genreStats.map(g => (
                <div key={g.genre} className="flex items-center gap-3">
                  <span className="text-xs text-[#8E8E93] w-14 shrink-0 text-right">{g.genre}</span>
                  <div className="flex-1 h-6 bg-[#f2f2f6] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${g.pct}%`, backgroundColor: g.color }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-[#1C1C1E] w-5 text-right">{g.count}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 月度趋势 */}
        {monthlyTrend.some(m => m.albumCount + m.trackCount > 0) && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-[#FA233B]" />
              <h2 className="text-lg font-bold text-[#1C1C1E]">月度趋势</h2>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-[#f0f0f2]">
              <div className="flex items-end gap-3 h-36">
                {monthlyTrend.map(m => {
                  const total = m.albumCount + m.trackCount
                  const h = Math.max((total / m.maxVal) * 100, total > 0 ? 8 : 0)
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <span className="text-[10px] font-semibold text-[#1C1C1E]">
                        {total > 0 ? total : ''}
                      </span>
                      <div className="w-full flex gap-0.5 justify-center items-end" style={{ height: `${h}%` }}>
                        {m.albumCount > 0 && (
                          <div
                            className="w-[40%] rounded-t-md bg-[#FA233B] min-h-[4px]"
                            style={{ height: `${(m.albumCount / total) * 100}%` }}
                          />
                        )}
                        {m.trackCount > 0 && (
                          <div
                            className="w-[40%] rounded-t-md bg-[#FFE8EC] min-h-[4px]"
                            style={{ height: `${(m.trackCount / total) * 100}%` }}
                          />
                        )}
                      </div>
                      <span className="text-[10px] text-[#c7c7cc]">{m.label}</span>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-[#f2f2f6]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#FA233B]" />
                  <span className="text-[10px] text-[#8E8E93]">专辑</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#FFE8EC]" />
                  <span className="text-[10px] text-[#8E8E93]">单曲</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 高分排行 */}
        {(highRankedAlbums.length > 0 || highRankedTracks.length > 0) && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Star size={18} className="text-[#FA233B]" fill="#FA233B" />
              <h2 className="text-lg font-bold text-[#1C1C1E]">高分排行</h2>
            </div>
            <div className="space-y-6">
              {highRankedAlbums.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-[#C9182B] uppercase tracking-wider mb-3">专辑</p>
                  <div className="bg-white rounded-2xl border border-[#f0f0f2] overflow-hidden">
                    {highRankedAlbums.map((a, i) => (
                      <div
                        key={a.id}
                        onClick={() => navigate(`/album/${a.id}`)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#fafafa] transition-colors cursor-pointer border-b border-[#f2f2f6] last:border-0"
                      >
                        <span className="text-xs font-semibold text-[#c7c7cc] w-5 text-right">{i + 1}</span>
                        <div className="w-10 h-10 rounded-[10px] bg-[#f2f2f6] overflow-hidden shrink-0">
                          {a.coverUrl ? (
                            <img src={a.coverUrl} alt={a.albumName} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#c7c7cc] text-xs font-bold">
                              {a.albumName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-[#1d1d1f] truncate">{a.albumName}</p>
                          <p className="text-xs text-[#8e8e93]">{a.artistName}</p>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {[1, 2, 3, 4, 5].map(n => (
                            <svg key={n} width="11" height="11" viewBox="0 0 24 24" fill={n <= Math.round(a.averageScore) ? '#fa2d48' : 'none'} stroke={n <= Math.round(a.averageScore) ? '#fa2d48' : '#e5e5ea'} strokeWidth="1.5">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
                            </svg>
                          ))}
                        </div>
                        <ChevronRight size={14} className="text-[#c7c7cc] shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {highRankedTracks.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-[#C9182B] uppercase tracking-wider mb-3">单曲</p>
                  <div className="bg-white rounded-2xl border border-[#f0f0f2] overflow-hidden">
                    {highRankedTracks.map((t, i) => (
                      <div
                        key={t.id}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#fafafa] transition-colors border-b border-[#f2f2f6] last:border-0"
                      >
                        <span className="text-xs font-semibold text-[#c7c7cc] w-5 text-right">{i + 1}</span>
                        <div className="w-10 h-10 rounded-[10px] bg-[#f2f2f6] overflow-hidden shrink-0">
                          {t.coverUrl ? (
                            <img src={t.coverUrl} alt={t.songName} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#c7c7cc]">
                              <Music2 size={16} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-[#1d1d1f] truncate">{t.songName}</p>
                          <p className="text-xs text-[#8e8e93]">{t.artistName}</p>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {[1, 2, 3, 4, 5].map(n => (
                            <svg key={n} width="11" height="11" viewBox="0 0 24 24" fill={n <= t.score ? '#fa2d48' : 'none'} stroke={n <= t.score ? '#fa2d48' : '#e5e5ea'} strokeWidth="1.5">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {showMonthSelector && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowMonthSelector(false)}>
          <div className="bg-white rounded-t-3xl md:rounded-3xl p-6 w-full md:max-w-sm md:mx-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#1d1d1f]">选择分享月份</h3>
              <button onClick={() => setShowMonthSelector(false)} className="w-8 h-8 rounded-full bg-[#f2f2f6] flex items-center justify-center hover:bg-[#e5e5ea] transition-colors">
                <X size={16} className="text-[#8e8e93]" />
              </button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {availableMonths.map(monthKey => {
                const count = albums.filter(a => toMonthKey(a.listenDate) === monthKey).length
                return (
                  <button
                    key={monthKey}
                    onClick={() => handleSelectMonth(monthKey)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[#f2f2f6] transition-colors text-left"
                  >
                    <span className="text-[#1d1d1f] font-semibold">{monthKeyToLabel(monthKey)}</span>
                    <span className="text-sm text-[#8e8e93]">{count} 张专辑</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {selectedMonthKey && !generatedUrl && !generating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={handleClosePreview}>
          <div className="bg-white rounded-2xl p-6 mx-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <p className="text-[#1d1d1f] text-base font-semibold mb-1">生成分享图片</p>
            <p className="text-[#8e8e93] text-sm mb-6">将生成 {monthLabel} 的专辑收听记录图片，共 {monthAlbums.length} 张专辑。</p>
            <div className="flex gap-3">
              <button
                onClick={handleClosePreview}
                className="flex-1 h-11 rounded-full bg-[#f2f2f6] text-[#1d1d1f] text-sm font-semibold hover:bg-[#e5e5ea] transition-colors"
              >
                取消
              </button>
              <button
                onClick={generateImage}
                className="flex-1 h-11 rounded-full bg-[#fa2d48] text-white text-sm font-semibold hover:bg-[#e0283f] transition-colors"
              >
                生成
              </button>
            </div>
          </div>
        </div>
      )}

      {generating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1080,
            transformOrigin: 'top left',
            overflow: 'hidden',
          }}>
            <ShareImage ref={shareRef} monthLabel={monthLabel} albums={monthAlbums} />
          </div>
          <div className="bg-white rounded-2xl p-8 mx-6 shadow-xl flex flex-col items-center gap-4 relative z-10">
            <Loader2 size={36} className="animate-spin text-[#fa2d48]" />
            <p className="text-[#1d1d1f] font-semibold">生成中...</p>
          </div>
        </div>
      )}

      {generatedUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={handleClosePreview}>
          <div className="bg-white rounded-2xl p-4 mx-4 max-w-md w-full shadow-xl flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1d1d1f]">分享图片</h3>
              <button onClick={handleClosePreview} className="w-8 h-8 rounded-full bg-[#f2f2f6] flex items-center justify-center hover:bg-[#e5e5ea] transition-colors">
                <X size={16} className="text-[#8e8e93]" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-[#f2f2f6]">
              <img src={generatedUrl} alt="分享图片预览" className="w-full" />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const a = document.createElement('a')
                  a.href = generatedUrl
                  a.download = `Soundraft_${selectedMonthKey}.png`
                  a.click()
                }}
                className="flex-1 h-11 rounded-full bg-[#f2f2f6] text-[#1d1d1f] text-sm font-semibold hover:bg-[#e5e5ea] transition-colors flex items-center justify-center gap-2"
              >
                <Download size={16} />
                保存图片
              </button>
              <button
                onClick={handleShare}
                className="flex-1 h-11 rounded-full bg-[#fa2d48] text-white text-sm font-semibold hover:bg-[#e0283f] transition-colors flex items-center justify-center gap-2"
              >
                <Share2 size={16} />
                分享
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
