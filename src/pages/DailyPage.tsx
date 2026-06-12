import { useEffect, useState, useCallback, createContext, useContext } from 'react'
import { ArrowLeft, Loader2, ChevronDown, ChevronUp, Heart, Disc3, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAlbumStore } from '@/stores/albumStore'
import { useWatchlistStore } from '@/stores/watchlistStore'

const ToastContext = createContext<(msg: string) => void>(() => {})

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ msg: string; visible: boolean }>({ msg: '', visible: false })
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const show = (msg: string) => {
    if (timer) clearTimeout(timer)
    setToast({ msg, visible: true })
    const t = setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2000)
    setTimer(t)
  }

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-[#1C1C1E] text-white text-sm font-medium shadow-lg flex items-center gap-2 transition-all duration-300 ${
          toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <Check size={16} className="text-[#FA233B]" />
        {toast.msg}
      </div>
    </ToastContext.Provider>
  )
}

interface TrackItem {
  name: string
  note: string
}

interface TodayAlbum {
  albumName: string
  artistName: string
  year: string
  genre: string
  colorIndex?: number
  coverUrl?: string
  blurb: string
  intro: string
  tracks: TrackItem[]
}

interface Recommendation {
  albumName: string
  artistName: string
  year: string
  genre: string
  colorIndex?: number
  coverUrl?: string
  blurb: string
  intro: string
  reasons: string[]
  tracks: { name: string; note: string }[]
}

interface Review {
  title: string
  englishName: string
  content: string
  keywords: string[]
  albums: string[]
}

function SectionIcon({ letter }: { letter: string }) {
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#FA233B]">
      <span className="text-white text-lg font-bold leading-none">{letter}</span>
    </div>
  )
}

function GenreTag({ genre }: { genre: string }) {
  return (
    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FFE8EC] text-[#C9182B]">
      {genre}
    </span>
  )
}

function FavoriteButton({ albumName, artistName, genre, coverUrl, year, blurb }: {
  albumName: string
  artistName: string
  genre: string
  coverUrl?: string
  year?: string
  blurb?: string
}) {
  const showToast = useContext(ToastContext)
  const isWatched = useWatchlistStore(s => s.isWatched)
  const addItem = useWatchlistStore(s => s.addItem)
  const removeItem = useWatchlistStore(s => s.removeItem)

  const watched = isWatched(albumName, artistName)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (watched) {
      removeItem(albumName, artistName)
    } else {
      addItem({
        albumName,
        artistName,
        genre,
        coverUrl: coverUrl || '',
        year: year || '',
        blurb: blurb || '',
      })
      showToast('已添加至待听清单')
    }
  }

  if (watched) {
    return (
      <button
        onClick={handleClick}
        className="h-9 px-4 rounded-full bg-[#FFE8EC] text-[#C9182B] text-xs font-semibold hover:bg-[#FFD6DC] transition-colors flex items-center gap-1.5"
      >
        <Heart size={14} fill="currentColor" />
        已收藏
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className="h-9 px-4 rounded-full bg-[#f2f2f6] text-[#8E8E93] text-xs font-semibold hover:bg-[#FFE8EC] hover:text-[#C9182B] transition-colors flex items-center gap-1.5"
    >
      <Heart size={14} />
      收藏
    </button>
  )
}

function TodayAlbumCard({ album }: { album: TodayAlbum }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-[22px] overflow-hidden border border-[#f0f0f2]">
      <div className="px-5 pt-5 pb-4">
        <div className="relative w-full aspect-square rounded-2xl bg-[#f2f2f6] overflow-hidden mb-5">
          {album.coverUrl ? (
            <img
              src={album.coverUrl}
              alt={album.albumName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Disc3 size={64} className="text-[#d1d1d6]" />
            </div>
          )}
        </div>

        <h3 className="text-[22px] font-bold text-[#1C1C1E] tracking-tight leading-tight mb-1">
          {album.albumName}
        </h3>
        <p className="text-sm text-[#8E8E93] mb-3">
          {album.artistName} · {album.year}
        </p>
        <div className="mb-3">
          <GenreTag genre={album.genre} />
        </div>
        <p className="text-[15px] text-[#1C1C1E] leading-relaxed">
          {album.blurb}
        </p>
      </div>

      <div className="px-5 pb-4 flex items-center gap-2.5">
        <FavoriteButton
          albumName={album.albumName}
          artistName={album.artistName}
          genre={album.genre}
          coverUrl={album.coverUrl}
          year={album.year}
          blurb={album.blurb}
        />
        <button
          onClick={() => setExpanded(!expanded)}
          className="h-9 px-5 rounded-full text-[#8E8E93] text-xs font-medium hover:bg-[#f2f2f6] transition-colors flex items-center gap-1.5 ml-auto"
        >
          {expanded ? '收起详情' : '查看专辑详情'}
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-[#f0f0f2]">
          <div className="px-5 py-4 bg-[#FAFAFA]">
            <p className="text-[15px] text-[#1C1C1E] leading-relaxed">
              {album.intro}
            </p>
          </div>

          {album.tracks && album.tracks.length > 0 && (
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-3">曲目列表</p>
              <div className="space-y-3">
                {album.tracks.map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-xs text-[#c7c7cc] w-5 text-right pt-0.5 shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold text-[#1C1C1E] leading-snug">
                        {t.name}
                      </p>
                      {t.note && (
                        <p className="text-[13px] text-[#8E8E93] leading-snug mt-0.5">
                          {t.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SmallAlbumCard({ item }: { item: Recommendation }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-[20px] overflow-hidden border border-[#f0f0f2] transition-all duration-200">
      <div
        onClick={() => setExpanded(!expanded)}
        className="px-4 py-4 cursor-pointer hover:bg-[#fafafa] transition-colors"
      >
        <div className="flex items-start gap-3">
          <div className="w-16 h-16 rounded-[12px] bg-[#f2f2f6] overflow-hidden shrink-0">
            {item.coverUrl ? (
              <img
                src={item.coverUrl}
                alt={item.albumName}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#c7c7cc] text-lg font-bold">
                {item.albumName.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className={`font-semibold text-[#1d1d1f] text-sm leading-snug ${expanded ? '' : 'truncate'}`}>
                {item.albumName}
              </h3>
              {expanded ? (
                <ChevronUp size={14} className="text-[#c7c7cc] shrink-0" />
              ) : (
                <ChevronDown size={14} className="text-[#c7c7cc] shrink-0" />
              )}
            </div>
            <p className="text-xs text-[#8e8e93] mt-0.5">
              {item.artistName}{item.year ? ` · ${item.year}` : ''}
            </p>
            <div className="mt-1.5">
              <GenreTag genre={item.genre} />
            </div>
          </div>
        </div>
        <p className="mt-3 text-[13px] text-[#6e6e73] leading-relaxed">
          {item.blurb}
        </p>
        <div className="mt-3">
          <FavoriteButton
            albumName={item.albumName}
            artistName={item.artistName}
            genre={item.genre}
            coverUrl={item.coverUrl}
            year={item.year}
            blurb={item.blurb}
          />
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#f2f2f6]">
          <div className="px-4 py-4 space-y-4 bg-[#FAFAFA]">
            {item.intro && (
              <div>
                <p className="text-[11px] font-semibold text-[#C9182B] uppercase tracking-wider mb-1.5">为什么推荐</p>
                <p className="text-[13px] text-[#48484a] leading-relaxed">{item.intro}</p>
              </div>
            )}

            {item.reasons && item.reasons.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-[#C9182B] uppercase tracking-wider mb-1.5">标签</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.reasons.map((r, i) => (
                    <span key={i} className="inline-block px-2.5 py-1 rounded-full bg-[#FFE8EC] text-[#C9182B] text-[12px] font-medium">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {item.tracks && item.tracks.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-[#C9182B] uppercase tracking-wider mb-1.5">代表曲目</p>
                <div className="space-y-2">
                  {item.tracks.map((t, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[11px] text-[#c7c7cc] w-4 text-right pt-0.5 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#1C1C1E] leading-snug">{t.name}</p>
                        {t.note && <p className="text-[12px] text-[#8E8E93] leading-snug mt-0.5">{t.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function DailyPage() {
  const navigate = useNavigate()
  const albums = useAlbumStore(s => s.albums)

  const [todayAlbum, setTodayAlbum] = useState<TodayAlbum | null>(null)
  const [review, setReview] = useState<Review | null>(null)
  const [similars, setSimilars] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [recResp, revResp] = await Promise.all([
        fetch('/api/daily/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }),
        fetch('/api/daily/review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }),
      ])

      const [recJson, revJson] = await Promise.all([recResp.json(), revResp.json()])

      if (recJson.success) setTodayAlbum(recJson.data)
      if (revJson.success) setReview(revJson.data)

      const highScored = albums.filter(a => a.averageScore >= 3)
      if (highScored.length > 0) {
        const likedAlbums = highScored.slice(0, 5).map(a => `${a.albumName} - ${a.artistName}`).join('、')
        const likedGenres = [...new Set(highScored.flatMap(a => a.genres))].slice(0, 5).join('、')

        const simResp = await fetch('/api/daily/similar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ likedAlbums, likedGenres }),
        })
        const simJson = await simResp.json()
        if (simJson.success) setSimilars(simJson.data)
      }
    } catch {
      setError('加载失败，请检查 AI 服务配置后重试')
    } finally {
      setLoading(false)
    }
  }, [albums])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return (
    <ToastProvider>
    <div className="min-h-screen bg-[#f2f2f6]">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-[#f0f0f2]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full bg-[#f2f2f6] flex items-center justify-center hover:bg-[#e5e5ea] transition-colors"
          >
            <ArrowLeft size={20} className="text-[#1d1d1f]" />
          </button>
          <h1 className="text-2xl font-bold text-[#1C1C1E] tracking-tight">SounDraft Daily</h1>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-6 py-8 space-y-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[#FA233B]" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#f0f0f2]">
            <p className="text-[#8e8e93] mb-4">{error}</p>
            <button
              onClick={fetchAll}
              className="h-10 px-6 rounded-full bg-[#FA233B] text-white text-sm font-semibold hover:bg-[#E02035] transition-colors"
            >
              重新加载
            </button>
          </div>
        ) : (
          <>
            {todayAlbum && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <SectionIcon letter="今" />
                  <div>
                    <h2 className="text-xl font-bold text-[#1C1C1E]">今日专辑</h2>
                    <p className="text-xs text-[#8E8E93]">为你挑选一张值得完整播放的作品</p>
                  </div>
                </div>
                <TodayAlbumCard album={todayAlbum} />
              </section>
            )}

            {similars.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <SectionIcon letter="似" />
                  <div>
                    <h2 className="text-xl font-bold text-[#1C1C1E]">相似专辑推荐</h2>
                    <p className="text-xs text-[#8E8E93]">基于你的收藏和评分偏好</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {similars.map((r, i) => (
                    <SmallAlbumCard key={i} item={r} />
                  ))}
                </div>
              </section>
            )}

            {similars.length === 0 && albums.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <SectionIcon letter="似" />
                  <div>
                    <h2 className="text-xl font-bold text-[#1C1C1E]">相似专辑推荐</h2>
                    <p className="text-xs text-[#8E8E93]">基于你的收藏和评分偏好</p>
                  </div>
                </div>
                <div className="bg-white rounded-[20px] p-6 border border-[#f0f0f2] text-center">
                  <p className="text-sm text-[#c7c7cc]">
                    为更多专辑打出3星以上评分，AI 会为你生成个性化推荐
                  </p>
                </div>
              </section>
            )}

            {review && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <SectionIcon letter="风" />
                  <div>
                    <h2 className="text-xl font-bold text-[#1C1C1E]">每日风格</h2>
                    <p className="text-xs text-[#8E8E93]">每天认识一种音乐风格</p>
                  </div>
                </div>
                <div className="bg-white rounded-[20px] p-6 border border-[#f0f0f2]">
                  <div className="flex items-baseline gap-2 mb-3">
                    <h3 className="text-lg font-bold text-[#1C1C1E]">{review.title}</h3>
                    {review.englishName && (
                      <span className="text-xs text-[#8E8E93]">{review.englishName}</span>
                    )}
                  </div>
                  <p className="text-sm text-[#48484a] leading-relaxed mb-4">{review.content}</p>
                  {review.keywords && review.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {review.keywords.map((kw, i) => (
                        <span key={i} className="inline-block px-2.5 py-1 rounded-full bg-[#FFE8EC] text-[#C9182B] text-[12px] font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                  {review.albums && review.albums.length > 0 && (
                    <div className="border-t border-[#f2f2f6] pt-4">
                      <p className="text-[11px] font-semibold text-[#C9182B] uppercase tracking-wider mb-2">代表专辑</p>
                      <div className="space-y-1.5">
                        {review.albums.map((a, i) => (
                          <p key={i} className="text-[13px] text-[#6e6e73]">{a}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </div>
      </div>
    </ToastProvider>
  )
}
