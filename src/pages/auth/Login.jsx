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
      <div className="w-full max-w-sm">
        <p className="dash mb-2">Welcome back</p>
        <h1 className="h1 mb-8">Log In</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm font-mono">{error}</p>}
          <button className="btn-primary" disabled={busy}>
            {busy ? 'Signing in…' : 'Log In'}
          </button>
        </form>
        <p className="text-asphalt-400 text-sm mt-6">
          No account?{' '}
          <Link to="/signup" className="text-line">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
