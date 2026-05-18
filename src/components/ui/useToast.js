/*
  useToast.js
  TEMPORARY: Replaced when abubakar/ui-library merges.
  Returns { toast(message, type) }. Dispatches a CustomEvent picked up by Toast.jsx.
*/
export function useToast() {
  function toast(message, type = 'success') {
    // Dispatch a custom DOM event — ToastContainer picks it up
    window.dispatchEvent(new CustomEvent('toast', { detail: { message, type } }))
  }
  return { toast }
}
