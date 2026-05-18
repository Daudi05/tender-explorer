/*
  Toast.jsx — renders toast notifications triggered by useToast().
  Mount this once in main.jsx or App.jsx so it's always on screen.
  Listens for the "toast" CustomEvent dispatched by useToast.
*/
import { useState, useEffect } from 'react'
import './Toast.css'

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handler = (e) => {
      const id = Date.now()
      setToasts((prev) => [...prev, { id, ...e.detail }])
      // Auto-dismiss after 4 seconds — long enough to read, short enough not to clutter
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
    }
    window.addEventListener('toast', handler)
    return () => window.removeEventListener('toast', handler)
  }, [])

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  )
}
