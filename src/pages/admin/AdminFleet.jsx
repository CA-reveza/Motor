import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient.js'
import { VEHICLE_TYPES, vehicleById } from '../../lib/pricing.js'

export default function AdminFleet() {
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ plate_number: '', vehicle_type: VEHICLE_TYPES[0].id, capacity_kg: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const [{ data: v }, { data: d }] = await Promise.all([
      supabase.from('vehicles').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name, phone').eq('role', 'driver').order('full_name'),
    ])
    setVehicles(v || [])
    setDrivers(d || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function driverName(id) {
    return drivers.find((d) => d.id === id)?.full_name || '—'
  }

  // Drivers who don't already have a vehicle, plus whoever currently holds
  // this row (so the dropdown still shows their name when editing).
  function assignableDrivers(currentDriverId) {
    const assignedIds = new Set(vehicles.filter((v) => v.driver_id && v.driver_id !== currentDriverId).map((v) => v.driver_id))
    return drivers.filter((d) => !assignedIds.has(d.id))
  }

  async function addVehicle(e) {
    e.preventDefault()
    setError('')
    if (!form.plate_number.trim()) return setError('Plate number is required')
    setSaving(true)
    const { error: err } = await supabase.from('vehicles').insert({
      plate_number: form.plate_number.trim().toUpperCase(),
      vehicle_type: form.vehicle_type,
      capacity_kg: form.capacity_kg ? Number(form.capacity_kg) : vehicleById(form.vehicle_type)?.capacityKg || null,
    })
    setSaving(false)
    if (err) return setError(err.message)
    setForm({ plate_number: '', vehicle_type: VEHICLE_TYPES[0].id, capacity_kg: '' })
    load()
  }

  async function assignDriver(vehicleId, driverId) {
    await supabase
      .from('vehicles')
      .update({ driver_id: driverId || null })
      .eq('id', vehicleId)
    load()
  }

  async function setStatus(vehicleId, status) {
    await supabase.from('vehicles').update({ status }).eq('id', vehicleId)
    load()
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <p className="dash mb-2">Fleet</p>
      <h1 className="h1 mb-8">Vehicles &amp; Driver Assignment</h1>

      <form onSubmit={addVehicle} className="card p-4 mb-8 grid sm:grid-cols-4 gap-3 items-end">
        <div>
          <label className="dash block mb-1">Plate number</label>
          <input
            className="input"
            value={form.plate_number}
            onChange={(e) => setForm({ ...form, plate_number: e.target.value })}
            placeholder="KA 01 AB 1234"
          />
        </div>
        <div>
          <label className="dash block mb-1">Vehicle type</label>
          <select
            className="input"
            value={form.vehicle_type}
            onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
          >
            {VEHICLE_TYPES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="dash block mb-1">Capacity (kg)</label>
          <input
            className="input"
            type="number"
            value={form.capacity_kg}
            onChange={(e) => setForm({ ...form, capacity_kg: e.target.value })}
            placeholder={String(vehicleById(form.vehicle_type)?.capacityKg || '')}
          />
        </div>
        <button className="btn-primary" disabled={saving}>
          {saving ? 'Adding…' : 'Add Vehicle'}
        </button>
        {error && <p className="text-signal text-sm sm:col-span-4">{error}</p>}
      </form>

      {loading ? (
        <p className="dash">Loading…</p>
      ) : vehicles.length === 0 ? (
        <p className="text-asphalt-400 text-sm">No vehicles yet — add one above.</p>
      ) : (
        <div className="overflow-x-auto card">
          <table className="w-full text-sm">
            <thead>
              <tr className="dash text-left border-b border-asphalt-700">
                <th className="p-3">Plate</th>
                <th className="p-3">Type</th>
                <th className="p-3">Capacity</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assigned Driver</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-b border-asphalt-800 text-asphalt-200">
                  <td className="p-3 font-mono text-xs">{v.plate_number}</td>
                  <td className="p-3">{vehicleById(v.vehicle_type)?.label || v.vehicle_type}</td>
                  <td className="p-3">{v.capacity_kg ? `${v.capacity_kg} kg` : '—'}</td>
                  <td className="p-3">
                    <select
                      className="input py-1"
                      value={v.status}
                      onChange={(e) => setStatus(v.id, e.target.value)}
                    >
                      <option value="active">active</option>
                      <option value="maintenance">maintenance</option>
                      <option value="retired">retired</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <select
                      className="input py-1"
                      value={v.driver_id || ''}
                      onChange={(e) => assignDriver(v.id, e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {assignableDrivers(v.driver_id).map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.full_name}
                        </option>
                      ))}
                    </select>
                    {v.driver_id && <p className="dash mt-1">currently: {driverName(v.driver_id)}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
