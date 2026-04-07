'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Clock, Copy, Sparkle, CalendarDots } from '@phosphor-icons/react'
import {
  gregorianToHijri,
  hijriDisplay,
  hijriDisplayArabic,
  hijriCompact,
  findHijriBirthdayInYear,
  calcAge,
  daysUntil,
  formatDate,
  formatDateShort,
  dayOfWeek,
  dobToUrlParam,
  dobFromUrlParam,
  MONTH_NAMES,
  toArabicNum,
} from '@/lib/hijri'

const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

function Staggered({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.4, delay: delay * 0.08, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default function LunarShiftApp() {
  const [dob, setDob] = useState<Date | null>(null)
  const [dateInputValue, setDateInputValue] = useState('')

  // Read URL on mount
  useEffect(() => {
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

  // Update URL when dob changes
  const updateUrl = useCallback((d: Date | null) => {
    const url = new URL(window.location.href)
    if (d) url.searchParams.set('dob', dobToUrlParam(d))
    else url.searchParams.delete('dob')
    window.history.replaceState({}, '', url.toString())
  }, [])

  const handleDateChange = useCallback((value: string) => {
    setDateInputValue(value)
    const parts = value.split('-').map(Number)
    if (parts.length === 3 && parts[0] > 1900 && parts[0] < 2100) {
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

  const nextBirthday = useMemo(() => {
    if (!hijriDob) return null
    // Try current year first, then next
    let b = findHijriBirthdayInYear(hijriDob.month, hijriDob.day, TODAY.getFullYear())
    if (b && b.date >= TODAY) return b
    return findHijriBirthdayInYear(hijriDob.month, hijriDob.day, TODAY.getFullYear() + 1)
  }, [hijriDob])

  const daysUntilNext = useMemo(() => {
    if (!nextBirthday) return null
    return daysUntil(nextBirthday.date, TODAY)
  }, [nextBirthday])

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

  const copyHijri = useCallback(() => {
    if (!hijriDob) return
    navigator.clipboard.writeText(hijriDisplay(hijriDob))
  }, [hijriDob])

  // Drift calculation: average days per year shift
  const drift = useMemo(() => {
    if (birthdays.length < 2) return 11
    // Simple: compare first and last birthday in our range
    const first = birthdays[0]
    const last = birthdays[birthdays.length - 1]
    const yearSpan = last.hijriYear - first.hijriYear
    const dayShift = Math.round((first.date.getTime() - last.date.getTime()) / 86400000)
    if (yearSpan <= 0) return 11
    return Math.round((dayShift / yearSpan))
  }, [birthdays])

  // ─── Entry State ───────────────────────────
  if (!dob) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center gap-8"
        >
          {/* Brand */}
          <div className="flex flex-col items-center gap-1">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="text-5xl font-semibold tracking-tight text-zinc-100 sm:text-6xl"
            >
              Lunar Shift
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-sm text-zinc-500"
            >
              your hijri birthday, discovered
            </motion.p>
          </div>

          {/* Date Input */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full max-w-xs"
          >
            <label
              htmlFor="dob-input"
              className="mb-2 block text-left text-xs font-medium tracking-wide text-zinc-500 uppercase"
            >
              Your date of birth
            </label>
            <input
              id="dob-input"
              type="date"
              value={dateInputValue}
              onChange={(e) => handleDateChange(e.target.value)}
              max={dobToUrlParam(TODAY)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition-colors focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-125"
              autoFocus
              aria-label="Gregorian date of birth"
            />
          </motion.div>

          {/* Why it matters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <div className="flex items-center gap-2 text-zinc-600">
              <Clock size={14} weight="regular" />
              <span className="text-xs">
                the hijri year is ~354 days — about 11 shorter
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-600">
              <Moon size={14} weight="regular" />
              <span className="text-xs">
                your hijri birthday drifts through the gregorian calendar
              </span>
            </div>
          </motion.div>

          {/* Version badge */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="mt-8 font-mono text-[10px] tracking-widest text-zinc-700 uppercase"
          >
            v0.1.0 · umm al-qura · beta
          </motion.p>
        </motion.div>
      </div>
    )
  }

  // ─── Dashboard ────────────────────────────
  return (
    <div className="flex min-h-[100dvh] flex-col px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        {/* Header — compact */}
        <Staggered>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
                Lunar Shift
              </h1>
              <button
                onClick={() => {
                  setDob(null)
                  setDateInputValue('')
                  updateUrl(null)
                }}
                className="mt-1 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
              >
                ← change date &nbsp;{formatDate(dob)}
              </button>
            </div>
            <button
              onClick={copyHijri}
              className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs text-zinc-400 transition-all hover:border-zinc-700 hover:text-zinc-200 active:scale-[0.97]"
              aria-label="Copy hijri date"
            >
              <Copy size={12} weight="regular" />
              <span>Copy date</span>
            </button>
          </div>
        </Staggered>

        {/* Hijri DOB — hero */}
        <Staggered delay={1}>
          <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-6 text-center">
            <p className="text-xs tracking-wide text-zinc-500 uppercase">
              your hijri date of birth
            </p>
            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="my-3 text-3xl font-semibold tracking-tight text-amber-400 sm:text-4xl"
            >
              {hijriDob && hijriDisplay(hijriDob)}
            </motion.p>
            {hijriDob && (
              <p className="font-mono text-sm text-zinc-500">
                {hijriDisplayArabic(hijriDob)}
              </p>
            )}
            <p className="mt-2 text-xs text-zinc-600">
              gregorian: {formatDate(dob)} · {dayOfWeek(dob)}
            </p>
          </div>
        </Staggered>

        {/* Age Comparison */}
        <AnimatePresence mode="wait">
          {gregorianAge > 0 && (
            <Staggered delay={2}>
              <div className="grid grid-cols-2 gap-3">
                {/* Solar Age */}
                <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/30 p-5">
                  <div className="font-mono text-3xl font-medium tracking-tight text-zinc-100">
                    {gregorianAge}
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    solar age
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium tracking-wide text-zinc-600 uppercase">
                    {gregorianAge * 365} days
                  </p>
                </div>

                {/* Lunar Age */}
                <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-5">
                  <div className="font-mono text-3xl font-medium tracking-tight text-amber-400">
                    {hijriAge}
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    lunar age
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium tracking-wide text-zinc-600 uppercase">
                    {hijriAge * 354} days
                  </p>
                </div>
              </div>
            </Staggered>
          )}
        </AnimatePresence>

        {/* Countdown to Next Hijri Birthday */}
        <AnimatePresence mode="wait">
          {nextBirthday && daysUntilNext !== null && (
            <Staggered delay={3}>
              <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/30 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs tracking-wide text-zinc-500 uppercase">
                      next {hijriDob!.day} {MONTH_NAMES[hijriDob!.month]}
                    </p>
                    <p className="mt-2 font-mono text-4xl font-medium tracking-tight text-zinc-100">
                      {daysUntilNext === 0
                        ? 'today'
                        : `${daysUntilNext}d`}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {daysUntilNext === 0
                        ? "🌙 it's your hijri birthday!"
                        : `${dayOfWeek(nextBirthday.date)}, ${formatDateShort(nextBirthday.date)}`}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10">
                    <Sparkle size={20} weight="regular" className="text-amber-400" />
                  </div>
                </div>
              </div>
            </Staggered>
          )}
        </AnimatePresence>

        {/* Drift Explanation */}
        <AnimatePresence mode="wait">
          {drift && drift > 0 && (
            <Staggered delay={4}>
              <div className="rounded-lg border border-zinc-800/40 bg-zinc-900/20 px-5 py-4">
                <div className="flex items-center gap-2">
                  <CalendarDots size={16} weight="regular" className="text-zinc-500" />
                  <p className="text-xs text-zinc-400">
                    your hijri birthday shifts back ~{drift} days each solar year
                  </p>
                </div>
              </div>
            </Staggered>
          )}
        </AnimatePresence>

        {/* Birthdays Timeline */}
        <AnimatePresence mode="wait">
          {birthdays.length > 0 && (
            <Staggered delay={5}>
              <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/30">
                <div className="border-b border-zinc-800/60 px-5 py-4">
                  <p className="text-xs tracking-wide text-zinc-500 uppercase">
                    birthday timeline
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium tracking-wide text-zinc-600 uppercase">
                    {hijriDob!.day} {MONTH_NAMES[hijriDob!.month]} across years
                  </p>
                </div>
                <div className="divide-y divide-zinc-800/40">
                  {birthdays.map((b, i) => {
                    const isToday = b.date.getTime() === TODAY.getTime()
                    const isPast = b.passed
                    const age = b.hijriYear - hijriDob!.year

                    return (
                      <div
                        key={b.hijriYear}
                        className={`flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-zinc-900/30 ${
                          isToday ? 'bg-amber-400/5' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-mono ${
                              isToday
                                ? 'bg-amber-400 text-zinc-950'
                                : isPast
                                  ? 'bg-zinc-800 text-zinc-500'
                                  : 'bg-zinc-800/60 text-zinc-400'
                            }`}
                          >
                            {b.date.getFullYear().toString().slice(2)}
                          </div>
                          <div>
                            <p className="text-sm text-zinc-200">
                              {formatDateShort(b.date)}, {b.date.getFullYear()}
                            </p>
                            <p
                              className="text-[10px] text-zinc-600"
                            >
                              {dayOfWeek(b.date)} · hijri age {age}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            isToday
                              ? 'bg-amber-400/15 text-amber-400'
                              : isPast
                                ? 'bg-zinc-800/60 text-zinc-500'
                                : 'bg-zinc-800/40 text-zinc-500'
                          }`}
                        >
                          {isToday
                            ? '🌙 today'
                            : isPast
                              ? 'passed'
                              : 'upcoming'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Staggered>
          )}
        </AnimatePresence>

        {/* Disclaimer */}
        <Staggered delay={6}>
          <p className="text-center text-[10px] leading-relaxed text-zinc-700">
            Calculated using the Umm al-Qura calendar (Saudi Arabia). Actual dates may vary
            by ±1 day depending on local moon-sighting traditions.
          </p>
        </Staggered>
      </div>
    </div>
  )
}
