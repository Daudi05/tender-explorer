const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api'

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

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    localStorage.clear()
    window.location.href = '/login'
    return
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
