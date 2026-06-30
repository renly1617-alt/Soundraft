import { forwardRef } from 'react'
import type { Album } from '@/types'

interface ShareImageProps {
  monthLabel: string
  albums: Album[]
}

function StarDisplay({ score }: { score: number }) {
  const rounded = Math.round(score)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ display: 'flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <svg key={n} width="16" height="16" viewBox="0 0 24 24" fill={n <= rounded ? '#FA233B' : 'none'} stroke={n <= rounded ? '#FA233B' : '#c7c7cc'} strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
          </svg>
        ))}
      </div>
      <span style={{ fontSize: 16, fontWeight: 700, color: '#FA233B' }}>{score.toFixed(1)}</span>
    </div>
  )
}

function AlbumRow({ album, isLast }: { album: Album; isLast: boolean }) {
  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        padding: '20px 0',
      }}>
        <div style={{
          width: 112,
          height: 112,
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
          gap: 6,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <span style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#1d1d1f',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              wordBreak: 'break-word',
              flex: 1,
            }}>
              {album.albumName}
            </span>
            {album.averageScore > 0 && (
              <div style={{ flexShrink: 0 }}>
                <StarDisplay score={album.averageScore} />
              </div>
            )}
          </div>
          <span style={{
            fontSize: 18,
            fontWeight: 400,
            color: '#8e8e93',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {album.artistName}
          </span>
        </div>
      </div>

      {album.interpretation && (
        <div style={{
          background: '#fff5f5',
          borderRadius: 16,
          padding: '20px 24px',
          marginBottom: 16,
          marginLeft: 0,
        }}>
          <p style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#FA233B',
            margin: '0 0 8px 0',
          }}>
            我的感想
          </p>
          <p style={{
            fontSize: 18,
            fontWeight: 400,
            color: '#3a3a3c',
            margin: 0,
            lineHeight: 1.6,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            wordBreak: 'break-word',
          }}>
            {album.interpretation}
          </p>
        </div>
      )}

      {!isLast && (
        <div style={{ height: 1, background: '#f0f0f2' }} />
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
        background: 'linear-gradient(180deg, #fafafa 0%, #f2f2f6 40%, #ffffff 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Helvetica Neue", sans-serif',
        color: '#1d1d1f',
        boxSizing: 'border-box',
      }}
    >
      <div style={{
        background: 'linear-gradient(135deg, #FA233B 0%, #C9182B 100%)',
        padding: '64px 64px 48px',
        color: '#ffffff',
      }}>
        <p style={{
          fontSize: 22,
          fontWeight: 600,
          opacity: 0.85,
          margin: '0 0 8px 0',
          letterSpacing: 3,
        }}>
          我的月度专辑收听记录
        </p>
        <p style={{
          fontSize: 60,
          fontWeight: 800,
          margin: '0 0 10px 0',
          letterSpacing: -1,
          lineHeight: 1.1,
        }}>
          {monthLabel}
        </p>
        <p style={{
          fontSize: 24,
          fontWeight: 500,
          opacity: 0.9,
          margin: 0,
        }}>
          本月共收听 {total} 张专辑
        </p>
      </div>

      <div style={{ padding: '24px 64px 32px' }}>
        {albums.map((album, i) => (
          <AlbumRow key={album.id} album={album} isLast={i === albums.length - 1} />
        ))}
      </div>

      <div style={{
        padding: '28px 64px 32px',
        textAlign: 'center',
        borderTop: '1px solid #f0f0f2',
      }}>
        <p style={{
          fontSize: 20,
          fontWeight: 600,
          color: '#c7c7cc',
          margin: 0,
          letterSpacing: 3,
        }}>
          由 Soundraft 记录
        </p>
      </div>
    </div>
  )
})

export default ShareImage
