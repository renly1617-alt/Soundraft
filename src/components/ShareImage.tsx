import type { Album } from '@/types'

interface ShareImageProps {
  month: string
  monthLabel: string
  albums: Album[]
}

function StarRow({ score }: { score: number }) {
  const rounded = Math.round(score)
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <svg key={n} width="18" height="18" viewBox="0 0 24 24" fill={n <= rounded ? '#FA233B' : 'none'} stroke={n <= rounded ? '#FA233B' : '#e5e5ea'} strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
        </svg>
      ))}
    </div>
  )
}

export default function ShareImage({ month, monthLabel, albums }: ShareImageProps) {
  const total = albums.length

  return (
    <div style={{
      width: 1080,
      background: 'linear-gradient(180deg, #FA233B 0%, #C9182B 100%)',
      padding: '60px 48px 48px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Helvetica Neue", sans-serif',
      color: '#ffffff',
      minHeight: 100,
    }}>
      <div style={{ marginBottom: 40 }}>
        <p style={{
          fontSize: 24,
          fontWeight: 600,
          opacity: 0.85,
          margin: '0 0 8px 0',
          letterSpacing: 2,
        }}>
          我的月度专辑收听记录
        </p>
        <p style={{
          fontSize: 56,
          fontWeight: 800,
          margin: '0 0 8px 0',
          letterSpacing: -1,
          lineHeight: 1.1,
        }}>
          {monthLabel}
        </p>
        <p style={{
          fontSize: 28,
          fontWeight: 500,
          opacity: 0.9,
          margin: 0,
        }}>
          本月共收听 {total} 张专辑
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 24,
      }}>
        {albums.map((album) => (
          <div
            key={album.id}
            style={{
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(10px)',
              borderRadius: 20,
              padding: 24,
              display: 'flex',
              gap: 20,
            }}
          >
            <div style={{
              width: 140,
              height: 140,
              borderRadius: 14,
              overflow: 'hidden',
              flexShrink: 0,
              background: 'rgba(255,255,255,0.15)',
            }}>
              {album.coverUrl ? (
                <img
                  src={album.coverUrl}
                  alt={album.albumName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  crossOrigin="anonymous"
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 40,
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.4)',
                }}>
                  {album.albumName.charAt(0)}
                </div>
              )}
            </div>

            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minWidth: 0,
            }}>
              <p style={{
                fontSize: 22,
                fontWeight: 700,
                margin: '0 0 4px 0',
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                wordBreak: 'break-word',
              }}>
                {album.albumName}
              </p>
              <p style={{
                fontSize: 17,
                fontWeight: 500,
                opacity: 0.8,
                margin: '0 0 12px 0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {album.artistName}
              </p>

              {album.averageScore > 0 && (
                <div style={{ marginBottom: album.interpretation ? 10 : 0 }}>
                  <StarRow score={album.averageScore} />
                </div>
              )}

              {album.interpretation && (
                <p style={{
                  fontSize: 15,
                  fontWeight: 400,
                  opacity: 0.7,
                  margin: 0,
                  lineHeight: 1.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  wordBreak: 'break-word',
                }}>
                  {album.interpretation}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 48,
        paddingTop: 28,
        borderTop: '1px solid rgba(255,255,255,0.2)',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: 22,
          fontWeight: 600,
          opacity: 0.7,
          margin: 0,
          letterSpacing: 4,
        }}>
          SOUNDRAFT 记录
        </p>
      </div>
    </div>
  )
}
