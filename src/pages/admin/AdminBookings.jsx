import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient.js'
import StatusBadge from '../../components/StatusBadge.jsx'

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(100)
      setBookings(data || [])
    }
    load()
    const channel = supabase
      .channel('admin-bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <p className="dash mb-2">Ledger</p>
      <h1 className="h1 mb-8">All Bookings</h1>
      <div className="overflow-x-auto card">
        <table className="w-full text-sm">
          <thead>
            <tr className="dash text-left border-b border-asphalt-700">
              <th className="p-3">ID</th>
              <th className="p-3">Route</th>
              <th className="p-3">Vehicle</th>
              <th className="p-3">Status</th>
              <th className="p-3">Fare</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-asphalt-800 text-asphalt-200">
                <td className="p-3 font-mono text-xs">{b.id.slice(0, 8)}</td>
                <td className="p-3">
                  <p className="truncate max-w-xs">{b.pickup_address} → {b.drop_address}</p>
                </td>
                <td className="p-3 font-mono text-xs">{b.vehicle_type}</td>
                <td className="p-3">
                  <StatusBadge status={b.status} />
                </td>
                <td className="p-3 font-mono text-line">₹{b.fare_final ?? b.fare_estimate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
