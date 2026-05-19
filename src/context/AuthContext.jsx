import { createContext, useContext, useEffect, useState } from "react"
import { apiFetch } from "../api/client"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // -----------------------------
  // RESTORE SESSION
  // -----------------------------
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem("token")

      if (!storedToken) {
        setLoading(false)
        return
      }

      try {
        const data = await apiFetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        })

        // SAFETY CHECK: prevent crash if backend returns error object
        if (!data || data.error) {
          throw new Error("Invalid session")
        }

        const userData = data.user || data

        setUser(userData)
        setToken(storedToken)

      } catch (err) {
        console.log("Session expired or invalid token")

        localStorage.removeItem("token")
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  // -----------------------------
  // LOGIN
  // -----------------------------
  async function login(email, password) {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!data) {
      throw new Error("No response from server")
    }

    const accessToken = data.access_token || data.token
    const userData = data.user

    if (!accessToken) {
      throw new Error("Missing token from server")
    }

    localStorage.setItem("token", accessToken)

    setToken(accessToken)
    setUser(userData || null)

    return { token: accessToken, user: userData }
  }

  // -----------------------------
  // REGISTER
  // -----------------------------
  async function register(formData) {
    return apiFetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
  }

  // -----------------------------
  // LOGOUT
  // -----------------------------
  function logout() {
    localStorage.removeItem("token")
    setUser(null)
    setToken(null)
    window.location.href = "/login"
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// -----------------------------
// SAFE HOOK
// -----------------------------
export function useAuth() {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider")
  }

  return ctx
}