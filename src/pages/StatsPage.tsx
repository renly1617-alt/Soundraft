import { useMemo } from 'react'
import { ArrowLeft, Disc3, Music2, TrendingUp, BarChart3, Star, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAlbumStore } from '@/stores/albumStore'
import { useTrackStore } from '@/stores/trackStore'

const GENRE_COLORS = [
  '#FA233B', '#E65100', '#2E7D32', '#1A56DB', '#7B1FA2',
  '#C9182B', '#E65100', '#1B5E20', '#0D47A1', '#4A148C',
]

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

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
          <h1 className="text-2xl font-bold text-[#1C1C1E] tracking-tight">统计</h1>
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
    </div>
  )
}
