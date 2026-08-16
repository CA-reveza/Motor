import { useState, useRef } from 'react'
import { supabase } from '../lib/supabaseClient.js'

// Uploads a photo of the driver's Aadhar card and vehicle RC to the private
// 'driver-documents' Storage bucket (see supabase/motor_driver_vehicle_migration.sql
// for the bucket + RLS setup), then records the storage path on their
// profile. Once both are on file, marks kyc_status = 'submitted' — an admin
// reviews and flips it to 'verified' from /admin/drivers.
export default function DriverDocumentUpload({ userId, profile, onUploaded }) {
  const [uploading, setUploading] = useState(null) // 'aadhar' | 'vehicle_reg' | null
  const [error, setError] = useState('')
  const aadharInput = useRef(null)
  const vehicleRegInput = useRef(null)

  async function handleUpload(kind, file) {
    if (!file) return
    setError('')
    setUploading(kind)
    try {
      const ext = file.name.split('.').pop()
      const path = `${userId}/${kind}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('driver-documents')
        .upload(path, file, { upsert: true, contentType: file.type })
      if (uploadErr) throw uploadErr

      const column = kind === 'aadhar' ? 'aadhar_doc_path' : 'vehicle_reg_doc_path'
      const otherColumn = kind === 'aadhar' ? 'vehicle_reg_doc_path' : 'aadhar_doc_path'
      const hasOther = Boolean(profile?.[otherColumn])

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ [column]: path, kyc_status: hasOther ? 'submitted' : profile?.kyc_status || 'pending' })
        .eq('id', userId)
      if (updateErr) throw updateErr

      onUploaded?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(null)
    }
  }

  const hasAadhar = Boolean(profile?.aadhar_doc_path)
  const hasVehicleReg = Boolean(profile?.vehicle_reg_doc_path)

  return (
    <div className="card p-5 max-w-md">
      <p className="dash mb-3">KYC documents</p>
      {error && <p className="text-red-500 text-sm font-mono mb-3">{error}</p>}

      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-asphalt-200 mb-2">
            Aadhar card photo {hasAadhar && <span className="text-line">✓ uploaded</span>}
          </p>
          <input
            ref={aadharInput}
            type="file"
            accept="image/*,.pdf"
            className="input"
            disabled={uploading === 'aadhar'}
            onChange={(e) => handleUpload('aadhar', e.target.files?.[0])}
          />
          {uploading === 'aadhar' && <p className="text-asphalt-400 text-xs mt-1">Uploading…</p>}
        </div>

        <div>
          <p className="text-sm text-asphalt-200 mb-2">
            Vehicle registration (RC) photo {hasVehicleReg && <span className="text-line">✓ uploaded</span>}
          </p>
          <input
            ref={vehicleRegInput}
            type="file"
            accept="image/*,.pdf"
            className="input"
            disabled={uploading === 'vehicle_reg'}
            onChange={(e) => handleUpload('vehicle_reg', e.target.files?.[0])}
          />
          {uploading === 'vehicle_reg' && <p className="text-asphalt-400 text-xs mt-1">Uploading…</p>}
        </div>
      </div>

      {hasAadhar && hasVehicleReg && (
        <p className="text-line text-sm mt-4">
          Both documents submitted — waiting for admin verification.
        </p>
      )}
    </div>
  )
}
