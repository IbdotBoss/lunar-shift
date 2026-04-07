'use client'

import { useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'

interface StarsBackgroundProps {
  count?: number
  factor?: number
  speed?: number
  starColor?: string
  glowColor?: string
  pointerEvents?: boolean
}

export function StarsBackground({
  count = 80,
  factor = 0.05,
  speed = 50,
  starColor = 'oklch(0.78 0.12 80)',
  glowColor = 'oklch(0.76 0.10 80)',
  pointerEvents = false,
}: StarsBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const stars = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * factor * 2,
      speed: (Math.random() * 0.5 + 0.5) * speed,
      phase: Math.random() * Math.PI * 2,
    }))
  }, [count, factor, speed])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const resize = () => {
      const rect = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }
    resize()

    const observer = new ResizeObserver(resize)
    observer.observe(container)

    const draw = (time: number) => {
      const w = container.getBoundingClientRect().width
      const h = container.getBoundingClientRect().height
      ctx.clearRect(0, 0, w, h)

      for (const star of stars) {
        const twinkle = Math.sin(time * 0.001 * star.speed * 0.01 + star.phase) * 0.5 + 0.5
        const alpha = star.opacity + twinkle * 0.03

        ctx.beginPath()
        ctx.arc(star.x * w, star.y * h, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `oklch(0.78 0.12 80 / ${alpha})`
        ctx.fill()

        if (star.size > 1.2 && twinkle > 0.7) {
          ctx.beginPath()
          ctx.arc(star.x * w, star.y * h, star.size * 3, 0, Math.PI * 2)
          ctx.fillStyle = `oklch(0.76 0.10 80 / ${alpha * 0.08})`
          ctx.fill()
        }
      }

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      observer.disconnect()
    }
  }, [stars])

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ pointerEvents: pointerEvents ? 'auto' : 'none' }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
    </div>
  )
}
