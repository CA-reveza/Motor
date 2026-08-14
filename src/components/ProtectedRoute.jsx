import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ allow, children }) {
  const { user, role, loading } = useAuth()

  if (loading) {
    return <div className="p-10 dash">Loading…</div>
  }
  if (!user) return <Navigate to="/login" replace />
  if (allow && !allow.includes(role)) {
    // Route to their own home, not always '/' — '/' is customer-only, so
    // sending a driver/admin there bounces them right back here forever.
    const home = role === 'driver' ? '/driver' : role === 'admin' ? '/admin' : '/'
    return <Navigate to={home} replace />
  }
  return children
}
