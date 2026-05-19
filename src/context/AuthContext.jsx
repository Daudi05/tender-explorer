import { createContext, useContext, useEffect, useState } from "react"
import { apiFetch } from "../api/client"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem("token"))
  const [loading, setLoading] = useState(true)

  // -----------------------------
  // AUTO AUTH RESTORE ON REFRESH
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

        setUser(data.user || data)
        setToken(storedToken)
      } catch (err) {
        console.log("Session expired or invalid token")

        localStorage.removeItem("token")
        setToken(null)
        setUser(null)
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

    // support both backend formats
    const accessToken = data.access_token || data.token
    const userData = data.user

    if (!accessToken || !userData) {
      throw new Error("Invalid login response from server")
    }

    localStorage.setItem("token", accessToken)

    setToken(accessToken)
    setUser(userData)

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
    setToken(null)
    setUser(null)
    window.location.href = "/login"
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>")
  }
  return ctx
}