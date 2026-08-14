import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient.js'

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'driver').order('full_name')
      setDrivers(data || [])
    }
    load()
  }, [])

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
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d.id} className="border-b border-asphalt-800 text-asphalt-200">
                <td className="p-3">{d.full_name}</td>
                <td className="p-3 font-mono text-xs">{d.phone}</td>
                <td className="p-3">
                  <span className={`status-pill ${d.is_online ? 'border-line text-line' : 'border-asphalt-600 text-asphalt-400'}`}>
                    {d.is_online ? 'online' : 'offline'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
