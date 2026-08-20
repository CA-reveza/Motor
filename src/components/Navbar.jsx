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
    <header className="border-b border-asphalt-800 bg-asphalt-950/90 backdrop-blur sticky top-0 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
        <Link to={home} className="flex items-center gap-3">
          <img src="/logo.png" alt="MoveIT" className="h-9 w-auto" />
          <span className="hidden sm:inline text-xs italic font-medium text-asphalt-400 tracking-wide">
            We Deliver your Orders...
          </span>
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
