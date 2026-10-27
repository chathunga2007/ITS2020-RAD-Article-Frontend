import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../App.css"
import { login } from "../service/auth"

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      return alert("Please fill all fields...!")
    }

    try {
      setLoading(true)
      const res = await login(email, password)
      const resData = res.data

      const accessToken = resData.access_token
      const refreshToken = resData.refresh_token

      if (!accessToken || !refreshToken) {
        return alert("Login fail..!")
      }

      localStorage.setItem("ACCESS_TOKEN", accessToken)
      localStorage.setItem("REFRESH_TOKEN", refreshToken)

      window.location.href = "/"
    } catch (err: any) {
      console.error(err)
      if (err.response) {
        alert(err.response.data?.message || "Login fail..!")
      } else {
        alert("Server connection failed...!")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Login</h1>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="create-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p>
          Don't have an account?
          <button
            type="button"
            className="login-btn"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </p>
      </div>
    </div>
  )
}