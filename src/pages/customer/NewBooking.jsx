import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'
import { useAuth } from '../../context/AuthContext.jsx'
import VehicleSelector from '../../components/VehicleSelector.jsx'
import { estimateFare } from '../../lib/pricing.js'

export default function NewBooking() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [pickup, setPickup] = useState('')
  const [drop, setDrop] = useState('')
  const [km, setKm] = useState('')
  const [vehicle, setVehicle] = useState('bike')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const distance = parseFloat(km) || 1
      const fare = estimateFare(vehicle, distance)
      const { data, error: insertError } = await supabase
        .from('bookings')
        .insert({
          customer_id: user.id,
          pickup_address: pickup,
          drop_address: drop,
          distance_km: distance,
          vehicle_type: vehicle,
          fare_estimate: fare,
          notes,
          status: 'pending',
        })
        .select()
        .single()
      if (insertError) throw insertError
      navigate(`/track/${data.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <p className="dash mb-2">Step one of one</p>
      <h1 className="h1 mb-8">Where To?</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <input
          className="input"
          placeholder="Pickup address"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
          required
        />
        <input
          className="input"
          placeholder="Drop address"
          value={drop}
          onChange={(e) => setDrop(e.target.value)}
          required
        />
        <input
          className="input"
          type="number"
          min="1"
          step="0.1"
          placeholder="Approx. distance (km)"
          value={km}
          onChange={(e) => setKm(e.target.value)}
          required
        />
        <div>
          <p className="dash mb-3">Vehicle</p>
          <VehicleSelector km={parseFloat(km) || 0} value={vehicle} onChange={setVehicle} />
        </div>
        <textarea
          className="input"
          placeholder="Notes for the driver (optional)"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm font-mono">{error}</p>}
        <button className="btn-primary" disabled={busy}>
          {busy ? 'Booking…' : `Confirm — ₹${estimateFare(vehicle, parseFloat(km) || 1)}`}
        </button>
      </form>
    </div>
  )
}
