import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge.jsx'
import { vehicleById } from '../lib/pricing.js'

export default function BookingCard({ booking, to, action }) {
  const vehicle = vehicleById(booking.vehicle_type)
  const content = (
    <div className="card p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="dash">#{booking.id.slice(0, 8)}</span>
        <StatusBadge status={booking.status} />
      </div>
      <div className="text-white text-sm">
        <p className="truncate">↑ {booking.pickup_address}</p>
        <p className="truncate text-asphalt-400">↓ {booking.drop_address}</p>
      </div>
      <div className="flex items-center justify-between font-mono text-xs text-asphalt-400">
        <span>{vehicle?.label}</span>
        <span className="text-line">₹{booking.fare_final ?? booking.fare_estimate}</span>
      </div>
      {action}
    </div>
  )
  return to ? <Link to={to}>{content}</Link> : content
}
