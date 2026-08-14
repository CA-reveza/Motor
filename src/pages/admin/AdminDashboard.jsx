import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    async function load() {
      const [{ count: totalBookings }, { count: activeBookings }, { count: drivers }, { count: onlineDrivers }, { data: revenueRows }] =
        await Promise.all([
          supabase.from('bookings').select('*', { count: 'exact', head: true }),
          supabase.from('bookings').select('*', { count: 'exact', head: true }).not('status', 'in', '(completed,cancelled)'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'driver'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'driver').eq('is_online', true),
          supabase.from('bookings').select('fare_final').eq('status', 'completed'),
        ])
      const revenue = (revenueRows || []).reduce((sum, r) => sum + (r.fare_final || 0), 0)
      setStats({ totalBookings, activeBookings, drivers, onlineDrivers, revenue })
    }
    load()
  }, [])

  const cards = stats
    ? [
        { label: 'Total Bookings', value: stats.totalBookings },
        { label: 'Active Now', value: stats.activeBookings },
        { label: 'Registered Drivers', value: stats.drivers },
        { label: 'Online Drivers', value: stats.onlineDrivers },
        { label: 'Revenue (Completed)', value: `₹${stats.revenue}` },
      ]
    : []

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <p className="dash mb-2">Control room</p>
      <h1 className="h1 mb-8">Admin</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="card p-4">
            <p className="dash mb-2">{c.label}</p>
            <p className="font-display text-3xl text-white">{c.value ?? '—'}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <Link to="/admin/bookings" className="btn-ghost">
          All Bookings
        </Link>
        <Link to="/admin/drivers" className="btn-ghost">
          All Drivers
        </Link>
      </div>
    </div>
  )
}
