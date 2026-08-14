import { VEHICLE_TYPES, estimateFare } from '../lib/pricing.js'

export default function VehicleSelector({ km, value, onChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {VEHICLE_TYPES.map((v) => {
        const active = value === v.id
        const fare = km ? estimateFare(v.id, km) : null
        return (
          <button
            type="button"
            key={v.id}
            onClick={() => onChange(v.id)}
            className={`text-left card p-4 transition-colors ${
              active ? 'border-signal bg-asphalt-800' : 'hover:border-asphalt-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-display font-bold uppercase tracking-wide text-white">{v.label}</span>
              {fare ? <span className="font-mono text-line text-sm">₹{fare}</span> : null}
            </div>
            <p className="text-asphalt-400 text-sm mt-1">{v.desc}</p>
            <p className="dash mt-2">Up to {v.capacityKg}kg</p>
          </button>
        )
      })}
    </div>
  )
}
