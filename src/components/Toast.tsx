'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function useToast() {
  const [toast, setToast] = useState<string | null>(null)

  const show = useCallback((message: string, duration = 2500) => {
    setToast(message)
    setTimeout(() => setToast(null), duration)
  }, [])

  const toastElement = (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl border border-neutral-800/60 bg-deep/95 backdrop-blur-xl px-4 py-2.5 text-sm text-neutral-200 shadow-lg"
          style={{ fontFamily: 'var(--font-inria)' }}
        >
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  )

  return { show, toastElement }
}
