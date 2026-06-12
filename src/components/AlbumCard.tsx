import { useNavigate } from 'react-router-dom'
import type { Album } from '@/types'
import StarRating from './StarRating'

interface AlbumCardProps {
  album: Album
}

export default function AlbumCard({ album }: AlbumCardProps) {
  const navigate = useNavigate()

  return (
    <div
      className="group bg-white rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={() => navigate(`/album/${album.id}`)}
    >
      <div className="aspect-square bg-[#f2f2f6] overflow-hidden">
        {album.coverUrl ? (
          <img
            src={album.coverUrl}
            alt={album.albumName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#c7c7cc]">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v.5M12 21.5V22M2 12h.5M21.5 12H22" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-[#1d1d1f] text-sm leading-tight line-clamp-1 mb-0.5">
          {album.albumName}
        </h3>
        <p className="text-xs text-[#8e8e93] line-clamp-1 mb-0.5">
          {album.artistName}
        </p>
        <p className="text-[11px] text-[#c7c7cc] mb-2">
          {album.listenDate}
        </p>
        <div className="flex items-center justify-between">
          <StarRating score={Math.round(album.averageScore)} size={14} />
          <span className="text-xs text-[#8e8e93]">
            {album.tracks.filter(t => t.score > 0).length}/{album.tracks.length}
          </span>
        </div>
      </div>
    </div>
  )
}
