import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { AuthCard, type AuthMode } from './AuthCard'

interface AuthModalProps {
  open: boolean
  onClose: () => void
  initialMode?: AuthMode
}

export function AuthModal({ open, onClose, initialMode = 'signin' }: AuthModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            aria-label="Close dialog"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute -top-2 -right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-okx-border bg-okx-card text-okx-muted shadow-lg hover:text-okx-text"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <AuthCard initialMode={initialMode} onSuccess={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export type { AuthMode }
