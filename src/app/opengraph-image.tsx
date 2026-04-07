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
            display: 'flex',
            gap: 8,
            marginTop: 48,
          }}
        >
          {[2, 4, 8, 12, 16].map((w: number, i: number) => (
            <div
              key={i}
              style={{
                width: w,
                height: 4,
                borderRadius: 999,
                backgroundColor: i < 3 ? '#c8a840' : '#333340',
              }}
            />
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
