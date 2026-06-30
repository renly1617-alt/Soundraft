import { forwardRef } from 'react'
import type { Album } from '@/types'

interface ShareImageProps {
  monthLabel: string
  albums: Album[]
}

function StarDisplay({ score }: { score: number }) {
  const rounded = Math.round(score)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <svg key={n} width="20" height="20" viewBox="0 0 24 24" fill={n <= rounded ? '#FA233B' : 'none'} stroke={n <= rounded ? '#FA233B' : '#d1d1d6'} strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
          </svg>
        ))}
      </div>
      <span style={{ fontSize: 20, fontWeight: 800, color: '#FA233B', minWidth: 38, textAlign: 'right' }}>{score.toFixed(1)}</span>
    </div>
  )
}

function AlbumRow({ album, rank, isLast }: { album: Album; rank: number; isLast: boolean }) {
  const isTop3 = rank <= 3

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 28,
        padding: '24px 0',
      }}>
        <span style={{
          fontSize: 32,
          fontWeight: 800,
          color: isTop3 ? '#FA233B' : '#c7c7cc',
          width: 56,
          textAlign: 'center',
          flexShrink: 0,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {rank}
        </span>

        <div style={{
          width: 100,
          height: 100,
          borderRadius: 12,
          overflow: 'hidden',
          flexShrink: 0,
          background: '#e5e5ea',
        }}>
          {album.coverUrl ? (
            <img
              src={album.coverUrl}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              crossOrigin="anonymous"
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              fontWeight: 800,
              color: '#c7c7cc',
            }}>
              {album.albumName.charAt(0)}
            </div>
          )}
        </div>

        <div style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          <span style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#1d1d1f',
            lineHeight: 1.25,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            wordBreak: 'break-word',
          }}>
            {album.albumName}
          </span>
          <span style={{
            fontSize: 20,
            fontWeight: 400,
            color: '#8e8e93',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {album.artistName}
          </span>
        </div>

        {album.averageScore > 0 && (
          <div style={{ flexShrink: 0 }}>
            <StarDisplay score={album.averageScore} />
          </div>
        )}
      </div>

      {album.interpretation && (
        <div style={{
          background: '#fef2f2',
          borderRadius: 14,
          padding: '20px 24px',
          marginBottom: 12,
          marginLeft: 84,
        }}>
          <p style={{
            fontSize: 17,
            fontWeight: 600,
            color: '#FA233B',
            margin: '0 0 8px 0',
          }}>
            我的感想
          </p>
          <p style={{
            fontSize: 20,
            fontWeight: 400,
            color: '#3a3a3c',
            margin: 0,
            lineHeight: 1.55,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            wordBreak: 'break-word',
          }}>
            {album.interpretation}
          </p>
        </div>
      )}

      {!isLast && (
        <div style={{ height: 1, background: '#f0f0f2', marginLeft: 84 }} />
      )}
    </div>
  )
}

const ShareImage = forwardRef<HTMLDivElement, ShareImageProps>(function ShareImage({ monthLabel, albums }, ref) {
  const total = albums.length

  return (
    <div
      ref={ref}
      style={{
        width: 1080,
        background: '#f2f2f6',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Helvetica Neue", sans-serif',
        color: '#1d1d1f',
        boxSizing: 'border-box',
      }}
    >
      <div style={{
        background: 'linear-gradient(160deg, #FA233B 0%, #C9182B 100%)',
        padding: '56px 64px 44px',
        color: '#ffffff',
      }}>
        <p style={{
          fontSize: 26,
          fontWeight: 600,
          opacity: 0.8,
          margin: '0 0 12px 0',
          letterSpacing: 4,
        }}>
          我的月度专辑收听记录
        </p>
        <p style={{
          fontSize: 80,
          fontWeight: 900,
          margin: '0 0 12px 0',
          letterSpacing: -2,
          lineHeight: 1,
        }}>
          {monthLabel}
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{
            fontSize: 52,
            fontWeight: 900,
            opacity: 0.9,
          }}>
            {total}
          </span>
          <span style={{
            fontSize: 26,
            fontWeight: 500,
            opacity: 0.75,
          }}>
            张专辑
          </span>
        </div>
      </div>

      <div style={{
        background: '#ffffff',
        margin: '0 40px',
        borderRadius: 32,
        padding: '8px 60px 24px',
        marginTop: -20,
        position: 'relative',
        boxShadow: '0 4px 40px rgba(0,0,0,0.06)',
      }}>
        {albums.map((album, i) => (
          <AlbumRow key={album.id} album={album} rank={i + 1} isLast={i === albums.length - 1} />
        ))}
      </div>

      <div style={{
        padding: '36px 64px 44px',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: 22,
          fontWeight: 600,
          color: '#c7c7cc',
          margin: '0 0 6px 0',
          letterSpacing: 3,
        }}>
          由 Soundraft 记录
        </p>
        <p style={{
          fontSize: 17,
          fontWeight: 400,
          color: '#d1d1d6',
          margin: 0,
        }}>
          记录我这个月听过的声音
        </p>
      </div>
    </div>
  )
})

export default ShareImage
