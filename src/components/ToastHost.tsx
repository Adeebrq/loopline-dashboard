import { useCallback, useEffect, useState } from 'react'
import { on } from '../events'
import { Toast, type ToastData } from './Toast'

// Shows the latest toast raised anywhere via `notify()`.
export function ToastHost() {
  const [toast, setToast] = useState<ToastData | null>(null)
  useEffect(() => on('toast', (t) => setToast({ ...t, id: Date.now() })), [])
  const done = useCallback(() => setToast(null), [])
  return toast ? <Toast key={toast.id} toast={toast} onDone={done} /> : null
}
