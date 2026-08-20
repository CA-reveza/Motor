import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '', role: 'customer' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await signUp({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        phone: form.phone,
        role: form.role,
      })
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5 py-10">
      <div className="auth-card">
        <img src="/logo.png" alt="MoveIT" className="h-12 w-auto mb-2" />
        <p className="auth-tagline">We Deliver your Orders...</p>

        <div className="auth-tabs">
          <Link to="/login" className="auth-tab">Sign in</Link>
          <Link to="/signup" className="auth-tab active">Sign up</Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={() => update('role', 'customer')}
              className={`btn-ghost ${form.role === 'customer' ? 'border-signal text-signal' : ''}`}
            >
              I ship
            </button>
            <button
              type="button"
              onClick={() => update('role', 'driver')}
              className={`btn-ghost ${form.role === 'driver' ? 'border-signal text-signal' : ''}`}
            >
              I drive
            </button>
          </div>
          <label className="field-label">Full name</label>
          <input
            className="input-plain"
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            required
          />
          <label className="field-label">Phone</label>
          <input
            className="input-plain"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            required
          />
          <label className="field-label">Email</label>
          <input
            className="input-plain"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            required
          />
          <label className="field-label">Password</label>
          <input
            className="input-plain"
            type="password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            minLength={6}
            required
          />
          {error && <p className="text-red-500 text-sm font-mono mb-4">{error}</p>}
          <button className="btn-auth" disabled={busy}>
            {busy ? 'Creating account…' : 'Sign up'}
          </button>
        </form>
      </div>
    </div>
  )
}
