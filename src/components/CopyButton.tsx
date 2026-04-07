'use client'

import { useState, useCallback, useRef, type MouseEventHandler } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from '@phosphor-icons/react'

function CopyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

interface CopyButtonProps {
  content?: string
  delay?: number
  onCopy?: () => void
  className?: string
  style?: React.CSSProperties
}

export function CopyButton({
  content,
  delay = 2500,
  onCopy,
  className,
  style,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const [pressed, setPressed] = useState(false)

  const handleCopy: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.preventDefault()
      if (copied || !content) return
      navigator.clipboard.writeText(content).then(() => {
        setCopied(true)
        onCopy?.()
        setTimeout(() => setCopied(false), delay)
      })
    },
    [copied, content, delay, onCopy]
  )

  const Icon = copied ? Check : CopyIcon

  return (
    <motion.button
      type="button"
      className={className}
      style={style}
      animate={{ scale: pressed ? 0.95 : 1 }}
      whileHover={{ scale: 1.05 }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onClick={handleCopy}
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key={copied ? 'check' : 'copy'}
          initial={{ scale: 0, opacity: 0.4, filter: 'blur(4px)' }}
          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          exit={{ scale: 0, opacity: 0.4, filter: 'blur(4px)' }}
          transition={{ duration: 0.25 }}
        >
          <Icon size={16} weight={copied ? 'bold' : 'regular'} />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}
