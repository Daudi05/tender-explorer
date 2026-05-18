/*
  useToast.js — minimal toast hook stub matching Abubakar's API.
  Returns { toast } where toast(message, type) queues a notification.
  The actual ToastContainer must be mounted at the app root (see Toast.jsx).

  We use a simple event-bus pattern: hook dispatches a CustomEvent,
  ToastContainer listens and renders. This avoids prop-drilling or a
  separate context just for toasts.
*/
export function useToast() {
  function toast(message, type = 'success') {
    // Dispatch a custom DOM event — ToastContainer picks it up
    window.dispatchEvent(new CustomEvent('toast', { detail: { message, type } }))
  }
  return { toast }
}
