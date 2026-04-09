'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MONTH_ABBREVS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS_OF_WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

interface Props {
  onSelect: (date: string) => void
  current?: string
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days: (Date | null)[] = []
  let startOffset = firstDay.getDay() - 1
  if (startOffset < 0) startOffset = 6
  for (let i = 0; i < startOffset; i++) days.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d))
  return days
}

function formatISO(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

const MIN_YEAR = 1935
const MAX_YEAR = new Date().getFullYear()

type Stage = 'year' | 'month' | 'day'

export default function DobPicker({ onSelect, current }: Props) {
  // Parse initial state from current value
  const parsed = current ? (() => {
    const [y, m, d] = current.split('-').map(Number)
    return { year: y, month: m - 1 }
  })() : null

  const [stage, setStage] = useState<Stage>(parsed ? 'day' : 'year')
  const [year, setYear] = useState(parsed?.year ?? 2000)
  const [month, setMonth] = useState(parsed?.month ?? 0)
  const [decadeStart, setDecadeStart] = useState(() => {
    const base = parsed?.year ?? 2000
    return Math.floor(base / 10) * 10
  })

  const prevDecade = () => setDecadeStart(Math.max(MIN_YEAR, decadeStart - 10))
  const nextDecade = () => {
    if (decadeStart + 10 <= MAX_YEAR) setDecadeStart(decadeStart + 10)
  }

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const isFutureMonth = year === MAX_YEAR && month >= new Date().getMonth()

  // Year grid: decades
  const years: number[] = []
  for (let i = 0; i < 12; i++) {
    const y = decadeStart + i
    if (y <= MAX_YEAR) years.push(y)
  }

  // Day grid
  const days = stage === 'day' ? getCalendarDays(year, month) : []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="w-full rounded-2xl border border-neutral-800/60 bg-deep/90 backdrop-blur-xl p-4">
      {/* === YEAR STAGE === */}
      {stage === 'year' && (
        <motion.div
          key="year"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={prevDecade}
              className="p-2 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              disabled={decadeStart <= MIN_YEAR}
            >
              <ChevronLeft className="w-5 h-5 text-neutral-400" />
            </button>
            <span className="text-sm font-medium text-neutral-200" style={{ fontFamily: 'var(--font-inria)' }}>
              Select your birth year
            </span>
            <button type="button" onClick={nextDecade}
              className="p-2 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              disabled={decadeStart + 10 > MAX_YEAR}
            >
              <ChevronRight className="w-5 h-5 text-neutral-400" />
            </button>
          </div>

          {/* Decade row — 12 cells, up to 12 years */}
          <div className="grid grid-cols-4 gap-2">
            {years.map(y => (
              <motion.button
                key={y}
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => { setYear(y); setStage('month') }}
                className={`rounded-xl py-3 text-sm font-medium transition-all ${
                  current && y === parseInt(current.split('-')[0])
                    ? 'bg-gold text-deep'
                    : 'text-neutral-300 hover:bg-white/10 active:bg-white/15'
                }`}
                style={{ fontFamily: 'var(--font-inria)' }}
              >
                {y}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* === MONTH STAGE === */}
      {stage === 'month' && (
        <motion.div
          key="month"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={() => setStage('year')}
              className="p-2 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-neutral-400" />
            </button>
            <span className="text-sm font-medium text-neutral-200" style={{ fontFamily: 'var(--font-inria)' }}>
              {year}
            </span>
            <div className="w-9" /> {/* spacer */}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {MONTH_NAMES.map((name, m) => {
              const isCurrentMonth = year === MAX_YEAR && m > new Date().getMonth()
              return (
                <motion.button
                  key={m}
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={isCurrentMonth ? undefined : () => { setMonth(m); setStage('day') }}
                  className={`rounded-xl py-3 text-sm font-medium transition-all ${
                    current && m === parseInt(current.split('-')[1]) - 1 && year === parseInt(current.split('-')[0])
                      ? 'bg-gold text-deep'
                      : isCurrentMonth
                        ? 'text-neutral-700 cursor-not-allowed'
                        : 'text-neutral-300 hover:bg-white/10 active:bg-white/15'
                  }`}
                  style={{ fontFamily: 'var(--font-inria)' }}
                >
                  {MONTH_ABBREVS[m]}
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* === DAY STAGE === */}
      {stage === 'day' && (
        <motion.div
          key="day"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={() => setStage('month')}
              className="p-2 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-neutral-400" />
            </button>
            <span className="text-sm font-medium text-neutral-200" style={{ fontFamily: 'var(--font-inria)' }}>
              {MONTH_NAMES[month]} {year}
            </span>
            <button type="button" onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              disabled={isFutureMonth}
            >
              <ChevronRight className="w-5 h-5 text-neutral-400" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS_OF_WEEK.map(d => (
              <div key={d} className="text-center text-[10px] tracking-widest text-neutral-600 py-2" style={{ fontFamily: 'var(--font-inria)' }}>
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />
              const iso = formatISO(day.getFullYear(), day.getMonth(), day.getDate())
              const isSelected = current === iso
              const isFuture = day > today
              const isToday = day.toDateString() === today.toDateString()

              return (
                <motion.button
                  key={iso}
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  onClick={isFuture ? undefined : () => onSelect(iso)}
                  className={`relative aspect-square rounded-lg text-sm font-medium transition-colors
                    ${isSelected
                      ? 'bg-gold text-deep'
                      : isFuture
                        ? 'text-neutral-700 cursor-not-allowed'
                        : isToday
                          ? 'text-gold hover:bg-white/10 ring-1 ring-gold/30'
                          : 'text-neutral-300 hover:bg-white/10 active:bg-white/15'
                    }
                  `}
                  style={{ fontFamily: 'var(--font-inria)' }}
                >
                  {day.getDate()}
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
