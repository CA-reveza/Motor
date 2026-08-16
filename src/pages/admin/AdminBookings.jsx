import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient.js'
import StatusBadge from '../../components/StatusBadge.jsx'
import { vehicleById } from '../../lib/pricing.js'

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const ASSIGNABLE_STATUSES = ['pending', 'accepted', 'picked_up', 'in_transit']

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [drivers, setDrivers] = useState([])
  const [assigning, setAssigning] = useState(null) // booking id currently mid-assign
  const [pendingDriverId, setPendingDriverId] = useState({}) // { [bookingId]: driverId }

  async function loadBookings() {
    const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(150)
    setBookings(data || [])
  }

  async function loadDrivers() {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, phone, vehicle_type, vehicle_number, kyc_status, is_online')
      .eq('role', 'driver')
      .order('full_name')
    setDrivers(data || [])
  }

  useEffect(() => {
    loadBookings()
    loadDrivers()
    const channel = supabase
      .channel('admin-bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, loadBookings)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  function driverLabel(d) {
    const vt = vehicleById(d.vehicle_type)
    return `${d.full_name}${vt ? ` — ${vt.label}` : ''}${d.vehicle_number ? ` (${d.vehicle_number})` : ''}`
  }

  async function assignDriver(booking) {
    const driverId = pendingDriverId[booking.id]
    if (!driverId) return
    setAssigning(booking.id)
    const patch = { driver_id: driverId }
    // If this booking hasn't been accepted yet, assigning a driver here is
    // what moves it out of "pending" — mirrors what the driver's own
    // Accept button does, for cases where no driver ever picks it up.
    if (booking.status === 'pending') {
      patch.status = 'accepted'
      patch.accepted_at = new Date().toISOString()
    }
    await supabase.from('bookings').update(patch).eq('id', booking.id)
    setAssigning(null)
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <p className="dash mb-2">Ledger</p>
      <h1 className="h1 mb-8">All Bookings</h1>
      <div className="overflow-x-auto card">
        <table className="w-full text-sm">
          <thead>
            <tr className="dash text-left border-b border-asphalt-700">
              <th className="p-3">Date</th>
              <th className="p-3">ID</th>
              <th className="p-3">Route</th>
              <th className="p-3">Vehicle</th>
              <th className="p-3">Driver</th>
              <th className="p-3">Status</th>
              <th className="p-3">Fare</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const assignedDriver = drivers.find((d) => d.id === b.driver_id)
              const canAssign = ASSIGNABLE_STATUSES.includes(b.status)
              const eligibleDrivers = drivers.filter(
                (d) => d.kyc_status === 'verified' && d.vehicle_type
              )
              return (
                <tr key={b.id} className="border-b border-asphalt-800 text-asphalt-200 align-top">
                  <td className="p-3 font-mono text-xs whitespace-nowrap text-asphalt-400">
                    {formatDate(b.created_at)}
                  </td>
                  <td className="p-3 font-mono text-xs">{b.id.slice(0, 8)}</td>
                  <td className="p-3">
                    <p className="truncate max-w-xs">{b.pickup_address} → {b.drop_address}</p>
                  </td>
                  <td className="p-3 font-mono text-xs">{vehicleById(b.vehicle_type)?.label || b.vehicle_type}</td>
                  <td className="p-3 min-w-[220px]">
                    {assignedDriver ? (
                      <p className="text-xs">{driverLabel(assignedDriver)}</p>
                    ) : (
                      <p className="text-xs text-asphalt-500">Unassigned</p>
                    )}
                    {canAssign && (
                      <div className="flex gap-1 mt-1">
                        <select
                          className="input py-1 px-2 text-xs"
                          value={pendingDriverId[b.id] || ''}
                          onChange={(e) =>
                            setPendingDriverId((prev) => ({ ...prev, [b.id]: e.target.value }))
                          }
                        >
                          <option value="">
                            {eligibleDrivers.length === 0 ? 'No eligible drivers' : 'Assign driver…'}
                          </option>
                          {eligibleDrivers.map((d) => (
                            <option key={d.id} value={d.id}>
                              {driverLabel(d)}
                              {d.is_online ? '' : ' (offline)'}
                            </option>
                          ))}
                        </select>
                        <button
                          className="btn-ghost py-1 px-2 text-xs"
                          disabled={!pendingDriverId[b.id] || assigning === b.id}
                          onClick={() => assignDriver(b)}
                        >
                          {assigning === b.id ? '…' : assignedDriver ? 'Reassign' : 'Assign'}
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="p-3 font-mono text-line whitespace-nowrap">₹{b.fare_final ?? b.fare_estimate}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
