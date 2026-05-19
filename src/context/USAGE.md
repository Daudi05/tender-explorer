# AuthContext Usage

## 1. Wrap App.jsx with AuthProvider

```jsx
// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './styles/globals.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
```

---

## 2. Use useAuth() inside any component

```jsx
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <nav>
      {isAuthenticated ? (
        <>
          <span>Hello, {user.name}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <a href="/login">Login</a>
      )}
    </nav>
  )
}
```

---

## 3. ProtectedRoute pattern

```jsx
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children, roles }) {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />

  return children
}
```

```jsx
// src/App.jsx
import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import TendersPage from './pages/TendersPage'
import LoginPage from './pages/LoginPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/tenders"
        element={
          <ProtectedRoute>
            <TendersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
```

---

## Available values from useAuth()

| Value | Type | Description |
|---|---|---|
| user | object \| null | Full user object from /auth/me |
| token | string \| null | JWT token |
| loading | boolean | True while validating token on mount |
| isAuthenticated | boolean | Shorthand for `user !== null` |
| login(email, pw) | async fn | POST /auth/login, saves token |
| register(data) | async fn | POST /auth/register, no auto-login |
| logout() | fn | Clears storage, redirects to /login |
