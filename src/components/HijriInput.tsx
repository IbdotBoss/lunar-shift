'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { MONTH_NAMES, findHijriDate, formatDate, dayOfWeek } from '@/lib/hijri'

const HIJRI_MONTHS = MONTH_NAMES.slice(1) // remove empty first element

interface Props {
  onSelect: (date: string) => void
  currentYear?: number
}

export default function HijriInput({ onSelect, currentYear }: Props) {
  const now = new Date()
  const todayHijri = useMemo(() => {
    const parts = new Intl.DateTimeFormat('en-CA-u-ca-islamic-umalqura', {
      calendar: 'islamic-umalqura',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).formatToParts(now)
    let y = 0, m = 0
    for (const p of parts) {
      if (p.type === 'year') y = +p.value
      if (p.type === 'month') m = +p.value
    }
    return { year: y, month: m }
  }, [])

  const [month, setMonth] = useState(currentYear ? 1 : todayHijri.month)
  const [day, setDay] = useState(1)
  const [year, setYear] = useState(currentYear || todayHijri.year - 22)
  const [result, setResult] = useState<Date | null>(null)

  const handleConvert = () => {
    const found = findHijriDate(year, month, day)
    if (found) {
      setResult(found)
      // Format as ISO for the parent
      const iso = `${found.getFullYear()}-${String(found.getMonth() + 1).padStart(2, '0')}-${String(found.getDate()).padStart(2, '0')}`
      onSelect(iso)
    } else {
      setResult(null)
    }
  }

  const daysInMonth = useMemo(() => {
    // Hijri months alternate between 30 and 29 days (approximate)
    // Month 1,3,5,7,9,11 = 30 days; 2,4,6,8,10,12 = 29 days
    // Month 12 can be 30 in leap years
    if (month % 2 === 1) return 30
    if (month === 12 && ((year * 11 + 14) % 30) < 11) return 30 // leap year check
    return 29
  }, [month, year])

  return (
    <div className="w-full rounded-2xl border border-neutral-800/60 bg-deep/90 backdrop-blur-xl p-5">
      <div className="flex items-center gap-3 mb-5">
        {/* Year */}
        <div className="flex-1">
          <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-2" style={{ fontFamily: 'var(--font-geist)' }}>
            Year AH
          </label>
          <input
            type="number"
            min={1350}
            max={todayHijri.year + 1}
            value={year}
            onChange={(e) => setYear(+e.target.value)}
            className="w-full rounded-lg bg-[var(--color-deep)]/60 px-3 py-2.5 text-sm text-neutral-200 outline-none border border-neutral-800/40 focus:border-gold-dim/40 transition-colors"
            style={{ fontFamily: 'var(--font-geist)', colorScheme: 'dark' }}
          />
        </div>

        {/* Month */}
        <div className="flex-[1.5]">
          <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-2" style={{ fontFamily: 'var(--font-geist)' }}>
            Month
          </label>
          <select
            value={month}
            onChange={(e) => {
              setMonth(+e.target.value)
              if (day > daysInMonth) setDay(daysInMonth)
            }}
            className="w-full rounded-lg bg-[var(--color-deep)]/60 px-3 py-2.5 text-sm text-neutral-200 outline-none border border-neutral-800/40 focus:border-gold-dim/40 transition-colors appearance-none cursor-pointer"
            style={{ fontFamily: 'var(--font-geist)', colorScheme: 'dark' }}
          >
            {HIJRI_MONTHS.map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>

        {/* Day */}
        <div className="w-20">
          <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-2" style={{ fontFamily: 'var(--font-geist)' }}>
            Day
          </label>
          <input
            type="number"
            min={1}
            max={daysInMonth}
            value={day}
            onChange={(e) => setDay(Math.min(+e.target.value, daysInMonth))}
            className="w-full rounded-lg bg-[var(--color-deep)]/60 px-3 py-2.5 text-sm text-neutral-200 outline-none border border-neutral-800/40 focus:border-gold-dim/40 transition-colors"
            style={{ fontFamily: 'var(--font-geist)', colorScheme: 'dark' }}
          />
        </div>
      </div>

      {/* Convert button */}
      <motion.button
        type="button"
        onClick={handleConvert}
        whileTap={{ scale: 0.97 }}
        className="w-full rounded-xl bg-gold/10 border border-gold-dim/20 py-3 text-sm font-medium text-gold transition-colors hover:bg-gold/15"
        style={{ fontFamily: 'var(--font-inria)' }}
      >
        Convert to Gregorian
      </motion.button>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-xl bg-neutral-900/30 border border-neutral-800/30 p-4 text-center"
        >
          <p className="text-[10px] tracking-widest uppercase text-neutral-500 mb-1" style={{ fontFamily: 'var(--font-geist)' }}>
            Gregorian equivalent
          </p>
          <p className="text-2xl font-bold tracking-tight text-neutral-200" style={{ fontFamily: 'var(--font-syne)', letterSpacing: '-0.03em' }}>
            {formatDate(result)}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            {dayOfWeek(result)}
          </p>
        </motion.div>
      )}

      {result === null && day > 0 && year > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center text-xs text-neutral-600"
        >
          Enter a Hijri date and tap convert
        </motion.p>
      )}
    </div>
  )
}
