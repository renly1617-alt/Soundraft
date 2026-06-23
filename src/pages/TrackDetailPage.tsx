import { useState } from 'react'
import { ArrowLeft, Star, Loader2, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTrackStore } from '@/stores/trackStore'
import { GENRE_OPTIONS } from '@/types'
import { extractUrl } from '@/lib/extractUrl'

export default function TrackDetailPage() {
  const navigate = useNavigate()
  const addTrack = useTrackStore(s => s.addTrack)

  const [url, setUrl] = useState('')
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState('')

  const [songName, setSongName] = useState('')
  const [artistName, setArtistName] = useState('')
  const [albumName, setAlbumName] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [listenDate, setListenDate] = useState(new Date().toISOString().slice(0, 10))
  const [genres, setGenres] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [notes, setNotes] = useState('')

  const [saving, setSaving] = useState(false)
  const [customGenre, setCustomGenre] = useState('')
  const [showCustomGenre, setShowCustomGenre] = useState(false)

  const toggleGenre = (g: string) => {
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }

  const addCustomGenre = () => {
    const g = customGenre.trim()
    if (g && !genres.includes(g)) setGenres(prev => [...prev, g])
    setCustomGenre('')
    setShowCustomGenre(false)
  }

  const handleParse = async () => {
    if (!url.trim()) return
    setParsing(true)
    setParseError('')
    const targetUrl = extractUrl(url)
    if (!targetUrl) {
      setParseError('未检测到有效链接')
      return
    }
    try {
      const resp = await fetch('/api/album/parse-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      })
      const json = await resp.json()
      if (!json.success) {
        setParseError(json.error || '解析失败')
        return
      }
      setSongName(json.data.songName)
      setArtistName(json.data.artistName)
      setAlbumName(json.data.albumName)
      setCoverUrl(json.data.coverUrl)
    } catch {
      setParseError('网络错误，请重试')
    } finally {
      setParsing(false)
    }
  }

  const handleSave = () => {
    if (!songName.trim() || !artistName.trim()) return
    setSaving(true)
    addTrack({
      songName: songName.trim(),
      artistName: artistName.trim(),
      albumName: albumName.trim(),
      coverUrl,
      listenDate,
      genres,
      score,
      notes,
    })
    navigate('/')
  }

  const renderStars = (s: number, onClick?: (n: number) => void) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => onClick?.(n)}
          type="button"
          className={onClick ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            size={14}
            fill={n <= s ? '#fa2d48' : 'none'}
            className={n <= s ? 'text-[#fa2d48]' : 'text-[#e5e5ea]'}
          />
        </button>
      ))}
    </div>
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
          <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">添加单曲</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8 pb-safe">
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">粘贴网易云歌曲链接</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="https://music.163.com/song?id=..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="flex-1 h-11 px-4 rounded-xl border border-[#e5e5ea] bg-[#f9f9fb] text-sm text-[#1d1d1f] placeholder-[#c7c7cc] outline-none focus:border-[#fa2d48] focus:ring-1 focus:ring-[#fa2d48]/20 transition-all"
            />
            <button
              onClick={handleParse}
              disabled={parsing || !url.trim()}
              className="h-11 px-6 rounded-xl bg-[#fa2d48] text-white text-sm font-semibold hover:bg-[#e0283f] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              {parsing && <Loader2 size={16} className="animate-spin" />}
              {parsing ? '解析中' : '解析'}
            </button>
          </div>
          {parseError && <p className="text-sm text-[#fa2d48] mt-2">{parseError}</p>}
        </section>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">单曲信息</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[#8e8e93] mb-1.5">歌曲名 *</label>
              <input
                type="text"
                value={songName}
                onChange={e => setSongName(e.target.value)}
                placeholder="输入歌曲名..."
                className="w-full h-11 px-4 rounded-xl border border-[#e5e5ea] bg-[#f9f9fb] text-sm text-[#1d1d1f] placeholder-[#c7c7cc] outline-none focus:border-[#fa2d48] focus:ring-1 focus:ring-[#fa2d48]/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8e8e93] mb-1.5">艺人 *</label>
              <input
                type="text"
                value={artistName}
                onChange={e => setArtistName(e.target.value)}
                placeholder="输入艺人名..."
                className="w-full h-11 px-4 rounded-xl border border-[#e5e5ea] bg-[#f9f9fb] text-sm text-[#1d1d1f] placeholder-[#c7c7cc] outline-none focus:border-[#fa2d48] focus:ring-1 focus:ring-[#fa2d48]/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[#8e8e93] mb-1.5">所属专辑</label>
              <input
                type="text"
                value={albumName}
                onChange={e => setAlbumName(e.target.value)}
                placeholder="可选"
                className="w-full h-11 px-4 rounded-xl border border-[#e5e5ea] bg-[#f9f9fb] text-sm text-[#1d1d1f] placeholder-[#c7c7cc] outline-none focus:border-[#fa2d48] focus:ring-1 focus:ring-[#fa2d48]/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8e8e93] mb-1.5">收听日期</label>
              <input
                type="date"
                value={listenDate}
                onChange={e => setListenDate(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-[#e5e5ea] bg-[#f9f9fb] text-sm text-[#1d1d1f] outline-none focus:border-[#fa2d48] focus:ring-1 focus:ring-[#fa2d48]/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[#8e8e93] mb-1.5">风格标签</label>
              <div className="flex flex-wrap gap-1.5">
                {GENRE_OPTIONS.map(g => (
                  <button
                    key={g}
                    onClick={() => toggleGenre(g)}
                    type="button"
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      genres.includes(g) ? 'bg-[#fa2d48] text-white' : 'bg-[#f2f2f6] text-[#8e8e93] hover:bg-[#e5e5ea]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
                {genres.filter(g => !GENRE_OPTIONS.includes(g)).map(g => (
                  <button
                    key={g}
                    onClick={() => toggleGenre(g)}
                    type="button"
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
                    type="button"
                    className="w-7 h-7 rounded-full bg-[#f2f2f6] text-[#8e8e93] flex items-center justify-center hover:bg-[#e5e5ea] transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8e8e93] mb-1.5">评分</label>
              {renderStars(score, setScore)}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#8e8e93] mb-1.5">收听感想</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              placeholder="记录你的听感、心情或任何想法..."
              className="w-full px-4 py-3 rounded-xl border border-[#e5e5ea] bg-[#f9f9fb] text-sm text-[#1d1d1f] placeholder-[#c7c7cc] outline-none focus:border-[#fa2d48] focus:ring-1 focus:ring-[#fa2d48]/20 transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate('/')}
              className="h-11 px-6 rounded-full bg-[#f2f2f6] text-[#1d1d1f] text-sm font-semibold hover:bg-[#e5e5ea] transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !songName.trim() || !artistName.trim()}
              className="h-11 px-8 rounded-full bg-[#fa2d48] text-white text-sm font-semibold hover:bg-[#e0283f] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '保存中...' : '添加单曲'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
