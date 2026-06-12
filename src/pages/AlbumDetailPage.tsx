import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Edit3, Loader2, Sparkles, Check, X } from 'lucide-react'
import { useAlbumStore } from '@/stores/albumStore'
import { GENRE_OPTIONS } from '@/types'
import StarRating from '@/components/StarRating'

export default function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const album = useAlbumStore(s => s.albums.find(a => a.id === id))
  const updateTrackScore = useAlbumStore(s => s.updateTrackScore)
  const updateAlbum = useAlbumStore(s => s.updateAlbum)
  const deleteAlbum = useAlbumStore(s => s.deleteAlbum)

  const [isEditing, setIsEditing] = useState(false)
  const [editInterpretation, setEditInterpretation] = useState('')
  const [editGenres, setEditGenres] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')

  if (!album) {
    return (
      <div className="min-h-screen bg-[#f2f2f6] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#8e8e93] text-lg mb-4">专辑不存在</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-full bg-[#fa2d48] text-white text-sm font-semibold hover:bg-[#e0283f] transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  const startEditing = () => {
    setEditInterpretation(album.interpretation || '')
    setEditGenres([...album.genres])
    setGenError('')
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
  }

  const saveEditing = () => {
    updateAlbum(album.id, {
      interpretation: editInterpretation,
      genres: editGenres,
    })
    setIsEditing(false)
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setGenError('')
    try {
      const resp = await fetch('/api/album/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          albumName: album.albumName,
          artistName: album.artistName,
          tracks: album.tracks.map(t => t.name),
          genres: editGenres,
        }),
      })
      const json = await resp.json()
      if (!json.success) {
        setGenError(json.error || '生成失败')
        return
      }
      setEditInterpretation(json.data.content)
    } catch {
      setGenError('网络错误，请重试')
    } finally {
      setGenerating(false)
    }
  }

  const toggleEditGenre = (g: string) => {
    setEditGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }

  const handleDelete = () => {
    deleteAlbum(album.id)
    navigate('/')
  }

  const displayInterpretation = isEditing ? editInterpretation : album.interpretation
  const displayGenres = isEditing ? editGenres : album.genres

  return (
    <div className="min-h-screen bg-[#f2f2f6]">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-[#e5e5ea]/60">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full bg-[#f2f2f6] flex items-center justify-center hover:bg-[#e5e5ea] transition-colors"
          >
            <ArrowLeft size={20} className="text-[#1d1d1f]" />
          </button>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={saveEditing}
                  className="w-9 h-9 rounded-full bg-[#fa2d48] text-white flex items-center justify-center hover:bg-[#e0283f] transition-colors"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={cancelEditing}
                  className="w-9 h-9 rounded-full bg-[#f2f2f6] flex items-center justify-center hover:bg-[#e5e5ea] transition-colors text-[#8e8e93]"
                >
                  <X size={18} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={startEditing}
                  className="w-9 h-9 rounded-full bg-[#f2f2f6] flex items-center justify-center hover:bg-[#e5e5ea] transition-colors text-[#8e8e93]"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={handleDelete}
                  className="w-9 h-9 rounded-full bg-[#f2f2f6] flex items-center justify-center hover:bg-[#fce4e8] hover:text-[#fa2d48] transition-colors text-[#8e8e93]"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-48 flex-shrink-0">
              <div className="aspect-square rounded-xl bg-[#f2f2f6] overflow-hidden shadow-sm">
                {album.coverUrl ? (
                  <img
                    src={album.coverUrl}
                    alt={album.albumName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#c7c7cc]">
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-[#1d1d1f] tracking-tight mb-1 break-words">
                {album.albumName}
              </h1>
              <p className="text-[#8e8e93] text-sm mb-3">{album.artistName}</p>

              {isEditing ? (
                <div className="mb-4">
                  <label className="block text-xs font-medium text-[#8e8e93] mb-2">风格分类</label>
                  <div className="flex flex-wrap gap-1.5">
                    {GENRE_OPTIONS.map(g => (
                      <button
                        key={g}
                        onClick={() => toggleEditGenre(g)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          editGenres.includes(g)
                            ? 'bg-[#fa2d48] text-white'
                            : 'bg-[#f2f2f6] text-[#8e8e93] hover:bg-[#e5e5ea]'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-3">
                  {displayGenres.map(g => (
                    <span
                      key={g}
                      className="px-3 py-1 rounded-full bg-[#fce4e8] text-[#fa2d48] text-xs font-medium"
                    >
                      {g}
                    </span>
                  ))}
                  {displayGenres.length === 0 && (
                    <span className="text-xs text-[#c7c7cc]">未分类</span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 text-sm text-[#8e8e93]">
                <span>收听于 {album.listenDate}</span>
                <span className="text-[#e5e5ea]">|</span>
                <span>{album.tracks.length} 首歌曲</span>
              </div>
              {album.averageScore > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  <StarRating score={Math.round(album.averageScore)} size={18} />
                  <span className="text-sm font-medium text-[#1d1d1f]">
                    {album.averageScore.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="px-6 md:px-8 py-4 border-b border-[#e5e5ea]">
            <h2 className="text-lg font-semibold text-[#1d1d1f]">歌曲列表</h2>
          </div>
          <div className="divide-y divide-[#f2f2f6]">
            {album.tracks.map((track, i) => (
              <div
                key={track.id}
                className="px-6 md:px-8 py-3.5 flex items-center gap-4 hover:bg-[#f9f9fb] transition-colors"
              >
                <span className="text-xs text-[#c7c7cc] w-6 text-right shrink-0">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm text-[#1d1d1f] truncate">
                  {track.name}
                </span>
                <StarRating
                  score={track.score}
                  onChange={(s) => updateTrackScore(album.id, i, s)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#1d1d1f]">专辑解读</h2>
            {isEditing && (
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="h-9 px-5 rounded-full bg-[#f2f2f6] text-[#1d1d1f] text-sm font-medium hover:bg-[#e5e5ea] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {generating ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                {generating ? '生成中...' : displayInterpretation ? '重新生成' : 'AI 生成解读'}
              </button>
            )}
          </div>

          {genError && <p className="text-sm text-[#fa2d48] mb-3">{genError}</p>}

          {isEditing ? (
            <textarea
              value={editInterpretation}
              onChange={e => setEditInterpretation(e.target.value)}
              rows={6}
              placeholder="输入专辑解读，或点击上方按钮让 AI 生成..."
              className="w-full px-4 py-3 rounded-xl border border-[#e5e5ea] bg-[#f9f9fb] text-sm text-[#1d1d1f] placeholder-[#c7c7cc] outline-none focus:border-[#fa2d48] focus:ring-1 focus:ring-[#fa2d48]/20 transition-all resize-none"
            />
          ) : displayInterpretation ? (
            <div className="bg-[#fce4e8] border-l-4 border-[#fa2d48] rounded-r-xl p-5 text-sm text-[#1d1d1f] leading-relaxed whitespace-pre-wrap">
              {displayInterpretation}
            </div>
          ) : (
            <div className="bg-[#f9f9fb] rounded-xl p-8 text-center text-[#c7c7cc] text-sm">
              暂无专辑解读，点击编辑按钮添加
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
