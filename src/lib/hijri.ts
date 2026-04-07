// ──────────────────────────────────────────────
// Lunar Shift — Hijri ↔ Gregorian (Umm al-Qura)
// Zero-dep: Intl.DateTimeFormat with islamic-umalqura
// ──────────────────────────────────────────────

export interface HijriDate {
  year: number
  month: number
  day: number
}

export const MONTH_NAMES = [
  '', 'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
  'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhul Qa'dah", 'Dhul Hijjah',
]

export const ARABIC_MONTHS = [
  '', 'محرّم', 'صفر', 'ربيع الأوّل', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوّال', 'ذا القعدة', 'ذو الحجّة',
]

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

export function toArabicNum(n: number): string {
  return String(n).replace(/\d/g, (d) => ARABIC_DIGITS[+d])
}

export function hijriDisplay(h: HijriDate): string {
  return `${h.day} ${MONTH_NAMES[h.month]} ${h.year} AH`
}

export function hijriDisplayArabic(h: HijriDate): string {
  return `${toArabicNum(h.day)} ${ARABIC_MONTHS[h.month]} ${toArabicNum(h.year)} هـ`
}

export function hijriCompact(h: HijriDate): string {
  return `${h.day} ${MONTH_NAMES[h.month].slice(0, 3)} ${h.year}`
}

/**
 * Gregorian Date → Hijri Date (Umm al-Qura)
 * Uses native Intl — works in all modern browsers, zero deps.
 */
export function gregorianToHijri(date: Date): HijriDate {
  const parts = new Intl.DateTimeFormat('en-CA-u-ca-islamic-umalqura', {
    calendar: 'islamic-umalqura',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).formatToParts(date)

  let year = 0, month = 0, day = 0
  for (const p of parts) {
    if (p.type === 'year') year = +p.value
    if (p.type === 'month') month = +p.value
    if (p.type === 'day') day = +p.value
  }
  return { year, month, day }
}

/**
 * Find the Gregorian Date for a given Hijri Date.
 * Uses bounded search from approximate Gregorian equivalent.
 * ~9k lookups/sec in browser — sufficient for UI.
 */
export function findHijriDate(hy: number, hm: number, hd: number): Date | null {
  const approxGy = Math.floor((hy - 1) * 0.970224 + 621.5774)
  const start = new Date(approxGy - 1, 5, 1)
  const end = new Date(approxGy + 2, 6, 1)
  const cur = new Date(start)

  while (cur <= end) {
    const h = gregorianToHijri(new Date(cur))
    if (h.year === hy && h.month === hm && h.day === hd) {
      return new Date(cur)
    }
    cur.setDate(cur.getDate() + 1)
    if (h.year > hy + 1) break
  }
  return null
}

/**
 * Find the next Gregorian date matching a Hijri month+day at or after a given date.
 * Used for birthday foreground.
 */
export function nextHijriBirthday(hm: number, hd: number, after: Date): { date: Date; hijriYear: number } | null {
  // Search up to 2 years forward
  const searchEnd = new Date(after.getFullYear() + 3, 0, 1)
  const cur = new Date(after.getFullYear(), after.getMonth() - 1, 1)
  if (cur < after) {
    cur.setMonth(after.getMonth())
    cur.setDate(1)
  }

  while (cur < searchEnd) {
    const h = gregorianToHijri(new Date(cur))
    if (h.month === hm && h.day === hd) {
      return { date: new Date(cur), hijriYear: h.year }
    }
    cur.setDate(cur.getDate() + 1)
  }
  return null
}

/**
 * Find a Hijri birthday in a specific Gregorian year.
 * Returns the Gregorian date if found.
 */
export function findHijriBirthdayInYear(hm: number, hd: number, gYear: number): { date: Date; hijriYear: number } | null {
  // Wide search window covering the full drift range
  for (let cm = 0; cm < 12; cm++) {
    const dim = new Date(gYear, cm + 1, 0).getDate()
    for (let cd = 1; cd <= dim; cd++) {
      const h = gregorianToHijri(new Date(gYear, cm, cd))
      if (h.month === hm && h.day === hd) {
        return { date: new Date(gYear, cm, cd), hijriYear: h.year }
      }
    }
  }
  // Might wrap into next year if the date is very early Jan
  for (let cd = 1; cd <= 31; cd++) {
    const h = gregorianToHijri(new Date(gYear, 0, cd))
    if (h.month === hm) {
      if (h.day === hd) return { date: new Date(gYear, 0, cd), hijriYear: h.year }
      break
    }
  }
  return null
}

/**
 * Calculate age given a birth date and current date.
 */
export function calcAge(birthDate: Date, today: Date): number {
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return Math.max(0, age)
}

/**
 * Days between two dates (ignoring time).
 */
export function daysUntil(target: Date, from: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const b = new Date(target.getFullYear(), target.getMonth(), target.getDate())
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

/**
 * Format a Date as a nice string: "January 15, 2025"
 */
export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Format a Date as short: "Jan 15"
 */
export function formatDateShort(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Day of week short
 */
export function dayOfWeek(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}

/**
 * Validate that a date is within reasonable Umm al-Qura range
 */
const UMALQURA_MIN = new Date(1931, 0, 1)
const UMALQURA_MAX = new Date(2077, 11, 31)

export function isValidDateForUmmAlQura(d: Date): boolean {
  return d >= UMALQURA_MIN && d <= UMALQURA_MAX
}

/**
 * Encode/decode DOB in URL
 */
export function dobToUrlParam(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function dobFromUrlParam(param: string): Date | null {
  const [y, m, d] = param.split('-').map(Number)
  if (!y || !m || !d) return null
  const date = new Date(y, m - 1, d)
  if (isNaN(date.getTime())) return null
  return date
}
