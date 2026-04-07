'use client'

import dynamic from 'next/dynamic'

export default function Home() {
  const LunarShiftApp = dynamic(() => import('@/components/LunarShiftApp'), {
    ssr: false,
    loading: () => (
      <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden">
        {/* Atmospheric loading — matches the entry screen */}
        <div className="absolute left-1/2 top-1/4 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"
          style={{
            background: 'radial-gradient(circle, oklch(0.76 0.12 80 / 0.12), transparent 70%)',
            animation: 'breathe 4s cubic-bezier(0.4, 0, 0.2, 1) infinite',
          }} />
        <div className="relative flex flex-col items-center gap-5">
          <h1
            className="text-4xl font-bold tracking-tight text-zinc-100"
            style={{ fontFamily: 'var(--font-syne)', letterSpacing: '-0.03em' }}
          >
            Lunar&nbsp;Shift
          </h1>
          <p className="font-mono text-[10px] tracking-widest uppercase"
            style={{ color: 'oklch(0.4 0.005 285)' }}
          >
            computing shift
          </p>
        </div>
      </div>
    ),
  })

  return <LunarShiftApp />
}
