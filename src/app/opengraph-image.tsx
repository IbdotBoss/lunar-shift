import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0e0e12',
          color: '#e4e4e7',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#c8a840',
          }}
        >
          Lunar&nbsp;Shift
        </div>
        <div
          style={{
            fontSize: 24,
            color: '#888898',
            marginTop: 12,
          }}
        >
          Discover your Hijri birthday
        </div>
        <div
          style={{
            fontSize: 18,
            color: '#555566',
            marginTop: 48,
          }}
        >
          V0.1.0 · UMM AL-QURA
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
