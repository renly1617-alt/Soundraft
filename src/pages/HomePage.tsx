import { useMemo, useState } from 'react'
import { Plus, Disc3, Music2, BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAlbumStore } from '@/stores/albumStore'
import { useTrackStore } from '@/stores/trackStore'
import { GENRE_OPTIONS } from '@/types'
import AlbumCard from '@/components/AlbumCard'
import GenreFilter from '@/components/GenreFilter'
import EmptyState from '@/components/EmptyState'
import Avatar from '@/components/Avatar'

function TrackGridCard({ track }: { track: { id: string; songName: string; artistName: string; coverUrl: string; listenDate: string; score: number; genres: string[] } }) {
  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 overflow-hidden">
      <div className="aspect-square bg-[#f2f2f6] overflow-hidden">
        {track.coverUrl ? (
          <img
            src={track.coverUrl}
            alt={track.songName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music2 size={40} className="text-[#d1d1d6]" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-[#1d1d1f] text-sm leading-tight line-clamp-1 mb-0.5">
          {track.songName}
        </h3>
        <p className="text-xs text-[#8e8e93] line-clamp-1 mb-0.5">
          {track.artistName}
        </p>
        <p className="text-[11px] text-[#c7c7cc] mb-2">
          {track.listenDate}
        </p>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map(n => (
            <svg key={n} width="12" height="12" viewBox="0 0 24 24" fill={n <= track.score ? '#fa2d48' : 'none'} stroke={n <= track.score ? '#fa2d48' : '#e5e5ea'} strokeWidth="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
            </svg>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const albums = useAlbumStore(s => s.albums)
  const tracks = useTrackStore(s => s.tracks)
  const navigate = useNavigate()
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'album' | 'track'>('album')
  const [addMenuOpen, setAddMenuOpen] = useState(false)

  const allGenres = useMemo(() => {
    const items = viewMode === 'album'
      ? albums.flatMap(a => a.genres)
      : tracks.flatMap(t => t.genres)
    const used = new Set(items)
    return GENRE_OPTIONS.filter(g => used.has(g))
  }, [albums, tracks, viewMode])

  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    const items = viewMode === 'album' ? albums : tracks
    items.forEach(i => i.genres.forEach(g => { counts[g] = (counts[g] || 0) + 1 }))
    return counts
  }, [albums, tracks, viewMode])

  const filteredAlbums = useMemo(() => {
    if (viewMode !== 'album') return []
    if (!selectedGenre) return albums
    return albums.filter(a => a.genres.includes(selectedGenre))
  }, [albums, selectedGenre, viewMode])

  const filteredTracks = useMemo(() => {
    if (viewMode !== 'track') return []
    if (!selectedGenre) return tracks
    return tracks.filter(t => t.genres.includes(selectedGenre))
  }, [tracks, selectedGenre, viewMode])

  const totalItems = viewMode === 'album' ? albums.length : tracks.length
  const showEmpty = viewMode === 'album' ? albums.length === 0 : tracks.length === 0

  return (
    <div className="min-h-screen bg-[#f2f2f6]">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-[#e5e5ea]/60 pt-safe">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <h1 className="brand-title text-3xl font-extrabold tracking-tight">
            SounDraft
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/stats')}
              className="w-10 h-10 rounded-full bg-[#f2f2f6] text-[#1d1d1f] flex items-center justify-center hover:bg-[#e5e5ea] transition-all shadow-sm"
              title="统计"
            >
              <BarChart3 size={18} />
            </button>
            <div className="relative">
              <button
                onClick={() => setAddMenuOpen(!addMenuOpen)}
                className="w-10 h-10 rounded-full bg-[#fa2d48] text-white flex items-center justify-center hover:bg-[#e0283f] active:scale-95 transition-all shadow-sm"
              >
                <Plus size={22} strokeWidth={2.5} />
              </button>
              {addMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setAddMenuOpen(false)} />
                  <div className="absolute right-0 top-12 z-20 bg-white rounded-2xl shadow-lg border border-[#f0f0f2] py-2 w-40 overflow-hidden">
                    <button
                      onClick={() => { navigate('/add'); setAddMenuOpen(false) }}
                      className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-[#1d1d1f] hover:bg-[#f2f2f6] transition-colors"
                    >
                      <Disc3 size={16} className="text-[#fa2d48]" />
                      添加专辑
                    </button>
                    <button
                      onClick={() => { navigate('/add-track'); setAddMenuOpen(false) }}
                      className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-[#1d1d1f] hover:bg-[#f2f2f6] transition-colors"
                    >
                      <Music2 size={16} className="text-[#fa2d48]" />
                      添加单曲
                    </button>
                  </div>
                </>
              )}
            </div>
            <Avatar onClick={() => navigate('/settings')} />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6 pb-safe">
        {showEmpty ? (
          viewMode === 'album' ? <EmptyState /> : (
            <div className="flex flex-col items-center justify-center py-32 px-4">
              <div className="w-32 h-32 rounded-full bg-[#f2f2f6] flex items-center justify-center mb-8">
                <Music2 size={56} className="text-[#c7c7cc]" />
              </div>
              <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-2 tracking-tight">还没有单曲</h2>
              <p className="text-[#8e8e93] mb-8 text-center max-w-sm leading-relaxed">
                粘贴网易云歌曲分享链接，记录你的单曲收听
              </p>
              <button
                onClick={() => navigate('/add-track')}
                className="px-8 py-3 bg-[#fa2d48] text-white rounded-full text-sm font-semibold hover:bg-[#e0283f] active:scale-95 transition-all"
              >
                添加第一首单曲
              </button>
            </div>
          )
        ) : (
          <>
            {allGenres.length > 0 && (
              <div className="mb-8">
                <GenreFilter
                  genres={allGenres}
                  selected={selectedGenre}
                  onSelect={setSelectedGenre}
                  counts={genreCounts}
                  total={totalItems}
                />
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {viewMode === 'album'
                ? filteredAlbums.map(album => (
                    <AlbumCard key={album.id} album={album} />
                  ))
                : filteredTracks.map(track => (
                    <TrackGridCard key={track.id} track={track} />
                  ))
              }
            </div>
          </>
        )}
      </div>

      <div className="fixed left-1/2 -translate-x-1/2 z-30 bg-white rounded-full shadow-lg border border-[#f0f0f2] flex p-1 gap-1"
        style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
        <button
          onClick={() => { setViewMode('album'); setSelectedGenre(null) }}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
            viewMode === 'album' ? 'bg-[#fa2d48] text-white' : 'text-[#8e8e93] hover:text-[#1d1d1f]'
          }`}
        >
          <Disc3 size={16} />
          专辑
        </button>
        <button
          onClick={() => { setViewMode('track'); setSelectedGenre(null) }}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
            viewMode === 'track' ? 'bg-[#fa2d48] text-white' : 'text-[#8e8e93] hover:text-[#1d1d1f]'
          }`}
        >
          <Music2 size={16} />
          单曲
        </button>
      </div>
    </div>
  )
}
