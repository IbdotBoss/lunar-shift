import { notFound } from 'next/navigation'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-6">
      <div className="flex flex-col items-center gap-6">
        <p
          className="text-[120px] font-bold tracking-tighter leading-none text-neutral-800"
          style={{ fontFamily: 'var(--font-syne)', letterSpacing: '-0.04em' }}
        >
          404
        </p>
        <p className="text-neutral-500 text-center max-w-xs leading-relaxed">
          This date doesn't exist in any calendar.
        </p>
        <a
          href="/"
          className="rounded-lg border border-neutral-800/60 bg-deep/40 px-6 py-2.5 text-sm text-neutral-400 transition-all hover:border-gold-dim/40 hover:text-gold-dim"
          style={{ fontFamily: 'var(--font-inria)' }}
        >
          Back to Lunar Shift
        </a>
      </div>
    </div>
  )
}
