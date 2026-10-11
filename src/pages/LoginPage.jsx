import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'

export function LoginPage({ onLogin, setAlert }) {
  const [form, setForm] = useState({ email: 'customer@vehix.com', password: 'customer123' })
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      const response = await api.post('/auth/login', form)
      onLogin(response.data.user, response.data.token)
      setAlert('Login successful.')
      navigate('/')
    } catch (error) {
      setAlert(error.response?.data?.message || 'Unable to login right now.')
    }
  }

  return (
    <section className="auth-shell">
      <div className="auth-layout">
        <aside className="auth-promo">
          <Link className="brand auth-brand" to="/">
            <span className="brand-mark">V</span>
            VEHIX
          </Link>
          <div>
            <span className="eyebrow">The road, well travelled</span>
            <h1>Your next great drive starts here.</h1>
            <p>Thoughtfully selected vehicles, straightforward booking, and a better way to get wherever you’re going.</p>
          </div>
          <div className="auth-promo-note">
            <span className="auth-promo-dot" />
            A more considered way to move
          </div>
        </aside>
        <form className="auth-card" onSubmit={handleSubmit}>
          <span className="eyebrow">Welcome back</span>
          <h2>Sign in to VEHIX</h2>
          <p className="auth-intro">Access your bookings and pick up where your journey left off.</p>
        <label>
          Email
          <input type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </label>
        <label>
          Password
          <input type="password" autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        </label>
        <button className="btn btn-primary" type="submit">Sign in</button>
        <p className="auth-meta">
          New to VEHIX? <Link to="/register">Create an account</Link>
        </p>
        </form>
      </div>
    </section>
  )
}
