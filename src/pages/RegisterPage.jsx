import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'

export function RegisterPage({ onLogin, setAlert }) {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '', role: 'CUSTOMER' })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    setSubmitting(true)
    try {
      const response = await api.post('/auth/register', form)
      onLogin(response.data.user, response.data.token)
      setAlert('Account registered successfully.')
      navigate('/')
    } catch (error) {
      const details = error.response?.data?.details
      const validationMessage = details && Object.values(details).join(' ')
      setFormError(
        validationMessage ||
          error.response?.data?.message ||
          'Unable to connect to the registration service. Please try again shortly.',
      )
    } finally {
      setSubmitting(false)
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
            <span className="eyebrow">Good journeys begin</span>
            <h1>Find the right car. Make the most of the road.</h1>
            <p>Create your account to discover a curated fleet and manage every reservation in one place.</p>
          </div>
          <div className="auth-promo-note">
            <span className="auth-promo-dot" />
            Simple booking. Exceptional drives.
          </div>
        </aside>
        <form className="auth-card" onSubmit={handleSubmit}>
          <span className="eyebrow">Join the network</span>
          <h2>Create your account</h2>
          <p className="auth-intro">A few details now. A better drive next.</p>
          <label>
            Full name
            <input required type="text" autoComplete="name" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
          </label>
          <label>
            Email
            <input required type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </label>
          <label>
            Phone
            <input type="tel" autoComplete="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          </label>
          <label>
            Password
            <input required minLength={6} type="password" autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </label>
          <label>
            Account type
            <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
              <option value="CUSTOMER">Customer</option>
              <option value="SELLER">Seller</option>
            </select>
          </label>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
    </section>
  )
}
