import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import { register } from '../service/auth'

export default function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmedPassword, setConfirmedPassword] = useState("")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check empty fields
    if (!name || !email || !password || !confirmedPassword) {
      return alert("Please fill all fields...!")
    }

    // Check passwords
    if (password !== confirmedPassword) {
      return alert("Passwords do not match...!")
    }

    try {
    //   const response = await axios.post(
    //     "http://localhost:3000/api/v1/auth/register",
    //     {
    //       name,
    //       email,
    //       password
    //     }
    //   )

    await register(name, email, password)

    //   console.log(response.data)

      alert("Registration Successfully...!")

      navigate("/login")

    } catch (error: any) {
        console.error(error)

        if (error.response) {
            alert(
            error.response.data?.message ||
            "Registration Failed...!"
            )
        } else {
            alert("Server connection failed...!")
        }
    }
  }

  return (
    <div className="register-page">
      <div className="register-container">

        <h1>Register</h1>

        <form onSubmit={handleRegister}>

          <input
            type="text"
            placeholder="User Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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

          <input
            type="password"
            placeholder="Confirmed Password"
            value={confirmedPassword}
            onChange={(e) => setConfirmedPassword(e.target.value)}
          />

          <button
            type="submit"
            className="create-btn"
          >
            Create Account
          </button>

        </form>

        <p>
          Already have an account?

          <button
            className="login-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </p>

      </div>
    </div>
  )
}