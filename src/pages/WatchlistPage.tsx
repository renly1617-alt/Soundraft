import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Heart, HeartOff } from 'lucide-react'
import { useWatchlistStore, type WatchlistItem } from '@/stores/watchlistStore'

function GenreTag({ genre }: { genre: string }) {
  return (
    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FFE8EC] text-[#C9182B]">
      {genre}
    </span>
  )
}

function WatchlistCard({ item }: { item: WatchlistItem }) {
  const removeItem = useWatchlistStore(s => s.removeItem)

  return (
    <div className="bg-white rounded-[20px] overflow-hidden border border-[#f0f0f2]">
      <div className="flex items-start gap-4 p-4">
        <div className="w-20 h-20 rounded-[14px] bg-[#f2f2f6] overflow-hidden shrink-0">
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
          <h3 className="font-semibold text-[#1C1C1E] text-sm leading-snug truncate">
            {item.albumName}
          </h3>
          <p className="text-xs text-[#8E8E93] mt-0.5">{item.artistName}{item.year ? ` · ${item.year}` : ''}</p>
          <div className="mt-1.5">
            <GenreTag genre={item.genre} />
          </div>
        </div>
      </div>

      {item.blurb && (
        <div className="px-4 pb-3">
          <p className="text-[13px] text-[#6E6E73] leading-relaxed">
            {item.blurb}
          </p>
        </div>
      )}

      <div className="px-4 pb-3 flex items-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); removeItem(item.albumName, item.artistName) }}
          className="h-9 px-4 rounded-full bg-[#FFE8EC] text-[#C9182B] text-xs font-semibold hover:bg-[#FFD6DC] transition-colors flex items-center gap-1.5"
        >
          <HeartOff size={14} />
          取消收藏
        </button>
      </div>
    </div>
  )
}

export default function WatchlistPage() {
  const navigate = useNavigate()
  const items = useWatchlistStore(s => s.items)

  return (
    <div className="min-h-screen bg-[#f2f2f6]">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-[#f0f0f2]">
        <div className="max-w-xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full bg-[#f2f2f6] flex items-center justify-center hover:bg-[#e5e5ea] transition-colors"
          >
            <ArrowLeft size={20} className="text-[#1d1d1f]" />
          </button>
          <h1 className="text-2xl font-bold text-[#1C1C1E] tracking-tight">待听清单</h1>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-6 py-8">
        {items.length === 0 ? (
          <div className="bg-white rounded-[20px] p-8 border border-[#f0f0f2] text-center">
            <div className="w-16 h-16 rounded-full bg-[#FFE8EC] flex items-center justify-center mx-auto mb-4">
              <Heart size={24} className="text-[#C9182B]" />
            </div>
            <h2 className="text-lg font-semibold text-[#1C1C1E] mb-1">暂无待听专辑</h2>
            <p className="text-sm text-[#8E8E93] mb-4">
              在 SounDraft Daily 中收藏感兴趣的推荐专辑
            </p>
            <button
              onClick={() => navigate('/daily')}
              className="h-10 px-6 rounded-full bg-[#FA233B] text-white text-sm font-semibold hover:bg-[#E02035] transition-colors"
            >
              去看看今日推荐
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <WatchlistCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
