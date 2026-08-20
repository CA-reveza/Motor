import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await signIn({ email, password })
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5">
      <div className="auth-card">
        <img src="/logo.png" alt="MoveIT" className="h-12 w-auto mb-2" />
        <p className="auth-tagline">We Deliver your Orders...</p>

        <div className="auth-tabs">
          <Link to="/login" className="auth-tab active">Sign in</Link>
          <Link to="/signup" className="auth-tab">Sign up</Link>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="field-label">Email</label>
          <input
            className="input-plain"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className="field-label">Password</label>
          <input
            className="input-plain"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm font-mono mb-4">{error}</p>}
          <button className="btn-auth" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
