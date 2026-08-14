import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'
import { useAuth } from '../../context/AuthContext.jsx'
import BookingCard from '../../components/BookingCard.jsx'

export default function CustomerHome() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    setBookings(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    const channel = supabase
      .channel('customer-bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `customer_id=eq.${user.id}` },
        load
      )
      .subscribe()
    return () => supabase.removeChannel(channel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const active = bookings.filter((b) => !['completed', 'cancelled'].includes(b.status))
  const past = bookings.filter((b) => ['completed', 'cancelled'].includes(b.status))

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="dash mb-1">Anything, anywhere</p>
          <h1 className="h1">Ship It</h1>
        </div>
        <Link to="/book" className="btn-primary">
          + New Booking
        </Link>
      </div>

      {loading ? (
        <p className="dash">Loading…</p>
      ) : (
        <>
          <section className="mb-10">
            <h2 className="dash mb-3">In Progress</h2>
            {active.length === 0 ? (
              <p className="text-asphalt-400 text-sm">Nothing moving right now.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {active.map((b) => (
                  <BookingCard key={b.id} booking={b} to={`/track/${b.id}`} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="dash mb-3">History</h2>
            {past.length === 0 ? (
              <p className="text-asphalt-400 text-sm">No trips yet.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {past.map((b) => (
                  <BookingCard key={b.id} booking={b} to={`/track/${b.id}`} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
