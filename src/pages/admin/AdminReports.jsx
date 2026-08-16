import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'
import { VEHICLE_TYPES, vehicleById } from '../../lib/pricing.js'

function isoDateInput(d) {
  return d.toISOString().slice(0, 10)
}

const today = new Date()
const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

export default function AdminReports() {
  const [from, setFrom] = useState(isoDateInput(thirtyDaysAgo))
  const [to, setTo] = useState(isoDateInput(today))
  const [rows, setRows] = useState(null)

  async function load() {
    setRows(null)
    // completed_at is when revenue was actually realized; fall back to
    // created_at for the (rare) legacy row that predates that column being
    // populated consistently.
    const { data } = await supabase
      .from('bookings')
      .select('vehicle_type, fare_final, fare_estimate, completed_at, created_at')
      .eq('status', 'completed')
      .gte('completed_at', `${from}T00:00:00`)
      .lte('completed_at', `${to}T23:59:59`)

    const byVehicle = {}
    for (const v of VEHICLE_TYPES) byVehicle[v.id] = { trips: 0, revenue: 0 }

    for (const b of data || []) {
      const key = byVehicle[b.vehicle_type] ? b.vehicle_type : 'other'
      if (!byVehicle[key]) byVehicle[key] = { trips: 0, revenue: 0 }
      byVehicle[key].trips += 1
      byVehicle[key].revenue += b.fare_final ?? b.fare_estimate ?? 0
    }

    setRows(
      Object.entries(byVehicle)
        .map(([vehicleType, v]) => ({ vehicleType, ...v }))
        .filter((r) => r.trips > 0)
        .sort((a, b) => b.revenue - a.revenue)
    )
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to])

  const totalRevenue = (rows || []).reduce((sum, r) => sum + r.revenue, 0)
  const totalTrips = (rows || []).reduce((sum, r) => sum + r.trips, 0)

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-2">
        <p className="dash">Reports</p>
        <Link to="/admin" className="dash hover:text-line transition-colors">
          ← Back to admin
        </Link>
      </div>
      <h1 className="h1 mb-8">Revenue by Vehicle</h1>

      <div className="flex items-end gap-3 mb-8">
        <div>
          <p className="dash mb-1">From</p>
          <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <p className="dash mb-1">To</p>
          <input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      {rows === null ? (
        <p className="dash">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-asphalt-400 text-sm">No completed trips in this date range.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="dash text-left border-b border-asphalt-700">
                <th className="p-3">Vehicle</th>
                <th className="p-3">Trips</th>
                <th className="p-3">Revenue</th>
                <th className="p-3">Avg Fare</th>
                <th className="p-3">Share</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.vehicleType} className="border-b border-asphalt-800 text-asphalt-200">
                  <td className="p-3">{vehicleById(r.vehicleType)?.label || r.vehicleType}</td>
                  <td className="p-3 font-mono">{r.trips}</td>
                  <td className="p-3 font-mono text-line">₹{r.revenue.toLocaleString('en-IN')}</td>
                  <td className="p-3 font-mono">₹{Math.round(r.revenue / r.trips)}</td>
                  <td className="p-3 font-mono text-asphalt-400">
                    {totalRevenue ? Math.round((r.revenue / totalRevenue) * 100) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="text-white font-display uppercase tracking-wide">
                <td className="p-3">Total</td>
                <td className="p-3 font-mono">{totalTrips}</td>
                <td className="p-3 font-mono text-line">₹{totalRevenue.toLocaleString('en-IN')}</td>
                <td className="p-3" />
                <td className="p-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}
