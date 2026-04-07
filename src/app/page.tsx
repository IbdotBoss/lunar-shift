'use client'

import dynamic from 'next/dynamic'

export default function Home() {
  // Dynamically import the client-heavy components
  const LunarShiftApp = dynamic(() => import('@/components/LunarShiftApp'), {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-pulse rounded-full bg-amber-400/20" />
          <p className="font-mono text-xs text-zinc-500">v0.1.0-RC</p>
        </div>
      </div>
    ),
  })

  return <LunarShiftApp />
}
