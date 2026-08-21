import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient.js'
import { useAuth } from '../../context/AuthContext.jsx'
import DriverTabs from '../../components/DriverTabs.jsx'
import DriverDocumentUpload from '../../components/DriverDocumentUpload.jsx'
import { VEHICLE_TYPES } from '../../lib/pricing.js'

export default function DriverDetails() {
  const { user, profile, refreshProfile } = useAuth()
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    vehicle_type: profile?.vehicle_type || VEHICLE_TYPES[0].id,
    vehicle_number: profile?.vehicle_number || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const update = (field, value) => {
    setSaved(false)
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { error } = await supabase.from('profiles').update(form).eq('id', user.id)
    setSaving(false)
    if (error) {
      setError(error.message)
    } else {
      setSaved(true)
      refreshProfile()
    }
  }

  const kycLabel = { pending: 'Pending', submitted: 'Submitted — awaiting review', verified: 'Verified' }[
    profile?.kyc_status
  ] || 'Pending'

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="dash mb-1">Driver console</p>
          <h1 className="h1">Details</h1>
        </div>
        <span className={`status-pill ${profile?.kyc_status === 'verified' ? 'border-signal text-signal' : 'border-line text-line'}`}>
          KYC: {kycLabel}
        </span>
      </div>

      <DriverTabs />

      <div className="grid md:grid-cols-2 gap-6">
        <form onSubmit={save} className="card p-5 max-w-md">
          <p className="dash mb-3">Your details</p>

          <label className="field-label">Full name</label>
          <input className="input-plain" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required />

          <label className="field-label">Phone</label>
          <input className="input-plain" value={form.phone} onChange={(e) => update('phone', e.target.value)} required />

          <label className="field-label">Vehicle type</label>
          <select
            className="input-plain"
            value={form.vehicle_type}
            onChange={(e) => update('vehicle_type', e.target.value)}
          >
            {VEHICLE_TYPES.map((v) => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </select>

          <label className="field-label">Vehicle number</label>
          <input className="input-plain" value={form.vehicle_number} onChange={(e) => update('vehicle_number', e.target.value)} />

          {error && <p className="text-red-500 text-sm font-mono mb-3">{error}</p>}
          {saved && <p className="text-signal text-sm mb-3">Saved.</p>}

          <button className="btn-auth" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>

        <DriverDocumentUpload userId={user.id} profile={profile} onUploaded={refreshProfile} />
      </div>
    </div>
  )
}
