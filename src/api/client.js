const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api'

// Export BASE_URL so download handlers can build URLs without duplicating this string.
// This was missing before — three components were copy-pasting the fallback URL.
export { BASE_URL }

/**
 * apiFetch — the ONLY way components should talk to the backend.
 *
 * Options (in addition to standard fetch options):
 *   responseType: 'blob' — returns a raw Blob instead of parsed JSON.
 *                          Use this for binary file downloads.
 *                          The function still handles 401 and non-ok responses.
 */
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token')

  const headers = { ...options.headers }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Do NOT set Content-Type for FormData — browser sets it with boundary automatically
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  // Strip our custom option before passing to fetch — fetch doesn't know about responseType
  const { responseType, ...fetchOptions } = options

  const response = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  })

  if (response.status === 401) {
    localStorage.clear()
    window.location.href = '/login'
    return
  }

  // Blob path — caller wants raw binary data (e.g. file download)
  if (responseType === 'blob') {
    if (!response.ok) {
      const error = new Error('File download failed')
      error.status = response.status
      throw error
    }
    return response.blob()
  }

  let data = null
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    data = await response.json()
  }

  if (!response.ok) {
    const error = new Error(data?.message || data?.error || 'Request failed')
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}
