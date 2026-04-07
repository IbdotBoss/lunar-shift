'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CopyButton } from './CopyButton'
import Galaxy from './Galaxy'
import {
  gregorianToHijri,
  hijriDisplay,
  hijriDisplayArabic,
  findHijriBirthdayInYear,
  calcAge,
  daysUntil,
  formatDateShort,
  dayOfWeek,
  dobToUrlParam,
  dobFromUrlParam,
  MONTH_NAMES,
  toArabicNum,
} from '@/lib/hijri'

const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

/* ──────────────────────────────────────────
   Number ticker — animates 0 → target
   ────────────────────────────────────────── */
function Counter({ to, duration = 800 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      const ease = 1 - (1 - p) * (1 - p) // ease-out quadratic
      setVal(Math.floor(ease * to))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [to, duration])

  return <>{val}</>
}

/* ──────────────────────────────────────────
   Staggered child fade-up
   ────────────────────────────────────────── */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.5, delay: delay * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* ──────────────────────────────────────────
   Main
   ────────────────────────────────────────── */
export default function LunarShiftApp() {
  const [dob, setDob] = useState<Date | null>(null)
  const [dateInputValue, setDateInputValue] = useState('')
  const [inputFocused, setInputFocused] = useState(false)

  // Read URL on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const dobParam = params.get('dob')
    if (dobParam) {
      const parsed = dobFromUrlParam(dobParam)
      if (parsed) {
        setDob(parsed)
        setDateInputValue(dobToUrlParam(parsed))
      }
    }
  }, [])

  const updateUrl = useCallback((d: Date | null) => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    if (d) url.searchParams.set('dob', dobToUrlParam(d))
    else url.searchParams.delete('dob')
    window.history.replaceState({}, '', url.toString())
  }, [])

  const handleDateChange = useCallback((value: string) => {
    setDateInputValue(value)
    const parts = value.split('-').map(Number)
    if (parts.length === 3 && parts[0] >= 1935 && parts[0] < 2077) {
      const d = new Date(parts[0], parts[1] - 1, parts[2])
      if (!isNaN(d.getTime())) {
        setDob(d)
        updateUrl(d)
      } else {
        setDob(null)
      }
    } else {
      setDob(null)
    }
  }, [updateUrl])

  const hijriDob = useMemo(() => (dob ? gregorianToHijri(dob) : null), [dob])
  const gregorianAge = useMemo(() => (dob ? calcAge(dob, TODAY) : 0), [dob])
  const hijriAge = useMemo(() => {
    if (!hijriDob) return 0
    const todayH = gregorianToHijri(TODAY)
    let age = todayH.year - hijriDob.year
    if (todayH.month < hijriDob.month || (todayH.month === hijriDob.month && todayH.day < hijriDob.day)) age--
    return Math.max(0, age)
  }, [hijriDob])

  // Next birthday: try current year first
  const nextBirthday = useMemo(() => {
    if (!hijriDob) return null
    let b = findHijriBirthdayInYear(hijriDob.month, hijriDob.day, TODAY.getFullYear())
    if (b && b.date >= TODAY) return b
    return findHijriBirthdayInYear(hijriDob.month, hijriDob.day, TODAY.getFullYear() + 1)
  }, [hijriDob])

  const daysUntilNext = useMemo(() => {
    if (!nextBirthday) return null
    return daysUntil(nextBirthday.date, TODAY)
  }, [nextBirthday])

  // Timeline: past 3 → future 7
  const birthdays = useMemo(() => {
    if (!hijriDob) return []
    const results: { date: Date; hijriYear: number; passed: boolean }[] = []
    for (let cy = TODAY.getFullYear() - 3; cy <= TODAY.getFullYear() + 7; cy++) {
      const b = findHijriBirthdayInYear(hijriDob.month, hijriDob.day, cy)
      if (b) {
        results.push({
          date: b.date,
          hijriYear: b.hijriYear,
          passed: b.date < TODAY,
        })
      }
    }
    return results
  }, [hijriDob])

  // Copy hijri date string
  const hijriCopyText = useMemo(
    () => (hijriDob ? hijriDisplay(hijriDob) : ''),
    [hijriDob]
  )

  // Calculate actual drift from the data
  const drift = useMemo(() => {
    if (birthdays.length < 2) return 11
    const past = birthdays.filter((b) => b.date < TODAY)
    if (past.length < 2) return 11
    const first = past[0]
    const last = past[past.length - 1]
    const yearSpan = last.hijriYear - first.hijriYear
    if (yearSpan <= 0) return 11
    const dayShift = Math.round((first.date.getTime() - last.date.getTime()) / 86400000)
    return Math.round(dayShift / yearSpan)
  }, [birthdays])

  // ─── ENTRY STATE ─────────────────────────
  if (!dob) {
    return (
      <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 py-12">
        {/* Galaxy background */}
        <Galaxy
          hueShift={42}
          density={0.55}
          starSpeed={0.3}
          speed={0.6}
          glowIntensity={0.25}
          saturation={0.15}
          mouseRepulsion={false}
          twinkleIntensity={0.4}
          disableAnimation={false}
          transparent
        />

        <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-10">
          {/* Brand — oversized, sculptural */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-3"
          >
            <h1 className="text-5xl font-bold tracking-tight leading-none sm:text-6xl md:text-7xl"
              style={{ fontFamily: 'var(--font-syne)', letterSpacing: '-0.03em' }}
            >
              Lunar&nbsp;Shift
            </h1>
            <p
              className="text-center text-sm leading-relaxed max-w-[280px] text-neutral-400"
              style={{ fontFamily: 'var(--font-inria)' }}
            >
              your birthday moves 11 days every year.
              <br />
              <span className="text-neutral-500">discover where it lands in the lunar calendar.</span>
            </p>
          </motion.div>

          {/* Date input */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className={`group relative w-full rounded-2xl border transition-all duration-300 ${
              inputFocused
                ? 'border-gold-dim/40 bg-deep/90 shadow-[0_0_30px_-8px_oklch(0.76_0.12_80/0.08)]'
                : 'border-neutral-800/60 bg-deep/60 backdrop-blur-xl'
            }`}
            onClick={() => document.getElementById('dob-input')?.focus()}
          >
            <div className="px-5 pt-4 pb-2 cursor-text">
              <label
                htmlFor="dob-input"
                className="block text-[10px] font-medium tracking-widest uppercase cursor-text"
                style={{ fontFamily: 'var(--font-inria)', color: inputFocused ? 'oklch(0.76 0.12 80)' : 'oklch(0.5 0.01 285)' }}
              >
                Date of birth
              </label>
            </div>
            <div className="px-4 pb-5 cursor-text">
              <input
                id="dob-input"
                type="date"
                {...(dateInputValue ? { value: dateInputValue } : {})}
                onChange={(e) => handleDateChange(e.target.value)}
                max={dobToUrlParam(TODAY)}
                min="1935-01-01"
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                className="w-full bg-[var(--color-deep)]/60 px-4 py-3 text-base text-neutral-50 outline-none transition-all duration-300 rounded-lg border border-neutral-800/40 cursor-pointer"
                style={{ fontFamily: 'var(--font-inria)', colorScheme: 'dark' }}
                autoFocus
              />
            </div>
          </motion.div>

          {/* Moon dots visual motif */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="flex items-center gap-2"
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                layout
                className="h-1 rounded-full"
                style={{
                  width: 16 + i * 4,
                  background: i < 3 ? 'oklch(0.76 0.12 80)' : 'oklch(0.35 0.01 285)',
                  transition: `all 0.4s ease ${i * 0.08}s`,
                }}
              />
            ))}
          </motion.div>

          {/* Version */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="font-mono text-[10px] tracking-widest uppercase text-neutral-700"
          >
            v0.1.0 · umm al-qura
          </motion.p>
        </div>
      </div>
    )
  }

  // ─── DASHBOARD ───────────────────────────
  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden">
      {/* Galaxy background */}
      <Galaxy
        hueShift={42}
        density={0.35}
        starSpeed={0.2}
        speed={0.4}
        glowIntensity={0.15}
        saturation={0.1}
        mouseRepulsion={false}
        twinkleIntensity={0.3}
        transparent
      />

      <div className="relative z-10 mx-auto w-full max-w-lg px-5 py-8 sm:px-6 sm:py-10 space-y-6">
        {/* Header */}
        <Reveal>
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => {
                  setDob(null)
                  setDateInputValue('')
                  updateUrl(null)
                }}
                className="text-xs text-neutral-500 transition-colors hover:text-neutral-300 font-medium"
                style={{ fontFamily: 'var(--font-inria)' }}
              >
                ← change
              </button>
              <p className="mt-0.5 text-[11px] text-neutral-600"
                style={{ fontFamily: 'var(--font-inria)' }}
              >
                {new Date(dateInputValue).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <CopyButton
              content={hijriCopyText}
              className="h-8 w-8 rounded-lg border border-neutral-800/60 bg-deep/40 text-neutral-500 hover:border-neutral-700 hover:text-neutral-300 outline-none"
            />
          </div>
        </Reveal>

        {/* Hijri DOB — hero reveal with staggered characters */}
        <AnimatePresence mode="wait">
          {hijriDob && (
            <Reveal delay={1}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center py-6 text-center"
              >
                <p
                  className="text-[10px] tracking-[0.2em] uppercase mb-3"
                  style={{ color: 'oklch(0.5 0.01 285)', fontFamily: 'var(--font-inria)' }}
                >
                  Your Hijri date of birth
                </p>

                {/* Display font — the moment */}
                <motion.h2
                  className="text-4xl font-bold tracking-tight sm:text-5xl"
                  style={{
                    fontFamily: 'var(--font-syne)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1.0,
                    color: 'oklch(0.78 0.12 80)',
                  }}
                  initial={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  {hijriDisplay(hijriDob)}
                </motion.h2>

                {/* Arabic */}
                <motion.p
                  className="mt-2 text-lg text-neutral-500"
                  lang="ar"
                  dir="auto"
                  style={{ fontFamily: 'var(--font-syne)' }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {hijriDisplayArabic(hijriDob)}
                </motion.p>
              </motion.div>
            </Reveal>
          )}
        </AnimatePresence>

        {/* Age comparison */}
        <AnimatePresence mode="wait">
          {gregorianAge > 0 && hijriAge > 0 && (
            <Reveal delay={3}>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-neutral-800/40 bg-deep/30 p-5 text-center">
                  <div
                    className="font-mono text-4xl font-medium tracking-tight"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    <Counter to={gregorianAge} />
                  </div>
                  <p
                    className="mt-1 text-[10px] tracking-widest uppercase text-neutral-500"
                  >
                    solar years
                  </p>
                </div>

                <div className="rounded-2xl border border-gold-dim/20 bg-gold-[0.03] p-5 text-center">
                  <div
                    className="font-mono text-4xl font-medium tracking-tight"
                    style={{ color: 'oklch(0.76 0.12 80)', fontVariantNumeric: 'tabular-nums' }}
                  >
                    <Counter to={hijriAge} />
                  </div>
                  <p
                    className="mt-1 text-[10px] tracking-widest uppercase text-neutral-500"
                  >
                    lunar years
                  </p>
                </div>
              </div>
            </Reveal>
          )}
        </AnimatePresence>

        {/* Drift explanation */}
        <AnimatePresence mode="wait">
          {gregorianAge > 0 && (
            <Reveal delay={4}>
              <div
                className="flex items-center justify-center gap-2 rounded-2xl border border-neutral-800/30 bg-deep/20 px-4 py-3 text-center"
              >
                <div className="h-1 w-6 rounded-full" style={{ background: 'oklch(0.76 0.12 80 / 0.4)' }} />
                <p className="text-xs text-neutral-500 leading-relaxed">
                  the hijri year is ~354 days — about <span className="text-neutral-300 font-medium">11 shorter</span>
                  than the solar year. that's why your hijri birthday drifts.
                </p>
                <div className="h-1 w-6 rounded-full" style={{ background: 'oklch(0.76 0.12 80 / 0.4)' }} />
              </div>
            </Reveal>
          )}
        </AnimatePresence>

        {/* Next birthday countdown */}
        <AnimatePresence mode="wait">
          {nextBirthday && daysUntilNext !== null && (
            <Reveal delay={5}>
              <div className="rounded-2xl border border-neutral-800/40 bg-deep/30 px-5 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-500">
                      next {hijriDob!.day} {MONTH_NAMES[hijriDob!.month]}
                    </p>
                    <div
                      className="mt-2 font-mono text-4xl font-medium tracking-tight"
                      style={{ color: 'oklch(0.76 0.12 80)', fontVariantNumeric: 'tabular-nums' }}
                    >
                      {daysUntilNext === 0 ? (
                        <motion.span
                          animate={{ opacity: [1, 0.6, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          today
                        </motion.span>
                      ) : (
                        <><Counter to={daysUntilNext} />d</>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-500"
                      style={{ fontFamily: 'var(--font-inria)' }}
                    >
                      {daysUntilNext === 0
                        ? "it's your hijri birthday"
                        : `${dayOfWeek(nextBirthday.date)}, ${formatDateShort(nextBirthday.date)}`}
                    </p>
                  </div>
                </div>

                {/* Drift indicator */}
                <div className="mt-4 flex items-center gap-1 border-t border-neutral-800/30 pt-3">
                  <span className="text-[10px] text-neutral-600"
                    style={{ fontFamily: 'var(--font-inria)' }}
                  >
                    shifts ~{drift} days earlier each year
                  </span>
                </div>
              </div>
            </Reveal>
          )}
        </AnimatePresence>

        {/* Birthday timeline */}
        <AnimatePresence mode="wait">
          {birthdays.length > 0 && (
            <Reveal delay={6}>
              <div className="rounded-2xl border border-neutral-800/40 bg-deep/30">
                <div className="border-b border-neutral-800/30 px-5 py-4">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-600">
                    Birthday drift
                  </p>
                </div>

                <div className="divide-y divide-neutral-800/20">
                  {birthdays.map((b) => {
                    const isToday = b.date.getTime() === TODAY.getTime()
                    const isPast = b.passed
                    const age = b.hijriYear - hijriDob!.year

                    return (
                      <motion.div
                        key={b.hijriYear}
                        className={`flex items-center justify-between px-5 py-3.5 transition-colors ${
                          isToday
                            ? 'bg-gold/[0.04]'
                            : 'hover:bg-neutral-900/20'
                        } ${isPast ? 'opacity-40' : ''}`}
                        whileHover={!isPast ? { x: 2 } : {}}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-mono ${
                              isToday
                                ? 'bg-gold-dim/20 text-gold-dim'
                                : isPast
                                  ? 'bg-neutral-800/40 text-neutral-600'
                                  : 'bg-neutral-800/30 text-neutral-500'
                            }`}
                          >
                            {b.date.getFullYear().toString().slice(2)}
                          </div>
                          <div>
                            <p className="text-sm text-neutral-200"
                              style={{ fontFamily: 'var(--font-inria)' }}
                            >
                              {formatDateShort(b.date)}, {b.date.getFullYear()}
                            </p>
                            <p className="text-[10px] text-neutral-600">
                              {dayOfWeek(b.date)} · lunar age {age}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                            isToday
                              ? 'bg-gold-dim/15 text-gold-dim'
                              : isPast
                                ? 'bg-neutral-800/40 text-neutral-600'
                                : 'bg-neutral-800/30 text-neutral-500'
                          }`}
                          style={{ fontFamily: 'var(--font-inria)' }}
                        >
                          {isToday ? '🌙 today' : isPast ? 'passed' : 'upcoming'}
                        </span>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </Reveal>
          )}
        </AnimatePresence>

        {/* Disclaimer */}
        <Reveal delay={7}>
          <p
            className="pb-8 text-center text-[10px] leading-relaxed"
            style={{ color: 'oklch(0.38 0.005 285)' }}
          >
            Calculated using the Umm al-Qura calendar (Saudi Arabia).
            Actual dates may vary by ±1 day depending on local moon-sighting traditions.
          </p>
        </Reveal>
      </div>
    </div>
  )
}
