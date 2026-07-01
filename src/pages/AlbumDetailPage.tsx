import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Edit3, Check, X, Plus, Share2, Loader2, Download } from 'lucide-react'
import { useAlbumStore } from '@/stores/albumStore'
import { GENRE_OPTIONS } from '@/types'
import StarRating from '@/components/StarRating'
import { drawAlbumShareImage } from '@/lib/drawAlbumShareImage'

export default function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const album = useAlbumStore(s => s.albums.find(a => a.id === id))
  const updateTrackScore = useAlbumStore(s => s.updateTrackScore)
  const updateAlbum = useAlbumStore(s => s.updateAlbum)
  const deleteAlbum = useAlbumStore(s => s.deleteAlbum)

  const [isEditing, setIsEditing] = useState(false)
  const [editNotes, setEditNotes] = useState('')
  const [editGenres, setEditGenres] = useState<string[]>([])
  const [editListenDate, setEditListenDate] = useState('')
  const [customGenre, setCustomGenre] = useState('')
  const [showCustomGenre, setShowCustomGenre] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)

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
    setEditNotes(album.interpretation || '')
    setEditGenres([...album.genres])
    setEditListenDate(album.listenDate)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
  }

  const saveEditing = () => {
    updateAlbum(album.id, {
      interpretation: editNotes,
      genres: editGenres,
      listenDate: editListenDate,
    })
    setIsEditing(false)
  }

  const toggleEditGenre = (g: string) => {
    setEditGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }

  const addCustomGenre = () => {
    const g = customGenre.trim()
    if (g && !editGenres.includes(g)) {
      setEditGenres(prev => [...prev, g])
    }
    setCustomGenre('')
    setShowCustomGenre(false)
  }

  const handleDelete = () => {
    deleteAlbum(album.id)
    navigate('/')
  }

  const confirmDelete = () => {
    setShowDeleteConfirm(true)
  }

  const handleShare = async () => {
    if (!album) return
    setGenerating(true)
    try {
      const dataUrl = await drawAlbumShareImage(album)
      setGeneratedUrl(dataUrl)
    } catch {
      alert('图片生成失败，请重试')
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedUrl) return
    const a = document.createElement('a')
    a.href = generatedUrl
    a.download = `Soundraft_${album.albumName}.png`
    a.click()
  }

  const handleSystemShare = async () => {
    if (!generatedUrl) return
    const blob = await (await fetch(generatedUrl)).blob()
    const file = new File([blob], `Soundraft_${album.albumName}.png`, { type: 'image/png' })
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: album.albumName }) } catch { /* cancelled */ }
    } else {
      handleDownload()
    }
  }

  const handleClosePreview = () => {
    setGeneratedUrl(null)
  }

  const displayInterpretation = isEditing ? editNotes : album.interpretation
  const displayGenres = isEditing ? editGenres : album.genres

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
                  onClick={handleShare}
                  className="w-9 h-9 rounded-full bg-[#f2f2f6] flex items-center justify-center hover:bg-[#fce4e8] hover:text-[#fa2d48] transition-colors text-[#8e8e93]"
                >
                  <Share2 size={18} />
                </button>
                <button
                  onClick={startEditing}
                  className="w-9 h-9 rounded-full bg-[#f2f2f6] flex items-center justify-center hover:bg-[#e5e5ea] transition-colors text-[#8e8e93]"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={confirmDelete}
                  className="w-9 h-9 rounded-full bg-[#f2f2f6] flex items-center justify-center hover:bg-[#fce4e8] hover:text-[#fa2d48] transition-colors text-[#8e8e93]"
                >
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
                <>
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
                       {editGenres.filter(g => !GENRE_OPTIONS.includes(g)).map(g => (
                         <button
                           key={g}
                           onClick={() => toggleEditGenre(g)}
                           className="px-3 py-1 rounded-full text-xs font-medium bg-[#fa2d48] text-white"
                         >
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
                         <button
                           onClick={() => setShowCustomGenre(true)}
                           className="w-7 h-7 rounded-full bg-[#f2f2f6] text-[#8e8e93] flex items-center justify-center hover:bg-[#e5e5ea] transition-colors"
                         >
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
                </>
              ) : (
                <>
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
              <div className="flex items-center gap-3 text-sm text-[#8e8e93]">
                <span>收听于 {album.listenDate}</span>
                <span className="text-[#e5e5ea]">|</span>
                <span>{album.tracks.length} 首歌曲</span>
              </div>
                </>
              )}
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
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">收听感想</h2>

          {isEditing ? (
            <textarea
              value={editNotes}
              onChange={e => setEditNotes(e.target.value)}
              rows={6}
              placeholder="记录你对这张专辑的感受..."
              className="w-full px-4 py-3 rounded-xl border border-[#e5e5ea] bg-[#f9f9fb] text-sm text-[#1d1d1f] placeholder-[#c7c7cc] outline-none focus:border-[#fa2d48] focus:ring-1 focus:ring-[#fa2d48]/20 transition-all resize-none"
            />
          ) : displayInterpretation ? (
            <div className="bg-[#f9f9fb] rounded-xl p-5 text-sm text-[#1d1d1f] leading-relaxed whitespace-pre-wrap">
              {displayInterpretation}
            </div>
          ) : (
            <div className="bg-[#f9f9fb] rounded-xl p-8 text-center text-[#c7c7cc] text-sm">
              暂无收听感想，点击右上角编辑按钮添加
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-2xl p-6 mx-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <p className="text-[#1d1d1f] text-base font-semibold mb-6">确认删除吗？</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-11 rounded-full bg-[#f2f2f6] text-[#1d1d1f] text-sm font-semibold hover:bg-[#e5e5ea] transition-colors"
              >
                否
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 h-11 rounded-full bg-[#fa2d48] text-white text-sm font-semibold hover:bg-[#e0283f] transition-colors"
              >
                是
              </button>
            </div>
          </div>
        </div>
      )}

      {generating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 mx-6 shadow-xl flex flex-col items-center gap-4">
            <Loader2 size={36} className="animate-spin text-[#fa2d48]" />
            <p className="text-[#1d1d1f] font-semibold">生成分享图片中...</p>
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
              <img
                src={generatedUrl}
                alt="分享图片预览"
                className="w-full"
                onContextMenu={e => {
                  e.preventDefault()
                  handleDownload()
                }}
              />
            </div>
            <p className="text-xs text-[#8e8e93] text-center">长按图片可保存到本地</p>
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 h-11 rounded-full bg-[#f2f2f6] text-[#1d1d1f] text-sm font-semibold hover:bg-[#e5e5ea] transition-colors flex items-center justify-center gap-2"
              >
                <Download size={16} />
                保存图片
              </button>
              <button
                onClick={handleSystemShare}
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
