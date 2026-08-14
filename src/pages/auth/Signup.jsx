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
      <div className="w-full max-w-sm">
        <p className="dash mb-2">Get moving</p>
        <h1 className="h1 mb-8">Sign Up</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
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
          <input
            className="input"
            placeholder="Full name"
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            required
          />
          <input
            className="input"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            required
          />
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Password (min 6 chars)"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            minLength={6}
            required
          />
          {error && <p className="text-red-500 text-sm font-mono">{error}</p>}
          <button className="btn-primary" disabled={busy}>
            {busy ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <p className="text-asphalt-400 text-sm mt-6">
          Have an account?{' '}
          <Link to="/login" className="text-line">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
