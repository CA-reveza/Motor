const STYLES = {
  pending: 'border-line text-line',
  accepted: 'border-signal text-signal',
  picked_up: 'border-asphalt-400 text-asphalt-200',
  in_transit: 'border-asphalt-400 text-asphalt-200',
  completed: 'border-green-600 text-green-500',
  cancelled: 'border-red-700 text-red-500',
}

export default function StatusBadge({ status }) {
  return <span className={`status-pill ${STYLES[status] || 'border-asphalt-600 text-asphalt-400'}`}>{status?.replace('_', ' ')}</span>
}
