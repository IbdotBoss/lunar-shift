'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DAYS_OF_WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

interface Props {
  onSelect: (date: string) => void
  current?: string
  maxDate: string
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days: (Date | null)[] = []

  // Monday = 0, Sunday = 6
  let startOffset = firstDay.getDay() - 1
  if (startOffset < 0) startOffset = 6

  // Padding
  for (let i = 0; i < startOffset; i++) days.push(null)

  // Actual days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d))
  }

  return days
}

function formatISO(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export default function DatePicker({ onSelect, current, maxDate }: Props) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [month, setMonth] = useState(() => {
    if (current) {
      const [y, m] = current.split('-').map(Number)
      return { year: y, month: m - 1 }
    }
    return { year: today.getFullYear(), month: today.getMonth() }
  })

  const prevMonth = () => {
    if (month.month === 0) setMonth({ year: month.year - 1, month: 11 })
    else setMonth({ ...month, month: month.month - 1 })
  }

  const nextMonth = () => {
    if (month.month === 11) setMonth({ year: month.year + 1, month: 0 })
    else setMonth({ ...month, month: month.month + 1 })
  }

  // Disable next if we're past maxDate month
  const maxParts = maxDate.split('-').map(Number)
  const isNextDisabled = month.year > maxParts[0] || 
    (month.year === maxParts[0] && month.month >= maxParts[1] - 1)

  const canGoPrev = month.year > 1935 || month.month > 0
  const days = getCalendarDays(month.year, month.month)

  return (
    <div className="w-full rounded-2xl border border-neutral-800/60 bg-deep/90 backdrop-blur-xl p-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          disabled={!canGoPrev}
        >
          <ChevronLeft className="w-5 h-5 text-neutral-400" />
        </button>
        <span className="text-sm font-medium text-neutral-200" style={{ fontFamily: 'var(--font-inria)' }}>
          {MONTH_NAMES[month.month]} {month.year}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          disabled={isNextDisabled}
        >
          <ChevronRight className="w-5 h-5 text-neutral-400" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS_OF_WEEK.map(d => (
          <div key={d} className="text-center text-[10px] tracking-widest text-neutral-600 py-2" style={{ fontFamily: 'var(--font-inria)' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />
          
          const iso = formatISO(day.getFullYear(), day.getMonth(), day.getDate())
          const isSelected = current === iso
          const isToday = day.toDateString() === today.toDateString()
          const isFuture = iso > maxDate

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
              {isToday && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold" />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
