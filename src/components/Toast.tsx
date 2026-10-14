import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export type ToastData = { id: number; text: string; action?: { label: string; run: () => void } }

// Small confirmation message bottom-right; disappears after a few seconds.
export function Toast({ toast, onDone }: { toast: ToastData; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, toast.action ? 5000 : 2600)
    return () => clearTimeout(t)
  }, [toast, onDone])

  return createPortal(
    <div key={toast.id} className="toast" role="status">
      <span>{toast.text}</span>
      {toast.action && (
        <button
          className="toast__action"
          onClick={() => {
            toast.action!.run()
            onDone()
          }}
        >
          {toast.action.label}
        </button>
      )}
    </div>,
    document.body,
  )
}
