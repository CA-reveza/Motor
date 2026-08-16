import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient.js'
import { VEHICLE_TYPES } from '../../lib/pricing.js'

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'driver').order('full_name')
    setDrivers(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <p className="dash mb-2">Fleet</p>
      <h1 className="h1 mb-8">All Drivers</h1>
      <div className="overflow-x-auto card">
        <table className="w-full text-sm">
          <thead>
            <tr className="dash text-left border-b border-asphalt-700">
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Status</th>
              <th className="p-3">Vehicle</th>
              <th className="p-3">KYC</th>
              <th className="p-3">Documents</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {!loading && drivers.length === 0 && (
              <tr><td colSpan={7} className="p-3 text-asphalt-400">No drivers signed up yet.</td></tr>
            )}
            {drivers.map((d) => (
              <DriverRow key={d.id} driver={d} onSaved={load} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Private bucket — a plain public URL won't work, so this mints a
// short-lived signed URL on click and opens it in a new tab.
async function viewDocument(path) {
  if (!path) return
  const { data, error } = await supabase.storage.from('driver-documents').createSignedUrl(path, 300)
  if (!error && data?.signedUrl) window.open(data.signedUrl, '_blank', 'noopener')
}

function DriverRow({ driver, onSaved }) {
  const [editing, setEditing] = useState(false)
  const [vehicleType, setVehicleType] = useState(driver.vehicle_type || '')
  const [vehicleNumber, setVehicleNumber] = useState(driver.vehicle_number || '')
  const [aadhar, setAadhar] = useState(driver.aadhar_number || '')
  const [vehicleReg, setVehicleReg] = useState(driver.vehicle_reg_number || '')
  const [address, setAddress] = useState(driver.address || '')
  const [busy, setBusy] = useState(false)

  async function save() {
    setBusy(true)
    await supabase
      .from('profiles')
      .update({
        vehicle_type: vehicleType || null,
        vehicle_number: vehicleNumber || null,
        aadhar_number: aadhar || null,
        vehicle_reg_number: vehicleReg || null,
        address: address || null,
      })
      .eq('id', driver.id)
    setBusy(false)
    setEditing(false)
    onSaved()
  }

  async function markVerified() {
    setBusy(true)
    await supabase.from('profiles').update({ kyc_status: 'verified' }).eq('id', driver.id)
    setBusy(false)
    onSaved()
  }

  const hasDocs = driver.aadhar_doc_path && driver.vehicle_reg_doc_path
  const kycLabel = driver.kyc_status === 'verified' ? 'verified' : hasDocs ? 'submitted' : 'pending'
  const kycClass = driver.kyc_status === 'verified'
    ? 'border-line text-line'
    : hasDocs
      ? 'border-signal text-signal'
      : 'border-asphalt-600 text-asphalt-400'

  if (editing) {
    return (
      <tr className="border-b border-asphalt-800 text-asphalt-200 align-top">
        <td className="p-3">{driver.full_name}</td>
        <td className="p-3 font-mono text-xs">{driver.phone}</td>
        <td className="p-3">
          <span className={`status-pill ${driver.is_online ? 'border-line text-line' : 'border-asphalt-600 text-asphalt-400'}`}>
            {driver.is_online ? 'online' : 'offline'}
          </span>
        </td>
        <td className="p-3" colSpan={2}>
          <div className="flex flex-col gap-2 max-w-xs">
            <select className="input" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
              <option value="">— assign vehicle type —</option>
              {VEHICLE_TYPES.map((v) => (
                <option key={v.id} value={v.id}>{v.label}</option>
              ))}
            </select>
            <input className="input" placeholder="Vehicle number (e.g. KA-01-AB-1234)" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />
            <input className="input" placeholder="Aadhar number" value={aadhar} onChange={(e) => setAadhar(e.target.value)} />
            <input className="input" placeholder="Vehicle registration number" value={vehicleReg} onChange={(e) => setVehicleReg(e.target.value)} />
            <input className="input" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
        </td>
        <td className="p-3">
          <div className="flex flex-col gap-2">
            <button className="btn-primary" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save'}</button>
            <button className="btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-asphalt-800 text-asphalt-200">
      <td className="p-3">{driver.full_name}</td>
      <td className="p-3 font-mono text-xs">{driver.phone}</td>
      <td className="p-3">
        <span className={`status-pill ${driver.is_online ? 'border-line text-line' : 'border-asphalt-600 text-asphalt-400'}`}>
          {driver.is_online ? 'online' : 'offline'}
        </span>
      </td>
      <td className="p-3">
        {driver.vehicle_type ? (
          <span>{VEHICLE_TYPES.find((v) => v.id === driver.vehicle_type)?.label || driver.vehicle_type}{driver.vehicle_number ? ` · ${driver.vehicle_number}` : ''}</span>
        ) : (
          <span className="text-asphalt-500">unassigned</span>
        )}
      </td>
      <td className="p-3">
        <div className="flex flex-col gap-1 items-start">
          <span className={`status-pill ${kycClass}`}>{kycLabel}</span>
          {driver.aadhar_doc_path && (
            <button className="text-xs text-line underline" onClick={() => viewDocument(driver.aadhar_doc_path)}>View Aadhar</button>
          )}
          {driver.vehicle_reg_doc_path && (
            <button className="text-xs text-line underline" onClick={() => viewDocument(driver.vehicle_reg_doc_path)}>View RC</button>
          )}
        </div>
      </td>
      <td className="p-3">
        <div className="flex flex-col gap-2">
          <button className="btn-ghost" onClick={() => setEditing(true)}>
            {driver.vehicle_type ? 'Edit' : 'Assign vehicle'}
          </button>
          {hasDocs && driver.kyc_status !== 'verified' && (
            <button className="btn-primary" disabled={busy} onClick={markVerified}>
              {busy ? '…' : 'Mark verified'}
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
