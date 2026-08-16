import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  const home = role === 'driver' ? '/driver' : role === 'admin' ? '/admin' : '/'

  return (
    <header className="border-b border-asphalt-800 bg-asphalt-950/90 backdrop-blur sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link to={home} className="flex items-center gap-2">
          <span className="font-display font-extrabold text-2xl tracking-tightest2 text-white">MoveIT</span>
          <span className="w-2 h-2 rounded-full bg-signal" />
        </Link>
        <nav className="flex items-center gap-6 dash">
          {user ? (
            <>
              <span className="hidden sm:inline text-asphalt-400">{role?.toUpperCase()}</span>
              <button onClick={handleLogout} className="hover:text-line transition-colors">
                Log out
              </button>
            </>
          ) : (
            <Link to="/login" className="hover:text-line transition-colors">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
