import { useMemo, useState } from 'react'
import { Plus, Sparkles, ListMusic } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAlbumStore } from '@/stores/albumStore'
import { GENRE_OPTIONS } from '@/types'
import AlbumCard from '@/components/AlbumCard'
import GenreFilter from '@/components/GenreFilter'
import EmptyState from '@/components/EmptyState'
import Avatar from '@/components/Avatar'

export default function HomePage() {
  const albums = useAlbumStore(s => s.albums)
  const navigate = useNavigate()
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)

  const allGenres = useMemo(() => {
    const used = new Set(albums.flatMap(a => a.genres))
    return GENRE_OPTIONS.filter(g => used.has(g))
  }, [albums])

  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    albums.forEach(a => a.genres.forEach(g => { counts[g] = (counts[g] || 0) + 1 }))
    return counts
  }, [albums])

  const filtered = useMemo(() => {
    if (!selectedGenre) return albums
    return albums.filter(a => a.genres.includes(selectedGenre))
  }, [albums, selectedGenre])

  if (albums.length === 0) return <EmptyState />

  return (
    <div className="min-h-screen bg-[#f2f2f6]">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-[#e5e5ea]/60">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <h1 className="brand-title text-3xl font-extrabold tracking-tight">
            SounDraft
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/daily')}
              className="w-10 h-10 rounded-full bg-[#f2f2f6] text-[#1d1d1f] flex items-center justify-center hover:bg-[#e5e5ea] transition-all shadow-sm"
              title="SounDraft Daily"
            >
              <Sparkles size={18} />
            </button>
            <button
              onClick={() => navigate('/watchlist')}
              className="w-10 h-10 rounded-full bg-[#f2f2f6] text-[#1d1d1f] flex items-center justify-center hover:bg-[#e5e5ea] transition-all shadow-sm"
              title="待听清单"
            >
              <ListMusic size={18} />
            </button>
            <button
              onClick={() => navigate('/add')}
              className="w-10 h-10 rounded-full bg-[#fa2d48] text-white flex items-center justify-center hover:bg-[#e0283f] active:scale-95 transition-all shadow-sm"
            >
              <Plus size={22} strokeWidth={2.5} />
            </button>
            <Avatar onClick={() => navigate('/settings')} />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {allGenres.length > 0 && (
          <div className="mb-8">
            <GenreFilter
              genres={allGenres}
              selected={selectedGenre}
              onSelect={setSelectedGenre}
              counts={genreCounts}
              total={albums.length}
            />
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map(album => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      </div>
    </div>
  )
}
