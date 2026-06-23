import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Edit3, Check, X, Plus } from 'lucide-react'
import { useTrackStore } from '@/stores/trackStore'
import { GENRE_OPTIONS } from '@/types'

export default function TrackInfoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const track = useTrackStore(s => s.tracks.find(t => t.id === id))
  const updateTrack = useTrackStore(s => s.updateTrack)
  const deleteTrack = useTrackStore(s => s.deleteTrack)

  const [isEditing, setIsEditing] = useState(false)
  const [editNotes, setEditNotes] = useState('')
  const [editGenres, setEditGenres] = useState<string[]>([])
  const [editListenDate, setEditListenDate] = useState('')
  const [editScore, setEditScore] = useState(0)
  const [customGenre, setCustomGenre] = useState('')
  const [showCustomGenre, setShowCustomGenre] = useState(false)

  if (!track) {
    return (
      <div className="min-h-screen bg-[#f2f2f6] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#8e8e93] text-lg mb-4">单曲不存在</p>
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
    setEditNotes(track.notes || '')
    setEditGenres([...track.genres])
    setEditListenDate(track.listenDate)
    setEditScore(track.score)
    setIsEditing(true)
  }

  const cancelEditing = () => setIsEditing(false)

  const saveEditing = () => {
    updateTrack(track.id, {
      notes: editNotes,
      genres: editGenres,
      listenDate: editListenDate,
      score: editScore,
    })
    setIsEditing(false)
  }

  const toggleEditGenre = (g: string) => {
    setEditGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }

  const addCustomGenre = () => {
    const g = customGenre.trim()
    if (g && !editGenres.includes(g)) setEditGenres(prev => [...prev, g])
    setCustomGenre('')
    setShowCustomGenre(false)
  }

  const handleDelete = () => {
    deleteTrack(track.id)
    navigate('/')
  }

  const displayGenres = isEditing ? editGenres : track.genres

  return (
    <div className="min-h-screen bg-[#f2f2f6]">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-[#e5e5ea]/60 pt-safe">
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
                <button onClick={saveEditing} className="w-9 h-9 rounded-full bg-[#fa2d48] text-white flex items-center justify-center hover:bg-[#e0283f] transition-colors">
                  <Check size={18} />
                </button>
                <button onClick={cancelEditing} className="w-9 h-9 rounded-full bg-[#f2f2f6] flex items-center justify-center hover:bg-[#e5e5ea] transition-colors text-[#8e8e93]">
                  <X size={18} />
                </button>
              </>
            ) : (
              <>
                <button onClick={startEditing} className="w-9 h-9 rounded-full bg-[#f2f2f6] flex items-center justify-center hover:bg-[#e5e5ea] transition-colors text-[#8e8e93]">
                  <Edit3 size={16} />
                </button>
                <button onClick={handleDelete} className="w-9 h-9 rounded-full bg-[#f2f2f6] flex items-center justify-center hover:bg-[#fce4e8] hover:text-[#fa2d48] transition-colors text-[#8e8e93]">
                  <Trash2 size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 pb-safe">
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-48 flex-shrink-0">
              <div className="aspect-square rounded-xl bg-[#f2f2f6] overflow-hidden shadow-sm">
                {track.coverUrl ? (
                  <img src={track.coverUrl} alt={track.songName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#c7c7cc]">
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9 17V7l10 5z" strokeWidth="1.2" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-[#1d1d1f] tracking-tight mb-1 break-words">
                {track.songName}
              </h1>
              <p className="text-[#8e8e93] text-sm mb-1">{track.artistName}</p>
              {track.albumName && <p className="text-[#c7c7cc] text-xs mb-3">{track.albumName}</p>}

              {isEditing ? (
                <>
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-[#8e8e93] mb-2">风格分类</label>
                    <div className="flex flex-wrap gap-1.5">
                      {GENRE_OPTIONS.map(g => (
                        <button
                          key={g}
                          onClick={() => toggleEditGenre(g)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${editGenres.includes(g) ? 'bg-[#fa2d48] text-white' : 'bg-[#f2f2f6] text-[#8e8e93] hover:bg-[#e5e5ea]'}`}
                        >
                          {g}
                        </button>
                      ))}
                      {editGenres.filter(g => !GENRE_OPTIONS.includes(g)).map(g => (
                        <button key={g} onClick={() => toggleEditGenre(g)} className="px-3 py-1 rounded-full text-xs font-medium bg-[#fa2d48] text-white">
                          {g} ×
                        </button>
                      ))}
                      {showCustomGenre ? (
                        <input
                          type="text"
                          value={customGenre}
                          onChange={e => setCustomGenre(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') addCustomGenre() }}
                          onBlur={addCustomGenre}
                          placeholder="输入风格..."
                          autoFocus
                          className="w-20 h-7 px-2.5 rounded-full border border-[#e5e5ea] bg-[#f9f9fb] text-[11px] text-[#1d1d1f] placeholder-[#c7c7cc] outline-none focus:border-[#fa2d48]"
                        />
                      ) : (
                        <button onClick={() => setShowCustomGenre(true)} className="w-7 h-7 rounded-full bg-[#f2f2f6] text-[#8e8e93] flex items-center justify-center hover:bg-[#e5e5ea] transition-colors">
                          <Plus size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-[#8e8e93] mb-1.5">收听日期</label>
                    <input
                      type="date"
                      value={editListenDate}
                      onChange={e => setEditListenDate(e.target.value)}
                      className="w-full max-w-[200px] h-9 px-3 rounded-xl border border-[#e5e5ea] bg-[#f9f9fb] text-sm text-[#1d1d1f] outline-none focus:border-[#fa2d48] focus:ring-1 focus:ring-[#fa2d48]/20 transition-all"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-[#8e8e93] mb-1.5">评分</label>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button
                          key={n}
                          onClick={() => setEditScore(n)}
                          type="button"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill={n <= editScore ? '#fa2d48' : 'none'} stroke={n <= editScore ? '#fa2d48' : '#e5e5ea'} strokeWidth="1.5">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    {displayGenres.map(g => (
                      <span key={g} className="px-3 py-1 rounded-full bg-[#fce4e8] text-[#fa2d48] text-xs font-medium">{g}</span>
                    ))}
                    {displayGenres.length === 0 && <span className="text-xs text-[#c7c7cc]">未分类</span>}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(n => (
                        <svg key={n} width="18" height="18" viewBox="0 0 24 24" fill={n <= track.score ? '#fa2d48' : 'none'} stroke={n <= track.score ? '#fa2d48' : '#e5e5ea'} strokeWidth="1.5">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
                        </svg>
                      ))}
                    </div>
                    {track.score > 0 && <span className="text-sm font-semibold text-[#fa2d48]">{track.score}.0</span>}
                  </div>
                  <div className="text-sm text-[#8e8e93]">收听于 {track.listenDate}</div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">收听感想</h2>
          {isEditing ? (
            <textarea
              value={editNotes}
              onChange={e => setEditNotes(e.target.value)}
              rows={6}
              placeholder="记录你对这首歌的感受..."
              className="w-full px-4 py-3 rounded-xl border border-[#e5e5ea] bg-[#f9f9fb] text-sm text-[#1d1d1f] placeholder-[#c7c7cc] outline-none focus:border-[#fa2d48] focus:ring-1 focus:ring-[#fa2d48]/20 transition-all resize-none"
            />
          ) : track.notes ? (
            <div className="bg-[#f9f9fb] rounded-xl p-5 text-sm text-[#1d1d1f] leading-relaxed whitespace-pre-wrap">
              {track.notes}
            </div>
          ) : (
            <div className="bg-[#f9f9fb] rounded-xl p-8 text-center text-[#c7c7cc] text-sm">
              暂无收听感想，点击右上角编辑按钮添加
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
