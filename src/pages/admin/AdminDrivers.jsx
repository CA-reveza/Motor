import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient.js'
import { VEHICLE_TYPES } from '../../lib/pricing.js'

const KYC_STYLES = {
  pending: 'border-asphalt-600 text-asphalt-400',
  submitted: 'border-line text-line',
  verified: 'border-green-600 text-green-500',
}

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState([])
  const [edits, setEdits] = useState({}) // { [driverId]: { vehicle_type, vehicle_number } }
  const [saving, setSaving] = useState(null)
  const [docUrls, setDocUrls] = useState({}) // { [driverId]: { aadhar, vehicle_reg } }

  async function load() {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'driver').order('full_name')
    setDrivers(data || [])
  }

  useEffect(() => {
    load()
  }, [])

  function fieldValue(driver, field) {
    return edits[driver.id]?.[field] ?? driver[field] ?? ''
  }

  function setField(driverId, field, value) {
    setEdits((prev) => ({ ...prev, [driverId]: { ...prev[driverId], [field]: value } }))
  }

  async function saveVehicle(driver) {
    const vehicle_type = fieldValue(driver, 'vehicle_type')
    const vehicle_number = fieldValue(driver, 'vehicle_number')
    setSaving(driver.id)
    await supabase.from('profiles').update({ vehicle_type, vehicle_number }).eq('id', driver.id)
    await load()
    setSaving(null)
  }

  async function setKycStatus(driver, status) {
    await supabase.from('profiles').update({ kyc_status: status }).eq('id', driver.id)
    load()
  }

  async function viewDocs(driver) {
    const paths = { aadhar: driver.aadhar_doc_path, vehicle_reg: driver.vehicle_reg_doc_path }
    const urls = {}
    for (const [key, path] of Object.entries(paths)) {
      if (!path) continue
      const { data } = await supabase.storage.from('driver-documents').createSignedUrl(path, 600)
      if (data?.signedUrl) urls[key] = data.signedUrl
    }
    setDocUrls((prev) => ({ ...prev, [driver.id]: urls }))
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <p className="dash mb-2">Fleet</p>
      <h1 className="h1 mb-8">All Drivers</h1>

      <div className="flex flex-col gap-4">
        {drivers.map((d) => {
          const dirty =
            edits[d.id] &&
            (edits[d.id].vehicle_type !== undefined || edits[d.id].vehicle_number !== undefined)
          const urls = docUrls[d.id]
          return (
            <div key={d.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-white font-display text-lg uppercase tracking-wide">{d.full_name}</p>
                  <p className="text-asphalt-400 font-mono text-sm">{d.phone}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`status-pill ${d.is_online ? 'border-line text-line' : 'border-asphalt-600 text-asphalt-400'}`}>
                    {d.is_online ? 'online' : 'offline'}
                  </span>
                  <span className={`status-pill ${KYC_STYLES[d.kyc_status] || KYC_STYLES.pending}`}>
                    kyc: {d.kyc_status}
                  </span>
                </div>
              </div>

              <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 mt-4">
                <select
                  className="input"
                  value={fieldValue(d, 'vehicle_type')}
                  onChange={(e) => setField(d.id, 'vehicle_type', e.target.value)}
                >
                  <option value="">No vehicle assigned</option>
                  {VEHICLE_TYPES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
                <input
                  className="input"
                  placeholder="Vehicle number (e.g. KA01AB1234)"
                  value={fieldValue(d, 'vehicle_number')}
                  onChange={(e) => setField(d.id, 'vehicle_number', e.target.value)}
                />
                <button
                  className="btn-primary"
                  disabled={!dirty || saving === d.id}
                  onClick={() => saveVehicle(d)}
                >
                  {saving === d.id ? 'Saving…' : 'Save'}
                </button>
              </div>

              <div className="flex items-center gap-4 mt-4 flex-wrap">
                {(d.aadhar_doc_path || d.vehicle_reg_doc_path) && !urls && (
                  <button className="btn-ghost py-1 px-3 text-xs" onClick={() => viewDocs(d)}>
                    Load documents
                  </button>
                )}
                {urls?.aadhar && (
                  <a href={urls.aadhar} target="_blank" rel="noreferrer" className="text-line text-xs underline">
                    View Aadhar
                  </a>
                )}
                {urls?.vehicle_reg && (
                  <a href={urls.vehicle_reg} target="_blank" rel="noreferrer" className="text-line text-xs underline">
                    View RC
                  </a>
                )}
                {d.kyc_status === 'submitted' && (
                  <div className="flex gap-2 ml-auto">
                    <button className="btn-ghost py-1 px-3 text-xs border-green-600 text-green-500" onClick={() => setKycStatus(d, 'verified')}>
                      Verify
                    </button>
                    <button className="btn-ghost py-1 px-3 text-xs border-red-700 text-red-500" onClick={() => setKycStatus(d, 'pending')}>
                      Reject
                    </button>
                  </div>
                )}
                {d.kyc_status === 'verified' && (
                  <button className="btn-ghost py-1 px-3 text-xs ml-auto" onClick={() => setKycStatus(d, 'pending')}>
                    Revoke verification
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {drivers.length === 0 && <p className="text-asphalt-400 text-sm">No drivers registered yet.</p>}
      </div>
    </div>
  )
}
