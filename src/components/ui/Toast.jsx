import { useEffect, useState } from 'react'
import './Toast.css'

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    function handleToast(e) {
      const { message, type = 'success' } = e.detail
      const id = Date.now()
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
    }
    window.addEventListener('toast', handleToast)
    return () => window.removeEventListener('toast', handleToast)
  }, [])

  if (!toasts.length) return null

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-pill toast-pill--${t.type}`}>
          <span className="toast-pill-icon">
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  )
}
