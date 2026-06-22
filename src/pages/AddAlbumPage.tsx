import { useState } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAlbumStore } from '@/stores/albumStore'
import { GENRE_OPTIONS } from '@/types'
import type { ParseResult } from '@/types'

export default function AddAlbumPage() {
  const navigate = useNavigate()
  const addAlbum = useAlbumStore(s => s.addAlbum)

  const [url, setUrl] = useState('')
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState('')

  const [albumName, setAlbumName] = useState('')
  const [artistName, setArtistName] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [listenDate, setListenDate] = useState(new Date().toISOString().slice(0, 10))
  const [genres, setGenres] = useState<string[]>([])
  const [tracks, setTracks] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  const [saving, setSaving] = useState(false)

  const handleParse = async () => {
    if (!url.trim()) return
    setParsing(true)
    setParseError('')
    try {
      const resp = await fetch('/api/album/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const json = await resp.json()
      if (!json.success) {
        setParseError(json.error || '解析失败')
        return
      }
      const d: ParseResult = json.data
      setAlbumName(d.albumName)
      setArtistName(d.artistName)
      setCoverUrl(d.coverUrl)
      setTracks(d.tracks.map(t => t.name))
    } catch {
      setParseError('网络错误，请重试')
    } finally {
      setParsing(false)
    }
  }

  const toggleGenre = (g: string) => {
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }

  const handleSave = () => {
    if (!albumName.trim()) return
    setSaving(true)
    addAlbum({
      albumName: albumName.trim(),
      artistName: artistName.trim(),
      coverUrl,
      listenDate,
      genres,
      interpretation: notes.trim(),
      tracks: tracks.map(name => ({ name })),
    })
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#f2f2f6]">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-[#e5e5ea]/60">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-[#f2f2f6] flex items-center justify-center hover:bg-[#e5e5ea] transition-colors"
          >
            <ArrowLeft size={20} className="text-[#1d1d1f]" />
          </button>
          <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">添加专辑</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">粘贴网易云专辑链接</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="https://music.163.com/album?id=..."
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

        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">专辑信息</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[#8e8e93] mb-1.5">专辑名</label>
              <input
                type="text"
                value={albumName}
                onChange={e => setAlbumName(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-[#e5e5ea] bg-[#f9f9fb] text-sm text-[#1d1d1f] outline-none focus:border-[#fa2d48] focus:ring-1 focus:ring-[#fa2d48]/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8e8e93] mb-1.5">艺术家</label>
              <input
                type="text"
                value={artistName}
                onChange={e => setArtistName(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-[#e5e5ea] bg-[#f9f9fb] text-sm text-[#1d1d1f] outline-none focus:border-[#fa2d48] focus:ring-1 focus:ring-[#fa2d48]/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[#8e8e93] mb-1.5">收听日期</label>
              <input
                type="date"
                value={listenDate}
                onChange={e => setListenDate(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-[#e5e5ea] bg-[#f9f9fb] text-sm text-[#1d1d1f] outline-none focus:border-[#fa2d48] focus:ring-1 focus:ring-[#fa2d48]/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8e8e93] mb-1.5">封面链接</label>
              <input
                type="text"
                value={coverUrl}
                onChange={e => setCoverUrl(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-[#e5e5ea] bg-[#f9f9fb] text-sm text-[#1d1d1f] outline-none focus:border-[#fa2d48] focus:ring-1 focus:ring-[#fa2d48]/20 transition-all"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#8e8e93] mb-2">风格分类</label>
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map(g => (
                <button
                  key={g}
                  onClick={() => toggleGenre(g)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    genres.includes(g)
                      ? 'bg-[#fa2d48] text-white'
                      : 'bg-[#f2f2f6] text-[#8e8e93] hover:bg-[#e5e5ea]'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {tracks.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#8e8e93] mb-2">
                歌曲列表（{tracks.length}首）
              </label>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-[#e5e5ea] bg-[#f9f9fb] divide-y divide-[#e5e5ea]">
                {tracks.map((name, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                    <span className="text-xs text-[#8e8e93] w-6 text-right">{i + 1}</span>
                    <input
                      type="text"
                      value={name}
                      onChange={e => {
                        const next = [...tracks]
                        next[i] = e.target.value
                        setTracks(next)
                      }}
                      className="flex-1 bg-transparent text-sm text-[#1d1d1f] outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">收听感想</h2>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={5}
            placeholder="记录你对这张专辑的感受、想说的话..."
            className="w-full px-4 py-3 rounded-xl border border-[#e5e5ea] bg-[#f9f9fb] text-sm text-[#1d1d1f] placeholder-[#c7c7cc] outline-none focus:border-[#fa2d48] focus:ring-1 focus:ring-[#fa2d48]/20 transition-all resize-none"
          />
        </section>

        <div className="flex justify-end gap-3 pb-8">
          <button
            onClick={() => navigate(-1)}
            className="h-11 px-6 rounded-full bg-[#f2f2f6] text-[#1d1d1f] text-sm font-semibold hover:bg-[#e5e5ea] transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !albumName.trim()}
            className="h-11 px-8 rounded-full bg-[#fa2d48] text-white text-sm font-semibold hover:bg-[#e0283f] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '保存中...' : '保存专辑'}
          </button>
        </div>
      </div>
    </div>
  )
}
