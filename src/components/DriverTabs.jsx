import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/driver', label: 'Job Feed', end: true },
  { to: '/driver/history', label: 'History' },
  { to: '/driver/payout', label: 'Payout' },
  { to: '/driver/details', label: 'Details' },
]

export default function DriverTabs() {
  return (
    <div className="auth-tabs mb-8">
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) => `auth-tab ${isActive ? 'active' : ''}`}
        >
          {t.label}
        </NavLink>
      ))}
    </div>
  )
}
