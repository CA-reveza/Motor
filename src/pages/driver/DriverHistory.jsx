import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient.js'
import { useAuth } from '../../context/AuthContext.jsx'
import BookingCard from '../../components/BookingCard.jsx'
import DriverTabs from '../../components/DriverTabs.jsx'

export default function DriverHistory() {
  const { user } = useAuth()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('driver_id', user.id)
        .in('status', ['completed', 'cancelled'])
        .order('created_at', { ascending: false })
        .limit(50)
      if (active) {
        setTrips(data || [])
        setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [user.id])

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <div className="mb-8">
        <p className="dash mb-1">Driver console</p>
        <h1 className="h1">History</h1>
      </div>

      <DriverTabs />

      {loading ? (
        <p className="dash">Loading…</p>
      ) : trips.length === 0 ? (
        <p className="text-asphalt-400 text-sm">No completed trips yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {trips.map((b) => (
            <BookingCard key={b.id} booking={b} to={`/driver/trip/${b.id}`} />
          ))}
        </div>
      )}
    </div>
  )
}
