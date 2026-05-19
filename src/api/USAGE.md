# API Client Usage

All API calls go through `apiFetch`. Never write raw `fetch()` calls in components.

## Import

```js
import { apiFetch } from '../api/client'
```

---

## GET request

```js
const tenders = await apiFetch('/v1/tenders')
```

---

## POST with JSON

```js
const data = await apiFetch('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
})
```

---

## POST with FormData (file upload)

```js
const form = new FormData()
form.append('file', fileInput.files[0])
form.append('document_type', 'proposal')
form.append('bid_id', bidId)

const data = await apiFetch('/documents/upload', {
  method: 'POST',
  body: form,
  // DO NOT set Content-Type header — client.js handles this automatically
})
```

---

## Binary file download (responseType: 'blob')

Use this for any endpoint that returns a file. Never use raw `fetch()` for downloads —
it bypasses the 401 handler and requires manually reading `localStorage`.

```js
const blob = await apiFetch(`/documents/${id}/download`, {
  responseType: 'blob',
})
downloadFile(blob, filename) // from src/utils/fileHelpers.js
```

---

## Error handling

```js
try {
  const data = await apiFetch('/v1/tenders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  // success
} catch (err) {
  console.error(err.message)   // human-readable message from server
  console.error(err.status)    // HTTP status code e.g. 400, 403, 422
  console.error(err.data)      // full response body if available
}
```

---

## Auth flow

- Token is stored in `localStorage` under the key `token`
- `apiFetch` reads it automatically on every request
- On `401`: client clears localStorage and redirects to `/login` automatically
- You do NOT need to handle 401 yourself in components

### After login:

```js
const data = await apiFetch('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
})
localStorage.setItem('token', data.access_token)
```

### Logout:

```js
localStorage.clear()
window.location.href = '/login'
```
